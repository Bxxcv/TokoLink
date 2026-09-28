// POST /api/buatqris-webhook — Task 3.4 (implementasi penuh mengikuti
// dokumen resmi BuatQris: Problem_screenshot/konfigurasi-open-api.txt).
//
// Fakta dari dokumen (bukan tebakan):
// - Header: X-BuatQris-Event, X-BuatQris-Delivery, X-BuatQris-Signature
// - Signature = "sha256=" + hex HMAC-SHA256 dari RAW body,
//   secret = Signing Secret (beda dengan secret_token API).
// - Event: payment.success / payment.expired / payment.failed
//   (+ withdrawal.* — diabaikan, alur tarik dana kita manual via admin).
// - Body pembayaran: event, transaction_id, status, amount, total_amount,
//   credit_amount, admin_fee, is_test, paid_at.

import { createHmac, timingSafeEqual } from "node:crypto";
import { adminDb, clientIp, json, rateLimit } from "./_lib";

export async function POST(req: Request): Promise<Response> {
  if (!rateLimit(clientIp(req), 60)) return json({ error: "Rate limited." }, 429);

  const secret = process.env.BUATQRIS_SIGNING_SECRET;
  if (!secret) return json({ error: "Webhook belum dikonfigurasi." }, 500);

  // RAW body — wajib untuk HMAC yang valid (jangan JSON.parse dulu).
  const rawBody = await req.text();

  const signature = req.headers.get("x-buatqris-signature") ?? "";
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return new Response(null, { status: 401 });
  }

  const event = req.headers.get("x-buatqris-event") ?? "";
  const payload = JSON.parse(rawBody) as {
    event?: string;
    transaction_id?: string;
    status?: string;
    total_amount?: number;
    credit_amount?: number;
    admin_fee?: number;
  };
  const evt = payload.event ?? event;

  // Event penarikan bukan alur kita (tarik dana via admin) → akui saja.
  if (evt.startsWith("withdrawal.")) return json({ ok: true, ignored: true });
  if (!evt.startsWith("payment.")) return json({ error: "Event tidak dikenal." }, 400);
  if (!payload.transaction_id) return json({ error: "Payload tidak lengkap." }, 400);

  const db = adminDb();
  const { data: payment } = (await db
    .from("payments")
    .select("id,order_id,seller_id,amount,fee,status")
    .eq("external_ref", payload.transaction_id)
    .maybeSingle()) as {
    data: {
      id: string;
      order_id: string;
      seller_id: string;
      amount: number | string;
      fee: number | string;
      status: string;
    } | null;
  };

  if (!payment) return json({ error: "Transaksi tidak dikenal." }, 404);

  // Idempotent: sudah final → jangan proses ulang (cegah ledger dobel).
  if (payment.status !== "menunggu") return json({ ok: true, deduped: true });

  const fee = Number(payload.admin_fee ?? 0);

  if (evt === "payment.success") {
    // Atomic: hanya 1 webhook yang menang (cegah race antar retry).
    const { data: claimed } = await db
      .from("payments")
      .update({ status: "berhasil", fee })
      .eq("id", payment.id)
      .eq("status", "menunggu")
      .select("id");
    if (!claimed || claimed.length === 0) return json({ ok: true, deduped: true });

    await db.from("orders").update({ status: "dikemas" }).eq("id", payment.order_id);
    const credit = Number(payload.credit_amount ?? Number(payment.amount) - fee);
    await db.from("ledger").insert({
      seller_id: payment.seller_id,
      label: `Penjualan ${payment.order_id}`,
      amount: credit,
      type: "masuk",
      ref_order_id: payment.order_id,
    });
    return json({ ok: true });
  }

  if (evt === "payment.expired") {
    await db.from("payments").update({ status: "gagal", fee }).eq("id", payment.id).eq("status", "menunggu");
    await db.from("orders").update({ status: "batal" }).eq("id", payment.order_id);
    return json({ ok: true });
  }

  // payment.failed → payments gagal, order tetap menunggu (boleh retry QR baru).
  await db.from("payments").update({ status: "gagal", fee }).eq("id", payment.id).eq("status", "menunggu");
  return json({ ok: true });
}
