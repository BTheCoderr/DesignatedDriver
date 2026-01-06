# Screen Map & Navigation Structure

## App Structure (Expo Router)

```
app/
├── _layout.tsx (Root layout with auth check)
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   └── role-select.tsx (User/Driver selection)
├── (user)/
│   ├── _layout.tsx (Tab navigator)
│   ├── index.tsx (Home - Rescue Button)
│   ├── request-rescue.tsx
│   ├── trip-tracking.tsx
│   ├── trip-complete.tsx
│   ├── claim-damage.tsx
│   └── vehicles.tsx (Manage vehicles)
├── (driver)/
│   ├── _layout.tsx (Tab navigator)
│   ├── index.tsx (Dashboard - Available jobs)
│   ├── accept-job.tsx
│   ├── arrive.tsx
│   ├── trunk-photo.tsx
│   ├── drive.tsx (Active trip tracking)
│   ├── end-trip.tsx
│   └── gear-upload.tsx (Upload gear photos)
└── (admin)/
    ├── _layout.tsx
    └── gear-verification.tsx
```

## Screen Descriptions

### Auth Screens

**login.tsx**
- Email/phone + password
- Link to signup
- Auto-redirect based on role

**signup.tsx**
- Email, phone, password
- Full name
- Redirects to role-select

**role-select.tsx**
- Choose: User or Driver
- Sets profile.role
- Redirects to appropriate home

### User Screens

**index.tsx (Home)**
- Large "Rescue Button" (one-tap)
- Recent trips list
- Active trip card (if any)
- Navigation to vehicles, history

**request-rescue.tsx**
- Step 1: Select vehicle (or add new)
- Step 2: Enter destination (map picker)
- Step 3: Confirm pickup location (auto-detect or manual)
- Step 4: Show dispatch result (mode, price, ETA)
- Step 5: Confirm and create trip
- Auto-navigate to trip-tracking

**trip-tracking.tsx**
- Map with driver location (real-time)
- Trip status card
- Driver info
- ETA to pickup / destination
- Cancel button (if before start)
- "Driver Arrived" notification
- "Trunk Photo Verified" indicator
- "Trip Started" indicator (insurance bound)

**trip-complete.tsx**
- Trip summary
- Rating (1-5 stars)
- Tip input
- Review text (optional)
- "Report Damage" button
- Submit and return home

**claim-damage.tsx**
- Trip info
- Photo picker (multiple)
- Damage location selector
- Description text area
- Submit claim

**vehicles.tsx**
- List of user's vehicles
- Add new vehicle form
- Edit/delete existing

### Driver Screens

**index.tsx (Dashboard)**
- Available jobs list (filtered by gear)
- Active trip card (if any)
- Earnings summary
- Gear status indicator

**accept-job.tsx**
- Trip details
- Pickup/destination map
- Price breakdown
- Accept/Decline buttons

**arrive.tsx**
- "Mark Arrived" button
- Navigation to trunk-photo (if Solo-Scoot)

**trunk-photo.tsx**
- Camera view
- Take photo of device in trunk
- Attestation checkbox: "Device is secured"
- Notes field
- Submit → Navigate to drive.tsx

**drive.tsx**
- Map with route to destination
- Navigation instructions
- "Start Trip" button (binds insurance)
- "End Trip" button (ends insurance)
- Real-time location updates

**end-trip.tsx**
- Trip summary
- Wait for user rating
- Earnings display

**gear-upload.tsx**
- Select gear type
- Upload photos (multiple)
- Device model input
- Submit for verification

### Admin Screens

**gear-verification.tsx**
- Pending verifications list
- Photo viewer
- Approve/Reject buttons
- Notes field

## Navigation Flow Examples

### User: Request Rescue
1. Home (index.tsx) → Tap Rescue Button
2. request-rescue.tsx → Select vehicle → Enter destination → Confirm
3. trip-tracking.tsx (auto-navigate)
4. trip-complete.tsx (after trip ends)
5. Home (index.tsx)

### Driver: Complete Job
1. Dashboard (index.tsx) → Tap available job
2. accept-job.tsx → Accept
3. arrive.tsx → Mark arrived
4. trunk-photo.tsx (if Solo-Scoot) → Take photo
5. drive.tsx → Start Trip → Navigate → End Trip
6. end-trip.tsx → Wait for rating
7. Dashboard (index.tsx)

## Key Components

### Shared Components
- `MapView` - Real-time map with markers
- `DriverCard` - Driver info display
- `PriceBreakdown` - Price display component
- `StatusBadge` - Trip status indicator
- `PhotoPicker` - Camera/photo picker
- `RatingStars` - Rating input component

### Real-time Subscriptions
- Trip status changes (Supabase Realtime)
- Driver location updates (driver_locations table)
- Dispatch assignments

