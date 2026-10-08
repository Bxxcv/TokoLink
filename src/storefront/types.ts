/**
 * Theme Engine — kontrak data antara halaman toko dan tema presentasi.
 *
 * ATURAN:
 * - Tema HANYA menerima props ini. Tema tidak boleh query Supabase,
 *   tidak boleh menyentuh auth/cart/checkout langsung.
 * - Semua data di sini 100% dari database (via StoreHome). Tidak ada
 *   teks/nama/harga contoh — kalau data kosong, tampilkan empty state.
 * - Alur beli tetap satu: onAdd() → keranjang global → /cart →
 *   checkout → QRIS. Tema tidak boleh mengalihkan order ke WhatsApp.
 */
import type { Product } from "../lib/shop";

export interface ThemeBioLink {
  id: string;
  label: string;
  url: string;
  icon: string | null;
}

export interface ThemeHourRow {
  day: string;
  text: string;
  on: boolean;
}

export interface ThemeStorefrontProps {
  /** slug toko, mis. "dapoer-bu-ani" */
  slug: string;
  storeName: string;
  city: string;
  bio: string | null;
  waNumber: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  /** true bila seller menutup toko manual (is_closed) */
  closed: boolean;

  /** produk yang SUDAH difilter kategori + pencarian (siap render) */
  items: Product[];
  /** SEMUA produk aktif toko (untuk hitungan per kategori, tidak difilter) */
  allItems: Product[];
  cats: string[];
  cat: string;
  onCat: (c: string) => void;
  q: string;
  onQ: (v: string) => void;
  onResetFilter: () => void;
  loading: boolean;

  bioLinks: ThemeBioLink[];
  onOpenBioLink: (l: ThemeBioLink) => void;

  /** badge buka/tutup: null = belum tahu, true/false = hasil hitung */
  openNow: boolean | null;
  todayHours: string;
  hourRows: ThemeHourRow[];

  /** pengaturan dari store_theme */
  accent: string;
  showHours: boolean;
  showQR: boolean;
  showCart: boolean;

  cartCount: number;
  onAdd: (p: Product) => void;
  onChatWA: () => void;

  /** QR toko (data URL, sudah digenerate StoreHome) + aksi modal */
  qrData: string;
  onOpenQR: () => void;
  onShare: () => void;
  shared: boolean;
}
