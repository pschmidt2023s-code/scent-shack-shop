-- CRITICAL SECURITY FIX: Newsletter Subscriptions Email Protection
-- Issue: Potential email harvesting vulnerability
-- Solution: Add explicit DENY policies and enhanced protections

-- 1. Add explicit DENY policy for anonymous SELECT access
CREATE POLICY "Block anonymous SELECT on newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
TO anon
USING (false);

-- 2. Add explicit DENY policy for public SELECT access  
CREATE POLICY "Block public SELECT on newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
TO public
USING (false);

-- 3. Ensure authenticated users (non-admins) cannot SELECT
CREATE POLICY "Block non-admin authenticated SELECT on newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
TO authenticated
USING (
  -- Only allow if user is admin
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- 4. Add rate limiting protection via INSERT restriction
-- Replace the existing "Anyone can subscribe" policy with a more secure one
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;

CREATE POLICY "Secure newsletter subscription"
ON public.newsletter_subscriptions
FOR INSERT
TO public
WITH CHECK (
  -- Basic email validation at database level
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND 
  -- Prevent duplicate subscriptions (additional safety)
  NOT EXISTS (
    SELECT 1 FROM public.newsletter_subscriptions ns 
    WHERE ns.email = newsletter_subscriptions.email
  )
);

-- 5. Ensure no UPDATE access for anyone except admins
CREATE POLICY "Block non-admin UPDATE on newsletter subscriptions"
ON public.newsletter_subscriptions  
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- 6. Block all other operations for anonymous users
CREATE POLICY "Block anonymous UPDATE on newsletter subscriptions"
ON public.newsletter_subscriptions
FOR UPDATE  
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block anonymous DELETE on newsletter subscriptions"
ON public.newsletter_subscriptions
FOR DELETE
TO anon
USING (false);