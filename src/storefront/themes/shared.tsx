/**
 * Theme Engine — blok tautan bio BERSAMA untuk semua tema (BUG-023).
 *
 * 7 dari 8 tema sebelumnya tidak merender `bioLinks` sama sekali padahal
 * datanya sudah dikirim StoreHome. Komponen netral ini dipakai semua tema
 * supaya fitur link-in-bio tidak hilang diam-diam saat seller ganti tema.
 * Styling sengaja netral agar cocok di semua palet.
 */
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeBioLink } from "../types";

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
