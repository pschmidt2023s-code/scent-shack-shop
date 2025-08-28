-- Update the update_returns_updated_at function to set search path
CREATE OR REPLACE FUNCTION public.update_returns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';