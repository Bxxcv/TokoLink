/**
 * Theme registry — daftar tema yang bisa dipilih seller.
 *
 * - "klasik": tampilan bawaan yang sudah ada (dirender StoreHome lama,
 *   tidak disentuh engine ini).
 * - "ruang-seduh": tema 01, satu-satunya tema baru di fase ini.
 * - 02–08: "segera-hadir" — tampil di dashboard sebagai roadmap,
 *   tidak bisa dipilih sampai di-port (satu per sesi berikutnya).
 */
export interface ThemeMeta {
  id: string;
  no: string;
  name: string;
  sub: string;
  forWho: string;
  desc: string;
  available: boolean;
}

export const THEMES: ThemeMeta[] = [  {
    id: "klasik",
    no: "00",
    name: "Klasik",
    sub: "Tampilan bawaan",
    forWho: "Semua toko",
    desc: "Tampilan TokoLink yang selama ini dipakai — kartu produk, sampul, dan katalog.",
    available: true,
  },
  {
    id: "ruang-seduh",
    no: "01",
    name: "Ruang Seduh",
    sub: "Editorial hangat",
    forWho: "Kopi, bakery, kuliner artisan",
    desc: "Dibaca seperti buku menu: profil tenang di kiri, produk sebagai daftar bernomor.",
    available: true,
  },
  {
    id: "pasar-rapi",
    no: "02",
    name: "Pasar Rapi",
    sub: "Katalog padat",
    forWho: "Retail, sembako, aksesori",
    desc: "Etalase padat: harga besar, cari + chip kategori, semua barang terlihat sekaligus.",
    available: true,
  },
  {
    id: "lugas-jasa",
    no: "03",
    name: "Lugas Jasa",
    sub: "Daftar utilitarian",
    forWho: "Servis, booking, jasa lokal",
    desc: "Tabel layanan berkode, durasi & harga jelas, tanpa foto hero.",
    available: true,
  },
  {
    id: "atelier",
    no: "04",
    name: "Atelier",
    sub: "Galeri busana",
    forWho: "Fashion, butik",
    desc: "Foto vertikal besar, tempo lambat seperti halaman editorial.",
    available: true,
  },
  {
    id: "dapur-hari-ini",
    no: "05",
    name: "Dapur Hari Ini",
    sub: "Papan menu cepat",
    forWho: "Restoran, katering, jajanan",
    desc: "Papan menu bertanggal dengan cap HABIS yang jujur.",
    available: true,
  },
  {
    id: "kriya-nusantara",
    no: "06",
    name: "Kriya Nusantara",
    sub: "Etalase asimetris",
    forWho: "Kerajinan, handmade",
    desc: "Susunan meja pameran plus blok cerita pengrajin.",
    available: true,
  },
  {
    id: "pixel-goods",
    no: "07",
    name: "Pixel Goods",
    sub: "Etalase gelap presisi",
    forWho: "Produk digital",
    desc: "Satu-satunya tema gelap, tabel spesifikasi mono.",
    available: true,
  },
  {
    id: "studio-tenang",
    no: "08",
    name: "Studio Tenang",
    sub: "Presentasi lapang",
    forWho: "Konsultan, jasa profesional",
    desc: "Satu kolom lapang 640px, CTA berupa tautan tenang.",
    available: true,
  },
];

/** ID tema yang punya komponen presentasi (selain "klasik" = legacy). */
export const ENGINE_THEMES = [
  "ruang-seduh",
  "pasar-rapi",
  "lugas-jasa",
  "atelier",
  "dapur-hari-ini",
  "kriya-nusantara",
  "pixel-goods",
  "studio-tenang",
] as const;

export function isEngineTheme(id: string | null | undefined): boolean {
  return !!id && (ENGINE_THEMES as readonly string[]).includes(id);
}

export function themeName(id: string | null | undefined): string {
  return THEMES.find((t) => t.id === id)?.name ?? "Klasik";
}
