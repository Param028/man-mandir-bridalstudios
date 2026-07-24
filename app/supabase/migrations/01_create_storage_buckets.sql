-- Create Storage Buckets
-- This migration creates the required storage buckets for the application

-- Insert storage buckets
-- Note: Storage buckets must be created via Supabase Dashboard or SQL
-- The following SQL creates the bucket records in the storage.buckets table

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('videos', 'videos', true, 262144000, ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('products', 'products', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('gallery', 'gallery', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow public read access to all buckets
CREATE POLICY "Public read videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Public read products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

-- Allow public upload to all buckets (for admin uploads via anon key)
-- In production, you may want to restrict this to authenticated users only
CREATE POLICY "Public upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos');
CREATE POLICY "Public upload products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');
CREATE POLICY "Public upload gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');

-- Allow public delete (for admin management)
CREATE POLICY "Public delete videos" ON storage.objects FOR DELETE USING (bucket_id = 'videos');
CREATE POLICY "Public delete products" ON storage.objects FOR DELETE USING (bucket_id = 'products');
CREATE POLICY "Public delete gallery" ON storage.objects FOR DELETE USING (bucket_id = 'gallery');
