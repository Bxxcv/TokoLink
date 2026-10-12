/**
 * Tema 6 — "Kriya Asli" (kerajinan) — REVISI VISUAL 12 Okt 2026.
 * Gaya: etalase kriya biru-emas (IMG-20261001-WA0005) — panel navy bingkai
 * emas, blok cerita pembuat, chip kategori emas. SEMUA data dari props.
 * Badge hanya dari data asli (Terlaris = sold tertinggi unik);
 * NEW/-% butuh data lain → KEBUTUHAN-DATA.md.
 */
import { useState } from "react";
import { rupiah } from "../../lib/format";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { nextOpenText } from "./shared";

type Item = ThemeStorefrontProps["items"][number];

const PAGE = "#152651";
const CARD = "#1F3466";
const DEEP = "#101E43";
const PANEL = "#12204A";
const INK = "#F6F0E3";
const MUTED = "#A9B4D4";
const LINE = "rgba(255,255,255,.12)";
const GOLD = "#E0B65A";
const GOLD_BRIGHT = "#F0D08A";
const GOLD_SOFT = "rgba(224,182,90,.14)";
const GOLD_LINE = "rgba(224,182,90,.38)";
const TUTUP = "#B3372F";
const HABIS_BG = "rgba(0,0,0,.45)";
const HABIS_FG = "#D8DDEE";
const SISA_BG = "rgba(224,182,90,.18)";
const SISA_FG = "#F0D08A";
const DEAD_BG = "rgba(255,255,255,.08)";
const DEAD_FG = "#C6CEE4";
const DISPLAY = "'Fraunces', Georgia, 'Times New Roman', serif";
const BODY = "'Plus Jakarta Sans', 'Segoe UI', ui-sans-serif, system-ui, sans-serif";
const WRAP = "mx-auto w-full max-w-[1240px] px-4";

