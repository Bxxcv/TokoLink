/**
 * Tema 1 — "Warung Rame" (kuliner harian).
 * Etalase pasar yang rapat tapi rapi. SEMUA data dari props.
 */
import { useState } from "react";
import { rupiah } from "../../lib/format";
import type { Product } from "../../lib/shop";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { nextOpenText } from "./shared";

const BG = "#FFF7EC";
const SURFACE = "#FFFFFF";
const INK = "#21170F";
const MUTED = "#6B5B4C";
const ACCENT = "#C2380A";
const ON_ACCENT = "#FFFFFF";
const BUKA = "#177C46";
const TUTUP = "#C0261E";
const HABIS = "#8A8178";
const SISA = "#A97400";
const DISPLAY = "'Bricolage Grotesque', 'Trebuchet MS', ui-sans-serif, system-ui, sans-serif";
const BODY = "'Plus Jakarta Sans', 'Segoe UI', ui-sans-serif, system-ui, sans-serif";

function StockCap({ stock, closed }: { stock: number; closed: boolean }) {
  if (closed) return null;
  if (stock === 0)
    return (
      <span style={{ background: HABIS, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 6 }}>
        HABIS
      </span>
    );
  if (stock <= 5)
    return (
      <span style={{ background: "#FFF3D6", color: SISA, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 6 }}>
        SISA {stock}
      </span>
    );
  return null;
}

