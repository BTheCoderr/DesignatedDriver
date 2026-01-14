# 🚀 How to Test All Screens - Step by Step

## ⚠️ IMPORTANT: The Buttons Should Work Now!

I just fixed the role-select buttons. They now:
- ✅ Create profiles if they don't exist
- ✅ Update profiles if they do exist
- ✅ Show better error messages
- ✅ Log everything to console for debugging

**Try clicking the buttons again!** If they still don't work, check the browser console (F12) for errors.

---

## 📱 Quick Test Steps

### 1️⃣ Test USER Account (Request Rescue)

```
1. Logout (if logged in)
2. Tap "Sign up"
3. Enter:
   Email: user@test.com
   Password: test123456
   Name: Test User
   Phone: 1234567890
4. Tap "Sign up"
5. If email confirmation: Check email → Click link → Login
6. Select "I need a driver" ← CLICK THIS BUTTON
7. ✅ You should see: User Home with RESCUE button!
```

**What to test:**
- ✅ Tap "RESCUE" → Request Rescue screen
- ✅ Tap "Manage Vehicles" → Add a car
- ✅ Complete a rescue request

---

### 2️⃣ Test DRIVER Account (Accept Jobs)

```
1. Logout from user account
2. Tap "Sign up"
3. Enter:
   Email: driver@test.com (DIFFERENT email!)
   Password: test123456
   Name: Test Driver
   Phone: 1234567891
4. Tap "Sign up"
5. Confirm email (if needed) → Login
6. Select "I'm a driver" ← CLICK THIS BUTTON
7. ✅ You should see: Driver Dashboard!
```

**What to test:**
- ✅ Tap "+ Add Gear for Solo-Scoot" → Upload gear photos
- ✅ View available jobs
- ✅ Accept a job
- ✅ Complete trip flow

---

### 3️⃣ Test ADMIN Account (Verify Gear)

```
1. Logout from driver account
2. Tap "Sign up"
3. Enter:
   Email: admin@test.com (DIFFERENT email!)
   Password: test123456
   Name: Test Admin
   Phone: 1234567892
4. Tap "Sign up"
5. Confirm email (if needed) → Login
6. Select "I need a driver" (temporarily)
7. Go to Supabase Dashboard → SQL Editor
8. Run:
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'admin@test.com';
9. Logout → Login again
10. ✅ You should see: Admin Panel!
```

**What to test:**
- ✅ Tap "Gear Verifications" → Review pending gear
- ✅ Approve or reject driver gear

---

## 🔍 Debugging: If Buttons Don't Work

### Check Browser Console (F12)

1. **Open DevTools**: Press `F12` or `Cmd+Option+I` (Mac)
2. **Go to Console tab**
3. **Click a role button**
4. **Look for messages**:
   - ✅ `"Setting role for user: ..."`
   - ✅ `"Profile exists, updating role..."` or `"Profile does not exist, creating..."`
   - ✅ `"Role set successfully, redirecting..."`
   - ❌ Any red error messages

### Common Errors:

**"Failed to set role: ..."**
- Check Supabase RLS policies
- Make sure you're authenticated
- Check if profile table exists

**"Not authenticated"**
- Try logging out and back in
- Check if session exists in Supabase

**"Profile error: ..."**
- Check Supabase logs
- Verify database connection
- Check RLS policies allow INSERT/UPDATE

---

## 🎯 Test All Screens Checklist

### User Screens ✅
- [ ] User Home (RESCUE button)
- [ ] Request Rescue (multi-step)
- [ ] Vehicles (add/edit)
- [ ] Trip Tracking (real-time)
- [ ] Trip Complete (rating & tip)
- [ ] Damage Claims (photo upload)

### Driver Screens ✅
- [ ] Driver Dashboard (jobs list)
- [ ] Gear Upload (photos)
- [ ] Accept Job (trip details)
- [ ] Arrive (mark arrived)
- [ ] Trunk Photo (Solo-Scoot)
- [ ] Drive (start/end trip)
- [ ] End Trip (earnings)

### Admin Screens ✅
- [ ] Admin Panel (home)
- [ ] Gear Verification (review & approve)

---

## 💡 Pro Tips

1. **Use Multiple Browser Tabs**:
   - Tab 1: User account
   - Tab 2: Driver account
   - Tab 3: Admin account
   - Test real-time features!

2. **Disable Email Confirmation** (for faster testing):
   - Supabase Dashboard → Authentication → Settings
   - Disable "Enable email confirmations"
   - Faster signup/login!

3. **Check Supabase Logs**:
   - Dashboard → Logs → API Logs
   - See all database queries and errors

4. **Use Browser DevTools**:
   - Network tab: See API calls
   - Console tab: See errors and logs
   - Application tab: Check localStorage/session

---

## 🚨 Still Not Working?

1. **Hard Refresh**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Clear Browser Cache**: DevTools → Application → Clear Storage
3. **Restart Expo**: Stop and restart `npm start`
4. **Check .env file**: Make sure Supabase keys are correct
5. **Check Supabase Dashboard**: Verify tables and RLS policies exist

---

## ✅ Success Indicators

**When it works, you'll see:**
- ✅ Button shows loading spinner
- ✅ Console shows: "Setting role for user..."
- ✅ Console shows: "Role set successfully"
- ✅ Screen redirects to User/Driver home
- ✅ No error alerts

**If you see these, it's working!** 🎉

---

Ready to test! Start with the USER account. 🚗
