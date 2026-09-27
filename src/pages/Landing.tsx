import { useEffect, useRef, useState } from "react";
import { Link, navigate } from "../lib/router";
import { FAQ, SALES_30, DAY_LABELS } from "../lib/data";
import { Logo, LogoMark, TagGlyph } from "../components/Logo";
import { Badge, ButtonLink, Icon, PageShell, TagChip, cx } from "../components/ui";
import { ChartFrame, Legend, LineChart } from "../components/charts";

/* Hero background video (local file, faststart, ~1,3 MB).
   Poster image shows first / as fallback if video fails. */
const HERO_VIDEO_SRC = "images/Hero_video/Hero_video.mp4";

const SECTIONS = [
  { id: "produk", label: "Produk" },
  { id: "cara-kerja", label: "Cara kerja" },
  { id: "fitur", label: "Fitur" },
  { id: "analitik", label: "Analitik" },
  { id: "harga", label: "Harga" },
  { id: "faq", label: "FAQ" },
];

function useScrollspy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.2, 0.6] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids.join(",")]);
  return active;
}

const goTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

/* Lightweight scroll-reveal: a single shared IntersectionObserver toggles
   `.is-visible` (opacity + translate only, no layout impact). Each element is
   unobserved after its first reveal, so there is no ongoing scroll cost. */
let revealObserver: IntersectionObserver | null = null;
function getRevealObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    );
  }
  return revealObserver;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = getRevealObserver();
    if (!obs) {
      el.classList.add("is-visible");
      return;
    }
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return (
    <div ref={ref} className="reveal" style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

function Header() {
  const path = typeof window !== "undefined" ? window.location.hash : "";
  const active = useScrollspy(SECTIONS.map((s) => s.id));
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Light header treatment whenever the bar sits on a light surface:
  // scrolled state OR mobile menu open (the panel itself is white).
  const tint = solid || open;

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-200",
        tint ? "border-b border-line bg-white/95 backdrop-blur-sm shadow-xs" : "border-b border-white/10 bg-navy-900/25 backdrop-blur-[3px]",
        path.includes("login") && "bg-white",
      )}
    >
      <PageShell>
        <div className="flex h-[68px] items-center justify-between gap-6">
          <Link to="/" aria-label="TokoLink beranda">
            <Logo size={30} tone={tint ? "light" : "dark"} wordClass={tint ? "text-navy-800" : "text-white"} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => goTo(s.id)}
                className={cx(
                  "relative rounded-md px-3 py-2 text-[14px] font-semibold transition-colors duration-150",
                  tint
                    ? active === s.id
                      ? "text-brand-700"
                      : "text-muted hover:text-ink"
                    : active === s.id
                      ? "text-white"
                      : "text-white/70 hover:text-white",
                )}
              >
                {s.label}
                <span
                  className={cx(
                    "absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-brand-500 transition-opacity duration-150",
                    active === s.id ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className={cx(
                "hidden rounded-md px-3 py-2 text-[14px] font-semibold transition-colors sm:block",
                tint ? "text-muted hover:text-brand-700" : "text-white/80 hover:text-white",
              )}
            >
              Masuk
            </Link>
            <ButtonLink to="/register" size="sm" className="hidden sm:inline-flex">
              Buka toko gratis
            </ButtonLink>
            <button
              className={cx(
                "rounded-md p-2 transition-colors duration-150 lg:hidden",
                tint ? "text-ink hover:bg-canvas active:bg-linesoft" : "text-white hover:bg-white/10 active:bg-white/15",
              )}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <Icon name={open ? "x" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {open && (
          <div className="fade border-t border-linesoft bg-white pb-4 lg:hidden">
            <nav className="flex flex-col gap-1 py-3" aria-label="Navigasi seluler">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setOpen(false);
                    goTo(s.id);
                  }}
                  aria-current={active === s.id ? "true" : undefined}
                  className={cx(
                    "flex items-center justify-between rounded-md px-3 py-2.5 text-left text-[15px] transition-colors duration-150 active:scale-[0.995]",
                    active === s.id
                      ? "bg-brand-50 font-bold text-brand-700"
                      : "font-semibold text-ink hover:bg-canvas active:bg-linesoft",
                  )}
                >
                  {s.label}
                  <Icon name="right" size={16} className={active === s.id ? "text-brand-500" : "text-faint"} />
                </button>
              ))}
            </nav>
            <div className="flex gap-2 pt-1">
              <ButtonLink to="/login" variant="secondary" className="flex-1">
                Masuk
              </ButtonLink>
              <ButtonLink to="/register" className="flex-1">
                Buka toko gratis
              </ButtonLink>
            </div>
          </div>
        )}
      </PageShell>
    </header>
  );
}

