import { supabase } from './supabase';
import { calculatePrice, selectPreferredMode, type TripData } from './dispatcher';

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
 * Creates a customer trip request.
 *
 * Driver assignment is intentionally a separate step. Drivers claim requested
 * trips through the claim_trip RPC so customers never need permission to read
 * the driver directory or assign driver IDs themselves.
 */
export async function createBooking(request: BookingRequest) {
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('id, user_id, make, model, year, license_plate')
    .eq('id', request.vehicleId)
    .eq('user_id', request.userId)
    .single();

  if (vehicleError || !vehicle) {
    throw new Error('Vehicle not found');
  }

  if (!vehicle.license_plate || !vehicle.make || !vehicle.model || !vehicle.year) {
    throw new Error('Vehicle missing required fields (make, model, year, license plate)');
  }

  const distance = calculateApproxDistance(request.pickup, request.destination);
  const timeOfDay = new Date().getHours();
  const weekend = isWeekend();

  const tripData: TripData = {
    pickup: request.pickup,
    destination: request.destination,
    distance,
    timeOfDay,
    weather: 'clear',
    cityDensity: request.cityDensity,
    isWeekend: weekend,
  };

  const dispatchMode = selectPreferredMode(tripData);
  const price = calculatePrice(
    dispatchMode,
    distance,
    timeOfDay,
    tripData.weather,
    weekend
  );

  const estimatedDurationMinutes = Math.max(5, Math.ceil((distance / 25) * 60));

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert({
      user_id: request.userId,
      vehicle_id: request.vehicleId,
      dispatch_mode: dispatchMode,
      status: 'requested',
      pickup_latitude: request.pickup.lat,
      pickup_longitude: request.pickup.lng,
      pickup_address: request.pickup.address,
      destination_latitude: request.destination.lat,
      destination_longitude: request.destination.lng,
      destination_address: request.destination.address,
      primary_driver_id: null,
      chase_driver_id: null,
      base_fee: price.base_fee,
      mileage_fee: price.mileage_fee,
      surge_multiplier: price.surge_multiplier,
      total_price: price.total,
      currency: price.currency,
      estimated_distance_miles: distance,
      estimated_duration_minutes: estimatedDurationMinutes,
    })
    .select()
    .single();

  if (tripError) throw tripError;

  return trip;
}

function calculateApproxDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
) {
  const earthRadiusMiles = 3959;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

function isWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}
