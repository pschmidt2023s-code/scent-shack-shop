-- Fix conflicting and excessive RLS policies for newsletter_subscriptions and reviews tables

-- ============= NEWSLETTER SUBSCRIPTIONS CLEANUP =============
-- Drop all existing newsletter subscription policies to start fresh
DROP POLICY IF EXISTS "Admins can delete newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Admins can view all newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Block anonymous DELETE on newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Block anonymous SELECT on newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Block anonymous UPDATE on newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Block non-admin UPDATE on newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Block non-admin authenticated SELECT on newsletter subscription" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Block public SELECT on newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Secure newsletter subscription" ON public.newsletter_subscriptions;

-- Create simplified, clear newsletter subscription policies
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscriptions
FOR INSERT
WITH CHECK (
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text 
  AND NOT EXISTS (
    SELECT 1 FROM newsletter_subscriptions ns 
    WHERE ns.email = newsletter_subscriptions.email
  )
);

CREATE POLICY "Admins can manage all newsletter subscriptions"
ON public.newsletter_subscriptions
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- ============= REVIEWS TABLE CLEANUP =============
-- Drop all existing conflicting review policies
DROP POLICY IF EXISTS "Admins can view all review data" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can view public review content" ON public.reviews;
DROP POLICY IF EXISTS "Block direct public access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Reviews accessible only via secure function" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view their own reviews with full data" ON public.reviews;

-- Create simplified, clear review policies
CREATE POLICY "Users can manage their own reviews"
ON public.reviews
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
ON public.reviews
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Block direct access to reviews table - force use of get_public_reviews() function
CREATE POLICY "Block direct review access for non-owners"
ON public.reviews
FOR SELECT
USING (
  -- Allow users to see their own reviews
  auth.uid() = user_id 
  -- Allow admins to see all reviews
  OR is_admin(auth.uid())
  -- Block all other direct access - reviews should be accessed via get_public_reviews() function
);