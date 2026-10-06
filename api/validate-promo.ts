// POST /api/validate-promo — preview kode promo SERVER-SIDE (BUG-018).
// Frontend tidak lagi membaca tabel discount_codes langsung (policy anon
// dicabut). Body: { seller_id, code, subtotal, shipping_method }.
// Response: { ok, discount, ship_discount, message }.

import { createClient } from "@supabase/supabase-js";

function json(res: any, data: unknown, status = 200) {
  return res.status(status).json(data);
}

/* Ongkir dihapus (keputusan produk Okt 2026). */

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, { error: "Method tidak didukung." }, 405);

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
    seller_id?: string;
    code?: string;
    subtotal?: number;
    shipping_method?: string;
  } | null;

  const sellerId = String(body?.seller_id ?? "");
  const code = String(body?.code ?? "").trim().slice(0, 40);
  const subtotal = Math.max(0, Math.round(Number(body?.subtotal ?? 0)));

  if (!sellerId || !code) return json(res, { ok: false, message: "Kode belum diisi." });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(res, { error: "Server belum dikonfigurasi." }, 500);
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: codes } = await db
    .from("discount_codes")
    .select("code,type,value,min_purchase,usage_limit,used_count,valid_until")
    .eq("seller_id", sellerId)
    .eq("is_active", true);
  const match = ((codes ?? []) as {
    code: string; type: string; value: number | string; min_purchase: number | string;
    usage_limit: number | null; used_count: number; valid_until?: string | null;
  }[]).find((d) => String(d.code).toLowerCase() === code.toLowerCase());

  if (!match) return json(res, { ok: false, discount: 0, ship_discount: 0, message: "Kode tidak dikenal di toko ini." });
  const today = new Date().toISOString().slice(0, 10);
  if (match.valid_until && String(match.valid_until) < today) {
    return json(res, { ok: false, discount: 0, ship_discount: 0, message: "Kode sudah kedaluwarsa." });
  }
  if (match.usage_limit != null && match.used_count >= match.usage_limit) {
    return json(res, { ok: false, discount: 0, ship_discount: 0, message: "Kuota kode habis." });
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
