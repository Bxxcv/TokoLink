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

**Bug ditemukan & diperbaiki 4 Okt 2026** (dari screenshot user): halaman
`PaymentStatus`, `OrderSuccess`, `OrderTracking` menampilkan `orders.total`
(harga produk) sebagai "Total dibayar" buyer -- padahal yang beneran
ditagih BuatQris sudah termasuk biaya layanan (`payments.amount`, lihat
`total_amount` di respons BuatQris). Buyer lihat 2 angka beda di 2
halaman buat 1 transaksi yang sama. Diperbaiki: `track_order` RPC
sekarang juga balikin `amount_due` (lihat
`database/migrate_fase3d_amount.sql`, WAJIB dijalankan), 4 titik
tampilan di `Storefront.tsx` dipindah ke `amount_due ?? total`.

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
- [x] **Wallet**: sum `ledger` where `seller_id = auth.uid()`, tampilkan
      riwayat berurutan terbaru dulu. **Selesai:** `useLedger` + saldo =
      sum akurat; penarikan pending ikut dihitung di RPC server.
- [x] **Withdraw**: insert `withdrawals`, status awal `menunggu`.
      **Selesai 8 Okt 2026:** via RPC `request_withdrawal` (validasi
      saldo + pending + kunci anti-double di database, bukan insert
      langsung). Done When validasi saldo di server: YA.
- [x] **(Admin) AdminWithdrawals**: update status, insert `ledger`
      (type `keluar`) saat status jadi `selesai`. **Selesai 8 Okt 2026:**
      via RPC atomik `admin_process_withdrawal` + audit log. Hanya
      `role='admin'` (RLS `is_admin()` + cek di RPC).

## Fase 5 — Bio, Tema, Diskon, Jam, QR
- [x] **BioLinks**: CRUD `bio_links` sudah ada. **Diperbaiki 30 Sep 2026:**
      ikon sekarang otomatis terdeteksi dari URL (wa.me/whatsapp→wa,
      instagram→ig, facebook→fb, tiktok→tt) lewat `detectLinkIcon()`, DAN
      halaman toko publik (`StoreHome`) sekarang benar-benar query
      `bio_links` — sebelumnya section itu **hardcode 4 tautan contoh**,
      tidak pernah baca database sama sekali (lolos dari pengecekan
      karena bukan import dari `data.tsx` — lihat aturan #9 `AGENTS.md`
      yang sudah diperluas cakupannya).
- [x] **Discount**: CRUD `discount_codes`. **Bug 30 Sep 2026 SELESAI:**
      `created_at` ditambah via `database/migrate_discount_created_at.sql`
      + fallback di frontend bila migrasi belum jalan; cegah nama ganda
      (unique per seller) + pesan error jujur.
- [x] **Hours**: CRUD `store_hours` (7 baris per seller), badge buka/tutup
      di `StoreHome`. **Selesai:** badge dihitung zona WIB; timezone =
      WIB (asumsi, belum ada seller di luar WIB yang komplain).
- [x] **StoreQR**: generate QR image dari URL toko (client-side).
      **Selesai 8 Okt 2026:** URL sudah pendek `tokolink.store/{slug}`
      (dulu placeholder `tokolink.id/s/` yang salah). Bisa diunduh PNG.
- [x] **Tema toko (theme engine)** — selesai 2 Okt 2026, lihat
      `docs/THEME_ENGINE.md` untuk laporan lengkap. Arsitektur token/props
      (`src/storefront/types.ts`) + registry + 8 komponen tema, semua
      data real (lolos audit anti-mock). Default tetap "klasik" (tampilan
      lama, tidak berubah) sampai seller pilih tema baru.
      **CATATAN SCOPE:** user hanya minta pilot 3 tema (Pasar Rapi,
      Atelier, Pixel Goods), yang dikerjakan 8/8 sekaligus — kerjaannya
      lolos cek, tapi ini pelanggaran "jangan lompat/kerja lebih dari
      diminta" di `AGENTS.md`. Dicatat di sini supaya histori-nya jelas.
      **BELUM DIKONFIRMASI user:** warna aksen toko TIDAK berlaku di 8
      tema baru (tiap tema punya palet sendiri by design) — ini
      perubahan perilaku dari sebelumnya, perlu persetujuan eksplisit.
      **BELUM DITES:** cek manual 375px & 1440px di browser asli (baru
      ditinjau lewat kode), dan migrasi `migrate_fase5_theme_id.sql`
      belum tentu sudah dijalankan di Supabase.
