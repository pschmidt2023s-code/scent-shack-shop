-- Fix critical security vulnerability: Remove public coupon access
-- Drop the current policy that exposes coupon data to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can validate coupons" ON public.coupons;

-- Create a more secure policy that only allows admins to view coupon data
-- Coupon validation will be handled securely via the Edge Function using service role
CREATE POLICY "Only admins can view coupon data" 
ON public.coupons 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Note: Coupon validation for customers is handled securely in the 
-- create-payment Edge Function using the service role key