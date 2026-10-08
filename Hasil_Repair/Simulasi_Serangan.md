# SIMULASI SERANGAN — TokoLink (project TEST saja!)

**DILARANG di production.** Buat project Supabase TEST gratis → jalankan
semua migrasi `database/` berurutan → buat 2 akun seller (A=penyerang,
B=korban) + 1 admin. Semua tes di bawah dijalankan sebagai **seller A**
(login biasa) lewat console browser (DevTools → Console) di halaman yang
sudah login:

```js
const { supabase } = await import("/src/lib/supabase.ts").catch(() => ({}));
```

(Atau pakai Supabase SQL Editor dengan `set role authenticated;` —
tapi console lebih mirip penyerang asli.)

Hasil yang benar = **GAGAL dengan error**. Kalau ada yang BERHASIL,
tulis ke saya: nomor tes + pesan yang muncul.

## Tes 1 — Naik jadi admin (BUG-001)
```js
await supabase.from("profiles").update({ role: "admin" }).eq("id", (await supabase.auth.getUser()).data.user.id);
```
Benar: error `ROLE_TIDAK_BOLEH_BERUBAH`. Cek juga `plan` dan `status`.

## Tes 2 — Cetak saldo (BUG-002)
```js
await supabase.from("ledger").insert({ seller_id: (await supabase.auth.getUser()).data.user.id, label: "test", amount: 100000000, type: "masuk" });
```
Benar: error (permission/RLS).

## Tes 3 — Tarik melebihi saldo (BUG-003)
```js
await supabase.rpc("request_withdrawal", { p_bank: "BCA", p_account_number: "1234567890", p_amount: 999999999 });
```
Benar: error `SALDO_TIDAK_CUKUP`. Lalu buat withdrawal kecil yang valid,
ambil id-nya, dan coba setujui sendiri:
```js
await supabase.from("withdrawals").update({ status: "selesai" }).eq("id", "<id-itu>");
```
Benar: error (permission/RLS).

## Tes 4 — Intip data seller lain (BUG-004)
```js
await supabase.from("profiles").select("*").limit(1);
await supabase.from("public_stores").select("*").limit(1);
```
Benar: query 1 error/kosong; query 2 hanya kolom publik (tanpa nomor WA).

## Tes 5 — Palsukan pembayaran (BUG-005)
Buat order via checkout normal, lalu sebagai seller:
```js
await supabase.from("payments").update({ status: "berhasil" }).eq("order_id", "<id-order>");
await supabase.from("orders").update({ total: 1 }).eq("id", "<id-order>");
```
Benar: keduanya error.

## Tes 6 — Order ke toko tutup
Tutup toko akun B, lalu dari browser (tanpa login) panggil:
```js
await fetch("/api/create-order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ seller_id: "<id-B>", buyer_name: "Tester", cart: [{ product_id: "<id-produk-B>", qty: 1 }] }) }).then(r => r.json());
```
Benar: error "Toko sedang tutup".

## Tes 7 — Klik ganda = 1 order (BUG-015)
Checkout dengan `idempotency_key` sama 2x cepat. Benar: respons ke-2
`deduped: true`, id order sama.

## Lapor ke saya
Untuk tiap tes: ✅ GAGAL SESUAI HARAPAN / ❌ LOLOS (tulis responsnya).
