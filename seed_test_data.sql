-- ============================================
-- SEED TEST DATA FOR DESIGNATED DRIVER MVP
-- Run this in Supabase SQL Editor
-- ============================================

-- IMPORTANT: First create test users via Supabase Auth Dashboard
-- Then run this SQL to create profiles and test data

-- ============================================
-- STEP 1: CREATE TEST USER PROFILES
-- ============================================
-- Note: These user_ids need to match real auth.users IDs
-- Replace these UUIDs with actual auth user IDs from Supabase Auth dashboard

-- Example: Create a test user profile (replace 'USER_UUID_HERE' with actual auth user ID)
-- You can get auth user IDs from: Supabase Dashboard > Authentication > Users

-- INSERT INTO public.profiles (id, email, phone, full_name, role)
-- VALUES 
--   ('USER_UUID_HERE', 'testuser@example.com', '4015550001', 'Test User', 'user'),
--   ('DRIVER_UUID_HERE', 'testdriver@example.com', '4015550002', 'Test Driver', 'driver'),
--   ('ADMIN_UUID_HERE', 'admin@example.com', '4015550003', 'Admin User', 'admin');

-- ============================================
-- STEP 2: QUICK SEED SCRIPT (Run after creating auth users)
-- ============================================
-- This script assumes you've created auth users via the app signup or Supabase dashboard

-- For MVP testing, you can manually:
-- 1. Sign up as a driver in the app (use testdriver@example.com)
-- 2. Or use Supabase Dashboard > Authentication > Users > Add User
-- 3. Then run the queries below to set roles

-- ============================================
-- MANUAL PROCESS (RECOMMENDED FOR MVP):
-- ============================================

-- 1. CREATE DRIVER ACCOUNT:
--    a. Go to your app: signup page
--    b. Sign up with: driver@test.com / password
--    c. Select "Driver" role
--    d. Profile will be created automatically

-- 2. CREATE USER ACCOUNT:
--    a. Sign up with: user@test.com / password  
--    b. Select "User" role
--    c. Add a vehicle

-- 3. CREATE ADMIN ACCOUNT:
--    a. Sign up with: admin@test.com / password
--    b. Select "User" role (we'll change it manually)
--    Run:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@test.com';

-- ============================================
-- OR: QUICK SQL FIX FOR EXISTING ACCOUNTS
-- ============================================

-- Change existing user to driver (replace email with your test driver email):
-- UPDATE public.profiles 
-- SET role = 'driver' 
-- WHERE email = 'yourdriver@email.com';

-- Change existing user to admin:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'youradmin@email.com';

-- ============================================
-- CREATE TEST DRIVER WITH GEAR (if driver exists)
-- ============================================

-- First, get your driver's user_id:
-- SELECT id, email, role FROM public.profiles WHERE role = 'driver';

-- Then create gear for that driver (replace DRIVER_ID with actual ID):
/*
INSERT INTO public.driver_gear (
  driver_id, 
  gear_type, 
  verification_status,
  device_model,
  photo_urls
)
VALUES (
  'DRIVER_ID_HERE',
  'folding_scooter',
  'verified',
  'Xiaomi Mi Electric Scooter',
  ARRAY['https://example.com/scooter-photo.jpg']
)
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- TEST DATA SUMMARY
-- ============================================

-- For MVP testing, you need:
-- ✅ 1+ User account (signup in app, add vehicle)
-- ✅ 1+ Driver account (signup in app, select driver role)
-- ✅ 1 Admin account (signup in app, then: UPDATE profiles SET role = 'admin')

-- To verify test accounts:
-- SELECT id, email, role, full_name FROM public.profiles;

-- ============================================
-- QUICK COMMANDS FOR TESTING
-- ============================================

-- View all users:
-- SELECT id, email, role, full_name, phone FROM public.profiles ORDER BY role;

-- Make someone a driver:
-- UPDATE public.profiles SET role = 'driver' WHERE email = 'YOUR_EMAIL';

-- Make someone an admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL';

-- View all vehicles:
-- SELECT v.*, p.email FROM public.vehicles v JOIN public.profiles p ON v.user_id = p.id;

-- View all trips:
-- SELECT 
--   t.id, 
--   t.status, 
--   t.dispatch_mode,
--   p.email as user_email,
--   t.pickup_address,
--   t.destination_address
-- FROM public.trips t 
-- JOIN public.profiles p ON t.user_id = p.id 
-- ORDER BY t.created_at DESC;