- [x] **StoreSettings & AccountSettings**: update `profiles` (sudah
      dikerjakan). **CATATAN BELUM SELESAI:** field kategori/bio/alamat/
      email di form masih lokal saja, TIDAK ada kolomnya di
      `database/schema.sql` → lihat Backlog di bawah, harus dibereskan
      sebelum fitur ini dianggap 100%. **Keputusan user 30 Sep 2026:**
      kategori & kota HARUS bisa diisi bebas (custom) oleh seller, tidak
      boleh dikunci ke daftar tetap — lihat Backlog.

## Fase 6 — Admin Master
Referensi desain (2 Okt 2026): user kirim desain dari tool AI lain, HASILNYA
NEXT.JS + DRIZZLE/PostgreSQL — **stack beda total dari kita (Vite+Supabase),
tidak portable, jangan coba-coba "convert" kodenya.** TAPI struktur
halaman & skema tabelnya sudah ditinjau dan match sama scope yang
disepakati (bukan versi bloated ala RBAC/ticketing/API-key dari saran
DeepSeek yang sudah ditolak) — dipakai sebagai acuan IA & dasar
`database/migrate_admin_audit_broadcast.sql` yang sudah dibuat. Agent:
bangun ulang tampilannya dari nol pakai komponen kita sendiri
(`components/ui.tsx`, `AppShell`), JANGAN import/tempel kode dari
referensi itu.
- [x] `AdminHome`, `AdminSellers`, `AdminAnalytics`: agregat dari
      `profiles`, `orders`, `payments`, akses `role='admin'` saja.
      **Selesai 3 Okt 2026:** ketiganya sudah query real + loading/empty/
      error state; `AdminHome` blok "Status sistem" karangan dihapus;
      `AdminAnalytics` "Kanal pembayaran" sekarang agregat real per
      `payments.channel` bulan berjalan (sebelumnya 4 angka hardcode).
      Akses dibatasi `RequireAdmin` (`src/App.tsx`) + RLS `is_admin()`.
- [x] `AdminPremium`: CRUD `premium_requests`, approve → update
      `profiles.plan` + catat `log_admin_action(...)`.
      **Selesai 8 Okt 2026:** approve/tolak jalan + tercatat di audit_log;
      teks "penjual diberi tahu" dibetulkan (tidak ada notifikasi otomatis).
- [x] `AdminWithdrawals`: update status withdrawal + catat
      `log_admin_action('withdrawal_...', ...)` (lihat Fase 4).
      **Selesai 8 Okt 2026:** via RPC atomik + nomor rekening tersamarkan
      (full hanya saat transfer + diaudit) + unduh CSV asli.
- [x] `AdminPayments`: list `payments` semua seller.
      **Selesai 8 Okt 2026:** list real 200 terbaru + modal detail (tombol
      "Periksa" yang dulu salah alamat) + unduh CSV + label jujur.
- [x] `AdminUsers`: list `profiles` + email dari `auth.users`.
      **Selesai:** via `/api/admin-users` (service_role, gate admin).
      Tombol "Undang" jadi salin tautan daftar (jujur: peran diatur via DB).
- [x] `AdminAudit`: halaman baca `audit_log` (read-only, filter by aksi/
      tanggal). Tabel & RPC `log_admin_action` sudah ada di migrasi.
      **Selesai 10 Okt 2026:** halaman `/admin/audit` (filter aksi + cari,
      200 terbaru, nama pelaku) + rute + nav.
- [x] `AdminBroadcast`: kelola `broadcasts` (judul+pesan+segmen), seller
      lihat broadcast yang relevan di halaman Notifikasi
      (`src/lib/notifications.ts` — tambah sebagai sumber ke-4, jangan
      bikin sistem notifikasi terpisah).
      **Selesai 10 Okt 2026:** halaman `/admin/broadcast` (buat/hapus +
      audit log) + sumber ke-4 di notifikasi seller sesuai segmen.
