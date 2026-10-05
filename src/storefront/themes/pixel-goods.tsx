/**
 * Tema 07 — "Pixel Goods" (satu-satunya tema gelap).
 *
 * Diport dari desain_toko_seller (layout "dark"): baris spesifikasi +
 * ringkasan lengket, tab mono bergaris atas, aksen amber. SEMUA dari props.
 *
 * Penyesuaian jujur: tabel spesifikasi = SKU + kategori + stok asli
 * (bukan "format ZIP / lisensi komersial / unduh instan" contoh);
 * ringkasan = jumlah item + tautan keranjang (bukan total & klaim unduh).
 */
import { rupiah, type Product } from "../../lib/data";
import type { ThemeStorefrontProps } from "../types";
import { ThemeBioLinks } from "./shared";

const PAPER = "#0B0E11";
const PANEL = "#141920";
const INK = "#E7EBEF";
const INK_SOFT = "#8A94A0";
const LINE = "#232A33";
const ACCENT = "#E8A33D";
const ACCENT_INK = "#0B0E11";
const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const RADIUS = 8;

function Row({
  p, slug, canAdd, onAdd,
}: {
  p: Product; slug: string; canAdd: boolean; onAdd: (prod: Product) => void;
}) {
  const out = p.stock === 0;
  return (
    <article className="grid items-center gap-4 lg:grid-cols-[216px_minmax(0,1fr)_200px_116px]" style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: RADIUS, padding: 12, boxShadow: "0 6px 18px rgba(0,0,0,.45)" }}>
      <a href={`#/s/${slug}/p/${p.id}`} style={{ display: "block", background: PAPER, borderRadius: 6, overflow: "hidden" }} aria-label={p.name}>
        <img src={p.img} alt="" loading="lazy" style={{ aspectRatio: "16 / 9", width: "100%", objectFit: "cover", display: "block", opacity: out ? 0.55 : 1 }} />
      </a>
      <div style={{ minWidth: 0 }}>
        <div className="tnum" style={{ fontFamily: MONO, fontSize: 10, color: ACCENT, letterSpacing: "0.1em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {(p.sku || p.id.slice(0, 6)).toUpperCase()} · {out ? "HABIS" : "TERSEDIA"}
        </div>
        <a href={`#/s/${slug}/p/${p.id}`} style={{ fontSize: 17, fontWeight: 500, marginTop: 6, display: "block", color: INK, textDecoration: "none" }}>
          {p.name}
        </a>
        <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {p.desc ? p.desc.slice(0, 80) : p.cat}
        </div>
      </div>
      <div className="tnum hidden lg:block" style={{ fontFamily: MONO, fontSize: 10.5, color: INK_SOFT, lineHeight: 1.9 }}>
        <div className="flex justify-between gap-2"><span>SKU</span><span style={{ color: INK }}>{(p.sku || "—").toUpperCase().slice(0, 14)}</span></div>
        <div className="flex justify-between gap-2"><span>KATEGORI</span><span style={{ color: INK }}>{p.cat.slice(0, 14)}</span></div>
        <div className="flex justify-between gap-2"><span>STOK</span><span style={{ color: out ? "#E06C5B" : "#5FCB8E" }}>{out ? "Habis" : p.stock}</span></div>
      </div>
      <div className="lg:text-right">
        <div className="tnum" style={{ fontFamily: MONO, fontSize: 19, fontWeight: 600, color: ACCENT }}>
          {rupiah(p.price)}
        </div>
        {canAdd && !out && (
          <button onClick={() => onAdd(p)} aria-label={`Beli ${p.name}`} style={{ marginTop: 9, width: "100%", background: ACCENT, color: ACCENT_INK, border: "none", padding: "10px 0", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer" }}>
            + Keranjang
          </button>
        )}
      </div>
    </article>
  );
}

export function PixelGoods(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, waNumber, avatarUrl, closed,
    items, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink,
    showHours, showCart, cartCount, onAdd, onChatWA, onShare, shared,
    openNow, todayHours,
  } = p;
  const canAdd = showCart && !closed;

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.5, minHeight: "100vh" }}>
      {/* header */}
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 pb-4 pt-6 lg:px-9 lg:pt-7" style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="flex min-w-0 items-center gap-4">
          <span aria-hidden style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: ACCENT, color: ACCENT_INK, fontWeight: 600, fontSize: 17, borderRadius: RADIUS, flexShrink: 0, overflow: "hidden" }}>
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (storeName || "T").slice(0, 1).toUpperCase()}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1.05, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {storeName}
            </div>
            <div className="tnum" style={{ fontFamily: MONO, fontSize: 10.5, color: INK_SOFT, marginTop: 6, letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              tokolink.store/s/{slug}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {showHours && (
            <span className="flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 10.5, color: INK_SOFT, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: 99, background: openNow === false ? "#E06C5B" : "#5FCB8E", display: "inline-block" }} />
              {openNow === false ? "Tutup" : todayHours || "Buka"}
            </span>
          )}
          <button onClick={onChatWA} style={{ background: ACCENT, color: ACCENT_INK, border: "none", padding: "12px 18px", fontSize: 12, fontWeight: 600, borderRadius: RADIUS, cursor: "pointer" }}>
            WhatsApp
          </button>
          <button onClick={onShare} style={{ border: `1px solid ${LINE}`, background: "transparent", color: INK, padding: "11px 16px", fontSize: 12, fontWeight: 600, borderRadius: RADIUS, cursor: "pointer" }}>
            {shared ? "Tersalin" : "Bagikan"}
          </button>
        </div>
      </header>

      {/* tab mono */}
      <nav className="flex gap-6 overflow-x-auto px-5 lg:px-9" style={{ borderBottom: `1px solid ${LINE}` }}>
        {cats.map((c) => {
          const active = cat === c;
          return (
            <button
              key={c}
              onClick={() => onCat(c)}
              style={{ background: "none", border: "none", padding: "14px 0 12px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: active ? ACCENT : INK_SOFT, borderTop: `2px solid ${active ? ACCENT : "transparent"}`, marginTop: -1, whiteSpace: "nowrap", cursor: "pointer" }}
            >
              {c}
            </button>
          );
        })}
        <span className="tnum hidden sm:block" style={{ fontFamily: MONO, marginLeft: "auto", alignSelf: "center", fontSize: 10.5, color: INK_SOFT, whiteSpace: "nowrap" }}>
          {items.length} produk
        </span>
      </nav>

      <div className="px-5 py-4 lg:px-9 lg:py-6">
        <div className="mb-4 flex">
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Cari…"
            aria-label="Cari produk"
            style={{ flex: 1, minWidth: 0, background: PANEL, border: `1px solid ${LINE}`, borderRadius: RADIUS, padding: "11px 14px", fontSize: 13, fontFamily: MONO, color: INK, outline: "none" }}
          />
        </div>
        {bio && <p style={{ fontSize: 13.5, color: INK_SOFT, marginBottom: 16, lineHeight: 1.65, maxWidth: 720 }}>{bio}</p>}
        <ThemeBioLinks links={bioLinks} onOpen={onOpenBioLink} />

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_296px]">
          <div className="grid min-w-0 gap-3">
            {loading ? (
              [0, 1].map((i) => (
                <div key={i} style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: RADIUS, padding: 12, display: "grid", gap: 10 }}>
                  <div style={{ aspectRatio: "16 / 9", background: PAPER, borderRadius: 6 }} />
                  <div style={{ height: 16, width: "55%", background: PAPER, borderRadius: 4 }} />
                </div>
              ))
            ) : items.length === 0 ? (
              <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: RADIUS, padding: "44px 20px", textAlign: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 19 }}>Tidak ada yang cocok</div>
                <p style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, marginTop: 8 }}>
                  {q ? `Tidak ada yang cocok dengan “${q}”.` : "Belum ada produk di kategori ini."}
                </p>
                <button onClick={onResetFilter} style={{ marginTop: 16, background: ACCENT, color: ACCENT_INK, border: "none", padding: "11px 22px", fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer" }}>
                  Tampilkan semua
                </button>
              </div>
            ) : (
              items.map((item) => <Row key={item.id} p={item} slug={slug} canAdd={canAdd} onAdd={onAdd} />)
            )}
          </div>

          {/* ringkasan */}
          {showCart && (
            <aside style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: RADIUS, padding: 20, boxShadow: "0 6px 18px rgba(0,0,0,.45)" }} className="lg:sticky lg:top-6">
              <div className="tnum" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: INK_SOFT }}>Ringkasan</div>
              <div className="tnum" style={{ fontFamily: MONO, borderTop: `1px solid ${LINE}`, marginTop: 12, paddingTop: 12, fontSize: 26, fontWeight: 600 }}>
                {cartCount} <span style={{ fontSize: 12, color: INK_SOFT }}>item</span>
              </div>
              <a href="#/cart" style={{ display: "block", textAlign: "center", marginTop: 14, background: ACCENT, color: ACCENT_INK, padding: "13px 0", fontSize: 12.5, fontWeight: 600, borderRadius: 6, textDecoration: "none" }}>
                Lanjut ke keranjang
              </a>
              <div className="tnum" style={{ fontFamily: MONO, fontSize: 10.5, color: INK_SOFT, marginTop: 12, lineHeight: 1.7 }}>
                Bayar via QRIS{waNumber && <><br />{waNumber}</>}{city && <><br />{city}</>}
              </div>
            </aside>
          )}
        </div>
      </div>

      <footer className="tnum flex flex-wrap items-center justify-between gap-2 px-5 py-4 lg:px-9" style={{ borderTop: `1px solid ${LINE}`, fontFamily: MONO, fontSize: 10.5, color: INK_SOFT, letterSpacing: "0.06em" }}>
        <span>Bayar via QRIS</span>
        <span>{city || `tokolink.store/s/${slug}`}</span>
      </footer>
    </div>
  );
}
