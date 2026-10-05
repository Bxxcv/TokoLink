# HASIL REPAIR TOKOLINK

Tanggal: 5 Oktober 2026. Dikerjakan langsung di source code (bukan sekadar saran).
Acuan temuan: `Hasil_Audit_cyber/Hasil.md` (54 temuan: 4 Critical, 9 High, 27 Medium, 14 Low).
Setiap temuan dicek ulang ke kode TERKINI — yang masih ada diperbaiki, yang sudah
beres diverifikasi.

## 1. STATUS AKHIR

Status: **PARTIALLY SECURE** (aman sebagian, dengan syarat).

Kode perbaikannya sudah jadi semua dan `npm run build` lolos. Tapi proteksi
database (RLS, trigger, RPC) baru aktif SETELAH 2 file migrasi dijalankan manual
di Supabase SQL Editor — saya tidak punya akses ke database production, jadi
bagian itu harus kamu jalankan (langkahnya ada di bagian 8, cuma 5 menit).
Sampai migrasi dijalankan, celah lama masih terbuka di production.

Yang belum dikerjakan sama sekali: rate-limit terpusat (butuh layanan Redis/KV
berbayar), monitoring uptime, halaman ganti kata sandi, dan tes HP fisik.

## 2. APA YANG SUDAH DIPERBAIKI

