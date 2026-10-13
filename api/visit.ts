// POST /api/visit — catat kunjungan toko (pengganti insert anon langsung).
// Body: { seller_id, path }. Rate limit per-IP supaya tidak bisa di-spam
// via curl loop (insert anon lama bisa dipanggil tanpa batas).
// Balas 200 selalu (beacon tidak boleh mengganggu halaman).
//
// CATATAN VERCEL: SELF-CONTAINED (tanpa import relatif).

import { createClient } from "@supabase/supabase-js";

function json(res: any, data: unknown, status = 200) {
  return res.status(status).json(data);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, { ok: true });

  const g = globalThis as unknown as { __vsHits?: Map<string, { n: number; reset: number }> };
  g.__vsHits = g.__vsHits ?? new Map();
  const ip =
    ((req.headers["x-real-ip"] as string | undefined)?.trim() ||
      (req.headers["x-vercel-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
      "unknown");
  const now = Date.now();
  const cur = g.__vsHits.get(ip);
  if (!cur || now > cur.reset) g.__vsHits.set(ip, { n: 1, reset: now + 60_000 });
  else {
    cur.n += 1;
    if (cur.n > 20) return json(res, { ok: true });
  }

  let sellerId = "";
  let path = "/";
  try {
    const b = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
      seller_id?: string; path?: string;
    } | null;
    sellerId = String(b?.seller_id ?? "").slice(0, 64);
    path = String(b?.path ?? "/").slice(0, 160);
  } catch {
    return json(res, { ok: true });
  }
  if (!sellerId) return json(res, { ok: true });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(res, { ok: true });
  const db = createClient(url, key, { auth: { persistSession: false } });
  // Hanya untuk seller_id yang terdaftar (sama seperti policy lama).
  const { data: prof } = await db.from("profiles").select("id").eq("id", sellerId).maybeSingle();
  if (!prof) return json(res, { ok: true });
  await db.from("store_visits").insert({ seller_id: sellerId, path });
  return json(res, { ok: true });
}
