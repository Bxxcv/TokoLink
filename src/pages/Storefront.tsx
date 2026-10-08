import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { Link, navigate } from "../lib/router";
import { rupiah } from "../lib/format";
import { useApp } from "../lib/store";
import type { Product } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { mapProduct, type DbProduct } from "../lib/products";
import { normalizeWA } from "../lib/format";
import { accentHex } from "../lib/theme-accent";
import { iconForLink } from "../lib/links";
import { searchCities } from "../lib/cities";
import { Logo, LogoMark } from "../components/Logo";
import {
  Badge,
  Button,
  ButtonLink,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Icon,
  Input,
  Modal,
  PageShell,
  Skeleton,
  TagChip,
  Textarea,
  cx,
} from "../components/ui";
import { QRMark } from "./Landing";
import { isEngineTheme } from "../storefront/registry";
import { ENGINE_COMPONENTS } from "../storefront/themes";

/* Ongkir dihapus (keputusan produk Okt 2026) — tidak ada konstanta ongkir. */

/* ------------------------------ shared chrome ----------------------------- */
export type StoreProfile = {
  id: string;
  store_name: string | null;
  store_slug: string | null;
  city: string | null;
  owner_name: string | null;
  wa_number: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  is_closed: boolean | null;
  is_premium?: boolean | null;
};

/** Link kontak publik toko (URL wa.me, tanpa bocorkan nomor mentah). */
function useStoreContact(sellerId: string | null | undefined) {
  const [waUrl, setWaUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!sellerId) {
      setWaUrl(null);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase.rpc("store_contact_link", { p_seller_id: sellerId });
        if (!alive) return;
        setWaUrl((data as { wa_url: string | null } | null)?.wa_url ?? null);
      } catch {
        /* RPC belum ada (migrasi belum jalan) → fallback toast */
      }
    })();
    return () => {
      alive = false;
    };
  }, [sellerId]);
  return waUrl;
}

