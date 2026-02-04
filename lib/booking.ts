import { supabase } from './supabase';
import { selectDispatchMode, type TripData, type AvailableDriver } from './dispatcher';
import { createPolicySession, type VehicleInfo } from './insurance';

export interface BookingRequest {
  userId: string;
  vehicleId: string;
  pickup: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  cityDensity: 'high' | 'medium' | 'low' | 'suburban';
}

/**
 * Orchestrates the full booking flow:
 * 1. Fetches available drivers
 * 2. Runs dispatch logic (Solo vs Chase)
 * 3. Creates Trip record in Supabase
 * 4. Initializes Insurance Session
 */
export async function createBooking(request: BookingRequest) {
  try {
    console.log("📍 Starting booking flow for user:", request.userId);

    // 1. Fetch Vehicle Details (needed for Insurance)
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', request.vehicleId)
      .single();

    if (vehicleError || !vehicle) throw new Error("Vehicle not found");

    // Validate required vehicle fields for insurance
    if (!vehicle.license_plate || !vehicle.make || !vehicle.model || !vehicle.year) {
      throw new Error("Vehicle missing required fields for insurance (make, model, year, license_plate)");
    }

    // 2. Fetch & Map Available Drivers
    // (In a real app, you'd filter by 'is_online' boolean in DB)
    const drivers = await fetchAvailableDrivers();
    
    // 3. Prepare Trip Data for Dispatcher
    // Calculate approximate distance (Haversine included in dispatcher, but needed here for context if API available)
    // For MVP, we let the dispatcher calc distance using coords
    const tripData: TripData = {
      pickup: request.pickup,
      destination: request.destination,
      distance: calculateApproxDistance(request.pickup, request.destination),
      timeOfDay: new Date().getHours(),
      weather: 'clear', // Hardcoded for MVP (or fetch from weather API)
      cityDensity: request.cityDensity,
      isWeekend: isWeekend(),
    };

    // 4. Run Dispatch Logic
    const dispatchResult = await selectDispatchMode(tripData, drivers);

    if (!dispatchResult.mode || !dispatchResult.primaryDriver) {
      throw new Error(`Booking Failed: ${dispatchResult.error || 'No drivers available'}`);
    }

    console.log(`✅ Dispatch Successful. Mode: ${dispatchResult.mode}`);

    // 5. Create Trip Record in Supabase
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        user_id: request.userId,
        vehicle_id: request.vehicleId,
        dispatch_mode: dispatchResult.mode,
        status: 'dispatched', // skipping 'requested' since we auto-assigned
        
        // Location Data
        pickup_latitude: request.pickup.lat,
        pickup_longitude: request.pickup.lng,
        pickup_address: request.pickup.address,
        destination_latitude: request.destination.lat,
        destination_longitude: request.destination.lng,
        destination_address: request.destination.address,

        // Drivers
        primary_driver_id: dispatchResult.primaryDriver.id,
        chase_driver_id: dispatchResult.chaseDriver?.id || null,

        // Pricing
        base_fee: dispatchResult.price.base_fee,
        mileage_fee: dispatchResult.price.mileage_fee,
        surge_multiplier: dispatchResult.price.surge_multiplier,
        total_price: dispatchResult.price.total,
        currency: 'USD',

        // Estimates
        estimated_distance_miles: tripData.distance,
        estimated_duration_minutes: dispatchResult.estimatedArrival,
      })
      .select()
      .single();

    if (tripError) throw tripError;

    // 6. Initialize Insurance Session (Stub)
    const vehicleInfo: VehicleInfo = {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year!,
      license_plate: vehicle.license_plate!
    };

    await createPolicySession(trip.id, vehicleInfo, dispatchResult.primaryDriver.id);

    return trip;

  } catch (error) {
    console.error("❌ Booking Error:", error);
    throw error;
  }
}

// --- Helpers ---

async function fetchAvailableDrivers(): Promise<AvailableDriver[]> {
  // Fetch profiles with role 'driver' and their gear status
  const { data: drivers, error } = await supabase
    .from('profiles')
    .select(`
      id, email, phone, full_name, role, created_at, updated_at,
      driver_gear ( verification_status, gear_type )
    `)
    .eq('role', 'driver');

  if (error) throw error;

  // Mocking location/availability for MVP since not in schema yet
  // In production, join with 'driver_locations'
  return (drivers || []).map(d => ({
    ...d,
    is_available: true, // Assume online for MVP
    gear_verified: (d.driver_gear as any)?.[0]?.verification_status || 'none',
    gear_type: (d.driver_gear as any)?.[0]?.gear_type || 'none',
    currentLocation: { lat: 41.8240, lng: -71.4128 }, // Mock: Providence downtown
    rating: 4.8 // Mock rating
  })) as AvailableDriver[];
}

function calculateApproxDistance(p1: {lat: number, lng: number}, p2: {lat: number, lng: number}) {
  // Simple straight line dist for initial estimate
  const R = 3959; 
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180; 
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function isWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}
