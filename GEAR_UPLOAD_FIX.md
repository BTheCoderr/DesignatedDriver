# Gear Upload Fix

## Issues Fixed

### 1. ✅ Database Constraint Error

**Problem:**
```
Error: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

**Root Cause:**
- Code was using `upsert()` with `onConflict: 'driver_id'`
- `driver_gear` table doesn't have a UNIQUE constraint on `driver_id`
- PostgreSQL requires a unique constraint to use `ON CONFLICT`

**Fix:**
- Changed from `upsert()` to manual check-then-insert-or-update
- First checks if gear exists for driver
- Updates if exists, inserts if new
- No database constraint needed

**File:** `app/(driver)/gear-upload.tsx`

---

### 2. ✅ Image Upload Web Handling

**Problem:**
- Web FormData condition had incorrect logic
- Missing parentheses caused wrong evaluation
- Data URLs not handled

**Fix:**
- Fixed condition logic with proper parentheses
- Added data URL handling
- Better error messages

**File:** `lib/imageUpload.ts`

---

### 3. ✅ Optional: Add Database Constraint

**File:** `fix_driver_gear_constraint.sql`

If you want to use `upsert()` in the future, run this SQL:

```sql
ALTER TABLE public.driver_gear
ADD CONSTRAINT unique_driver_id UNIQUE (driver_id);
```

**Note:** Current code works without this constraint, so it's optional.

---

## How It Works Now

### Gear Submission:
1. Check if gear exists for driver
2. If exists → Update existing record
3. If new → Insert new record
4. No database constraint needed ✅

### Image Upload:
1. **Web:** Converts blob/data URLs to File objects
2. **Native:** Uses React Native FormData format
3. Uploads to Cloudinary (or Supabase fallback)

---

## Testing

### Test Gear Upload:
1. Go to Gear Upload screen
2. Select gear type
3. Upload photos
4. Submit
5. **Should work without errors** ✅

---

## Status

- ✅ Database constraint error fixed (no constraint needed)
- ✅ Image upload web handling improved
- ✅ Gear submission should work now

**Try uploading gear again - it should work!** 🎉
