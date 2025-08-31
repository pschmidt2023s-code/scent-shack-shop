-- Fix function security by setting proper search_path
CREATE OR REPLACE FUNCTION public.log_admin_address_modification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Log when an admin modifies someone else's address
  IF is_admin(auth.uid()) AND auth.uid() != NEW.user_id THEN
    INSERT INTO public.address_access_log (
      admin_user_id,
      accessed_address_id,
      address_owner_user_id,
      action
    ) VALUES (
      auth.uid(),
      NEW.id,
      NEW.user_id,
      TG_OP
    );
  END IF;
  
  RETURN NEW;
END;
$$;