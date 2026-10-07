/**
 * Theme Engine — util bersama 8 tema etalase baru (Okt 2026).
 * Aturan: tema hanya presentasi (props), tidak query/ auth/ cart langsung.
 * Semua teks/angka di tema HARUS dari props — tidak ada karangan.
 */
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeBioLink, ThemeHourRow } from "../types";

export function ThemeBioLinks({
  links,
  onOpen,
}: {
  links: ThemeBioLink[];
  onOpen: (l: ThemeBioLink) => void;
}) {
  if (links.length === 0) return null;
  return (
    <div className="mt-4">
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: 0.6,
          marginBottom: 10,
        }}
      >
        Tautan
      </div>
      <div className="grid gap-2">
        {links.map((l) => (
          <button
            key={l.id}
            onClick={() => onOpen(l)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[13.5px] font-semibold transition-opacity hover:opacity-75"
            style={{ borderStyle: "solid", borderWidth: 1, borderColor: "currentColor", opacity: 1 }}
          >
            <span style={{ opacity: 0.75, display: "inline-flex" }}>
              <Icon name={iconForLink(l.icon)} size={15} />
            </span>
            <span className="min-w-0 flex-1 truncate">{l.label}</span>
            <span aria-hidden>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** "buka Sabtu 09.00" dari hourRows (Senin dulu). null bila tak diketahui. */
export function nextOpenText(hourRows: ThemeHourRow[], todayHours: string): string | null {
  if (hourRows.length === 0) return null;
  const wib = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const today = (wib.getDay() + 6) % 7;
  for (let k = 0; k < 7; k++) {
    const idx = (today + k) % 7;
    const row = hourRows[idx];
    if (row && row.on && row.text && !/libur/i.test(row.text)) {
      if (k === 0 && todayHours) return `hari ini ${todayHours}`;
      const time = row.text.split("–")[0].trim();
      return `buka ${row.day} ${time}`;
    }
  }
  return null;
}

/** SKU pendek untuk label mono. */
export function skuShort(sku: string, id: string): string {
  return (sku || `#${id.slice(0, 6)}`).toUpperCase();
}

/** true bila produk memang tidak punya foto (fallback bawaan mapProduct). */
export function hasPhoto(img: string): boolean {
  return !!img && img !== "images/p-lapis.jpg";
}
