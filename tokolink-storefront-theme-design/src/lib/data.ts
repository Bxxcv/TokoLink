export type LinkKind = "wa" | "ig" | "tiktok" | "fb" | "link";

export interface BioLink {
  label: string;
  url: string;
  kind: LinkKind;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  desc: string;
  photo?: string;
}

export interface DayHour {
  day: string;
  range: string | null;
}

export interface Store {
  name: string;
  slug: string;
  city: string;
  bio: string;
  logoText: string;
  coverPhoto?: string;
  open: boolean;
  today: string;
  todayHours: string;
  hours: DayHour[];
  todayIndex: number;
  links: BioLink[];
  products: Product[];
  cartStart: number;
}

export type LayoutKind = "grid2" | "editorial" | "vertical" | "rows" | "menu" | "story" | "dense" | "single";

export interface ThemeDef {
  n: number;
  name: string;
  mood: string;
  sasaran: string;
  palette: { bg: string; surface: string; text: string; muted: string; accent: string };
  onAccent: string;
  badges: { buka: string; tutup: string; habis: string; sisa: string };
  fonts: {
    display: string;
    body: string;
    displayStack: string;
    bodyStack: string;
  };
  metrics: { radius: string; photo: string; gap: string; button: string };
  layout: LayoutKind;
  cover: "full" | "half" | "none";
  store: Store;
  spec: {
    header: string;
    profile: string;
    links: string;
    hours: string;
    filter: string;
    card: string;
    states: string;
    qr: string;
  };
  compliance: string[];
  ascii: string;
}

const px = (id: number, tag = "pexels-photo") =>
  `https://images.pexels.com/photos/${id}/${tag}-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=760&w=760`;

const portrait = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1180&w=880`;

const wide = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=560&w=1180`;

const days = (ranges: (string | null)[]): DayHour[] =>
  ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day, i) => ({
    day,
    range: ranges[i],
  }));

/* ================================ TEMA ================================ */

