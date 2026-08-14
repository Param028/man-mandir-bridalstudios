-- Add trending and featured flags for landing page customization
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