/** Buka chat WA toko di tab baru; fallback jujur bila belum diatur. */
type ToastFn = (msg: string, tone?: "info" | "ok" | "warn" | "bad") => void;
function openStoreWA(waUrl: string | null, toast: ToastFn, text?: string) {
  if (!waUrl) {
    toast("Nomor WhatsApp toko belum diatur.", "info");
    return;
  }
  const url = text ? `${waUrl}?text=${encodeURIComponent(text)}` : waUrl;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Salin teks ke clipboard (dengan fallback). True bila berhasil. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* lanjut ke fallback */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

/**
 * Profil toko + katalog publik berdasarkan `store_slug`.
 * SECURITY HOTFIX BUG-004: baca dari view `public_stores` (tanpa PII:
 * tanpa owner_name/wa_number/address/role/plan/status), BUKAN dari
 * tabel `profiles` langsung. Hanya memakai policy publik.
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
        .from("public_stores")
        .select("id,store_name,store_slug,city,avatar_url,cover_url,bio,is_closed")
        .eq("store_slug", slug)
        .maybeSingle();
      if (!prof) {
        setStore(null);
        setItems([]);
        setNotFound(true);
        setLoading(false);
        return;
      }
      // Badge premium via RPC (kolom plan tertutup untuk publik).
      let premium = false;
      try {
        const { data: prem } = await supabase.rpc("store_is_premium", {
          p_seller_id: (prof as StoreProfile).id,
        });
        premium = prem === true;
      } catch {
        /* RPC belum ada (migrasi part 3 belum jalan) → anggap gratis */
      }
      setStore({ ...(prof as StoreProfile), is_premium: premium });
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
  // Tanpa data toko (masih loading) tampilkan netral — JANGAN nama contoh.
  const name = store?.store_name || "Toko";
  const slug = store?.store_slug || "";
  const city = store?.city || "";
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/96 backdrop-blur-sm">
      <PageShell>
        <div className="flex h-16 items-center gap-3">
          <Link to={slug ? `/s/${slug}` : "/"} className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-navy-800">
              {store?.avatar_url ? (
                <img src={store.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <LogoMark size={24} />
              )}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-extrabold text-ink">{name}</span>
              <span className="micro text-faint">{crumb ?? (city || "Katalog")}</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/cart"
              aria-label="Keranjang"
              className="relative rounded-md border border-line p-2 text-muted transition-colors hover:bg-canvas hover:text-brand-700"
            >
              <Icon name="cart" size={17} />
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
  const name = store?.store_name || "Toko";
  const city = store?.city || "";
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
              {city && <div className="text-[12.5px] text-faint">{city}</div>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted">
            <Link to="/" className="font-semibold text-brand-700 hover:underline">
              Dibuat dengan TokoLink
            </Link>
            <a
              href={`mailto:support@tokolink.store?subject=${encodeURIComponent(
                `Laporan toko: ${name}${store?.store_slug ? ` (tokolink.store/s/${store.store_slug})` : ""}`,
              )}`}
              className="hover:text-ink"
            >
              Laporkan toko
            </a>
            <Link to="/legal/privacy" className="hover:text-ink">
              Syarat &amp; privasi
            </Link>
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

function ProductCard({ p, slug, accent, hideAdd, className = "", onAdd }: { p: Product; slug: string; accent?: string; hideAdd?: boolean; className?: string; onAdd: (p: Product) => void }) {
  const out = p.stock === 0;
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card ${className}`}>
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
            <div className="tnum text-[15.5px] font-bold text-brand-700" style={accent ? { color: accent } : undefined}>{rupiah(p.price)}</div>
            <div className="text-[11.5px] text-faint">{p.unit}</div>
          </div>
          {!hideAdd && (
          <button
            disabled={out}
            onClick={() => onAdd(p)}
            aria-label={`Tambah ${p.name} ke keranjang`}
            className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 text-white transition-all duration-150 hover:bg-brand-700 active:translate-y-px disabled:pointer-events-none disabled:bg-linesoft disabled:text-faint"
            style={accent ? { backgroundColor: accent } : undefined}
          >
            <Icon name="plus" size={17} strokeWidth={2.4} />
          </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ------------------------------- store home ------------------------------- */
export function LegalPrivacy() {
  return (
    <div className="min-h-screen bg-canvas pb-24">
      <StoreHeader crumb="Syarat & Privasi" />
      <PageShell className="py-10">
        <div className="mx-auto max-w-[640px] rounded-lg border border-line bg-white p-6 sm:p-8">
          <h1 className="text-[22px] font-extrabold text-ink">Syarat &amp; Kebijakan Privasi</h1>
          <p className="mt-1 text-[13px] text-faint">
            Aturan main TokoLink untuk pembeli dan penjual. Terakhir diperbarui Oktober 2026.
          </p>
          <div className="mt-6 space-y-5 text-[14px] leading-relaxed text-muted">
            <section>
              <h2 className="text-[15px] font-bold text-ink">Data yang dikumpulkan</h2>
              <p className="mt-1">
                Nama, nomor WhatsApp, dan alamat yang kamu isi saat checkout dipakai seller
                untuk memproses pesananmu. Data pembayaran diproses oleh penyedia QRIS
                (BuatQris). Nomor rekening seller disimpan untuk keperluan penarikan dana
                dan hanya dibuka admin saat transfer.
              </p>
            </section>
            <section>
              <h2 className="text-[15px] font-bold text-ink">Penggunaan data</h2>
              <p className="mt-1">
                Data pesanan hanya dibagikan ke seller terkait untuk keperluan pengiriman
                dan layanan pelanggan — tidak dijual ke pihak ketiga.
              </p>
            </section>
            <section>
              <h2 className="text-[15px] font-bold text-ink">Kontak</h2>
              <p className="mt-1">
                Pertanyaan soal privasi atau data kamu, hubungi tim TokoLink lewat halaman
                bantuan.
              </p>
            </section>
          </div>
        </div>
      </PageShell>
      <div className="mt-10">
        <StoreFooter />
      </div>
    </div>
  );
}

export function StoreHome({ slug }: { slug: string }) {
  const { add, toast, count } = useApp();
  const { store, items, loading, notFound } = usePublicStore(slug);
  const [cat, setCat] = useState("Semua");
  const [q, setQ] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const [qrData, setQrData] = useState("");

  useEffect(() => {
    setQrData("");
    QRCode.toDataURL(`https://tokolink.store/s/${slug}`, { width: 352, margin: 2 })
      .then(setQrData)
      .catch(() => {});
  }, [slug]);
  useVisitBeacon(store?.id, `/s/${slug}`);

  const cats = useMemo(() => ["Semua", ...Array.from(new Set(items.map((p) => p.cat)))], [items]);
  const list = useMemo(
    () =>
      items.filter((p) => (cat === "Semua" ? true : p.cat === cat)).filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [items, cat, q],
  );
  const name = store?.store_name || "Toko";
  const city = store?.city || "";
  const waUrl = useStoreContact(store?.id);
  const closed = store?.is_closed ?? false;
  const isPremium = store?.is_premium ?? false;
  // Tema toko (warna, susunan, bagian tampil) — default bila seller belum atur.
  const [theme, setTheme] = useState({ accent: "#0A69C4", layout: "Kisi", hours: true, qr: true, cart: true });
  // ID tema presentasi dari Theme Engine ("klasik" = tampilan bawaan).
  // Query TERPISAH supaya aman: kalau kolom theme_id belum ada di database
  // (migrasi belum dijalankan), query ini gagal diam-diam dan tampilan
  // bawaan tetap jalan — tidak merusak query tema lama di bawah.
  const [themeId, setThemeId] = useState("klasik");

  useEffect(() => {
    if (!store) return;
    (async () => {
      const { data } = await supabase
        .from("store_theme")
        .select("accent,layout,show_hours,show_qr,show_cart")
        .eq("seller_id", store.id)
        .maybeSingle();
      const t = data as { accent: string; layout: string; show_hours: boolean; show_qr: boolean; show_cart: boolean } | null;
      if (!t) return;
      setTheme({
        accent: accentHex(t.accent),
        layout: t.layout,
        hours: t.show_hours,
        qr: t.show_qr,
        cart: t.show_cart,
      });
    })();
  }, [store]);
  useEffect(() => {
    if (!store) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("store_theme")
          .select("theme_id")
          .eq("seller_id", store.id)
          .maybeSingle();
        if (error || !data) return;
        const id = (data as { theme_id?: string }).theme_id;
        if (isEngineTheme(id)) setThemeId(id as string);
      } catch {
        /* kolom belum ada / RLS — tetap tampilkan klasik */
      }
    })();
  }, [store]);
  // Badge buka/tutup dari store_hours (zona WIB). Tanpa data jam → anggap buka.
  const [openNow, setOpenNow] = useState<boolean | null>(null);
  const [todayHours, setTodayHours] = useState("");
  const [hourRows, setHourRows] = useState<{ day: string; text: string; on: boolean }[]>([]);
  const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  useEffect(() => {
    if (!store) return;
    (async () => {
      const { data } = await supabase
        .from("store_hours")
        .select("day_of_week,open_time,close_time,is_open")
        .eq("seller_id", store.id);
      const rows = ((data ?? []) as {
        day_of_week: number; open_time: string | null; close_time: string | null; is_open: boolean;
      }[]);
      if (rows.length === 0) {
        setOpenNow(true);
        setHourRows([]);
        return;
      }
      setHourRows(
        [...rows]
          .sort((a, b) => a.day_of_week - b.day_of_week)
          .map((r) => ({
            day: DAY_NAMES[r.day_of_week] ?? "",
            text:
              r.is_open && r.open_time && r.close_time
                ? `${r.open_time.slice(0, 5).replace(":", ".")} – ${r.close_time.slice(0, 5).replace(":", ".")}`
                : "Libur",
            on: r.is_open && !!r.open_time && !!r.close_time,
          })),
      );
      const wib = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const day = (wib.getDay() + 6) % 7; // 0 = Senin
      const row = rows.find((r) => r.day_of_week === day);
      if (!row || !row.is_open || !row.open_time || !row.close_time) {
        setOpenNow(false);
        return;
      }
      const open = row.open_time.slice(0, 5);
      const close = row.close_time.slice(0, 5);
      const now = `${String(wib.getHours()).padStart(2, "0")}:${String(wib.getMinutes()).padStart(2, "0")}`;
      setTodayHours(`${open.replace(":", ".")} – ${close.replace(":", ".")} WIB`);
      setOpenNow(open <= now && now <= close);
    })();
  }, [store]);

  // Tautan bio (WhatsApp/Instagram/dll yang diatur seller di halaman
  // Tautan bio) — sebelumnya halaman ini tidak pernah query bio_links sama
  // sekali, jadi yang tampil selalu 4 tautan contoh yang di-hardcode. Sudah
  // diperbaiki 30 Sep 2026.
  const [bioLinks, setBioLinks] = useState<
    { id: string; label: string; url: string; icon: string | null }[]
  >([]);
  useEffect(() => {
    if (!store) return;
    (async () => {
      const { data } = await supabase
        .from("bio_links")
        .select("id,label,url,icon")
        .eq("seller_id", store.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setBioLinks((data ?? []) as { id: string; label: string; url: string; icon: string | null }[]);
    })();
  }, [store]);
  const openBioLink = (l: { id: string; url: string }) => {
    // Hitung klik best-effort, jangan blokir navigasi kalau gagal.
    supabase.rpc("increment_bio_link_click", { p_id: l.id }).then(
      () => {},
      () => {},
    );
    const href = /^https?:\/\//i.test(l.url) ? l.url : `https://${l.url}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-canvas pb-24">
        <StoreHeader />
        <PageShell className="py-10">
          <EmptyState
            icon="store"
            title="Toko tidak ditemukan"
            desc={`Alamat “tokolink.store/s/${slug}” tidak terdaftar. Cek lagi ejaannya.`}
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

  // Theme Engine: tema presentasi dirender komponen sendiri dengan data
  // yang SAMA (store, items, bioLinks, jam, QR, keranjang).
  // Alur lain (checkout, payment, dsb) tidak tersentuh.
  if (isEngineTheme(themeId)) {
    const EngineTheme = ENGINE_COMPONENTS[themeId];
    if (!EngineTheme) return null;
    return (
      <div className="min-h-screen">
        <EngineTheme
          slug={slug}
          storeName={name}
          city={city}
          bio={store?.bio ?? null}
          waNumber={""}
          avatarUrl={store?.avatar_url ?? null}
          coverUrl={store?.cover_url ?? null}
          closed={closed}
          items={list}
          allItems={items}
          cats={cats}
          cat={cat}
          onCat={setCat}
          q={q}
          onQ={setQ}
          onResetFilter={() => {
            setQ("");
            setCat("Semua");
          }}
          loading={loading}
          bioLinks={bioLinks}
          onOpenBioLink={openBioLink}
          openNow={openNow}
          todayHours={todayHours}
          hourRows={hourRows}
          accent={theme.accent}
          showHours={theme.hours}
          showQR={theme.qr}
          showCart={theme.cart}
          cartCount={count}
          onAdd={onAdd}
          onChatWA={() => openStoreWA(waUrl, toast)}
          qrData={qrData}
          onOpenQR={() => setQrOpen(true)}
          onShare={async () => {
            const ok = await copyText(`https://tokolink.store/s/${slug}`);
            setShared(ok);
            toast(ok ? "Tautan toko disalin." : "Gagal menyalin. Salin manual: tokolink.store/s/" + slug, ok ? "info" : "bad");
            window.setTimeout(() => setShared(false), 1600);
          }}
          shared={shared}
        />
        <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="QR TokoLink" eyebrow={name} width="max-w-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative rounded-lg border border-line bg-white p-4">
              {qrData ? (
                <img src={qrData} alt={`QR ${name}`} width={176} height={176} className="h-[176px] w-[176px]" />
              ) : (
                <QRMark size={176} />
              )}
              <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-white">
                <LogoMark size={34} />
              </span>
            </div>
            <div>
              <div className="tnum text-[15px] font-bold text-ink">tokolink.store/s/{slug}</div>
              <p className="mt-1 text-[13px] text-muted">
                Pindai untuk membuka toko. Aman dicetak hitam putih.
              </p>
            </div>
            <div className="flex w-full gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  if (!qrData) return;
                  const a = document.createElement("a");
                  a.href = qrData;
                  a.download = `qr-${slug}.png`;
                  a.click();
                  toast("QR diunduh ke perangkat.");
                }}
              >
                <Icon name="download" size={16} /> Unduh
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  const url = `https://tokolink.store/s/${slug}`;
                  if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
                  toast("Tautan QR disalin.");
                }}
              >
                <Icon name="copy" size={16} /> Salin tautan
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-24">
      <StoreHeader store={store} />

      {/* cover */}
      <div className="relative h-[190px] overflow-hidden bg-navy-900 sm:h-[240px]">
        <img src={store?.cover_url || "images/store-cover.jpg"} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/35 to-navy-900/20" />
        <div className="blueprint absolute inset-0 opacity-40" />
        <PageShell className="absolute inset-x-0 top-4">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={async () => {
                const ok = await copyText(`https://tokolink.store/s/${slug}`);
                setShared(ok);
                toast(ok ? "Tautan toko disalin." : "Gagal menyalin. Salin manual: tokolink.store/s/" + slug, ok ? "info" : "bad");
                window.setTimeout(() => setShared(false), 1600);
              }}
              className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-navy-900/55 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
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
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas shadow-xs">
              {store?.avatar_url ? (
                <img src={store.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <LogoMark size={42} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">{name}</h1>
                {isPremium && <Badge tone="blue">Premium</Badge>}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
                {city && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="pin" size={14} className="text-faint" /> {city}
                  </span>
                )}
              </div>
              {store?.bio && (
                <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">{store.bio}</p>
              )}
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <button
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#0a7a56] px-4 text-[13.5px] font-bold text-white transition-colors hover:bg-[#0b6b4b] sm:flex-none"
                onClick={() => openStoreWA(waUrl, toast)}
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
                openNow === false ? "bg-badsoft text-bad" : "bg-oksoft text-[#0a7a55]",
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className={cx("h-2 w-2 rounded-full", openNow === false ? "bg-bad" : "bg-ok")} />
              </span>
              {openNow === false ? "Tutup" : `Buka${todayHours ? ` · ${todayHours}` : ""}`}
            </span>
            {todayHours && openNow !== false && (
              <span className="text-[13px] text-muted">Pesanan di jam operasional diproses hari yang sama.</span>
            )}
          </div>

          {/* bio links */}
          {bioLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-linesoft pt-4">
              {bioLinks.map((l) => (
                <button
                  key={l.id}
                  onClick={() => openBioLink(l)}
                  className="group inline-flex items-center gap-2 rounded-md border border-line bg-canvas px-3 py-2 text-[13px] font-semibold text-muted transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  <Icon name={iconForLink(l.icon)} size={15} className="text-brand-500" />
                  {l.label}
                  <Icon name="right" size={13} className="text-faint transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          )}
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
                style={cat === c ? { backgroundColor: theme.accent, borderColor: theme.accent } : undefined}
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
              <div
                className={
                  theme.layout === "Daftar"
                    ? "grid grid-cols-1 gap-3"
                    : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                }
              >
                {list.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    slug={slug}
                    accent={theme.accent}
                    hideAdd={!theme.cart || closed}
                    className={theme.layout === "Sorotan" && i === 0 ? "col-span-2 lg:col-span-2" : ""}
                    onAdd={onAdd}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* info + QR */}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {theme.hours && (
          <div className="rounded-xl border border-line bg-white p-5 lg:col-span-2">
            <div className="micro mb-3 text-brand-600">02 / Jam buka</div>
            <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {hourRows.length === 0 ? (
                <li className="text-[13px] text-faint">Jam operasional belum diatur penjual.</li>
              ) : (
                hourRows.map((h) => (
                  <li
                    key={h.day}
                    className={cx(
                      "flex items-center justify-between border-b border-linesoft py-2 text-[13.5px] last:border-0",
                      h.on ? "text-ink" : "text-faint",
                    )}
                  >
                    <span className="font-semibold">{h.day}</span>
                    <span className="tnum">{h.text}</span>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-linesoft pt-4 text-[13.5px] text-muted">
              {city && (
                <span className="flex items-center gap-2">
                  <Icon name="pin" size={15} className="text-brand-500" /> {city}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Icon name="truck" size={15} className="text-brand-500" /> Pengiriman diatur via chat
              </span>
            </div>
          </div>
          )}

          {theme.qr && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-line bg-navy-900 p-5 text-center">
            <div className="micro text-brand-300">Pindai untuk simpan</div>
            <div className="rounded-lg bg-white p-3">
              {qrData ? (
                <img src={qrData} alt={`QR ${name}`} width={104} height={104} className="h-[104px] w-[104px]" />
              ) : (
                <QRMark size={104} />
              )}
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
          )}
        </div>

        {theme.cart && count > 0 && (
          <div
            className="fixed inset-x-0 z-30 px-4 lg:hidden"
            style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
          >
            <ButtonLink to="/cart" className="mx-auto w-full max-w-[420px] shadow-lift" size="lg">
              <Icon name="cart" size={17} /> Lihat keranjang ({count})
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
            {qrData ? (
              <img src={qrData} alt={`QR ${name}`} width={176} height={176} className="h-[176px] w-[176px]" />
            ) : (
              <QRMark size={176} />
            )}
            <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-white">
              <LogoMark size={34} />
            </span>
          </div>
          <div>
            <div className="tnum text-[15px] font-bold text-ink">tokolink.store/s/{slug}</div>
            <p className="mt-1 text-[13px] text-muted">
              Pindai untuk membuka toko. Aman dicetak hitam putih.
            </p>
          </div>
          <div className="flex w-full gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                if (!qrData) return;
                const a = document.createElement("a");
                a.href = qrData;
                a.download = `qr-${slug}.png`;
                a.click();
                toast("QR diunduh ke perangkat.");
              }}
            >
              <Icon name="download" size={16} /> Unduh
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                const url = `https://tokolink.store/s/${slug}`;
                if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
                toast("Tautan QR disalin.");
              }}
            >
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
  useVisitBeacon(store?.id, `/s/${slug}/p/${id}`);

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
      // BUG-004: profil publik via view tanpa PII.
      const { data: prof } = await supabase
        .from("public_stores")
        .select("id,store_name,store_slug,city,avatar_url,cover_url,bio,is_closed")
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
  const closedDetail = store?.is_closed ?? false;
  const cannotBuy = out || closedDetail;
  const waUrlDetail = useStoreContact(store?.id);

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
              />
            </div>
          </div>

          <div>
            <div className="micro text-brand-600">{p.cat}</div>
            <h1 className="mt-2 text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[30px]">
              {p.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px] text-muted">
              {/* Rating asli menyusul bareng fitur Ulasan Pembeli (lihat backlog
                  TASKS.md) -- sebelumnya di sini ada angka "4,9 (86 ulasan)"
                  yang di-hardcode, bukan data asli. Jangan dikembalikan sebelum
                  fitur ulasannya benar ada. */}
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
                ["truck", "Pengiriman", "Diatur langsung dengan penjual via chat setelah bayar."],
                ["shield", "Komplain", "Ada masalah dengan pesanan? Hubungi penjual via WhatsApp."],
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
                disabled={cannotBuy}
                onClick={() => {
                  add(p.id, qty);
                  toast(`${qty} × ${p.name} masuk keranjang.`);
                }}
                className="flex-1"
              >
                <Icon name="box" size={17} /> {closedDetail ? "Toko tutup" : "Tambah ke keranjang"}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                disabled={out}
                onClick={() => openStoreWA(waUrlDetail, toast, `Halo, saya mau tanya stok ${p.name} (${rupiah(p.price)})`)}
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
              <ProductCard key={r.id} p={r} slug={slug} hideAdd={closedDetail} onAdd={(x) => { add(x.id); toast(`${x.name} masuk keranjang.`); }} />
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
            onClick={() => openStoreWA(waUrlDetail, toast, `Halo, saya mau tanya stok ${p.name}`)}
            className="px-4"
            aria-label="WhatsApp"
          >
            <Icon name="wa" size={18} className="text-[#0a7a56]" />
          </Button>
          <Button
            size="lg"
            disabled={cannotBuy}
            className="flex-1"
            onClick={() => {
              add(p.id, qty);
              toast(`${qty} × ${p.name} masuk keranjang.`);
            }}
          >
            {out ? "Stok habis" : closedDetail ? "Toko tutup" : `Tambah · ${rupiah(p.price * qty)}`}
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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    (async () => {
      if (cart.length === 0) {
        setItems([]);
        setDiscount(0);
        setShipDisc(0);
        setPromoNote("");
        setLoading(false);
        setLoadError(false);
        return;
      }
      setLoading(true);
      setLoadError(false);
      // ID mock lama (mis. "p1") bukan uuid → dibuang dulu, kalau ikut
      // dikirim PostgREST menolak seluruh query dan keranjang jadi kosong.
      const ids = [...new Set(cart.map((c) => c.id))].filter((id) => /^[0-9a-f-]{36}$/i.test(id));
      const { data, error } = await supabase.from("products").select("*").in("id", ids).eq("status", "aktif");
      if (error) {
        setItems([]);
        setLoading(false);
        setLoadError(true);
        return;
      }
      const rows = ((data ?? []) as DbProduct[]);
      const byId = new Map(rows.map((r) => [r.id, r]));
      const resolved = cart.flatMap((c) => {
        const r = byId.get(c.id);
        return r && r.seller_id ? [{ p: mapProduct(r), qty: c.qty, sellerId: r.seller_id }] : [];
      });
      setItems(resolved);

      // Kode promo divalidasi SERVER (/api/validate-promo) per toko —
      // tabel promo tidak lagi bisa dibaca publik (BUG-018). Server
      // cek ulang saat create-order; di sini hanya untuk tampilan.
      let disc = 0;
      let sd = 0;
      let note = "";
      const code = (promo ?? "").trim();
      if (code && resolved.length > 0) {
        const sellerIds = [...new Set(resolved.map((i) => i.sellerId))];
        const sellerSubtotal = resolved
          .filter((i) => i.sellerId === sellerIds[0])
          .reduce((s, i) => s + i.p.price * i.qty, 0);
        try {
          const r = await fetch("/api/validate-promo", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              seller_id: sellerIds[0],
              code,
              subtotal: sellerSubtotal,
            }),
          });
          const out = (await r.json()) as {
            ok?: boolean; discount?: number; ship_discount?: number; message?: string;
          };
          disc = Number(out.discount ?? 0);
          sd = Number(out.ship_discount ?? 0);
          note = out.message ?? "";
          if (!out.ok && !note) note = "Kode tidak berlaku.";
        } catch {
          note = "Tidak bisa cek kode saat ini.";
        }
      }
      setDiscount(disc);
      setShipDisc(sd);
      setPromoNote(note);
      setLoading(false);
    })();
  }, [cart, promo]);

  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  // Tanpa ongkir (keputusan produk Okt 2026): pengiriman diatur langsung
  // dengan penjual via chat. Total layar = total yang ditagih QRIS.
  const shipping = 0;
  const total = subtotal - discount;
  const promoValid = discount > 0;
  return { items, subtotal, discount, shipping, total, promoNote, promoValid, loading, loadError };
}

/** Polling status order via RPC aman (id + token). Dipakai halaman
 *  status & sukses — auto-update begitu webhook mengubah status. */
type TrackedOrder = {
  id: string;
  status: string;
  total: number | string;
  // Jumlah SEBENARNYA yang ditagih ke buyer (termasuk biaya BuatQris) --
  // beda dari `total` (harga produk sebelum biaya). Tampilkan ini ke
  // buyer, bukan `total`, biar sama dengan angka di halaman QR BuatQris.
  // Butuh database/migrate_fase3d_amount.sql; fallback ke `total` kalau
  // migrasi belum jalan (RPC lama tidak mengembalikan field ini).
  amount_due?: number | string;
  channel: string | null;
  created_at: string;
  buyer: string;
  city: string | null;
  store: string | null;
  slug: string | null;
  external_ref?: string | null;
  wa_url?: string | null;
  shipping_method?: string | null;
  shipping_cost?: number | string | null;
  items: { name: string; qty: number; price: number | string }[];
};

function useOrderStatus(orderId: string, token: string) {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [waitingLong, setWaitingLong] = useState(false);

  useEffect(() => {
    if (!orderId || !token) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let alive = true;
    let timer: number | undefined;
    let tries = 0;
    const TERMINAL = new Set(["selesai", "batal"]);
    const longTimer = window.setTimeout(() => {
      if (alive) setWaitingLong(true);
    }, 90000);
    const fetchOnce = async () => {
      if (!alive) return;
      // Hemat kuota: tab tidak terlihat → tunda sampai terlihat lagi.
      if (document.visibilityState === "hidden") {
        timer = window.setTimeout(fetchOnce, 10000);
        return;
      }
      const { data } = await supabase.rpc("track_order", { p_id: orderId, p_token: token });
      if (!alive) return;
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const next = data as TrackedOrder;
      setOrder(next);
      setLoading(false);
      // Berhenti total saat status final; backoff 3→10→30 dtk sebelumnya.
      if (TERMINAL.has(String(next.status))) return;
      tries += 1;
      const wait = tries < 6 ? 3000 : tries < 12 ? 10000 : 30000;
      if (tries >= 40) return; // ±15 menit, cukup.
      timer = window.setTimeout(fetchOnce, wait);
    };
    fetchOnce();
    return () => {
      alive = false;
      window.clearTimeout(timer);
      window.clearTimeout(longTimer);
    };
  }, [orderId, token]);

  return { order, loading, notFound, waitingLong };
}

function orderStore(o: TrackedOrder | null): StoreProfile | null {
  if (!o) return null;
  return { id: "", store_name: o.store, store_slug: o.slug, city: null, owner_name: null, wa_number: null, avatar_url: null, cover_url: null, bio: null, is_closed: null };
}

/** Beacon kunjungan: 1x per sesi per toko (anti-spam + hemat kuota). */
function useVisitBeacon(sellerId: string | null | undefined, path: string) {
  useEffect(() => {
    if (!sellerId) return;
    const key = `tl_visit_${sellerId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    supabase
      .from("store_visits")
      .insert({ seller_id: sellerId, path })
      .then(() => {}, () => {});
  }, [sellerId, path]);
}

/** Warna aksen toko seller (dari store_theme) agar keranjang & checkout
 *  terasa bagian dari tokonya. Hanya warna — logic & validasi tidak berubah. */
function useStoreAccent(sellerId: string | null | undefined) {
  const [hex, setHex] = useState("#0A69C4");
  useEffect(() => {
    if (!sellerId) return;
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("store_theme")
        .select("accent")
        .eq("seller_id", sellerId)
        .maybeSingle();
      if (!alive) return;
      const a = (data as { accent?: string } | null)?.accent;
      if (a) setHex(accentHex(a));
    })();
    return () => {
      alive = false;
    };
  }, [sellerId]);
  return hex;
}

function useCartStore(items: { sellerId: string }[]) {
  const [store, setStore] = useState<StoreProfile | null>(null);
  const sellerId = items.length > 0 ? items[0].sellerId : null;
  useEffect(() => {
    if (!sellerId) {
      setStore(null);
      return;
    }
    (async () => {
      // BUG-004: keranjang hanya butuh identitas publik toko, via view tanpa PII.
      const { data } = await supabase
        .from("public_stores")
        .select("id,store_name,store_slug,city")
        .eq("id", sellerId)
        .maybeSingle();
      const resolved = (data as StoreProfile | null) ?? null;
      setStore(resolved);
    })();
  }, [sellerId]);
  return store;
}

export function Cart() {
  const { setQty, promo, setPromo, toast, clear } = useApp();
  const { items, subtotal, discount, total, promoNote, promoValid, loading } = useTotals(promo);
  const store = useCartStore(items);
  const payAccent = useStoreAccent(store?.id);
  const storeSlug = store?.store_slug || "";
  const [code, setCode] = useState("");
  const [remove, setRemove] = useState<{ id: string; name: string } | null>(null);
  // Satu checkout = satu toko. Beri tahu di awal (bukan setelah isi formulir).
  const mixed = [...new Set(items.map((i) => i.sellerId))].length > 1;

  return (
    <div className="min-h-screen bg-canvas pb-28">
      <StoreHeader crumb="Keranjang belanja" store={store} />
      <PageShell className="py-6">
        {mixed && (
          <div className="mb-5 rounded-xl border border-warn/40 bg-warnsoft p-4 text-[13.5px] leading-relaxed text-ink">
            <span className="font-bold">Keranjang berisi produk dari 2 toko berbeda.</span> Selesaikan
            satu toko dulu — <button onClick={() => { clear(); toast("Keranjang dikosongkan. Mulai lagi dari satu toko.", "warn"); }} className="font-bold underline underline-offset-4">kosongkan keranjang</button> lalu
            belanja lagi.
          </div>
        )}
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
                </dl>
                <div className="mt-4 flex items-end justify-between border-t border-linesoft pt-4">
                  <span className="text-[14px] font-bold text-ink">Total bayar</span>
                  <span className="tnum text-[24px] font-bold leading-none" style={{ color: payAccent }}>{rupiah(total)}</span>
                </div>
                {mixed ? (
                  <Button size="lg" className="mt-5 w-full" disabled>
                    Selesaikan satu toko dulu
                  </Button>
                ) : (
                  <ButtonLink to="/checkout" size="lg" className="mt-5 w-full" style={{ backgroundColor: payAccent, borderColor: payAccent }}>
                    Lanjut ke pembayaran <Icon name="arrowRight" size={17} />
                  </ButtonLink>
                )}
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
/* ------------------------- combobox kota/kabupaten ------------------------ */
/** Ketik untuk mencari (daftar instan + tetap boleh ketik manual). */
function CityCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  const results = searchCities(q);
  const pick = (c: string) => {
    onChange(c);
    setQ(c);
    setOpen(false);
  };
  return (
    <div className="relative">
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder="Ketik kota…"
        autoComplete="off"
        className="pr-9"
        aria-label="Kota atau kabupaten"
      />
      <Icon
        name="search"
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
      />
      {open &&
        (results.length > 0 ? (
          <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-md border border-line bg-white py-1 shadow-lift">
            {results.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(c)}
                  className="flex w-full items-center px-3 py-2 text-left text-[13.5px] text-ink hover:bg-brand-50"
                >
                  <Icon name="pin" size={14} className="mr-2 shrink-0 text-faint" />
                  {c}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          q.trim() && (
            <div className="absolute inset-x-0 top-full z-30 mt-1 rounded-md border border-line bg-white px-3 py-2 text-[12.5px] text-muted shadow-lift">
              Tidak ketemu — ketikanmu tetap dipakai.
            </div>
          )
        ))}
    </div>
  );
}

export function Checkout() {
  const { cart, toast, promo, clear } = useApp();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    addr: "",
    city: "Bandung",
    postal: "",
    note: "",
    pay: "QRIS",
  });
  const { items, subtotal, discount, total, loadError } = useTotals(promo);
  const store = useCartStore(items);
  // Aksen toko (dari store_theme) dipakai tombol bayar + total supaya
  // checkout terasa bagian dari tokonya. Logic & validasi tidak berubah.
  const payAccent = useStoreAccent(store?.id);
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  // Kunci idempotensi per upaya checkout: klik ganda / retry = 1 order.
  const [idemKey] = useState(() => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.floor(Math.random() * 1e9)}`));

  useEffect(() => {
    if (cart.length === 0) navigate("/cart");
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
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
    // v1: satu checkout = satu toko (multi-toko butuh split order).
    const sellerIds = [...new Set(items.map((i) => i.sellerId))];
    if (sellerIds.length > 1) {
      toast("Keranjang berisi produk beda toko. Selesaikan satu toko dulu.", "bad");
      return;
    }
    setLoading(true);
    try {
      const fullAddr = (form.postal.trim() ? `${form.addr.trim()} (${form.postal.trim()})` : form.addr.trim()).slice(0, 500);
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          seller_id: sellerIds[0],
          buyer_name: form.name.trim(),
          buyer_phone: form.phone,
          buyer_city: form.city,
          buyer_address: fullAddr,
          buyer_note: form.note.trim() || undefined,
          channel: "QRIS",
          cart: items.map((i) => ({ product_id: i.p.id, qty: i.qty })),
          promo_code: promo,
          idempotency_key: idemKey,
        }),
      });
      const out = (await res.json()) as {
        order_id?: string; access_token?: string;
        qr?: { qr_url: string; qris_image: string; total_amount: number; expired_at: string | null; payment_url: string | null; is_test: boolean } | null;
        qr_pending?: boolean; error?: string;
      };
      if (!res.ok || !out.order_id || !out.access_token) {
        toast(out.error ?? "Gagal membuat pesanan.", "bad");
        return;
      }
      if (out.qr) {
        try {
          sessionStorage.setItem(`tl_qr_${out.order_id}`, JSON.stringify(out.qr));
        } catch {
          /* penyimpanan penuh — halaman QR pakai pola qr_url */
        }
      }
      clear();
      navigate(`/checkout/qris?id=${out.order_id}&token=${out.access_token}`);
    } catch {
      toast("Tidak bisa menghubungi server.", "bad");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    if (loadError) {
      return (
        <div className="min-h-screen bg-canvas pb-28">
          <StoreHeader crumb="Checkout" store={store} />
          <PageShell className="py-6">
            <ErrorState
              desc="Koneksi bermasalah atau sesi berakhir. Coba muat ulang — isian Anda tetap tersimpan di halaman ini."
              onRetry={() => window.location.reload()}
            />
          </PageShell>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas pb-28">
      <StoreHeader crumb="Checkout" store={store} />
      <PageShell className="py-6">
        <div className="mb-6 flex items-center gap-2.5">
          {[
            ["1", "Keranjang", "/cart"],
            ["2", "Data pembeli", ""],
            ["3", "Bayar", ""],
            ["4", "Selesai", ""],
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
                    <CityCombobox value={form.city} onChange={(v) => set("city", v)} />
                  </Field>
                  <Field label="Kode pos (opsional)">
                    <Input
                      value={form.postal}
                      inputMode="numeric"
                      onChange={(e) => set("postal", e.target.value.replace(/\D/g, "").slice(0, 5))}
                      placeholder="Contoh: 40131"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-4 text-brand-600">02 / Pengiriman</div>
              <div className="flex gap-3 rounded-lg bg-canvas p-4 text-[13.5px] leading-relaxed text-muted">
                <Icon name="truck" size={17} className="mt-0.5 shrink-0 text-brand-500" />
                <p>
                  Barang diantar, diambil, atau dikirim ekspedisi — <span className="font-bold text-ink">atur langsung dengan penjual via chat</span> setelah
                  bayar. Tidak ada ongkir yang ditagih di sini.
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-4 text-brand-600">03 / Pembayaran</div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  ["QRIS", "qr", "Semua e-wallet & m-banking", "Biaya 0,7%"],
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
              </dl>
              <div className="mt-4 flex items-end justify-between border-t border-linesoft pt-4">
                <span className="text-[14px] font-bold text-ink">Total bayar</span>
                <span className="tnum text-[24px] font-bold leading-none" style={{ color: payAccent }}>{rupiah(total)}</span>
              </div>
              <Button type="submit" size="lg" loading={loading} className="mt-5 w-full" style={{ backgroundColor: payAccent, borderColor: payAccent }}>
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
export function Qris({ orderId, token }: { orderId: string; token: string }) {
  const { toast } = useApp();
  const { order, loading, notFound } = useOrderStatus(orderId, token);
  const store = orderStore(order);
  const [cancelling, setCancelling] = useState(false);
  const merchant = order?.store ?? store?.store_name ?? "Toko";
  const storeSlug = order?.slug ?? store?.store_slug ?? "";
  const [qr, setQr] = useState<{
    qr_url: string; qris_image: string; total_amount: number;
    expired_at: string | null; payment_url: string | null; is_test: boolean;
  } | null>(null);
  const [imgOk, setImgOk] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`tl_qr_${orderId}`);
      if (raw) setQr(JSON.parse(raw));
    } catch {
      /* abaikan */
    }
  }, [orderId]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const externalRef = (order as (TrackedOrder & { external_ref?: string | null }) | null)?.external_ref ?? null;
  const qrSrc = qr?.qr_url ?? (externalRef ? `https://app.buatqris.site/poto/qris/${externalRef}.png` : null);
  const amount = qr?.total_amount ?? Number(order?.amount_due ?? order?.total ?? 0);
  const left = qr?.expired_at ? Math.max(0, Math.floor((new Date(qr.expired_at).getTime() - now) / 1000)) : 300;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const expired = left === 0;

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-navy-900 pb-24">
        <div className="blueprint absolute inset-0 opacity-70" />
        <div className="relative mx-auto w-full max-w-[520px] px-4 pt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="mt-4 h-64 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-navy-900 pb-24">
        <div className="blueprint absolute inset-0 opacity-70" />
        <div className="relative mx-auto w-full max-w-[520px] px-4 pt-6">
          <EmptyState
            icon="search"
            title="Pesanan tidak ditemukan"
            desc="Link pembayaran salah atau tidak lengkap."
            action={
              <ButtonLink to="/cart">
                Kembali ke keranjang <Icon name="arrowRight" size={16} />
              </ButtonLink>
            }
          />
        </div>
      </div>
    );
  }

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
          <div className="tnum mt-5 text-[40px] font-bold leading-none text-white">{rupiah(amount)}</div>
          <div className="mt-2 text-[13.5px] text-white/60">
            {merchant} · pesanan <span className="tnum text-white/85">{order.id}</span>
          </div>
          {qr?.is_test && (
            <div className="micro mt-2 text-warn">MODE SANDBOX — tanpa uang asli</div>
          )}
        </div>

        <div className="notch-lg mt-6 rounded-xl border border-white/15 bg-white p-5 shadow-lift">
          <div className="flex flex-col items-center">
            {qrSrc && imgOk ? (
              <div className="relative">
                <img
                  src={qrSrc}
                  alt={`QRIS ${rupiah(amount)}`}
                  width={260}
                  height={260}
                  className="h-[260px] w-[260px] rounded-lg border border-line object-contain"
                  onError={() => setImgOk(false)}
                />
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border-2 border-white bg-white shadow-xs">
                  <LogoMark size={42} />
                </span>
              </div>
            ) : (
              <div className="flex w-full flex-col items-center rounded-lg border border-dashed border-line bg-canvas px-4 py-10 text-center">
                <Icon name="qr" size={30} className="text-faint" />
                <p className="mt-3 text-[14px] font-bold text-ink">QR belum jadi</p>
                <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted">
                  Pesananmu tersimpan. QR gagal dibuat — kembali dan buat ulang pesanan.
                </p>
                <Button variant="secondary" className="mt-4" onClick={() => navigate("/cart")}>
                  Kembali ke keranjang
                </Button>
              </div>
            )}
            <div className="mt-4 w-full space-y-1.5 border-t border-linesoft pt-4 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-muted">Merchant</span>
                <span className="font-semibold text-ink">{merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Jumlah ditagih</span>
                <span className="tnum font-semibold text-ink">{rupiah(amount)}</span>
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
            onClick={() => navigate(`/checkout/status?id=${order.id}&token=${token}`)}
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
        body="Pesanan yang belum dibayar akan dibatalkan dan QR-nya mati. Kalau Anda sudah terlanjur membayar, hubungi penjual."
        confirmLabel={cancelling ? "Membatalkan…" : "Ya, batalkan"}
        onConfirm={async () => {
          if (!order) return;
          setCancelling(true);
          try {
            const res = await fetch("/api/cancel-order", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ order_id: order.id, access_token: token }),
            });
            const out = (await res.json()) as { ok?: boolean; error?: string };
            if (!res.ok || !out.ok) {
              toast(out.error ?? "Gagal membatalkan.", "bad");
              return;
            }
            try {
              sessionStorage.removeItem(`tl_qr_${order.id}`);
            } catch {
              /* abaikan */
            }
            toast("Pesanan dibatalkan.", "warn");
            navigate(`/s/${storeSlug}`);
          } catch {
            toast("Tidak bisa menghubungi server.", "bad");
          } finally {
            setCancelling(false);
            setConfirmCancel(false);
          }
        }}
      />
    </div>
  );
}

