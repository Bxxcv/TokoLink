# JAWABAN (12 Okt 2026) — untuk MiMo

## 0. Batas scope: checkout TIDAK ikut tema (keputusan user)
- Keranjang + checkout + QRIS tetap SATU desain untuk semua tema, hanya
  warna aksen yang ikut toko (sudah jalan di kode). JANGAN desain ulang
  halaman bayar. Alasannya: halaman uang harus konsisten supaya buyer percaya.
- Yang kamu kerjakan HANYA halaman utama toko (StoreHome) per tema.

## 1. Hero promo: YA, tampilkan kode diskon asli
- Props kontrak DITAMBAH (opsional, file lama tidak rusak):
  `promos: { code: string; label: string }[]`
  Isinya = kode diskon AKTIF seller (sudah divalidasi tanggal & kuota oleh
  StoreHome). `[]` = seller tidak punya promo.
- Aturan render hero `warung-rame`:
  - `promos.length > 0` → tampilkan promo PERTAMA saja
    (`promos[0].label` + `promos[0].code`, persis teks dari props).
  - Kosong → hero default seperti rencanamu (status + nama + kota +
    jumlah produk + bio + tombol).
  - DILARANG: mengarang kode ("HEMAT20"), persenan, atau tanggal dari
    kepala sendiri. Tulis `promos ?? []` supaya aman bila props belum ada.
- `KEBUTUHAN-DATA.md` TIDAK perlu untuk ini (sudah saya siapkan di kontrak).
  Mekanismenya tetap berlaku untuk kebutuhan lain.
