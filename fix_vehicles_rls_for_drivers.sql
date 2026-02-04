-- ============================================
-- FIX VEHICLES RLS FOR DRIVERS
-- ============================================
-- Allows drivers to query vehicles for trips they're assigned to
-- Fixes 406 errors when drivers try to start trips
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers can view vehicles for assigned trips" ON public.vehicles;

-- Recreate with better logic

-- 1. Users can view their own vehicles
CREATE POLICY "Users can view own vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Drivers can view vehicles for assigned trips (more permissive)
CREATE POLICY "Drivers can view vehicles for assigned trips"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.vehicle_id = vehicles.id
      AND (
        trips.primary_driver_id = auth.uid() 
        OR trips.chase_driver_id = auth.uid()
      )
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
AND tablename = 'vehicles'
AND cmd = 'SELECT'
ORDER BY policyname;
