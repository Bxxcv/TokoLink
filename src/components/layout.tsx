import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { Link, navigate, useRoute } from "../lib/router";
import { useApp } from "../lib/data";
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
      { label: "Pesanan", to: "/app/orders", icon: "receipt", badge: 3 },
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
      { label: "Pustaka komponen", to: "/system", icon: "layers" },
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
      { label: "Permintaan Premium", to: "/admin/premium", icon: "star", badge: 2 },
      { label: "Penarikan dana", to: "/admin/withdrawals", icon: "wallet", badge: 1 },
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
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-800 text-brand-300">
        <LogoMark size={22} />
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block text-[14px] font-extrabold text-ink">
          {admin ? "TokoLink Indonesia" : "Dapoer Bu Ani"}
        </span>
        <span className="micro text-faint">{admin ? "Admin Master" : "tokolink.id/dapoer-bu-ani"}</span>
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
  const groups = admin ? ADMIN_NAV : SELLER_NAV;
  const [sheet, setSheet] = useState(false);
  const { toast } = useApp();

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
          {!admin && (
            <div className="notch mb-3 bg-navy-800 p-3.5">
              <div className="micro text-brand-300">Paket Premium</div>
              <p className="mt-1 text-[13px] font-semibold leading-snug text-white">
                Biaya QRIS tinggal 0,5% dan laporan bisa diunduh.
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
            <Avatar name={admin ? "Dwi Handoko" : "Ani Rahayu"} size={34} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[13.5px] font-bold text-ink">
                {admin ? "Dwi Handoko" : "Ani Rahayu"}
              </div>
              <div className="truncate text-[11.5px] text-faint">{admin ? "Super admin" : "Pemilik toko"}</div>
            </div>
            <Link to="/login" aria-label="Keluar" className="rounded-md p-1.5 text-faint hover:bg-canvas hover:text-bad">
              <Icon name="logout" size={17} />
            </Link>
          </div>
        </div>
      </aside>

      {/* ---------------- main column ---------------- */}
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <button
            onClick={() => setSheet(true)}
            className="rounded-md border border-line p-2 text-muted transition-colors hover:bg-canvas hover:text-ink lg:hidden"
            aria-label="Buka menu"
          >
            <Icon name="menu" size={18} />
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
              <ButtonLink to="/s/dapoer-bu-ani" variant="secondary" size="sm" className="hidden sm:inline-flex">
                <Icon name="external" size={15} /> Lihat toko
              </ButtonLink>
            )}

            <Link
              to={admin ? "/admin/system" : "/app/notifications"}
              aria-label="Notifikasi"
              className="relative rounded-md border border-line p-2 text-muted transition-colors hover:bg-canvas hover:text-brand-700"
            >
              <Icon name="bell" size={18} />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold leading-none text-white">
                3
              </span>
            </Link>

            <span className="hidden sm:block">
              <Dropdown
                trigger={() => (
                  <span className="rounded-md p-1 transition-colors hover:bg-canvas">
                    <Avatar name={admin ? "Dwi Handoko" : "Ani Rahayu"} size={34} />
                  </span>
                )}
                items={[
                  { label: admin ? "Profil admin" : "Profil & akun", icon: "user", onClick: () => navigate(admin ? "/admin/users" : "/app/account") },
                  { label: "Pengaturan toko", icon: "settings", onClick: () => navigate(admin ? "/admin/system" : "/app/settings") },
                  ...(admin
                    ? [{ label: "Halaman publik", icon: "home", onClick: () => navigate("/") }]
                    : [{ label: "Lihat toko publik", icon: "external", onClick: () => navigate("/s/dapoer-bu-ani") }]),
                  { label: "Keluar", icon: "logout", danger: true, sep: true, onClick: () => navigate("/login") },
                ]}
              />
            </span>
          </div>
        </header>

        <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</main>
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

      {/* ---------------- mobile sheet ---------------- */}
      {sheet && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="fade absolute inset-0 bg-navy-900/45" onClick={() => setSheet(false)} />
          <div className="rise absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-xl border-t border-line bg-white pb-6">
            <div className="sticky top-0 flex items-center justify-between border-b border-linesoft bg-white px-5 py-4">
              <Logo size={28} />
              <button
                onClick={() => setSheet(false)}
                aria-label="Tutup menu"
                className="rounded-md p-1.5 text-faint hover:bg-canvas hover:text-ink"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <NavList groups={groups} path={path} onNavigate={() => setSheet(false)} />
            <div className="px-5">
              <div className="border-t border-linesoft pt-4">
                <div className="flex items-center gap-2.5">
                  <Avatar name={admin ? "Dwi Handoko" : "Ani Rahayu"} size={36} />
                  <div className="flex-1 leading-tight">
                    <div className="text-[14px] font-bold text-ink">{admin ? "Dwi Handoko" : "Ani Rahayu"}</div>
                    <div className="text-[12px] text-faint">{admin ? "Super admin" : "Pemilik toko"}</div>
                  </div>
                  <Badge tone="blue" dot>
                    {admin ? "Admin" : "Premium"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export function MobileOnly({ children }: { children: ReactNode }) {
  return <div className="lg:hidden">{children}</div>;
}

export { cx2 };
