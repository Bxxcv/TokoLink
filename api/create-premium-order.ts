// POST /api/create-premium-order — Bayar Premium via QRIS BuatQris.
// Body: { billing: "bulanan" | "tahunan" }. Harga DITENTUKAN SERVER
// (59rb/bln, 588rb/thn — keputusan user 12 Okt 2026), bukan dari browser.
// Auth: header "Authorization: Bearer <access_token>" (seller login).
// Insert premium_requests (status menunggu) → generate QRIS → simpan
// external_ref. Webhook yang mengaktifkan plan (lihat buatqris-webhook).
//
// CATATAN VERCEL: SELF-CONTAINED (tanpa import relatif).

import { createClient } from "@supabase/supabase-js";

const PRICE = { bulanan: 59000, tahunan: 588000 } as const;
const PLAN_LABEL = { bulanan: "Premium Bulanan", tahunan: "Premium Tahunan" } as const;

function json(res: any, data: unknown, status = 200) {
  return res.status(status).json(data);
}

function clientIp(req: any): string {
  const real = (req.headers["x-real-ip"] as string | undefined)?.trim();
  if (real) return real;
  const vercel = (req.headers["x-vercel-forwarded-for"] as string | undefined)?.split(",").map((s) => s.trim()).filter(Boolean);
  if (vercel && vercel.length > 0) return vercel[0];
  return "unknown";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, { error: "Method tidak didukung." }, 405);

  // Rate limit per-IP (in-memory per instance, sama seperti create-order).
  const ip = clientIp(req);
  const g = globalThis as unknown as { __cpHits?: Map<string, { n: number; reset: number }> };
  g.__cpHits = g.__cpHits ?? new Map();
  const now = Date.now();
  const cur = g.__cpHits.get(ip);
  if (!cur || now > cur.reset) g.__cpHits.set(ip, { n: 1, reset: now + 60_000 });
  else {
    cur.n += 1;
    if (cur.n > 30) return json(res, { error: "Terlalu banyak percobaan." }, 429);
  }

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !key) return json(res, { error: "Server belum dikonfigurasi." }, 500);

  // Identitas dari token login (tidak percaya seller_id dari browser).
  const token = ((req.headers.authorization as string | undefined) ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(res, { error: "Belum login." }, 401);
  const gate = createClient(url, anon, { auth: { persistSession: false } });
  const { data: me } = await gate.auth.getUser(token);
  if (!me.user) return json(res, { error: "Sesi tidak valid. Masuk ulang." }, 401);
  const uid = me.user.id;

  let billing = "";
  try {
    const b = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as { billing?: string } | null;
    billing = String(b?.billing ?? "").toLowerCase();
  } catch {
    return json(res, { error: "Data tidak valid." }, 400);
  }
  if (billing !== "bulanan" && billing !== "tahunan") {
    return json(res, { error: "Pilih paket Bulanan atau Tahunan." }, 400);
  }
  const amount = PRICE[billing];

  const db = createClient(url, key, { auth: { persistSession: false } });

  // Profil harus ada & aktif.
  const { data: prof } = await db
    .from("profiles")
    .select("id,plan,premium_until,status")
    .eq("id", uid)
    .maybeSingle();
  const p = prof as { plan: string; premium_until: string | null; status: string } | null;
  if (!p) return json(res, { error: "Profil tidak ditemukan." }, 400);
  if (p.status !== "aktif") return json(res, { error: "Akun tidak aktif." }, 400);

  // Sudah premium aktif → tolak (hindari bayar dobel).
  if (p.plan === "premium" && (!p.premium_until || new Date(p.premium_until).getTime() > Date.now())) {
    const until = p.premium_until
      ? new Date(p.premium_until).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : "";
    return json(res, { error: `Premium masih aktif${until ? ` sampai ${until}` : ""}.` }, 409);
  }

  // QR sebelumnya (< 10 menit, belum dibayar) masih berlaku → pakai itu,
  // jangan bikin tagihan baru (anti klik-ganda = bayar 2x).
  const { data: pending } = await db
    .from("premium_requests")
    .select("id,external_ref,created_at")
    .eq("seller_id", uid)
    .eq("status", "menunggu")
    .not("external_ref", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const pend = pending as { id: string; external_ref: string; created_at: string } | null;
  if (pend && Date.now() - new Date(pend.created_at).getTime() < 10 * 60_000) {
    return json(res, { error: "QR sebelumnya masih berlaku. Selesaikan pembayaran itu dulu.", request_id: pend.id }, 409);
  }

  // Catat permintaan dulu (webhook yang mengubah jadi disetujui).
  const { data: inserted, error: insErr } = await db
    .from("premium_requests")
    .insert({ seller_id: uid, plan: PLAN_LABEL[billing], amount, proof_channel: "QRIS", status: "menunggu" })
    .select("id")
    .single();
  if (insErr || !inserted) return json(res, { error: "Gagal membuat tagihan." }, 500);
  const requestId = (inserted as { id: string }).id;

  // Generate QRIS (pola sama seperti create-order).
  const accountId = process.env.BUATQRIS_ACCOUNT_ID;
  const secretToken = process.env.BUATQRIS_SECRET_TOKEN;
  const testMode = process.env.BUATQRIS_TEST ?? "1";
  if (!accountId || !secretToken) {
    return json(res, { request_id: requestId, qr_pending: true, error: "Kredensial BuatQris belum dipasang di server." });
  }
  const callbackUrl =
    process.env.BUATQRIS_CALLBACK_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/buatqris-webhook` : undefined);
  const params = new URLSearchParams({
    action: "api_create_qris",
    account_id: accountId,
    secret_token: secretToken,
    amount: String(amount),
    description: `TokoLink ${PLAN_LABEL[billing]}`.slice(0, 100),
    fee_by: "user",
    test: testMode,
    app_name: "TokoLink",
  });
  if (callbackUrl) params.set("callback_url", callbackUrl);

  try {
    const r = await fetch("https://api.buatqris.site", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const out = (await r.json()) as {
      success: boolean;
      message?: string;
      data?: {
        transaction_id: string;
        total_amount: number;
        admin_fee: number;
        qr_url: string;
        qris_image: string;
        expired_at: string | null;
        payment_url: string | null;
      };
    };
    if (out.success && out.data) {
      const d = out.data;
      await db.from("premium_requests").update({ external_ref: d.transaction_id }).eq("id", requestId);
      return json(res, {
        request_id: requestId,
        qr_pending: false,
        amount,
        qr: {
          qr_url: d.qr_url,
          qris_image: d.qris_image,
          total_amount: d.total_amount,
          expired_at: d.expired_at,
          payment_url: d.payment_url,
          is_test: testMode === "1" || testMode === "true",
        },
      });
    }
    return json(res, { request_id: requestId, qr_pending: true, error: out.message ?? "BuatQris menolak permintaan." });
  } catch {
    return json(res, { request_id: requestId, qr_pending: true, error: "Tidak bisa menghubungi BuatQris." });
  }
}
