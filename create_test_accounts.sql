-- ============================================
-- CREATE TEST ACCOUNTS FOR TESTING
-- Run this in Supabase SQL Editor
-- ============================================
-- 
-- This script helps you create test accounts for all 3 roles.
-- 
-- IMPORTANT: You need to create the auth users FIRST in Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Create these 3 users:
--    - Email: user@test.com, Password: test123456
--    - Email: driver@test.com, Password: test123456
--    - Email: admin@test.com, Password: test123456
-- 4. Make sure to confirm their emails (or disable email confirmation)
-- 5. Then run this script to set their roles
--
-- ============================================

-- Get the user IDs (you'll need to replace these with actual IDs from auth.users)
-- To find user IDs:
-- SELECT id, email FROM auth.users WHERE email IN ('user@test.com', 'driver@test.com', 'admin@test.com');

-- Update or create profiles for test accounts
-- Replace 'USER_ID_HERE' with actual user IDs from auth.users

-- USER ACCOUNT
INSERT INTO public.profiles (id, email, phone, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'user@test.com' LIMIT 1),
  'user@test.com',
  '+1234567890',
  'Test User',
  'user'
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'user',
  email = 'user@test.com',
  phone = '+1234567890',
  full_name = 'Test User';

-- DRIVER ACCOUNT
INSERT INTO public.profiles (id, email, phone, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'driver@test.com' LIMIT 1),
  'driver@test.com',
  '+1234567891',
  'Test Driver',
  'driver'
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'driver',
  email = 'driver@test.com',
  phone = '+1234567891',
  full_name = 'Test Driver';

-- ADMIN ACCOUNT
INSERT INTO public.profiles (id, email, phone, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@test.com' LIMIT 1),
  'admin@test.com',
  '+1234567892',
  'Test Admin',
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  email = 'admin@test.com',
  phone = '+1234567892',
  full_name = 'Test Admin';

-- ============================================
-- ALTERNATIVE: Manual method (if above doesn't work)
-- ============================================
-- 
-- 1. Sign up in the app with: user@test.com / test123456
-- 2. Select "I need a driver" → Creates user account
-- 3. Logout
-- 4. Sign up with: driver@test.com / test123456
-- 5. Select "I'm a driver" → Creates driver account
-- 6. Logout
-- 7. Sign up with: admin@test.com / test123456
-- 8. Then run this to make them admin:
--
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'admin@test.com';
--
-- ============================================

-- Verify the accounts were created
SELECT id, email, role, full_name FROM public.profiles 
WHERE email IN ('user@test.com', 'driver@test.com', 'admin@test.com')
ORDER BY role;