/* ----------------------------- payment status ----------------------------- */
export function PaymentStatus({ orderId, token }: { orderId: string; token: string }) {
  const { order, loading, notFound, waitingLong } = useOrderStatus(orderId, token);
  const store = orderStore(order);
  const status = order?.status ?? "menunggu";
  // Pemetaan status eksplisit (jangan else→selesai):
  // menunggu = belum bayar, dikemas = UANG MASUK (webhook sukses),
  // dikirim = kurir, selesai = terima, batal = gagal/kedaluwarsa.
  const paid = status === "dikemas" || status === "dikirim" || status === "selesai";
  const failed = status === "batal";
  const step = status === "menunggu" ? 0 : status === "dikemas" ? 2 : failed ? 0 : 3;
  const finished = paid;
  const steps = [
    { t: "Menunggu pembayaran", d: "QRIS dipindai, transaksi dibuat." },
    { t: "Pembayaran diterima", d: "Dana masuk ke saldo penjual." },
    { t: "Pesanan dikemas", d: `${order?.store ?? "Toko"} menyiapkan barang.` },
    { t: "Siap dikirim", d: "Menunggu kurir menjemput paket." },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <StoreHeader crumb="Status pembayaran" />
        <PageShell className="py-8">
          <div className="mx-auto max-w-[560px] space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </PageShell>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-canvas">
        <StoreHeader crumb="Status pembayaran" />
        <PageShell className="py-10">
          <EmptyState
            icon="search"
            title="Tidak ada pesanan aktif"
            desc="Halaman ini dibuka dari tombol bayar setelah pesanan dibuat."
            action={
              <ButtonLink to="/cart">
                Kembali ke keranjang <Icon name="arrowRight" size={16} />
              </ButtonLink>
            }
          />
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <StoreHeader crumb="Status pembayaran" store={store} />
      <PageShell className="py-8">
        <div className="mx-auto max-w-[560px]">
          {failed ? (
            <div className="notch rounded-xl border border-line bg-white p-6 text-center shadow-card">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-badsoft text-bad">
                <Icon name="alert" size={30} />
              </div>
              <div className="micro mt-5 text-bad">04 / Pembayaran gagal</div>
              <h1 className="mt-2 text-[24px] font-extrabold tracking-[-0.02em] text-ink">
                Pesanan dibatalkan
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
                QR pembayaran ini sudah kedaluwarsa atau dibatalkan. Uang tidak jadi berpindah.
                Mau coba lagi? Buat pesanan baru dari toko.
              </p>
              <div className="rise mt-6 flex flex-col gap-2.5 sm:flex-row">
                <ButtonLink to={store?.store_slug ? `/s/${store.store_slug}` : "/"} className="flex-1" size="lg">
                  Pesan ulang
                </ButtonLink>
              </div>
            </div>
          ) : (
          <div className="notch rounded-xl border border-line bg-white p-6 text-center shadow-card">
            <div className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full ${finished ? "bg-oksoft text-ok" : "bg-brand-50 text-brand-600"}`}>
              {finished ? <Icon name="check" size={32} strokeWidth={2.6} /> : <Spinner />}
              {!finished && <span className="absolute inset-0 rounded-full border-2 border-brand-200" />}
            </div>
            <div className={`micro mt-5 ${finished ? "text-ok" : "text-brand-600"}`}>
              {finished ? "04 / Pembayaran diterima" : "04 / Memeriksa pembayaran"}
            </div>
            <h1 className="mt-2 text-[24px] font-extrabold tracking-[-0.02em] text-ink">
              {finished ? "Pembayaran lunas!" : "Sedang mengonfirmasi ke bank…"}
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
              {finished
                ? "Dana sudah masuk ke saldo penjual."
                : waitingLong && order.status === "menunggu"
                  ? "Sudah lebih dari 90 detik tapi pembayaran belum masuk. Kalau kamu sudah bayar, tunggu sebentar lagi atau hubungi penjual."
                  : "Biasanya selesai dalam beberapa detik. Jangan tutup layar ini."}
            </p>

            <div className="mt-6 rounded-lg bg-canvas p-4 text-left">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-muted">Nomor pesanan</span>
                <span className="tnum font-bold text-ink">{order.id}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[13.5px]">
                <span className="text-muted">Metode</span>
                <span className="font-semibold text-ink">{order.channel ?? "QRIS"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[13.5px]">
                <span className="text-muted">Total dibayar</span>
                <span className="tnum font-bold text-ink">
                  {rupiah(Number(order.amount_due ?? order.total))}
                </span>
              </div>
            </div>
          </div>
          )}

          {!failed && (
          <>
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

          {step >= 2 && !failed && (
            <div className="rise mt-4 flex flex-col gap-2.5 sm:flex-row">
              <ButtonLink to={`/checkout/success?id=${order.id}&token=${token}`} className="flex-1" size="lg">
                Lihat konfirmasi <Icon name="arrowRight" size={16} />
              </ButtonLink>
              <ButtonLink to={`/order/${order.id}?token=${token}`} variant="secondary" size="lg" className="flex-1">
                Lacak pesanan
              </ButtonLink>
            </div>
          )}
          </>
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
export function OrderSuccess({ orderId, token }: { orderId: string; token: string }) {
  const { toast, clear } = useApp();
  const { order, loading, notFound } = useOrderStatus(orderId, token);
  const store = orderStore(order);
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas pb-16">
        <StoreHeader crumb="Pembayaran berhasil" />
        <PageShell className="py-8">
          <div className="mx-auto max-w-[600px] space-y-3">
            <Skeleton className="h-48 w-full" />
          </div>
        </PageShell>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-canvas pb-16">
        <StoreHeader crumb="Pembayaran berhasil" />
        <PageShell className="py-10">
          <EmptyState
            icon="search"
            title="Pesanan tidak ditemukan"
            desc="Link konfirmasi salah atau tidak lengkap."
            action={
              <ButtonLink to="/cart">
                Kembali ke keranjang <Icon name="arrowRight" size={16} />
              </ButtonLink>
            }
          />
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-16">
      <StoreHeader crumb="Pembayaran berhasil" store={store} />
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
              Pesanan <span className="tnum font-bold text-ink">{order.id}</span> sudah diteruskan ke
              {order.store ?? "toko"}. Simpan ID pesanan ini untuk lacak status.
            </p>

            <div className="mt-6 rounded-lg border border-line bg-canvas p-4 text-left">
              <div className="flex items-center justify-between border-b border-linesoft pb-3">
                <span className="micro text-faint">Total dibayar</span>
                <span className="tnum text-[19px] font-bold text-brand-700">
                  {rupiah(Number(order.amount_due ?? order.total))}
                </span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {order.items.map((it) => (
                  <li key={it.name} className="flex items-center justify-between gap-3 text-[13.5px]">
                    <span className="truncate text-muted">
                      {it.qty} × {it.name}
                    </span>
                    <span className="tnum shrink-0 font-semibold text-ink">{rupiah(Number(it.price) * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-linesoft pt-3 text-[13.5px]">
                <span className="text-muted">Metode pembayaran</span>
                <span className="font-semibold text-ink">{order.channel ?? "QRIS"} · Lunas</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <ButtonLink to={`/order/${order.id}?token=${token}`} className="flex-1" size="lg">
                <Icon name="truck" size={17} /> Lacak pesanan
              </ButtonLink>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => openStoreWA(order.wa_url ?? null, toast, `Halo, saya mau tanya pesanan ${order.id}`)}
              >
                <Icon name="wa" size={17} className="text-[#0a7a56]" /> Chat penjual
              </Button>
            </div>
            <Link
              to={order.slug ? `/s/${order.slug}` : "/"}
              className="mt-4 inline-block text-[13.5px] font-semibold text-muted hover:text-brand-700"
            >
              Kembali ke toko
            </Link>
          </div>

          {/* Cross-sell mock disembunyikan: produk contoh + link Bu Ani.
              Dikembalikan di 3.5 dengan produk terkait asli dari order. */}
        </div>
      </PageShell>
    </div>
  );
}

/* -------------------------------- tracking -------------------------------- */
export function OrderTracking({ id }: { id: string }) {
  const { toast } = useApp();
  // Route "#/order/TL-xxxx?token=uuid" — id & token dipisah di sini.
  const [orderId, query] = id.split("?");
  const token = new URLSearchParams(query ?? "").get("token") ?? "";

  type Tracked = {
    id: string; status: string; total: number | string; amount_due?: number | string;
    channel: string | null; wa_url?: string | null;
    created_at: string; buyer: string; city: string | null;
    store: string | null; slug: string | null;
    items: { name: string; qty: number; price: number | string }[];
  };
  const [order, setOrder] = useState<Tracked | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);
      if (!token) {
        setLoading(false);
        setNotFound(true);
        return;
      }
      const { data, error } = await supabase.rpc("track_order", { p_id: orderId, p_token: token });
      if (error || !data) {
        setLoading(false);
        setNotFound(true);
        return;
      }
      setOrder(data as Tracked);
      setLoading(false);
    })();
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas pb-16">
        <StoreHeader crumb="Lacak pesanan" />
        <PageShell className="py-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </PageShell>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-canvas pb-16">
        <StoreHeader crumb="Lacak pesanan" />
        <PageShell className="py-10">
          <EmptyState
            icon="search"
            title="Pesanan tidak ditemukan"
            desc="Link lacak salah atau tidak lengkap. Minta link baru ke penjual lewat WhatsApp."
          />
        </PageShell>
      </div>
    );
  }

  const doneMap: Record<string, boolean[]> = {
    menunggu: [true, false, false, false, false],
    dikemas: [true, true, true, false, false],
    dikirim: [true, true, true, true, false],
    selesai: [true, true, true, true, true],
    batal: [true, false, false, false, false],
  };
  const done = doneMap[order.status] ?? doneMap.menunggu;
  const made = new Date(order.created_at).toLocaleString("id-ID", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
  const timeline = [
    { t: "Pesanan dibuat", d: made, note: `Oleh ${order.buyer}${order.city ? `, ${order.city}` : ""}.` },
    { t: "Pembayaran diterima", d: done[1] ? "✓" : "—", note: done[1] ? `Rp${Number(order.amount_due ?? order.total).toLocaleString("id-ID")} lewat ${order.channel ?? "QRIS"}.` : "Menunggu pembayaran." },
    { t: "Dikemas penjual", d: done[2] ? "✓" : "—", note: done[2] ? `Dikemas di ${order.store ?? "toko"}.` : "Menunggu pengemasan." },
    { t: "Sedang dikirim", d: done[3] ? "✓" : "—", note: done[3] ? "Paket menuju alamat penerima." : "Belum dikirim." },
    { t: "Selesai", d: done[4] ? "✓" : "—", note: done[4] ? "Barang sudah diterima." : "Konfirmasi setelah barang diterima." },
  ];
  const badgeTone = order.status === "selesai" ? "green" : order.status === "batal" ? "red" : order.status === "menunggu" ? "amber" : "blue";
  const badgeLabel =
    order.status === "selesai" ? "Selesai" : order.status === "batal" ? "Dibatalkan" : order.status === "menunggu" ? "Menunggu bayar" : "Diproses";

  return (
    <div className="min-h-screen bg-canvas pb-16">
      <StoreHeader crumb={`Pesanan ${orderId}`} />
      <PageShell className="py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="micro mb-2 text-brand-600">Lacak pesanan</div>
            <h1 className="tnum text-[26px] font-extrabold tracking-[-0.03em] text-ink">{orderId}</h1>
          </div>
          <Badge tone={badgeTone} dot>
            {badgeLabel}
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-4 text-faint">Riwayat pengiriman</div>
              <ol className="relative space-y-6 pl-9">
                <span className="absolute left-[13px] top-2 h-[calc(100%-16px)] w-px bg-line" />
                {timeline.map((s, i) => (
                  <li key={s.t} className="relative">
                    <span
                      className={cx(
                        "absolute -left-9 top-0 grid h-7 w-7 place-items-center rounded-full border-2 bg-white",
                        done[i] ? "border-ok text-ok" : "border-line text-faint",
                      )}
                    >
                      {done[i] ? (
                        <Icon name="check" size={14} strokeWidth={3} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className={cx("text-[14.5px] font-bold", done[i] ? "text-ink" : "text-faint")}>
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
                {order.items.map((it) => (
                  <li key={it.name} className="flex items-center justify-between gap-3 text-[14px]">
                    <span className="text-ink">
                      <span className="tnum text-muted">{it.qty} ×</span> {it.name}
                    </span>
                    <span className="tnum font-semibold text-ink">{rupiah(Number(it.price) * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-linesoft pt-4">
                <span className="text-[14px] font-bold text-ink">Total dibayar</span>
                <span className="tnum text-[19px] font-bold text-brand-700">
                  {rupiah(Number(order.amount_due ?? order.total))}
                </span>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-3 text-faint">Bagikan link lacak</div>
              <p className="text-[13px] leading-relaxed text-muted">
                Kirim link halaman ini ke pembeli via WhatsApp agar bisa cek status sendiri.
              </p>
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => {
                  setCopied(true);
                  const url = window.location.href;
                  if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
                  toast("Link lacak disalin.");
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                <Icon name={copied ? "check" : "copy"} size={16} /> {copied ? "Tersalin" : "Salin link lacak"}
              </Button>
            </div>

            <div className="rounded-xl border border-line bg-white p-5">
              <div className="micro mb-3 text-faint">Penjual</div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-800">
                  <LogoMark size={26} />
                </span>
                <div className="leading-tight">
                  <div className="text-[14px] font-bold text-ink">{order.store ?? "Toko"}</div>
                  <div className="text-[12.5px] text-faint">Chat untuk tanya status pesanan</div>
                </div>
              </div>
              {order.slug ? (
                <ButtonLink to={`/s/${order.slug}`} variant="secondary" className="mt-4 w-full">
                  <Icon name="store" size={16} /> Kunjungi toko
                </ButtonLink>
              ) : null}
              <Button
                className="mt-2.5 w-full"
                variant="secondary"
                onClick={() => openStoreWA(order.wa_url ?? null, toast, `Halo, saya mau tanya pesanan ${order.id}`)}
              >
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
