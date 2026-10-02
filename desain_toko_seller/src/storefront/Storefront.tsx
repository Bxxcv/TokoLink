import { useState } from "react";
import type { Theme } from "../data/themes";
import { rp } from "../data/themes";
import { Dot, Label, Monogram, Price, QrMark, Strip, Thumb, WaIcon, vars } from "./bits";

export type P = { t: Theme; cart: number; add: () => void };

const hair = (t: Theme) => `1px solid ${t.tokens.line}`;

/* ── 01 · Ruang Seduh — editorial ledger ─────────────────────────── */
function Editorial({ t, cart, add }: P) {
  const s = t.store;
  return (
    <div style={vars(t)}>
      <header className="flex items-end justify-between px-10 pt-9 pb-5" style={{ borderBottom: hair(t) }}>
        <div className="flex items-end gap-4">
          <Monogram t={t} size={54} />
          <div>
            <div style={{ fontFamily: t.tokens.display, fontWeight: 600, fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1 }}>
              {s.name}
            </div>
            <div className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, marginTop: 8 }}>
              {s.handle} · {s.city}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="f-mono flex items-center gap-2" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: t.tokens.inkSoft }}>
            <Dot t={t} /> Buka · {s.hours}
          </span>
          <button className="foc h-out tr" style={{ border: hair(t), padding: "9px 13px", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600, background: "transparent", color: "inherit" }}>
            QRIS
          </button>
          <button className="foc h-ac tr" onClick={add} style={{ background: t.tokens.ink, color: t.tokens.paper, padding: "10px 15px", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600, border: "none" }}>
            Keranjang · <span className="tnum">{cart}</span>
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="shrink-0" style={{ width: 356, borderRight: hair(t), padding: "34px 32px" }}>
          <Label t={t}>Tentang</Label>
          <p style={{ fontFamily: t.tokens.display, fontSize: 23, fontWeight: 400, lineHeight: 1.35, margin: "12px 0 22px", letterSpacing: "-0.01em" }}>{s.tagline}</p>
          <div style={{ borderTop: hair(t), padding: "16px 0" }}>
            <Label t={t}>Jam buka</Label>
            <div className="f-mono tnum" style={{ fontSize: 13, marginTop: 8 }}>{s.hours}</div>
            <div style={{ fontSize: 13, color: t.tokens.inkSoft, marginTop: 4 }}>{s.open ? "Status hari ini: buka" : "Tutup hari ini"}</div>
          </div>
          <button className="foc h-ac tr flex items-center justify-center gap-2" onClick={add} style={{ width: "100%", background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "14px", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", marginTop: 6 }}>
            <WaIcon /> Chat WhatsApp
          </button>
          <dl className="f-mono" style={{ fontSize: 12, marginTop: 22, color: t.tokens.inkSoft }}>
            {[["Pengambilan", s.pickup], ["Pembayaran", s.payment], ["Catatan", s.extra]].map(([k, v]) => (
              <div key={k} style={{ borderTop: hair(t), padding: "12px 0" }}>
                <dt style={{ textTransform: "uppercase", letterSpacing: ".14em", fontSize: 9, color: t.tokens.inkSoft }}>{k}</dt>
                <dd style={{ color: t.tokens.ink, marginTop: 5, lineHeight: 1.5 }}>{v}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <main className="flex-1" style={{ padding: "30px 40px 44px" }}>
          <Strip t={t} h={188} />
          <p style={{ fontFamily: t.tokens.display, fontStyle: "italic", fontSize: 20, lineHeight: 1.4, margin: "22px 0 4px", maxWidth: 640 }}>
            “Disangrai dalam batch kecil, diseduh paling lambat dua minggu setelah tanggal sangrai.”
          </p>
          <nav className="flex gap-7" style={{ marginTop: 26, borderBottom: hair(t) }}>
            {s.cats.map((c, i) => (
              <button key={c} className="foc tr" style={{ background: "none", border: "none", padding: "0 0 12px", marginBottom: -1, fontFamily: t.tokens.body, fontSize: 11, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: i === 0 ? t.tokens.ink : t.tokens.inkSoft, borderBottom: `2px solid ${i === 0 ? t.tokens.accent : "transparent"}` }}>
                {c}
              </button>
            ))}
            <span className="f-mono" style={{ marginLeft: "auto", fontSize: 11, color: t.tokens.inkSoft, paddingBottom: 12 }}>{s.products.length} item</span>
          </nav>

          <div>
            {s.products.map((p) => (
              <button key={p.name} onClick={add} className="foc h-row tr grid w-full text-left items-baseline" style={{ gridTemplateColumns: "44px 1fr auto", gap: 20, padding: "21px 8px", borderTop: i0(t), borderBottom: "none", background: "transparent", borderLeft: "none", borderRight: "none", cursor: "pointer" }}>
                <span className="f-mono tnum" style={{ fontSize: 12, color: t.tokens.accent }}>{p.code}</span>
                <span>
                  <span className="inline-flex items-center gap-3">
                    <span style={{ fontFamily: t.tokens.display, fontSize: 21, fontWeight: 500, letterSpacing: "-0.01em" }}>{p.name}</span>
                    {p.badge && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: t.tokens.accent, border: `1px solid ${t.tokens.accent}`, padding: "2px 6px" }}>{p.badge}</span>}
                  </span>
                  <span style={{ display: "block", fontSize: 14, color: t.tokens.inkSoft, marginTop: 5 }}>{p.note}</span>
                </span>
                <span className="text-right" style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                  <Price t={t} v={p.price} size={16} weight={500} />
                  <span style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600, color: t.tokens.accent }}>Tambah +</span>
                </span>
              </button>
            ))}
          </div>
        </main>
      </div>

      <footer className="flex items-center justify-between px-10 py-5" style={{ borderTop: hair(t), background: t.tokens.panel }}>
        <span className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft }}>{s.extra}</span>
        <span className="flex items-center gap-4">
          <QrMark t={t} size={34} />
          <span className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft }}>Pindai untuk bayar · {s.payment}</span>
        </span>
      </footer>
    </div>
  );
}
const i0 = (t: Theme) => hair(t);

