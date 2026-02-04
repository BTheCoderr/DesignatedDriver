# Cloudinary Setup Guide

## ✅ Credentials Configured

Your Cloudinary credentials are already in `.env`:
- Cloud Name: `dgtqpyphg`
- API Key: `613868569276947`
- API Secret: `AjJM3fQk-DRLBav35cYKm7EUAmM`

---

## 🔧 REQUIRED: Create Unsigned Upload Preset

**You MUST create an unsigned upload preset before uploads will work:**

### Step 1: Go to Cloudinary Dashboard
1. Go to https://console.cloudinary.com
2. Select your cloud (`dgtqpyphg`)
3. Go to **Settings** → **Upload** → **Upload Presets**

### Step 2: Create Upload Preset
1. Click **"Add Upload Preset"** (or **"Add upload preset"**)
2. **Preset name:** `designated_driver_unsigned`
3. **Signing mode:** Select **"Unsigned"** ⚠️ (This is required!)
4. **Folder:** `designated-driver` (optional, but recommended)
5. **Settings:**
   - ✅ **Use filename**: ON (allows custom public_ids)
   - ✅ **Overwrite**: ON (optional)
   - **Format:** `auto` (auto WebP/AVIF)
   - **Quality:** `auto` (auto optimization)
6. Click **"Save"**

### Step 3: Verify Preset
- You should see `designated_driver_unsigned` in your upload presets list
- Status should be "Unsigned"

---

## 📝 Update .env (Already Done ✅)

The `.env` file already has:
```
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=designated_driver_unsigned
```

---

## 🧪 Test Upload

After creating the preset, test an upload:

1. **Restart Expo** (to load new env vars)
2. **Try uploading a photo** in the app
3. **Check Cloudinary Dashboard** → **Media Library** → You should see uploaded images

---

## 🔄 How It Works

### Upload Flow:
1. User takes/selects photo
2. App uploads to Cloudinary using unsigned preset
3. Cloudinary returns optimized URL
4. URL stored in database
5. Images display with automatic optimization

### Optimization:
- **Automatic format conversion** (WebP/AVIF when supported)
- **Automatic quality optimization**
- **CDN delivery** (faster loading)
- **On-the-fly transformations** (thumbnails, resizing)

---

## 🚨 Troubleshooting

### Error: "Upload preset not found"
- **Fix:** Create the upload preset in Cloudinary Dashboard
- **Name must match:** `designated_driver_unsigned`

### Error: "Invalid upload preset"
- **Fix:** Make sure preset is set to **"Unsigned"** mode
- **Fix:** Check preset name matches `.env` file

### Error: "Cloudinary upload failed"
- **Check:** Cloud name is correct (`dgtqpyphg`)
- **Check:** Upload preset exists and is unsigned
- **Check:** Network connection
- **Fallback:** App will use Supabase Storage if Cloudinary fails

### Images not uploading
- **Check:** Upload preset created and unsigned
- **Check:** `.env` file has correct preset name
- **Check:** Restart Expo after changing `.env`
- **Check:** Browser console for errors

---

## 📊 Benefits Over Supabase Storage

✅ **Automatic optimization** - WebP/AVIF conversion
✅ **CDN delivery** - Faster image loading
✅ **Thumbnails** - On-the-fly thumbnail generation
✅ **Transformations** - Resize, crop, optimize on-demand
✅ **Better mobile performance** - Smaller file sizes

---

## 🔄 Migration Strategy

**Current:** Images upload to Supabase Storage
**After Setup:** Images upload to Cloudinary
**Fallback:** If Cloudinary fails, uses Supabase Storage

**Existing Images:** Will continue to work (displayed from Supabase)
**New Images:** Will upload to Cloudinary

---

**Status:** ✅ Credentials configured, ⚠️ **Upload preset needs to be created**

**Next Step:** Create the unsigned upload preset in Cloudinary Dashboard!
