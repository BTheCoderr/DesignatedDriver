import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl || 'MISSING');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');
  console.error('Please check your .env file in the project root');
} else {
  console.log('✓ Supabase configured');
  console.log('URL:', supabaseUrl);
  console.log('Key:', `${supabaseAnonKey.substring(0, 20)}...`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web', // Enable for web to detect auth redirects
  },
});

// Database types (simplified for MVP)
export type Profile = {
  id: string;
  email: string | null;
  phone: string;
  full_name: string | null;
  role: 'user' | 'driver' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Vehicle = {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number | null;
  license_plate: string | null;
  color: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Trip = {
  id: string;
  user_id: string;
  vehicle_id: string;
  dispatch_mode: 'chase_car' | 'solo_scoot' | 'shadow';
  status: 'requested' | 'dispatched' | 'driver_arriving' | 'trunk_verified' | 'in_progress' | 'completed' | 'cancelled';
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  pickup_address: string | null;
  destination_latitude: number | null;
  destination_longitude: number | null;
  destination_address: string;
  primary_driver_id: string | null;
  chase_driver_id: string | null;
  base_fee: number | null;
  mileage_fee: number | null;
  surge_multiplier: number;
  total_price: number | null;
  currency: string;
  estimated_distance_miles: number | null;
  estimated_duration_minutes: number | null;
  requested_at: string;
  dispatched_at: string | null;
  driver_arrived_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  user_notes: string | null;
  requires_trunk_fit: boolean;
  created_at: string;
  updated_at: string;
};

export type DriverGear = {
  id: string;
  driver_id: string;
  gear_type: 'folding_scooter' | 'folding_bike' | 'other' | 'none';
  verification_status: 'none' | 'pending' | 'verified' | 'rejected';
  device_model: string | null;
  photo_urls: string[];
  admin_notes: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TrunkLog = {
  id: string;
  trip_id: string;
  driver_id: string;
  before_photo_url: string | null;
  after_photo_url: string | null;
  device_secured: boolean;
  driver_attestation: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InsuranceSession = {
  id: string;
  trip_id: string;
  policy_status: 'not_started' | 'bound' | 'ended' | 'cancelled';
  policy_provider: string;
  policy_number: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  license_plate: string | null;
  driver_id: string | null;
  policy_created_at: string | null;
  policy_bound_at: string | null;
  policy_ended_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Claim = {
  id: string;
  trip_id: string;
  user_id: string;
  status: 'submitted' | 'reviewing' | 'approved' | 'denied' | 'paid';
  description: string;
  photo_urls: string[];
  damage_location: string | null;
  trunk_log_id: string | null;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  claim_amount: number | null;
  approved_amount: number | null;
  created_at: string;
  updated_at: string;
};

export type DriverLocation = {
  id: string;
  driver_id: string;
  trip_id: string | null;
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  is_primary_driver: boolean;
  is_chase_vehicle: boolean;
  created_at: string;
};

