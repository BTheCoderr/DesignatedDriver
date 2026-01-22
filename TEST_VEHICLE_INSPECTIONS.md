# Vehicle Inspections System - Testing Guide

## Setup Verification

### Step 1: Run Database Schema
1. Open Supabase SQL Editor
2. Copy and paste the entire `vehicle_inspections_schema.sql` file
3. Click "Run" (or press Cmd/Ctrl + Enter)
4. Verify: Should see "Success. No rows returned"

### Step 2: Run Test Script
1. In SQL Editor, open `test_vehicle_inspections.sql`
2. Run the script
3. Check the output for all ✅ green checkmarks
4. If you see ❌ or ⚠️, fix those issues first

### Step 3: Verify Storage Bucket
1. Go to Supabase Dashboard → **Storage**
2. Check if `vehicle-inspections` bucket exists
3. If not, create it with these settings:
   - **Bucket name**: `vehicle-inspections`
   - **Public bucket**: ✅ ON
   - **Restrict file size**: ✅ ON → Set to **5 MB**
   - **Restrict MIME types**: ✅ ON → Add: `image/jpeg`, `image/jpg`, `image/png`

### Step 4: Verify Storage Policies
1. Go to Supabase Dashboard → **Storage** → **Policies**
2. Verify policies include `vehicle-inspections` in the bucket list
3. Or run `storage_policies.sql` in SQL Editor to ensure they're updated

---

## Manual Testing Flow

### Test Scenario: Chase Car Mode Trip with Vehicle Inspections

#### Prerequisites
- ✅ User account created
- ✅ Driver account created (with `role = 'driver'`)
- ✅ User has at least one vehicle added
- ✅ Storage bucket `vehicle-inspections` exists

#### Test Steps

**1. Create a Trip (as User)**
- Login as user
- Go to home screen
- Click "Rescue" button
- Select vehicle
- Enter pickup and destination addresses
- Submit trip request
- **Expected**: Trip created with `dispatch_mode = 'chase_car'` (if in suburbs) or `'solo_scoot'` (if in dense city)

**2. Accept Job (as Driver)**
- Login as driver
- Go to driver dashboard
- See available trip
- Click "Accept Job"
- **Expected**: Navigate to `accept-job` screen, then to `arrive` screen

**3. Arrive at Pickup (as Driver)**
- On `arrive` screen, click "Mark Arrived"
- **Expected Behavior**:
  - If `dispatch_mode = 'chase_car'`: Navigate to `vehicle-inspection?type=before`
  - If `dispatch_mode = 'solo_scoot'`: Navigate to `trunk-photo`

**4. Take Before Photos (Chase Car Mode)**
- On `vehicle-inspection` screen with `type=before`
- Click "Take Photo" or "Choose from Gallery"
- Take at least 1 photo (recommended: front, back, sides)
- Check the attestation checkbox: "I confirm these photos accurately represent the vehicle's condition"
- Click "Submit & Start Trip"
- **Expected**: 
  - Photos upload to `vehicle-inspections` bucket
  - Record created in `vehicle_inspections` table with `inspection_type = 'before'`
  - Navigate to `drive` screen
  - Insurance policy bound (alert shown)

**5. Start Trip (as Driver)**
- On `drive` screen, click "Start Trip"
- **Expected**: 
  - Insurance session status = `'bound'`
  - Trip status = `'in_progress'`
  - Alert: "Insurance Coverage Active ✅"

**6. End Trip (as Driver)**
- On `drive` screen, click "End Trip"
- **Expected**: 
  - Alert: "After Photos Required" (for chase_car mode)
  - Navigate to `vehicle-inspection?type=after`

**7. Take After Photos (Chase Car Mode)**
- On `vehicle-inspection` screen with `type=after`
- Take photos from same angles as before
- Check attestation checkbox
- Click "Submit & Complete Trip"
- **Expected**:
  - Photos upload to storage
  - Record created with `inspection_type = 'after'`
  - Insurance session status = `'ended'`
  - Trip status = `'completed'`
  - Navigate to `end-trip` screen

**8. View Damage Claim (as User)**
- Login as user
- Go to completed trip
- Click "Report Damage" (if available)
- **Expected**: 
  - See "Vehicle Inspection Photos" section
  - See "Before Trip" photos
  - See "After Trip" photos
  - Can compare to identify new damage

---

## Database Verification Queries

### Check if inspection was created
```sql
SELECT 
  vi.*,
  t.dispatch_mode,
  t.status as trip_status
FROM vehicle_inspections vi
JOIN trips t ON t.id = vi.trip_id
WHERE t.id = 'YOUR_TRIP_ID'
ORDER BY vi.created_at;
```

### Check storage bucket files
```sql
SELECT 
  name,
  bucket_id,
  created_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'vehicle-inspections'
ORDER BY created_at DESC
LIMIT 10;
```

### Verify RLS policies are working
```sql
-- As driver (should see their own inspections)
SET ROLE authenticated;
SET request.jwt.claim.sub = 'DRIVER_USER_ID';
SELECT * FROM vehicle_inspections;

-- As user (should see inspections for their trips)
SET request.jwt.claim.sub = 'USER_ID';
SELECT * FROM vehicle_inspections;
```

---

## Common Issues & Fixes

### Issue: "Table vehicle_inspections does not exist"
**Fix**: Run `vehicle_inspections_schema.sql` in SQL Editor

### Issue: "Permission denied for storage.objects"
**Fix**: Run `storage_policies.sql` to update policies

### Issue: "Bucket vehicle-inspections not found"
**Fix**: Create the bucket in Storage dashboard with correct settings

### Issue: Photos not uploading
**Fix**: 
1. Check bucket is public
2. Verify storage policies include `vehicle-inspections`
3. Check browser console for errors
4. Verify file size < 5MB

### Issue: "After photos required" alert not showing
**Fix**: 
1. Check `trip.dispatch_mode = 'chase_car'`
2. Verify `handleEndTrip` in `drive.tsx` checks for after inspection

---

## Success Criteria

✅ All test script checks pass  
✅ Storage bucket exists and is accessible  
✅ Before photos required for chase_car mode  
✅ After photos required before trip completion  
✅ Photos visible in damage claim screen  
✅ RLS policies prevent unauthorized access  

---

## Next Steps After Testing

1. Test with real devices (iOS/Android)
2. Test with multiple photos per inspection
3. Test edge cases (network errors, large files, etc.)
4. Verify photos are properly linked in damage claims
5. Test admin access to view all inspections
