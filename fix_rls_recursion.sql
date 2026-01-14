-- ============================================
-- FIX RLS INFINITE RECURSION
-- Run this in Supabase SQL Editor
-- ============================================
-- 
-- The issue: Admin policy on profiles causes infinite recursion
-- because it queries profiles to check if user is admin,
-- which triggers the same policy check again.
--
-- Solution: Use a security definer function or check role differently
-- ============================================

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create helper functions to check user roles (bypass RLS to prevent recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_driver(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'driver'
  );
$$;

-- Drop and recreate all policies that query profiles to prevent recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all gear" ON public.driver_gear;
DROP POLICY IF EXISTS "Admins can verify gear" ON public.driver_gear;
DROP POLICY IF EXISTS "Admins can view all trips" ON public.trips;
DROP POLICY IF EXISTS "Admins can view all claims" ON public.claims;
DROP POLICY IF EXISTS "Admins can update claims" ON public.claims;
DROP POLICY IF EXISTS "Drivers can view available trips" ON public.trips;

-- Recreate admin policies using the function (no recursion)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all gear"
  ON public.driver_gear FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can verify gear"
  ON public.driver_gear FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all trips"
  ON public.trips FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all claims"
  ON public.claims FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update claims"
  ON public.claims FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Drivers can view available trips"
  ON public.trips FOR SELECT
  USING (
    status = 'requested'
    AND public.is_driver(auth.uid())
  );

-- Verify the fix
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
