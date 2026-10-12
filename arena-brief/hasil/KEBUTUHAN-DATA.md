# KEBUTUHAN-DATA — Revisi 7 Tema (12 Okt 2026)

Aturan brief §5 dipatuhi: tidak ada kolom/tabel/query baru dari saya.
Semua badge di bawah ini SENGAJA tidak dipasang dulu (keputusan user:
"badge yang bisa dihitung saja") sampai props-nya tersedia.

## 1. Badge "Baru / NEW"
- Untuk bagian apa: badge kartu produk (jasa-kilat, butik-rapi,
  dapur-ngebul, kriya-asli, digital-kilat).
- Data apa: tanggal produk masuk — kolom `products.created_at` SUDAH ADA
  di `database/schema.sql`.
- Kenapa props kurang: tipe `Product` di `src/lib/shop.ts` tidak memuat
  `created_at`, jadi StoreHome tidak mengirimnya ke tema.

## 2. Badge "Terverifikasi"
- Untuk bagian apa: badge kartu/kepala halaman jasa-kilat.
- Data apa: status verifikasi penjual — kolom `profiles.status`
  (`aktif`/`belum_verifikasi`) SUDAH ADA di `database/schema.sql`.
- Kenapa props kurang: `ThemeStorefrontProps` tidak membawa status
  profil, dan maknanya ("aktif" = terverifikasi?) belum dikonfirmasi.

## 3. Badge rating / "HOT" / "FAVORIT"
- Untuk bagian apa: badge & garis rating di kartu (dapur-ngebul,
  butik-rapi, digital-kilat — sesuai gambar).
- Data apa: rata-rata rating per produk dari tabel `reviews`
  (RPC `product_reviews` sudah ada, lihat `database/migrate_reviews.sql`).
- Kenapa props kurang: tema tidak menerima rating sama sekali; brief
  §4 melarang angka rating karangan, jadi tidak ditampilkan dulu.
