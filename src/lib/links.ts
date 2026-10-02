/**
 * Deteksi ikon tautan bio — SATU-SATUNYA tempat logic ini berada.
 *
 * Dipakai oleh: halaman BioLinks (dashboard, saat seller ketik URL),
 * halaman toko publik (StoreHome + semua tema storefront).
 * Jangan duplikasi logic ini di file tema manapun — import dari sini.
 */

/** Kunci ikon kanonis yang disimpan di kolom `bio_links.icon`. */
export type LinkIconKey =
  | "wa"
  | "ig"
  | "fb"
  | "tt"
  | "yt"
  | "tg"
  | "shop"
  | "doc"
  | "link";

/**
 * Tentukan ikon dari URL. Urutan pengecekan penting: pola yang lebih
 * spesifik dulu (mis. wa.me sebelum pola umum).
 */
export function detectLinkIcon(url: string): LinkIconKey {
  const u = url.trim().toLowerCase();
  if (u.includes("wa.me") || u.includes("whatsapp.com") || u.includes("chat.whatsapp.com")) return "wa";
  if (u.includes("instagram.com")) return "ig";
  if (u.includes("facebook.com") || u.includes("fb.com") || u.includes("fb.watch")) return "fb";
  if (u.includes("tiktok.com")) return "tt";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "yt";
  if (u.includes("t.me") || u.includes("telegram.me") || u.includes("telegram.org")) return "tg";
  if (u.includes("shopee.")) return "shop";
  if (u.includes("tokopedia.com")) return "shop";
  if (u.endsWith(".pdf")) return "doc";
  return "link";
}

/**
 * Petakan kunci ikon ke nama ikon di komponen `Icon` (components/ui.tsx).
 * Kunci lama tetap didukung: "doc" → "receipt".
 */
export function iconForLink(key: string | null | undefined): string {
  switch (key) {
    case "wa":
    case "ig":
    case "fb":
    case "tt":
    case "yt":
    case "tg":
    case "shop":
    case "link":
      return key;
    case "doc":
      return "receipt";
    default:
      return "link";
  }
}

/** Label manusiawi untuk kunci ikon (dipakai di dashboard). */
export function linkIconLabel(key: string | null | undefined): string {
  switch (key) {
    case "wa":
      return "WhatsApp";
    case "ig":
      return "Instagram";
    case "fb":
      return "Facebook";
    case "tt":
      return "TikTok";
    case "yt":
      return "YouTube";
    case "tg":
      return "Telegram";
    case "shop":
      return "Marketplace";
    case "doc":
      return "Dokumen";
    default:
      return "Tautan";
  }
}
