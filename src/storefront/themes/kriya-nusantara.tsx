/**
 * Tema 06 — "Kriya Nusantara" (etalase asimetris).
 *
 * Diport dari desain_toko_seller (layout "masonry"): bidang foto tinggi
 * berbeda dalam grid 12 kolom, label kategori vertikal di tepi kiri,
 * blok cerita + panel kirim. SEMUA data dari props.
 *
 * Penyesuaian jujur: blok cerita = bio asli seller (disembunyikan bila
 * kosong — tidak ada karangan "tungku kayu Plered"); panel kirim berisi
 * kota + QRIS + WA asli.
 */
import { rupiah } from "../../lib/data";
import type { ThemeStorefrontProps } from "../types";
import { ThemeBioLinks } from "./shared";

const PAPER = "#F0E9DE";
const PANEL = "#E7DECF";
const INK = "#2A211A";
const INK_SOFT = "#7A6C5D";
const LINE = "#D6C9B4";
const ACCENT = "#9C4B1E";
const ACCENT_INK = "#FBF6EE";
const DISPLAY = "'Fraunces', Georgia, serif";
const BODY = "'IBM Plex Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

const RATIOS = ["4 / 5", "1 / 1", "3 / 2", "4 / 5", "1 / 1", "3 / 2"];

export function KriyaNusantara(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, waNumber, avatarUrl, closed,
    items, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink,
    showHours, showCart, cartCount, onAdd, onChatWA, onShare, shared,
    openNow, todayHours, hourRows,
  } = p;
  const canAdd = showCart && !closed;

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: BODY, fontSize: 15, lineHeight: 1.5, minHeight: "100vh" }}>
      {/* header */}
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-5 pb-6 pt-8 lg:px-11 lg:pt-9" style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="flex min-w-0 items-end gap-5">
          <span aria-hidden style={{ width: 50, height: 50, display: "grid", placeItems: "center", background: ACCENT, color: ACCENT_INK, fontFamily: DISPLAY, fontWeight: 500, fontSize: 20, borderRadius: 3, flexShrink: 0, overflow: "hidden" }}>
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (storeName || "T").slice(0, 1).toUpperCase()}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: "clamp(1.9rem, 5vw, 2.75rem)", letterSpacing: "-0.015em", lineHeight: 1.05, overflowWrap: "break-word" }}>
              {storeName}
            </div>
            <div className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, marginTop: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              tokolink.store/s/{slug}{city ? ` · ${city}` : ""}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {showHours && (
            <span className="flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: 99, background: openNow === false ? "#B23A22" : "#4F7A4A", display: "inline-block" }} />
              {openNow === false ? "Tutup" : todayHours || "Buka"}
            </span>
          )}
          <button onClick={onChatWA} style={{ background: ACCENT, color: ACCENT_INK, border: "none", padding: "13px 20px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
            WhatsApp
          </button>
          <button onClick={onShare} style={{ border: `1px solid ${LINE}`, background: "transparent", color: INK, padding: "12px 18px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            {shared ? "Tersalin" : "Bagikan"}
          </button>
          {showCart && (
            <a href="#/cart" style={{ border: `1px solid ${INK}`, color: INK, padding: "12px 18px", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
              Keranjang (<span className="tnum">{cartCount}</span>)
            </a>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row" style={{ borderBottom: `1px solid ${LINE}` }}>
        {/* label vertikal (desktop) / horizontal (HP) */}
        <div className="hidden shrink-0 flex-col items-center gap-6 lg:flex" style={{ width: 54, padding: "26px 0", borderRight: `1px solid ${LINE}` }}>
          {cats.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => onCat(c)}
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: active ? ACCENT : INK_SOFT, background: "none", border: "none", borderLeft: active ? `2px solid ${ACCENT}` : "2px solid transparent", paddingLeft: 6, whiteSpace: "nowrap", cursor: "pointer" }}
              >
                {c}
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 gap-5 overflow-x-auto px-5 py-3 lg:hidden" style={{ borderBottom: `1px solid ${LINE}` }}>
          {cats.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => onCat(c)}
                style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: active ? ACCENT : INK_SOFT, background: "none", border: "none", borderBottom: active ? `2px solid ${ACCENT}` : "none", paddingBottom: 4, whiteSpace: "nowrap", cursor: "pointer" }}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="min-w-0 flex-1" style={{ padding: "24px 20px 30px" }}>
          <div className="mb-4 flex">
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Cari karya…"
              aria-label="Cari karya"
              style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", borderBottom: `1px solid ${LINE}`, fontSize: 14, fontFamily: BODY, color: INK, outline: "none", padding: "8px 2px" }}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ height: 220, background: PANEL }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 12px", borderTop: `1px solid ${LINE}` }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 28 }}>Belum ada karya di sini</div>
              <p style={{ fontSize: 14, color: INK_SOFT, marginTop: 10 }}>
                {q ? `Tidak ada yang cocok dengan “${q}”.` : "Kirim pesan untuk pesanan khusus."}
              </p>
              <button onClick={onResetFilter} style={{ marginTop: 18, border: `1px solid ${INK}`, background: "transparent", color: INK, padding: "12px 24px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                Tampilkan semua
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-12 lg:gap-7">
              {items.map((item, i) => {
                const out = item.stock === 0;
                return (
                  <figure key={item.id} className="lg:col-span-6" style={{ minWidth: 0 }}>
                    <a href={`#/s/${slug}/p/${item.id}`} style={{ display: "block", background: PANEL }} aria-label={item.name}>
                      <img
                        src={item.img}
                        alt=""
                        loading="lazy"
                        style={{ aspectRatio: RATIOS[i % RATIOS.length], width: "100%", objectFit: "cover", display: "block", opacity: out ? 0.6 : 1 }}
                      />
                    </a>
                    <figcaption style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "baseline", marginTop: 12, borderTop: `1px solid ${LINE}`, paddingTop: 10 }}>
                      <span style={{ minWidth: 0 }}>
                        <a href={`#/s/${slug}/p/${item.id}`} style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 500, display: "block", letterSpacing: "-0.01em", lineHeight: 1.25, color: INK, textDecoration: "none" }}>
                          {item.name}
                        </a>
                        <span className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, display: "block", marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.cat}{item.unit ? ` · ${item.unit}` : ""}{out ? " · Habis" : ""}
                        </span>
                      </span>
                      {canAdd && !out ? (
                        <button onClick={() => onAdd(item)} aria-label={`Tambah ${item.name}`} className="tnum" style={{ fontFamily: MONO, background: "none", border: "none", fontSize: 15, color: ACCENT, cursor: "pointer", whiteSpace: "nowrap" }}>
                          {rupiah(item.price)} +
                        </button>
                      ) : (
                        <span className="tnum" style={{ fontFamily: MONO, fontSize: 14, color: out ? INK_SOFT : INK, whiteSpace: "nowrap" }}>
                          {rupiah(item.price)}
                        </span>
                      )}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}

          {/* blok cerita + kirim */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-12 sm:gap-7" style={{ marginTop: 30 }}>
            {bio && (
              <div className="sm:col-span-7" style={{ background: PANEL, padding: "24px 26px", border: `1px solid ${LINE}` }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em", color: ACCENT }}>Cerita pembuat</span>
                <p style={{ fontFamily: DISPLAY, fontSize: 20, lineHeight: 1.45, marginTop: 10 }}>{bio}</p>
              </div>
            )}
            <div className={bio ? "sm:col-span-5" : "sm:col-span-12"} style={{ border: `1px solid ${LINE}`, padding: "24px 26px" }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em", color: INK_SOFT }}>Pengiriman & info</span>
              <p className="tnum" style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.8, color: INK_SOFT, marginTop: 10 }}>
                {city && <>{city}<br /></>}
                Bayar via QRIS<br />
                {showHours && hourRows.length > 0 && <><br />{hourRows.map((h) => `${h.day.slice(0, 3)}: ${h.text}`).join(" · ")}</>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 lg:px-11" style={{ marginTop: 18 }}>
        <ThemeBioLinks links={bioLinks} onOpen={onOpenBioLink} />
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 px-5 py-5 lg:px-11">
        <span className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT }}>
          Bayar via QRIS{city ? ` · ${city}` : ""}
        </span>
        {showCart && (
          <a href="#/cart" className="tnum" style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: ACCENT }}>
            Keranjang ({cartCount}) →
          </a>
        )}
      </footer>
    </div>
  );
}
