/** Ambil digit saja — untuk disimpan di state/DB. */
export const digitsOnly = (v: string) => v.replace(/\D/g, "");

/** Tampilkan ribuan ala Indonesia saat mengetik: "85000" → "85.000". */
export const formatRibuan = (v: string) => {
  const d = digitsOnly(v);
  if (!d) return "";
  return Number(d).toLocaleString("id-ID");
};

/**
 * Normalisasi nomor WhatsApp saat mengetik: buang spasi/strip/titik,
 * sisakan digit (+ di depan dipertahankan). Contoh: "0812-3456-7890"
 * → "081234567890".
 */
export const normalizeWA = (v: string) => {
  const t = v.trim();
  const plus = t.startsWith("+") ? "+" : "";
  return plus + t.replace(/\D/g, "");
};

/** Valid: 08…, 628…, atau +62… dengan total digit wajar. */
export const isValidWA = (v: string) => /^(?:\+?62|0)8\d{7,12}$/.test(v.replace(/[\s.-]/g, ""));
