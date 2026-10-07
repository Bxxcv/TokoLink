import { useState } from "react";
import { Monitor, Smartphone, Store, ToggleLeft, ToggleRight, Type } from "lucide-react";
import type { ThemeDef } from "../lib/data";
import { Storefront, type CatalogState } from "./Storefront";
import { SpecSheet } from "./SpecSheet";

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { v: T; l: string; icon?: React.ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-[10px] border border-ink/15 bg-white/70 p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className="tap inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[11.5px] font-semibold whitespace-nowrap"
          style={{ background: value === o.v ? "#16181A" : "transparent", color: value === o.v ? "#F3F3EC" : undefined }}
        >
          {o.icon}
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function ThemeSection({ theme }: { theme: ThemeDef }) {
  const [mode, setMode] = useState<"mobile" | "desktop">("mobile");
  const [closed, setClosed] = useState(false);
  const [catalogState, setCatalogState] = useState<CatalogState>("normal");

  const forcedClosed = closed || !theme.store.open;

  return (
    <section id={`tema-${theme.n}`} className="scroll-mt-24">
      <div className="overflow-hidden rounded-[20px] border border-ink/12 bg-paper2/80 shadow-[0_18px_46px_-30px_rgba(16,20,18,.5)] backdrop-blur-[2px]">
        {/* judul tema */}
        <div
          className="relative flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 px-4 py-4 sm:px-6"
          style={{ background: `linear-gradient(120deg, ${theme.palette.bg} 0%, ${theme.palette.surface} 62%, ${theme.palette.bg} 100%)` }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-docmono text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: theme.palette.muted }}>
              <span className="grid h-6 w-6 place-items-center rounded-[6px] text-[11px]" style={{ background: theme.palette.accent, color: theme.onAccent }}>
                {theme.n}
              </span>
              Tema {theme.n}
              <span className="hidden sm:inline">· {theme.mood}</span>
            </div>
            <h3
              className="mt-1.5 text-[30px] leading-[1.02] font-extrabold tracking-[-0.03em] sm:text-[42px]"
              style={{ fontFamily: theme.fonts.displayStack, color: theme.palette.text }}
            >
              {theme.name}
            </h3>
            <p className="mt-1.5 max-w-[54ch] text-[13px] leading-relaxed" style={{ color: theme.palette.muted }}>
              {theme.sasaran}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[theme.palette.bg, theme.palette.surface, theme.palette.text, theme.palette.muted, theme.palette.accent].map((c, i) => (
              <span
                key={c}
                className="h-7 w-7 rounded-[7px] border border-ink/15 transition hover:scale-110"
                style={{ background: c }}
                title={["latar", "permukaan", "teks", "redup", "aksen"][i] + " " + c}
              />
            ))}
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white/70 px-2 py-1 font-docmono text-[10.5px]">
              <Type size={11} /> {theme.fonts.display.split(" ")[0]} + {theme.fonts.body.split(" ")[0]}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white/70 px-2 py-1 font-docmono text-[10.5px]">
              <Store size={11} /> {theme.store.products.length} produk · {theme.store.links.length} tautan
            </span>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,404px)_minmax(0,1fr)]">
          {/* ============kolom pratinjau ============ */}
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Seg
                value={mode}
                onChange={(v) => setMode(v)}
                options={[
                  { v: "mobile", l: "HP 360px", icon: <Smartphone size={13} /> },
                  { v: "desktop", l: "Desktop", icon: <Monitor size={13} /> },
                ]}
              />
              <button
                type="button"
                onClick={() => setClosed((c) => !c)}
                className="tap inline-flex items-center gap-1.5 rounded-[10px] border border-ink/15 bg-white/70 px-2.5 py-1.5 text-[11.5px] font-semibold"
                title="Pratinjau keadaan toko tutup (mematikan tombol beli)"
              >
                {closed ? <ToggleRight size={15} className="text-signal" /> : <ToggleLeft size={15} className="text-ink/40" />}
                paksa TUTUP
              </button>
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-1.5 font-docmono text-[11px]">
              <span className="text-ink/50">keadaan:</span>
              {(
                [
                  { v: "normal", l: "katalog normal" },
                  { v: "no-products", l: "toko tanpa produk" },
                  { v: "no-results", l: "hasil cari 0" },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setCatalogState(o.v)}
                  className="tap rounded-full border px-2.5 py-1"
                  style={{
                    borderColor: catalogState === o.v ? "#0E7C6B" : "rgba(22,24,26,.15)",
                    background: catalogState === o.v ? "rgba(14,124,107,.12)" : "rgba(255,255,255,.6)",
                    color: catalogState === o.v ? "#0E7C6B" : undefined,
                  }}
                >
                  {o.l}
                </button>
              ))}
            </div>

            {/* bingkai perangkat */}
            <div className="flex justify-center">
              <div
                className="w-full max-w-[396px] rounded-[30px] border border-ink/25 p-[9px] shadow-[0_30px_60px_-34px_rgba(10,14,12,.8)]"
                style={{ background: "#0F1214", maxWidth: mode === "mobile" ? 396 : "100%" }}
              >
                <div className="flex items-center gap-2 px-2 pb-2">
                  <span className="h-2 w-2 rounded-full bg-white/25" />
                  <span className="h-2 w-2 rounded-full bg-white/25" />
                  <span className="h-2 w-2 rounded-full bg-white/25" />
                  <span className="mx-auto truncate rounded-full bg-white/8 px-3 py-[3px] font-docmono text-[10px] text-white/50">
                    tokolink.id/{theme.store.slug} {forcedClosed ? "· status: TUTUP" : "· status: BUKA"}
                  </span>
                </div>
                <div className="overflow-hidden" style={{ borderRadius: mode === "mobile" ? 22 : 10, height: mode === "mobile" ? 700 : 660 }}>
                  <Storefront theme={theme} mode={mode} forceClosed={closed} catalogState={catalogState} />
                </div>
              </div>
            </div>

            <p className="mt-2.5 text-[11px] leading-relaxed text-ink/55">
              Kontrol “paksa TUTUP” dan “keadaan” hanya ada di panel desain ini — tidak ada di halaman toko
              sungguhan. Coba ketik di kolom cari, ganti kategori, dan tekan Tambah: keranjang, cap stok, dan
              tombol mati benar-benar merespons.
            </p>
          </div>

          {/* ============ kolom spesifikasi ============ */}
          <div className="min-w-0">
            <SpecSheet theme={theme} />
          </div>
        </div>
      </div>
    </section>
  );
}
