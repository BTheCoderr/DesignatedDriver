import { supabase, type InsuranceSession } from './supabase';

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

export interface PolicySession {
  id: string;
  trip_id: string;
  policy_status: 'not_started' | 'bound' | 'ended';
  policy_provider: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  license_plate: string;
  driver_id: string;
  policy_created_at: string;
  policy_bound_at?: string;
  policy_ended_at?: string;
  policy_number?: string;
}

/**
 * Creates insurance policy session (stub)
 * Called when trip is created
 */
export async function createPolicySession(
  tripId: string,
  vehicleInfo: VehicleInfo,
  driverId: string
): Promise<PolicySession | null> {
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

  if (error) {
    console.error('Error creating policy session:', error);
    throw error;
  }

  // Stub: Log that policy would be created
  console.log(`[STUB] Insurance policy session created for trip ${tripId}`);
  console.log(`[STUB] Would call: POST /api/insurance/policies`);
  console.log(`[STUB] Payload:`, {
    vehicle: vehicleInfo,
    driver: driverId,
    trip: tripId
  });

  return data as PolicySession;
}

/**
 * Binds insurance policy (insurance switch event)
 * Called when driver taps "Start Trip"
 */
export async function bindPolicy(policySessionId: string, tripId: string): Promise<PolicySession | null> {
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

  if (error) {
    console.error('Error binding policy:', error);
    throw error;
  }

  // Stub: Log that policy would be bound
  console.log(`[STUB] Insurance policy bound for trip ${tripId}`);
  console.log(`[STUB] Would call: POST /api/insurance/policies/${policySessionId}/bind`);
  console.log(`[STUB] Policy active from: ${data.policy_bound_at}`);

  return data as PolicySession;
}

/**
 * Ends insurance policy
 * Called when driver taps "End Trip"
 */
export async function endPolicy(policySessionId: string, tripId: string): Promise<PolicySession | null> {
  const { data, error } = await supabase
    .from('insurance_sessions')
    .update({
      policy_status: 'ended',
      policy_ended_at: new Date().toISOString()
    })
    .eq('id', policySessionId)
    .select()
    .single();

  if (error) {
    console.error('Error ending policy:', error);
    throw error;
  }

  console.log(`[STUB] Insurance policy ended for trip ${tripId}`);
  console.log(`[STUB] Would call: POST /api/insurance/policies/${policySessionId}/end`);

  return data as PolicySession;
}

/**
 * Gets insurance session for a trip
 */
export async function getInsuranceSession(tripId: string): Promise<InsuranceSession | null> {
  const { data, error } = await supabase
    .from('insurance_sessions')
    .select('*')
    .eq('trip_id', tripId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

/**
 * Wrapper: Binds insurance policy by trip ID
 */
export async function bindInsurancePolicy(tripId: string): Promise<InsuranceSession> {
  let session = await getInsuranceSession(tripId);
  
  // If session doesn't exist, create it (fallback for trips created before insurance was added)
  if (!session) {
    console.warn('⚠️ Insurance session not found, creating one...');
    
    // Get trip details to create session
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('vehicle_id, primary_driver_id')
      .eq('id', tripId)
      .single();
    
    if (tripError || !trip) {
      throw new Error(`Trip not found: ${tripError?.message || 'Unknown error'}`);
    }
    
    // Get vehicle details (with better error handling for RLS)
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('make, model, year, license_plate')
      .eq('id', trip.vehicle_id)
      .single();
    
    if (vehicleError) {
      console.error('Vehicle query error:', vehicleError);
      // If RLS error, try to get vehicle from trip relationship
      if (vehicleError.code === '42501' || vehicleError.message?.includes('row-level security')) {
        // Try alternative: get vehicle via trip relationship
        const { data: tripWithVehicle } = await supabase
          .from('trips')
          .select(`
            vehicle_id,
            vehicles:vehicle_id (
              make, model, year, license_plate
            )
          `)
          .eq('id', tripId)
          .single();
        
        if (tripWithVehicle && (tripWithVehicle as any).vehicles) {
          const vehicleData = (tripWithVehicle as any).vehicles;
          if (vehicleData.make && vehicleData.model && vehicleData.year && vehicleData.license_plate) {
            // Use vehicle from trip relationship
            const vehicleInfo: VehicleInfo = {
              make: vehicleData.make,
              model: vehicleData.model,
              year: vehicleData.year,
              license_plate: vehicleData.license_plate,
            };
            
            const newSession = await createPolicySession(
              tripId,
              vehicleInfo,
              trip.primary_driver_id || ''
            );
            
            if (!newSession) {
              throw new Error('Failed to create insurance session');
            }
            
            session = newSession as any;
            // Skip to binding
            const result = await bindPolicy(session.id, tripId);
            if (!result) {
              throw new Error('Failed to bind insurance policy');
            }
            return result as InsuranceSession;
          }
        }
      }
      throw new Error(`Vehicle query failed: ${vehicleError.message}. Cannot create insurance session.`);
    }
    
    if (!vehicle || !vehicle.make || !vehicle.model || !vehicle.year || !vehicle.license_plate) {
      throw new Error('Vehicle details incomplete. Cannot create insurance session.');
    }
    
    // Create insurance session
    const vehicleInfo: VehicleInfo = {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      license_plate: vehicle.license_plate,
    };
    
    const newSession = await createPolicySession(
      tripId,
      vehicleInfo,
      trip.primary_driver_id || ''
    );
    
    if (!newSession) {
      throw new Error('Failed to create insurance session');
    }
    
    session = newSession as any;
  }
  
  const result = await bindPolicy(session.id, tripId);
  if (!result) {
    throw new Error('Failed to bind insurance policy');
  }
  
  // Return updated session
  return result as InsuranceSession;
}

/**
 * Wrapper: Ends insurance policy by trip ID
 */
export async function endInsurancePolicy(tripId: string): Promise<InsuranceSession> {
  const session = await getInsuranceSession(tripId);
  if (!session) {
    throw new Error('Insurance session not found for trip');
  }
  const result = await endPolicy(session.id, tripId);
  if (!result) {
    throw new Error('Failed to end insurance policy');
  }
  // Return updated session
  const updated = await getInsuranceSession(tripId);
  if (!updated) {
    throw new Error('Failed to retrieve updated insurance session');
  }
  return updated;
}
