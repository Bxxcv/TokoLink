# Theme Engine + 8 Tema — Laporan Implementasi

Tanggal: 2 Okt 2026. Fase: Engine + SEMUA 8 tema selesai (data asli).

## 1. Source yang diperiksa
- `.opencode/AGENTS.md`, `.opencode/TASKS.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/LOVABLE_BRIEF_THEME.md`
- `src/pages/Storefront.tsx` (StoreHome + seluruh alur buyer), `src/pages/DashboardB.tsx` (Theme + BioLinks), `src/lib/data.tsx`, `src/lib/router.tsx`, `src/components/ui.tsx` (set ikon), `database/schema.sql` + `database/migrate_fase5_theme.sql`, `index.html` (font)
- `desain_toko_seller/src/` lengkap: `data/themes.ts` (8 token + matriks), `storefront/Storefront.tsx` + `Mobile.tsx` (8 layout), `storefront/bits.tsx`, `data/guide.ts`

## 2. Arsitektur Theme Engine
```
halaman toko (Storefront.tsx StoreHome)
  → ambil SEMUA data (profil, produk, bio_links, store_hours, store_theme, QR, keranjang)
  → kalau theme_id = "ruang-seduh": <RuangSeduh {...satu paket props} />
    kalau lain/klasik: JSX bawaan lama (tidak diubah)
src/storefront/
  types.ts    kontrak data (tema dilarang query Supabase sendiri)
  registry.ts daftar 9 entri (klasik + 01 + 02–08 "segera hadir")
  themes/ruang-seduh.tsx  presentasi saja
src/lib/links.ts  detectLinkIcon() + iconForLink() sentral (semua tema + dashboard pakai ini)
```
Satu model data + satu alur beli (`onAdd → /cart → checkout → QRIS`) untuk semua tema.

## 3. File yang dibuat
- `src/storefront/types.ts`, `src/storefront/registry.ts`, `src/storefront/themes/index.ts` (peta ID → komponen)
- 8 tema: `ruang-seduh.tsx`, `pasar-rapi.tsx`, `lugas-jasa.tsx`, `atelier.tsx`, `dapur-hari-ini.tsx`, `kriya-nusantara.tsx`, `pixel-goods.tsx`, `studio-tenang.tsx`
- `src/lib/links.ts`
- `database/migrate_fase5_theme_id.sql`
- `docs/THEME_ENGINE.md` (file ini)

## 4. File yang diubah
- `src/pages/Storefront.tsx` — query `theme_id` terpisah (aman bila kolom belum ada) + render via peta `ENGINE_COMPONENTS`; ikon bio via `iconForLink`
- `src/pages/DashboardB.tsx` — `detectLinkIcon` lokal dihapus (pakai sentral), kartu "Tema toko" 8 pilihan + pratinjau mini (01–02 detail, 03–08 generik, semua pakai produk asli), simpan `theme_id` (pesan jelas kalau migrasi belum jalan)
- `src/components/ui.tsx` — tambah ikon `yt`, `tg`, `shop` (aditif)
- `src/storefront/types.ts` — tambah `allItems` (hitungan kategori)
- `index.html` — font: Fraunces, IBM Plex Sans, Archivo, Instrument Serif, Bricolage Grotesque, Space Grotesk, Newsreader (mono sudah ada)

## 5. Tema yang berhasil di-port (8/8, semua data asli)
- 01 Ruang Seduh: ledger bernomor + profil lengket.
- 02 Pasar Rapi: grid padat 4→2 kolom, harga mono besar, cari + chip.
- 03 Lugas Jasa: rail kategori + tabel (kode = SKU asli, satuan = unit/kategori asli, panel jam = store_hours asli).
- 04 Atelier: galeri 4:5 asimetris, keterangan di bawah foto, panel jam asli.
- 05 Dapur Hari Ini: papan bertanggal WIB (dihitung, bukan contoh), cap HABIS = stok 0 asli, bilah bawah → /cart.
- 06 Kriya Nusantara: masonry + label vertikal, blok cerita = bio asli (sembunyi bila kosong).
- 07 Pixel Goods: satu-satunya tema gelap, spesifikasi = SKU/kategori/stok asli, ringkasan = jumlah item (tanpa total & klaim unduh palsu).
- 08 Studio Tenang: kolom 640px, headline = bio/nama toko asli, slot = jam asli, kutipan contoh dibuang.
- Yang DIBUANG dari showcase karena tidak ada datanya: semua nama/toko/kota/harga/slot/kutipan/stiker promo contoh; tidak ada klaim transfer manual (hanya QRIS).