| ID | Masalah | Status | Singkatnya |
|----|---------|--------|------------|
| BUG-001 | Seller bisa jadi admin | FIXED | Trigger kunci role/plan/status; seller ditolak DB |
| BUG-002 | Seller bisa cetak saldo | FIXED | Ledger hanya-baca untuk client; tulis via server |
| BUG-003 | Withdraw tanpa validasi | FIXED | Wajib via RPC: cek saldo + antrean + kunci anti-double |
| BUG-004 | Data seller bocor ke publik | FIXED | Tabel profiles tutup untuk anon; publik via view minim |
| BUG-005 | Seller bisa palsukan pembayaran | FIXED | payments/order_items hanya-baca; orders ada state machine |
| BUG-006 | Akun ditangguhkan tetap bisa masuk | FIXED | RequireAuth tolak status non-aktif + trigger kunci |
| BUG-007 | Premium gratis via update | FIXED | Kolom plan dikunci trigger (ikut BUG-001) |
| BUG-008 | Log audit palsu (hardcode) | FIXED | Panel baca tabel audit_log asli; aksi admin dicatat |
| BUG-009 | No. rekening full ke browser | FIXED | Daftar via RPC tersamarkan; nomor utuh on-demand + diaudit |
| BUG-010 | Total checkout ≠ yang ditagih | FIXED | Ongkir dihitung server; promo ongkir berlaku; kolom baru |
| BUG-011 | Stok tidak pernah berkurang | FIXED | Validasi stok + kurang atomik saat bayar sukses |
| BUG-012 | Status bayar tak pernah lunas | FIXED | Pemetaan eksplisit; dikemas = lunas; batal ada layarnya |
| BUG-013 | Tombol batal tidak batal | FIXED | Endpoint cancel-order asli (cek token, hanya menunggu) |
| BUG-014 | Kuota promo bisa jebol | FIXED | RPC consume_promo atomik |
| BUG-015 | Order spam + klik ganda | FIXED | Seller dari produk; idempotency_key; batas field/qty; cek tutup |
| BUG-016 | Rate limit bisa dilewati | PARTIAL | Header IP dibetulkan; limit terpusat butuh Redis (belum) |
| BUG-017 | Klik/kunjungan bisa dispam | PARTIAL | Dibatasi di frontend; limit server + agregasi belum |
| BUG-018 | Katalog & promo diintip semua | PARTIAL | Promo: anon dicabut + preview via server; produk publik by design |
| BUG-019 | Webhook tanpa rekonsiliasi | FIXED | Cocokkan nominal; anti-downgrade; expired aman |
| BUG-020 | Diskon >100% lolos | FIXED | Constraint DB + clamp server + tolak sebelum insert |
| BUG-021 | Aksi uang tanpa jejak | FIXED | log_admin_action dipanggil di semua aksi admin |
| BUG-022 | Hapus akun hancurkan kewajiban | FIXED | API tolak bila saldo/penarikan/pesanan masih ada (409) |
| BUG-023 | Tautan bio hilang di 7 tema | FIXED | Komponen bio bersama dipakai semua tema |
| BUG-024 | Tutup toko diabaikan 6 tema | FIXED | canAdd wajib cek closed di semua tema |
| BUG-025 | Polling 3 detik nonstop | FIXED | Berhenti saat final; backoff; jeda saat tab sembunyi |
| BUG-026 | Query tanpa batas | FIXED | Limit + label jujur (500/1000/5000) |
| BUG-027 | Timeline pakai 1 tanggal palsu | FIXED | Hanya tanggal buat asli; sisanya ✓/— |
| BUG-028 | Error database mentah ke user | FIXED | Pesan Indonesia ramah; detail teknis disembunyikan |
| BUG-029 | Checkout layar putih | FIXED | Error state + tombol muat ulang |
| BUG-030 | Badge Premium di semua toko | FIXED | Bersyarat is_premium; kartu dasbor ikut data asli |
| BUG-031 | Tombol WA cuma toast | FIXED | Buka wa.me asli via RPC (nomor mentah tetap aman) |
| BUG-032 | Bagikan tidak menyalin | FIXED | Clipboard asli + fallback + pesan jujur |
| BUG-033 | Janji kirim/garansi palsu | FIXED | Copy netral; alamat contoh dibuang; kode pos terkirim |
| BUG-034 | Kurir & transfer tidak ngaruh | FIXED | Kurir masuk total; transfer bank dihapus (QRIS saja) |
| BUG-035 | Batal klaim refund otomatis | FIXED | Hanya menunggu; teks jujur; server juga menolak |
| BUG-036 | Nol header keamanan | FIXED | Header di vercel.json (tanpa CSP dulu, lihat sisa) |
| BUG-037 | Halaman /system publik | FIXED | Wajib login |
| BUG-038 | Galeri 3 foto palsu | FIXED | Satu foto saja |
| BUG-039 | Statistik landing karangan | FIXED | Copy jujur; preview jadi demo berlabel; tombol periode jalan |
| BUG-040 | Verifikasi email tak pasti | PARTIAL | Pesan tak bocorkan email; aktifkan confirm email manual |
| BUG-041 | 30 tombol/field mati | FIXED | Semua disambungkan atau dibuat jujur (rinci di bawah) |
| BUG-042 | Sumbu tanggal Jan–Feb | FIXED | Label dari tanggal asli |
| BUG-043 | Pengunjung = Halaman dilihat | FIXED | Kartu diganti; jam pakai WIB |
| BUG-044 | Contoh tersimpan ke profil | FIXED | Default kosong + placeholder |
| BUG-045 | Badge admin 2 dan 1 | FIXED | Hitung asli dari database |
| BUG-046 | Paginasi/filter palsu | FIXED | Label jujur; tab jadi "Dibatalkan" |
| BUG-047 | Nomor & email dukungan palsu | FIXED | Pakai support@tokolink.store |
| BUG-048 | api/_lib.ts kode mati | DIBIARKAN | Sengaja tidak dihapus (aturan: hapus file harus izin dulu) |
| BUG-049 | ID order sempit (9rb/bln) | FIXED | 6 digit + 10x coba |
| BUG-050 | schema.sql ganda | DIBIARKAN | Sengaja tidak dihapus (aturan yang sama); pakai database/ |
| BUG-051 | Daftar kota beda-beda | FIXED | Pengaturan pakai CITIES yang sama (116 kota) |
| BUG-052 | Privasi ngaku draf | FIXED | Teks netral + akurat; review hukum tetap disarankan |
| BUG-053 | Keranjang campur 2 toko | FIXED | Peringatan + tombol checkout dikunci sejak keranjang |
| BUG-054 | Bundel 938 kB + 10 font | DIBIARKAN | Bongkar singlefile berisiko deployment; didokumentasikan |

