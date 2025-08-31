-- Fix Customer Profile Data Security Issue
-- Remove all existing overlapping RLS policies and create clean, secure policies

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Block anonymous DELETE on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block anonymous INSERT on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block anonymous SELECT on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block anonymous UPDATE on profiles" ON public.profiles;

-- Create clean, secure RLS policies with proper authentication checks
-- These policies use explicit auth checks and don't overlap

-- SELECT: Users can only view their own profile, admins can view all
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id OR 
      is_admin(auth.uid())
    )
  );

-- INSERT: Users can only create their own profile, must be authenticated
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = id
  );

-- UPDATE: Users can only update their own profile, admins can update any
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id OR 
      is_admin(auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id OR 
      is_admin(auth.uid())
    )
  );

-- DELETE: Only admins can delete profiles (users shouldn't delete their own profiles)
CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL AND 
    is_admin(auth.uid())
  );