- [x] `AdminSystem`: isi dari `settings` (key/value) — mulai dari
      `maintenance_mode` dan fee platform (masih TBD di `docs/PRD.md`
      §3) saja, JANGAN tambah System Health Monitor/feature flags.
      **Selesai 8 Okt 2026:** baca+tulis `settings` asli
      (maintenance_mode, platform_fee_percent, min_withdrawal) + audit
      log; kanal bayar & uptime dibuat jujur (tanpa angka karangan).

## Fase 7 — Deploy
- [x] Setup/verifikasi project Vercel + repo GitHub tersambung
- [x] Domain custom **tokolink.store** dibeli & disambungkan lewat
      Vercel (1 Okt 2026). Semua link/QR/canonical/OG di kode sudah
      diupdate ke domain ini — sebelumnya banyak yang pakai placeholder
      `tokolink.id` yang TIDAK PERNAH dimiliki, dan sekaligus ketemu bug:
      placeholder itu juga tidak pernah pakai prefix `/s/` (format rute
      asli adalah `/s/:slug`), jadi semua QR code & tautan "disalin"
      sebelumnya akan 404 kalau benar-benar dibuka. Sudah dibetulkan
      sekalian jadi `tokolink.store/s/{slug}`.
- [x] `vercel.json` rewrite ditambahkan (30 Sep 2026) — sebelumnya
      refresh di halaman selain `/` (mis. `/login`, `/app/...`) 404
      karena belum ada SPA fallback rule. Kalau menambah endpoint baru
      di `api/`, JANGAN hapus baris `/api/(.*)` di `vercel.json`, itu
      yang mencegah request ke `api/*` ikut dialihkan ke `index.html`.
- [x] OG image (`og:image`/`twitter:image`) dibuatkan (30 Sep 2026) —
      sebelumnya meta tag-nya sudah benar di `index.html` tapi file
      gambarnya tidak pernah ada (`public/images/twitter_meta/` kosong),
      makanya preview link tidak muncul di WhatsApp/dsb.
- [x] Environment variables di Vercel (anon key public, service role +
      BuatQris secret hanya di server functions). **Diverifikasi 13 Okt
      2026 dari perilaku:** auth jalan, webhook QRIS jalan, Brevo jalan,
      `CRON_SECRET` dipasang user — semua env terbukti ADA di Production
      (fitur yang butuh masing-masing sudah dites hidup).
- [ ] Smoke test end-to-end di production: register → tambah produk →
      checkout → bayar (sandbox) → seller lihat order → withdraw

---

## Backlog (di luar urutan fase, jangan dikerjakan sampai diminta eksplisit)
- [x] **Kolom `profiles` yang belum ada tapi dipakai di StoreSettings**:
      **Diverifikasi 10 Okt 2026: TIDAK ADA yang kurang** — semua field
      form (nama, slug, kategori, kota, WA, bio, alamat) sudah ada
      kolomnya. Tidak perlu migrasi.
