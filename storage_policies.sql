-- ============================================
-- STORAGE POLICIES FOR SUPABASE STORAGE
-- ============================================

-- Allow authenticated users to upload to all buckets
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('driver-gear-photos', 'trunk-photos', 'damage-claims', 'vehicle-inspections'));

-- Allow authenticated users to read from all buckets
CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id IN ('driver-gear-photos', 'trunk-photos', 'damage-claims', 'vehicle-inspections'));

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('driver-gear-photos', 'trunk-photos', 'damage-claims', 'vehicle-inspections'))
WITH CHECK (bucket_id IN ('driver-gear-photos', 'trunk-photos', 'damage-claims', 'vehicle-inspections'));

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('driver-gear-photos', 'trunk-photos', 'damage-claims', 'vehicle-inspections'));

-- Public read access for driver-gear-photos (since it's a public bucket)
-- Note: This is handled by the bucket being public, but we can add explicit policy if needed
CREATE POLICY "Public can read driver gear photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'driver-gear-photos');

