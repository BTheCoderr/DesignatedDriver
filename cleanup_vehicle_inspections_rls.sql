-- ============================================
-- CLEANUP VEHICLE INSPECTIONS RLS POLICIES
-- ============================================
-- Remove the overly permissive "ALL" policy and keep only specific ones
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.vehicle_inspections;

-- Drop all other policies to start fresh
DROP POLICY IF EXISTS "Drivers can insert inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can view own inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can view their own inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Users can view inspections for their trips" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Users can view trip inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can update own inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can create inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can view trip inspections" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Drivers can update their inspections" ON public.vehicle_inspections;

-- ============================================
-- CREATE CLEAN, SPECIFIC POLICIES
-- ============================================

-- 1. INSERT: Drivers can insert inspections (more permissive for testing)
CREATE POLICY "Drivers can insert inspections"
  ON public.vehicle_inspections FOR INSERT
  TO authenticated
  WITH CHECK (driver_id = auth.uid());

-- 2. UPDATE: Drivers can update their own inspections
CREATE POLICY "Drivers can update own inspections"
  ON public.vehicle_inspections FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

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

-- Check policies were created correctly
SELECT 
  policyname as "Policy Name",
  cmd as "Command"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'vehicle_inspections'
ORDER BY cmd, policyname;

-- Should show exactly 4 policies:
-- 1. "Drivers can insert inspections" (INSERT)
-- 2. "Drivers can update own inspections" (UPDATE)
-- 3. "Drivers can view own inspections" (SELECT)
-- 4. "Users can view trip inspections" (SELECT)
