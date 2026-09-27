import { AppProvider } from "./lib/data";
import { AuthProvider, RequireAdmin, RequireAuth } from "./lib/auth";
import { useRoute, Link } from "./lib/router";
import { ToastHost, ButtonLink } from "./components/ui";

import Landing from "./pages/Landing";
import { Login, Register, Forgot } from "./pages/Auth";
import { SystemPage } from "./pages/System";
import { StoreHome, ProductDetail, Cart, Checkout, Qris, PaymentStatus, OrderSuccess, OrderTracking } from "./pages/Storefront";
import {
  DashboardHome,
  Analytics,
  Traffic,
  Products,
  ProductForm,
  Orders,
  OrderDetail,
} from "./pages/DashboardA";
import {
  Wallet,
  Withdraw,
  BioLinks,
  Theme,
  Discount,
  Hours,
  StoreQR,
  StoreSettings,
  AccountSettings,
  Notifications,
} from "./pages/DashboardB";
import {
  AdminHome,
  AdminSellers,
  AdminPremium,
  AdminWithdrawals,
  AdminAnalytics,
  AdminPayments,
  AdminUsers,
  AdminSystem,
} from "./pages/Admin";

function NotFound({ path }: { path: string }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy-900 px-6 text-center">
      <div className="blueprint absolute inset-0 opacity-70" />
      <div className="relative flex flex-col items-center">
        <span className="micro mb-6 flex items-center gap-2.5 text-brand-400">
          <span className="text-white">404</span>
          <span className="h-px w-6 bg-brand-400/60" />
          <span>Halaman tidak ditemukan</span>
        </span>
        <h1 className="max-w-xl text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[42px]">
          Tautan ini sudah tidak dipakai.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
          Alamat <span className="tnum text-brand-300">{path}</span> tidak ada di TokoLink. Cek lagi
          alamatnya, atau kembali ke beranda.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/" size="lg" className="bg-brand-500! text-navy-900! hover:bg-brand-400!">
            Kembali ke beranda
          </ButtonLink>
          <ButtonLink
            to="/s/demo-account"
            variant="secondary"
            size="lg"
            className="border-white/30! bg-transparent! text-white! hover:border-white/60 hover:bg-white/10 hover:text-white"
          >
            Lihat contoh toko
          </ButtonLink>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            ["/app", "Dasbor penjual"],
            ["/admin", "Admin Master"],
            ["/login", "Masuk"],
          ].map(([to, label]) => (
            <Link key={to} to={to} className="text-[13.5px] font-semibold text-white/55 hover:text-white">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteView({ path }: { path: string }) {
  const seg = path.split("/").filter(Boolean);

  /* ---- phase 1: public & auth ---- */
  if (path === "/") return <Landing />;
  if (path === "/login") return <Login />;
  if (path === "/register") return <Register />;
  if (path === "/forgot") return <Forgot />;
  if (path === "/system") return <SystemPage />;

  /* ---- phase 2: storefront ---- */
  if (seg[0] === "s" && seg[1]) {
    if (seg[2] === "p" && seg[3]) return <ProductDetail id={seg[3]} slug={seg[1]} />;
    return <StoreHome slug={seg[1]} />;
  }
  if (path === "/cart") return <Cart />;
  if (path === "/checkout") return <Checkout />;
  if (path === "/checkout/qris") return <Qris />;
  if (path === "/checkout/status") return <PaymentStatus />;
  if (path === "/checkout/success") return <OrderSuccess />;
  if (seg[0] === "order" && seg[1]) return <OrderTracking id={seg[1]} />;

  /* ---- phase 3: seller dashboard ---- */
  if (seg[0] === "app") {
    const rest = seg.slice(1).join("/");
    switch (rest) {
      case "":
        return <DashboardHome />;
      case "analytics":
        return <Analytics />;
      case "traffic":
        return <Traffic />;
      case "products":
        return <Products />;
      case "products/new":
        return <ProductForm />;
      case "orders":
        return <Orders />;
      case "wallet":
        return <Wallet />;
      case "withdraw":
        return <Withdraw />;
      case "bio":
        return <BioLinks />;
      case "theme":
        return <Theme />;
      case "discount":
        return <Discount />;
      case "hours":
        return <Hours />;
      case "qr":
        return <StoreQR />;
      case "settings":
        return <StoreSettings />;
      case "account":
        return <AccountSettings />;
      case "notifications":
        return <Notifications />;
      default: {
        if (rest.startsWith("products/") && rest.endsWith("/edit")) {
          const id = rest.split("/")[1];
          return <ProductForm id={id} />;
        }
        if (rest.startsWith("orders/")) return <OrderDetail id={rest.split("/")[1]} />;
        return <NotFound path={path} />;
      }
    }
  }

  /* ---- phase 4: admin master ---- */
  if (seg[0] === "admin") {
    const rest = seg.slice(1).join("/");
    switch (rest) {
      case "":
        return <AdminHome />;
      case "sellers":
        return <AdminSellers />;
      case "premium":
        return <AdminPremium />;
      case "withdrawals":
        return <AdminWithdrawals />;
      case "analytics":
        return <AdminAnalytics />;
      case "payments":
        return <AdminPayments />;
      case "users":
        return <AdminUsers />;
      case "system":
        return <AdminSystem />;
      default:
        return <NotFound path={path} />;
    }
  }

  return <NotFound path={path} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Shell />
        <ToastHost />
      </AppProvider>
    </AuthProvider>
  );
}

function Shell() {
  const path = useRoute();
  const seg = path.split("/").filter(Boolean);
  let view = <RouteView path={path} />;
  // Fase 1: /app/* wajib login, /admin/* wajib login + role admin.
  if (seg[0] === "app") view = <RequireAuth>{view}</RequireAuth>;
  else if (seg[0] === "admin") view = <RequireAdmin>{view}</RequireAdmin>;
  return view;
}
