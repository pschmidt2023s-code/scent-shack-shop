-- Fix newsletter subscription policy to prevent email enumeration
-- Remove the permissive INSERT policy that allows anonymous signups
DROP POLICY IF EXISTS "Authenticated or rate-limited newsletter signup" ON public.newsletter_subscriptions;

-- Create new policy that requires authentication for newsletter signup
CREATE POLICY "Authenticated users can signup for newsletter"
ON public.newsletter_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  -- Validate email format
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- Prevent duplicate active subscriptions
  AND NOT EXISTS (
    SELECT 1 FROM newsletter_subscriptions ns 
    WHERE ns.email = newsletter_subscriptions.email 
    AND ns.is_active = true
  )
  -- Ensure authenticated user
  AND auth.uid() IS NOT NULL
);