Rincian BUG-041 (30 item): WA toko/produk/mobile/sukses/lacak → buka wa.me asli;
Bagikan + onShare → clipboard asli; Batal QRIS → API asli; kurir → masuk harga;
kode pos → terkirim; stepper 3/4 → tidak bisa diklik; Simpan jam → dihapus (auto-save);
status buka → hitungan asli; 405 pemindaian + grafik QR → dihapus/diganti info jujur;
toggle notif → tersimpan lokal + jujur; Bulanan/Tahunan → tanpa klaim palsu;
nama tampilan → dihapus; unduh label → file TXT asli (sudah ada); unduh antrean →
CSV asli; rekonsiliasi → unduh CSV asli; undang → salin tautan; simpan pengaturan
→ tersimpan asli; toggle kanal → badge jujur; maintenance → tersimpan asli;
uptime → diakui belum ada; Periksa → modal detail asli; WA login → pesan jujur;
simulasi gangguan → dihapus; checklist → dari data asli.

## 3. YANG PALING BERBAHAYA (sudah ditangani)

**Masalah:** Seller bisa jadi admin (1 request HTTP).
**Dampak:** Seluruh platform diambil alih.
**Solusi:** Trigger DB tolak ubah role/plan/status oleh non-admin + RLS ketat.

**Masalah:** Seller bisa cetak saldo lalu tarik.
**Dampak:** Uang platform hilang langsung.
**Solusi:** Ledger hanya-baca client; penarikan via RPC cek saldo + kunci.

**Masalah:** Seller setujui penarikan sendiri, saldo tak berkurang.
**Dampak:** Saldo abadi, tarik berkali-kali.
**Solusi:** Status cuma via RPC admin; potong saldo atomik dalam 1 transaksi.

**Masalah:** Nama + WA + alamat semua seller bisa diunduh anonim.
**Dampak:** Spam/phising massal, langgar UU PDP.
**Solusi:** Anon tidak bisa baca profiles; publik via view minim + nomor WA via URL.

**Masalah:** Total di layar beda dengan yang ditagih QRIS.
**Dampak:** Pembeli merasa ditipu; seller tak terima ongkir.
**Solusi:** Ongkir dihitung server dari metode kirim; angka layar = angka tagih.

**Masalah:** Bayar sukses tapi layar "mengonfirmasi" selamanya; batal tampil selesai.
**Dampak:** Pembeli panik / salah kira barang dikirim.
**Solusi:** Status dipetakan eksplisit; layar gagal khusus untuk batal.

**Masalah:** Stok tidak pernah berkurang (iklan bilang otomatis).
**Dampak:** Jual melebihi stok.
**Solusi:** Cek stok saat order; kurang atomik saat bayar; iklan kini benar.

**Masalah:** Nomor rekening full ke browser admin.
**Dampak:** Bocor ke siapa pun yang intip network.
**Solusi:** Daftar tersamarkan; nomor utuh hanya saat transfer + tercatat.

**Masalah:** Webhook tak cocokkan nominal, bisa turunkan status.
**Dampak:** Selisih tak ketahuan; order lunas bisa jadi batal.
**Solusi:** Nominal harus sama persis; transisi dijaga dua sisi.

**Masalah:** Log audit karangan (nama orang tak ada).
**Dampak:** Nol bukti saat sengketa uang.
**Solusi:** Panel baca tabel asli; semua aksi uang dicatat.

## 4. DATABASE

Migrasi 1 (sudah ada kemarin, BELUM dijalankan):
`database/migrate_security_hotfix_critical.sql` — trigger kunci
protect_profiles_privileged, RLS profiles/ledger/withdrawals ketat, view
public_stores, RPC request_withdrawal + admin_process_withdrawal, batas
min_withdrawal ikut settings.

Migrasi 2 (baru, BELUM dijalankan): `database/migrate_fullrepair_part2.sql`
- RLS: baca publik bio_links aktif + store_hours; payments/order_items hanya-baca
  seller; orders tanpa insert/delete client + trigger state machine
  (menunggu→batal, dikemas→dikirim, dikirim→selesai).
- View public_stores tambah is_premium (badge jujur).
- RPC baru: store_contact_link (URL WA tanpa bocor nomor),
  consume_promo (kuota atomik), decrement_stock (stok atomik),
  admin_withdrawal_list + admin_withdrawal_account (rekening masked + audit).
- Constraint: discount_value_sane (persen ≤100, nilai positif).
- Kolom baru orders: shipping_method, shipping_cost, idempotency_key (unique).
- track_order: ikutkan ongkir, metode kirim, nominal tagihan, wa_url.

