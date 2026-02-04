# Quick Start: Demo Accounts Setup

## The Problem
The SQL script checks for auth users and fails if they don't exist. You need to create auth users FIRST.

## Solution: Two Simple Steps

### STEP 1: Create Auth Users (2 minutes)

1. **Go to Supabase Dashboard**
   - Open your project
   - Click **"Authentication"** in left sidebar
   - Click **"Users"** tab
   - Click **"Add User"** button (top right)

2. **Create 4 Users** (one at a time):

   **User 1:**
   - Email: `demo_user@test.com`
   - Password: `Demo123!`
   - ✅ **Auto Confirm User** (toggle ON)
   - Click "Create User"

   **User 2:**
   - Email: `demo_driver_scoot@test.com`
   - Password: `Demo123!`
   - ✅ **Auto Confirm User** (toggle ON)
   - Click "Create User"

   **User 3:**
   - Email: `demo_driver_chase@test.com`
   - Password: `Demo123!`
   - ✅ **Auto Confirm User** (toggle ON)
   - Click "Create User"

   **User 4:**
   - Email: `demo_admin@test.com`
   - Password: `Demo123!`
   - ✅ **Auto Confirm User** (toggle ON)
   - Click "Create User"

3. **Verify:** You should see all 4 users in the Users list

---

### STEP 2: Run SQL Scripts

Now go to **SQL Editor** and run:

1. **`create_demo_accounts.sql`** (or `create_demo_accounts_simple.sql` if you want no validation)
   - This creates the profiles linked to your auth users

2. **`seed_demo_data.sql`**
   - This creates sample trips and damage claims

---

## Alternative: Use Simple Script (No Validation)

If you want to skip the validation check, use **`create_demo_accounts_simple.sql`** instead.

This version will:
- ✅ Run even if users don't exist (but won't create anything)
- ✅ Create profiles if users exist
- ❌ Won't give you helpful error messages

---

## Troubleshooting

### "Expected 4 users, found 0"
- **Cause:** Auth users don't exist yet
- **Fix:** Create auth users first (Step 1 above)

### "null value in column id"
- **Cause:** Auth users don't exist yet
- **Fix:** Create auth users first (Step 1 above)

### Script runs but no profiles created
- **Cause:** Auth users exist but emails don't match
- **Fix:** Check email addresses match exactly (case-sensitive)

---

## Quick Checklist

- [ ] Created `demo_user@test.com` in Supabase Auth
- [ ] Created `demo_driver_scoot@test.com` in Supabase Auth
- [ ] Created `demo_driver_chase@test.com` in Supabase Auth
- [ ] Created `demo_admin@test.com` in Supabase Auth
- [ ] Ran `create_demo_accounts.sql` (or simple version)
- [ ] Ran `seed_demo_data.sql`
- [ ] Verified profiles exist: `SELECT email FROM public.profiles WHERE email LIKE 'demo_%';`

---

**That's it!** Once auth users exist, the SQL scripts will work perfectly.
