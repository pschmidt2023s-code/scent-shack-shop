-- Strengthen profiles table security by adding explicit anonymous user restrictions
-- and improving existing policies

-- First, ensure RLS is definitely enabled (should already be, but double-check)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Admin profile management access" ON public.profiles;
DROP POLICY IF EXISTS "Strict user profile insert access" ON public.profiles;
DROP POLICY IF EXISTS "Strict user profile update access" ON public.profiles;
DROP POLICY IF EXISTS "Strict user profile view access" ON public.profiles;

-- Create explicit denial policy for anonymous users (highest priority)
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Create restrictive authenticated user policies with improved security
CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

CREATE POLICY "Users can insert only their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

CREATE POLICY "Users can update only their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Admin access with enhanced security checks
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND is_admin(auth.uid()) = true
);

-- Revoke any potential dangerous permissions
REVOKE ALL ON public.profiles FROM public;
REVOKE ALL ON public.profiles FROM anon;

-- Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Ensure no delete permissions for regular users (only admins via policy)
-- This prevents accidental data loss