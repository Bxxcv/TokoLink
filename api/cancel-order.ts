// POST /api/cancel-order — pembatalan nyata oleh buyer (BUG-013).
// Body: { order_id, access_token }. Hanya bila status masih 'menunggu'.
// Menandai payments 'gagal' + orders 'batal' (atomic-ish, server-side).
// Tidak ada refund otomatis: order menunggu = belum ada uang masuk.

import { createClient } from "@supabase/supabase-js";

function json(res: any, data: unknown, status = 200) {
  return res.status(status).json(data);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, { error: "Method tidak didukung." }, 405);

  let body: {
    order_id?: string;
    access_token?: string;
  } | null = null;
  try {
    body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as typeof body;
  } catch {
    return json(res, { error: "Data tidak valid." }, 400);
  }
  const orderId = String(body?.order_id ?? "").trim().slice(0, 32);
  const token = String(body?.access_token ?? "").trim().slice(0, 64);
  if (!orderId || !token) return json(res, { error: "Data tidak lengkap." }, 400);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(res, { error: "Server belum dikonfigurasi." }, 500);
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: order } = await db
    .from("orders")
    .select("id,status,seller_id")
    .eq("id", orderId)
    .eq("access_token", token)
    .maybeSingle();
  const o = order as { id: string; status: string; seller_id: string } | null;
  if (!o) return json(res, { error: "Pesanan tidak ditemukan." }, 404);
  if (o.status !== "menunggu") {
    return json(res, { error: "Pesanan sudah diproses, tidak bisa dibatalkan dari sini. Hubungi penjual." }, 409);
  }

  // Tandai payment gagal (klaim hanya dari menunggu → idempoten).
  await db.from("payments").update({ status: "gagal" }).eq("order_id", o.id).eq("status", "menunggu");
  const { error } = await db.from("orders").update({ status: "batal" }).eq("id", o.id).eq("status", "menunggu");
  if (error) return json(res, { error: "Gagal membatalkan. Coba lagi." }, 500);
  return json(res, { ok: true, order_id: o.id });
}
