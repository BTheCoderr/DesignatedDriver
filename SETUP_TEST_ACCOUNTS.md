# Setup Test Accounts - Quick Guide

## 🎯 You Need 3 Accounts to Test Everything

1. **User Account** - Request rescues, rate drivers
2. **Driver Account** - Accept jobs, complete trips  
3. **Admin Account** - Verify driver gear

---

## ✅ Method 1: Create Accounts in the App (Easiest)

### Step 1: Create USER Account
1. **Logout** (if logged in)
2. Tap **"Sign up"**
3. Enter:
   - Email: `user@test.com`
   - Password: `test123456`
   - Name: `Test User`
   - Phone: `1234567890`
4. Tap **"Sign up"**
5. If email confirmation is enabled, check your email and click the link
6. After confirming, **login** with `user@test.com` / `test123456`
7. Select **"I need a driver"** ✅
8. You'll see the **User Home** screen with the RESCUE button!

---

### Step 2: Create DRIVER Account
1. **Logout** from user account
2. Tap **"Sign up"**
3. Enter:
   - Email: `driver@test.com` (different email!)
   - Password: `test123456`
   - Name: `Test Driver`
   - Phone: `1234567891`
4. Tap **"Sign up"**
5. Confirm email (if required)
6. **Login** with `driver@test.com` / `test123456`
7. Select **"I'm a driver"** ✅
8. You'll see the **Driver Dashboard**!

---

### Step 3: Create ADMIN Account
1. **Logout** from driver account
2. Tap **"Sign up"**
3. Enter:
   - Email: `admin@test.com` (different email!)
   - Password: `test123456`
   - Name: `Test Admin`
   - Phone: `1234567892`
4. Tap **"Sign up"**
5. Confirm email (if required)
6. **Login** with `admin@test.com` / `test123456`
7. Select **"I need a driver"** (temporarily)
8. **Then** go to Supabase Dashboard:
   - Go to **SQL Editor**
   - Run this query:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'admin@test.com';
   ```
9. **Logout and login again** → You'll see the **Admin Panel**! ✅

---

## ✅ Method 2: Create in Supabase Dashboard (Advanced)

### Step 1: Create Auth Users
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Create 3 users:
   - `user@test.com` / `test123456`
   - `driver@test.com` / `test123456`
   - `admin@test.com` / `test123456`
4. **Confirm their emails** (or disable email confirmation)

### Step 2: Create Profiles
1. Go to **SQL Editor**
2. Run `create_test_accounts.sql` (see file in project)
3. Or manually run:
   ```sql
   -- Get user IDs first
   SELECT id, email FROM auth.users 
   WHERE email IN ('user@test.com', 'driver@test.com', 'admin@test.com');
   
   -- Then create profiles (replace USER_ID with actual IDs)
   INSERT INTO public.profiles (id, email, phone, full_name, role)
   VALUES 
     ('USER_ID_1', 'user@test.com', '+1234567890', 'Test User', 'user'),
     ('USER_ID_2', 'driver@test.com', '+1234567891', 'Test Driver', 'driver'),
     ('USER_ID_3', 'admin@test.com', '+1234567892', 'Test Admin', 'admin')
   ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
   ```

---

## 🔧 Troubleshooting

### "Buttons don't do anything"
- **Check browser console** (F12) for errors
- Make sure you're **logged in** (check if session exists)
- Try **refreshing** the page
- Check if **profile exists** in Supabase

### "Failed to set role"
- Profile might not exist yet
- Check Supabase **RLS policies** allow updates
- Make sure you're **authenticated**
- Check browser console for detailed errors

### "Can't login after signup"
- **Email confirmation** might be required
- Check your email inbox
- Or disable email confirmation in Supabase settings

### "Wrong role after login"
- Check `public.profiles` table in Supabase
- Verify the `role` column has correct value
- Try logging out and back in

---

## 📋 Quick Test Checklist

After creating accounts:

- [ ] **User Account**: Login → See RESCUE button → Can request rescue
- [ ] **Driver Account**: Login → See dashboard → Can upload gear
- [ ] **Admin Account**: Login → See admin panel → Can verify gear

---

## 🚀 Quick Start (Right Now)

1. **Logout** (if logged in)
2. **Sign up** with: `user@test.com` / `test123456`
3. **Select "I need a driver"**
4. **See the RESCUE button!** ✅

Then repeat for driver and admin accounts.

---

## 💡 Pro Tips

1. **Use different browsers/tabs** to test multiple accounts at once
2. **Disable email confirmation** for faster testing (Supabase Settings → Auth)
3. **Check Supabase logs** if something doesn't work
4. **Use browser DevTools** (F12) to see console errors

---

Ready to test! Start by creating the user account. 🚗
