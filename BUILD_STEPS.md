# Build Steps - Chauffer MVP

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed: `npm install -g expo-cli`
- Supabase account (free tier works)
- iOS Simulator (Mac) or Android Emulator / Physical device

---

## Step 1: Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy/paste contents of `schema.sql`
   - Execute (creates all tables)

3. **Run RLS Policies**
   - In SQL Editor, copy/paste contents of `rls_policies.sql`
   - Execute (enables security)

4. **Create Storage Buckets**
   - Go to Storage in Supabase Dashboard
   - Create buckets:
     - `driver-gear-photos` (public read, authenticated write)
     - `trunk-photos` (authenticated read/write)
     - `damage-claims` (authenticated read/write)

5. **Set Storage Policies** (via SQL Editor):
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id IN ('driver-gear-photos', 'trunk-photos', 'damage-claims'));

   -- Allow authenticated users to read
   CREATE POLICY "Authenticated users can read"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id IN ('driver-gear-photos', 'trunk-photos', 'damage-claims'));
   ```

---

## Step 2: Install Dependencies

```bash
cd /Users/baheemferrell/Desktop/DesignatedDriver
npm install
```

---

## Step 3: Environment Variables

Create `.env` file in project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Step 4: Create App Structure

The app uses Expo Router (file-based routing). Create these directories:

```bash
mkdir -p app/(auth)
mkdir -p app/(user)
mkdir -p app/(driver)
mkdir -p app/(admin)
mkdir -p lib
mkdir -p components
```

---

## Step 5: Create Root Layout

Create `app/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.replace('/(auth)/login');
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.replace('/(auth)/login');
      }
    });
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

---

## Step 6: Create Auth Screens

### `app/(auth)/login.tsx`
- Email/phone + password form
- Link to signup
- On success, redirect based on role

### `app/(auth)/signup.tsx`
- Email, phone, password, full name
- Create auth user + profile
- Redirect to role-select

### `app/(auth)/role-select.tsx`
- Choose User or Driver
- Update profile.role
- Redirect to appropriate home

---

## Step 7: Create User Screens

### `app/(user)/index.tsx` (Home)
- Large "Rescue Button"
- Recent trips list
- Active trip card (if any)

### `app/(user)/request-rescue.tsx`
- Multi-step form:
  1. Select vehicle
  2. Enter destination
  3. Confirm pickup
  4. Show dispatch result
  5. Confirm and create trip

### `app/(user)/trip-tracking.tsx`
- Map with real-time driver location
- Status updates via Supabase Realtime
- Trip info card

### `app/(user)/trip-complete.tsx`
- Rating, tip, review form
- "Report Damage" button

### `app/(user)/claim-damage.tsx`
- Photo upload
- Damage details form
- Submit claim

---

## Step 8: Create Driver Screens

### `app/(driver)/index.tsx` (Dashboard)
- Available jobs list
- Active trip card
- Gear status

### `app/(driver)/accept-job.tsx`
- Trip details
- Accept/Decline

### `app/(driver)/arrive.tsx`
- "Mark Arrived" button

### `app/(driver)/trunk-photo.tsx`
- Camera view
- Photo capture
- Attestation checkbox

### `app/(driver)/drive.tsx`
- Map with route
- "Start Trip" (binds insurance)
- "End Trip" (ends insurance)

---

## Step 9: Implement Core Functions

### Dispatcher
- Use `lib/dispatcher.ts` (already created)
- Call `selectDispatchMode()` when trip created

### Pricing
- Use `calculatePrice()` from `lib/dispatcher.ts`
- Display breakdown in UI

### Insurance
- Use `lib/insurance.ts` (already created)
- Call `bindPolicy()` on "Start Trip"
- Call `endPolicy()` on "End Trip"

---

## Step 10: Real-time Subscriptions

In `trip-tracking.tsx`:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('trip-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'trips',
      filter: `id=eq.${tripId}`
    }, (payload) => {
      setTrip(payload.new);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [tripId]);
```

For driver locations:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('driver-locations')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'driver_locations',
      filter: `trip_id=eq.${tripId}`
    }, (payload) => {
      updateDriverLocation(payload.new);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [tripId]);
```

---

## Step 11: Location Tracking

In driver app, update location periodically:

```typescript
import * as Location from 'expo-location';

useEffect(() => {
  const interval = setInterval(async () => {
    const location = await Location.getCurrentPositionAsync({});
    await supabase.from('driver_locations').insert({
      driver_id: currentUser.id,
      trip_id: activeTripId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      is_primary_driver: true,
    });
  }, 5000); // Every 5 seconds

  return () => clearInterval(interval);
}, [activeTripId]);
```

---

## Step 12: Photo Upload

For trunk photos and damage claims:

```typescript
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

const pickImage = async () => {
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    const photo = result.assets[0];
    const base64 = await FileSystem.readAsStringAsync(photo.uri, {
      encoding: 'base64',
    });

    const fileName = `${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('trunk-photos')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
      });

    if (data) {
      const { data: urlData } = supabase.storage
        .from('trunk-photos')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    }
  }
};
```

---

## Step 13: Seed Test Data

1. Create test users via Supabase Auth Dashboard
2. Note their UUIDs
3. Update `seed_data.sql` with actual UUIDs
4. Run seed script in SQL Editor

---

## Step 14: Run App

```bash
npm start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

---

## Step 15: Testing

Follow `TEST_PLAN.md` checklist to verify all flows.

---

## Troubleshooting

### "Module not found"
- Run `npm install` again
- Clear Expo cache: `expo start -c`

### "Supabase connection error"
- Check `.env` file has correct values
- Verify Supabase project is active

### "RLS policy violation"
- Check user is authenticated
- Verify RLS policies are deployed
- Check user role matches policy requirements

### "Storage upload fails"
- Verify storage buckets exist
- Check storage policies are set
- Verify file size is under limit

---

## Next Steps (Post-MVP)

- [ ] Real insurance API integration
- [ ] Payment processing (Stripe)
- [ ] Push notifications
- [ ] Email/SMS notifications
- [ ] ML-based dispatch
- [ ] Advanced analytics
- [ ] Driver earnings dashboard
- [ ] User trip history

