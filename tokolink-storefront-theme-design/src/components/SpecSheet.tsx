import { useState } from "react";
import { Check, Copy, Palette, ScrollText, ShieldCheck } from "lucide-react";
import type { ThemeDef } from "../lib/data";
import { contrastRatio, copyText, rupiah } from "../lib/utils";
import { themeMarkdown } from "../lib/markdown";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group grid gap-1 border-b border-ink/10 py-3 md:grid-cols-[168px_1fr] md:gap-6">
      <dt className="pt-0.5 font-docmono text-[11px] font-medium tracking-[0.14em] text-ink/55 uppercase transition group-hover:text-teal">
        {label}
      </dt>
      <dd className="text-[13.5px] leading-[1.65] text-ink/85">{children}</dd>
    </div>
  );
}

export function Swatches({ theme }: { theme: ThemeDef }) {
  const [copied, setCopied] = useState<string | null>(null);
  const items = [
    { k: "latar", v: theme.palette.bg },
    { k: "permukaan", v: theme.palette.surface },
    { k: "teks", v: theme.palette.text },
    { k: "redup", v: theme.palette.muted },
    { k: "aksen", v: theme.palette.accent },
    { k: "BUKA", v: theme.badges.buka },
    { k: "TUTUP", v: theme.badges.tutup },
    { k: "HABIS", v: theme.badges.habis },
    { k: "SISA N", v: theme.badges.sisa },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <button
          key={it.k}
          type="button"
          onClick={async () => {
            const ok = await copyText(it.v);
            setCopied(ok ? it.k : "gagal");
            window.setTimeout(() => setCopied(null), 1200);
          }}
          className="tap inline-flex items-center gap-2 rounded-[8px] border border-ink/12 bg-white/70 py-1 pr-2.5 pl-1 font-docmono text-[11px]"
          title="Klik untuk salin kode hex"
        >
          <span className="h-5 w-5 rounded-[5px] border border-ink/15" style={{ background: it.v }} />
          <span className="text-ink/60">{it.k}</span>
          <span className="font-semibold">{copied === it.k ? "tersalin ✓" : it.v}</span>
        </button>
      ))}
    </div>
  );
}

const pairs = (t: ThemeDef) => [
  { name: "teks di atas latar", fg: t.palette.text, bg: t.palette.bg },
  { name: "teks di atas permukaan", fg: t.palette.text, bg: t.palette.surface },
  { name: "redup di atas latar", fg: t.palette.muted, bg: t.palette.bg },
  { name: "redup di atas permukaan", fg: t.palette.muted, bg: t.palette.surface },
  { name: "harga (aksen) di atas permukaan", fg: t.palette.accent, bg: t.palette.surface },
  { name: "label tombol di atas aksen", fg: t.onAccent, bg: t.palette.accent },
];

