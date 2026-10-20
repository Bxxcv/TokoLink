// POST /api/create-order — FULL REPAIR.
// Total = subtotal - diskon (ongkir dihapus Okt 2026, kirim via chat).
//
// - Harga SELALU dari DB. Multi-toko: toko DITURUNKAN dari produk (bukan
//   dipercaya mentah); seller_id (pemilik akun) diambil dari stores.owner_id
//   untuk payments/ledger (dompet level AKUN), order dicatat per TOKO.
// - Stok divalidasi (tolak bila kurang). Pengurangan stok atomik di webhook.
// - Kuota promo via RPC atomik consume_promo (anti-race).
// - Idempotensi via idempotency_key (unique). Klik ganda = 1 order.
// - Validasi panjang field + batas qty. Total < 1000 ditolak SEBELUM insert.
//
// CATATAN VERCEL: SELF-CONTAINED (tanpa import relatif).

import { createClient } from "@supabase/supabase-js";

type CartLine = { product_id: string; qty: number };

type OrderBody = {
  store_id?: string;
  seller_id?: string;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_city?: string;
  buyer_address?: string;
  buyer_note?: string;
  channel?: string;
  cart?: CartLine[];
  promo_code?: string;
  shipping_method?: string;
  idempotency_key?: string;
};

function parseBody(req: any): OrderBody | null {
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!b || typeof b !== "object") return null;
    return b as OrderBody;
  } catch {
    return null;
  }
}

function json(res: any, data: unknown, status = 200) {
  return res.status(status).json(data);
}

function newOrderId(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900000) + 100000; // 6 digit
  return `TL-${yy}${mm}-${rand}`;
}

/** IP client yang benar di Vercel: x-real-ip dulu, terakhir dari XFF. */
function clientIp(req: any): string {
  const real = (req.headers["x-real-ip"] as string | undefined)?.trim();
  if (real) return real;
  const vercel = (req.headers["x-vercel-forwarded-for"] as string | undefined)?.split(",").map((s) => s.trim()).filter(Boolean);
  if (vercel && vercel.length > 0) return vercel[0];
  const xff = (req.headers["x-forwarded-for"] as string | undefined)?.split(",").map((s) => s.trim()).filter(Boolean);
  if (xff && xff.length > 0) return xff[xff.length - 1];
  return "unknown";
}

