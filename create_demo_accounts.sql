-- ============================================
-- DEMO ACCOUNTS FOR YC DEMO
-- Create these accounts once and never touch them again
-- ============================================

-- IMPORTANT: You must create auth users FIRST before running this script!
-- 
-- Option 1: Create via Supabase Dashboard
--   1. Go to Authentication → Users → Add User
--   2. Create each user with these emails:
--      - demo_user@test.com
--      - demo_driver_scoot@test.com
--      - demo_driver_chase@test.com
--      - demo_admin@test.com
--   3. Set password for each (use same password for all, e.g., "Demo123!")
--   4. Then run this script
--
-- Option 2: Create via app signup flow
--   1. Use your app's signup screen
--   2. Sign up with each email above (you can use fake emails - they just need to be unique)
--   3. Then run this script

-- ============================================
-- STEP 1: Check Auth Users Exist (Informational)
-- ============================================

DO $$
DECLARE
  demo_user_count INTEGER;
  missing_users TEXT[];
BEGIN
  SELECT COUNT(*) INTO demo_user_count
  FROM auth.users
  WHERE email IN (
    'demo_user@test.com',
    'demo_driver_scoot@test.com',
    'demo_driver_chase@test.com',
    'demo_admin@test.com'
  );
  
  -- Check which users are missing
  SELECT ARRAY_AGG(email) INTO missing_users
  FROM (VALUES 
    ('demo_user@test.com'),
    ('demo_driver_scoot@test.com'),
    ('demo_driver_chase@test.com'),
    ('demo_admin@test.com')
  ) AS required(email)
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE auth.users.email = required.email
  );
  
  IF demo_user_count < 4 THEN
    RAISE WARNING '⚠️  Only % out of 4 demo users found in auth.users.', demo_user_count;
    RAISE WARNING 'Missing users: %', array_to_string(missing_users, ', ');
    RAISE WARNING '📝 INSTRUCTIONS:';
    RAISE WARNING '   1. Go to Supabase Dashboard → Authentication → Users';
    RAISE WARNING '   2. Click "Add User" for each missing email above';
    RAISE WARNING '   3. Set password (e.g., Demo123!) and enable "Auto Confirm User"';
    RAISE WARNING '   4. Then run this script again';
    RAISE EXCEPTION 'Cannot proceed: Demo auth users must be created first. See warnings above.';
  ELSE
    RAISE NOTICE '✅ All 4 demo users found in auth.users. Proceeding...';
  END IF;
END $$;

-- ============================================
-- STEP 2: Create Profiles (after auth accounts exist)
-- ============================================

-- Demo User (regular customer)
INSERT INTO public.profiles (id, email, phone, full_name, role)
SELECT 
  id,
  'demo_user@test.com',
  '+14015551234',
  'Demo User',
  'user'
FROM auth.users
WHERE email = 'demo_user@test.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Demo Driver (Solo-Scoot)
INSERT INTO public.profiles (id, email, phone, full_name, role)
SELECT 
  id,
  'demo_driver_scoot@test.com',
  '+14015551235',
  'Demo Driver (Scoot)',
  'driver'
FROM auth.users
WHERE email = 'demo_driver_scoot@test.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Demo Driver (Chase Car)
INSERT INTO public.profiles (id, email, phone, full_name, role)
SELECT 
  id,
  'demo_driver_chase@test.com',
  '+14015551236',
  'Demo Driver (Chase)',
  'driver'
FROM auth.users
WHERE email = 'demo_driver_chase@test.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Demo Admin
INSERT INTO public.profiles (id, email, phone, full_name, role)
SELECT 
  id,
  'demo_admin@test.com',
  '+14015551237',
  'Demo Admin',
  'admin'
FROM auth.users
WHERE email = 'demo_admin@test.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ============================================
-- STEP 2: Add Vehicle for Demo User
-- ============================================

INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'demo_user@test.com'),
  'Toyota',
  'Camry',
  2020,
  'DEMO-123',
  'Silver'
WHERE NOT EXISTS (
  SELECT 1 FROM public.vehicles 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo_user@test.com')
  AND license_plate = 'DEMO-123'
);

-- ============================================
-- STEP 3: Verify Driver Gear for Solo-Scoot Driver
-- ============================================

INSERT INTO public.driver_gear (driver_id, gear_type, verification_status, device_model, photo_urls)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'demo_driver_scoot@test.com'),
  'folding_scooter',
  'verified',
  'Xiaomi Mi Electric Scooter',
  ARRAY['https://example.com/scooter-photo.jpg'] -- Replace with actual photo URL
WHERE NOT EXISTS (
  SELECT 1 FROM public.driver_gear 
  WHERE driver_id = (SELECT id FROM auth.users WHERE email = 'demo_driver_scoot@test.com')
  AND verification_status = 'verified'
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check profiles created
SELECT email, full_name, role FROM public.profiles WHERE email LIKE 'demo_%';

-- Check vehicle created
SELECT v.make, v.model, v.license_plate, p.email 
FROM public.vehicles v
JOIN public.profiles p ON v.user_id = p.id
WHERE p.email = 'demo_user@test.com';

-- Check driver gear verified
SELECT dg.gear_type, dg.verification_status, p.email
FROM public.driver_gear dg
JOIN public.profiles p ON dg.driver_id = p.id
WHERE p.email = 'demo_driver_scoot@test.com';
