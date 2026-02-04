import { type Profile } from './supabase';
import { DEMO_FORCE_MODE } from './demoConfig';

export interface TripData {
  pickup: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  distance: number; // miles
  timeOfDay: number; // 0-23
  weather: 'clear' | 'sunny' | 'rain' | 'snow' | 'storm';
  cityDensity: 'high' | 'medium' | 'low' | 'suburban';
  isWeekend: boolean;
}

export interface AvailableDriver extends Profile {
  gear_verified?: string;
  gear_type?: string;
  is_available?: boolean;
  currentLocation?: { lat: number; lng: number };
  rating?: number;
}

export interface DispatchResult {
  mode: 'chase_car' | 'solo_scoot' | null;
  primaryDriver: AvailableDriver | null;
  chaseDriver: AvailableDriver | null;
  price: PriceBreakdown;
  estimatedArrival: number | null; // minutes
  error?: string;
  waitTime?: number;
}

export interface PriceBreakdown {
  base_fee: number;
  mileage_fee: number;
  surge_multiplier: number;
  subtotal: number;
  taxes: number;
  platform_fee: number;
  total: number;
  currency: string;
  breakdown: {
    base: number;
    mileage: number;
    surge: number;
    taxes: number;
    platform_fee: number;
  };
}

const PRICING_CONFIG = {
  chase_car: {
    base_fee: 25.00,
    per_mile: 2.50,
    requires_two_drivers: true,
    driver_multiplier: 1.8,
  },
  solo_scoot: {
    base_fee: 15.00,
    per_mile: 1.75,
    requires_two_drivers: false,
    driver_multiplier: 1.0,
  },
  shadow: {
    hourly_rate: 40.00,
    minimum_hours: 2,
    base_fee: 20.00,
  },
};

const SURGE_MULTIPLIERS = {
  normal: { hours: [6, 22], multiplier: 1.0 },
  peak: { hours: [17, 20], multiplier: 1.5 },
  late_night: { hours: [22, 6], multiplier: 1.8 },
  weekend: { multiplier: 1.3 },
};

/**
 * Main dispatcher function - selects mode and drivers based on Rule 5
 */
export async function selectDispatchMode(
  tripData: TripData,
  availableDrivers: AvailableDriver[]
): Promise<DispatchResult> {
  // DEMO OVERRIDE: Check for forced mode first
  if (DEMO_FORCE_MODE) {
    const { distance, timeOfDay, weather, isWeekend } = tripData;
    
    // Filter drivers based on forced mode
    let primaryDriver: AvailableDriver | null = null;
    let chaseDriver: AvailableDriver | null = null;
    
    if (DEMO_FORCE_MODE === 'solo_scoot') {
      const soloScootDrivers = availableDrivers.filter(
        (d) => d.gear_verified === 'verified' && d.gear_type !== 'none' && d.is_available === true
      );
      primaryDriver = soloScootDrivers.length > 0 
        ? selectBestDriver(soloScootDrivers, tripData.pickup)
        : null;
    } else if (DEMO_FORCE_MODE === 'chase_car') {
      const chaseCarDrivers = availableDrivers.filter((d) => d.is_available === true);
      if (chaseCarDrivers.length >= 2) {
        const drivers = selectChaseCarPair(chaseCarDrivers, tripData.pickup);
        primaryDriver = drivers.primary;
        chaseDriver = drivers.chase;
      } else if (chaseCarDrivers.length === 1) {
        primaryDriver = chaseCarDrivers[0];
        chaseDriver = chaseCarDrivers[0]; // Use same driver for demo
      }
    }
    
    const price = calculatePrice(DEMO_FORCE_MODE, distance, timeOfDay, weather, isWeekend);
    const estimatedArrival = primaryDriver
      ? estimateArrivalTime(primaryDriver, tripData.pickup)
      : null;
    
    return {
      mode: DEMO_FORCE_MODE,
      primaryDriver,
      chaseDriver,
      price,
      estimatedArrival,
    };
  }

  const { distance, timeOfDay, weather, cityDensity, isWeekend } = tripData;

  // Rule 1 & 2: Filter available drivers
  const soloScootDrivers = availableDrivers.filter(
    (d) => d.gear_verified === 'verified' && d.gear_type !== 'none' && d.is_available === true
  );

  const chaseCarDrivers = availableDrivers.filter((d) => d.is_available === true);

  // Rule 3: Calculate feasibility scores
  let soloScootScore = 0;
  
  // Solo-Scoot scoring
  if (cityDensity === 'high' || cityDensity === 'medium') soloScootScore += 3;
  if (distance < 5) soloScootScore += 2;
  if (weather === 'clear' || weather === 'sunny') soloScootScore += 2;
  if (timeOfDay >= 6 && timeOfDay <= 22) soloScootScore += 1;

  // Check availability
  const hasSoloScootAvailability = soloScootDrivers.length > 0;
  const hasChaseCarAvailability = chaseCarDrivers.length >= 2;

  let selectedMode: 'chase_car' | 'solo_scoot' | null = null;
  let primaryDriver: AvailableDriver | null = null;
  let chaseDriver: AvailableDriver | null = null;

  // Rule 5: Decision logic (Strict adherence to Pseudocode)
  if (hasSoloScootAvailability && soloScootScore >= 5) {
    // Priority: Solo Scoot (if score is high enough)
    selectedMode = 'solo_scoot';
    primaryDriver = selectBestDriver(soloScootDrivers, tripData.pickup);
  } else if (hasChaseCarAvailability) {
    // Fallback: Chase Car
    selectedMode = 'chase_car';
    const drivers = selectChaseCarPair(chaseCarDrivers, tripData.pickup);
    primaryDriver = drivers.primary;
    chaseDriver = drivers.chase;
  } else {
    // No drivers available
    return {
      mode: null,
      primaryDriver: null,
      chaseDriver: null,
      price: {
        base_fee: 0,
        mileage_fee: 0,
        surge_multiplier: 1.0,
        subtotal: 0,
        taxes: 0,
        platform_fee: 0,
        total: 0,
        currency: 'USD',
        breakdown: {
          base: 0,
          mileage: 0,
          surge: 0,
          taxes: 0,
          platform_fee: 0,
        },
      },
      estimatedArrival: null,
      error: 'No drivers available',
      waitTime: estimateWaitTime(availableDrivers),
    };
  }

  // Calculate price
  const price = calculatePrice(selectedMode, distance, timeOfDay, weather, isWeekend);
  
  const estimatedArrival = primaryDriver
    ? estimateArrivalTime(primaryDriver, tripData.pickup)
    : null;

  return {
    mode: selectedMode,
    primaryDriver,
    chaseDriver,
    price,
    estimatedArrival,
  };
}

