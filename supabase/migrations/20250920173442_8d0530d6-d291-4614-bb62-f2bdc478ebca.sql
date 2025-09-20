-- SECURITY FIX: Critical RLS Policy Updates
-- Phase 1: Remove conflicting and redundant policies, implement secure access control

-- ===========================================
-- 1. SECURE PROFILES TABLE
-- ===========================================

-- Drop conflicting policies
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Restrict anonymous profile access" ON public.profiles;

-- Create comprehensive, secure profile policies
CREATE POLICY "profiles_secure_select" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = id OR is_admin(auth.uid())
  )
);

CREATE POLICY "profiles_secure_insert" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND auth.uid() = id
);

CREATE POLICY "profiles_secure_update" ON public.profiles
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = id OR is_admin(auth.uid())
  )
) WITH CHECK (
  auth.uid() IS NOT NULL AND (
    auth.uid() = id OR is_admin(auth.uid())
  )
);

CREATE POLICY "profiles_secure_delete" ON public.profiles
FOR DELETE USING (
  auth.uid() IS NOT NULL AND is_admin(auth.uid())
);

-- ===========================================
-- 2. SECURE NEWSLETTER SUBSCRIPTIONS
-- ===========================================

-- Drop conflicting policies
DROP POLICY IF EXISTS "Block anonymous newsletter access" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Restrict anonymous newsletter access" ON public.newsletter_subscriptions;

-- Keep admin management and secure signup, but block all other access
CREATE POLICY "newsletter_admin_only_select" ON public.newsletter_subscriptions
FOR SELECT USING (
  auth.uid() IS NOT NULL AND is_admin(auth.uid())
);

-- Allow authenticated users to subscribe (but not view existing subscriptions)
CREATE POLICY "newsletter_authenticated_insert" ON public.newsletter_subscriptions
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  NOT EXISTS (
    SELECT 1 FROM newsletter_subscriptions ns 
    WHERE ns.email = newsletter_subscriptions.email AND ns.is_active = true
  )
);

-- ===========================================
-- 3. SECURE ORDERS TABLE
-- ===========================================

-- Drop conflicting policies
DROP POLICY IF EXISTS "Block all anonymous order access" ON public.orders;
DROP POLICY IF EXISTS "Block anonymous access to orders" ON public.orders;
DROP POLICY IF EXISTS "Restrict anonymous order access" ON public.orders;

-- Create comprehensive order security policies
CREATE POLICY "orders_user_select" ON public.orders
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  user_id IS NOT NULL AND 
  auth.uid() = user_id
);

CREATE POLICY "orders_admin_select" ON public.orders
FOR SELECT USING (
  auth.uid() IS NOT NULL AND is_admin(auth.uid())
);

CREATE POLICY "orders_user_insert" ON public.orders
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id IS NOT NULL AND 
  auth.uid() = user_id
);

CREATE POLICY "orders_admin_update" ON public.orders
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND is_admin(auth.uid())
);

CREATE POLICY "orders_admin_delete" ON public.orders
FOR DELETE USING (
  auth.uid() IS NOT NULL AND is_admin(auth.uid())
);

-- ===========================================
-- 4. SECURE COUPONS TABLE
-- ===========================================

-- Drop conflicting policies
DROP POLICY IF EXISTS "Block anonymous coupon access" ON public.coupons;
DROP POLICY IF EXISTS "Restrict anonymous coupon access" ON public.coupons;

-- Lock down coupons to admin-only access
CREATE POLICY "coupons_admin_only" ON public.coupons
FOR ALL USING (
  auth.uid() IS NOT NULL AND is_admin(auth.uid())
) WITH CHECK (
  auth.uid() IS NOT NULL AND is_admin(auth.uid())
);

-- ===========================================
-- 5. SECURE ORDER ITEMS TABLE
-- ===========================================

-- Drop conflicting policy
DROP POLICY IF EXISTS "Block anonymous access to order items" ON public.order_items;

-- Create secure order items policies
CREATE POLICY "order_items_user_select" ON public.order_items
FOR SELECT USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id IS NOT NULL 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "order_items_admin_select" ON public.order_items
FOR SELECT USING (
  auth.uid() IS NOT NULL AND is_admin(auth.uid())
);

-- ===========================================
-- 6. SECURE REVIEW VOTES TABLE
-- ===========================================

-- Drop conflicting policy
DROP POLICY IF EXISTS "Block anonymous access to votes" ON public.review_votes;

-- ===========================================
-- 7. SECURE REVIEWS TABLE
-- ===========================================

-- Drop conflicting policies
DROP POLICY IF EXISTS "Block anonymous review access" ON public.reviews;

-- ===========================================
-- 8. CLEAN UP OTHER SENSITIVE TABLES
-- ===========================================

-- Ensure payback earnings are secure
DROP POLICY IF EXISTS "Block anonymous access to payback earnings" ON public.payback_earnings;
DROP POLICY IF EXISTS "Restrict anonymous payback earnings access" ON public.payback_earnings;

-- Ensure payback payouts are secure  
DROP POLICY IF EXISTS "Block anonymous access to payback payouts" ON public.payback_payouts;
DROP POLICY IF EXISTS "Restrict anonymous payback payouts access" ON public.payback_payouts;

-- Ensure partner tables are secure
DROP POLICY IF EXISTS "Block anonymous access to partners" ON public.partners;
DROP POLICY IF EXISTS "Restrict anonymous partner access" ON public.partners;

DROP POLICY IF EXISTS "Block anonymous access to partner sales" ON public.partner_sales;
DROP POLICY IF EXISTS "Restrict anonymous partner sales access" ON public.partner_sales;

DROP POLICY IF EXISTS "Block anonymous access to partner payouts" ON public.partner_payouts;
DROP POLICY IF EXISTS "Restrict anonymous partner payouts access" ON public.partner_payouts;

-- ===========================================
-- 9. ADD AUDIT LOGGING TRIGGER FOR SENSITIVE DATA ACCESS
-- ===========================================

-- Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log admin access to user profiles
  IF TG_TABLE_NAME = 'profiles' AND is_admin(auth.uid()) AND auth.uid() != COALESCE(NEW.id, OLD.id) THEN
    INSERT INTO public.profile_access_log (
      admin_user_id,
      accessed_profile_id,
      action
    ) VALUES (
      auth.uid(),
      COALESCE(NEW.id, OLD.id),
      TG_OP
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for profile access logging
DROP TRIGGER IF EXISTS log_profile_access ON public.profiles;
CREATE TRIGGER log_profile_access
  AFTER SELECT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();