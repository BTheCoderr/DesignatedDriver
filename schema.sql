-- ============================================
-- CHAUFFER MVP DATABASE SCHEMA
-- Supabase PostgreSQL Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'driver', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles (user's cars)
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  license_plate TEXT,
  color TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver gear verification
CREATE TABLE public.driver_gear (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gear_type TEXT NOT NULL CHECK (gear_type IN ('folding_scooter', 'folding_bike', 'other', 'none')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected')),
  device_model TEXT,
  photo_urls TEXT[], -- Array of Supabase storage URLs
  admin_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips (core entity)
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  
  -- Dispatch mode
  dispatch_mode TEXT NOT NULL CHECK (dispatch_mode IN ('chase_car', 'solo_scoot', 'shadow')),
  
  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested', 
    'dispatched', 
    'driver_arriving', 
    'trunk_verified', 
    'in_progress', 
    'completed', 
    'cancelled'
  )),
  
  -- Location data
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  pickup_address TEXT,
  destination_latitude DECIMAL(10, 8),
  destination_longitude DECIMAL(11, 8),
  destination_address TEXT NOT NULL,
  
  -- Driver assignments
  primary_driver_id UUID REFERENCES public.profiles(id),
  chase_driver_id UUID REFERENCES public.profiles(id), -- Nullable, only for chase_car mode
  
  -- Pricing breakdown
  base_fee DECIMAL(10, 2),
  mileage_fee DECIMAL(10, 2),
  surge_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  total_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Distance/time estimates
  estimated_distance_miles DECIMAL(8, 2),
  estimated_duration_minutes INTEGER,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  dispatched_at TIMESTAMPTZ,
  driver_arrived_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- User notes
  user_notes TEXT,
  requires_trunk_fit BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trunk log (photo verification)
CREATE TABLE public.trunk_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Photos
  before_photo_url TEXT, -- Device in trunk before trip
  after_photo_url TEXT, -- Optional: after trip
  
  -- Verification
  device_secured BOOLEAN DEFAULT false,
  driver_attestation BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance policy sessions
CREATE TABLE public.insurance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  
  policy_status TEXT NOT NULL DEFAULT 'not_started' CHECK (policy_status IN ('not_started', 'bound', 'ended', 'cancelled')),
  policy_provider TEXT DEFAULT 'stub_provider',
  policy_number TEXT, -- Stub for now
  
  -- Vehicle info snapshot
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  license_plate TEXT,
  
  -- Driver info
  driver_id UUID REFERENCES public.profiles(id),
  
  -- Timestamps
  policy_created_at TIMESTAMPTZ,
  policy_bound_at TIMESTAMPTZ, -- When driver taps "Start Trip"
  policy_ended_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Damage claims
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'denied', 'paid')),
  
  -- Damage details
  description TEXT NOT NULL,
  photo_urls TEXT[], -- Array of damage photos
  damage_location TEXT, -- e.g., "front bumper", "rear passenger door"
  
  -- Link to trunk log for before/after comparison
  trunk_log_id UUID REFERENCES public.trunk_logs(id),
  
  -- Resolution
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  
  -- Financial
  claim_amount DECIMAL(10, 2),
  approved_amount DECIMAL(10, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver location tracking (for real-time updates)
CREATE TABLE public.driver_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id),
  
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2), -- Direction in degrees
  speed DECIMAL(6, 2), -- mph
  
  is_primary_driver BOOLEAN DEFAULT true, -- false for chase driver
  is_chase_vehicle BOOLEAN DEFAULT false, -- true if this is the chase car location
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip ratings and tips
CREATE TABLE public.trip_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL UNIQUE REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  tip_amount DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_primary_driver ON public.trips(primary_driver_id);
CREATE INDEX idx_trips_requested_at ON public.trips(requested_at DESC);
CREATE INDEX idx_driver_gear_driver_id ON public.driver_gear(driver_id);
CREATE INDEX idx_driver_gear_status ON public.driver_gear(verification_status);
CREATE INDEX idx_driver_locations_driver_id ON public.driver_locations(driver_id);
CREATE INDEX idx_driver_locations_trip_id ON public.driver_locations(trip_id);
CREATE INDEX idx_driver_locations_created_at ON public.driver_locations(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_gear_updated_at BEFORE UPDATE ON public.driver_gear
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trunk_logs_updated_at BEFORE UPDATE ON public.trunk_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_sessions_updated_at BEFORE UPDATE ON public.insurance_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS (Supabase Storage)
-- ============================================
-- Note: These need to be created via Supabase Dashboard or API
-- Buckets needed:
-- - driver-gear-photos (public read, authenticated write)
-- - trunk-photos (authenticated read/write)
-- - damage-claims (authenticated read/write)
-- - driver-documents (authenticated read/write)

