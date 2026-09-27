import { useEffect, useMemo, useState } from "react";
import { Link, navigate } from "../lib/router";
import { HOURS, PRODUCTS, rupiah, useApp, type Product } from "../lib/data";
import { supabase } from "../lib/supabase";
import { mapProduct, type DbProduct } from "../lib/products";
import { normalizeWA } from "../lib/format";
import { Logo, LogoMark } from "../components/Logo";
import {
  Badge,
  Button,
  ButtonLink,
  ConfirmDialog,
  EmptyState,
  Field,
  Icon,
  Input,
  Modal,
  PageShell,
  Select,
  Skeleton,
  TagChip,
  Textarea,
  cx,
} from "../components/ui";
import { QRMark } from "./Landing";

const STORE = {
  slug: "dapoer-bu-ani",
  name: "Dapoer Bu Ani",
  city: "Bandung",
  since: "Sejak April 2024",
  rating: 4.9,
  sold: 1284,
  bio: "Masakan rumahan dan bumbu jadi, dimasak pagi hari dikirim siang. Order sebelum 15.00 dikirim hari itu juga.",
  wa: "0812-3456-7890",
  open: true,
  hours: "08.00 – 20.00 WIB",
};

const SHIP = 10000;

/* ------------------------------ shared chrome ----------------------------- */
export type StoreProfile = {
  id: string;
  store_name: string | null;
  store_slug: string | null;
  city: string | null;
  owner_name: string | null;
  wa_number: string | null;
};

/**
 * Profil toko + katalog publik berdasarkan `store_slug`.
 * Hanya memakai policy publik: profil storefront + produk `aktif`.
 */
function usePublicStore(slug: string) {
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data: prof } = await supabase
        .from("profiles")
        .select("id,store_name,store_slug,city,owner_name,wa_number")
        .eq("store_slug", slug)
        .maybeSingle();
      if (!prof) {
        setStore(null);
        setItems([]);
        setNotFound(true);
        setLoading(false);
        return;
      }
      setStore(prof as StoreProfile);
      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", (prof as StoreProfile).id)
        .eq("status", "aktif")
        .order("created_at", { ascending: false });
      setItems(((prods ?? []) as DbProduct[]).map(mapProduct));
      setLoading(false);
    })();
  }, [slug]);

  return { store, items, loading, notFound };
}

/** Bentuk baris `discount_codes` yang dibaca publik saat validasi promo. */
type DiscountRow = {
  seller_id: string;
  code: string;
  type: string;
  value: number | string;
  min_purchase: number | string;
  usage_limit: number | null;
  used_count: number;
  valid_until: string | null;
  is_active: boolean;
};

function StoreHeader({ crumb, store }: { crumb?: string; store?: StoreProfile | null }) {
  const { count } = useApp();
  const name = store?.store_name || STORE.name;
  const slug = store?.store_slug || STORE.slug;
  const city = store?.city || STORE.city;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/96 backdrop-blur-sm">
      <PageShell>
        <div className="flex h-16 items-center gap-3">
          <Link to={`/s/${slug}`} className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy-800">
              <LogoMark size={24} />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-extrabold text-ink">{name}</span>
              <span className="micro text-faint">{crumb ?? `${city} · Kue & bumbu`}</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to={`/s/${slug}`}
              aria-label="Cari produk"
              className="rounded-md border border-line p-2 text-muted transition-colors hover:bg-canvas hover:text-brand-700"
            >
              <Icon name="search" size={17} />
            </Link>
            <Link
              to="/cart"
              aria-label="Keranjang"
              className="relative rounded-md border border-line p-2 text-muted transition-colors hover:bg-canvas hover:text-brand-700"
            >
              <Icon name="box" size={17} />
              {count > 0 && (
                <span className="tnum absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </PageShell>
    </header>
  );
}

function StoreFooter({ store }: { store?: StoreProfile | null }) {
  const name = store?.store_name || STORE.name;
  const city = store?.city || STORE.city;
  return (
    <footer className="border-t border-line bg-white py-8">
      <PageShell>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-canvas text-navy-800">
              <LogoMark size={24} />
            </span>
            <div className="leading-tight">
              <div className="text-[14px] font-bold text-ink">{name}</div>
              <div className="text-[12.5px] text-faint">
                {city} · {STORE.since}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted">
            <Link to="/" className="font-semibold text-brand-700 hover:underline">
              Dibuat dengan TokoLink
            </Link>
            <button className="hover:text-ink">Laporkan toko</button>
            <button className="hover:text-ink">Syarat & privasi</button>
          </div>
        </div>
      </PageShell>
    </footer>
  );
}

function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  small = false,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  small?: boolean;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-line bg-white">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Kurangi"
        className={cx(
          "grid place-items-center text-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-35",
          small ? "h-8 w-8" : "h-10 w-10",
        )}
      >
        <Icon name="minus" size={14} strokeWidth={2.2} />
      </button>
      <span className={cx("tnum text-center font-bold text-ink", small ? "w-8 text-[13px]" : "w-10 text-[15px]")}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Tambah"
        className={cx(
          "grid place-items-center text-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-35",
          small ? "h-8 w-8" : "h-10 w-10",
        )}
      >
        <Icon name="plus" size={14} strokeWidth={2.2} />
      </button>
    </div>
  );
}

