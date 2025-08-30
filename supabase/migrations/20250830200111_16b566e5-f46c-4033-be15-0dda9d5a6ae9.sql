-- Fix the function to set proper search path
CREATE OR REPLACE FUNCTION public.claim_guest_payback_earnings()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update guest earnings to associate with the newly registered user
  UPDATE public.payback_earnings 
  SET user_id = NEW.id, guest_email = null
  WHERE guest_email = NEW.email AND user_id IS NULL;
  
  RETURN NEW;
END;
$$;