/**
 * Tema 01 — "Ruang Seduh" (editorial hangat).
 *
 * Diport dari desain_toko_seller (layout "editorial"): dua kolom
 * (profil lengket + daftar ledger bernomor), pita foto, tab bergaris
 * bawah, tanpa bayangan. SEMUA teks/harga/gambar dari props (data asli
 * Supabase) — tidak ada satu pun angka/teks contoh di file ini.
 *
 * Satu komponen responsif (bukan artboard desktop/mobile terpisah):
 * kolom profil menumpuk di atas katalog pada layar sempit.
 */
import type { CSSProperties } from "react";
import { rupiah, type Product } from "../../lib/data";
import { iconForLink } from "../../lib/links";
import { Icon } from "../../components/ui";
import type { ThemeStorefrontProps } from "../types";

const PAPER = "#FBF6EE";
const PANEL = "#F2E8D9";
const INK = "#2A1D14";
const INK_SOFT = "#7A6A5B";
const LINE = "#E2D6C4";
const ACCENT = "#B4552E";
const ACCENT_INK = "#FFF7EE";
const OK = "#4F7A4A";
const DISPLAY = "'Fraunces', Georgia, serif";
const BODY = "'IBM Plex Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

const hair: CSSProperties = { borderColor: LINE };

function initials(name: string): string {
  return name
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Monogram({ name, avatar, size }: { name: string; avatar: string | null; size: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        background: ACCENT,
        color: ACCENT_INK,
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: size * 0.4,
        letterSpacing: "-0.02em",
        borderRadius: 2,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {avatar ? (
        <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials(name || "T")
      )}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: BODY,
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        color: INK_SOFT,
        display: "block",
      }}
    >
      {children}
    </span>
  );
}

