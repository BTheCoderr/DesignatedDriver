# ✅ YC Demo Final Checklist

Complete pre-flight checklist before recording your YC submission video.

---

## 🎯 STRATEGY LOCKED IN

- ✅ **Primary Demo:** PWA (Mobile Web, Add to Home Screen)
- ✅ **Backup:** Expo Go (only if needed)
- ✅ **Perception Goal:** "Shippable product, works today"

---

## 📱 PWA SETUP

### iOS:
- [ ] ✅ App added to home screen via Safari
- [ ] ✅ Opens from icon (not browser URL)
- [ ] ✅ Full-screen experience verified
- [ ] ✅ No browser address bar visible

### Android:
- [ ] ✅ App installed via Chrome
- [ ] ✅ Opens from icon (not browser)
- [ ] ✅ Full-screen experience verified
- [ ] ✅ No browser UI visible

---

## 🎮 DEMO CONFIGURATION

### Demo Override:
- [ ] ✅ `DEMO_FORCE_MODE` set correctly (`"solo_scoot"` or `"chase_car"`)
- [ ] ✅ File: `lib/demoConfig.ts`
- [ ] ✅ Expo restarted after change
- [ ] ✅ Override tested and working

### Demo Accounts:
- [ ] ✅ `demo_user@test.com` / `Demo123!` ready
- [ ] ✅ `demo_driver_scoot@test.com` / `Demo123!` ready
- [ ] ✅ `demo_driver_chase@test.com` / `Demo123!` ready
- [ ] ✅ All accounts logged out before demo

---

## 📍 PROVIDENCE LOCATIONS

### Solo-Scoot Demo:
- [ ] ✅ Pickup: `1 Kennedy Plaza, Providence, RI`
- [ ] ✅ Destination: `Atwells Ave, Federal Hill, Providence, RI`
- [ ] ✅ Locations tested and geocode correctly

### Chase Car Demo:
- [ ] ✅ Pickup: `Garden City Center, Cranston, RI`
- [ ] ✅ Destination: `East Greenwich, RI`
- [ ] ✅ Locations tested and geocode correctly

---

## 🧪 FUNCTIONALITY TESTS

### Core Features:
- [ ] ✅ Guest access works (browse home screen)
- [ ] ✅ Login works (demo accounts)
- [ ] ✅ Request rescue works
- [ ] ✅ Dispatch mode shows correctly (forced)
- [ ] ✅ Driver acceptance works
- [ ] ✅ Trunk photo upload works
- [ ] ✅ Vehicle inspection photos work
- [ ] ✅ Trip completion works
- [ ] ✅ Rating/tip works
- [ ] ✅ Damage claim viewing works

### Technical:
- [ ] ✅ Camera permissions work (PWA)
- [ ] ✅ Photo uploads work (Cloudinary)
- [ ] ✅ Maps load correctly
- [ ] ✅ Navigation is smooth
- [ ] ✅ No console errors
- [ ] ✅ No broken images
- [ ] ✅ All photos load instantly

---

## 🎬 RECORDING SETUP

### Device:
- [ ] ✅ Phone on Do Not Disturb
- [ ] ✅ Screen recording app ready
- [ ] ✅ Battery charged (or plugged in)
- [ ] ✅ Good lighting (if showing face)
- [ ] ✅ Quiet space

### App:
- [ ] ✅ Browser cache cleared
- [ ] ✅ App opened from home screen icon
- [ ] ✅ All tabs closed except app
- [ ] ✅ Demo mode enabled (`EXPO_PUBLIC_DEMO_MODE=true` if desired)
- [ ] ✅ Console logs disabled (or minimal)

---

## 📋 DEMO FLOW CHECKLIST

### Solo-Scoot Demo:
- [ ] ✅ Open from home screen icon
- [ ] ✅ Show home screen (pause 2 sec)
- [ ] ✅ Tap RESCUE button
- [ ] ✅ Select vehicle
- [ ] ✅ Enter Providence locations
- [ ] ✅ Confirm Solo-Scoot mode shows
- [ ] ✅ Switch to driver account
- [ ] ✅ Accept job
- [ ] ✅ Mark arrived
- [ ] ✅ Upload trunk photo (pause 2 sec)
- [ ] ✅ Start trip
- [ ] ✅ End trip
- [ ] ✅ Switch back to user
- [ ] ✅ Rate and tip

### Chase Car Demo:
- [ ] ✅ Set `DEMO_FORCE_MODE = "chase_car"`
- [ ] ✅ Use suburban locations
- [ ] ✅ Show before inspection (pause 2 sec)
- [ ] ✅ Show after inspection (pause 2 sec)
- [ ] ✅ Complete trip flow

### Damage Claim Demo:
- [ ] ✅ Open completed trip
- [ ] ✅ Show damage claim
- [ ] ✅ Scroll through photos
- [ ] ✅ Pause 2 seconds (silence does the work)

---

## 🚨 BACKUP PLAN

### If PWA Fails:
- [ ] ✅ Expo Go app installed
- [ ] ✅ QR code ready
- [ ] ✅ Network connection stable
- [ ] ✅ Know how to explain briefly (if needed)

### If Camera Fails:
- [ ] ✅ Expo Go as backup
- [ ] ✅ Pre-uploaded photos ready
- [ ] ✅ Know how to skip gracefully

---

## ✅ FINAL "GO / NO-GO" CHECK

### You are GO if:
- ✅ PWA opens from home screen icon
- ✅ Dispatch mode is forced correctly
- ✅ All photos load instantly
- ✅ No console errors
- ✅ Camera permissions work
- ✅ Navigation is smooth
- ✅ Demo takes <6 minutes calmly

### You are NO-GO if:
- ❌ PWA doesn't open from icon
- ❌ Dispatch mode is unpredictable
- ❌ Photos don't load
- ❌ Console errors visible
- ❌ Camera permissions fail
- ❌ Navigation feels broken
- ❌ Demo takes >8 minutes

---

## 🎯 KEY REMINDERS

### DO:
- ✅ Open from home screen icon
- ✅ Pause at trust moments (2-3 seconds)
- ✅ Speak clearly and confidently
- ✅ Show features, don't explain tooling
- ✅ Keep it calm and slow

### DON'T:
- ❌ Open from browser URL
- ❌ Mention "PWA" or "Expo"
- ❌ Show QR codes
- ❌ Explain development process
- ❌ Rush through screens
- ❌ Apologize for anything

---

## 🚀 YOU'RE READY!

**Everything checked?** ✅

**PWA added to home screen?** ✅

**Demo override set?** ✅

**Locations tested?** ✅

**Recording ready?** ✅

**GO RECORD YOUR DEMO!** 🎬

---

## 📝 QUICK REFERENCE

**Demo Override:** `lib/demoConfig.ts` → `DEMO_FORCE_MODE`
**PWA Setup:** Add to Home Screen via Safari (iOS) or Chrome (Android)
**Demo Accounts:** `demo_user@test.com`, `demo_driver_scoot@test.com`, `demo_driver_chase@test.com`
**Password:** `Demo123!`
**Providence Locations:** See `MOBILE_DEMO_PLAN.md`

**Good luck!** 🎉
