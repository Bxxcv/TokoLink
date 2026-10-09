import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Link, navigate, useRoute } from "../lib/router";
import { signOut, useAuth } from "../lib/auth";
import { useApp } from "../lib/store";
import { supabase } from "../lib/supabase";
import { countUnread } from "../lib/notifications";
import { Logo, LogoMark } from "./Logo";
import { Avatar, Badge, ButtonLink, Dropdown, Icon, cx } from "./ui";

const cx2 = clsx;

// Posisi scroll drawer mobile — modul-level supaya tetap ingat walau
// AppShell remount saat pindah halaman.
let drawerTop = 0;

type NavItem = { label: string; to: string; icon: string; badge?: number };
type NavGroup = { title?: string; items: NavItem[] };

export const SELLER_NAV: NavGroup[] = [
  {
    title: "Ringkasan",
    items: [
      { label: "Beranda", to: "/app", icon: "home" },
      { label: "Analitik", to: "/app/analytics", icon: "chartAlt" },
      { label: "Pengunjung", to: "/app/traffic", icon: "users" },
    ],
  },
  {
    title: "Jualan",
    items: [
      { label: "Pesanan", to: "/app/orders", icon: "receipt" }, // badge dihitung live, lihat AppShell
      { label: "Produk", to: "/app/products", icon: "box" },
      { label: "Kode promo", to: "/app/discount", icon: "tag" },
    ],
  },
  {
    title: "Toko",
    items: [
      { label: "Tampilan toko", to: "/app/theme", icon: "image" },
      { label: "Tautan bio", to: "/app/bio", icon: "link" },
      { label: "Jam buka", to: "/app/hours", icon: "clock" },
      { label: "QR toko", to: "/app/qr", icon: "qr" },
    ],
  },
  {
    title: "Keuangan",
    items: [
      { label: "Saldo", to: "/app/wallet", icon: "wallet" },
      { label: "Tarik dana", to: "/app/withdraw", icon: "down" },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      { label: "Pengaturan toko", to: "/app/settings", icon: "settings" },
      { label: "Profil & akun", to: "/app/account", icon: "user" },
    ],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    title: "Ringkasan",
    items: [
      { label: "Admin Master", to: "/admin", icon: "shield" },
      { label: "Analitik platform", to: "/admin/analytics", icon: "chartAlt" },
    ],
  },
  {
    title: "Operasi",
    items: [
      { label: "Kelola penjual", to: "/admin/sellers", icon: "store" },
      { label: "Permintaan Premium", to: "/admin/premium", icon: "star" },
      { label: "Penarikan dana", to: "/admin/withdrawals", icon: "wallet" },
      { label: "Pemantauan bayar", to: "/admin/payments", icon: "receipt" },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Pengguna akun", to: "/admin/users", icon: "users" },
      { label: "Pengaturan sistem", to: "/admin/system", icon: "settings" },
    ],
  },
];

function navActive(path: string, to: string) {
  if (to === "/app" || to === "/admin") return path === to;
  return path === to || path.startsWith(to + "/");
}

