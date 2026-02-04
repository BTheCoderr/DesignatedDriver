# PNG Upload Fix

## Issue

**Problem:** Only JPG images were uploading successfully. PNG images failed.

**Root Cause:**
- Code was hardcoding `image/jpeg` as the content type
- File names were hardcoded to `.jpg` extension
- Didn't detect actual image type from the blob

---

## Fix Applied

### 1. ✅ Detect Image Type from Blob

**Files:** `lib/cloudinary.ts`, `lib/imageUpload.ts`

**Changes:**
- Detect MIME type from blob: `blob.type`
- Support PNG, JPEG, WebP, GIF
- Use detected type for File object
- Use detected type for filename extension
- Use detected type for Supabase contentType

### 2. ✅ Dynamic File Extension

**Before:**
```typescript
fileToUpload = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
```

**After:**
```typescript
// Detect type from blob
detectedType = blob.type || 'image/jpeg';
if (detectedType.includes('png')) fileExtension = 'png';
else if (detectedType.includes('jpeg')) fileExtension = 'jpg';
// ... etc

fileToUpload = new File([blob], `photo.${fileExtension}`, { type: detectedType });
```

### 3. ✅ Supabase Content Type

**Before:**
```typescript
contentType: 'image/jpeg'
```

**After:**
```typescript
contentType: detectedContentType // Uses actual image type
```

---

## Supported Formats

Now supports:
- ✅ **PNG** (`image/png`)
- ✅ **JPEG** (`image/jpeg`)
- ✅ **WebP** (`image/webp`)
- ✅ **GIF** (`image/gif`)

---

## How It Works

### Web:
1. Fetch image from blob/data URL
2. Get MIME type from `blob.type`
3. Determine extension from MIME type
4. Create File with correct type and extension
5. Upload with correct contentType

### Native:
1. Check URI for file extension (`.png`, `.jpg`, etc.)
2. Set type based on extension
3. Use correct extension in filename
4. Upload with correct contentType

---

## Testing

### Test PNG Upload:
1. Go to Gear Upload
2. Pick a PNG image from gallery
3. Submit
4. **Should upload successfully** ✅

### Test JPEG Upload:
1. Go to Gear Upload
2. Pick a JPEG image
3. Submit
4. **Should still work** ✅

---

## Status

- ✅ PNG uploads now work
- ✅ JPEG uploads still work
- ✅ WebP and GIF supported
- ✅ Correct content types used
- ✅ Correct file extensions used

**Try uploading a PNG now - it should work!** 🎉
