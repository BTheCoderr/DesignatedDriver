-- DesignatedDriver prototype hardening
-- 2026-09-29
-- Apply to the Supabase project before using the hardened client flow.

BEGIN;

-- Keep application status values aligned with the client.
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

ALTER TABLE public.trips
  DROP CONSTRAINT IF EXISTS trips_status_check;

ALTER TABLE public.trips
  ADD CONSTRAINT trips_status_check
  CHECK (status IN (
    'requested',
    'dispatched',
    'driver_arriving',
    'trunk_verified',
    'in_progress',
    'completed',
    'cancelled',
    'cancelled_by_user_pre_start',
    'cancelled_by_driver'
  ));

-- RLS helper functions should answer only for the current caller.
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_driver(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
        AND role = 'driver'
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_driver(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_driver(UUID) TO authenticated;

-- A signed-in account may choose only a normal user or driver role.
-- Admin assignment stays out of the public client.
CREATE OR REPLACE FUNCTION public.choose_account_role(p_role TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_current_role TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_role NOT IN ('user', 'driver') THEN
    RAISE EXCEPTION 'Invalid account role';
  END IF;

  SELECT role
  INTO v_current_role
  FROM public.profiles
  WHERE id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF v_current_role = 'admin' THEN
    RAISE EXCEPTION 'Admin roles cannot be changed from the client';
  END IF;

  UPDATE public.profiles
  SET role = p_role,
      updated_at = NOW()
  WHERE id = v_uid;

  RETURN p_role;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.choose_account_role(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.choose_account_role(TEXT) TO authenticated;

-- Stop clients from directly changing authorization fields.
REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (email, phone, full_name, updated_at) ON TABLE public.profiles TO authenticated;

-- Claiming a trip is concurrency-safe and enforces the driver role.
CREATE OR REPLACE FUNCTION public.claim_trip(p_trip_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_trip public.trips%ROWTYPE;
  v_slot TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_uid AND role = 'driver'
  ) THEN
    RAISE EXCEPTION 'Driver account required';
  END IF;

  SELECT *
  INTO v_trip
  FROM public.trips
  WHERE id = p_trip_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trip not found';
  END IF;

  IF v_trip.status <> 'requested' THEN
    RAISE EXCEPTION 'Trip is no longer available';
  END IF;

  IF v_trip.dispatch_mode = 'solo_scoot' THEN
    IF v_trip.primary_driver_id IS NOT NULL THEN
      RAISE EXCEPTION 'Trip is already claimed';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.driver_gear
      WHERE driver_id = v_uid
        AND verification_status = 'verified'
        AND gear_type <> 'none'
    ) THEN
      RAISE EXCEPTION 'Verified Solo-Scoot gear required';
    END IF;

    UPDATE public.trips
    SET primary_driver_id = v_uid,
        status = 'dispatched',
        dispatched_at = NOW()
    WHERE id = p_trip_id;

    v_slot := 'primary';

  ELSIF v_trip.dispatch_mode = 'chase_car' THEN
    IF v_trip.primary_driver_id IS NULL THEN
      UPDATE public.trips
      SET primary_driver_id = v_uid
      WHERE id = p_trip_id;

      v_slot := 'primary_waiting';

    ELSIF v_trip.primary_driver_id = v_uid THEN
      RAISE EXCEPTION 'You already claimed this trip';

    ELSIF v_trip.chase_driver_id IS NULL THEN
      UPDATE public.trips
      SET chase_driver_id = v_uid,
          status = 'dispatched',
          dispatched_at = NOW()
      WHERE id = p_trip_id;

      v_slot := 'chase';

    ELSE
      RAISE EXCEPTION 'Trip is already fully assigned';
    END IF;

  ELSE
    IF v_trip.primary_driver_id IS NOT NULL THEN
      RAISE EXCEPTION 'Trip is already claimed';
    END IF;

    UPDATE public.trips
    SET primary_driver_id = v_uid,
        status = 'dispatched',
        dispatched_at = NOW()
    WHERE id = p_trip_id;

    v_slot := 'primary';
  END IF;

  RETURN jsonb_build_object(
    'trip_id', p_trip_id,
    'slot', v_slot,
    'status', (SELECT status FROM public.trips WHERE id = p_trip_id)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_trip(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_trip(UUID) TO authenticated;

-- Insurance records may only be created/updated by an assigned driver.
DROP POLICY IF EXISTS "Authenticated users can create insurance sessions"
  ON public.insurance_sessions;

DROP POLICY IF EXISTS "Drivers can create assigned trip insurance"
  ON public.insurance_sessions;

CREATE POLICY "Drivers can create assigned trip insurance"
  ON public.insurance_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.trips
      WHERE id = insurance_sessions.trip_id
        AND (
          primary_driver_id = (SELECT auth.uid())
          OR chase_driver_id = (SELECT auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Drivers can update assigned trip insurance"
  ON public.insurance_sessions;

CREATE POLICY "Drivers can update assigned trip insurance"
  ON public.insurance_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.trips
      WHERE id = insurance_sessions.trip_id
        AND (
          primary_driver_id = (SELECT auth.uid())
          OR chase_driver_id = (SELECT auth.uid())
        )
    )
  )
  WITH CHECK (
    driver_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.trips
      WHERE id = insurance_sessions.trip_id
        AND (
          primary_driver_id = (SELECT auth.uid())
          OR chase_driver_id = (SELECT auth.uid())
        )
    )
  );

-- Trigger functions are internal implementation details, not public RPCs.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

COMMIT;