function NavList({ groups, path, onNavigate, dark }: { groups: NavGroup[]; path: string; onNavigate?: () => void; dark?: boolean }) {
  return (
    <nav className="space-y-5 px-3 py-4">
      {groups.map((g) => (
        <div key={g.title ?? g.items[0].to}>
          {g.title && <div className={cx("micro mb-2 px-3", dark ? "text-white/45" : "text-faint")}>{g.title}</div>}
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = navActive(path, it.to);
              return (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    onClick={onNavigate}
                    className={cx(
                      "notch-sm group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition-colors duration-150",
                      active
                        ? dark
                          ? "bg-white/10 font-bold text-white"
                          : "bg-brand-50 font-bold text-navy-800"
                        : dark
                          ? "font-medium text-white/60 hover:bg-white/5 hover:text-white"
                          : "font-medium text-muted hover:bg-canvas hover:text-ink",
                    )}
                  >
                    <span
                      className={cx(
                        "absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity duration-150",
                        active ? "bg-brand-500 opacity-100" : "opacity-0",
                      )}
                    />
                    <Icon
                      name={it.icon}
                      size={18}
                      className={active ? (dark ? "text-brand-300" : "text-brand-600") : dark ? "text-white/40 group-hover:text-brand-300" : "text-faint group-hover:text-brand-500"}
                    />
                    <span className="flex-1">{it.label}</span>
                    {it.badge ? (
                      <span className="tnum rounded-full bg-brand-600 px-1.5 py-px text-[10.5px] font-bold text-white">
                        {it.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function StoreSwitcher({ admin = false }: { admin?: boolean }) {
  const { profile } = useAuth();
  const storeName = admin ? "TokoLink Indonesia" : profile?.store_name || "";
  const storeSub = admin ? "Admin Master" : `tokolink.store/${profile?.store_slug || ""}`;
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-800 text-brand-300">
        <LogoMark size={22} />
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block text-[14px] font-extrabold text-ink">{storeName}</span>
        <span className="micro text-faint">{storeSub}</span>
      </span>
    </div>
  );
}

export function AppShell({
  group = "seller",
  children,
}: {
  group?: "seller" | "admin";
  children: ReactNode;
}) {
  const path = useRoute();
  const admin = group === "admin";
  const [sheet, setSheet] = useState(false);
  const { toast } = useApp();
  const { user, profile } = useAuth();

  // Posisi scroll drawer diingat (modul-level: tetap walau pindah halaman),
  // dan halaman belakang dikunci saat drawer terbuka.
  const drawerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sheet) return;
    const el = drawerRef.current;
    if (el) el.scrollTop = drawerTop;
    // Kunci scroll halaman belakang: html DAN body (salah satu saja
    // masih bisa lolos di sebagian browser HP).
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      const cur = drawerRef.current;
      if (cur) drawerTop = cur.scrollTop;
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [sheet]);

  // Badge "Pesanan" (sidebar) & lonceng notifikasi -- DULU hardcode `3`
  // di kode, tidak nyambung ke data apapun. Sekarang dihitung dari
  // database asli.
  const [pendingOrders, setPendingOrders] = useState(0);
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [pendingPremium, setPendingPremium] = useState(0);
  const [pendingWithdraw, setPendingWithdraw] = useState(0);
  useEffect(() => {
    if (admin || !user) return;
    let cancelled = false;
    (async () => {
      const [{ count }, unread] = await Promise.all([
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("seller_id", user.id)
          .eq("status", "menunggu"),
        countUnread(user.id),
      ]);
      if (cancelled) return;
      setPendingOrders(count ?? 0);
      setUnreadNotif(unread);
    })();
    return () => {
      cancelled = true;
    };
  }, [admin, user?.id]);

  // Badge antrean admin: hitung asli (premium + withdrawal menunggu).
  useEffect(() => {
    if (!admin || !user) return;
    let cancelled = false;
    (async () => {
      const [prem, wd] = await Promise.all([
        supabase.from("premium_requests").select("id", { count: "exact", head: true }).eq("status", "menunggu"),
        supabase.from("withdrawals").select("id", { count: "exact", head: true }).eq("status", "menunggu"),
      ]);
      if (cancelled) return;
      setPendingPremium(prem.count ?? 0);
      setPendingWithdraw(wd.count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [admin, user?.id]);

  const groups = admin
    ? ADMIN_NAV.map((g) => ({
        ...g,
        items: g.items.map((it) =>
          it.to === "/admin/premium"
            ? { ...it, badge: pendingPremium || undefined }
            : it.to === "/admin/withdrawals"
              ? { ...it, badge: pendingWithdraw || undefined }
              : it,
        ),
      }))
    : SELLER_NAV.map((g) => ({
        ...g,
        items: g.items.map((it) =>
          it.to === "/app/orders" ? { ...it, badge: pendingOrders || undefined } : it,
        ),
      }));
  // Nama & toko ikut profil yang login; admin tetap pakai label mock sampai Fase 6.
  const sellerName = profile?.owner_name || "";
  const storeSlug = profile?.store_slug || "";
  // Admin belum ada halaman profil sendiri (Fase 6, AdminUsers) — sementara
  // pakai nama akun yang login kalau ada, jangan nama orang yang dikarang.
  const displayName = admin ? profile?.owner_name || "Admin" : sellerName;
  const avatarSrc = profile?.avatar_url || null;

  const mobileItems = (admin ? ADMIN_NAV[1].items : [
    SELLER_NAV[0].items[0],
    SELLER_NAV[2].items[0],
    SELLER_NAV[1].items[0],
    SELLER_NAV[4].items[0],
  ]).slice(0, 4);

  return (
    <div className="min-h-screen bg-canvas">
      {/* ---------------- sidebar (desktop) ---------------- */}
      {/* Admin punya chrome sendiri (gelap) — beda jelas dari dasbor seller. */}
      <aside className={cx("fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r lg:flex", admin ? "border-navy-900 bg-navy-900" : "border-line bg-white")}>
        <div className={cx("flex h-16 items-center border-b px-5", admin ? "border-white/10" : "border-line")}>
          <Link to={admin ? "/admin" : "/"} aria-label="Beranda TokoLink">
            <Logo size={30} tone={admin ? "dark" : "light"} wordClass={admin ? "text-white" : undefined} />
          </Link>
        </div>
        {admin && (
          <div className="micro flex items-center gap-2 bg-navy-900 px-5 py-2 text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Admin Master
          </div>
        )}
        <div className="tl-scroll flex-1 overflow-y-auto">
          <NavList groups={groups} path={path} dark={admin} />
        </div>
        <div className={cx("border-t p-3", admin ? "border-white/10" : "border-line")}>
          {!admin && (profile?.plan ?? "gratis") !== "premium" && (
            <div className="notch mb-3 bg-navy-800 p-3.5">
              <div className="micro text-brand-300">Paket Premium</div>
              <p className="mt-1 text-[13px] font-semibold leading-snug text-white">
                8 tema, analitik, dan badge Premium untuk tokomu.
              </p>
              <button
                onClick={() => {
                  navigate("/app/settings");
                  toast("Buka bagian Langganan untuk upgrade.", "info");
                }}
                className="mt-2.5 text-[12.5px] font-bold text-brand-300 underline underline-offset-4 hover:text-white"
              >
                Lihat paket
              </button>
            </div>
          )}
          <div className="flex items-center gap-2.5 px-1.5">
            <Avatar name={displayName} src={avatarSrc} size={34} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className={cx("truncate text-[13.5px] font-bold", admin ? "text-white" : "text-ink")}>
                {displayName}
              </div>
              <div className={cx("truncate text-[11.5px]", admin ? "text-white/55" : "text-faint")}>{admin ? "Super admin" : "Pemilik toko"}</div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              aria-label="Keluar"
              className={cx("rounded-md p-1.5", admin ? "text-white/55 hover:bg-white/10 hover:text-white" : "text-faint hover:bg-canvas hover:text-bad")}
            >
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------- main column ---------------- */}
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <button
            onClick={() => setSheet((s) => !s)}
            className="rounded-md border border-line p-2 text-muted transition-colors hover:bg-canvas hover:text-ink lg:hidden"
            aria-label={sheet ? "Tutup menu" : "Buka menu"}
            aria-expanded={sheet}
          >
            <span className="relative block h-[18px] w-[18px]">
              <Icon
                name="menu"
                size={18}
                className={cx(
                  "absolute inset-0 transition-all duration-200",
                  sheet ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
                )}
              />
              <Icon
                name="x"
                size={18}
                className={cx(
                  "absolute inset-0 transition-all duration-200",
                  sheet ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
                )}
              />
            </span>
          </button>

          <div className="lg:hidden">
            <Link to={admin ? "/admin" : "/app"} aria-label="TokoLink">
              <LogoMark size={26} />
            </Link>
          </div>

          <div className="hidden lg:block">
            <StoreSwitcher admin={admin} />
          </div>
          {admin && (
            <span className="micro hidden rounded-sm bg-navy-900 px-2 py-1 font-bold text-brand-300 sm:inline-block">
              Admin
            </span>
          )}

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {!admin && (
              <div className="relative hidden md:block">
                <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  placeholder="Cari produk… (Enter)"
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    const v = (e.target as HTMLInputElement).value.trim();
                    // Router ini berbasis hash (lihat lib/router.tsx) dan match path
                    // persis string "/app/products" -- tidak baca query string.
                    // Jadi kata kunci dititipkan lewat sessionStorage, bukan ?q=.
                    if (v) sessionStorage.setItem("tl_products_q", v);
                    navigate("/app/products");
                  }}
                  className="h-10 w-56 rounded-md border border-line bg-canvas pl-9 pr-3 text-[13.5px] outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                />
              </div>
            )}

            {!admin && (
              <ButtonLink to={`/s/${storeSlug}`} variant="secondary" size="sm" className="hidden sm:inline-flex">
                <Icon name="external" size={15} /> Lihat toko
              </ButtonLink>
            )}

            <Link
              to={admin ? "/admin/system" : "/app/notifications"}
              aria-label="Notifikasi"
              className="relative rounded-md border border-line p-2 text-muted transition-colors hover:bg-canvas hover:text-brand-700"
            >
              <Icon name="bell" size={18} />
              {!admin && unreadNotif > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold leading-none text-white">
                  {unreadNotif > 9 ? "9+" : unreadNotif}
                </span>
              )}
            </Link>

            <span className="hidden sm:block">
              <Dropdown
                  trigger={() => (
                    <span className="rounded-md p-1 transition-colors hover:bg-canvas">
                      <Avatar name={displayName} src={avatarSrc} size={34} />
                    </span>
                  )}
                items={[
                  { label: admin ? "Profil admin" : "Profil & akun", icon: "user", onClick: () => navigate(admin ? "/admin/users" : "/app/account") },
                  { label: "Pengaturan toko", icon: "settings", onClick: () => navigate(admin ? "/admin/system" : "/app/settings") },
                  ...(admin
                    ? [{ label: "Halaman publik", icon: "home", onClick: () => navigate("/") }]
                    : [{ label: "Lihat toko publik", icon: "external", onClick: () => navigate(`/s/${storeSlug}`) }]),
                  { label: "Keluar", icon: "logout", danger: true, sep: true, onClick: () => signOut() },
                ]}
              />
            </span>
          </div>
        </header>

        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12">{children}</main>
      </div>

      {/* ---------------- mobile bottom nav ---------------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/97 backdrop-blur-sm lg:hidden">
        <ul className="mx-auto flex max-w-lg items-stretch">
          {mobileItems.map((it) => {
            const active = navActive(path, it.to);
            return (
              <li key={it.to} className="flex-1">
                <Link
                  to={it.to}
                  className={cx(
                    "relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold transition-colors duration-150",
                    active ? "text-brand-700" : "text-faint",
                  )}
                >
                  <span
                    className={cx(
                      "absolute inset-x-4 top-0 h-[2.5px] rounded-b-full transition-opacity",
                      active ? "bg-brand-600 opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon name={it.icon} size={20} strokeWidth={active ? 2.1 : 1.7} />
                  {it.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              onClick={() => setSheet(true)}
              className="flex w-full flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold text-faint"
            >
              <Icon name="more" size={20} />
              Lainnya
            </button>
          </li>
        </ul>
      </nav>

      {/* ---------------- mobile drawer (kiri) ---------------- */}
      <div className={cx("fixed inset-0 z-[80] lg:hidden", !sheet && "pointer-events-none")}>
        <div
          className={cx(
            "absolute inset-0 bg-navy-900/45 transition-opacity duration-300",
            sheet ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setSheet(false)}
        />
        <aside
          className={cx(
            "absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col shadow-lift transition-transform duration-300 ease-out",
            admin ? "bg-navy-900" : "bg-white",
            sheet ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className={cx("flex h-16 shrink-0 items-center justify-between border-b px-5", admin ? "border-white/10" : "border-line")}>
            <Link to={admin ? "/admin" : "/app"} aria-label="TokoLink" onClick={() => setSheet(false)}>
              <Logo size={28} tone={admin ? "dark" : "light"} wordClass={admin ? "text-white" : undefined} />
            </Link>
            <button
              onClick={() => setSheet(false)}
              aria-label="Tutup menu"
              className={cx("rounded-md p-1.5", admin ? "text-white/55 hover:bg-white/10 hover:text-white" : "text-faint hover:bg-canvas hover:text-ink")}
            >
              <Icon name="x" size={18} />
            </button>
          </div>
          {admin && (
            <div className="micro flex items-center gap-2 bg-navy-900 px-5 py-2 text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Admin Master
            </div>
          )}
          <div
            ref={drawerRef}
            className="tl-scroll flex-1 overflow-y-auto"
            onScroll={(e) => {
              drawerTop = (e.target as HTMLDivElement).scrollTop;
            }}
          >
            <NavList groups={groups} path={path} onNavigate={() => setSheet(false)} dark={admin} />
          </div>
          <div className={cx("shrink-0 border-t p-4", admin ? "border-white/10" : "border-line")}>
            <div className="flex items-center gap-2.5 px-1">
              <Avatar name={displayName} src={avatarSrc} size={36} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className={cx("truncate text-[14px] font-bold", admin ? "text-white" : "text-ink")}>
                  {displayName}
                </div>
                <div className={cx("truncate text-[12px]", admin ? "text-white/55" : "text-faint")}>{admin ? "Super admin" : "Pemilik toko"}</div>
              </div>
              <Badge tone={admin || (profile?.plan ?? "gratis") === "premium" ? "blue" : "gray"} dot>
                {admin ? "Admin" : (profile?.plan ?? "gratis") === "premium" ? "Premium" : "Gratis"}
              </Badge>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-line px-3 py-2.5 text-[13.5px] font-bold text-bad transition-colors hover:bg-badsoft"
            >
              <Icon name="logout" size={16} /> Keluar
            </button>
          </div>
        </aside>
      </div>

    </div>
  );
}

export function MobileOnly({ children }: { children: ReactNode }) {
  return <div className="lg:hidden">{children}</div>;
}

export { cx2 };
