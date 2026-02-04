-- Fix driver_gear table: Add UNIQUE constraint on driver_id
-- This allows upsert operations to work correctly

-- Option 1: One gear entry per driver (recommended)
-- A driver can only have ONE gear entry total
ALTER TABLE public.driver_gear
ADD CONSTRAINT unique_driver_id UNIQUE (driver_id);

-- If the above fails because duplicates exist, first clean up:
-- DELETE FROM public.driver_gear WHERE id NOT IN (
--   SELECT DISTINCT ON (driver_id) id FROM public.driver_gear ORDER BY driver_id, created_at DESC
-- );

-- Then add the constraint
