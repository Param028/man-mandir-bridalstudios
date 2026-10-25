import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAX_BODY_BYTES = 12_000;
const MIN_ELAPSED_MS = 3_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LINK_RE = /(?:\b[a-z][a-z0-9+.-]{1,20}:\/\/|\bwww\.|\b(?:[a-z0-9-]+\.)+(?:com|net|org|in|co|io|edu|gov|biz|info|me|app|shop|store|uk|us|ca|au|de|fr|xyz)\b|\[[^\]]+\]\([^)]+\))/i;
const PROFANITY_RE = /\b(?:fuck(?:er|ing|ed|s)?|shit(?:ty|s)?|bitch(?:es)?|bastard|asshole|damn)\b/i;

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

function cleanText(value: string): string {
  const withoutTags = value.replace(/<[^>]*>/g, "");
  return Array.from(withoutTags)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint >= 32 && !(codePoint >= 127 && codePoint <= 159);
    })
    .join("")
    .trim();
}

function clientIp(req: Request): string | null {
  const raw = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0];
  const ip = raw?.trim();
  if (!ip || ip.length > 64 || !/^[0-9a-fA-F:.]+$/.test(ip)) return null;
  return ip.toLowerCase();
}

async function saltedIpHash(ip: string): Promise<string> {
  // IP_HASH_SALT is a private random secret; requests fail closed if it is absent.
  const salt = Deno.env.get("IP_HASH_SALT");
  if (!salt || salt.length < 16) throw new Error("server_configuration");
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL") || Deno.env.get("SUPABASE_URL_OVERRIDE");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("server_configuration");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

Deno.serve(async (req) => {
  const headers = cors(req);
  if (!headers) return respond({ error: "origin_not_allowed" }, 403, { "Content-Type": "application/json" });
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers });
  if (req.method !== "POST") return respond({ error: "method_not_allowed" }, 405, headers);

  try {
    const declaredLength = Number(req.headers.get("content-length") || 0);
    if (declaredLength > MAX_BODY_BYTES) return respond({ error: "invalid_request" }, 413, headers);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return respond({ error: "invalid_request" }, 413, headers);
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("invalid_request");

    const targetType = body.target_type;
    const targetId = body.target_id == null || body.target_id === "" ? null : String(body.target_id).trim();
    const name = typeof body.name === "string" ? cleanText(body.name) : "";
    const city = body.city == null || body.city === "" ? null : (typeof body.city === "string" ? cleanText(body.city) : "");
    const email = body.email == null || body.email === "" ? null : (typeof body.email === "string" ? body.email.trim() : "");
    const rawComment = typeof body.comment === "string" ? body.comment : "";
    const comment = cleanText(rawComment);
    const rating = body.rating;
    const consent = body.consent;
    const honeypot = body.honeypot;
    const elapsedMs = body.elapsedMs;
    const photoUrl = body.photo_url == null || body.photo_url === "" ? null : String(body.photo_url).trim();

    if (!new Set(["product", "gallery", "general"]).has(targetType) ||
        ((targetType === "product" || targetType === "gallery") && (!targetId || !UUID_RE.test(targetId))) ||
        (targetId !== null && !UUID_RE.test(targetId)) || name.length < 2 || name.length > 40 ||
        (city !== null && (city.length < 1 || city.length > 80)) ||
        (email !== null && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) ||
        !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 10 || comment.length > 600 ||
        consent !== true || typeof honeypot !== "string" || honeypot.trim() !== "" ||
        !Number.isFinite(elapsedMs) || elapsedMs < MIN_ELAPSED_MS || elapsedMs > 3_600_000 ||
        LINK_RE.test(`${name} ${city || ""} ${rawComment}`)) {
      throw new Error("invalid_request");
    }
    if (photoUrl !== null) {
      const projectUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("SUPABASE_URL_OVERRIDE");
      if (!projectUrl) throw new Error("server_configuration");
      const photo = new URL(photoUrl);
      const project = new URL(projectUrl);
      if (photo.origin !== project.origin || !photo.pathname.startsWith("/storage/v1/object/public/review-photos/") || photo.username || photo.password) {
        throw new Error("invalid_request");
      }
    }

    const ip = clientIp(req);
    if (!ip) throw new Error("server_configuration");
    const ipHash = await saltedIpHash(ip);
    const supabase = serviceClient();
    const { data: rateAllowed, error: rateError } = await supabase.rpc("consume_review_rate_limit", {
      p_ip_hash: ipHash,
      p_scope: "review_submit",
    });
    if (rateError || rateAllowed !== true) return respond({ error: "rate_limited" }, 429, headers);

    const hasProfanity = PROFANITY_RE.test(comment);
    let autoPublish = false;
    const { data: setting, error: settingError } = await supabase.from("site_settings")
      .select("value").eq("key", "reviews_auto_publish").maybeSingle();
    if (!settingError && setting?.value === true) autoPublish = true;
    const status = autoPublish && !hasProfanity ? "approved" : "pending";

    const { data: inserted, error: insertError } = await supabase.from("review").insert({
      target_type: targetType,
      target_id: targetId,
      name,
      city,
      email,
      rating,
      comment,
      photo_url: photoUrl,
      consent: true,
      ip_hash: ipHash,
      status,
    }).select("id, status").single();
    if (insertError || !inserted) throw new Error("submit_failed");

    // Optional notification. Missing configuration or a Resend outage never rolls back a saved review.
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const sender = Deno.env.get("RESEND_FROM_EMAIL") || "Bridal Studio Reviews <onboarding@resend.dev>";
    const notificationEmail = Deno.env.get("REVIEW_NOTIFICATION_EMAIL");
    if (resendKey && (notificationEmail || email)) {
      const sendEmail = async (to: string, subject: string, text: string) => {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: sender, to: [to], subject, text }),
          signal: AbortSignal.timeout(5_000),
        });
      };
      try {
        if (notificationEmail) await sendEmail(notificationEmail, `New ${status} customer review`, `A ${rating}-star review was submitted for ${targetType}.\nName: ${name}\nCity: ${city || "—"}\nStatus: ${status}\n\n${comment}`);
      } catch {
        // Notification is best-effort only.
      }
      if (email) {
        try {
          const customerText = status === "approved"
            ? "Thank you for sharing your review. It has been published on the studio website."
            : "Thank you for sharing your review. It has been received and will appear on the studio website after moderation.";
          await sendEmail(email, "We received your ManMandir review", `${name},\n\n${customerText}\n\nThis email address is kept private and is not shown with your review.`);
        } catch {
          // Optional customer receipts are best-effort and never block submission.
        }
      }
    }

    return respond({ success: true, review_id: inserted.id, status: inserted.status }, 201, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "invalid_request" ? 400 : message === "server_configuration" ? 503 : 500;
    return respond({ error: status === 400 ? "invalid_request" : "review_unavailable" }, status, headers);
  }
});