function ProductCard({ p, slug, onAdd }: { p: Product; slug: string; onAdd: (p: Product) => void }) {
  const out = p.stock === 0;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card">
      <Link to={`/s/${slug}/p/${p.id}`} className="relative block overflow-hidden bg-canvas">
        <img
          src={p.img}
          alt={p.name}
          loading="lazy"
          className={cx(
            "aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]",
            out && "opacity-55 grayscale",
          )}
        />
        {out && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="notch-sm bg-ink/85 px-3 py-1.5 micro text-white">Stok habis</span>
          </span>
        )}
        {!out && p.stock <= 15 && (
          <span className="notch-sm absolute left-0 top-0 bg-warn px-2 py-1 micro text-white">
            sisa {p.stock}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <div className="micro text-faint">{p.cat}</div>
        <Link
          to={`/s/${slug}/p/${p.id}`}
          className="mt-1 line-clamp-2 text-[14px] font-bold leading-snug text-ink hover:text-brand-700"
        >
          {p.name}
        </Link>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <div className="tnum text-[15.5px] font-bold text-brand-700">{rupiah(p.price)}</div>
            <div className="text-[11.5px] text-faint">{p.unit}</div>
          </div>
          <button
            disabled={out}
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name} ke keranjang`}
            className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 text-white transition-all duration-150 hover:bg-brand-700 active:translate-y-px disabled:pointer-events-none disabled:bg-linesoft disabled:text-faint"
          >
            <Icon name="plus" size={17} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------- store home ------------------------------- */
export function StoreHome({ slug }: { slug: string }) {
  const { add, toast, count } = useApp();
  const { store, items, loading, notFound } = usePublicStore(slug);
  const [cat, setCat] = useState("Semua");
  const [q, setQ] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const cats = useMemo(() => ["Semua", ...Array.from(new Set(items.map((p) => p.cat)))], [items]);
  const list = useMemo(
    () =>
      items.filter((p) => (cat === "Semua" ? true : p.cat === cat)).filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [items, cat, q],
  );
  const name = store?.store_name || STORE.name;
  const city = store?.city || STORE.city;
  const wa = store?.wa_number || STORE.wa;

  if (notFound) {
    return (
      <div className="min-h-screen bg-canvas pb-24">
        <StoreHeader />
        <PageShell className="py-10">
          <EmptyState
            icon="store"
            title="Toko tidak ditemukan"
            desc={`Alamat “tokolink.id/${slug}” tidak terdaftar. Cek lagi ejaannya.`}
            action={<ButtonLink to="/">Kembali ke beranda</ButtonLink>}
          />
        </PageShell>
        <div className="mt-10">
          <StoreFooter />
        </div>
      </div>
    );
  }

  const onAdd = (p: Product) => {
    add(p.id);
    toast(`${p.name} masuk keranjang.`);
  };

  return (
    <div className="min-h-screen bg-canvas pb-24">
      <StoreHeader store={store} />

      {/* cover */}
      <div className="relative h-[190px] overflow-hidden bg-navy-900 sm:h-[240px]">
        <img src="images/store-cover.jpg" alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/35 to-navy-900/20" />
        <div className="blueprint absolute inset-0 opacity-40" />
        <PageShell className="absolute inset-x-0 top-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-navy-900/55 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              <Icon name="left" size={15} /> TokoLink
            </Link>
              <button
                onClick={() => {
                  setShared(true);
                  toast(`Tautan toko disalin: tokolink.id/${slug}`, "info");
                  setTimeout(() => setShared(false), 1600);
                }}
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              <Icon name={shared ? "check" : "external"} size={15} /> {shared ? "Tersalin" : "Bagikan"}
            </button>
          </div>
        </PageShell>
      </div>

      {/* profile */}
      <PageShell className="relative -mt-12">
        <div className="rounded-xl border border-line bg-white p-4 shadow-card sm:p-5">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas shadow-xs">
              <LogoMark size={42} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">{name}</h1>
                <Badge tone="blue">Premium</Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
                <span className="flex items-center gap-1.5">
                  <Icon name="pin" size={14} className="text-faint" /> {city}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="star" size={14} className="text-warn" />{" "}
                  <span className="tnum font-semibold text-ink">{STORE.rating}</span> ·{" "}
                  <span className="tnum">{STORE.sold}</span> terjual
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="clock" size={14} className="text-faint" /> {STORE.since}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">{STORE.bio}</p>
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <button
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#0a7a56] px-4 text-[13.5px] font-bold text-white transition-colors hover:bg-[#0b6b4b] sm:flex-none"
                onClick={() => toast("Membuka chat WhatsApp " + wa, "info")}
              >
                <Icon name="wa" size={17} /> Chat WhatsApp
              </button>
              <button
                onClick={() => setQrOpen(true)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-line px-4 text-[13.5px] font-bold text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 sm:flex-none"
              >
                <Icon name="qr" size={17} /> QR toko
              </button>
            </div>
          </div>

          {/* open status strip */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-linesoft pt-3.5">
            <span
              className={cx(
                "inline-flex items-center gap-2 rounded-sm px-2.5 py-1 text-[12.5px] font-bold",
                STORE.open ? "bg-oksoft text-[#0a7a55]" : "bg-badsoft text-bad",
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className={cx("h-2 w-2 rounded-full", STORE.open ? "bg-ok" : "bg-bad")} />
              </span>
              {STORE.open ? `Buka · ${STORE.hours}` : "Tutup"}
            </span>
            <span className="text-[13px] text-muted">
              Pesanan sebelum 15.00 dikirim hari ini juga.
            </span>
          </div>

          {/* bio links */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-linesoft pt-4">
            {[
              ["wa", "Reseller & agen"],
              ["ig", "Instagram"],
              ["link", "Katalog PDF"],
              ["doc", "Resep"],
            ].map(([i, label]) => (
              <button
                key={label}
                onClick={() => toast(`Membuka tautan ${label}`, "info")}
                className="group inline-flex items-center gap-2 rounded-md border border-line bg-canvas px-3 py-2 text-[13px] font-semibold text-muted transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                <Icon name={i === "doc" ? "receipt" : i} size={15} className="text-brand-500" />
                {label}
                <Icon name="right" size={13} className="text-faint transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>

        {/* catalog */}
        <div className="mt-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="micro mb-1.5 text-brand-600">01 / Katalog</div>
              <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">Produk dijual</h2>
            </div>
            <div className="relative w-full sm:w-64">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari produk…"
                className="h-10 pl-9"
                aria-label="Cari produk"
              />
            </div>
          </div>

          <div className="tl-scroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cx(
                  "whitespace-nowrap rounded-md border px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-150",
                  cat === c
                    ? "border-navy-800 bg-navy-800 text-white"
                    : "border-line bg-white text-muted hover:border-brand-300 hover:text-brand-700",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-line bg-white p-3">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <Skeleton className="mt-3 h-4 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <EmptyState
                icon="search"
                title="Produk tidak ditemukan"
                desc={`Tidak ada produk yang cocok dengan “${q || cat}”. Coba kata kunci lain atau pilih kategori Semua.`}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQ("");
                      setCat("Semua");
                    }}
                  >
                    Tampilkan semua produk
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((p) => (
                  <ProductCard key={p.id} p={p} slug={slug} onAdd={onAdd} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* info + QR */}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-line bg-white p-5 lg:col-span-2">
            <div className="micro mb-3 text-brand-600">02 / Jam buka</div>
            <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {HOURS.map((h) => (
                <li
                  key={h.d}
                  className={cx(
                    "flex items-center justify-between border-b border-linesoft py-2 text-[13.5px] last:border-0",
                    h.on ? "text-ink" : "text-faint",
                  )}
                >
                  <span className="font-semibold">{h.d}</span>
                  <span className="tnum">{h.on ? `${h.open} – ${h.close}` : "Libur"}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-linesoft pt-4 text-[13.5px] text-muted">
              <span className="flex items-center gap-2">
                <Icon name="pin" size={15} className="text-brand-500" /> Jl. Cihampelas No. 28, Bandung
              </span>
              <span className="flex items-center gap-2">
                <Icon name="truck" size={15} className="text-brand-500" /> GoSend · JNE · kirim sendiri
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-line bg-navy-900 p-5 text-center">
            <div className="micro text-brand-300">Pindai untuk simpan</div>
            <div className="rounded-lg bg-white p-3">
              <QRMark size={104} />
            </div>
            <p className="text-[12.5px] leading-snug text-white/60">
              Cetak QR ini untuk kasir atau etalase toko.
            </p>
            <button
              onClick={() => setQrOpen(true)}
              className="text-[13px] font-bold text-brand-400 underline underline-offset-4"
            >
              Unduh QR
            </button>
          </div>
        </div>

        {count > 0 && (
          <div className="sticky bottom-20 z-30 mt-6 lg:hidden">
            <ButtonLink to="/cart" className="w-full shadow-lift" size="lg">
              <Icon name="box" size={17} /> Lihat keranjang ({count})
            </ButtonLink>
          </div>
        )}
      </PageShell>

      <div className="mt-10">
        <StoreFooter store={store} />
      </div>

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="QR TokoLink" eyebrow={name} width="max-w-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative rounded-lg border border-line bg-white p-4">
            <QRMark size={176} />
            <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-white">
              <LogoMark size={34} />
            </span>
          </div>
          <div>
            <div className="tnum text-[15px] font-bold text-ink">tokolink.id/{slug}</div>
            <p className="mt-1 text-[13px] text-muted">
              Pindai untuk membuka toko. Aman dicetak hitam putih.
            </p>
          </div>
          <div className="flex w-full gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => toast("QR diunduh ke perangkat.")}>
              <Icon name="download" size={16} /> Unduh
            </Button>
            <Button className="flex-1" onClick={() => toast("Tautan QR disalin.")}>
              <Icon name="copy" size={16} /> Salin tautan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ----------------------------- product detail ----------------------------- */
export function ProductDetail({ id, slug }: { id: string; slug: string }) {
  const { add, toast } = useApp();
  const [p, setP] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data } = await supabase.from("products").select("*").eq("id", id).eq("status", "aktif").maybeSingle();
      if (!data) {
        setP(null);
        setRelated([]);
        setNotFound(true);
        setLoading(false);
        return;
      }
      const mapped = mapProduct(data as DbProduct);
      setP(mapped);
      const sellerId = (data as DbProduct).seller_id;
      const { data: prof } = await supabase
        .from("profiles")
        .select("id,store_name,store_slug,city,owner_name,wa_number")
        .eq("id", sellerId)
        .maybeSingle();
      setStore((prof as StoreProfile | null) ?? null);
      const { data: rel } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", (data as DbProduct).seller_id)
        .eq("status", "aktif")
        .neq("id", id)
        .limit(4);
      setRelated(((rel ?? []) as DbProduct[]).map(mapProduct));
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas pb-32 lg:pb-16">
        <StoreHeader />
        <PageShell className="py-5">
          <Skeleton className="h-5 w-56" />
          <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-10">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </PageShell>
      </div>
    );
  }

  if (notFound || !p) {
    return (
      <div className="min-h-screen bg-canvas pb-32 lg:pb-16">
        <StoreHeader />
        <PageShell className="py-10">
          <EmptyState
            icon="search"
            title="Produk tidak ditemukan"
            desc="Produk ini sudah tidak dijual atau tautannya salah."
            action={<ButtonLink to={`/s/${slug}`}>Kembali ke toko</ButtonLink>}
          />
        </PageShell>
      </div>
    );
  }

  const out = p.stock === 0;
  const positions = ["50% 50%", "20% 30%", "80% 70%"];

  return (
    <div className="min-h-screen bg-canvas pb-32 lg:pb-16">
      <StoreHeader crumb={`Katalog / ${p.cat}`} store={store} />

      <PageShell className="py-5">
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-faint">
          <Link to={`/s/${slug}`} className="hover:text-brand-700">
            Kembali ke toko
          </Link>
          <Icon name="right" size={13} />
          <span>{p.cat}</span>
          <Icon name="right" size={13} />
          <span className="text-muted">{p.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <img
                src={p.img}
                alt={p.name}
                className="aspect-[4/3] w-full object-cover"
                style={{ objectPosition: positions[shot] }}
              />
            </div>
            <div className="mt-3 flex gap-2.5">
              {positions.map((pos, i) => (
                <button
                  key={pos}
                  onClick={() => setShot(i)}
                  aria-label={`Foto ${i + 1}`}
                  className={cx(
                    "relative w-20 overflow-hidden rounded-md border-2 transition-colors duration-150",
                    shot === i ? "border-brand-600" : "border-transparent hover:border-brand-200",
                  )}
                >
                  <img src={p.img} alt="" className="aspect-square w-full object-cover" style={{ objectPosition: pos }} />
                  <span className="absolute bottom-0.5 right-0.5 rounded-xs bg-ink/70 px-1 text-[9px] font-bold text-white tnum">
                    0{i + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="micro text-brand-600">{p.cat}</div>
            <h1 className="mt-2 text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[30px]">
              {p.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px] text-muted">
              <span className="flex items-center gap-1.5">
                <Icon name="star" size={15} className="text-warn" /> 4,9 (86 ulasan)
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="box" size={15} className="text-faint" />{" "}
                <span className="tnum">{p.sold}</span> terjual
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="tag" size={15} className="text-faint" /> SKU <span className="tnum">{p.sku}</span>
              </span>
            </div>

            <div className="mt-5 rounded-lg border border-line bg-white p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="micro text-faint">Harga</div>
                  <div className="tnum mt-1 text-[30px] font-bold leading-none text-brand-700">
                    {rupiah(p.price)}
                  </div>
                </div>
                <span
                  className={cx(
                    "rounded-sm px-2.5 py-1 text-[12.5px] font-bold",
                    out ? "bg-badsoft text-bad" : p.stock <= 15 ? "bg-warnsoft text-warn" : "bg-oksoft text-[#0a7a55]",
                  )}
                >
                  {out ? "Stok habis" : `Stok ${p.stock} ${p.unit.replace("/", "").trim()}`}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-linesoft pt-4">
                <span className="text-[13.5px] font-semibold text-ink">Jumlah</span>
                <Stepper value={qty} onChange={setQty} max={Math.max(1, p.stock)} />
              </div>
            </div>

            <div className="mt-4 space-y-2.5 rounded-lg border border-line bg-white p-4 text-[13.5px]">
              {[
                ["truck", "Pengiriman", "GoSend instan Rp18.000 · JNE reguler Rp10.000"],
                ["clock", "Estimasi tiba", "Bandung hari ini · luar kota 2–3 hari"],
                ["shield", "Garansi toko", "Barang rusak atau salah kirim diganti penuh"],
              ].map(([i, t, d]) => (
                <div key={t} className="flex gap-3">
                  <Icon name={i} size={17} className="mt-0.5 shrink-0 text-brand-500" />
                  <div>
                    <span className="font-bold text-ink">{t}</span>
                    <span className="text-muted"> — {d}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="micro mb-2 text-faint">Deskripsi</div>
              <p className="text-[14.5px] leading-relaxed text-muted">{p.desc}</p>
            </div>

            <div className="mt-6 hidden gap-2.5 lg:flex">
              <Button
                size="lg"
                disabled={out}
                onClick={() => {
                  add(p.id, qty);
                  toast(`${qty} × ${p.name} masuk keranjang.`);
                }}
                className="flex-1"
              >
                <Icon name="box" size={17} /> Tambah ke keranjang
              </Button>
              <Button
                size="lg"
                variant="secondary"
                disabled={out}
                onClick={() => toast("Membuka chat WhatsApp dengan detail pesanan…", "info")}
              >
                <Icon name="wa" size={17} className="text-[#0a7a56]" /> Pesan via WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="micro mb-3 text-brand-600">Produk lain di toko ini</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} slug={slug} onAdd={(x) => { add(x.id); toast(`${x.name} masuk keranjang.`); }} />
            ))}
          </div>
        </div>
      </PageShell>

      {/* mobile sticky action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/97 px-4 py-3 backdrop-blur-sm lg:hidden">
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            size="lg"
            disabled={out}
            onClick={() => toast("Membuka chat WhatsApp…", "info")}
            className="px-4"
            aria-label="WhatsApp"
          >
            <Icon name="wa" size={18} className="text-[#0a7a56]" />
          </Button>
          <Button
            size="lg"
            disabled={out}
            className="flex-1"
            onClick={() => {
              add(p.id, qty);
              toast(`${qty} × ${p.name} masuk keranjang.`);
            }}
          >
            {out ? "Stok habis" : `Tambah · ${rupiah(p.price * qty)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- cart ---------------------------------- */
/**
 * Item keranjang di-resolve ke baris `products` asli (publik, `aktif`).
 * Kode promo divalidasi ke `discount_codes` milik seller (server akan cek
 * ulang saat create-order).
 */
function useTotals(promo: string | null) {
  const { cart } = useApp();
  const [items, setItems] = useState<{ p: Product; qty: number; sellerId: string }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [shipDisc, setShipDisc] = useState(0);
  const [promoNote, setPromoNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (cart.length === 0) {
        setItems([]);
        setDiscount(0);
        setShipDisc(0);
        setPromoNote("");
        setLoading(false);
        return;
      }
      setLoading(true);
      // ID mock lama (mis. "p1") bukan uuid → dibuang dulu, kalau ikut
      // dikirim PostgREST menolak seluruh query dan keranjang jadi kosong.
      const ids = [...new Set(cart.map((c) => c.id))].filter((id) => /^[0-9a-f-]{36}$/i.test(id));
      const { data } = await supabase.from("products").select("*").in("id", ids).eq("status", "aktif");
      const rows = ((data ?? []) as DbProduct[]);
      const byId = new Map(rows.map((r) => [r.id, r]));
      const resolved = cart.flatMap((c) => {
        const r = byId.get(c.id);
        return r && r.seller_id ? [{ p: mapProduct(r), qty: c.qty, sellerId: r.seller_id }] : [];
      });
      setItems(resolved);

      // Kode promo milik seller — validasi: aktif, belum kedaluwarsa,
      // kuota masih ada, subtotal seller tsb cukup (server cek ulang saat
      // create-order; di sini hanya untuk tampilan total).
      let disc = 0;
      let sd = 0;
      let note = "";
      const code = (promo ?? "").trim();
      if (code && resolved.length > 0) {
        const sellerIds = [...new Set(resolved.map((i) => i.sellerId))];
        const { data: codes } = await supabase
          .from("discount_codes")
          .select("seller_id,code,type,value,min_purchase,usage_limit,used_count,valid_until,is_active")
          .in("seller_id", sellerIds)
          .eq("is_active", true);
        const match = ((codes ?? []) as DiscountRow[]).find((d) => d.code.toLowerCase() === code.toLowerCase());
        if (!match) {
          note = "Kode tidak dikenal di toko ini.";
        } else {
          const today = new Date().toISOString().slice(0, 10);
          const sellerSubtotal = resolved
            .filter((i) => i.sellerId === match.seller_id)
            .reduce((s, i) => s + i.p.price * i.qty, 0);
          if (match.valid_until && match.valid_until < today) note = "Kode sudah kedaluwarsa.";
          else if (match.usage_limit != null && match.used_count >= match.usage_limit) note = "Kuota kode habis.";
          else if (sellerSubtotal < Number(match.min_purchase))
            note = `Belanja kurang dari ${rupiah(Number(match.min_purchase))}.`;
          else if (match.type === "persen") {
            disc = Math.round((sellerSubtotal * Number(match.value)) / 100);
            note = `Potongan ${match.value}%.`;
          } else if (match.type === "nominal") {
            disc = Math.min(Math.round(Number(match.value)), sellerSubtotal);
            note = `Potongan ${rupiah(Number(match.value))}.`;
          } else {
            sd = Math.round(Number(match.value));
            note = "Potongan ongkir dipakai.";
          }
        }
      }
      setDiscount(disc);
      setShipDisc(sd);
      setPromoNote(note);
      setLoading(false);
    })();
  }, [cart, promo]);

  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  const baseShipping = subtotal === 0 ? 0 : subtotal >= 200000 ? 0 : SHIP;
  const shipping = Math.max(0, baseShipping - shipDisc);
  const total = subtotal - discount + shipping;
  const promoValid = discount > 0 || shipDisc > 0;
  return { items, subtotal, discount, shipping, total, promoNote, promoValid, loading };
}

