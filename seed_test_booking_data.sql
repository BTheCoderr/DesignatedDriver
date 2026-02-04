-- ============================================
-- SEED TEST DATA FOR BOOKING FLOW
-- ============================================
-- Run this in Supabase SQL Editor to create test drivers and vehicles
-- for testing the request-rescue.tsx booking flow
-- ============================================

-- Step 1: Create a test driver with verified scooter gear
-- This driver will be available for Solo-Scoot dispatch
INSERT INTO public.profiles (id, email, phone, full_name, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'driver@test.com', '555-0100', 'Scooter Steve', 'driver')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Give the driver verified scooter gear
-- This makes them eligible for Solo-Scoot dispatch
INSERT INTO public.driver_gear (driver_id, gear_type, verification_status, photo_urls)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'folding_scooter', 'verified', ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- Step 3: Create a second driver for Chase Car mode
INSERT INTO public.profiles (id, email, phone, full_name, role)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'driver2@test.com', '555-0101', 'Chase Charlie', 'driver')
ON CONFLICT (id) DO NOTHING;

-- Step 4: Create a vehicle for the logged-in user
-- IMPORTANT: Replace 'YOUR_ACTUAL_USER_ID' with your actual Supabase Auth User ID!
-- To get your User ID:
--   1. Go to Supabase Dashboard -> Authentication -> Users
--   2. Copy the UUID from your user account
--   3. Replace 'YOUR_ACTUAL_USER_ID' below

-- Option A: If you know your user ID, uncomment and replace:
-- INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color)
-- VALUES 
--   ('YOUR_ACTUAL_USER_ID', 'Tesla', 'Model 3', 2023, 'TEST-123', 'Black');

-- Option B: Create vehicle for demo_user@test.com (if you're using demo account)
INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color)
SELECT 
  id as user_id,
  'Tesla' as make,
  'Model 3' as model,
  2023 as year,
  'TEST-123' as license_plate,
  'Black' as color
FROM auth.users
WHERE email = 'demo_user@test.com'
ON CONFLICT DO NOTHING;

-- Step 5: Verify the data was created
-- Run these queries to check:

-- Check drivers:
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE role = 'driver';

-- Check driver gear:
SELECT driver_id, gear_type, verification_status 
FROM public.driver_gear;

-- Check vehicles:
SELECT v.id, v.make, v.model, v.year, v.license_plate, u.email as owner_email
FROM public.vehicles v
JOIN auth.users u ON v.user_id = u.id;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If vehicle wasn't created, check your user ID:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- If you need to manually create a vehicle:
-- INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color)
-- VALUES ('your-user-id-here', 'Tesla', 'Model 3', 2023, 'TEST-123', 'Black');

-- If you need to delete test data:
-- DELETE FROM public.vehicles WHERE license_plate = 'TEST-123';
-- DELETE FROM public.driver_gear WHERE driver_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
-- DELETE FROM public.profiles WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