/* ── 02 · Pasar Rapi — katalog padat ─────────────────────────────── */
function Dense({ t, cart, add }: P) {
  const s = t.store;
  return (
    <div style={vars(t)}>
      <header className="px-6 pt-5 pb-4" style={{ background: t.tokens.panel, borderBottom: hair(t) }}>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Monogram t={t} size={42} />
            <div>
              <div style={{ fontFamily: t.tokens.display, fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.name}</div>
              <div className="f-mono" style={{ fontSize: 10.5, color: t.tokens.inkSoft, marginTop: 5 }}>{s.handle} · {s.city}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="foc flex items-center gap-2" style={{ border: hair(t), borderRadius: 6, padding: "9px 12px", width: 300, color: t.tokens.inkSoft, background: t.tokens.paper }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <span style={{ fontSize: 13 }}>Cari barang…</span>
            </div>
            <span className="f-mono flex items-center gap-2" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".08em", color: t.tokens.inkSoft }}><Dot t={t} /> {s.hours}</span>
            <button className="foc h-ac tr" onClick={add} style={{ background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "11px 15px", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", borderRadius: 6 }}>
              Keranjang ({cart})
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-hidden" style={{ marginTop: 16 }}>
          {s.cats.map((c, i) => (
            <button key={c} className="foc tr" style={{ fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 6, border: hair(t), background: i === 0 ? t.tokens.accent : "transparent", color: i === 0 ? t.tokens.accentInk : t.tokens.ink }}>
              {c}
            </button>
          ))}
          <span className="f-mono" style={{ marginLeft: "auto", fontSize: 11, color: t.tokens.inkSoft, alignSelf: "center" }}>{s.products.length} barang · stok hari ini</span>
        </div>
      </header>

      <div className="px-6 py-4" style={{ background: t.tokens.accent, color: t.tokens.accentInk }}>
        <div className="flex items-center justify-between" style={{ fontSize: 13, fontWeight: 600 }}>
          <span>{s.extra}</span>
          <span className="f-mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>Pengiriman radius 3 km · setiap hari</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 px-6 pt-5 pb-6">
        {s.products.map((p, i) => (
          <article key={p.name} className="foc h-card tr" style={{ background: t.tokens.panel, border: hair(t), borderRadius: t.tokens.radius, overflow: "hidden", boxShadow: t.tokens.shadow }}>
            <div className="relative">
              <Thumb t={t} i={i} style={{ aspectRatio: "1 / 1", width: "100%" }} />
              {p.badge && (
                <span style={{ position: "absolute", top: 8, left: 8, background: p.badge.startsWith("-") ? "#E4572E" : t.tokens.accent, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: ".06em", padding: "3px 7px", borderRadius: 3 }}>
                  {p.badge}
                </span>
              )}
            </div>
            <div style={{ padding: "11px 12px 13px" }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em", minHeight: 36 }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: t.tokens.inkSoft, marginTop: 4 }}>{p.note}</div>
              <div className="flex items-end justify-between" style={{ marginTop: 10 }}>
                <Price t={t} v={p.price} size={19} weight={600} color={t.tokens.accent} />
                <button onClick={add} aria-label={`Tambah ${p.name}`} className="foc h-plus tr" style={{ width: 30, height: 30, borderRadius: 6, border: hair(t), background: t.tokens.ink, color: t.tokens.paper, fontSize: 17, lineHeight: 1, cursor: "pointer" }}>
                  +
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="grid grid-cols-4 gap-6 px-6 py-5" style={{ background: t.tokens.panel, borderTop: hair(t) }}>
        {[["Jam buka", s.hours], ["Pengambilan", s.pickup], ["Pembayaran", s.payment]].map(([k, v]) => (
          <div key={k}>
            <Label t={t}>{k}</Label>
            <div className="f-mono" style={{ fontSize: 12, marginTop: 7, lineHeight: 1.5, color: t.tokens.ink }}>{v}</div>
          </div>
        ))}
        <div className="flex items-start gap-3">
          <QrMark t={t} size={46} />
          <div>
            <Label t={t}>Pindai &amp; chat</Label>
            <div className="f-mono" style={{ fontSize: 12, marginTop: 7, lineHeight: 1.5, color: t.tokens.ink }}>
              QRIS aktif
              <br />
              {s.wa}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── 03 · Lugas Jasa — tabel layanan ─────────────────────────────── */
function ListLayout({ t, cart, add }: P) {
  const s = t.store;
  const counts = s.products.map((_, i) => [3, 2, 4, 3][i] ?? 3);
  return (
    <div style={vars(t)}>
      <header className="flex items-center justify-between px-8 pt-7 pb-5" style={{ borderBottom: `2px solid ${t.tokens.ink}` }}>
        <div className="flex items-center gap-4">
          <Monogram t={t} size={46} />
          <div>
            <div style={{ fontFamily: t.tokens.display, fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.name}</div>
            <div className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, marginTop: 6, letterSpacing: ".04em" }}>{s.handle} · {s.city}</div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <span className="f-mono flex items-center gap-2" style={{ fontSize: 11.5, color: t.tokens.ink }}><Dot t={t} /> {s.hours}</span>
          <button className="foc h-ac tr flex items-center gap-2" onClick={add} style={{ background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "13px 18px", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
            <WaIcon /> Panggil teknisi
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="shrink-0" style={{ width: 264, borderRight: hair(t), padding: "26px 0 26px 0" }}>
          <Label t={t} style={{ padding: "0 22px 12px" }}>Kategori layanan</Label>
          {s.cats.map((c, i) => (
            <button key={c} className="foc tr flex items-center justify-between w-full text-left" style={{ padding: "12px 22px", border: "none", borderLeft: `3px solid ${i === 0 ? t.tokens.accent : "transparent"}`, background: i === 0 ? t.tokens.accent : "transparent", color: i === 0 ? t.tokens.accentInk : t.tokens.ink, fontSize: 13.5, fontWeight: i === 0 ? 600 : 400, cursor: "pointer" }}>
              {c}
              <span className="f-mono tnum" style={{ fontSize: 11, opacity: 0.7 }}>{counts[i] ?? 3}</span>
            </button>
          ))}
          <div style={{ margin: "22px 22px 0", borderTop: hair(t), paddingTop: 16 }}>
            <Label t={t}>Ketentuan</Label>
            <p className="f-mono" style={{ fontSize: 11.5, color: t.tokens.inkSoft, marginTop: 8, lineHeight: 1.6 }}>{s.extra}</p>
            <p className="f-mono" style={{ fontSize: 11.5, color: t.tokens.inkSoft, marginTop: 10, lineHeight: 1.6 }}>{s.payment}</p>
          </div>
        </aside>

        <main className="flex-1" style={{ padding: "26px 32px 34px" }}>
          <div className="grid items-center" style={{ gridTemplateColumns: "92px 1fr 132px 118px 96px", gap: 16, paddingBottom: 10, borderBottom: `2px solid ${t.tokens.ink}` }}>
            {["Kode", "Layanan", "Durasi", "Biaya", ""].map((h, i) => (
              <span key={h + i} className="f-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: t.tokens.inkSoft }}>{h}</span>
            ))}
          </div>
          {s.products.map((p) => (
            <div key={p.code} className="foc h-row tr grid items-center" style={{ gridTemplateColumns: "92px 1fr 132px 118px 96px", gap: 16, padding: "16px 0", borderBottom: hair(t) }}>
              <span className="f-mono" style={{ fontSize: 12, color: t.tokens.accent, letterSpacing: ".02em" }}>{p.code}</span>
              <span>
                <span style={{ fontSize: 16.5, fontWeight: 600 }}>{p.name}</span>
                <span style={{ display: "block", fontSize: 12.5, color: t.tokens.inkSoft, marginTop: 3 }}>{p.note}</span>
              </span>
              <span className="f-mono" style={{ fontSize: 12.5, color: t.tokens.inkSoft }}>{p.note?.split(" · ")[0]}</span>
              <Price t={t} v={p.price} size={17} weight={600} />
              <button onClick={add} className="foc h-out tr" style={{ border: hair(t), background: "transparent", color: t.tokens.ink, padding: "9px 0", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
                Pilih
              </button>
            </div>
          ))}

          <div className="flex items-start gap-6" style={{ marginTop: 24, background: t.tokens.panel, border: hair(t), padding: "18px 20px" }}>
            <div className="flex-1">
              <Label t={t}>Slot hari ini</Label>
              <div className="flex gap-2" style={{ marginTop: 10 }}>
                {["09.00", "13.00", "16.00", "18.30"].map((h, i) => (
                  <button key={h} className="foc tr" style={{ padding: "9px 15px", fontSize: 13, fontFamily: t.tokens.mono, border: hair(t), background: i === 1 ? t.tokens.accent : t.tokens.paper, color: i === 1 ? t.tokens.accentInk : i === 3 ? t.tokens.inkSoft : t.tokens.ink, textDecoration: i === 3 ? "line-through" : "none", cursor: "pointer" }}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ borderLeft: hair(t), paddingLeft: 20 }}>
              <Label t={t}>Keranjang</Label>
              <div className="f-mono tnum" style={{ fontSize: 20, marginTop: 8, fontWeight: 600 }}>{cart} layanan</div>
              <div style={{ fontSize: 12, color: t.tokens.inkSoft, marginTop: 2 }}>Tagihan muncul setelah survei</div>
            </div>
          </div>
        </main>
      </div>

      <footer className="flex items-center justify-between px-8 py-4" style={{ borderTop: `2px solid ${t.tokens.ink}` }}>
        <span className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft }}>Garansi pekerjaan 14 hari · {s.pickup}</span>
        <span className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft }}>{s.wa}</span>
      </footer>
    </div>
  );
}

/* ── 04 · Atelier — galeri editorial ─────────────────────────────── */
function Gallery({ t, cart, add }: P) {
  const s = t.store;
  const item = (p: (typeof s.products)[number], i: number) => (
    <figure key={p.name}>
      <div className="foc h-shift tr" style={{ overflow: "hidden" }}>
        <Thumb t={t} i={i} style={{ aspectRatio: "4 / 5", width: "100%" }} />
      </div>
      <figcaption style={{ borderTop: hair(t), marginTop: 14, paddingTop: 12 }}>
        <div className="flex items-baseline justify-between gap-4">
          <span style={{ fontFamily: t.tokens.body, fontSize: 16, fontWeight: 500 }}>{p.name}</span>
          <Price t={t} v={p.price} size={15} weight={600} />
        </div>
        <div className="flex items-center justify-between gap-4" style={{ marginTop: 7 }}>
          <Label t={t} style={{ fontSize: 9.5 }}>{p.note}</Label>
          <button onClick={add} className="foc h-link tr" style={{ background: "none", border: "none", padding: 0, fontSize: 9.5, fontWeight: 600, letterSpacing: ".22em", textTransform: "uppercase", color: t.tokens.accent, cursor: "pointer" }}>
            Tambah {p.badge ? "· ready" : ""}
          </button>
        </div>
      </figcaption>
    </figure>
  );

  return (
    <div style={vars(t)}>
      <header className="px-14 pt-11 pb-6">
        <div className="flex items-end justify-between gap-8">
          <div>
            <Label t={t} style={{ color: t.tokens.accent }}>TokoLink · Atelier</Label>
            <h1 style={{ fontFamily: t.tokens.display, fontSize: 72, fontWeight: 400, letterSpacing: "0.005em", lineHeight: 0.98, margin: "14px 0 0" }}>{s.name}</h1>
          </div>
          <div className="text-right">
            <div className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, lineHeight: 1.7 }}>{s.city}<br />{s.hours}</div>
            <button onClick={add} className="foc h-out tr inline-flex items-center gap-2" style={{ marginTop: 12, border: `1px solid ${t.tokens.ink}`, background: "transparent", color: t.tokens.ink, padding: "11px 20px", fontSize: 10, fontWeight: 600, letterSpacing: ".22em", textTransform: "uppercase", cursor: "pointer" }}>
              <WaIcon size={14} /> Tanya via WhatsApp
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between" style={{ borderTop: hair(t), marginTop: 26, paddingTop: 12 }}>
          <Label t={t}>01 — Kemarau · {s.products.length} potong</Label>
          <Label t={t}>{s.tagline}</Label>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-x-10 px-14 pb-10">
        <div>{s.products.filter((_, i) => i % 2 === 0).map((p, i) => item(p, i * 2))}</div>
        <div style={{ marginTop: 64 }}>{s.products.filter((_, i) => i % 2 === 1).map((p, i) => item(p, i * 2 + 1))}</div>
      </div>

      <footer className="px-14 py-8 flex items-center justify-between" style={{ background: t.tokens.panel, borderTop: hair(t) }}>
        <div>
          <Label t={t}>Janji temu atelier</Label>
          <div style={{ fontFamily: t.tokens.display, fontSize: 22, marginTop: 8 }}>Pengambilan & ukur badan: Selasa & Jumat, 10.00–19.00</div>
        </div>
        <div className="f-mono text-right" style={{ fontSize: 11.5, color: t.tokens.inkSoft, lineHeight: 1.7 }}>
          Keranjang <span className="tnum" style={{ color: t.tokens.ink, fontSize: 15 }}>{cart}</span> potong<br />{s.payment}
        </div>
      </footer>
    </div>
  );
}

/* ── 05 · Dapur Hari Ini — papan menu ────────────────────────────── */
function Menu({ t, cart, add }: P) {
  const s = t.store;
  const total = s.products.filter((p) => !p.sold).slice(0, cart || 2).reduce((a, b) => a + b.price, 0);
  return (
    <div style={vars(t)}>
      <header className="px-10 pt-9 pb-6">
        <div className="flex items-end justify-between gap-8" style={{ borderBottom: `3px solid ${t.tokens.ink}`, paddingBottom: 18 }}>
          <div>
            <h1 style={{ fontFamily: t.tokens.display, fontWeight: 700, fontSize: 60, letterSpacing: "-0.03em", lineHeight: 0.95, margin: 0 }}>{s.name}</h1>
            <div className="f-mono" style={{ fontSize: 12.5, color: t.tokens.inkSoft, marginTop: 12, letterSpacing: ".06em", textTransform: "uppercase" }}>{s.tagline}</div>
          </div>
          <div className="text-right">
            <span className="f-mono flex items-center justify-end gap-2" style={{ fontSize: 12, color: t.tokens.ok, textTransform: "uppercase", letterSpacing: ".1em" }}><Dot t={t} /> Dapur buka</span>
            <div className="f-mono tnum" style={{ fontSize: 13, marginTop: 8 }}>{s.hours}</div>
            <button onClick={add} className="foc h-ac tr" style={{ marginTop: 12, background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "12px 18px", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
              Keranjang · <span className="tnum">{cart}</span>
            </button>
          </div>
        </div>
        <nav className="flex gap-6" style={{ marginTop: 18 }}>
          {s.cats.map((c, i) => (
            <button key={c} className="foc tr" style={{ background: i === 0 ? t.tokens.accent : "transparent", color: i === 0 ? t.tokens.accentInk : t.tokens.ink, border: `2px solid ${i === 0 ? t.tokens.accent : t.tokens.line}`, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
              {c}
            </button>
          ))}
          <span className="f-mono" style={{ marginLeft: "auto", alignSelf: "center", fontSize: 11.5, color: t.tokens.inkSoft }}>{s.extra}</span>
        </nav>
      </header>

      <div className="px-10 grid grid-cols-2 gap-x-12 gap-y-0 pb-6">
        {s.products.map((p, i) => (
          <button key={p.name} onClick={add} className="foc h-row tr text-left" style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "18px 6px", borderBottom: hair(t), background: "transparent", borderLeft: "none", borderRight: "none", borderTop: "none", cursor: "pointer", opacity: p.sold ? 0.45 : 1 }}>
            <Thumb t={t} i={i} style={{ width: 62, height: 62, flexShrink: 0, borderRadius: t.tokens.radius }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: t.tokens.display, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", display: "block", lineHeight: 1.2 }}>{p.name}</span>
              <span style={{ fontSize: 13, color: t.tokens.inkSoft, display: "block", marginTop: 4 }}>{p.note}</span>
            </span>
            <span style={{ borderBottom: `2px dotted ${t.tokens.line}`, flex: "0 0 26px", marginBottom: 8 }} />
            <span className="f-mono tnum" style={{ fontSize: 18, fontWeight: 600, color: t.tokens.accent, flexShrink: 0 }}>{rp(p.price)}</span>
            {p.sold && (
              <span style={{ position: "relative" }}>
                <span style={{ position: "absolute", right: -6, top: -34, border: `2px solid ${t.tokens.accent}`, color: t.tokens.accent, fontSize: 11, fontWeight: 800, letterSpacing: ".14em", padding: "3px 8px", transform: "rotate(-7deg)", background: t.tokens.paper }}>HABIS</span>
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-10 py-4 grid grid-cols-3 gap-6" style={{ background: t.tokens.panel, borderTop: hair(t) }}>
        {[["Pengambilan", s.pickup], ["Pembayaran", s.payment], ["Katering", "Pesan H-1 · antar Jabodetabek"]].map(([k, v]) => (
          <div key={k}>
            <Label t={t}>{k}</Label>
            <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-10 py-5" style={{ background: t.tokens.ink, color: t.tokens.paper }}>
        <span className="f-mono tnum" style={{ fontSize: 13 }}>{cart} item · {rp(total)}</span>
        <button className="foc tr" style={{ background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "14px 26px", fontSize: 13, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
          Pesan ke WhatsApp
        </button>
      </div>
    </div>
  );
}

/* ── 06 · Kriya Nusantara — etalase asimetris ────────────────────── */
function Masonry({ t, cart, add }: P) {
  const s = t.store;
  const span = [7, 5, 5, 7, 4, 4, 4];
  const h = [330, 250, 250, 330, 240, 240, 240];
  return (
    <div style={vars(t)}>
      <header className="flex items-end justify-between px-11 pt-9 pb-6" style={{ borderBottom: hair(t) }}>
        <div className="flex items-end gap-5">
          <Monogram t={t} size={50} />
          <div>
            <div style={{ fontFamily: t.tokens.display, fontWeight: 500, fontSize: 44, letterSpacing: "-0.015em", lineHeight: 1 }}>{s.name}</div>
            <div className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, marginTop: 9 }}>{s.handle} · {s.city}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="f-mono flex items-center gap-2" style={{ fontSize: 11, color: t.tokens.inkSoft, textTransform: "uppercase", letterSpacing: ".08em" }}><Dot t={t} /> {s.hours}</span>
          <button onClick={add} className="foc h-ac tr" style={{ background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "13px 20px", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer" }}>
            Keranjang <span className="tnum">{cart}</span>
          </button>
        </div>
      </header>

      <div className="flex" style={{ borderBottom: hair(t) }}>
        <div className="shrink-0 flex flex-col items-center gap-6" style={{ width: 54, padding: "26px 0", borderRight: hair(t) }}>
          {s.cats.map((c, i) => (
            <span key={c} style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 10, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: i === 0 ? t.tokens.accent : t.tokens.inkSoft, borderLeft: i === 0 ? `2px solid ${t.tokens.accent}` : "none", paddingLeft: i === 0 ? 6 : 0 }}>
              {c}
            </span>
          ))}
        </div>

        <div className="flex-1" style={{ padding: "30px 38px 34px" }}>
          <div className="grid grid-cols-12 gap-7">
            {s.products.map((p, i) => (
              <figure key={p.name} style={{ gridColumn: `span ${span[i]} / span ${span[i]}` }}>
                <div className="foc h-shift tr" style={{ overflow: "hidden" }}>
                  <Thumb t={t} i={i} style={{ height: h[i], width: "100%" }} />
                </div>
                <figcaption style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "baseline", marginTop: 12, borderTop: `1px solid ${t.tokens.line}`, paddingTop: 10, marginLeft: i % 2 ? 28 : 0 }}>
                  <span>
                    <span style={{ fontFamily: t.tokens.display, fontSize: 22, fontWeight: 500, display: "block", letterSpacing: "-0.01em" }}>{p.name}</span>
                    <span className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft, display: "block", marginTop: 5 }}>{p.note}</span>
                  </span>
                  <button onClick={add} className="foc h-link tr f-mono tnum" style={{ background: "none", border: "none", fontSize: 15, color: t.tokens.accent, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {rp(p.price)} +
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-7" style={{ marginTop: 30 }}>
            <div className="col-span-7 flex gap-6" style={{ background: t.tokens.panel, padding: "24px 26px", border: hair(t) }}>
              <div>
                <Label t={t} style={{ color: t.tokens.accent }}>Cerita bengkel</Label>
                <p style={{ fontFamily: t.tokens.display, fontSize: 21, lineHeight: 1.4, marginTop: 10 }}>
                  Setiap karya dicetak tangan di Plered, dijemur empat hari, lalu dibakar tungku kayu dua kali seminggu — karena itu warna tiap batch tidak pernah persis sama.
                </p>
              </div>
            </div>
            <div className="col-span-5" style={{ border: hair(t), padding: "24px 26px" }}>
              <Label t={t}>Pengiriman & packing</Label>
              <p className="f-mono" style={{ fontSize: 12, lineHeight: 1.7, color: t.tokens.inkSoft, marginTop: 10 }}>{s.extra}<br />{s.pickup}<br />{s.payment}</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between px-11 py-5">
        <span className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft }}>{s.tagline}</span>
        <span className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft }}>{s.wa}</span>
      </footer>
    </div>
  );
}

/* ── 07 · Pixel Goods — panel gelap ──────────────────────────────── */
function Dark({ t, cart, add }: P) {
  const s = t.store;
  const total = s.products.slice(0, cart || 1).reduce((a, b) => a + b.price, 0);
  return (
    <div style={vars(t)}>
      <header className="flex items-center justify-between px-9 pt-7 pb-0" style={{ borderBottom: hair(t) }}>
        <div className="flex items-center gap-4">
          <Monogram t={t} size={44} />
          <div>
            <div style={{ fontFamily: t.tokens.display, fontWeight: 600, fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.name}</div>
            <div className="f-mono" style={{ fontSize: 10.5, color: t.tokens.inkSoft, marginTop: 6, letterSpacing: ".06em" }}>{s.handle} · {s.tagline}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="f-mono flex items-center gap-2" style={{ fontSize: 10.5, color: t.tokens.inkSoft, textTransform: "uppercase", letterSpacing: ".1em" }}><Dot t={t} /> {s.hours}</span>
          <button onClick={add} className="foc h-ac tr" style={{ background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "12px 18px", fontSize: 12, fontWeight: 600, letterSpacing: ".06em", borderRadius: 8, cursor: "pointer" }}>
            Keranjang <span className="tnum">{cart}</span> · {rp(total)}
          </button>
        </div>
      </header>

      <nav className="flex gap-7 px-9" style={{ borderBottom: hair(t) }}>
        {s.cats.map((c, i) => (
          <button key={c} className="foc tr" style={{ background: "none", border: "none", padding: "14px 0 12px", fontFamily: t.tokens.mono, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: i === 0 ? t.tokens.accent : t.tokens.inkSoft, borderTop: `2px solid ${i === 0 ? t.tokens.accent : "transparent"}`, marginTop: -1, cursor: "pointer" }}>
            {c}
          </button>
        ))}
        <span className="f-mono" style={{ marginLeft: "auto", alignSelf: "center", fontSize: 10.5, color: t.tokens.inkSoft }}>{s.products.length} produk · lisensi komersial 1 proyek</span>
      </nav>

      <div className="grid gap-4 px-9 py-6" style={{ gridTemplateColumns: "1fr 296px" }}>
        <div className="grid gap-3">
          {s.products.map((p, i) => (
            <article key={p.name} className="foc h-card tr grid items-center" style={{ gridTemplateColumns: "216px 1fr 214px 116px", gap: 18, background: t.tokens.panel, border: hair(t), borderRadius: t.tokens.radius, padding: 12, boxShadow: t.tokens.shadow, cursor: "pointer" }}>
              <Thumb t={t} i={i} style={{ aspectRatio: "16 / 9", width: "100%", borderRadius: 6 }} />
              <div>
                <div className="f-mono" style={{ fontSize: 10, color: t.tokens.accent, letterSpacing: ".1em" }}>{p.code} · {p.badge ?? "rilis"}</div>
                <div style={{ fontFamily: t.tokens.display, fontSize: 17, fontWeight: 500, marginTop: 6 }}>{p.name}</div>
                <div style={{ fontSize: 12.5, color: t.tokens.inkSoft, marginTop: 4 }}>{p.note}</div>
              </div>
              <div className="f-mono" style={{ fontSize: 10.5, color: t.tokens.inkSoft, lineHeight: 1.9 }}>
                <div className="flex justify-between"><span>FORMAT</span><span style={{ color: t.tokens.ink }}>ZIP / SVG</span></div>
                <div className="flex justify-between"><span>LISENSI</span><span style={{ color: t.tokens.ink }}>Komersial</span></div>
                <div className="flex justify-between"><span>UNDUH</span><span style={{ color: t.tokens.ok }}>Instan</span></div>
              </div>
              <div className="text-right">
                <div className="f-mono tnum" style={{ fontSize: 19, fontWeight: 600, color: t.tokens.accent }}>{rp(p.price)}</div>
                <button onClick={add} className="foc h-ac tr" style={{ marginTop: 9, width: "100%", background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "9px 0", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer" }}>
                  Beli
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside style={{ background: t.tokens.panel, border: hair(t), borderRadius: t.tokens.radius, padding: 20, alignSelf: "start", boxShadow: t.tokens.shadow }}>
          <div className="f-mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: t.tokens.inkSoft }}>Ringkasan</div>
          <div style={{ borderTop: hair(t), marginTop: 12, paddingTop: 12, display: "grid", gap: 10 }}>
            {s.products.slice(0, Math.max(cart, 1)).map((p) => (
              <div key={p.name} className="flex justify-between gap-3" style={{ fontSize: 12.5 }}>
                <span style={{ color: t.tokens.inkSoft }}>{p.name}</span>
                <span className="f-mono tnum">{rp(p.price)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-baseline" style={{ borderTop: hair(t), marginTop: 12, paddingTop: 12 }}>
            <span className="f-mono" style={{ fontSize: 11, color: t.tokens.inkSoft }}>TOTAL</span>
            <span className="f-mono tnum" style={{ fontSize: 22, fontWeight: 600 }}>{rp(total)}</span>
          </div>
          <button onClick={add} className="foc h-ac tr" style={{ width: "100%", marginTop: 14, background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "13px 0", fontSize: 12.5, fontWeight: 600, borderRadius: 6, cursor: "pointer" }}>
            Bayar dengan QRIS
          </button>
          <div className="f-mono" style={{ fontSize: 10.5, color: t.tokens.inkSoft, marginTop: 12, lineHeight: 1.7 }}>
            Tautan unduh aktif 30 hari<br />{s.wa}
          </div>
        </aside>
      </div>

      <footer className="f-mono flex items-center justify-between px-9 py-4" style={{ borderTop: hair(t), fontSize: 10.5, color: t.tokens.inkSoft, letterSpacing: ".06em" }}>
        <span>{s.extra}</span>
        <span>{s.payment} · {s.pickup}</span>
      </footer>
    </div>
  );
}

/* ── 08 · Studio Tenang — satu kolom lapang ──────────────────────── */
function Calm({ t, cart, add }: P) {
  const s = t.store;
  return (
    <div style={vars(t)}>
      <header style={{ maxWidth: 720, margin: "0 auto", padding: "72px 40px 0" }}>
        <div className="flex items-center justify-between">
          <Label t={t} style={{ color: t.tokens.accent }}>{s.name}</Label>
          <span className="f-mono flex items-center gap-2" style={{ fontSize: 10.5, color: t.tokens.inkSoft, textTransform: "uppercase", letterSpacing: ".1em" }}><Dot t={t} /> {s.hours}</span>
        </div>
        <h1 style={{ fontFamily: t.tokens.display, fontSize: 58, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.04, margin: "26px 0 0" }}>
          Pendampingan yang membuat bisnis kecil berjalan lebih tenang.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: t.tokens.inkSoft, marginTop: 20, maxWidth: 640 }}>{s.tagline}. {s.extra}.</p>
        <div className="flex gap-4" style={{ marginTop: 28 }}>
          <button onClick={add} className="foc h-ac tr" style={{ background: t.tokens.accent, color: t.tokens.accentInk, border: "none", padding: "15px 28px", fontSize: 11, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", cursor: "pointer" }}>
            Ajukan janji temu
          </button>
          <a href="#/" className="foc h-link tr" style={{ padding: "15px 4px", fontSize: 11, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: t.tokens.ink, borderBottom: `1px solid ${t.tokens.ink}`, textDecoration: "none" }}>
            Kirim pesan WhatsApp
          </a>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: "44px auto 0", padding: "0 40px" }}>
        <Strip t={t} h={300} />
        <div className="grid grid-cols-3" style={{ marginTop: 40, borderTop: hair(t) }}>
          {[["01", "Pahami", "Audit singkat proses yang berjalan hari ini."], ["02", "Susun", "Prioritas, pemilik tugas, dan ukuran keberhasilan."], ["03", "Dampingi", "Tinjauan dua mingguan selama satu kuartal."]].map(([n, h, d]) => (
            <div key={n} style={{ padding: "22px 24px 22px 0", borderRight: n === "03" ? "none" : hair(t) }}>
              <span className="f-mono" style={{ fontSize: 11, color: t.tokens.accent }}>{n}</span>
              <div style={{ fontFamily: t.tokens.display, fontSize: 24, marginTop: 10 }}>{h}</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: t.tokens.inkSoft, marginTop: 8 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 40px 0" }}>
        <Label t={t} style={{ marginTop: 32 }}>Penawaran</Label>
        {s.products.map((p, i) => (
          <div key={p.name} className="foc h-row tr" style={{ borderTop: i === 0 ? hair(t) : hair(t), padding: "26px 12px" }}>
            <div className="flex items-baseline justify-between gap-6">
              <h2 style={{ fontFamily: t.tokens.display, fontSize: 26, fontWeight: 400, lineHeight: 1.25 }}>{p.name}</h2>
              <Price t={t} v={p.price} size={17} weight={600} color={t.tokens.accent} />
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: t.tokens.inkSoft, marginTop: 8, maxWidth: 560 }}>{p.note}. {p.badge ? "Cocok untuk yang baru mulai." : "Termasuk laporan tertulis setelah sesi."}</p>
            <button onClick={add} className="foc" style={{ background: "none", border: "none", padding: "10px 0 0", fontSize: 14, color: t.tokens.ink, borderBottom: `1px solid ${t.tokens.ink}`, cursor: "pointer" }}>
              Pilih layanan →
            </button>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 720, margin: "34px auto 0", padding: "0 40px 64px" }}>
        <div style={{ background: t.tokens.panel, border: hair(t), padding: "26px 28px", boxShadow: t.tokens.shadow }}>
          <Label t={t}>Slot janji temu terdekat</Label>
          <div className="grid grid-cols-3 gap-3" style={{ marginTop: 14 }}>
            {[["Sel, 20 Mei", "10.00"], ["Rab, 21 Mei", "13.30"], ["Kam, 22 Mei", "09.00"]].map(([d, h], i) => (
              <button key={d} className="foc tr" style={{ padding: "13px 14px", textAlign: "left", border: hair(t), background: i === 0 ? t.tokens.accent : t.tokens.paper, color: i === 0 ? t.tokens.accentInk : t.tokens.ink, cursor: "pointer" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{d}</div>
                <div className="f-mono tnum" style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>{h} WIB · daring</div>
              </button>
            ))}
          </div>
          <div className="f-mono flex justify-between" style={{ fontSize: 11, color: t.tokens.inkSoft, marginTop: 16 }}>
            <span>Keranjang <span className="tnum">{cart}</span> layanan</span>
            <span>{s.payment}</span>
          </div>
        </div>
        <p style={{ fontFamily: t.tokens.display, fontStyle: "italic", fontSize: 21, lineHeight: 1.6, marginTop: 34 }}>
          “Tiga bulan bersama Studio Tenang dan laporan kami selesai sebelum tanggal 5.” — Rina, katering 12 karyawan
        </p>
      </div>
    </div>
  );
}

export function Desktop({ t }: { t: Theme }) {
  const [cart, setCart] = useState(2);
  const add = () => setCart((c) => c + 1);
  const p = { t, cart, add };
  switch (t.layout) {
    case "editorial":
      return <Editorial {...p} />;
    case "dense":
      return <Dense {...p} />;
    case "list":
      return <ListLayout {...p} />;
    case "gallery":
      return <Gallery {...p} />;
    case "menu":
      return <Menu {...p} />;
    case "masonry":
      return <Masonry {...p} />;
    case "dark":
      return <Dark {...p} />;
    default:
      return <Calm {...p} />;
  }
}
