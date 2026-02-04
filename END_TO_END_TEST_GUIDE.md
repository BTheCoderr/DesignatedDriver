# 🧪 End-to-End Test Guide: Booking Flow

Complete step-by-step guide to test the new booking flow from start to finish.

---

## ✅ Step 1: Verify Files Exist

Make sure these files are in place:

```
✅ lib/dispatcher.ts          (Dispatch logic)
✅ lib/insurance.ts          (Insurance stub)
✅ lib/booking.ts            (Booking orchestrator)
✅ app/(user)/request-rescue.tsx  (UI screen)
```

**Quick Check:**
```bash
ls lib/dispatcher.ts lib/insurance.ts lib/booking.ts
ls "app/(user)/request-rescue.tsx"
```

---

## 🗄️ Step 2: Seed Database (CRITICAL!)

### Option A: Use Demo Account (Easiest)

1. **Create demo user** in Supabase Auth (if not exists):
   - Email: `demo_user@test.com`
   - Password: `Demo123!`
   - ✅ Auto Confirm User

2. **Run SQL script:**
   - Open Supabase SQL Editor
   - Copy/paste contents of `seed_test_booking_data.sql`
   - Click "Run"
   - ✅ Should create drivers and vehicle automatically

### Option B: Use Your Own Account

1. **Get your User ID:**
   - Go to Supabase Dashboard → Authentication → Users
   - Find your account
   - Copy the UUID (looks like: `a1b2c3d4-e5f6-...`)

2. **Run SQL script:**
   - Open `seed_test_booking_data.sql`
   - Find the line: `'YOUR_ACTUAL_USER_ID'`
   - Replace with your actual UUID
   - Run in Supabase SQL Editor

### Verify Data Created:

```sql
-- Check drivers exist
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE role = 'driver';
-- Should see: Scooter Steve, Chase Charlie

-- Check driver gear
SELECT driver_id, gear_type, verification_status 
FROM public.driver_gear;
-- Should see: Scooter Steve with 'folding_scooter' and 'verified'

-- Check vehicles
SELECT v.id, v.make, v.model, v.year, v.license_plate, u.email as owner
FROM public.vehicles v
JOIN auth.users u ON v.user_id = u.id;
-- Should see: Tesla Model 3 for your account
```

---

## 🚀 Step 3: Start the App

### Terminal Commands:

```bash
cd /Users/baheemferrell/Desktop/DesignatedDriver

# Start Expo
npm start
# OR
npx expo start
```

### Choose Platform:

- Press **`w`** → Web browser (easiest for testing)
- Press **`i`** → iOS Simulator (Mac only)
- Press **`a`** → Android Emulator
- Scan QR → Expo Go app on phone

---

## 🔐 Step 4: Log In

### If Using Demo Account:
- Email: `demo_user@test.com`
- Password: `Demo123!`

### If Using Your Account:
- Use your Supabase Auth credentials

---

## 🧪 Step 5: Test the Flow

### Navigate to Request Rescue:

**Option A: From Home Screen**
1. Tap **"RESCUE"** button on home screen

**Option B: Direct Navigation**
- If home screen doesn't have RESCUE button, temporarily modify `app/(user)/index.tsx`:
  ```typescript
  // Add this in useEffect or on mount:
  router.replace('/(user)/request-rescue');
  ```

### Step-by-Step Test:

#### **Step 1: Select Vehicle**
- ✅ Should see "Tesla Model 3" in list
- ✅ Tap to select it
- ✅ Tap **"Next: Destination"**

#### **Step 2: Enter Destination**
- ✅ Pickup shows: "Providence, RI"
- ✅ Enter destination: `123 Main St, Providence, RI`
- ✅ Tap **"Review Quote"**

#### **Step 3: Confirm & Request**
- ✅ Review summary:
  - Vehicle: Tesla Model 3
  - From: Providence, RI
  - To: 123 Main St, Providence, RI
  - Price: $25.00 - $35.00
- ✅ Tap **"Request Now"**
- ✅ Should show loading spinner
- ✅ Should show success alert: "Rescue Requested!"
- ✅ Should navigate to trip tracking screen

---

## ✅ Step 6: Verify Success

### Check Database:

