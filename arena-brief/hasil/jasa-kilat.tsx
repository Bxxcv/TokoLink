/**
 * Tema 4 — "Jasa Kilat" (servis & jasa) — REVISI VISUAL 12 Okt 2026.
 * Gaya: situs booking jasa (IMG-20261001-WA0002) — bar atas hijau tua,
 * kartu jasa putih di atas blok hijau muda, tombol hijau pekat.
 * SEMUA data dari props. Badge hanya dari data asli (Populer = sold
 * tertinggi unik); Baru/Terverifikasi butuh data → KEBUTUHAN-DATA.md.
 */
import { useState } from "react";
import { rupiah } from "../../lib/format";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { nextOpenText } from "./shared";

type Item = ThemeStorefrontProps["items"][number];

const PAGE = "#F4F7F5";
const SURFACE = "#FFFFFF";
const INK = "#16301F";
const MUTED = "#5E6E63";
const LINE = "rgba(22,48,31,.12)";
const DARK = "#14512F";
const GREEN = "#1F6B41";
const SOFT = "#E7F1EA";
const MID = "#CFE6D6";
const SOFT_LINE = "#C9E1D2";
const ON_GREEN = "#FFFFFF";
const LIGHT_ON_DARK = "#C4DED0";
const TUTUP = "#C0261E";
const HABIS = "#7C8179";
const HABIS_BG = "#EDEEEB";
const SISA = "#A97400";
const SISA_BG = "#FFF3D6";
const DISPLAY = "'Archivo', 'Trebuchet MS', ui-sans-serif, system-ui, sans-serif";
const BODY = "'Plus Jakarta Sans', 'Segoe UI', ui-sans-serif, system-ui, sans-serif";
const WRAP = "mx-auto w-full max-w-[1240px] px-4";

