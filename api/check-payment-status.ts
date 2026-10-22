// POST /api/check-payment-status — cek status transaksi BuatQris secara manual.
// Fallback jika webhook tidak sampai. Idempoten.
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method tidak didukung." });

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !key) return res.status(500).json({ error: "Server belum dikonfigurasi." });

  const token = ((req.headers.authorization as string | undefined) ?? (req.headers["x-supabase-auth"] as string | undefined) ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return res.status(401).json({ error: "Belum login." });

  const gate = createClient(url, anon, { auth: { persistSession: false } });
  const { data: me } = await gate.auth.getUser(token);
  if (!me.user) return res.status(401).json({ error: "Sesi tidak valid." });

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const orderId = String(body?.order_id ?? "").trim();
  if (!orderId) return res.status(400).json({ error: "order_id wajib." });

  const db = createClient(url, key, { auth: { persistSession: false } });

  // Cek kepemilikan order
  const { data: order } = await db.from("orders").select("id,seller_id,buyer_id,status,access_token").eq("id", orderId).maybeSingle();
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan." });
  const o = order as { id: string; seller_id: string; buyer_id: string | null; status: string; access_token: string };
  if (o.buyer_id !== me.user.id) return res.status(403).json({ error: "Bukan pesananmu." });

  // Ambil payment terbaru
  const { data: payment } = await db.from("payments").select("id,external_ref,status,amount,fee,channel").eq("order_id", orderId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!payment) return res.status(404).json({ error: "Pembayaran tidak ditemukan." });
  const p = payment as { id: string; external_ref: string | null; status: string; amount: number | string; fee: number | string; channel: string };

  if (p.status === "berhasil") return res.status(200).json({ ok: true, status: "berhasil", message: "Sudah lunas." });
  if (p.status === "gagal" || p.status === "perlu_cek") return res.status(200).json({ ok: true, status: p.status, message: "Status: " + p.status });

  // Cek status di BuatQris
  const accountId = process.env.BUATQRIS_ACCOUNT_ID;
  const secretToken = process.env.BUATQRIS_SECRET_TOKEN;
  if (!accountId || !secretToken || !p.external_ref) {
    return res.status(200).json({ ok: true, status: p.status, message: "Menunggu pembayaran." });
  }

  const params = new URLSearchParams({
    action: "api_check_status",
    account_id: accountId,
    secret_token: secretToken,
    transaction_id: p.external_ref,
  });

  try {
    const r = await fetch("https://api.buatqris.site", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: AbortSignal.timeout(15000),
    });
    const out = (await r.json()) as { success: boolean; data?: { status: string; total_amount: number; admin_fee: number; credit_amount: number } };

    if (!out.success || !out.data) {
      return res.status(200).json({ ok: true, status: p.status, message: "Belum ada update dari BuatQris." });
    }

    const bqStatus = out.data.status; // pending | success | expired | failed

    if (bqStatus === "success") {
      // Rekonsiliasi nominal
      const paidTotal = Number(out.data.total_amount);
      if (Number.isFinite(paidTotal) && Math.round(paidTotal) !== Math.round(Number(p.amount))) {
        await db.from("payments").update({ status: "perlu_cek", fee: out.data.admin_fee }).eq("id", p.id).eq("status", "menunggu");
        return res.status(200).json({ ok: true, status: "perlu_cek", message: "Nominal tidak cocok, perlu cek admin." });
      }
      const { data: claimed } = await db.from("payments").update({ status: "berhasil", fee: out.data.admin_fee }).eq("id", p.id).eq("status", "menunggu").select("id");
      if (claimed && claimed.length > 0) {
        const { data: ord } = await db.from("orders").select("status").eq("id", orderId).maybeSingle();
        if ((ord as { status: string } | null)?.status === "menunggu") {
          await db.from("orders").update({ status: "dikemas" }).eq("id", orderId).eq("status", "menunggu");
        }
        const credit = Math.min(Math.max(0, Number(out.data.credit_amount ?? Number(p.amount) - out.data.admin_fee)), Number(p.amount));
        await db.from("ledger").insert({ seller_id: o.seller_id, label: `Penjualan ${orderId}`, amount: credit, type: "masuk", ref_order_id: orderId });
        const fee = out.data.admin_fee;
        if (fee > 0) {
          await db.from("ledger").insert({ seller_id: o.seller_id, label: `Komisi platform ${orderId}`, amount: -fee, type: "keluar", ref_order_id: orderId });
        }
      }
      return res.status(200).json({ ok: true, status: "berhasil", message: "Pembayaran lunas!" });
    }

    if (bqStatus === "expired" || bqStatus === "failed") {
      await db.from("payments").update({ status: "gagal" }).eq("id", p.id).eq("status", "menunggu");
      await db.from("orders").update({ status: "batal" }).eq("id", orderId).eq("status", "menunggu");
      return res.status(200).json({ ok: true, status: "batal", message: "Pembayaran gagal/kedaluwarsa." });
    }

    return res.status(200).json({ ok: true, status: "menunggu", message: "Menunggu pembayaran." });
  } catch (e: any) {
    return res.status(200).json({ ok: true, status: p.status, message: "Gagal cek status: " + (e?.message ?? "unknown") });
  }
}