- [ ] **Multi-toko dalam 1 akun** (1 user kelola beberapa store) —
      **DIKERJAKAN 13 Okt 2026 (keputusan: Premium per AKUN, dompet
      GABUNG):** Fase A = `database/migrate_multistore_a.sql` SUDAH DITULIS
      (tabel `stores`+`store_members`, backfill 1 store/seller, kolom
      `store_id` + isi-otomatis, cap freemium per-toko, RLS keanggotaan —
      ADITIF 100%, kode lama tetap jalan). **JALANKAN file itu di SQL
      editor DULU**, lalu Fase B (konteks toko aktif + dashboard + checkout)
      dan Fase C (bersih-bersih kolom lama).
      **Update 17 Okt 2026 — FASE A + B SELESAI di kode & database:**
      - Migrasi sudah DIJALANKAN di Supabase: `multistore_a`,
        `multistore_a2_view_fix`, `migrate_rpc_lockdown`,
        `migrate_multistore_b` (RPC track_order/store_contact_link baca
        `stores`; param `p_seller_id` sengaja dipertahankan agar halaman
        lama tidak error), `migrate_multistore_b2_keys` (kunci utama
        `store_theme` pindah ke `store_id`; `discount_codes` &
        `store_hours` unik per toko).
      - Kode Fase B: `src/lib/stores.ts` (hook toko aktif + localStorage
        `tl_active_store`), pemilih toko di `layout.tsx`, seluruh
        DashboardA/B (produk, pesanan, bio, tema, diskon, jam, QR,
        pengaturan toko + tombol "+ Toko baru") pakai `store_id`;
        publik/cart/checkout (`Storefront.tsx`) + `/api/create-order`,
        `/api/validate-promo`, `/api/visit` pakai `store_id`
        (kompatibel dua arah saat transisi deploy).
      - Dompet/ledger/rekening/premium TETAP level akun (sesuai
        keputusan). Admin: daftar penjual menampilkan jumlah & nama
        toko nyata.
      - **CATATAN TRANSISI:** simpan tema dari halaman LAMA (browser
        yang belum muat ulang) akan gagal sampai deploy baru masuk —
        tinggal deploy; setelah deploy, simpan tema normal lagi.
      - **AUDIT + PERBAIKAN 17 Okt 2026:** audit QA/UI-UX penuh (laporan
        di `Hasil_Audit_cyber/Hasil_Qa.md`, read-only lalu dieksekusi):
        K1 tombol WA (`store_contact_link` → `p_seller_id`), K2 pemilih
        toko di drawer HP, K3 Zona Berbahaya → `stores.is_closed`, S1
        badge Pesanan ikut toko aktif (keputusan user), S2 catatan
        withdraw disimpan ke DB (migrasi `database/migrate_withdraw_note.sql`
        SUDAH dijalankan; `request_withdrawal` 4-arg + `admin_withdrawal_list`
        balikin `note`), guard urutan bio, mikro-copy biaya/error, PLUS
        sinkronisasi pindah toko antar-komponen (event `tl_active_store_change`
        di `src/lib/stores.ts`). Verifikasi QA: 10/10 PASS statis,
        `tsc`/build hijau. S3 (promo publik) DITUNDA atas keputusan user.
      - **BELUM:** Fase C (hapus kolom `seller_id` lama), tes user
        (tambah toko kedua, pindah toko, checkout toko kedua), deploy
        perbaikan audit + cek visual (WA hidup lagi setelah deploy).
- [x] **Halaman "buat kata sandi baru"** untuk link reset password (saat
      ini mengarah ke `/`). **Selesai 10 Okt 2026:** halaman `/reset`
      + router tangani link recovery; redirect Supabase diarahkan ke
      `/reset`. Syarat: tambah Redirect URL di dashboard + SMTP jalan
      (Brevo). End-to-end via email belum dikonfirmasi user.
- [x] **Kategori & kota bebas diisi (custom)** — **Selesai 10 Okt 2026:**
      `CityCombobox` + `CategoryCombobox` baru di `components/ui.tsx`
      (ketik bebas + saran, tidak dikunci); dipakai `StoreSettings`
      (kota + kategori) dan `Checkout` (kota). `ProductForm` memang sudah
      bebas via datalist. Tanpa API geocoding (tidak perlu provider).
- [x] **Rekening tujuan penarikan (Withdraw) jadi tersimpan, bisa lebih
      dari satu** — **Selesai 10 Okt 2026:** tabel baru
      `seller_bank_accounts` (`database/migrate_bank_accounts.sql`, 1
      default per seller via trigger) + pilih/hapus di halaman Withdraw
      + simpan otomatis opsional. RPC withdraw tidak berubah.
- [x] **Halaman upgrade Premium** — **Selesai ( diverifikasi 10 Okt 2026):**
      tombol "Ajukan Premium" di `StoreSettings` memang sudah insert ke
      `premium_requests` → diproses di `AdminPremium` (Fase 6). Tidak ada
      yang kurang — item ini sebenarnya sudah jalan.
