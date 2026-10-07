/**
 * Theme registry — daftar tema yang bisa dipilih seller.
 *
 * - "klasik": tampilan bawaan yang sudah ada (dirender StoreHome lama,
 *   tidak disentuh engine ini).
 * - 01–08: set tema baru (Okt 2026, lihat Hasil_Repair/Brief_Desain_Tema.md).
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
    id: "warung-rame",
    no: "01",
    name: "Warung Rame",
    sub: "Etalase pasar padat",
    forWho: "Kuliner harian",
    desc: "Grid rapat 2 kolom, cap HABIS/SISA jujur, tombol Tambah besar.",
    available: true,
  },
  {
    id: "kopi-sore",
    no: "02",
    name: "Kopi Sore",
    sub: "Editorial tenang",
    forWho: "Kopi, bakery artisan",
    desc: "Satu kolom lega, foto 4:5, harga aksen pinus.",
    available: true,
  },
  {
    id: "butik-rapi",
    no: "03",
    name: "Butik Rapi",
    sub: "Lookbook vertikal",
    forWho: "Fashion, butik",
    desc: "Foto 3:4 penuh, tombol pil, tanpa radius.",
    available: true,
  },
  {
    id: "jasa-kilat",
    no: "04",
    name: "Jasa Kilat",
    sub: "Daftar utilitarian",
    forWho: "Servis & jasa",
    desc: "Baris kode-harga mono, SKU jelas, tanpa dekorasi.",
    available: true,
  },
  {
    id: "dapur-ngebul",
    no: "05",
    name: "Dapur Ngebul",
    sub: "Papan menu",
    forWho: "Katering & jajanan",
    desc: "Harga dot-leader ala papan tulis, cap HABIS stempel.",
    available: true,
  },
  {
    id: "kriya-asli",
    no: "06",
    name: "Kriya Asli",
    sub: "Etalase + cerita",
    forWho: "Kerajinan, handmade",
    desc: "Blok cerita pembuat + kanal lengkap.",
    available: true,
  },
  {
    id: "digital-kilat",
    no: "07",
    name: "Digital Kilat",
    sub: "Terminal gelap",
    forWho: "Produk digital",
    desc: "Satu-satunya tema gelap, mono presisi.",
    available: true,
  },
  {
    id: "konsultan-tenang",
    no: "08",
    name: "Konsultan Tenang",
    sub: "Satu kolom lapang",
    forWho: "Jasa profesional",
    desc: "Serif lembut, CTA kalem tapi jelas.",
    available: true,
  },
];

/** ID tema yang punya komponen presentasi (selain "klasik" = legacy). */
export const ENGINE_THEMES = [
  "warung-rame",
  "kopi-sore",
  "butik-rapi",
  "jasa-kilat",
  "dapur-ngebul",
  "kriya-asli",
  "digital-kilat",
  "konsultan-tenang",
] as const;

export function isEngineTheme(id: string | null | undefined): boolean {
  return !!id && (ENGINE_THEMES as readonly string[]).includes(id);
}

export function themeName(id: string | null | undefined): string {
  return THEMES.find((t) => t.id === id)?.name ?? "Klasik";
}
