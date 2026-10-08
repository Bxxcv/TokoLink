/**
 * Tema 4 — "Jasa Kilat" (servis & jasa).
 * Utilitarian: daftar, kode, angka. SEMUA data dari props.
 */
import { useState } from "react";
import { rupiah } from "../../lib/format";
import type { Product } from "../../lib/shop";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { hasPhoto, nextOpenText, skuShort } from "./shared";

const BG = "#EDF1F4";
const SURFACE = "#FFFFFF";
const INK = "#0E1721";
const MUTED = "#4E5A66";
const ACCENT = "#0B57D0";
const ON_ACCENT = "#FFFFFF";
const TUTUP = "#C22B22";
const HABIS_BG = "#E3E8EC";
const HABIS_TX = "#7C8896";
const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS = "'IBM Plex Sans', 'Segoe UI', ui-sans-serif, system-ui, sans-serif";

function Row({ p, slug, canAdd, closed, onAdd }: { p: Product; slug: string; canAdd: boolean; closed: boolean; onAdd: (p: Product) => void }) {
  const out = p.stock === 0;
  const dead = !canAdd || out;
  return (
    <div className="flex items-center gap-3" style={{ minHeight: 96, padding: "14px 0", borderBottom: `1px solid ${INK}14` }}>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ flexShrink: 0, width: 88, height: 62, borderRadius: 4, overflow: "hidden", background: "#0E1721", display: "grid", placeItems: "center" }}>
        {hasPhoto(p.img) ? (
          <img src={p.img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <span className="tnum" style={{ fontFamily: MONO, fontSize: 9, color: "#8FA0B0", padding: 4, textAlign: "center", wordBreak: "break-all" }}>
            {skuShort(p.sku, p.id)}
          </span>
        )}
      </a>
      <div className="min-w-0 flex-1">
        <a href={`#/s/${slug}/p/${p.id}`} style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: INK, textDecoration: "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.35 }}>
          {p.name}
        </a>
        <div className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {skuShort(p.sku, p.id)} · {p.cat}
        </div>
        <div className="flex items-center gap-2" style={{ marginTop: 5 }}>
          <span className="tnum" style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: ACCENT }}>{rupiah(p.price)}</span>
          <span className="tnum" style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, padding: "3px 6px", borderRadius: 3, background: out ? "#C22B2214" : closed ? HABIS_BG : "transparent", color: out ? TUTUP : closed ? HABIS_TX : MUTED, border: out || closed ? "none" : `1px solid ${INK}22` }}>
            {out ? "HABIS 0" : closed ? "TUTUP" : p.unit || `slot ${p.stock}`}
          </span>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        {dead ? (
          <div className="tnum" style={{ width: 108, height: 44, borderRadius: 6, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, fontFamily: MONO, background: HABIS_BG, color: HABIS_TX }}>
            {closed ? "TUTUP" : "Kuota habis"}
          </div>
        ) : (
          <button
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name}`}
            style={{ width: 108, height: 44, border: "none", borderRadius: 6, background: ACCENT, color: ON_ACCENT, fontFamily: MONO, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            + Tambah
          </button>
        )}
      </div>
    </div>
  );
}

export function JasaKilat(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, avatarUrl, closed,
    items, allItems, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink, openNow, todayHours, hourRows,
    showHours, showQR, showCart, cartCount, onAdd,
    onOpenQR, onShare, shared,
  } = p;
  const canAdd = showCart && !closed;
  const [hoursOpen, setHoursOpen] = useState(false);
  const dirty = q.trim() !== "" || cat !== "Semua";
  const nextOpen = closed ? nextOpenText(hourRows, todayHours) : null;
  const wibDay = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).getDay() + 6) % 7];

  return (
    <div style={{ background: BG, color: INK, fontFamily: SANS, fontSize: 14, lineHeight: 1.5, minHeight: "100vh" }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: SURFACE, borderBottom: `1px solid ${INK}18` }}>
        <div className="flex items-center gap-2.5 px-4" style={{ height: 52 }}>
          <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden" style={{ borderRadius: 6, background: ACCENT, color: ON_ACCENT, fontFamily: MONO, fontWeight: 600, fontSize: 12 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: MONO, fontWeight: 600, fontSize: 15, textTransform: "uppercase" }}>{storeName}</span>
            {city ? <span className="block truncate" style={{ fontSize: 11, color: MUTED }}>{city}</span> : null}
          </span>
          {openNow === false || closed ? (
            <span className="tnum" style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, background: TUTUP, color: "#fff", padding: "6px 9px", borderRadius: 3 }}>
              TUTUP
            </span>
          ) : (
            <span className="tnum" style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: "#0A7C43" }}>● BUKA</span>
          )}
          {showQR && (
            <button onClick={onOpenQR} aria-label="QR toko" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: `1px solid ${INK}24`, borderRadius: 6, color: INK, cursor: "pointer" }}>
              <Icon name="qr" size={18} />
            </button>
          )}
          <button onClick={onShare} aria-label="Bagikan" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: `1px solid ${INK}24`, borderRadius: 6, color: INK, cursor: "pointer" }}>
            <Icon name={shared ? "check" : "external"} size={18} />
          </button>
          {showCart && (
            <a href="#/cart" aria-label="Keranjang" className="tnum" style={{ minWidth: 44, height: 44, display: "grid", placeItems: "center", color: INK, textDecoration: "none", fontFamily: MONO, fontSize: 13, fontWeight: 600 }}>
              [{cartCount}]
              <span style={{ fontSize: 9, fontWeight: 400, color: MUTED }}>keranjang</span>
            </a>
          )}
        </div>
        <div className="px-4 pb-2 min-[480px]:hidden tnum" style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>
          {todayHours || (openNow === false ? "Tutup hari ini" : "")} · {allItems.length} layanan aktif
        </div>
      </header>

      {/* fakta profil */}
      <div className="px-4 tnum" style={{ paddingTop: 12, fontFamily: MONO, fontSize: 12, color: MUTED }}>
        {[city, `${allItems.length} layanan`, `${wibDay}: ${todayHours || (openNow === false ? "Tutup" : "—")}`].filter(Boolean).join(" · ")}
      </div>
      {bio ? <p className="px-4" style={{ fontSize: 13.5, color: INK, margin: "6px 0 0" }}>{bio}</p> : null}

      {/* banner tutup */}
      {closed && (
        <div className="mx-4 tnum" style={{ marginTop: 12, minHeight: 40, display: "flex", alignItems: "center", padding: "10px 12px", background: `${TUTUP}14`, borderRadius: 6, fontFamily: MONO, fontSize: 12 }}>
          Workshop tutup. Lihat daftar & harga; tombol tambah mati{nextOpen ? ` sampai ${nextOpen}` : ""}.
        </div>
      )}

      {/* toolbar */}
      <div className="sticky z-30 px-4" style={{ top: 52, background: BG, paddingTop: 12, paddingBottom: 8 }}>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="cari layanan atau kode"
              aria-label="Cari layanan"
              style={{ width: "100%", height: 44, border: `1px solid ${INK}30`, borderRadius: 6, background: SURFACE, padding: "0 12px 0 36px", fontFamily: MONO, fontSize: 13, color: INK, outline: "none" }}
            />
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="relative shrink-0">
            <select
              value={cat}
              onChange={(e) => onCat(e.target.value)}
              aria-label="Kategori"
              style={{ height: 44, border: `1px solid ${INK}30`, borderRadius: 6, background: SURFACE, padding: "0 30px 0 12px", fontFamily: MONO, fontSize: 12.5, color: INK, outline: "none", appearance: "none", maxWidth: 150 }}
            >
              {cats.map((c) => (
                <option key={c} value={c}>{c} ({c === "Semua" ? allItems.length : allItems.filter((i) => i.cat === c).length})</option>
              ))}
            </select>
            <span aria-hidden style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: MUTED }}>▾</span>
          </div>
          <button
            onClick={onResetFilter}
            disabled={!dirty}
            aria-label="Atur ulang"
            style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 6, border: `1px solid ${INK}30`, background: SURFACE, color: dirty ? INK : MUTED, opacity: dirty ? 1 : 0.45, cursor: dirty ? "pointer" : "default", fontSize: 16 }}
          >
            ↺
          </button>
        </div>
      </div>

      {/* daftar */}
      <main className="px-4" style={{ paddingBottom: 8 }}>
        {loading ? (
          <div>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ height: 96, borderBottom: `1px solid ${INK}14`, padding: "14px 0" }}>
                <div style={{ height: 15, width: "60%", background: `${INK}12`, borderRadius: 3 }} />
                <div style={{ height: 12, width: "35%", background: `${INK}10`, borderRadius: 3, marginTop: 10 }} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600 }}>
              {q || cat !== "Semua" ? `0 layanan untuk “${q || cat}”` : "Belum ada layanan terdaftar"}
            </div>
            {(q || cat !== "Semua") && (
              <button onClick={onResetFilter} style={{ marginTop: 12, height: 44, padding: "0 22px", border: "none", borderRadius: 6, background: ACCENT, color: ON_ACCENT, fontFamily: MONO, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                reset
              </button>
            )}
          </div>
        ) : (
          items.map((item) => <Row key={item.id} p={item} slug={slug} canAdd={canAdd} closed={closed} onAdd={onAdd} />)
        )}
      </main>

      {/* kontak (setelah katalog) */}
      {bioLinks.length > 0 && (
        <div className="px-4" style={{ marginTop: 16 }}>
          <div className="tnum" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: MUTED, marginBottom: 4 }}>KONTAK</div>
          {bioLinks.map((l) => (
            <button key={l.id} onClick={() => onOpenBioLink(l)} className="flex w-full items-center gap-2.5 text-left" style={{ minHeight: 44, background: "none", border: "none", borderBottom: `1px solid ${INK}12`, padding: "10px 0", cursor: "pointer", color: INK }}>
              <Icon name={iconForLink(l.icon)} size={16} />
              <span className="min-w-0 flex-1">
                <span className="block truncate" style={{ fontSize: 13, fontWeight: 600 }}>{l.label}</span>
                {l.icon === "wa" && <span style={{ fontSize: 10, color: TUTUP }}>tanya dulu — bukan untuk order</span>}
              </span>
              <span aria-hidden style={{ color: MUTED }}>→</span>
            </button>
          ))}
        </div>
      )}

      {/* jam */}
      {showHours && (
        <div className="px-4" style={{ marginTop: 16 }}>
          <button onClick={() => setHoursOpen((o) => !o)} aria-expanded={hoursOpen} className="tnum" style={{ width: "100%", minHeight: 44, background: SURFACE, border: `1px solid ${INK}18`, borderRadius: 6, fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: INK, cursor: "pointer" }}>
            JAM OPERASIONAL {hoursOpen ? "▾" : "▸"}
          </button>
          {hoursOpen && hourRows.length > 0 && (
            <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", background: SURFACE, border: `1px solid ${INK}18`, borderRadius: 6, overflow: "hidden" }}>
              {hourRows.map((h) => (
                <li key={h.day} className="tnum" style={{ display: "grid", gridTemplateColumns: "110px 1fr", fontFamily: MONO, fontSize: 12, padding: "9px 12px", borderBottom: `1px solid ${INK}10`, background: h.text === todayHours ? `${ACCENT}1A` : undefined, fontWeight: h.text === todayHours ? 700 : 400 }}>
                  <span>{h.text === todayHours ? "▸ " : ""}{h.day}</span>
                  <span style={{ color: h.on ? INK : MUTED }}>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <footer className="tnum" style={{ textAlign: "center", marginTop: 24, padding: "18px 16px 40px", fontFamily: MONO, fontSize: 11.5, color: MUTED }}>
        {storeName}{city ? ` · ${city}` : ""} · Bayar via QRIS
        <br />Dibuat dengan TokoLink
      </footer>
    </div>
  );
}
