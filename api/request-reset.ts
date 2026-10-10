// POST /api/request-reset — kirim kode OTP 6 digit via Brevo API.
// Body: { email }. Selalu 200 (anti-enumerasi akun).
// SELF-CONTAINED (tanpa import relatif).

import { createHash, randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function json(res: any, data: unknown, status = 200) {
  return res.status(status).json(data);
}

function hit(
  g: Map<string, { n: number; reset: number }>,
  key: string,
  limit: number,
): boolean {
  const now = Date.now();
  const cur = g.get(key);
  if (!cur || now > cur.reset) {
    g.set(key, { n: 1, reset: now + 3_600_000 });
    return false;
  }
  cur.n += 1;
  return cur.n > limit;
}

const norm = (e: string) => e.trim().toLowerCase().slice(0, 120);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, { error: "Method tidak didukung." }, 405);

  let email = "";
  try {
    const b = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as { email?: string } | null;
    email = norm(String(b?.email ?? ""));
  } catch {
    return json(res, { ok: true });
  }
  if (!email.includes("@")) return json(res, { ok: true });

  const g = globalThis as unknown as { __rrHits?: Map<string, { n: number; reset: number }> };
  g.__rrHits = g.__rrHits ?? new Map();
  const ip =
    ((req.headers["x-real-ip"] as string | undefined)?.trim() ||
      (req.headers["x-vercel-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
      "unknown");
  if (hit(g.__rrHits, `ip:${ip}`, 20) || hit(g.__rrHits, `em:${email}`, 3)) {
    return json(res, { ok: true });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const brevoKey = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SENDER_EMAIL ?? "supporttokolink@gmail.com";
  if (!url || !key || !brevoKey) return json(res, { ok: true });

  const db = createClient(url, key, { auth: { persistSession: false } });

  // Kode 6 digit, hash disimpan (bukan mentah). Batalkan kode lama.
  const code = String(randomInt(100000, 1000000));
  const codeHash = createHash("sha256").update(`tokolink:${email}:${code}`).digest("hex");
  const expires = new Date(Date.now() + 10 * 60_000).toISOString();
  await db.from("password_resets").update({ used: true }).eq("email", email).eq("used", false);
  const { error: insErr } = await db.from("password_resets").insert({
    email,
    code_hash: codeHash,
    expires_at: expires,
  });
  if (insErr) return json(res, { ok: true });

  const html =
    `<div style="margin:0;padding:0;background:#F2F5F9;font-family:Arial,Helvetica,sans-serif;">` +
    `<div style="max-width:560px;margin:0 auto;padding:24px 16px;">` +
    `<div style="background:#0B2E6E;border-radius:14px;padding:20px 24px;text-align:center;">` +
    `<div style="color:#fff;font-size:22px;font-weight:bold;">TokoLink</div>` +
    `<div style="color:#9CC3FF;font-size:13px;margin-top:4px;">Satu link untuk semua jualanmu</div></div>` +
    `<div style="background:#fff;border-radius:0 0 14px 14px;padding:28px 24px;text-align:center;">` +
    `<div style="font-size:20px;font-weight:bold;color:#0B2E6E;">Kode reset sandimu 🔑</div>` +
    `<p style="font-size:14px;line-height:1.7;color:#46566F;">Masukkan kode ini di halaman TokoLink. Berlaku <b>10 menit</b>.</p>` +
    `<div style="font-size:34px;font-weight:bold;letter-spacing:10px;color:#0B2E6E;margin:18px 0;">${code}</div>` +
    `<p style="font-size:12px;color:#8A94A0;">Tidak merasa minta ini? Abaikan saja.</p>` +
    `</div><p style="text-align:center;font-size:12px;color:#8A94A0;">Butuh bantuan? WA 085191245042 · supporttokolink@gmail.com</p>` +
    `</div></div>`;

  let sent = false;
  try {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: sender, name: "TokoLink" },
        to: [{ email }],
        subject: "Kode reset sandi TokoLink (10 menit)",
        htmlContent: html,
      }),
    });
    if (r.ok) {
      sent = true;
    } else {
      console.error("[request-reset] Brevo", r.status, (await r.text()).slice(0, 300));
      await db.from("password_resets").update({ used: true }).eq("email", email).eq("used", false);
    }
  } catch (e) {
    console.error("[request-reset] fetch gagal", String(e).slice(0, 200));
    await db.from("password_resets").update({ used: true }).eq("email", email).eq("used", false);
  }
  return json(res, { ok: true, sent });
}
