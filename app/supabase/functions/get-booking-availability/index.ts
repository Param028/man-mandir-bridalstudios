import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://manmandirstudio.com",
  "https://www.manmandirstudio.com",
];

function cors(req: Request): HeadersInit | null {
  const configured = (Deno.env.get("ALLOWED_ORIGIN") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowed = configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
  const origin = req.headers.get("origin");
  if (origin && !allowed.includes(origin)) return null;
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
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 1_000) return respond({ error: "invalid_request" }, 413, headers);
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return respond({ error: "invalid_request" }, 400, headers); }
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 0) {
      return respond({ error: "invalid_request" }, 400, headers);
    }

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) return respond({ error: "service_unavailable" }, 503, headers);

    const now = new Date();
    const end = new Date(now.getTime() + 61 * 24 * 60 * 60 * 1_000);
    const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await service
      .from("bookings")
      .select("appointment_date,appointment_time")
      .in("status", ["pending", "confirmed"])
      .gte("appointment_date", now.toISOString().slice(0, 10))
      .lt("appointment_date", end.toISOString().slice(0, 10))
      .order("appointment_date", { ascending: true })
      .limit(1_000);
    if (error) throw new Error("availability_read_failed");

    const bookings = (data ?? []).flatMap((row) => {
      if (typeof row.appointment_date !== "string" || typeof row.appointment_time !== "string") return [];
      return [{ booking_date: row.appointment_date, booking_time: row.appointment_time }];
    });
    return respond({ bookings }, 200, headers);
  } catch (error) {
    console.error("Availability query failed:", error);
    return respond({ error: "availability_unavailable" }, 503, headers);
  }
});
