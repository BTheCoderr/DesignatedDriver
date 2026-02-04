# Operational Documentation - Designated Driver
**Internal Use - For YC Conviction & Scaling Planning**

---

## DRIVER SUPPLY & OPERATIONS

### Driver Types

**1. Solo-Scoot Drivers**
- **Equipment Required:** Folding scooter OR folding e-bike
- **Gear Cost:** $300-$800 (one-time)
- **Verification:** Photo upload → Admin approval
- **Use Case:** Dense urban areas (Boston, NYC, SF, etc.)
- **Advantage:** Single driver, lower cost, faster dispatch

**2. Chase Car Drivers**
- **Equipment Required:** Personal vehicle (chase car)
- **Gear Cost:** $0 (uses existing vehicle)
- **Verification:** Driver's license, vehicle registration
- **Use Case:** Suburbs, lower-density areas
- **Advantage:** No gear investment, easier onboarding

**3. Shadow Drivers** (Future)
- **Equipment Required:** None
- **Use Case:** Hourly service (driver stays with car)
- **Status:** Post-MVP

---

## EXPECTED DRIVER MIX

### By City Type

**Dense Cities (Boston, NYC, SF, Chicago)**
- **Solo-Scoot:** 30-40% of trips
- **Chase Car:** 60-70% of trips
- **Rationale:** High parking costs, traffic density favors scooters

**Suburban Markets (Newton, Waltham, etc.)**
- **Solo-Scoot:** 10-20% of trips
- **Chase Car:** 80-90% of trips
- **Rationale:** Easier parking, longer distances favor chase cars

**Mixed Markets (Providence, Hartford)**
- **Solo-Scoot:** 20-30% of trips
- **Chase Car:** 70-80% of trips
- **Rationale:** City center = scooters, suburbs = chase cars

---

## DRIVER ONBOARDING CAPACITY

### Solo-Scoot Drivers
- **Time to Verify:** 24-48 hours (admin review)
- **Bottleneck:** Admin verification (can be automated later)
- **Monthly Capacity:** ~50-100 drivers per admin (manual review)
- **With Automation:** Unlimited (auto-approve based on photo quality)

### Chase Car Drivers
- **Time to Verify:** Immediate (background check only)
- **Bottleneck:** Background check processing (3rd party)
- **Monthly Capacity:** ~200-500 drivers (depends on background check provider)

---

## DRIVERS NEEDED PER CITY

### Minimum Viable Coverage

**Small City (Providence, RI)**
- **Solo-Scoot:** 5-10 drivers
- **Chase Car:** 15-20 drivers
- **Total:** 20-30 drivers
- **Coverage:** Weekends + peak nights (Fri-Sat 8pm-2am)

**Medium City (Boston, MA)**
- **Solo-Scoot:** 20-30 drivers
- **Chase Car:** 40-50 drivers
- **Total:** 60-80 drivers
- **Coverage:** 7 days/week, extended hours

**Large City (NYC, SF)**
- **Solo-Scoot:** 50-100 drivers
- **Chase Car:** 100-150 drivers
- **Total:** 150-250 drivers
- **Coverage:** 24/7 availability

### Scaling Assumptions
- **Driver Utilization:** 2-4 trips per driver per night (peak)
- **Peak Hours:** Friday/Saturday 10pm-2am
- **Off-Peak:** 1-2 trips per driver per night
- **Driver Retention:** 60-70% monthly retention (similar to rideshare)

---

## INSURANCE NARRATIVE

### The One-Liner (Use This Every Time)

> **"We treat insurance as an event, not a policy—coverage only exists while the driver is in the car."**

### Full Explanation

**Traditional Model (Problem):**
- Car insurance is a continuous policy
- Coverage exists 24/7, even when car is parked
- Premiums are high because risk is always present

**Our Model (Solution):**
- Insurance is event-based
- Coverage starts when driver taps "Start Trip"
- Coverage ends when driver taps "End Trip"
- Premiums are lower because risk exists only during active trips

### Technical Implementation

**Insurance Session Lifecycle:**
1. **Trip Created** → Insurance session created (`not_started`)
2. **Driver Starts Trip** → Insurance bound (`bound`) ← **Coverage Active**
3. **Driver Ends Trip** → Insurance ended (`ended`) ← **Coverage Ends**

