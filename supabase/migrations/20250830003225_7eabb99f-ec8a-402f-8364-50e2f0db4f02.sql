-- Fix function security by setting search path
CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := 'REF' || upper(substring(md5(random()::text) from 1 for 5));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM partners WHERE partner_code = code) INTO exists_check;
    
    -- If code doesn't exist, exit loop
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;