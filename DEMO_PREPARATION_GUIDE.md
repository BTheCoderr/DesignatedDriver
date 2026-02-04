# 🎬 Video Demo Preparation Guide

Complete checklist for preparing your Designated Driver app for video demo recording.

---

## ✅ Step 1: Fix Guest Access (DONE)

**Status:** ✅ Fixed
- Guest users can now browse the home screen
- Sign in prompt appears when trying to use features
- "Continue as Guest" button works correctly

**Test:**
1. Click "Continue as Guest" on login screen
2. Should see home screen with "Sign In" button
3. Click RESCUE → Should prompt to sign in

---

## ✅ Step 2: Seed Demo Trips

### Option A: Use Existing SQL Script (Recommended)

**File:** `seed_demo_data.sql`

**What it creates:**
- ✅ Completed Solo-Scoot trip (NYC/Boston)
- ✅ Completed Chase Car trip (suburban)
- ✅ Trunk photo for Solo-Scoot trip
- ✅ Vehicle inspection photos (before/after) for Chase Car
- ✅ Insurance sessions (bound + ended)
- ✅ Trip reviews with ratings and tips
- ✅ One damage claim

**How to run:**
```sql
-- In Supabase SQL Editor:
-- 1. Make sure demo accounts exist (run create_demo_accounts.sql first)
-- 2. Run seed_demo_data.sql
-- 3. Verify trips exist
```

**Verify:**
```sql
-- Check trips exist
SELECT id, dispatch_mode, status, pickup_address, destination_address 
FROM trips 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo_user@test.com')
ORDER BY created_at DESC;

-- Check trunk photo exists
SELECT trip_id, before_photo_url 
FROM trunk_logs 
WHERE trip_id IN (
  SELECT id FROM trips WHERE dispatch_mode = 'solo_scoot' AND status = 'completed'
);

-- Check damage claim exists
SELECT id, trip_id, status, description 
FROM claims 
WHERE trip_id IN (
  SELECT id FROM trips WHERE status = 'completed'
);
```

### Option B: Create Manually (For Testing)

**Solo-Scoot Trip:**
1. Log in as `demo_user@test.com`
2. Request Rescue → Use dense city address (NYC/Boston)
3. Log in as `demo_driver_scoot@test.com`
4. Accept → Arrive → Upload trunk photo → Start → End
5. Rate driver

**Chase Car Trip:**
1. Log in as `demo_user@test.com`
2. Request Rescue → Use suburban address
3. Log in as `demo_driver_chase@test.com`
4. Accept → Arrive → Upload before inspection → Start → End → Upload after inspection
5. Rate driver

---

## ✅ Step 3: Ensure Trunk Photo Exists

**Critical:** Trunk photo must load instantly during demo.

**Check:**
1. Log in as `demo_user@test.com`
2. Open completed Solo-Scoot trip
3. Verify trunk photo displays immediately
4. Check photo URL is valid (Cloudinary or Supabase)
5. Verify timestamp is visible

**If broken:**
- Check `trunk_logs` table for the trip
- Verify photo URL is accessible
- Re-upload if needed (but test 3x first!)

**Demo Rule:** Only upload live if tested 3x without failure.

---

## ✅ Step 4: Create Damage Claim

**File:** `seed_demo_data.sql` includes this, but verify:

**Check:**
```sql
SELECT c.id, c.trip_id, c.status, c.description, c.photo_urls
FROM claims c
JOIN trips t ON c.trip_id = t.id
WHERE t.user_id = (SELECT id FROM auth.users WHERE email = 'demo_user@test.com')
LIMIT 1;
```

**If missing, create manually:**
1. Log in as `demo_user@test.com`
2. Open completed trip
3. File damage claim
4. Upload 1-2 generic photos
5. Description: "Minor scuff found after trip"
6. Leave status as `submitted`

**Why this matters:**
- Answers "What about liability?" without defending
- Shows you've thought through edge cases
- Huge credibility boost for YC

---

## ✅ Step 5: Disable Console Logs

**For clean demo recording:**

### Option A: Environment Variable (Recommended)

Add to `.env`:
```
EXPO_PUBLIC_DEMO_MODE=true
```

Then update logging functions to check this flag.

### Option B: Comment Out Logs (Quick Fix)

**Files to check:**
- `app/(user)/request-rescue-simple.tsx`
- `app/(user)/request-rescue.tsx`
- `app/(driver)/*.tsx`
- `lib/analytics.ts`

**Search for:**
```typescript
console.log
console.warn
console.error
```

