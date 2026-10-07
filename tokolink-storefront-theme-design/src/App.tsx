import { useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, Copy, Download, EyeOff, Grid3x3, ScanLine, ShieldAlert } from "lucide-react";
import { HARD_RULES, REQUIRED_PARTS, THEMES } from "./lib/data";
import { allThemesMarkdown, themeMarkdown } from "./lib/markdown";
import { copyText, downloadText } from "./lib/utils";
import { ThemeSection } from "./components/ThemeSection";
import { Reveal, useActiveTheme } from "./components/Reveal";

export default function App() {
  const active = useActiveTheme(THEMES.length);
  const activeTheme = THEMES.find((t) => t.n === active) ?? THEMES[0];
  const [copiedAll, setCopiedAll] = useState(false);
  const md = useMemo(() => allThemesMarkdown(), []);

  const jump = (n: number) => document.getElementById(`tema-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="relative min-h-screen" style={{ ["--wash" as string]: activeTheme.palette.accent }}>
      {/* latar berlapis */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-paper" />
        <div className="absolute inset-0 bg-grid opacity-70" />
        <div className="absolute inset-0 theme-wash" />
        <div className="absolute inset-0 bg-noise opacity-[0.045] mix-blend-multiply" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-white/45 to-transparent" />
      </div>

      {/* ================= TOPBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-ink/12 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-4 py-2.5 sm:px-6">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-ink text-paper2">
            <ScanLine size={16} strokeWidth={2} />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="font-doc text-[13px] font-extrabold tracking-[-0.01em]">TokoLink</p>
            <p className="font-docmono text-[10px] tracking-[0.1em] text-ink/50 uppercase">spesifikasi etalase · 8 tema</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={async () => {
                const ok = await copyText(md);
                setCopiedAll(ok);
                window.setTimeout(() => setCopiedAll(false), 1600);
              }}
              className="tap hidden items-center gap-1.5 rounded-[10px] border border-ink/20 px-3 py-2 text-[12px] font-semibold sm:inline-flex"
            >
              {copiedAll ? <Check size={14} /> : <Copy size={14} />}
              {copiedAll ? "8 tema tersalin" : "Salin semua markdown"}
            </button>
            <button
              type="button"
              onClick={() => downloadText(md, "tokolink-8-tema-etalase.md")}
              className="tap inline-flex items-center gap-1.5 rounded-[10px] bg-ink px-3 py-2 text-[12px] font-bold text-paper2 hover:bg-teal"
            >
              <Download size={14} /> Unduh .md
            </button>
          </div>
        </div>
        {/* indeks tema */}
        <div className="border-t border-ink/10 bg-paper2/70">
          <div className="no-scrollbar mx-auto flex max-w-[1360px] gap-1.5 overflow-x-auto px-3 py-2 sm:px-6">
            {THEMES.map((t) => (
              <button
                key={t.n}
                type="button"
                onClick={() => jump(t.n)}
                className="tap group inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11.5px] font-semibold whitespace-nowrap"
                style={{
                  borderColor: active === t.n ? t.palette.accent : "rgba(22,24,26,.14)",
                  background: active === t.n ? t.palette.accent : "rgba(255,255,255,.55)",
                  color: active === t.n ? t.onAccent : undefined,
                }}
              >
                <span className="h-2.5 w-2.5 rounded-full border border-ink/15" style={{ background: t.palette.accent }} />
                <span className="font-docmono text-[10px] opacity-60">{t.n}</span> {t.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ================= MASTHEAD ================= */}
      <main className="mx-auto max-w-[1360px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        <section className="grid items-end gap-8 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <p className="font-docmono text-[11px] font-semibold tracking-[0.22em] text-teal uppercase">
              ganti total 8 tema lama · halaman etalase saja
            </p>
            <h1 className="mt-3 font-doc text-[clamp(38px,7.6vw,86px)] leading-[0.92] font-extrabold tracking-[-0.045em]">
              Delapan etalase,
              <br />
              <span className="text-ink/45">satu aturan:</span>
              <br />
              <span
                className="inline-block"
                style={{ color: activeTheme.palette.accent, transition: "color 600ms ease" }}
              >
                tidak ada yang mengarang.
              </span>
            </h1>
            <p className="mt-5 max-w-[60ch] text-[15px] leading-[1.7] text-ink/80">
              Setiap tema di bawah punya <b>pratinjau interaktif</b> (360px → desktop) yang dijalankan dari data
              sah TokoLink: profil toko, status buka/tutup + jam 7 hari, daftar tautan bio, dan katalog produk
              dengan 1 foto, harga Rupiah, stok/HABIS, SKU. Tombol beli hanya satu —{" "}
              <b>“tambah ke keranjang”</b> → checkout QRIS. Silakan klik, cari, filter, tutup toko, dan kosongkan
              katalog: semua keadaan sudah dirancang.
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5 font-docmono text-[11px]">
              {["9 bagian wajib / tema", "maks 5 warna + 4 token badge", "2 keluarga font / tema", "target sentuh ≥44px", "0 statistik karangan"].map(
                (x) => (
                  <span key={x} className="rounded-full border border-ink/15 bg-white/60 px-2.5 py-1">
                    {x}
                  </span>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={() => jump(1)}
              className="tap mt-6 inline-flex items-center gap-2 rounded-[12px] bg-ink px-4 py-3 text-[13px] font-bold text-paper2 hover:bg-teal"
            >
              Mulai dari Tema 1 — Warung Rame <ArrowDown size={15} />
            </button>
          </div>

          {/* aturan mati */}
          <div className="rounded-[18px] border border-ink/15 bg-white/72 p-4 shadow-[0_24px_50px_-36px_rgba(16,20,18,.7)] sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-signal/12 text-signal">
                <ShieldAlert size={15} />
              </span>
              <h2 className="font-doc text-[15px] font-extrabold tracking-[-0.01em]">Aturan mati (pelanggaran = desain ditolak)</h2>
            </div>
            <ol className="space-y-2.5">
              {HARD_RULES.map((r) => (
                <li key={r.n} className="group flex gap-3 rounded-[12px] border border-ink/10 bg-paper2/60 p-3 transition hover:-translate-y-[2px] hover:border-teal/45 hover:bg-white">
                  <span className="mt-[1px] font-docmono text-[11px] font-bold text-signal">0{r.n}</span>
                  <div>
                    <p className="text-[13px] font-bold">{r.title}</p>
                    <p className="mt-0.5 text-[12px] leading-[1.6] text-ink/65">{r.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ticker */}
        <div className="relative mt-10 overflow-hidden rounded-[16px] border border-ink/15 bg-ink py-2.5">
          <div className="ticker flex w-max gap-6 pl-6">
            {[...THEMES, ...THEMES].map((t, i) => (
              <button
                key={`${t.n}-${i}`}
                type="button"
                onClick={() => jump(t.n)}
                className="flex shrink-0 items-center gap-2 font-doc text-[13px] font-bold tracking-[-0.01em] whitespace-nowrap text-paper2/85 hover:text-white"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: t.palette.accent }} />
                Tema {t.n} · {t.name}
                <span className="font-docmono text-[11px] font-normal text-paper2/45">{t.store.city}</span>
              </button>
            ))}
          </div>
        </div>

        {/* checklist bagian wajib */}
        <Reveal className="mt-10">
          <div className="rounded-[18px] border border-ink/15 bg-white/70 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Grid3x3 size={16} className="text-teal" />
              <h2 className="font-doc text-[15px] font-extrabold">9 bagian wajib per tema — urutan dari atas</h2>
              <span className="ml-auto font-docmono text-[11px] text-ink/50">berulang di semua 8 tema, gaya per tema beda</span>
            </div>
            <ol className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {REQUIRED_PARTS.map((p, i) => (
                <li key={p} className="flex items-start gap-2 rounded-[10px] border border-ink/10 bg-paper2/70 px-3 py-2 text-[12.5px] leading-[1.55]">
                  <span className="font-docmono text-[11px] font-bold text-ink/40">{i + 1}</span>
                  <span className="text-ink/80">{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* ================= 8 TEMA ================= */}
        <div className="mt-10 space-y-10">
          {THEMES.map((t, i) => (
            <Reveal key={t.n} delay={i === 0 ? 0 : 40}>
              <ThemeSection theme={t} />
            </Reveal>
          ))}
        </div>

        {/* ================= TABEL LINTAS TEMA ================= */}
        <Reveal className="mt-12">
          <div className="overflow-hidden rounded-[18px] border border-ink/15 bg-white/70">
            <div className="flex flex-wrap items-center gap-2 border-b border-ink/12 px-4 py-3">
              <h2 className="font-doc text-[15px] font-extrabold">Tabel palet, tipografi & pembeda 8 tema</h2>
              <span className="ml-auto font-docmono text-[11px] text-ink/50">blok bisa digeser →</span>
            </div>
            <div className="frame-scroll overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="font-docmono text-[10.5px] tracking-[0.1em] text-ink/55 uppercase">
                    <th className="px-4 py-2.5 font-semibold">#</th>
                    <th className="px-3 py-2.5 font-semibold">Tema</th>
                    <th className="px-3 py-2.5 font-semibold">5 warna</th>
                    <th className="px-3 py-2.5 font-semibold">Display + isi</th>
                    <th className="px-3 py-2.5 font-semibold">Ciri kartu</th>
                    <th className="px-3 py-2.5 font-semibold">Sampul</th>
                    <th className="px-3 py-2.5 font-semibold">Tautan</th>
                  </tr>
                </thead>
                <tbody>
                  {THEMES.map((t) => (
                    <tr key={t.n} className="border-t border-ink/10 align-top transition hover:bg-paper2/70">
                      <td className="px-4 py-3 font-docmono text-ink/45">{t.n}</td>
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => jump(t.n)} className="tap font-doc text-[13px] font-extrabold hover:text-teal">
                          {t.name} <ArrowUpRight size={11} className="inline" />
                        </button>
                        <p className="mt-0.5 max-w-[26ch] text-[11px] leading-snug text-ink/55">{t.mood}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {[t.palette.bg, t.palette.surface, t.palette.text, t.palette.muted, t.palette.accent].map((c) => (
                            <span key={c} className="inline-flex items-center gap-1 rounded-[6px] border border-ink/12 bg-white/70 py-[2px] pr-1.5 pl-[2px] font-docmono text-[10px]">
                              <span className="h-3 w-3 rounded-[3px] border border-ink/15" style={{ background: c }} />
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3 leading-snug">
                        <span className="font-semibold">{t.fonts.display}</span>
                        <br />
                        <span className="text-ink/60">{t.fonts.body}</span>
                      </td>
                      <td className="px-3 py-3 text-ink/70">
                        {t.metrics.photo} · {t.metrics.radius} · tombol {t.metrics.button}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full border border-ink/15 px-2 py-[2px] font-docmono text-[10.5px] uppercase">{t.cover}</span>
                      </td>
                      <td className="px-3 py-3 font-docmono text-[11px]">
                        {t.store.links.length === 0 ? <span className="text-signal">0 → blok dihapus</span> : `${t.store.links.length} tautan`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* ================= DI LUAR CAKUPAN ================= */}
        <Reveal className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[18px] border border-ink/15 bg-white/70 p-5">
            <div className="mb-2 flex items-center gap-2">
              <EyeOff size={16} className="text-ink/50" />
              <h2 className="font-doc text-[15px] font-extrabold">Yang sengaja tidak didesain (halaman bersama)</h2>
            </div>
            <ul className="grid gap-1.5 text-[13px]">
              {[
                "Detail produk — layout & galeri final; etalase hanya menyumbang kartu + 1 foto.",
                "Keranjang penuh — halaman ini hanya menampilkan jumlah + sheet ringkas.",
                "Checkout & bayar QRIS — alur resmi TokoLink, tombol beli menuju ke sana.",
                "Lacak pesanan — di luar etalase.",
                "Semua angka agregat (rating, terjual, jumlah toko) — tidak ada sumber datanya, jadi tidak digambar di tema mana pun.",
              ].map((x) => (
                <li key={x} className="flex gap-2 text-ink/75">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[18px] border border-ink/15 bg-ink p-5 text-paper2">
            <div className="mb-2 flex items-center gap-2">
              <Copy size={16} />
              <h2 className="font-doc text-[15px] font-extrabold">Cara membaca & memindahkan ke kode</h2>
            </div>
            <ol className="space-y-2 text-[13px] leading-[1.6] text-paper2/80">
              {[
                "Tiap tema = 5 variabel warna (--bg --surface --text --muted --accent) + 4 token semantik badge; jangan tambah warna ke-6.",
                "State toko tutup & stok 0 dihitung dari data (store.open, product.stock), bukan dari kelas manual per kartu — satu sumber, semua tombol ikut mati.",
                "Tombol beli selalu komponen yang sama; yang berubah label/warna/interaksi saja (lihat baris “Keadaan…” tiap tema).",
                "Tautan bio 0 → render null; jangan render kerangka kosong. Hal yang sama berlaku untuk baris filter: kalau katalog 0 produk, chip kategori & kolom cari ikut disembunyikan (bukan ditampilkan dalam keadaan mati) — lihat keadaan “toko tanpa produk” di pratinjau.",
                "Semua keadaan bisa dicek langsung di pratinjau: panel “keadaan” di kiri frame.",
              ].map((x, i) => (
                <li key={x} className="flex gap-2.5">
                  <span className="font-docmono text-[11px] font-bold text-[color:var(--wash)]">0{i + 1}</span>
                  <span>{x}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => downloadText(md, "tokolink-8-tema-etalase.md")}
              className="tap mt-4 inline-flex items-center gap-2 rounded-[10px] bg-paper2 px-3.5 py-2.5 text-[12.5px] font-bold text-ink hover:bg-[color:var(--wash)]"
            >
              <Download size={14} /> Unduh 8 blok markdown (format Bagian 7)
            </button>
          </div>
        </Reveal>
      </main>

      <footer className="border-t border-ink/12 bg-paper2/70">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-3 px-4 py-6 text-[12px] text-ink/60 sm:px-6">
          <span className="font-doc text-[13px] font-extrabold text-ink">TokoLink</span>
          <span className="font-docmono">8 tema etalase · spesifikasi desain, bukan kode</span>
          <span className="ml-auto font-docmono text-[11px]">
            preview memakai foto stok sebagai placeholder data produk asli
          </span>
        </div>
      </footer>
    </div>
  );
}

export { themeMarkdown };