/** Toko pemilik item pertama di keranjang (untuk header + link kembali). */
function useCartStore(items: { sellerId: string }[]) {
  const [store, setStore] = useState<StoreProfile | null>(null);
  const sellerId = items.length > 0 ? items[0].sellerId : null;
  useEffect(() => {
    if (!sellerId) {
      setStore(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,store_name,store_slug,city,owner_name,wa_number")
        .eq("id", sellerId)
        .maybeSingle();
      setStore((data as StoreProfile | null) ?? null);
    })();
  }, [sellerId]);
  return store;
}

export function Cart() {
  const { setQty, promo, setPromo, toast } = useApp();
  const { items, subtotal, discount, shipping, total, promoNote, promoValid, loading } = useTotals(promo);
  const store = useCartStore(items);
  const storeSlug = store?.store_slug || "dapoer-bu-ani";
  const [code, setCode] = useState("");
  const [remove, setRemove] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="min-h-screen bg-canvas pb-28">
      <StoreHeader crumb="Keranjang belanja" store={store} />
      <PageShell className="py-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <div className="micro mb-2 text-brand-600">02 / Keranjang</div>
            <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-ink">Keranjang belanja</h1>
          </div>
          <Link to={`/s/${storeSlug}`} className="text-[13.5px] font-semibold text-brand-700 hover:underline">
            Tambah produk lain
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="box"
            title="Keranjang masih kosong"
            desc="Pilih produk dulu dari katalog toko. Barang yang dipilih akan tersimpan di sini sampai Anda selesai belanja."
            action={
              <ButtonLink to={`/s/${storeSlug}`}>
                Lihat produk <Icon name="arrowRight" size={16} />
              </ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">
              {items.map(({ p, qty }) => (
                <div
                  key={p.id}
                  className="flex gap-3.5 rounded-xl border border-line bg-white p-3.5 sm:gap-4 sm:p-4"
                >
                  <Link to={`/s/${storeSlug}/p/${p.id}`} className="shrink-0">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="h-20 w-20 rounded-md border border-line object-cover sm:h-24 sm:w-24"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/s/${storeSlug}/p/${p.id}`}
                          className="line-clamp-2 text-[15px] font-bold leading-snug text-ink hover:text-brand-700"
                        >
                          {p.name}
                        </Link>
                        <div className="micro mt-1 text-faint">
                          {p.sku} · {p.unit}
                        </div>
                      </div>
                      <button
                        onClick={() => setRemove({ id: p.id, name: p.name })}
                        aria-label={`Hapus ${p.name}`}
                        className="rounded-md p-1.5 text-faint transition-colors hover:bg-badsoft hover:text-bad"
                      >
                        <Icon name="trash" size={17} />
                      </button>
                    </div>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                      <div className="flex items-center gap-3">
                        <Stepper value={qty} onChange={(v) => setQty(p.id, v)} small max={p.stock || 1} />
                        <span className="text-[12.5px] text-faint">
                          @<span className="tnum">{rupiah(p.price)}</span>
                        </span>
                      </div>
                      <div className="tnum text-[17px] font-bold text-ink">{rupiah(p.price * qty)}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-line bg-white p-4">
                <div className="micro mb-3 text-faint">Punya kode promo?</div>
                <div className="flex gap-2">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    placeholder="Contoh: HEMAT10"
                    className="h-10"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-10"
                    onClick={() => {
                      if (!code.trim()) return toast("Tulis dulu kode promonya.", "bad");
                      setPromo(code.trim());
                      setCode("");
                    }}
                  >
                    Pakai
                  </Button>
                </div>
                {promo && (
                  <div
                    className={cx(
                      "mt-3 flex items-center justify-between rounded-md px-3 py-2.5",
                      promoValid ? "bg-oksoft" : "bg-warnsoft",
                    )}
                  >
                    <span
                      className={cx(
                        "flex items-center gap-2 text-[13px] font-bold",
                        promoValid ? "text-[#0a7a55]" : "text-warn",
                      )}
                    >
                      <Icon name={promoValid ? "checkCircle" : "alert"} size={15} /> {promo}{" "}
                      {promoNote || "dicek…"}
                    </span>
                    <button
                      onClick={() => setPromo(null)}
                      className="text-[12.5px] font-semibold text-[#0a7a55] underline underline-offset-4"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="notch rounded-xl border border-line bg-white p-5 shadow-card">
                <div className="micro mb-4 text-brand-600">Ringkasan belanja</div>
                <dl className="space-y-2.5 text-[14px]">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="tnum font-semibold text-ink">{rupiah(subtotal)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted">Diskon {promo}</dt>
                      <dd className="tnum font-semibold text-ok">−{rupiah(discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted">Ongkos kirim</dt>
                    <dd className="tnum font-semibold text-ink">
                      {shipping === 0 ? <span className="text-ok">Gratis</span> : rupiah(shipping)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-end justify-between border-t border-linesoft pt-4">
                  <span className="text-[14px] font-bold text-ink">Total bayar</span>
                  <span className="tnum text-[24px] font-bold leading-none text-brand-700">{rupiah(total)}</span>
                </div>
                <ButtonLink to="/checkout" size="lg" className="mt-5 w-full">
                  Lanjut ke pembayaran <Icon name="arrowRight" size={17} />
                </ButtonLink>
                <p className="mt-3 text-center text-[12.5px] leading-snug text-faint">
                  Pembayaran diproses lewat QRIS. Barang dikirim setelah pembayaran terkonfirmasi.
                </p>
              </div>
            </aside>
          </div>
        )}
      </PageShell>

      <ConfirmDialog
        open={!!remove}
        onClose={() => setRemove(null)}
        title={`Hapus ${remove?.name ?? ""} dari keranjang?`}
        body="Produk akan diambil dari keranjang. Anda bisa menambahkannya lagi kapan saja."
        confirmLabel="Hapus produk"
        onConfirm={() => {
          if (remove) {
            setQty(remove.id, 0);
            toast("Produk dihapus dari keranjang.", "warn");
          }
        }}
      />
    </div>
  );
}

/* -------------------------------- checkout -------------------------------- */
export function Checkout() {
  const { cart, toast, promo } = useApp();
  const { items, subtotal, discount, shipping, total } = useTotals(promo);
  const store = useCartStore(items);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    addr: "",
    city: "Bandung",
    note: "",
    ship: "Reguler (2–3 hari)",
    pay: "QRIS",
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0) navigate("/cart");
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (form.name.trim().length < 3) n.name = "Tulis nama penerima.";
    if (form.phone.replace(/\D/g, "").length < 9) n.phone = "Nomor WhatsApp belum benar.";
    if (form.addr.trim().length < 10) n.addr = "Alamat lengkap: jalan, nomor, kecamatan.";
    setErr(n);
    if (Object.keys(n).length) {
      toast("Beberapa isian masih perlu diperbaiki.", "bad");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(form.pay === "QRIS" ? "/checkout/qris" : "/checkout/status");
    }, 900);
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-canvas pb-28">
      <StoreHeader crumb="Checkout" store={store} />
      <PageShell className="py-6">
        <div className="mb-6 flex items-center gap-2.5">
          {[
            ["1", "Keranjang", "/cart"],
            ["2", "Data pembeli", ""],
            ["3", "Bayar", "/checkout/qris"],
            ["4", "Selesai", "/checkout/success"],
          ].map(([n, l, to], i) => (
            <div key={l} className="flex items-center gap-2.5">
              <button
                onClick={() => to && navigate(to)}
                className={cx(
                  "flex items-center gap-2 text-[13px] font-bold transition-colors",
                  i <= 1 ? "text-brand-700" : "text-faint",
                )}
              >
                <span
                  className={cx(
                    "tnum grid h-6 w-6 place-items-center rounded-sm text-[11.5px]",
                    i <= 1 ? "bg-brand-600 text-white" : "bg-linesoft text-faint",
                  )}
                >
                  {n}
                </span>
                <span className="hidden sm:inline">{l}</span>
              </button>
              {i < 3 && <span className="h-px w-4 bg-line sm:w-8" />}
            </div>
          ))}
        </div>

        <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-ink">Data pengiriman & pembayaran</h1>

        <form onSubmit={submit} className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]" noValidate>
          <div className="space-y-5">
            <section className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-4 text-brand-600">01 / Penerima</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama lengkap" error={err.name} required>
                  <Input
                    value={form.name}
                    invalid={!!err.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Nama penerima"
                  />
                </Field>
                <Field label="Nomor WhatsApp" error={err.phone} required hint="Contoh: 0812xxxxxxx">
                  <Input
                    value={form.phone}
                    invalid={!!err.phone}
                    inputMode="tel"
                    onChange={(e) => set("phone", normalizeWA(e.target.value))}
                    placeholder="0812xxxxxxx"
                  />
                </Field>
              </div>
              <div className="mt-4 grid gap-4">
                <Field label="Alamat lengkap" error={err.addr} required hint="Sertakan jalan, nomor rumah, dan patokan.">
                  <Textarea
                    value={form.addr}
                    invalid={!!err.addr}
                    onChange={(e) => set("addr", e.target.value)}
                    placeholder="Jl. Merdeka No. 12, RT 03/RW 05"
                    rows={3}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kota / kabupaten" required>
                    <Select value={form.city} onChange={(e) => set("city", e.target.value)}>
                      {["Bandung", "Cimahi", "Jakarta Selatan", "Bekasi", "Depok", "Surabaya", "Semarang"].map(
                        (c) => (
                          <option key={c}>{c}</option>
                        ),
                      )}
                    </Select>
                  </Field>
                  <Field label="Kode pos">
                    <Input defaultValue="40131" />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-4 text-brand-600">02 / Pengiriman</div>
              <div className="space-y-2.5">
                {[
                  ["Reguler (2–3 hari)", "JNE / J&T", shipping === 0 ? "Gratis" : rupiah(SHIP)],
                  ["GoSend instan (hari ini)", "Kurir dalam kota", rupiah(18000)],
                  ["Ambil sendiri di toko", "Jl. Cihampelas No. 28", "Gratis"],
                ].map(([name, note, price]) => (
                  <label
                    key={name}
                    className={cx(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors duration-150",
                      form.ship === name ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-200",
                    )}
                  >
                    <input
                      type="radio"
                      name="ship"
                      checked={form.ship === name}
                      onChange={() => set("ship", name)}
                      className="h-4 w-4 accent-[#0A69C4]"
                    />
                    <span className="flex-1">
                      <span className="block text-[14px] font-bold text-ink">{name}</span>
                      <span className="block text-[12.5px] text-faint">{note}</span>
                    </span>
                    <span className="tnum text-[14px] font-semibold text-ink">{price}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-4 text-brand-600">03 / Pembayaran</div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  ["QRIS", "qr", "Semua e-wallet & m-banking", "Biaya 0,7%"],
                  ["Transfer bank", "wallet", "BCA / Mandiri / BRI", "Verifikasi manual"],
                ].map(([name, icon, note, fee]) => (
                  <label
                    key={name}
                    className={cx(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors duration-150",
                      form.pay === name ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-200",
                    )}
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={form.pay === name}
                      onChange={() => set("pay", name)}
                      className="mt-1 h-4 w-4 accent-[#0A69C4]"
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 text-[14px] font-bold text-ink">
                        <Icon name={icon} size={16} className="text-brand-600" /> {name}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-faint">{note}</span>
                      <span className="micro mt-1 block text-brand-600">{fee}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <Field label="Catatan untuk penjual">
                  <Input
                    value={form.note}
                    onChange={(e) => set("note", e.target.value)}
                    placeholder="Contoh: tolong dipacking aman, jangan dibungkus plastik"
                  />
                </Field>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-line bg-white p-5 shadow-card">
              <div className="micro mb-4 text-brand-600">Pesanan Anda</div>
              <ul className="space-y-3">
                {items.map(({ p, qty }) => (
                  <li key={p.id} className="flex gap-3">
                    <span className="relative">
                      <img src={p.img} alt="" className="h-12 w-12 rounded-md border border-line object-cover" />
                      <span className="tnum absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-navy-800 px-1 text-[10px] font-bold text-white">
                        {qty}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">{p.name}</span>
                      <span className="block text-[12px] text-faint">{p.sku}</span>
                    </span>
                    <span className="tnum text-[13.5px] font-semibold text-ink">{rupiah(p.price * qty)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2.5 border-t border-linesoft pt-4 text-[13.5px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="tnum font-semibold text-ink">{rupiah(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Diskon</dt>
                    <dd className="tnum font-semibold text-ok">−{rupiah(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Ongkos kirim</dt>
                  <dd className="tnum font-semibold text-ink">
                    {shipping === 0 ? <span className="text-ok">Gratis</span> : rupiah(shipping)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex items-end justify-between border-t border-linesoft pt-4">
                <span className="text-[14px] font-bold text-ink">Total bayar</span>
                <span className="tnum text-[24px] font-bold leading-none text-brand-700">{rupiah(total)}</span>
              </div>
              <Button type="submit" size="lg" loading={loading} className="mt-5 w-full">
                {loading ? "Menyiapkan…" : form.pay === "QRIS" ? "Bayar dengan QRIS" : "Buat pesanan"}
              </Button>
              <p className="mt-3 text-center text-[12.5px] leading-snug text-faint">
                Dengan melanjutkan Anda menyetujui aturan pembelian toko ini.
              </p>
            </div>
          </aside>
        </form>
      </PageShell>
    </div>
  );
}

/* --------------------------------- QRIS ----------------------------------- */
export function Qris() {
  const { toast } = useApp();
  const { total } = useTotals(null);
  const [left, setLeft] = useState(300);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(t);
  }, []);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const expired = left === 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy-900 pb-24">
      <div className="blueprint absolute inset-0 opacity-70" />
      <div className="absolute -left-24 -top-24 opacity-[0.06]">
        <LogoMark size={420} />
      </div>

      <div className="relative mx-auto w-full max-w-[520px] px-4 pt-6">
        <div className="flex items-center justify-between">
          <Link to="/checkout" className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white/75 hover:text-white">
            <Icon name="left" size={16} /> Kembali
          </Link>
          <span className="micro flex items-center gap-2 text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> QRIS terenkripsi
          </span>
        </div>

        <div className="mt-6 text-center">
          <TagChip tone="white">03 / Menunggu pembayaran</TagChip>
          <div className="tnum mt-5 text-[40px] font-bold leading-none text-white">{rupiah(total)}</div>
          <div className="mt-2 text-[13.5px] text-white/60">
            Dapoer Bu Ani · pesanan <span className="tnum text-white/85">TL-2502-0193</span>
          </div>
        </div>

        <div className="notch-lg mt-6 rounded-xl border border-white/15 bg-white p-5 shadow-lift">
          <div className="flex flex-col items-center">
            <div className="relative">
              <QRMark size={216} />
              <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border-2 border-white bg-white shadow-xs">
                <LogoMark size={42} />
              </span>
            </div>
            <div className="mt-4 w-full space-y-1.5 border-t border-linesoft pt-4 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-muted">Merchant</span>
                <span className="font-semibold text-ink">Dapoer Bu Ani</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Nomor rekening sumber</span>
                <span className="tnum font-semibold text-ink">9360 0••• •••• 4821</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Berlaku sampai</span>
                <span className={cx("tnum font-semibold", expired ? "text-bad" : "text-ink")}>
                  {expired ? "Kedaluwarsa" : `${mm}:${ss}`}
                </span>
              </div>
            </div>
          </div>

          <ol className="mt-4 space-y-2 border-t border-linesoft pt-4 text-[13.5px] text-muted">
            {[
              "Buka aplikasi bank atau e-wallet Anda.",
              "Pilih Bayar / QRIS, lalu pindai kode di atas.",
              "Pastikan nominal Rp masuk sesuai, lalu bayar.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="tnum grid h-5 w-5 shrink-0 place-items-center rounded-sm bg-brand-50 text-[11px] font-bold text-brand-700">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 space-y-2.5">
          <Button
            size="lg"
            className="w-full bg-brand-500! text-navy-900! hover:bg-brand-400!"
            onClick={() => navigate("/checkout/status")}
            disabled={expired}
          >
            Saya sudah bayar
          </Button>
          <button
            onClick={() => setConfirmCancel(true)}
            className="w-full py-2 text-[13.5px] font-semibold text-white/60 underline underline-offset-4 hover:text-white"
          >
            Batalkan pesanan
          </button>
        </div>

        <p className="mt-6 text-center text-[12.5px] leading-relaxed text-white/60">
          Jangan tutup layar sebelum pembayaran terkonfirmasi. Kode berlaku 5 menit.
        </p>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Batalkan pesanan ini?"
        body="Pesanan dan pembayaran yang sudah dilakukan tidak bisa dikembalikan otomatis. Hubungi penjual bila Anda sudah terlanjur membayar."
        confirmLabel="Ya, batalkan"
        onConfirm={() => {
          toast("Pesanan dibatalkan.", "warn");
          navigate("/s/dapoer-bu-ani");
        }}
      />
    </div>
  );
}

/* ----------------------------- payment status ----------------------------- */
export function PaymentStatus() {
  const [step, setStep] = useState(0);
  const steps = [
    { t: "Menunggu pembayaran", d: "QRIS dipindai, transaksi dibuat." },
    { t: "Pembayaran diterima", d: "Dana masuk ke saldo penjual." },
    { t: "Pesanan dikemas", d: "Dapoer Bu Ani menyiapkan barang." },
    { t: "Siap dikirim", d: "Menunggu kurir menjemput paket." },
  ];

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStep(1), 1600),
      window.setTimeout(() => setStep(2), 3400),
      window.setTimeout(() => setStep(3), 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <StoreHeader crumb="Status pembayaran" />
      <PageShell className="py-8">
        <div className="mx-auto max-w-[560px]">
          <div className="notch rounded-xl border border-line bg-white p-6 text-center shadow-card">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Spinner />
              <span className="absolute inset-0 rounded-full border-2 border-brand-200" />
            </div>
            <div className="micro mt-5 text-brand-600">04 / Memeriksa pembayaran</div>
            <h1 className="mt-2 text-[24px] font-extrabold tracking-[-0.02em] text-ink">
              Sedang mengonfirmasi ke bank…
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
              Biasanya selesai dalam beberapa detik. Jangan tutup layar ini.
            </p>

            <div className="mt-6 rounded-lg bg-canvas p-4 text-left">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-muted">Nomor pesanan</span>
                <span className="tnum font-bold text-ink">TL-2502-0193</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[13.5px]">
                <span className="text-muted">Metode</span>
                <span className="font-semibold text-ink">QRIS</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-white p-5">
            <ol className="relative space-y-5 pl-8">
              <span className="absolute left-[11px] top-2 h-[calc(100%-24px)] w-px bg-line" />
              {steps.map((s, i) => (
                <li key={s.t} className="relative">
                  <span
                    className={cx(
                      "absolute -left-8 top-0 grid h-6 w-6 place-items-center rounded-full border-2 transition-colors duration-300",
                      i < step
                        ? "border-ok bg-ok text-white"
                        : i === step
                          ? "border-brand-500 bg-white text-brand-600"
                          : "border-line bg-white text-faint",
                    )}
                  >
                    {i < step ? (
                      <Icon name="check" size={13} strokeWidth={3} />
                    ) : i === step ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <div
                    className={cx(
                      "text-[14.5px] font-bold",
                      i <= step ? "text-ink" : "text-faint",
                    )}
                  >
                    {s.t}
                  </div>
                  <div className="text-[13px] text-muted">{s.d}</div>
                </li>
              ))}
            </ol>
          </div>

          {step >= 3 && (
            <div className="rise mt-4 flex flex-col gap-2.5 sm:flex-row">
              <ButtonLink to="/checkout/success" className="flex-1" size="lg">
                Lihat konfirmasi <Icon name="arrowRight" size={16} />
              </ButtonLink>
              <ButtonLink to="/order/TL-2502-0193" variant="secondary" size="lg" className="flex-1">
                Lacak pesanan
              </ButtonLink>
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* -------------------------------- success --------------------------------- */
export function OrderSuccess() {
  const { toast, clear } = useApp();
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="min-h-screen bg-canvas pb-16">
      <StoreHeader crumb="Pembayaran berhasil" />
      <PageShell className="py-8">
        <div className="mx-auto max-w-[600px]">
          <div className="notch rounded-xl border border-line bg-white p-6 text-center shadow-card sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-oksoft text-ok">
              <Icon name="check" size={32} strokeWidth={2.6} />
            </div>
            <div className="micro mt-5 text-ok">05 / Selesai</div>
            <h1 className="mt-2 text-[26px] font-extrabold tracking-[-0.03em] text-ink">
              Pembayaran berhasil!
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-muted">
              Pesanan <span className="tnum font-bold text-ink">TL-2502-0193</span> sudah diteruskan ke
              Dapoer Bu Ani. Nota dikirim ke WhatsApp Anda.
            </p>

            <div className="mt-6 rounded-lg border border-line bg-canvas p-4 text-left">
              <div className="flex items-center justify-between border-b border-linesoft pb-3">
                <span className="micro text-faint">Total dibayar</span>
                <span className="tnum text-[19px] font-bold text-brand-700">Rp143.000</span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {[
                  ["Kue Lapis Legit 380g", "1 × Rp85.000"],
                  ["Keripik Singkong Balado", "2 × Rp24.000"],
                  ["Ongkos kirim Reguler", "Rp10.000"],
                ].map(([n, v]) => (
                  <li key={n} className="flex items-center justify-between gap-3 text-[13.5px]">
                    <span className="truncate text-muted">{n}</span>
                    <span className="tnum shrink-0 font-semibold text-ink">{v}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-linesoft pt-3 text-[13.5px]">
                <span className="text-muted">Metode pembayaran</span>
                <span className="font-semibold text-ink">QRIS · Lunas</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <ButtonLink to="/order/TL-2502-0193" className="flex-1" size="lg">
                <Icon name="truck" size={17} /> Lacak pesanan
              </ButtonLink>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => toast("Membuka chat WhatsApp penjual…", "info")}
              >
                <Icon name="wa" size={17} className="text-[#0a7a56]" /> Chat penjual
              </Button>
            </div>
            <Link
              to="/s/dapoer-bu-ani"
              className="mt-4 inline-block text-[13.5px] font-semibold text-muted hover:text-brand-700"
            >
              Kembali ke toko
            </Link>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-white p-5">
            <div className="micro mb-3 text-brand-600">Baru belanja lagi?</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PRODUCTS.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to={`/s/dapoer-bu-ani/p/${p.id}`}
                  className="group overflow-hidden rounded-md border border-line transition-colors hover:border-brand-300"
                >
                  <img src={p.img} alt={p.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <div className="p-2">
                    <div className="truncate text-[12px] font-semibold text-ink">{p.name}</div>
                    <div className="tnum text-[12.5px] font-bold text-brand-700">{rupiah(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
}

/* -------------------------------- tracking -------------------------------- */
export function OrderTracking({ id }: { id: string }) {
  const { toast } = useApp();
  const [copied, setCopied] = useState(false);
  const timeline = [
    { t: "Pesanan dibuat", d: "12 Feb 2025, 09:41", done: true, note: "Menunggu pembayaran QRIS." },
    { t: "Pembayaran diterima", d: "12 Feb 2025, 09:44", done: true, note: "Rp143.000 diterima lewat QRIS." },
    { t: "Dikemas penjual", d: "12 Feb 2025, 10:20", done: true, note: "Dikemas di Dapoer Bu Ani, Bandung." },
    { t: "Diserahkan ke kurir", d: "12 Feb 2025, 13:05", done: true, note: "JNE REG · resi JT8891204471." },
    { t: "Sedang dikirim", d: "Perkiraan 13 Feb", done: false, note: "Paket menuju alamat penerima." },
    { t: "Selesai", d: "Perkiraan 14 Feb", done: false, note: "Konfirmasi setelah barang diterima." },
  ];

  return (
    <div className="min-h-screen bg-canvas pb-16">
      <StoreHeader crumb={`Pesanan ${id}`} />
      <PageShell className="py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="micro mb-2 text-brand-600">Lacak pesanan</div>
            <h1 className="tnum text-[26px] font-extrabold tracking-[-0.03em] text-ink">{id}</h1>
          </div>
          <Badge tone="blue" dot>
            Dalam pengiriman
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-4 text-faint">Riwayat pengiriman</div>
              <ol className="relative space-y-6 pl-9">
                <span className="absolute left-[13px] top-2 h-[calc(100%-16px)] w-px bg-line" />
                {timeline.map((s) => (
                  <li key={s.t} className="relative">
                    <span
                      className={cx(
                        "absolute -left-9 top-0 grid h-7 w-7 place-items-center rounded-full border-2 bg-white",
                        s.done ? "border-ok text-ok" : "border-line text-faint",
                      )}
                    >
                      {s.done ? (
                        <Icon name="check" size={14} strokeWidth={3} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className={cx("text-[14.5px] font-bold", s.done ? "text-ink" : "text-faint")}>
                        {s.t}
                      </span>
                      <span className="tnum text-[12.5px] text-faint">{s.d}</span>
                    </div>
                    <div className="text-[13.5px] text-muted">{s.note}</div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-3 text-faint">Isi pesanan</div>
              <ul className="space-y-3">
                {[
                  ["Kue Lapis Legit 380g", 1, 85000],
                  ["Keripik Singkong Balado 200g", 2, 24000],
                  ["Ongkos kirim Reguler", 1, 10000],
                ].map(([n, q, price]) => (
                  <li key={String(n)} className="flex items-center justify-between gap-3 text-[14px]">
                    <span className="text-ink">
                      <span className="tnum text-muted">{q} ×</span> {n}
                    </span>
                    <span className="tnum font-semibold text-ink">{rupiah(Number(price) * Number(q))}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-linesoft pt-4">
                <span className="text-[14px] font-bold text-ink">Total dibayar</span>
                <span className="tnum text-[19px] font-bold text-brand-700">Rp143.000</span>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-3 text-faint">Resi pengiriman</div>
              <div className="rounded-md bg-canvas p-3">
                <div className="text-[13px] text-muted">JNE Reguler</div>
                <div className="tnum text-[15px] font-bold text-ink">JT8891204471</div>
              </div>
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => {
                  setCopied(true);
                  toast("Nomor resi disalin.");
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                <Icon name={copied ? "check" : "copy"} size={16} /> {copied ? "Tersalin" : "Salin nomor resi"}
              </Button>
              <Button variant="secondary" className="mt-2 w-full" onClick={() => toast("Membuka pelacakan JNE…", "info")}>
                <Icon name="truck" size={16} /> Lacak di kurir
              </Button>
            </div>

            <div className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-3 text-faint">Penjual</div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-800">
                  <LogoMark size={26} />
                </span>
                <div className="leading-tight">
                  <div className="text-[14px] font-bold text-ink">Dapoer Bu Ani</div>
                  <div className="text-[12.5px] text-faint">Balas chat ≤ 10 menit</div>
                </div>
              </div>
              <Button className="mt-4 w-full" variant="secondary" onClick={() => toast("Membuka chat WhatsApp…", "info")}>
                <Icon name="wa" size={16} className="text-[#0a7a56]" /> Butuh bantuan
              </Button>
            </div>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3.5 text-[13.5px] font-bold text-muted transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              <Logo size={20} /> Dibuat dengan TokoLink
            </Link>
          </aside>
        </div>
      </PageShell>
    </div>
  );
}
