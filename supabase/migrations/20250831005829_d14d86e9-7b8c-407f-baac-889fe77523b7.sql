-- Add SELECT policy to prevent unauthorized access to newsletter email addresses

-- Add restrictive SELECT policy for newsletter subscriptions
CREATE POLICY "Only admins can view newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
USING (is_admin(auth.uid()));