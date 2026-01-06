# MVP Test Plan - Manual QA Checklist

## Pre-Testing Setup

- [ ] Supabase project created
- [ ] Database schema deployed (schema.sql)
- [ ] RLS policies deployed (rls_policies.sql)
- [ ] Storage buckets created:
  - [ ] driver-gear-photos
  - [ ] trunk-photos
  - [ ] damage-claims
- [ ] Environment variables set:
  - [ ] EXPO_PUBLIC_SUPABASE_URL
  - [ ] EXPO_PUBLIC_SUPABASE_ANON_KEY
- [ ] Test users created (at least 1 user, 2 drivers, 1 admin)
- [ ] Test vehicles added
- [ ] At least 1 driver with verified gear (Solo-Scoot)
- [ ] At least 2 drivers without gear (Chase Car)

---

## 1. Authentication & Onboarding

### User Signup
- [ ] Can create account with email/phone
- [ ] Can select role (User/Driver)
- [ ] Profile created in database
- [ ] Redirects to correct home screen based on role

### User Login
- [ ] Can login with email/phone + password
- [ ] Session persists on app restart
- [ ] Auto-redirects based on role

### Driver Onboarding
- [ ] Can upload gear photos
- [ ] Can select gear type
- [ ] Can enter device model
- [ ] Submission creates pending verification

### Admin Gear Verification
- [ ] Admin can view pending verifications
- [ ] Admin can view gear photos
- [ ] Admin can approve gear
- [ ] Admin can reject gear with notes
- [ ] Driver receives updated status

---

## 2. User Flow: Request Rescue

### Rescue Button
- [ ] One-tap button visible on home screen
- [ ] Tapping opens request flow

### Vehicle Selection
- [ ] Can select existing vehicle
- [ ] Can add new vehicle
- [ ] Vehicle info saved correctly

### Destination Entry
- [ ] Can enter destination address
- [ ] Can pick location on map
- [ ] Coordinates saved correctly

### Pickup Location
- [ ] Auto-detects current location
- [ ] Can manually adjust pickup
- [ ] Address geocoded correctly

### Dispatch & Pricing
- [ ] Dispatcher selects mode (Chase Car or Solo-Scoot)
- [ ] Price calculated correctly
- [ ] Surge multiplier applied (test peak hours)
- [ ] Price breakdown shown (base, mileage, surge, taxes, fees)
- [ ] Can confirm and create trip

---

## 3. Trip Lifecycle (User View)

### Trip Created
- [ ] Trip status = 'requested'
- [ ] Insurance session created with status 'not_started'
- [ ] Auto-navigates to trip-tracking screen

### Driver Dispatched
- [ ] Trip status updates to 'dispatched'
- [ ] Driver info displayed
- [ ] Real-time location updates visible

### Driver Arriving
- [ ] Trip status updates to 'driver_arriving'
- [ ] Map shows driver approaching
- [ ] ETA updates in real-time

### Trunk Verification (Solo-Scoot)
- [ ] Driver takes trunk photo
- [ ] Trunk log created
- [ ] Trip status updates to 'trunk_verified'
- [ ] User can view trunk photo

### Trip Started
- [ ] Driver taps "Start Trip"
- [ ] Insurance status changes to 'bound'
- [ ] Trip status updates to 'in_progress'
- [ ] Policy bound timestamp recorded

### Trip In Progress
- [ ] Real-time driver location tracking
- [ ] Route to destination shown
- [ ] ETA to destination updates

### Trip Completed
- [ ] Driver taps "End Trip"
- [ ] Insurance status changes to 'ended'
- [ ] Trip status updates to 'completed'
- [ ] Policy end timestamp recorded
- [ ] Auto-navigates to trip-complete screen

---

## 4. Rating & Tipping

### Trip Complete Screen
- [ ] Trip summary displayed
- [ ] Can rate driver (1-5 stars)
- [ ] Can add tip amount
- [ ] Can write review (optional)
- [ ] Can submit rating

### Rating Saved
- [ ] Review record created
- [ ] Rating saved to database
- [ ] Tip amount saved
- [ ] Returns to home screen

---

## 5. Damage Claims

### Report Damage
- [ ] Can access claim flow from trip-complete
- [ ] Can select trip with damage
- [ ] Can upload multiple photos
- [ ] Can select damage location
- [ ] Can enter description
- [ ] Can submit claim

### Claim Created
- [ ] Claim record created with status 'submitted'
- [ ] Photos uploaded to storage
- [ ] Trunk log linked (if available)
- [ ] User can view claim status

### Admin Review (Optional)
- [ ] Admin can view submitted claims
- [ ] Admin can change status (reviewing, approved, denied)
- [ ] Admin can add resolution notes
- [ ] User sees updated status

---

## 6. Driver Flow: Accept & Complete Job

### View Available Jobs
- [ ] Dashboard shows available trips
- [ ] Jobs filtered by driver gear (Solo-Scoot only if verified)
- [ ] Can see trip details (pickup, destination, price)

### Accept Job
- [ ] Can view full trip details
- [ ] Can accept job
- [ ] Trip status updates to 'dispatched'
- [ ] Primary driver assigned