## 6. Data/logic existing yang dipertahankan
Auth, checkout, payment, webhook, RLS, wallet, admin — tidak disentuh. Keranjang/checkout/QRIS/modal QR/search/filter kategori/badge jam/bio-links/CTA WhatsApp dipakai ulang apa adanya. Bilah bawah tema mengarah ke `/cart` (bukan pesan via WhatsApp) supaya alur beli tidak berubah. Kutipan puitis & nama/toko/harga contoh dari showcase DIBUANG (bukan data asli).

## 7. Dependency yang ditambahkan
Tidak ada. `framer-motion` + `html-to-image` (dipakai showcase) tidak dibawa — yang satu untuk ekspor PNG panduan, satunya tidak dipakai di source showcase sama sekali.

## 8. Build result
`npx tsc --noEmit` bersih, `npm run build` sukses (dist 938 kB, gzip 246 kB). Tidak ada dependency baru.

## 9. Test result
- Typecheck + build lolos. Cek `grep` anti-mock pada file baru: hanya `import type Product` + formatter `rupiah` (diizinkan), tidak ada import `PRODUCTS`/mock.
- Belum diuji dengan browser sungguhan (butuh user): buka `/s/{slug}` sebelum & sesudah pilih tema.

## 10. Responsive result
Satu komponen responsif (kolom profil menumpuk di HP, ledger 3 kolom menyempit, tab scroll horizontal, tidak ada lebar fix 1440/390). Wajib cek manual 375px & 1440px oleh user.

## 11. Known issues
- Tanpa migrasi (`theme_id`), pilihan tema tidak tersimpan — dashboard menampilkan pesan jelas, toko tetap Klasik.
- Pilihan warna aksen tidak berlaku di 8 tema engine (disengaja — tiap tema punya palet sendiri, ada catatan kuning di dashboard; aksen tetap dipakai tampilan Klasik).
- Audit hardcode (2 Okt): bersih — tidak ada nama/kota/harga contoh di `src/storefront/` (hanya disebut di komentar sebagai yang dibuang). Responsif: semua tema satu komponen fluid (sidebar menumpuk di HP, grid menciut 4→2→1, tab scroll horizontal, tanpa lebar fix); tetap wajib cek manual 375px & 1440px.

## 12. Perlu review manusia — DAFTAR MANUAL (belum ada yang di-setup)
Jalankan berurutan (cukup sekali):
1. `npm install` (kalau belum) — butuh dependency `qrcode`, `supabase`, dll.
2. Buat file `.env` dari `.env.example`, isi `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (dari dashboard Supabase).
3. Di Supabase SQL Editor, jalankan berurutan:
   a. `database/schema.sql` (tabel utama + RLS dasar)
   b. `database/migrate_fase5_theme.sql` (tabel `store_theme`)
   c. `database/migrate_fase5_theme_id.sql` (kolom pilihan tema — tanpa ini pilihan tema tak tersimpan)
   d. Migrasi lain sesuai fitur yang dipakai: `migrate_profiles_media.sql` (foto toko), `migrate_storage.sql` (bucket gambar), `migrate_fase3*.sql` + `migrate_bio_link_clicks.sql` (checkout & klik), `migrate_discount_created_at.sql` (diskon), `migrate_traffic.sql` (analitik)
4. Di Vercel: set env `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public) + secret server (`SUPABASE_SERVICE_ROLE_KEY`, BuatQris) hanya di server functions.
5. Tes manual: daftar → isi profil toko → tambah 2 produk → halaman Tampilan: pilih tiap tema → Simpan → buka `tokolink.store/s/{slug}` di HP (375px) & desktop → tambah produk → checkout → bayar (sandbox).
6. Lampu hijau berikutnya: hapus/arsipkan folder `desain_toko_seller/` (sumber desain, tidak dipakai production)? — putuskan dulu, jangan hapus diam-diam.
