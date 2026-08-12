-- Add images column to products table if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::JSONB;
