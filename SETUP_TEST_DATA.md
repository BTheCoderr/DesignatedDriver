# 🔧 Setup Test Data - Step by Step

## ⚠️ Important: Foreign Key Constraint

The `profiles` table requires that the `id` must exist in `auth.users` first. You **must create auth users before** running the seed script.

---

## ✅ Step-by-Step Setup

### Step 1: Create Auth Users (REQUIRED FIRST!)

**Go to Supabase Dashboard → Authentication → Users → Add User**

Create these 3 users (one at a time):

#### User 1: Test Driver (Scooter Steve)
- **Email:** `driver@test.com`
- **Password:** `Test123!`
- ✅ **Auto Confirm User** (toggle ON)
- Click "Create User"
- **Copy the UUID** (you'll see it in the user list)

#### User 2: Test Driver 2 (Chase Charlie)
- **Email:** `driver2@test.com`
- **Password:** `Test123!`
- ✅ **Auto Confirm User** (toggle ON)
- Click "Create User"
- **Copy the UUID** (optional, script will find it)

#### User 3: Demo User (if not exists)
- **Email:** `demo_user@test.com`
- **Password:** `Demo123!`
- ✅ **Auto Confirm User** (toggle ON)
- Click "Create User"

**Verify:** You should see all 3 users in the Users list.

---

### Step 2: Run Seed Script

1. **Open Supabase SQL Editor**
2. **Copy/paste** contents of `seed_test_booking_data.sql`
3. **Click "Run"**

The script will:
- ✅ Create profiles for `driver@test.com` and `driver2@test.com`
- ✅ Add verified scooter gear to `driver@test.com`
- ✅ Create Tesla Model 3 vehicle for `demo_user@test.com`

---

### Step 3: Verify Data Created

Run these queries in SQL Editor:

```sql
-- Check drivers exist
SELECT p.id, p.email, p.full_name, p.role 
FROM public.profiles p
WHERE p.role = 'driver';

-- Should see:
-- driver@test.com | Scooter Steve | driver
-- driver2@test.com | Chase Charlie | driver

-- Check driver gear
SELECT dg.driver_id, p.email, dg.gear_type, dg.verification_status 
FROM public.driver_gear dg
JOIN public.profiles p ON dg.driver_id = p.id;

-- Should see:
-- driver@test.com | folding_scooter | verified

-- Check vehicles
SELECT v.id, v.make, v.model, v.year, v.license_plate, u.email as owner
FROM public.vehicles v
JOIN auth.users u ON v.user_id = u.id;

-- Should see:
-- Tesla | Model 3 | 2023 | TEST-123 | demo_user@test.com
```

---

## 🐛 Troubleshooting

### Error: "Key (id)=... is not present in table users"

**Cause:** You tried to run the seed script before creating auth users.

**Fix:**
1. Go to Authentication → Users
2. Create the auth users first (see Step 1)
3. Re-run the seed script

### Error: "Auth user driver@test.com not found"

**Cause:** The auth user doesn't exist yet.

**Fix:**
1. Create `driver@test.com` in Authentication → Users
2. Make sure email matches exactly (case-sensitive)
3. Re-run the seed script

### Vehicle Not Created

**Cause:** `demo_user@test.com` doesn't exist or you're using a different email.

**Fix:**
1. Check if your test user exists:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   ```

2. Update the seed script to use your email:
   ```sql
   -- Replace 'demo_user@test.com' with your email in the vehicle INSERT
   ```

---

## 🎯 Quick Alternative: Use Existing Users

If you already have auth users, you can manually create the data:

```sql
-- 1. Create profile for existing driver (replace UUID with actual auth user ID)
INSERT INTO public.profiles (id, email, phone, full_name, role)
VALUES (
  'your-driver-auth-id-here',
  'driver@test.com',
  '555-0100',
  'Scooter Steve',
  'driver'
);

-- 2. Add gear
INSERT INTO public.driver_gear (driver_id, gear_type, verification_status)
VALUES (
  'your-driver-auth-id-here',
  'folding_scooter',
  'verified'
);

-- 3. Create vehicle for your user
INSERT INTO public.vehicles (user_id, make, model, year, license_plate, color)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'Tesla',
  'Model 3',
  2023,
  'TEST-123',
  'Black'
);
```

---

## ✅ Success Checklist

- [ ] Created `driver@test.com` in Auth
- [ ] Created `driver2@test.com` in Auth
- [ ] Created `demo_user@test.com` in Auth (or your test user)
- [ ] Ran `seed_test_booking_data.sql`
- [ ] Verified drivers exist in profiles
- [ ] Verified driver gear is verified
- [ ] Verified vehicle exists for your user

**Once all checked, you're ready to test!** 🚀
