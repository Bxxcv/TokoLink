/**
 * Tema 08 — "Studio Tenang" (satu kolom lapang).
 *
 * Diport dari desain_toko_seller (layout "calm"): kolom sempit terpusat
 * (measure 640px), jarak luang besar, CTA tautan bergaris bawah.
 * SEMUA data dari props.
 *
 * Penyesuaian jujur: headline = bio asli seller (fallback: nama toko —
 * bukan headline konsultan contoh); blok "cara kerja" = jam operasional
 * asli; slot janji temu = jam operasional asli; kutipan klien contoh
 * dibuang; foto suasana = sampul asli (bila ada).
 */
import { rupiah } from "../../lib/data";
import type { ThemeStorefrontProps } from "../types";

const PAPER = "#F6F5F1";
const PANEL = "#FFFFFF";
const INK = "#1B1C18";
const INK_SOFT = "#6F7269";
const LINE = "#E2E1D8";
const ACCENT = "#3F5D4E";
const ACCENT_INK = "#F6F5F1";
const DISPLAY = "'Newsreader', Georgia, serif";
const BODY = "'Archivo', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

export function StudioTenang(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, waNumber, coverUrl,
    items, cats, cat, onCat, q, onQ, onResetFilter, loading,
    showHours, showCart, cartCount, onAdd, onChatWA, onShare, shared,
    openNow, todayHours, hourRows,
  } = p;
  const canAdd = showCart;

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, minHeight: "100vh" }}>
      {/* kepala */}
      <header style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 0" }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: ACCENT }}>
            {storeName}
          </span>
          {showHours && (
            <span className="flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 10.5, color: INK_SOFT, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: 99, background: openNow === false ? "#B23A22" : ACCENT, display: "inline-block" }} />
              {openNow === false ? "Tutup" : todayHours || "Buka"}
            </span>
          )}
        </div>
        <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.1rem, 7vw, 3.4rem)", fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.1, margin: "26px 0 0", overflowWrap: "break-word" }}>
          {bio || storeName}
        </h1>
        <p className="tnum" style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, marginTop: 18 }}>
          tokolink.store/s/{slug}{city ? ` · ${city}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3" style={{ marginTop: 26 }}>
          <button onClick={onChatWA} style={{ background: ACCENT, color: ACCENT_INK, border: "none", padding: "15px 28px", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
            Chat WhatsApp
          </button>
          <button onClick={onShare} style={{ background: "none", border: "none", padding: "15px 4px", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: INK, borderBottom: `1px solid ${INK}`, cursor: "pointer" }}>
            {shared ? "Tautan tersalin" : "Bagikan tautan"}
          </button>
        </div>
        {showCart && (
          <a href="#/cart" className="tnum" style={{ display: "inline-block", marginTop: 16, fontFamily: MONO, fontSize: 12.5, fontWeight: 600, color: ACCENT }}>
            Keranjang ({cartCount}) →
          </a>
        )}
      </header>

      {/* sampul */}
      {coverUrl && (
        <div style={{ maxWidth: 720, margin: "40px auto 0", padding: "0 24px" }}>
          <img src={coverUrl} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", display: "block" }} />
        </div>
      )}

      {/* jam operasional sebagai daftar bernomor */}
      {showHours && hourRows.length > 0 && (
        <div style={{ maxWidth: 720, margin: "40px auto 0", padding: "0 24px" }}>
          <div className="grid sm:grid-cols-3" style={{ borderTop: `1px solid ${LINE}` }}>
            {hourRows.slice(0, 3).map((h, i) => (
              <div key={h.day} style={{ padding: "22px 20px 22px 0", borderRight: i < 2 ? `1px solid ${LINE}` : "none" }}>
                <span className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: ACCENT }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ fontFamily: DISPLAY, fontSize: 24, marginTop: 10 }}>{h.day}</div>
                <p className="tnum" style={{ fontFamily: MONO, fontSize: 13, color: INK_SOFT, marginTop: 8 }}>{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* penawaran */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 0" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: INK_SOFT }}>
            Penawaran ({items.length})
          </span>
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Cari…"
            aria-label="Cari penawaran"
            style={{ background: "transparent", border: "none", borderBottom: `1px solid ${LINE}`, fontSize: 14, fontFamily: BODY, color: INK, outline: "none", padding: "6px 2px", width: 160, maxWidth: "100%" }}
          />
        </div>
        <nav className="flex gap-5 overflow-x-auto" style={{ marginTop: 4 }}>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => onCat(c)}
              style={{ background: "none", border: "none", padding: "10px 0", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: cat === c ? ACCENT : INK_SOFT, borderBottom: `1px solid ${cat === c ? ACCENT : "transparent"}`, whiteSpace: "nowrap", cursor: "pointer" }}
            >
              {c}
            </button>
          ))}
        </nav>

        {loading ? (
          <div style={{ display: "grid", gap: 0 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ borderTop: `1px solid ${LINE}`, padding: "26px 8px", display: "grid", gap: 10 }}>
                <div style={{ height: 24, width: "60%", background: LINE }} />
                <div style={{ height: 14, width: "40%", background: LINE }} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 12px", borderTop: `1px solid ${LINE}` }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 28 }}>Tidak ada yang cocok</div>
            <p style={{ fontSize: 15, color: INK_SOFT, marginTop: 10 }}>
              {q ? `Tidak ada yang cocok dengan “${q}”.` : "Belum ada penawaran di kategori ini."}
            </p>
            <button onClick={onResetFilter} style={{ marginTop: 18, background: "none", border: "none", padding: "10px 0", fontSize: 14, color: INK, borderBottom: `1px solid ${INK}`, cursor: "pointer" }}>
              Tampilkan semua →
            </button>
          </div>
        ) : (
          items.map((item) => {
            const out = item.stock === 0;
            return (
              <div key={item.id} style={{ borderTop: `1px solid ${LINE}`, padding: "26px 8px" }}>
                <div className="flex items-baseline justify-between gap-6">
                  <a href={`#/s/${slug}/p/${item.id}`} style={{ fontFamily: DISPLAY, fontSize: 25, fontWeight: 400, lineHeight: 1.25, color: INK, textDecoration: "none" }}>
                    {item.name}
                  </a>
                  <span className="tnum" style={{ fontSize: 17, fontWeight: 600, color: ACCENT, whiteSpace: "nowrap" }}>
                    {rupiah(item.price)}
                  </span>
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: INK_SOFT, marginTop: 8, maxWidth: 560 }}>
                  {item.desc ? item.desc.slice(0, 140) : `${item.cat}${item.unit ? ` · ${item.unit}` : ""}`}{out ? " · Stok habis" : ""}
                </p>
                {canAdd && !out && (
                  <button onClick={() => onAdd(item)} aria-label={`Pilih ${item.name}`} style={{ background: "none", border: "none", padding: "10px 0 0", fontSize: 14, color: INK, borderBottom: `1px solid ${INK}`, cursor: "pointer" }}>
                    Pilih →
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* info + WA */}
      <div style={{ maxWidth: 720, margin: "34px auto 0", padding: "0 24px 64px" }}>
        <div style={{ background: PANEL, border: `1px solid ${LINE}`, padding: "26px 28px", boxShadow: "0 12px 30px rgba(27,28,24,.06)" }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: INK_SOFT }}>Hubungi</span>
          <div className="tnum" style={{ fontFamily: MONO, fontSize: 14, marginTop: 12, lineHeight: 1.8 }}>
            {waNumber || "WhatsApp belum diatur"}
            <br />
            <span style={{ fontSize: 12, color: INK_SOFT }}>Bayar via QRIS{showCart && <> · Keranjang <span>{cartCount}</span> item</>}</span>
          </div>
          <div className="flex flex-wrap gap-3" style={{ marginTop: 16 }}>
            <button onClick={onChatWA} style={{ background: ACCENT, color: ACCENT_INK, border: "none", padding: "13px 24px", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
              Chat WhatsApp
            </button>
            {showCart && (
              <a href="#/cart" style={{ padding: "13px 4px", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: INK, borderBottom: `1px solid ${INK}`, textDecoration: "none" }}>
                Keranjang →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
