# TASKS.md — TokoLink Backend Wiring

Kerjakan **berurutan dari atas**. Centang `[x]` setelah selesai + tested.
Jangan mulai task berikutnya sebelum task sebelumnya dicentang.
Lihat `database/schema.sql` untuk nama tabel/kolom yang benar dan `.opencode/AGENTS.md` untuk aturan.

## Fase 0 — Setup Project
- [x] Buat project Supabase baru, catat `SUPABASE_URL` & `SUPABASE_ANON_KEY`
- [x] Jalankan `database/schema.sql` di SQL editor Supabase
- [x] Install `@supabase/supabase-js`, buat `src/lib/supabase.ts` (client, pakai anon key
      saja di frontend — service role TIDAK BOLEH ada di file ini)
- [x] Setup `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) + `.env.example`
- [x] Konfirmasi ke user: RLS policy tambahan untuk `orders` (buyer non-login lihat
      status order) sebelum lanjut ke Fase 3 → KEPUTUSAN: opsi A (link token per order,
      verifikasi server-side, tracking hanya tampilkan status + nama tersamar + rate limit).
      User SETUJU tambah kolom `access_token` di `orders` (eksekusi SQL-nya di Fase 3).

## Fase 1 — Auth
- [x] Sambungkan `pages/Auth.tsx` (Login, Register, Forgot) ke Supabase Auth
- [x] Saat register, otomatis buat row di `profiles` (role default `seller`)
- [x] Proteksi route `/app/*` dan `/admin/*` di router — redirect ke `/login`
      kalau belum auth (dan cek `role` untuk `/admin/*`)

## Fase 2 — Products
- [x] Ganti `PRODUCTS` mock di `Products` (DashboardA) jadi query `products`
      where `seller_id = auth.uid()`
- [x] `ProductForm` → insert/update ke tabel `products`
- [x] `StoreHome` & `ProductDetail` (Storefront) → query produk publik
      (`status = 'aktif'`) berdasarkan `store_slug` di `profiles`

## Fase 3 — Orders & Checkout (BuatQris)
- [ ] `Cart` → `Checkout`: hitung total dari `products` asli (bukan mock), terapkan
      `discount_codes` kalau ada
- [ ] Serverless function `create-order`: insert ke `orders` + `order_items`, lalu
      panggil API BuatQris untuk generate QRIS
- [ ] Halaman `Qris`: tampilkan QR dari response BuatQris
- [ ] Serverless function `buatqris-webhook`: verifikasi HMAC SHA256, update
      `payments.status` + `orders.status`, insert row `ledger` (type `masuk`) kalau
      sukses
- [ ] `PaymentStatus` & `OrderSuccess`: polling/realtime status dari `orders`
- [ ] `OrderTracking`: query by `orders.id`
- [ ] `Orders` & `OrderDetail` (DashboardA): list & detail order milik seller
      (`seller_id = auth.uid()`)

## Fase 4 — Wallet & Withdrawal
- [ ] `Wallet`: sum `ledger` where `seller_id = auth.uid()`, tampilkan riwayat
- [ ] `Withdraw`: insert ke `withdrawals`, status awal `menunggu`
- [ ] (Admin) `AdminWithdrawals`: update status withdrawal, insert row `ledger`
      (type `keluar`) saat status jadi `selesai`

## Fase 5 — Bio, Tema, Diskon, Jam, QR
- [ ] `BioLinks`: CRUD ke tabel `bio_links`
- [ ] `Discount`: CRUD ke tabel `discount_codes`
- [ ] `Hours`: CRUD ke tabel `store_hours` (7 baris per seller), tampilkan badge
      buka/tutup di `StoreHome` berdasarkan waktu sekarang
- [ ] `StoreQR`: generate QR image dari URL `tokolink.id/s/{store_slug}` (client-side,
      tidak perlu backend baru)
- [x] `StoreSettings` & `AccountSettings`: update `profiles` (dikerjakan duluan
      atas permintaan user; field tanpa kolom — kategori/bio/alamat/email — tetap lokal)

## Fase 6 — Admin Master
- [ ] `AdminHome`, `AdminSellers`, `AdminAnalytics`: query agregat dari `profiles`,
      `orders`, `payments` (hanya bisa diakses `role = 'admin'`)
- [ ] `AdminPremium`: CRUD `premium_requests`, approve → update `profiles.plan`
- [ ] `AdminPayments`: list `payments` semua seller
- [ ] `AdminUsers`: list semua `profiles` (gabung dengan `auth.users` untuk email)
- [ ] `AdminSystem`: **tanya user dulu** apa isinya sebelum implementasi (belum
      jelas dari mock data)

## Fase 7 — Deploy
- [ ] Setup project Vercel, hubungkan repo GitHub
- [ ] Set environment variables di Vercel (anon key public, service role +
      BuatQris secret hanya di server functions)
- [ ] Smoke test end-to-end di production sebelum diumumkan ke user asli

## Backlog (di luar fase — dicatat atas permintaan user, belum dikerjakan)
- [ ] **Multi-toko dalam 1 akun** (1 user kelola beberapa store) — PENTING menurut user.
      Butuh ganti skema + UI switcher. Kerjakan setelah MVP stabil, JANGAN di tengah fase.
- [ ] Halaman "buat kata sandi baru" untuk menampung link reset password (link reset
      sementara mengarah ke `/`). Syarat sebelum fitur Forgot dianggap penuh.
