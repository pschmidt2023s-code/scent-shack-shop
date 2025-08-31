-- REFINE SECURITY: Make anonymous review access more explicit
-- The current policy is too broad - make it more specific

-- Drop the overly broad anonymous policy
DROP POLICY IF EXISTS "Anonymous can view reviews through application" ON public.reviews;

-- Create a more restrictive policy that only works with our secure function
-- This policy essentially blocks direct table access but allows function access
CREATE POLICY "Reviews accessible only via secure function"
ON public.reviews
FOR SELECT
TO anon
USING (
  -- This will be false for direct queries, but our SECURITY DEFINER function can bypass RLS
  false
);