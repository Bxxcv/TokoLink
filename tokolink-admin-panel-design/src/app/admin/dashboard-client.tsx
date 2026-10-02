"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Crown,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { BarChart, Donut, Spark } from "@/components/charts";
import { Badge, Card, CardHead } from "@/components/ui";
import { avatarStyle, idr, idrShort, num, pct, timeAgo } from "@/lib/format";

interface Win {
  gmv: number;
  orders: number;
  gmvDelta: number | null;
  ordersDelta: number | null;
  series: { label: string; value: number }[];
  methods: { key: string; label: string; value: number }[];
}
interface Data {
  windows: Record<"7" | "30" | "90", Win>;
  topStores: { name: string; slug: string; gmv: number; orders: number }[];
  recentAudit: { id: string; action: string; target: string; amount: number | null; createdAt: string }[];
  totals: {
    totalStores: number;
    activeStores: number;
    pendingStores: number;
    premiumStores: number;
    totalUsers: number;
    newUsers7: number;
  };
  pending: { premium: number; premiumAmount: number; withdrawals: number; withdrawalAmount: number; stores: number };
}

function Delta({ v }: { v: number | null }) {
  if (v === null)
    return <span className="rounded-full bg-canvas px-2 py-0.5 text-[10.5px] font-bold text-mute">baru</span>;
  const up = v >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
        up ? "bg-ok-50 text-ok-700" : "bg-bad-50 text-bad-700"
      }`}
    >
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {pct(v)}
    </span>
  );
}

const PERIODS = [
  { key: "7" as const, label: "7 hari" },
  { key: "30" as const, label: "30 hari" },
  { key: "90" as const, label: "90 hari" },
];

const DONUT_COLORS: Record<string, string> = {
  qris: "#5b4cf5",
  transfer: "#149a5b",
  ewallet: "#c8821a",
};

export default function DashboardClient({ data }: { data: Data }) {
  const [win, setWin] = useState<"7" | "30" | "90">("30");
  const w = data.windows[win];
  const totalMethod = w.methods.reduce((a, m) => a + m.value, 0);
  const maxTop = Math.max(...data.topStores.map((s) => s.gmv), 1);

  return (
    <div>
      {/* Header */}
      <div className="anim-rise mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-8 tracking-tight">
            Halo, Muhammad<span className="text-brand-500">.</span>
          </h1>
          <p className="mt-1 text-sm text-mute">
            Pantau kesehatan seluruh toko, transaksi, dan penarikan dana platform hari ini.
          </p>
        </div>
        <div className="flex rounded-xl border border-line bg-white p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setWin(p.key)}
              className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-bold transition ${
                win === p.key ? "bg-brand-600 text-white shadow-sm" : "text-mute hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-[0_14px_30px_-12px_rgba(91,76,245,0.55)]">
          <div className="flex items-start justify-between">
            <p className="text-[12.5px] font-bold text-white/75">Omzet platform (GMV)</p>
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/15">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
          <p className="tnum mt-3 font-display text-[30px] font-bold leading-8">{idrShort(w.gmv)}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[10.5px] font-bold">
              {w.gmvDelta !== null &&
                (w.gmvDelta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />)}
              {w.gmvDelta !== null ? pct(w.gmvDelta) : "—"}
            </span>
            <span className="text-[11px] font-semibold text-white/65">vs periode sebelumnya</span>
          </div>
          <div className="absolute right-4 bottom-4 opacity-90">
            <Spark values={w.series.slice(-14).map((s) => s.value)} w={110} h={34} stroke="rgba(255,255,255,0.85)" />
          </div>
        </div>

        <Card className="anim-rise">
          <p className="text-[12.5px] font-bold text-mute">Pesanan</p>
          <div className="mt-3 flex items-baseline gap-2.5">
            <p className="tnum font-display text-[30px] font-bold leading-8">{num(w.orders)}</p>
            <Delta v={w.ordersDelta} />
          </div>
          <p className="mt-2 text-[11.5px] font-semibold text-mute">Checkout QRIS & transfer yang lunas</p>
        </Card>

        <Card className="anim-rise">
          <p className="text-[12.5px] font-bold text-mute">Toko aktif</p>
          <div className="mt-3 flex items-baseline gap-2.5">
            <p className="tnum font-display text-[30px] font-bold leading-8">{num(data.totals.activeStores)}</p>
            <span className="text-[12px] font-bold text-mute">/ {num(data.totals.totalStores)} terdaftar</span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-mute">
            <Crown className="size-3.5 text-brand-500" />
            {num(data.totals.premiumStores)} berpaket Premium
            {data.totals.pendingStores > 0 && (
              <span className="ml-1 rounded-full bg-warn-50 px-1.5 py-px text-[10.5px] font-bold text-warn-700">
                +{data.totals.pendingStores} menunggu
              </span>
            )}
          </p>
        </Card>

        <Card className="anim-rise">
          <p className="text-[12.5px] font-bold text-mute">Pengguna terdaftar</p>
          <div className="mt-3 flex items-baseline gap-2.5">
            <p className="tnum font-display text-[30px] font-bold leading-8">{num(data.totals.totalUsers)}</p>
            <span className="rounded-full bg-ok-50 px-2 py-0.5 text-[10.5px] font-bold text-ok-700">
              +{data.totals.newUsers7} minggu ini
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-mute">
            <Users className="size-3.5" />
            Seller & pembeli yang punya akun
          </p>
        </Card>
      </div>

      {/* Chart row */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="anim-rise xl:col-span-8" pad>
          <CardHead
            title="Omzet harian"
            sub={`Transaksi lunas · ${PERIODS.find((p) => p.key === win)!.label} terakhir`}
            right={<Badge tone="brand">{idrShort(w.gmv)} total</Badge>}
          />
          <BarChart data={w.series} animateKey={win} />
        </Card>

        <Card className="anim-rise xl:col-span-4">
          <CardHead title="Metode pembayaran" sub="Komposisi nilai transaksi lunas" />
          <div className="flex items-center justify-center gap-5">
            <Donut
              slices={w.methods.map((m) => ({ label: m.label, value: m.value, color: DONUT_COLORS[m.key] ?? "#999" }))}
              centerTitle={idrShort(totalMethod)}
              centerSub="total lunas"
            />
            <div className="w-full max-w-[150px] space-y-3">
              {w.methods.map((m) => (
                <div key={m.key}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[12px] font-bold">
                      <span className="size-2.5 rounded-sm" style={{ background: DONUT_COLORS[m.key] }} />
                      {m.label}
                    </span>
                    <span className="tnum text-[11px] font-bold text-mute">
                      {totalMethod > 0 ? Math.round((m.value / totalMethod) * 100) : 0}%
                    </span>
                  </div>
                  <p className="tnum mt-0.5 pl-4 text-[11.5px] font-semibold text-mute">{idrShort(m.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Butuh tindakan */}
        <Card className="anim-rise" pad={false}>
          <div className="border-b border-line px-5 py-4">
            <h3 className="font-display text-[15px] font-bold">Butuh tindakan</h3>
            <p className="mt-0.5 text-xs text-mute">Antrean yang menunggu persetujuan Anda</p>
          </div>
          <div className="p-2">
            {[
              { href: "/admin/premium", icon: Crown, label: "Persetujuan premium", count: data.pending.premium, value: idrShort(data.pending.premiumAmount), tone: "text-brand-600 bg-brand-50" },
              { href: "/admin/tarik-dana", icon: Wallet, label: "Penarikan dana", count: data.pending.withdrawals, value: idrShort(data.pending.withdrawalAmount), tone: "text-ok-600 bg-ok-50" },
              { href: "/admin/toko", icon: Store, label: "Toko menunggu verifikasi", count: data.pending.stores, value: "perlu dicek", tone: "text-warn-600 bg-warn-50" },
            ].map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-canvas"
              >
                <span className={`flex size-9 items-center justify-center rounded-lg ${r.tone}`}>
                  <r.icon className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold">{r.label}</span>
                  <span className="tnum block text-[11.5px] font-semibold text-mute">{r.value}</span>
                </span>
                <span className="tnum rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">{r.count}</span>
                <ChevronRight className="size-4 text-mute transition group-hover:translate-x-0.5 group-hover:text-ink" />
              </Link>
            ))}
          </div>
        </Card>

        {/* Top toko */}
        <Card className="anim-rise" pad={false}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h3 className="font-display text-[15px] font-bold">Top toko · 30 hari</h3>
              <p className="mt-0.5 text-xs text-mute">Berdasarkan omzet yang lunas</p>
            </div>
            <Link href="/admin/toko" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Semua
            </Link>
          </div>
          <div className="space-y-1 p-3">
            {data.topStores.map((s, i) => (
              <div key={s.slug} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-canvas">
                <span className="tnum w-4 text-center font-display text-[12px] font-bold text-mute">{i + 1}</span>
                <span className="flex size-8.5 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold" style={avatarStyle(s.name)}>
                  {s.name.split(" ").slice(0, 2).map((x) => x[0]).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold">{s.name}</span>
                  <span className="tnum block text-[11px] font-semibold text-mute">{num(s.orders)} pesanan</span>
                </span>
                <span className="text-right">
                  <span className="tnum block text-[13px] font-bold">{idrShort(s.gmv)}</span>
                  <span className="mt-1 block h-1 w-16 overflow-hidden rounded-full bg-canvas">
                    <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(s.gmv / maxTop) * 100}%` }} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Aktivitas */}
        <Card className="anim-rise" pad={false}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h3 className="font-display text-[15px] font-bold">Aktivitas terbaru</h3>
              <p className="mt-0.5 text-xs text-mute">Tercatat otomatis di audit log</p>
            </div>
            <Link href="/admin/audit" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Semua
            </Link>
          </div>
          <div className="p-4">
            <ol className="relative space-y-4 before:absolute before:top-1 before:bottom-1 before:left-[5px] before:w-px before:bg-line">
              {data.recentAudit.map((a) => (
                <li key={a.id} className="relative flex gap-3.5 pl-0.5">
                  <span className={`relative z-10 mt-1 size-2.5 shrink-0 rounded-full border-2 border-white ${a.amount !== null ? "bg-brand-500" : "bg-line"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-5">
                      {a.action} <span className="font-normal text-mute">— {a.target}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-mute">
                      <Clock className="size-3" />
                      {timeAgo(a.createdAt)}
                      {a.amount !== null && <span className="tnum ml-auto text-ink">{idr(a.amount)}</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