export const THEMES: ThemeDef[] = [
  /* ------------------------------------------------ 1 — WARUNG RAME */
  {
    n: 1,
    name: "Warung Rame",
    mood: "Pasar pagi: ramai, rapat, ramai tapi rapi",
    sasaran: "Kuliner harian — pembeli ibu rumah tangga & pekerja yang beli buat angkut",
    palette: { bg: "#FFF7EC", surface: "#FFFFFF", text: "#21170F", muted: "#6B5B4C", accent: "#C2380A" },
    onAccent: "#FFFFFF",
    badges: { buka: "#177C46", tutup: "#C0261E", habis: "#8A8178", sisa: "#A97400" },
    fonts: {
      display: "Bricolage Grotesque 700/800",
      body: "Plus Jakarta Sans 400/500/700",
      displayStack: '"Bricolage Grotesque", "Trebuchet MS", ui-sans-serif, system-ui, sans-serif',
      bodyStack: '"Plus Jakarta Sans", "Segoe UI", ui-sans-serif, system-ui, sans-serif',
    },
    metrics: { radius: "kartu 14px, foto 10px, tombol 12px", photo: "1:1 (aset penuh kartu)", gap: "8px", button: "48px" },
    layout: "grid2",
    cover: "full",
    store: {
      name: "Warung Bu Ida",
      slug: "warung-bu-ida",
      city: "Kota Bandung",
      bio: "Nasi uduk, sambal goreng, dan lauk harian. Masak pagi, biasanya habis sebelum jam 3 sore. Pesan sebelum 10.00 untuk angkut 11.00.",
      logoText: "BI",
      coverPhoto: wide(12287090),
      open: true,
      today: "Jumat",
      todayHours: "08.00–15.00 WIB",
      todayIndex: 4,
      hours: days(["08.00–15.00", "08.00–15.00", "08.00–15.00", "08.00–15.00", "08.00–15.00", "08.00–13.00", null]),
      links: [
        { label: "Chat & tanya lauk hari ini", url: "https://wa.me/6281200000001", kind: "wa" },
        { label: "Menu harian di Instagram", url: "https://instagram.com/warungbu.ida", kind: "ig" },
        { label: "Video dapur", url: "https://tiktok.com/@warungbu.ida", kind: "tiktok" },
        { label: "Halaman Facebook", url: "https://facebook.com/warungbu.ida", kind: "fb" },
        { label: "Lokasi warung", url: "https://maps.google.com/?q=warung+bu+ida", kind: "link" },
      ],
      products: [
        {
          id: "p1",
          name: "Nasi Uduk Komplet + Orek Tempe",
          category: "Nasi",
          price: 18000,
          stock: 12,
          sku: "WRG-NSI-01",
          desc: "Nasi uduk, orek tempe, telur balado, kerupuk.",
          photo: px(343871),
        },
        {
          id: "p2",
          name: "Nasi Campur Ayam Bakar",
          category: "Nasi",
          price: 24000,
          stock: 5,
          sku: "WRG-NSI-09",
          desc: "Ayam bakar ungkep, sambal dadak, lalapan.",
          photo: px(37107035),
        },
        {
          id: "p3",
          name: "Nasi Goreng Kampung Telur Bebek",
          category: "Nasi",
          price: 22000,
          stock: 0,
          sku: "WRG-NSI-07",
          desc: "Bumbu terasi, telur bebek setengah matang.",
          photo: px(19802119),
        },
        {
          id: "p4",
          name: "Sambal Goreng Ati Ampela (toples 250 g)",
          category: "Lauk",
          price: 26500,
          stock: 3,
          sku: "WRG-LAK-04",
          desc: "Pedas sedang, tahan 5 hari di kulkas.",
          photo: px(33356138),
        },
        {
          id: "p5",
          name: "Es Buah Serut Susu",
          category: "Minuman",
          price: 12000,
          stock: 18,
          sku: "WRG-MNM-02",
          desc: "Cup 350 ml, susu kental manis manis.",
          photo: px(9557122),
        },
        {
          id: "p6",
          name: "Kerupuk Udang 100 g",
          category: "Cemilan",
          price: 9000,
          stock: 40,
          sku: "WRG-CML-01",
          desc: "Kemasan standing pouch, buat oleh-oleh.",
          photo: px(37106473),
        },
      ],
      cartStart: 2,
    },
    spec: {
      header:
        "Tinggi 56px, latar permukaan #FFFFFF dengan garis bawah 1px #21170F/10%, sticky di atas. Urut kiri→kanan: avatar logo 36px bulat (inisial/ logo toko) | nama toko 17px Bricolage 800 di baris 1 + kota 12px warna redup di baris 2 | kluster kanan: badge BUKA/TUTUP (pil 22px), ikon QR 44×44, ikon Bagikan 44×44, tombol Keranjang 44×44 dengan hitungan oranye. Baris kedua header khusus HP (360px): teks jam hari ini 12px rata kiri + dot hijau berkedip; di ≥760px semua muat 1 baris dan jam ikut di samping badge.",
      profile:
        "Sampul FULL: foto 152px lebar-penuh (rasio 16:6), object-fit cover, tanpa overlay. Langsung di bawahnya kartu profil menempel (margin-top -18px, radius 14px): bio 14px/1.55 maksimal 4 baris lalu potongan “selengkapnya” (bukan teks karangan). Kalau bio kosong: kartu hanya berisi kota + “N produk di katalog” (dihitung dari katalog, bukan angka promosi). Tidak ada rating, tidak ada jumlah terjual.",
      links:
        "5 tautan → blok “Ikuti / hubungi” isi penuh: baris list tinggi 52px, ikon otomatis 24px di lingkaran 36px, label 14px 1 baris, URL 12px warna redup terpotong elipsis, panah kanan. Baris WA memakai garis kiri 3px hijau WA (secondary, bukan tombol besar). 0 tautan = blok hilang total.",
      hours:
        "Baris “Jam buka” (ikon alarm, 44px) membuka panel 7 baris: nama hari 13px, rentang jam rata-kanan tnum, hari ini ditandai latar aksen #C2380A/8% + titik. Tutup = teks “Tutup” warna merah #C0261E. Panel tidak menutupi konten, hanya mendorong ke bawah.",
      filter:
        "Sticky di bawah header (top: 56px), latar #FFF7EC dengan blur 6px. Baris 1: kolom cari tinggi 48px, radius 12px, ikon kaca pembesar, tombol ×(clear) hanya muncul saat ada teks. Baris 2: chip kategori geser horizontal — “Semua” + kategori asli toko, tiap chip menampilkan jumlah item; chip aktif latar aksen, teks #FFFFFF. Kanan atas chip: tombol “Atur ulang” teks 13px, redup, hanya aktif kalau filter sedang kotor.",
      card:
        "Grid 2 kolom @360px (lebar kartu 166px), 3 kolom @760px, 4 kolom @1100px. Kartu: foto 1:1 radius 10px mengisi lebar, cap HABIS/SISA N menempel di pojok kiri-bawah foto. Isi kartu padding 10px: nama 13px 700 maksimal 2 baris, kategori 11px redup uppercase, harga 15px aksen 800 tnum (Rp18.000), tombol “Tambah” tinggi 40px latar aksen teks putih radius 12px lebar penuh; di HP area sentuh dipanjangkan jadi 48px dengan padding. Hanya 1 foto per produk — tanpa titik galeri, tanpa carousel.",
      states:
        "Toko TUTUP: seluruh tombol ganti teks jadi “Toko tutup”, latar #EFE9E0, teks #8A8178, cursor not-allowed, dan harga kartu sedikit dipudarkan (opacity .72); header menampilkan badge TUTUP merah + jam buka berikutnya. Stok 0: tombol digantikan bidang non-interaktif “Stok habis” (abu #8A8178/12%, teks #6E6357) + cap HABIS merah-abu di foto; foto tidak di-blur penuh supaya produk tetap terbaca. Katalog kosong: ilustrasi 120px (tali daun + piring kosong, garis tunggal) + “Belum ada menu hari ini” + “Tambahkan produk lewat dasbor TokoLink”. Hasil cari nol: ilustrasi sama + kalimat kueri + tombol “Atur ulang filter” yang benar-benar mereset.",
      qr:
        "Ikon QR di header membuka modal bawah (bottom sheet, tinggi 62%): QR 190px di tengah dengan caption “Pindai untuk buka etalase ini”, di bawahnya tombol “Unduh QR (PNG 1024px)” latar aksen, dan tautan etalase teks pendek. Di desktop (≥1100px) QR juga tampil permanen di kartu samping kanan kolom pertama, ukuran 128px, dengan tombol unduh ikon.",
    },
    compliance: [
      "Tidak ada angka karangan: yang muncul hanya nama toko, kota, bio, jam, jumlah kategori, jumlah item katalog, dan harga/stok/SKU per produk.",
      "Satu-satunya CTA beli = “Tambah” (keranjang → QRIS). Baris WA diberi label “tanya lauk hari ini”, gaya outline, tinggi 44px — lebih rendah dari tombol aksen.",
      "Field yang digambar = field yang tersedia. Tidak ada rating, badge Premium, label “terlaris”, atau galeri.",
      "Mode TUTUP mematikan semua tombol Tambah dan mengganti labelnya menjadi “Toko tutup” + badge merah di header.",
      "Diuji di 360px: tidak ada scroll horizontal halaman; hanya baris chip kategori yang bisa digeser, dengan padding 12px dan scroll-snap.",
    ],
    ascii: `┌──────────────────────────┐
│ ◉ Warung Bu Ida    ▣ ⤴ 🛒2│
│   Kota Bandung  ●Buka     │
├──────────────────────────┤
│ ░░░░ sampul 152px ░░░░░░ │
├──────────────────────────┤
│ Nasi uduk & sambal goreng│
│ harian. Masak pagi…      │
├──────────────────────────┤
│ WA  Chat & tanya lauk  › │
│ IG  Menu harian        ›  │
│ TT  Video dapur         ›  │
├──────────────────────────┤
│ ⏰ Jam buka · Jumat 08–15  │
├──────────────────────────┤
│ [🔍 cari nama produk  ⨯ ] │
│ (Semua 6)(Nasi 3)(Lauk 1)│      ↻ atur ulang
├────────────┬─────────────┤
│ ▣▣▣▣▣▣▣▣  │ ▣▣▣▣▣▣▣▣    │
│            │ [HABIS]      │
│ Nasi Uduk  │ Nasi Goreng  │
│ NASI       │ KAMPUNG      │
│ Rp18.000   │ Stok habis   │
│[ Tambah ]  │[───────]     │
├────────────┴─────────────┤
│ Warung Bu Ida · Bandung  │
│   Dibuat dengan TokoLink │
└──────────────────────────┘`,
  },

  /* ------------------------------------------------ 2 — KOPI SORE */
  {
    n: 2,
    name: "Kopi Sore",
    mood: "Editorial tenang, ruang putih, tempo lambat",
    sasaran: "Kopi & bakery artisan — pembeli yang membaca deskripsi sebelum beli",
    palette: { bg: "#F1EDE4", surface: "#FFFFFF", text: "#241E1A", muted: "#6E635A", accent: "#1F4D3F" },
    onAccent: "#FFFFFF",
    badges: { buka: "#17703F", tutup: "#A63229", habis: "#8C857C", sisa: "#8F6A0B" },
    fonts: {
      display: "Instrument Serif 400",
      body: "Karla 400/500/600",
      displayStack: '"Instrument Serif", "Iowan Old Style", Georgia, serif',
      bodyStack: '"Karla", "Helvetica Neue", ui-sans-serif, system-ui, sans-serif',
    },
    metrics: { radius: "kartu 4px, tombol 2px", photo: "4:5", gap: "18px", button: "46px" },
    layout: "editorial",
    cover: "half",
    store: {
      name: "Sore Roastery",
      slug: "sore-roastery",
      city: "Kotagede, Yogyakarta",
      bio: "Roaster kecil di Kotagede. Sangrai tiap Selasa dan Jumat, dikirim dalam 14 hari setelah sangrai. Tampung biji sisa di jar sendiri.",
      logoText: "SR",
      coverPhoto: wide(12176271),
      open: true,
      today: "Jumat",
      todayHours: "10.00–19.00 WIB",
      todayIndex: 4,
      hours: days(["10.00–19.00", "10.00–19.00", "10.00–19.00", "10.00–19.00", "10.00–21.00", "09.00–21.00", "09.00–17.00"]),
      links: [
        { label: "Cerita sangrai di Instagram", url: "https://instagram.com/sore.roastery", kind: "ig" },
        { label: "Katalog & catatan seduh", url: "https://sore-roastery.example.id", kind: "link" },
      ],
      products: [
        {
          id: "p1",
          name: "Gayo Wine — Natural, 150 g",
          category: "Biji",
          price: 78000,
          stock: 6,
          sku: "SRE-BJI-011",
          desc: "Anggur merah, cokelat susu. Sangrai 4 hari lalu. Untuk V60.",
          photo: px(6166474),
        },
        {
          id: "p2",
          name: "Sore Espresso Blend — 200 g",
          category: "Biji",
          price: 92000,
          stock: 0,
          sku: "SRE-BJI-004",
          desc: "Cokelat hitam, karamel. Gilingan espresso, sisa stok minggu depan.",
          photo: px(14111071),
        },
        {
          id: "p3",
          name: "Cold Brew Botol 250 ml",
          category: "Botolan",
          price: 34000,
          stock: 9,
          sku: "SRE-BTL-002",
          desc: "Seduh 18 jam, tanpa gula. Sebaiknya habis dalam 5 hari dingin.",
          photo: px(20500107),
        },
        {
          id: "p4",
          name: "Croissant Butter Almond",
          category: "Pastry",
          price: 28000,
          stock: 2,
          sku: "SRE-PAS-007",
          desc: "Butter Wijsman, almond slice panggang pagi.",
          photo: px(13439075),
        },
        {
          id: "p5",
          name: "V60 Dripper Keramik Glasir Abu",
          category: "Alat",
          price: 145000,
          stock: 1,
          sku: "SRE-ALT-001",
          desc: "Diameter 100 mm, muat 1–2 cangkir. Tanpa filter kertas.",
          photo: px(20212456),
        },
      ],
      cartStart: 0,
    },
    spec: {
      header:
        "Header tanpa garis pemisah — menyatu dengan latar halaman supaya editorial terasa lega (HP: 64px, 1 baris). Avatar 34px kotak radius 4px, nama toko 20px Instrument Serif normal (bukan tebal), kota 11px Karla 500 huruf besar jarang (tracking .14em) warna redup. Kanan: BUKA/TUTUP berupa teks 11px + titik 6px (bukan pil), lalu ikon QR, Bagikan, Keranjang 44×44 tanpa latar — hanya garis bawah 1px saat aktif. Nomor keranjang = lingkaran 16px isi pinus #1F4D3F, teks putih.",
      profile:
        "Sampul HALF: foto 216px di bagian atas dengan 34% bawah tertutup kartu profil (radius atas 4px, latar #FFFFFF). Bio 15px/1.7 warna teks utama maksimal 3 baris, di bawahnya “Read more” teks garis-bawah halus. Tanpa bio → hanya kota + jumlah produk, kartu menyusut jadi 2 baris. Tidak ada kutipan testimoni atau angka penjualan.",
      links:
        "2 tautan → blok “Catatan & kanal”: dua baris teks 14px dengan pemisah hairline 1px #241E1A/10%, ikon 18px di depan, panah geser 4px saat hover. Gaya tipografis (tanpa kartu) supaya tidak bersaing dengan harga. Kalau 0 tautan: blok tidak digambar dan jarak antar-blok otomatis ditutup 8px.",
      hours:
        "Selalu tampil sebagai 1 baris tabel mikro: “Jumat 10.00–19.00” + teks “7 hari ›” yang membuka daftar vertikal 7 baris dengan garis putus-putus ala menu (dot leader), hari ini bold, hari tutup redup.",
      filter:
        "Di atas katalog (tidak sticky di HP supaya editorial terasa lega; sticky di ≥760px). Kolom cari: garis bawah 1px saja, tanpa kotak, placeholder “cari biji, pastry, alat…”, tinggi 44px. Kategori = daftar teks horizontal dengan pemisah “/”, item aktif digaris-bawahi 2px warna aksen. Tombol “reset” berupa teks kecil di kanan yang hilang saat filter bersih.",
      card:
        "1 kolom @360px, 2 kolom @820px, 3 kolom @1200px dengan gap 18px. Kartu: foto 4:5 mengisi lebar (tinggi 420px @360px) radius 4px, tanpa border; di bawah foto: kategori 11px uppercase redup, nama 18px Instrument Serif 1 baris, deskripsi 13px redup 2 baris, lalu baris harga: harga 17px Karla 600 tnum warna aksen di kiri + status stok teks 12px di kanan (“Sisa 2” kuning #8F6A0B). Tombol “Tambah ke keranjang” teks 13px + panah, latar aksen penuh, tinggi 46px, radius 2px, lebar penuh, huruf kecil biasa (bukan caps) — satu-satunya elemen berwarna pekat di kartu.",
      states:
        "TUTUP: tombol jadi “Toko tutup — buka Jumat 10.00” latar #E7E2D9 teks #8C857C, tidak bisa ditekan; seluruh harga tetap tampil (transparansi). Stok 0: foto tetap penuh warna (tanpa grayscale), cap teks “Habis” 12px huruf jarang warna #8C857C di sebelah kategori, tombol berubah jadi garis luar putus-putus “Stok habis” non-interaktif + tautan sekunder “tanya restock” bila ada WA/IG. Katalog kosong: blok setinggi 280px berisi gambar cangkir garis tunggal 96px + “Belum ada yang kami sangrai minggu ini”. Nol hasil: “Tidak ada “{kueri}” di katalog. Coba kata lain” + tombol teks atur ulang.",
      qr:
        "Di dalam footer, kartu QR selebar 260px di tengah dengan caption “Buka etalase ini di HP lain”, QR 168px, dan tombol garis luar “Unduh PNG”. Ikon QR di header membuka sheet tipis (320px) yang hanya menampilkan QR + tombol unduh — tanpa latar blur berlebihan.",
    },
    compliance: [
      "Yang dipakai hanya field yang ada; bio dipotong 3 baris dengan “Read more”, tidak ada kalimat promosi tambahan.",
      "Tidak ada tautan WA di data toko, jadi tidak ada tombol WA sama sekali — CTA “tanya restock” memakai Instagram yang memang tersedia.",
      "Satu foto per produk, tanpa indikator galeri; tidak ada angka stok di luar angka katalog.",
      "Status TUTUP mengubah label + mematikan tombol dan menampilkan jam buka berikutnya (dari data 7 hari).",
      "Semua blok satu kolom di 360px, target sentuh 44–46px, tanpa scroll horizontal; daftar kategori boleh melar tapi terbungkus wrap.",
    ],
    ascii: `┌──────────────────────────┐
│ SR  Sore Roastery  ▣ ⤴ 🛒 │
│     KOTAGEDE · YOGYAKARTA │
├──────────────────────────┤
│ ░░░░░ foto sampul 216 ░░░ │
│ ┌──────────────────────┐ │
│ │ Roaster kecil di     │ │
│ │ Kotagede… Read more  │ │
│ │ ● Buka · Jum 10–19 7h›│ │
│ └──────────────────────┘ │
│ Catatan & kanal          │
│ — Cerita sangrai      →  │
│ — Katalog & seduh     →  │
├──────────────────────────┤
│ cari biji, pastry…   ↺   │
│ Semua / Biji / Pastry /…  │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │                      │ │
│ │    foto 4:5          │ │
│ │                      │ │
│ └──────────────────────┘ │
│ BIJI · Sisa 6            │
│ Gayo Wine — Natural      │
│ Anggur merah, cokelat…   │
│ Rp78.000                 │
│ [ Tambah ke keranjang → ]│
├──────────────────────────┤
│      ┌── QR ──┐           │
│      │ unduh  │           │
│ Dibuat dengan TokoLink    │
└──────────────────────────┘`,
  },

  /* ------------------------------------------------ 3 — BUTIK RAPI */
  {
    n: 3,
    name: "Butik Rapi",
    mood: "Lookbook vertikal, tempo lambat, kontras wine di atas ivory",
    sasaran: "Fashion — pembeli yang menimbang potongan & ukuran, suka scroll pelan",
    palette: { bg: "#F7F5F2", surface: "#FFFFFF", text: "#16130F", muted: "#5F5951", accent: "#6E2B3D" },
    onAccent: "#FFFFFF",
    badges: { buka: "#1C6B45", tutup: "#9E2B22", habis: "#847E77", sisa: "#8C6A12" },
    fonts: {
      display: "Bodoni Moda 500/700",
      body: "Jost 300/400/500",
      displayStack: '"Bodoni Moda", "Didot", "Times New Roman", serif',
      bodyStack: '"Jost", "Futura", ui-sans-serif, system-ui, sans-serif',
    },
    metrics: { radius: "kartu 0px, foto 0px, tombol 999px", photo: "3:4", gap: "12px", button: "46px" },
    layout: "vertical",
    cover: "none",
    store: {
      name: "Kain Kanan Studio",
      slug: "kain-kanan-studio",
      city: "Jakarta Pusat",
      bio: "Potongan longgar dari kain lokal. Setiap model dijahit dalam tiga ukuran; sisa bahan jadi tote.",
      logoText: "KK",
      open: true,
      today: "Jumat",
      todayHours: "11.00–20.00 WIB",
      todayIndex: 4,
      hours: days(["11.00–20.00", "11.00–20.00", null, "11.00–20.00", "11.00–21.00", "10.00–21.00", "10.00–18.00"]),
      links: [
        { label: "Lookbook & stok masuk", url: "https://instagram.com/kainkanan", kind: "ig" },
        { label: "Video potongan kain", url: "https://tiktok.com/@kainkanan", kind: "tiktok" },
        { label: "Tanya ukuran & bahan", url: "https://wa.me/6281200000003", kind: "wa" },
      ],
      products: [
        {
          id: "p1",
          name: "Kemeja Garis Katun — L",
          category: "Kemeja",
          price: 265000,
          stock: 4,
          sku: "BTS-KMS-02L",
          desc: "Katun poplin 120 g, potongan boxy, lengan dilipit.",
          photo: portrait(13181673),
        },
        {
          id: "p2",
          name: "Celana Denim Longgar 27",
          category: "Bawahan",
          price: 320000,
          stock: 0,
          sku: "BTS-BWH-011",
          desc: "Denim 12 oz kaku, pinggang tinggi, jahitan single needle.",
          photo: portrait(7764608),
        },
        {
          id: "p3",
          name: "Kaos Mint Combed 30s",
          category: "Atasan",
          price: 145000,
          stock: 12,
          sku: "BTS-ATS-019",
          desc: "165 g, kerah rib ganda, warna celup dingin.",
          photo: portrait(34156905),
        },
        {
          id: "p4",
          name: "Tote Kain Sisa Produksi",
          category: "Aksesoris",
          price: 75000,
          stock: 3,
          sku: "BTS-ACS-006",
          desc: "Muat laptop 14\", tali bahu, tiap lembar motifnya beda.",
          photo: portrait(4210864),
        },
      ],
      cartStart: 0,
    },
    spec: {
      header:
        "Header ramping 60px, latar sama dengan halaman (#F7F5F2) tanpa garis pemisah — pemisahan lewat ruang. Avatar 30px lingkaran, nama toko 18px Bodoni Moda, kota 11px Jost redup huruf jarang. Kanan: badge status 10px huruf jarang, dan tiga ikon 44×44 dengan stroke 1.5px (QR, Bagikan, Keranjang). Nomor keranjang ditulis sebagai angka kecil di samping ikon (“· 2”), bukan badge tebal.",
      profile:
        "SAMPUL: TANPA. Tidak ada cover di data toko ini, jadi header langsung menyambung ke blok profil: nama toko besar 30px Bodoni Moda di kiri (HP), bio 14px/1.6 maksimal 3 baris warna teks, dan satu baris “11.00–20.00 · Jumat” warna redup. Dilarang memakai foto stok sebagai cover palsu; kalau seller kelak unggah cover, blok menyisip gambar 4:3 setinggi 240px dengan radius 0.",
      links:
        "3 tautan → 3 kartu kecil rata-kiri (tinggi 56px) dalam satu baris yang membungkus jadi kolom di HP; ikon 20px di atas, label 11px redup di bawah. Gaya “katalog” senyap: garis tepi 1px #16130F/12%, tidak ada warna merek. Baris WA tetap polosan (outline) supaya tombol beli menang.",
      hours:
        "Baris jam 7 hari dalam 2 kolom (hari | jam) dengan hairline pemisah; hari yang tutup menulis “Tutup” warna merah #9E2B22. Ditampilkan dalam accordion “Jam & alamat” yang terbuka hanya saat diklik, tinggi baris pemicu 48px.",
      filter:
        "Satu baris saja di HP: ikon pencarian 46px yang membuka bidang cari full-width (slide-down), lalu di barisnya chip kategori model teks dengan pemisah titik tengah “·”. Chip aktif = teks aksen + underline tipis. Tombol reset muncul sebagai chip “× bersihkan” di akhir daftar hanya ketika filter kotor.",
      card:
        "1 kolom @360px, 2 kolom @760px, 3 kolom @1200px, gap 12px. Kartu tanpa radius & tanpa shadow: foto vertikal 3:4 (24:32) mengisi lebar penuh kartu, nama di bawah foto 15px Bodoni Moda 500 maksimal 2 baris, kategori 10px Jost huruf jarang redup, harga 14px Jost 500 tnum warna aksen di kiri dan stok di kanan. Tombol “Tambah” pil (radius 999) tinggi 46px latar #6E2B3D teks putih, muncul selalu (bukan hanya hover) supaya pembeli HP tidak butuh hover; saat ditekan berubah teks “Ditambahkan ✓” 900ms lalu kembali.",
      states:
        "TUTUP: pil aksen digantikan pil mati “Tutup · buka Sabtu 10.00” latar #EAE6E0 teks #847E77, dan seluruh tombol di halaman ikut mati (satu sumber state, bukan disable per kartu manual). Stok 0: foto diturunkan ke opacity .38 dengan cap “Habis” 11px huruf jarang warna #847E77 di slot stok, tombol jadi non-interaktif “Habis”. Katalog kosong: foto-foto digantikan kanvas garis 16:10 + label “Etalase masih kosong — produk pertama akan tampil di sini”. Nol hasil: daftar kosong + “Tidak ada “{kueri}”. Lihat semua produk” (teks tombol garis bawah).",
      qr:
        "Tombol QR header membuka overlay tengah 300px (kartu putih radius 0, QR 210px, caption, tombol unduh pil outline). Di desktop QR ditempel di pojok kanan bawah halaman sebagai kartu 140px yang menempel pada blok profil, bukan sticky mengambang.",
    },
    compliance: [
      "Cover tidak digambar karena datanya kosong; dijelaskan sebagai blok yang “tampil hanya jika seller unggah”. Tidak ada foto stok palsu.",
      "Tombol WA/IG level outline polosan; CTA beli satu-satunya elemen bewarna pekat di kartu.",
      "Harga/stok/SKU/kategori/deskripsi hanya dari field sah; tanpa badge “terlaris” atau rating.",
      "Toko TUTUP mematikan tombol beli dan menampilkan jam buka berikutnya dari data 7 hari.",
      "1 kolom di 360px, target sentuh 44–46px, chip wrap tanpa scroll horizontal; tombol “Ditambahkan ✓” memberi umpan balik nyata 900ms.",
    ],
    ascii: `┌──────────────────────────┐
│ KK Kain Kanan Studio ▣⤴🛒│
│    JAKARTA PUSAT · ●Buka  │
├──────────────────────────┐
│ Kain Kanan Studio        │
│ Potongan longgar dari    │
│ kain lokal…              │
│ 11.00–20.00 · Jumat      │
├──────────────────────────┤
│ [IG      ][TT     ][WA ] │
├──────────────────────────┤
│ 🔍  Semua · Kemeja ·     │
│    Bawahan · ×bersihkan  │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │                      │ │
│ │    foto 3:4          │ │
│ │                      │ │
│ │                      │ │
│ └──────────────────────┘ │
│ KEMEJA                   │
│ Kemeja Garis Katun — L   │
│ Rp265.000        Sisa 4  │
│      ( Tambah )          │
├──────────────────────────┤
│ Kain Kanan Studio · Jkt  │
│     Dibuat dengan TokoLink│
└──────────────────────────┘`,
  },

  /* ------------------------------------------------ 4 — JASA KILAT */
  {
    n: 4,
    name: "Jasa Kilat",
    mood: "Utilitarian: daftar, kode, angka; nol dekorasi",
    sasaran: "Servis/teknik — pembeli yang datang bawa masalah spesifik & ingin cepat",
    palette: { bg: "#EDF1F4", surface: "#FFFFFF", text: "#0E1721", muted: "#4E5A66", accent: "#0B57D0" },
    onAccent: "#FFFFFF",
    badges: { buka: "#0A7C43", tutup: "#C22B22", habis: "#7C8896", sisa: "#946A00" },
    fonts: {
      display: "IBM Plex Mono 500/600",
      body: "IBM Plex Sans 400/500/600",
      displayStack: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
      bodyStack: '"IBM Plex Sans", "Segoe UI", ui-sans-serif, system-ui, sans-serif',
    },
    metrics: { radius: "kartu 6px, tombol 6px", photo: "16:10 (opsional)", gap: "6px", button: "44px" },
    layout: "rows",
    cover: "none",
    store: {
      name: "Kilat Servis Elektronik",
      slug: "kilat-servis",
      city: "Surabaya",
      bio: "",
      logoText: "KS",
      open: false,
      today: "Jumat",
      todayHours: "Tutup — buka Sabtu 09.00",
      todayIndex: 4,
      hours: days(["09.00–18.00", "09.00–18.00", "09.00–18.00", "09.00–18.00", null, "09.00–14.00", null]),
      links: [
        { label: "Tanya dulu: gejala & merk", url: "https://wa.me/6281200000004", kind: "wa" },
        { label: "Peta workshop", url: "https://maps.google.com/?q=kilat+servis+surabaya", kind: "link" },
      ],
      products: [
        {
          id: "p1",
          name: "Ganti Layar iPhone 11 (OEM copy)",
          category: "Layar",
          price: 725000,
          stock: 5,
          sku: "JKT-LAY-IP11",
          desc: "Slot 90 menit, termasuk rangka & lem. Garansi 30 hari dari tukang.",
          photo: wide(6755075),
        },
        {
          id: "p2",
          name: "Bersih-bersih + Ganti Pasta CPU",
          category: "Tune-up",
          price: 150000,
          stock: 8,
          sku: "JKT-TUP-CPU",
          desc: "Untuk laptop/notebook, buka casing, kuas + udara.",
          photo: wide(10699352),
        },
        {
          id: "p3",
          name: "Diagnosa Motherboard Laptop",
          category: "Servis",
          price: 250000,
          stock: 0,
          sku: "JKT-MBD-GEN",
          desc: "Kuota meja ukur minggu ini habis. Biaya dipotong kalau lanjut servis.",
          photo: wide(34514242),
        },
        {
          id: "p4",
          name: "Install Ulang + Backup Data",
          category: "Software",
          price: 120000,
          stock: 15,
          sku: "JKT-SWJ-001",
          desc: "Windows 10/11 original sesuai lisensi perangkatmu.",
        },
        {
          id: "p5",
          name: "Pasang RAM 8 GB DDR4 (termasuk modul)",
          category: "Upgrade",
          price: 415000,
          stock: 2,
          sku: "JKT-RAM-8D4",
          desc: "Cek kompatibilitas dulu lewat WA sebelum checkout.",
        },
      ],
      cartStart: 0,
    },
    spec: {
      header:
        "Header strip padat tinggi 52px: kiri avatar kotak 28px radius 6px + nama 15px IBM Plex Mono 600 huruf besar, kota 11px; tengah-kanan: status “TUTUP” kotak merah #C22B22 teks putih 11px mono + baris “buka Sabtu 09.00”. Kanan: tiga tombol ikon 44×44 berbingkai 1px #0E1721/14%. Keranjang menampilkan angka mono “3” dengan label “keranjang” 9px. Baris kedua (khusus ≤479px): jam hari ini + jumlah layanan aktif (dihitung dari katalog).",
      profile:
        "SAMPUL: TANPA, dan BIO kosong → blok profil tidak digambar. Sebagai gantinya satu baris fakta: “Surabaya · 5 layanan · Jumat: Tutup”. Semua informasi berasal dari data nyata (kota, panjang katalog, jam). Avatar + nama tetap ada di header, jadi tidak ada ruang hampa.",
      links:
        "2 tautan → tabel kontak rapat: 2 baris 44px, ikon mono 16px, label 13px, URL 11px mono redup. Baris WA ditandai “tanya dulu — bukan untuk order” di 10px merah-kecil, dan posisinya SETELAH daftar layanan, bukan di kartu produk sebagai tombol besar. Kalau 0 tautan blok hilang total.",
      hours:
        "“JAM OPERASIONAL” = panel tabel 7 baris (mono, 12px) dengan kolom lebar tetap: hari | jam. Hari ini ditandai latar #0B57D0/10% + caret kiri. Sel tutup berisi “—”. Panel ini juga dipakai untuk menghitung teks “buka Sabtu 09.00” di badge TUTUP (satu sumber kebenaran).",
      filter:
        "Baris alat (toolbar) tinggi 44px menempel di bawah header, latar #FFFFFF border 1px: [🔍 input “cari layanan atau kode”] [select kategori] [↺ reset]. Input dan select punya font mono, panah native dihilangkan, dan setiap chip kategori menampilkan jumlah SKU. Reset disabled (abu) saat query kosong & kategori = Semua.",
      card:
        "Daftar 1 kolom, tiap baris 96px @360px (gambar 16:10 88×62 di kiri, isi di kanan). Baris 1: nama layanan 14px Plex Sans 600 (2 baris maks). Baris 2: kode SKU mono 11px warna redup + “·” + kategori 11px. Baris 3: harga 16px Plex Mono 600 warna aksen + status stok kotak kecil (kanan). Tombol “+ Tambah” 44px tinggi, lebar 108px, radius 6px, latar aksen, teks putih 13px mono, rata kanan sejajar harga. Kalau produk tidak punya foto: kotak 88×62 diisi kisi mono + teks SKU — BUKAN placeholder stok logo “foto coming soon”. Tidak ada foto kedua/ketiga.",
      states:
        "TUTUP (dipakai di preview tema ini): seluruh tombol jadi “TUTUP” abu #E3E8EC teks #7C8896, ikon + hilang, dan di atas daftar ada banner 40px latar #C22B22/8%: “Workshop tutup. Kamu masih bisa melihat daftar & harga; keranjang dikosongkan sampai Sabtu 09.00.” Stok 0: kolom stok → “HABIS 0” kotak merah-abu, tombol mati “Kuota habis”, baris tetap ada supaya harga masih bisa dibandingkan. Katalog kosong: “Belum ada layanan terdaftar” + ikon perkakas garis. Nol hasil: “0 layanan untuk “{kueri}”” + tombol “reset” aktif.",
      qr:
        "QR dipakai untuk pembeli memindai di meja kasir: di header → tombol “QR” membuka panel kanan 320px (desktop) atau sheet (HP) berisi QR 200px, URL etalase mono, tombol “Unduh PNG” dan “Salin tautan”. Tidak ada QR dekorasi di kartu produk.",
    },
    compliance: [
      "Bio kosong tidak dikarang; profil menyusut jadi satu baris fakta.",
      "Tidak ada tombol order WA: WA hanya tautan kontak dengan keterangan “tanya dulu”, letaknya setelah katalog.",
      "Semua baris memakai field sah: nama, kategori, harga, stok, SKU, deskripsi, 1 foto (atau ubin mono bila foto belum ada).",
      "Status TUTUP = default preview tema ini, tombol mati + banner penjelas + jam buka berikutnya dari data 7 hari.",
      "Baris & toolbar 44px, grid list tidak pernah melebar; tabel jam pakai kolom fraksional agar aman di 360px.",
    ],
    ascii: `┌──────────────────────────┐
│◼ KILAT SERVIS     ▣ ⤴ 🛒0│
│  Surabaya · 5 layanan    │
│ [TUTUP] buka Sabtu 09.00 │
├──────────────────────────┤
│ ⚠ Workshop tutup — harga │
│   tetap bisa dicek       │
├──────────────────────────┤
│ [🔍 cari layanan/kode][↺]│
│ Kategori ▾   (Layar 1)…   │
├──────────────────────────┤
│ ┌──┐ Ganti Layar iPhone 11│
│ │▒▒│ JKT-LAY-IP11 · Layar │
│ └──┘ Rp725.000  [ Tambah]│
│        slot 5            │
│ ┌──┐ Diagnosa Motherboard │
│ │▒▒│ JKT-MBD-GEN · Servis │
│ └──┘ Rp250.000  [HABIS 0]│
│ ┌──┐ Install Ulang+Backup │
│ │▤▤│ JKT-SWJ-001 (mono)   │
│ └──┘ Rp120.000  [ TUTUP ]│
├──────────────────────────┤
│ JAM OPERASIONAL           │
│ Senin 09.00–18.00        │
│ Jumat ▸ Tutup             │
│ Sabtu 09.00–14.00        │
├──────────────────────────┤
│ Kilat Servis · Surabaya   │
│ Dibuat dengan TokoLink    │
└──────────────────────────┘`,
  },

  /* ------------------------------------------------ 5 — DAPUR NEBUL */
  {
    n: 5,
    name: "Dapur Ngebul",
    mood: "Papan menu dapur: garis kapur, cap HABIS jujur",
    sasaran: "Katering & jajanan — pembeli acara yang menghitung porsi & butuh cepat baca",
    palette: { bg: "#FAF6ED", surface: "#FFFDF7", text: "#221B14", muted: "#615649", accent: "#8A6A00" },
    onAccent: "#FFFFFF",
    badges: { buka: "#166B3C", tutup: "#B0261B", habis: "#8A7F6E", sisa: "#8A6A00" },
    fonts: {
      display: "Fraunces 700 (opsz tinggi)",
      body: "Manrope 400/500/700",
      displayStack: '"Fraunces", "Georgia", serif',
      bodyStack: '"Manrope", "Segoe UI", ui-sans-serif, system-ui, sans-serif',
    },
    metrics: { radius: "kartu 10px, foto 8px", photo: "1:1", gap: "10px", button: "46px" },
    layout: "menu",
    cover: "full",
    store: {
      name: "Dapur Ngebul Bu Yati",
      slug: "dapur-ngebul-bu-yati",
      city: "Semarang",
      bio: "Nasi kotak, tumpeng, dan jajanan pasar untuk rapat serta syukuran. Pesan H-2, ambil di dapur atau antar keliling Semarang Tengah.",
      logoText: "BY",
      coverPhoto: wide(36547516),
      open: true,
      today: "Jumat",
      todayHours: "07.00–16.00 WIB",
      todayIndex: 4,
      hours: days(["07.00–16.00", "07.00–16.00", "07.00–16.00", "07.00–16.00", "07.00–16.00", "07.00–13.00", null]),
      links: [
        { label: "Chat untuk hitung porsi", url: "https://wa.me/6281200000005", kind: "wa" },
        { label: "Foto acara kemarin", url: "https://instagram.com/dapur.ngebulyati", kind: "ig" },
        { label: "Rekam dapur", url: "https://tiktok.com/@dapurngebulyati", kind: "tiktok" },
        { label: "Halaman Facebook", url: "https://facebook.com/dapurngebulyati", kind: "fb" },
        { label: "Daftar di katalog lokal", url: "https://katalog-local.example.id/dapur-yati", kind: "link" },
        { label: "Peta dapur", url: "https://maps.google.com/?q=dapur+ngebul+semarang", kind: "link" },
      ],
      products: [
        {
          id: "p1",
          name: "Nasi Kotak Ayam Goreng + Urap",
          category: "Nasi Kotak",
          price: 25000,
          stock: 60,
          sku: "DPK-NBK-10",
          desc: "Kardos tutup bening, sendok & tisu sudah termasuk. Minimum 10 kotak.",
          photo: px(11912788),
        },
        {
          id: "p2",
          name: "Tumpeng Lengkap 15 Porsi",
          category: "Tumpeng",
          price: 650000,
          stock: 2,
          sku: "DPK-TPG-15",
          desc: "Nasi kuning, ayam ingkung, urap, kerupuk, hiasan.",
          photo: px(37073149),
        },
        {
          id: "p3",
          name: "Risoles Mayo Isi 10",
          category: "Jajan Pasar",
          price: 55000,
          stock: 0,
          sku: "DPK-JJP-04",
          desc: "Hari ini habis digoreng 2 gelombang. Bisa pesan untuk besok.",
          photo: px(31302984),
        },
        {
          id: "p4",
          name: "Snack Box Jajan Pasar isi 4",
          category: "Snack Box",
          price: 18000,
          stock: 120,
          sku: "DPK-SNB-04",
          desc: "Pilihan: risoles, lemper, klepon, pastel.",
          photo: px(9557122),
        },
        {
          id: "p5",
          name: "Tahu Isi Sambal Kacang (20 pcs)",
          category: "Jajan Pasar",
          price: 48000,
          stock: 4,
          sku: "DPK-JJP-11",
          desc: "Diantar hangat, kotak kertas, tahan 3 jam.",
          photo: px(30622220),
        },
      ],
      cartStart: 10,
    },
    spec: {
      header:
        "Header 64px: avatar bulat 40px bergaris 2px #8A6A00/30%, nama 18px Fraunces 700, kota 12px Manrope redup dengan ikon pin. Kanan: badge BUKA hijau pil 24px, tumpuk 2 tombol ikon 44×44 (QR, Bagikan) dan Keranjang kotak 44px radius 8px dengan angka 13px Fraunces. Di 360px baris 2 khusus hanya memuat “Jumat 07.00–16.00 WIB” — angka porsi/kapasitas dapur tidak boleh dikarang karena tidak ada fieldnya.",
      profile:
        "Sampul FULL setinggi 168px dengan garis bawah tebal 3px warna aksen (efek papan menu), lalu pita judul “PAPAN MENU HARI INI” 11px huruf jarang di atas latar #FAF6ED, bio 14px/1.6. Bio kosong → pita judul tetap + baris “Semarang · 5 menu”. Tidak ada badge “dipercaya 1000 pelanggan”.",
      links:
        "6 tautan → grid 2 kolom tombol (tinggi 48px) berbingkai 1px dashed #221B14/22% ala kartu tempel; ikon 18px di kiri, label 12px. Baris WA diberi label “hitung porsi” dan tetap lebih lemah dari tombol beli (outline, bukan isi). 0 tautan = blok hilang.",
      hours:
        "Pita “Jam dapur” model tabel kapur: 7 baris dalam 2 kolom, hari ini disorot garis bawah kapur; sel tutup = “LIBUR”. Di desktop, tabel jadi 2 kolom × 4 baris.",
      filter:
        "Baris cari 46px radius 10px + “Cari menu” dengan ikon kuah; di bawahnya chip kategori (Semua / Nasi Kotak / Tumpeng / Jajan Pasar / Snack Box) model kapur: latar transparan, garis 1px, aktif = latar #221B14 teks #FAF6ED (bukan aksen, supaya aksen khusus harga & beli). Tombol “Reset” kanan, abu saat tidak aktif.",
      card:
        "Baris menu 1 kolom @360px, 2 kolom @820px. Tiap baris: foto 1:1 104px di kiri radius 8px; kanan: nama 15px Fraunces 700, deskripsi 12px redup 2 baris, lalu baris harga dengan dot leader: “Nama menu ……… Rp25.000” (titik-titik hairline) — harga selalu warna aksen #8A6A00 17px 700 tnum. Status stok: pil kecil kanan-bawah foto — “Sisa 2” kuning #8A6A00 di latar kuning 12%, “HABIS” merah #B0261B di latar merah 10%. Tombol “+ Pesan” tinggi 44px latar aksen, teks putih, radius 8px, lebar 120px rata kanan. WA “tanya stok” = ikon outline 44px di kiri tombol, tidak pernah lebih besar.",
      states:
        "TUTUP: tombol → “Toko tutup”, latar #EAE3D5 teks #8A7F6E, dan pita jam menampilkan “buka Sabtu 07.00”. Stok 0: cap HABIS digambar seperti stempel tint (putar -14°, garis ganda, warna #B0261B) di atas sudut foto + tombol mati berlabel “Habis hari ini”. Katalog kosong: papan menu polos 220px + ilustrasi kukusan garis + “Belum ada menu hari ini. Dapur menulis menu baru tiap subuh.” Nol hasil: “Tidak ada menu “{kueri}”” + “lihat semua menu”.",
      qr:
        "QR dipakai dua tempat: (1) ikon header → sheet dengan QR 180px + tombol unduh PNG + tombol “tempel di kotak pesanan” (mengunduh PNG ukuran 32 mm); (2) di footer sebagai kartu papan tulis 150px untuk tema desktop. Tanpa QR dekorasi di kartu produk.",
    },
    compliance: [
      "Semua teks menyebut data nyata; tidak ada klaim “sisa 188 porsi” atau rating bintang.",
      "Tidak ada klaim garansi/penggantian — deskripsi hanya mengutip field desc produk (mis. “minimum 10 kotak” memang dari data).",
      "WA hanya tombol ikon outline untuk tanya stok; CTA beli “+ Pesan” paling pekat & paling besar di kartu.",
      "Tombol mati saat TUTUP/stok 0, labelnya menjelaskan keadaan, bukan janji.",
      "Baris menu tetap utuh di 360px (foto 104px + teks min 0, flex-wrap aman), target sentuh 44px.",
    ],
    ascii: `╔══════════════════════════╗
║ ◯ Dapur Ngebul Bu Yati    ║
║   Semarang  ●Buka   ▣ ⤴  ║
║   🛒 10                   ║
╠══════════════════════════╣
║ ░░░░ sampul 168px ░░░░░  ║
║ ▬▬▬ PAPAN MENU HARI INI ▬ ║
║ Nasi kotak, tumpeng,      ║
║ jajanan pasar…             ║
╠══════════════════════════╣
║ [WA hitung porsi][IG foto]║
║ [TT rekam]      [FB]      ║
╠══════════════════════════╣
║ [🔍 cari menu        ] [↺]║
║ (Semua)(Nasi Kotak)(Tumpeng)
╠══════════════════════════╣
║ ┌────┐ Nasi Kotak Ayam …  ║
║ │ ▒▒ │ kardos + sendok…   ║
║ │[S2]│ ………… Rp25.000      ║
║ └────┘ [?] [+ Pesan]       ║
║ ┌────┐ Risoles Mayo isi 10 ║
║ │ ▒▒ │ H A B I S (cap)     ║
║ └────┘ ………… Rp55.000       ║
║        [Habis hari ini]    ║
╠══════════════════════════╣
║ Jam dapur: Jumat 07–16     ║
║ Dapur Ngebul · Semarang    ║
║ Dibuat dengan TokoLink     ║
╚══════════════════════════╝`,
  },

  /* ------------------------------------------------ 6 — KRIYA ASLI */
  {
    n: 6,
    name: "Kriya Asli",
    mood: "Etalase + blok cerita pembuat; hangat, tekstil, indigo",
    sasaran: "Kerajinan & handmade — pembeli yang membeli cerita & proses, bukan cuma barang",
    palette: { bg: "#F2EDE3", surface: "#FFFCF4", text: "#2A2318", muted: "#655A49", accent: "#2E4A7D" },
    onAccent: "#FFFFFF",
    badges: { buka: "#1B6B45", tutup: "#A8322A", habis: "#847A69", sisa: "#8A6413" },
    fonts: {
      display: "Newsreader 500/600 (italic untuk kutipan)",
      body: "Outfit 300/400/500",
      displayStack: '"Newsreader", Georgia, "Times New Roman", serif',
      bodyStack: '"Outfit", "Avenir Next", ui-sans-serif, system-ui, sans-serif',
    },
    metrics: { radius: "kartu 18px, foto 14px", photo: "4:5", gap: "14px", button: "46px" },
    layout: "story",
    cover: "half",
    store: {
      name: "Kriya Asli Rinjani",
      slug: "kriya-asli-rinjani",
      city: "Lombok Timur",
      bio: "Tenun ikat dan tanah liat dari 12 perajin di Suela. Benang dicelup alami: indigo, mengkudu, jelawe. Satu helai bisa 3 minggu.",
      logoText: "KR",
      coverPhoto: wide(35473885),
      open: true,
      today: "Jumat",
      todayHours: "09.00–17.00 WITA",
      todayIndex: 4,
      hours: days(["09.00–17.00", "09.00–17.00", "09.00–17.00", "09.00–17.00", "09.00–17.00", "09.00–15.00", null]),
      links: [
        { label: "Tanya motif & ukuran", url: "https://wa.me/6281200000006", kind: "wa" },
        { label: "Proses tenun (Reels)", url: "https://instagram.com/kriya.asli", kind: "ig" },
        { label: "Video alat tenun", url: "https://tiktok.com/@kriyaasli", kind: "tiktok" },
        { label: "Album perajin", url: "https://facebook.com/kriyaasli", kind: "fb" },
        { label: "Katalog PDF", url: "https://kriyaasli.example.id/katalog", kind: "link" },
        { label: "Lokasi rumah tenun", url: "https://maps.google.com/?q=suela+lombok", kind: "link" },
        { label: "Channel dokumenter", url: "https://youtube.com/@kriyaasli", kind: "link" },
        { label: "Toko marketplace", url: "https://marketplace.example.id/kriyaasli", kind: "link" },
        { label: "Email khusus", url: "mailto:halo@kriyaasli.example.id", kind: "link" },
        { label: "Jadwal kunjungan", url: "https://kriyaasli.example.id/kunjungan", kind: "link" },
      ],
      products: [
        {
          id: "p1",
          name: "Selendang Tenun Ikat — Motif Rumah Api",
          category: "Tenun",
          price: 480000,
          stock: 1,
          sku: "KRI-TNB-014",
          desc: "60 × 190 cm, kapas 250 g, celup indigo 3 lapis.",
          photo: portrait(15997613),
        },
        {
          id: "p2",
          name: "Toples Tanah Liat Glasir Abu",
          category: "Gerabah",
          price: 135000,
          stock: 6,
          sku: "KRI-GRB-007",
          desc: "Tutup kayu sono, tinggi 14 cm, aman untuk kopi tubruk.",
          photo: portrait(18646120),
        },
        {
          id: "p3",
          name: "Sarung Tenun 2 m",
          category: "Tenun",
          price: 890000,
          stock: 0,
          sku: "KRI-TNB-021",
          desc: "Pemesanan berikutnya dibuka setelah alat tenun selesai.",
          photo: portrait(38317548),
        },
        {
          id: "p4",
          name: "Set Cangkir Keramik 4 Pcs",
          category: "Gerabah",
          price: 210000,
          stock: 3,
          sku: "KRI-GRB-018",
          desc: "Dibentuk tangan, isi bisa beda 2–3 mm antar cangkir.",
          photo: portrait(34387792),
        },
        {
          id: "p5",
          name: "Sendok Kayu Sono Set 4",
          category: "Kayu",
          price: 65000,
          stock: 9,
          sku: "KRI-KYU-003",
          desc: "Dipahat dari potongan sisa, diamplas tanpa pernis makanan.",
          photo: portrait(34419793),
        },
      ],
      cartStart: 1,
    },
    spec: {
      header:
        "Header “etalase” 68px: latar permukaan dengan tepi bawah 1px #2A2318/8%. Kiri avatar 40px radius 50% + nama 17px Newsreader 600, kota 12px Outfit 300 dengan pemisah “·” ke badge BUKA (hijau, pil 24px). Kanan: 3 tombol ikon 44×44 radius 999px; saat ditekan tombol memberi lingkaran latar #2E4A7D/10%. Nomor keranjang = pil 18px warna aksen di pojok tombol keranjang.",
      profile:
        "Sampul HALF 240px; kartu profil (margin-top -28px, radius 18px, padding 16px) memuat bio 15px/1.65 Newsreader sebagai “blok cerita pembuat”, maksimal 4 baris lalu tombol teks “cerita lengkap”. Bagian 2 blok cerita: logo toko 32px + kota + “12 perajin” hanya bila teks itu memang ada di bio (dipetik, bukan ditambah). Tidak ada foto galeri kedua untuk cerita — foto sampul dipakai ulang secara sah (field cover memang ada).",
      links:
        "10 tautan (jumlah maksimum) → blok “Kanal & catatan”: grid 2 kolom baris 52px @≥380px, 1 kolom di 360px, tiap sel kartu kecil permukaan dengan ikon otomatis 20px, label 13px, URL 11px redup satu baris elipsis. WA di baris pertama dengan ikon 22px dan garis bawah 2px, tetap outline. Kalau jumlah 0 → seluruh blok (termasuk judul) hilang, bukan menampilkan kotak kosong.",
      hours:
        "Enam baris ringkas di footer kartu profil: “09.00–17.00 · 6 hari, Minggu libur” dan tombol teks “lihat 7 hari” → kartu grid 2×4 (hari | jam) dengan hari ini ditandai bingkai aksen.",
      filter:
        "Blok filter menempel di atas katalog, jarak 20px ke atas: kolom cari 48px radius 999 dengan ikon + tombol bersihkan; chip kategori model label kain (radius 999, garis 1px, latar permukaan) menampilkan nama kategori + jumlah; chip aktif latar #2E4A7D teks #FFFFFF. Tombol “Reset filter” teks 13px + ikon panah putar, merah-kecil? tidak: warna redup, aktif jadi warna aksen.",
      card:
        "Grid: 1 kolom @360px, 2 kolom @700px, 3 kolom @1080px, gap 14px. Kartu foto 4:5 (radius 14px) dengan tepi dalam 1px #2A2318/6%; di atas foto pojok kanan-bawah cap stok (Sisa 1 = kuning, HABIS = merah-abu) model label tenun. Isi padding 14px: nama 15px Newsreader 500 (2 baris), kategori 10px Outfit 500 huruf jarang redup, deskripsi 12px redup 2 baris, baris harga: 17px aksen 600 tnum di kiri, SKU mono 10px redup di kanan. Tombol “Tambah ke keranjang” tinggi 46px radius 999 latar aksen; di bawahnya tautan teks “tanya motif via WA” 12px garis bawah (sekunder, hanya jika ada WA di links).",
      states:
        "TUTUP: tombol diganti “Toko tutup” latar #E7E1D5 teks #847A69 + ikon gembok kecil, harga tetap tampil; header badge TUTUP + “buka Sabtu 09.00”. Stok 0: foto desaturasi 20% + cap “HABIS”, tombol jadi label mati “Stok habis”, tautan WA tetap boleh (tanya pemesanan berikutnya). Katalog kosong: 1 kartu besar berisi foto sampul buram-tipis + “Etalase belum diisi. Coba lagi nanti.” (tanpa CTA palsu). Nol hasil: gambar anyaman garis + “Tidak ada “{kueri}”. Semua produk ada di sini” + tombol reset.",
      qr:
        "QR di kartu profil sebagai koin 84px di samping bio (desktop) / tombol ikon (HP) → modal: QR 200px, caption “Pindai untuk buka etalase”, tombol “Unduh PNG 1024px”, dan tombol sekunder “Salin tautan”. QR tidak menutupi foto produk.",
    },
    compliance: [
      "Blok cerita hanya memetik teks bio & kota; tidak ada angka perajin baru di luar yang tertulis di bio.",
      "10 tautan tampil semua sesuai data, tanpa menyembunyikan; jumlah 0 = blok hilang (diuji di Tema 7).",
      "Satu foto per produk; tidak ada indikator galeri atau “lihat foto”. WA hanya tautan teks sekunder di bawah tombol beli.",
      "Cap HABIS memakai stok = 0 dari data, bukan penanda promo; tombol mati jelas.",
      "Semua kartu 1 kolom di 360px, target sentuh 44–46px, chip wrap tanpa membuat halaman bergeser.",
    ],
    ascii: `┌──────────────────────────┐
│ ◉ Kriya Asli Rinjani  ▣⤴🛒│
│   Lombok Timur · ●Buka     │
├──────────────────────────┤
│ ░░░░░ sampul 240px ░░░░░ │
│ ┌──────────────────────┐ │
│ │ Tenun ikat & tanah   │ │
│ │ liat dari 12 perajin │ │
│ │ di Suela… (cerita)   │ │
│ │  ◜◝ 09.00–17.00  [QR]│ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ Kanal & catatan          │
│ ┌ WA tanya motif ┐┌ IG  ┐│
│ ┌ TikTok        ┐┌ FB  ┐│
│ ┌ PDF           ┐┌ Maps┐│  …10 tautan
├──────────────────────────┤
│ [🔍 cari produk      ] ↺ │
│ (Semua 5)(Tenun 2)(Gerabah 2)(Kayu 1)
├──────────────────────────┤
│ ┌────────┐ ┌────────┐    │
│ │ 4:5    │ │ [HABIS]│    │
│ │Rp480k  │ │        │    │
│ │Sisa 1  │ └────────┘    │
│ └────────┘                │
│ Selendang Tenun Ikat      │
│ TENUN          KRI-TNB-014│
│ [ Tambah ke keranjang ]   │
│   tanya motif via WA      │
├──────────────────────────┤
│ Kriya Asli Rinjani · Lombok│
│ Dibuat dengan TokoLink     │
└──────────────────────────┘`,
  },

  /* ------------------------------------------------ 7 — DIGITAL KILAT */
  {
    n: 7,
    name: "Digital Kilat",
    mood: "Terminal presisi: mono, gelap, ambang satu warna",
    sasaran: "Produk digital — pembeli yang ingin tahu format file, lisensi, dan cara kirim",
    palette: { bg: "#0E1116", surface: "#171C23", text: "#EDF1F5", muted: "#8FA0B0", accent: "#F2B01E" },
    onAccent: "#0E1116",
    badges: { buka: "#38D17E", tutup: "#F0655A", habis: "#7A8797", sisa: "#F2B01E" },
    fonts: {
      display: "Space Grotesk 500/700",
      body: "JetBrains Mono 400/500",
      displayStack: '"Space Grotesk", "Helvetica Neue", ui-sans-serif, sans-serif',
      bodyStack: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    },
    metrics: { radius: "kartu 8px, foto 6px, tombol 6px", photo: "1:1", gap: "8px", button: "44px" },
    layout: "dense",
    cover: "none",
    store: {
      name: "Digital Kilat",
      slug: "digital-kilat",
      city: "Bandung",
      bio: "Aset desain siap unduh. Link kirim otomatis setelah pembayaran QRIS terverifikasi.",
      logoText: "DK",
      open: true,
      today: "Jumat",
      todayHours: "24 jam · unduh otomatis",
      todayIndex: 4,
      hours: days(["24 jam", "24 jam", "24 jam", "24 jam", "24 jam", "24 jam", "09.00–17.00 (bantuan)"]),
      links: [],
      products: [
        {
          id: "p1",
          name: "Pack Ikon Etalase — 240 glyph SVG",
          category: "Ikon",
          price: 89000,
          stock: 25,
          sku: "DGK-IKN-240",
          desc: "SVG + Figma, grid 24px, lisensi UMKM 1 usaha.",
          photo: px(18069084),
        },
        {
          id: "p2",
          name: "Template Katalog Produk — 12 layout PSD",
          category: "Template",
          price: 129000,
          stock: 0,
          sku: "DGK-TPL-012",
          desc: "PSD CC 2023+, resolusi 1080×1350, teks mudah diganti.",
          photo: px(34717436),
        },
        {
          id: "p3",
          name: "Font Display Warung — lisensi 1 tahun",
          category: "Font",
          price: 240000,
          stock: 12,
          sku: "DGK-FNT-001",
          desc: "2 gaya, 612 glyph, termasuk lisensi logo.",
        },
        {
          id: "p4",
          name: "Preset Lightroom Kopi Susu ×30",
          category: "Preset",
          price: 55000,
          stock: 40,
          sku: "DGK-PST-030",
          desc: "DNG desktop + mobile, kalibrasi dasar kamera HP.",
        },
        {
          id: "p5",
          name: "Set Banner Iklan — 5 ukuran",
          category: "Template",
          price: 45000,
          stock: 0,
          sku: "DGK-BNR-005",
          desc: "Figma, 1080×1080 / 1080×1920 / 3 ukuran feed.",
        },
      ],
      cartStart: 0,
    },
    spec: {
      header:
        "Header mono-strip 52px, latar #171C23 dengan garis bawah 1px #EDF1F5/10%. Kiri: avatar kotak 26px radius 4px, nama 14px Space Grotesk 700 huruf besar tracking -.01em, kota 11px mono redup dipisah “/”. Kanan: status “BUKA” 11px mono warna #38D17E dengan titik 5px, lalu tombol ikon 44×44 bergaris 1px #EDF1F5/14%; keranjang menampilkan angka di dalam kurung siku “[2]” gaya terminal. Baris 2 (HP): “24 jam · unduh otomatis” 11px redup.",
      profile:
        "SAMPUL: TANPA. Bio 1 baris 12px mono warna redup di dalam strip tipis bertanda “> ” (prompt) — hemat ruang, presisi. Kalau bio kosong, strip diganti “/Bandung · 5 produk”. Tidak ada tagline karangan, tidak ada klaim “10.000 unduhan”.",
      links:
        "Data tautan = 0 → blok tautan bio TIDAK DIGAMBARKAN sama sekali (tidak ada judul kosong, tidak ada kotak “belum ada”). Ruang 12px diisi garis pembatas tipis. Kalau seller menambah 1–10 tautan, blok muncul sebagai baris list mono 40px: ikon + label + URL + panah, tanpa warna merek.",
      hours:
        "Jam = 7 baris kompak “SEN–MIN”. Karena non-stop, format baris: “SEN 24 jam”, dan khusus Minggu “MING 09.00–17.00 (bantuan)”. Ditampilkan sebagai strip 1 baris + panel “7 hari” saat dibuka (accordion, animasi height 180ms).",
      filter:
        "Baris perintah ala terminal: `[>]` prompt + input tanpa border (garis bawah 1px), placeholder “ketik nama atau SKU…”. Kanan: tombol “RESET” 40px outline merah-abu saat aktif, abu mati saat bersih. Kategori = daftar teks dengan pemisah “|”, item aktif diberi latar #F2B01E/12% dan teks #F2B01E; jumlah produk tiap kategori ditulis mono “(2)”.",
      card:
        "1 kolom @360px; tiap baris 88px: kotak 64×64 (foto 1:1 radius 6px, ATAU ubin monogram = latar #0E1116 + garis kisi 1px + teks SKU 9px mono tengah — dipakai kalau produk tanpa foto), kolom tengah (nama 14px Space Grotesk 500, baris 2 = kategori · SKU 11px redup, baris 3 = desc 11px redup 1 baris), kolom kanan harga #F2B01E 15px mono tnum + di bawahnya tombol “+ ADD” 44×72px radius 6px latar aksen teks #0E1116 700. Status stok ditulis angka mono: “STK 25”, “STK 0 → HABIS”. Tidak ada bayangan, tidak ada gradien foto.",
      states:
        "TUTUP: semua “+ ADD” jadi “CLOSED” (#262C34 latar, #7A8797 teks) + strip peringatan 40px di bawah header: “Etalase sedang tutup. Link unduh tidak dikirim.” Stok 0: harga TIDAK dicoret (harga tetap terbaca sebagai informasi), hanya label “HABIS” kotak merah 10px dan tombol mati “SOLD OUT” (label memakai istilah yang sama dengan data). Katalog kosong: panel 200px bergaris putus-putus + “> belum ada produk. tambahkan lewat dasbor.” Nol hasil: “> 0 hasil untuk “{kueri}”” + tombol “RESET” aktif. Semua keadaan kosong punya ikon garis, bukan ilustrasi warna.",
      qr:
        "Tombol QR header membuka panel modal tengah 340px: QR 180px berbingkai putih (kontras untuk scan di layar gelap), caption “buka etalase ini”, tombol “Unduh PNG” dan “Salin tautan” — keduanya berfungsi nyata, tidak ada tombol dekoratif. Di desktop, QR 96px tampil permanen di strip header kanan dengan label “QR”.",
    },
    compliance: [
      "Tidak ada statistik: nol angka penjualan, nol rating, nol badge “laris”. Yang ada cuma harga, stok, SKU, kategori.",
      "Tema gelap diizinkan untuk produk digital; aksen kuning tetap dipakai HANYA untuk beli + harga + status, bukan dekorasi acak.",
      "Produk tanpa foto tidak diberi gambar stok — diganti ubin monogram yang jujur (state “belum ada foto”).",
      "Daftar tautan kosong = blok dihilangkan total (satu-satunya tema di preview yang menguji aturan ini).",
      "Baris 88px & tombol 44×72 cukup untuk jempol; tidak ada scroll horizontal. Rasio kontras palet gelap ini diverifikasi otomatis di panel Audit (semua pasangan teks↔latar ≥ 4,5:1).",
    ],
    ascii: `┌──────────────────────────┐
│◼ DIGITAL KILAT / Bandung▣⤴│
│ ●BUKA   keranjang [0]     │
├──────────────────────────┤
│ > Aset desain siap unduh. │
│   Link kirim otomatis…    │
│ > SEN–SAB 24jam · MIN 9–17│
├──────────────────────────┤
│ > cari nama atau SKU____  │
│ Semua|Ikon|Template|Font… │
│                     [RESET]│
├──────────────────────────┤
│ ┌──┐ Pack Ikon Etalase    │
│ │▣▣│ 240 glyph SVG        │
│ └──┘ IKON · DGK-IKN-240   │
│ Rp89.000 STK 25  [+ ADD]  │
│ ┌──┐ Template Katalog      │
│ │▤▤│ (ubin monogram)      │
│ └──┘ TPL · DGK-TPL-012     │
│ Rp129.000 HABIS [SOLD OUT] │
├──────────────────────────┤
│ ┌──────┐  QR · PNG/SVG    │
│ │ ███  │                  │
│ └──────┘                  │
│ DIGITAL KILAT · Bandung   │
│ Dibuat dengan TokoLink    │
└──────────────────────────┘`,
  },

  /* ------------------------------------------------ 8 — KONSULTAN TENANG */
  {
    n: 8,
    name: "Konsultan Tenang",
    mood: "Satu kolom lapang, serif lembut, CTA kalem tapi jelas",
    sasaran: "Jasa profesional — klien yang butuh kejelasan paket & cara mulai",
    palette: { bg: "#F5F6F4", surface: "#FFFFFF", text: "#1B201C", muted: "#5C645C", accent: "#2F5D50" },
    onAccent: "#FFFFFF",
    badges: { buka: "#1F7A4D", tutup: "#A33027", habis: "#808A82", sisa: "#8A6B12" },
    fonts: {
      display: "Newsreader 400/500",
      body: "Karla 400/500/600",
      displayStack: '"Newsreader", Georgia, serif',
      bodyStack: '"Karla", "Helvetica Neue", ui-sans-serif, system-ui, sans-serif',
    },
    metrics: { radius: "kartu 12px, tombol 8px", photo: "3:2 (opsional)", gap: "16px", button: "48px" },
    layout: "single",
    cover: "half",
    store: {
      name: "Konsultan Tenang",
      slug: "konsultan-tenang",
      city: "Depok",
      bio: "Pendampingan pembukuan dan pajak UMKM. Satu sesi 90 menit lewat video call atau di kantor; jadwal dipilih di keranjang.",
      logoText: "KT",
      coverPhoto: wide(7789610),
      open: true,
      today: "Jumat",
      todayHours: "09.00–17.00 WIB",
      todayIndex: 4,
      hours: days(["09.00–17.00", "09.00–17.00", "09.00–17.00", "09.00–17.00", "09.00–17.00", null, null]),
      links: [{ label: "Tanya kelayakan paket", url: "https://wa.me/6281200000008", kind: "wa" }],
      products: [
        {
          id: "p1",
          name: "Sesi Awal Pembukuan — 90 menit",
          category: "Sesi",
          price: 250000,
          stock: 4,
          sku: "KKT-SES-090",
          desc: "Peta arus kas + daftar dokumen yang perlu disiapkan.",
          photo: wide(796603),
        },
        {
          id: "p2",
          name: "Paket Rapikan Buku 3 Bulan",
          category: "Paket",
          price: 1350000,
          stock: 2,
          sku: "KKT-PKT-3BL",
          desc: "12 sesi mingguan, laporan bulanan, temani penutupan buku.",
          photo: wide(1181617),
        },
        {
          id: "p3",
          name: "Konsultasi Pajak Tahunan UMKM",
          category: "Sesi",
          price: 425000,
          stock: 3,
          sku: "KKT-PPH-THN",
          desc: "Hitung ulang omzet, cek kewajiban, draf pelaporan.",
          photo: wide(5710934),
        },
        {
          id: "p4",
          name: "Audit Kas Mini + Template Laporan",
          category: "Laporan",
          price: 600000,
          stock: 0,
          sku: "KKT-LAP-002",
          desc: "Slot bulan ini penuh. Tambah ke daftar tunggu lewat WA.",
          photo: wide(1181607),
        },
      ],
      cartStart: 0,
    },
    spec: {
      header:
        "Header tenang 60px: tanpa garis, latar sama dengan halaman. Kiri avatar 32px radius 50% dengan ring 1px #2F5D50/24%, nama 16px Newsreader 500, kota 12px Karla redup. Kanan hanya dua aksi ikon 44×44 (QR, Bagikan) + Keranjang teks “Keranjang (0)” 13px dengan ikon — tidak memakai badge tebal supaya nada tetap kalem. Badge status BUKA/TUTUP ditulis sebagai teks 12px + titik, bukan pil warna besar.",
      profile:
        "Sampul HALF: gambar 200px, kartu profil menumpuk 40px ke bawah (radius 12px atas), lebar maksimum 640px di tengah. Bio 16px/1.7 Newsreader, 3 baris. Kalau bio kosong → baris “Depok · 4 paket jasa”. Kolom isi halaman dibatasi 640px agar satu napas baca; tidak ada grid ganda.",
      links:
        "1 tautan → satu baris teks setinggi 52px dengan ikon WA 18px di kiri dan panah di kanan, garis atas-bawah hairline #1B201C/8% (bukan kartu). Kalau 0 → blok hilang.",
      hours:
        "Satu baris: “Senin–Jumat 09.00–17.00 · Sabtu & Minggu libur” (dihitung dari data 7 hari, digabung otomatis). Tombol teks “rincian 7 hari” membuka daftar vertikal 7 baris dengan hari ini ditebalkan.",
      filter:
        "Katalog 4 item, tapi filter tetap wajib ada dan tidak boleh terasa berlebih: satu baris 48px berisi input cari bergaris-bawah (tanpa kotak) + daftar kategori teks (“Semua · Sesi · Paket · Laporan”) + reset sebagai ikon 32px di ujung. Semua target sentuh diperlebar jadi 44px dengan padding, bukan dengan memperbesar visual.",
      card:
        "Satu kolom (lebar maksimum 640px), jarak antar-kartu 16px. Tiap kartu = baris 1 kolom: nama 17px Newsreader 500 di atas, deskripsi 13px/1.6 redup maksimal 2 baris, pemisah hairline, baris bawah: harga “Rp250.000” 16px Karla 600 warna aksen di kiri, status stok 12px di kanan (“Sisa 4 slot”). Foto 3:2 setinggi 168px tampil HANYA bila field foto ada, tanpa carousel; produk tanpa foto tidak mendapat kotak kosong — teks langsung mulai lebih tinggi (varian “text-only card” didefinisikan eksplisit). Tombol “Tambah ke keranjang” tinggi 48px radius 8px latar aksen, teks putih 14px, lebar penuh — satu-satunya area berwarna pekat di kartu, tanpa ikon berisik.",
      states:
        "TUTUP: tombol “Toko tutup — Senin 09.00” latar #E9ECE8 teks #808A82, dan blok jam menampilkan status TUTUP merah di samping nama. Stok 0: label “Slot penuh”, tombol non-interaktif berbingkai putus-putus, plus teks sekunder “tanya daftar tunggu via WA” (karena WA memang ada di data). Katalog kosong: 1 kartu 200px dengan garis tepi tipis + “Belum ada paket yang dibuka. Klien akan melihat ini.” Nol hasil: “Tidak ada paket untuk “{kueri}”” + tombol teks reset.",
      qr:
        "QR muncul satu kali saja, di akhir halaman sebagai kartu 320px: QR 168px, caption “Pindai untuk membuka etalase ini di HP lain”, tombol “Unduh PNG”. Ikon QR di header melakukan scroll-halus ke kartu itu (bukan modal kedua) — satu sumber kebenaran, tidak duplikat tampilan.",
    },
    compliance: [
      "Tidak ada angka klien, sertifikasi, atau testimoni karangan; hanya bio, kota, dan daftar paket.",
      "CTA beli tetap paling menonjol; WA hanyalah baris teks sekunder dan “tanya daftar tunggu” khusus stok 0.",
      "Harga, stok, SKU, kategori, deskripsi = field sah. Label “slot” hanya menempel pada angka stok, tidak mengarang kuota baru.",
      "Tombol mati saat TUTUP/stok 0 dengan label yang menjelaskan keadaan sebenarnya.",
      "Satu kolom 640px, semua target sentuh 44–48px, tidak ada elemen yang memaksa scroll horizontal di 360px.",
    ],
    ascii: `┌──────────────────────────┐
│ ◉ Konsultan Tenang        │
│   Depok · ● Buka  ▣ ⤴ 🛒0 │
├──────────────────────────┤
│ ░░░░░░ sampul 200 ░░░░░░ │
│  ┌────────────────────┐  │
│  │ Pendampingan       │  │
│  │ pembukuan & pajak  │  │
│  │ UMKM…              │  │
│  │ Sen–Jum 09–17 · rincian
│  └────────────────────┘  │
├──────────────────────────┤
│ WA Tanya kelayakan paket ›│
├──────────────────────────┤
│ cari paket…   Semua · Sesi│
│ · Paket · Laporan      (↺)│
├──────────────────────────┤
│  ┌────────────────────┐  │
│  │  foto 3:2 168px    │  │
│  ├────────────────────┤  │
│  │ Sesi Awal Pembukuan│  │
│  │ Peta arus kas +    │  │
│  │ daftar dokumen…    │  │
│  │ Rp250.000   Sisa 4 │  │
│  │ [ Tambah ke keranjang ]
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ Audit Kas Mini     │  │
│  │ Rp600.000  Slot penuh
│  │ ┊ Tambah (mati) ┊   │  │
│  │ tanya daftar tunggu │  │
│  └────────────────────┘  │
├──────────────────────────┤
│      ┌── QR 168 ──┐      │
│      Unduh PNG            │
│ Konsultan Tenang · Depok  │
│ Dibuat dengan TokoLink    │
└──────────────────────────┘`,
  },
];

