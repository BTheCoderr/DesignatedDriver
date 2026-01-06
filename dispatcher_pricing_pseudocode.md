# Dispatcher & Pricing Engine Pseudocode

## DISPATCHER LOGIC (Rules-Based)

```javascript
// dispatcher.js

/**
 * Selects dispatch mode based on rules
 * @param {Object} tripData - { pickup, destination, distance, timeOfDay, weather }
 * @param {Array} availableDrivers - List of available drivers with gear status
 * @returns {Object} - { mode, primaryDriver, chaseDriver, priceEstimate }
 */
function selectDispatchMode(tripData, availableDrivers) {
  const {
    pickup,
    destination,
    distance,
    timeOfDay,
    weather,
    cityDensity
  } = tripData;

  // Rule 1: Check for verified Solo-Scoot drivers
  const soloScootDrivers = availableDrivers.filter(d => 
    d.gear_verified === 'verified' && 
    d.gear_type !== 'none' &&
    d.is_available === true
  );

  // Rule 2: Check for chase car drivers (need 2)
  const chaseCarDrivers = availableDrivers.filter(d => 
    d.is_available === true
  );

  // Rule 3: Calculate feasibility scores
  let soloScootScore = 0;
  let chaseCarScore = 0;

  // Solo-Scoot feasibility factors
  if (cityDensity === 'high' || cityDensity === 'medium') {
    soloScootScore += 3;
  }
  if (distance < 5) { // Under 5 miles
    soloScootScore += 2;
  }
  if (weather === 'clear' || weather === 'sunny') {
    soloScootScore += 2;
  }
  if (timeOfDay >= 6 && timeOfDay <= 22) { // Daytime
    soloScootScore += 1;
  }

  // Chase Car feasibility factors
  if (distance > 10) {
    chaseCarScore += 3;
  }
  if (weather === 'rain' || weather === 'snow' || weather === 'storm') {
    chaseCarScore += 3;
  }
  if (cityDensity === 'low' || cityDensity === 'suburban') {
    chaseCarScore += 2;
  }
  if (timeOfDay < 6 || timeOfDay > 22) { // Late night
    chaseCarScore += 2;
  }

  // Rule 4: Availability check
  const hasSoloScootAvailability = soloScootDrivers.length > 0;
  const hasChaseCarAvailability = chaseCarDrivers.length >= 2;

  // Rule 5: Decision logic
  let selectedMode;
  let primaryDriver = null;
  let chaseDriver = null;

  if (hasSoloScootAvailability && soloScootScore >= 5) {
    // Solo-Scoot is feasible and available
    selectedMode = 'solo_scoot';
    primaryDriver = selectBestDriver(soloScootDrivers, pickup);
  } else if (hasChaseCarAvailability) {
    // Fall back to Chase Car
    selectedMode = 'chase_car';
    const drivers = selectChaseCarPair(chaseCarDrivers, pickup);
    primaryDriver = drivers.primary;
    chaseDriver = drivers.chase;
  } else {
    // No availability - return null or wait
    return {
      mode: null,
      error: 'No drivers available',
      waitTime: estimateWaitTime(availableDrivers)
    };
  }

  // Calculate price estimate
  const priceEstimate = calculatePrice(selectedMode, distance, timeOfDay, weather);

  return {
    mode: selectedMode,
    primaryDriver,
    chaseDriver,
    priceEstimate,
    estimatedArrival: estimateArrivalTime(primaryDriver, pickup)
  };
}

/**
 * Selects best driver from available pool
 */
function selectBestDriver(drivers, pickupLocation) {
  // Sort by: rating (desc), distance to pickup (asc), response time (asc)
  return drivers
    .map(d => ({
      ...d,
      distanceToPickup: calculateDistance(d.currentLocation, pickupLocation)
    }))
    .sort((a, b) => {
      // Primary: rating
      if (b.rating !== a.rating) return b.rating - a.rating;
      // Secondary: distance
      return a.distanceToPickup - b.distanceToPickup;
    })[0];
}

/**
 * Selects primary + chase driver pair
 */
function selectChaseCarPair(drivers, pickupLocation) {
  const sorted = drivers
    .map(d => ({
      ...d,
      distanceToPickup: calculateDistance(d.currentLocation, pickupLocation)
    }))
    .sort((a, b) => a.distanceToPickup - b.distanceToPickup);

  return {
    primary: sorted[0],
    chase: sorted[1] || sorted[0] // Fallback if only one driver
  };
}
```

## PRICING ENGINE