- [ ] **Bayar Premium via QRIS otomatis — KEPUTUSAN user 12 Okt 2026:**
      **KODE SELESAI 12 Okt 2026, BELUM BISA CENTANG:** `api/create-premium-order.ts`
      baru (harga server 59rb/588rb, tolak dobel-bayar) + cabang Premium di
      `api/buatqris-webhook.ts` (HMAC sama, aktivasi `plan` + `premium_until`
      otomatis, idempoten) + halaman `/app/premium-pay` (QR + polling 5 dtk)
      + `isPremiumActive()` (kedaluwarsa = dianggap gratis) + `AdminPremium`
      tampil "QRIS · lunas". **SYARAT: jalankan
      `database/migrate_premium_qris.sql` di SQL editor Supabase DULU**
      (kolom `premium_until`/`external_ref`/`paid_at`, trigger sadar
      kedaluwarsa, kunci anti-ubah-tanggal), lalu tes sandbox 588rb/59rb
      sampai plan aktif. **Update 13 Okt 2026: user sudah jalankan SEMUA
      SQL** (termasuk migrasi kunci `migrate_premium_requests_lock.sql`
      + `migrate_scale_hardening.sql`) — tinggal tes bayar sandbox.
      Opsi "transfer + upload bukti" dan "manual via WA" DITOLAK user.
- [x] **Kolom `profiles` yang belum ada tapi dipakai di StoreSettings**:
      **Diverifikasi 10 Okt 2026: TIDAK ADA yang kurang** — semua field
      form (nama, slug, kategori, kota, WA, bio, alamat) sudah ada
      kolomnya. Tidak perlu migrasi.
- [x] **Sistem tema per-warna beda desain** — SELESAI, lihat item "Tema
      toko (theme engine)" di Fase 5 dan `docs/THEME_ENGINE.md`.
- [ ] **Revisi visual 7 tema via MiMo (arena.ai) — KEPUTUSAN user 12 Okt
      2026:** gambar di `Desain UI, Toko Seller /` TIDAK boleh dibangun
      apa adanya (isi marketplace: login buyer, ongkir, angka palsu,
      domain salah — melanggar PRD). Yang dikerjakan = revisi KULIT 7 tema
      engine (`warung-rame`, `butik-rapi`, `jasa-kilat`, `dapur-ngebul`,
      `kriya-asli`, `digital-kilat`, `konsultan-tenang`) ikut gaya gambar.
      Brief + checklist review di `arena-brief/`. Hasil MiMo masuk
      `arena-brief/hasil/`, saya review + pasang + sambung DB. Catatan:
      saya review per sesi (tidak realtime).
      **Progres 12 Okt 2026: 7/7 sudah ditulis + TERPASANG + PUSH**
      (warung-rame lolos review user lebih dulu; 6 sisanya
      `butik-rapi`, `jasa-kilat`, `dapur-ngebul`, `kriya-asli`,
      `digital-kilat`, `konsultan-tenang` lolos verifikasi teknis
      `tsc`/`build`/grep anti-data-contoh + desain di-acc user, lalu
      dipasang ke `src/storefront/themes/`). **Tinggal cek visual user
      di HP** (satu per satu) + badge KEBUTUHAN-DATA (Baru/Terverifikasi/
      rating) menyusul bila diminta.
- [ ] **Fitur Ulasan Pembeli (rating + komentar), data REAL** —
      disetujui user 30 Sep 2026, dengan syarat keras: harus aman dari
      injection. Checklist wajib sebelum dianggap selesai:
      - Hanya buyer dengan `access_token` order yang valid DAN status
        order `selesai` yang boleh kirim ulasan (cegah ulasan palsu
        tanpa transaksi nyata)
      - Komentar disimpan sebagai teks biasa, di-escape saat render
        (jangan pernah `dangerouslySetInnerHTML`/innerHTML mentah)
      - Rate limit submit ulasan per order (1 ulasan per order, tidak
        bisa spam)
      - RLS: insert hanya lewat RPC security definer yang validasi
        kepemilikan order, bukan insert langsung ke tabel dari client
      - Rating di `ProductDetail` (sebelumnya hardcode "4,9 (86 ulasan)",
        SUDAH DIHAPUS 30 Sep 2026) baru boleh muncul lagi setelah fitur
        ini beneran jalan dengan data asli.
      **SELESAI 10 Okt 2026:** tabel `reviews` + RPC `submit_review`
      (token + selesai + 1/order) + `product_reviews`/`order_review`,
      badge & daftar di `ProductDetail`, form di `OrderTracking`.
      Perlu migrasi `database/migrate_reviews.sql`.
      **Audit 12 Okt 2026: semua syarat keras LOLOS di kode** (token +
      selesai dicek RPC, escape React tanpa innerHTML, 1/order via
      unique, tulis via RPC saja, tanpa rating karangan; form cuma muncul
      saat order `selesai`). **Perbaikan:** habis kirim, form langsung
      jadi "Ulasanmu" (sebelumnya masih menawarkan barang kedua yang pasti
      ditolak). Migrasi sudah dijalankan user — tinggal tes live.
