# BRIEF UNTUK MiMo-V2.6-Flash — Revisi Visual 7 Tema Toko TokoLink

> Bahasa: Indonesia. Baca sampai habis sebelum menulis 1 baris kode pun.
> Kalau ada yang tidak jelas: TULIS pertanyaan di `TANYA.md`, JANGAN menebak.

## 1. Konteks (1 menit)

TokoLink = 1 halaman toko per seller (link-in-bio + katalog + checkout QRIS).
Arsitektur TEMA sudah jadi dan TIDAK BOLEH diubah:

- `src/storefront/types.ts` = KONTRAK (daftar props). Final, jangan diedit.
- `src/storefront/themes/*.tsx` = 7 file yang kamu REVISI visualnya (lihat §3).
- `src/storefront/registry.ts`, `index.ts`, tema `klasik`, `kopi-sore.tsx` = JANGAN disentuh.
- Data 100% dari Supabase via `StoreHome`. Tema TIDAK query database.

## 2. Bentuk serahan (wajib persis)

Di folder `arena-brief/hasil/` taruh **7 file `.tsx`**, nama file SAMA dengan file lama:

```
warung-rame.tsx  kopi-sore.tsx → JANGAN dikirim (tidak ada revisi)
butik-rapi.tsx   jasa-kilat.tsx     dapur-ngebul.tsx
kriya-asli.tsx   digital-kilat.tsx  konsultan-tenang.tsx
```

Plus 1 file `CATATAN.txt`: tiap tema 3 baris — (a) warna utama yang dipakai,
(b) bagian gambar yang kamu ambil, (c) bagian gambar yang SENGAJA tidak
diambil + alasannya 1 kalimat.

Aturan file:
- Export dengan nama SAMA seperti file lama (`export function WarungRame ...
  `, dst — lihat `index.ts`), terima SATU argumen: props `ThemeStorefrontProps`.
- Boleh `useState`/`useMemo` untuk tampilan. DILARANG: `supabase`, `fetch`,
  `auth`, `localStorage`, `window.location`, `innerHTML`/
  `dangerouslySetInnerHTML`.
- Import yang BOLEH: `../../lib/format` (`rupiah`), `../../components/ui`
  (`Icon`), `../../lib/links` (`iconForLink`), `./shared`, `../types`.
  Selain itu DILARANG (termasuk library baru, font loader, CSS file baru —
  pakai class Tailwind + style inline seperti file lama).
- Semua teks Indonesia. Harga SELALU lewat `rupiah(n)` (jangan format sendiri).
- Mobile dulu: wajib rapi di 375px DAN 1440px. Tanpa scroll horizontal halaman.

## 3. Petakan gambar → tema (yang diambil vs yang DIBUANG)

Prinsip: ambil GAYA-nya (warna, kartu, hero, badge), buang FITUR-nya yang
tidak ada di TokoLink. Setiap tema WAJIB tetap punya: header toko (nama,
kota, badge Buka/Tutup dari `openNow`), kolom cari + filter kategori
(`q`/`onQ`, `cats`/`cat`/`onCat`), kartu produk (foto, nama, `rupiah(price)`,
stok: `stock===0` tampil HABIS dan tombol mati, tombol Tambah → `onAdd(p)`),
tautan bio (`bioLinks` + `onOpenBioLink`), jam toko (`hourRows`), tombol
bagikan (`onShare`), QR (`qrData`, `onOpenQR`), footer "tokolink.store",
bilah keranjang (`cartCount`, ke `/cart`). Kalau `closed` true: tampilkan
banner "Toko tutup" dan MATIKAN semua tombol Tambah.

1. `IMG-...-WA0001.jpg` (Pasar Rapi) → `warung-rame.tsx`. AMBIL: grid rapat,
   kartu putih aksen hijau, hero promo hijau. BUANG: header Masuk/Keranjang/
   Daftar Pesanan, filter merek + slider harga + pagination, semua angka
   (1.284 produk, 210, 2,1rb terjual…), tulisan "Gratis ongkir", "Gudang…".
