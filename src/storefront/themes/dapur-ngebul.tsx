/**
 * Tema 5 — "Dapur Ngebul" (katering & jajanan).
 * Papan menu chalk. SEMUA data dari props.
 */
import { useState } from "react";
import { rupiah } from "../../lib/format";
import type { Product } from "../../lib/shop";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { nextOpenText } from "./shared";

const BG = "#FAF6ED";
const SURFACE = "#FFFDF7";
const INK = "#221B14";
const MUTED = "#615649";
const ACCENT = "#8A6A00";
const ON_ACCENT = "#FFFFFF";
const BUKA = "#166B3C";
const TUTUP = "#B0261B";
const HABIS = "#8A7F6E";
const DEAD_BG = "#EAE3D5";
const DISPLAY = "Fraunces, Georgia, serif";
const BODY = "'Plus Jakarta Sans', 'Segoe UI', ui-sans-serif, system-ui, sans-serif";

function Row({ p, slug, canAdd, closed, onAdd, onChatWA }: {
  p: Product; slug: string; canAdd: boolean; closed: boolean;
  onAdd: (p: Product) => void; onChatWA: () => void;
}) {
  const out = p.stock === 0;
  const dead = !canAdd || out;
  return (
    <div className="flex gap-3" style={{ padding: "14px 0", borderBottom: `1px solid ${INK}14` }}>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ position: "relative", flexShrink: 0, width: 104, height: 104, borderRadius: 8, overflow: "hidden", display: "block" }}>
        <img src={p.img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {!closed && (
          out ? (
            <span style={{ position: "absolute", right: 6, bottom: 6, border: `2px double ${TUTUP}`, color: TUTUP, background: "#FFFDF7E6", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 7px", borderRadius: 4, transform: "rotate(-14deg)" }}>
              HABIS
            </span>
          ) : p.stock <= 5 ? (
            <span className="tnum" style={{ position: "absolute", right: 6, bottom: 6, background: "#F5DE8B", color: ACCENT, fontSize: 10, fontWeight: 800, padding: "3px 7px", borderRadius: 999 }}>
              Sisa {p.stock}
            </span>
          ) : null
        )}
      </a>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <a href={`#/s/${slug}/p/${p.id}`} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: INK, textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {p.name}
          </a>
          <span aria-hidden style={{ flex: 1, borderBottom: "1px dotted rgba(34,27,20,.35)", transform: "translateY(-4px)" }} />
          <span className="tnum shrink-0" style={{ fontSize: 17, fontWeight: 700, color: ACCENT }}>{rupiah(p.price)}</span>
        </div>
        {p.desc ? (
          <p style={{ fontSize: 12, color: MUTED, margin: "5px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</p>
        ) : null}
        <div className="flex items-center justify-end gap-2" style={{ marginTop: 10 }}>
          {!closed && !out && (
            <button onClick={onChatWA} aria-label="Tanya stok" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: `1px solid ${INK}30`, borderRadius: 8, color: INK, cursor: "pointer" }}>
              <Icon name="wa" size={18} />
            </button>
          )}
          {dead ? (
            <div style={{ height: 44, minWidth: 120, padding: "0 16px", borderRadius: 8, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, background: DEAD_BG, color: HABIS }}>
              {closed ? "Toko tutup" : "Habis hari ini"}
            </div>
          ) : (
            <button
              onClick={() => onAdd(p)}
              aria-label={`Pesan ${p.name}`}
              style={{ height: 44, minWidth: 120, padding: "0 16px", border: "none", borderRadius: 8, background: ACCENT, color: ON_ACCENT, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: BODY }}
            >
              + Pesan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DapurNgebul(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, avatarUrl, coverUrl, closed,
    items, allItems, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink, openNow, todayHours, hourRows,
    showHours, showQR, showCart, cartCount, onAdd, onChatWA,
    qrData, onOpenQR, onShare, shared,
  } = p;
  const canAdd = showCart && !closed;
  const dirty = q.trim() !== "" || cat !== "Semua";
  const nextOpen = closed ? nextOpenText(hourRows, todayHours) : null;

  return (
    <div style={{ background: BG, color: INK, fontFamily: BODY, fontSize: 14, lineHeight: 1.55, minHeight: "100vh" }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: BG, borderBottom: `1px solid ${INK}12` }}>
        <div className="flex items-center gap-2.5 px-4" style={{ height: 64 }}>
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full" style={{ border: `2px solid ${ACCENT}4D`, background: ACCENT, color: ON_ACCENT, fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18 }}>{storeName}</span>
            {city ? <span className="flex items-center gap-1 truncate" style={{ fontSize: 12, color: MUTED }}><Icon name="pin" size={13} />{city}</span> : null}
          </span>
          <span className="tnum" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: "#fff", background: openNow === false || closed ? TUTUP : BUKA, padding: "6px 10px", borderRadius: 999 }}>
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
            <a href="#/cart" aria-label="Keranjang" style={{ position: "relative", width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 8, background: INK, color: BG }}>
              <Icon name="cart" size={18} />
              {cartCount > 0 && (
                <span className="tnum" style={{ position: "absolute", top: 5, right: 6, fontSize: 13, fontFamily: DISPLAY, fontWeight: 700 }}>{cartCount}</span>
              )}
            </a>
          )}
        </div>
        <div className="px-4 pb-2 md:hidden tnum" style={{ fontSize: 12, color: MUTED }}>
          {closed ? <>Tutup{nextOpen ? ` · ${nextOpen}` : ""}</> : todayHours || "Buka hari ini"}
        </div>
      </header>

      {/* sampul + pita */}
      {coverUrl && (
        <div>
          <img src={coverUrl} alt="" style={{ width: "100%", height: 168, objectFit: "cover", display: "block", borderBottom: `3px solid ${ACCENT}` }} />
        </div>
      )}
      <div className="px-4" style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, color: ACCENT }}>▬▬▬ PAPAN MENU HARI INI ▬▬▬</div>
        {bio ? (
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: "8px 0 0" }}>{bio}</p>
        ) : (
          <p className="tnum" style={{ fontSize: 13.5, color: MUTED, margin: "8px 0 0" }}>
            {[city, `${allItems.length} menu`].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* tautan */}
      {bioLinks.length > 0 && (
        <div className="grid grid-cols-2 gap-2 px-4" style={{ marginTop: 14 }}>
          {bioLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => onOpenBioLink(l)}
              className="flex items-center gap-2 text-left"
              style={{ minHeight: 48, background: "none", border: `1px dashed ${INK}38`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: INK }}
            >
              <Icon name={iconForLink(l.icon)} size={18} />
              <span className="min-w-0 flex-1 truncate" style={{ fontSize: 12, fontWeight: 600 }}>
                {l.icon === "wa" ? "hitung porsi" : l.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* filter */}
      <div className="px-4" style={{ marginTop: 14 }}>
        <div className="relative">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Cari menu"
            aria-label="Cari menu"
            style={{ width: "100%", height: 46, borderRadius: 10, border: `1px solid ${INK}22`, background: SURFACE, padding: "0 40px 0 38px", fontSize: 14, color: INK, outline: "none" }}
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
              style={{ flexShrink: 0, background: cat === c ? INK : "transparent", color: cat === c ? BG : INK, border: `1px solid ${INK}35`, borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: cat === c ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {c}
            </button>
          ))}
          <button
            onClick={onResetFilter}
            disabled={!dirty}
            style={{ flexShrink: 0, background: "none", border: "none", color: MUTED, opacity: dirty ? 1 : 0.4, fontSize: 13, fontWeight: 600, cursor: dirty ? "pointer" : "default", whiteSpace: "nowrap", padding: "8px 6px" }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* menu */}
      <main className="px-4" style={{ paddingBottom: 8 }}>
        {loading ? (
          <div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3" style={{ padding: "14px 0", borderBottom: `1px solid ${INK}14` }}>
                <div style={{ width: 104, height: 104, borderRadius: 8, background: `${INK}10`, flexShrink: 0 }} />
                <div style={{ flex: 1, display: "grid", gap: 8, alignContent: "start", paddingTop: 6 }}>
                  <div style={{ height: 14, background: `${INK}12`, borderRadius: 4 }} />
                  <div style={{ height: 12, width: "60%", background: `${INK}10`, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", border: `1px dashed ${INK}30`, borderRadius: 12, marginTop: 12 }}>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full" style={{ border: `1px solid ${INK}25`, color: MUTED }}>
              <Icon name="box" size={26} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, marginTop: 14 }}>
              {q || cat !== "Semua" ? `Tidak ada menu “${q || cat}”` : "Belum ada menu hari ini. Dapur menulis menu baru tiap subuh."}
            </div>
            {(q || cat !== "Semua") && (
              <button onClick={onResetFilter} style={{ marginTop: 12, background: "none", border: "none", fontSize: 13.5, color: ACCENT, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
                lihat semua menu
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-x-8 md:grid-cols-2">
            {items.map((item) => (
              <Row key={item.id} p={item} slug={slug} canAdd={canAdd} closed={closed} onAdd={onAdd} onChatWA={onChatWA} />
            ))}
          </div>
        )}
      </main>

      {/* jam */}
      {showHours && (
        <div className="px-4" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", fontWeight: 700, color: ACCENT }}>JAM DAPUR</div>
          {hourRows.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6">
              {hourRows.map((h) => (
                <div key={h.day} className="tnum flex items-baseline justify-between gap-2" style={{ fontSize: 12.5, padding: "6px 0", borderBottom: `1px solid ${INK}10`, textDecoration: h.text === todayHours ? "underline" : "none", textUnderlineOffset: 4, textDecorationColor: ACCENT }}>
                  <span style={{ color: MUTED }}>{h.day}</span>
                  <span style={{ color: h.on ? INK : TUTUP }}>{h.on ? h.text : "LIBUR"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: MUTED, marginTop: 6 }}>Jadwal belum diatur penjual.</div>
          )}
        </div>
      )}

      {/* footer + QR */}
      <footer style={{ textAlign: "center", marginTop: 24, padding: "0 16px 40px" }}>
        {showQR && qrData && (
          <div style={{ display: "inline-block", background: SURFACE, border: `1px solid ${INK}16`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <img src={qrData} alt={`QR ${storeName}`} width={150} height={150} style={{ width: 150, height: 150, display: "block" }} />
            <a href={qrData} download={`qr-${slug}.png`} style={{ display: "inline-block", marginTop: 10, background: ACCENT, color: ON_ACCENT, borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Unduh PNG
            </a>
          </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 700 }}>{storeName}{city ? ` · ${city}` : ""}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Dibuat dengan TokoLink</div>
      </footer>
    </div>
  );
}
