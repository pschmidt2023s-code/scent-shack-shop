-- Add guest_email column to payback_earnings table
ALTER TABLE public.payback_earnings 
ADD COLUMN guest_email text;

-- Create function to claim guest earnings when user registers
CREATE OR REPLACE FUNCTION public.claim_guest_payback_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update guest earnings to associate with the newly registered user
  UPDATE public.payback_earnings 
  SET user_id = NEW.id, guest_email = null
  WHERE guest_email = NEW.email AND user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to claim guest earnings on user creation
CREATE TRIGGER claim_guest_earnings_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.claim_guest_payback_earnings();