// POST /api/buatqris-webhook — Task 3.4 (dokumen resmi BuatQris:
// Problem_screenshot/konfigurasi-open-api.txt).
//
// CATATAN VERCEL: default export gaya (req, res), SELF-CONTAINED
// (tanpa import relatif), dan bodyParser DIMATIKAN agar HMAC dihitung
// dari RAW body. GET dibalas 405 (bukan 500).
//
// Fakta dari dokumen: header X-BuatQris-Event / X-BuatQris-Delivery /
// X-BuatQris-Signature ("sha256=" + hex HMAC, secret = Signing Secret);
// event payment.success / payment.expired / payment.failed.

import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

function readRaw(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method tidak didukung." });

  // Rate limit sederhana per-IP (pakai header terpercaya, bukan XFF pertama).
  const realIp = (req.headers["x-real-ip"] as string | undefined)?.trim();
  const xvf = (req.headers["x-vercel-forwarded-for"] as string | undefined)?.split(",").map((s) => s.trim()).filter(Boolean);
  const xff = (req.headers["x-forwarded-for"] as string | undefined)?.split(",").map((s) => s.trim()).filter(Boolean);
  const ip = realIp || (xvf && xvf[0]) || (xff && xff[xff.length - 1]) || "unknown";
  const g = globalThis as unknown as { __whHits?: Map<string, { n: number; reset: number }> };
  g.__whHits = g.__whHits ?? new Map();
  const now = Date.now();
  const cur = g.__whHits.get(ip);
  if (!cur || now > cur.reset) g.__whHits.set(ip, { n: 1, reset: now + 60_000 });
  else {
    cur.n += 1;
    if (cur.n > 60) return res.status(429).json({ error: "Rate limited." });
  }

  const secret = process.env.BUATQRIS_SIGNING_SECRET;
  if (!secret) return res.status(500).json({ error: "Webhook belum dikonfigurasi." });

  const rawBody = await readRaw(req);
  const signature = (req.headers["x-buatqris-signature"] as string | undefined) ?? "";
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return res.status(401).end();
  }

  const event = (req.headers["x-buatqris-event"] as string | undefined) ?? "";
  const payload = JSON.parse(rawBody) as {
    event?: string;
    transaction_id?: string;
    status?: string;
    total_amount?: number;
    credit_amount?: number;
    admin_fee?: number;
  };
  const evt = payload.event ?? event;

  if (evt.startsWith("withdrawal.")) return res.status(200).json({ ok: true, ignored: true });
  if (!evt.startsWith("payment.")) return res.status(400).json({ error: "Event tidak dikenal." });
  if (!payload.transaction_id) return res.status(400).json({ error: "Payload tidak lengkap." });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: "Server belum dikonfigurasi." });
  const db = createClient(url, key, { auth: { persistSession: false } });

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
  if (!payment) return res.status(404).json({ error: "Transaksi tidak dikenal." });
  if (payment.status !== "menunggu") return res.status(200).json({ ok: true, deduped: true });

  const fee = Number(payload.admin_fee ?? 0);

  if (evt === "payment.success") {
    // Rekonsiliasi nominal: yang dibayar HARUS sama dengan yang diminta.
    // Beda → tandai perlu_cek, JANGAN kreditkan saldo.
    const paidTotal = Number(payload.total_amount);
    if (Number.isFinite(paidTotal) && Math.round(paidTotal) !== Math.round(Number(payment.amount))) {
      await db.from("payments").update({ status: "perlu_cek", fee }).eq("id", payment.id).eq("status", "menunggu");
      return res.status(200).json({ ok: true, flagged: true });
    }
    const { data: claimed } = await db
      .from("payments")
      .update({ status: "berhasil", fee })
      .eq("id", payment.id)
      .eq("status", "menunggu")
      .select("id");
    if (!claimed || claimed.length === 0) return res.status(200).json({ ok: true, deduped: true });
    // Jangan turunkan status order yang sudah jalan (kirim/selesai).
    const { data: ord } = await db.from("orders").select("status").eq("id", payment.order_id).maybeSingle();
    if ((ord as { status: string } | null)?.status === "menunggu") {
      await db.from("orders").update({ status: "dikemas" }).eq("id", payment.order_id).eq("status", "menunggu");
    }
    // Kredit dibatasi maksimal sebesar tagihan (jangan percaya payload mentah).
    const credit = Math.min(
      Math.max(0, Number(payload.credit_amount ?? Number(payment.amount) - fee)),
      Number(payment.amount),
    );
    const { error: ledgerErr } = await db.from("ledger").insert({
      seller_id: payment.seller_id,
      label: `Penjualan ${payment.order_id}`,
      amount: credit,
      type: "masuk",
      ref_order_id: payment.order_id,
    });
    if (ledgerErr) {
      // Uang JANGAN hilang diam-diam: tandai agar admin rekonsiliasi manual.
      await db.from("payments").update({ status: "perlu_cek" }).eq("id", payment.id);
      return res.status(200).json({ ok: true, flagged: true });
    }

    // Komisi platform -- baris ledger TERPISAH (bukan dikurangi diam-diam
    // dari baris di atas) supaya seller bisa lihat jelas di riwayat saldo
    // kenapa saldonya tidak 100% dari harga jual. Default 2% kalau
    // belum pernah diatur admin -- lihat database/migrate_platform_fee.sql.
    // Ganti angkanya kapan saja lewat tabel `settings`, tidak perlu ubah
    // kode ini lagi.
    const { data: feeSetting } = await db
      .from("settings")
      .select("value")
      .eq("key", "platform_fee_percent")
      .maybeSingle();
    const feePercent = Number(feeSetting?.value ?? 2);
    if (feePercent > 0) {
      const platformFee = Math.round((credit * feePercent) / 100);
      if (platformFee > 0) {
        await db.from("ledger").insert({
          seller_id: payment.seller_id,
          label: `Komisi platform ${feePercent}% — ${payment.order_id}`,
          amount: -platformFee,
          type: "keluar",
          ref_order_id: payment.order_id,
        });
      }
    }
    // Kurangi stok + tambah counter terjual ATOMIK per produk via RPC.
    // Kalau stok ternyata kurang (race), tandai perlu_cek untuk review admin.
    const { data: items } = await db
      .from("order_items")
      .select("product_id,qty")
      .eq("order_id", payment.order_id);
    let short = false;
    for (const it of ((items ?? []) as { product_id: string | null; qty: number }[])) {
      if (!it.product_id) continue;
      const { data: ok } = await db.rpc("decrement_stock", {
        p_product_id: it.product_id,
        p_qty: Math.max(1, Math.floor(Number(it.qty))),
      });
      if (!ok) short = true;
    }
    if (short) {
      await db.from("payments").update({ status: "perlu_cek" }).eq("id", payment.id);
    }
    return res.status(200).json({ ok: true });
  }

  if (evt === "payment.expired" || evt === "payment.failed") {
    // Expired yang datang SETELAH sukses tidak boleh membatalkan order lunas.
    // payment.failed = terminal juga: order yang tak akan dibayar jangan
    // menggantung 'menunggu' selamanya (tidak ada retry di UI).
    if (payment.status !== "menunggu") return res.status(200).json({ ok: true, deduped: true });
    await db.from("payments").update({ status: "gagal", fee }).eq("id", payment.id).eq("status", "menunggu");
    await db.from("orders").update({ status: "batal" }).eq("id", payment.order_id).eq("status", "menunggu");
    return res.status(200).json({ ok: true });
  }

  await db.from("payments").update({ status: "gagal", fee }).eq("id", payment.id).eq("status", "menunggu");
  return res.status(200).json({ ok: true });
}
