import { useEffect, useRef, useState } from "react";
import { MATRIX_COLS, themes, type Theme } from "./data/themes";
import { guide } from "./data/guide";
import { ExportButton, Plate } from "./components/Plate";
import { SpecBoard } from "./components/SpecBoard";
import { Desktop } from "./storefront/Storefront";
import { Mobile } from "./storefront/Mobile";

const NAV = [
  ["#sampul", "Sampul"],
  ["#matriks", "Matriks"],
  ["#pelat-01", "8 Pelat"],
  ["#kontak", "Contact sheet"],
  ["#panduan", "Panduan"],
];

const RULE = "var(--rule)";

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const showAll = () => els.forEach((e) => e.classList.add("in"));
    if (!("IntersectionObserver" in window)) {
      showAll();
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.03 },
    );
    els.forEach((e) => io.observe(e));
    const t = window.setTimeout(showAll, 2600);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="f-mono sc" style={{ fontSize: 10, color: "var(--accent)", display: "block" }}>
      {children}
    </span>
  );
}

function TopBar() {
  return (
    <header
      className="fixed top-0 inset-x-0 z-50"
      style={{ background: "rgba(244,241,233,.94)", borderBottom: `1px solid ${RULE}`, backdropFilter: "blur(6px)" }}
    >
      <div className="mx-auto max-w-[1600px] px-5 md:px-8 h-[46px] flex items-center justify-between gap-6">
        <a href="#sampul" className="flex items-baseline gap-2.5 shrink-0" style={{ color: "var(--ink)", textDecoration: "none" }}>
          <span className="sc text-[12px] font-bold" style={{ letterSpacing: ".2em" }}>
            TokoLink
          </span>
          <span className="f-mono text-[10px]" style={{ color: "var(--neutral)" }}>
            spec book 01
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map(([href, label]) => (
            <a key={href} href={href} className="f-mono sc text-[10px] hover:text-[var(--accent)]" style={{ color: "var(--ink)", textDecoration: "none" }}>
              {label}
            </a>
          ))}
        </nav>
        <span className="f-mono text-[10px] tnum" style={{ color: "var(--neutral)" }}>
          26 png + 1 md
        </span>
      </div>
    </header>
  );
}

