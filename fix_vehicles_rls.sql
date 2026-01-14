-- ============================================
-- FIX VEHICLES RLS POLICIES
-- Run this in Supabase SQL Editor if you're getting 500 errors
-- ============================================

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can insert own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers can view vehicles for assigned trips" ON public.vehicles;

-- Ensure RLS is enabled
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Users can view their own vehicles
CREATE POLICY "Users can view own vehicles"
  ON public.vehicles FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own vehicles
CREATE POLICY "Users can insert own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own vehicles
CREATE POLICY "Users can update own vehicles"
  ON public.vehicles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own vehicles
CREATE POLICY "Users can delete own vehicles"
  ON public.vehicles FOR DELETE
  USING (user_id = auth.uid());

-- Drivers can view vehicles for assigned trips
CREATE POLICY "Drivers can view vehicles for assigned trips"
  ON public.vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE vehicle_id = vehicles.id
      AND (primary_driver_id = auth.uid() OR chase_driver_id = auth.uid())
    )
  );

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'vehicles'
ORDER BY policyname;
