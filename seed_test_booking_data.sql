-- ============================================
-- SEED TEST DATA FOR BOOKING FLOW
-- ============================================
-- Uses EXISTING demo users from your Supabase Auth
-- These users should already exist:
--   - demo_driver_scoot@test.com (Scooter Steve)
--   - demo_driver_chase@test.com (Chase Charlie)
--   - demo_user@test.com (Your test user)
-- ============================================

-- Step 1: Create driver profiles using EXISTING demo user emails
-- This will find the auth users by email and create profiles for them
DO $$
DECLARE
  scooter_driver_id UUID;
  chase_driver_id UUID;
BEGIN
  -- Get Scooter Driver ID from existing auth user
  SELECT id INTO scooter_driver_id 
  FROM auth.users 
  WHERE email = 'demo_driver_scoot@test.com';
  
  -- Get Chase Driver ID from existing auth user
  SELECT id INTO chase_driver_id 
  FROM auth.users 
  WHERE email = 'demo_driver_chase@test.com';
  
  -- Create profile for Scooter Driver if auth user exists
  IF scooter_driver_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, phone, full_name, role)
    VALUES (scooter_driver_id, 'demo_driver_scoot@test.com', '555-0100', 'Scooter Steve', 'driver')
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email, phone = EXCLUDED.phone, full_name = EXCLUDED.full_name, role = EXCLUDED.role;
    
    RAISE NOTICE '✅ Created profile for Scooter Steve (demo_driver_scoot@test.com)';
  ELSE
    RAISE WARNING '⚠️  Auth user demo_driver_scoot@test.com not found';
  END IF;
  
  -- Create profile for Chase Driver if auth user exists
  IF chase_driver_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, phone, full_name, role)
    VALUES (chase_driver_id, 'demo_driver_chase@test.com', '555-0101', 'Chase Charlie', 'driver')
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email, phone = EXCLUDED.phone, full_name = EXCLUDED.full_name, role = EXCLUDED.role;
    
    RAISE NOTICE '✅ Created profile for Chase Charlie (demo_driver_chase@test.com)';
  ELSE
    RAISE WARNING '⚠️  Auth user demo_driver_chase@test.com not found';
  END IF;
END $$;

-- Step 2: Give Scooter Steve verified scooter gear
-- This makes them eligible for Solo-Scoot dispatch
DO $$
DECLARE
  scooter_driver_id UUID;
  existing_gear_id UUID;
BEGIN
  SELECT id INTO scooter_driver_id FROM auth.users WHERE email = 'demo_driver_scoot@test.com';
  
  IF scooter_driver_id IS NOT NULL THEN
    -- Check if gear already exists for this driver
    SELECT id INTO existing_gear_id 
    FROM public.driver_gear 
    WHERE driver_id = scooter_driver_id
    LIMIT 1;
    
    IF existing_gear_id IS NOT NULL THEN
      -- Update existing gear
      UPDATE public.driver_gear
      SET gear_type = 'folding_scooter',
          verification_status = 'verified',
          photo_urls = ARRAY[]::text[],
          updated_at = NOW()
      WHERE driver_id = scooter_driver_id;
      
      RAISE NOTICE '✅ Updated scooter gear for Scooter Steve';
    ELSE
      -- Insert new gear
      INSERT INTO public.driver_gear (driver_id, gear_type, verification_status, photo_urls)
      VALUES (scooter_driver_id, 'folding_scooter', 'verified', ARRAY[]::text[]);
      
      RAISE NOTICE '✅ Added verified scooter gear for Scooter Steve';
    END IF;
  END IF;
END $$;

-- Step 3: Create vehicle for demo_user@test.com
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

-- Also create vehicle for bferrell514@gmail.com (your personal account)
INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color)
SELECT 
  id as user_id,
  'Tesla' as make,
  'Model 3' as model,
  2023 as year,
  'TEST-123' as license_plate,
  'Black' as color
FROM auth.users
WHERE email = 'bferrell514@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check drivers were created:
SELECT p.id, p.email, p.full_name, p.role, u.email as auth_email
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'driver'
ORDER BY p.email;

-- Check driver gear:
SELECT dg.driver_id, p.email, dg.gear_type, dg.verification_status 
FROM public.driver_gear dg
JOIN public.profiles p ON dg.driver_id = p.id;

-- Check vehicles:
SELECT v.id, v.make, v.model, v.year, v.license_plate, u.email as owner_email
FROM public.vehicles v
JOIN auth.users u ON v.user_id = u.id
ORDER BY u.email;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If profiles weren't created, check if auth users exist:
-- SELECT id, email FROM auth.users WHERE email IN ('demo_driver_scoot@test.com', 'demo_driver_chase@test.com');

-- If vehicle wasn't created, check your user ID:
-- SELECT id, email FROM auth.users WHERE email IN ('demo_user@test.com', 'bferrell514@gmail.com');

-- To manually create a vehicle for a specific user:
-- INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
--   'Tesla', 'Model 3', 2023, 'TEST-123', 'Black'
-- );

-- To clean up test data:
-- DELETE FROM public.vehicles WHERE license_plate = 'TEST-123';
-- DELETE FROM public.driver_gear WHERE driver_id IN (
--   SELECT id FROM auth.users WHERE email IN ('demo_driver_scoot@test.com', 'demo_driver_chase@test.com')
-- );
-- DELETE FROM public.profiles WHERE email IN ('demo_driver_scoot@test.com', 'demo_driver_chase@test.com');
