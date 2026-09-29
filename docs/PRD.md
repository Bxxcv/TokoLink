# PRD — TokoLink

Dokumen ini adalah **satu-satunya sumber kebenaran soal APA yang dibangun
dan KENAPA**. `AGENTS.md` mengatur bagaimana agent bekerja; dokumen ini
mengatur apa yang harus jadi. Baca ini sebelum mengerjakan task apapun
yang menyangkut keputusan produk (bukan cuma teknis).

---

## 1. Visi Produk

TokoLink = **"satu link untuk semua toko"**. Penjual UMKM Indonesia dapat
satu halaman publik (link-in-bio + katalog + checkout QRIS) yang bisa
dibagikan lewat WhatsApp/Instagram, tanpa perlu bikin website sendiri.

**Masalah yang diselesaikan:** kebanyakan UMKM jualan cuma modal story
WhatsApp/Instagram — tidak ada katalog rapi, tidak ada checkout otomatis,
pembeli harus tanya harga satu-satu lewat chat. TokoLink mengganti itu
dengan satu link yang berisi semuanya.

**Target rilis:** produk siap dipakai penjual asli (bukan prototipe/demo),
data 100% real dari database — lihat `AGENTS.md` Bagian 3 aturan #9.

---

## 2. Persona & Pain Point

### Seller (pengguna utama)
- Pemilik UMKM rumahan (kuliner, kerajinan, fashion kecil-kecilan).
- **Awam teknologi**, akses mayoritas dari **HP**, koneksi kadang lambat.
- Pain point: capek balas chat "harga berapa/ready gak/transfer ke mana"
  satu-satu; belum punya cara terima pembayaran otomatis; tidak tahu cara
  bikin website.
- Yang mereka butuh: setup cepat (dalam hitungan menit), tidak perlu
  paham istilah teknis, checkout yang bikin pembeli percaya (ada bukti
  bayar otomatis, bukan transfer manual yang rawan ditipu).

### Buyer (pengguna sekunder, TIDAK PUNYA AKUN)
- Datang dari link yang dibagikan seller (WhatsApp/Instagram/bio).
- **Tidak pernah diharuskan daftar/login** — baik saat checkout maupun
  saat cek status pesanan (lihat `orders.access_token` di Memory Block
  `AGENTS.md`).
- Yang mereka butuh: lihat produk & harga jelas, bayar gampang (QRIS —
  semua e-wallet/m-banking), tahu status pesanan tanpa ribet.

### Admin (kita/platform)
- Approve pengajuan premium, proses/pantau penarikan saldo seller,
  awasi seluruh transaksi platform, tangani seller bermasalah.

---

## 3. Model Bisnis

- **Freemium**: `profiles.plan` = `gratis` (default) atau `premium`.
  Beda fitur antara gratis/premium **belum didefinisikan detail** — kalau
  agent butuh ini utuh menulis kode, TANYA user, jangan asumsi sendiri.
- **Fee transaksi**: kemungkinan platform mengambil bagian dari tiap
  transaksi. BuatQris sendiri sudah punya `admin_fee` (dipotong dari
  saldo seller atau ditambahkan ke tagihan buyer, tergantung `fee_by`,
  saat ini di-hardcode `fee_by=user` di `create-order.ts`). Fee TAMBAHAN
  milik platform TokoLink sendiri (di luar fee BuatQris) **belum
  diputuskan** — jangan hardcode angka apapun untuk ini, tanya user.

---

## 4. Fitur per Halaman (Feature Spec)

Setiap baris = 1 halaman nyata di `src/pages/`. "Story" ditulis format
*Sebagai [peran], saya ingin [aksi], supaya [tujuan]*.

