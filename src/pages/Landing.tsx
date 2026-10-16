import { useEffect, useRef, useState } from "react";
import { Link, navigate } from "../lib/router";
import { FAQ, SALES_30, DAY_LABELS } from "../dev/mock";
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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 24);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? doc.scrollTop / max : 0);
    };
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
      {/* reading progress — thin brand line pinned to the header's bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-[2px]" aria-hidden="true">
        <div
          className="h-full origin-left bg-brand-500 transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </header>
  );
}

/* Desktop-only live order strip: the status badge cycles Menunggu → Lunas
   so the hero feels alive. Pauses entirely when the visitor prefers reduced
   motion (stays on "Menunggu bayar"). */
function LiveOrderCard() {
  const [paid, setPaid] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setPaid((p) => !p), 3600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="notch ml-auto max-w-[330px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
      <div className="micro flex items-center justify-between text-brand-300">
        <span>Contoh tampilan pesanan</span>
      </div>
      <div className="mt-3 rounded-md bg-white p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="tnum text-[13px] font-bold text-navy-800">TL-2502-0192</div>
            <div className="mt-0.5 text-[13px] text-muted">Rizky Maulana · Bandung</div>
          </div>
          <Badge tone={paid ? "green" : "blue"} dot>
            <span className="transition-all duration-500">{paid ? "Lunas" : "Menunggu bayar"}</span>
          </Badge>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-linesoft pt-3">
          <span className="text-[12.5px] text-faint">2 × Kue Lapis Legit</span>
          <span className="tnum text-[15px] font-bold text-ink">Rp170.000</span>
        </div>
        <div
          className={cx(
            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-out",
            paid ? "mt-2.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="flex items-start gap-1.5 text-[12px] font-semibold text-[#0a7a55]">
              <Icon name="check" size={13} strokeWidth={2.8} className="mt-px shrink-0" />
              QRIS diterima otomatis — pesanan masuk antrean kemas
            </div>
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-2 text-[13px] text-white/80">
        {["Pembayaran QRIS diterima otomatis", "Status pesanan terpantau penjual"].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <Icon name="check" size={15} className="mt-0.5 shrink-0 text-brand-400" strokeWidth={2.4} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hero() {
  const [videoOk, setVideoOk] = useState(true);
  return (
    <section className="relative isolate min-h-[640px] overflow-hidden bg-navy-900 lg:min-h-[760px]">
      {/* Konten di atas (z-10); di HP teks berdiri di latar solid, video
          menyusul utuh 16:9 di bawah — desktop tetap video jadi latar. */}
      <PageShell className="relative z-10">
        <div className="grid items-center gap-10 pb-16 pt-32 lg:min-h-[760px] lg:grid-cols-12 lg:pb-24 lg:pt-36">
          <div className="lg:col-span-7">
            <TagChip tone="white">
              <span className="text-brand-400">01</span> Untuk UMKM Indonesia
            </TagChip>

            <h1 className="mt-6 text-[38px] font-extrabold leading-[1.04] tracking-[-0.035em] text-white drop-shadow-[0_2px_12px_rgba(6,27,69,0.55)] sm:text-[52px] lg:text-[62px]">
              Wujudkan Toko
              <br />
              Online Anda{" "}
              <span className="relative whitespace-nowrap text-brand-400">
                Dengan Mudah
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
              <ButtonLink
                to="/demo-account"
                size="lg"
                variant="secondary"
                className="border-white/30! bg-transparent! text-white! hover:border-white/60 hover:bg-white/10 hover:text-white sm:px-7"
              >
                Lihat contoh toko
              </ButtonLink>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6">
              {[
                ["1 link", "bio, katalog & checkout"],
                ["QRIS", "semua e-wallet & m-banking"],
                ["Rp0", "mulai paket gratis"],
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
            <LiveOrderCard />
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

      {/* Redup sedang — desktop saja (mobile tidak butuh, teks di latar solid):
          brightness 0.78 + gradient kiri cukup kuat buat zona teks. */}
      <div className="pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-r from-navy-900/80 via-navy-900/35 to-navy-900/10 lg:block" />
      <div className="pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-t from-navy-900/65 via-transparent to-transparent lg:block" />

      {/* Poster diam — latar desktop sekalian pengganti kalau video gagal */}
      <img
        src="images/hero-poster.jpg"
        alt=""
        aria-hidden="true"
        className="hidden brightness-[0.78] lg:absolute lg:inset-0 lg:z-0 lg:block lg:h-full lg:w-full lg:object-cover lg:object-[65%_50%]"
      />
      {/* Video: HP = strip 16:9 UTUH di bawah teks (tanpa crop, tanpa redup);
          desktop = latar penuh seperti sebelumnya. */}
      {videoOk ? (
        <video
          className="relative z-0 aspect-video w-full border-t border-white/12 object-cover lg:absolute lg:inset-0 lg:z-0 lg:h-full lg:w-full lg:border-t-0 lg:brightness-[0.78] lg:object-[65%_50%]"
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
      ) : (
        <img
          src="images/hero-poster.jpg"
          alt=""
          aria-hidden="true"
          className="relative z-0 aspect-video w-full border-t border-white/12 object-cover lg:hidden"
        />
      )}
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
      d: "tokolink.store/nama-toko kamu langsung bisa dibuka di HP. Ringan, cepat, dan tidak perlu dirawat.",
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
      t: "Bayar lewat QRIS",
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
    { n: "02", t: "Unggah produk", d: "Foto, harga, dan stok. Bisa satu per satu atau banyak sekaligus.", time: "5 menit" },
    { n: "03", t: "Bagikan tautan", d: "Taruh di bio Instagram, status WhatsApp, dan cetak QR untuk toko fisik.", time: "2 menit" },
    { n: "04", t: "Terima pesanan", d: "Notifikasi masuk, pembayaran tercatat, barang dikirim, dana bisa ditarik.", time: "harian" },
  ];
  return (
    <section id="cara-kerja" className="relative border-b border-line bg-canvas py-24 lg:py-32">
      <div className="blueprint-light absolute inset-0" aria-hidden="true" />
      <PageShell className="relative">
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
              <li key={s.n} className="group relative flex gap-4 lg:block">
                <div className="relative z-10 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-navy-800 bg-white transition-colors duration-200 group-hover:border-brand-600">
                  <span className="tnum text-[15px] font-bold text-navy-800 transition-colors duration-200 group-hover:text-brand-700">{s.n}</span>
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-canvas bg-brand-500 transition-transform duration-200 group-hover:scale-125" />
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
      d: "Pilih dari 8 tema etalase. Tampilan Klasik bisa atur warna aksen. Perubahan langsung terlihat oleh pembeli.",
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
    <section id="fitur" className="border-b border-line bg-white py-16 lg:py-24">
      <PageShell>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            index="04"
            kicker="Fitur inti"
            title="Yang benar-benar dipakai setiap hari."
            lead="Bukan daftar panjang fitur yang jarang dibuka. Ini yang dipakai penjual setiap pagi."
          />
          <button onClick={() => goTo("cara-kerja")} className="hidden items-center gap-1 text-[14px] font-semibold text-muted transition-colors hover:text-ink sm:inline-flex">
            Lihat cara kerja <Icon name="arrowRight" size={16} />
          </button>
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
    ["1 link", "bio, katalog, dan checkout dalam satu halaman"],
    ["QRIS", "pembayaran e-wallet & m-banking"],
    ["1 hari", "target cair penarikan ke rekening"],
    ["Rp0", "mulai gratis, naik Premium bila perlu"],
  ];
  return (
    <section id="manfaat" className="relative overflow-hidden bg-navy-900 py-24 lg:py-32">
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
              Hasil tiap toko tergantung produk dan promosinya masing-masing.
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
  const data = period === "7 hari" ? SALES_30.slice(-7) : SALES_30;
  return (
    <section id="analitik" className="border-b border-line bg-white py-24 lg:py-32">
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
                  Toko Contoh · Laporan
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
                <span className="text-[12.5px] text-muted">Contoh tampilan laporan di dasbor penjual</span>
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
  /* Preview toko INTERAKTIF — alur sama seperti toko asli (kategori,
     cari, detail, keranjang), tapi semuanya lokal di browser: tidak ada
     query/database, tidak mempengaruhi server. Teks di dalam preview
     select-none supaya tidak bisa di-copy. */
  type DemoProduct = { n: string; p: number; c: string; img: string };
  const products: DemoProduct[] = [
    { n: "Kue Lapis Legit 380g", p: 85000, c: "Kue & Snack", img: "images/p-lapis.jpg" },
    { n: "Sambal Bawang 250ml", p: 32000, c: "Sambal", img: "images/p-sambal.jpg" },
    { n: "Kopi Robusta 200g", p: 46000, c: "Kopi", img: "images/p-kopi.jpg" },
    { n: "Keripik Singkong 200g", p: 24000, c: "Kue & Snack", img: "images/p-keripik.jpg" },
  ];
  const cats = ["Semua", "Kue & Snack", "Sambal", "Kopi"];
  const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

  const [cat, setCat] = useState("Semua");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [detail, setDetail] = useState<number | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const notify = (m: string) => setToast(m);
  const list = products
    .map((p, i) => ({ ...p, i }))
    .filter((p) => (cat === "Semua" ? true : p.c === cat))
    .filter((p) => p.n.toLowerCase().includes(q.toLowerCase()));
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = Object.entries(cart).reduce((s, [i, qty]) => s + products[+i].p * qty, 0);
  const bump = (i: number, d: number) =>
    setCart((c) => {
      const next = Math.max(0, (c[i] ?? 0) + d);
      const copy = { ...c };
      if (next === 0) delete copy[i];
      else copy[i] = next;
      return copy;
    });
  const openDetail = (i: number) => {
    setDetail(i);
    setDetailQty(1);
  };

  return (
    <section className="border-b border-line bg-canvas py-16 lg:py-24">
      <PageShell>
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-6">
            <SectionHead
              index="07"
              kicker="Contoh tampilan"
              title="Toko yang enak dilihat di HP pembeli."
              lead="Sebagian besar pembeli datang dari satu tautan di bio. Maka halaman toko harus ringan, jelas, dan enak digeser. Coba klik-klik preview di samping — semuanya berjalan, tapi tidak menyimpan apa pun."
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
              <ButtonLink to="/register">Coba gratis</ButtonLink>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:col-span-6">
            {/* iPhone frame — miniatur interaktif StoreHome klasik. */}
            <div className="relative w-full max-w-[300px] select-none">
              <div className="relative overflow-hidden rounded-[38px] border-[9px] border-[#14161c] bg-canvas shadow-[0_24px_60px_-18px_rgba(6,27,69,0.45)]">
                {/* dynamic island */}
                <div className="absolute left-1/2 top-[9px] z-30 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-[#14161c]" />
                {/* status bar */}
                <div className="relative z-20 flex h-[46px] items-center justify-between bg-white px-6 pb-1 pt-2.5">
                  <span className="tnum text-[12.5px] font-bold text-ink">09.41</span>
                  <span className="flex items-center gap-1.5 text-ink" aria-hidden="true">
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
                      <rect x="0" y="7" width="3" height="4" rx="0.8" />
                      <rect x="4.3" y="5" width="3" height="6" rx="0.8" />
                      <rect x="8.6" y="2.5" width="3" height="8.5" rx="0.8" />
                      <rect x="12.9" y="0" width="3" height="11" rx="0.8" opacity="0.3" />
                    </svg>
                    <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
                      <path d="M7.5 10.5 5.2 8.1a3.4 3.4 0 0 1 4.6 0L7.5 10.5Zm-4.1-4.2L1.3 4.1a9 9 0 0 1 12.4 0l-2.1 2.2a6 6 0 0 0-8.2 0Z" />
                    </svg>
                    <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
                      <rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="currentColor" opacity="0.4" />
                      <rect x="2" y="2" width="14" height="7" rx="1.6" fill="currentColor" />
                      <path d="M22 4v3a2 2 0 0 0 0-3Z" fill="currentColor" opacity="0.4" />
                    </svg>
                  </span>
                </div>

                {/* mini storefront screen */}
                <div className="relative h-[520px] overflow-hidden bg-canvas">
                  {/* app bar */}
                  <div className="flex items-center justify-between border-b border-line bg-white px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      <LogoMark size={18} />
                      <span className="text-[13px] font-extrabold text-ink">Toko Contoh</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setDrawer(true)}
                      className="relative text-ink transition-transform active:scale-90"
                      aria-label="Buka keranjang"
                    >
                      <Icon name="box" size={18} />
                      {count > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                          {count}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* scrollable store content */}
                  <div className="tl-scroll h-[calc(100%-45px)] overflow-y-auto pb-16">
                    {/* cover — tinggi lega */}
                    <div className="relative h-[116px]">
                      <img src="images/store-cover.jpg" alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/25 to-navy-900/10" />
                    </div>

                    {/* profile card — DI BAWAH cover, tidak menumpuk (permintaan user) */}
                    <div className="px-3">
                      <div className="mt-3 rounded-lg border border-line bg-white p-3 shadow-card">
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-canvas">
                            <LogoMark size={28} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-extrabold leading-tight text-ink">Toko Contoh</div>
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                              <Icon name="pin" size={11} className="text-faint" /> Bandung · Kuliner rumahan
                            </div>
                            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-sm bg-oksoft px-1.5 py-0.5 text-[10.5px] font-bold text-[#0a7a55]">
                              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Buka · 08.00–20.00
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => notify("Preview demo — di toko asli, tombol ini membuka chat WhatsApp.")}
                            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#0a7a56] px-2.5 text-[11.5px] font-bold text-white transition-opacity hover:opacity-90 active:opacity-75"
                          >
                            <Icon name="wa" size={13} /> Chat
                          </button>
                        </div>
                        <div className="mt-2.5 flex gap-1.5 border-t border-linesoft pt-2.5">
                          {([
                            ["ig", "Instagram"],
                            ["qr", "QR toko"],
                          ] as const).map(([i, l]) => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => notify("Preview demo — link ini aktif di toko asli.")}
                              className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2 py-1 text-[10.5px] font-semibold text-muted transition-colors hover:border-brand-300 hover:text-brand-700"
                            >
                              <Icon name={i} size={11} className="text-brand-500" /> {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* kategori + cari */}
                      <div className="mt-3 flex items-center gap-1.5">
                        <div className="tl-scroll flex gap-1.5 overflow-x-auto">
                          {cats.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setCat(c)}
                              className={cx(
                                "whitespace-nowrap rounded-sm px-2 py-[3px] text-[10.5px] font-semibold transition-colors",
                                cat === c ? "bg-navy-800 text-white" : "border border-line bg-white text-muted hover:border-brand-300",
                              )}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                        <span className="relative ml-auto">
                          <Icon name="search" size={11} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-faint" />
                          <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Cari"
                            aria-label="Cari produk di preview"
                            className="h-6 w-[64px] rounded-md border border-line bg-white pl-5 pr-1.5 text-[10.5px] text-ink outline-none placeholder:text-faint focus:border-brand-400"
                          />
                        </span>
                      </div>

                      {/* produk */}
                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        {list.map((p) => (
                          <button
                            key={p.n}
                            type="button"
                            onClick={() => openDetail(p.i)}
                            className="overflow-hidden rounded-md border border-line bg-white text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-brand-300 active:translate-y-0"
                          >
                            <img src={p.img} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                            <div className="p-2">
                              <div className="truncate text-[10.5px] font-semibold text-ink">{p.n}</div>
                              <div className="mt-0.5 flex items-center justify-between">
                                <span className="tnum text-[11px] font-bold text-brand-700">{rp(p.p)}</span>
                                <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-600 text-white" aria-hidden="true">
                                  <Icon name="plus" size={11} strokeWidth={3} />
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                        {list.length === 0 && (
                          <div className="col-span-2 rounded-md border border-dashed border-line bg-white px-3 py-5 text-center">
                            <div className="text-[11px] font-bold text-ink">Produk tidak ditemukan</div>
                            <button
                              type="button"
                              onClick={() => {
                                setQ("");
                                setCat("Semua");
                              }}
                              className="mt-1 text-[10.5px] font-semibold text-brand-700 underline underline-offset-2"
                            >
                              Tampilkan semua
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* cart bar */}
                  {count > 0 && !detail && (
                    <button
                      type="button"
                      onClick={() => setDrawer(true)}
                      className="absolute inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-lg bg-navy-900 px-3.5 py-2.5 shadow-lift transition-transform active:scale-[0.98]"
                    >
                      <span className="text-[11.5px] font-semibold text-white/85">
                        <span className="tnum font-bold text-white">{count} barang</span> · {rp(total)}
                      </span>
                      <span className="rounded-md bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-navy-900">
                        Lihat keranjang
                      </span>
                    </button>
                  )}

                  {/* demo toast */}
                  {toast && (
                    <div className="fade absolute inset-x-3 top-2 z-50 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-center text-[10.5px] font-semibold leading-snug text-brand-700 shadow-card">
                      {toast}
                    </div>
                  )}

                  {/* detail produk */}
                  {detail !== null && (
                    <div className="fade absolute inset-0 z-40 flex flex-col bg-white">
                      <div className="flex items-center justify-between border-b border-line px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setDetail(null)}
                          className="flex items-center gap-1 text-[12px] font-bold text-ink"
                        >
                          <Icon name="left" size={15} /> Kembali
                        </button>
                        <span className="micro text-faint">Detail produk</span>
                      </div>
                      <div className="flex-1 overflow-y-auto tl-scroll">
                        <img src={products[detail].img} alt="" className="aspect-[4/3] w-full object-cover" />
                        <div className="p-3">
                          <div className="text-[14px] font-extrabold leading-snug text-ink">{products[detail].n}</div>
                          <div className="tnum mt-1 text-[15px] font-bold text-brand-700">{rp(products[detail].p)}</div>
                          <div className="mt-1.5 flex items-center gap-1 text-[10.5px] font-semibold text-[#0a7a55]">
                            <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Stok tersedia
                          </div>
                          <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                            Dibuat segar tiap hari, dikemas aman untuk pengiriman luar kota. Tanya stok lewat
                            tombol WhatsApp kalau pesanan mendesak.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 border-t border-line bg-white px-3 py-2.5">
                        <div className="flex items-center gap-1.5 rounded-md border border-line px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => setDetailQty((v) => Math.max(1, v - 1))}
                            className="grid h-6 w-6 place-items-center rounded text-ink hover:bg-canvas"
                            aria-label="Kurangi jumlah"
                          >
                            <Icon name="minus" size={12} strokeWidth={3} />
                          </button>
                          <span className="tnum w-5 text-center text-[12px] font-bold text-ink">{detailQty}</span>
                          <button
                            type="button"
                            onClick={() => setDetailQty((v) => v + 1)}
                            className="grid h-6 w-6 place-items-center rounded text-ink hover:bg-canvas"
                            aria-label="Tambah jumlah"
                          >
                            <Icon name="plus" size={12} strokeWidth={3} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCart((c) => ({ ...c, [detail]: (c[detail] ?? 0) + detailQty }));
                            setDetail(null);
                            notify("Masuk keranjang (demo — tidak disimpan).");
                          }}
                          className="flex-1 rounded-md bg-brand-600 py-2 text-[12px] font-bold text-white transition-colors hover:bg-brand-700 active:bg-brand-800"
                        >
                          Masukkan keranjang
                        </button>
                      </div>
                    </div>
                  )}

                  {/* keranjang drawer */}
                  {drawer && (
                    <>
                      <button
                        type="button"
                        aria-label="Tutup keranjang"
                        onClick={() => setDrawer(false)}
                        className="absolute inset-0 z-40 bg-navy-900/40"
                      />
                      <div className="fade absolute inset-x-0 bottom-0 z-50 max-h-[75%] overflow-y-auto tl-scroll rounded-t-xl border-t border-line bg-white p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-extrabold text-ink">Keranjang</span>
                          <button type="button" onClick={() => setDrawer(false)} className="text-muted" aria-label="Tutup">
                            <Icon name="x" size={16} />
                          </button>
                        </div>
                        {count === 0 ? (
                          <div className="py-6 text-center">
                            <div className="text-[12px] font-bold text-ink">Keranjang masih kosong</div>
                            <p className="mt-1 text-[11px] text-muted">Tap produk untuk melihat detail.</p>
                          </div>
                        ) : (
                          <>
                            <div className="mt-2.5 space-y-2">
                              {Object.entries(cart).map(([idx, qty]) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <img src={products[+idx].img} alt="" className="h-9 w-9 rounded-md border border-line object-cover" />
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-[11px] font-semibold text-ink">{products[+idx].n}</div>
                                    <div className="tnum text-[11px] font-bold text-brand-700">{rp(products[+idx].p * qty)}</div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => bump(+idx, -1)}
                                      className="grid h-6 w-6 place-items-center rounded border border-line text-ink hover:bg-canvas"
                                      aria-label="Kurangi"
                                    >
                                      <Icon name="minus" size={11} strokeWidth={3} />
                                    </button>
                                    <span className="tnum w-4 text-center text-[11px] font-bold">{qty}</span>
                                    <button
                                      type="button"
                                      onClick={() => bump(+idx, 1)}
                                      className="grid h-6 w-6 place-items-center rounded border border-line text-ink hover:bg-canvas"
                                      aria-label="Tambah"
                                    >
                                      <Icon name="plus" size={11} strokeWidth={3} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-linesoft pt-2.5">
                              <span className="text-[11.5px] font-semibold text-muted">Total</span>
                              <span className="tnum text-[13px] font-extrabold text-ink">{rp(total)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => notify("Preview demo — di toko asli, lanjut ke bayar QRIS.")}
                              className="mt-2.5 w-full rounded-md bg-brand-600 py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-brand-700 active:bg-brand-800"
                            >
                              Lanjut bayar
                            </button>
                            <p className="mt-1.5 text-center text-[10px] text-faint">Preview demo — tidak ada transaksi nyata</p>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* home indicator */}
                <div className="flex h-[22px] items-center justify-center bg-canvas">
                  <span className="h-[4px] w-[110px] rounded-full bg-ink/25" />
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
      feats: ["1 halaman toko", "Maks 20 produk", "Tema Klasik", "3 tautan bio", "Bayar QRIS", "Catatan pesanan", "Bantuan lewat WhatsApp"],
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
        "8 tema etalase + badge Premium",
        "Tautan bio tanpa batas",
        "Analitik + traffic + unduh CSV",
      ],
      cta: "Pilih Premium",
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

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
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
    <section id="faq" className="border-b border-line bg-canvas py-24 lg:py-32">
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
                  <a
                    href="https://wa.me/6285191245042?text=Halo%20TokoLink,%20saya%20butuh%20bantuan."
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-[13.5px] font-bold text-brand-700 underline underline-offset-4"
                  >
                    Chat tim TokoLink
                  </a>
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
            <span className="micro text-center text-white/60">Tanpa kartu kredit</span>
          </div>
        </div>
      </PageShell>
    </section>
  );
}

/* --------------------------------- footer --------------------------------- */
function Footer() {
  /* Only real destinations: landing anchors + pages that actually exist.
     No placeholder columns (Karier/Blog/Mitra) — they read as fake. */
  type FootLink = { l: string; to?: string; href?: string; anchor?: boolean };
  const cols: { t: string; links: FootLink[] }[] = [
    {
      t: "Jelajahi",
      links: [
        { l: "Cara kerja", to: "cara-kerja", anchor: true },
        { l: "Fitur", to: "fitur", anchor: true },
        { l: "Laporan jualan", to: "analitik", anchor: true },
        { l: "Harga", to: "harga", anchor: true },
        { l: "Pertanyaan umum", to: "faq", anchor: true },
      ],
    },
    {
      t: "Penjual",
      links: [
        { l: "Buka toko gratis", to: "/register" },
        { l: "Masuk dashboard", to: "/login" },
        { l: "Contoh toko", to: "/demo-account" },
      ],
    },
    {
      t: "Bantuan",
      links: [
        { l: "Chat WhatsApp", href: "https://wa.me/6285191245042?text=Halo%20TokoLink,%20saya%20butuh%20bantuan." },
        { l: "Syarat layanan", to: "/legal/terms" },
        { l: "Kebijakan privasi", to: "/legal/privacy" },
      ],
    },
  ];
  const linkClass =
    "text-left text-[14px] text-white/65 transition-colors duration-150 hover:text-white";
  return (
    <footer className="bg-navy-900 pt-12">
      <PageShell>
        <div className="grid gap-8 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo size={32} tone="dark" wordClass="text-brand-500" />
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/60">
              Satu tautan untuk semua jualanmu. Dibuat untuk penjual kecil di Indonesia yang ingin
              terlihat rapi tanpa repot.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href="https://wa.me/6285191245042?text=Halo%20TokoLink,%20saya%20butuh%20bantuan."
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp TokoLink"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors duration-150 hover:border-brand-400 hover:text-brand-400"
              >
                <Icon name="wa" size={17} />
              </a>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.t} className="lg:col-span-2">
              <div className="micro mb-4 text-brand-400">{c.t}</div>
              <ul className="space-y-2.5">
                {c.links.map((link) => (
                  <li key={link.l}>
                    {link.href ? (
                      <a href={link.href} target="_blank" rel="noreferrer" className={linkClass}>
                        {link.l}
                      </a>
                    ) : link.anchor && link.to ? (
                      <button onClick={() => goTo(link.to!)} className={linkClass}>
                        {link.l}
                      </button>
                    ) : (
                      <Link to={link.to ?? "/"} className={linkClass}>
                        {link.l}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* SEO paragraph removed at user request (made the footer feel
            stuffed) — JSON-LD in index.html carries the search signal. */}
        <div className="border-t border-white/12 py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="micro text-white/60">© 2026 TokoLink · tokolink.store</span>
            <span className="flex items-center gap-4">
              <Link to="/legal/terms" className="micro text-white/45 transition-colors hover:text-white/80">
                Syarat layanan
              </Link>
              <Link to="/legal/privacy" className="micro text-white/45 transition-colors hover:text-white/80">
                Kebijakan privasi
              </Link>
            </span>
          </div>
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


