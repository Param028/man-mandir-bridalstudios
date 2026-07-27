-- Diagnostic query to check storage policies
-- Run this to see all policies on the storage.objects table

SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- Create missing RLS policies for videos bucket
-- Run these commands to enable uploads to the videos bucket

-- Allow public read access to videos bucket
CREATE POLICY "Public read videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'videos');

-- Allow public upload to videos bucket (for admin uploads via anon key)
CREATE POLICY "Public upload videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'videos');

-- Allow public delete from videos bucket (for admin management)
CREATE POLICY "Public delete videos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'videos');