function Hero() {
  const [videoOk, setVideoOk] = useState(true);
  return (
    <section className="relative isolate min-h-[640px] overflow-hidden bg-navy-900 lg:min-h-[760px]">
      {/* ---- video area (final file goes here) ---- */}
      <img
        src="images/hero-poster.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[65%_50%]"
      />
      {videoOk && (
        <video
          className="absolute inset-0 h-full w-full object-cover object-[65%_50%]"
          poster="images/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoOk(false)}
          aria-hidden="true"
        >
          {HERO_VIDEO_SRC && <source src={HERO_VIDEO_SRC} />}
        </video>
      )}
      {/* Keseimbangan akhir: video tetap dominan terlihat, tetapi zona teks
          kiri diberi kanvas gelap yang cukup agar kontras terbaca. */}
      <div className="absolute inset-0 bg-navy-900/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 via-navy-900/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />

      <PageShell className="relative">
        <div className="grid items-center gap-10 pb-16 pt-32 lg:min-h-[760px] lg:grid-cols-12 lg:pb-24 lg:pt-36">
          <div className="lg:col-span-7">
            <TagChip tone="white">
              <span className="text-brand-400">01</span> Untuk UMKM Indonesia
            </TagChip>

            <h1 className="mt-6 text-[38px] font-extrabold leading-[1.04] tracking-[-0.035em] text-white drop-shadow-[0_2px_12px_rgba(6,27,69,0.55)] sm:text-[52px] lg:text-[62px]">
              Satu tautan untuk
              <br />
              semua jualan{" "}
              <span className="relative whitespace-nowrap text-brand-400">
                kamu
                <svg
                  viewBox="0 0 120 12"
                  className="absolute -bottom-1 left-0 h-2.5 w-full"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 8 Q 40 2 118 6" fill="none" stroke="#1B9AE0" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>

            <p className="mt-6 max-w-[540px] text-[16.5px] leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(6,27,69,0.5)] sm:text-[17.5px]">
              Buat halaman toko, unggah produk, terima bayaran lewat QRIS, dan atur pesanan dari satu
              tempat. Tidak perlu bisa bikin website, tidak perlu sewa siapa pun.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/register" size="lg" className="sm:px-7">
                Buka toko sekarang <Icon name="arrowRight" size={17} />
              </ButtonLink>
              <button
                onClick={() => navigate("/s/demo-account")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/30 px-6 text-[15px] font-semibold text-white transition-colors duration-150 hover:border-white/60 hover:bg-white/10"
              >
                <Icon name="eye" size={17} /> Lihat contoh toko
              </button>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6">
              {[
                ["4.820", "toko aktif"],
                ["Rp12,8 M", "diproses tahun ini"],
                ["10 menit", "rata-rata siap jualan"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="tnum text-[22px] font-bold leading-none text-white">{v}</dt>
                  <dd className="micro mt-1.5 text-white/55">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* floating live-order strip */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="notch ml-auto max-w-[330px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="micro flex items-center justify-between text-brand-300">
                <span>Pesanan masuk</span>
                <span className="flex items-center gap-1.5">
                  <span className="pulse-dot relative h-1.5 w-1.5 rounded-full bg-brand-400 text-brand-400" />
                  langsung
                </span>
              </div>
              <div className="mt-3 rounded-md bg-white p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="tnum text-[13px] font-bold text-navy-800">TL-2502-0192</div>
                    <div className="mt-0.5 text-[13px] text-muted">Rizky Maulana · Bandung</div>
                  </div>
                  <Badge tone="blue" dot>
                    Menunggu bayar
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-linesoft pt-3">
                  <span className="text-[12.5px] text-faint">2 × Kue Lapis Legit</span>
                  <span className="tnum text-[15px] font-bold text-ink">Rp170.000</span>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-[13px] text-white/80">
                {["Pembayaran QRIS diterima otomatis", "Nota dikirim ke WhatsApp pembeli"].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Icon name="check" size={15} className="mt-0.5 shrink-0 text-brand-400" strokeWidth={2.4} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* category strip instead of fake client logos */}
        <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/12 py-5">
          <span className="micro text-white/60">Dipakai untuk jualan</span>
          {["Kue rumahan", "Batik & tenun", "Kopi sangrai", "Sambal & bumbu", "Kerajinan", "Hampers"].map((c) => (
            <span key={c} className="flex items-center gap-2 text-[13.5px] font-medium text-white/75">
              <TagGlyph size={13} className="text-brand-400" />
              {c}
            </span>
          ))}
        </div>
      </PageShell>
    </section>
  );
}

function SectionHead({
  index,
  kicker,
  title,
  lead,
  dark = false,
}: {
  index: string;
  kicker: string;
  title: React.ReactNode;
  lead?: string;
  dark?: boolean;
}) {
  return (
    <div className={cx("max-w-2xl", dark && "text-white")}>
      <div className={cx("micro mb-4 flex items-center gap-2.5", dark ? "text-brand-300" : "text-brand-600")}>
        <span className={dark ? "text-white" : "text-ink"}>{index}</span>
        <span className={cx("h-px w-6", dark ? "bg-brand-400/60" : "bg-brand-300")} />
        <span>{kicker}</span>
      </div>
      <h2
        className={cx(
          "text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[40px]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {lead && (
        <p className={cx("mt-4 text-[15.5px] leading-relaxed", dark ? "text-white/70" : "text-muted")}>{lead}</p>
      )}
    </div>
  );
}

/* ------------------------- 02 product explanation ------------------------- */
function Produk() {
  const rows = [
    {
      n: "01",
      icon: "store",
      t: "Halaman toko yang siap pakai",
      d: "tokolink.id/nama-toko kamu langsung bisa dibuka di HP. Ringan, cepat, dan tidak perlu dirawat.",
    },
    {
      n: "02",
      icon: "box",
      t: "Etalase & keranjang sendiri",
      d: "Pembeli memilih produk, memasukkan jumlah, lalu checkout. Stok berkurang otomatis.",
    },
    {
      n: "03",
      icon: "qr",
      t: "Bayar lewat QRIS atau transfer",
      d: "QR bisa dipindai dari layar HP atau dicetak untuk ditaruh di meja kasir.",
    },
    {
      n: "04",
      icon: "receipt",
      t: "Pesanan tercatat rapi",
      d: "Nota, alamat, dan status pengiriman tercatat. Tidak ada lagi pesanan yang tertinggal di chat.",
    },
  ];
  return (
    <section id="produk" className="border-b border-line bg-white py-20 lg:py-28">
      <PageShell>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHead
                index="02"
                kicker="Apa itu TokoLink"
                title={
                  <>
                    Etalase, kasir, dan catatan
                    <br className="hidden sm:block" /> jualan dalam satu tautan.
                  </>
                }
                lead="Selama ini pesanan masuk lewat chat, dibayar lewat transfer, dan dicatat manual. TokoLink merapikan semuanya jadi satu alur yang bisa diikuti siapa pun."
              />
              <div className="mt-7 flex flex-wrap gap-2">
                <ButtonLink to="/s/demo-account" variant="secondary">
                  <Icon name="eye" size={16} /> Buka contoh toko
                </ButtonLink>
                <ButtonLink to="/register">Coba gratis</ButtonLink>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ul className="divide-y divide-linesoft border-y border-line">
              {rows.map((r) => (
                <li key={r.n} className="group flex gap-5 py-6 transition-colors duration-150 hover:bg-canvas/70">
                  <span className="micro w-7 shrink-0 pt-1.5 text-brand-500">{r.n}</span>
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-canvas text-navy-800 transition-colors duration-150 group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-600">
                    <Icon name={r.icon} size={19} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-extrabold text-ink">{r.t}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{r.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageShell>
    </section>
  );
}

/* ----------------------------- 03 how it works ---------------------------- */
function CaraKerja() {
  const steps = [
    { n: "01", t: "Daftar toko", d: "Isi nama toko, kota, dan nomor WhatsApp. Selesai dalam satu menit.", time: "1 menit" },
    { n: "02", t: "Unggah produk", d: "Foto, harga, stok, dan ongkir. Bisa satu per satu atau banyak sekaligus.", time: "5 menit" },
    { n: "03", t: "Bagikan tautan", d: "Taruh di bio Instagram, status WhatsApp, dan cetak QR untuk toko fisik.", time: "2 menit" },
    { n: "04", t: "Terima pesanan", d: "Notifikasi masuk, pembayaran tercatat, barang dikirim, dana bisa ditarik.", time: "harian" },
  ];
  return (
    <section id="cara-kerja" className="border-b border-line bg-canvas py-20 lg:py-28">
      <PageShell>
        <SectionHead
          index="03"
          kicker="Cara kerja"
          title="Empat langkah, satu hari cukup."
          lead="Tidak ada yang perlu dipasang. Semua dikerjakan dari HP, dengan bahasa sehari-hari."
        />

        <div className="relative mt-12">
          {/* connector rail (ring motif) */}
          <div className="absolute left-[26px] top-2 hidden h-[calc(100%-32px)] w-px bg-line sm:block lg:left-0 lg:top-[26px] lg:h-px lg:w-full" />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((s) => (
              <li key={s.n} className="relative flex gap-4 lg:block">
                <div className="relative z-10 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-navy-800 bg-white">
                  <span className="tnum text-[15px] font-bold text-navy-800">{s.n}</span>
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-canvas bg-brand-500" />
                </div>
                <div className="lg:mt-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-extrabold text-ink">{s.t}</h3>
                    <Badge tone="gray">{s.time}</Badge>
                  </div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </PageShell>
    </section>
  );
}

/* ------------------------------ 04 core features -------------------------- */
function Fitur() {
  const cards = [
    {
      span: "lg:col-span-7",
      icon: "image",
      t: "Tampilan toko yang bisa diubah sendiri",
      d: "Pilih warna tema, susunan kategori, sampai foto sampul. Perubahan langsung terlihat oleh pembeli.",
      extra: "mock",
    },
    {
      span: "lg:col-span-5",
      icon: "qr",
      t: "QRIS tanpa daftar ribet",
      d: "Satu QR untuk semua produk. Bisa dipindai dari HP atau dicetak untuk kasir.",
      extra: "qr",
    },
    { span: "lg:col-span-4", icon: "tag", t: "Kode promo & diskon", d: "Buat potongan harga untuk pembeli baru atau untuk hari tertentu." },
    { span: "lg:col-span-4", icon: "chartAlt", t: "Laporan jualan harian", d: "Omzet, produk terlaris, dan jam ramai tertulis jelas, bukan angka acak." },
    { span: "lg:col-span-4", icon: "wa", t: "Chat WhatsApp tersambung", d: "Pembeli bisa tanya stok langsung, pesanan sudah terisi otomatis." },
  ];

  return (
    <section id="fitur" className="border-b border-line bg-white py-20 lg:py-28">
      <PageShell>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            index="04"
            kicker="Fitur inti"
            title="Yang benar-benar dipakai setiap hari."
            lead="Bukan daftar panjang fitur yang jarang dibuka. Ini yang dipakai penjual setiap pagi."
          />
          <ButtonLink to="/register" variant="secondary" className="hidden sm:inline-flex">
            Lihat semua fitur <Icon name="arrowRight" size={16} />
          </ButtonLink>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {cards.map((c) => (
            <article
              key={c.t}
              className={cx(
                "corner-mark group relative flex flex-col overflow-hidden rounded-xl border border-line bg-white p-5 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift sm:p-6",
                c.span,
                c.extra && "sm:col-span-2",
              )}
            >
              <span className="notch-sm mb-4 inline-flex h-9 w-9 items-center justify-center bg-brand-50 text-brand-600">
                <Icon name={c.icon} size={19} />
              </span>
              <h3 className="text-[18px] font-extrabold leading-snug text-ink">{c.t}</h3>
              <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-muted">{c.d}</p>

              {c.extra === "mock" && (
                <div className="mt-5 grid flex-1 grid-cols-3 gap-2.5">
                  {["images/p-lapis.jpg", "images/p-sambal.jpg", "images/p-kopi.jpg"].map((src) => (
                    <div key={src} className="overflow-hidden rounded-md border border-line bg-canvas">
                      <img src={src} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                      <div className="p-2">
                        <div className="h-1.5 w-3/4 rounded-full bg-linesoft" />
                        <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-brand-200" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {c.extra === "qr" && (
                <div className="mt-5 flex flex-1 items-end justify-end">
                  <div className="rounded-md border border-line bg-canvas p-2.5">
                    <QRMark size={76} />
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </PageShell>
    </section>
  );
}

/** Hand-built QR-style matrix (finder patterns drawn for real). */
export function QRMark({ size = 120, fg = "#061B45", bg = "transparent" }: { size?: number; fg?: string; bg?: string }) {
  const n = 25;
  const cells: React.ReactElement[] = [];
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  let seed = 97531;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (isFinder(r, c)) continue;
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) cells.push(<rect key={`t${r}-${c}`} x={c} y={r} width="1" height="1" />);
        continue;
      }
      if (rnd() > 0.52) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />);
    }
  }
  const finder = (x: number, y: number) => (
    <g key={`f${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="none" stroke={fg} strokeWidth="1" />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} shapeRendering="crispEdges" aria-label="QR Toko">
      {bg !== "transparent" && <rect width={n} height={n} fill={bg} />}
      <g fill={fg}>
        {cells}
        {finder(0, 0)}
        {finder(n - 7, 0)}
        {finder(0, n - 7)}
      </g>
    </svg>
  );
}

/* ---------------------------- 05 seller benefits -------------------------- */
function Manfaat() {
  const stats = [
    ["62%", "pembeli datang dari tautan bio"],
    ["3,8%", "rata-rata pengunjung jadi pesanan"],
    ["2 hari", "rata-rata dana bisa ditarik"],
    ["0,7%", "biaya QRIS paket gratis"],
  ];
  return (
    <section id="manfaat" className="relative overflow-hidden bg-navy-900 py-20 lg:py-28">
      <div className="blueprint absolute inset-0 opacity-60" />
      <PageShell className="relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHead
              dark
              index="05"
              kicker="Untuk penjual"
              title="Yang paling terasa setelah pindah ke TokoLink."
              lead="Bukan sekadar tampil rapi. Pesanan jadi tertata, uang jadi terlacak, dan Anda berhenti menyalin-catat manual."
            />
            <ul className="mt-7 space-y-3.5">
              {[
                "Pembeli tidak perlu tanya harga satu-satu, semua sudah tertera.",
                "Stok berkurang sendiri, jadi tidak ada pesanan dobel.",
                "Rekap harian bisa dikirim ke WhatsApp Anda tiap malam.",
                "Saldo bisa ditarik kapan saja, minimal Rp50.000.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-white/78">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-navy-900">
                    <Icon name="check" size={12} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/12 bg-white/12 sm:grid-cols-2">
              {stats.map(([v, l], i) => (
                <div key={l} className="bg-navy-900 p-6 lg:p-7">
                  <div className="micro mb-3 text-brand-400">{String(i + 1).padStart(2, "0")}</div>
                  <div className="tnum text-[36px] font-bold leading-none text-white lg:text-[42px]">{v}</div>
                  <div className="mt-3 text-[14px] leading-snug text-white/65">{l}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12.5px] leading-relaxed text-white/60">
              Angka diambil dari rata-rata toko aktif TokoLink, 90 hari terakhir. Hasil tiap toko bisa
              berbeda.
            </p>
          </div>
        </div>
      </PageShell>
    </section>
  );
}

/* --------------------------- 06 analytics preview ------------------------- */
function Analitik() {
  const [period, setPeriod] = useState("30 hari");
  const data = SALES_30;
  return (
    <section id="analitik" className="border-b border-line bg-white py-20 lg:py-28">
      <PageShell>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHead
              index="06"
              kicker="Laporan jualan"
              title="Angka yang bisa dibaca tanpa kursus."
              lead="Omzet, pesanan, dan pengunjung ditampilkan berdampingan supaya Anda tahu harus memperbaiki apa."
            />
            <ul className="mt-7 space-y-4 border-t border-line pt-6">
              {[
                ["Omzet harian", "Langsung tahu hari ramai dan hari sepi."],
                ["Produk terlaris", "Tahu mana yang harus distok lebih banyak."],
                ["Dari mana pengunjung", "Bio Instagram, WhatsApp, atau QR cetak."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <TagGlyph size={16} className="mt-1 shrink-0 text-brand-500" />
                  <div>
                    <div className="text-[14.5px] font-bold text-ink">{t}</div>
                    <div className="text-[13.5px] text-muted">{d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-8">
            <div className="notch overflow-hidden rounded-xl border border-line bg-white shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas px-5 py-3.5">
                <div className="micro flex items-center gap-2 text-navy-800">
                  <LogoMark size={16} />
                  Dapoer Bu Ani · Laporan
                </div>
                <div className="flex gap-1.5">
                  {["7 hari", "30 hari", "Tahun ini"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={cx(
                        "notch-sm px-2.5 py-1 text-[12px] font-semibold transition-colors duration-150",
                        period === p ? "bg-navy-800 text-white" : "bg-white text-muted hover:text-ink",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-px bg-line sm:grid-cols-3">
                {[
                  ["Omzet", "Rp38.420.000", "+18,4%"],
                  ["Pesanan", "142", "+11,2%"],
                  ["Pengunjung", "2.390", "+26,7%"],
                ].map(([l, v, d]) => (
                  <div key={l} className="bg-white px-5 py-4">
                    <div className="micro text-faint">{l}</div>
                    <div className="tnum mt-1.5 text-[21px] font-bold text-ink">{v}</div>
                    <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-ok">
                      <Icon name="arrowUp" size={12} strokeWidth={2.6} /> {d}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-3 pb-4 pt-5 sm:px-5">
                <ChartFrame
                  title="Omzet 30 hari terakhir"
                  hint="Rp, sudah termasuk biaya kirim yang ditanggung pembeli"
                  legend={<Legend items={[{ color: "#0A69C4", label: "Omzet" }]} />}
                >
                  <LineChart
                    series={data}
                    labels={DAY_LABELS}
                    format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : String(v))}
                  />
                </ChartFrame>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas px-5 py-3">
                <span className="text-[12.5px] text-muted">Diperbarui 12 Feb 2025, 09:44</span>
                <span className="micro text-faint">Sumber: TokoLink Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </section>
  );
}

/* --------------------------- 07 storefront preview ------------------------ */
function StorePreview() {
  const items = [
    ["Kue Lapis Legit 380g", "Rp85.000", "images/p-lapis.jpg"],
    ["Sambal Bawang 250ml", "Rp32.000", "images/p-sambal.jpg"],
    ["Kopi Robusta 200g", "Rp46.000", "images/p-kopi.jpg"],
    ["Keripik Singkong 200g", "Rp24.000", "images/p-keripik.jpg"],
  ];
  return (
    <section className="border-b border-line bg-canvas py-20 lg:py-28">
      <PageShell>
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-6">
            <SectionHead
              index="07"
              kicker="Contoh tampilan"
              title="Toko yang enak dilihat di HP pembeli."
              lead="Sebagian besar pembeli datang dari satu tautan di bio. Maka halaman toko harus ringan, jelas, dan enak digeser."
            />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                ["wa", "Tombol WhatsApp", "Tanya stok tanpa salin nomor."],
                ["qr", "QR toko", "Cetak, taruh di kasir atau etalase."],
                ["clock", "Status buka/tutup", "Pembeli tahu kapan Anda melayani."],
                ["link", "Tautan bio", "Instagram, TikTok, katalog PDF."],
              ].map(([i, t, d]) => (
                <div key={t} className="rounded-lg border border-line bg-white p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-brand-600">
                      <Icon name={i} size={17} />
                    </span>
                    <span className="text-[14.5px] font-bold text-ink">{t}</span>
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-snug text-muted">{d}</p>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <ButtonLink to="/s/demo-account" variant="secondary">
                Buka contoh toko <Icon name="arrowRight" size={16} />
              </ButtonLink>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:col-span-6">
            <div className="relative w-full max-w-[330px]">
              <div className="absolute -inset-4 -z-10 rounded-[42px] border border-line" />
              <div className="overflow-hidden rounded-[34px] border-[7px] border-navy-900 bg-white shadow-lift">
                <div className="relative h-[190px]">
                  <img src="images/store-cover.jpg" alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-navy-800">
                        <LogoMark size={26} />
                      </span>
                      <div className="leading-tight">
                        <div className="text-[15px] font-extrabold text-white">Dapoer Bu Ani</div>
                        <div className="text-[11.5px] text-white/75">Bandung · Kue & bumbu rumahan</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-3.5 py-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-oksoft px-2 py-1 text-[11px] font-bold text-[#0a7a55]">
                      <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Buka sampai 20.00
                    </span>
                    <span className="text-[11.5px] font-semibold text-brand-700">WhatsApp</span>
                  </div>
                  <div className="tl-scroll mt-3 flex gap-1.5 overflow-x-auto pb-1">
                    {["Semua", "Kue & Snack", "Sambal", "Kopi"].map((c, i) => (
                      <span
                        key={c}
                        className={cx(
                          "whitespace-nowrap rounded-sm px-2.5 py-1 text-[11.5px] font-semibold",
                          i === 0 ? "bg-navy-800 text-white" : "border border-line text-muted",
                        )}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {items.map(([t, p, src]) => (
                      <div key={t} className="overflow-hidden rounded-md border border-line">
                        <img src={src} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                        <div className="p-2">
                          <div className="truncate text-[11.5px] font-semibold text-ink">{t}</div>
                          <div className="tnum mt-0.5 text-[12px] font-bold text-brand-700">{p}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-md bg-canvas p-2.5 text-center">
                    <div className="micro text-faint">Pindai untuk buka toko</div>
                    <div className="mt-1.5 flex justify-center">
                      <QRMark size={54} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </section>
  );
}

/* -------------------------------- 08 pricing ------------------------------ */
function Pricing() {
  const [yearly, setYearly] = useState(false);
  const plans = [
    {
      name: "Gratis",
      pop: false,
      m: 0,
      y: 0,
      desc: "Untuk mulai jualan hari ini.",
      feats: ["1 halaman toko", "Sampai 10 produk", "Biaya QRIS 0,7%", "Catatan pesanan & nota", "Bantuan lewat WhatsApp"],
      cta: "Buka toko gratis",
    },
    {
      name: "Premium",
      pop: true,
      m: 59000,
      y: 588000,
      desc: "Untuk toko yang sudah ramai.",
      feats: [
        "Produk tanpa batas",
        "Biaya QRIS 0,5%",
        "Kode promo & diskon",
        "Ganti tema & warna toko",
        "Laporan bisa diunduh (Excel)",
        "Bantuan prioritas",
      ],
      cta: "Pilih Premium",
    },
    {
      name: "Bisnis",
      pop: false,
      m: 199000,
      y: 1990000,
      desc: "Untuk beberapa toko & tim.",
      feats: ["Sampai 5 halaman toko", "5 akun karyawan", "Biaya QRIS 0,45%", "Rekap siap laporan pajak", "Kirim otomatis ke kurir"],
      cta: "Hubungi kami",
    },
  ];

  return (
    <section id="harga" className="border-b border-line bg-white py-20 lg:py-28">
      <PageShell>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHead
            index="08"
            kicker="Harga"
            title="Jujur, tanpa biaya tersembunyi."
            lead="Tidak ada biaya pendaftaran dan tidak ada potongan tersembunyi selain biaya kanal pembayaran."
          />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className={cx("text-[13.5px] font-semibold", !yearly ? "text-ink" : "text-faint")}>Bulanan</span>
            <ToggleLike on={yearly} onChange={setYearly} />
            <span className={cx("text-[13.5px] font-semibold", yearly ? "text-ink" : "text-faint")}>
              Tahunan
            </span>
            <Badge tone="green">hemat 17%</Badge>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cx(
                "relative flex flex-col rounded-xl border p-6 transition-[box-shadow,border-color,transform] duration-150",
                p.pop
                  ? "border-navy-800 bg-navy-900 shadow-lift"
                  : "border-line bg-white hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card",
              )}
            >
              {p.pop && (
                <span className="notch-sm absolute right-0 top-0 bg-brand-500 px-3 py-1.5 micro text-white">
                  Paling dipilih
                </span>
              )}
              <h3 className={cx("text-[19px] font-extrabold", p.pop ? "text-white" : "text-ink")}>{p.name}</h3>
              <p className={cx("mt-1 text-[13.5px]", p.pop ? "text-white/65" : "text-muted")}>{p.desc}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className={cx("tnum text-[34px] font-bold leading-none", p.pop ? "text-white" : "text-ink")}>
                  Rp{(yearly ? Math.round(p.y / 12) : p.m).toLocaleString("id-ID")}
                </span>
                <span className={cx("text-[13px]", p.pop ? "text-white/60" : "text-faint")}>/bulan</span>
              </div>
              <div className={cx("micro mt-2", p.pop ? "text-brand-300" : "text-faint")}>
                {yearly && p.y > 0
                  ? `Ditagih Rp${p.y.toLocaleString("id-ID")} per tahun`
                  : p.m === 0
                    ? "Selamanya gratis"
                    : "Bisa dibatalkan kapan saja"}
              </div>

              <ul className={cx("mt-6 flex-1 space-y-2.5 border-t pt-5", p.pop ? "border-white/15" : "border-linesoft")}>
                {p.feats.map((f) => (
                  <li
                    key={f}
                    className={cx("flex items-start gap-2.5 text-[14px] leading-snug", p.pop ? "text-white/80" : "text-muted")}
                  >
                    <Icon
                      name="check"
                      size={15}
                      strokeWidth={2.6}
                      className={cx("mt-0.5 shrink-0", p.pop ? "text-brand-400" : "text-brand-600")}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <ButtonLink
                  to="/register"
                  variant={p.pop ? "primary" : "secondary"}
                  className={cx("w-full", p.pop && "bg-brand-500! text-navy-900! hover:bg-brand-400!")}
                >
                  {p.cta}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[13.5px] text-muted">
          Sudah punya langganan? Semua paket bisa di-upgrade atau diturunkan kapan saja dari{" "}
          <button onClick={() => navigate("/login")} className="font-semibold text-brand-700 underline underline-offset-4">
            halaman pengaturan
          </button>
          .
        </p>
      </PageShell>
    </section>
  );
}

function ToggleLike({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Ganti periode tagihan"
      onClick={() => onChange(!on)}
      className={cx(
        "relative h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-300 ease-in-out",
        on ? "border-brand-600 bg-brand-600" : "border-line bg-[#E4EAF3]",
      )}
    >
      {/* Track inner box is 42×22; knob 18px with a fixed 2px inset on all
          sides, so travel is exactly 20px: left edge 2px (off) → 22px (on). */}
      <span
        className={cx(
          "absolute left-[2px] top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-xs transition-transform duration-300 ease-in-out",
          on ? "translate-x-[20px]" : "translate-x-0",
        )}
      />
    </button>
  );
}

/* ---------------------------------- 09 FAQ -------------------------------- */
function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-b border-line bg-canvas py-20 lg:py-28">
      <PageShell>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHead index="09" kicker="Pertanyaan" title="Yang sering ditanya penjual." />
            <div className="mt-6 rounded-xl border border-line bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="text-brand-600">
                  <Icon name="wa" size={20} />
                </span>
                <div>
                  <p className="text-[14px] leading-relaxed text-muted">
                    Masih bingung? Tim kami balas di WhatsApp pada jam kerja, 08.00–20.00 WIB.
                  </p>
                  <button className="mt-2 text-[13.5px] font-bold text-brand-700 underline underline-offset-4">
                    Chat tim TokoLink
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              {FAQ.map((f, i) => (
                <div key={f.q} className={cx(i > 0 && "border-t border-linesoft")}>
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    aria-expanded={open === i}
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-canvas/70"
                  >
                    <span className="flex gap-3.5">
                      <span className="micro pt-1 text-brand-500">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[15.5px] font-bold leading-snug text-ink">{f.q}</span>
                    </span>
                    <span
                      className={cx(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-[background-color,border-color,color] duration-300 ease-out",
                        open === i
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-line text-muted",
                      )}
                    >
                      <Icon
                        name="plus"
                        size={15}
                        strokeWidth={2.2}
                        className={cx(
                          "transition-transform duration-300 ease-out",
                          open === i ? "rotate-45" : "rotate-0",
                        )}
                      />
                    </span>
                  </button>
                  <div
                    className={cx(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                      open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 pl-[46px] text-[14.5px] leading-relaxed text-muted">{f.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageShell>
    </section>
  );
}

/* ------------------------------- 10 final CTA ----------------------------- */
function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-navy-800 py-16 lg:py-20">
      <div className="blueprint absolute inset-0 opacity-70" />
      <div className="absolute -right-16 -top-16 opacity-[0.07]">
        <LogoMark size={320} />
      </div>
      <PageShell className="relative">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <TagChip tone="white">
              <span className="text-brand-400">10</span> Mulai hari ini
            </TagChip>
            <h2 className="mt-5 text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[38px]">
              Toko Anda bisa jadi satu jam dari sekarang.
            </h2>
            <p className="mt-3.5 text-[15.5px] leading-relaxed text-white/70">
              Gratis untuk memulai, tanpa kartu kredit, tanpa kontrak. Isi nama toko, unggah tiga
              produk, bagikan tautannya.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3">
            <ButtonLink to="/register" size="lg" className="bg-brand-500! text-navy-900! hover:bg-brand-400!">
              Buka toko gratis <Icon name="arrowRight" size={17} />
            </ButtonLink>
            <ButtonLink
              to="/s/demo-account"
              variant="secondary"
              size="lg"
              className="border-white/30! bg-transparent! text-white! hover:border-white/60 hover:bg-white/10 hover:text-white"
            >
              Lihat contoh toko
            </ButtonLink>
            <span className="micro text-center text-white/60">Tanpa kartu kredit</span>
          </div>
        </div>
      </PageShell>
    </section>
  );
}

/* --------------------------------- footer --------------------------------- */
function Footer() {
  const cols = [
    { t: "Produk", l: ["Halaman toko", "Keranjang & checkout", "QRIS", "Laporan jualan", "Kode promo"] },
    { t: "Penjual", l: ["Buka toko gratis", "Panduan UMKM", "Contoh toko", "Biaya & penarikan", "Status layanan"] },
    { t: "Bantuan", l: ["Pusat bantuan", "Panduan QRIS", "Hubungi WhatsApp", "Syarat layanan", "Kebijakan privasi"] },
    { t: "Perusahaan", l: ["Tentang TokoLink", "Karier", "Blog", "Mitra agen", "Kontak"] },
  ];
  return (
    <footer className="bg-navy-900 pt-12">
      <PageShell>
        <div className="grid gap-8 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo size={32} tone="dark" wordClass="text-brand-500" />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-white/60">
              Satu tautan untuk semua jualanmu. Dibuat untuk penjual kecil di Indonesia yang ingin
              terlihat rapi tanpa repot.
            </p>
            <div className="mt-5 flex gap-2">
              {["wa", "ig", "send"].map((i) => (
                <span
                  key={i}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors duration-150 hover:border-brand-400 hover:text-brand-400"
                >
                  <Icon name={i} size={17} />
                </span>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.t} className="lg:col-span-2">
              <div className="micro mb-4 text-brand-400">{c.t}</div>
              <ul className="space-y-2.5">
                {c.l.map((l) => (
                  <li key={l}>
                    <button className="text-left text-[14px] text-white/65 transition-colors duration-150 hover:text-white">
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/12 py-5">
          <span className="micro text-white/60">© 2026 TokoLink · All rights reserved</span>
        </div>
      </PageShell>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="overflow-x-clip bg-white">
      <Header />
      <Hero />
      <Reveal>
        <Produk />
      </Reveal>
      <Reveal>
        <CaraKerja />
      </Reveal>
      <Reveal>
        <Fitur />
      </Reveal>
      <Reveal>
        <Manfaat />
      </Reveal>
      <Reveal>
        <Analitik />
      </Reveal>
      <Reveal>
        <StorePreview />
      </Reveal>
      <Reveal>
        <Pricing />
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
      <Reveal>
        <CtaBand />
      </Reveal>
      <Footer />
    </div>
  );
}


