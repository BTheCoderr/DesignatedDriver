# 🚀 Quick Demo Setup

Fast setup guide for video demo recording.

---

## Step 1: Fix Guest Access ✅

**Status:** ✅ DONE
- Guest users can browse home screen
- Sign in prompt when using features

**Test:** Click "Continue as Guest" → Should see home screen

---

## Step 2: Run Demo Data Scripts

### In Supabase SQL Editor:

**1. Create Demo Accounts:**
```sql
-- Run: create_demo_accounts.sql
-- Creates: demo_user@test.com, demo_driver_scoot@test.com, demo_driver_chase@test.com
```

**2. Seed Demo Data:**
```sql
-- Run: seed_demo_data.sql
-- Creates: Solo-Scoot trip, Chase Car trip, damage claim
```

**3. Verify:**
```sql
-- Check trips exist
SELECT id, dispatch_mode, status 
FROM trips 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo_user@test.com');

-- Check trunk photo
SELECT trip_id, before_photo_url 
FROM trunk_logs 
WHERE trip_id IN (
  SELECT id FROM trips WHERE dispatch_mode = 'solo_scoot'
);

-- Check damage claim
SELECT id, status, description 
FROM claims 
WHERE trip_id IN (
  SELECT id FROM trips WHERE status = 'completed'
);
```

---

## Step 3: Disable Console Logs

**Add to `.env`:**
```
EXPO_PUBLIC_DEMO_MODE=true
```

**Restart Expo:**
```bash
npm start
```

**Note:** Errors will still show (important for debugging), but logs/warnings are hidden.

---

## Step 4: Test Demo Flow

### Test Solo-Scoot Trip:
1. Log in as `demo_user@test.com` / `Demo123!`
2. Open completed trip
3. Verify trunk photo loads instantly ✅
4. Check all details visible ✅

### Test Chase Car Trip:
1. Log in as `demo_user@test.com` / `Demo123!`
2. Open completed trip
3. Verify inspection photos visible ✅
4. Check before/after photos ✅

### Test Damage Claim:
1. Open completed trip
2. Click "File Damage Claim"
3. Verify claim exists ✅
4. Check photos display ✅

---

## Step 5: Verify Guest Access

1. Log out
2. Click "Continue as Guest"
3. Should see home screen ✅
4. Click RESCUE → Should prompt sign in ✅

---

## ✅ GREEN LIGHT CHECKLIST

Before recording:

- [ ] ✅ Guest access works
- [ ] ✅ Demo accounts exist (`demo_user@test.com`, etc.)
- [ ] ✅ Solo-Scoot trip exists and loads
- [ ] ✅ Chase Car trip exists and loads
- [ ] ✅ Trunk photo loads instantly
- [ ] ✅ Damage claim exists
- [ ] ✅ Console logs disabled (`EXPO_PUBLIC_DEMO_MODE=true`)
- [ ] ✅ No errors in browser console
- [ ] ✅ All photos display correctly

---

## 🎬 Ready to Record!

**Demo Accounts:**
- User: `demo_user@test.com` / `Demo123!`
- Driver (Scoot): `demo_driver_scoot@test.com` / `Demo123!`
- Driver (Chase): `demo_driver_chase@test.com` / `Demo123!`

**Demo Flow:**
1. Show home screen (guest or logged in)
2. Open completed Solo-Scoot trip
3. Show trunk photo
4. Open completed Chase Car trip
5. Show inspection photos
6. Show damage claim

**Total Time:** ~2-3 minutes

---

**You're ready!** 🎉
