-- ============================================
-- SEED TEST DATA FOR BOOKING FLOW
-- ============================================
-- IMPORTANT: You must create auth users FIRST before running this script!
-- 
-- Step 0: Create Auth Users (via Supabase Dashboard)
--   1. Go to Authentication -> Users -> Add User
--   2. Create these users:
--      - driver@test.com / password: Test123!
--      - driver2@test.com / password: Test123!
--      - demo_user@test.com / password: Demo123! (if not exists)
--   3. Make sure "Auto Confirm User" is ON
--   4. Copy the UUIDs from each user
--
-- Then run this script, replacing the UUIDs below with the actual ones from auth.users
-- ============================================

-- Step 1: Create driver profiles using EXISTING auth user IDs
-- IMPORTANT: Replace these UUIDs with actual IDs from auth.users table!

-- Option A: If you know the auth user IDs, replace them here:
-- INSERT INTO public.profiles (id, email, phone, full_name, role)
-- VALUES 
--   ('REPLACE_WITH_DRIVER1_AUTH_ID', 'driver@test.com', '555-0100', 'Scooter Steve', 'driver')
-- ON CONFLICT (id) DO NOTHING;

-- Option B: Use existing auth users by email (safer approach)
-- This will create profiles for any existing auth users with these emails
DO $$
DECLARE
  driver1_id UUID;
  driver2_id UUID;
BEGIN
  -- Get driver1 ID from auth.users
  SELECT id INTO driver1_id 
  FROM auth.users 
  WHERE email = 'driver@test.com';
  
  -- Get driver2 ID from auth.users
  SELECT id INTO driver2_id 
  FROM auth.users 
  WHERE email = 'driver2@test.com';
  
  -- Create profile for driver1 if auth user exists
  IF driver1_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, phone, full_name, role)
    VALUES (driver1_id, 'driver@test.com', '555-0100', 'Scooter Steve', 'driver')
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email, phone = EXCLUDED.phone, full_name = EXCLUDED.full_name, role = EXCLUDED.role;
  ELSE
    RAISE NOTICE '⚠️  Auth user driver@test.com not found. Create it first in Authentication -> Users';
  END IF;
  
  -- Create profile for driver2 if auth user exists
  IF driver2_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, phone, full_name, role)
    VALUES (driver2_id, 'driver2@test.com', '555-0101', 'Chase Charlie', 'driver')
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email, phone = EXCLUDED.phone, full_name = EXCLUDED.full_name, role = EXCLUDED.role;
  ELSE
    RAISE NOTICE '⚠️  Auth user driver2@test.com not found. Create it first in Authentication -> Users';
  END IF;
END $$;

-- Step 2: Give Scooter Steve verified scooter gear
-- This makes them eligible for Solo-Scoot dispatch
DO $$
DECLARE
  driver1_id UUID;
BEGIN
  SELECT id INTO driver1_id FROM auth.users WHERE email = 'driver@test.com';
  
  IF driver1_id IS NOT NULL THEN
    INSERT INTO public.driver_gear (driver_id, gear_type, verification_status, photo_urls)
    VALUES (driver1_id, 'folding_scooter', 'verified', ARRAY[]::text[])
    ON CONFLICT (driver_id) DO UPDATE 
    SET gear_type = EXCLUDED.gear_type, 
        verification_status = EXCLUDED.verification_status;
  END IF;
END $$;

-- Step 3: Create vehicle for demo_user@test.com (or your test user)
-- This will work if demo_user@test.com exists in auth.users
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

-- If demo_user@test.com doesn't exist, create vehicle for any user:
-- (Uncomment and replace YOUR_EMAIL with your actual email)
-- INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color)
-- SELECT 
--   id as user_id,
--   'Tesla' as make,
--   'Model 3' as model,
--   2023 as year,
--   'TEST-123' as license_plate,
--   'Black' as color
-- FROM auth.users
-- WHERE email = 'YOUR_EMAIL@example.com'
-- ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check drivers were created:
SELECT p.id, p.email, p.full_name, p.role, u.email as auth_email
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'driver';

-- Check driver gear:
SELECT dg.driver_id, p.email, dg.gear_type, dg.verification_status 
FROM public.driver_gear dg
JOIN public.profiles p ON dg.driver_id = p.id;

-- Check vehicles:
SELECT v.id, v.make, v.model, v.year, v.license_plate, u.email as owner_email
FROM public.vehicles v
JOIN auth.users u ON v.user_id = u.id;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If you get "auth user not found" errors:
-- 1. Go to Supabase Dashboard -> Authentication -> Users
-- 2. Create users with these emails:
--    - driver@test.com
--    - driver2@test.com  
--    - demo_user@test.com (or your test email)
-- 3. Make sure "Auto Confirm User" is ON
-- 4. Re-run this script

-- To find your user ID:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- To manually create a vehicle for your user:
-- INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
--   'Tesla', 'Model 3', 2023, 'TEST-123', 'Black'
-- );

-- To clean up test data:
-- DELETE FROM public.vehicles WHERE license_plate = 'TEST-123';
-- DELETE FROM public.driver_gear WHERE driver_id IN (
--   SELECT id FROM auth.users WHERE email IN ('driver@test.com', 'driver2@test.com')
-- );
-- DELETE FROM public.profiles WHERE email IN ('driver@test.com', 'driver2@test.com');
