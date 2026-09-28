// POST /api/create-order — Task 3.2 (implementasi penuh mengikuti
// dokumen resmi BuatQris: Problem_screenshot/konfigurasi-open-api.txt).
//
// Alur: terima cart + buyer + kode promo → validasi server-side → insert
// orders (menunggu) + order_items (snapshot) + payments (menunggu) →
// panggil BuatQris generate QRIS → simpan external_ref → return order id,
// access_token, dan data QR ke frontend.

import { adminDb, clientIp, json, newOrderId, rateLimit, verifyAuthOptional } from "./_lib";

type CartLine = { product_id: string; qty: number };

export async function POST(req: Request): Promise<Response> {
  if (!rateLimit(clientIp(req), 30)) return json({ error: "Terlalu banyak percobaan." }, 429);
  await verifyAuthOptional(req); // checkout tamu tetap boleh

  const body = (await req.json().catch(() => null)) as {
    seller_id?: string;
    buyer_name?: string;
    buyer_city?: string;
    channel?: string;
    cart?: CartLine[];
    promo_code?: string;
  } | null;
  if (!body?.seller_id || !body?.buyer_name || !Array.isArray(body?.cart) || body.cart.length === 0) {
    return json({ error: "Data pesanan tidak lengkap." }, 400);
  }

  const db = adminDb();

  // 1) Harga SELALU dari DB (jangan percaya total dari browser).
  const ids = body.cart.map((c) => c.product_id);
  const { data: products } = await db.from("products").select("*").in("id", ids).eq("seller_id", body.seller_id).eq("status", "aktif");
  const byId = new Map(((products ?? []) as Record<string, unknown>[]).map((p) => [(p as { id: string }).id, p]));
  let subtotal = 0;
  const lines: { product_id: string; name: string; qty: number; price: number }[] = [];
  for (const line of body.cart) {
    const p = byId.get(line.product_id) as { name: string; price: number | string } | undefined;
    if (!p || line.qty <= 0) continue;
    subtotal += Number(p.price) * line.qty;
    lines.push({ product_id: line.product_id, name: p.name, qty: line.qty, price: Number(p.price) });
  }
  if (lines.length === 0) return json({ error: "Produk tidak tersedia." }, 400);

  // 2) Validasi promo server-side (aturan sama seperti di useTotals).
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
      | { id: string; type: string; value: number | string; min_purchase: number | string; usage_limit: number | null; used_count: number }
      | undefined;
    if (match) {
      const today = new Date().toISOString().slice(0, 10);
      const expired = (match as { valid_until?: string | null }).valid_until
        ? String((match as { valid_until?: string }).valid_until) < today
        : false;
      const over = match.usage_limit != null && match.used_count >= match.usage_limit;
      if (!expired && !over && subtotal >= Number(match.min_purchase)) {
        if (match.type === "persen") discount = Math.round((subtotal * Number(match.value)) / 100);
        else if (match.type === "nominal") discount = Math.min(Math.round(Number(match.value)), subtotal);
        // potongan_ongkir ditangani saat hitung ongkir (disederhanakan: tanpa ongkir di v1).
        promoId = match.id;
        promoUsed = match.used_count;
      }
    }
  }

  const total = subtotal - discount;

  // 3) Insert orders + items + payments (status menunggu).
  //    access_token terisi otomatis (default gen_random_uuid di migrasi).
  let orderId = newOrderId();
  let order: { id: string; access_token: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await db
      .from("orders")
      .insert({
        id: orderId,
        seller_id: body.seller_id,
        buyer_name: body.buyer_name.trim(),
        buyer_city: body.buyer_city ?? null,
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
    orderId = newOrderId(); // collision ID acak → coba lagi
  }
  if (!order) return json({ error: "Gagal membuat pesanan." }, 500);

  await db.from("order_items").insert(
    lines.map((l) => ({
      order_id: (order as { id: string }).id,
      product_id: l.product_id,
      product_name_snapshot: l.name,
      qty: l.qty,
      price_snapshot: l.price,
    })),
  );
  const { data: payment } = await db
    .from("payments")
    .insert({
      order_id: (order as { id: string }).id,
      seller_id: body.seller_id,
      channel: "QRIS",
      amount: total,
      fee: 0,
      status: "menunggu",
    })
    .select("id")
    .single();

  // Kuota promo terpakai begitu order dibuat (QR kedaluwarsa tetap terhitung — perilaku v1).
  if (promoId) {
    await db.from("discount_codes").update({ used_count: promoUsed + 1 }).eq("id", promoId);
  }

  // 4) Panggil BuatQris (dokumen: konfigurasi-open-api.txt).
  //    Kalau gagal: order TETAP tersimpan (status menunggu) + frontend
  //    tampilkan "QR belum jadi" (Done When 3.2).
  const accountId = process.env.BUATQRIS_ACCOUNT_ID;
  const secretToken = process.env.BUATQRIS_SECRET_TOKEN;
  const testMode = process.env.BUATQRIS_TEST ?? "1"; // "1" = sandbox (tanpa uang asli)
  const base = { order_id: (order as { id: string }).id, access_token: (order as { access_token: string }).access_token };

  if (total < 1000) {
    return json({ ...base, qr_pending: true, error: "Minimal pembayaran Rp1.000 (aturan BuatQris)." }, 400);
  }
  if (!accountId || !secretToken) {
    return json({ ...base, qr_pending: true, error: "Kredensial BuatQris belum dipasang di server." });
  }

  const callbackUrl =
    process.env.BUATQRIS_CALLBACK_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/buatqris-webhook` : undefined);

  const params = new URLSearchParams({
    action: "api_create_qris",
    account_id: accountId,
    secret_token: secretToken,
    amount: String(Math.round(total)),
    description: `TokoLink ${(order as { id: string }).id}`.slice(0, 100),
    fee_by: "user",
    test: testMode,
    app_name: "TokoLink",
  });
  if (callbackUrl) params.set("callback_url", callbackUrl);

  let qr: {
    qr_url: string; qris_image: string; total_amount: number;
    expired_at: string | null; payment_url: string | null; is_test: boolean;
  } | null = null;
  try {
    const res = await fetch("https://api.buatqris.site", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const out = (await res.json()) as {
      success: boolean; message?: string;
      data?: {
        transaction_id: string; total_amount: number; admin_fee: number;
        qr_url: string; qris_image: string; expired_at: string | null;
        payment_url: string | null;
      };
    };
    if (out.success && out.data) {
      const d = out.data;
      const pid = (payment as { id: string } | null)?.id;
      if (pid) {
        await db.from("payments").update({ external_ref: d.transaction_id, fee: d.admin_fee, amount: d.total_amount }).eq("id", pid);
      }
      qr = {
        qr_url: d.qr_url, qris_image: d.qris_image, total_amount: d.total_amount,
        expired_at: d.expired_at, payment_url: d.payment_url, is_test: testMode === "1" || testMode === "true",
      };
    } else {
      return json({ ...base, qr_pending: true, error: out.message ?? "BuatQris menolak permintaan." });
    }
  } catch {
    return json({ ...base, qr_pending: true, error: "Tidak bisa menghubungi BuatQris." });
  }

  return json({ ...base, qr_pending: false, qr });
}
