
-- Create storage bucket for maintenance photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-photos', 'maintenance-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload maintenance photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'maintenance-photos');

-- Allow public read access to maintenance photos
CREATE POLICY "Public can view maintenance photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'maintenance-photos');

-- Allow users to delete their own uploaded photos
CREATE POLICY "Users can delete own maintenance photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'maintenance-photos');
