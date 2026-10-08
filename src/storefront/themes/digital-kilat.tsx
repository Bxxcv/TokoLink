/**
 * Tema 7 — "Digital Kilat" (produk digital).
 * Terminal presisi, gelap. SEMUA data dari props.
 * Deviasi jujur dari brief: TANPA klaim "unduh otomatis/kirim otomatis"
 * (tidak ada pengiriman otomatis di platform) — strip hanya fakta jam.
 */
import { useState } from "react";
import { rupiah } from "../../lib/format";
import type { Product } from "../../lib/shop";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { hasPhoto, nextOpenText, skuShort } from "./shared";

const BG = "#0E1116";
const SURFACE = "#171C23";
const INK = "#EDF1F5";
const MUTED = "#8FA0B0";
const ACCENT = "#F2B01E";
const ON_ACCENT = "#0E1116";
const BUKA = "#38D17E";
const TUTUP = "#F0655A";
const HABIS = "#7A8797";
const LINE = "rgba(237,241,245,.14)";
const DISPLAY = "'Space Grotesk', 'Helvetica Neue', ui-sans-serif, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

function Row({ p, slug, canAdd, closed, onAdd }: { p: Product; slug: string; canAdd: boolean; closed: boolean; onAdd: (p: Product) => void }) {
  const out = p.stock === 0;
  const dead = !canAdd || out;
  return (
    <div className="flex items-center gap-3" style={{ minHeight: 88, padding: "12px 0", borderBottom: `1px solid ${LINE}` }}>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 6, overflow: "hidden", display: "grid", placeItems: "center", background: "#0E1116", border: "1px solid rgba(237,241,245,.16)" }}>
        {hasPhoto(p.img) ? (
          <img src={p.img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <span className="tnum" style={{ fontFamily: MONO, fontSize: 9, color: MUTED, padding: 4, textAlign: "center", wordBreak: "break-all", lineHeight: 1.5 }}>
            {skuShort(p.sku, p.id)}
          </span>
        )}
      </a>
      <div className="min-w-0 flex-1">
        <a href={`#/s/${slug}/p/${p.id}`} style={{ fontSize: 14, fontWeight: 500, color: INK, textDecoration: "none", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {p.name}
        </a>
        <div className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {p.cat} · {skuShort(p.sku, p.id)}
        </div>
        {p.desc ? (
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.desc}</div>
        ) : null}
      </div>
      <div className="shrink-0 text-right">
        <div className="tnum" style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: ACCENT }}>{rupiah(p.price)}</div>
        <div className="tnum" style={{ fontFamily: MONO, fontSize: 10, marginTop: 3, color: out ? "#fff" : closed ? HABIS : p.stock <= 5 ? ACCENT : MUTED, background: out ? TUTUP : undefined, borderRadius: out ? 3 : undefined, padding: out ? "2px 5px" : undefined, display: "inline-block" }}>
          {out ? "HABIS" : closed ? "TUTUP" : `STK ${p.stock}`}
        </div>
        <div style={{ marginTop: 6 }}>
          {dead ? (
            <div className="tnum" style={{ width: 72, height: 44, borderRadius: 6, display: "grid", placeItems: "center", fontFamily: MONO, fontSize: 11, fontWeight: 600, background: "#262C34", color: HABIS }}>
              {closed ? "CLOSED" : "SOLD OUT"}
            </div>
          ) : (
            <button
              onClick={() => onAdd(p)}
              aria-label={`Tambah ${p.name}`}
              className="tnum"
              style={{ width: 72, height: 44, border: "none", borderRadius: 6, background: ACCENT, color: ON_ACCENT, fontFamily: MONO, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              + ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DigitalKilat(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, avatarUrl, closed,
    items, allItems, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink, openNow, todayHours, hourRows,
    showHours, showQR, showCart, cartCount, onAdd,
    qrData, onOpenQR, onShare, shared,
  } = p;
  const canAdd = showCart && !closed;
  const [hoursOpen, setHoursOpen] = useState(false);
  const dirty = q.trim() !== "" || cat !== "Semua";
  const nextOpen = closed ? nextOpenText(hourRows, todayHours) : null;

  return (
    <div style={{ background: BG, color: INK, fontFamily: MONO, fontSize: 13, lineHeight: 1.55, minHeight: "100vh" }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: SURFACE, borderBottom: `1px solid ${LINE}` }}>
        <div className="flex items-center gap-2.5 px-4" style={{ height: 52 }}>
          <span className="grid h-[26px] w-[26px] shrink-0 place-items-center overflow-hidden" style={{ borderRadius: 4, background: ACCENT, color: ON_ACCENT, fontFamily: DISPLAY, fontWeight: 700, fontSize: 12 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{storeName}</span>
            {city ? <span className="block truncate" style={{ fontSize: 11, color: MUTED }}>/ {city}</span> : null}
          </span>
          <span className="tnum" style={{ fontSize: 11, fontWeight: 600, color: openNow === false || closed ? TUTUP : BUKA }}>
            <span aria-hidden style={{ display: "inline-block", width: 5, height: 5, borderRadius: 99, background: "currentColor", marginRight: 5 }} />
            {openNow === false || closed ? "TUTUP" : "BUKA"}
          </span>
          {showQR && (
            <button onClick={onOpenQR} aria-label="QR toko" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: `1px solid ${LINE}`, borderRadius: 6, color: INK, cursor: "pointer" }}>
              <Icon name="qr" size={18} />
            </button>
          )}
          <button onClick={onShare} aria-label="Bagikan" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: `1px solid ${LINE}`, borderRadius: 6, color: INK, cursor: "pointer" }}>
            <Icon name={shared ? "check" : "external"} size={18} />
          </button>
          {showCart && (
            <a href="#/cart" aria-label="Keranjang" className="tnum" style={{ minWidth: 44, height: 44, display: "grid", placeItems: "center", color: INK, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
              [{cartCount}]
            </a>
          )}
          {showQR && qrData && (
            <span className="hidden items-center gap-2 lg:flex" style={{ fontSize: 10, color: MUTED }}>
              QR
              <img src={qrData} alt="" width={96} height={96} style={{ width: 96, height: 96, display: "block", borderRadius: 4 }} />
            </span>
          )}
        </div>
        <div className="px-4 pb-2 md:hidden tnum" style={{ fontSize: 11, color: MUTED }}>
          {closed ? <>TUTUP{nextOpen ? ` · ${nextOpen}` : ""}</> : todayHours || `${allItems.length} produk`}
        </div>
      </header>

      {/* bio strip */}
      <div className="px-4 tnum" style={{ paddingTop: 12, fontSize: 12, color: MUTED }}>
        <span aria-hidden style={{ color: ACCENT }}>{"> "}</span>
        {bio || `${city ? `/${city} · ` : "/"}${allItems.length} produk`}
      </div>

      {/* strip tutup */}
      {closed && (
        <div className="mx-4 tnum" style={{ marginTop: 10, minHeight: 40, display: "flex", alignItems: "center", padding: "10px 12px", border: `1px solid ${TUTUP}66`, borderRadius: 6, fontSize: 12, color: INK }}>
          Etalase sedang tutup. Pesanan tidak bisa dibuat{nextOpen ? ` · ${nextOpen}` : ""}.
        </div>
      )}

      {/* tautan */}
      {bioLinks.length > 0 ? (
        <div className="px-4" style={{ marginTop: 12 }}>
          {bioLinks.map((l) => (
            <button key={l.id} onClick={() => onOpenBioLink(l)} className="flex w-full items-center gap-2.5 text-left" style={{ minHeight: 40, background: "none", border: "none", borderBottom: `1px solid ${LINE}`, padding: "9px 0", cursor: "pointer", color: INK }}>
              <Icon name={iconForLink(l.icon)} size={15} />
              <span className="min-w-0 flex-1 truncate" style={{ fontSize: 12.5 }}>{l.label}</span>
              <span className="max-w-[40%] truncate" style={{ fontSize: 11, color: MUTED }}>{l.url.replace(/^https?:\/\//, "")}</span>
              <span aria-hidden style={{ color: MUTED }}>→</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4" aria-hidden style={{ marginTop: 12, borderTop: `1px solid ${LINE}` }} />
      )}

      {/* jam */}
      {showHours && (
        <div className="px-4" style={{ marginTop: 10 }}>
          <button onClick={() => setHoursOpen((o) => !o)} aria-expanded={hoursOpen} className="tnum" style={{ background: "none", border: "none", padding: "8px 0", fontSize: 12, color: INK, cursor: "pointer" }}>
            {todayHours || (openNow === false ? "TUTUP HARI INI" : "JAM")} · 7 hari {hoursOpen ? "▾" : "▸"}
          </button>
          {hoursOpen && hourRows.length > 0 && (
            <ul className="tnum" style={{ margin: "4px 0 0", padding: 0, listStyle: "none", fontSize: 12 }}>
              {hourRows.map((h) => (
                <li key={h.day} style={{ display: "grid", gridTemplateColumns: "52px 1fr", padding: "5px 0", borderBottom: `1px solid ${LINE}`, color: h.on ? INK : MUTED, fontWeight: h.text === todayHours ? 700 : 400 }}>
                  <span>{h.day.slice(0, 3).toUpperCase()}</span>
                  <span>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* filter */}
      <div className="px-4" style={{ marginTop: 12 }}>
        <div className="flex items-center gap-2" style={{ borderBottom: `1px solid ${LINE}`, paddingBottom: 6 }}>
          <span aria-hidden style={{ color: ACCENT }}>[&gt;]</span>
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="ketik nama atau SKU…"
            aria-label="Cari produk"
            style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontFamily: MONO, fontSize: 13, color: INK }}
          />
          <button
            onClick={onResetFilter}
            disabled={!dirty}
            style={{ height: 40, padding: "0 12px", borderRadius: 4, border: `1px solid ${dirty ? `${TUTUP}88` : LINE}`, background: "none", color: dirty ? TUTUP : HABIS, fontFamily: MONO, fontSize: 11, fontWeight: 600, cursor: dirty ? "pointer" : "default", opacity: dirty ? 1 : 0.6 }}
          >
            RESET
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2" style={{ marginTop: 8 }}>
          {cats.map((c, i) => (
            <span key={c} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden style={{ color: MUTED }}>|</span>}
              <button
                onClick={() => onCat(c)}
                style={{ background: cat === c ? `${ACCENT}1F` : "none", border: "none", padding: "8px 4px", fontFamily: MONO, fontSize: 12, color: cat === c ? ACCENT : MUTED, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {c} <span className="tnum">({c === "Semua" ? allItems.length : allItems.filter((x) => x.cat === c).length})</span>
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* daftar */}
      <main className="px-4" style={{ paddingBottom: 24 }}>
        {loading ? (
          <div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3" style={{ minHeight: 88, borderBottom: `1px solid ${LINE}` }}>
                <div style={{ width: 64, height: 64, borderRadius: 6, background: "rgba(237,241,245,.08)" }} />
                <div style={{ flex: 1, display: "grid", gap: 8 }}>
                  <div style={{ height: 13, background: "rgba(237,241,245,.1)", borderRadius: 3 }} />
                  <div style={{ height: 11, width: "50%", background: "rgba(237,241,245,.08)", borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="tnum" style={{ textAlign: "center", padding: "48px 20px", border: "1px dashed rgba(237,241,245,.25)", borderRadius: 8, marginTop: 12, fontSize: 13 }}>
            {q || cat !== "Semua" ? `> 0 hasil untuk “${q || cat}”` : "> belum ada produk. tambahkan lewat dasbor."}
            {(q || cat !== "Semua") && (
              <div>
                <button onClick={onResetFilter} style={{ marginTop: 12, height: 44, padding: "0 22px", border: "none", borderRadius: 6, background: ACCENT, color: ON_ACCENT, fontFamily: MONO, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  RESET
                </button>
              </div>
            )}
          </div>
        ) : (
          items.map((item) => <Row key={item.id} p={item} slug={slug} canAdd={canAdd} closed={closed} onAdd={onAdd} />)
        )}
      </main>

      <footer className="tnum" style={{ textAlign: "center", padding: "0 16px 40px", fontSize: 11, color: MUTED }}>
        {storeName}{city ? ` · ${city}` : ""}
        <br />Dibuat dengan TokoLink
      </footer>
    </div>
  );
}
