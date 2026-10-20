// GET /api/sweep-stale — dipanggil Vercel Cron 1x sehari (lihat vercel.json).
// Auth: header "Authorization: Bearer <CRON_SECRET>" (wajib di-set di
// Vercel env; tanpa itu endpoint mati total).
// Kerja: (1) order 'menunggu' > 24 jam → 'batal' + payment 'gagal' +
// kuota promo kembali; (2) hapus password_resets basi; (3) hapus
// store_visits > 90 hari (retensi).
// Idempoten: klaim hanya dari status 'menunggu'.
// CATATAN VERCEL: SELF-CONTAINED (tanpa import relatif).

import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method tidak didukung." });

  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(500).json({ error: "CRON_SECRET belum dipasang." });
  const authHeader = (req.headers.authorization as string | undefined) ?? (req.headers["x-supabase-auth"] as string | undefined) ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token || token !== secret) return res.status(401).json({ error: "Unauthorized." });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: "Server belum dikonfigurasi." });
  const db = createClient(url, key, { auth: { persistSession: false } });

  const cutoff = new Date(Date.now() - 24 * 3600_000).toISOString();

  // 1) Order basi: ambil dulu id-nya (butuh promo_id untuk kembalikan kuota).
  const { data: stale } = await db
    .from("orders")
    .select("id,promo_id")
    .eq("status", "menunggu")
    .lt("created_at", cutoff)
    .limit(500);
  const rows = ((stale ?? []) as { id: string; promo_id: string | null }[]);
  let cancelled = 0;
  for (const o of rows) {
    const { data: done } = await db
      .from("orders")
      .update({ status: "batal" })
      .eq("id", o.id)
      .eq("status", "menunggu")
      .select("id");
    const changed = (done as { id: string }[] | null) ?? [];
    if (changed.length === 0) continue;
    await db.from("payments").update({ status: "gagal" }).eq("order_id", o.id).eq("status", "menunggu");
    if (o.promo_id) await db.rpc("restore_promo", { p_id: o.promo_id });
    cancelled += 1;
  }

  // 2) OTP basi.
  await db.from("password_resets").delete().or("used.eq.true,expires_at.lt." + new Date(Date.now() - 24 * 3600_000).toISOString());

  // 3) Kunjungan > 90 hari.
  await db.from("store_visits").delete().lt("created_at", new Date(Date.now() - 90 * 24 * 3600_000).toISOString());

  return res.status(200).json({ ok: true, cancelled });
}
