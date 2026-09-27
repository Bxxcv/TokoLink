// Helper server-only untuk Vercel serverless functions TokoLink.
// PENTING: file di folder api/ TIDAK PERNAH dibundel ke frontend —
// secret di process.env aman di sini. Jangan import file ini dari src/.

import { createClient } from "@supabase/supabase-js";

export function adminDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diset di server.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** verifyAuth independen (standar NiagaBio): token pembeli BUKAN syarat,
 *  tapi kalau ada user login, pastikan JWT valid. Untuk checkout tamu,
 *  selalu lolos — validasi utama ada di payload + rate limit. */
export async function verifyAuthOptional(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const url = process.env.SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY;
    if (!url || !anon) return null;
    const sb = createClient(url, anon, { auth: { persistSession: false } });
    const { data } = await sb.auth.getUser(auth.slice(7));
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Rate limit sederhana per-IP (in-memory, cukup untuk traffic UMKM).
 *  Untuk scale besar pindah ke Upstash/KV. */
const hits = new Map<string, { n: number; reset: number }>();
export function rateLimit(ip: string, max = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now > cur.reset) {
    hits.set(ip, { n: 1, reset: now + windowMs });
    return true;
  }
  cur.n += 1;
  return cur.n <= max;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** ID order format TL-YYMM-XXXX (acak, collision-retry di caller). */
export function newOrderId(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TL-${yy}${mm}-${rand}`;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
