-- Keep hero-video metadata publicly readable by the storefront.
-- Upload and mutation policies remain restricted to active administrators.
CREATE POLICY "Public read hero_videos"
ON public.hero_videos
FOR SELECT
TO public
USING (true);
