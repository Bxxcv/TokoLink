import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Link, navigate, useRoute } from "../lib/router";
import { signOut, useAuth } from "../lib/auth";
import { useApp } from "../lib/data";
import { supabase } from "../lib/supabase";
import { Logo, LogoMark } from "./Logo";
import { Avatar, Badge, ButtonLink, Dropdown, Icon, cx } from "./ui";

const cx2 = clsx;

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
      { label: "Pesanan", to: "/app/orders", icon: "receipt" },
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

/**
 * Angka badge asli: pesanan aktif seller (belum selesai/batal) dan
 * antrean admin (premium + penarikan menunggu). Gagal/0 → badge hilang.
 */
function useBadges(admin: boolean) {
  const { user } = useAuth();
  const [orders, setOrders] = useState(0);
  const [urgent, setUrgent] = useState(0);
  const [premium, setPremium] = useState(0);
  const [withdraw, setWithdraw] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        if (admin) {
          const [pr, wd] = await Promise.all([
            supabase.from("premium_requests").select("id", { count: "exact", head: true }).eq("status", "menunggu"),
            supabase.from("withdrawals").select("id", { count: "exact", head: true }).in("status", ["menunggu", "diproses"]),
          ]);
          setPremium(pr.count ?? 0);
          setWithdraw(wd.count ?? 0);
        } else {
          const [act, urg] = await Promise.all([
            supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", user.id).in("status", ["menunggu", "dikemas", "dikirim"]),
            supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", user.id).in("status", ["menunggu", "dikemas"]),
          ]);
          setOrders(act.count ?? 0);
          setUrgent(urg.count ?? 0);
        }
      } catch {
        /* gagal → badge disembunyikan */
      }
    })();
  }, [user?.id, admin]);

  return { orders, urgent, premium, withdraw };
}

function NavList({ groups, path, onNavigate }: { groups: NavGroup[]; path: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-5 px-3 py-4">
      {groups.map((g) => (
        <div key={g.title ?? g.items[0].to}>
          {g.title && <div className="micro mb-2 px-3 text-faint">{g.title}</div>}
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
                        ? "bg-brand-50 font-bold text-navy-800"
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
                      className={active ? "text-brand-600" : "text-faint group-hover:text-brand-500"}
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
  const storeSub = admin ? "Admin Master" : `tokolink.store/s/${profile?.store_slug || ""}`;
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
  const { orders, urgent, premium, withdraw } = useBadges(admin);
  // Tempelkan angka asli ke item nav (0 → badge hilang, bukan angka palsu).
  const groups = (admin ? ADMIN_NAV : SELLER_NAV).map((g) => ({
    ...g,
    items: g.items.map((it) => {
      if (!admin && it.to === "/app/orders") return orders > 0 ? { ...it, badge: orders } : it;
      if (admin && it.to === "/admin/premium") return premium > 0 ? { ...it, badge: premium } : it;
      if (admin && it.to === "/admin/withdrawals") return withdraw > 0 ? { ...it, badge: withdraw } : it;
      return it;
    }),
  }));
  const bellCount = admin ? premium + withdraw : urgent;
  const [sheet, setSheet] = useState(false);
  const { toast } = useApp();
  const { profile } = useAuth();
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-white lg:flex">
        <div className={cx("flex h-16 items-center border-b border-line px-5", admin && "border-b-0")}>
          <Link to={admin ? "/admin" : "/"} aria-label="Beranda TokoLink">
            <Logo size={30} />
          </Link>
        </div>
        {admin && (
          <div className="micro flex items-center gap-2 bg-navy-900 px-5 py-2 text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Admin Master
          </div>
        )}
        <div className="tl-scroll flex-1 overflow-y-auto">
          <NavList groups={groups} path={path} />
        </div>
        <div className="border-t border-line p-3">
          {!admin && (profile?.plan ?? "gratis") !== "premium" && (
            <div className="notch mb-3 bg-navy-800 p-3.5">
              <div className="micro text-brand-300">Paket Premium</div>
              <p className="mt-1 text-[13px] font-semibold leading-snug text-white">
                Bantuan prioritas & akses fitur baru lebih dulu.
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
              <div className="truncate text-[13.5px] font-bold text-ink">
                {displayName}
              </div>
              <div className="truncate text-[11.5px] text-faint">{admin ? "Super admin" : "Pemilik toko"}</div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              aria-label="Keluar"
              className="rounded-md p-1.5 text-faint hover:bg-canvas hover:text-bad"
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

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                placeholder={admin ? "Cari penjual atau transaksi…" : "Cari produk atau pesanan…"}
                className="h-10 w-56 rounded-md border border-line bg-canvas pl-9 pr-3 text-[13.5px] outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </div>

            {!admin && (
              <ButtonLink to={`/s/${storeSlug}`} variant="secondary" size="sm" className="hidden sm:inline-flex">
                <Icon name="external" size={15} /> Lihat toko
              </ButtonLink>
            )}

            <Link
              to={admin ? "/admin/system" : "/app/notifications"}
              aria-label={bellCount > 0 ? `${bellCount} notifikasi` : "Notifikasi"}
              className="relative rounded-md border border-line p-2 text-muted transition-colors hover:bg-canvas hover:text-brand-700"
            >
              <Icon name="bell" size={18} />
              {bellCount > 0 && (
                <span className="tnum absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold leading-none text-white">
                  {bellCount}
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
            "absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col bg-white shadow-lift transition-transform duration-300 ease-out",
            sheet ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <Link to={admin ? "/admin" : "/app"} aria-label="TokoLink" onClick={() => setSheet(false)}>
              <Logo size={28} />
            </Link>
            <button
              onClick={() => setSheet(false)}
              aria-label="Tutup menu"
              className="rounded-md p-1.5 text-faint hover:bg-canvas hover:text-ink"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className="tl-scroll flex-1 overflow-y-auto">
            <NavList groups={groups} path={path} onNavigate={() => setSheet(false)} />
          </div>
          <div className="shrink-0 border-t border-line p-4">
            <div className="flex items-center gap-2.5 px-1">
              <Avatar name={displayName} src={avatarSrc} size={36} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[14px] font-bold text-ink">
                  {displayName}
                </div>
                <div className="truncate text-[12px] text-faint">{admin ? "Super admin" : "Pemilik toko"}</div>
              </div>
              <Badge tone="blue" dot>
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