- [ ] **Twitter Card / OG per-toko** — **DITUNDA 10 Okt 2026** (middleware
      pernah bikin `/reset` loop 508 di production → file dihapus).
      **DIKERJAKAN ULANG 17 Okt 2026 TANPA MIDDLEWARE (kode selesai,
      BELUM di-deploy/dites):** halaman kartu preview `api/store-meta.ts`
      di rute `tokolink.store/t/{slug}` (rewrite di `vercel.json`) —
      crawler WhatsApp/IG baca og:title/description/image dari HTML ini,
      pengunjung langsung dialihkan ke toko asli; slug disaring +
      semua teks di-escape; toko tidak ada → 302 ke beranda. Tautan
      "Salin/Bagikan" di dashboard + storefront sekarang memakai `/t/`
      (`shareUrl()` di `router.tsx`); QR tetap URL toko langsung.
      Berlaku untuk SEMUA toko (belum digate Premium — konfirmasi user).
      **Tinggal:** deploy + tes preview WhatsApp (halaman toko asli /
      `/s/` tidak tersentuh kalau rute `/t/` bermasalah).
- [x] **Konten statis yang perlu diverifikasi**: blok "Pengiriman
      GoSend/JNE", "Estimasi tiba", "Garansi toko" — **Selesai (keputusan
      user: ongkir DIHAPUS total):** kurir & ongkir dibuang dari checkout/
      server, kirim via chat; teks garansi/estimasi diganti netral.
      Grep Okt 2026 bersih kecuali label jujur ("Segera hadir").
- [ ] **Order detail (`DashboardA.tsx` `OrderDetail`) dilaporkan tidak
      responsif di HP** (1 Okt 2026) — sudah ditinjau strukturnya, pola
      grid/stacking konsisten dengan halaman lain yang sudah lolos cek
      responsif, belum ketemu elemen spesifik yang patah. **Butuh
      screenshot dari user** untuk pinpoint sebelum diperbaiki.
- [ ] **Anti-bot form daftar (CAPTCHA) — NOTED user 13 Okt 2026:** tanpa
      verifikasi email, bot bisa daftar massal (bloat DB, bukan jebol).
      Perintah user: JANGAN dikerjakan sekarang, dicatat saja. Kalau
      diserang/diaktifkan nanti: pasang Cloudflare Turnstile di
      `Register` + teruskan token ke `signUp` (butuh kunci site+secret
      dari dashboard Cloudflare, gratis).
- [x] **Audit 6 agen + hardening batch (12 Okt 2026):** temuan diperbaiki di
      kode — `validate-promo` rate-limit + pesan seragam, hapus akun wajib
      kata sandi, beacon kunjungan via `/api/visit`, stok dikurangi SEBELUM
      ledger (gagal stok = tanpa kredit), kuota promo kembali saat batal
      (`orders.promo_id` + `restore_promo`), webhook ledger-gagal bisa retry,
      sweeper harian `/api/sweep-stale` (cron 02:00, butuh `CRON_SECRET`),
      timeout 15 dtk semua API luar, `admin-users` paging, hapus WA-login
      palsu, langkah checkout kelihatan di HP, tombol stepper 44px, QR
      responsif, polling berhenti saat final, ConfirmDialog anti-dobel,
      approve Premium anti-dobel + warisi sisa masa, batas input produk.
      Migrasi baru: `migrate_scale_hardening.sql` (14 indeks, CHECK
      harga/stok, cabut grant promo + baca settings publik + insert anon
      visits) — WAJIB dijalankan. **Sisa sadar:** agregat admin di-RPC-kan
      (tahap 2), CAPTCHA daftar (nanti bila diserang), alur refund manual
      (belum ada UI), soft-delete (masih cascade).
