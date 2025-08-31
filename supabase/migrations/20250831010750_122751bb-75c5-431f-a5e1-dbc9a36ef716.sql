-- Fix security vulnerabilities in profiles and newsletter_subscriptions tables

-- 1. First, remove the potentially problematic newsletter subscription policy
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;

-- 2. Create a more secure newsletter subscription policy that prevents enumeration attacks
-- Only allow INSERT if the email doesn't already exist and is properly formatted
CREATE POLICY "Authenticated or rate-limited newsletter signup"
ON public.newsletter_subscriptions
FOR INSERT
WITH CHECK (
  -- Validate email format
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- Prevent duplicate emails
  AND NOT EXISTS (
    SELECT 1 FROM public.newsletter_subscriptions ns 
    WHERE ns.email = newsletter_subscriptions.email AND ns.is_active = true
  )
  -- Additional security: require either authentication OR ensure we're not being enumerated
  AND (
    auth.uid() IS NOT NULL 
    OR 
    -- For anonymous users, only allow if email is new (prevents enumeration)
    NOT EXISTS (SELECT 1 FROM public.newsletter_subscriptions WHERE email = newsletter_subscriptions.email)
  )
);

-- 3. Strengthen profiles table security by removing the generic "deny all" policy 
-- and replacing it with more specific policies
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- 4. Create explicit denial policies for anonymous access to profiles
CREATE POLICY "Block anonymous SELECT on profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

CREATE POLICY "Block anonymous INSERT on profiles" 
ON public.profiles
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Block anonymous UPDATE on profiles"
ON public.profiles
FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Block anonymous DELETE on profiles"
ON public.profiles
FOR DELETE  
TO anon
USING (false);

-- 5. Ensure authenticated users can only access their own profiles
-- Update existing policies to be more explicit about authentication requirements
DROP POLICY IF EXISTS "Users can view only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert only their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view only their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Authenticated users can update only their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Authenticated users can insert only their own profile"
ON public.profiles
FOR INSERT
TO authenticated  
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 6. Add additional security function to validate newsletter subscription attempts
CREATE OR REPLACE FUNCTION public.validate_newsletter_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize email
  NEW.email = lower(trim(NEW.email));
  
  -- Additional validation
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Prevent rapid duplicate attempts
  IF EXISTS (
    SELECT 1 FROM public.newsletter_subscriptions 
    WHERE email = NEW.email 
    AND subscribed_at > NOW() - INTERVAL '1 minute'
  ) THEN
    RAISE EXCEPTION 'Please wait before subscribing again';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for newsletter validation
DROP TRIGGER IF EXISTS validate_newsletter_subscription_trigger ON public.newsletter_subscriptions;
CREATE TRIGGER validate_newsletter_subscription_trigger
  BEFORE INSERT ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_newsletter_subscription();

-- 8. Add audit logging for sensitive profile operations  
CREATE TABLE IF NOT EXISTS public.profile_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB, 
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.profile_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view profile audit logs"
ON public.profile_audit_log
FOR SELECT
USING (is_admin(auth.uid()));

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.profile_audit_log (user_id, action, old_data, new_data)
    VALUES (
      COALESCE(NEW.id, OLD.id),
      'UPDATE',
      row_to_json(OLD)::jsonb,
      row_to_json(NEW)::jsonb
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.profile_audit_log (user_id, action, old_data)
    VALUES (
      OLD.id,
      'DELETE', 
      row_to_json(OLD)::jsonb
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit trigger to profiles table
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();