function Card({ p, slug, canAdd, closed, onAdd }: { p: Product; slug: string; canAdd: boolean; closed: boolean; onAdd: (p: Product) => void }) {
  const out = p.stock === 0;
  const dead = !canAdd || out;
  return (
    <article style={{ background: SURFACE, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(33,23,15,.08)" }}>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ display: "block", position: "relative" }}>
        <img src={p.img} alt="" loading="lazy" style={{ aspectRatio: "1 / 1", width: "100%", objectFit: "cover", display: "block" }} />
        <span style={{ position: "absolute", left: 8, bottom: 8 }}>
          <StockCap stock={p.stock} closed={closed} />
        </span>
      </a>
      <div style={{ padding: 10, opacity: closed ? 0.72 : 1 }}>
        <a href={`#/s/${slug}/p/${p.id}`} style={{ fontSize: 13, fontWeight: 700, color: INK, textDecoration: "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.35, minHeight: 35 }}>
          {p.name}
        </a>
        <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{p.cat}</div>
        <div className="tnum" style={{ fontSize: 15, fontWeight: 800, color: ACCENT, marginTop: 4 }}>{rupiah(p.price)}</div>
        {dead ? (
          <div style={{ marginTop: 8, height: 40, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700, background: closed ? "#EFE9E0" : "rgba(138,129,120,.12)", color: closed ? HABIS : "#6E6357" }}>
            {closed ? "Toko tutup" : "Stok habis"}
          </div>
        ) : (
          <button
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name}`}
            style={{ marginTop: 8, width: "100%", minHeight: 40, padding: "4px 0", border: "none", borderRadius: 12, background: ACCENT, color: ON_ACCENT, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: BODY }}
          >
            Tambah
          </button>
        )}
      </div>
    </article>
  );
}

export function WarungRame(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, avatarUrl, coverUrl, closed,
    items, allItems, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink, openNow, todayHours, hourRows,
    showHours, showQR, showCart, cartCount, onAdd,
    qrData, onOpenQR, onShare, shared,
  } = p;
  const canAdd = showCart && !closed;
  const [more, setMore] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const dirty = q.trim() !== "" || cat !== "Semua";
  const nextOpen = closed ? nextOpenText(hourRows, todayHours) : null;
  const countOf = (c: string) => (c === "Semua" ? allItems.length : allItems.filter((i) => i.cat === c).length);

  return (
    <div style={{ background: BG, color: INK, fontFamily: BODY, fontSize: 14, lineHeight: 1.5, minHeight: "100vh" }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: SURFACE, borderBottom: "1px solid rgba(33,23,15,.1)" }}>
        <div className="flex items-center gap-2.5 px-4" style={{ height: 56 }}>
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full" style={{ background: ACCENT, color: ON_ACCENT, fontFamily: DISPLAY, fontWeight: 800, fontSize: 14 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 17 }}>{storeName}</span>
            {city ? <span className="block truncate" style={{ fontSize: 12, color: MUTED }}>{city}</span> : null}
          </span>
          <span className="tnum" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: "#fff", background: openNow === false || closed ? TUTUP : BUKA, padding: "5px 9px", borderRadius: 999 }}>
            {openNow === false || closed ? "TUTUP" : "BUKA"}
          </span>
          {showQR && (
            <button onClick={onOpenQR} aria-label="QR toko" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", color: INK, cursor: "pointer" }}>
              <Icon name="qr" size={19} />
            </button>
          )}
          <button onClick={onShare} aria-label="Bagikan" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", color: INK, cursor: "pointer" }}>
            <Icon name={shared ? "check" : "external"} size={19} />
          </button>
          {showCart && (
            <a href="#/cart" aria-label="Keranjang" style={{ position: "relative", width: 44, height: 44, display: "grid", placeItems: "center", color: INK }}>
              <Icon name="cart" size={19} />
              {cartCount > 0 && (
                <span className="tnum" style={{ position: "absolute", top: 4, right: 2, minWidth: 17, height: 17, borderRadius: 999, background: ACCENT, color: ON_ACCENT, fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 4px" }}>
                  {cartCount}
                </span>
              )}
            </a>
          )}
        </div>
        <div className="px-4 pb-2 md:hidden" style={{ fontSize: 12, color: MUTED }}>
          {closed ? (
            <>Tutup{nextOpen ? ` · ${nextOpen}` : ""}</>
          ) : (
            <><span aria-hidden style={{ display: "inline-block", width: 7, height: 7, borderRadius: 99, background: BUKA, marginRight: 6 }} />{todayHours || "Buka hari ini"}</>
          )}
        </div>
      </header>

      {/* sampul + profil */}
      {coverUrl && <img src={coverUrl} alt="" style={{ width: "100%", height: 152, objectFit: "cover", display: "block" }} />}
      <div className="px-4" style={{ marginTop: coverUrl ? -18 : 14 }}>
        <div style={{ background: SURFACE, borderRadius: 14, padding: "14px 15px", border: "1px solid rgba(33,23,15,.08)" }}>
          {bio ? (
            <>
              <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, display: "-webkit-box", WebkitLineClamp: more ? 99 : 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>
              {bio.length > 140 && (
                <button onClick={() => setMore((m) => !m)} style={{ background: "none", border: "none", padding: "6px 0 0", color: ACCENT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {more ? "Tutup" : "Selengkapnya"}
                </button>
              )}
            </>
          ) : (
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
              {[city, `${allItems.length} produk di katalog`].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* tautan */}
      {bioLinks.length > 0 && (
        <div className="px-4" style={{ marginTop: 14 }}>
          <div className="micro" style={{ color: MUTED, marginBottom: 8 }}>Ikuti / hubungi</div>
          <div className="grid gap-2">
            {bioLinks.map((l) => {
              const isWA = l.icon === "wa";
              return (
                <button
                  key={l.id}
                  onClick={() => onOpenBioLink(l)}
                  className="flex items-center gap-3 text-left"
                  style={{ minHeight: 52, background: SURFACE, border: "1px solid rgba(33,23,15,.1)", borderLeft: isWA ? "3px solid #1FA855" : undefined, borderRadius: 10, padding: "8px 12px", cursor: "pointer", width: "100%" }}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: "rgba(194,56,10,.1)", color: ACCENT }}>
                    <Icon name={iconForLink(l.icon)} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate" style={{ fontSize: 14, fontWeight: 600 }}>{l.label}</span>
                    <span className="block truncate" style={{ fontSize: 12, color: MUTED }}>{l.url.replace(/^https?:\/\//, "")}</span>
                  </span>
                  <span aria-hidden style={{ color: MUTED }}>›</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* jam */}
      {showHours && (
        <div className="px-4" style={{ marginTop: 12 }}>
          <button onClick={() => setHoursOpen((o) => !o)} aria-expanded={hoursOpen} className="flex w-full items-center gap-2.5" style={{ minHeight: 44, background: "none", border: "none", padding: 0, cursor: "pointer", color: INK, fontSize: 13.5, fontWeight: 700 }}>
            <Icon name="clock" size={17} /> Jam buka
            <span className="tnum" style={{ fontWeight: 400, color: MUTED }}>{todayHours || (openNow === false ? "Tutup hari ini" : "")}</span>
          </button>
          {hoursOpen && hourRows.length > 0 && (
            <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", background: SURFACE, borderRadius: 10, border: "1px solid rgba(33,23,15,.08)", overflow: "hidden" }}>
              {hourRows.map((h) => (
                <li key={h.day} className="tnum flex items-center justify-between" style={{ padding: "9px 12px", fontSize: 13, background: h.text === todayHours ? "rgba(194,56,10,.08)" : undefined }}>
                  <span style={{ fontWeight: h.text === todayHours ? 700 : 400 }}>{h.on ? "● " : ""}{h.day}</span>
                  <span style={{ color: h.on ? INK : TUTUP }}>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* filter (sticky hanya ≥md: tinggi header beda di HP, sticky bakal ketutup) */}
      <div className="px-4 pt-3 md:sticky md:z-30" style={{ top: 56, background: BG, paddingBottom: 10 }}>
        <div className="relative">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Cari nama produk…"
            aria-label="Cari produk"
            style={{ width: "100%", height: 48, borderRadius: 12, border: "1px solid rgba(33,23,15,.14)", background: SURFACE, padding: "0 38px 0 38px", fontSize: 14, color: INK, outline: "none" }}
          />
          {q && (
            <button onClick={() => onQ("")} aria-label="Bersihkan" style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, border: "none", background: "none", color: MUTED, cursor: "pointer", fontSize: 16 }}>×</button>
          )}
        </div>
        <div className="tl-scroll flex gap-2 overflow-x-auto" style={{ marginTop: 10, paddingBottom: 2, scrollSnapType: "x mandatory" }}>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => onCat(c)}
              style={{ flexShrink: 0, scrollSnapAlign: "start", border: "1px solid", borderColor: cat === c ? ACCENT : "rgba(33,23,15,.16)", background: cat === c ? ACCENT : SURFACE, color: cat === c ? ON_ACCENT : INK, borderRadius: 999, padding: "9px 14px", fontSize: 13, fontWeight: cat === c ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {c} · <span className="tnum">{countOf(c)}</span>
            </button>
          ))}
          {dirty && (
            <button onClick={onResetFilter} style={{ flexShrink: 0, background: "none", border: "none", color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", padding: "9px 6px" }}>
              Atur ulang
            </button>
          )}
        </div>
      </div>

      {/* katalog */}
      <main className="px-4" style={{ marginTop: 4, paddingBottom: 28 }}>
        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: SURFACE, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ aspectRatio: "1/1", background: "rgba(33,23,15,.07)" }} />
                <div style={{ padding: 10, display: "grid", gap: 8 }}>
                  <div style={{ height: 13, background: "rgba(33,23,15,.08)", borderRadius: 4 }} />
                  <div style={{ height: 13, width: "55%", background: "rgba(33,23,15,.08)", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 20px", background: SURFACE, borderRadius: 14, border: "1px dashed rgba(33,23,15,.2)" }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{q || cat !== "Semua" ? `Tidak ada “${q || cat}”` : "Belum ada menu hari ini"}</div>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>
              {q || cat !== "Semua" ? "Coba kata lain atau atur ulang filter." : "Tambahkan produk lewat dasbor TokoLink."}
            </p>
            {(q || cat !== "Semua") && (
              <button onClick={onResetFilter} style={{ marginTop: 14, background: ACCENT, color: ON_ACCENT, border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Atur ulang filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <Card key={item.id} p={item} slug={slug} canAdd={canAdd} closed={closed} onAdd={onAdd} />
            ))}
          </div>
        )}
      </main>

      {/* footer + QR desktop */}
      <footer style={{ borderTop: "1px solid rgba(33,23,15,.1)", padding: "20px 16px 40px", textAlign: "center" }}>
        {showQR && qrData && (
          <div className="hidden lg:block" style={{ marginBottom: 14 }}>
            <span style={{ display: "inline-block", background: SURFACE, border: "1px solid rgba(33,23,15,.1)", borderRadius: 12, padding: 10 }}>
              <img src={qrData} alt={`QR ${storeName}`} width={128} height={128} style={{ width: 128, height: 128, display: "block" }} />
            </span>
          </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 700 }}>{storeName}{city ? ` · ${city}` : ""}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Dibuat dengan TokoLink</div>
      </footer>
    </div>
  );
}