function LedgerRow({
  no,
  p,
  slug,
  canAdd,
  onAdd,
}: {
  no: string;
  p: Product;
  slug: string;
  canAdd: boolean;
  onAdd: (p: Product) => void;
}) {
  const out = p.stock === 0;
  return (
    <div
      className="grid w-full items-baseline text-left"
      style={{ gridTemplateColumns: "34px minmax(0,1fr) auto", gap: 14, padding: "20px 6px", borderTop: `1px solid ${LINE}` }}
    >
      <span className="tnum" style={{ fontFamily: MONO, fontSize: 12, color: ACCENT }}>
        {no}
      </span>
      <span style={{ minWidth: 0 }}>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a
            href={`#/s/${slug}/p/${p.id}`}
            style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em", color: INK, textDecoration: "none" }}
          >
            {p.name}
          </a>
          {out ? (
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: INK_SOFT, border: `1px solid ${LINE}`, padding: "2px 6px" }}>
              Habis
            </span>
          ) : (
            p.stock <= 15 && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ACCENT, border: `1px solid ${ACCENT}`, padding: "2px 6px" }}>
                Sisa {p.stock}
              </span>
            )
          )}
        </span>
        <span style={{ display: "block", fontSize: 13.5, color: INK_SOFT, marginTop: 5, lineHeight: 1.5 }}>
          {p.cat}
          {p.unit ? ` · ${p.unit}` : ""}
        </span>
      </span>
      <span className="text-right" style={{ display: "grid", gap: 6, justifyItems: "end" }}>
        <span className="tnum" style={{ fontFamily: MONO, fontSize: 16, fontWeight: 500, color: INK }}>
          {rupiah(p.price)}
        </span>
        {canAdd && !out && (
          <button
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name} ke keranjang`}
            style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: ACCENT, background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            Tambah +
          </button>
        )}
      </span>
    </div>
  );
}

export function RuangSeduh(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, waNumber, avatarUrl, coverUrl, closed,
    items, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink, openNow, todayHours, hourRows,
    showHours, showQR, showCart, cartCount, onAdd, onChatWA,
    qrData, onOpenQR, onShare, shared,
  } = p;
  const canAdd = showCart && !closed;

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: BODY, fontSize: 15, lineHeight: 1.5, minHeight: "100vh" }}>
      {/* header */}
      <header
        className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-5 pb-5 pt-7 lg:px-10 lg:pt-9"
        style={{ borderBottom: `1px solid ${LINE}` }}
      >
        <div className="flex min-w-0 items-end gap-4">
          <Monogram name={storeName} avatar={avatarUrl} size={54} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 30, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              {storeName}
            </div>
            <div className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, marginTop: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              tokolink.store/s/{slug}{city ? ` · ${city}` : ""}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {showHours && (
            <span className="flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: INK_SOFT }}>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: 99, background: openNow === false ? "#B23A22" : OK, display: "inline-block" }} />
              {openNow === false ? "Tutup" : `Buka${todayHours ? ` · ${todayHours}` : ""}`}
            </span>
          )}
          <button
            onClick={onShare}
            style={{ border: `1px solid ${LINE}`, padding: "9px 13px", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, background: "transparent", color: INK, cursor: "pointer" }}
          >
            {shared ? "Tersalin" : "Bagikan"}
          </button>
          {showQR && (
            <button
              onClick={onOpenQR}
              style={{ border: `1px solid ${LINE}`, padding: "9px 13px", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, background: "transparent", color: INK, cursor: "pointer" }}
            >
              QRIS
            </button>
          )}
          {showCart && (
            <a
              href="#/cart"
              style={{ background: INK, color: PAPER, padding: "10px 15px", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none" }}
            >
              Keranjang · <span className="tnum">{cartCount}</span>
            </a>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* kolom profil */}
        <aside className="w-full shrink-0 lg:w-[356px]" style={{ borderBottom: `1px solid ${LINE}`, padding: "30px 20px" }}>
          <div className="lg:sticky lg:top-20">
            <div className="lg:border-r lg:pr-8" style={hair}>
              <Label>Tentang</Label>
              {bio ? (
                <p style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 400, lineHeight: 1.4, margin: "12px 0 22px", letterSpacing: "-0.01em" }}>
                  {bio}
                </p>
              ) : (
                <p style={{ fontSize: 14, color: INK_SOFT, margin: "12px 0 22px", lineHeight: 1.6 }}>
                  {city || "Katalog produk toko ini."}
                </p>
              )}
              {showHours && (
                <div style={{ borderTop: `1px solid ${LINE}`, padding: "16px 0" }}>
                  <Label>Jam buka</Label>
                  <div className="tnum" style={{ fontFamily: MONO, fontSize: 13, marginTop: 8 }}>
                    {todayHours || (openNow === false ? "Tutup hari ini" : "Lihat daftar jam")}
                  </div>
                  {hourRows.length > 0 && (
                    <ul style={{ marginTop: 10, display: "grid", gap: 6 }}>
                      {hourRows.map((h) => (
                        <li key={h.day} className="flex items-baseline justify-between gap-3" style={{ fontSize: 12.5, color: h.on ? INK : INK_SOFT }}>
                          <span style={{ fontWeight: 600 }}>{h.day}</span>
                          <span className="tnum" style={{ fontFamily: MONO, fontSize: 11.5 }}>{h.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <button
                onClick={onChatWA}
                className="flex items-center justify-center gap-2"
                style={{ width: "100%", background: ACCENT, color: ACCENT_INK, border: "none", padding: 14, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 6, cursor: "pointer" }}
              >
                <Icon name="wa" size={16} /> Chat WhatsApp
              </button>
              <dl className="tnum" style={{ fontFamily: MONO, fontSize: 12, marginTop: 22, color: INK_SOFT }}>
                {[
                  ...(city ? [["Kota", city] as [string, string]] : []),
                  ["Pembayaran", "QRIS"],
                ].map(([k, v]) => (
                  <div key={k} style={{ borderTop: `1px solid ${LINE}`, padding: "12px 0" }}>
                    <dt style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 9, color: INK_SOFT }}>{k}</dt>
                    <dd style={{ color: INK, marginTop: 5, lineHeight: 1.5 }}>{v}</dd>
                  </div>
                ))}
              </dl>
              {bioLinks.length > 0 && (
                <div style={{ borderTop: `1px solid ${LINE}`, padding: "16px 0 4px" }}>
                  <Label>Tautan</Label>
                  <div className="grid gap-2" style={{ marginTop: 12 }}>
                    {bioLinks.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => onOpenBioLink(l)}
                        className="flex items-center gap-2.5 text-left"
                        style={{ border: `1px solid ${LINE}`, background: "transparent", color: INK, padding: "10px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                      >
                        <Icon name={iconForLink(l.icon)} size={15} />
                        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* katalog */}
        <main className="min-w-0 flex-1" style={{ padding: "26px 20px 44px" }}>
          {coverUrl && (
            <div style={{ height: 188, backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center 55%", backgroundColor: PANEL }} role="img" aria-label={`Sampul ${storeName}`} />
          )}

          <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 22 }}>
            <div className="relative min-w-0 flex-1" style={{ minWidth: 200 }}>
              <Icon name="search" size={15} className="absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => onQ(e.target.value)}
                placeholder="Cari produk…"
                aria-label="Cari produk"
                style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${LINE}`, padding: "10px 4px 10px 26px", fontSize: 14, fontFamily: BODY, color: INK, outline: "none" }}
              />
            </div>
          </div>

          <nav className="flex gap-6 overflow-x-auto" style={{ marginTop: 18, borderBottom: `1px solid ${LINE}` }}>
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => onCat(c)}
                style={{
                  background: "none", border: "none", padding: "0 0 12px", marginBottom: -1,
                  fontFamily: BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
                  color: (cat === c ? INK : INK_SOFT),
                  borderBottom: `2px solid ${(cat === c ? ACCENT : "transparent")}`,
                  whiteSpace: "nowrap", cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
            <span className="tnum" style={{ fontFamily: MONO, marginLeft: "auto", fontSize: 11, color: INK_SOFT, paddingBottom: 12, whiteSpace: "nowrap" }}>
              {items.length} item
            </span>
          </nav>

          <div>
            {loading ? (
              <div style={{ display: "grid", gap: 0 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ padding: "21px 8px", borderTop: `1px solid ${LINE}`, display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 20 }}>
                    <div style={{ height: 14, background: PANEL }} />
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ height: 20, width: "60%", background: PANEL }} />
                      <div style={{ height: 14, width: "40%", background: PANEL }} />
                    </div>
                    <div style={{ height: 16, width: 70, background: PANEL }} />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: "48px 16px", textAlign: "center", borderTop: `1px solid ${LINE}` }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 24, letterSpacing: "-0.01em" }}>Tidak ada yang cocok</div>
                <p style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, marginTop: 10, lineHeight: 1.7 }}>
                  {q ? `Tidak ada produk yang cocok dengan “${q}”.` : "Belum ada produk di kategori ini."}
                </p>
                <button
                  onClick={onResetFilter}
                  style={{ marginTop: 18, border: `1px solid ${INK}`, background: "transparent", color: INK, padding: "12px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Tampilkan semua
                </button>
              </div>
            ) : (
              items.map((item, i) => (
                <LedgerRow key={item.id} no={String(i + 1).padStart(2, "0")} p={item} slug={slug} canAdd={canAdd} onAdd={onAdd} />
              ))
            )}
          </div>
        </main>
      </div>

      {/* footer */}
      <footer
        className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-10"
        style={{ borderTop: `1px solid ${LINE}`, background: PANEL }}
      >
        <span className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, lineHeight: 1.7 }}>
          {city && <>{city} · </>}Bayar via QRIS
        </span>
        {showQR && (
          <button onClick={onOpenQR} className="flex items-center gap-4" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            {qrData ? (
              <img src={qrData} alt={`QR ${storeName}`} width={34} height={34} style={{ width: 34, height: 34 }} />
            ) : (
              <span style={{ width: 34, height: 34, background: ACCENT, display: "inline-block" }} aria-hidden />
            )}
            <span className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT }}>Pindai untuk bayar</span>
          </button>
        )}
      </footer>

      {/* bilah keranjang mobile — SELALU ke /cart (bukan WhatsApp) */}
      {showCart && cartCount > 0 && (
        <div className="fixed inset-x-0 z-30 px-4 lg:hidden" style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}>
          <a
            href="#/cart"
            className="mx-auto flex w-full max-w-[420px] items-center justify-center gap-2 px-4 py-3.5 text-[13.5px] font-bold"
            style={{ background: ACCENT, color: ACCENT_INK, textDecoration: "none" }}
          >
            Lihat keranjang ({cartCount})
          </a>
        </div>
      )}
    </div>
  );
}
