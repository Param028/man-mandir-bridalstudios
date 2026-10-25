-- Additive PRD 9.1-9.2 schema for sales, reviews, stores, settings, and hero video fields.
-- No product, category, booking, order, admin, sale, review, or store rows are seeded or changed.

DO $types$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' AND t.typname = 'sale_link_type'
    ) THEN
        CREATE TYPE public.sale_link_type AS ENUM ('category', 'product', 'booking', 'custom');
    END IF;
END;
$types$;

CREATE TABLE IF NOT EXISTS public.sale (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(60) NOT NULL,
    subtitle varchar(120),
    badge_text varchar(20),
    link_type public.sale_link_type NOT NULL DEFAULT 'custom',
    link_value text,
    image_url text,
    starts_at timestamptz NOT NULL DEFAULT now(),
    ends_at timestamptz,
    show_countdown boolean NOT NULL DEFAULT false,
    show_in_bar boolean NOT NULL DEFAULT false,
    show_as_card boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT false,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT sale_title_nonempty CHECK (char_length(title) BETWEEN 1 AND 60),
    CONSTRAINT sale_subtitle_length CHECK (subtitle IS NULL OR char_length(subtitle) <= 120),
    CONSTRAINT sale_badge_text_length CHECK (badge_text IS NULL OR char_length(badge_text) <= 20),
    CONSTRAINT sale_dates_check CHECK (ends_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.review (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type text NOT NULL,
    target_id uuid,
    name varchar(40) NOT NULL,
    city text,
    email text,
    rating smallint NOT NULL,
    comment text NOT NULL,
    photo_url text,
    status text NOT NULL DEFAULT 'pending',
    is_featured boolean NOT NULL DEFAULT false,
    admin_reply text,
    replied_at timestamptz,
    reported_count integer NOT NULL DEFAULT 0,
    ip_hash text,
    consent boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT review_target_type_check CHECK (target_type IN ('product', 'gallery', 'general')),
    CONSTRAINT review_name_length CHECK (char_length(name) BETWEEN 2 AND 40),
    CONSTRAINT review_rating_check CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT review_comment_length CHECK (char_length(comment) BETWEEN 10 AND 600),
    CONSTRAINT review_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    CONSTRAINT review_reported_count_check CHECK (reported_count >= 0)
);

CREATE TABLE IF NOT EXISTS public.store (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    city text,
    address text NOT NULL,
    phone text,
    email text,
    timings text,
    maps_url text,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT site_settings_documented_key_check CHECK (
        key IN ('sale_strip_enabled', 'reviews_auto_publish', 'craftsmanship', 'stats', 'footer', 'social_links')
    )
);

-- These are the only new hero_videos columns required by this PRD.
ALTER TABLE public.hero_videos
    ADD COLUMN IF NOT EXISTS poster_url text,
    ADD COLUMN IF NOT EXISTS headline text,
    ADD COLUMN IF NOT EXISTS subtitle text,
    ADD COLUMN IF NOT EXISTS primary_label text,
    ADD COLUMN IF NOT EXISTS primary_link text,
    ADD COLUMN IF NOT EXISTS secondary_label text,
    ADD COLUMN IF NOT EXISTS secondary_link text,
    ADD COLUMN IF NOT EXISTS show_mute_button boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS sale_active_window_idx
    ON public.sale (is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS sale_display_order_idx
    ON public.sale (display_order, starts_at);
CREATE INDEX IF NOT EXISTS review_moderation_created_at_idx
    ON public.review (status, created_at DESC);
CREATE INDEX IF NOT EXISTS review_public_created_at_idx
    ON public.review (created_at DESC) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS review_target_idx
    ON public.review (target_type, target_id);
CREATE INDEX IF NOT EXISTS store_active_display_order_idx
    ON public.store (is_active, display_order, name);

-- The admins table is an existing application table with id and active columns.
-- This function returns true only when auth.uid() matches an active admin row.
CREATE OR REPLACE FUNCTION public.is_active_admin_for_prd()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.admins AS a
        WHERE a.id = auth.uid()
          AND a.active IS TRUE
    );
$function$;
REVOKE ALL ON FUNCTION public.is_active_admin_for_prd() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_admin_for_prd() TO authenticated;

ALTER TABLE public.sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $policies$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sale' AND policyname = 'PRD public read live sales') THEN
        CREATE POLICY "PRD public read live sales" ON public.sale
            FOR SELECT TO anon, authenticated
            USING (is_active IS TRUE AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sale' AND policyname = 'PRD active admin manage sales') THEN
        CREATE POLICY "PRD active admin manage sales" ON public.sale
            FOR ALL TO authenticated
            USING (public.is_active_admin_for_prd())
            WITH CHECK (public.is_active_admin_for_prd());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'review' AND policyname = 'PRD active admin manage reviews') THEN
        CREATE POLICY "PRD active admin manage reviews" ON public.review
            FOR ALL TO authenticated
            USING (public.is_active_admin_for_prd())
            WITH CHECK (public.is_active_admin_for_prd());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'review' AND policyname = 'PRD public submit pending consented reviews') THEN
        CREATE POLICY "PRD public submit pending consented reviews" ON public.review
            FOR INSERT TO anon, authenticated
            WITH CHECK (
                status = 'pending'
                AND consent IS TRUE
                AND is_featured IS FALSE
                AND admin_reply IS NULL
                AND replied_at IS NULL
                AND reported_count = 0
                AND ip_hash IS NULL
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'store' AND policyname = 'PRD public read active stores') THEN
        CREATE POLICY "PRD public read active stores" ON public.store
            FOR SELECT TO anon, authenticated
            USING (is_active IS TRUE);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'store' AND policyname = 'PRD active admin manage stores') THEN
        CREATE POLICY "PRD active admin manage stores" ON public.store
            FOR ALL TO authenticated
            USING (public.is_active_admin_for_prd())
            WITH CHECK (public.is_active_admin_for_prd());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'PRD public read allowlisted settings') THEN
        CREATE POLICY "PRD public read allowlisted settings" ON public.site_settings
            FOR SELECT TO anon, authenticated
            USING (key IN ('sale_strip_enabled', 'reviews_auto_publish', 'craftsmanship', 'stats', 'footer', 'social_links'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'PRD active admin manage settings') THEN
        CREATE POLICY "PRD active admin manage settings" ON public.site_settings
            FOR ALL TO authenticated
            USING (public.is_active_admin_for_prd())
            WITH CHECK (public.is_active_admin_for_prd());
    END IF;

    -- Restrictive policies narrow the pre-existing authenticated hero_videos
    -- write policy so an authenticated session must also be an active admin.
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hero_videos' AND policyname = 'PRD active admin insert hero videos') THEN
        CREATE POLICY "PRD active admin insert hero videos" ON public.hero_videos
            AS RESTRICTIVE FOR INSERT TO authenticated
            WITH CHECK (public.is_active_admin_for_prd());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hero_videos' AND policyname = 'PRD active admin update hero videos') THEN
        CREATE POLICY "PRD active admin update hero videos" ON public.hero_videos
            AS RESTRICTIVE FOR UPDATE TO authenticated
            USING (public.is_active_admin_for_prd())
            WITH CHECK (public.is_active_admin_for_prd());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hero_videos' AND policyname = 'PRD active admin delete hero videos') THEN
        CREATE POLICY "PRD active admin delete hero videos" ON public.hero_videos
            AS RESTRICTIVE FOR DELETE TO authenticated
            USING (public.is_active_admin_for_prd());
    END IF;
END;
$policies$;

-- Remove default/public table access and grant only the operations needed. RLS
-- remains authoritative for every table operation granted below.
REVOKE ALL ON public.sale, public.review, public.store, public.site_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.sale, public.store TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale, public.store, public.site_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review TO authenticated;

-- Anonymous review submission cannot supply status or moderation/system fields;
-- the database default sets status to pending and RLS requires consent = true.
GRANT INSERT (target_type, target_id, name, city, email, rating, comment, photo_url, consent)
    ON public.review TO anon;

-- Public projections exclude review.email and review.ip_hash and expose only
-- approved reviews. Settings are similarly projected through an allowlist view.
CREATE OR REPLACE VIEW public.public_reviews WITH (security_barrier = true) AS
SELECT id, target_type, target_id, name, city, rating, comment, photo_url,
       is_featured, admin_reply, replied_at, created_at
FROM public.review
WHERE status = 'approved';
GRANT SELECT ON public.public_reviews TO anon, authenticated;

CREATE OR REPLACE VIEW public.public_site_settings WITH (security_barrier = true) AS
SELECT key, value
FROM public.site_settings
WHERE key IN ('sale_strip_enabled', 'reviews_auto_publish', 'craftsmanship', 'stats', 'footer', 'social_links');
GRANT SELECT ON public.public_site_settings TO anon, authenticated;

-- Public-read media buckets only; no INSERT, UPDATE, or DELETE policies are added.
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('hero-video', 'hero-video', true),
    ('sale-images', 'sale-images', true),
    ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DO $storage_policies$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'PRD public read storefront media') THEN
        CREATE POLICY "PRD public read storefront media" ON storage.objects
            FOR SELECT TO public
            USING (bucket_id IN ('hero-video', 'sale-images', 'review-photos'));
    END IF;
END;
$storage_policies$;
