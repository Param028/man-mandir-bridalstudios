-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    cover_image text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS public.subcategories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    cover_image text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alter products table to add category references
-- Retain the old category string column for backward compatibility temporarily, but add new ones
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES public.subcategories(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Categories are insertable by authenticated users only" ON public.categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Categories are updatable by authenticated users only" ON public.categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Categories are deletable by authenticated users only" ON public.categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for subcategories
CREATE POLICY "Subcategories are viewable by everyone" ON public.subcategories
    FOR SELECT USING (true);

CREATE POLICY "Subcategories are insertable by authenticated users only" ON public.subcategories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Subcategories are updatable by authenticated users only" ON public.subcategories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Subcategories are deletable by authenticated users only" ON public.subcategories
    FOR DELETE USING (auth.role() = 'authenticated');