/** Aturan mati yang dipegang semua tema (dipakai di panel audit). */
export const HARD_RULES = [
  {
    n: 1,
    title: "Setiap elemen harus punya data",
    detail:
      "Dilarang tombol mati-rasa-hidup, angka statistik karangan, badge “Premium” untuk semua, janji garansi, atau galeri palsu. Tidak ada data = tidak ada elemen (atau digambar sebagai empty state).",
  },
  {
    n: 2,
    title: "Satu-satunya tombol beli",
    detail:
      "“Tambah ke keranjang” → keranjang → checkout QRIS. WA hanya tombol sekunder untuk tanya stok, tidak pernah lebih menonjol dari tombol beli, dan tidak pernah jadi jalur order.",
  },
  {
    n: 3,
    title: "Field yang boleh dipakai",
    detail:
      "Toko: nama, kota, bio, logo, sampul, status buka/tutup + jam hari ini + 7 hari, QR, jumlah keranjang. Tautan: label + URL + ikon. Produk: 1 foto, nama, kategori, harga, stok/HABIS, SKU, deskripsi. Filter: kategori asli + cari + reset.",
  },
  {
    n: 4,
    title: "Toko tutup = terlihat & mematikan beli",
    detail:
      "Badge TUTUP wajib terlihat, tombol tambah mati atau berganti label “Toko tutup”, dan pembeli diberi jam buka berikutnya dari data 7 hari.",
  },
  {
    n: 5,
    title: "Mobile-first 360px",
    detail:
      "Tanpa scroll horizontal halaman, tanpa konten kepotong kiri-kanan, target sentuh ≥44px. Desktop adalah hasil naik, bukan dua desain berbeda.",
  },
];

/** Bagian wajib per tema (checklist review). */
export const REQUIRED_PARTS = [
  "Header (logo, nama, kota, BUKA/TUTUP + jam hari ini, Bagikan, QR, Keranjang)",
  "Profil (sampul full/half/tanpa + bio atau fallback kota/katalog)",
  "Tautan bio 0–10 (0 = blok hilang total)",
  "Jam lengkap 7 hari + status hari ini",
  "Filter: chip kategori + cari + reset",
  "Kartu produk (foto 1, nama, harga Rp, cap HABIS/SISA N, tombol tambah, state tutup & stok 0)",
  "Keadaan kosong: tanpa produk + hasil cari nol",
  "Footer: nama toko + kota + “Dibuat dengan TokoLink”",
  "QR toko: posisi + tombol unduh",
];
