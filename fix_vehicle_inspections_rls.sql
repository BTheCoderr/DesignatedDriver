-- ============================================
-- FIX VEHICLE INSPECTIONS RLS POLICIES
-- ============================================
-- This fixes the RLS policy errors preventing vehicle inspection submissions
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Drivers can insert inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can view their inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can view inspections for their trips" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Users can view inspections for their trips" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can update their inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can insert vehicle inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can view own inspections" ON public.vehicle_inspections;

-- Recreate policies with correct conditions

-- 1. Drivers can INSERT inspections for trips they're assigned to
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

-- 2. Drivers can VIEW their own inspections
CREATE POLICY "Drivers can view own inspections"
  ON public.vehicle_inspections FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

-- 3. Users can VIEW inspections for their trips
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

-- 4. Drivers can UPDATE their own inspections
CREATE POLICY "Drivers can update own inspections"
  ON public.vehicle_inspections FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- ============================================
-- VERIFICATION
-- ============================================

-- Check policies were created
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  qual as "Using Expression",
  with_check as "With Check Expression"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'vehicle_inspections'
ORDER BY policyname;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If still getting errors, check:
-- 1. Is the user authenticated? (Check auth.uid() is not null)
-- 2. Is the driver_id matching auth.uid()?
-- 3. Is the trip_id valid and does the driver have access?
-- 4. Is the trip status correct for inspection?

-- Debug query (run as the driver user):
-- SELECT 
--   auth.uid() as current_user_id,
--   t.id as trip_id,
--   t.primary_driver_id,
--   t.chase_driver_id,
--   t.status
-- FROM trips t
-- WHERE t.id = 'YOUR_TRIP_ID'
-- AND (t.primary_driver_id = auth.uid() OR t.chase_driver_id = auth.uid());
