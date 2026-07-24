-- Update videos bucket file size limit from 100MB to 250MB
-- Run this in Supabase SQL Editor to update the existing bucket

UPDATE storage.buckets
SET file_size_limit = 262144000 -- 250 MB in bytes
WHERE id = 'videos';
