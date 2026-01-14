# DesignatedDriver MVP - Deliverables Summary

## A) Architecture Summary

**Tech Stack**: React Native (Expo) + Supabase (PostgreSQL + Auth + Storage + Realtime) + Mapbox

**Core Components**:
- Database: 9 tables (profiles, vehicles, trips, driver_gear, trunk_logs, insurance_sessions, claims, driver_locations, trip_reviews)
- Dispatch: Rules-based engine selecting Chase Car (2 drivers) or Solo-Scoot (1 driver w/ verified gear)
- Pricing: Tiered with surge multipliers (normal/peak/late-night/weekend/weather)
- Insurance: Stub integration with event-based status tracking (not_started → bound → ended)
- Real-time: Supabase Realtime for trip status and driver location updates

**Key Flows**:
1. User: Rescue Button → Select Vehicle → Enter Destination → Dispatch → Track → Rate
2. Driver: View Jobs → Accept → Arrive → Trunk Photo → Start Trip → End Trip
3. Safety: Trunk photo verification, insurance switch on Start Trip, damage claims workflow

---

## B) Supabase SQL Schema

**File**: `schema.sql`

**Tables**:
- `profiles` - User/driver/admin accounts (extends auth.users)
- `vehicles` - User's registered cars
- `driver_gear` - Folding device verification (pending/verified/rejected)
- `trips` - Core trip entity with status lifecycle and pricing
- `trunk_logs` - Photo verification before trip starts
- `insurance_sessions` - Policy status tracking (stub)
- `claims` - Damage claim workflow
- `driver_locations` - Real-time location tracking
- `trip_reviews` - Ratings and tips

**Status Lifecycle**: `requested → dispatched → driver_arriving → trunk_verified → in_progress → completed → cancelled`

**Copy/paste ready**: Yes, run in Supabase SQL Editor.

---

## C) RLS Policies

**File**: `rls_policies.sql`

**Coverage**:
- Users: Own data only
- Drivers: Assigned trips + available jobs
- Admins: Full access
- Real-time: Location updates for active trips only

**Security**: All tables have RLS enabled with role-based access.

**Copy/paste ready**: Yes, run after schema.

---

## D) React Native Screen List

**File**: `SCREENS.md` (detailed)

**Auth** (3 screens):
- `login.tsx`, `signup.tsx`, `role-select.tsx`

**User** (6 screens):
- `index.tsx` (Home - Rescue Button)
- `request-rescue.tsx` (Multi-step flow)
- `trip-tracking.tsx` (Real-time map)
- `trip-complete.tsx` (Rating/tip)
- `claim-damage.tsx` (Photo upload)
- `vehicles.tsx` (Manage cars)

**Driver** (7 screens):
- `index.tsx` (Dashboard - Available jobs)
- `accept-job.tsx`, `arrive.tsx`, `trunk-photo.tsx`
- `drive.tsx` (Active trip)
- `end-trip.tsx`, `gear-upload.tsx`

**Admin** (1 screen):
- `gear-verification.tsx` (Approve/reject gear)

**Navigation**: Expo Router (file-based routing)

---

## E) Pseudocode for Dispatcher + Pricing + Insurance Switch

**File**: `dispatcher_pricing_pseudocode.md` (detailed) + `lib/dispatcher.ts` (implementation)

### Dispatcher Logic (Rules-Based)

```typescript
selectDispatchMode(tripData, availableDrivers) {
  // Score Solo-Scoot feasibility (city density, distance < 5mi, clear weather, daytime)
  // Score Chase Car feasibility (distance > 10mi, bad weather, suburban, late night)
  // Check availability (Solo-Scoot: verified gear drivers, Chase Car: 2+ drivers)
  // Decision: Solo-Scoot if score >= 5 and available, else Chase Car, else null
  // Return: { mode, primaryDriver, chaseDriver, priceEstimate, estimatedArrival }
}
```

**Factors**:
- Solo-Scoot: High/medium density (+3), distance < 5mi (+2), clear weather (+2), daytime (+1)
- Chase Car: Distance > 10mi (+3), bad weather (+3), low/suburban (+2), late night (+2)

### Pricing Engine

