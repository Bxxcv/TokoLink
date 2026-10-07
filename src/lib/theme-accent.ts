/**
 * Warna aksen toko (store_theme.accent → hex). Dipakai StoreHome (klasik),
 * Checkout, dan pratinjau dasbor — satu sumber, jangan duplikasi map ini.
 * Tema engine baru punya palet sendiri (abaikan aksen ini).
 */
export const ACCENT_HEX: Record<string, string> = {
  Biru: "#0A69C4",
  Navy: "#0B2E6E",
  Toska: "#1B9AE0",
  Hijau: "#0E9F6E",
  "Jingga hangat": "#B45309",
};

export function accentHex(name: string | null | undefined): string {
  return ACCENT_HEX[name ?? ""] ?? "#0A69C4";
}
