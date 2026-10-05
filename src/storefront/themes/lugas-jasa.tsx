/**
 * Tema 03 — "Lugas Jasa" (daftar utilitarian).
 *
 * Diport dari desain_toko_seller (layout "list"): rail kategori + tabel
 * layanan bersudut siku, radius 0, tanpa bayangan. SEMUA data dari props.
 *
 * Penyesuaian jujur dari showcase (yang memakai data contoh):
 * - Kode layanan = SKU asli produk (fallback: potongan ID).
 * - Kolom "durasi" = satuan/kategori asli; tidak ada klaim menit/jam palsu.
 * - Panel "slot" = jam operasional asli (store_hours), bukan jam slot contoh.
 */
import { useMemo } from "react";
import { rupiah, type Product } from "../../lib/data";
import type { ThemeStorefrontProps } from "../types";
import { ThemeBioLinks } from "./shared";

const PAPER = "#EDF1F4";
const PANEL = "#FFFFFF";
const INK = "#121A21";
const INK_SOFT = "#5D6874";
const LINE = "#C9D3DB";
const ACCENT = "#1B5E8C";
const ACCENT_INK = "#FFFFFF";
const OK = "#2E7D4F";
const SANS = "'IBM Plex Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

function codeOf(p: Product): string {
  return (p.sku || p.id.slice(0, 6)).toUpperCase();
}

function Row({
  p, slug, canAdd, onAdd,
}: {
  p: Product; slug: string; canAdd: boolean; onAdd: (p: Product) => void;
}) {
  const out = p.stock === 0;
  return (
    <div className="grid items-center gap-x-4 gap-y-2 py-4 lg:grid-cols-[92px_minmax(0,1fr)_120px_118px_96px]" style={{ borderBottom: `1px solid ${LINE}` }}>
      <span className="tnum order-1" style={{ fontFamily: MONO, fontSize: 12, color: ACCENT, letterSpacing: "0.02em" }}>
        {codeOf(p)}
      </span>
      <span className="order-3 min-w-0 lg:order-2" style={{ minWidth: 0 }}>
        <a href={`#/s/${slug}/p/${p.id}`} style={{ fontSize: 16.5, fontWeight: 600, color: INK, textDecoration: "none" }}>
          {p.name}
        </a>
        <span style={{ display: "block", fontSize: 12.5, color: INK_SOFT, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {p.desc ? p.desc.slice(0, 90) : p.cat}{out ? " · Stok habis" : p.stock <= 15 ? ` · Sisa ${p.stock}` : ""}
        </span>
      </span>
      <span className="tnum order-2 lg:order-3" style={{ fontFamily: MONO, fontSize: 12.5, color: INK_SOFT }}>
        {p.unit || p.cat}
      </span>
      <span className="tnum order-4" style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600, color: INK }}>
        {rupiah(p.price)}
      </span>
      <span className="order-5">
        {canAdd && !out ? (
          <button
            onClick={() => onAdd(p)}
            aria-label={`Pilih ${p.name}`}
            style={{ width: "100%", border: `1px solid ${LINE}`, background: "transparent", color: INK, padding: "9px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
          >
            Pilih
          </button>
        ) : (
          <span style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT }}>{out ? "Habis" : ""}</span>
        )}
      </span>
    </div>
  );
}

