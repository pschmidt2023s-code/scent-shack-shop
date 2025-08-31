-- Add missing anonymous blocking policy for profiles table
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
USING (false)
WITH CHECK (false);