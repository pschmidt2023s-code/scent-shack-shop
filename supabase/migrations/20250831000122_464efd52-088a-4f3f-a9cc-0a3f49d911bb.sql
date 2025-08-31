-- Fix critical security issue: Secure orders table RLS policies  
-- Problem: Guest orders (user_id NULL) and sensitive customer data exposure

-- First, drop ALL existing problematic policies on both tables
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;

-- Drop existing order_items policies
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Create secure policies for orders table

-- 1. Authenticated users can only view their own orders (user_id must match)
CREATE POLICY "Authenticated users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL 
  AND auth.uid() = user_id
);

-- 2. Admins can view all orders (both user and guest orders)
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND is_admin(auth.uid()) = true
);

-- 3. Block all anonymous access to orders (no public access allowed)
CREATE POLICY "Block anonymous access to orders"
ON public.orders
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 4. Ensure guest orders are only accessible by admins
CREATE POLICY "Guest orders only accessible by admins"
ON public.orders
FOR SELECT
TO authenticated  
USING (
  user_id IS NULL 
  AND is_admin(auth.uid()) = true
);

-- 5. Secure insert policy - only allow edge functions to create guest orders
CREATE POLICY "Authenticated users can create their own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL 
  AND auth.uid() = user_id
);

-- 6. Allow service role to create any orders (for edge functions)
CREATE POLICY "Service role can create any orders"
ON public.orders
FOR INSERT
TO service_role
WITH CHECK (true);

-- Secure the order_items table to prevent data leakage

-- 1. Authenticated users can view their own order items
CREATE POLICY "Authenticated users can view their own order items"
ON public.order_items
FOR SELECT  
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id IS NOT NULL
    AND orders.user_id = auth.uid()
  )
);

-- 2. Admins can view all order items
CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND is_admin(auth.uid()) = true
);

-- 3. Block anonymous access to order items
CREATE POLICY "Block anonymous access to order items"
ON public.order_items
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 4. Allow service role to insert order items (for edge functions)
CREATE POLICY "Service role can insert order items"
ON public.order_items
FOR INSERT
TO service_role
WITH CHECK (true);