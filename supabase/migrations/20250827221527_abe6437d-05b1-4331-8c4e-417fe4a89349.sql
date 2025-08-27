-- Fix critical security issue: Strengthen profiles table access control
-- Ensure customer personal information is properly protected

-- First, let's drop any existing policies that might be too permissive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create bulletproof RLS policies with explicit restrictions
-- Policy 1: Users can only view their own profile data
CREATE POLICY "Strict user profile view access" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL
);

-- Policy 2: Users can only update their own profile data  
CREATE POLICY "Strict user profile update access"
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL
);

-- Policy 3: Users can only insert their own profile data
CREATE POLICY "Strict user profile insert access"
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL
);

-- Policy 4: Secure admin access for legitimate administrative functions
CREATE POLICY "Admin profile management access"
ON public.profiles 
FOR ALL
TO authenticated
USING (
  is_admin(auth.uid()) = true
  AND auth.uid() IS NOT NULL
);

-- Ensure RLS is enabled (should already be, but double-check)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Additional security: Ensure no public access is possible
-- Revoke any potential public permissions
REVOKE ALL ON public.profiles FROM public;
REVOKE ALL ON public.profiles FROM anon;

-- Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;