```javascript
// pricing.js

const PRICING_CONFIG = {
  chase_car: {
    base_fee: 25.00,
    per_mile: 2.50,
    requires_two_drivers: true,
    driver_multiplier: 1.8 // Cost reflects 2 drivers
  },
  solo_scoot: {
    base_fee: 15.00,
    per_mile: 1.75,
    requires_two_drivers: false
  },
  shadow: {
    hourly_rate: 40.00,
    minimum_hours: 2,
    base_fee: 20.00
  }
};

const SURGE_MULTIPLIERS = {
  normal: {
    hours: [6, 22], // 6 AM - 10 PM
    multiplier: 1.0
  },
  peak: {
    hours: [17, 20], // 5 PM - 8 PM
    multiplier: 1.5
  },
  late_night: {
    hours: [22, 6], // 10 PM - 6 AM (next day)
    multiplier: 1.8
  },
  weekend: {
    multiplier: 1.3
  }
};

/**
 * Calculates trip price
 * @param {string} mode - 'chase_car' | 'solo_scoot' | 'shadow'
 * @param {number} distance - Miles
 * @param {number} timeOfDay - Hour (0-23)
 * @param {string} weather - Weather condition
 * @param {boolean} isWeekend - Is it weekend?
 * @param {number} duration - Optional: hours (for shadow mode)
 * @returns {Object} - Price breakdown
 */
function calculatePrice(mode, distance, timeOfDay, weather, isWeekend = false, duration = null) {
  const config = PRICING_CONFIG[mode];
  if (!config) throw new Error(`Unknown mode: ${mode}`);

  let baseFee = config.base_fee;
  let mileageFee = 0;
  let surgeMultiplier = 1.0;

  // Calculate base + mileage (for chase_car and solo_scoot)
  if (mode !== 'shadow') {
    mileageFee = distance * config.per_mile;
    
    // Apply driver multiplier for chase car
    if (config.requires_two_drivers) {
      baseFee *= config.driver_multiplier;
      mileageFee *= config.driver_multiplier;
    }
  } else {
    // Shadow mode: hourly
    const hours = Math.max(duration || config.minimum_hours, config.minimum_hours);
    mileageFee = hours * config.hourly_rate;
  }

  // Calculate surge multiplier
  surgeMultiplier = getSurgeMultiplier(timeOfDay, isWeekend, weather);

  // Calculate subtotal
  const subtotal = (baseFee + mileageFee) * surgeMultiplier;

  // Taxes/fees (placeholder - adjust per state)
  const taxRate = 0.08; // 8% example
  const taxes = subtotal * taxRate;
  const platformFee = 2.50; // Flat platform fee

  const total = subtotal + taxes + platformFee;

  return {
    base_fee: baseFee,
    mileage_fee: mileageFee,
    surge_multiplier: surgeMultiplier,
    subtotal: subtotal,
    taxes: taxes,
    platform_fee: platformFee,
    total: Math.round(total * 100) / 100, // Round to 2 decimals
    currency: 'USD',
    breakdown: {
      base: baseFee,
      mileage: mileageFee,
      surge: (baseFee + mileageFee) * (surgeMultiplier - 1),
      taxes: taxes,
      platform_fee: platformFee
    }
  };
}

/**
 * Gets surge multiplier based on time and conditions
 */
function getSurgeMultiplier(timeOfDay, isWeekend, weather) {
  let multiplier = SURGE_MULTIPLIERS.normal.multiplier;

  // Check time-based surge
  if (timeOfDay >= 17 && timeOfDay < 20) {
    multiplier = Math.max(multiplier, SURGE_MULTIPLIERS.peak.multiplier);
  }
  if (timeOfDay >= 22 || timeOfDay < 6) {
    multiplier = Math.max(multiplier, SURGE_MULTIPLIERS.late_night.multiplier);
  }

  // Weekend multiplier
  if (isWeekend) {
    multiplier *= SURGE_MULTIPLIERS.weekend.multiplier;
  }

  // Weather multiplier (bad weather = higher surge)
  if (weather === 'rain' || weather === 'snow' || weather === 'storm') {
    multiplier *= 1.2;
  }

  return Math.round(multiplier * 100) / 100;
}
```

## INSURANCE SWITCH STUB

```javascript
// insurance.js

/**
 * Creates insurance policy session (stub)
 * Called when trip is created
 */
async function createPolicySession(tripId, vehicleInfo, driverId) {
  // In production, this would call real insurance API
  // For MVP, just create a record with 'not_started' status
  
  const { data, error } = await supabase
    .from('insurance_sessions')
    .insert({
      trip_id: tripId,
      policy_status: 'not_started',
      policy_provider: 'stub_provider',
      vehicle_make: vehicleInfo.make,
      vehicle_model: vehicleInfo.model,
      vehicle_year: vehicleInfo.year,
      license_plate: vehicleInfo.license_plate,
      driver_id: driverId,
      policy_created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Stub: Log that policy would be created
  console.log(`[STUB] Insurance policy session created for trip ${tripId}`);
  console.log(`[STUB] Would call: POST /api/insurance/policies`);
  console.log(`[STUB] Payload:`, {
    vehicle: vehicleInfo,
    driver: driverId,
    trip: tripId
  });

  return data;
}

/**
 * Binds insurance policy (insurance switch event)
 * Called when driver taps "Start Trip"
 */
async function bindPolicy(policySessionId, tripId) {
  // Update status to 'bound'
  const { data, error } = await supabase
    .from('insurance_sessions')
    .update({
      policy_status: 'bound',
      policy_bound_at: new Date().toISOString(),
      policy_number: `STUB-${Date.now()}` // Stub policy number
    })
    .eq('id', policySessionId)
    .select()
    .single();

  if (error) throw error;

  // Stub: Log that policy would be bound
  console.log(`[STUB] Insurance policy bound for trip ${tripId}`);
  console.log(`[STUB] Would call: POST /api/insurance/policies/${policySessionId}/bind`);
  console.log(`[STUB] Policy active from: ${data.policy_bound_at}`);

  return data;
}

/**
 * Ends insurance policy
 * Called when driver taps "End Trip"
 */
async function endPolicy(policySessionId, tripId) {
  const { data, error } = await supabase
    .from('insurance_sessions')
    .update({
      policy_status: 'ended',
      policy_ended_at: new Date().toISOString()
    })
    .eq('id', policySessionId)
    .select()
    .single();

  if (error) throw error;

  console.log(`[STUB] Insurance policy ended for trip ${tripId}`);
  console.log(`[STUB] Would call: POST /api/insurance/policies/${policySessionId}/end`);

  return data;
}
```