export function LugasJasa(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, avatarUrl, closed,
    items, allItems, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink,
    showHours, showCart, cartCount, onAdd, onChatWA, onShare, shared,
    openNow, todayHours, hourRows,
  } = p;
  const canAdd = showCart && !closed;

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of allItems) m.set(it.cat, (m.get(it.cat) ?? 0) + 1);
    return m;
  }, [allItems]);

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: SANS, fontSize: 14, lineHeight: 1.5, minHeight: "100vh" }}>
      {/* header */}
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 pb-5 pt-6 lg:px-8 lg:pt-7" style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="flex min-w-0 items-center gap-4">
          <span aria-hidden style={{ width: 46, height: 46, display: "grid", placeItems: "center", background: ACCENT, color: ACCENT_INK, fontWeight: 700, fontSize: 18, flexShrink: 0, overflow: "hidden" }}>
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (storeName || "T").slice(0, 1).toUpperCase()}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {storeName}
            </div>
            <div className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, marginTop: 5, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              tokolink.store/s/{slug}{city ? ` · ${city}` : ""}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {showHours && (
            <span className="flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 11.5, color: INK }}>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: 99, background: openNow === false ? "#B23A22" : OK, display: "inline-block" }} />
              {openNow === false ? "Tutup" : todayHours || "Buka"}
            </span>
          )}
          <button onClick={onChatWA} style={{ background: ACCENT, color: ACCENT_INK, border: "none", padding: "13px 18px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Chat WhatsApp
          </button>
          <button onClick={onShare} style={{ border: `1px solid ${LINE}`, background: "transparent", color: INK, padding: "12px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {shared ? "Tersalin" : "Bagikan"}
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* rail kategori */}
        <aside className="shrink-0 lg:w-[264px]" style={{ borderBottom: `1px solid ${LINE}`, padding: "18px 0" }}>
          <div className="flex gap-2 overflow-x-auto px-5 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
            <span className="hidden px-5 pb-3 lg:block" style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: INK_SOFT }}>
              Kategori
            </span>
            {cats.map((c) => {
              const active = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => onCat(c)}
                  className="flex shrink-0 items-center justify-between gap-3 text-left lg:w-full"
                  style={{ padding: "10px 14px", border: `1px solid ${LINE}`, borderLeft: `3px solid ${active ? ACCENT : LINE}`, background: active ? ACCENT : "transparent", color: active ? ACCENT_INK : INK, fontSize: 13.5, fontWeight: active ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {c}
                  <span className="tnum" style={{ fontFamily: MONO, fontSize: 11, opacity: 0.7 }}>
                    {c === "Semua" ? allItems.length : (counts.get(c) ?? 0)}
                  </span>
                </button>
              );
            })}
          </div>
          {bio && (
            <p style={{ margin: "18px 20px 0", borderTop: `1px solid ${LINE}`, paddingTop: 14, fontFamily: MONO, fontSize: 11.5, color: INK_SOFT, lineHeight: 1.7 }}>
              {bio}
            </p>
          )}
          <div style={{ margin: "0 20px" }}>
            <ThemeBioLinks links={bioLinks} onOpen={onOpenBioLink} />
          </div>
        </aside>

        {/* tabel */}
        <main className="min-w-0 flex-1" style={{ padding: "20px 20px 30px" }}>
          <div className="relative mb-2">
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Cari layanan/barang…"
              aria-label="Cari layanan"
              style={{ width: "100%", border: `1px solid ${LINE}`, background: PANEL, padding: "11px 12px", fontSize: 13.5, fontFamily: SANS, color: INK, outline: "none" }}
            />
          </div>
          <div className="hidden items-center lg:grid" style={{ gridTemplateColumns: "92px 1fr 120px 118px 96px", gap: 16, paddingBottom: 10, borderBottom: `2px solid ${INK}` }}>
            {["Kode", "Layanan", "Satuan", "Biaya", ""].map((h, i) => (
              <span key={h + i} style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: INK_SOFT }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ padding: "16px 0", borderBottom: `1px solid ${LINE}`, display: "grid", gap: 8 }}>
                  <div style={{ height: 16, width: "50%", background: "#DDE5EA" }} />
                  <div style={{ height: 12, width: "35%", background: "#DDE5EA" }} />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: "44px 12px", textAlign: "center", borderBottom: `1px solid ${LINE}` }}>
              <div style={{ fontWeight: 700, fontSize: 19 }}>Tidak ada yang cocok</div>
              <p style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, marginTop: 8 }}>
                {q ? `Tidak ada yang cocok dengan “${q}”.` : "Belum ada item di kategori ini."}
              </p>
              <button onClick={onResetFilter} style={{ marginTop: 16, background: ACCENT, color: ACCENT_INK, border: "none", padding: "11px 22px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Tampilkan semua
              </button>
            </div>
          ) : (
            items.map((item) => <Row key={item.id} p={item} slug={slug} canAdd={canAdd} onAdd={onAdd} />)
          )}

          {/* panel jam + keranjang */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start" style={{ marginTop: 24, background: PANEL, border: `1px solid ${LINE}`, padding: "18px 20px" }}>
            {showHours && (
              <div className="flex-1" style={{ minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: INK_SOFT }}>Jam operasional</span>
                {hourRows.length > 0 ? (
                  <ul style={{ marginTop: 10, display: "grid", gap: 6 }}>
                    {hourRows.map((h) => (
                      <li key={h.day} className="flex items-baseline justify-between gap-3" style={{ fontSize: 13, color: h.on ? INK : INK_SOFT }}>
                        <span style={{ fontWeight: 600 }}>{h.day}</span>
                        <span className="tnum" style={{ fontFamily: MONO, fontSize: 12 }}>{h.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, marginTop: 10 }}>Belum diatur penjual.</p>
                )}
              </div>
            )}
            {showCart && (
              <div className="sm:border-l sm:pl-5" style={{ borderColor: LINE }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: INK_SOFT }}>Keranjang</span>
                <div className="tnum" style={{ fontFamily: MONO, fontSize: 20, marginTop: 8, fontWeight: 600 }}>{cartCount} item</div>
                <a href="#/cart" style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 700, color: ACCENT }}>
                  Lanjut ke keranjang →
                </a>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 lg:px-8" style={{ borderTop: `2px solid ${INK}` }}>
        <span className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT }}>
          Bayar via QRIS{city ? ` · ${city}` : ""}
        </span>
        {showCart && cartCount > 0 && (
          <a href="#/cart" className="tnum lg:hidden" style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: ACCENT }}>
            Keranjang ({cartCount}) →
          </a>
        )}
      </footer>
    </div>
  );
}
