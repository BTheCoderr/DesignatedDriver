-- ============================================
-- FIX VEHICLE INSPECTIONS RLS POLICIES (V2)
-- ============================================
-- More permissive policies for testing, then we can tighten later
-- ============================================

-- Drop ALL existing policies (comprehensive list)
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
-- MORE PERMISSIVE POLICIES (For Testing)
-- ============================================

-- 1. INSERT: Any authenticated driver can insert (we'll verify trip assignment in app logic)
CREATE POLICY "Drivers can insert inspections"
  ON public.vehicle_inspections FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id = auth.uid()
    -- Removed trip assignment check for now - verify in app code instead
  );

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

SELECT 
  policyname as "Policy Name",
  cmd as "Command"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'vehicle_inspections'
ORDER BY cmd, policyname;