function StockCap({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span style={{ background: HABIS_BG, color: HABIS_FG, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 6 }}>
        HABIS
      </span>
    );
  if (stock <= 5)
    return (
      <span style={{ background: SISA_BG, color: SISA_FG, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 6 }}>
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
    <article style={{ background: CARD, borderRadius: 10, overflow: "hidden", border: `1px solid ${GOLD_LINE}` }}>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ display: "block", position: "relative" }}>
        <img src={p.img} alt="" loading="lazy" style={{ aspectRatio: "1 / 1", width: "100%", objectFit: "cover", display: "block", background: DEEP }} />
        <span style={{ position: "absolute", left: 6, top: 6, display: "flex", gap: 6 }}>
          {isTop && (
            <span style={{ background: GOLD, color: "#152651", fontSize: 9.5, fontWeight: 800, letterSpacing: "0.06em", padding: "4px 8px", borderRadius: 6 }}>
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
          <span style={{ fontSize: 15, fontWeight: 800, color: GOLD_BRIGHT }}>{rupiah(p.price)}</span>
          {p.unit ? <span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>· {p.unit}</span> : null}
        </div>
        {dead ? (
          <div style={{ marginTop: 8, minHeight: 44, borderRadius: 8, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700, background: DEAD_BG, color: DEAD_FG }}>
            {closed && !out ? "Toko tutup" : "Stok habis"}
          </div>
        ) : (
          <button
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name}`}
            style={{ marginTop: 8, width: "100%", minHeight: 44, border: "none", borderRadius: 8, background: GOLD, color: "#152651", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: BODY }}
          >
            + Tambah
          </button>
        )}
      </div>
    </article>
  );
}

export function KriyaAsli(p: ThemeStorefrontProps) {
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
    document.getElementById("ka-katalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: PAGE, color: INK, fontFamily: BODY, fontSize: 14, lineHeight: 1.5, minHeight: "100vh", paddingBottom: barOn ? 78 : 0 }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: DEEP, borderBottom: `1px solid ${GOLD_LINE}` }}>
        <div className={`${WRAP} flex items-center gap-2.5`} style={{ height: 56 }}>
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full" style={{ background: GOLD, color: "#152651", fontFamily: DISPLAY, fontWeight: 700, fontSize: 15 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 18, color: INK }}>{storeName}</span>
            {city ? <span className="block truncate" style={{ fontSize: 12, color: MUTED }}>{city}</span> : null}
          </span>
          <span className="tnum" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: tutup ? "#fff" : "#152651", background: tutup ? TUTUP : GOLD, padding: "5px 9px", borderRadius: 999 }}>
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
                <span className="tnum" style={{ position: "absolute", top: 4, right: 2, minWidth: 17, height: 17, borderRadius: 999, background: GOLD, color: "#152651", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 4px" }}>
                  {cartCount}
                </span>
              )}
            </a>
          )}
        </div>
      </header>

      {/* banner tutup */}
      {closed && (
        <div style={{ background: TUTUP, color: "#FFFFFF", padding: "10px 16px", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
          Toko tutup{nextOpen ? ` · ${nextOpen}` : ""}
        </div>
      )}

      {/* sampul */}
      {coverUrl && <img src={coverUrl} alt="" style={{ width: "100%", height: 152, objectFit: "cover", display: "block" }} />}

      {/* hero + blok cerita pembuat */}
      <section className={WRAP} style={{ marginTop: coverUrl ? -22 : 14 }}>
        <div style={{ background: CARD, border: `1px solid ${GOLD_LINE}`, borderRadius: 14, padding: "15px 15px" }}>
          {promo && (
            <div style={{ background: PANEL, border: `1px dashed ${GOLD}`, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
              <div className="micro" style={{ color: GOLD }}>PROMO</div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: INK, marginTop: 4, lineHeight: 1.3, overflowWrap: "anywhere" }}>{promo.label}</div>
              <span className="tnum" style={{ display: "inline-block", marginTop: 8, background: GOLD_SOFT, border: `1px solid ${GOLD_LINE}`, color: GOLD_BRIGHT, borderRadius: 6, padding: "5px 10px", fontSize: 13, fontWeight: 800, letterSpacing: "0.04em" }}>
                {promo.code}
              </span>
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD }}>{statusLine}</div>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 22, lineHeight: 1.2, color: INK, margin: "6px 0 0", overflowWrap: "anywhere" }}>{storeName}</h1>
              {city ? <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>{city}</div> : null}
            </div>
            {allItems.length > 0 && (
              <span className="tnum shrink-0" style={{ border: `1px solid ${GOLD_LINE}`, color: GOLD_BRIGHT, borderRadius: 8, fontSize: 11.5, fontWeight: 700, padding: "6px 11px", whiteSpace: "nowrap" }}>
                {allItems.length} karya
              </span>
            )}
          </div>
          {bio ? (
            <>
              <div className="micro" style={{ color: GOLD, marginTop: 12 }}>Cerita penjual</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#DCE2F2", margin: "6px 0 0", display: "-webkit-box", WebkitLineClamp: more ? 99 : 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>
              {bio.length > 140 && (
                <button onClick={() => setMore((m) => !m)} style={{ background: "none", border: "none", padding: "6px 0 0", color: GOLD_BRIGHT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
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
              style={{ marginTop: 12, minHeight: 42, padding: "0 22px", border: "none", borderRadius: 8, background: GOLD, color: "#152651", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: BODY }}
            >
              Lihat koleksi ↓
            </button>
          )}
        </div>
      </section>

      {/* tautan */}
      {bioLinks.length > 0 && (
        <section className={WRAP} style={{ marginTop: 14 }}>
          <div className="micro" style={{ color: GOLD, marginBottom: 8 }}>Tautan</div>
          <div className="grid gap-2">
            {bioLinks.map((l) => {
              const isWA = l.icon === "wa";
              return (
                <button
                  key={l.id}
                  onClick={() => onOpenBioLink(l)}
                  className="flex items-center gap-3 text-left"
                  style={{ minHeight: 52, background: CARD, border: `1px solid ${LINE}`, borderLeft: isWA ? "3px solid #1FA855" : undefined, borderRadius: 10, padding: "8px 12px", cursor: "pointer", width: "100%" }}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: GOLD_SOFT, color: GOLD_BRIGHT }}>
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
            <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", background: CARD, borderRadius: 10, border: `1px solid ${LINE}`, overflow: "hidden" }}>
              {hourRows.map((h) => (
                <li key={h.day} className="tnum flex items-center justify-between" style={{ padding: "9px 12px", fontSize: 13, background: h.text === todayHours ? GOLD_SOFT : undefined }}>
                  <span style={{ fontWeight: h.text === todayHours ? 700 : 400 }}>
                    <span aria-hidden style={{ color: h.on ? GOLD : "transparent" }}>●</span> {h.day}
                  </span>
                  <span style={{ color: h.on ? INK : "#FFB3AA" }}>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* cari + chip kategori */}
      <div className="md:sticky md:z-30" style={{ top: 56, background: PAGE }}>
        <div className={WRAP} style={{ paddingTop: 12, paddingBottom: 10 }}>
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Cari karya…"
              aria-label="Cari karya"
              className="focus:outline-2 focus:outline-offset-1 focus:outline-[#E0B65A]"
              style={{ width: "100%", height: 46, borderRadius: 8, border: `1px solid ${LINE}`, background: PANEL, padding: "0 38px", fontSize: 14, color: INK }}
            />
            {q && (
              <button onClick={() => onQ("")} aria-label="Bersihkan" style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, border: "none", background: "none", color: MUTED, cursor: "pointer", fontSize: 16 }}>×</button>
            )}
          </div>
          <div className="tl-scroll flex gap-2 overflow-x-auto" style={{ marginTop: 10, paddingBottom: 2 }}>
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => onCat(c)}
                style={{ flexShrink: 0, border: `1px solid ${cat === c ? GOLD : GOLD_LINE}`, background: cat === c ? GOLD : "transparent", color: cat === c ? "#152651" : INK, borderRadius: 999, padding: "9px 15px", fontSize: 13, fontWeight: cat === c ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {c} · <span className="tnum">{countOf(c)}</span>
              </button>
            ))}
            {dirty && (
              <button onClick={onResetFilter} style={{ flexShrink: 0, background: "none", border: "none", color: GOLD_BRIGHT, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", padding: "9px 6px" }}>
                Atur ulang
              </button>
            )}
          </div>
        </div>
      </div>

      {/* katalog */}
      <main id="ka-katalog" className={WRAP} style={{ marginTop: 2, paddingBottom: 28, scrollMarginTop: 68 }}>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: CARD, borderRadius: 10, overflow: "hidden", border: `1px solid ${GOLD_LINE}` }}>
                <div style={{ aspectRatio: "1/1", background: DEEP }} />
                <div style={{ padding: 10, display: "grid", gap: 8 }}>
                  <div style={{ height: 13, background: "rgba(255,255,255,.1)", borderRadius: 4 }} />
                  <div style={{ height: 13, width: "55%", background: "rgba(255,255,255,.1)", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 20px", background: CARD, borderRadius: 12, border: `1px dashed ${GOLD_LINE}` }}>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: DISPLAY, color: INK }}>{q || cat !== "Semua" ? `Tidak ada “${q || cat}”` : "Belum ada karya"}</div>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>
              {q || cat !== "Semua" ? "Coba kata lain atau atur ulang filter." : "Tambahkan produk lewat dasbor TokoLink."}
            </p>
            {(q || cat !== "Semua") && (
              <button onClick={onResetFilter} style={{ marginTop: 14, background: GOLD, color: "#152651", border: "none", borderRadius: 8, padding: "12px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
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
      <footer style={{ background: DEEP, borderTop: `1px solid ${GOLD_LINE}`, padding: "20px 16px 40px", textAlign: "center" }}>
        {showQR && qrData && (
          <div className="hidden lg:block" style={{ marginBottom: 14 }}>
            <span style={{ display: "inline-block", background: CARD, border: `1px solid ${GOLD_LINE}`, borderRadius: 12, padding: 10 }}>
              <img src={qrData} alt={`QR ${storeName}`} width={128} height={128} style={{ width: 128, height: 128, display: "block" }} />
            </span>
            <div style={{ marginTop: 8 }}>
              <a href={qrData} download={`qr-${slug}.png`} style={{ fontSize: 12, fontWeight: 600, color: GOLD_BRIGHT, textDecoration: "none", borderBottom: `1px solid ${GOLD_LINE}` }}>
                Unduh PNG
              </a>
            </div>
          </div>
        )}
        <div style={{ fontSize: 15, fontWeight: 500, fontFamily: DISPLAY, color: INK }}>{storeName}{city ? ` · ${city}` : ""}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Dibuat dengan tokolink.store</div>
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
            style={{ background: GOLD, color: "#152651", borderRadius: 999, minHeight: 50, padding: "0 20px", textDecoration: "none", fontSize: 14.5, fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,.4)", pointerEvents: "auto" }}
          >
            <span className="flex items-center gap-2">
              <Icon name="cart" size={18} /> Lihat keranjang
            </span>
            <span className="flex items-center gap-1.5">
              <span className="tnum" style={{ background: "rgba(0,0,0,.16)", borderRadius: 999, minWidth: 24, height: 24, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 800, padding: "0 6px" }}>
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
