-- ============================================
-- VEHICLE INSPECTIONS SYSTEM TEST SCRIPT
-- Run this after setting up vehicle_inspections table and storage
-- ============================================

-- Test 1: Verify table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicle_inspections'
  ) THEN
    RAISE NOTICE '✅ Table vehicle_inspections exists';
  ELSE
    RAISE EXCEPTION '❌ Table vehicle_inspections does not exist. Run vehicle_inspections_schema.sql first!';
  END IF;
END $$;

-- Test 2: Verify columns
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicle_inspections'
    AND column_name = 'inspection_type'
  ) THEN
    RAISE NOTICE '✅ Column inspection_type exists';
  ELSE
    RAISE EXCEPTION '❌ Column inspection_type missing';
  END IF;
END $$;

-- Test 3: Verify indexes
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'vehicle_inspections'
    AND indexname = 'idx_vehicle_inspections_trip_id'
  ) THEN
    RAISE NOTICE '✅ Index idx_vehicle_inspections_trip_id exists';
  ELSE
    RAISE WARNING '⚠️ Index idx_vehicle_inspections_trip_id missing';
  END IF;
END $$;

-- Test 4: Verify RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'vehicle_inspections'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS is enabled on vehicle_inspections';
  ELSE
    RAISE EXCEPTION '❌ RLS is NOT enabled on vehicle_inspections';
  END IF;
END $$;

-- Test 5: Verify RLS policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'vehicle_inspections';
  
  IF policy_count >= 4 THEN
    RAISE NOTICE '✅ Found % RLS policies on vehicle_inspections', policy_count;
  ELSE
    RAISE WARNING '⚠️ Only found % RLS policies (expected at least 4)', policy_count;
  END IF;
END $$;

-- Test 6: List all policies
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  qual as "Using Expression"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'vehicle_inspections'
ORDER BY policyname;

-- Test 7: Verify storage bucket policies include vehicle-inspections
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (
    policyname LIKE '%vehicle%inspections%' 
    OR definition LIKE '%vehicle-inspections%'
  );
  
  IF policy_count > 0 THEN
    RAISE NOTICE '✅ Found % storage policies for vehicle-inspections', policy_count;
  ELSE
    RAISE WARNING '⚠️ No storage policies found for vehicle-inspections bucket';
  END IF;
END $$;

-- Test 8: Check for storage bucket (if accessible)
SELECT 
  name as "Bucket Name",
  public as "Public",
  file_size_limit as "File Size Limit",
  allowed_mime_types as "Allowed MIME Types"
FROM storage.buckets
WHERE name = 'vehicle-inspections';

-- Summary
SELECT 
  'Setup Verification Complete' as "Status",
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicle_inspections')
    THEN '✅ Table exists'
    ELSE '❌ Table missing'
  END as "Table",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vehicle_inspections' AND rowsecurity = true)
    THEN '✅ RLS enabled'
    ELSE '❌ RLS disabled'
  END as "RLS",
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicle_inspections')::text || ' policies' as "Policies";
