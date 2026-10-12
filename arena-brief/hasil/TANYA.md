# TANYA — Revisi Tema Warung Rame (12 Okt 2026)

> TERJAWAB 12 Okt 2026 (lihat `arena-brief/JAWABAN.md` §1): hero MENAMPILKAN
> kode diskon asli via props baru `promos` — sudah dipasang di tema.

## 2. Badge tanpa data (semua tema) — TERJAWAB 12 Okt 2026 (sesi)
> Jawab user: "Badge yang bisa dihitung saja". Dipasang hanya
> Populer/Terlaris (sold tertinggi unik) + cap HABIS/SISA (stok asli).
> Badge Baru/Terverifikasi/HOT/FAVORIT tidak dipasang → dicatat di
> `KEBUTUHAN-DATA.md`.

## 3. Strip promo di tema selain warung-rame — TERJAWAB 12 Okt 2026 (sesi)
> Jawab user: "Ya, tampilkan di semua tema" — tiap tema punya strip promo
> gayanya sendiri, teks 100% dari props `promos`.

## 1. Isi hero promo hijau
Brief minta "hero promo hijau" diambil dari gaya gambar, tapi props tema
tidak punya data promo/diskon sama sekali (yang ada: bio, jam, produk).
- Isi hero SEKARANG: status buka/tutup + nama toko + kota + jumlah produk
  + bio + tombol "Lihat menu". Tanpa angka/kode promo apa pun (tidak boleh
  karangan).
- Pertanyaan: cukup begitu, atau hero juga harus menampilkan kode diskon
  aktif seller (tabel `discount_codes`)? Kalau mau, itu butuh props BARU
  (bukan kolom database baru) — saya tulis di `KEBUTUHAN-DATA.md` setelah
  kamu jawab "ya".