function Contrast({ theme }: { theme: ThemeDef }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {pairs(theme).map((p) => {
        const r = contrastRatio(p.fg, p.bg);
        const pass = r >= 4.5;
        return (
          <div key={p.name} className="flex items-center justify-between gap-3 rounded-[8px] border border-ink/10 bg-white/70 px-3 py-2">
            <span className="text-[12px] text-ink/70">{p.name}</span>
            <span className="flex items-center gap-2">
              <span className="font-docmono text-[11px] font-semibold tnum">{r.toFixed(2)}:1</span>
              <span
                className="rounded-full px-1.5 py-[1px] font-docmono text-[10px] font-bold"
                style={{ background: pass ? "#166B3C18" : "#C8402A1F", color: pass ? "#166B3C" : "#C8402A" }}
              >
                {pass ? "≥ 4,5" : "cek ulang"}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SpecSheet({ theme }: { theme: ThemeDef }) {
  const [tab, setTab] = useState<"spec" | "ascii" | "audit">("spec");
  const [copied, setCopied] = useState(false);
  const s = theme.store;
  const lowStock = s.products.filter((x) => x.stock > 0 && x.stock <= 5).length;
  const zeroStock = s.products.filter((x) => x.stock === 0).length;
  const noPhoto = s.products.filter((x) => !x.photo).length;
  const cats = new Set(s.products.map((x) => x.category)).size;
  const openDays = s.hours.filter((h) => h.range).length;

  const parts = [
    ["Header", "logo · nama · kota · badge status + jam hari ini · Bagikan · QR · Keranjang"],
    ["Profil", `sampul ${theme.cover === "none" ? "TANPA" : theme.cover} · ${s.bio ? "bio tampil penuh" : "bio kosong → fallback kota + jumlah produk"}`],
    ["Tautan bio", `${s.links.length} tautan${s.links.length === 0 ? " → blok dihapus total (bukan kotak kosong)" : " → semua tampil, tanpa \"lihat sisanya\""}`],
    ["Jam 7 hari", `${openDays} hari punya rentang; hari ini ${s.today} ditandai; tutup → “${s.hours[s.todayIndex].range ?? "Tutup"}”`],
    ["Filter", `${cats} kategori asli + cari nama/SKU + reset (disabled saat bersih)`],
    ["Kartu produk", `${s.products.length} produk · ${zeroStock} HABIS · ${lowStock} SISA N · ${noPhoto} tanpa foto → ubin monogram`],
    ["Keadaan kosong", "2 varian wajib: katalog kosong + nol hasil cari (ilustrasi garis + kalimat + aksi nyata)"],
    ["Footer", `${s.name} + ${s.city} + “Dibuat dengan TokoLink”`],
    ["QR toko", `${theme.n === 8 ? "kartu di akhir halaman, ikon header scroll ke sana" : "modal/sheet dari header" + (theme.n === 2 || theme.n === 7 || theme.n === 8 ? " + kartu di footer" : "")} + unduh PNG`],
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-[10px] border border-ink/15 bg-white/70 p-0.5">
          {(
            [
              { k: "spec", l: "Spesifikasi", i: ScrollText },
              { k: "ascii", l: "Sketsa ASCII", i: Palette },
              { k: "audit", l: "Audit aturan", i: ShieldCheck },
            ] as const
          ).map((x) => (
            <button
              key={x.k}
              type="button"
              onClick={() => setTab(x.k)}
              className="tap inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold"
              style={{ background: tab === x.k ? theme.palette.accent : "transparent", color: tab === x.k ? theme.onAccent : undefined }}
            >
              <x.i size={14} /> {x.l}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={async () => {
            const ok = await copyText(themeMarkdown(theme));
            setCopied(ok);
            window.setTimeout(() => setCopied(false), 1400);
          }}
          className="tap ml-auto inline-flex items-center gap-1.5 rounded-[10px] border border-ink/20 bg-transparent px-3 py-1.5 text-[12px] font-semibold"
          title="Salin blok markdown sesuai format serahan Bagian 7"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Markdown tersalin" : "Salin markdown tema ini"}
        </button>
      </div>

      {tab === "spec" && (
        <div>
          <dl className="border-t border-ink/10">
            <Row label="Sasaran">{theme.sasaran} — suasana: {theme.mood}.</Row>
            <Row label="Palet (5 + badge)">
              <Swatches theme={theme} />
            </Row>
            <Row label="Font">
              display <b>{theme.fonts.display}</b> · isi <b>{theme.fonts.body}</b>. Fallback:{" "}
              <span className="font-docmono text-[12px]">{theme.fonts.displayStack}</span> /{" "}
              <span className="font-docmono text-[12px]">{theme.fonts.bodyStack}</span>.
            </Row>
            <Row label="Header">{theme.spec.header}</Row>
            <Row label="Profil & sampul">{theme.spec.profile}</Row>
            <Row label="Tautan bio">{theme.spec.links}</Row>
            <Row label="Jam lengkap">{theme.spec.hours}</Row>
            <Row label="Filter">{theme.spec.filter}</Row>
            <Row label="Kartu produk">{theme.spec.card}</Row>
            <Row label="Keadaan tutup / stok 0 / kosong">{theme.spec.states}</Row>
            <Row label="QR">{theme.spec.qr}</Row>
            <Row label="Data yang dipakai di preview">
              {s.products.length} produk ({zeroStock} stok 0, {lowStock} sisa ≤5), {s.links.length} tautan, jam 7 hari, keranjang awal{" "}
              {s.cartStart} item. Harga termurah {rupiah(Math.min(...s.products.map((x) => x.price)))} — tertinggi{" "}
              {rupiah(Math.max(...s.products.map((x) => x.price)))}.
            </Row>
          </dl>
        </div>
      )}

      {tab === "ascii" && (
        <div>
          <div className="relative overflow-hidden rounded-[12px] border border-ink/15 bg-[#101418]">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 font-docmono text-[11px] text-white/55">
              <span>susunan HP 360px — Tema {theme.n} · {theme.name}</span>
              <button
                type="button"
                onClick={async () => {
                  await copyText(theme.ascii);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                }}
                className="tap text-white/70 hover:text-white"
              >
                {copied ? "tersalin ✓" : "salin sketsa"}
              </button>
            </div>
            <pre className="frame-scroll overflow-x-auto px-3 py-3 font-docmono text-[11.5px] leading-[1.45] text-[#DCE6EA]">
              {theme.ascii}
            </pre>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink/55">
            Lebar blok = 28 sel; tiap kartu produk digambar pada grid 8pt. Versi ≥760px hanya menambah kolom
            grid produk dan memindahkan QR — urutan blok dan semua keadaan tetap sama.
          </p>
        </div>
      )}

      {tab === "audit" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[12px] border border-ink/12 bg-white/70 p-4">
            <h5 className="mb-2 font-docmono text-[11px] font-semibold tracking-[0.16em] text-ink/55 uppercase">
              5 aturan mati — implementasi di tema ini
            </h5>
            <ul className="space-y-2">
              {theme.compliance.map((c, i) => (
                <li key={c} className="flex gap-2.5 text-[13px] leading-[1.6]">
                  <span className="mt-[2px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-teal/12 text-teal">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-ink/80">
                    <b className="font-docmono text-[11px] text-ink/45">R{i + 1}</b> {c}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="rounded-[12px] border border-ink/12 bg-white/70 p-4">
              <h5 className="mb-2 font-docmono text-[11px] font-semibold tracking-[0.16em] text-ink/55 uppercase">
                Kontras terhitung otomatis
              </h5>
              <Contrast theme={theme} />
            </div>
            <div className="rounded-[12px] border border-ink/12 bg-white/70 p-4">
              <h5 className="mb-2 font-docmono text-[11px] font-semibold tracking-[0.16em] text-ink/55 uppercase">
                9 bagian wajib — status di preview
              </h5>
              <ul className="divide-y divide-ink/10">
                {parts.map(([k, v]) => (
                  <li key={k} className="flex flex-wrap items-baseline gap-x-2 py-1.5 text-[12.5px]">
                    <span className="font-semibold">{k}</span>
                    <span className="text-ink/65">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
