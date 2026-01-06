# Chauffer MVP Architecture Summary

## Tech Stack
- **Frontend**: React Native (Expo)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Maps**: Mapbox SDK (or Google Maps)
- **Real-time**: Supabase Realtime subscriptions

## Core Components

### 1. Database Layer (Supabase PostgreSQL)
- **profiles**: User/driver/admin accounts
- **vehicles**: User's registered cars
- **driver_gear**: Folding device verification
- **trips**: Core trip entity with status lifecycle
- **trunk_logs**: Photo verification before trip
- **insurance_sessions**: Policy status tracking (stub)
- **claims**: Damage claim workflow
- **driver_locations**: Real-time location tracking
- **trip_reviews**: Ratings and tips

### 2. Authentication & Authorization
- Supabase Auth with email/phone
- Role-based access: `user`, `driver`, `admin`
- RLS policies enforce data access

### 3. Dispatch System
- **Rules-based dispatcher** (MVP, not ML)
- Mode selection: Chase Car vs Solo-Scoot
- Factors: city density, distance, weather, time, driver availability
- Fallback: Always to Chase Car if no Solo-Scoot available

### 4. Pricing Engine
- Three products: On-Demand (Chase Car), Eco (Solo-Scoot), Shadow (Hourly)
- Surge multipliers: normal, peak, late-night, weekend
- Configurable constants in backend

### 5. Insurance Switch (Stub)
- Event-based: `not_started` → `bound` (Start Trip) → `ended` (End Trip)
- Placeholder API functions ready for real integration

### 6. Real-time Features
- Supabase Realtime for:
  - Driver location updates
  - Trip status changes
  - Dispatch assignments

## App Structure

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── role-select.tsx
├── (user)/
│   ├── home.tsx (Rescue Button)
│   ├── request-rescue.tsx
│   ├── trip-tracking.tsx
│   ├── trip-complete.tsx
│   └── claim-damage.tsx
├── (driver)/
│   ├── dashboard.tsx
│   ├── accept-job.tsx
│   ├── arrive.tsx
│   ├── trunk-photo.tsx
│   ├── drive.tsx
│   └── end-trip.tsx
└── (admin)/
    └── gear-verification.tsx
```

## Key Flows

### User Flow: Request Rescue
1. Tap Rescue Button (home screen)
2. Select/confirm vehicle
3. Enter destination
4. Dispatcher selects mode + drivers
5. Show price estimate, confirm
6. Real-time tracking (driver approaching)
7. Driver arrives, takes trunk photo
8. Start trip (insurance bound)
9. Live tracking during trip
10. End trip, rate + tip
11. Optional: Report damage

### Driver Flow: Accept & Complete
1. View available jobs (filtered by gear)
2. Accept job
3. Navigate to pickup
4. Mark "Arrived"
5. Take trunk photo (if Solo-Scoot)
6. Start trip (triggers insurance bind)
7. Drive to destination
8. End trip (triggers insurance end)
9. Wait for rating

## Safety & Liability Controls

1. **Trunk Photo Verification**: Required before trip starts
2. **Insurance Switch Event**: Policy bound at Start Trip
3. **Damage Claims**: Full workflow with photos
4. **Driver Verification**: Gear verification required for Solo-Scoot
5. **Real-time Tracking**: User can see driver location

## MVP Constraints

- No real insurance API (stub only)
- Rules-based dispatch (not ML)
- Manual gear verification (admin panel)
- Basic pricing (configurable constants)
- Local testing with minimal env vars