// --- Helper Functions ---

function selectBestDriver(drivers: AvailableDriver[], pickup: { lat: number; lng: number }): AvailableDriver {
  return drivers
    .map((d) => ({
      ...d,
      distanceToPickup: calculateDistance(d.currentLocation || { lat: 0, lng: 0 }, pickup),
    }))
    .sort((a, b) => {
      // Primary: Rating (Desc)
      if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
      // Secondary: Distance (Asc)
      return a.distanceToPickup - b.distanceToPickup;
    })[0];
}

function selectChaseCarPair(
  drivers: AvailableDriver[],
  pickup: { lat: number; lng: number }
): { primary: AvailableDriver; chase: AvailableDriver } {
  const sorted = drivers
    .map((d) => ({
      ...d,
      distanceToPickup: calculateDistance(d.currentLocation || { lat: 0, lng: 0 }, pickup),
    }))
    .sort((a, b) => a.distanceToPickup - b.distanceToPickup);

  return {
    primary: sorted[0],
    chase: sorted[1] || sorted[0], // Fallback same driver if only 1 exists (edge case)
  };
}

function calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateArrivalTime(driver: AvailableDriver, pickup: { lat: number; lng: number }): number {
  const distance = calculateDistance(driver.currentLocation || { lat: 0, lng: 0 }, pickup);
  return Math.ceil((distance / 25) * 60); // 25mph avg speed
}

function estimateWaitTime(drivers: AvailableDriver[]): number {
  return drivers.length > 0 ? 15 : 30;
}

export function calculatePrice(
  mode: 'chase_car' | 'solo_scoot' | 'shadow',
  distance: number,
  timeOfDay: number,
  weather: string,
  isWeekend: boolean = false,
  duration: number | null = null
): PriceBreakdown {
  const config = PRICING_CONFIG[mode];
  if (!config) throw new Error(`Unknown mode: ${mode}`);

  let baseFee = config.base_fee;
  let mileageFee = 0;
  let surgeMultiplier = 1.0;

  if (mode !== 'shadow') {
    // Discriminated union handling for TS
    const distanceConfig = config as typeof PRICING_CONFIG.chase_car | typeof PRICING_CONFIG.solo_scoot;
    
    mileageFee = distance * distanceConfig.per_mile;
    
    if (distanceConfig.requires_two_drivers) {
      // Chase car multiplier logic
      const mult = (distanceConfig as any).driver_multiplier || 1;
      baseFee *= mult;
      mileageFee *= mult;
    }
  } else {
    const shadowConfig = config as typeof PRICING_CONFIG.shadow;
    const hours = Math.max(duration || shadowConfig.minimum_hours, shadowConfig.minimum_hours);
    mileageFee = hours * shadowConfig.hourly_rate;
  }

  surgeMultiplier = getSurgeMultiplier(timeOfDay, isWeekend, weather);
  const subtotal = (baseFee + mileageFee) * surgeMultiplier;
  const taxRate = 0.08;
  const taxes = subtotal * taxRate;
  const platformFee = 2.5;
  const total = Math.round((subtotal + taxes + platformFee) * 100) / 100;

  return {
    base_fee: baseFee,
    mileage_fee: mileageFee,
    surge_multiplier: surgeMultiplier,
    subtotal,
    taxes,
    platform_fee: platformFee,
    total,
    currency: 'USD',
    breakdown: {
      base: baseFee,
      mileage: mileageFee,
      surge: (baseFee + mileageFee) * (surgeMultiplier - 1),
      taxes,
      platform_fee: platformFee,
    },
  };
}

function getSurgeMultiplier(timeOfDay: number, isWeekend: boolean, weather: string): number {
  let multiplier = SURGE_MULTIPLIERS.normal.multiplier;

  if (timeOfDay >= 17 && timeOfDay < 20) {
    multiplier = Math.max(multiplier, SURGE_MULTIPLIERS.peak.multiplier);
  }
  if (timeOfDay >= 22 || timeOfDay < 6) {
    multiplier = Math.max(multiplier, SURGE_MULTIPLIERS.late_night.multiplier);
  }
  if (isWeekend) {
    multiplier *= SURGE_MULTIPLIERS.weekend.multiplier;
  }
  if (['rain', 'snow', 'storm'].includes(weather)) {
    multiplier *= 1.2;
  }

  return Math.round(multiplier * 100) / 100;
}
