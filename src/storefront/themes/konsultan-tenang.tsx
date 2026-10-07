/**
 * Tema 8 — "Konsultan Tenang" (jasa profesional).
 * Satu kolom lapang. SEMUA data dari props.
 */
import { useRef, useState } from "react";
import { rupiah, type Product } from "../../lib/data";
import { Icon } from "../../components/ui";
import { iconForLink } from "../../lib/links";
import type { ThemeStorefrontProps } from "../types";
import { hasPhoto, nextOpenText } from "./shared";

const BG = "#F5F6F4";
const SURFACE = "#FFFFFF";
const INK = "#1B201C";
const MUTED = "#5C645C";
const ACCENT = "#2F5D50";
const ON_ACCENT = "#FFFFFF";
const TUTUP = "#A33027";
const HABIS = "#808A82";
const DEAD_BG = "#E9ECE8";
const DISPLAY = "Newsreader, Georgia, serif";
const BODY = "'Archivo', 'Helvetica Neue', ui-sans-serif, system-ui, sans-serif";

function Card({ p, slug, canAdd, closed, onAdd, onChatWA }: {
  p: Product; slug: string; canAdd: boolean; closed: boolean;
  onAdd: (p: Product) => void; onChatWA: () => void;
}) {
  const out = p.stock === 0;
  const dead = !canAdd || out;
  const photo = hasPhoto(p.img);
  return (
    <article style={{ background: SURFACE, border: "1px solid rgba(27,32,28,.1)", borderRadius: 12, overflow: "hidden" }}>
      {photo && (
        <a href={`#/s/${slug}/p/${p.id}`} aria-label={p.name} style={{ display: "block" }}>
          <img src={p.img} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", maxHeight: 168, objectFit: "cover", display: "block" }} />
        </a>
      )}
      <div style={{ padding: "18px 18px 20px" }}>
        <a href={`#/s/${slug}/p/${p.id}`} style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 17, color: INK, textDecoration: "none", display: "block", lineHeight: 1.35 }}>
          {p.name}
        </a>
        {p.desc ? (
          <p style={{ fontSize: 13, lineHeight: 1.6, color: MUTED, margin: "8px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</p>
        ) : null}
        <div style={{ borderTop: "1px solid rgba(27,32,28,.08)", marginTop: 14, paddingTop: 14 }}>
          <div className="flex items-center justify-between gap-2">
            <span className="tnum" style={{ fontSize: 16, fontWeight: 600, color: ACCENT }}>{rupiah(p.price)}</span>
            <span className="tnum" style={{ fontSize: 12, color: out ? HABIS : closed ? MUTED : MUTED }}>
              {out ? "Slot penuh" : closed ? "" : `Sisa ${p.stock} slot`}
            </span>
          </div>
          {dead ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 48, borderRadius: 8, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600, background: out && !closed ? "transparent" : DEAD_BG, border: out && !closed ? "1px dashed rgba(27,32,28,.35)" : "none", color: HABIS }}>
                {closed ? "Toko tutup" : "Slot penuh"}
              </div>
              {!closed && out && (
                <button onClick={onChatWA} style={{ background: "none", border: "none", padding: "10px 0 0", width: "100%", fontSize: 13, color: MUTED, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
                  tanya daftar tunggu via WA
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onAdd(p)}
              aria-label={`Tambah ${p.name}`}
              style={{ marginTop: 12, width: "100%", height: 48, border: "none", borderRadius: 8, background: ACCENT, color: ON_ACCENT, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: BODY }}
            >
              Tambah ke keranjang
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function KonsultanTenang(p: ThemeStorefrontProps) {
  const {
    slug, storeName, city, bio, avatarUrl, coverUrl, closed,
    items, allItems, cats, cat, onCat, q, onQ, onResetFilter, loading,
    bioLinks, onOpenBioLink, openNow, todayHours, hourRows,
    showHours, showQR, showCart, cartCount, onAdd, onChatWA,
    qrData, onShare, shared,
  } = p;
  const canAdd = showCart && !closed;
  const [hoursOpen, setHoursOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement | null>(null);
  const dirty = q.trim() !== "" || cat !== "Semua";
  const nextOpen = closed ? nextOpenText(hourRows, todayHours) : null;

  return (
    <div style={{ background: BG, color: INK, fontFamily: BODY, fontSize: 14, lineHeight: 1.6, minHeight: "100vh" }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: BG }}>
        <div className="mx-auto flex max-w-[640px] items-center gap-2.5 px-6" style={{ height: 60 }}>
          <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full" style={{ boxShadow: "inset 0 0 0 1px rgba(47,93,80,.24)", background: ACCENT, color: ON_ACCENT, fontFamily: DISPLAY, fontSize: 15 }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : storeName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate" style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 16 }}>{storeName}</span>
            {city ? <span className="block truncate" style={{ fontSize: 12, color: MUTED }}>{city}</span> : null}
          </span>
          <span style={{ fontSize: 12, color: openNow === false || closed ? TUTUP : MUTED }}>
            <span aria-hidden style={{ display: "inline-block", width: 6, height: 6, borderRadius: 99, background: openNow === false || closed ? TUTUP : "#1F7A4D", marginRight: 5 }} />
            {openNow === false || closed ? "Tutup" : "Buka"}
          </span>
          {showQR && (
            <button
              onClick={() => qrRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              aria-label="QR toko"
              style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", color: INK, cursor: "pointer" }}
            >
              <Icon name="qr" size={19} />
            </button>
          )}
          <button onClick={onShare} aria-label="Bagikan" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", color: INK, cursor: "pointer" }}>
            <Icon name={shared ? "check" : "external"} size={19} />
          </button>
          {showCart && (
            <a href="#/cart" aria-label="Keranjang" className="flex items-center gap-1.5" style={{ height: 44, padding: "0 4px", color: INK, textDecoration: "none", fontSize: 13 }}>
              <Icon name="cart" size={18} />
              Keranjang ({cartCount})
            </a>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[640px] px-6" style={{ paddingBottom: 48 }}>
        {/* sampul + profil */}
        {coverUrl && <img src={coverUrl} alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block", borderRadius: 12 }} />}
        <div style={{ background: SURFACE, borderRadius: 12, padding: "20px 22px", marginTop: coverUrl ? -40 : 16, position: "relative", border: "1px solid rgba(27,32,28,.08)" }}>
          {bio ? (
            <p style={{ fontFamily: DISPLAY, fontSize: 16, lineHeight: 1.7, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>
          ) : (
            <p className="tnum" style={{ fontSize: 13.5, color: MUTED, margin: 0 }}>
              {[city, `${allItems.length} paket jasa`].filter(Boolean).join(" · ")}
            </p>
          )}
          {showHours && (
            <div className="tnum" style={{ fontSize: 12.5, color: openNow === false ? TUTUP : MUTED, marginTop: 10 }}>
              {openNow === false || closed ? "TUTUP" : ""} {todayHours}
              {hourRows.length > 0 && (
                <button onClick={() => setHoursOpen((o) => !o)} style={{ background: "none", border: "none", padding: "8px 0 8px 6px", fontSize: 12.5, color: ACCENT, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  rincian 7 hari
                </button>
              )}
            </div>
          )}
          {hoursOpen && hourRows.length > 0 && (
            <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
              {hourRows.map((h) => (
                <li key={h.day} className="tnum flex items-baseline justify-between gap-2" style={{ fontSize: 12.5, padding: "6px 0", borderTop: "1px solid rgba(27,32,28,.07)", fontWeight: h.text === todayHours ? 700 : 400 }}>
                  <span style={{ color: MUTED }}>{h.day}</span>
                  <span style={{ color: h.on ? INK : TUTUP }}>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* tautan */}
        {bioLinks.length > 0 && (
          <div style={{ marginTop: 18 }}>
            {bioLinks.map((l) => (
              <button key={l.id} onClick={() => onOpenBioLink(l)} className="flex w-full items-center gap-3 text-left" style={{ minHeight: 52, background: "none", border: "none", borderTop: "1px solid rgba(27,32,28,.08)", padding: "12px 0", cursor: "pointer", color: INK }}>
                <Icon name={iconForLink(l.icon)} size={18} />
                <span className="min-w-0 flex-1 truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>{l.label}</span>
                <span aria-hidden style={{ color: MUTED }}>→</span>
              </button>
            ))}
            <div aria-hidden style={{ borderTop: "1px solid rgba(27,32,28,.08)" }} />
          </div>
        )}

        {/* filter */}
        <div style={{ marginTop: 18 }}>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="cari paket…"
              aria-label="Cari paket"
              style={{ flex: 1, minWidth: 0, height: 48, background: "transparent", border: "none", borderBottom: "1px solid rgba(27,32,28,.25)", fontSize: 14, color: INK, outline: "none", fontFamily: BODY }}
            />
            {dirty && (
              <button onClick={onResetFilter} aria-label="Atur ulang" style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 17 }}>↺</button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1" style={{ marginTop: 8 }}>
            {cats.map((c, i) => (
              <span key={c} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden style={{ color: MUTED }}>·</span>}
                <button
                  onClick={() => onCat(c)}
                  style={{ background: "none", border: "none", padding: "10px 4px", fontSize: 13.5, color: cat === c ? ACCENT : MUTED, fontWeight: cat === c ? 700 : 400, cursor: "pointer" }}
                >
                  {c}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* katalog */}
        <main style={{ marginTop: 10, display: "grid", gap: 16 }}>
          {closed && (
            <div style={{ background: `${TUTUP}10`, border: `1px solid ${TUTUP}40`, borderRadius: 10, padding: "12px 14px", fontSize: 13.5 }}>
              Toko tutup{nextOpen ? ` — ${nextOpen}` : ""}.
            </div>
          )}
          {loading ? (
            [0, 1].map((i) => (
              <div key={i} style={{ background: SURFACE, borderRadius: 12, border: "1px solid rgba(27,32,28,.08)", padding: 18 }}>
                <div style={{ height: 17, background: "rgba(27,32,28,.08)", borderRadius: 4 }} />
                <div style={{ height: 13, width: "55%", background: "rgba(27,32,28,.07)", borderRadius: 4, marginTop: 12 }} />
              </div>
            ))
          ) : items.length === 0 ? (
            <div style={{ background: SURFACE, borderRadius: 12, border: "1px solid rgba(27,32,28,.12)", padding: "44px 22px", textAlign: "center" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 19 }}>
                {q || cat !== "Semua" ? `Tidak ada paket untuk “${q || cat}”` : "Belum ada paket yang dibuka. Klien akan melihat ini."}
              </div>
              {(q || cat !== "Semua") && (
                <button onClick={onResetFilter} style={{ background: "none", border: "none", marginTop: 12, fontSize: 13.5, color: ACCENT, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
                  Atur ulang
                </button>
              )}
            </div>
          ) : (
            items.map((item) => (
              <Card key={item.id} p={item} slug={slug} canAdd={canAdd} closed={closed} onAdd={onAdd} onChatWA={onChatWA} />
            ))
          )}
        </main>

        {/* QR tunggal */}
        {showQR && qrData && (
          <div ref={qrRef} style={{ width: 320, maxWidth: "100%", margin: "28px auto 0", background: SURFACE, border: "1px solid rgba(27,32,28,.1)", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <img src={qrData} alt={`QR ${storeName}`} width={168} height={168} style={{ width: 168, height: 168, display: "block", margin: "0 auto" }} />
            <div style={{ fontSize: 12.5, color: MUTED, marginTop: 10 }}>Pindai untuk membuka etalase ini di HP lain</div>
            <a href={qrData} download={`qr-${slug}.png`} style={{ display: "inline-block", marginTop: 12, background: ACCENT, color: ON_ACCENT, borderRadius: 8, padding: "11px 22px", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
              Unduh PNG
            </a>
          </div>
        )}

        <footer style={{ textAlign: "center", marginTop: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{storeName}{city ? ` · ${city}` : ""}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Dibuat dengan TokoLink</div>
        </footer>
      </div>
    </div>
  );
}
