-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_gear ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trunk_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- VEHICLES
-- ============================================

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

-- ============================================
-- DRIVER GEAR
-- ============================================

-- Drivers can view their own gear
CREATE POLICY "Drivers can view own gear"
  ON public.driver_gear FOR SELECT
  USING (driver_id = auth.uid());

-- Drivers can insert their own gear
CREATE POLICY "Drivers can insert own gear"
  ON public.driver_gear FOR INSERT
  WITH CHECK (driver_id = auth.uid());

-- Drivers can update their own gear (before verification)
CREATE POLICY "Drivers can update own gear before verification"
  ON public.driver_gear FOR UPDATE
  USING (
    driver_id = auth.uid()
    AND verification_status IN ('none', 'pending', 'rejected')
  );

-- Admins can view all gear
CREATE POLICY "Admins can view all gear"
  ON public.driver_gear FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update gear verification status
CREATE POLICY "Admins can verify gear"
  ON public.driver_gear FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- TRIPS
-- ============================================

-- Users can view their own trips
CREATE POLICY "Users can view own trips"
  ON public.trips FOR SELECT
  USING (user_id = auth.uid());

-- Users can create trips
CREATE POLICY "Users can create trips"
  ON public.trips FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own trips (limited fields, e.g., cancel)
CREATE POLICY "Users can update own trips"
  ON public.trips FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Drivers can view trips assigned to them
CREATE POLICY "Drivers can view assigned trips"
  ON public.trips FOR SELECT
  USING (
    primary_driver_id = auth.uid()
    OR chase_driver_id = auth.uid()
  );

-- Drivers can view available trips (for dispatch)
CREATE POLICY "Drivers can view available trips"
  ON public.trips FOR SELECT
  USING (
    status = 'requested'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- Drivers can update trips they're assigned to (status updates)
CREATE POLICY "Drivers can update assigned trips"
  ON public.trips FOR UPDATE
  USING (
    primary_driver_id = auth.uid()
    OR chase_driver_id = auth.uid()
  );

-- Admins can view all trips
CREATE POLICY "Admins can view all trips"
  ON public.trips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- TRUNK LOGS
-- ============================================

-- Users can view trunk logs for their trips
CREATE POLICY "Users can view own trip trunk logs"
  ON public.trunk_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = trunk_logs.trip_id AND user_id = auth.uid()
    )
  );

-- Drivers can view trunk logs for assigned trips
CREATE POLICY "Drivers can view assigned trip trunk logs"
  ON public.trunk_logs FOR SELECT
  USING (
    driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = trunk_logs.trip_id
      AND (primary_driver_id = auth.uid() OR chase_driver_id = auth.uid())
    )
  );

-- Drivers can insert trunk logs for assigned trips
CREATE POLICY "Drivers can create trunk logs"
  ON public.trunk_logs FOR INSERT
  WITH CHECK (
    driver_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = trunk_logs.trip_id
      AND (primary_driver_id = auth.uid() OR chase_driver_id = auth.uid())
    )
  );

-- Drivers can update their own trunk logs
CREATE POLICY "Drivers can update own trunk logs"
  ON public.trunk_logs FOR UPDATE
  USING (driver_id = auth.uid());

-- ============================================
-- INSURANCE SESSIONS
-- ============================================

-- Users can view insurance sessions for their trips
CREATE POLICY "Users can view own trip insurance"
  ON public.insurance_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = insurance_sessions.trip_id AND user_id = auth.uid()
    )
  );

-- Drivers can view insurance sessions for assigned trips
CREATE POLICY "Drivers can view assigned trip insurance"
  ON public.insurance_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = insurance_sessions.trip_id
      AND (primary_driver_id = auth.uid() OR chase_driver_id = auth.uid())
    )
  );

-- System can create insurance sessions (via service role or function)
-- Note: In production, use service role for this
CREATE POLICY "Authenticated users can create insurance sessions"
  ON public.insurance_sessions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Drivers can update insurance sessions for assigned trips (bind/end policy)
CREATE POLICY "Drivers can update assigned trip insurance"
  ON public.insurance_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = insurance_sessions.trip_id
      AND (primary_driver_id = auth.uid() OR chase_driver_id = auth.uid())
    )
  );

-- ============================================
-- CLAIMS
-- ============================================

-- Users can view their own claims
CREATE POLICY "Users can view own claims"
  ON public.claims FOR SELECT
  USING (user_id = auth.uid());

-- Users can create claims for their trips
CREATE POLICY "Users can create claims"
  ON public.claims FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = claims.trip_id AND user_id = auth.uid()
    )
  );

-- Users can update their own claims (limited, e.g., add photos)
CREATE POLICY "Users can update own claims"
  ON public.claims FOR UPDATE
  USING (user_id = auth.uid() AND status = 'submitted');

-- Admins can view all claims
CREATE POLICY "Admins can view all claims"
  ON public.claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update claims (review, approve, deny)
CREATE POLICY "Admins can update claims"
  ON public.claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- DRIVER LOCATIONS
-- ============================================

-- Users can view driver locations for their active trips
CREATE POLICY "Users can view driver locations for own trips"
  ON public.driver_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = driver_locations.trip_id
      AND user_id = auth.uid()
      AND status IN ('dispatched', 'driver_arriving', 'trunk_verified', 'in_progress')
    )
  );

-- Drivers can insert their own location
CREATE POLICY "Drivers can insert own location"
  ON public.driver_locations FOR INSERT
  WITH CHECK (driver_id = auth.uid());

-- Drivers can view their own location history
CREATE POLICY "Drivers can view own locations"
  ON public.driver_locations FOR SELECT
  USING (driver_id = auth.uid());

-- ============================================
-- TRIP REVIEWS
-- ============================================

-- Users can view reviews for their trips
CREATE POLICY "Users can view own trip reviews"
  ON public.trip_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = trip_reviews.trip_id AND user_id = auth.uid()
    )
  );

-- Users can create reviews for their completed trips
CREATE POLICY "Users can create reviews for own trips"
  ON public.trip_reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = trip_reviews.trip_id
      AND user_id = auth.uid()
      AND status = 'completed'
    )
  );

-- Drivers can view their own reviews
CREATE POLICY "Drivers can view own reviews"
  ON public.trip_reviews FOR SELECT
  USING (driver_id = auth.uid());