function StockCap({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span style={{ background: HABIS, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 6 }}>
        HABIS
      </span>
    );
  if (stock <= 5)
    return (
      <span style={{ background: SISA_BG, color: SISA, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 6 }}>
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
    <article style={{ background: SURFACE, borderRadius: 12, overflow: "hidden", border: `1px solid ${LINE}` }}>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ display: "block", position: "relative" }}>
        <img src={p.img} alt="" loading="lazy" style={{ aspectRatio: "1 / 1", width: "100%", objectFit: "cover", display: "block", background: MID }} />
        <span style={{ position: "absolute", left: 6, bottom: 6 }}>
          <StockCap stock={p.stock} />
        </span>
        {isTop && (
          <span style={{ position: "absolute", top: 8, left: 8, background: DARK, color: ON_GREEN, fontSize: 10, fontWeight: 800, letterSpacing: "0.04em", padding: "4px 8px", borderRadius: 6 }}>
            Populer
          </span>
        )}
      </a>
      <div style={{ padding: "10px 11px 12px", opacity: closed ? 0.75 : 1 }}>
        <a
          href={`#/s/${slug}/p/${p.id}`}
          style={{ fontSize: 13.5, fontWeight: 700, color: INK, textDecoration: "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.35, minHeight: 36 }}
        >
          {p.name}
        </a>
        <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 5 }}>
          <span style={{ fontSize: 15.5, fontWeight: 800, color: GREEN }}>{rupiah(p.price)}</span>
          {p.unit ? <span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>· {p.unit}</span> : null}
        </div>
        {dead ? (
          <div style={{ marginTop: 8, minHeight: 44, borderRadius: 8, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700, background: HABIS_BG, color: closed && !out ? "#6E6357" : HABIS }}>
            {closed && !out ? "Toko tutup" : "Stok habis"}
          </div>
        ) : (
          <button
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name}`}
            style={{ marginTop: 8, width: "100%", minHeight: 44, border: "none", borderRadius: 8, background: DARK, color: ON_GREEN, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: BODY }}
          >
            + Tambah
          </button>
        )}
      </div>
    </article>
  );
}

export function JasaKilat(p: ThemeStorefrontProps) {
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
    document.getElementById("tk-katalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: PAGE, color: INK, fontFamily: BODY, fontSize: 14, lineHeight: 1.5, minHeight: "100vh", paddingBottom: barOn ? 78 : 0 }}>
      {/* bar atas hijau tua */}
      <header className="sticky top-0 z-40" style={{ background: DARK }}>
        <div className={`${WRAP} flex items-center gap-2.5`} style={{ height: 56 }}>
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full" style={{ background: MID, color: DARK, fontFamily: DISPLAY, fontWeight: 800, fontSize: 14 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, color: "#FFFFFF" }}>{storeName}</span>
            {city ? <span className="block truncate" style={{ fontSize: 12, color: LIGHT_ON_DARK }}>{city}</span> : null}
          </span>
          <span className="tnum" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: tutup ? "#fff" : DARK, background: tutup ? TUTUP : "#EAF5EE", padding: "5px 9px", borderRadius: 999 }}>
            {tutup ? "TUTUP" : "BUKA"}
          </span>
          {showQR && (
            <button onClick={onOpenQR} aria-label="QR toko" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", color: "#FFFFFF", cursor: "pointer" }}>
              <Icon name="qr" size={19} />
            </button>
          )}
          <button onClick={onShare} aria-label="Bagikan" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", color: "#FFFFFF", cursor: "pointer" }}>
            <Icon name={shared ? "check" : "external"} size={19} />
          </button>
          {showCart && (
            <a href="#/cart" aria-label="Keranjang" style={{ position: "relative", width: 44, height: 44, display: "grid", placeItems: "center", color: "#FFFFFF" }}>
              <Icon name="cart" size={19} />
              {cartCount > 0 && (
                <span className="tnum" style={{ position: "absolute", top: 4, right: 2, minWidth: 17, height: 17, borderRadius: 999, background: "#EAF5EE", color: DARK, fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 4px" }}>
                  {cartCount}
                </span>
              )}
            </a>
          )}
        </div>
      </header>

      {/* banner tutup */}
      {closed && (
        <div style={{ background: "#FBEAE8", color: "#8F1E17", padding: "10px 16px", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
          Toko tutup{nextOpen ? ` · ${nextOpen}` : ""}
        </div>
      )}

      {/* sampul */}
      {coverUrl && <img src={coverUrl} alt="" style={{ width: "100%", height: 152, objectFit: "cover", display: "block" }} />}

      {/* hero panel hijau muda */}
      <section className={WRAP} style={{ marginTop: coverUrl ? -22 : 14 }}>
        <div style={{ background: SOFT, border: `1px solid ${SOFT_LINE}`, borderRadius: 14, padding: "14px 15px" }}>
          {promo && (
            <div style={{ background: SURFACE, border: `1px dashed ${GREEN}`, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
              <div className="micro" style={{ color: GREEN }}>PROMO</div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: INK, marginTop: 4, lineHeight: 1.3, overflowWrap: "anywhere" }}>{promo.label}</div>
              <span className="tnum" style={{ display: "inline-block", marginTop: 8, background: SOFT, border: `1px solid ${SOFT_LINE}`, color: DARK, borderRadius: 6, padding: "5px 10px", fontSize: 13, fontWeight: 800, letterSpacing: "0.04em" }}>
                {promo.code}
              </span>
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: GREEN }}>{statusLine}</div>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21, lineHeight: 1.2, color: INK, margin: "6px 0 0", overflowWrap: "anywhere" }}>{storeName}</h1>
              {city ? <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>{city}</div> : null}
            </div>
            {allItems.length > 0 && (
              <span className="tnum shrink-0" style={{ background: SURFACE, border: `1px solid ${SOFT_LINE}`, color: DARK, borderRadius: 8, fontSize: 11.5, fontWeight: 700, padding: "6px 11px", whiteSpace: "nowrap" }}>
                {allItems.length} layanan
              </span>
            )}
          </div>
          {bio ? (
            <>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: "10px 0 0", display: "-webkit-box", WebkitLineClamp: more ? 99 : 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>
              {bio.length > 140 && (
                <button onClick={() => setMore((m) => !m)} style={{ background: "none", border: "none", padding: "6px 0 0", color: GREEN, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
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
              style={{ marginTop: 12, minHeight: 42, padding: "0 20px", border: "none", borderRadius: 8, background: DARK, color: ON_GREEN, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: BODY }}
            >
              Lihat katalog ↓
            </button>
          )}
        </div>
      </section>

      {/* tautan */}
      {bioLinks.length > 0 && (
        <section className={WRAP} style={{ marginTop: 14 }}>
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
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: SOFT, color: GREEN }}>
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
            <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", background: SURFACE, borderRadius: 10, border: `1px solid ${LINE}`, overflow: "hidden" }}>
              {hourRows.map((h) => (
                <li key={h.day} className="tnum flex items-center justify-between" style={{ padding: "9px 12px", fontSize: 13, background: h.text === todayHours ? SOFT : undefined }}>
                  <span style={{ fontWeight: h.text === todayHours ? 700 : 400 }}>
                    <span aria-hidden style={{ color: h.on ? GREEN : "transparent" }}>●</span> {h.day}
                  </span>
                  <span style={{ color: h.on ? INK : TUTUP }}>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* cari + pil kategori */}
      <div className="md:sticky md:z-30" style={{ top: 56, background: PAGE }}>
        <div className={WRAP} style={{ paddingTop: 12, paddingBottom: 10 }}>
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Cari layanan…"
              aria-label="Cari layanan"
              className="focus:outline-2 focus:outline-offset-1 focus:outline-[#1F6B41]"
              style={{ width: "100%", height: 46, borderRadius: 10, border: `1px solid ${LINE}`, background: SURFACE, padding: "0 38px", fontSize: 14, color: INK }}
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
                style={{ flexShrink: 0, border: `1px solid ${cat === c ? DARK : LINE}`, background: cat === c ? DARK : SURFACE, color: cat === c ? ON_GREEN : INK, borderRadius: 999, padding: "9px 14px", fontSize: 13, fontWeight: cat === c ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {c} · <span className="tnum">{countOf(c)}</span>
              </button>
            ))}
            {dirty && (
              <button onClick={onResetFilter} style={{ flexShrink: 0, background: "none", border: "none", color: GREEN, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", padding: "9px 6px" }}>
                Atur ulang
              </button>
            )}
          </div>
        </div>
      </div>

      {/* katalog */}
      <main id="tk-katalog" className={WRAP} style={{ marginTop: 2, paddingBottom: 28, scrollMarginTop: 68 }}>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: SURFACE, borderRadius: 12, overflow: "hidden", border: `1px solid ${LINE}` }}>
                <div style={{ aspectRatio: "1/1", background: MID }} />
                <div style={{ padding: 10, display: "grid", gap: 8 }}>
                  <div style={{ height: 13, background: "rgba(22,48,31,.08)", borderRadius: 4 }} />
                  <div style={{ height: 13, width: "55%", background: "rgba(22,48,31,.08)", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 20px", background: SURFACE, borderRadius: 12, border: "1px dashed rgba(22,48,31,.2)" }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{q || cat !== "Semua" ? `Tidak ada “${q || cat}”` : "Belum ada layanan"}</div>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>
              {q || cat !== "Semua" ? "Coba kata lain atau atur ulang filter." : "Tambahkan layanan lewat dasbor TokoLink."}
            </p>
            {(q || cat !== "Semua") && (
              <button onClick={onResetFilter} style={{ marginTop: 14, background: DARK, color: ON_GREEN, border: "none", borderRadius: 8, padding: "12px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
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

      {/* footer hijau tua */}
      <footer style={{ background: DARK, padding: "20px 16px 40px", textAlign: "center", color: "#FFFFFF" }}>
        {showQR && qrData && (
          <div className="hidden lg:block" style={{ marginBottom: 14 }}>
            <span style={{ display: "inline-block", background: SURFACE, borderRadius: 12, padding: 10 }}>
              <img src={qrData} alt={`QR ${storeName}`} width={128} height={128} style={{ width: 128, height: 128, display: "block" }} />
            </span>
            <div style={{ marginTop: 8 }}>
              <a href={qrData} download={`qr-${slug}.png`} style={{ fontSize: 12, fontWeight: 600, color: "#EAF5EE", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,.4)" }}>
                Unduh PNG
              </a>
            </div>
          </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 700 }}>{storeName}{city ? ` · ${city}` : ""}</div>
        <div style={{ fontSize: 12, color: LIGHT_ON_DARK, marginTop: 4 }}>Dibuat dengan tokolink.store</div>
        <div style={{ marginTop: 10 }}>
          <button onClick={onChatWA} style={{ background: "none", border: "none", fontSize: 12.5, color: LIGHT_ON_DARK, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
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
            style={{ background: DARK, color: ON_GREEN, borderRadius: 999, minHeight: 50, padding: "0 20px", textDecoration: "none", fontSize: 14.5, fontWeight: 700, boxShadow: "0 8px 24px rgba(20,81,47,.25)", pointerEvents: "auto" }}
          >
            <span className="flex items-center gap-2">
              <Icon name="cart" size={18} /> Lihat keranjang
            </span>
            <span className="flex items-center gap-1.5">
              <span className="tnum" style={{ background: "rgba(255,255,255,.2)", borderRadius: 999, minWidth: 24, height: 24, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 800, padding: "0 6px" }}>
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
