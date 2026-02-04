# Setup Demo Accounts - Step by Step Guide

## The Problem

The `create_demo_accounts.sql` script expects auth users to already exist. If you run it before creating the auth users, you'll get errors like:
- `null value in column "id" violates not-null constraint`
- `Demo accounts not found`

## Solution: Two-Step Process

### STEP 1: Create Auth Users (Do This First!)

You have two options:

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"** (or **"Invite User"**)
4. Create each user with these details:

   **User 1:**
   - Email: `demo_user@test.com`
   - Password: `Demo123!` (or your choice)
   - Auto Confirm User: ✅ ON

   **User 2:**
   - Email: `demo_driver_scoot@test.com`
   - Password: `Demo123!`
   - Auto Confirm User: ✅ ON

   **User 3:**
   - Email: `demo_driver_chase@test.com`
   - Password: `Demo123!`
   - Auto Confirm User: ✅ ON

   **User 4:**
   - Email: `demo_admin@test.com`
   - Password: `Demo123!`
   - Auto Confirm User: ✅ ON

5. **Verify:** Go to Authentication → Users and confirm all 4 users exist

#### Option B: Via App Signup Flow

1. Open your app
2. Use the signup screen to create each account:
   - `demo_user@test.com`
   - `demo_driver_scoot@test.com`
   - `demo_driver_chase@test.com`
   - `demo_admin@test.com`
3. Complete signup for each (select appropriate role)

---

### STEP 2: Run SQL Scripts

Once auth users exist, run these scripts **in order**:

#### 1. Create Profiles
```sql
-- Run in Supabase SQL Editor
-- File: create_demo_accounts.sql
```
This creates the `profiles` records linked to your auth users.

#### 2. Seed Demo Data
```sql
-- Run in Supabase SQL Editor
-- File: seed_demo_data.sql
```
This creates sample trips and damage claims.

---

## Verification

After running both scripts, verify everything worked:

```sql
-- Check profiles created
SELECT email, full_name, role 
FROM public.profiles 
WHERE email LIKE 'demo_%';

-- Should return 4 rows:
-- demo_user@test.com | Demo User | user
-- demo_driver_scoot@test.com | Demo Driver (Scoot) | driver
-- demo_driver_chase@test.com | Demo Driver (Chase) | driver
-- demo_admin@test.com | Demo Admin | admin
```

```sql
-- Check demo trips created
SELECT 
  t.id,
  t.dispatch_mode,
  t.status,
  p.email as user_email
FROM public.trips t
JOIN public.profiles p ON t.user_id = p.id
WHERE p.email = 'demo_user@test.com';

-- Should return 2 trips (one solo_scoot, one chase_car)
```

---

## Troubleshooting

### Error: "Demo accounts not found"
- **Cause:** Auth users don't exist yet
- **Fix:** Create auth users first (Step 1)

### Error: "null value in column id"
- **Cause:** Auth users don't exist yet
- **Fix:** Create auth users first (Step 1)

### Error: "violates foreign key constraint"
- **Cause:** Trying to reference non-existent user
- **Fix:** Make sure auth users exist before running scripts

### Script runs but no data appears
- **Cause:** Script ran but users weren't found
- **Fix:** Verify auth users exist: `SELECT email FROM auth.users WHERE email LIKE 'demo_%';`

---

## Quick Reference

**Order of Operations:**
1. ✅ Create auth users (Supabase Dashboard or app signup)
2. ✅ Run `create_demo_accounts.sql`
3. ✅ Run `seed_demo_data.sql`
4. ✅ Verify with queries above

**Demo Account Emails:**
- `demo_user@test.com`
- `demo_driver_scoot@test.com`
- `demo_driver_chase@test.com`
- `demo_admin@test.com`

**Default Password (if using Supabase Dashboard):**
- `Demo123!` (or your choice)

---

**Last Updated:** January 28, 2026