function Cover() {
  const coverRef = useRef<HTMLDivElement>(null);
  return (
    <section id="sampul" className="mx-auto max-w-[1600px] px-5 md:px-8 pt-14 pb-16" style={{ scrollMarginTop: 56 }}>
      <div ref={coverRef} className="grid lg:grid-cols-12 gap-x-10 gap-y-12">
        <div className="lg:col-span-7">
          <Kicker>Paket desain · edisi 01 · Mei 2026</Kicker>
          <h1
            className="f-display"
            style={{ fontSize: "clamp(2.8rem,6.6vw,6.2rem)", lineHeight: 0.94, letterSpacing: "-0.025em", fontWeight: 400, margin: "22px 0 0" }}
          >
            Delapan wajah
            <br />
            untuk <em style={{ fontStyle: "italic", color: "var(--accent)" }}>satu toko</em>.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.65, maxWidth: "56ch", marginTop: 26, color: "#3b382f" }}>
            Paket visual untuk fitur ganti tema toko TokoLink: satu halaman toko seller yang sama — profil, jam buka, kategori, produk
            berharga rupiah, WhatsApp, QRIS, pengambilan, dan keranjang — disusun ulang jadi <strong>delapan komposisi berbeda</strong>,
            bukan delapan warna aksen.
          </p>

          <div className="mt-11">
            <span className="f-mono sc text-[10px]" style={{ color: "var(--neutral)" }}>
              Indeks koleksi
            </span>
            <div style={{ borderTop: `1px solid ${RULE}` }}>
              {themes.map((t) => (
                <a
                  key={t.id}
                  href={`#pelat-${t.no}`}
                  className="grid items-center gap-4 py-3.5 transition-colors hover:bg-[#eae6db]"
                  style={{ gridTemplateColumns: "34px minmax(150px,1.1fr) minmax(120px,1fr) auto", borderBottom: `1px solid ${RULE}`, textDecoration: "none", color: "var(--ink)" }}
                >
                  <span className="f-mono tnum text-[11px]" style={{ color: "var(--accent)" }}>
                    {t.no}
                  </span>
                  <span>
                    <span className="f-display block" style={{ fontSize: 23, lineHeight: 1.1 }}>
                      {t.name}
                    </span>
                    <span className="f-mono text-[10px] sc" style={{ color: "var(--neutral)" }}>
                      {t.sub}
                    </span>
                  </span>
                  <span className="hidden sm:block text-[13px]" style={{ color: "#4a4740" }}>
                    {t.forWho}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {t.palette.slice(0, 5).map((c) => (
                      <span key={c.hex} title={c.hex} style={{ width: 13, height: 13, background: c.hex, border: `1px solid ${RULE}` }} />
                    ))}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div style={{ border: `1px solid ${RULE}`, background: "#faf8f3" }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${RULE}` }}>
              <span className="f-mono sc text-[10px]" style={{ color: "var(--accent)" }}>
                Berkas identitas
              </span>
            </div>
            <dl className="px-6 py-1">
              {[
                ["Klien", "TokoLink — link-in-bio & toko online UMKM"],
                ["Repositori", "github.com/Bxxcv/TokoLink"],
                ["Situs", "tokolink-kappa.vercel.app"],
                ["Akun demo", "tokolink-kappa.vercel.app/#/s/demo-account"],
                ["Ruang lingkup", "8 tema storefront seller"],
                ["Format pelat", "desktop 1440 × auto · mobile 390 × auto"],
                ["Keluaran", "26 PNG + 1 Markdown"],
                ["Ekspor PNG", "tombol “ekspor png” pada setiap pelat"],
                ["Status", "desain siap implementasi · repo tidak diubah"],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-3 py-3" style={{ gridTemplateColumns: "118px 1fr", borderBottom: `1px solid ${RULE}` }}>
                  <dt className="f-mono sc text-[9.5px]" style={{ color: "var(--neutral)", paddingTop: 3 }}>
                    {k}
                  </dt>
                  <dd className="text-[13.5px] leading-snug" style={{ wordBreak: "break-word" }}>
                    {v.includes("github.com") ? (
                      <a href="https://github.com/Bxxcv/TokoLink" target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>
                        {v}
                      </a>
                    ) : v.includes("vercel.app") ? (
                      <a href={v.startsWith("tokolink") ? `https://${v}` : "https://tokolink-kappa.vercel.app/#/s/demo-account"} target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>
                        {v}
                      </a>
                    ) : (
                      v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              ["8", "tema"],
              ["16", "artboard"],
              ["8", "papan spek"],
            ].map(([n, l]) => (
              <div key={l} className="px-4 py-4" style={{ border: `1px solid ${RULE}` }}>
                <div className="f-display tnum" style={{ fontSize: 40, lineHeight: 1 }}>
                  {n}
                </div>
                <div className="f-mono sc text-[9.5px] mt-2" style={{ color: "var(--neutral)" }}>
                  {l}
                </div>
              </div>
            ))}
          </div>

          <p className="f-display italic text-[17px] leading-relaxed mt-6" style={{ color: "#3b382f" }}>
            “Pengaturan tema yang sekarang baru membedakan warna aksen dan susunan kisi/daftar. Paket ini menguji seberapa jauh satu
            halaman toko bisa berubah bentuk tanpa kehilangan konteks TokoLink.”
          </p>
        </aside>
      </div>

      {/* pita contoh foto — 8 strip produk, satu per tema */}
      <div className="mt-14 reveal">
        <div className="flex items-end justify-between gap-4 pb-3">
          <span className="f-mono sc text-[10px]" style={{ color: "var(--neutral)" }}>
            00-cover-index.png · sampul &amp; indeks koleksi
          </span>
          <ExportButton target={coverRef} filename="00-cover-index.png">
            ekspor sampul ↓
          </ExportButton>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8" style={{ borderTop: `1px solid ${RULE}` }}>
          {themes.map((t) => (
            <a key={t.id} href={`#pelat-${t.no}`} className="group block" style={{ borderBottom: `1px solid ${RULE}`, borderRight: `1px solid ${RULE}`, textDecoration: "none" }}>
              <div style={{ overflow: "hidden" }}>
                <img
                  src={t.img}
                  alt={`Strip produk ${t.name}`}
                  loading="lazy"
                  className="block w-full h-[112px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="f-mono text-[9px] px-2 py-2 flex justify-between" style={{ color: "var(--neutral)" }}>
                <span style={{ color: "var(--accent)" }}>{t.no}</span>
                <span className="truncate">{t.name}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Matrix() {
  return (
    <section id="matriks" className="mx-auto max-w-[1600px] px-5 md:px-8 py-14" style={{ borderTop: `2px solid var(--ink)`, scrollMarginTop: 56 }}>
      <div className="grid lg:grid-cols-12 gap-6 items-end mb-8">
        <div className="lg:col-span-7 reveal">
          <Kicker>Spread 01 · tabel pembeda</Kicker>
          <h2 className="f-display" style={{ fontSize: "clamp(2.2rem,4vw,3.6rem)", lineHeight: 1, letterSpacing: "-0.02em", fontWeight: 400, marginTop: 14 }}>
            Matriks pembeda delapan tema
          </h2>
        </div>
        <p className="lg:col-span-5 text-[14px] leading-relaxed" style={{ color: "#4a4740" }}>
          Dibaca per baris: satu tema, sepuluh keputusan. Bila dua baris identik pada kolom mana pun, temanya belum benar-benar berbeda.
        </p>
      </div>

      <div className="overflow-x-auto artboard-scroll reveal" style={{ border: `1px solid ${RULE}` }}>
        <table className="w-full border-collapse" style={{ minWidth: 1280 }}>
          <thead>
            <tr style={{ background: "#faf8f3" }}>
              <th className="f-mono sc text-left px-4 py-3" style={{ fontSize: 9.5, borderBottom: `1px solid var(--ink)`, width: 190, position: "sticky", left: 0, background: "#faf8f3", zIndex: 2 }}>
                Tema
              </th>
              {MATRIX_COLS.map((c) => (
                <th key={c} className="f-mono sc text-left px-3 py-3" style={{ fontSize: 9.5, borderBottom: `1px solid var(--ink)`, verticalAlign: "bottom" }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {themes.map((t, i) => (
              <tr key={t.id} className="transition-colors hover:bg-[#eae6db]" style={{ background: i % 2 ? "#faf8f3" : "transparent" }}>
                <th className="text-left px-4 py-3 align-top" style={{ borderBottom: `1px solid ${RULE}`, position: "sticky", left: 0, background: i % 2 ? "#faf8f3" : "var(--paper)", zIndex: 1 }}>
                  <span className="flex items-baseline gap-2">
                    <span className="f-mono tnum text-[10px]" style={{ color: "var(--accent)" }}>
                      {t.no}
                    </span>
                    <span className="f-display" style={{ fontSize: 19, fontWeight: 500 }}>
                      {t.name}
                    </span>
                  </span>
                </th>
                {t.matrix.map((cell, j) => (
                  <td key={j} className="px-3 py-3 align-top text-[12.5px] leading-snug" style={{ borderBottom: `1px solid ${RULE}`, borderLeft: `1px solid ${RULE}` }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="f-mono text-[10px] mt-3" style={{ color: "var(--neutral)" }}>
        Geser mendatar pada layar sempit · 8 baris × 10 kolom keputusan
      </div>
    </section>
  );
}

function Face({ t }: { t: Theme }) {
  return (
    <div style={{ border: `1px solid ${RULE}`, background: "#faf8f3" }}>
      <div className="px-5 py-3 flex items-baseline justify-between" style={{ borderBottom: `1px solid ${RULE}` }}>
        <span className="f-mono sc text-[9.5px]" style={{ color: "var(--accent)" }}>
          Sidik jari tema
        </span>
        <span className="f-mono text-[9.5px]" style={{ color: "var(--neutral)" }}>
          {t.tokens.radius === 0 ? "radius 0" : `radius ${t.tokens.radius}px`} · {t.tokens.cols} kolom
        </span>
      </div>
      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${RULE}` }}>
        <div className="flex gap-1.5">
          {t.palette.map((c) => (
            <div key={c.hex} className="flex-1">
              <div style={{ height: 46, background: c.hex, border: `1px solid ${RULE}` }} />
              <div className="f-mono text-[8.5px] mt-1.5 tnum" style={{ color: "var(--neutral)" }}>
                {c.hex}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3">
        {[
          [t.tokens.display, "Aa", "display"],
          [t.tokens.body, "Aa", "body"],
          [t.tokens.mono, "0123", "mono"],
        ].map(([fam, sample, role], i) => (
          <div key={role} className="px-4 py-4" style={{ borderRight: i < 2 ? `1px solid ${RULE}` : "none" }}>
            <div style={{ fontFamily: fam as string, fontSize: 34, lineHeight: 1 }}>{sample}</div>
            <div className="f-mono sc text-[8.5px] mt-3" style={{ color: "var(--neutral)" }}>
              {role}
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 f-mono text-[11px] leading-relaxed" style={{ borderTop: `1px solid ${RULE}`, color: "#4a4740" }}>
        foto {t.tokens.ratio} · pad {t.tokens.pad}px · gap {t.tokens.gap}px
        <br />
        aksen <span className="tnum">{t.tokens.accent}</span> · bayangan {t.tokens.shadow === "none" ? "tidak ada" : "ringan"}
      </div>
    </div>
  );
}

function ThemeSection({ t }: { t: Theme }) {
  return (
    <section id={`pelat-${t.no}`} className="mx-auto max-w-[1600px] px-5 md:px-8 pt-16 pb-20" style={{ borderTop: `2px solid var(--ink)`, scrollMarginTop: 56 }}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-end gap-5 reveal">
          <span className="f-mono tnum" style={{ fontSize: "clamp(2.6rem,5vw,4.4rem)", lineHeight: 0.8, color: "var(--accent)" }}>
            {t.no}
          </span>
          <div>
            <h2 className="f-display" style={{ fontSize: "clamp(2.2rem,4.4vw,4rem)", lineHeight: 0.95, letterSpacing: "-0.02em", fontWeight: 400 }}>
              {t.name}
            </h2>
            <span className="f-mono sc text-[10px]" style={{ color: "var(--neutral)" }}>
              {t.sub} · {t.forWho}
            </span>
          </div>
        </div>
        <div className="f-mono text-[10.5px] leading-relaxed text-right" style={{ color: "var(--neutral)" }}>
          {t.files.desktop}
          <br />
          {t.files.mobile}
          <br />
          {t.files.spec}
        </div>
      </div>

      <p className="f-display italic reveal" style={{ fontSize: "clamp(1.15rem,1.7vw,1.6rem)", lineHeight: 1.5, maxWidth: "62ch", marginTop: 24, color: "#3b382f" }}>
        {t.philosophy}
      </p>

      <div className="grid lg:grid-cols-[210px_1fr] gap-8 mt-10">
        <aside className="reveal lg:sticky lg:top-[62px] lg:self-start">
          <span className="f-mono sc text-[9.5px] block mb-3" style={{ color: "var(--accent)" }}>
            Anotasi
          </span>
          <div className="grid gap-5">
            {t.annotations.map((a) => (
              <div key={a.n} style={{ borderTop: `1px solid ${RULE}`, paddingTop: 10 }}>
                <div className="flex items-baseline gap-2">
                  <span className="f-mono text-[10px]" style={{ color: "var(--accent)" }}>
                    {a.n}
                  </span>
                  <span className="sc text-[10px] font-semibold" style={{ letterSpacing: ".12em" }}>
                    {a.title}
                  </span>
                </div>
                <p className="text-[12.5px] leading-relaxed mt-2" style={{ color: "#4a4740" }}>
                  {a.text}
                </p>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 grid gap-10">
          <div className="reveal">
            <Plate naturalW={1440} label={`Pelat ${t.no} · desktop`} meta="1440 × auto · 2× png" filename={t.files.desktop}>
              <Desktop t={t} />
            </Plate>
          </div>

          <div className="grid md:grid-cols-[390px_1fr] gap-8 items-start reveal">
            <Plate naturalW={390} label={`Pelat ${t.no} · mobile`} meta="390 × auto" filename={t.files.mobile}>
              <Mobile t={t} />
            </Plate>
            <div className="grid gap-4">
              <Face t={t} />
              <div style={{ border: `1px solid ${RULE}`, padding: "16px 18px" }}>
                <span className="f-mono sc text-[9.5px]" style={{ color: "var(--accent)" }}>
                  Komponen wajib
                </span>
                <ul className="mt-3 grid gap-2">
                  {t.components.slice(0, 4).map((c, i) => (
                    <li key={c} className="grid text-[12.5px] leading-snug" style={{ gridTemplateColumns: "26px 1fr", gap: 8 }}>
                      <span className="f-mono tnum text-[10px]" style={{ color: "var(--neutral)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 reveal">
        <Plate naturalW={1440} label={`Pelat ${t.no} · papan spesifikasi`} meta="palet · tipografi · metrik · komponen · state" filename={t.files.spec}>
          <SpecBoard t={t} />
        </Plate>
      </div>
    </section>
  );
}

function ContactSheet() {
  const csRef = useRef<HTMLDivElement>(null);
  return (
    <section id="kontak" className="mx-auto max-w-[1600px] px-5 md:px-8 py-16" style={{ borderTop: `2px solid var(--ink)`, scrollMarginTop: 56 }}>
      <div className="grid lg:grid-cols-12 gap-6 items-end mb-9">
        <div className="lg:col-span-7 reveal">
          <Kicker>Spread 03 · contact sheet</Kicker>
          <h2 className="f-display" style={{ fontSize: "clamp(2.2rem,4vw,3.6rem)", lineHeight: 1, letterSpacing: "-0.02em", fontWeight: 400, marginTop: 14 }}>
            Delapan wajah berdampingan
          </h2>
        </div>
        <p className="lg:col-span-5 text-[14px] leading-relaxed" style={{ color: "#4a4740" }}>
          Semua pelat memakai data toko yang disusun ulang strukturnya. Untuk membandingkan komposisi, biarkan mata memindai sekilas —
          perbedaan terlihat pada kepadatan, tinggi blok, dan jumlah putih.
        </p>
      </div>

      <div className="flex items-end justify-between gap-4 pb-3">
        <span className="f-mono sc text-[10px]" style={{ color: "var(--neutral)" }}>
          25-contact-sheet.png · 8 storefront berdampingan
        </span>
        <ExportButton target={csRef} filename="25-contact-sheet.png">
          ekspor contact sheet ↓
        </ExportButton>
      </div>

      <div ref={csRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {themes.map((t) => (
          <figure key={t.id} className="reveal">
            <div className="p-2" style={{ background: "#faf8f3", border: `1px solid ${RULE}` }}>
              <Plate naturalW={1440} bare minScale={0.12} filename={t.files.desktop}>
                <Desktop t={t} />
              </Plate>
            </div>
            <figcaption className="flex items-baseline justify-between gap-2 mt-2 f-mono text-[10px]">
              <span style={{ color: "var(--accent)" }}>{t.no}</span>
              <span className="flex-1 truncate" style={{ color: "var(--ink)" }}>
                {t.name}
              </span>
              <span className="tnum" style={{ color: "var(--neutral)" }}>
                {t.tokens.accent}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Guide() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(guide);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };
  const download = () => {
    const blob = new Blob([guide], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "26-guide.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="panduan" className="mx-auto max-w-[1600px] px-5 md:px-8 py-16" style={{ borderTop: `2px solid var(--ink)`, scrollMarginTop: 56 }}>
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 reveal">
          <Kicker>Spread 04 · panduan</Kicker>
          <h2 className="f-display" style={{ fontSize: "clamp(2rem,3.4vw,3rem)", lineHeight: 1.02, letterSpacing: "-0.02em", fontWeight: 400, marginTop: 14 }}>
            26-guide.md
          </h2>
          <p className="text-[14.5px] leading-relaxed mt-5" style={{ color: "#4a4740" }}>
            Satu berkas Markdown berisi filosofi visual, matriks pembeda, aturan implementasi, indeks nama berkas, dan batas pekerjaan —
            agar AI implementor lain dapat melanjutkan paket ini tanpa menebak.
          </p>
          <div className="flex gap-3 mt-6">
            <button onClick={copy} className="f-mono sc text-[10px] px-4 py-3 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]" style={{ border: `1px solid var(--ink)`, background: "transparent", color: "var(--ink)", cursor: "pointer" }}>
              {copied ? "tersalin ✓" : "salin markdown"}
            </button>
            <button onClick={download} className="f-mono sc text-[10px] px-4 py-3 transition-colors" style={{ border: `1px solid var(--accent)`, background: "var(--accent)", color: "#fff", cursor: "pointer" }}>
              unduh .md ↓
            </button>
          </div>
          <div className="f-mono text-[10.5px] leading-relaxed mt-7" style={{ color: "var(--neutral)" }}>
            nama berkas dalam paket
            <br />
            00-cover-index.png
            <br />
            01…08-{"<tema>"}-desktop-1440.png
            <br />
            01…08-{"<tema>"}-mobile-390.png
            <br />
            01…08-{"<tema>"}-spec-board.png
            <br />
            25-contact-sheet.png
            <br />
            26-guide.md
          </div>
        </div>

        <div className="lg:col-span-8 reveal">
          <div style={{ border: `1px solid ${RULE}`, background: "#faf8f3" }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${RULE}` }}>
              <span className="f-mono sc text-[9.5px]" style={{ color: "var(--accent)" }}>
                pratinjau berkas
              </span>
              <span className="f-mono text-[9.5px] tnum" style={{ color: "var(--neutral)" }}>
                {guide.length.toLocaleString("id-ID")} karakter
              </span>
            </div>
            <pre className="f-mono text-[12px] leading-[1.75] whitespace-pre-wrap px-5 py-5 overflow-auto" style={{ maxHeight: 560, color: "#2b2922" }}>
              {guide}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `2px solid var(--ink)`, background: "#eae6db" }}>
      <div className="mx-auto max-w-[1600px] px-5 md:px-8 py-12 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <span className="f-mono sc text-[10px]" style={{ color: "var(--accent)" }}>
            Batas pekerjaan
          </span>
          <ul className="mt-4 grid gap-2.5 text-[13.5px] leading-snug">
            {[
              "Tidak mengubah repositori maupun situs TokoLink.",
              "Tidak menulis kode frontend/backend.",
              "Tidak mengimplementasikan pemilih tema.",
              "Keluaran: aset desain pelat PNG + panduan visual.",
            ].map((s) => (
              <li key={s} className="grid" style={{ gridTemplateColumns: "16px 1fr" }}>
                <span style={{ color: "var(--accent)" }}>—</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <span className="f-mono sc text-[10px]" style={{ color: "var(--neutral)" }}>
            Tautan
          </span>
          <div className="mt-4 grid gap-2 text-[13.5px]">
            <a href="https://github.com/Bxxcv/TokoLink" target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>
              github.com/Bxxcv/TokoLink ↗
            </a>
            <a href="https://tokolink-kappa.vercel.app" target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>
              tokolink-kappa.vercel.app ↗
            </a>
            <a href="https://tokolink-kappa.vercel.app/#/s/demo-account" target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>
              akun demo · /#/s/demo-account ↗
            </a>
          </div>
        </div>
        <div className="md:col-span-3 md:text-right">
          <div className="f-display" style={{ fontSize: 30, lineHeight: 1.05 }}>
            Editorial
            <br />
            spec book
          </div>
          <div className="f-mono text-[10px] mt-4" style={{ color: "var(--neutral)" }}>
            edisi 01 · mei 2026
            <br />
            26 png + 1 markdown
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  useReveal();
  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", minHeight: "100vh" }}>
      <TopBar />
      <main style={{ paddingTop: 46 }}>
        <Cover />
        <Matrix />
        {themes.map((t) => (
          <ThemeSection key={t.id} t={t} />
        ))}
        <ContactSheet />
        <Guide />
      </main>
      <Footer />
    </div>
  );
}
