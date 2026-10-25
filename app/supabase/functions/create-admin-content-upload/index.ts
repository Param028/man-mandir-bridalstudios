import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY,
// SUPABASE_SERVICE_ROLE_KEY, ALLOWED_ORIGIN (one exact origin, e.g. https://example.com).
const UPLOAD_RULES: Record<string, { types: Record<string, string>; maxSizeBytes: number }> = {
  "hero-video": {
    types: { "video/mp4": "mp4", "video/webm": "webm", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
    maxSizeBytes: 25 * 1024 * 1024,
  },
  "sale-images": {
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
    maxSizeBytes: 5 * 1024 * 1024,
  },
  gallery: {
    types: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "video/mp4": "mp4",
      "video/webm": "webm",
    },
    maxSizeBytes: 50 * 1024 * 1024,
  },
};

function cors(req: Request): HeadersInit | null {
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGIN") || "").split(",").map((value) => value.trim()).filter(Boolean);
  const requestOrigin = req.headers.get("origin");
  if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) return null;
  return {
    "Access-Control-Allow-Origin": requestOrigin,
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

function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error("server_configuration");
  return value;
}

Deno.serve(async (req) => {
  const headers = cors(req);
  if (!headers) {
    return respond({ error: "origin_not_allowed" }, 403, { "Content-Type": "application/json" });
  }
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers });
  if (req.method !== "POST") return respond({ error: "method_not_allowed" }, 405, headers);

  try {
    const authorization = req.headers.get("authorization") || "";
    const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
    if (!match) return respond({ error: "unauthorized" }, 401, headers);
    const accessToken = *****;

    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 2_000) {
      return respond({ error: "invalid_request" }, 413, headers);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return respond({ error: "invalid_request" }, 400, headers);
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return respond({ error: "invalid_upload" }, 400, headers);
    }

    const input = body as Record<string, unknown>;
    const bucket = input.bucket;
    const contentType = input.contentType;
    const fileSize = input.fileSize;
    if (typeof bucket !== "string" || !Object.hasOwn(UPLOAD_RULES, bucket)) {
      return respond({ error: "invalid_upload" }, 400, headers);
    }
    const rule = UPLOAD_RULES[bucket];
    const maxSizeBytes = bucket === "hero-video" && typeof contentType === "string" && contentType.startsWith("image/")
      ? 5 * 1024 * 1024
      : rule.maxSizeBytes;
    if (
      typeof contentType !== "string" ||
      !Object.hasOwn(rule.types, contentType) ||
      typeof fileSize !== "number" ||
      !Number.isInteger(fileSize) ||
      fileSize <= 0 ||
      fileSize > maxSizeBytes
    ) {
      return respond({ error: "invalid_upload" }, 400, headers);
    }

    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const anonKey = requiredEnv("SUPABASE_ANON_KEY");
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await callerClient.auth.getUser(accessToken);
    if (userError || !userData.user) return respond({ error: "unauthorized" }, 401, headers);

    const { data: admin, error: adminError } = await callerClient
      .from("admins")
      .select("id")
      .eq("id", userData.user.id)
      .eq("active", true)
      .maybeSingle();
    if (adminError || !admin) return respond({ error: "forbidden" }, 403, headers);

    const path = `${crypto.randomUUID()}.${rule.types[contentType]}`;
    // The service-role client is used only to create the signed storage upload URL.
    const serviceClient = createClient(supabaseUrl, requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: upload, error: uploadError } = await serviceClient.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert: false });
    if (uploadError || !upload?.token || !upload?.signedUrl) {
      return respond({ error: "upload_unavailable" }, 500, headers);
    }

    const publicUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path}`;
    return respond({
      path,
      token: upload.token,
      signedUrl: upload.signedUrl,
      publicUrl,
      contentType,
      maxSizeBytes,
    }, 200, headers);
  } catch (error) {
    const status = error instanceof Error && error.message === "server_configuration" ? 503 : 500;
    return respond({ error: status === 503 ? "service_unavailable" : "upload_unavailable" }, status, headers);
  }
});
