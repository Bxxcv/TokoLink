/**
 * Tema 04 — "Atelier" (galeri busana).
 *
 * Diport dari desain_toko_seller (layout "gallery"): foto vertikal 4:5,
 * keterangan di bawah foto (bukan overlay), kolom kanan turun di desktop,
 * label kapital berjarak lebar. SEMUA data dari props.
 *
 * Penyesuaian jujur: label koleksi = kategori asli toko; panel "janji
 * temu" = jam operasional asli; tidak ada pilihan ukuran contoh (tidak
 * ada datanya); kutipan contoh dibuang.
 */
import { rupiah, type Product } from "../../lib/data";
import type { ThemeStorefrontProps } from "../types";

const PAPER = "#F3EEE8";
const PANEL = "#E9E1D7";
const INK = "#171310";
const INK_SOFT = "#7C7168";
const LINE = "#DBD2C7";
const ACCENT = "#7B2E2E";
const DISPLAY = "'Instrument Serif', Georgia, serif";
const BODY = "'Archivo', system-ui, sans-serif";

function Figure({
  p, slug, canAdd, onAdd,
}: {
  p: Product; slug: string; canAdd: boolean; onAdd: (p: Product) => void;
}) {
  const out = p.stock === 0;
  return (
    <figure style={{ minWidth: 0 }}>
      <a href={`#/s/${slug}/p/${p.id}`} style={{ display: "block", background: PANEL }} aria-label={p.name}>
        <img
          src={p.img}
          alt=""
          loading="lazy"
          style={{ aspectRatio: "4 / 5", width: "100%", objectFit: "cover", display: "block", opacity: out ? 0.6 : 1 }}
        />
      </a>
      <figcaption style={{ borderTop: `1px solid ${LINE}`, marginTop: 14, paddingTop: 12 }}>
        <div className="flex items-baseline justify-between gap-4">
          <a href={`#/s/${slug}/p/${p.id}`} style={{ fontFamily: BODY, fontSize: 16, fontWeight: 500, color: INK, textDecoration: "none" }}>
            {p.name}
          </a>
          <span className="tnum" style={{ fontSize: 15, fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>
            {rupiah(p.price)}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1" style={{ marginTop: 7 }}>
          <span style={{ fontSize: 9.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.22em", color: INK_SOFT }}>
            {p.cat}{p.unit ? ` · ${p.unit}` : ""}{out ? " · Habis" : ""}
          </span>
          {canAdd && !out && (
            <button
              onClick={() => onAdd(p)}
              aria-label={`Tambah ${p.name} ke keranjang`}
              style={{ background: "none", border: "none", padding: 0, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: ACCENT, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Tambah
            </button>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export function Atelier(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio,
    items, cats, cat, onCat, q, onQ, onResetFilter, loading,
    showHours, showCart, cartCount, onAdd, onChatWA, onShare, shared,
    openNow, todayHours, hourRows,
  } = p;
  const canAdd = showCart;
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: BODY, fontSize: 15, lineHeight: 1.5, minHeight: "100vh" }}>
      {/* header */}
      <header className="px-5 pb-5 pt-8 lg:px-14 lg:pt-11">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.22em", color: ACCENT }}>
              TokoLink · Katalog
            </span>
            <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.6rem, 8vw, 4.5rem)", fontWeight: 400, letterSpacing: "0.005em", lineHeight: 0.98, margin: "14px 0 0", overflowWrap: "break-word" }}>
              {storeName}
            </h1>
          </div>
          <div className="lg:text-right">
            <div className="tnum" style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.7 }}>
              {city}{city && (showHours ? <br /> : null)}
              {showHours && (openNow === false ? "Tutup hari ini" : todayHours || "Buka")}
            </div>
            <div className="flex flex-wrap gap-2.5 lg:justify-end" style={{ marginTop: 12 }}>
              <button onClick={onChatWA} style={{ border: `1px solid ${INK}`, background: "transparent", color: INK, padding: "11px 18px", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer" }}>
                WhatsApp
              </button>
              <button onClick={onShare} style={{ border: `1px solid ${LINE}`, background: "transparent", color: INK, padding: "11px 18px", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer" }}>
                {shared ? "Tersalin" : "Bagikan"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3" style={{ borderTop: `1px solid ${LINE}`, marginTop: 26, paddingTop: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.22em", color: INK_SOFT }}>
            {cats.filter((c) => c !== "Semua").slice(0, 3).join(" · ") || "Katalog"}{" · "}{items.length} produk
          </span>
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Cari…"
            aria-label="Cari produk"
            style={{ background: "transparent", border: "none", borderBottom: `1px solid ${LINE}`, fontSize: 13, fontFamily: BODY, color: INK, outline: "none", padding: "6px 2px", width: 150, maxWidth: "100%" }}
          />
        </div>
        <nav className="flex gap-5 overflow-x-auto" style={{ marginTop: 6 }}>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => onCat(c)}
              style={{ background: "none", border: "none", padding: "10px 0", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: cat === c ? ACCENT : INK_SOFT, borderBottom: `1px solid ${cat === c ? ACCENT : "transparent"}`, whiteSpace: "nowrap", cursor: "pointer" }}
            >
              {c}
            </button>
          ))}
        </nav>
      </header>

      {/* galeri */}
      <div className="px-5 pb-10 lg:px-14">
        {loading ? (
          <div className="grid grid-cols-2 gap-8">
            {[0, 1].map((i) => (
              <div key={i} style={{ aspectRatio: "4 / 5", background: PANEL }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "52px 16px", borderTop: `1px solid ${LINE}` }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 30 }}>Tidak ada yang cocok</div>
            <p style={{ fontSize: 14, color: INK_SOFT, marginTop: 10 }}>
              {q ? `Tidak ada yang cocok dengan “${q}”.` : "Belum ada produk di kategori ini."}
            </p>
            <button onClick={onResetFilter} style={{ marginTop: 18, border: `1px solid ${INK}`, background: "transparent", color: INK, padding: "12px 24px", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer" }}>
              Tampilkan semua
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
            <div className="grid content-start gap-10">
              {left.map((item) => (
                <Figure key={item.id} p={item} slug={slug} canAdd={canAdd} onAdd={onAdd} />
              ))}
            </div>
            <div className="grid content-start gap-10 lg:mt-16">
              {right.map((item) => (
                <Figure key={item.id} p={item} slug={slug} canAdd={canAdd} onAdd={onAdd} />
              ))}
            </div>
          </div>
        )}

        {bio && (
          <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 20, lineHeight: 1.5, maxWidth: 640, marginTop: 40, color: INK }}>
            “{bio}”
          </p>
        )}
      </div>

      {/* panel info */}
      <footer className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5 px-5 py-8 lg:px-14" style={{ background: PANEL, borderTop: `1px solid ${LINE}` }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.22em", color: INK_SOFT }}>Kunjungi / pesan</span>
          <div style={{ fontFamily: DISPLAY, fontSize: 22, marginTop: 8, lineHeight: 1.35 }}>
            {showHours && todayHours ? todayHours : "Chat WhatsApp untuk tanya stok"}
          </div>
          {showHours && hourRows.length > 0 && (
            <div className="tnum" style={{ fontSize: 12, color: INK_SOFT, marginTop: 8, lineHeight: 1.8 }}>
              {hourRows.map((h) => `${h.day}: ${h.text}`).join(" · ")}
            </div>
          )}
        </div>
        <div className="tnum lg:text-right" style={{ fontSize: 11.5, color: INK_SOFT, lineHeight: 1.8 }}>
          {showCart && <>Keranjang <span style={{ color: INK, fontSize: 15 }}>{cartCount}</span> · </>}
          <a href="#/cart" style={{ color: ACCENT, fontWeight: 700 }}>Lihat keranjang →</a>
          <br />Bayar via QRIS
        </div>
      </footer>
    </div>
  );
}
