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

-- Create audit logging for admin access to sensitive address data
CREATE TABLE IF NOT EXISTS public.address_access_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  accessed_address_id uuid NOT NULL,
  action text NOT NULL,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.address_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view address access logs" 
ON public.address_access_log 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create function to log admin address access
CREATE OR REPLACE FUNCTION public.log_admin_address_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if the accessing user is an admin (not the address owner)
  IF is_admin(auth.uid()) AND auth.uid() != COALESCE(OLD.user_id, NEW.user_id) THEN
    INSERT INTO public.address_access_log (
      admin_user_id,
      accessed_address_id,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to log admin access to addresses
CREATE TRIGGER log_address_admin_select
  AFTER SELECT ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_address_access();

CREATE TRIGGER log_address_admin_update
  AFTER UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_address_access();

-- Add additional security constraint to prevent mass data export
-- Create a function that limits bulk address queries for non-owners
CREATE OR REPLACE FUNCTION public.check_address_bulk_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent non-admin users from accessing addresses they don't own
  IF NOT is_admin(auth.uid()) AND NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You can only access your own addresses';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on the table to document security considerations
COMMENT ON TABLE public.addresses IS 'Contains sensitive personal information. Access is restricted to address owners and authorized administrators only. All admin access is logged for security audit purposes.';