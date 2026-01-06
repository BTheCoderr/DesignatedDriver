import { supabase, type InsuranceSession, type Vehicle } from './supabase';

/**
 * Creates insurance policy session (stub)
 * Called when trip is created
 */
export async function createPolicySession(
  tripId: string,
  vehicleInfo: Vehicle,
  driverId: string
): Promise<InsuranceSession> {
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
      policy_created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  console.log(`[STUB] Insurance policy session created for trip ${tripId}`);
  console.log(`[STUB] Would call: POST /api/insurance/policies`);

  return data;
}

/**
 * Binds insurance policy (insurance switch event)
 * Called when driver taps "Start Trip"
 */
export async function bindPolicy(policySessionId: string, tripId: string): Promise<InsuranceSession> {
  const { data, error } = await supabase
    .from('insurance_sessions')
    .update({
      policy_status: 'bound',
      policy_bound_at: new Date().toISOString(),
      policy_number: `STUB-${Date.now()}`,
    })
    .eq('id', policySessionId)
    .select()
    .single();

  if (error) throw error;

  console.log(`[STUB] Insurance policy bound for trip ${tripId}`);
  console.log(`[STUB] Would call: POST /api/insurance/policies/${policySessionId}/bind`);

  return data;
}

/**
 * Ends insurance policy
 * Called when driver taps "End Trip"
 */
export async function endPolicy(policySessionId: string, tripId: string): Promise<InsuranceSession> {
  const { data, error } = await supabase
    .from('insurance_sessions')
    .update({
      policy_status: 'ended',
      policy_ended_at: new Date().toISOString(),
    })
    .eq('id', policySessionId)
    .select()
    .single();

  if (error) throw error;

  console.log(`[STUB] Insurance policy ended for trip ${tripId}`);
  console.log(`[STUB] Would call: POST /api/insurance/policies/${policySessionId}/end`);

  return data;
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