### Landing (`Landing.tsx`) — publik, marketing
Halaman depan produk, ajak seller daftar. Konten statis (bukan data
pengguna) — boleh tetap pakai konstanta di `data.tsx` (lihat pengecualian
di `AGENTS.md` #9).

### Auth (`Auth.tsx`) — publik
- *Sebagai calon seller, saya ingin daftar pakai email, supaya bisa
  mulai jualan tanpa proses ribet.*
- *Sebagai seller, saya ingin reset password kalau lupa, supaya tidak
  kehilangan akses toko.* **Catatan: halaman "buat kata sandi baru"
  belum ada, lihat backlog di TASKS.md.**

### Storefront — publik, diakses buyer
- `StoreHome`: katalog produk toko (by `store_slug`), badge buka/tutup
  (dari `store_hours`), tema visual (dari pengaturan seller).
  *Sebagai buyer, saya ingin lihat semua produk toko dalam satu halaman
  rapi, supaya tidak perlu tanya satu-satu lewat chat.*
- `ProductDetail`, `Cart`, `Checkout`: alur belanja standar. Checkout
  hitung total dari harga **real** produk + terapkan kode diskon kalau
  ada (lihat `discount_codes`).
- `Qris`, `PaymentStatus`, `OrderSuccess`: alur pembayaran QRIS via
  BuatQris. Detail teknis lengkap → `docs/ARCHITECTURE.md` bagian alur
  checkout, dan `.opencode/skill/buatqris-webhook/SKILL.md`.
- `OrderTracking`: *Sebagai buyer (tanpa akun), saya ingin cek status
  pesanan pakai link yang saya terima, supaya tahu pesanan sudah
  diproses/dikirim tanpa harus daftar akun.*

### DashboardA (sisi seller — kelola jualan)
- `DashboardHome`, `Analytics`, `Traffic`: ringkasan performa toko.
- `Products`, `ProductForm`: *Sebagai seller, saya ingin tambah/edit
  produk dari HP dengan cepat, supaya katalog selalu update.*
- `Orders`, `OrderDetail`: *Sebagai seller, saya ingin lihat & update
  status pesanan (dikemas → dikirim → selesai), supaya buyer tahu
  progress tanpa saya harus chat manual.*

### DashboardB (sisi seller — kelola toko)
- `Wallet`, `Withdraw`: *Sebagai seller, saya ingin lihat saldo dari
  penjualan dan tarik ke rekening saya, supaya uang hasil jualan bisa
  saya pakai.*
- `BioLinks`: kelola link tambahan (Instagram, katalog, dll) ala
  link-in-bio klasik.
- `Theme`: pilih tema visual toko.
- `Discount`: *Sebagai seller, saya ingin bikin kode diskon simpel,
  supaya bisa promo tanpa ribet atur harga manual per produk.*
- `Hours`: jam operasional toko, badge buka/tutup otomatis di
  `StoreHome`.
- `StoreQR`: unduh QR code yang mengarah ke link toko (untuk promosi
  offline — stiker, banner fisik).
- `StoreSettings`, `AccountSettings`: profil toko & akun. **Catatan:
  beberapa field (kategori/bio/alamat/email tampilan) belum ada
  kolomnya di database — lihat Backlog di TASKS.md.**
- `Notifications`: pemberitahuan seller (pesanan baru, dll).

### Admin (sisi platform)
- `AdminHome`, `AdminAnalytics`: ringkasan performa seluruh platform.
- `AdminSellers`: kelola/pantau semua seller.
- `AdminPremium`: *Sebagai admin, saya ingin approve/tolak pengajuan
  premium, supaya upgrade plan terverifikasi manual (bukti transfer
  dicek manusia, bukan otomatis).*
- `AdminWithdrawals`: proses penarikan saldo seller.
- `AdminPayments`: pantau semua transaksi platform.
- `AdminUsers`: kelola akun (seller & admin lain).
- `AdminSystem`: **isinya belum diputuskan — tanya user dulu sebelum
  dikerjakan** (lihat `.opencode/TASKS.md` Fase 6).

---

## 5. Non-Functional Requirements

- **Mobile-first, keras**: mayoritas seller & buyer akses dari HP,
  seringnya koneksi lambat. Semua halaman wajib dicek di 375px (lihat
  `.opencode/skill/ui-interaction-patterns/SKILL.md`).
- **Keamanan**: RLS di semua tabel, HMAC webhook, secret hanya di
  server. Lihat `.opencode/skill/supabase-rls-patterns/SKILL.md` dan
  `.opencode/skill/buatqris-webhook/SKILL.md`.
- **Keandalan pembayaran**: webhook harus idempoten (BuatQris bisa
  kirim event dobel), status transaksi TIDAK BOLEH diasumsikan sukses
  hanya dari redirect browser — harus dari webhook (sumber kebenaran).
- **Data selalu real**: lihat `AGENTS.md` Bagian 3 aturan #9. Tidak ada
  toleransi data contoh di fitur yang sudah selesai.

---

## 6. Eksplisit DI LUAR Scope (jangan dikerjakan tanpa diminta)

- Multi-toko dalam 1 akun (DITUNDA — lihat Memory Block `AGENTS.md`)
- Sistem promo/marketing lanjutan di luar 1 kode diskon aktif per toko
- Pembayaran selain QRIS (transfer manual disebut di UI checkout sebagai
  opsi, TAPI belum ada task/implementasi backend-nya — cek ke user dulu
  kalau ada yang minta ini dikerjakan)
- Multi-bahasa (produk ini bahasa Indonesia saja untuk saat ini)
- App mobile native (hanya web, diakses lewat browser HP)

---

## 7. Glosarium (istilah bisnis ↔ nama kolom database)

| Istilah produk | Kolom/tabel terkait |
|---|---|
| Status pesanan (menunggu/dikemas/dikirim/selesai/batal) | `orders.status` |
| Saldo seller | dihitung dari `sum(ledger.amount)` per `seller_id` |
| Biaya admin BuatQris | `payments.fee`, dari field `admin_fee` respons BuatQris |
| Nominal yang harus dibayar buyer (sudah termasuk kode unik) | `total_amount` dari respons BuatQris, BUKAN `orders.total` mentah |
| Link lacak pesanan buyer | `orders.id` + `orders.access_token` |
| Kode promo | `discount_codes` |
| Status toko buka/tutup | dihitung dari `store_hours` + jam saat ini |
| Pengajuan naik ke Premium | `premium_requests` |
