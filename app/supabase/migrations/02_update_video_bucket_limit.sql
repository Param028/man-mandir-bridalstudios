-- Update videos bucket file size limit from 100MB to 250MB
-- Run this in Supabase SQL Editor to update the existing bucket
-- This only updates the limit and does not touch existing policies

UPDATE storage.buckets
SET file_size_limit = 262144000 -- 250 MB in bytes
WHERE id = 'videos';

-- Verify the update
SELECT id, name, file_size_limit, public 
FROM storage.buckets 
WHERE id = 'videos';
