# 🎯 Demo Override System Guide

Complete guide for forcing dispatch modes during demos.

---

## ✅ IMPLEMENTATION COMPLETE

The demo override system is now implemented and ready to use!

---

## 📁 Files Changed

1. **`lib/demoConfig.ts`** (NEW)
   - Contains `DEMO_FORCE_MODE` flag
   - Providence demo locations
   - Helper functions

2. **`lib/dispatcher.ts`** (UPDATED)
   - Checks for demo override FIRST
   - Bypasses normal dispatch logic when override is set

3. **`app/(user)/request-rescue-simple.tsx`** (UPDATED)
   - Now uses dispatcher logic
   - Respects demo override

---

## 🎮 How to Use

### Step 1: Open Demo Config

**File:** `lib/demoConfig.ts`

**Find this line:**
```typescript
export const DEMO_FORCE_MODE: "solo_scoot" | "chase_car" | null = null;
```

### Step 2: Set Mode

**For Solo-Scoot Demo:**
```typescript
export const DEMO_FORCE_MODE: "solo_scoot" | "chase_car" | null = "solo_scoot";
```

**For Chase Car Demo:**
```typescript
export const DEMO_FORCE_MODE: "solo_scoot" | "chase_car" | null = "chase_car";
```

**For Normal Operation:**
```typescript
export const DEMO_FORCE_MODE: "solo_scoot" | "chase_car" | null = null;
```

### Step 3: Restart Expo

After changing the config:
```bash
# Stop server (Ctrl+C)
npm start
```

---

## ⚠️ IMPORTANT RULES

### Rule 1: Change BEFORE Recording
- ✅ Set `DEMO_FORCE_MODE` before you start recording
- ❌ Never change it live on screen
- ❌ Never mention the override during demo

### Rule 2: Test First
- Always test the override works before recording
- Verify the correct mode appears in dispatch result
- Check that pricing is correct

### Rule 3: Reset After Demo
- Set `DEMO_FORCE_MODE = null` after demo
- This ensures normal operation resumes

---

## 🧪 Testing the Override

### Test Solo-Scoot Override:

1. Set `DEMO_FORCE_MODE = "solo_scoot"`
2. Restart Expo
3. Log in as `demo_user@test.com`
4. Request rescue with any address
5. **Verify:** Dispatch result shows "Solo-Scoot"

### Test Chase Car Override:

1. Set `DEMO_FORCE_MODE = "chase_car"`
2. Restart Expo
3. Log in as `demo_user@test.com`
4. Request rescue with any address
5. **Verify:** Dispatch result shows "Chase Car"

---

## 📍 Providence Demo Locations

Pre-configured locations are available in `lib/demoConfig.ts`:

### Solo-Scoot:
```typescript
pickup: "1 Kennedy Plaza, Providence, RI"
destination: "Atwells Ave, Federal Hill, Providence, RI"
```

### Chase Car:
```typescript
pickup: "Garden City Center, Cranston, RI"
destination: "East Greenwich, RI"
```

**Usage:**
```typescript
import { PROVIDENCE_DEMO_LOCATIONS } from '@/lib/demoConfig';

// Solo-Scoot locations
const soloPickup = PROVIDENCE_DEMO_LOCATIONS.solo_scoot.pickup.address;
const soloDest = PROVIDENCE_DEMO_LOCATIONS.solo_scoot.destination.address;
```

---

## 🔍 How It Works

### Normal Flow (No Override):
```
User Request → Dispatcher Logic → Mode Selection → Result
```

### Demo Override Flow:
```
User Request → Check DEMO_FORCE_MODE → Return Forced Mode → Result
```

**The override bypasses all normal dispatch logic.**

---

## 🎬 Demo Workflow

### Before Demo:
1. ✅ Set `DEMO_FORCE_MODE` to desired mode
2. ✅ Restart Expo
3. ✅ Test override works
4. ✅ Prepare demo accounts
5. ✅ Clear browser cache

### During Demo:
1. ✅ Use override mode
2. ✅ Follow demo script
3. ✅ Pause at trust moments
4. ✅ Never mention override

### After Demo:
1. ✅ Set `DEMO_FORCE_MODE = null`
2. ✅ Restart Expo
3. ✅ Verify normal operation

---

## 🚨 Troubleshooting

### Override Not Working?

**Check:**
1. ✅ Did you restart Expo after changing config?
2. ✅ Is the syntax correct? (`"solo_scoot"` not `solo_scoot`)
3. ✅ Are you using `request-rescue-simple.tsx`? (It uses dispatcher)
4. ✅ Check browser console for errors

### Wrong Mode Showing?

**Check:**
1. ✅ Config file saved?
2. ✅ Expo restarted?
3. ✅ Browser cache cleared?
4. ✅ Check `lib/demoConfig.ts` - is override set correctly?

### Pricing Wrong?

**Note:** Pricing still uses normal calculation, just mode is forced. This is correct behavior.

---

## ✅ Status

- ✅ Demo override system implemented
- ✅ Dispatcher respects override
- ✅ Request-rescue-simple uses dispatcher
- ✅ Providence locations configured
- ✅ Documentation complete

**You're ready to demo!** 🎉

---

## 📝 Quick Reference

**File to Edit:** `lib/demoConfig.ts`

**Line to Change:**
```typescript
export const DEMO_FORCE_MODE: "solo_scoot" | "chase_car" | null = null;
```

**Values:**
- `"solo_scoot"` → Force Solo-Scoot
- `"chase_car"` → Force Chase Car
- `null` → Normal operation

**Restart Required:** ✅ Yes, always restart Expo after changing
