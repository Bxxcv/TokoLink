/**
 * Tema 7 — "Digital Kilat" (produk digital & jasa) — REVISI VISUAL 12 Okt 2026.
 * Gaya: dark mode neon cyan (IMG-20261001-WA0006) — panel gelap bingkai
 * neon, aksen cyan #22E6E6, angka kode mono. SEMUA data dari props.
 * Badge hanya dari data asli (Terlaris = sold tertinggi unik);
 * POPULER/% diskon butuh data lain → KEBUTUHAN-DATA.md.
 */
import { useState } from "react";
import { rupiah } from "../../lib/format";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { nextOpenText } from "./shared";

type Item = ThemeStorefrontProps["items"][number];

const PAGE = "#0A1120";
const CARD = "#101A30";
const DEEP = "#070C18";
const INK = "#EAF6FB";
const MUTED = "#7E93B8";
const LINE = "rgba(255,255,255,.10)";
const CYAN = "#22E6E6";
const CYAN_DEEP = "#04222A";
const CYAN_SOFT = "rgba(34,230,230,.12)";
const TUTUP = "#8FA3C7";
const HABIS_BG = "#1A2338";
const HABIS_FG = "#5E7396";
const SISA_BG = "rgba(34,230,230,.14)";
const SISA_FG = "#5FF5F5";
const DEAD_BG = "#1A2338";
const DEAD_FG = "#8FA3C7";
const DISPLAY = "'Chakra Petch', 'IBM Plex Mono', ui-monospace, monospace";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const BODY = "'IBM Plex Sans', 'Segoe UI', ui-sans-serif, system-ui, sans-serif";
const WRAP = "mx-auto w-full max-w-[1240px] px-4";

function StockCap({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span style={{ background: HABIS_BG, color: HABIS_FG, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "4px 8px", borderRadius: 4, fontFamily: MONO }}>
        HABIS
      </span>
    );
  if (stock <= 5)
    return (
      <span style={{ background: SISA_BG, color: SISA_FG, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "4px 8px", borderRadius: 4, fontFamily: MONO }}>
        SISA {stock}
      </span>
    );
  return null;
}

