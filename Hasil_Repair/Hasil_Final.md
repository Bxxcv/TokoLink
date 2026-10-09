# HASIL FINAL — TokoLink Full Review (9 Okt 2026)

Audit ulang penuh: 54 temuan lama dicek satu-satu ke kode terbaru + cari
masalah baru. Yang terbukti diperbaiki langsung. Yang tidak bisa diuji
ditulis jujur — tidak ada yang diklaim beres tanpa bukti.

## A. Ringkasan

Kondisi sekarang: **seluruh 4 Critical dan 9 High sudah tertutup di kode
+ SQL**. Dari 54 temuan lama, 50 FIXED, 4 PARTIAL (butuh layanan luar /
keputusan kamu). Sesi ini menemukan 12 masalah baru (kecil–sedang),
semuanya diperbaiki kecuali 2 yang butuh migrasi kamu jalankan.

Masalah paling berbahaya yang tersisa bukan di kode, melainkan di luar
kode: (1) 1 file migrasi baru (`migrate_hardening_upload.sql`) belum
dijalankan, (2) belum ada yang pernah tes concurrency beneran dengan
traffic, (3) email/reset password tergantung setting Supabase manual.

Layak production? **YA, DENGAN SYARAT** (lihat H).

## B. Security

| Temuan | Risiko | Status | Bukti test |
|---|---|---|---|
| Seller jadi admin (001) | Kritis | FIXED | Trigger + RLS di SQL; simulasi di TEST diserahkan ke kamu |
| Cetak saldo (002) | Kritis | FIXED | REVOKE + tak ada insert di frontend (grep bersih) |
| Withdraw curang (003) | Kritis | FIXED | RPC + kunci + atomik; UI via RPC |
| Bocor data seller (004) | Kritis | FIXED | View invoker + grant 9 kolom; Advisor ERROR hilang setelah part3 |
| Palsu bayar/order (005) | Tinggi | FIXED | Hanya-baca + state machine trigger |
| Suspend tak berlaku (006) | Tinggi | FIXED | RequireAuth + trigger + cek server |
| Premium gratis (007) | Tinggi | FIXED | Trigger (termasuk model freemium baru) |
| Audit palsu (008) | Tinggi | FIXED | Panel + log asli |
| Rekening ke browser (009) | Tinggi | FIXED | RPC masked + on-demand diaudit |
| Upload file bebas (BARU) | Sedang | FIXED* | Policy whitelist jpg/png (*migrasi baru, belum dijalankan) |
| Crash JSON API (BARU) | Rendah | FIXED | Parse aman di 3 endpoint; build lolos |
| Rate limit bypass (016) | Sedang | PARTIAL | Header dibetulkan; limit terpusat butuh Redis (berbayar) |
| Spam klik/beacon (017) | Rendah | PARTIAL | Frontend + limit; agregasi server belum |
| Katalog publik (018) | Rendah | PARTIAL | Promo ditutup; produk publik by design (etalase memang publik) |
| Email verif (040) | Sedang | PARTIAL | Pesan jujur; aktifkan confirm email manual |
| XSS/SQLi/CSRF/secret | — | AMAN | 0 `innerHTML`, query terparameterisasi, `npm audit` 0 vuln |

Angka: 54 lama → 50 FIXED, 4 PARTIAL. Baru → 10 FIXED, 2 butuh migrasi (1 file).
Tidak ada temuan Critical/High yang terbuka di kode.

## C. Race condition

- **Withdrawal**: kunci advisory per-seller di `request_withdrawal` dan
  `admin_process_withdrawal`; saldo = ledger − antrean; potong + status
  dalam 1 transaksi. Duplikat status oleh seller ditolak RLS.
- **Stok**: cek saat order + kurang atomik (`decrement_stock`,
  `stock >= qty`) saat webhook; gagal → `perlu_cek` untuk admin.
- **Promo**: `consume_promo` atomik (klaim dulu, gagal = kuota habis).
  Catatan jujur: kalau insert order gagal setelah klaim, kuota bocor 1
  (arah aman, jarang terjadi).
- **Webhook**: klaim bersyarat `status='menunggu'` (tahan kiriman ganda),
  rekonsiliasi nominal, expired-setelah-sukses diabaikan.
- **Test concurrency yang dijalankan**: TIDAK ADA yang live — sandbox ini
  tak punya akses database/network. Yang dilakukan: verifikasi source
  (lock, klaim bersyarat, unique index `idempotency_key`). Panduan uji
  concurrency ada di `Hasil_Repair/Simulasi_Serangan.md` untuk kamu
  jalankan di project TEST. Jangan sebut aman-beton sebelum itu dites.

## D. Audit 8 tema

| Tema | Masalah visual/UX | Perbaikan | Screenshot/test |
|---|---|---|---|
| Warung Rame | Filter ketutup header di HP; ruang QR kosong di desktop | Sticky hanya ≥md; bungkus QR bersyarat | Source + tsc; browser: BELUM |
| Kopi Sore | Aman (info next-buka tampil) | — (verifikasi saja) | Source; browser: BELUM |
| Butik Rapi | Teks nama bisa ketutup kartu QR di desktop | Padding kanan judul | Source; browser: BELUM |
| Jasa Kilat | Toolbar ketutup header di HP (kasus sama) | Sticky hanya ≥md | Source; browser: BELUM |
| Dapur Ngebul | Aman | — | Source; browser: BELUM |
| Kriya Asli | Ringkasan jam abaikan setting tampil | Gerbang `showHours` | Source; browser: BELUM |
| Digital Kilat | Aman (klaim unduh-otomatis sudah dibuang sesi lalu) | — | Source; browser: BELUM |
| Konsultan Tenang | Aman | — | Source; browser: BELUM |