/* Ongkir dihapus (keputusan produk Okt 2026): total = subtotal - diskon. */

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, { error: "Method tidak didukung." }, 405);

  // Buyer wajib login (keputusan produk 18 Okt 2026).
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !key) return json(res, { error: "Server belum dikonfigurasi." }, 500);
  // Vercel deployment protection bisa strip header Authorization; fallback ke X-Supabase-Auth.
  const authHeader = (req.headers.authorization as string | undefined) ?? (req.headers["x-supabase-auth"] as string | undefined) ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json(res, { error: "Belum login. Masuk dulu untuk checkout." }, 401);
  const gate = createClient(url, anon, { auth: { persistSession: false } });
  const { data: me } = await gate.auth.getUser(token);
  if (!me.user) return json(res, { error: "Sesi tidak valid. Masuk lagi." }, 401);
  const buyerId = me.user.id;

  // Rate limit per-IP (in-memory per instance; lihat LAPORAN untuk batasnya).
  const ip = clientIp(req);
  const g = globalThis as unknown as { __coHits?: Map<string, { n: number; reset: number }> };
  g.__coHits = g.__coHits ?? new Map();
  const now = Date.now();
  const cur = g.__coHits.get(ip);
  if (!cur || now > cur.reset) g.__coHits.set(ip, { n: 1, reset: now + 60_000 });
  else {
    cur.n += 1;
    if (cur.n > 30) return json(res, { error: "Terlalu banyak percobaan." }, 429);
  }

  const body = parseBody(req);
  if (!body) return json(res, { error: "Data pesanan tidak valid." }, 400);

  const cart = Array.isArray(body.cart) ? body.cart.slice(0, 50) : [];
  if (!body.buyer_name || cart.length === 0) {
    return json(res, { error: "Data pesanan tidak lengkap." }, 400);
  }
  // Batas field (anti-spam raksasa).
  const name = String(body.buyer_name).trim().slice(0, 100);
  const phone = String(body.buyer_phone ?? "").replace(/[^\d+]/g, "").slice(0, 20) || null;
  const city = String(body.buyer_city ?? "").slice(0, 60) || null;
  const address = String(body.buyer_address ?? "").trim().slice(0, 500) || null;
  const note = String(body.buyer_note ?? "").trim().slice(0, 500) || null;
  if (name.length < 3) return json(res, { error: "Tulis nama penerima." }, 400);

  const idemKey = String(body.idempotency_key ?? "").trim().slice(0, 64) || null;

  const db = createClient(url, key, { auth: { persistSession: false } });

  // Idempotensi: kunci dipakai ulang → kembalikan order lama.
  if (idemKey) {
    const { data: prev } = await db
      .from("orders")
      .select("id,access_token")
      .eq("idempotency_key", idemKey)
      .maybeSingle();
    if (prev) {
      const p = prev as { id: string; access_token: string };
      const { data: pay } = await db
        .from("payments")
        .select("external_ref,amount")
        .eq("order_id", p.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return json(res, {
        order_id: p.id,
        access_token: p.access_token,
        qr_pending: !(pay as { external_ref: string | null } | null)?.external_ref,
        deduped: true,
      });
    }
  }

  // 1) Produk SELALU dari DB. Toko DITURUNKAN (satu toko per order).
  const ids = [...new Set(cart.map((c) => String(c.product_id)))];
  const { data: products } = await db
    .from("products")
    .select("id,store_id,seller_id,name,price,stock")
    .in("id", ids)
    .eq("status", "aktif");
  const byId = new Map(
    ((products ?? []) as { id: string; store_id: string | null; seller_id: string; name: string; price: number | string; stock: number }[]).map((p) => [p.id, p]),
  );
  let subtotal = 0;
  const lines: { product_id: string; name: string; qty: number; price: number }[] = [];
  const outOfStock: string[] = [];
  for (const line of cart) {
    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 100) continue;
    const p = byId.get(String(line.product_id));
    if (!p) continue;
    if (Number(p.stock) < qty) {
      outOfStock.push(p.name);
      continue;
    }
    subtotal += Number(p.price) * qty;
    lines.push({ product_id: String(line.product_id), name: p.name, qty, price: Number(p.price) });
  }
  if (outOfStock.length > 0) {
    return json(res, { error: `Stok tidak cukup: ${outOfStock.slice(0, 3).join(", ")}.` }, 400);
  }
  if (lines.length === 0) return json(res, { error: "Produk tidak tersedia." }, 400);
  // Semua produk wajib punya store_id & satu toko yang sama.
  const storeIds = new Set(lines.map((l) => byId.get(l.product_id)?.store_id ?? ""));
  if (storeIds.size !== 1 || storeIds.has("")) {
    return json(res, { error: "Keranjang berisi produk beda toko. Selesaikan satu toko dulu." }, 400);
  }
  const storeId = [...storeIds][0];
  if (body.store_id && body.store_id !== storeId) {
    return json(res, { error: "Data toko tidak cocok." }, 400);
  }

  // 2) Toko harus ada, tidak tutup; pemilik akun harus aktif.
  const { data: store } = await db
    .from("stores")
    .select("id,owner_id,is_closed")
    .eq("id", storeId)
    .maybeSingle();
  const st = store as { id: string; owner_id: string; is_closed: boolean | null } | null;
  if (!st) return json(res, { error: "Toko tidak ditemukan." }, 400);
  if (st.is_closed) return json(res, { error: "Toko sedang tutup. Coba lagi nanti." }, 400);
  const sellerId = st.owner_id; // dompet/pembayaran level AKUN
  // Kompatibilitas transisi: halaman lama kirim seller_id.
  if (body.seller_id && body.seller_id !== sellerId) {
    return json(res, { error: "Data toko tidak cocok." }, 400);
  }
  const { data: seller } = await db
    .from("profiles")
    .select("id,status")
    .eq("id", sellerId)
    .maybeSingle();
  const s = seller as { status: string } | null;
  if (!s || s.status !== "aktif") return json(res, { error: "Toko tidak aktif." }, 400);

  // 3) Tanpa ongkir: total = subtotal - diskon (pengiriman via chat).

  // 4) Promo server-side + kuota atomik. Promo ongkir sudah tidak berlaku.
  let discount = 0;
  let promoId: string | null = null;
  const code = String(body.promo_code ?? "").trim().slice(0, 40);
  if (code) {
    const { data: codes } = await db
      .from("discount_codes")
      .select("id,code,type,value,min_purchase,usage_limit,used_count,valid_until")
      .eq("store_id", storeId)
      .eq("is_active", true);
    const match = ((codes ?? []) as {
      id: string; code: string; type: string; value: number | string; min_purchase: number | string;
      usage_limit: number | null; used_count: number; valid_until?: string | null;
    }[]).find((d) => String(d.code).toLowerCase() === code.toLowerCase());
    if (match) {
      const today = new Date().toISOString().slice(0, 10);
      const expired = match.valid_until ? String(match.valid_until) < today : false;
      const over = match.usage_limit != null && match.used_count >= match.usage_limit;
      if (!expired && !over && subtotal >= Number(match.min_purchase)) {
        if (match.type === "persen") {
          const pct = Math.min(Math.max(Number(match.value), 0), 100);
          discount = Math.min(Math.round((subtotal * pct) / 100), subtotal);
        } else if (match.type === "nominal") {
          discount = Math.min(Math.max(Math.round(Number(match.value)), 0), subtotal);
        } else {
          // potongan_ongkir: ongkir sudah dihapus → kode tidak berlaku.
          return json(res, { error: "Promo ongkir sudah tidak berlaku." }, 400);
        }
        if (discount > 0) {
          // Klaim kuota ATOMIK dulu; gagal = habis dipakai orang lain.
          const { data: claimed } = await db.rpc("consume_promo", { p_id: match.id });
          if (!claimed) {
            return json(res, { error: "Kuota kode promo baru saja habis." }, 400);
          }
          // Catat promo di order supaya kuota bisa DIKEMBALIKAN saat batal.
          promoId = match.id;
        }
      }
    }
  }

  const channel = body.channel === "Transfer manual" ? "Transfer manual" : "QRIS";
  const total = subtotal - discount;
  // Tolak SEBELUM insert (jangan bikin order sampah).
  if (!Number.isFinite(total) || total < 1000) {
    return json(res, { error: "Minimal pembayaran Rp1.000 (aturan BuatQris)." }, 400);
  }

  // 5) Insert orders + items + payments.
  let orderId = newOrderId();
  let order: { id: string; access_token: string } | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await db
      .from("orders")
      .insert({
        id: orderId,
        seller_id: sellerId,
        store_id: storeId,
        buyer_id: buyerId,
        buyer_name: name,
        buyer_phone: phone,
        buyer_city: city,
        buyer_address: address,
        buyer_note: note,
        total,
        status: "menunggu",
        channel,
        promo_id: promoId,
        shipping_method: null,
        shipping_cost: 0,
        idempotency_key: idemKey,
      })
      .select("id,access_token")
      .single();
    if (!error && data) {
      order = data as { id: string; access_token: string };
      break;
    }
    // Kunci idempotensi dipakai ulang saat retry → kembalikan yang ada.
    if ((error as { code?: string })?.code === "23505" && idemKey) {
      const { data: prev } = await db.from("orders").select("id,access_token").eq("idempotency_key", idemKey).maybeSingle();
      if (prev) {
        order = prev as { id: string; access_token: string };
        break;
      }
    }
    orderId = newOrderId();
  }
  if (!order) return json(res, { error: "Gagal membuat pesanan." }, 500);
  const oid = order.id;
  const otoken = order.access_token;

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
    .insert({ order_id: oid, seller_id: sellerId, store_id: storeId, channel, amount: total, fee: 0, status: "menunggu" })
    .select("id")
    .single();

  const base = { order_id: oid, access_token: otoken };

  if (channel === "Transfer manual") {
    return json(res, { ...base, qr: null, qr_pending: false, channel });
  }

  // 6) BuatQris generate QRIS (hanya QRIS).
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
      signal: AbortSignal.timeout(15000),
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
        channel,
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