function Card({
  p, slug, canAdd, closed, isTop, onAdd,
}: {
  p: Item; slug: string; canAdd: boolean; closed: boolean; isTop: boolean; onAdd: (p: Item) => void;
}) {
  const out = p.stock === 0;
  const dead = !canAdd || out;
  return (
    <article style={{ background: CARD, borderRadius: 8, overflow: "hidden", border: `1px solid ${LINE}` }}>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ display: "block", position: "relative" }}>
        <img src={p.img} alt="" loading="lazy" style={{ aspectRatio: "4 / 3", width: "100%", objectFit: "cover", display: "block", background: DEEP }} />
        <span style={{ position: "absolute", left: 6, top: 6, display: "flex", gap: 6 }}>
          {isTop && (
            <span style={{ background: CYAN, color: CYAN_DEEP, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 4, fontFamily: MONO }}>
              TERLARIS
            </span>
          )}
          <StockCap stock={p.stock} />
        </span>
      </a>
      <div style={{ padding: "9px 10px 11px", opacity: closed ? 0.72 : 1 }}>
        <a
          href={`#/s/${slug}/p/${p.id}`}
          style={{ fontSize: 13.5, fontWeight: 600, color: INK, textDecoration: "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.35, minHeight: 36 }}
        >
          {p.name}
        </a>
        <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 5 }}>
          <span className="tnum" style={{ fontSize: 15, fontWeight: 700, color: CYAN, fontFamily: MONO }}>{rupiah(p.price)}</span>
          {p.unit ? <span style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>· {p.unit}</span> : null}
        </div>
        {dead ? (
          <div style={{ marginTop: 8, minHeight: 44, borderRadius: 6, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, background: DEAD_BG, color: closed && !out ? MUTED : DEAD_FG, fontFamily: MONO }}>
            {closed && !out ? "TOKO TUTUP" : "STOK HABIS"}
          </div>
        ) : (
          <button
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name}`}
            style={{ marginTop: 8, width: "100%", minHeight: 44, border: "none", borderRadius: 6, background: CYAN, color: CYAN_DEEP, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: BODY }}
          >
            + Tambah
          </button>
        )}
      </div>
    </article>
  );
}

export function DigitalKilat(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, avatarUrl, coverUrl, closed,
    items, allItems, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink, openNow, todayHours, hourRows,
    showHours, showQR, showCart, cartCount, onAdd, onChatWA,
    qrData, onOpenQR, onShare, shared,
  } = p;
  const promo = (p.promos ?? [])[0] ?? null;
  const canAdd = showCart && !closed;
  const [more, setMore] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const dirty = q.trim() !== "" || cat !== "Semua";
  const nextOpen = closed || openNow === false ? nextOpenText(hourRows, todayHours) : null;
  const countOf = (c: string) => (c === "Semua" ? allItems.length : allItems.filter((i) => i.cat === c).length);
  const tutup = closed || openNow === false;
  const statusLine = tutup ? (nextOpen ? `Tutup · ${nextOpen}` : "Tutup hari ini") : todayHours || "Buka hari ini";
  const barOn = showCart && cartCount > 0;

  let topId: string | null = null;
  if (allItems.length > 0) {
    const topSold = allItems.reduce((m, i) => Math.max(m, i.sold), 0);
    const tops = allItems.filter((i) => i.sold === topSold);
    if (topSold > 0 && tops.length === 1) topId = tops[0].id;
  }

  const gotoKatalog = () => {
    document.getElementById("dk-katalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: PAGE, color: INK, fontFamily: BODY, fontSize: 14, lineHeight: 1.5, minHeight: "100vh", paddingBottom: barOn ? 78 : 0 }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: DEEP, borderBottom: `1px solid ${CYAN_SOFT}` }}>
        <div className={`${WRAP} flex items-center gap-2.5`} style={{ height: 56 }}>
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md" style={{ background: CYAN_SOFT, color: CYAN, fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, border: `1px solid ${CYAN}` }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 17, color: INK }}>{storeName}</span>
            {city ? <span className="block truncate" style={{ fontSize: 12, color: MUTED, fontFamily: MONO }}>{city}</span> : null}
          </span>
          <span className="tnum" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", fontFamily: MONO, color: tutup ? DEEP : CYAN_DEEP, background: tutup ? TUTUP : CYAN, padding: "5px 9px", borderRadius: 4 }}>
            {tutup ? "TUTUP" : "BUKA"}
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
                <span className="tnum" style={{ position: "absolute", top: 4, right: 2, minWidth: 17, height: 17, borderRadius: 999, background: CYAN, color: CYAN_DEEP, fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 4px" }}>
                  {cartCount}
                </span>
              )}
            </a>
          )}
        </div>
      </header>

      {/* banner tutup */}
      {closed && (
        <div style={{ background: "#1A2338", color: "#FFB3BF", padding: "10px 16px", fontSize: 13, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${CYAN_SOFT}` }}>
          Toko tutup{nextOpen ? ` · ${nextOpen}` : ""}
        </div>
      )}

      {/* sampul */}
      {coverUrl && <img src={coverUrl} alt="" style={{ width: "100%", height: 152, objectFit: "cover", display: "block" }} />}

      {/* hero panel terminal */}
      <section className={WRAP} style={{ marginTop: coverUrl ? 14 : 14 }}>
        <div style={{ background: CARD, border: `1px solid ${CYAN}`, borderRadius: 8, padding: "14px 15px", boxShadow: "0 0 24px rgba(34,230,230,.12)" }}>
          {promo && (
            <div style={{ background: DEEP, border: `1px dashed ${CYAN}`, borderRadius: 6, padding: "10px 12px", marginBottom: 12 }}>
              <div className="micro" style={{ color: CYAN, fontFamily: MONO }}>PROMO</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginTop: 4, lineHeight: 1.35, overflowWrap: "anywhere" }}>{promo.label}</div>
              <span className="tnum" style={{ display: "inline-block", marginTop: 8, background: CYAN_SOFT, border: `1px solid ${CYAN}`, color: CYAN, borderRadius: 4, padding: "5px 10px", fontSize: 13, fontWeight: 700, fontFamily: MONO, letterSpacing: "0.06em" }}>
                {promo.code}
              </span>
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: CYAN, fontFamily: MONO }}>▸ {statusLine}</div>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 21, lineHeight: 1.2, color: INK, margin: "6px 0 0", overflowWrap: "anywhere" }}>{storeName}</h1>
              {city ? <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4, fontFamily: MONO }}>{city}</div> : null}
            </div>
            {allItems.length > 0 && (
              <span className="tnum shrink-0" style={{ border: `1px solid ${CYAN}`, color: CYAN, borderRadius: 4, fontSize: 11.5, fontWeight: 700, padding: "6px 11px", whiteSpace: "nowrap", fontFamily: MONO }}>
                {allItems.length} item
              </span>
            )}
          </div>
          {bio ? (
            <>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#C4D3EC", margin: "10px 0 0", display: "-webkit-box", WebkitLineClamp: more ? 99 : 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>
              {bio.length > 140 && (
                <button onClick={() => setMore((m) => !m)} style={{ background: "none", border: "none", padding: "6px 0 0", color: CYAN, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {more ? "Tutup" : "Selengkapnya"}
                </button>
              )}
            </>
          ) : city ? (
            <p style={{ fontSize: 13.5, color: MUTED, margin: "10px 0 0" }}>{city}</p>
          ) : null}
          {allItems.length > 0 && (
            <button
              onClick={gotoKatalog}
              className="w-full sm:w-auto"
              style={{ marginTop: 12, minHeight: 42, padding: "0 22px", border: `1px solid ${CYAN}`, borderRadius: 6, background: "transparent", color: CYAN, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: BODY }}
            >
              Lihat katalog ↓
            </button>
          )}
        </div>
      </section>

      {/* tautan */}
      {bioLinks.length > 0 && (
        <section className={WRAP} style={{ marginTop: 14 }}>
          <div className="micro" style={{ color: CYAN, marginBottom: 8, fontFamily: MONO, letterSpacing: "0.1em" }}>TAUTAN</div>
          <div className="grid gap-2">
            {bioLinks.map((l) => {
              const isWA = l.icon === "wa";
              return (
                <button
                  key={l.id}
                  onClick={() => onOpenBioLink(l)}
                  className="flex items-center gap-3 text-left"
                  style={{ minHeight: 52, background: CARD, border: `1px solid ${LINE}`, borderLeft: isWA ? "3px solid #1FA855" : undefined, borderRadius: 6, padding: "8px 12px", cursor: "pointer", width: "100%" }}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md" style={{ background: CYAN_SOFT, color: CYAN }}>
                    <Icon name={iconForLink(l.icon)} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate" style={{ fontSize: 14, fontWeight: 600 }}>{l.label}</span>
                    <span className="block truncate" style={{ fontSize: 12, color: MUTED, fontFamily: MONO }}>{l.url.replace(/^https?:\/\//, "")}</span>
                  </span>
                  <span aria-hidden style={{ color: MUTED }}>›</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* jam */}
      {showHours && (
        <section className={WRAP} style={{ marginTop: 12 }}>
          <button onClick={() => setHoursOpen((o) => !o)} aria-expanded={hoursOpen} className="flex w-full items-center gap-2.5" style={{ minHeight: 44, background: "none", border: "none", padding: 0, cursor: "pointer", color: INK, fontSize: 13.5, fontWeight: 700 }}>
            <Icon name="clock" size={17} /> Jam buka
            <span className="tnum" style={{ fontWeight: 400, color: MUTED }}>{todayHours || (openNow === false ? "Tutup hari ini" : "")}</span>
          </button>
          {hoursOpen && hourRows.length > 0 && (
            <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", background: CARD, borderRadius: 6, border: `1px solid ${LINE}`, overflow: "hidden" }}>
              {hourRows.map((h) => (
                <li key={h.day} className="tnum flex items-center justify-between" style={{ padding: "9px 12px", fontSize: 13, background: h.text === todayHours ? CYAN_SOFT : undefined }}>
                  <span style={{ fontWeight: h.text === todayHours ? 700 : 400 }}>
                    <span aria-hidden style={{ color: h.on ? CYAN : "transparent" }}>●</span> {h.day}
                  </span>
                  <span style={{ color: h.on ? INK : TUTUP }}>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* cari + tab */}
      <div className="md:sticky md:z-30" style={{ top: 56, background: PAGE }}>
        <div className={WRAP} style={{ paddingTop: 12, paddingBottom: 10 }}>
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="cari produk / jasa…"
              aria-label="Cari produk atau jasa"
              className="focus:outline-2 focus:outline-offset-1 focus:outline-[#22E6E6]"
              style={{ width: "100%", height: 46, borderRadius: 6, border: `1px solid ${LINE}`, background: CARD, padding: "0 38px", fontSize: 14, color: INK, fontFamily: MONO }}
            />
            {q && (
              <button onClick={() => onQ("")} aria-label="Bersihkan" style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, border: "none", background: "none", color: MUTED, cursor: "pointer", fontSize: 16 }}>×</button>
            )}
          </div>
          <div className="tl-scroll flex gap-3.5 overflow-x-auto" style={{ marginTop: 10 }}>
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => onCat(c)}
                style={{ flexShrink: 0, background: "none", border: "none", padding: "8px 1px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: DISPLAY, fontSize: 14, fontWeight: cat === c ? 700 : 500, color: cat === c ? CYAN : MUTED, borderBottom: `2px solid ${cat === c ? CYAN : "transparent"}` }}
              >
                {c} <span className="tnum" style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.7 }}>{countOf(c)}</span>
              </button>
            ))}
            {dirty && (
              <button onClick={onResetFilter} style={{ flexShrink: 0, background: "none", border: "none", color: CYAN, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", padding: "8px 6px", borderBottom: "2px solid transparent" }}>
                Atur ulang
              </button>
            )}
          </div>
        </div>
      </div>

      {/* katalog */}
      <main id="dk-katalog" className={WRAP} style={{ marginTop: 2, paddingBottom: 28, scrollMarginTop: 68 }}>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: CARD, borderRadius: 8, overflow: "hidden", border: `1px solid ${LINE}` }}>
                <div style={{ aspectRatio: "4/3", background: DEEP }} />
                <div style={{ padding: 10, display: "grid", gap: 8 }}>
                  <div style={{ height: 13, background: "rgba(255,255,255,.08)", borderRadius: 4 }} />
                  <div style={{ height: 13, width: "55%", background: "rgba(255,255,255,.08)", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 20px", background: CARD, borderRadius: 8, border: `1px dashed ${CYAN}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: DISPLAY, color: INK }}>{q || cat !== "Semua" ? `Tidak ada “${q || cat}”` : "Belum ada item"}</div>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>
              {q || cat !== "Semua" ? "Coba kata lain atau atur ulang filter." : "Tambahkan produk lewat dasbor TokoLink."}
            </p>
            {(q || cat !== "Semua") && (
              <button onClick={onResetFilter} style={{ marginTop: 14, background: CYAN, color: CYAN_DEEP, border: "none", borderRadius: 6, padding: "12px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Atur ulang filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <Card key={item.id} p={item} slug={slug} canAdd={canAdd} closed={closed} isTop={item.id === topId} onAdd={onAdd} />
            ))}
          </div>
        )}
      </main>

      {/* footer */}
      <footer style={{ background: DEEP, borderTop: `1px solid ${CYAN_SOFT}`, padding: "20px 16px 40px", textAlign: "center" }}>
        {showQR && qrData && (
          <div className="hidden lg:block" style={{ marginBottom: 14 }}>
            <span style={{ display: "inline-block", background: CARD, border: `1px solid ${CYAN}`, borderRadius: 8, padding: 10 }}>
              <img src={qrData} alt={`QR ${storeName}`} width={128} height={128} style={{ width: 128, height: 128, display: "block" }} />
            </span>
            <div style={{ marginTop: 8 }}>
              <a href={qrData} download={`qr-${slug}.png`} style={{ fontSize: 12, fontWeight: 600, color: CYAN, textDecoration: "none", borderBottom: `1px solid ${CYAN}`, fontFamily: MONO }}>
                Unduh PNG
              </a>
            </div>
          </div>
        )}
        <div style={{ fontSize: 15, fontWeight: 600, fontFamily: DISPLAY, color: INK }}>{storeName}{city ? ` · ${city}` : ""}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 4, fontFamily: MONO }}>Dibuat dengan tokolink.store</div>
        <div style={{ marginTop: 10 }}>
          <button onClick={onChatWA} style={{ background: "none", border: "none", fontSize: 12.5, color: MUTED, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
            Hubungi penjual
          </button>
        </div>
      </footer>

      {/* bilah keranjang */}
      {barOn && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50, padding: "10px 16px calc(10px + env(safe-area-inset-bottom))", pointerEvents: "none" }}>
          <a
            href="#/cart"
            className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-3"
            style={{ background: CYAN, color: CYAN_DEEP, borderRadius: 8, minHeight: 50, padding: "0 20px", textDecoration: "none", fontSize: 14.5, fontWeight: 700, boxShadow: "0 0 28px rgba(34,230,230,.35)", pointerEvents: "auto" }}
          >
            <span className="flex items-center gap-2">
              <Icon name="cart" size={18} /> Lihat keranjang
            </span>
            <span className="flex items-center gap-1.5">
              <span className="tnum" style={{ background: "rgba(4,34,42,.18)", borderRadius: 4, minWidth: 24, height: 24, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 800, padding: "0 6px" }}>
                {cartCount}
              </span>
              <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>›</span>
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