**Key Points:**
- No coverage when car is parked
- No coverage during driver transit to pickup
- Coverage only during actual driving
- This reduces liability window by ~80%

### US Liability Reality

**Why This Matters:**
- US is litigation-heavy
- Car damage claims are common
- Traditional insurance is expensive
- Event-based insurance reduces costs

**Our Protection:**
- Before/after vehicle inspections (chase car mode)
- Trunk photo documentation (solo-scoot mode)
- Timestamped insurance sessions
- Built-in damage claim flow

---

## PRICING & ECONOMICS

### Driver Earnings

**Solo-Scoot Driver:**
- **Base Fee:** $25-35 per trip
- **Mileage:** $0.50-1.00 per mile
- **Average Trip:** $35-50
- **Peak Hours:** 1.5x surge multiplier
- **Nightly Potential:** $100-200 (2-4 trips)

**Chase Car Driver:**
- **Base Fee:** $35-45 per trip
- **Mileage:** $0.50-1.00 per mile
- **Average Trip:** $50-70
- **Peak Hours:** 1.5x surge multiplier
- **Nightly Potential:** $150-300 (2-4 trips)

### Platform Economics

**Take Rate:** 20-25% (similar to rideshare)
- **User Pays:** $50
- **Driver Gets:** $40
- **Platform Gets:** $10

**Unit Economics (Per Trip):**
- **Revenue:** $10
- **Insurance Cost:** $2-3 (event-based)
- **Payment Processing:** $0.30
- **Support/Operations:** $1-2
- **Net Margin:** $5-7 per trip

---

## MARKET SIZE & OPPORTUNITY

### Addressable Market

**Nightlife & Events:**
- Bars, clubs, concerts, sports events
- **Market Size:** $50B+ annually (US)
- **Our Slice:** 1-2% = $500M-$1B

**Rideshare Adjacent:**
- People who drive to events
- Need to get car home
- **Market Size:** 30-40% of rideshare users
- **Our Slice:** 5-10% = $2-5B

**Total Addressable Market:** $2.5-6B annually (US)

---

## SCALING STRATEGY

### Phase 1: Single City (Providence, RI)
- **Goal:** Prove unit economics
- **Timeline:** 3-6 months
- **Drivers:** 20-30
- **Trips:** 100-200 per month
- **Focus:** Product-market fit, operational efficiency

### Phase 2: Regional Expansion (New England)
- **Goal:** Prove scalability
- **Timeline:** 6-12 months
- **Cities:** Boston, Hartford, Worcester
- **Drivers:** 100-150 total
- **Trips:** 500-1000 per month
- **Focus:** Driver supply, brand awareness

### Phase 3: National Expansion
- **Goal:** Market leadership
- **Timeline:** 12-24 months
- **Cities:** Top 20 metro areas
- **Drivers:** 1000+ total
- **Trips:** 10,000+ per month
- **Focus:** Network effects, operational excellence

---

## KEY METRICS TO TRACK

### Product Metrics
- Trip completion rate
- Average trip distance
- Dispatch mode selection (Solo-Scoot vs Chase Car)
- User retention rate
- Driver retention rate

### Operational Metrics
- Driver utilization (trips per driver per night)
- Average response time (request → driver accepts)
- Average pickup time (driver accepts → arrives)
- Average trip duration
- Peak hour capacity

### Financial Metrics
- Revenue per trip
- Cost per trip (insurance, payment processing)
- Net margin per trip
- Customer acquisition cost (CAC)
- Lifetime value (LTV)

---

## RISKS & MITIGATION

### Driver Supply Risk
- **Risk:** Not enough drivers during peak hours
- **Mitigation:** Surge pricing, driver incentives, flexible scheduling

### Insurance Risk
- **Risk:** High insurance costs eat margins
- **Mitigation:** Event-based insurance, before/after documentation

### Liability Risk
- **Risk:** Damage claims, accidents
- **Mitigation:** Comprehensive documentation, clear T&Cs, insurance coverage

### Market Risk
- **Risk:** Low adoption, competition
- **Mitigation:** Focus on single city first, build network effects, differentiate on trust

---

**Last Updated:** January 25, 2026  
**Next Review:** After Providence pilot (3 months)
