/**
 * Tema 3 — "Butik Rapi" (fashion).
 * Lookbook vertikal, tempo lambat. SEMUA data dari props.
 */
import { useEffect, useRef, useState } from "react";
import { rupiah, type Product } from "../../lib/data";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { nextOpenText } from "./shared";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const INK = "#16130F";
const MUTED = "#5F5951";
const ACCENT = "#6E2B3D";
const ON_ACCENT = "#FFFFFF";
const TUTUP = "#9E2B22";
const HABIS = "#847E77";
const SISA = "#8C6A12";
const DEAD_BG = "#EAE6E0";
const DISPLAY = "Fraunces, Georgia, serif";
const BODY = "'Archivo', 'Futura', ui-sans-serif, system-ui, sans-serif";

function Card({ p, slug, canAdd, closed, onAdd }: { p: Product; slug: string; canAdd: boolean; closed: boolean; onAdd: (p: Product) => void }) {
  const out = p.stock === 0;
  const dead = !canAdd || out;
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const buy = () => {
    onAdd(p);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 900);
  };
  return (
    <article>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ display: "block", overflow: "hidden" }}>
        <img
          src={p.img}
          alt=""
          loading="lazy"
          style={{ aspectRatio: "3 / 4", width: "100%", objectFit: "cover", display: "block", opacity: out ? 0.38 : 1 }}
        />
      </a>
      <div style={{ fontSize: 15, fontFamily: DISPLAY, fontWeight: 500, color: INK, marginTop: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.35 }}>
        {p.name}
      </div>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", color: MUTED, marginTop: 4, textTransform: "uppercase" }}>{p.cat}</div>
      <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
        <span className="tnum" style={{ fontSize: 14, fontWeight: 500, color: ACCENT }}>{rupiah(p.price)}</span>
        <span className="tnum" style={{ fontSize: 11.5, color: out ? HABIS : closed ? MUTED : p.stock <= 5 ? SISA : MUTED }}>
          {out ? "Habis" : closed ? "" : p.stock <= 5 ? `Sisa ${p.stock}` : ""}
        </span>
      </div>
      {dead ? (
        <div style={{ marginTop: 10, height: 46, borderRadius: 999, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 600, background: DEAD_BG, color: HABIS }}>
          {closed ? "Tutup" : "Habis"}
        </div>
      ) : (
        <button
          onClick={buy}
          aria-label={`Tambah ${p.name}`}
          style={{ marginTop: 10, width: "100%", height: 46, border: "none", borderRadius: 999, background: ACCENT, color: ON_ACCENT, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: BODY }}
        >
          {added ? "Ditambahkan ✓" : "Tambah"}
        </button>
      )}
    </article>
  );
}

