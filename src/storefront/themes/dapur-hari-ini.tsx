/**
 * Tema 05 — "Dapur Hari Ini" (papan menu cepat).
 *
 * Diport dari desain_toko_seller (layout "menu"): judul papan besar,
 * baris menu bertitik penuntun, cap HABIS miring, bilah bawah menempel.
 * SEMUA data dari props.
 *
 * Penyesuaian jujur: tanggal papan = tanggal hari ini (WIB, dihitung —
 * bukan contoh); HABIS = stok 0 asli; bilah bawah mengarah ke /cart
 * (bukan "Pesan ke WhatsApp") supaya alur order tidak berubah.
 */
import { rupiah, type Product } from "../../lib/data";
import type { ThemeStorefrontProps } from "../types";

const PAPER = "#FFF8EC";
const PANEL = "#FFFFFF";
const INK = "#1E1A12";
const INK_SOFT = "#6E6455";
const LINE = "#E9DDC6";
const ACCENT = "#D2452C";
const ACCENT_INK = "#FFF8EC";
const OK = "#2F6B4F";
const DISPLAY = "'Bricolage Grotesque', system-ui, sans-serif";
const BODY = "'IBM Plex Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

function todayWIB(): string {
  try {
    return new Date().toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long",
    });
  } catch {
    return "";
  }
}

