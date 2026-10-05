// POST /api/delete-account — Hapus akun sendiri (seller).
// Auth: header "Authorization: Bearer <access_token>". Hanya bisa
// menghapus user milik token itu sendiri — admin pun tidak bisa
// menghapus user lain lewat endpoint ini.

import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method tidak didukung." });

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !key) return res.status(500).json({ error: "Server belum dikonfigurasi." });

  const token = ((req.headers.authorization as string | undefined) ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Belum login." });

  const gate = createClient(url, anon, { auth: { persistSession: false } });
  const { data: me } = await gate.auth.getUser(token);
  if (!me.user) return res.status(401).json({ error: "Sesi tidak valid." });

  const db = createClient(url, key, { auth: { persistSession: false } });

  // BUG-022: jangan hapus akun yang masih punya kewajiban.
  const uid = me.user.id;
  const { data: bal } = await db.from("ledger").select("amount").eq("seller_id", uid);
  const balance = ((bal ?? []) as { amount: number | string }[]).reduce((s, r) => s + Number(r.amount), 0);
  if (balance > 0) {
    return res.status(409).json({ error: "Saldo masih ada. Tarik dulu sebelum menghapus akun." });
  }
  const { data: pend } = await db
    .from("withdrawals")
    .select("id")
    .eq("seller_id", uid)
    .in("status", ["menunggu", "diproses"])
    .limit(1);
  if ((pend ?? []).length > 0) {
    return res.status(409).json({ error: "Masih ada penarikan yang diproses. Tunggu selesai dulu." });
  }
  const { data: ords } = await db
    .from("orders")
    .select("id")
    .eq("seller_id", uid)
    .in("status", ["menunggu", "dikemas", "dikirim"])
    .limit(1);
  if ((ords ?? []).length > 0) {
    return res.status(409).json({ error: "Masih ada pesanan berjalan. Selesaikan dulu." });
  }

  const { error } = await db.auth.admin.deleteUser(uid);
  if (error) return res.status(500).json({ error: "Gagal menghapus akun." });
  // profiles + data seller ikut terhapus via ON DELETE CASCADE.
  return res.status(200).json({ ok: true });
}