**1. Check Trip Created:**
```sql
SELECT 
  id,
  dispatch_mode,
  status,
  primary_driver_id,
  total_price,
  pickup_address,
  destination_address,
  created_at
FROM trips 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected:**
- `dispatch_mode` = `'solo_scoot'` or `'chase_car'`
- `status` = `'dispatched'` (not `'requested'`)
- `primary_driver_id` = `'00000000-0000-0000-0000-000000000001'` (Scooter Steve)
- `total_price` = calculated price (e.g., 25.00)
- `pickup_address` = "Providence, RI"
- `destination_address` = "123 Main St, Providence, RI"

**2. Check Insurance Session:**
```sql
SELECT 
  id,
  trip_id,
  policy_status,
  vehicle_make,
  vehicle_model,
  vehicle_year,
  license_plate,
  driver_id
FROM insurance_sessions 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected:**
- `policy_status` = `'not_started'`
- `vehicle_make` = `'Tesla'`
- `vehicle_model` = `'Model 3'`
- `vehicle_year` = `2023`
- `license_plate` = `'TEST-123'`
- `driver_id` = primary driver ID

**3. Check Trip Tracking Screen:**
- ✅ Should show trip details
- ✅ Should show dispatch mode
- ✅ Should show driver info
- ✅ Should show price

---

## 🐛 Troubleshooting

### Issue: "No vehicles found"
**Cause:** Vehicle not created or wrong user ID
**Fix:**
```sql
-- Check if vehicle exists
SELECT * FROM vehicles WHERE license_plate = 'TEST-123';

-- If missing, create manually:
INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color)
VALUES ('your-user-id', 'Tesla', 'Model 3', 2023, 'TEST-123', 'Black');
```

### Issue: "No drivers available"
**Cause:** Driver profiles not created or gear not verified
**Fix:**
```sql
-- Check drivers exist
SELECT * FROM profiles WHERE role = 'driver';

-- Check gear is verified
SELECT * FROM driver_gear WHERE verification_status = 'verified';

-- If missing, re-run seed_test_booking_data.sql
```

### Issue: "Vehicle missing required fields"
**Cause:** Vehicle missing make, model, year, or license_plate
**Fix:**
```sql
-- Update vehicle
UPDATE vehicles 
SET make = 'Tesla', model = 'Model 3', year = 2023, license_plate = 'TEST-123'
WHERE license_plate = 'TEST-123';
```

### Issue: Navigation doesn't work
**Cause:** Trip ID not passed correctly
**Fix:**
- Check browser console for errors
- Verify trip was created in database
- Check trip-tracking screen expects `id` param

### Issue: App won't start
**Fix:**
```bash
# Clear cache and restart
npm start -c

# Or reinstall dependencies
rm -rf node_modules
npm install
npm start
```

---

## 📊 Expected Console Output

When booking succeeds, you should see:

```
📍 Starting booking flow for user: [user-id]
✅ Dispatch Successful. Mode: solo_scoot
[STUB] Insurance policy session created for trip [trip-id]
[STUB] Would call: POST /api/insurance/policies
```

---

## ✅ Success Checklist

- [ ] App starts without errors
- [ ] Can log in successfully
- [ ] Can see vehicle list (Tesla Model 3)
- [ ] Can select vehicle
- [ ] Can enter destination
- [ ] Can see summary
- [ ] Can submit booking
- [ ] Trip created in database (`status = 'dispatched'`)
- [ ] Insurance session created (`policy_status = 'not_started'`)
- [ ] Navigates to trip tracking screen
- [ ] Trip tracking shows correct trip details

---

## 🎯 Next Steps After Testing

Once booking works:

1. **Test Driver Flow:**
   - Log in as driver (`driver@test.com`)
   - Accept trip
   - Complete trunk photo
   - Start trip
   - End trip

2. **Test Different Scenarios:**
   - Solo-Scoot dispatch (dense city)
   - Chase Car dispatch (suburban)
   - No drivers available
   - Incomplete vehicle info

3. **Test Edge Cases:**
   - Cancel trip mid-flow
   - Network errors
   - Invalid destinations

---

**Ready to test?** Start with Step 2 (seed database) and work through each step! 🚀