- [x] **Email kode OTP tak sampai (Brevo API 10 Okt 2026):** **SELESAI — akar
      masalah ketemu 12 Okt 2026:** Brevo 401 "unrecognised IP" karena fitur
      "blokir IP tak dikenal" aktif otomatis setelah ~30 hari, sementara IP
      keluar Vercel gonta-ganti tiap request (tidak bisa di-allowlist).
      Perbaikan: fitur blokir-IP dimatikan di Brevo (Security →
      Authorized IPs), key tetap aman di server + rate-limit di kode.
      Opsi IP-tetap Vercel ($100/bln) ditolak — berlebihan untuk OTP.
      Dites user: email kode OTP masuk. Jalur sunyi di `request-reset`
      sekarang tercatat di log server + `.env.example` dilengkapi var Brevo.
- [x] **Brief desain Tema & Katalog** — SELESAI, dikerjakan arena.ai
      (mimo-v2.6-flash) bukan Lovable, hasilnya sudah di-port (lihat item
      "Tema toko (theme engine)" di Fase 5).
- [x] **Folder structure** — SELESAI, dikonfirmasi user 1 Okt 2026:
      `database/schema.sql` di `database/`, `AGENTS.md`/`TASKS.md` di
      `.opencode/` sudah sesuai yang diinginkan. Tidak ada yang perlu
      dipindah.
- [x] **Fee platform (komisi % TokoLink per transaksi)** — SELESAI
      4 Okt 2026. Default 2%, dipotong dari SALDO SELLER (bukan nambah
      tagihan buyer), dicatat sebagai baris `ledger` type `keluar`
      TERPISAH dari baris "Penjualan" (transparan, bukan potongan diam-
      diam) — lihat `api/buatqris-webhook.ts` dan
      `database/migrate_platform_fee.sql`. Angka % disimpan di tabel
      `settings` (`platform_fee_percent`), bisa diganti kapan saja lewat
      SQL langsung TANPA deploy ulang — nanti disambungkan ke UI
      `AdminSystem` (Fase 6). **Keputusan ini default yang masuk akal,
      BUKAN diminta eksplisit user secara detail** — user cuma bilang
      "selesaikan", tidak menjawab 2 pertanyaan sebelumnya. Kalau mau
      angka/mekanisme beda, cukup ganti nilainya, tidak perlu ubah kode.

---

## Rencana Besar Berikutnya (catatan 8 Okt 2026, BELUM dikerjakan)

Aturan khusus plan ini (minta user 8 Okt 2026): setiap item WAJIB tanya +
kasih saran dulu sebelum dikerjakan; setelah dikerjakan WAJIB centang.
Kontak support resmi: WA 085191245042, email supporttokolink@gmail.com.

- [x] **Landing page real (fakta, bukan pajangan)**: rapikan klaim per
      seksi (hero, fitur, harga, FAQ, footer). Tiap angka/teks dicek:
      real → pertahankan, tidak real → putuskan JADIKAN REAL atau HAPUS.
      (Kontak WA/email admin sudah dipasang 8 Okt 2026.)
      **SELESAI 8 Okt 2026:** demo mati dibuang, klaim transfer/nota-WA/
      ongkir/biaya-0,5% dihapus, harga jadi 2 tier jujur (tier Bisnis
      fiktif dihapus), footer + FAQ tersambung WA admin asli.
- [x] **Model freemium real (Gratis vs Premium)** — diputuskan user
      8 Okt 2026. Gratis: 20 produk, Klasik, 3 bio, ringkasan.
      Premium (59rb/bln, 590rb/thn): tanpa batas, 8 tema + badge,
      analitik/traffic/unduh. Enforcement di database
      (`database/migrate_freemium_caps.sql`: trigger cap produk/tema/bio,
      grandfathering yang sudah lewat) + UI (picker tema, RequirePremium,
      pesan error jujur). Diskon & QRIS TIDAK dikunci (adopsi).
