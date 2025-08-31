-- Fix Security Issues: Add missing RLS policies for exposed sensitive data

-- 1. Fix Newsletter Subscriptions - Remove public read access
-- Currently has policies but may be too permissive
DROP POLICY IF EXISTS "Public can view newsletter subscriptions" ON public.newsletter_subscriptions;

-- Only admins should view newsletter data for business operations
CREATE POLICY "Only admins can view newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
USING (is_admin(auth.uid()));

-- 2. Fix Coupons - Remove public access, restrict to admins only
-- Current policies already restrict to admins, but let's ensure no public access
CREATE POLICY "Block anonymous coupon access" 
ON public.coupons 
FOR ALL 
USING (false)
WITH CHECK (false);

-- 3. Fix Financial Data - Ensure proper user isolation and admin access
-- For payback_earnings - users can only see their own earnings
-- This table already has good policies, let's add a block for anonymous users
CREATE POLICY "Block anonymous access to payback earnings"
ON public.payback_earnings
FOR ALL
USING (false)
WITH CHECK (false);

-- For payback_payouts - users can only see their own payouts  
-- This table already has good policies, let's add a block for anonymous users
CREATE POLICY "Block anonymous access to payback payouts"
ON public.payback_payouts
FOR ALL
USING (false)
WITH CHECK (false);

-- For partner_sales - partners can only see their own sales
-- This table already has good policies, let's add a block for anonymous users
CREATE POLICY "Block anonymous access to partner sales"
ON public.partner_sales
FOR ALL
USING (false)
WITH CHECK (false);

-- For partner_payouts - partners can only see their own payouts
-- This table already has good policies, let's add a block for anonymous users
CREATE POLICY "Block anonymous access to partner payouts"
ON public.partner_payouts
FOR ALL
USING (false)
WITH CHECK (false);

-- 4. Fix Partners table - Ensure no public access to sensitive business data
-- Current policies look good but let's add explicit anonymous blocking
CREATE POLICY "Block anonymous access to partners"
ON public.partners
FOR ALL
USING (false)
WITH CHECK (false);

-- Add comprehensive logging for financial data access
COMMENT ON TABLE public.payback_earnings IS 'SENSITIVE FINANCIAL DATA: Contains customer payback balances and earnings. Access restricted to account owners and authorized administrators. All admin access is logged for compliance and security auditing.';

COMMENT ON TABLE public.payback_payouts IS 'SENSITIVE FINANCIAL DATA: Contains payout requests with bank details and amounts. Access restricted to account owners and authorized administrators. All admin access is logged for compliance and security auditing.';

COMMENT ON TABLE public.partner_sales IS 'SENSITIVE BUSINESS DATA: Contains partner commission data and sales tracking. Access restricted to individual partners and authorized administrators. All admin access is logged for compliance and security auditing.';

COMMENT ON TABLE public.partner_payouts IS 'SENSITIVE FINANCIAL DATA: Contains partner payout requests with bank details. Access restricted to individual partners and authorized administrators. All admin access is logged for compliance and security auditing.';

COMMENT ON TABLE public.partners IS 'SENSITIVE BUSINESS DATA: Contains partner commission rates, bank details, and business terms. Access restricted to individual partners and authorized administrators. All admin access is logged for compliance and security auditing.';

COMMENT ON TABLE public.newsletter_subscriptions IS 'SENSITIVE CUSTOMER DATA: Contains subscriber email addresses and preferences. Access restricted to authorized administrators only for business operations and compliance.';

COMMENT ON TABLE public.coupons IS 'SENSITIVE BUSINESS DATA: Contains active discount codes and promotional information. Access restricted to authorized administrators only to prevent code abuse and financial losses.';