import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function cors(req: Request): HeadersInit | null {
  // Configure ALLOWED_ORIGIN as a comma-separated list of exact site origins.
  const allowed = (Deno.env.get("ALLOWED_ORIGIN") || "").split(",").map((v) => v.trim()).filter(Boolean);
  const origin = req.headers.get("origin");
  if (allowed.length === 0 || (origin && !allowed.includes(origin))) return null;
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

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL") || Deno.env.get("SUPABASE_URL_OVERRIDE");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("server_configuration");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function clientIp(req: Request): string | null {
  const raw = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0];
  const ip = raw?.trim();
  return ip && ip.length <= 64 && /^[0-9a-fA-F:.]+$/.test(ip) ? ip.toLowerCase() : null;
}

async function saltedIpHash(ip: string): Promise<string> {
  const salt = Deno.env.get("IP_HASH_SALT");
  if (!salt || salt.length < 16) throw new Error("server_configuration");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const headers = cors(req);
  if (!headers) return respond({ error: "origin_not_allowed" }, 403, { "Content-Type": "application/json" });
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers });
  if (req.method !== "POST") return respond({ error: "method_not_allowed" }, 405, headers);

  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 2_000) return respond({ error: "invalid_request" }, 413, headers);
    const body = JSON.parse(raw);
    const contentType = typeof body?.contentType === "string" ? body.contentType.toLowerCase().trim() : "";
    const fileSize = body?.fileSize;
    if (!Object.hasOwn(EXTENSIONS, contentType) || !Number.isInteger(fileSize) || fileSize < 1 || fileSize > MAX_FILE_BYTES) {
      return respond({ error: "invalid_upload" }, 400, headers);
    }

    const ip = clientIp(req);
    if (!ip) throw new Error("server_configuration");
    const supabase = serviceClient();
    const { data: allowed, error: rateError } = await supabase.rpc("consume_review_rate_limit", {
      p_ip_hash: await saltedIpHash(ip),
      p_scope: "review_photo_upload",
    });
    if (rateError || allowed !== true) return respond({ error: "rate_limited" }, 429, headers);

    const path = `${crypto.randomUUID()}.${EXTENSIONS[contentType]}`;
    const { data, error } = await supabase.storage.from("review-photos").createSignedUploadUrl(path, { upsert: false });
    if (error || !data?.signedUrl || !data?.token) throw new Error("upload_unavailable");
    const baseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("SUPABASE_URL_OVERRIDE");
    if (!baseUrl) throw new Error("server_configuration");
    const publicUrl = `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/review-photos/${path}`;
    return respond({
      signedUrl: data.signedUrl,
      token: data.token,
      path,
      publicUrl,
      contentType,
      maxSizeBytes: MAX_FILE_BYTES,
    }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "server_configuration" ? 503 : 500;
    return respond({ error: status === 503 ? "service_unavailable" : "upload_unavailable" }, status, headers);
  }
});