Struktur: tidak ada browser automation di sini, jadi TIDAK ADA screenshot
baru. Semua klaim "aman" di atas = inspeksi source (lebar tetap, wrap,
ellipsis, target ≥44px, grid menumpuk). Wajib cek visual HP asli sebelum
diumumkan. Tidak ada ikon salah (avatar = inisial/foto, bukan logo),
tidak ada data karangan di tema (grep `Rp<angka>`/Lorem bersih).

## E. Logic dan kelengkapan fitur

**Sudah benar (verifikasi ulang):** register/login/logout, proteksi
rute, keranjang 1-toko, checkout + idempotensi, QRIS + webhook + polling,
wallet/riwayat, withdraw seller+admin, CRUD produk/bio/diskon/jam,
ganti tema + QR + pengaturan, 8 halaman admin baca data asli.

**Diperbaiki sesi ini:** webhook `payment.failed` tak gantung order;
gagal tulis ledger → `perlu_cek` (uang tak hilang diam-diam); salin
tautan (lacak + 2 modal QR) lapor jujur; kunci race trigger freemium.

**Hilang (belum ada, bukan bug):** halaman "buat kata sandi baru"
(link reset mati), halaman Audit penuh + Broadcast (cukup panel),
retry bayar QR gagal, resi pengiriman, ulasan pembeli, multi-toko,
rekening tersimpan, OG per-toko.

**Tampil tapi belum berfungsi:** tidak ada lagi yang ketemu — sapu
`toast(` + audit tombol selesai sesi lalu. Kalau kamu nemu 1, kirim
screenshot.

**Butuh keputusan kamu:** (1) Redis rate-limit bayar/tidak, (2) model
refund manual (saat ini tolak otomatis + teks jujur), (3) hapus/tidak
kolom `shipping_*` yang tak dipakai lagi, (4) batas 20 produk/3 tautan
sudah final atau mau geser.

## F. File yang diubah (sesi ini)

- `src/storefront/themes/warung-rame.tsx` — sticky filter + QR bersyarat.
- `src/storefront/themes/jasa-kilat.tsx` — sticky toolbar + hapus banding mati.
- `src/storefront/themes/butik-rapi.tsx` — judul tak ketutup QR.
- `src/storefront/themes/kriya-asli.tsx` — ringkasan jam ikut setting.
- `api/buatqris-webhook.ts` — failed tak gantung; ledger gagal → perlu_cek.
- `api/{create-order,cancel-order,validate-promo}.ts` — parse JSON aman.
- `src/pages/Storefront.tsx` — 3 tombol salin lapor jujur.
- `database/migrate_freemium_caps.sql` — kunci anti-race trigger.
- `database/migrate_hardening_upload.sql` — BARU: whitelist ekstensi upload.

## G. Yang masih harus saya lakukan

1. Supabase SQL Editor → jalankan `database/migrate_hardening_upload.sql`.
2. Vercel → tunggu deploy commit ini (otomatis dari `main`).
3. Supabase Auth → pastikan Confirm email AKTIF (dari sesi lalu).
4. HP asli 360px: buka 8 tema + checkout + wallet (cari yang kepotong).
5. Project TEST: jalankan `Hasil_Repair/Simulasi_Serangan.md` Tes 1–7.
6. Putuskan 4 hal di E (Redis, refund, kolom shipping, batas freemium).

## H. Keputusan production
**READY WITH CONDITIONS**

1. 4 Critical + 9 High tertutup di kode + SQL.
2. Uang (saldo, tarik, promo, stok, webhook) dijaga server, bukan browser.
3. Tidak ada UI berbohong yang diketahui di alur uang.
4. `npm audit` 0 vuln; tanpa XSS/innerHTML; secret hanya di server.
5. Syarat: jalankan 1 migrasi baru (G.1).
6. Syarat: confirm-email aktif + smoke test sandbox lolos.
7. Syarat: cek visual 8 tema di HP asli (belum ada screenshot).
8. Syarat: Tes 1–7 simulasi di project TEST.
9. Batas sadar: rate-limit per-instance (butuh Redis untuk skala).
10. Batas sadar: refund manual, tanpa retry QR, tanpa halaman sandi baru.

## I. Test browser (9 Okt 2026, sesi lanjutan)

**Hambatan jujur:** sandbox ini tak bisa menjalankan browser — sistemnya
pakai musl libc (tanpa loader glibc), Chromium yang terunduh tidak bisa
dieksekusi, dan tidak ada Playwright/Firefox. Klaim "sudah tes live dari
sini" akan bohong, jadi tidak diklaim.

**Yang disiapkan sebagai gantinya** (`tests/` di repo, tinggal jalan di
laptop kamu — butuh browser beneran + project TEST):

| ID | Tujuan | Status di sini |
|---|---|---|
| T1–T5 | Serangan RLS (admin, saldo, withdraw, PII, payment) | NOT TESTABLE — suite siap, butuh ENV test |
| T6–T8 | Login UI, /admin ditolak, lacak jujur | NOT TESTABLE — butuh APP_URL + akun |
| T9–T10 | Race withdrawal + checkout ganda | NOT TESTABLE — butuh saldo test + sandbox QRIS |
| T11 | Overflow 360–1440 + screenshot | NOT TESTABLE — butuh browser |

**Cara jalan (laptop kamu):** `cd tests && npm install && npx playwright
install chromium`, isi ENV sesuai `tests/README.md`, `npx playwright test`.
Tanpa ENV semua test API otomatis SKIP (bukan FAIL). Kirim output +
screenshot gagal ke engineer untuk diperbaiki.

Catatan keamanan: JANGAN arahkan suite ke production. Hanya project TEST.
