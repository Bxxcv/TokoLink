import { useState } from "react";
import type { Theme } from "../data/themes";
import { rp } from "../data/themes";
import { Dot, Label, Monogram, Price, QrMark, Strip, Thumb, WaIcon, vars } from "./bits";

const hair = (t: Theme) => `1px solid ${t.tokens.line}`;

function BottomBar({ t, cart, add, text }: { t: Theme; cart: number; add: () => void; text?: string }) {
  return (
    <div className="flex items-center justify-between gap-3" style={{ background: t.tokens.ink, color: t.tokens.paper, padding: "14px 18px" }}>
      <span className="f-mono tnum" style={{ fontSize: 12.5 }}>{text ?? `${cart} item dipilih`}</span>
      <button onClick={add} className="foc tr" style={{ background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "12px 18px", fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
        Pesan · WhatsApp
      </button>
    </div>
  );
}

/* 01 */
function MEditorial({ t, cart, add }: { t: Theme; cart: number; add: () => void }) {
  const s = t.store;
  return (
    <div style={vars(t)}>
      <header className="px-5 pt-6 pb-4" style={{ borderBottom: hair(t) }}>
        <div className="flex items-center gap-3">
          <Monogram t={t} size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: t.tokens.display, fontWeight: 600, fontSize: 25, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{s.name}</div>
            <div className="f-mono" style={{ fontSize: 10, color: t.tokens.inkSoft, marginTop: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.handle}</div>
          </div>
          <span className="f-mono" style={{ marginLeft: "auto", fontSize: 10, color: t.tokens.inkSoft, textAlign: "right" }}>
            <span className="flex items-center gap-1.5 justify-end"><Dot t={t} /> Buka</span>
            <span className="tnum" style={{ display: "block", marginTop: 4 }}>{s.hours.split(" ")[0]}</span>
          </span>
        </div>
      </header>

      <div className="px-5 py-5" style={{ background: t.tokens.panel }}>
        <p style={{ fontFamily: t.tokens.display, fontSize: 19, lineHeight: 1.4 }}>{s.tagline}</p>
        <button onClick={add} className="foc h-ac tr flex items-center justify-center gap-2" style={{ width: "100%", marginTop: 14, background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "14px", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" }}>
          <WaIcon /> Chat WhatsApp
        </button>
        <div className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, marginTop: 12, lineHeight: 1.7 }}>{s.pickup}<br />{s.payment}</div>
      </div>

      <Strip t={t} h={132} />

      <nav className="flex gap-5 px-5 overflow-hidden" style={{ borderBottom: hair(t), marginTop: 4 }}>
        {s.cats.map((c, i) => (
          <button key={c} className="foc tr" style={{ background: "none", border: "none", padding: "14px 0 11px", fontSize: 10.5, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: i === 0 ? t.tokens.ink : t.tokens.inkSoft, borderBottom: `2px solid ${i === 0 ? t.tokens.accent : "transparent"}`, whiteSpace: "nowrap" }}>
            {c}
          </button>
        ))}
      </nav>

      <div className="px-5">
        {s.products.map((p) => (
          <button key={p.name} onClick={add} className="foc h-row tr w-full text-left grid items-baseline" style={{ gridTemplateColumns: "30px 1fr auto", gap: 12, padding: "16px 4px", borderBottom: hair(t), background: "transparent", borderLeft: "none", borderRight: "none", borderTop: "none" }}>
            <span className="f-mono tnum" style={{ fontSize: 11, color: t.tokens.accent }}>{p.code}</span>
            <span>
              <span style={{ fontFamily: t.tokens.display, fontSize: 17, fontWeight: 500, display: "block", lineHeight: 1.25 }}>{p.name}</span>
              <span style={{ fontSize: 12.5, color: t.tokens.inkSoft, display: "block", marginTop: 3 }}>{p.note}</span>
            </span>
            <Price t={t} v={p.price} size={14} />
          </button>
        ))}
      </div>

      <footer className="flex items-center justify-between px-5 py-4" style={{ marginTop: 8, borderTop: hair(t), background: t.tokens.panel }}>
        <span className="f-mono" style={{ fontSize: 10.5, color: t.tokens.inkSoft }}>{s.extra}</span>
        <QrMark t={t} size={30} />
      </footer>
      <BottomBar t={t} cart={cart} add={add} />
    </div>
  );
}

/* 02 */
function MDense({ t, cart, add }: { t: Theme; cart: number; add: () => void }) {
  const s = t.store;
  return (
    <div style={vars(t)}>
      <header className="px-4 pt-4 pb-3" style={{ background: t.tokens.panel, borderBottom: hair(t) }}>
        <div className="flex items-center gap-3">
          <Monogram t={t} size={38} />
          <div>
            <div style={{ fontFamily: t.tokens.display, fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.name}</div>
            <div className="f-mono" style={{ fontSize: 9.5, color: t.tokens.inkSoft, marginTop: 4 }}>{s.city}</div>
          </div>
          <button onClick={add} className="foc h-ac tr" style={{ marginLeft: "auto", background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "9px 11px", fontSize: 12, fontWeight: 700, borderRadius: 6 }}>
            ({cart})
          </button>
        </div>
        <div className="foc flex items-center gap-2" style={{ border: hair(t), borderRadius: 6, padding: "10px 12px", marginTop: 12, color: t.tokens.inkSoft, background: t.tokens.paper, fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          Cari barang…
        </div>
        <div className="flex gap-2" style={{ marginTop: 10, overflow: "hidden" }}>
          {s.cats.map((c, i) => (
            <button key={c} className="foc tr" style={{ fontSize: 11.5, fontWeight: 700, padding: "7px 12px", borderRadius: 6, border: hair(t), background: i === 0 ? t.tokens.accent : "transparent", color: i === 0 ? t.tokens.accentInk : t.tokens.ink, whiteSpace: "nowrap" }}>
              {c}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-3" style={{ background: t.tokens.accent, color: t.tokens.accentInk, fontSize: 12, fontWeight: 600 }}>{s.extra}</div>

      <div className="grid grid-cols-2 gap-3 px-4 pt-4 pb-5">
        {s.products.slice(0, 6).map((p, i) => (
          <article key={p.name} className="foc h-card tr" style={{ background: t.tokens.panel, border: hair(t), borderRadius: t.tokens.radius, overflow: "hidden", boxShadow: t.tokens.shadow }}>
            <Thumb t={t} i={i} style={{ aspectRatio: "1 / 1", width: "100%" }} />
            <div style={{ padding: "9px 10px 11px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25, minHeight: 33 }}>{p.name}</div>
              <div style={{ fontSize: 10.5, color: t.tokens.inkSoft, marginTop: 3 }}>{p.note}</div>
              <div className="flex items-end justify-between" style={{ marginTop: 8 }}>
                <Price t={t} v={p.price} size={16} weight={600} color={t.tokens.accent} />
                <button onClick={add} className="foc h-plus tr" aria-label={`Tambah ${p.name}`} style={{ width: 27, height: 27, borderRadius: 6, border: hair(t), background: t.tokens.ink, color: t.tokens.paper, fontSize: 16, lineHeight: 1 }}>+</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="grid grid-cols-2 gap-4 px-4 py-4" style={{ background: t.tokens.panel, borderTop: hair(t) }}>
        {[["Jam buka", s.hours], ["Pembayaran", s.payment]].map(([k, v]) => (
          <div key={k}>
            <Label t={t}>{k}</Label>
            <div className="f-mono" style={{ fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>{v}</div>
          </div>
        ))}
      </footer>
      <BottomBar t={t} cart={cart} add={add} text={`${cart} barang · ${rp(s.products[0].price * Math.max(cart, 1))}`} />
    </div>
  );
}

/* 03 */
function MList({ t, cart, add }: { t: Theme; cart: number; add: () => void }) {
  const s = t.store;
  return (
    <div style={vars(t)}>
      <header className="px-5 pt-6 pb-4" style={{ borderBottom: `2px solid ${t.tokens.ink}` }}>
        <div className="flex items-center gap-3">
          <Monogram t={t} size={40} />
          <div>
            <div style={{ fontFamily: t.tokens.display, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{s.name}</div>
            <div className="f-mono" style={{ fontSize: 10, color: t.tokens.inkSoft, marginTop: 5 }}>{s.city}</div>
          </div>
        </div>
        <div className="f-mono flex items-center justify-between" style={{ fontSize: 11, marginTop: 14 }}>
          <span className="flex items-center gap-2"><Dot t={t} /> {s.hours}</span>
          <span style={{ color: t.tokens.inkSoft }}>{s.wa}</span>
        </div>
      </header>

      <div className="flex gap-2 px-5 py-3 overflow-hidden" style={{ borderBottom: hair(t) }}>
        {s.cats.map((c, i) => (
          <button key={c} className="foc tr" style={{ fontSize: 11.5, fontWeight: 600, padding: "8px 12px", border: hair(t), background: i === 0 ? t.tokens.accent : "transparent", color: i === 0 ? t.tokens.accentInk : t.tokens.ink, whiteSpace: "nowrap" }}>
            {c}
          </button>
        ))}
      </div>

      <div className="px-5">
        {s.products.map((p) => (
          <div key={p.code} className="foc h-row tr" style={{ padding: "15px 2px", borderBottom: hair(t) }}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="f-mono" style={{ fontSize: 11, color: t.tokens.accent }}>{p.code}</span>
              <span className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft }}>{p.note?.split(" · ")[0]}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>{p.name}</div>
            <div className="flex items-center justify-between gap-3" style={{ marginTop: 8 }}>
              <Price t={t} v={p.price} size={16} weight={600} />
              <button onClick={add} className="foc h-out tr" style={{ border: hair(t), background: "transparent", color: t.tokens.ink, padding: "9px 20px", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
                Pilih
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-5 mt-5" style={{ background: t.tokens.panel, border: hair(t), padding: "16px 16px" }}>
        <Label t={t}>Slot hari ini</Label>
        <div className="flex gap-2" style={{ marginTop: 10 }}>
          {["09.00", "13.00", "16.00", "18.30"].map((h, i) => (
            <button key={h} className="foc tr" style={{ flex: 1, padding: "10px 0", fontSize: 12.5, fontFamily: t.tokens.mono, border: hair(t), background: i === 1 ? t.tokens.accent : t.tokens.paper, color: i === 1 ? t.tokens.accentInk : i === 3 ? t.tokens.inkSoft : t.tokens.ink, textDecoration: i === 3 ? "line-through" : "none" }}>
              {h}
            </button>
          ))}
        </div>
        <div className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, marginTop: 12, lineHeight: 1.6 }}>{s.extra}</div>
      </div>

      <footer className="f-mono px-5 py-4" style={{ fontSize: 10.5, color: t.tokens.inkSoft, lineHeight: 1.7 }}>
        Garansi pekerjaan 14 hari<br />{s.pickup} · {s.payment}
      </footer>
      <BottomBar t={t} cart={cart} add={add} text={`${cart} layanan dipilih`} />
    </div>
  );
}

/* 04 */
function MGallery({ t, cart, add }: { t: Theme; cart: number; add: () => void }) {
  const s = t.store;
  return (
    <div style={vars(t)}>
      <header className="px-6 pt-8 pb-5">
        <Label t={t} style={{ color: t.tokens.accent }}>TokoLink · Atelier</Label>
        <h1 style={{ fontFamily: t.tokens.display, fontSize: 46, fontWeight: 400, lineHeight: 1, margin: "12px 0 0" }}>{s.name}</h1>
        <div className="f-mono" style={{ fontSize: 10.5, color: t.tokens.inkSoft, marginTop: 12, lineHeight: 1.7 }}>{s.city}<br />{s.hours}</div>
        <div className="flex items-center justify-between" style={{ borderTop: hair(t), marginTop: 16, paddingTop: 11 }}>
          <Label t={t}>01 — Kemarau</Label>
          <button onClick={add} className="foc h-link tr" style={{ background: "none", border: "none", padding: 0, fontSize: 10, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: t.tokens.accent }}>
            Tanya ketersediaan
          </button>
        </div>
      </header>

      <div className="px-6 grid gap-8 pb-8">
        {s.products.slice(0, 4).map((p, i) => (
          <figure key={p.name} style={{ marginLeft: i % 2 ? 26 : 0 }}>
            <Thumb t={t} i={i} style={{ aspectRatio: "4 / 5", width: "100%" }} />
            <figcaption style={{ borderTop: hair(t), marginTop: 11, paddingTop: 10 }}>
              <div className="flex items-baseline justify-between gap-3">
                <span style={{ fontSize: 15, fontWeight: 500 }}>{p.name}</span>
                <Price t={t} v={p.price} size={14} weight={600} />
              </div>
              <Label t={t} style={{ fontSize: 9, marginTop: 6 }}>{p.note}</Label>
            </figcaption>
          </figure>
        ))}
      </div>

      <footer className="px-6 py-6" style={{ background: t.tokens.panel, borderTop: hair(t) }}>
        <Label t={t}>Pengambilan</Label>
        <div style={{ fontFamily: t.tokens.display, fontSize: 19, marginTop: 8, lineHeight: 1.35 }}>Selasa &amp; Jumat, 10.00–19.00</div>
        <div className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, marginTop: 10 }}>Keranjang <span className="tnum">{cart}</span> potong · {s.payment}</div>
      </footer>
      <BottomBar t={t} cart={cart} add={add} />
    </div>
  );
}

/* 05 */
function MMenu({ t, cart, add }: { t: Theme; cart: number; add: () => void }) {
  const s = t.store;
  const total = s.products.filter((p) => !p.sold).slice(0, Math.max(cart, 2)).reduce((a, b) => a + b.price, 0);
  return (
    <div style={vars(t)}>
      <header className="px-5 pt-7 pb-5" style={{ borderBottom: `3px solid ${t.tokens.ink}` }}>
        <h1 style={{ fontFamily: t.tokens.display, fontWeight: 700, fontSize: 40, letterSpacing: "-0.03em", lineHeight: 0.95, margin: 0 }}>{s.name}</h1>
        <div className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, marginTop: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>{s.tagline}</div>
        <div className="f-mono flex items-center gap-2" style={{ fontSize: 11, marginTop: 10, color: t.tokens.ok, textTransform: "uppercase", letterSpacing: ".1em" }}><Dot t={t} /> {s.hours}</div>
      </header>

      <div className="flex gap-2 px-5 py-3 overflow-hidden" style={{ borderBottom: hair(t) }}>
        {s.cats.map((c, i) => (
          <button key={c} className="foc tr" style={{ fontSize: 11.5, fontWeight: 700, padding: "7px 13px", border: `2px solid ${i === 0 ? t.tokens.accent : t.tokens.line}`, background: i === 0 ? t.tokens.accent : "transparent", color: i === 0 ? t.tokens.accentInk : t.tokens.ink, whiteSpace: "nowrap" }}>
            {c}
          </button>
        ))}
      </div>

      <div className="px-5">
        {s.products.map((p, i) => (
          <button key={p.name} onClick={add} className="foc h-row tr w-full text-left flex items-end gap-3" style={{ padding: "15px 3px", borderBottom: hair(t), background: "transparent", borderLeft: "none", borderRight: "none", borderTop: "none", opacity: p.sold ? 0.45 : 1 }}>
            <Thumb t={t} i={i} style={{ width: 54, height: 54, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: t.tokens.display, fontSize: 17, fontWeight: 600, display: "block", lineHeight: 1.2 }}>{p.name}</span>
              <span style={{ fontSize: 12, color: t.tokens.inkSoft, display: "block", marginTop: 3 }}>{p.note}</span>
            </span>
            <span className="f-mono tnum" style={{ fontSize: 15.5, fontWeight: 600, color: t.tokens.accent }}>{rp(p.price)}</span>
            {p.sold && (
              <span style={{ position: "relative", width: 0 }}>
                <span style={{ position: "absolute", right: -4, top: -30, whiteSpace: "nowrap", border: `2px solid ${t.tokens.accent}`, color: t.tokens.accent, fontSize: 10, fontWeight: 800, letterSpacing: ".12em", padding: "2px 6px", transform: "rotate(-7deg)", background: t.tokens.paper }}>
                  HABIS
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-5 py-4" style={{ background: t.tokens.panel, borderTop: hair(t), marginTop: 8 }}>
        <Label t={t}>Pengambilan &amp; kirim</Label>
        <div style={{ fontSize: 13, marginTop: 7, lineHeight: 1.55 }}>{s.pickup}</div>
        <div className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, marginTop: 8 }}>{s.payment} · {s.extra}</div>
      </div>
      <BottomBar t={t} cart={cart} add={add} text={`${cart} item · ${rp(total)}`} />
    </div>
  );
}

/* 06 */
function MMasonry({ t, cart, add }: { t: Theme; cart: number; add: () => void }) {
  const s = t.store;
  const hs = [210, 150, 150, 210, 165];
  return (
    <div style={vars(t)}>
      <header className="px-5 pt-6 pb-4" style={{ borderBottom: hair(t) }}>
        <div className="flex items-center gap-3">
          <Monogram t={t} size={40} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: t.tokens.display, fontWeight: 500, fontSize: 27, letterSpacing: "-0.015em", lineHeight: 1.05 }}>{s.name}</div>
            <div className="f-mono" style={{ fontSize: 10, color: t.tokens.inkSoft, marginTop: 6 }}>{s.city}</div>
          </div>
          <button onClick={add} className="foc h-ac tr" style={{ marginLeft: "auto", background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "10px 12px", fontSize: 11, fontWeight: 700 }}>
            <span className="tnum">{cart}</span>
          </button>
        </div>
        <div className="f-mono flex items-center gap-2" style={{ fontSize: 10.5, color: t.tokens.inkSoft, marginTop: 12, textTransform: "uppercase", letterSpacing: ".08em" }}><Dot t={t} /> {s.hours}</div>
      </header>

      <div className="flex gap-5 px-5 py-3 overflow-hidden" style={{ borderBottom: hair(t) }}>
        {s.cats.map((c, i) => (
          <span key={c} style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: i === 0 ? t.tokens.accent : t.tokens.inkSoft, whiteSpace: "nowrap", borderBottom: i === 0 ? `2px solid ${t.tokens.accent}` : "none", paddingBottom: 4 }}>
            {c}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 px-5 pt-5 pb-6">
        {s.products.slice(0, 5).map((p, i) => (
          <figure key={p.name} style={{ gridColumn: i === 0 ? "span 2" : undefined, marginLeft: i % 2 ? 20 : 0 }}>
            <Thumb t={t} i={i} style={{ height: hs[i], width: "100%" }} />
            <figcaption style={{ borderTop: hair(t), marginTop: 9, paddingTop: 8, display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
              <span>
                <span style={{ fontFamily: t.tokens.display, fontSize: 17, fontWeight: 500, display: "block", lineHeight: 1.2 }}>{p.name}</span>
                <span className="f-mono" style={{ fontSize: 10, color: t.tokens.inkSoft, display: "block", marginTop: 4 }}>{p.note}</span>
              </span>
              <button onClick={add} className="foc h-link tr f-mono tnum" style={{ background: "none", border: "none", fontSize: 13, color: t.tokens.accent, whiteSpace: "nowrap" }}>{rp(p.price)}</button>
            </figcaption>
          </figure>
        ))}
        <div className="col-span-2" style={{ background: t.tokens.panel, border: hair(t), padding: "18px 18px" }}>
          <Label t={t} style={{ color: t.tokens.accent }}>Cerita bengkel</Label>
          <p style={{ fontFamily: t.tokens.display, fontSize: 17, lineHeight: 1.45, marginTop: 9 }}>Dicetak tangan di Plered, dijemur empat hari, dibakar tungku kayu dua kali seminggu.</p>
        </div>
      </div>

      <footer className="f-mono px-5 py-4" style={{ fontSize: 10.5, color: t.tokens.inkSoft, borderTop: hair(t), lineHeight: 1.7 }}>
        {s.extra}<br />{s.payment}
      </footer>
      <BottomBar t={t} cart={cart} add={add} />
    </div>
  );
}

/* 07 */
function MDark({ t, cart, add }: { t: Theme; cart: number; add: () => void }) {
  const s = t.store;
  const total = s.products.slice(0, Math.max(cart, 1)).reduce((a, b) => a + b.price, 0);
  return (
    <div style={vars(t)}>
      <header className="px-5 pt-6 pb-4" style={{ borderBottom: hair(t) }}>
        <div className="flex items-center gap-3">
          <Monogram t={t} size={38} />
          <div>
            <div style={{ fontFamily: t.tokens.display, fontWeight: 600, fontSize: 24, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.name}</div>
            <div className="f-mono" style={{ fontSize: 9.5, color: t.tokens.inkSoft, marginTop: 5, letterSpacing: ".06em" }}>{s.handle}</div>
          </div>
          <button onClick={add} className="foc h-ac tr" style={{ marginLeft: "auto", background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "9px 11px", fontSize: 11.5, fontWeight: 600, borderRadius: 6 }}>
            <span className="tnum">{cart}</span>
          </button>
        </div>
        <div className="flex gap-5" style={{ marginTop: 14 }}>
          {s.cats.map((c, i) => (
            <span key={c} className="f-mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: i === 0 ? t.tokens.accent : t.tokens.inkSoft, borderTop: `2px solid ${i === 0 ? t.tokens.accent : "transparent"}`, paddingTop: 8, whiteSpace: "nowrap" }}>
              {c}
            </span>
          ))}
        </div>
      </header>

      <div className="px-5 py-4 grid gap-3">
        {s.products.slice(0, 4).map((p, i) => (
          <article key={p.name} className="foc h-card tr" style={{ background: t.tokens.panel, border: hair(t), borderRadius: t.tokens.radius, overflow: "hidden", boxShadow: t.tokens.shadow }}>
            <Thumb t={t} i={i} style={{ aspectRatio: "16 / 9", width: "100%" }} />
            <div style={{ padding: "12px 13px 14px" }}>
              <div className="f-mono" style={{ fontSize: 9.5, color: t.tokens.accent, letterSpacing: ".1em" }}>{p.code} · {p.badge ?? "rilis"}</div>
              <div style={{ fontFamily: t.tokens.display, fontSize: 16, fontWeight: 500, marginTop: 6 }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: t.tokens.inkSoft, marginTop: 4 }}>{p.note}</div>
              <div className="f-mono flex justify-between" style={{ fontSize: 10, color: t.tokens.inkSoft, borderTop: hair(t), marginTop: 11, paddingTop: 9, letterSpacing: ".08em" }}>
                <span>FORMAT ZIP</span><span style={{ color: t.tokens.ink }}>LISENSI KOMERSIAL</span>
              </div>
              <div className="flex items-center justify-between" style={{ marginTop: 11 }}>
                <span className="f-mono tnum" style={{ fontSize: 18, fontWeight: 600, color: t.tokens.accent }}>{rp(p.price)}</span>
                <button onClick={add} className="foc h-ac tr" style={{ background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "10px 20px", fontSize: 11.5, fontWeight: 600, borderRadius: 6 }}>Beli</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-5 mb-5" style={{ background: t.tokens.panel, border: hair(t), borderRadius: t.tokens.radius, padding: 16 }}>
        <div className="flex justify-between items-baseline">
          <span className="f-mono" style={{ fontSize: 10, letterSpacing: ".14em", color: t.tokens.inkSoft }}>TOTAL</span>
          <span className="f-mono tnum" style={{ fontSize: 20, fontWeight: 600 }}>{rp(total)}</span>
        </div>
        <button onClick={add} className="foc h-ac tr" style={{ width: "100%", marginTop: 12, background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "13px 0", fontSize: 12, fontWeight: 600, borderRadius: 6 }}>Bayar dengan QRIS</button>
        <div className="f-mono" style={{ fontSize: 10, color: t.tokens.inkSoft, marginTop: 11, lineHeight: 1.7 }}>{s.extra}<br />{s.wa}</div>
      </div>
    </div>
  );
}

/* 08 */
function MCalm({ t, cart, add }: { t: Theme; cart: number; add: () => void }) {
  const s = t.store;
  return (
    <div style={vars(t)}>
      <header className="px-6 pt-9 pb-6">
        <div className="flex items-center justify-between">
          <Label t={t} style={{ color: t.tokens.accent }}>{s.name}</Label>
          <span className="f-mono flex items-center gap-2" style={{ fontSize: 10, color: t.tokens.inkSoft, textTransform: "uppercase", letterSpacing: ".1em" }}><Dot t={t} /> Buka</span>
        </div>
        <h1 style={{ fontFamily: t.tokens.display, fontSize: 37, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.12, margin: "22px 0 0" }}>
          Pendampingan yang membuat bisnis kecil berjalan lebih tenang.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: t.tokens.inkSoft, marginTop: 16 }}>{s.tagline}.</p>
        <button onClick={add} className="foc h-ac tr" style={{ width: "100%", marginTop: 22, background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "16px 0", fontSize: 11, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase" }}>
          Ajukan janji temu
        </button>
        <a href="#/" className="foc h-link tr" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: 11, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: t.tokens.ink, borderBottom: `1px solid ${t.tokens.ink}`, paddingBottom: 6, textDecoration: "none" }}>
          Kirim pesan WhatsApp
        </a>
      </header>

      <Strip t={t} h={190} />

      <div className="px-6" style={{ paddingTop: 26 }}>
        {[["01", "Pahami", "Audit singkat proses yang berjalan hari ini."], ["02", "Susun", "Prioritas, pemilik tugas, dan ukuran keberhasilan."], ["03", "Dampingi", "Tinjauan dua mingguan selama satu kuartal."]].map(([n, h, d]) => (
          <div key={n} style={{ borderTop: hair(t), padding: "18px 0" }}>
            <span className="f-mono" style={{ fontSize: 11, color: t.tokens.accent }}>{n}</span>
            <div style={{ fontFamily: t.tokens.display, fontSize: 23, marginTop: 7 }}>{h}</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: t.tokens.inkSoft, marginTop: 6 }}>{d}</p>
          </div>
        ))}
      </div>

      <div className="px-6">
        <Label t={t} style={{ marginBottom: 4 }}>Penawaran</Label>
        {s.products.map((p) => (
          <div key={p.name} className="foc h-row tr" style={{ borderTop: hair(t), padding: "20px 8px" }}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 style={{ fontFamily: t.tokens.display, fontSize: 23, fontWeight: 400, lineHeight: 1.25 }}>{p.name}</h2>
              <Price t={t} v={p.price} size={16} weight={600} color={t.tokens.accent} />
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: t.tokens.inkSoft, marginTop: 7 }}>{p.note}</p>
            <button onClick={add} className="foc" style={{ background: "none", border: "none", padding: "9px 0 0", fontSize: 14, color: t.tokens.ink, borderBottom: `1px solid ${t.tokens.ink}` }}>Pilih layanan →</button>
          </div>
        ))}
      </div>

      <div className="px-6 py-6" style={{ marginTop: 20, background: t.tokens.panel, borderTop: hair(t) }}>
        <Label t={t}>Slot janji temu</Label>
        <div className="grid gap-2" style={{ marginTop: 12 }}>
          {[["Sel, 20 Mei", "10.00"], ["Rab, 21 Mei", "13.30"], ["Kam, 22 Mei", "09.00"]].map(([d, h], i) => (
            <button key={d} className="foc tr flex items-center justify-between" style={{ padding: "13px 14px", border: hair(t), background: i === 0 ? t.tokens.accent : t.tokens.paper, color: i === 0 ? t.tokens.accentInk : t.tokens.ink }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{d}</span>
              <span className="f-mono tnum" style={{ fontSize: 12.5 }}>{h} WIB</span>
            </button>
          ))}
        </div>
        <div className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, marginTop: 14, lineHeight: 1.7 }}>
          Keranjang <span className="tnum">{cart}</span> layanan · {s.payment}
        </div>
      </div>
      <p style={{ fontFamily: t.tokens.display, fontStyle: "italic", fontSize: 19, lineHeight: 1.6, padding: "26px 24px 44px" }}>
        “Tiga bulan bersama Studio Tenang dan laporan kami selesai sebelum tanggal 5.” — Rina, katering 12 karyawan
      </p>
    </div>
  );
}

export function Mobile({ t }: { t: Theme }) {
  const [cart, setCart] = useState(2);
  const add = () => setCart((c) => c + 1);
  const p = { t, cart, add };
  switch (t.layout) {
    case "editorial":
      return <MEditorial {...p} />;
    case "dense":
      return <MDense {...p} />;
    case "list":
      return <MList {...p} />;
    case "gallery":
      return <MGallery {...p} />;
    case "menu":
      return <MMenu {...p} />;
    case "masonry":
      return <MMasonry {...p} />;
    case "dark":
      return <MDark {...p} />;
    default:
      return <MCalm {...p} />;
  }
}