2. `IMG-...-WA0002.jpg` (Lugas Jasa) → `jasa-kilat.tsx`. AMBIL: kartu jasa
   + badge (Populer/Terverifikasi/Baru) + tombol Pesan=Tambah. BUANG: nav
   Beranda/Layanan/Harga/Cara Pesan, tombol Daftar, statistik (10.000+,
   4.8/5, 24/7), filter lokasi + slider harga, langkah "Cara Pesan".
3. `IMG-...-WA0003.jpg` (Atelier) → `butik-rapi.tsx`. AMBIL: lookbook
   gelap-emas, badge BESTSELLER/NEW/LIMITED. BUANG: seluruh nav Inggris,
   kotak followers/rating, SEMUA teks Inggris → tulis Indonesia.
4. `IMG-...-WA0004.jpg` (Dapur) → `dapur-ngebul.tsx`. AMBIL: papan menu
   merah-kuning, badge BESTSELLER/HOT/FAVORIT. BUANG: Masuk/Daftar,
   Flash Sale, "Gratis Ongkir", rating (1.2K), "Pesan Cepat Antar Kilat…".
5. `IMG-...-WA0005.jpg` (Kriya) → `kriya-asli.tsx`. AMBIL: biru-emas,
   blok cerita pembuat, chip kategori. BUANG: nav Inggris, newsletter
   email, "Free Shipping", SEMUA teks Inggris → Indonesia.
6. `IMG-...-WA0006.jpg` (Pixel) → `digital-kilat.tsx`. AMBIL: terminal
   gelap neon cyan. BUANG: header Wishlist/Cart/Account, bar followers/
   rating, Flash Sale countdown, logo Visa/Mastercard/Gopay.
7. `IMG-...-WA0007.jpg` (Studio Tenang) → `konsultan-tenang.tsx`. AMBIL:
   krem minimalis, serif lembut. BUANG: nav + subdomain, bar shipping/
   returns, harga `$`, SEMUA teks Inggris → Indonesia.

## 4. Data: yang BOLEH dipakai (di luar ini = DILARANG tampil)

- Produk: `id, name, cat, price, unit, img, stock, sku, sold, desc`.
- Toko: `storeName, city, bio, avatarUrl, coverUrl, closed, openNow,
  todayHours, hourRows, bioLinks, cartCount, qrData, accent`.
- Rating produk: HANYA dari `ProductRatingBadge`-pola lama (hitung via props
  yang ada — tidak ada data rating di props = JANGAN tampilkan angka rating
  karangan; badge "Terlaris" boleh HANYA kalau `sold` tertinggi, hitung dari
  `allItems`, bukan angka tetap).
- Data kosong (0 produk, tanpa bio, tanpa foto): tampilkan empty state
  sopan, JANGAN isi teks/gambar contoh.

## 5. Database — kerja BERDUA, aturan keras (anti bug & celah tersembunyi)

- Kalau visual butuh data yang TIDAK ADA di §4: JANGAN bikin kolom/tabel/
  query sendiri. Tulis di `arena-brief/KEBUTUHAN-DATA.md` (1 kebutuhan =
  3 baris: untuk bagian apa, data apa, kenapa props sekarang kurang).
  Saya yang buatkan migrasinya + saya yang review.
- Kalau kamu menulis query Supabase (hanya bila diminta susulan): HANYA
  tabel/kolom di `database/schema.sql`; HANYA anon key; tidak pernah
  `service_role`; tulis HANYA lewat RPC yang sudah ada bila menyangkut
  uang/status/hak akses; setiap query cantumkan di `CATATAN.txt` (tabel +
  kebijakan RLS yang melindunginya).
- DILARANG: mengubah `database/`, `api/`, `src/lib/auth.tsx`,
  `src/lib/router.tsx`, file tema lain, dan file di luar
  `arena-brief/hasil/`.

## 6. Alur kerja

1. Kamu taruh 7 file + `CATATAN.txt` (+ `TANYA.md` / `KEBUTUHAN-DATA.md`
   kalau ada) di `arena-brief/hasil/`.
2. User panggil saya. Saya review pakai `REVIEW-CHECKLIST.md` di folder ini.
3. Lolos → saya pasang + sambungkan database + build. Gagal → saya tulis
   revisi di `REVISI.md`, kamu perbaiki filenya.
