# TASKS.md — TokoLink Backend Wiring

Kerjakan **berurutan dari atas, satu task per sesi**. Centang `[x]` HANYA
setelah semua "Done When" di task itu terpenuhi. Baca `.opencode/AGENTS.md`
Bagian 4 sebelum mulai — setiap task UI wajib penuhi Done When standar
(loading/empty/error state, optimistic toggle, responsif 375px & 1440px)
walau tidak ditulis ulang di tiap task.

## Fase 0 — Setup Project ✅ SELESAI
- [x] Buat project Supabase baru, catat `SUPABASE_URL` & `SUPABASE_ANON_KEY`
- [x] Jalankan `database/schema.sql` di SQL editor Supabase
- [x] Install `@supabase/supabase-js`, buat `src/lib/supabase.ts`
- [x] Setup `.env` + `.env.example`
- [x] RLS orders buyer non-login → KEPUTUSAN: Opsi A, kolom `access_token`

## Fase 1 — Auth ✅ SELESAI
- [x] `pages/Auth.tsx` (Login, Register, Forgot) ke Supabase Auth
- [x] Register → otomatis buat row `profiles` (role default `seller`)
- [x] Proteksi route `/app/*` dan `/admin/*`

## Fase 2 — Products ✅ SELESAI
- [x] `Products` (DashboardA) → query `products` where `seller_id = auth.uid()`
- [x] `ProductForm` → insert/update `products`
- [x] `StoreHome` & `ProductDetail` → query produk publik by `store_slug`

---

## Fase 3 — Orders & Checkout (BuatQris) ✅ SELESAI (test sandbox lolos 29 Sep 2026)

