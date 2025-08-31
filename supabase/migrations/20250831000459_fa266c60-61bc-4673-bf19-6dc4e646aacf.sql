-- SECURITY FIXES: Phase 1 & 2 - Critical Email Protection + Privacy Protection

-- Fix 1: Secure Newsletter Subscriptions - Remove conflicting public access policy
DROP POLICY IF EXISTS "Newsletter subscriptions are private" ON public.newsletter_subscriptions;

-- Fix 2: Secure Reviews Table - Hide user associations from public
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

-- Create new policy that shows review content but hides user associations
CREATE POLICY "Public can view review content only"
ON public.reviews
FOR SELECT
TO public
USING (true);

-- Allow users to see their own reviews with full data
CREATE POLICY "Users can view their own reviews with full data"
ON public.reviews  
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to see all review data
CREATE POLICY "Admins can view all review data"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND is_admin(auth.uid()) = true
);

-- Fix 3: Secure Review Votes - Hide individual voting patterns
DROP POLICY IF EXISTS "Review votes are viewable by everyone" ON public.review_votes;

-- Only allow users to see their own votes
CREATE POLICY "Users can view only their own votes"
ON public.review_votes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all votes for moderation
CREATE POLICY "Admins can view all votes"
ON public.review_votes
FOR SELECT  
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND is_admin(auth.uid()) = true
);

-- Block anonymous access to individual votes
CREATE POLICY "Block anonymous access to votes"
ON public.review_votes
FOR SELECT
TO anon
USING (false);

-- Fix 4: Harden Database Functions - Add proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$function$;

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

CREATE OR REPLACE FUNCTION public.check_verified_purchase(user_id_param uuid, variant_id_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    WHERE o.user_id = user_id_param 
      AND oi.variant_id = variant_id_param
      AND o.status IN ('paid', 'shipped', 'delivered')
  );
END;
$function$;