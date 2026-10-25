-- Private, hash-only request history for edge-enforced review submission/report limits.
CREATE TABLE IF NOT EXISTS public.review_rate_limits (
    ip_hash text NOT NULL CHECK (ip_hash ~ '^[0-9a-f]{64}$'),
    scope text NOT NULL CHECK (scope IN ('review_submit', 'review_report', 'review_photo_upload')),
    event_times timestamptz[] NOT NULL DEFAULT ARRAY[]::timestamptz[],
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (ip_hash, scope)
);

ALTER TABLE public.review_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.review_rate_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_rate_limits TO service_role;

-- This atomic SECURITY DEFINER RPC is intentionally executable only by service_role.
-- Submission caps: 3 per rolling hour and 10 per rolling day. Reports: 5/hour and 20/day.
-- Photo-upload URL caps: 10/hour and 30/day.
CREATE OR REPLACE FUNCTION public.consume_review_rate_limit(p_ip_hash text, p_scope text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_events timestamptz[];
    v_hour_count integer;
    v_day_count integer;
    v_hour_limit integer;
    v_day_limit integer;
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
    END IF;
    IF p_ip_hash IS NULL OR p_ip_hash !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'invalid request hash' USING ERRCODE = '22023';
    END IF;
    IF p_scope = 'review_submit' THEN
        v_hour_limit := 3;
        v_day_limit := 10;
    ELSIF p_scope = 'review_report' THEN
        v_hour_limit := 5;
        v_day_limit := 20;
    ELSIF p_scope = 'review_photo_upload' THEN
        v_hour_limit := 10;
        v_day_limit := 30;
    ELSE
        RAISE EXCEPTION 'invalid rate-limit scope' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.review_rate_limits AS current_limit (ip_hash, scope, event_times, updated_at)
    VALUES (p_ip_hash, p_scope, ARRAY[clock_timestamp()], clock_timestamp())
    ON CONFLICT (ip_hash, scope) DO UPDATE
    SET event_times = (
            SELECT COALESCE(array_agg(e ORDER BY e), ARRAY[]::timestamptz[])
            FROM unnest(current_limit.event_times) AS prior(e)
            WHERE e >= clock_timestamp() - interval '1 day'
        ) || ARRAY[clock_timestamp()],
        updated_at = clock_timestamp()
    RETURNING event_times INTO v_events;

    SELECT count(*) FILTER (WHERE e >= clock_timestamp() - interval '1 hour'),
           count(*) FILTER (WHERE e >= clock_timestamp() - interval '1 day')
      INTO v_hour_count, v_day_count
      FROM unnest(v_events) AS recent(e);

    RETURN v_hour_count <= v_hour_limit AND v_day_count <= v_day_limit;
END;
$function$;
REVOKE ALL ON FUNCTION public.consume_review_rate_limit(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_review_rate_limit(text, text) TO service_role;

-- A report is deliberately anonymous; only the approved-row counter changes, never an identity field.
CREATE OR REPLACE FUNCTION public.report_approved_review(p_review_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_updated integer;
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
    END IF;
    UPDATE public.review
       SET reported_count = reported_count + 1
     WHERE id = p_review_id
       AND status = 'approved';
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated = 1;
END;
$function$;
REVOKE ALL ON FUNCTION public.report_approved_review(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.report_approved_review(uuid) TO service_role;

-- Prevent direct anonymous inserts from bypassing the validated edge submission flow.
DROP POLICY IF EXISTS "PRD public submit pending consented reviews" ON public.review;
REVOKE INSERT ON public.review FROM anon;
REVOKE INSERT (target_type, target_id, name, city, email, rating, comment, photo_url, consent)
    ON public.review FROM anon;

-- Restrict only the review-photos bucket; do not alter any other storage bucket.
UPDATE storage.buckets
   SET file_size_limit = 5242880,
       allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
 WHERE id = 'review-photos';
