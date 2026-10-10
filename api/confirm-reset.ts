// POST /api/confirm-reset — verifikasi kode OTP + ganti sandi.
// Body: { email, code, newPassword }. Rate-limit + maks 5x coba per kode.
// SELF-CONTAINED (tanpa import relatif).

import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function json(res: any, data: unknown, status = 200) {
  return res.status(status).json(data);
}

const norm = (e: string) => e.trim().toLowerCase().slice(0, 120);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, { error: "Method tidak didukung." }, 405);

  let email = "";
  let code = "";
  let pw = "";
  try {
    const b = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
      email?: string; code?: string; newPassword?: string;
    } | null;
    email = norm(String(b?.email ?? ""));
    code = String(b?.code ?? "").replace(/\D/g, "").slice(0, 6);
    pw = String(b?.newPassword ?? "");
  } catch {
    return json(res, { error: "Data tidak valid." }, 400);
  }
  if (!email.includes("@") || code.length !== 6) {
    return json(res, { error: "Kode salah. Coba lagi." }, 400);
  }
  if (pw.length < 8) {
    return json(res, { error: "Kata sandi minimal 8 karakter." }, 400);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(res, { error: "Server belum dikonfigurasi." }, 500);
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: row } = await db
    .from("password_resets")
    .select("id,code_hash,attempts,expires_at,used")
    .eq("email", email)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const rec = row as {
    id: string; code_hash: string; attempts: number; expires_at: string; used: boolean;
  } | null;
  if (!rec || new Date(rec.expires_at).getTime() < Date.now()) {
    return json(res, { error: "Kode kedaluwarsa. Minta kode baru." }, 400);
  }
  if (rec.attempts >= 5) {
    await db.from("password_resets").update({ used: true }).eq("id", rec.id);
    return json(res, { error: "Terlalu banyak salah. Minta kode baru." }, 400);
  }

  const guess = createHash("sha256").update(`tokolink:${email}:${code}`).digest("hex");
  const a = Buffer.from(guess);
  const b = Buffer.from(rec.code_hash);
  const match = a.length === b.length && timingSafeEqual(a, b);
  if (!match) {
    await db.from("password_resets").update({ attempts: rec.attempts + 1 }).eq("id", rec.id);
    return json(res, { error: "Kode salah. Coba lagi." }, 400);
  }

  // Cari user by email (service_role boleh list). listUsers tampil per
  // halaman, jadi loop sampai ketemu — kalau seller sudah ratusan, user
  // lama ada di halaman belakang dan pencarian 1 halaman akan gagal terus.
  let target: { id: string; email?: string } | null = null;
  for (let page = 1; page <= 50; page++) {
    const { data: listed, error: listErr } = await db.auth.admin.listUsers({ page, perPage: 100 });
    const users = ((listed?.users ?? []) as { id: string; email?: string }[]);
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (hit) {
      target = hit;
      break;
    }
    if (listErr || users.length === 0) break;
  }
  if (!target) {
    await db.from("password_resets").update({ used: true }).eq("id", rec.id);
    return json(res, { error: "Kode salah. Coba lagi." }, 400);
  }
  const { error: updErr } = await db.auth.admin.updateUserById(target.id, { password: pw });
  await db.from("password_resets").update({ used: true }).eq("id", rec.id);
  if (updErr) return json(res, { error: "Gagal mengganti. Coba lagi." }, 500);
  return json(res, { ok: true });
}
