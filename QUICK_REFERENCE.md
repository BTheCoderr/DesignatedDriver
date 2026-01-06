# Quick Reference - Chauffer MVP

## Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User/driver/admin accounts | id, role, phone |
| `vehicles` | User's cars | make, model, year, license_plate |
| `driver_gear` | Folding device verification | gear_type, verification_status |
| `trips` | Core trip entity | status, dispatch_mode, primary_driver_id, chase_driver_id |
| `trunk_logs` | Photo verification | before_photo_url, device_secured |
| `insurance_sessions` | Policy tracking | policy_status, policy_bound_at |
| `claims` | Damage claims | status, photo_urls, description |
| `driver_locations` | Real-time tracking | latitude, longitude, trip_id |
| `trip_reviews` | Ratings & tips | rating, tip_amount |

## Trip Status Flow

```
requested → dispatched → driver_arriving → trunk_verified → in_progress → completed
                                                                    ↓
                                                               cancelled
```

## Insurance Status Flow

```
not_started → bound (Start Trip) → ended (End Trip)
```

## Dispatch Modes

| Mode | Drivers | Best For | Base Price |
|------|---------|----------|------------|
| **Chase Car** | 2 | Suburbs, long distance, bad weather | $25 + $2.50/mi (×1.8) |
| **Solo-Scoot** | 1 (w/ verified gear) | Dense cities, short distance | $15 + $1.75/mi |

## Surge Multipliers

- **Normal** (6 AM - 10 PM): 1.0x
- **Peak** (5 PM - 8 PM): 1.5x
- **Late Night** (10 PM - 6 AM): 1.8x
- **Weekend**: 1.3x
- **Bad Weather**: +20%

## Key Functions

### Dispatcher
```typescript
import { selectDispatchMode } from '@/lib/dispatcher';
const result = await selectDispatchMode(tripData, availableDrivers);
// Returns: { mode, primaryDriver, chaseDriver, priceEstimate }
```

### Pricing
```typescript
import { calculatePrice } from '@/lib/dispatcher';
const price = calculatePrice('solo_scoot', 5, 18, 'clear', false);
// Returns: { base_fee, mileage_fee, surge_multiplier, total, breakdown }
```

### Insurance
```typescript
import { createPolicySession, bindPolicy, endPolicy } from '@/lib/insurance';
await createPolicySession(tripId, vehicleInfo, driverId);
await bindPolicy(policySessionId, tripId); // On Start Trip
await endPolicy(policySessionId, tripId); // On End Trip
```

## Storage Buckets

- `driver-gear-photos` - Gear verification photos
- `trunk-photos` - Trunk verification photos
- `damage-claims` - Damage claim photos

## Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## Real-time Subscriptions

### Trip Status Updates
```typescript
supabase
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
```

### Driver Locations
```typescript
supabase
  .channel('driver-locations')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'driver_locations',
    filter: `trip_id=eq.${tripId}`
  }, (payload) => {
    updateLocation(payload.new);
  })
  .subscribe();
```

## Common Queries

### Get User's Active Trip
```typescript
const { data } = await supabase
  .from('trips')
  .select('*')
  .eq('user_id', userId)
  .in('status', ['requested', 'dispatched', 'driver_arriving', 'trunk_verified', 'in_progress'])
  .single();
```

### Get Available Jobs for Driver
```typescript
const { data } = await supabase
  .from('trips')
  .select('*')
  .eq('status', 'requested')
  .or(`dispatch_mode.eq.solo_scoot,dispatch_mode.eq.chase_car`);
```

### Get Driver Gear Status
```typescript
const { data } = await supabase
  .from('driver_gear')
  .select('*')
  .eq('driver_id', driverId)
  .single();
```

## File Structure

```
lib/
  ├── supabase.ts      # Client + types
  ├── dispatcher.ts    # Dispatch + pricing
  └── insurance.ts     # Insurance stub

app/
  ├── (auth)/          # Login, signup, role-select
  ├── (user)/          # User screens
  ├── (driver)/        # Driver screens
  └── (admin)/         # Admin screens
```

## Testing Checklist (Quick)

- [ ] User can signup and select role
- [ ] User can request rescue
- [ ] Dispatcher selects mode correctly
- [ ] Price calculated with surge
- [ ] Driver can accept job
- [ ] Trunk photo taken (Solo-Scoot)
- [ ] Insurance binds on Start Trip
- [ ] Real-time tracking works
- [ ] Insurance ends on End Trip
- [ ] User can rate and tip
- [ ] Damage claim can be submitted

