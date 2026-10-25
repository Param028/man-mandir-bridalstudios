import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cors(req: Request): HeadersInit | null {
  const allowed = (Deno.env.get("ALLOWED_ORIGIN") || "").split(",").map((value) => value.trim()).filter(Boolean);
  const origin = req.headers.get("origin");
  if (!allowed.length || (origin && !allowed.includes(origin))) return null;
  return {
    "Access-Control-Allow-Origin": origin || allowed[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };
}

function respond(body: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

Deno.serve(async (req) => {
  const headers = cors(req);
  if (!headers) return respond({ error: "origin_not_allowed" }, 403, { "Content-Type": "application/json" });
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers });
  if (req.method !== "POST") return respond({ error: "method_not_allowed" }, 405, headers);

  try {
    const token = req.headers.get("authorization")?.match(/^Bearer\s+([^\s]+)$/i)?.[1];
    if (!token) return respond({ error: "unauthorized" }, 401, headers);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 2_000) return respond({ error: "invalid_request" }, 413, headers);
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return respond({ error: "invalid_request" }, 400, headers); }
    const reviewId = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>).review_id : null;
    if (typeof reviewId !== "string" || !UUID_RE.test(reviewId)) return respond({ error: "invalid_request" }, 400, headers);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) return respond({ error: "service_unavailable" }, 503, headers);

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await caller.auth.getUser(token);
    if (userError || !userData.user) return respond({ error: "unauthorized" }, 401, headers);
    const { data: admin, error: adminError } = await caller.from("admins").select("id").eq("id", userData.user.id).eq("active", true).maybeSingle();
    if (adminError || !admin) return respond({ error: "forbidden" }, 403, headers);

    const service = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: review, error: readError } = await service.from("review").select("id,photo_url").eq("id", reviewId).maybeSingle();
    if (readError) throw new Error("review_read_failed");
    if (!review) return respond({ error: "not_found" }, 404, headers);

    if (review.photo_url) {
      const photo = new URL(review.photo_url);
      const project = new URL(supabaseUrl);
      const prefix = "/storage/v1/object/public/review-photos/";
      const objectPath = photo.pathname.startsWith(prefix) ? decodeURIComponent(photo.pathname.slice(prefix.length)) : "";
      if (photo.origin !== project.origin || !/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(objectPath)) {
        return respond({ error: "photo_reference_invalid" }, 422, headers);
      }
      const { error: photoError } = await service.storage.from("review-photos").remove([objectPath]);
      if (photoError) throw new Error("photo_delete_failed");
    }

    const { error: deleteError } = await service.from("review").delete().eq("id", reviewId);
    if (deleteError) throw new Error("review_delete_failed");
    return respond({ success: true }, 200, headers);
  } catch (error) {
    console.error("Review deletion failed:", error);
    return respond({ error: "delete_unavailable" }, 500, headers);
  }
});
