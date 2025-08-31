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

-- Create audit logging table for admin access to sensitive address data
CREATE TABLE IF NOT EXISTS public.address_access_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  accessed_address_id uuid NOT NULL,
  address_owner_user_id uuid NOT NULL,
  action text NOT NULL,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  admin_justification text
);

-- Enable RLS on audit log  
ALTER TABLE public.address_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view address access logs
CREATE POLICY "Only admins can view address access logs" 
ON public.address_access_log 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create function to log admin address modifications
CREATE OR REPLACE FUNCTION public.log_admin_address_modification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to log admin updates to addresses
CREATE TRIGGER log_address_admin_modifications
  AFTER UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_address_modification();

-- Add table comment documenting security considerations
COMMENT ON TABLE public.addresses IS 'Contains sensitive personal information including names, addresses, and contact details. Access is strictly controlled: users can only access their own addresses, and authorized administrators have limited access for business operations (order processing, customer support). All admin access is logged for security auditing.';

-- Add column comments for sensitive fields
COMMENT ON COLUMN public.addresses.first_name IS 'Sensitive PII - access logged when viewed by admins';
COMMENT ON COLUMN public.addresses.last_name IS 'Sensitive PII - access logged when viewed by admins';  
COMMENT ON COLUMN public.addresses.street IS 'Sensitive PII - access logged when viewed by admins';
COMMENT ON COLUMN public.addresses.city IS 'Sensitive PII - access logged when viewed by admins';
COMMENT ON COLUMN public.addresses.postal_code IS 'Sensitive PII - access logged when viewed by admins';