Semua idempotent (aman dijalankan ulang), RLS tetap aktif di semua tabel,
tak ada data yang dihapus.

## 5. FILE YANG DIUBAH

| File | Perubahan | Alasan |
|---|---|---|
| database/migrate_fullrepair_part2.sql | BARU: RLS+RPC+kolom part 2 | BUG-005/009/010/014/018/019/020/023-pendukung |
| database/migrate_security_hotfix_critical.sql | min_withdrawal ikut settings | Admin bisa ubah tanpa deploy |
| api/create-order.ts | Tulis ulang: ongkir server, stok, idempotensi, promo atomik, validasi | BUG-010/011/014/015/016/020 |
| api/validate-promo.ts | BARU: preview promo server-side | BUG-018 (anon tak baca promo lagi) |
| api/cancel-order.ts | BARU: batal asli by token | BUG-013 |
| api/buatqris-webhook.ts | Rekonsiliasi nominal, anti-downgrade, stok atomik, IP benar | BUG-011/016/019 |
| api/delete-account.ts | Tolak bila saldo/tarikan/pesanan ada (409) | BUG-022 |
| src/lib/auth.tsx | Tanpa role saat insert; tolak akun non-aktif; pesan netral | BUG-001/006/040 |
| src/pages/Storefront.tsx | WA/clipboard/badge/status-bayar/batal/ongkir/kodepos/galeri/timeline/polling/keranjang | BUG-010/012/013/023-pendukung/025/027/029–035/052/053 |
| src/storefront/themes/shared.tsx | BARU: blok tautan bio bersama | BUG-023 |
| src/storefront/themes/*.tsx (7 file) | Tautan bio + hormati tutup + nomor WA disembunyikan | BUG-023/024 + privasi |
| src/pages/DashboardA.tsx | Label tanggal, checklist, debug, WIB, refund, batal, pagination | BUG-035/041/042/043/046 |
| src/pages/DashboardB.tsx | Promo error, jam, QR, notif, premium, kota, default kosong | BUG-028/041/044/051 |
| src/pages/Admin.tsx | Audit asli, rekening masked, settings asli, CSV, modal, badge | BUG-008/009/021/041/045/046 |
| src/components/layout.tsx | Badge antrean admin dari DB | BUG-045 |
| src/lib/notifications.ts | countUnread bisa pakai data jadi (hemat 1 query) | Performa |
| src/pages/Auth.tsx | Kontak dukungan asli; klaim waktu jujur | BUG-047 |
| src/pages/Landing.tsx | Statistik jujur; periode demo jalan | BUG-039 |
| src/App.tsx | /system wajib login | BUG-037 |
| vercel.json | Header keamanan | BUG-036 |

Tidak diubah: desain/tampilan (hanya copy jujur), router, framework, dependency
(tidak tambah apa pun).

## 6. TEST

| Area | Status | Catatan |
|---|---|---|
| Build (npm run build) | PASS | Lolos 3x selama pengerjaan |
| Auth/register/login | PARTIAL | Alur kode benar; belum klik sungguhan (butuh Supabase) |
| Storefront + 8 tema | PARTIAL | Render dari kode benar; belum buka browser |
| Cart → checkout → QRIS | NOT TESTABLE | Butuh kredensial BuatQris + migrasi jalan |
| Webhook | NOT TESTABLE | Butuh callback BuatQris asli |
| Wallet/withdraw + RPC | NOT TESTABLE | Butuh migrasi jalan di project test |
| Admin + audit | NOT TESTABLE | Butuh role admin di project test |
| RLS/trigger (SQL) | NOT TESTABLE | Tak ada akses SQL dari sini; cek manual di bagian 8 |
| Responsif 360–1440 | PARTIAL | Struktur Tailwind aman; belum perangkat nyata |
| Security headers | PARTIAL | Sintaks vercel.json benar; headers aktif setelah deploy |

Jujur: tidak ada yang saya klaim PASS tanpa eksekusi. Semua yang ditandai
NOT TESTABLE menunggu migrasi + project test (cara cepatnya di bagian 8).

## 7. YANG MASIH BELUM SELESAI

- **Migrasi belum dijalankan** — paling penting. Kenapa: tak ada akses DB dari
  sini. Berbahaya: ya, celah lama masih terbuka. Harus: jalankan 2 file (bagian 8).
- **Rate limit terpusat (BUG-016 sisa)** — masih in-memory per instance + header
  sudah benar. Kenapa belum: butuh Redis/Upstash (berbayar). Berbahaya: sedang
  (spam order masih mungkin). Harus: pasang Upstash Redis + pindahkan counter.
- **Anti-spam klik beacon (BUG-017 sisa)** — kenapa: butuh tabel log IP / edge
  limit. Berbahaya: rendah (cuma metrik). Harus: agregasi harian nanti.
- **Katalog publik bisa dibaca semua (BUG-018 sisa)** — by design (etalase memang
  publik). Berbahaya: rendah. Harus: tidak wajib; kalau mau, RPC per-slug.
- **Blok QR & sampul di sebagian tema** — 6 tema tak tampilkan QR, 7 tak pakai
  sampul. Kenapa: ubah desain tiap tema satu-satu. Berbahaya: tidak (kosmetik).
  Harus: tambahkan saat sentuh tema lagi.
- **Halaman ganti kata sandi (backlog)** — link reset masih ke /. Harus: halaman
  baru + set redirect URL di Supabase.
- **Multi-toko, rekening tersimpan, ulasan, OG premium, geocoding** — backlog,
  sesuai TASKS.md. Jangan disisipkan sekarang.
- **Confirm email + captcha (BUG-040 sisa)** — setting dasbor, lihat bagian 8.
- **npm audit + tes HP + OrderDetail di HP** — butuh mesin + perangkat kamu.
- **api/_lib.ts & schema.sql ganda** — sengaja tak dihapus (aturan hapus file).
  Berbahaya: tidak (cuma jebakan kerapian). Harus: kamu putuskan hapusnya.

## 8. MANUAL ACTION REQUIRED

WAJIB sebelum production (urutan penting):

1. Buka Supabase → SQL Editor → project PRODUCTION.
2. Jalankan `database/migrate_security_hotfix_critical.sql` (copy-paste seluruh
   isi → Run). Tunggu sukses.
3. Jalankan `database/migrate_fullrepair_part2.sql` → Run. Tunggu sukses.
4. Verifikasi (tempel satu-satu, harus 0 baris untuk yang pertama):
   - `select policyname from pg_policies where tablename='profiles';`
     → tidak boleh ada "seller manages own profile" / "public can read storefront profile".
   - `select id, role, plan, status from profiles where role <> 'seller' or plan <> 'gratis' or status <> 'aktif';`
     → selidiki tiap baris (harusnya cuma admin/plan sah).
   - `select seller_id, sum(amount) from ledger group by 1 order by 2 desc limit 20;`
     → cocokkan dengan payments berhasil; yang janggal = saldo palsu.
   - Bekukan: JANGAN cairkan withdrawal menunggu/diproses sebelum cek di atas.
5. Supabase → Authentication → Providers → Email: aktifkan "Confirm email".
6. Supabase → Auth → URL Configuration: pastikan Site URL = https://tokolink.store.
7. Vercel → Environment Variables: pastikan BUATQRIS_* + SUPABASE_SERVICE_ROLE_KEY
   hanya di server (tidak berawalan VITE_*). Lalu deploy ulang (agar vercel.json
   headers + API baru naik).
8. Uji di project TEST dulu: daftar → 2 produk → tiap 8 tema (tautan bio ada,
   tutup toko matikan beli) → checkout QRIS sandbox → webhook sukses → saldo
   masuk → withdraw → admin proses → selesai.
9. Opsional tapi disarankan: pasang captcha (Turnstile) di register; `npm audit`
   di laptop; cek 375px & 1440px di browser asli.

## 9. KONDISI PRODUCTION

🟡 **READY WITH CONDITIONS**

Alasannya: semua 4 Critical + 9 High + sebagian besar Medium/Low sudah diperbaiki
di kode + SQL, dan tidak ada lagi tombol yang berbohong di alur uang. Tapi
garansi ini baru berlaku SETELAH 2 migrasi dijalankan + confirm-email aktif +
smoke test sandbox lolos. Tanpa itu, statusnya tetap 🔴 NOT READY. Setelah
syarat beres + Redis terpasang, TokoLink layak terima uang sungguhan untuk
skala UMKM.