### 3.1 Checkout: hitung total + terapkan diskon
**Starting state:** `Cart`/`Checkout` masih pakai data mock, tidak baca
`discount_codes`.
**Target state:** total dihitung dari harga real produk di `products`;
kalau user isi kode diskon, validasi ke `discount_codes` (cek
`is_active`, `valid_until`, `min_purchase`, `used_count < usage_limit`).
**Done When:**
- Total di layar = harga produk asli, bukan mock
- Kode diskon salah/expired/sudah habis → pesan error jelas ("Kode tidak
  berlaku" / "Sudah mencapai batas pakai"), bukan silent fail
- Kode valid → potongan langsung kelihatan di ringkasan sebelum submit
- Field kode diskon: loading state saat validasi (jangan freeze UI)

### 3.2 Server function `create-order`
**KEPUTUSAN user: v1 = satu checkout satu toko (multi-toko ditolak dengan
pesan), hanya QRIS, kuota promo berkurang saat order dibuat.**
**Starting state:** belum ada serverless function apapun untuk order.
**Target state:** function baru yang menerima cart+diskon dari frontend,
insert `orders` (status `menunggu`) + `order_items` (snapshot nama &
harga saat itu — JANGAN referensi harga live produk, biar histori order
tidak berubah kalau seller ganti harga nanti), insert `payments` (status
`menunggu`), lalu panggil API BuatQris generate QRIS, simpan
`external_ref`.
**Done When:**
- Kalau insert `orders` sukses tapi API BuatQris gagal → order tetap
  tersimpan dengan status yang jelas menandakan "QR belum jadi", jangan
  biarkan order nyangkut tanpa status
- Response ke frontend: order id + data QR
- Tidak ada API key BuatQris yang terekspos ke response/frontend

### 3.3 Halaman `Qris`
**Target state:** tampilkan QR image dari response `create-order` (bukan
generate QR sendiri di client).
**Done When:** QR tampil, ada fallback text kalau gambar gagal load,
ada tombol "Sudah bayar / Cek status".

### 3.4 Server function `buatqris-webhook`
**Wajib baca `.opencode/skill/buatqris-webhook/SKILL.md` dulu sebelum
mulai task ini — ada aturan keamanan spesifik di situ.**
**Target state:** endpoint terima callback BuatQris, verifikasi HMAC
SHA256 pakai raw body, update `payments.status` + `orders.status`
(→ `dikemas` kalau sukses), insert `ledger` (type `masuk`, amount =
total - fee).
**Done When:**
- Signature tidak valid → tolak (401), tidak proses payload
- Idempotent: webhook yang sama terkirim 2x tidak bikin `ledger` dobel
  (cek dulu apakah `payments` untuk order itu sudah `berhasil`)
- Rate limit aktif di endpoint ini

### 3.5 `PaymentStatus` & `OrderSuccess`
**Target state:** halaman ini baca status order real-time/polling dari
`orders`, bukan asumsi otomatis sukses setelah redirect.
**Done When:** kalau status masih `menunggu` setelah beberapa saat, ada
pesan yang jelas (bukan loading selamanya), auto-update begitu webhook
mengubah status.

### 3.6 `OrderTracking` (buyer non-login)
**Target state:** buyer akses via link berisi `access_token`, query order
berdasarkan `id` + `access_token` cocok (bukan cuma `id` — lihat Memory
Block soal ini).
**Done When:** token salah/tidak ada → tampil "order tidak ditemukan",
bukan error teknis mentah. Data yang tampil ke buyer dibatasi (nama
disamarkan sesuai keputusan sebelumnya), tidak expose semua kolom order.

### 3.7 `Orders` & `OrderDetail` (DashboardA, sisi seller)
**Target state:** list & detail order milik seller (`seller_id = auth.uid()`),
termasuk update status (`dikemas` → `dikirim` → `selesai`).
**Done When:** perubahan status oleh seller memicu update yang konsisten
(kalau ada yang perlu update `ledger`/notifikasi, cek dulu ke user apakah
diperlukan di titik ini atau nanti).

---

## Fase 4 — Wallet & Withdrawal
- [ ] **Wallet**: sum `ledger` where `seller_id = auth.uid()`, tampilkan
      riwayat berurutan terbaru dulu. Done When: saldo yang tampil = sum
      akurat (uji dengan minimal 1 transaksi masuk + 1 keluar).
- [ ] **Withdraw**: insert `withdrawals`, status awal `menunggu`. Done
      When: validasi saldo cukup sebelum submit (jangan biarkan withdraw
      melebihi saldo tersedia).
- [ ] **(Admin) AdminWithdrawals**: update status, insert `ledger` (type
      `keluar`) saat status `selesai`. Done When: hanya `role='admin'`
      yang bisa akses & ubah status ini (RLS + cek di UI).

## Fase 5 — Bio, Tema, Diskon, Jam, QR
- [ ] **BioLinks**: CRUD `bio_links`, termasuk urutan (`sort_order`) bisa
      diatur. Done When: toggle aktif/nonaktif pakai optimistic update.
- [ ] **Discount**: CRUD `discount_codes`. Done When: cegah 2 kode aktif
      dengan nama sama per seller (constraint sudah ada di schema, tapi
      pesan error di UI harus jelas, bukan raw SQL error).
- [ ] **Hours**: CRUD `store_hours` (7 baris per seller), badge buka/tutup
      di `StoreHome`. Done When: badge dihitung dari waktu server/user
      device dibandingkan `open_time`/`close_time` — tentukan timezone
      (asumsi WIB kalau tidak ada info lain, **konfirmasi ke user**).
- [ ] **StoreQR**: generate QR image dari URL toko (client-side, library
      ringan, bukan dependency besar). Done When: bisa di-download sebagai
      gambar.
- [x] **StoreSettings & AccountSettings**: update `profiles` (sudah
      dikerjakan). **CATATAN BELUM SELESAI:** field kategori/bio/alamat/
      email di form masih lokal saja, TIDAK ada kolomnya di
      `database/schema.sql` → lihat Backlog di bawah, harus dibereskan
      sebelum fitur ini dianggap 100%.

## Fase 6 — Admin Master
- [ ] `AdminHome`, `AdminSellers`, `AdminAnalytics`: agregat dari
      `profiles`, `orders`, `payments`, akses `role='admin'` saja.
- [ ] `AdminPremium`: CRUD `premium_requests`, approve → update
      `profiles.plan`.
- [ ] `AdminPayments`: list `payments` semua seller.
- [ ] `AdminUsers`: list `profiles` + email dari `auth.users`.
- [ ] `AdminSystem`: **tanya user dulu** isinya apa sebelum implementasi.

## Fase 7 — Deploy
- [ ] Setup/verifikasi project Vercel + repo GitHub tersambung
- [ ] Environment variables di Vercel (anon key public, service role +
      BuatQris secret hanya di server functions)
- [ ] Smoke test end-to-end di production: register → tambah produk →
      checkout → bayar (sandbox) → seller lihat order → withdraw

---

## Backlog (di luar urutan fase, jangan dikerjakan sampai diminta eksplisit)
- [ ] **Kolom `profiles` yang belum ada tapi dipakai di StoreSettings**:
      kategori, bio, alamat, email tampilan publik. Butuh migrasi baru
      (`database/migrate_faseX.sql`) — **usulkan struktur kolomnya ke
      user dulu**, jangan langsung eksekusi.
- [ ] **Multi-toko dalam 1 akun** (1 user kelola beberapa store) —
      PENTING menurut user, tapi butuh redesain skema (`stores` terpisah
      dari `profiles`). Kerjakan sebagai proyek tersendiri setelah Fase
      0-7 stabil, bukan disisipkan.
- [ ] **Halaman "buat kata sandi baru"** untuk link reset password (saat
      ini mengarah ke `/`). Syarat sebelum Forgot Password dianggap penuh.
