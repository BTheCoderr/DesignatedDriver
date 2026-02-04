-- ============================================
-- DEMO DATA SEED SCRIPT
-- Creates sample trips and damage claim for YC demo
-- Run this AFTER creating demo accounts
-- ============================================

-- Get demo user IDs (update if needed)
DO $$
DECLARE
  demo_user_id UUID;
  demo_driver_scoot_id UUID;
  demo_driver_chase_id UUID;
  demo_vehicle_id UUID;
  solo_trip_id UUID;
  chase_trip_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo_user@test.com';
  SELECT id INTO demo_driver_scoot_id FROM auth.users WHERE email = 'demo_driver_scoot@test.com';
  SELECT id INTO demo_driver_chase_id FROM auth.users WHERE email = 'demo_driver_chase@test.com';
  
  IF demo_user_id IS NULL OR demo_driver_scoot_id IS NULL OR demo_driver_chase_id IS NULL THEN
    RAISE EXCEPTION 'Demo accounts not found. Run create_demo_accounts.sql first.';
  END IF;
  
  -- Get vehicle ID
  SELECT id INTO demo_vehicle_id FROM public.vehicles WHERE user_id = demo_user_id LIMIT 1;
  
  IF demo_vehicle_id IS NULL THEN
    RAISE EXCEPTION 'Demo vehicle not found. Run create_demo_accounts.sql first.';
  END IF;
  
  -- ============================================
  -- CREATE COMPLETED SOLO-SCOOT TRIP
  -- ============================================
  
  INSERT INTO public.trips (
    user_id,
    vehicle_id,
    dispatch_mode,
    status,
    pickup_latitude,
    pickup_longitude,
    pickup_address,
    destination_latitude,
    destination_longitude,
    destination_address,
    primary_driver_id,
    base_fee,
    mileage_fee,
    surge_multiplier,
    total_price,
    estimated_distance_miles,
    estimated_duration_minutes,
    requested_at,
    dispatched_at,
    driver_arrived_at,
    started_at,
    completed_at
  ) VALUES (
    demo_user_id,
    demo_vehicle_id,
    'solo_scoot',
    'completed',
    42.3467, -- Fenway Park, Boston
    -71.0972,
    'Fenway Park, Boston, MA',
    42.3505, -- Back Bay Station
    -71.0750,
    'Back Bay Station, Boston, MA',
    demo_driver_scoot_id,
    25.00,
    15.00,
    1.0,
    40.00,
    2.5,
    12,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 55 minutes',
    NOW() - INTERVAL '1 hour 50 minutes',
    NOW() - INTERVAL '1 hour 45 minutes',
    NOW() - INTERVAL '1 hour 30 minutes'
  )
  RETURNING id INTO solo_trip_id;
  
  -- Create trunk log for solo trip
  INSERT INTO public.trunk_logs (
    trip_id,
    driver_id,
    before_photo_url,
    device_secured,
    driver_attestation,
    notes
  ) VALUES (
    solo_trip_id,
    demo_driver_scoot_id,
    'https://example.com/trunk-photo-solo.jpg', -- Replace with actual photo URL
    true,
    true,
    'Device secured in trunk'
  );
  
  -- Create insurance session for solo trip
  INSERT INTO public.insurance_sessions (
    trip_id,
    driver_id,
    policy_status,
    policy_provider,
    vehicle_make,
    vehicle_model,
    vehicle_year,
    license_plate,
    policy_created_at,
    policy_bound_at,
    policy_ended_at,
    policy_number
  ) VALUES (
    solo_trip_id,
    demo_driver_scoot_id,
    'ended',
    'stub_provider',
    'Toyota',
    'Camry',
    2020,
    'DEMO-123',
    NOW() - INTERVAL '1 hour 45 minutes',
    NOW() - INTERVAL '1 hour 45 minutes',
    NOW() - INTERVAL '1 hour 30 minutes',
    'STUB-SOLO-' || EXTRACT(EPOCH FROM NOW())::bigint
  );
  
  -- Create trip review for solo trip
  INSERT INTO public.trip_reviews (
    trip_id,
    user_id,
    driver_id,
    rating,
    tip_amount,
    review_text
  ) VALUES (
    solo_trip_id,
    demo_user_id,
    demo_driver_scoot_id,
    5,
    5.00,
    'Great service! Driver was professional and my car arrived safely.'
  );
  
  -- ============================================
  -- CREATE COMPLETED CHASE CAR TRIP
  -- ============================================
  
  INSERT INTO public.trips (
    user_id,
    vehicle_id,
    dispatch_mode,
    status,
    pickup_latitude,
    pickup_longitude,
    pickup_address,
    destination_latitude,
    destination_longitude,
    destination_address,
    primary_driver_id,
    chase_driver_id,
    base_fee,
    mileage_fee,
    surge_multiplier,
    total_price,
    estimated_distance_miles,
    estimated_duration_minutes,
    requested_at,
    dispatched_at,
    driver_arrived_at,
    started_at,
    completed_at
  ) VALUES (
    demo_user_id,
    demo_vehicle_id,
    'chase_car',
    'completed',
    42.3370, -- Newton, MA (suburb)
    -71.2092,
    'Newton, MA',
    42.3765, -- Waltham, MA
    -71.2356,
    'Waltham, MA',
    demo_driver_chase_id,
    demo_driver_chase_id, -- In real app, this would be a different driver
    35.00,
    20.00,
    1.0,
    55.00,
    5.0,
    18,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '23 hours 55 minutes',
    NOW() - INTERVAL '23 hours 50 minutes',
    NOW() - INTERVAL '23 hours 45 minutes',
    NOW() - INTERVAL '23 hours 30 minutes'
  )
  RETURNING id INTO chase_trip_id;
  
  -- Create vehicle inspections for chase trip (before and after)
  INSERT INTO public.vehicle_inspections (
    trip_id,
    driver_id,
    inspection_type,
    photo_urls,
    driver_attestation,
    notes
  ) VALUES (
    chase_trip_id,
    demo_driver_chase_id,
    'before',
    ARRAY[
      'https://example.com/inspection-before-1.jpg',
      'https://example.com/inspection-before-2.jpg'
    ],
    true,
    'Vehicle condition documented before trip'
  ),
  (
    chase_trip_id,
    demo_driver_chase_id,
    'after',
    ARRAY[
      'https://example.com/inspection-after-1.jpg',
      'https://example.com/inspection-after-2.jpg'
    ],
    true,
    'Vehicle condition documented after trip'
  );
  
  -- Create insurance session for chase trip
  INSERT INTO public.insurance_sessions (
    trip_id,
    driver_id,
    policy_status,
    policy_provider,
    vehicle_make,
    vehicle_model,
    vehicle_year,
    license_plate,
    policy_created_at,
    policy_bound_at,
    policy_ended_at,
    policy_number
  ) VALUES (
    chase_trip_id,
    demo_driver_chase_id,
    'ended',
    'stub_provider',
    'Toyota',
    'Camry',
    2020,
    'DEMO-123',
    NOW() - INTERVAL '23 hours 45 minutes',
    NOW() - INTERVAL '23 hours 45 minutes',
    NOW() - INTERVAL '23 hours 30 minutes',
    'STUB-CHASE-' || EXTRACT(EPOCH FROM NOW())::bigint
  );
  
  -- Create trip review for chase trip
  INSERT INTO public.trip_reviews (
    trip_id,
    user_id,
    driver_id,
    rating,
    tip_amount,
    review_text
  ) VALUES (
    chase_trip_id,
    demo_user_id,
    demo_driver_chase_id,
    5,
    10.00,
    'Excellent service! Both drivers were professional.'
  );
  
  -- ============================================
  -- CREATE DAMAGE CLAIM (FOR FAILURE STATE DEMO)
  -- ============================================
  
  INSERT INTO public.claims (
    trip_id,
    user_id,
    status,
    damage_location,
    description,
    photo_urls,
    created_at
  ) VALUES (
    chase_trip_id,
    demo_user_id,
    'submitted',
    'Front bumper, driver side',
    'Minor scratch on front bumper noticed after trip completion. Photos attached.',
    ARRAY[
      'https://example.com/damage-photo-1.jpg',
      'https://example.com/damage-photo-2.jpg'
    ],
    NOW() - INTERVAL '23 hours'
  );
  
  RAISE NOTICE '✅ Demo data created successfully!';
  RAISE NOTICE '   Solo-Scoot Trip ID: %', solo_trip_id;
  RAISE NOTICE '   Chase Car Trip ID: %', chase_trip_id;
  RAISE NOTICE '   Damage Claim created for Chase Car trip';
  
END $$;

-- Verification queries
SELECT 
  t.id,
  t.dispatch_mode,
  t.status,
  t.pickup_address,
  t.destination_address,
  p.email as user_email
FROM public.trips t
JOIN public.profiles p ON t.user_id = p.id
WHERE p.email = 'demo_user@test.com'
ORDER BY t.created_at DESC;

SELECT 
  c.id,
  c.status as claim_status,
  c.damage_location,
  t.dispatch_mode,
  t.status as trip_status
FROM public.claims c
JOIN public.trips t ON c.trip_id = t.id
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'demo_user@test.com';
