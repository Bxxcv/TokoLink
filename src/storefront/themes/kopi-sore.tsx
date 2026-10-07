/**
 * Tema 2 — "Kopi Sore" (kopi & bakery artisan).
 * Editorial tenang, satu kolom lega. SEMUA data dari props.
 */
import { useState } from "react";
import { rupiah, type Product } from "../../lib/data";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { nextOpenText } from "./shared";

const BG = "#F1EDE4";
const SURFACE = "#FFFFFF";
const INK = "#241E1A";
const MUTED = "#6E635A";
const ACCENT = "#1F4D3F";
const ON_ACCENT = "#FFFFFF";
const TUTUP = "#A63229";
const HABIS = "#8C857C";
const SISA = "#8F6A0B";
const DISPLAY = "'Instrument Serif', 'Iowan Old Style', Georgia, serif";
const BODY = "'Archivo', 'Helvetica Neue', ui-sans-serif, system-ui, sans-serif";

function Card({ p, slug, canAdd, closed, onAdd, restockLabel, onRestock }: {
  p: Product; slug: string; canAdd: boolean; closed: boolean; onAdd: (p: Product) => void;
  restockLabel: string | null; onRestock: (() => void) | null;
}) {
  const out = p.stock === 0;
  const dead = !canAdd || out;
  return (
    <article>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ display: "block", borderRadius: 4, overflow: "hidden" }}>
        <img src={p.img} alt="" loading="lazy" style={{ aspectRatio: "4 / 5", width: "100%", objectFit: "cover", display: "block" }} />
      </a>
      <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 12 }}>
        {p.cat}{out ? <span style={{ color: HABIS }}> · Habis</span> : p.stock <= 5 ? <span style={{ color: SISA }}> · Sisa {p.stock}</span> : null}
      </div>
      <a href={`#/s/${slug}/p/${p.id}`} style={{ fontFamily: DISPLAY, fontSize: 18, color: INK, textDecoration: "none", display: "block", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {p.name}
      </a>
      {p.desc ? (
        <p style={{ fontSize: 13, color: MUTED, margin: "4px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</p>
      ) : null}
      <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
        <span className="tnum" style={{ fontSize: 17, fontWeight: 600, color: ACCENT }}>{rupiah(p.price)}</span>
      </div>
      {dead ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 46, borderRadius: 2, display: "grid", placeItems: "center", fontSize: 13, border: "1px dashed rgba(36,30,26,.35)", color: HABIS, background: closed ? "#E7E2D9" : undefined }}>
            {closed ? "Toko tutup" : "Stok habis"}
          </div>
          {!closed && out && restockLabel && onRestock && (
            <button onClick={onRestock} style={{ background: "none", border: "none", padding: "8px 0 0", color: ACCENT, fontSize: 13, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              {restockLabel}
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => onAdd(p)}
          aria-label={`Tambah ${p.name} ke keranjang`}
          style={{ marginTop: 10, width: "100%", height: 46, border: "none", borderRadius: 2, background: ACCENT, color: ON_ACCENT, fontSize: 13, cursor: "pointer", fontFamily: BODY }}
        >
          Tambah ke keranjang →
        </button>
      )}
    </article>
  );
}

export function KopiSore(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, avatarUrl, coverUrl, closed,
    items, allItems, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink, openNow, todayHours, hourRows,
    showHours, showQR, showCart, cartCount, onAdd, onChatWA,
    qrData, onOpenQR, onShare, shared,
  } = p;
  const canAdd = showCart && !closed;
  const [more, setMore] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const dirty = q.trim() !== "" || cat !== "Semua";
  const nextOpen = closed ? nextOpenText(hourRows, todayHours) : null;
  const restock = bioLinks.find((l) => l.icon === "wa" || l.icon === "ig") ?? null;

  return (
    <div style={{ background: BG, color: INK, fontFamily: BODY, fontSize: 14, lineHeight: 1.6, minHeight: "100vh" }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: BG }}>
        <div className="mx-auto flex max-w-[1080px] items-center gap-3 px-5" style={{ height: 64 }}>
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden" style={{ borderRadius: 4, background: ACCENT, color: ON_ACCENT, fontFamily: DISPLAY, fontSize: 16 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontSize: 20 }}>{storeName}</span>
            {city ? <span className="block truncate" style={{ fontSize: 11, letterSpacing: "0.14em", color: MUTED }}>{city.toUpperCase()}</span> : null}
          </span>
          <span style={{ fontSize: 11, color: openNow === false || closed ? TUTUP : MUTED }}>
            <span aria-hidden style={{ display: "inline-block", width: 6, height: 6, borderRadius: 99, background: openNow === false || closed ? TUTUP : "#17703F", marginRight: 6 }} />
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
            <a href="#/cart" aria-label="Keranjang" style={{ position: "relative", width: 44, height: 44, display: "grid", placeItems: "center", color: INK }}>
              <Icon name="cart" size={19} />
              {cartCount > 0 && (
                <span className="tnum" style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 99, background: ACCENT, color: ON_ACCENT, fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center" }}>
                  {cartCount}
                </span>
              )}
            </a>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1080px] px-5" style={{ paddingBottom: 48 }}>
        {/* sampul + profil */}
        {coverUrl && (
          <div style={{ position: "relative", marginTop: 8 }}>
            <img src={coverUrl} alt="" style={{ width: "100%", height: 216, objectFit: "cover", display: "block", borderRadius: "4px 4px 0 0" }} />
            <div style={{ background: SURFACE, borderRadius: "4px 4px 4px 4px", padding: "18px 20px", marginTop: -73, position: "relative", border: "1px solid rgba(36,30,26,.08)" }}>
              {bio ? (
                <>
                  <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, display: "-webkit-box", WebkitLineClamp: more ? 99 : 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>
                  {bio.length > 120 && (
                    <button onClick={() => setMore((m) => !m)} style={{ background: "none", border: "none", padding: "8px 0 0", fontSize: 13, color: INK, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
                      {more ? "Tutup" : "Read more"}
                    </button>
                  )}
                </>
              ) : (
                <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
                  {[city, `${allItems.length} produk`].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
        )}
        {!coverUrl && (
          <div style={{ background: SURFACE, borderRadius: 4, padding: "18px 20px", marginTop: 12, border: "1px solid rgba(36,30,26,.08)" }}>
            {bio ? (
              <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{bio}</p>
            ) : (
              <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
                {[city, `${allItems.length} produk`].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        )}

        {/* tautan */}
        {bioLinks.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>Catatan & kanal</div>
            {bioLinks.map((l) => (
              <button key={l.id} onClick={() => onOpenBioLink(l)} className="flex w-full items-center gap-2.5 text-left" style={{ background: "none", border: "none", borderBottom: "1px solid rgba(36,30,26,.1)", padding: "11px 0", cursor: "pointer", color: INK, fontSize: 14 }}>
                <Icon name={iconForLink(l.icon)} size={18} />
                <span className="min-w-0 flex-1 truncate">{l.label}</span>
                <span aria-hidden>→</span>
              </button>
            ))}
          </div>
        )}

        {/* jam */}
        {showHours && (
          <div style={{ marginTop: 16 }}>
            <button onClick={() => setHoursOpen((o) => !o)} aria-expanded={hoursOpen} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13.5, color: INK, fontFamily: BODY }}>
              <span className="tnum">{todayHours || (openNow === false ? "Tutup hari ini" : "Jam buka")}</span>
              <span style={{ color: MUTED }}> · 7 hari ›</span>
            </button>
            {hoursOpen && hourRows.length > 0 && (
              <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
                {hourRows.map((h) => (
                  <li key={h.day} className="tnum flex items-baseline gap-2" style={{ fontSize: 13, padding: "5px 0", color: h.on ? INK : MUTED, fontWeight: h.text === todayHours ? 700 : 400 }}>
                    <span style={{ minWidth: 64 }}>{h.day}</span>
                    <span aria-hidden style={{ flex: 1, borderBottom: "1px dotted rgba(36,30,26,.3)" }} />
                    <span>{h.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* filter */}
        <div className="md:sticky md:top-16 md:z-30" style={{ marginTop: 22, background: BG, paddingBottom: 12 }}>
          <div className="relative">
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="cari biji, pastry, alat…"
              aria-label="Cari produk"
              style={{ width: "100%", height: 44, background: "transparent", border: "none", borderBottom: "1px solid rgba(36,30,26,.3)", fontSize: 14, color: INK, outline: "none", fontFamily: BODY }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-1 gap-y-2" style={{ marginTop: 10 }}>
            {cats.map((c, i) => (
              <span key={c} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden style={{ color: MUTED }}> / </span>}
                <button
                  onClick={() => onCat(c)}
                  style={{ background: "none", border: "none", borderBottom: cat === c ? `2px solid ${ACCENT}` : "2px solid transparent", padding: "6px 2px", fontSize: 13.5, fontWeight: cat === c ? 700 : 400, color: cat === c ? INK : MUTED, cursor: "pointer" }}
                >
                  {c}
                </button>
              </span>
            ))}
            {dirty && (
              <button onClick={onResetFilter} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 12.5, color: MUTED, cursor: "pointer" }}>
                reset
              </button>
            )}
          </div>
        </div>

        {/* katalog */}
        <main style={{ marginTop: 8 }}>
          {closed && (
            <div style={{ background: `${TUTUP}14`, border: `1px solid ${TUTUP}55`, borderRadius: 4, padding: "12px 14px", fontSize: 13.5, marginBottom: 16 }}>
              Toko tutup{nextOpen ? ` — ${nextOpen}` : ""}. Harga tetap bisa dilihat.
            </div>
          )}
          {loading ? (
            <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div style={{ aspectRatio: "4/5", background: "rgba(36,30,26,.07)", borderRadius: 4 }} />
                  <div style={{ height: 14, background: "rgba(36,30,26,.08)", borderRadius: 3, marginTop: 12 }} />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full" style={{ border: "1px solid rgba(36,30,26,.2)", color: MUTED }}>
                <Icon name="box" size={30} />
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 20, marginTop: 16 }}>
                {q || cat !== "Semua" ? `Tidak ada “${q || cat}” di katalog. Coba kata lain` : "Belum ada yang disangrai minggu ini"}
              </div>
              {(q || cat !== "Semua") && (
                <button onClick={onResetFilter} style={{ background: "none", border: "none", marginTop: 10, fontSize: 13.5, color: ACCENT, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
                  Atur ulang
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card
                  key={item.id}
                  p={item}
                  slug={slug}
                  canAdd={canAdd}
                  closed={closed}
                  onAdd={onAdd}
                  restockLabel={restock ? `tanya restock via ${restock.label}` : null}
                  onRestock={restock ? () => onOpenBioLink(restock) : null}
                />
              ))}
            </div>
          )}
        </main>

        {/* footer + QR */}
        <footer style={{ textAlign: "center", marginTop: 44, paddingBottom: 24 }}>
          {showQR && qrData && (
            <div style={{ display: "inline-block", background: SURFACE, border: "1px solid rgba(36,30,26,.1)", borderRadius: 6, padding: 16, marginBottom: 16 }}>
              <img src={qrData} alt={`QR ${storeName}`} width={168} height={168} style={{ width: 168, height: 168, display: "block" }} />
              <a href={qrData} download={`qr-${slug}.png`} style={{ display: "inline-block", marginTop: 12, border: "1px solid rgba(36,30,26,.3)", borderRadius: 4, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: INK, textDecoration: "none" }}>
                Unduh PNG
              </a>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 10 }}>Buka etalase ini di HP lain</div>
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 600 }}>{storeName}{city ? ` · ${city}` : ""}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Dibuat dengan TokoLink</div>
          <div style={{ marginTop: 10 }}>
            <button onClick={onChatWA} style={{ background: "none", border: "none", fontSize: 12.5, color: MUTED, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
              Hubungi penjual
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
