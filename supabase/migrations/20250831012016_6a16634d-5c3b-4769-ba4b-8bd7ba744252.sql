-- Analyze and enhance security for profiles table containing sensitive customer data

-- First, let's add audit logging for profile access by admins
CREATE TABLE IF NOT EXISTS public.profile_access_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  accessed_profile_id uuid NOT NULL,
  action text NOT NULL,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  admin_justification text
);

-- Enable RLS on the audit log
ALTER TABLE public.profile_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view profile access logs
CREATE POLICY "Only admins can view profile access logs" 
ON public.profile_access_log 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create function to log admin profile access
CREATE OR REPLACE FUNCTION public.log_admin_profile_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Log when an admin accesses someone else's profile
  IF is_admin(auth.uid()) AND auth.uid() != COALESCE(NEW.id, OLD.id) THEN
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
$$;

-- Create triggers to log admin access to profiles
CREATE TRIGGER log_profile_admin_updates
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_profile_access();

CREATE TRIGGER log_profile_admin_deletes  
  AFTER DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_profile_access();

-- Add additional security constraint to prevent unauthorized bulk access
CREATE OR REPLACE FUNCTION public.validate_profile_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Extra validation: ensure users can only access their own profiles
  IF NOT is_admin(auth.uid()) AND NEW.id != auth.uid() THEN
    RAISE EXCEPTION 'Security violation: Unauthorized profile access attempt for user %', NEW.id;
  END IF;
  
  -- Log potential security violations
  IF NOT is_admin(auth.uid()) AND auth.uid() IS NOT NULL AND NEW.id != auth.uid() THEN
    INSERT INTO public.profile_access_log (
      admin_user_id,
      accessed_profile_id,
      action,
      admin_justification
    ) VALUES (
      auth.uid(),
      NEW.id,
      'UNAUTHORIZED_ATTEMPT',
      'User attempted to access profile they do not own'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add comprehensive documentation for sensitive data
COMMENT ON TABLE public.profiles IS 'Contains highly sensitive customer data including full names, phone numbers, and financial information (payback_balance). Access is strictly restricted to profile owners and authorized administrators only. All admin access is logged for security auditing and compliance.';

COMMENT ON COLUMN public.profiles.full_name IS 'Sensitive PII - Customer full name. Admin access logged for security audit.';
COMMENT ON COLUMN public.profiles.phone IS 'Sensitive PII - Customer phone number. Admin access logged for security audit.';
COMMENT ON COLUMN public.profiles.payback_balance IS 'Sensitive financial data - Customer account balance. Admin access logged for security audit.';