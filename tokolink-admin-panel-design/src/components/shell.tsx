"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronsLeft,
  Crown,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  ReceiptText,
  ScrollText,
  Search,
  Settings,
  Store,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { dateLong, timeAgo } from "@/lib/format";
import { useToast } from "./ui";

interface ShellProps {
  maintenanceOn: boolean;
  maintenanceMessage: string;
  feePct: number;
  recentAudit: { id: string; action: string; target: string; amount: number | null; createdAt: string }[];
  stores: { name: string; slug: string }[];
  pending: { premium: number; withdrawals: number; stores: number };
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: "premium" | "withdrawals" | "stores";
}
const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    group: "Toko & Pengguna",
    items: [
      { href: "/admin/toko", label: "Toko", icon: Store, badge: "stores" },
      { href: "/admin/pengguna", label: "Pengguna", icon: Users },
    ],
  },
  {
    group: "Keuangan",
    items: [
      { href: "/admin/premium", label: "Premium", icon: Crown, badge: "premium" },
      { href: "/admin/transaksi", label: "Transaksi", icon: ReceiptText },
      { href: "/admin/tarik-dana", label: "Tarik Dana", icon: Wallet, badge: "withdrawals" },
    ],
  },
  {
    group: "Komunikasi",
    items: [{ href: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone }],
  },
  {
    group: "Sistem",
    items: [
      { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
      { href: "/admin/sistem", label: "Pengaturan", icon: Settings },
    ],
  },
];

