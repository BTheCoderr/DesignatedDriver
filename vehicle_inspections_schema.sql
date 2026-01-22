-- Vehicle inspections table for before/after photos (chase car mode)
-- This documents the customer's vehicle condition at pickup and dropoff

CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Inspection type
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('before', 'after')),
  
  -- Photos (multiple angles like Turo)
  photo_urls TEXT[] NOT NULL, -- Array of vehicle condition photos
  
  -- Notes
  notes TEXT,
  driver_attestation BOOLEAN DEFAULT false, -- Driver confirms photos are accurate
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one before and one after per trip
  UNIQUE(trip_id, inspection_type)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_trip_id ON public.vehicle_inspections(trip_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_driver_id ON public.vehicle_inspections(driver_id);

-- Update trigger
CREATE TRIGGER update_vehicle_inspections_updated_at 
  BEFORE UPDATE ON public.vehicle_inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own inspections
CREATE POLICY "Drivers can view their inspections"
  ON public.vehicle_inspections FOR SELECT
  USING (driver_id = auth.uid());

-- Users can view inspections for their trips
CREATE POLICY "Users can view inspections for their trips"
  ON public.vehicle_inspections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = vehicle_inspections.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Drivers can create inspections for assigned trips
CREATE POLICY "Drivers can create inspections"
  ON public.vehicle_inspections FOR INSERT
  WITH CHECK (
    driver_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = vehicle_inspections.trip_id
      AND (trips.primary_driver_id = auth.uid() OR trips.chase_driver_id = auth.uid())
    )
  );

-- Drivers can update their own inspections
CREATE POLICY "Drivers can update their inspections"
  ON public.vehicle_inspections FOR UPDATE
  USING (driver_id = auth.uid());
