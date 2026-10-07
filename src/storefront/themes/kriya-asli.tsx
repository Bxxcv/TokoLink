/**
 * Tema 6 — "Kriya Asli" (kerajinan & handmade).
 * Etalase + blok cerita. SEMUA data dari props.
 * Catatan: spec.card kosong di brief → kartu dirancang dari ascii & mood
 * (foto 4:5, nama, kategori+SKU, harga, tambah, tautan WA).
 */
import { useState } from "react";
import { rupiah, type Product } from "../../lib/data";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { nextOpenText, skuShort } from "./shared";

const BG = "#F2EDE3";
const SURFACE = "#FFFCF4";
const INK = "#2A2318";
const MUTED = "#655A49";
const ACCENT = "#2E4A7D";
const ON_ACCENT = "#FFFFFF";
const TUTUP = "#A8322A";
const HABIS = "#847A69";
const SISA = "#8A6413";
const DEAD_BG = "#E7E1D5";
const DISPLAY = "Newsreader, Georgia, 'Times New Roman', serif";
const BODY = "'Archivo', 'Avenir Next', ui-sans-serif, system-ui, sans-serif";

function Card({ p, slug, canAdd, closed, onAdd, onChatWA }: {
  p: Product; slug: string; canAdd: boolean; closed: boolean;
  onAdd: (p: Product) => void; onChatWA: () => void;
}) {
  const out = p.stock === 0;
  const dead = !canAdd || out;
  return (
    <article style={{ background: SURFACE, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(42,35,24,.1)" }}>
      <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ display: "block", position: "relative" }}>
        <img
          src={p.img}
          alt=""
          loading="lazy"
          style={{ aspectRatio: "4 / 5", width: "100%", objectFit: "cover", display: "block", filter: out ? "saturate(.8)" : undefined }}
        />
        {!closed && out && (
          <span style={{ position: "absolute", left: 10, bottom: 10, background: "rgba(255,252,244,.92)", color: HABIS, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", padding: "5px 10px", borderRadius: 6 }}>
            HABIS
          </span>
        )}
      </a>
      <div style={{ padding: "14px 14px 16px" }}>
        <a href={`#/s/${slug}/p/${p.id}`} style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 17, color: INK, textDecoration: "none", display: "block", lineHeight: 1.3 }}>
          {p.name}
        </a>
        <div className="tnum" style={{ fontSize: 11, color: MUTED, marginTop: 5, letterSpacing: "0.06em" }}>
          {p.cat.toUpperCase()} · {skuShort(p.sku, p.id)}
          {!closed && !out && p.stock <= 5 ? <span style={{ color: SISA }}> · Sisa {p.stock}</span> : null}
        </div>
        <div className="tnum" style={{ fontSize: 16, fontWeight: 700, color: ACCENT, marginTop: 8 }}>{rupiah(p.price)}</div>
        {dead ? (
          <div style={{ marginTop: 12, height: 48, borderRadius: 10, display: "grid", placeItems: "center", fontSize: 13.5, fontWeight: 700, background: DEAD_BG, color: HABIS }}>
            {closed ? "Toko tutup" : "Stok habis"}
          </div>
        ) : (
          <button
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name}`}
            style={{ marginTop: 12, width: "100%", height: 48, border: "none", borderRadius: 10, background: ACCENT, color: ON_ACCENT, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: BODY }}
          >
            Tambah ke keranjang
          </button>
        )}
        {!closed && (
          <button onClick={onChatWA} style={{ background: "none", border: "none", padding: "9px 0 0", width: "100%", fontSize: 13, color: MUTED, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
            tanya motif via WA
          </button>
        )}
      </div>
    </article>
  );
}

export function KriyaAsli(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, avatarUrl, coverUrl, closed,
    items, allItems, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink, openNow, todayHours, hourRows,
    showHours, showQR, showCart, cartCount, onAdd, onChatWA,
    qrData, onOpenQR, onShare, shared,
  } = p;
  const canAdd = showCart && !closed;
  const [story, setStory] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const dirty = q.trim() !== "" || cat !== "Semua";
  const nextOpen = closed ? nextOpenText(hourRows, todayHours) : null;
  const openDays = hourRows.filter((h) => h.on).length;

  return (
    <div style={{ background: BG, color: INK, fontFamily: BODY, fontSize: 14, lineHeight: 1.55, minHeight: "100vh" }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: SURFACE, borderBottom: "1px solid rgba(42,35,24,.08)" }}>
        <div className="mx-auto flex max-w-[1100px] items-center gap-2.5 px-4" style={{ height: 68 }}>
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full" style={{ background: ACCENT, color: ON_ACCENT, fontFamily: DISPLAY, fontSize: 17 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 17 }}>{storeName}</span>
            <span className="block truncate" style={{ fontSize: 12, color: MUTED }}>
              {city ? `${city} · ` : ""}
              <span style={{ color: openNow === false || closed ? TUTUP : "#1B6B45", fontWeight: 700 }}>
                {openNow === false || closed ? "TUTUP" : "BUKA"}
              </span>
            </span>
          </span>
          {showQR && (
            <button onClick={onOpenQR} aria-label="QR toko" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", borderRadius: 999, color: INK, cursor: "pointer" }}>
              <Icon name="qr" size={19} />
            </button>
          )}
          <button onClick={onShare} aria-label="Bagikan" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", borderRadius: 999, color: INK, cursor: "pointer" }}>
            <Icon name={shared ? "check" : "external"} size={19} />
          </button>
          {showCart && (
            <a href="#/cart" aria-label="Keranjang" style={{ position: "relative", width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 999, color: INK }}>
              <Icon name="cart" size={19} />
              {cartCount > 0 && (
                <span className="tnum" style={{ position: "absolute", top: 5, right: 3, minWidth: 18, height: 18, borderRadius: 999, background: ACCENT, color: ON_ACCENT, fontSize: 10.5, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 4px" }}>
                  {cartCount}
                </span>
              )}
            </a>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-4" style={{ paddingBottom: 44 }}>
        {/* sampul + cerita */}
        {coverUrl && <img src={coverUrl} alt="" style={{ width: "100%", height: 240, objectFit: "cover", display: "block", borderRadius: "0 0 14px 14px" }} />}
        <div style={{ background: SURFACE, borderRadius: 18, padding: 16, marginTop: coverUrl ? -28 : 14, position: "relative", border: "1px solid rgba(42,35,24,.08)" }}>
          {bio ? (
            <>
              <p style={{ fontFamily: DISPLAY, fontSize: 15, lineHeight: 1.65, margin: 0, display: "-webkit-box", WebkitLineClamp: story ? 99 : 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>
              {bio.length > 140 && (
                <button onClick={() => setStory((s) => !s)} style={{ background: "none", border: "none", padding: "8px 0 0", fontSize: 13, color: ACCENT, fontWeight: 600, cursor: "pointer" }}>
                  {story ? "tutup cerita" : "cerita lengkap"}
                </button>
              )}
            </>
          ) : (
            <p className="tnum" style={{ fontSize: 13.5, color: MUTED, margin: 0 }}>
              {[city, `${allItems.length} karya`].filter(Boolean).join(" · ")}
            </p>
          )}
          <div className="flex items-center" style={{ marginTop: 10 }}>
            {showHours && (
              <div className="tnum flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1" style={{ fontSize: 12.5, color: MUTED }}>
                <span>{todayHours || (openNow === false ? "Tutup hari ini" : "")}</span>
                {openDays > 0 && <span>· {openDays} hari/minggu</span>}
              </div>
            )}
            {showQR && (
              <button onClick={onOpenQR} aria-label="QR toko" style={{ marginLeft: "auto", width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: `1px solid ${INK}22`, borderRadius: 999, color: INK, cursor: "pointer", flexShrink: 0 }}>
                <Icon name="qr" size={19} />
              </button>
            )}
          </div>
        </div>

        {/* kanal */}
        {bioLinks.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>Kanal & catatan</div>
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              {bioLinks.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => onOpenBioLink(l)}
                  className="flex items-center gap-2.5 text-left"
                  style={{ background: SURFACE, border: "1px solid rgba(42,35,24,.1)", borderRadius: 10, padding: 10, minHeight: 52, cursor: "pointer", color: INK, width: "100%" }}
                >
                  <Icon name={iconForLink(l.icon)} size={i === 0 && l.icon === "wa" ? 22 : 20} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate" style={{ fontSize: 13, fontWeight: 600, textDecoration: i === 0 && l.icon === "wa" ? "underline" : "none", textUnderlineOffset: 3, textDecorationThickness: 2 }}>{l.label}</span>
                    <span className="block truncate" style={{ fontSize: 11, color: MUTED }}>{l.url.replace(/^https?:\/\//, "")}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* filter */}
        <div style={{ marginTop: 20 }}>
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Cari produk…"
              aria-label="Cari produk"
              style={{ width: "100%", height: 48, borderRadius: 999, border: "1px solid rgba(42,35,24,.16)", background: SURFACE, padding: "0 40px 0 42px", fontSize: 14, color: INK, outline: "none" }}
            />
            {q && (
              <button onClick={() => onQ("")} aria-label="Bersihkan" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, border: "none", background: "none", color: MUTED, cursor: "pointer", fontSize: 16 }}>×</button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2" style={{ marginTop: 10 }}>
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => onCat(c)}
                style={{ border: "1px solid", borderColor: cat === c ? ACCENT : "rgba(42,35,24,.18)", background: cat === c ? ACCENT : SURFACE, color: cat === c ? ON_ACCENT : INK, borderRadius: 999, padding: "9px 14px", fontSize: 13, fontWeight: cat === c ? 700 : 500, cursor: "pointer" }}
              >
                {c} · <span className="tnum">{c === "Semua" ? allItems.length : allItems.filter((i) => i.cat === c).length}</span>
              </button>
            ))}
            {dirty && (
              <button onClick={onResetFilter} style={{ background: "none", border: "none", fontSize: 13, color: ACCENT, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="refresh" size={14} /> Reset filter
              </button>
            )}
          </div>
        </div>

        {/* katalog */}
        <main style={{ marginTop: 16 }}>
          {closed && (
            <div style={{ background: `${TUTUP}12`, border: `1px solid ${TUTUP}44`, borderRadius: 10, padding: "11px 13px", fontSize: 13, marginBottom: 14 }}>
              Tutup{nextOpen ? ` · ${nextOpen}` : ""}. Harga tetap tampil.
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ background: SURFACE, borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ aspectRatio: "4/5", background: "rgba(42,35,24,.07)" }} />
                  <div style={{ padding: 14, display: "grid", gap: 8 }}>
                    <div style={{ height: 15, background: "rgba(42,35,24,.08)", borderRadius: 4 }} />
                    <div style={{ height: 13, width: "50%", background: "rgba(42,35,24,.08)", borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ background: SURFACE, borderRadius: 14, border: "1px solid rgba(42,35,24,.1)", padding: "40px 20px", textAlign: "center" }}>
              {coverUrl && <img src={coverUrl} alt="" aria-hidden style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10, opacity: 0.35, filter: "blur(1px)" }} />}
              <div style={{ fontFamily: DISPLAY, fontSize: 19, marginTop: coverUrl ? 16 : 0 }}>
                {q || cat !== "Semua" ? `Tidak ada “${q || cat}”. Semua produk ada di sini` : "Etalase belum diisi. Coba lagi nanti."}
              </div>
              {(q || cat !== "Semua") && (
                <button onClick={onResetFilter} style={{ marginTop: 12, height: 44, padding: "0 22px", border: "none", borderRadius: 10, background: ACCENT, color: ON_ACCENT, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                  Atur ulang
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id} p={item} slug={slug} canAdd={canAdd} closed={closed} onAdd={onAdd} onChatWA={onChatWA} />
              ))}
            </div>
          )}
        </main>

        {/* jam ringkas */}
        {showHours && (
          <div style={{ marginTop: 20, fontSize: 12.5, color: MUTED }}>
            <span className="tnum">{todayHours ? `${todayHours} · ` : ""}{openDays > 0 ? `${openDays} hari/minggu` : "Jadwal belum diatur"}</span>
            {hourRows.length > 0 && (
              <button onClick={() => setHoursOpen((o) => !o)} style={{ background: "none", border: "none", padding: "8px 0", fontSize: 12.5, color: ACCENT, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                {" "}· lihat 7 hari
              </button>
            )}
            {hoursOpen && hourRows.length > 0 && (
              <div className="grid grid-cols-2 gap-2" style={{ marginTop: 8 }}>
                {hourRows.map((h) => (
                  <div key={h.day} className="tnum flex items-center justify-between gap-2" style={{ fontSize: 12.5, background: SURFACE, borderRadius: 8, padding: "9px 11px", border: h.text === todayHours ? `2px solid ${ACCENT}` : "1px solid rgba(42,35,24,.1)" }}>
                    <span style={{ color: MUTED }}>{h.day}</span>
                    <span style={{ color: h.on ? INK : TUTUP }}>{h.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <footer style={{ textAlign: "center", marginTop: 28, paddingBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{storeName}{city ? ` · ${city}` : ""}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Dibuat dengan TokoLink</div>
        </footer>
      </div>
    </div>
  );
}
