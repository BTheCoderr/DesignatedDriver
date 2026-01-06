import { supabase, type Trip, type DriverGear, type Profile } from './supabase';

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
  priceEstimate: PriceBreakdown | null;
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
 * Main dispatcher function - selects mode and drivers
 */
export async function selectDispatchMode(
  tripData: TripData,
  availableDrivers: AvailableDriver[]
): Promise<DispatchResult> {
  const { distance, timeOfDay, weather, cityDensity, isWeekend } = tripData;

  // Filter available drivers
  const soloScootDrivers = availableDrivers.filter(
    (d) => d.gear_verified === 'verified' && d.gear_type !== 'none' && d.is_available === true
  );

  const chaseCarDrivers = availableDrivers.filter((d) => d.is_available === true);

  // Calculate feasibility scores
  let soloScootScore = 0;
  let chaseCarScore = 0;

  // Solo-Scoot scoring
  if (cityDensity === 'high' || cityDensity === 'medium') soloScootScore += 3;
  if (distance < 5) soloScootScore += 2;
  if (weather === 'clear' || weather === 'sunny') soloScootScore += 2;
  if (timeOfDay >= 6 && timeOfDay <= 22) soloScootScore += 1;

  // Chase Car scoring
  if (distance > 10) chaseCarScore += 3;
  if (weather === 'rain' || weather === 'snow' || weather === 'storm') chaseCarScore += 3;
  if (cityDensity === 'low' || cityDensity === 'suburban') chaseCarScore += 2;
  if (timeOfDay < 6 || timeOfDay > 22) chaseCarScore += 2;

  // Check availability
  const hasSoloScootAvailability = soloScootDrivers.length > 0;
  const hasChaseCarAvailability = chaseCarDrivers.length >= 2;

  // Decision logic
  let selectedMode: 'chase_car' | 'solo_scoot' | null = null;
  let primaryDriver: AvailableDriver | null = null;
  let chaseDriver: AvailableDriver | null = null;

  if (hasSoloScootAvailability && soloScootScore >= 5) {
    selectedMode = 'solo_scoot';
    primaryDriver = selectBestDriver(soloScootDrivers, tripData.pickup);
  } else if (hasChaseCarAvailability) {
    selectedMode = 'chase_car';
    const drivers = selectChaseCarPair(chaseCarDrivers, tripData.pickup);
    primaryDriver = drivers.primary;
    chaseDriver = drivers.chase;
  } else {
    return {
      mode: null,
      primaryDriver: null,
      chaseDriver: null,
      priceEstimate: null,
      estimatedArrival: null,
      error: 'No drivers available',
      waitTime: estimateWaitTime(availableDrivers),
    };
  }

  // Calculate price
  const priceEstimate = calculatePrice(selectedMode, distance, timeOfDay, weather, isWeekend);
  const estimatedArrival = primaryDriver
    ? estimateArrivalTime(primaryDriver, tripData.pickup)
    : null;

  return {
    mode: selectedMode,
    primaryDriver,
    chaseDriver,
    priceEstimate,
    estimatedArrival,
  };
}

function selectBestDriver(drivers: AvailableDriver[], pickup: { lat: number; lng: number }): AvailableDriver {
  return drivers
    .map((d) => ({
      ...d,
      distanceToPickup: calculateDistance(d.currentLocation || { lat: 0, lng: 0 }, pickup),
    }))
    .sort((a, b) => {
      if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
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
    chase: sorted[1] || sorted[0],
  };
}

function calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  // Haversine formula (simplified for MVP)
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
  // Assume average speed of 25 mph in city
  return Math.ceil((distance / 25) * 60); // minutes
}

function estimateWaitTime(drivers: AvailableDriver[]): number {
  // Stub: return 15 minutes if any drivers exist, 30 if none
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
    mileageFee = distance * config.per_mile;
    if (config.requires_two_drivers) {
      baseFee *= config.driver_multiplier;
      mileageFee *= config.driver_multiplier;
    }
  } else {
    const hours = Math.max(duration || config.minimum_hours, config.minimum_hours);
    mileageFee = hours * config.hourly_rate;
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

  if (weather === 'rain' || weather === 'snow' || weather === 'storm') {
    multiplier *= 1.2;
  }

  return Math.round(multiplier * 100) / 100;
}

