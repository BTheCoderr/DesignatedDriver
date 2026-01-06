-- ============================================
-- SEED DATA FOR MVP TESTING
-- ============================================
-- Run this after creating schema and RLS policies
-- Note: You'll need to create auth users first via Supabase Auth
-- Then update the UUIDs below to match your actual user IDs

-- ============================================
-- SAMPLE PROFILES
-- ============================================
-- Note: Replace these UUIDs with actual auth.users IDs from Supabase

-- Sample User Profile
-- INSERT INTO public.profiles (id, email, phone, full_name, role)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'user@test.com',
--   '+15551234567',
--   'Test User',
--   'user'
-- );

-- Sample Driver Profiles
-- INSERT INTO public.profiles (id, email, phone, full_name, role)
-- VALUES (
--   '00000000-0000-0000-0000-000000000002',
--   'driver1@test.com',
--   '+15551234568',
--   'John Driver',
--   'driver'
-- );

-- INSERT INTO public.profiles (id, email, phone, full_name, role)
-- VALUES (
--   '00000000-0000-0000-0000-000000000003',
--   'driver2@test.com',
--   '+15551234569',
--   'Jane Chase',
--   'driver'
-- );

-- Sample Admin Profile
-- INSERT INTO public.profiles (id, email, phone, full_name, role)
-- VALUES (
--   '00000000-0000-0000-0000-000000000004',
--   'admin@test.com',
--   '+15551234570',
--   'Admin User',
--   'admin'
-- );

-- ============================================
-- SAMPLE VEHICLES
-- ============================================
-- INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color, notes)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001', -- user_id
--   'Toyota',
--   'Camry',
--   2020,
--   'ABC1234',
--   'Silver',
--   'Standard sedan, trunk fits scooter'
-- );

-- ============================================
-- SAMPLE DRIVER GEAR
-- ============================================
-- Driver with verified folding scooter
-- INSERT INTO public.driver_gear (driver_id, gear_type, verification_status, device_model, photo_urls)
-- VALUES (
--   '00000000-0000-0000-0000-000000000002', -- driver_id
--   'folding_scooter',
--   'verified',
--   'Xiaomi Mi Electric Scooter',
--   ARRAY['https://storage.supabase.co/object/public/driver-gear-photos/scooter1.jpg']
-- );

-- Driver without gear (chase car only)
-- INSERT INTO public.driver_gear (driver_id, gear_type, verification_status)
-- VALUES (
--   '00000000-0000-0000-0000-000000000003', -- driver_id
--   'none',
--   'verified'
-- );

-- ============================================
-- SAMPLE TRIP (for testing)
-- ============================================
-- INSERT INTO public.trips (
--   user_id,
--   vehicle_id,
--   dispatch_mode,
--   status,
--   pickup_latitude,
--   pickup_longitude,
--   pickup_address,
--   destination_latitude,
--   destination_longitude,
--   destination_address,
--   primary_driver_id,
--   chase_driver_id,
--   base_fee,
--   mileage_fee,
--   surge_multiplier,
--   total_price,
--   estimated_distance_miles,
--   estimated_duration_minutes
-- )
-- VALUES (
--   '00000000-0000-0000-0000-000000000001', -- user_id
--   (SELECT id FROM public.vehicles WHERE user_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
--   'solo_scoot',
--   'requested',
--   40.7128,  -- NYC coordinates
--   -74.0060,
--   '123 Main St, New York, NY',
--   40.7589,
--   -73.9851,
--   '456 Broadway, New York, NY',
--   NULL, -- Not dispatched yet
--   NULL,
--   15.00,
--   8.75,  -- 5 miles * 1.75
--   1.0,
--   28.25,  -- (15 + 8.75) * 1.0 + taxes + platform fee
--   5.0,
--   15
-- );

-- ============================================
-- HELPER FUNCTION: Create test data
-- ============================================
-- This function can be called after creating auth users
-- to automatically create associated profiles

CREATE OR REPLACE FUNCTION create_test_profile(
  p_user_id UUID,
  p_email TEXT,
  p_phone TEXT,
  p_full_name TEXT,
  p_role TEXT
)
RETURNS UUID AS $$
DECLARE
  profile_id UUID;
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name, role)
  VALUES (p_user_id, p_email, p_phone, p_full_name, p_role)
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TEST DATA SETUP INSTRUCTIONS
-- ============================================
-- 1. Create auth users via Supabase Dashboard or API
-- 2. Note the user IDs (UUIDs)
-- 3. Update the UUIDs in the INSERT statements above
-- 4. Run the INSERT statements
-- 5. Or use the create_test_profile function:
--
--    SELECT create_test_profile(
--      'your-auth-user-id-here',
--      'user@test.com',
--      '+15551234567',
--      'Test User',
--      'user'
--    );

