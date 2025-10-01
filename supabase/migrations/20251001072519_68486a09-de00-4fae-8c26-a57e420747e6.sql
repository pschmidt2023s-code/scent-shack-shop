-- ============================================
-- CRITICAL SECURITY FIXES - PHASE 1
-- ============================================

-- 1. ENHANCED NEWSLETTER SECURITY
-- Remove any potential for email enumeration
DROP POLICY IF EXISTS "newsletter_authenticated_insert" ON public.newsletter_subscriptions;

CREATE POLICY "newsletter_secure_insert" 
ON public.newsletter_subscriptions 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND NOT EXISTS (
    SELECT 1 
    FROM public.newsletter_subscriptions 
    WHERE newsletter_subscriptions.email = newsletter_subscriptions.email 
    AND is_active = true
  )
);

-- Ensure anonymous users cannot access newsletter data at all
CREATE POLICY "newsletter_block_anonymous" 
ON public.newsletter_subscriptions 
FOR ALL 
TO anon
USING (false);

-- 2. ENHANCED COUPON SECURITY
-- Block all anonymous access to coupons
CREATE POLICY "coupons_block_anonymous" 
ON public.coupons 
FOR ALL 
TO anon
USING (false);

-- Block authenticated non-admin users from accessing coupons directly
DROP POLICY IF EXISTS "coupons_admin_only" ON public.coupons;

CREATE POLICY "coupons_admin_strict" 
ON public.coupons 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 3. ENHANCED PROFILE SECURITY
-- Add explicit anonymous blocking
CREATE POLICY "profiles_block_anonymous" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);

-- Add trigger to validate profile access attempts
CREATE OR REPLACE FUNCTION public.validate_profile_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log unauthorized access attempts
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  IF NOT is_admin(auth.uid()) AND NEW.id != auth.uid() THEN
    -- Log security violation
    INSERT INTO public.profile_access_log (
      admin_user_id,
      accessed_profile_id,
      action,
      admin_justification
    ) VALUES (
      auth.uid(),
      NEW.id,
      TG_OP,
      'SECURITY_VIOLATION: Unauthorized profile modification attempt'
    );
    
    RAISE EXCEPTION 'Security violation: Cannot modify other users profiles';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_modification_trigger ON public.profiles;
CREATE TRIGGER validate_profile_modification_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_modification();

-- 4. ENHANCED ADDRESS SECURITY
-- Block all anonymous access to addresses
CREATE POLICY "addresses_block_anonymous" 
ON public.addresses 
FOR ALL 
TO anon
USING (false);

-- Add validation trigger for address modifications
CREATE OR REPLACE FUNCTION public.validate_address_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required for address access';
  END IF;
  
  IF NOT is_admin(auth.uid()) AND NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Security violation: Cannot access other users addresses';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_address_access_trigger ON public.addresses;
CREATE TRIGGER validate_address_access_trigger
  BEFORE INSERT OR UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_address_access();

-- 5. ENHANCED ORDER SECURITY
-- Block anonymous access to orders
CREATE POLICY "orders_block_anonymous" 
ON public.orders 
FOR ALL 
TO anon
USING (false);

-- 6. ENHANCED SECURITY MONITORING
-- Create security events log table
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  ip_address inet,
  user_agent text,
  details jsonb,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_events_admin_only" 
ON public.security_events 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_details jsonb DEFAULT NULL,
  p_severity text DEFAULT 'medium'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (
    event_type,
    user_id,
    details,
    severity
  ) VALUES (
    p_event_type,
    auth.uid(),
    p_details,
    p_severity
  );
END;
$$;

-- 7. RATE LIMITING ENHANCEMENT
-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action_type text NOT NULL,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limit_admin_only" 
ON public.rate_limit_events 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Create index for efficient rate limit checks
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_action_time 
ON public.rate_limit_events(user_id, action_type, created_at DESC);

-- 8. ENHANCED NEWSLETTER VALIDATION
-- Strengthen newsletter validation function
CREATE OR REPLACE FUNCTION public.validate_newsletter_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Sanitize email
  NEW.email = lower(trim(NEW.email));
  
  -- Strict email validation
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    PERFORM log_security_event(
      'invalid_email_attempt',
      jsonb_build_object('email', NEW.email),
      'medium'
    );
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Prevent rapid duplicate attempts (rate limiting)
  IF EXISTS (
    SELECT 1 FROM public.newsletter_subscriptions 
    WHERE email = NEW.email 
    AND subscribed_at > NOW() - INTERVAL '5 minutes'
  ) THEN
    PERFORM log_security_event(
      'rate_limit_newsletter',
      jsonb_build_object('email', NEW.email),
      'low'
    );
    RAISE EXCEPTION 'Please wait before subscribing again';
  END IF;
  
  -- Log successful subscription
  PERFORM log_security_event(
    'newsletter_subscription',
    jsonb_build_object('email', NEW.email),
    'low'
  );
  
  RETURN NEW;
END;
$$;

-- 9. SECURE USER ROLE CHECKS
-- Ensure user role function is secure
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_roles.user_id = $1 
  LIMIT 1;
$$;

-- 10. AUDIT SENSITIVE OPERATIONS
-- Create trigger to audit all coupon usage
CREATE OR REPLACE FUNCTION public.audit_coupon_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.current_uses != NEW.current_uses THEN
    PERFORM log_security_event(
      'coupon_used',
      jsonb_build_object(
        'coupon_code', NEW.code,
        'old_uses', OLD.current_uses,
        'new_uses', NEW.current_uses
      ),
      'low'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_coupon_usage_trigger ON public.coupons;
CREATE TRIGGER audit_coupon_usage_trigger
  AFTER UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_coupon_usage();

-- 11. CLEANUP OLD SECURITY LOGS (automatic maintenance)
-- Create function to clean up old security logs
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Keep only last 90 days of security events
  DELETE FROM public.security_events
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Keep only last 30 days of rate limit events
  DELETE FROM public.rate_limit_events
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE public.security_events IS 'Centralized security event logging for audit and monitoring';
COMMENT ON TABLE public.rate_limit_events IS 'Rate limiting tracking for security operations';
COMMENT ON FUNCTION public.log_security_event IS 'Centralized function to log security-related events';
COMMENT ON FUNCTION public.cleanup_old_security_logs IS 'Maintenance function to clean up old security logs';
