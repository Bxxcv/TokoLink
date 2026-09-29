// POST /api/create-order — Task 3.2 (dokumen resmi BuatQris:
// Problem_screenshot/konfigurasi-open-api.txt).
//
// CATATAN VERCEl: function di /api HARUS default export gaya
// (req, res) dan SELF-CONTAINED (tanpa import relatif — resolver ESM
// Vercel gagal memuat "./_lib", terbukti dari log 500 kemarin).

import { createClient } from "@supabase/supabase-js";

type CartLine = { product_id: string; qty: number };

function json(res: any, data: unknown, status = 200) {
  return res.status(status).json(data);
}

function newOrderId(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TL-${yy}${mm}-${rand}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, { error: "Method tidak didukung." }, 405);

  // Rate limit sederhana per-IP.
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ?? "unknown";
  const g = globalThis as unknown as { __coHits?: Map<string, { n: number; reset: number }> };
  g.__coHits = g.__coHits ?? new Map();
  const now = Date.now();
  const cur = g.__coHits.get(ip);
  if (!cur || now > cur.reset) g.__coHits.set(ip, { n: 1, reset: now + 60_000 });
  else {
    cur.n += 1;
    if (cur.n > 30) return json(res, { error: "Terlalu banyak percobaan." }, 429);
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
    seller_id?: string;
    buyer_name?: string;
    buyer_phone?: string;
    buyer_city?: string;
    buyer_address?: string;
    buyer_note?: string;
    channel?: string;
    cart?: CartLine[];
    promo_code?: string;
  } | null;
  if (!body?.seller_id || !body?.buyer_name || !Array.isArray(body?.cart) || body.cart.length === 0) {
    return json(res, { error: "Data pesanan tidak lengkap." }, 400);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(res, { error: "Server belum dikonfigurasi." }, 500);
  const db = createClient(url, key, { auth: { persistSession: false } });

  // 1) Harga SELALU dari DB (jangan percaya total dari browser).
  const ids = body.cart.map((c) => c.product_id);
  const { data: products } = await db
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("seller_id", body.seller_id)
    .eq("status", "aktif");
  const byId = new Map(
    ((products ?? []) as Record<string, unknown>[]).map((p) => [(p as { id: string }).id, p]),
  );
  let subtotal = 0;
  const lines: { product_id: string; name: string; qty: number; price: number }[] = [];
  for (const line of body.cart) {
    const p = byId.get(line.product_id) as { name: string; price: number | string } | undefined;
    if (!p || line.qty <= 0) continue;
    subtotal += Number(p.price) * line.qty;
    lines.push({ product_id: line.product_id, name: p.name, qty: line.qty, price: Number(p.price) });
  }
  if (lines.length === 0) return json(res, { error: "Produk tidak tersedia." }, 400);

  // 2) Validasi promo server-side.
  let discount = 0;
  let promoId: string | null = null;
  let promoUsed = 0;
  const code = (body.promo_code ?? "").trim();
  if (code) {
    const { data: codes } = await db
      .from("discount_codes")
      .select("*")
      .eq("seller_id", body.seller_id)
      .eq("is_active", true);
    const match = ((codes ?? []) as Record<string, unknown>[]).find(
      (d) => String(d.code).toLowerCase() === code.toLowerCase(),
    ) as
      | {
          id: string;
          type: string;
          value: number | string;
          min_purchase: number | string;
          usage_limit: number | null;
          used_count: number;
          valid_until?: string | null;
        }
      | undefined;
    if (match) {
      const today = new Date().toISOString().slice(0, 10);
      const expired = match.valid_until ? String(match.valid_until) < today : false;
      const over = match.usage_limit != null && match.used_count >= match.usage_limit;
      if (!expired && !over && subtotal >= Number(match.min_purchase)) {
        if (match.type === "persen") discount = Math.round((subtotal * Number(match.value)) / 100);
        else if (match.type === "nominal") discount = Math.min(Math.round(Number(match.value)), subtotal);
        promoId = match.id;
        promoUsed = match.used_count;
      }
    }
  }

  const total = subtotal - discount;

  // 3) Insert orders + items + payments (status menunggu).
  let orderId = newOrderId();
  let order: { id: string; access_token: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await db
      .from("orders")
      .insert({
        id: orderId,
        seller_id: body.seller_id,
        buyer_name: body.buyer_name.trim(),
        buyer_phone: (body.buyer_phone ?? "").replace(/[^\d+]/g, "") || null,
        buyer_city: body.buyer_city ?? null,
        buyer_address: body.buyer_address?.trim() || null,
        buyer_note: body.buyer_note?.trim() || null,
        total,
        status: "menunggu",
        channel: body.channel ?? "QRIS",
      })
      .select("id,access_token")
      .single();
    if (!error && data) {
      order = data as { id: string; access_token: string };
      break;
    }
    orderId = newOrderId();
  }
  if (!order) return json(res, { error: "Gagal membuat pesanan." }, 500);
  const oid = (order as { id: string }).id;
  const otoken = (order as { access_token: string }).access_token;

  await db.from("order_items").insert(
    lines.map((l) => ({
      order_id: oid,
      product_id: l.product_id,
      product_name_snapshot: l.name,
      qty: l.qty,
      price_snapshot: l.price,
    })),
  );
  const { data: payment } = await db
    .from("payments")
    .insert({ order_id: oid, seller_id: body.seller_id, channel: "QRIS", amount: total, fee: 0, status: "menunggu" })
    .select("id")
    .single();

  if (promoId) {
    await db.from("discount_codes").update({ used_count: promoUsed + 1 }).eq("id", promoId);
  }

  // 4) BuatQris generate QRIS.
  const base = { order_id: oid, access_token: otoken };
  if (total < 1000) {
    return json(res, { ...base, qr_pending: true, error: "Minimal pembayaran Rp1.000 (aturan BuatQris)." }, 400);
  }
  const accountId = process.env.BUATQRIS_ACCOUNT_ID;
  const secretToken = process.env.BUATQRIS_SECRET_TOKEN;
  const testMode = process.env.BUATQRIS_TEST ?? "1";
  if (!accountId || !secretToken) {
    return json(res, { ...base, qr_pending: true, error: "Kredensial BuatQris belum dipasang di server." });
  }
  const callbackUrl =
    process.env.BUATQRIS_CALLBACK_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/buatqris-webhook` : undefined);
  const params = new URLSearchParams({
    action: "api_create_qris",
    account_id: accountId,
    secret_token: secretToken,
    amount: String(Math.round(total)),
    description: `TokoLink ${oid}`.slice(0, 100),
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
      const pid = (payment as { id: string } | null)?.id;
      if (pid) {
        await db
          .from("payments")
          .update({ external_ref: d.transaction_id, fee: d.admin_fee, amount: d.total_amount })
          .eq("id", pid);
      }
      return json(res, {
        ...base,
        qr_pending: false,
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
    return json(res, { ...base, qr_pending: true, error: out.message ?? "BuatQris menolak permintaan." });
  } catch {
    return json(res, { ...base, qr_pending: true, error: "Tidak bisa menghubungi BuatQris." });
  }
}
