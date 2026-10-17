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

  let storeId = "";
  let path = "/";
  try {
    const b = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
      store_id?: string; seller_id?: string; path?: string;
    } | null;
    // Kompatibilitas: halaman lama kirim seller_id (dulu = user id, sekarang
    // nilai yang sama dianggap store id → tidak cocok, insert dilewati).
    storeId = String(b?.store_id ?? b?.seller_id ?? "").slice(0, 64);
    path = String(b?.path ?? "/").slice(0, 160);
  } catch {
    return json(res, { ok: true });
  }
  if (!storeId) return json(res, { ok: true });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(res, { ok: true });
  const db = createClient(url, key, { auth: { persistSession: false } });
  // Hanya untuk store_id yang terdaftar.
  const { data: st } = await db.from("stores").select("id,owner_id").eq("id", storeId).maybeSingle();
  if (!st) return json(res, { ok: true });
  await db.from("store_visits").insert({ seller_id: (st as { owner_id: string }).owner_id, store_id: storeId, path });
  return json(res, { ok: true });
}