export function ButikRapi(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, avatarUrl, coverUrl, closed,
    items, allItems, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink, openNow, todayHours, hourRows,
    showHours, showQR, showCart, cartCount, onAdd,
    qrData, onOpenQR, onShare, shared,
  } = p;
  const canAdd = showCart && !closed;
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const dirty = q.trim() !== "" || cat !== "Semua";
  const nextOpen = closed ? nextOpenText(hourRows, todayHours) : null;

  return (
    <div style={{ background: BG, color: INK, fontFamily: BODY, fontSize: 14, lineHeight: 1.55, minHeight: "100vh" }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: BG }}>
        <div className="mx-auto flex max-w-[1100px] items-center gap-2.5 px-5" style={{ height: 60 }}>
          <span className="grid h-[30px] w-[30px] shrink-0 place-items-center overflow-hidden rounded-full" style={{ background: ACCENT, color: ON_ACCENT, fontFamily: DISPLAY, fontSize: 14 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontSize: 18 }}>{storeName}</span>
            <span className="block truncate" style={{ fontSize: 11, letterSpacing: "0.12em", color: MUTED }}>
              {[city?.toUpperCase(), openNow === false || closed ? "TUTUP" : "BUKA"].filter(Boolean).join(" · ")}
            </span>
          </span>
          {showQR && (
            <button onClick={onOpenQR} aria-label="QR toko" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", color: INK, cursor: "pointer" }}>
              <Icon name="qr" size={20} strokeWidth={1.5} />
            </button>
          )}
          <button onClick={onShare} aria-label="Bagikan" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", color: INK, cursor: "pointer" }}>
            <Icon name={shared ? "check" : "external"} size={20} strokeWidth={1.5} />
          </button>
          {showCart && (
            <a href="#/cart" aria-label="Keranjang" className="flex items-center gap-1" style={{ height: 44, padding: "0 6px", color: INK }}>
              <Icon name="cart" size={20} strokeWidth={1.5} />
              <span className="tnum" style={{ fontSize: 12, color: MUTED }}>· {cartCount}</span>
            </a>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-5" style={{ paddingBottom: 48 }}>
        {/* profil */}
        <div className="relative">
          {coverUrl && (
            <img src={coverUrl} alt="" style={{ width: "100%", aspectRatio: "4 / 3", maxHeight: 240, objectFit: "cover", display: "block", marginTop: 14 }} />
          )}
          <h1 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 500, margin: coverUrl ? "18px 0 0" : "26px 0 0", lineHeight: 1.15, overflowWrap: "break-word" }}>
            {storeName}
          </h1>
          {bio ? (
            <p style={{ fontSize: 14, lineHeight: 1.6, color: INK, margin: "10px 0 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: 560 }}>{bio}</p>
          ) : null}
          <div className="tnum" style={{ fontSize: 12.5, color: MUTED, marginTop: 8 }}>
            {todayHours || (openNow === false ? "Tutup hari ini" : city || "")}
          </div>
          {showQR && qrData && (
            <div className="hidden lg:block" style={{ position: "absolute", right: 0, top: 0, background: SURFACE, border: "1px solid rgba(22,19,15,.12)", padding: 10, textAlign: "center" }}>
              <img src={qrData} alt={`QR ${storeName}`} width={140} height={140} style={{ width: 140, height: 140, display: "block" }} />
              <div style={{ fontSize: 10.5, color: MUTED, marginTop: 6 }}>Pindai untuk buka</div>
            </div>
          )}
        </div>

        {/* tautan */}
        {bioLinks.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ marginTop: 16 }}>
            {bioLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => onOpenBioLink(l)}
                className="flex flex-1 flex-col items-center gap-1.5"
                style={{ minWidth: 88, background: "none", border: "1px solid rgba(22,19,15,.12)", borderRadius: 8, padding: "10px 8px", cursor: "pointer", color: INK }}
              >
                <Icon name={iconForLink(l.icon)} size={20} />
                <span style={{ fontSize: 11, color: MUTED, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* jam */}
        {showHours && (
          <div style={{ marginTop: 14 }}>
            <button onClick={() => setHoursOpen((o) => !o)} aria-expanded={hoursOpen} style={{ width: "100%", minHeight: 48, background: "none", border: "none", borderBottom: "1px solid rgba(22,19,15,.12)", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", color: INK, fontSize: 13.5, fontWeight: 600 }}>
              <span>Jam & alamat</span>
              <span aria-hidden>{hoursOpen ? "▾" : "▸"}</span>
            </button>
            {hoursOpen && (
              <div>
                <div className="grid grid-cols-2 gap-x-6">
                  {hourRows.map((h) => (
                    <div key={h.day} className="tnum flex items-baseline justify-between gap-2" style={{ fontSize: 12.5, padding: "7px 0", borderBottom: "1px solid rgba(22,19,15,.07)" }}>
                      <span style={{ color: MUTED }}>{h.day}</span>
                      <span style={{ color: h.on ? INK : TUTUP }}>{h.text}</span>
                    </div>
                  ))}
                </div>
                {hourRows.length === 0 && <div style={{ fontSize: 12.5, color: MUTED, padding: "8px 0" }}>Jadwal belum diatur penjual.</div>}
                {city && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8 }}>{city}</div>}
              </div>
            )}
          </div>
        )}

        {/* filter */}
        <div style={{ marginTop: 16 }}>
          <div className="flex items-center gap-2">
            {!searchOpen ? (
              <button onClick={() => setSearchOpen(true)} aria-label="Cari" style={{ width: 46, height: 46, display: "grid", placeItems: "center", background: "none", border: "1px solid rgba(22,19,15,.16)", borderRadius: 8, color: INK, cursor: "pointer" }}>
                <Icon name="search" size={18} />
              </button>
            ) : (
              <div className="relative" style={{ flex: 1 }}>
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => onQ(e.target.value)}
                  placeholder="Cari…"
                  aria-label="Cari produk"
                  style={{ width: "100%", height: 46, border: "1px solid rgba(22,19,15,.2)", borderRadius: 8, background: SURFACE, padding: "0 38px 0 14px", fontSize: 14, color: INK, outline: "none" }}
                />
                <button onClick={() => { onQ(""); setSearchOpen(false); }} aria-label="Tutup cari" style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, border: "none", background: "none", color: MUTED, cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            )}
            <div className="tl-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              {cats.map((c, i) => (
                <span key={c} className="flex shrink-0 items-center gap-1">
                  {i > 0 && <span aria-hidden style={{ color: MUTED }}>·</span>}
                  <button
                    onClick={() => onCat(c)}
                    style={{ background: "none", border: "none", padding: "10px 2px", fontSize: 13.5, color: cat === c ? ACCENT : MUTED, fontWeight: cat === c ? 700 : 400, textDecoration: cat === c ? "underline" : "none", textUnderlineOffset: 4, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {c}
                  </button>
                </span>
              ))}
              {dirty && (
                <button onClick={onResetFilter} style={{ flexShrink: 0, background: "none", border: "none", padding: 10, fontSize: 12.5, color: MUTED, cursor: "pointer", whiteSpace: "nowrap" }}>
                  × bersihkan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* katalog */}
        <main style={{ marginTop: 14 }}>
          {closed && (
            <div style={{ background: `${TUTUP}12`, border: `1px solid ${TUTUP}44`, borderRadius: 8, padding: "11px 13px", fontSize: 13, marginBottom: 14 }}>
              Tutup{nextOpen ? ` · ${nextOpen}` : ""}.
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1].map((i) => (
                <div key={i} style={{ aspectRatio: "3/4", background: "rgba(22,19,15,.06)" }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ width: 120, height: 75, margin: "0 auto", border: "1px solid rgba(22,19,15,.25)" }} />
              <div style={{ fontFamily: DISPLAY, fontSize: 20, marginTop: 16 }}>
                {q || cat !== "Semua" ? `Tidak ada “${q || cat}”. Lihat semua produk` : "Etalase masih kosong — produk pertama akan tampil di sini"}
              </div>
              {(q || cat !== "Semua") && (
                <button onClick={onResetFilter} style={{ background: "none", border: "none", marginTop: 10, fontSize: 13.5, color: INK, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
                  Lihat semua produk
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id} p={item} slug={slug} canAdd={canAdd} closed={closed} onAdd={onAdd} />
              ))}
            </div>
          )}
          {closed && items.length > 0 && nextOpen && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: MUTED, textAlign: "center" }}>Pesan lagi {nextOpen}.</div>
          )}
        </main>

        <footer style={{ textAlign: "center", marginTop: 36, paddingBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{storeName}{city ? ` · ${city}` : ""}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Dibuat dengan TokoLink</div>
        </footer>
      </div>
    </div>
  );
}