**Replace with:**
```typescript
// console.log (disabled for demo)
if (process.env.EXPO_PUBLIC_DEMO_MODE !== 'true') {
  console.log(...);
}
```

**Or use a logger utility:**
```typescript
// lib/logger.ts
export const log = (...args: any[]) => {
  if (process.env.EXPO_PUBLIC_DEMO_MODE !== 'true') {
    console.log(...args);
  }
};
```

---

## ✅ Step 6: Test Demo Flow

### Golden Path Test:

**Solo-Scoot Demo:**
1. ✅ Log in as `demo_user@test.com`
2. ✅ Open completed Solo-Scoot trip
3. ✅ Verify trunk photo loads instantly
4. ✅ Check all details visible
5. ✅ Navigate smoothly

**Chase Car Demo:**
1. ✅ Log in as `demo_user@test.com`
2. ✅ Open completed Chase Car trip
3. ✅ Verify inspection photos visible
4. ✅ Check before/after photos
5. ✅ Navigate smoothly

**Damage Claim Demo:**
1. ✅ Open completed trip
2. ✅ Click "File Damage Claim"
3. ✅ Verify claim exists
4. ✅ Check photos display
5. ✅ Verify status visible

---

## ✅ Step 7: Demo Pacing Guide

**Intentional pauses (2-3 seconds):**
- RESCUE button (home screen)
- Dispatch mode selection
- Trunk photo screen
- "Start Trip" button
- Damage claim view
- Trip completion screen

**Why pause:**
- Shows confidence
- Allows viewer to process
- Highlights key features
- Prevents rushing

**What NOT to do:**
- Don't rush through screens
- Don't apologize for pauses
- Don't explain every detail
- Don't show errors (if any occur, skip)

---

## 🎯 GREEN LIGHT CHECKLIST

Before recording, verify:

- [ ] ✅ Guest access works
- [ ] ✅ Solo-Scoot completed trip exists
- [ ] ✅ Chase Car completed trip exists
- [ ] ✅ Trunk photo loads instantly
- [ ] ✅ At least one damage claim exists
- [ ] ✅ No console noise/errors
- [ ] ✅ All photos display correctly
- [ ] ✅ Navigation is smooth
- [ ] ✅ Demo accounts work (`demo_user@test.com`, etc.)

---

## 📹 Recording Tips

### Setup:
1. **Clean browser** - Close unnecessary tabs
2. **Full screen** - Use full browser window
3. **Good lighting** - If showing face
4. **Quiet space** - Minimize background noise
5. **Stable connection** - Use wired internet if possible

### During Recording:
1. **Speak clearly** - Explain what you're showing
2. **Pause intentionally** - Let features sink in
3. **Show trust moments** - Trunk photo, insurance, etc.
4. **Highlight key features** - Dispatch intelligence, damage claims
5. **End strong** - Close with value proposition

### Post-Recording:
1. **Trim dead air** - Remove long pauses
2. **Add captions** - Highlight key points
3. **Speed up transitions** - If needed
4. **Add intro/outro** - Branding
5. **Export high quality** - 1080p minimum

---

## 🚨 Troubleshooting

### Trunk Photo Not Loading
- Check URL in database
- Verify Cloudinary/Supabase access
- Test in incognito mode
- Re-upload if needed

### Console Errors
- Check browser console
- Fix errors before recording
- Use `EXPO_PUBLIC_DEMO_MODE=true` to disable logs

### Demo Accounts Not Working
- Verify accounts exist in Supabase Auth
- Check profiles exist in database
- Run `create_demo_accounts.sql` again

### Navigation Issues
- Clear browser cache
- Restart Expo server
- Check route paths

---

## 📝 Demo Script Template

**Opening (10 seconds):**
> "This is Designated Driver. One tap sends a vetted driver to drive your car home."

**Show Home Screen (5 seconds):**
> "Here's the home screen. One tap to request a rescue."

**Show Completed Trip (30 seconds):**
> "This is a completed Solo-Scoot trip. Notice the trunk photo - this protects the customer's vehicle."

**Show Damage Claim (20 seconds):**
> "If anything happens, users can file a damage claim with photos and timestamps."

**Closing (10 seconds):**
> "Uber moves people. We return cars."

**Total:** ~75 seconds (perfect for YC)

---

## ✅ Final Checklist

Before hitting record:

- [ ] All demo trips exist
- [ ] Photos load instantly
- [ ] No console errors
- [ ] Guest access works
- [ ] Demo accounts ready
- [ ] Browser clean
- [ ] Recording software ready
- [ ] Script rehearsed

**You're ready to record!** 🎬
