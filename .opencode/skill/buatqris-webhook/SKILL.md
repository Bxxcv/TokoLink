---
name: buatqris-webhook
description: Cara wajib mengintegrasikan BuatQris (create order, generate QRIS, verifikasi webhook). Baca ini sebelum menyentuh Fase 3 di .opencode/TASKS.md (checkout/payment).
---

# Integrasi BuatQris — Wajib Diikuti

## Alur
1. Frontend (`Checkout` page) POST ke serverless function `create-order`
   (bukan langsung ke BuatQris dari browser — API key BuatQris tidak boleh
   ada di kode frontend).
2. `create-order` (server, punya akses `SUPABASE_SERVICE_ROLE_KEY` +
   `BUATQRIS_API_KEY`):
   - insert `orders` + `order_items` (status `menunggu`)
   - insert `payments` (status `menunggu`)
   - panggil API BuatQris untuk generate QRIS, simpan `external_ref`
   - return data QR ke frontend
3. Frontend (`Qris` page) tampilkan QR dari response tsb (jangan generate QR
   sendiri di client — pakai yang dikirim BuatQris).
4. BuatQris kirim webhook ke endpoint server `buatqris-webhook` saat status
   berubah.

## Verifikasi Webhook (wajib, tidak boleh dilewati)
```js
// pseudocode — sesuaikan nama header/field dgn dokumentasi BuatQris asli
const signature = req.headers['x-buatqris-signature'];
const expected = crypto
  .createHmac('sha256', process.env.BUATQRIS_WEBHOOK_SECRET)
  .update(rawBody) // HARUS raw body, bukan hasil JSON.parse ulang
  .digest('hex');

if (!timingSafeEqual(signature, expected)) {
  return res.status(401).end(); // tolak, jangan proses payload
}
```
- Rate limit endpoint ini.
- Setelah signature valid dan status `berhasil`: update `payments.status`,
  update `orders.status` → `dikemas`, insert row `ledger` (type `masuk`,
  amount = total - fee).
- Kalau ada field/header yang belum jelas namanya, **cek dokumentasi resmi
  BuatQris dulu** — jangan asal tebak nama field, ini bagian paling gampang
  jadi celah keamanan kalau salah tebak.

## Yang Tidak Boleh
- API key/secret BuatQris di `.env` frontend (`VITE_*`) — HARUS di server env
  saja.
- Percaya status pembayaran dari response redirect URL di browser saja
  tanpa webhook — redirect bisa dipalsukan, webhook (server-to-server) yang
  jadi sumber kebenaran status.
