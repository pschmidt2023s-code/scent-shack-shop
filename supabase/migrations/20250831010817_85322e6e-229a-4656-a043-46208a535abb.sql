-- Fix function search path security warnings

-- Update the newsletter validation function with proper search path
CREATE OR REPLACE FUNCTION public.validate_newsletter_subscription()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update the audit function with proper search path  
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;