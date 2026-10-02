/* AdminUI — page shell: gradient canvas, rounded dashboard, slim sidebar, topbar. */
import type { ReactNode } from "react";
import { Link, useRoute } from "../../lib/router";
import {
  BellIcon,
  BrandBlob,
  ChatIcon,
  ChevronsRight,
  ClipboardIcon,
  GaugeIcon,
  GearIcon,
  GridIcon,
  LogoutIcon,
  MonitorIcon,
  SearchIcon,
  UsersIcon,
} from "./icons";

const NAV = [
  { to: "/admin-ui", icon: GaugeIcon, label: "Dashboard" },
  { to: "/admin-ui/orders", icon: ClipboardIcon, label: "Orders" },
  { to: "/admin-ui", icon: GridIcon, label: "Products" },
  { to: "/admin-ui", icon: UsersIcon, label: "Customers" },
  { to: "/admin-ui", icon: MonitorIcon, label: "Storefront" },
  { to: "/admin-ui", icon: ChatIcon, label: "Messages" },
];

function NavButtons({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const path = useRoute();
  return (
    <>
      {NAV.map((n, i) => {
        const active = path === n.to && (n.to === "/admin-ui/orders" ? i === 1 : i === 0);
        const hideOnTiny = compact && i >= 4 ? "hidden min-[420px]:grid" : "";
        return (
          <Link
            key={i}
            to={n.to}
            ariaLabel={n.label}
            title={n.label}
            onClick={onNavigate}
            className={`grid h-11 w-11 place-items-center rounded-2xl transition-colors ${hideOnTiny} ${
              active ? "bg-[#17181D] text-white shadow-[0_10px_20px_-10px_rgba(23,24,29,.7)]" : "text-[#8A90A0] hover:bg-[#F0F1F6] hover:text-[#17181D]"
            }`}
          >
            <n.icon size={20} />
          </Link>
        );
      })}
    </>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-[74px] shrink-0 flex-col items-center bg-white md:flex" style={{ borderRadius: "28px 0 0 28px" }}>
      <div className="flex w-full items-center justify-center gap-1.5 pt-6">
        <BrandBlob size={38} />
        <button type="button" aria-label="Collapse sidebar" className="-ml-1 text-[#B7BCC8] hover:text-[#17181D]">
          <ChevronsRight size={13} strokeWidth={2.2} />
        </button>
      </div>
      <nav className="mt-8 flex flex-col items-center gap-4">
        <NavButtons />
      </nav>
      <div className="flex-1" />
      <button type="button" aria-label="Log out" className="mb-7 grid h-11 w-11 place-items-center rounded-2xl text-[#8A90A0] hover:bg-[#F0F1F6] hover:text-[#17181D]">
        <LogoutIcon size={19} />
      </button>
    </aside>
  );
}

function MobileNav() {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl bg-white py-2 md:hidden"
      style={{ boxShadow: "0 12px 32px -12px rgba(22,23,28,.35)" }}
    >
      <NavButtons compact />
      <button type="button" aria-label="Log out" className="grid h-11 w-11 place-items-center rounded-2xl text-[#8A90A0]">
        <LogoutIcon size={19} />
      </button>
    </nav>
  );
}

function Topbar({ search = true }: { search?: boolean }) {
  return (
    <div className="flex items-center gap-4 px-6 pt-6 sm:px-8">
      {search ? (
        <>
          <label className="relative block h-[38px] w-[150px] shrink-0 sm:w-[190px]">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A6ACBA]">
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="h-full w-full rounded-[12px] bg-white pl-9 pr-3 text-[12px] font-medium text-[#16171C] placeholder-[#A6ACBA] outline-none ring-[#5741E9]/25 focus:ring-4"
              style={{ boxShadow: "0 1px 2px rgba(22,23,28,.04)" }}
            />
          </label>
          <span className="hidden text-[11.5px] font-bold text-[#2F6BF2] sm:block">Today, Mon 22 Nov</span>
        </>
      ) : (
        <h1 className="text-[24px] font-bold tracking-tight text-[#16171C] sm:text-[27px]">Order list</h1>
      )}
      <div className="ml-auto flex items-center gap-2.5">
        <button type="button" aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#17181D] shadow-[0_2px_10px_-2px_rgba(22,23,28,.14)] hover:scale-105">
          <GearIcon size={17} />
        </button>
        <button type="button" aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#17181D] shadow-[0_2px_10px_-2px_rgba(22,23,28,.14)] hover:scale-105">
          <BellIcon size={17} />
        </button>
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Barbara's account"
          className="h-10 w-10 rounded-full bg-[#DCE4F2] object-cover shadow-[0_2px_10px_-2px_rgba(22,23,28,.2)]"
        />
      </div>
    </div>
  );
}

export function AdminShell({ children, search = true }: { children: ReactNode; search?: boolean }) {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center overflow-x-clip px-3 py-6 sm:px-6 sm:py-10 lg:px-12"
      style={{
        background: [
          "radial-gradient(46% 52% at 88% 4%, #3B79F6 0%, #2E6BF2 52%, rgba(46,107,242,0) 100%)",
          "radial-gradient(52% 58% at 60% 96%, #2E6BF2 0%, #2E6BF2 46%, rgba(46,107,242,0) 100%)",
          "radial-gradient(40% 46% at 4% 46%, #EDF2FC 0%, rgba(237,242,252,0) 100%)",
          "linear-gradient(150deg, #F5F8FE 0%, #E9EFFB 45%, #C4D6F8 100%)",
        ].join(","),
      }}
    >
      <div
        className="flex w-full max-w-[1180px] overflow-hidden rounded-[28px] bg-[#F3F5FA] md:min-h-[720px]"
        style={{ boxShadow: "0 60px 120px -40px rgba(13,42,120,.45), 0 24px 60px -30px rgba(13,42,120,.3)" }}
      >
        <Sidebar />
        <div className="min-w-0 flex-1 pb-24 md:pb-8">
          <Topbar search={search} />
          <div className="px-6 pb-8 pt-7 sm:px-8">{children}</div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