```typescript
calculatePrice(mode, distance, timeOfDay, weather, isWeekend) {
  // Base: Chase Car $25 + $2.50/mi (1.8x for 2 drivers), Solo-Scoot $15 + $1.75/mi
  // Surge: Normal 1.0x, Peak (5-8 PM) 1.5x, Late Night (10 PM-6 AM) 1.8x, Weekend 1.3x, Bad weather +20%
  // Fees: 8% tax + $2.50 platform fee
  // Return: { base_fee, mileage_fee, surge_multiplier, subtotal, taxes, platform_fee, total, breakdown }
}
```

### Insurance Switch (Stub)

```typescript
createPolicySession(tripId, vehicleInfo, driverId) {
  // Insert insurance_sessions with status 'not_started'
  // Log stub API call
}

bindPolicy(policySessionId, tripId) {
  // Update status to 'bound', set policy_bound_at timestamp
  // Called when driver taps "Start Trip"
  // Log stub API call
}

endPolicy(policySessionId, tripId) {
  // Update status to 'ended', set policy_ended_at timestamp
  // Called when driver taps "End Trip"
  // Log stub API call
}
```

**Implementation**: `lib/insurance.ts` (ready to use)

---

## F) MVP Prototype Checklist for User Testing

**File**: `TEST_PLAN.md` (comprehensive 12-section checklist)

**Critical Paths**:
1. ✅ User signup/login with role selection
2. ✅ Request Rescue flow (vehicle → destination → dispatch → price)
3. ✅ Trip lifecycle (requested → dispatched → arriving → trunk_verified → in_progress → completed)
4. ✅ Insurance switch events (bound on Start Trip, ended on End Trip)
5. ✅ Trunk photo verification (Solo-Scoot mode)
6. ✅ Real-time driver tracking
7. ✅ Rating/tip after trip
8. ✅ Damage claim submission
9. ✅ Driver job acceptance and completion
10. ✅ Dispatch mode selection (rules-based)
11. ✅ Pricing with surge multipliers
12. ✅ Admin gear verification

**Test Data Requirements**:
- 3+ users, 2+ drivers (1 with verified gear), 1 admin
- 1+ vehicle per user
- Test in different scenarios (peak hours, bad weather, etc.)

---

## Build Order (As Specified)

1. ✅ **Schema** - `schema.sql` created
2. ✅ **RLS Policies** - `rls_policies.sql` created
3. ⏳ **Supabase Setup** - Run SQL files in Supabase Dashboard
4. ⏳ **Auth** - Implement login/signup/role-select screens
5. ⏳ **Request Rescue** - Multi-step flow with dispatch
6. ⏳ **Driver Flows** - Accept → Arrive → Trunk Photo → Start/End Trip
7. ⏳ **Real-time Tracking** - Supabase Realtime subscriptions
8. ⏳ **End Trip + Rating** - Complete flow
9. ⏳ **Damage Claims** - Photo upload workflow
10. ⏳ **Admin Gear Verification** - Approve/reject interface

**Status**: Foundation complete (schema, RLS, dispatcher, pricing, insurance stub). App screens to be implemented per BUILD_STEPS.md.

---

## Key Files Delivered

1. `schema.sql` - Complete database schema
2. `rls_policies.sql` - Security policies
3. `lib/dispatcher.ts` - Dispatch + pricing implementation
4. `lib/insurance.ts` - Insurance stub functions
5. `lib/supabase.ts` - Supabase client + TypeScript types
6. `dispatcher_pricing_pseudocode.md` - Detailed logic documentation
7. `ARCHITECTURE.md` - System overview
8. `SCREENS.md` - Screen map & navigation
9. `BUILD_STEPS.md` - Step-by-step setup guide
10. `TEST_PLAN.md` - QA checklist
11. `seed_data.sql` - Test data template
12. `package.json` - Dependencies
13. `README.md` - Quick start guide

---

## Next Steps

1. Set up Supabase project
2. Run `schema.sql` and `rls_policies.sql`
3. Create storage buckets
4. Install dependencies: `npm install`
5. Set environment variables (`.env`)
6. Implement screens per `SCREENS.md` and `BUILD_STEPS.md`
7. Test using `TEST_PLAN.md`

**Ready for**: User testing after screen implementation.

