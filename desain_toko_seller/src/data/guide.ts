export const guide = `# TokoLink — Paket Desain Tema Storefront Seller
Edisi 01 · 8 tema · 26 PNG + 1 berkas panduan

## 1. Filosofi visual
Koleksi ini disusun sebagai **editorial spec book**: kertas offset hangat (#F4F1E9), tinta gelap (#16150F), dan satu aksen vermilion (#B23A22) yang hanya dipakai untuk nomor pelat, penanda, dan state. Referensi utamanya adalah pelat spesifikasi cetak — nomor pelat, garis rambut, dan kolom anotasi monospasi di margin kiri.

Prinsip yang dipegang:
1. **Tema adalah komposisi, bukan palet.** Delapan tema berbeda pada struktur halaman, kepadatan, rasio foto, bentuk kartu, garis, bayangan, navigasi, dan pasangan font — bukan sekadar warna aksen.
2. **Data TokoLink tetap hadir di semua tema**: profil toko, jam buka, kategori, produk + harga rupiah, WhatsApp, QRIS, pengambilan (pickup), dan keranjang.
3. **Satu tema gelap saja.** Pixel Goods memakai latar grafit karena pembeli produk digital membandingkan spesifikasi; tema lain tetap terang.
4. **Tanpa slop visual.** Tidak ada glassmorphism, gradient orb, pil berlebihan, kartu bersarang, ikon dekoratif tanpa fungsi, atau grid kartu rounded identik.
5. **Bahasa Indonesia, rupiah.** Semua teks antarmuka berbahasa Indonesia; harga memakai format Rp78.000.

## 2. Matriks pembeda
| No | Tema | Komposisi | Font | Rasio foto | Kepadatan |
|----|------|-----------|------|-----------|-----------|
| 01 | Ruang Seduh | dua kolom + ledger item | Fraunces / IBM Plex Sans | 4:5 + pita 3:1 | sedang |
| 02 | Pasar Rapi | grid 4 kolom rapat | Archivo / IBM Plex Mono | 1:1 | tinggi |
| 03 | Lugas Jasa | rail kategori + tabel layanan | IBM Plex Sans / Mono | tanpa hero | tinggi-rata |
| 04 | Atelier | galeri 2 kolom asimetris | Instrument Serif / Archivo | 4:5 | rendah |
| 05 | Dapur Hari Ini | papan menu berpoin | Bricolage Grotesque / Plex Sans | 3:2 | sedang-tinggi |
| 06 | Kriya Nusantara | masonry 12 kolom | Fraunces / IBM Plex Sans | campuran | rendah-sedang |
| 07 | Pixel Goods | baris spesifikasi + ringkasan | Space Grotesk / Plex Mono | 16:9 | tinggi |
| 08 | Studio Tenang | satu kolom measure 640 px | Newsreader / Archivo | 3:2 | rendah |

## 3. Aturan implementasi
- Setiap tema mengekspor token: paper, panel, ink, inkSoft, line, accent, accentInk, ok, radius, border, shadow, pad, gap, cols, ratio, display, body, mono.
- Tipografi: pasangan font diambil dari Google Fonts; angka harga selalu font-variant-numeric: tabular-nums.
- State wajib empat: aktif, hover, fokus, kosong. Fokus minimal outline 2 px dengan offset 3 px.
- Grid: seluruh artboard desktop dibuat pada lebar asli 1440 px, mobile pada 390 px; jangan men-skalakan ulang nilai spesifikasi.
- Rasio foto dipertahankan (object-fit: cover) agar komposisi tidak pecah.
- Aksen dipakai maksimal untuk tiga hal per layar agar tema tidak kehilangan titik fokus.

## 4. Indeks berkas
    00-cover-index.png                — sampul dan indeks koleksi
    01-ruang-seduh-desktop-1440.png   — storefront desktop tema 01
    01-ruang-seduh-mobile-390.png     — adaptasi 390 px tema 01
    01-ruang-seduh-spec-board.png     — papan spesifikasi tema 01
    ...diulang untuk 02 sampai 08
    25-contact-sheet.png              — perbandingan 8 tema
    26-guide.md                       — berkas ini

Total 26 PNG + 1 Markdown.

## 5. Batas pekerjaan
- Tidak mengubah repositori maupun situs TokoLink.
- Tidak menulis kode frontend/backend dan tidak mengimplementasikan pemilih tema.
- Keluaran berupa aset desain (pelat PNG) dan panduan visual untuk AI/developer implementor.
`;
