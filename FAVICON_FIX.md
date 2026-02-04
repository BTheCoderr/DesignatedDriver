# Favicon Error Fix

## Issue

**Error:**
```
Error: ENOENT: no such file or directory, open './assets/favicon.png'
```

**Root Cause:**
- `app.json` was referencing `./assets/favicon.png` and `./assets/splash.png`
- These files don't exist in the project
- Expo tries to generate favicon from these files and fails

## Fix Applied

**Removed from `app.json`:**
- `favicon: "./assets/favicon.png"`
- `splash.image: "./assets/splash.png"`

**Result:**
- Expo will use default favicon/splash
- No more file not found errors
- PWA still works correctly

## Status

✅ **Fixed** - Removed missing file references

**The app should start without errors now!**

---

## Optional: Add Custom Favicon Later

If you want a custom favicon later:

1. Create `assets/favicon.png` (512x512px recommended)
2. Add back to `app.json`:
   ```json
   "favicon": "./assets/favicon.png"
   ```

For now, Expo's default favicon works fine for the demo.
