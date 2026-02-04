# 🎬 Mobile Demo Plan - Providence

Complete guide for reliable mobile-first demos with forced dispatch modes.

---

## ✅ PART 1: DEMO OVERRIDE SYSTEM (IMPLEMENTED)

### How It Works

**File:** `lib/demoConfig.ts`

```typescript
export const DEMO_FORCE_MODE: "solo_scoot" | "chase_car" | null = null;
```

**To Use:**
1. **For Solo-Scoot demo:** Set `DEMO_FORCE_MODE = "solo_scoot"`
2. **For Chase Car demo:** Set `DEMO_FORCE_MODE = "chase_car"`
3. **For normal operation:** Set `DEMO_FORCE_MODE = null`

**⚠️ IMPORTANT:** Change this BEFORE recording/demoing, NOT live on screen.

---

## 📍 PART 2: PROVIDENCE DEMO LOCATIONS

### Solo-Scoot Demo (Dense Core)

**Pickup:**
- Address: `1 Kennedy Plaza, Providence, RI`
- Coordinates: `41.8268, -71.4114`
- Why: Downtown Providence - Dense core, perfect for Solo-Scoot

**Destination:**
- Address: `Atwells Ave, Federal Hill, Providence, RI`
- Coordinates: `41.8230, -71.4210`
- Why: Federal Hill - Nightlife district, short trip, very believable

### Chase Car Demo (Suburban)

**Pickup:**
- Address: `Garden City Center, Cranston, RI`
- Coordinates: `41.7600, -71.4500`
- Why: Suburban shopping center - Clear suburb logic

**Destination:**
- Address: `East Greenwich, RI`
- Coordinates: `41.6600, -71.4500`
- Why: Suburban destination - Scooter feels unreasonable

---

## 🎯 PART 3: DEMO RUN CHECKLIST

### BEFORE YOU START

- [ ] `DEMO_FORCE_MODE` set correctly (`"solo_scoot"` or `"chase_car"`)
- [ ] **PWA added to home screen** (iOS: Safari → Share → Add to Home Screen)
- [ ] **App opens from icon** (NOT browser URL)
- [ ] Demo drivers logged out (`demo_driver_scoot`, `demo_driver_chase`)
- [ ] Demo user logged out (`demo_user@test.com`)
- [ ] Phone on Do Not Disturb
- [ ] Screen recording ready
- [ ] Browser cache cleared (if needed)
- [ ] Camera permissions tested
- [ ] Full-screen experience verified

---

## 🚴 DEMO RUN 1: SOLO-SCOOT (MOBILE)

### STEP 1: OPEN PWA (CRITICAL)
- **Tap home screen icon** (NOT browser)
- App opens full-screen
- No browser address bar visible
- **Pause 2 seconds**

**⚠️ IMPORTANT:** Always open from home screen icon, never from browser URL

### STEP 2: HOME SCREEN
- Point at RESCUE button
- **Say nothing yet**
- Tap RESCUE
- This establishes simplicity

### STEP 3: VEHICLE + DESTINATION
- Select demo vehicle
- Enter pickup: `1 Kennedy Plaza, Providence, RI`
- Enter destination: `Atwells Ave, Federal Hill, Providence, RI`
- Wait for dispatch result

**Confirm:**
- ✅ Mode shows **Solo-Scoot**
- ✅ Price visible
- ✅ ETA reasonable

**If anything looks odd → STOP and fix now**

### STEP 4: SWITCH TO DRIVER (THE WOW MOMENT)
- Log out
- Log in as `demo_driver_scoot@test.com` / `Demo123!`
- Job appears immediately
- Accept job
- Mark arrived
- **Pause**

**Say (later, not now):**
> "This works like a real marketplace."

### STEP 5: TRUNK PHOTO (DO NOT RUSH)
- Upload trunk photo
- Confirm image loads
- **Pause 2 seconds**
- This is your trust moment

**If photo doesn't load instantly → FIX before continuing**

### STEP 6: START TRIP
- Tap Start Trip
- **Confirm:**
  - ✅ Status changes
  - ✅ No errors
  - ✅ Insurance session created
- **Pause 1-2 seconds**

### STEP 7: END TRIP
- End trip
- Switch back to user
- Rate + tip
- **This locks the Solo-Scoot demo forever**

---

## 🚗 DEMO RUN 2: CHASE CAR (SECOND PASS)

### Changes:
- Set `DEMO_FORCE_MODE = "chase_car"`
- Use `demo_driver_chase@test.com`
- Use locations: `Garden City Center → East Greenwich`

### Key Pauses:
- **Before inspection** (2 seconds)
- **After inspection** (2 seconds)

**This proves:**
> "This isn't a gimmick — it works everywhere."

---

## 📋 PART 4: DAMAGE CLAIM (PRE-SEED ONLY)

### Before Demo:
1. Create one damage claim on either trip
2. Upload photos
3. Leave status as `submitted`

### During Demo:
- Open claim
- Scroll through photos
- **Say nothing for 2 seconds**
- That silence does the work

**You do NOT file live. You demo viewing it.**

---

## ✅ PART 5: PWA CHECKLIST

### Before Demo Day:
- [ ] App loads from home screen icon
- [ ] No browser address bar visible (if possible)
- [ ] Touch targets feel native
- [ ] Maps load quickly
- [ ] No console errors

### If PWA Feels Off:
- Use Expo Go as backup
- Same flow, same demo

---

## 🎬 PART 6: FINAL "GO / NO-GO" CHECK

### You are GO if:
- ✅ You can force Solo vs Chase every time
- ✅ You never upload photos live unless planned
- ✅ Providence locations behave predictably
- ✅ No console errors on mobile
- ✅ Demo takes <6 minutes calmly

### You are NO-GO if:
- ❌ Dispatch mode is unpredictable
- ❌ Photos don't load instantly
- ❌ Console errors visible
- ❌ Navigation feels broken
- ❌ Demo takes >8 minutes

---

## 📝 QUICK REFERENCE

### Demo Accounts:
- **User:** `demo_user@test.com` / `Demo123!`
- **Driver (Scoot):** `demo_driver_scoot@test.com` / `Demo123!`
- **Driver (Chase):** `demo_driver_chase@test.com` / `Demo123!`

### Demo Override:
```typescript
// lib/demoConfig.ts
export const DEMO_FORCE_MODE: "solo_scoot" | "chase_car" | null = null;
```

### Providence Locations:
- **Solo-Scoot:** `1 Kennedy Plaza → Atwells Ave`
- **Chase Car:** `Garden City Center → East Greenwich`

---

## 🚀 YOU'RE READY!

Follow this plan step-by-step, and your demo will be smooth, predictable, and impressive.

**Remember:** 
- Set `DEMO_FORCE_MODE` BEFORE recording
- Pause intentionally at trust moments
- Never upload photos live unless tested 3x
- Keep it calm and confident

**Good luck!** 🎉
