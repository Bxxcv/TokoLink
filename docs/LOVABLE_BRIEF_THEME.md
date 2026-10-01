# Brief untuk Lovable — Tema & Susunan Katalog TokoLink

Tujuan: desain ulang sistem tema toko (saat ini cuma ganti 1 warna aksen
ke semua halaman — terlalu dangkal) dan susunan katalog produk, supaya
tiap tema terasa beda secara desain, bukan cuma beda warna tombol.

**Konteks produk** (baca `docs/PRD.md` kalau perlu lebih lengkap):
TokoLink = link-in-bio + toko online untuk UMKM Indonesia. Pembeli
mayoritas buka dari HP. Seller awam desain — tema harus tetap gampang
dipakai, bukan butuh keahlian desain buat hasil bagus.

## Yang perlu didesain ulang
1. **3-4 preset tema** (bukan cuma preset warna) — tiap preset beda di:
   - Tipografi judul (mis. tema "Minimal" pakai sans netral, tema
     "Hangat/Homey" pakai font sedikit lebih personal/rounded)
   - Bentuk kartu produk (sudut tajam vs rounded, border vs shadow)
   - Layout grid (2 kolom rapat vs kartu lebih besar dengan nafas)
   - Aksen dekoratif kecil (garis pembatas, badge kategori) — bukan cuma
     warna tombol beda
2. **Susunan katalog** — alternatif tampilan selain grid polos:
   - Kategori sebagai tab horizontal yang bisa discroll (bukan cuma
     baris chip kecil)
   - Opsi "unggulan" (featured) untuk 1-2 produk yang seller pin di atas
   - State kosong yang lebih menarik untuk toko baru (belum ada produk)

## Batasan teknis (wajib dipatuhi hasil desainnya)
- Framework tetap **React + Tailwind** (Vite project yang sudah ada) —
  Lovable cukup hasilkan desain visual (gambar/kode komponen contoh),
  BUKAN mengoper seluruh app
- Semua teks harga/produk/kategori di desain HARUS ditandai jelas
  sebagai **placeholder** (agent yang sambungkan ke data asli sesudahnya
  — lihat `AGENTS.md` aturan #9, jangan sampai hasil Lovable dipakai
  mentah dengan data contoh)
- Mobile-first: desain utama untuk ~375px lebar, baru turunan ke desktop
- Warna brand yang sudah ada (jangan diganti total, boleh dikembangkan):
  `--color-brand-500: #1b9ae0` (cyan), navy `#0b2e6e` sebagai gelap,
  lihat `src/index.css` untuk token lengkap

## Output yang diharapkan dari Lovable
- Preview visual tiap preset tema (gambar/screenshot cukup)
- Kalau Lovable bisa ekspor kode komponen React+Tailwind, itu lebih
  bagus (mempercepat porting), tapi gambar desain saja juga oke —
  nanti di-translate manual ke kode yang sudah ada

## Setelah Lovable selesai
Hasil desain (gambar atau kode) di-review user dulu sebelum masuk task
`.opencode/TASKS.md`. Agent yang mengerjakan integrasi WAJIB baca ulang
`AGENTS.md` aturan #1 (jangan ubah UI di luar yang diminta) dan #9
(data wajib real) sebelum mulai porting.
