# Image Upload Fix

## Issues Fixed

### 1. ✅ Cloudinary Unsigned Upload Error

**Problem:**
```
Format parameter is not allowed when using unsigned upload
```

**Root Cause:**
- Code was sending `format` and `quality` parameters
- Unsigned upload presets don't allow these parameters
- They must be set in the upload preset settings, not in the API call

**Fix:**
- Removed `formData.append('format', 'auto')`
- Removed `formData.append('quality', ...)`
- Added comment explaining parameters must be set in upload preset

**File:** `lib/cloudinary.ts`

---

### 2. ✅ Web FormData Handling

**Problem:**
- Supabase fallback was failing with "No content provided"
- Web FormData needs File/Blob objects, not React Native format

**Root Cause:**
- React Native FormData format (`{ uri, type, name }`) doesn't work on web
- Web needs actual File or Blob objects
- expo-image-picker returns blob URLs on web (`blob:http://...`)

**Fix:**
- Added web detection (`typeof window !== 'undefined'`)
- Convert blob URLs to File objects using `fetch()` and `blob()`
- Handle data URLs and HTTP URLs
- Keep React Native format for native platforms

**Files:** 
- `lib/cloudinary.ts` - Web file conversion
- `lib/imageUpload.ts` - Supabase fallback web handling

---

## How It Works Now

### Cloudinary Upload:
1. **Web:** Converts blob URL → File object → Uploads to Cloudinary
2. **Native:** Uses React Native FormData format → Uploads to Cloudinary
3. **No format/quality params** - Set in upload preset instead

### Supabase Fallback:
1. **Web:** Converts blob URL → File object → Uploads to Supabase
2. **Native:** Uses React Native FormData format → Uploads to Supabase

---

## Testing

### Test on Web:
1. Open app in browser
2. Go to Gear Upload
3. Pick photos from gallery
4. Submit
5. **Should upload successfully** ✅

### Test on Native:
1. Open app in Expo Go
2. Go to Gear Upload
3. Take/pick photos
4. Submit
5. **Should upload successfully** ✅

---

## Upload Preset Configuration

**Important:** Make sure your Cloudinary upload preset has:
- ✅ Format: `auto` (set in preset settings)
- ✅ Quality: `auto` (set in preset settings)
- ✅ Signing mode: `Unsigned`

**These settings are in Cloudinary Dashboard → Upload Presets → Your Preset**

---

## Status

- ✅ Cloudinary upload fixed (no format/quality params)
- ✅ Web FormData handling fixed
- ✅ Supabase fallback fixed
- ✅ Both web and native should work

**Try uploading again - it should work now!** 🎉
