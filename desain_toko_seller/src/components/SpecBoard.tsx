import type { Theme } from "../data/themes";
import { vars } from "../storefront/bits";

const INK = "#16150F";
const NEU = "#6A6559";
const RULE = "#D8D2C4";
const PAPER = "#FBF9F4";
const ACCENT = "#B23A22";

function Head({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="flex items-baseline justify-between" style={{ borderBottom: `1px solid ${INK}`, paddingBottom: 12 }}>
      <div>
        <span className="f-mono sc" style={{ fontSize: 10, color: ACCENT }}>{kicker}</span>
        <h3 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 34, fontWeight: 400, letterSpacing: "-0.01em", margin: "6px 0 0", lineHeight: 1.05 }}>{title}</h3>
      </div>
      <span className="f-mono" style={{ fontSize: 10, color: NEU, textAlign: "right", lineHeight: 1.6 }}>
        papan spesifikasi · PNG 1440 × auto<br />sRGB · skala 2×
      </span>
    </div>
  );
}

export function SpecBoard({ t }: { t: Theme }) {
  const T = t.tokens;
  return (
    <div style={{ width: 1440, background: PAPER, color: INK, fontFamily: "'Archivo', sans-serif", padding: "40px 46px 48px" }}>
      <Head kicker={`Pelat ${t.no} · papan spesifikasi`} title={`${t.name} — ${t.sub}`} />

      <div className="grid" style={{ gridTemplateColumns: "1.05fr 1fr", gap: 44, marginTop: 30 }}>
        {/* PALET */}
        <section>
          <span className="f-mono sc" style={{ fontSize: 10, color: NEU }}>01 · Palet</span>
          <div style={{ marginTop: 14 }}>
            {t.palette.map((c) => (
              <div key={c.hex + c.name} className="grid items-center" style={{ gridTemplateColumns: "52px 1fr 88px", gap: 16, padding: "9px 0", borderTop: `1px solid ${RULE}` }}>
                <span style={{ height: 38, background: c.hex, border: `1px solid ${RULE}` }} />
                <span>
                  <span style={{ fontSize: 14, fontWeight: 600, display: "block" }}>{c.name}</span>
                  <span style={{ fontSize: 12.5, color: NEU, display: "block", marginTop: 2 }}>{c.use}</span>
                </span>
                <span className="f-mono tnum" style={{ fontSize: 12.5, textAlign: "right" }}>{c.hex}</span>
              </div>
            ))}
          </div>
        </section>

        {/* TIPOGRAFI */}
        <section>
          <span className="f-mono sc" style={{ fontSize: 10, color: NEU }}>02 · Tipografi</span>
          <div style={{ marginTop: 14 }}>
            {t.typeSpec.map((r) => (
              <div key={r.role} style={{ borderTop: `1px solid ${RULE}`, padding: "11px 0 13px" }}>
                <div className="flex items-baseline justify-between gap-4">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.role}</span>
                  <span className="f-mono" style={{ fontSize: 11, color: NEU }}>
                    {r.family} · {r.size} · {r.weight} · ls {r.tracking} · lh {r.lh}
                  </span>
                </div>
                <div style={{ fontFamily: `'${r.family}', sans-serif`, fontSize: Math.max(16, Math.min(30, parseInt(r.size) || 20)), fontWeight: r.weight, letterSpacing: r.tracking, lineHeight: 1.2, marginTop: 7 }}>
                  Seduh Senja — Rp78.000
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* METRIK */}
      <section style={{ marginTop: 30 }}>
        <span className="f-mono sc" style={{ fontSize: 10, color: NEU }}>03 · Ukuran, radius, grid</span>
        <div className="grid grid-cols-7" style={{ marginTop: 14, borderTop: `1px solid ${INK}` }}>
          {[["Basis", t.metrics.base], ["Gutter", t.metrics.gutter], ["Radius", t.metrics.radius], ["Rasio foto", t.metrics.ratio], ["Kolom", t.metrics.cols], ["Skala tipe", t.metrics.scale], ["Lebar maks", t.metrics.maxw]].map(([k, v]) => (
            <div key={k} style={{ padding: "12px 14px 14px 0", borderRight: `1px solid ${RULE}` }}>
              <span className="f-mono sc" style={{ fontSize: 9.5, color: NEU }}>{k}</span>
              <div style={{ fontSize: 13, marginTop: 7, lineHeight: 1.4 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1.15fr", gap: 44, marginTop: 30 }}>
        {/* KOMPONEN */}
        <section>
          <span className="f-mono sc" style={{ fontSize: 10, color: NEU }}>04 · Komponen wajib</span>
          <ol style={{ marginTop: 14 }}>
            {t.components.map((c, i) => (
              <li key={c} className="grid" style={{ gridTemplateColumns: "34px 1fr", gap: 10, borderTop: `1px solid ${RULE}`, padding: "10px 0" }}>
                <span className="f-mono tnum" style={{ fontSize: 11, color: ACCENT }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{c}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* STATE */}
        <section>
          <span className="f-mono sc" style={{ fontSize: 10, color: NEU }}>05 · State</span>
          <div className="grid grid-cols-2 gap-3" style={{ marginTop: 14 }}>
            {[
              { k: "Aktif", d: t.states.active, node: <span style={{ background: T.accent, color: T.accentInk, padding: "9px 14px", fontSize: 12, fontWeight: 700, letterSpacing: T.labelTracking, textTransform: T.labelTransform }}>Kategori</span> },
              { k: "Hover", d: t.states.hover, node: <span className="h-card tr" style={{ border: `1px solid ${T.line}`, background: T.panel, padding: "9px 14px", fontSize: 12, borderRadius: T.radius, display: "inline-block" }}>Baris produk</span> },
              { k: "Fokus", d: t.states.focus, node: <span className="foc" style={{ outline: `2px solid ${T.accent}`, outlineOffset: 3, padding: "9px 14px", fontSize: 12, border: `1px solid ${T.line}`, display: "inline-block" }}>Tombol pesan</span> },
              { k: "Kosong", d: t.states.empty, node: <span style={{ border: `1px dashed ${T.line}`, color: T.inkSoft, padding: "9px 14px", fontSize: 12, display: "inline-block", borderRadius: T.radius }}>Belum ada item</span> },
            ].map((s) => (
              <div key={s.k} style={{ border: `1px solid ${RULE}`, padding: 0 }}>
                <div className="flex items-center" style={{ ...vars(t), minHeight: 62, padding: "14px 16px", background: T.paper, border: "none" }}>
                  {s.node}
                </div>
                <div style={{ borderTop: `1px solid ${RULE}`, padding: "10px 16px 12px", background: "#fff" }}>
                  <span className="f-mono sc" style={{ fontSize: 9.5, color: ACCENT }}>{s.k}</span>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 5 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-between" style={{ marginTop: 28, borderTop: `1px solid ${INK}`, paddingTop: 12 }}>
        <span className="f-mono" style={{ fontSize: 10.5, color: NEU }}>
          {t.files.spec} · {t.files.desktop} · {t.files.mobile}
        </span>
        <span className="f-mono" style={{ fontSize: 10.5, color: NEU }}>TokoLink · paket tema storefront seller · edisi 01</span>
      </div>
    </div>
  );
}