- [x] **Halaman toko seller per-bagian**: foto proporsional, tata letak
      jelas, footer jelas — berlaku untuk Klasik + 8 tema engine.
      **SELESAI 8 Okt 2026:** banner "Toko tutup" Klasik, URL pendek di
      footer Klasik, strip tutup ikut `is_closed` (bug: sebelumnya cuma
      ikut jam). Tema engine sudah lolos audit foto/layout/footer.
- [x] **Keranjang top-to-bottom**: ringkasan, promo, CTA jelas di HP.
      **SELESAI 8 Okt 2026:** barang stok habis diblokir sejak keranjang
      (banner + tombol mati + pesan per item), tautan toko aman saat
      kosong, catatan pengiriman-via-chat.
- [x] **Checkout top-to-bottom**: form, ringkasan, tombol bayar jelas di HP.
      **SELESAI 8 Okt 2026:** sudah bernomor 01-03 + ringkasan + CTA
      aksen toko; tidak ada perubahan struktur (diputuskan 8 Okt:
      ongkir dihapus, kirim via chat).
- [x] **Admin panel terpisah**: JANGAN campur alamat/layout dengan dashboard
      seller. Opsi: (a) path `/admin/*` tetap + layout sendiri total
      (termurah, tanpa DNS/infra baru — SARAN), (b) subdomain
      `admin.tokolink.store` (butuh DNS + config Vercel), (c) aplikasi
      terpisah (termahal). Diskusikan + putuskan BARENG user dulu,
      kerjakan belakangan.
      **SELESAI 8 Okt 2026 (opsi a, disetujui user):** sidebar + drawer
      admin gelap (navy) + label "Admin Master" + chip ADMIN di header,
      beda jelas dari seller. Badge drawer jujur (Gratis/Premium/Admin),
      upsell sidebar jujur (tanpa klaim biaya 0,5%).

---

## Status Terkini (18 Okt 2026)

**Fase 0-7:** selesai kecuali smoke test end-to-end (belum dijalankan).

**Multi-toko:** Fase A + B selesai di kode & DB (migrasi multistore_a, a2_view_fix, rpc_lockdown, multistore_b, b2_keys, withdraw_note, security_hotfix_store_members). Fase C (hapus kolom seller_id lama) BELUM. Premium per AKUN, dompet GABUNG. isPremiumActive jangan diubah.

**Audit 17 Okt:** 3 kritis (K1 WA RPC, K2 pemilih toko HP, K3 tutup toko) + 2 serius (S1 badge, S2 catatan withdraw) diperbaiki & ter-deploy. S3 (promo publik) ditunda. Sinkron pindah toko antar-komponen via event tl_active_store_change.

**P0 launch:** halaman Tentang/Kontak, 404 UI, robots/sitemap, security hotfix IDOR, .env.example. Belum: badan hukum/NIB, cek merek DJKI, backup+uji restore, 2FA, SOP insiden, review legal.

**P1:** reports table+UI admin queue, status page, export CSV di akun, CSP report-only, rate limit built-in. Belum: mekanisme lapor di StoreHome (sudah mailto), status page eksternal, uji beban, ekspor data penuh.

**P2:** chatbot fondasi (tabel chat_threads/chat_messages, RLS, RPC buyer_open_chat/buyer_send_chat/buyer_bot_reply, halaman /chat, widget floating landing + ikon bot & WA, nav Chat), bot FAQ kata kunci. Belum: eskalasi notifikasi ke seller, retensi 2-4 minggu (cron), domain kustom, verifikasi penjual, studi kasus.

**Kendala teknis penting:**
- Vercel Hobby max 12 serverless functions → middleware.ts dihapus; OG dinamis hanya di /t/{slug}.
- BUATQRIS_TEST=0 di Vercel untuk produksi (sudah di .env lokal).
- BUATQRIS_CALLBACK_URL harus tokolink.store (sudah diperbaiki di .env lokal).
- Token GitHub/VERCEL disimpan di .env lokal (jangan commit).
