// POST /api/validate-promo — preview kode promo SERVER-SIDE (BUG-018).
// Frontend tidak lagi membaca tabel discount_codes langsung (policy anon
// dicabut). Multi-toko: promo milik TOKO. Body baru: { store_id, code,
// subtotal } — body lama { seller_id, ... } tetap diterima (dipetakan ke
// toko pertama seller) supaya halaman lama tidak patah saat transisi.
// Response: { ok, discount, ship_discount, message }.

import { createClient } from "@supabase/supabase-js";

function json(res: any, data: unknown, status = 200) {
  return res.status(status).json(data);
}

type PromoBody = {
  store_id?: string;
  seller_id?: string;
  code?: string;
  subtotal?: number;
  shipping_method?: string;
};

function parsePromoBody(req: any): PromoBody | null {
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!b || typeof b !== "object") return null;
    return b as PromoBody;
  } catch {
    return null;
  }
}

/* Ongkir dihapus (keputusan produk Okt 2026). */

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, { error: "Method tidak didukung." }, 405);

  // Rate limit per-IP: endpoint publik tanpa auth, jangan bisa ditebak massal.
  const g = globalThis as unknown as { __vpHits?: Map<string, { n: number; reset: number }> };
  g.__vpHits = g.__vpHits ?? new Map();
  const ip =
    ((req.headers["x-real-ip"] as string | undefined)?.trim() ||
      (req.headers["x-vercel-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
      "unknown");
  const now = Date.now();
  const cur = g.__vpHits.get(ip);
  if (!cur || now > cur.reset) g.__vpHits.set(ip, { n: 1, reset: now + 60_000 });
  else {
    cur.n += 1;
    if (cur.n > 30) return json(res, { ok: false, discount: 0, ship_discount: 0, message: "Terlalu banyak percobaan." });
  }

  const body = parsePromoBody(req);
  if (!body) return json(res, { ok: false, message: "Data tidak valid." });

  let storeId = String(body.store_id ?? "");
  const legacySellerId = String(body.seller_id ?? "");
  const code = String(body.code ?? "").trim().slice(0, 40);
  const subtotal = Math.max(0, Math.round(Number(body.subtotal ?? 0)));

  if ((!storeId && !legacySellerId) || !code) return json(res, { ok: false, message: "Kode belum diisi." });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(res, { error: "Server belum dikonfigurasi." }, 500);
  const db = createClient(url, key, { auth: { persistSession: false } });

  // Kompatibilitas transisi: halaman lama kirim seller_id (user id) —
  // petakan ke toko pertama milik seller itu.
  if (!storeId && legacySellerId) {
    const { data: st } = await db
      .from("stores")
      .select("id")
      .eq("owner_id", legacySellerId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    storeId = (st as { id: string } | null)?.id ?? "";
  }
  if (!storeId) return json(res, { ok: false, message: "Kode tidak berlaku di toko ini." });

  const { data: codes } = await db
    .from("discount_codes")
    .select("code,type,value,min_purchase,usage_limit,used_count,valid_until")
    .eq("store_id", storeId)
    .eq("is_active", true);
  const match = ((codes ?? []) as {
    code: string; type: string; value: number | string; min_purchase: number | string;
    usage_limit: number | null; used_count: number; valid_until?: string | null;
  }[]).find((d) => String(d.code).toLowerCase() === code.toLowerCase());

  // Pesan SERAGAM untuk semua kode tidak valid (anti-oracle: jangan bocorkan
  // kode mana yang ada/kedaluwarsa/habis — detailnya tetap dicek server
  // saat create-order).
  const invalid = (message = "Kode tidak berlaku di toko ini.") =>
    json(res, { ok: false, discount: 0, ship_discount: 0, message });

  if (!match) return invalid();
  const today = new Date().toISOString().slice(0, 10);
  if (match.valid_until && String(match.valid_until) < today) {
    return invalid();
  }
  if (match.usage_limit != null && match.used_count >= match.usage_limit) {
    return invalid();
  }
  if (subtotal < Number(match.min_purchase)) {
    return json(res, { ok: false, discount: 0, ship_discount: 0, message: "Belanja belum mencapai minimum." });
  }
  if (match.type === "persen") {
    const pct = Math.min(Math.max(Number(match.value), 0), 100);
    const discount = Math.min(Math.round((subtotal * pct) / 100), subtotal);
    return json(res, { ok: true, discount, ship_discount: 0, message: `Potongan ${pct}%.` });
  }
  if (match.type === "nominal") {
    const discount = Math.min(Math.max(Math.round(Number(match.value)), 0), subtotal);
    return json(res, { ok: true, discount, ship_discount: 0, message: "Potongan dipakai." });
  }
  // potongan_ongkir: ongkir sudah dihapus → tidak berlaku.
  return json(res, { ok: false, discount: 0, ship_discount: 0, message: "Promo ongkir sudah tidak berlaku." });
}
