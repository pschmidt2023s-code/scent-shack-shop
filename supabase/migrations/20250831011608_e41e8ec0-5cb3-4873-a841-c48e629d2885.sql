-- Fix function search path security issue by setting secure search_path
CREATE OR REPLACE FUNCTION public.log_admin_address_modifications()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if the accessing user is an admin and not the address owner
  IF is_admin(auth.uid()) AND auth.uid() != COALESCE(OLD.user_id, NEW.user_id) THEN
    INSERT INTO public.address_access_log (
      admin_user_id,
      accessed_address_id,
      customer_user_id,
      action,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      COALESCE(NEW.id, OLD.id),
      COALESCE(OLD.user_id, NEW.user_id),
      TG_OP,
      CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD)::jsonb ELSE NULL END,
      CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW)::jsonb ELSE NULL END
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;