-- ============================================
-- UPDATE CANCELLATION STATES
-- Adds granular cancellation statuses for better tracking
-- ============================================

-- Add cancellation reason column to trips table
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Update status check constraint to include new cancellation states
-- Note: This requires dropping and recreating the constraint
ALTER TABLE public.trips 
DROP CONSTRAINT IF EXISTS trips_status_check;

ALTER TABLE public.trips 
ADD CONSTRAINT trips_status_check 
CHECK (status IN (
  'requested', 
  'dispatched', 
  'driver_arriving', 
  'trunk_verified', 
  'in_progress', 
  'completed', 
  'cancelled',
  'cancelled_by_user_pre_start',
  'cancelled_by_driver'
));

-- Add comment explaining cancellation states
COMMENT ON COLUMN public.trips.status IS 
'Status lifecycle: requested -> dispatched -> driver_arriving -> trunk_verified -> in_progress -> completed. 
Cancellation states: cancelled (generic), cancelled_by_user_pre_start (user cancels before trip starts), 
cancelled_by_driver (driver cancels after accepting).';

COMMENT ON COLUMN public.trips.cancellation_reason IS 
'Optional reason for cancellation. Used for analytics and user feedback.';
