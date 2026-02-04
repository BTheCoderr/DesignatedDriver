-- ============================================
-- FIX INSURANCE SESSIONS RLS POLICIES
-- ============================================
-- Fixes 406 errors when querying insurance_sessions
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own trip insurance" ON public.insurance_sessions;
DROP POLICY IF EXISTS "Drivers can view assigned trip insurance" ON public.insurance_sessions;
DROP POLICY IF EXISTS "Authenticated users can create insurance sessions" ON public.insurance_sessions;
DROP POLICY IF EXISTS "Drivers can update assigned trip insurance" ON public.insurance_sessions;

-- ============================================
-- RECREATE POLICIES (More Permissive for Testing)
-- ============================================

-- 1. SELECT: Users can view insurance sessions for their trips
CREATE POLICY "Users can view own trip insurance"
  ON public.insurance_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = insurance_sessions.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

-- 2. SELECT: Drivers can view insurance sessions for assigned trips
CREATE POLICY "Drivers can view assigned trip insurance"
  ON public.insurance_sessions FOR SELECT
  TO authenticated
  USING (
    driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = insurance_sessions.trip_id
      AND (trips.primary_driver_id = auth.uid() OR trips.chase_driver_id = auth.uid())
    )
  );

-- 3. INSERT: Any authenticated user can create insurance sessions
CREATE POLICY "Authenticated users can create insurance sessions"
  ON public.insurance_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- 4. UPDATE: Drivers can update insurance sessions for assigned trips
CREATE POLICY "Drivers can update assigned trip insurance"
  ON public.insurance_sessions FOR UPDATE
  TO authenticated
  USING (
    driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = insurance_sessions.trip_id
      AND (trips.primary_driver_id = auth.uid() OR trips.chase_driver_id = auth.uid())
    )
  )
  WITH CHECK (
    driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = insurance_sessions.trip_id
      AND (trips.primary_driver_id = auth.uid() OR trips.chase_driver_id = auth.uid())
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
AND tablename = 'insurance_sessions'
ORDER BY cmd, policyname;
