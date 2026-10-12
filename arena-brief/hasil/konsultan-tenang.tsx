/**
 * Tema 8 — "Konsultan Tenang" (jasa profesional) — REVISI VISUAL 12 Okt 2026.
 * Gaya: krem minimalis (IMG-20261001-WA0007) — tipografi serif lembut,
 * ruang lega, tanpa badge produk di kartu. SEMUA data dari props.
 * Karena tanpa badge: stok hanya lewat cap SISA/HABIS (bisa dihitung).
 */
import { useState } from "react";
import { rupiah } from "../../lib/format";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { nextOpenText } from "./shared";

type Item = ThemeStorefrontProps["items"][number];

const PAGE = "#F6F1EA";
const SURFACE = "#FFFFFF";
const INK = "#2E2A24";
const MUTED = "#7D6E58";
const LINE = "rgba(46,42,36,.16)";
const TAUPE = "#7D6E58";
const TAUPE_DEEP = "#5C5344";
const HABIS_BG = "#EDE6DA";
const HABIS_FG = "#7D6E58";
const SISA_BG = "#E4EEE6";
const SISA_FG = "#3F5D4E";
const OPEN_BG = "#3F5D4E";
const TUTUP_BG = "#8C5A4F";
const DEAD_BG = "#EDE6DA";
const DEAD_FG = "#7D6E58";
const DISPLAY = "'Newsreader', Georgia, 'Times New Roman', serif";
const BODY = "'Plus Jakarta Sans', 'Segoe UI', ui-sans-serif, system-ui, sans-serif";
const WRAP = "mx-auto w-full max-w-[1240px] px-4";

