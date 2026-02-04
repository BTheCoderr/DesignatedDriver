# YC Demo Script - Designated Driver
**Duration:** 5-6 minutes  
**City:** Boston (or your chosen demo city)

---

## PRE-DEMO SETUP

### Accounts (Create Once, Never Touch)
- ✅ `demo_user@test.com` (User)
- ✅ `demo_driver_scoot@test.com` (Solo-Scoot Driver)
- ✅ `demo_driver_chase@test.com` (Chase Car Driver)
- ✅ `demo_admin@test.com` (Admin)

### Pre-Seeded Data
- ✅ Demo user has 1 vehicle (Toyota Camry, DEMO-123)
- ✅ Solo-Scoot driver has verified gear
- ✅ 1 completed Solo-Scoot trip (with trunk photo)
- ✅ 1 completed Chase Car trip (with vehicle inspections)
- ✅ 1 damage claim (for failure state demo)

---

## PART 1 — THE PROBLEM (30 SECONDS)

**Baheem (talking, no screen yet):**
> "If you drove to the event, Uber can get you home, but it can't get your car home. People leave cars overnight, call friends, or take the risk."

**Now switch to screen.**

---

## PART 2 — ONE-TAP RESCUE (45 SECONDS)

**Screen:** User Home (`demo_user@test.com`)

**Point at RESCUE button**

**Baheem:**
> "This is Designated Driver. One tap sends a vetted driver to drive your car home."

**Tap RESCUE.**

**Screen:** Request Rescue flow

**Baheem (while selecting vehicle):**
> "You select your vehicle—we need make, model, year, license plate, and color for insurance."

**Screen:** Destination input

**Use Boston location:**
- **Pickup:** "Fenway Park, Boston" (dense city → triggers Solo-Scoot)
- **Destination:** "Back Bay Station, Boston" (or any Boston address)

**Screen:** Dispatch Result

**Let the app recommend Solo-Scoot.**

**Baheem:**
> "In dense cities, we don't send a chase car. A single driver arrives on a folding scooter, stores it in your trunk, and drives your car home."

**Point at:**
- Mode selection (Solo-Scoot)
- Price breakdown

**Baheem:**
> "Pricing is transparent—base fee plus mileage, with surge multipliers for peak times."

---

## PART 3 — LIABILITY PROOF (60 SECONDS)

**Screen:** Trip Tracking (after trip created)

**Baheem:**
> "Now the driver accepts the job and arrives at pickup."

**Switch accounts to `demo_driver_scoot@designateddriver.app`**

**Screen:** Driver Dashboard

**Tap available job → Accept**

**Screen:** Arrive Screen

**Tap "Mark Arrived"**

**Screen:** Trunk Photo Screen

**Pause here intentionally.**

**Baheem:**
> "This is where trust matters. Before driving, the driver must log a trunk photo showing how their device is stored. This protects the car."

**Show the instruction text:**
> "This photo is logged before driving to protect your vehicle."

**Tommie:**
> "This isn't optional. The trip cannot start without proof logged."

**Take photo (or use pre-uploaded photo)**

**Screen:** Drive Screen

**Tap "Start Trip"**

**Tommie:**
> "The moment this starts, the app binds an insurance session. Coverage exists only during the drive."

**Point at insurance status indicator**

---

## PART 4 — LIVE STATUS & COMPLETION (45 SECONDS)

**Switch back to `demo_user@test.com`**

**Screen:** Trip Tracking

**Show status change:**
- "Trunk Photo Verified" card appears
- Photo displays with explanation: "This photo is logged before driving to protect your vehicle."

**Baheem:**
> "The user sees real-time status updates. They can see the trunk photo was verified."

**Switch back to driver**

**Screen:** Drive Screen

**Tap "End Trip"**

**Screen:** End Trip Screen

**Show earnings summary**

**Switch back to user**

**Screen:** Trip Complete

**Baheem:**
> "When the trip ends, insurance ends. The user rates the driver and can add a tip."

**Show rating screen**

---

## PART 5 — DAMAGE CLAIM (OPTIONAL BUT POWERFUL) (45 SECONDS)

**Screen:** Trip Complete

**Tap "Report Damage"**

**Screen:** Damage Claims Screen

**Open an existing demo claim (pre-seeded)**

**Baheem:**
> "This is the US reality. We don't pretend damage can't happen. We design for it."

**Scroll through:**
- Photos (before/after vehicle inspections)
- Damage location
- Description
- Status
- Trip link

**Baheem:**
> "For chase car trips, we document vehicle condition before and after. This prevents disputes and protects both parties."

---

## PART 6 — CHASE CAR MODE (30 SECONDS)

**Screen:** Request Rescue (new trip)

**Use suburban location:**
- **Pickup:** "Newton, MA" (suburb → triggers Chase Car)
- **Destination:** "Waltham, MA"

**Screen:** Dispatch Result

**Baheem:**
> "In suburbs, we send two drivers—one drives your car, the other follows. This works better where parking is easier."

**Show Chase Car mode selection**

---

## PART 7 — CLOSE (30 SECONDS)

**Tommie:**
> "Uber moves people. We return cars."

**Baheem:**
> "We're starting city by city, owning nights and weekends. The hybrid dispatch model means we can scale efficiently—solo scooters in dense areas, chase cars in suburbs."

**Tommie:**
> "Every trip is insured, every driver is vetted, and every vehicle condition is documented. This is how you build trust in a liability-heavy market."

**End.**

---

## DEMO CHECKLIST

### Before Demo
- [ ] All demo accounts created and verified
- [ ] Demo user has vehicle added
- [ ] Solo-Scoot driver has verified gear
- [ ] 1 completed Solo-Scoot trip exists (with trunk photo)
- [ ] 1 completed Chase Car trip exists (with vehicle inspections)
- [ ] 1 damage claim exists (for failure state demo)
- [ ] Console logs turned off
- [ ] Test both flows (Solo-Scoot and Chase Car) work

### During Demo
- [ ] Use calm pacing
- [ ] Pause on trust moments (trunk photo, insurance binding)
- [ ] Point at key UI elements (trust banner, photo explanations)
- [ ] Show both dispatch modes (Solo-Scoot and Chase Car)
- [ ] Demonstrate damage claim flow

### After Demo
- [ ] Reset demo accounts (if needed)
- [ ] Document any issues encountered
- [ ] Update script based on feedback

---

## KEY TALKING POINTS

1. **Trust Moments:**
   - "Vetted drivers. Trunk photo proof. Insurance active during every trip."
   - "This photo is logged before driving to protect your vehicle."

2. **Hybrid Dispatch:**
   - "We don't force one method everywhere—the app chooses the best option in real time."

3. **Liability:**
   - "We treat insurance as an event, not a policy—coverage only exists while the driver is in the car."
   - "Before/after vehicle inspections prevent disputes."

4. **Market:**
   - "Nightlife, events, and rides already generate billions. We're building the missing half."

---

**Total Time:** 5-6 minutes  
**Perfect for YC partners skimming but leaning in.**