### Navigate to Pickup
- [ ] Can see pickup location on map
- [ ] Can navigate to pickup
- [ ] Location updates in real-time (driver_locations table)

### Arrive at Pickup
- [ ] Can mark "Arrived"
- [ ] Trip status updates to 'driver_arriving'
- [ ] Timestamp recorded

### Trunk Photo (Solo-Scoot)
- [ ] Can open camera
- [ ] Can take photo of device in trunk
- [ ] Can check "Device secured" attestation
- [ ] Can add notes
- [ ] Can submit trunk log
- [ ] Trip status updates to 'trunk_verified'

### Start Trip
- [ ] Can tap "Start Trip"
- [ ] Insurance policy binds (status → 'bound')
- [ ] Trip status updates to 'in_progress'
- [ ] Started timestamp recorded

### Drive to Destination
- [ ] Can see route on map
- [ ] Location updates tracked
- [ ] Can see destination

### End Trip
- [ ] Can tap "End Trip"
- [ ] Insurance policy ends (status → 'ended')
- [ ] Trip status updates to 'completed'
- [ ] Completed timestamp recorded
- [ ] Shows earnings summary

---

## 7. Dispatch Logic

### Mode Selection: Solo-Scoot
- [ ] Selects Solo-Scoot when:
  - [ ] City density = high/medium
  - [ ] Distance < 5 miles
  - [ ] Weather = clear/sunny
  - [ ] Verified gear driver available
- [ ] Only assigns 1 driver

### Mode Selection: Chase Car
- [ ] Selects Chase Car when:
  - [ ] Distance > 10 miles
  - [ ] Weather = rain/snow/storm
  - [ ] City density = low/suburban
  - [ ] Late night (after 10 PM or before 6 AM)
  - [ ] No Solo-Scoot drivers available
- [ ] Assigns 2 drivers (primary + chase)

### Fallback Logic
- [ ] Falls back to Chase Car if no Solo-Scoot available
- [ ] Shows error if no drivers available
- [ ] Estimates wait time

---

## 8. Pricing Engine

### Base Pricing
- [ ] Chase Car: $25 base + $2.50/mile (with 1.8x multiplier)
- [ ] Solo-Scoot: $15 base + $1.75/mile
- [ ] Prices calculated correctly

### Surge Multipliers
- [ ] Normal hours (6 AM - 10 PM): 1.0x
- [ ] Peak hours (5 PM - 8 PM): 1.5x
- [ ] Late night (10 PM - 6 AM): 1.8x
- [ ] Weekend: 1.3x
- [ ] Bad weather: +20%

### Price Breakdown
- [ ] Shows base fee
- [ ] Shows mileage fee
- [ ] Shows surge amount
- [ ] Shows taxes (8%)
- [ ] Shows platform fee ($2.50)
- [ ] Shows total

---

## 9. Real-time Features

### Location Tracking
- [ ] Driver location updates in real-time
- [ ] User sees driver moving on map
- [ ] Updates via Supabase Realtime subscription

### Status Updates
- [ ] Trip status changes broadcast in real-time
- [ ] User sees status updates without refresh
- [ ] Driver sees new job assignments

---

## 10. Security & RLS

### User Access
- [ ] Users can only see their own trips
- [ ] Users can only see their own vehicles
- [ ] Users cannot see other users' data

### Driver Access
- [ ] Drivers can see assigned trips
- [ ] Drivers can see available trips
- [ ] Drivers cannot see other drivers' trips

### Admin Access
- [ ] Admins can view all trips
- [ ] Admins can view all claims
- [ ] Admins can verify gear

---

## 11. Edge Cases

### Cancellation
- [ ] User can cancel before trip starts
- [ ] Trip status updates to 'cancelled'
- [ ] Insurance session cancelled
- [ ] Drivers notified

### No Drivers Available
- [ ] Shows "No drivers available" message
- [ ] Estimates wait time
- [ ] User can retry or cancel

### Network Issues
- [ ] App handles offline gracefully
- [ ] Data syncs when connection restored
- [ ] Error messages shown

---

## 12. Performance

### Load Times
- [ ] App loads in < 3 seconds
- [ ] Screens render quickly
- [ ] Maps load smoothly

### Real-time Updates
- [ ] Location updates don't lag
- [ ] Status updates appear quickly
- [ ] No excessive battery drain

---

## Test Data Checklist

Before testing, ensure:
- [ ] 3+ test users created
- [ ] 2+ test drivers created
- [ ] 1+ driver with verified Solo-Scoot gear
- [ ] 2+ drivers without gear (Chase Car)
- [ ] 1+ test vehicle per user
- [ ] 1 admin account created

---

## Known Limitations (MVP)

- [ ] Insurance integration is stub only (logs to console)
- [ ] Dispatch is rules-based (not ML)
- [ ] Gear verification is manual (admin panel)
- [ ] Payment processing not implemented (placeholder)
- [ ] Push notifications not implemented
- [ ] Email/SMS notifications not implemented

---

## Sign-off

- [ ] All critical paths tested
- [ ] No blocking bugs found
- [ ] Ready for user testing
- [ ] Test data cleaned up (optional)

**Tester:** _________________  
**Date:** _________________  
**Version:** MVP 1.0

