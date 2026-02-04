-- ============================================
-- FIX VEHICLE INSPECTIONS RLS POLICIES
-- ============================================
-- This fixes the RLS policy errors preventing vehicle inspection submissions
-- The issue: upsert() requires both INSERT and UPDATE policies
-- ============================================

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Drivers can insert inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can view their inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can view inspections for their trips" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Users can view inspections for their trips" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can update their inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can insert vehicle inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can view own inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can create inspections" ON public.vehicle_inspections;

-- ============================================
-- RECREATE POLICIES (Properly)
-- ============================================

-- 1. INSERT: Drivers can create inspections for trips they're assigned to
CREATE POLICY "Drivers can insert inspections"
  ON public.vehicle_inspections FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = vehicle_inspections.trip_id
      AND (trips.primary_driver_id = auth.uid() OR trips.chase_driver_id = auth.uid())
    )
  );

-- 2. UPDATE: Drivers can update their own inspections (needed for upsert)
CREATE POLICY "Drivers can update own inspections"
  ON public.vehicle_inspections FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (
    driver_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = vehicle_inspections.trip_id
      AND (trips.primary_driver_id = auth.uid() OR trips.chase_driver_id = auth.uid())
    )
  );

-- 3. SELECT: Drivers can view their own inspections
CREATE POLICY "Drivers can view own inspections"
  ON public.vehicle_inspections FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

-- 4. SELECT: Users can view inspections for their trips
CREATE POLICY "Users can view trip inspections"
  ON public.vehicle_inspections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = vehicle_inspections.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================

-- Check policies were created
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  CASE 
    WHEN qual IS NOT NULL THEN qual::text
    ELSE 'N/A'
  END as "Using Expression",
  CASE 
    WHEN with_check IS NOT NULL THEN with_check::text
    ELSE 'N/A'
  END as "With Check Expression"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'vehicle_inspections'
ORDER BY cmd, policyname;

-- ============================================
-- TROUBLESHOOTING GUIDE
-- ============================================

-- If you still get RLS errors, check these:

-- 1. Verify the driver is assigned to the trip:
-- SELECT 
--   t.id as trip_id,
--   t.primary_driver_id,
--   t.chase_driver_id,
--   auth.uid() as current_user_id,
--   CASE 
--     WHEN t.primary_driver_id = auth.uid() THEN 'Primary Driver'
--     WHEN t.chase_driver_id = auth.uid() THEN 'Chase Driver'
--     ELSE 'NOT ASSIGNED'
--   END as driver_role
-- FROM trips t
-- WHERE t.id = 'YOUR_TRIP_ID';

-- 2. Verify the user is authenticated:
-- SELECT auth.uid() as current_user_id;

-- 3. Check if RLS is enabled:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename = 'vehicle_inspections';

-- 4. List all policies:
-- SELECT * FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename = 'vehicle_inspections';