function StockCap({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span style={{ background: HABIS_BG, color: HABIS_FG, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 8px", borderRadius: 6 }}>
        HABIS
      </span>
    );
  if (stock <= 5)
    return (
      <span style={{ background: SISA_BG, color: SISA_FG, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 8px", borderRadius: 6 }}>
        SISA {stock}
      </span>
    );
  return null;
}

function Card({
  p, slug, canAdd, closed, onAdd,
}: {
  p: Item; slug: string; canAdd: boolean; closed: boolean; onAdd: (p: Item) => void;
}) {
  const out = p.stock === 0;
  const dead = !canAdd || out;
  return (
    <article style={{ background: SURFACE, borderRadius: 10, overflow: "hidden", border: `1px solid ${LINE}` }}>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ display: "block", position: "relative" }}>
        <img src={p.img} alt="" loading="lazy" style={{ aspectRatio: "4 / 3", width: "100%", objectFit: "cover", display: "block", background: "#EDE6DA" }} />
        <span style={{ position: "absolute", left: 8, top: 8 }}>
          <StockCap stock={p.stock} />
        </span>
      </a>
      <div style={{ padding: "11px 12px 13px", opacity: closed ? 0.72 : 1 }}>
        <a
          href={`#/s/${slug}/p/${p.id}`}
          style={{ fontSize: 14.5, fontWeight: 500, fontFamily: DISPLAY, color: INK, textDecoration: "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.35, minHeight: 38 }}
        >
          {p.name}
        </a>
        <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 5 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: TAUPE_DEEP }}>{rupiah(p.price)}</span>
          {p.unit ? <span style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>· {p.unit}</span> : null}
        </div>
        {dead ? (
          <div style={{ marginTop: 8, minHeight: 44, borderRadius: 8, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 600, background: DEAD_BG, color: DEAD_FG }}>
            {closed && !out ? "Toko tutup" : "Stok habis"}
          </div>
        ) : (
          <button
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name}`}
            style={{ marginTop: 8, width: "100%", minHeight: 44, borderRadius: 8, background: "transparent", border: `1px solid ${INK}`, color: INK, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: BODY }}
          >
            Tambah
          </button>
        )}
      </div>
    </article>
  );
}

export function KonsultanTenang(p: ThemeStorefrontProps) {
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

  const gotoKatalog = () => {
    document.getElementById("kt-katalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: PAGE, color: INK, fontFamily: BODY, fontSize: 14, lineHeight: 1.55, minHeight: "100vh", paddingBottom: barOn ? 78 : 0 }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: SURFACE, borderBottom: `1px solid ${LINE}` }}>
        <div className={`${WRAP} flex items-center gap-2.5`} style={{ height: 56 }}>
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full" style={{ background: "#EDE6DA", color: TAUPE_DEEP, fontFamily: DISPLAY, fontWeight: 500, fontSize: 15 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 17, color: INK }}>{storeName}</span>
            {city ? <span className="block truncate" style={{ fontSize: 12, color: MUTED }}>{city}</span> : null}
          </span>
          <span className="tnum" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", color: "#FFFFFF", background: tutup ? TUTUP_BG : OPEN_BG, padding: "5px 9px", borderRadius: 999 }}>
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
                <span className="tnum" style={{ position: "absolute", top: 4, right: 2, minWidth: 17, height: 17, borderRadius: 999, background: TAUPE_DEEP, color: "#FFFFFF", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 4px" }}>
                  {cartCount}
                </span>
              )}
            </a>
          )}
        </div>
      </header>

      {/* banner tutup */}
      {closed && (
        <div style={{ background: TUTUP_BG, color: "#FFFFFF", padding: "10px 16px", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
          Toko tutup{nextOpen ? ` · ${nextOpen}` : ""}
        </div>
      )}

      {/* sampul */}
      {coverUrl && <img src={coverUrl} alt="" style={{ width: "100%", height: 152, objectFit: "cover", display: "block" }} />}

      {/* hero tenang */}
      <section className={`${WRAP} relative z-[1]`} style={{ marginTop: coverUrl ? 16 : 18 }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>{statusLine}</div>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 26, lineHeight: 1.2, color: INK, margin: "8px 0 0", overflowWrap: "anywhere" }}>{storeName}</h1>
          {city ? <div style={{ fontSize: 13, color: MUTED, marginTop: 5 }}>{city}</div> : null}
          {bio ? (
            <>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#54493F", margin: "12px 0 0", display: "-webkit-box", WebkitLineClamp: more ? 99 : 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>
              {bio.length > 140 && (
                <button onClick={() => setMore((m) => !m)} style={{ background: "none", border: "none", padding: "6px 0 0", color: TAUPE_DEEP, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {more ? "Tutup" : "Selengkapnya"}
                </button>
              )}
            </>
          ) : city ? (
            <p style={{ fontSize: 14, color: MUTED, margin: "10px 0 0" }}>{city}</p>
          ) : null}
          {promo && (
            <div style={{ marginTop: 14, background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 10, padding: "11px 13px", maxWidth: 560 }}>
              <div className="micro" style={{ color: MUTED }}>Promo</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginTop: 4, lineHeight: 1.4, overflowWrap: "anywhere" }}>{promo.label}</div>
              <span className="tnum" style={{ display: "inline-block", marginTop: 8, background: "#EDE6DA", color: TAUPE_DEEP, borderRadius: 6, padding: "5px 10px", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>
                {promo.code}
              </span>
            </div>
          )}
          {allItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 16 }}>
              <button
                onClick={gotoKatalog}
                className="w-full sm:w-auto"
                style={{ minHeight: 44, padding: "0 24px", border: "none", borderRadius: 8, background: INK, color: PAGE, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: BODY }}
              >
                Lihat katalog ↓
              </button>
              <span className="tnum" style={{ fontSize: 12.5, color: MUTED }}>{allItems.length} layanan / produk</span>
            </div>
          )}
        </div>
      </section>

      {/* tautan */}
      {bioLinks.length > 0 && (
        <section className={WRAP} style={{ marginTop: 18 }}>
          <div className="micro" style={{ color: MUTED, marginBottom: 8 }}>Tautan</div>
          <div className="grid gap-2">
            {bioLinks.map((l) => {
              const isWA = l.icon === "wa";
              return (
                <button
                  key={l.id}
                  onClick={() => onOpenBioLink(l)}
                  className="flex items-center gap-3 text-left"
                  style={{ minHeight: 52, background: SURFACE, border: `1px solid ${LINE}`, borderLeft: isWA ? "3px solid #1FA855" : undefined, borderRadius: 10, padding: "8px 12px", cursor: "pointer", width: "100%" }}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: "#EDE6DA", color: TAUPE_DEEP }}>
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
        <section className={WRAP} style={{ marginTop: 14 }}>
          <button onClick={() => setHoursOpen((o) => !o)} aria-expanded={hoursOpen} className="flex w-full items-center gap-2.5" style={{ minHeight: 44, background: "none", border: "none", padding: 0, cursor: "pointer", color: INK, fontSize: 13.5, fontWeight: 700 }}>
            <Icon name="clock" size={17} /> Jam buka
            <span className="tnum" style={{ fontWeight: 400, color: MUTED }}>{todayHours || (openNow === false ? "Tutup hari ini" : "")}</span>
          </button>
          {hoursOpen && hourRows.length > 0 && (
            <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", background: SURFACE, borderRadius: 10, border: `1px solid ${LINE}`, overflow: "hidden", maxWidth: 560 }}>
              {hourRows.map((h) => (
                <li key={h.day} className="tnum flex items-center justify-between" style={{ padding: "9px 12px", fontSize: 13, background: h.text === todayHours ? "rgba(125,110,88,.10)" : undefined }}>
                  <span style={{ fontWeight: h.text === todayHours ? 700 : 400 }}>
                    <span aria-hidden style={{ color: h.on ? TAUPE : "transparent" }}>●</span> {h.day}
                  </span>
                  <span style={{ color: h.on ? INK : TUTUP_BG }}>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* cari + tab */}
      <div className="md:sticky md:z-30" style={{ top: 56, background: PAGE }}>
        <div className={WRAP} style={{ paddingTop: 14, paddingBottom: 10 }}>
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Cari layanan…"
              aria-label="Cari layanan"
              className="focus:outline-2 focus:outline-offset-1 focus:outline-[#7D6E58]"
              style={{ width: "100%", height: 46, borderRadius: 8, border: `1px solid ${LINE}`, background: SURFACE, padding: "0 38px", fontSize: 14, color: INK }}
            />
            {q && (
              <button onClick={() => onQ("")} aria-label="Bersihkan" style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, border: "none", background: "none", color: MUTED, cursor: "pointer", fontSize: 16 }}>×</button>
            )}
          </div>
          <div className="tl-scroll flex gap-3.5 overflow-x-auto" style={{ marginTop: 8 }}>
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => onCat(c)}
                style={{ flexShrink: 0, background: "none", border: "none", padding: "9px 1px", cursor: "pointer", whiteSpace: "nowrap", fontSize: 13.5, fontWeight: cat === c ? 700 : 500, color: cat === c ? INK : MUTED, borderBottom: `2px solid ${cat === c ? INK : "transparent"}` }}
              >
                {c} <span className="tnum" style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.7 }}>{countOf(c)}</span>
              </button>
            ))}
            {dirty && (
              <button onClick={onResetFilter} style={{ flexShrink: 0, background: "none", border: "none", color: TAUPE_DEEP, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", padding: "9px 6px", borderBottom: "2px solid transparent", textDecoration: "underline", textUnderlineOffset: 3 }}>
                Atur ulang
              </button>
            )}
          </div>
        </div>
      </div>

      {/* katalog */}
      <main id="kt-katalog" className={WRAP} style={{ marginTop: 2, paddingBottom: 32, scrollMarginTop: 68 }}>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: SURFACE, borderRadius: 10, overflow: "hidden", border: `1px solid ${LINE}` }}>
                <div style={{ aspectRatio: "4/3", background: "#EDE6DA" }} />
                <div style={{ padding: 12, display: "grid", gap: 8 }}>
                  <div style={{ height: 13, background: "rgba(46,42,36,.08)", borderRadius: 4 }} />
                  <div style={{ height: 13, width: "55%", background: "rgba(46,42,36,.08)", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", background: SURFACE, borderRadius: 12, border: `1px dashed ${LINE}` }}>
            <div style={{ fontSize: 17, fontWeight: 500, fontFamily: DISPLAY, color: INK }}>{q || cat !== "Semua" ? `Tidak ada “${q || cat}”` : "Belum ada layanan"}</div>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>
              {q || cat !== "Semua" ? "Coba kata lain atau atur ulang filter." : "Tambahkan produk lewat dasbor TokoLink."}
            </p>
            {(q || cat !== "Semua") && (
              <button onClick={onResetFilter} style={{ marginTop: 14, background: INK, color: PAGE, border: "none", borderRadius: 8, padding: "12px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Atur ulang filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <Card key={item.id} p={item} slug={slug} canAdd={canAdd} closed={closed} onAdd={onAdd} />
            ))}
          </div>
        )}
      </main>

      {/* footer */}
      <footer style={{ background: SURFACE, borderTop: `1px solid ${LINE}`, padding: "24px 16px 44px", textAlign: "center" }}>
        {showQR && qrData && (
          <div className="hidden lg:block" style={{ marginBottom: 14 }}>
            <span style={{ display: "inline-block", background: PAGE, border: `1px solid ${LINE}`, borderRadius: 12, padding: 10 }}>
              <img src={qrData} alt={`QR ${storeName}`} width={128} height={128} style={{ width: 128, height: 128, display: "block" }} />
            </span>
            <div style={{ marginTop: 8 }}>
              <a href={qrData} download={`qr-${slug}.png`} style={{ fontSize: 12, fontWeight: 600, color: TAUPE_DEEP, textDecoration: "none", borderBottom: `1px solid ${TAUPE}` }}>
                Unduh PNG
              </a>
            </div>
          </div>
        )}
        <div style={{ fontSize: 16, fontWeight: 500, fontFamily: DISPLAY, color: INK }}>{storeName}{city ? ` · ${city}` : ""}</div>
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
            style={{ background: INK, color: PAGE, borderRadius: 999, minHeight: 50, padding: "0 20px", textDecoration: "none", fontSize: 14.5, fontWeight: 600, boxShadow: "0 10px 26px rgba(46,42,36,.22)", pointerEvents: "auto" }}
          >
            <span className="flex items-center gap-2">
              <Icon name="cart" size={18} /> Lihat keranjang
            </span>
            <span className="flex items-center gap-1.5">
              <span className="tnum" style={{ background: "rgba(246,241,234,.2)", borderRadius: 999, minWidth: 24, height: 24, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 800, padding: "0 6px" }}>
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
