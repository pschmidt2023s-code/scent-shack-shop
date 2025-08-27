-- Fix critical security issues identified in security review

-- 1. Remove public coupon access policy (CRITICAL SECURITY FIX)
DROP POLICY IF EXISTS "Everyone can view active coupons" ON public.coupons;

-- 2. Add secure coupon validation policy for authenticated users only
CREATE POLICY "Authenticated users can validate coupons" 
ON public.coupons 
FOR SELECT 
TO authenticated
USING (active = true);

-- 3. Fix database function search paths to prevent SQL injection (SECURITY HARDENING)

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  );
  RETURN new;
END;
$function$;

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$function$;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
$function$;

-- Update generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  next_number := nextval('order_number_seq');
  order_number := 'ADN' || next_number;
  RETURN order_number;
END;
$function$;