// POST /api/buatqris-webhook — Task 3.4 (SCAFFOLD: aktif penuh setelah
// webhook secret BuatQris diisi — JANGAN tebak nama header/field sebelum
// baca dokumentasi resmi BuatQris, lihat .opencode/skill/buatqris-webhook/SKILL.md).
//
// Aturan wajib dari skill (sudah diterapkan di bawah):
// - Verifikasi HMAC SHA256 dari RAW body (bukan hasil JSON.parse ulang).
// - Signature tidak valid → 401, jangan proses payload.
// - Idempotent: cek payments sudah 'berhasil' sebelum insert ledger.
// - Rate limit aktif.

import { createHmac, timingSafeEqual } from "node:crypto";
import { adminDb, clientIp, json, rateLimit } from "./_lib";

export async function POST(req: Request): Promise<Response> {
  if (!rateLimit(clientIp(req), 60)) return json({ error: "Rate limited." }, 429);

  const secret = process.env.BUATQRIS_WEBHOOK_SECRET;
  if (!secret) return json({ error: "Webhook belum dikonfigurasi." }, 500);

  // RAW body — wajib untuk HMAC yang valid.
  const rawBody = await req.text();

  // TODO: samakan nama header signature + bentuk payload dengan
  // dokumentasi resmi BuatQris (jangan tebak).
  const signature = req.headers.get("x-buatqris-signature") ?? "";
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return new Response(null, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    // TODO: samakan field ini dengan dokumentasi resmi BuatQris.
    external_ref?: string;
    status?: string;
    amount?: number;
    fee?: number;
  };
  if (!payload.external_ref) return json({ error: "Payload tidak lengkap." }, 400);

  const db = adminDb();
  const { data: payment } = await db
    .from("payments")
    .select("id,order_id,seller_id,amount,fee,status")
    .eq("external_ref", payload.external_ref)
    .maybeSingle() as { data: {
      id: string; order_id: string; seller_id: string;
      amount: number | string; fee: number | string; status: string;
    } | null };

  if (!payment) return json({ error: "Transaksi tidak dikenal." }, 404);

  // Idempotent: sudah berhasil → jangan proses ulang (cegah ledger dobel).
  if (payment.status === "berhasil") return json({ ok: true, deduped: true });

  const paid = String(payload.status).toLowerCase() === "berhasil"; // TODO: samakan nilai status sukses resmi
  const fee = Number(payload.fee ?? 0);

  await db.from("payments").update({ status: paid ? "berhasil" : "gagal", fee }).eq("id", payment.id);

  if (paid) {
    await db.from("orders").update({ status: "dikemas" }).eq("id", payment.order_id);
    await db.from("ledger").insert({
      seller_id: payment.seller_id,
      label: `Penjualan ${payment.order_id}`,
      amount: Number(payment.amount) - fee,
      type: "masuk",
      ref_order_id: payment.order_id,
    });
  }

  return json({ ok: true });
}