function MenuRow({
  p, slug, canAdd, onAdd,
}: {
  p: Product; slug: string; canAdd: boolean; onAdd: (prod: Product) => void;
}) {
  const sold = p.stock === 0;
  return (
    <div className="flex items-end gap-3" style={{ padding: "16px 4px", borderBottom: `1px solid ${LINE}`, opacity: sold ? 0.55 : 1 }}>
      <img src={p.img} alt="" loading="lazy" style={{ width: 58, height: 58, flexShrink: 0, borderRadius: 4, objectFit: "cover", background: PANEL }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <a href={`#/s/${slug}/p/${p.id}`} style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em", display: "block", lineHeight: 1.2, color: INK, textDecoration: "none" }}>
          {p.name}
        </a>
        <span style={{ fontSize: 12.5, color: INK_SOFT, display: "block", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {p.desc ? p.desc.slice(0, 70) : `${p.cat}${p.unit ? ` · ${p.unit}` : ""}`}
        </span>
      </span>
      <span aria-hidden style={{ borderBottom: `2px dotted ${LINE}`, flex: "0 0 22px", marginBottom: 8 }} />
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="tnum" style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: ACCENT }}>
          {rupiah(p.price)}
        </span>
        {canAdd && !sold && (
          <button
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name} ke keranjang`}
            style={{ background: ACCENT, color: ACCENT_INK, border: "none", padding: "7px 14px", fontSize: 11, fontWeight: 700, borderRadius: 4, cursor: "pointer" }}
          >
            Tambah
          </button>
        )}
      </span>
      {sold && (
        <span aria-hidden style={{ position: "relative", width: 0, flexShrink: 0 }}>
          <span style={{ position: "absolute", right: -4, top: -32, whiteSpace: "nowrap", border: `2px solid ${ACCENT}`, color: ACCENT, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", padding: "2px 6px", transform: "rotate(-7deg)", background: PAPER }}>
            HABIS
          </span>
        </span>
      )}
    </div>
  );
}

export function DapurHariIni(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, waNumber,
    items, cats, cat, onCat, q, onQ, onResetFilter, loading,
    showHours, showCart, cartCount, onAdd, onChatWA, onShare, shared,
    openNow, todayHours,
  } = p;
  const canAdd = showCart;

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: BODY, fontSize: 15, lineHeight: 1.5, minHeight: "100vh", paddingBottom: showCart && cartCount > 0 ? 76 : 0 }}>
      {/* kepala papan */}
      <header className="px-5 pb-5 pt-7 lg:px-10 lg:pt-9">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4" style={{ borderBottom: `3px solid ${INK}`, paddingBottom: 18 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(2.2rem, 7vw, 3.75rem)", letterSpacing: "-0.03em", lineHeight: 0.95, margin: 0, overflowWrap: "break-word" }}>
              {storeName}
            </h1>
            <div className="tnum" style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, marginTop: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {todayWIB()}{city ? ` · ${city}` : ""}
            </div>
            {bio && <p style={{ fontSize: 14, color: INK_SOFT, marginTop: 8, lineHeight: 1.6, maxWidth: 560 }}>{bio}</p>}
          </div>
          <div className="lg:text-right">
            {showHours && (
              <span className="flex items-center gap-2 lg:justify-end" style={{ fontFamily: MONO, fontSize: 12, color: openNow === false ? ACCENT : OK, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <span aria-hidden style={{ width: 7, height: 7, borderRadius: 99, background: openNow === false ? ACCENT : OK, display: "inline-block" }} />
                {openNow === false ? "Tutup · " : ""}{todayHours || "Buka"}
              </span>
            )}
            <div className="flex flex-wrap gap-2 lg:justify-end" style={{ marginTop: 12 }}>
              <button onClick={onChatWA} style={{ background: ACCENT, color: ACCENT_INK, border: "none", padding: "12px 18px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                WhatsApp
              </button>
              <button onClick={onShare} style={{ border: `2px solid ${LINE}`, background: "transparent", color: INK, padding: "10px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {shared ? "Tersalin" : "Bagikan"}
              </button>
            </div>
          </div>
        </div>
        <nav className="flex gap-2.5 overflow-x-auto" style={{ marginTop: 16 }}>
          {cats.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => onCat(c)}
                style={{ background: active ? ACCENT : "transparent", color: active ? ACCENT_INK : INK, border: `2px solid ${active ? ACCENT : LINE}`, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap", cursor: "pointer" }}
              >
                {c}
              </button>
            );
          })}
        </nav>
        <div className="mt-3 flex">
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Cari hidangan…"
            aria-label="Cari hidangan"
            style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", borderBottom: `1px solid ${LINE}`, fontSize: 14, fontFamily: BODY, color: INK, outline: "none", padding: "8px 2px" }}
          />
        </div>
      </header>

      {/* daftar menu */}
      <div className="px-5 lg:px-10" style={{ paddingBottom: 12 }}>
        {loading ? (
          <div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3" style={{ padding: "16px 4px", borderBottom: `1px solid ${LINE}` }}>
                <div style={{ width: 58, height: 58, background: PANEL, borderRadius: 4 }} />
                <div style={{ flex: 1, display: "grid", gap: 8 }}>
                  <div style={{ height: 18, width: "55%", background: PANEL }} />
                  <div style={{ height: 12, width: "35%", background: PANEL }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 12px", borderBottom: `1px solid ${LINE}` }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 26 }}>Hari ini habis</div>
            <p style={{ fontSize: 14, color: INK_SOFT, marginTop: 8 }}>
              {q ? `Tidak ada yang cocok dengan “${q}”.` : "Belum ada menu di kategori ini."}
            </p>
            <button onClick={onResetFilter} style={{ marginTop: 16, background: ACCENT, color: ACCENT_INK, border: "none", padding: "12px 22px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Lihat semua menu
            </button>
          </div>
        ) : (
          items.map((item) => (
            <MenuRow key={item.id} p={item} slug={slug} canAdd={canAdd} onAdd={onAdd} />
          ))
        )}
      </div>

      {/* info */}
      <div className="grid grid-cols-1 gap-5 px-5 py-4 sm:grid-cols-3 lg:px-10" style={{ background: PANEL, borderTop: `1px solid ${LINE}` }}>
        {[
          ["Lokasi", city || "—"],
          ["Pembayaran", "QRIS"],
          ["WhatsApp", waNumber || "—"],
        ].map(([k, v]) => (
          <div key={k}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: INK_SOFT }}>{k}</span>
            <div className="tnum" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* bilah pesan menempel — ke keranjang */}
      {showCart && cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30">
          <div className="flex items-center justify-between gap-3 px-5 py-4 lg:px-10" style={{ background: INK, color: PAPER, paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
            <span className="tnum" style={{ fontFamily: MONO, fontSize: 13 }}>{cartCount} item dipilih</span>
            <a href="#/cart" style={{ background: ACCENT, color: ACCENT_INK, padding: "14px 26px", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
              Lihat keranjang
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
