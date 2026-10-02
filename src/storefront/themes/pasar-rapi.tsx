/**
 * Tema 02 — "Pasar Rapi" (katalog padat).
 *
 * Diport dari desain_toko_seller (layout "dense"): grid 4 kolom rapat
 * (2 kolom di HP), foto 1:1, harga besar mono, chip kategori + cari,
 * strip info, stiker stok bersudut. SEMUA data dari props (Supabase) —
 * tidak ada teks/harga/stok contoh di file ini.
 *
 * Badge yang dipakai hanya status stok asli (Habis / Sisa N) —
 * stiker promo contoh dari showcase ("-12%", "Terlaris") DIBUANG karena
 * tidak ada datanya. Strip aksen tampil hanya bila seller isi bio.
 */
import { rupiah, type Product } from "../../lib/data";
import type { ThemeStorefrontProps } from "../types";

const PAPER = "#F5F9F8";
const PANEL = "#FFFFFF";
const INK = "#0F1F1D";
const INK_SOFT = "#5B6E6B";
const LINE = "#D9E6E3";
const ACCENT = "#0E7C6E";
const ACCENT_INK = "#FFFFFF";
const WARN = "#E4572E";
const FONT = "'Archivo', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const RADIUS = 6;

function initials(name: string): string {
  return name
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function DenseCard({
  p,
  slug,
  canAdd,
  onAdd,
}: {
  p: Product;
  slug: string;
  canAdd: boolean;
  onAdd: (p: Product) => void;
}) {
  const out = p.stock === 0;
  return (
    <article
      style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: RADIUS, overflow: "hidden", boxShadow: "0 1px 0 rgba(15,31,29,.06)" }}
    >
      <div style={{ position: "relative" }}>
        <a href={`#/s/${slug}/p/${p.id}`} style={{ display: "block", background: PAPER }} aria-label={p.name}>
          <img
            src={p.img}
            alt=""
            loading="lazy"
            style={{ aspectRatio: "1 / 1", width: "100%", objectFit: "cover", display: "block", opacity: out ? 0.55 : 1 }}
          />
        </a>
        {out ? (
          <span style={{ position: "absolute", top: 8, left: 8, background: INK, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", padding: "3px 7px", borderRadius: 3 }}>
            Habis
          </span>
        ) : (
          p.stock <= 15 && (
            <span style={{ position: "absolute", top: 8, left: 8, background: WARN, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", padding: "3px 7px", borderRadius: 3 }}>
              Sisa {p.stock}
            </span>
          )
        )}
      </div>
      <div style={{ padding: "11px 12px 13px" }}>
        <a
          href={`#/s/${slug}/p/${p.id}`}
          style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em", color: INK, textDecoration: "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 36 }}
        >
          {p.name}
        </a>
        <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {p.cat}{p.unit ? ` · ${p.unit}` : ""}
        </div>
        <div className="flex items-end justify-between" style={{ marginTop: 10 }}>
          <span className="tnum" style={{ fontFamily: MONO, fontSize: 19, fontWeight: 600, color: ACCENT, letterSpacing: "-0.02em" }}>
            {rupiah(p.price)}
          </span>
          {canAdd && !out && (
            <button
              onClick={() => onAdd(p)}
              aria-label={`Tambah ${p.name} ke keranjang`}
              style={{ width: 30, height: 30, borderRadius: RADIUS, border: `1px solid ${LINE}`, background: INK, color: PAPER, fontSize: 17, lineHeight: 1, cursor: "pointer" }}
            >
              +
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function PasarRapi(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, waNumber, avatarUrl, closed,
    items, cats, cat, onCat, q, onQ, onResetFilter, loading,
    showHours, showQR, showCart, cartCount, onAdd, onChatWA,
    qrData, onOpenQR, onShare, shared, openNow, todayHours,
  } = p;
  const canAdd = showCart && !closed;

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: FONT, fontSize: 14, lineHeight: 1.5, minHeight: "100vh" }}>
      {/* header */}
      <header className="px-4 pb-3 pt-4 sm:px-6 sm:pt-5" style={{ background: PANEL, borderBottom: `1px solid ${LINE}` }}>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              style={{ width: 42, height: 42, display: "grid", placeItems: "center", background: ACCENT, color: ACCENT_INK, fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em", borderRadius: RADIUS, flexShrink: 0, overflow: "hidden" }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                initials(storeName || "T")
              )}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", lineHeight: 1.05, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {storeName}
              </div>
              <div className="tnum" style={{ fontFamily: MONO, fontSize: 10.5, color: INK_SOFT, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                tokolink.store/s/{slug}{city ? ` · ${city}` : ""}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {showHours && (
              <span className="flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: INK_SOFT }}>
                <span aria-hidden style={{ width: 7, height: 7, borderRadius: 99, background: openNow === false ? WARN : ACCENT, display: "inline-block" }} />
                {openNow === false ? "Tutup" : `Buka${todayHours ? ` · ${todayHours}` : ""}`}
              </span>
            )}
            <button
              onClick={onChatWA}
              style={{ background: ACCENT, color: ACCENT_INK, border: "none", padding: "11px 15px", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", borderRadius: RADIUS, cursor: "pointer" }}
            >
              WhatsApp
            </button>
            {showCart && (
              <a
                href="#/cart"
                style={{ border: `1px solid ${LINE}`, color: INK, padding: "10px 15px", fontSize: 12, fontWeight: 700, borderRadius: RADIUS, textDecoration: "none" }}
              >
                Keranjang (<span className="tnum">{cartCount}</span>)
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center" style={{ marginTop: 14 }}>
          <div className="relative min-w-0 flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: INK_SOFT }}>
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Cari barang…"
              aria-label="Cari barang"
              style={{ width: "100%", border: `1px solid ${LINE}`, borderRadius: RADIUS, padding: "10px 12px 10px 34px", fontSize: 13, fontFamily: FONT, color: INK, background: PAPER, outline: "none" }}
            />
          </div>
          <button
            onClick={onShare}
            style={{ border: `1px solid ${LINE}`, borderRadius: RADIUS, padding: "10px 14px", fontSize: 12, fontWeight: 700, background: "transparent", color: INK, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            {shared ? "Tersalin!" : "Bagikan"}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto" style={{ marginTop: 12, paddingBottom: 2 }}>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => onCat(c)}
              style={{ fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: RADIUS, border: `1px solid ${LINE}`, background: cat === c ? ACCENT : "transparent", color: cat === c ? ACCENT_INK : INK, whiteSpace: "nowrap", cursor: "pointer" }}
            >
              {c}
            </button>
          ))}
          <span className="tnum" style={{ fontFamily: MONO, marginLeft: "auto", fontSize: 11, color: INK_SOFT, alignSelf: "center", whiteSpace: "nowrap", paddingLeft: 8 }}>
            {items.length} barang
          </span>
        </div>
      </header>

      {/* strip info — hanya bila seller isi bio (bukan teks contoh) */}
      {bio && (
        <div className="px-4 py-3 sm:px-6" style={{ background: ACCENT, color: ACCENT_INK }}>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>{bio}</div>
        </div>
      )}

      {/* grid */}
      <div className="px-4 pb-6 pt-4 sm:px-6 sm:pt-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: RADIUS, overflow: "hidden" }}>
                <div style={{ aspectRatio: "1 / 1", background: PAPER }} />
                <div style={{ padding: 12, display: "grid", gap: 8 }}>
                  <div style={{ height: 15, width: "70%", background: PAPER }} />
                  <div style={{ height: 18, width: "50%", background: PAPER }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ background: PANEL, border: `1px dashed ${LINE}`, borderRadius: RADIUS, padding: "44px 20px", textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em" }}>Barang tidak ketemu</div>
            <p style={{ fontSize: 13, color: INK_SOFT, marginTop: 8 }}>
              {q ? `Tidak ada yang cocok dengan “${q}”. Coba kata lain.` : "Belum ada barang di kategori ini."}
            </p>
            <button
              onClick={onResetFilter}
              style={{ marginTop: 16, background: ACCENT, color: ACCENT_INK, border: "none", padding: "11px 20px", fontSize: 12, fontWeight: 700, borderRadius: RADIUS, cursor: "pointer" }}
            >
              Tampilkan semua
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <DenseCard key={item.id} p={item} slug={slug} canAdd={canAdd} onAdd={onAdd} />
            ))}
          </div>
        )}
      </div>

      {/* footer info */}
      <footer className="grid grid-cols-2 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-4" style={{ background: PANEL, borderTop: `1px solid ${LINE}` }}>
        {showHours && (
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: INK_SOFT, display: "block" }}>Jam buka</span>
            <div className="tnum" style={{ fontFamily: MONO, fontSize: 12, marginTop: 7, lineHeight: 1.6 }}>
              {todayHours ? `${openNow === false ? "Tutup · " : ""}${todayHours}` : "Lihat jam di atas"}
            </div>
          </div>
        )}
        <div>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: INK_SOFT, display: "block" }}>Pembayaran</span>
          <div className="tnum" style={{ fontFamily: MONO, fontSize: 12, marginTop: 7, lineHeight: 1.6 }}>QRIS</div>
        </div>
        <div>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: INK_SOFT, display: "block" }}>WhatsApp</span>
          <div className="tnum" style={{ fontFamily: MONO, fontSize: 12, marginTop: 7, lineHeight: 1.6 }}>{waNumber || "—"}</div>
        </div>
        {showQR && (
          <div className="flex items-start gap-3">
            {qrData ? (
              <img src={qrData} alt={`QR ${storeName}`} width={46} height={46} style={{ width: 46, height: 46 }} />
            ) : (
              <span style={{ width: 46, height: 46, background: ACCENT, display: "inline-block", borderRadius: 4 }} aria-hidden />
            )}
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: INK_SOFT, display: "block" }}>Pindai & bayar</span>
              <button onClick={onOpenQR} style={{ background: "none", border: "none", padding: 0, fontFamily: MONO, fontSize: 12, marginTop: 7, color: ACCENT, fontWeight: 700, cursor: "pointer" }}>
                QRIS aktif →
              </button>
            </div>
          </div>
        )}
      </footer>

      {/* bilah keranjang mobile — SELALU ke /cart */}
      {showCart && cartCount > 0 && (
        <div className="fixed inset-x-0 z-30 px-4 lg:hidden" style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}>
          <a
            href="#/cart"
            className="tnum mx-auto flex w-full max-w-[420px] items-center justify-center gap-2 px-4 py-3.5 text-[13.5px] font-bold"
            style={{ fontFamily: MONO, background: INK, color: PAPER, borderRadius: RADIUS, textDecoration: "none" }}
          >
            {cartCount} barang · Lihat keranjang
          </a>
        </div>
      )}
    </div>
  );
}
