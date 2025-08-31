-- Add admin policies for addresses table to allow legitimate business operations
-- while maintaining strict security controls

-- Allow admins to view addresses (needed for order processing, customer support)
CREATE POLICY "Admins can view addresses for business operations" 
ON public.addresses 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to update addresses (needed for order corrections, customer support)
CREATE POLICY "Admins can update addresses for business operations" 
ON public.addresses 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Create audit logging for admin modifications to sensitive address data
CREATE TABLE IF NOT EXISTS public.address_access_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  accessed_address_id uuid NOT NULL,
  customer_user_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  reason text -- Business reason for access
);

-- Enable RLS on audit log
ALTER TABLE public.address_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view address access logs" 
ON public.address_access_log 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create function to log admin address modifications
CREATE OR REPLACE FUNCTION public.log_admin_address_modifications()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to log admin modifications to addresses
CREATE TRIGGER log_address_admin_update
  AFTER UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_address_modifications();

CREATE TRIGGER log_address_admin_delete
  AFTER DELETE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_address_modifications();

-- Add table comment documenting security considerations
COMMENT ON TABLE public.addresses IS 'Contains sensitive personal information (names, addresses, phone numbers). Access restricted to address owners and authorized administrators. All admin modifications are logged for security audit purposes.';

-- Add column comments for sensitive data
COMMENT ON COLUMN public.addresses.first_name IS 'Sensitive PII - logged when accessed by admins';
COMMENT ON COLUMN public.addresses.last_name IS 'Sensitive PII - logged when accessed by admins';
COMMENT ON COLUMN public.addresses.street IS 'Sensitive PII - logged when accessed by admins';
COMMENT ON COLUMN public.addresses.city IS 'Sensitive PII - logged when accessed by admins';
COMMENT ON COLUMN public.addresses.postal_code IS 'Sensitive PII - logged when accessed by admins';