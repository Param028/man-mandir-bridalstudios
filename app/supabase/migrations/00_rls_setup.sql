-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos_of_week ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products, gallery, and videos
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read gallery_items" ON public.gallery_items FOR SELECT USING (true);
CREATE POLICY "Public read hero_videos" ON public.hero_videos FOR SELECT USING (true);
CREATE POLICY "Public read photos_of_week" ON public.photos_of_week FOR SELECT USING (true);

-- Allow public insert access to bookings
CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);

-- Allow all access since admin auth is mocked via local storage
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (true);
CREATE POLICY "Admin full access gallery_items" ON public.gallery_items FOR ALL USING (true);
CREATE POLICY "Admin full access bookings" ON public.bookings FOR ALL USING (true);
CREATE POLICY "Admin full access hero_videos" ON public.hero_videos FOR ALL USING (true);
CREATE POLICY "Admin full access photos_of_week" ON public.photos_of_week FOR ALL USING (true);