function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <defs>
        <linearGradient id="tlk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6d5ef8" />
          <stop offset="100%" stopColor="#3b2dc2" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#tlk-g)" />
      <path
        d="M16.5 23.5 23.5 16.5M19 13.8l3.6-3.6a4.4 4.4 0 0 1 6.2 6.2L25.2 20M21 26.2l-3.6 3.6a4.4 4.4 0 0 1-6.2-6.2L14.8 20"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function Shell({
  maintenanceOn,
  maintenanceMessage,
  feePct,
  recentAudit,
  stores,
  pending,
  children,
}: ShellProps) {
  const pathname = usePathname();
  const { push } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [q, setQ] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(dateLong(new Date()));
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem("tlk-sidebar") === "1") setCollapsed(true);
    } catch {}
  }, []);
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem("tlk-sidebar", c ? "0" : "1");
      } catch {}
      return !c;
    });

  useEffect(() => setMobileOpen(false), [pathname]);

  const searchResults = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return { nav: NAV.flatMap((g) => g.items), stores: [] };
    return {
      nav: NAV.flatMap((g) => g.items).filter((i) => i.label.toLowerCase().includes(s)),
      stores: stores.filter((st) => (st.name + st.slug).toLowerCase().includes(s)).slice(0, 5),
    };
  }, [q, stores]);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const badgeCount = (b?: NavItem["badge"]) =>
    b === "premium" ? pending.premium : b === "withdrawals" ? pending.withdrawals : b === "stores" ? pending.stores : 0;

  const SidebarInner = ({ isMobile }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 pt-5 pb-4 ${collapsed && !isMobile ? "justify-center px-2" : ""}`}>
        <LogoMark />
        {(!collapsed || isMobile) && (
          <div className="min-w-0 leading-none">
            <p className="font-display text-[15px] font-bold tracking-tight">
              TokoLink
              <span className="ml-1.5 rounded bg-brand-50 px-1.5 py-0.5 align-middle text-[9px] font-extrabold tracking-widest text-brand-700">
                ADMIN
              </span>
            </p>
            <p className="mt-1 text-[10.5px] font-semibold text-mute">Admin Master</p>
          </div>
        )}
        {isMobile ? (
          <button onClick={() => setMobileOpen(false)} className="ml-auto rounded-lg p-2 text-mute hover:bg-canvas" aria-label="Tutup menu">
            <X className="size-4.5" />
          </button>
        ) : (
          <button
            onClick={toggleCollapsed}
            className="ml-auto hidden rounded-lg p-2 text-mute transition hover:bg-canvas hover:text-ink md:block"
            aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          >
            {collapsed ? <ChevronsLeft className="size-4 rotate-180" /> : <ChevronsLeft className="size-4" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        {NAV.map((g, gi) => (
          <div key={gi}>
            {g.group &&
              (!collapsed || isMobile) && (
                <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-mute/80">
                  {g.group}
                </p>
              )}
            {g.group && collapsed && !isMobile && <div className="mx-3 mb-2 border-t border-line" />}
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                const badge = badgeCount(item.badge);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-semibold transition ${
                      collapsed && !isMobile ? "justify-center px-0" : ""
                    } ${
                      active
                        ? "bg-brand-600 text-white shadow-[0_6px_16px_-6px_rgba(91,76,245,0.55)]"
                        : "text-mute hover:bg-canvas hover:text-ink"
                    }`}
                  >
                    <Icon className={`size-4.5 shrink-0 ${active ? "" : "text-mute group-hover:text-ink"}`} />
                    {(!collapsed || isMobile) && <span className="flex-1 truncate">{item.label}</span>}
                    {badge > 0 &&
                      (!collapsed || isMobile) && (
                        <span
                          className={`tnum rounded-full px-1.5 py-px text-[10.5px] font-bold ${
                            active ? "bg-white/20 text-white" : "bg-brand-50 text-brand-700"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    {badge > 0 && collapsed && !isMobile && (
                      <span className="absolute top-1.5 right-2.5 size-2 rounded-full bg-brand-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer sidebar */}
      <div className="border-t border-line p-3">
        <div className={`rounded-xl bg-canvas p-3 ${collapsed && !isMobile ? "px-2 text-center" : ""}`}>
          <div className={`flex items-center gap-2 ${collapsed && !isMobile ? "justify-center" : ""}`}>
            <span className="relative flex size-2">
              <span className={`ring-ping absolute inline-flex size-2 rounded-full ${maintenanceOn ? "bg-warn-500" : "bg-ok-500"}`} />
              <span className={`relative inline-flex size-2 rounded-full ${maintenanceOn ? "bg-warn-500" : "bg-ok-500"}`} />
            </span>
            {(!collapsed || isMobile) && (
              <p className="text-[11px] font-bold">
                {maintenanceOn ? "Maintenance aktif" : "Semua layanan normal"}
              </p>
            )}
          </div>
          {(!collapsed || isMobile) && (
            <p className="mt-1.5 text-[10.5px] font-semibold text-mute">
              Fee platform <span className="tnum text-ink">{feePct.toLocaleString("id-ID")}%</span> · v0.1
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-white transition-[width] duration-300 md:block ${
          collapsed ? "w-[76px]" : "w-[236px]"
        }`}
      >
        <SidebarInner />
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="anim-pop absolute inset-y-0 left-0 w-[260px] border-r border-line bg-white shadow-2xl">
            <SidebarInner isMobile />
          </aside>
        </div>
      )}

      <div className={`transition-[padding] duration-300 ${collapsed ? "md:pl-[76px]" : "md:pl-[236px]"}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-7">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-mute transition hover:bg-canvas md:hidden"
              aria-label="Buka menu"
            >
              <Menu className="size-5" />
            </button>

            {/* Pencarian */}
            <div className="relative w-full max-w-[340px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mute" />
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => window.setTimeout(() => setSearchFocus(false), 120)}
                placeholder="Cari halaman atau toko…"
                className="h-10 w-full rounded-xl border border-line bg-canvas/70 pr-3 pl-9 text-sm outline-none transition placeholder:text-mute/70 focus:border-brand-400 focus:bg-white focus:ring-3 focus:ring-brand-100"
              />
              {searchFocus && (
                <div className="anim-pop absolute top-12 right-0 left-0 z-40 overflow-hidden rounded-xl border border-line bg-white shadow-xl">
                  {q.trim() === "" && searchResults.nav.length > 0 && (
                    <p className="px-3 pt-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-mute">
                      Halaman
                    </p>
                  )}
                  <div className="max-h-72 overflow-y-auto p-1.5">
                    {searchResults.nav.map((i) => {
                      const Icon = i.icon;
                      return (
                        <Link
                          key={i.href}
                          href={i.href}
                          onMouseDown={() => {
                            setQ("");
                            searchRef.current?.blur();
                          }}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-ink/80 transition hover:bg-canvas"
                        >
                          <Icon className="size-4 text-mute" />
                          {i.label}
                        </Link>
                      );
                    })}
                    {searchResults.stores.length > 0 && (
                      <p className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-mute">
                        Toko
                      </p>
                    )}
                    {searchResults.stores.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/admin/toko?q=${encodeURIComponent(s.name)}`}
                        onMouseDown={() => {
                          setQ("");
                          searchRef.current?.blur();
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-ink/80 transition hover:bg-canvas"
                      >
                        <Store className="size-4 text-mute" />
                        <span className="flex-1 truncate">{s.name}</span>
                        <span className="text-[11px] text-mute">/{s.slug}</span>
                      </Link>
                    ))}
                    {searchResults.nav.length + searchResults.stores.length === 0 && (
                      <p className="px-3 py-4 text-center text-xs text-mute">Tidak ada hasil untuk “{q}”.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="ml-auto hidden text-[13px] font-semibold text-mute lg:block">{today || "\u00A0"}</p>

            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setBellOpen((o) => !o);
                  setUserOpen(false);
                }}
                className="relative rounded-xl border border-line bg-white p-2.5 text-mute transition hover:text-ink"
                aria-label="Notifikasi"
              >
                <Bell className="size-4.5" />
                <span className="absolute top-1.5 right-2 size-2 rounded-full bg-bad-500" />
              </button>
              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setBellOpen(false)} />
                  <div className="anim-pop absolute right-0 z-40 mt-2 w-[330px] overflow-hidden rounded-xl border border-line bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                      <p className="font-display text-sm font-bold">Aktivitas platform</p>
                      <Link href="/admin/audit" onClick={() => setBellOpen(false)} className="text-xs font-bold text-brand-600 hover:text-brand-700">
                        Lihat semua
                      </Link>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {recentAudit.map((a) => (
                        <div key={a.id} className="flex items-start gap-3 border-b border-line/60 px-4 py-3 last:border-0">
                          <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${a.amount !== null ? "bg-brand-500" : "bg-line"}`} />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold">
                              {a.action} <span className="font-normal text-mute">· {a.target}</span>
                            </p>
                            <p className="mt-0.5 text-[11px] font-semibold text-mute">{timeAgo(a.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserOpen((o) => !o);
                  setBellOpen(false);
                }}
                className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2.5 transition hover:bg-canvas"
              >
                <span className="flex size-8.5 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[12px] font-extrabold text-white">
                  MF
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-[13px] font-bold">Muhammad Farid</span>
                  <span className="block text-[10.5px] font-semibold text-mute">Super Admin</span>
                </span>
              </button>
              {userOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserOpen(false)} />
                  <div className="anim-pop absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white shadow-xl">
                    <div className="border-b border-line px-4 py-3">
                      <p className="text-[13px] font-bold">Muhammad Farid</p>
                      <p className="text-[11.5px] text-mute">bxxcv@tokolink.id</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserOpen(false);
                        push({ variant: "info", title: "Ini build UI demo", desc: "Autentikasi akan memakai sistem login TokoLink yang sudah ada." });
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-mute transition hover:bg-canvas hover:text-ink"
                    >
                      <LogOut className="size-4" />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Banner maintenance */}
          {maintenanceOn && (
            <div className="flex items-center gap-2.5 border-t border-warn-100 bg-warn-50 px-4 py-2.5 lg:px-7">
              <AlertTriangle className="size-4 shrink-0 text-warn-600" />
              <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-warn-700">
                Mode maintenance aktif — toko melihat halaman maintenance. {maintenanceMessage}
              </p>
              <Link href="/admin/sistem" className="shrink-0 rounded-lg bg-warn-500 px-2.5 py-1.5 text-[11.5px] font-bold text-white transition hover:bg-warn-600">
                Buka pengaturan
              </Link>
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-7 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
