"use client";

import { Ban, CheckCircle2, Crown, ExternalLink, Search, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { setStorePlan, setStoreStatus } from "@/actions/admin";
import {
  Button,
  Card,
  EmptyState,
  IconBtn,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  useAdminAction,
} from "@/components/ui";
import { avatarStyle, dateFull, idr, num, timeAgo } from "@/lib/format";

interface StoreRow {
  id: string;
  name: string;
  slug: string;
  owner: string;
  phone: string;
  city: string;
  plan: string;
  status: string;
  products: number;
  joinedAt: string;
  lastActiveAt: string;
  gmv30: number;
  orders30: number;
}

const TABS = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Aktif" },
  { key: "pending", label: "Menunggu" },
  { key: "suspended", label: "Ditangguhkan" },
] as const;

export default function TokoClient({ data, initialQuery }: { data: StoreRow[]; initialQuery?: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [q, setQ] = useState(initialQuery ?? "");
  const [sort, setSort] = useState<"gmv" | "new" | "name">("gmv");
  const [confirmSuspend, setConfirmSuspend] = useState<StoreRow | null>(null);
  const { run, pending } = useAdminAction();

  const counts = useMemo(
    () => ({
      all: data.length,
      active: data.filter((s) => s.status === "active").length,
      pending: data.filter((s) => s.status === "pending").length,
      suspended: data.filter((s) => s.status === "suspended").length,
    }),
    [data],
  );

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    let out = data.filter(
      (st) =>
        (tab === "all" || st.status === tab) &&
        (s === "" || (st.name + st.slug + st.owner + st.city).toLowerCase().includes(s)),
    );
    out = [...out].sort((a, b) =>
      sort === "gmv"
        ? b.gmv30 - a.gmv30
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
    );
    return out;
  }, [data, tab, q, sort]);

  return (
    <div>
      <PageHeader
        title="Toko"
        desc={`${counts.all} toko terdaftar di platform — kelola status, paket, dan akses storefront.`}
        right={
          <div className="relative w-56">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mute" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama, slug, pemilik…"
              className="h-10 w-full rounded-xl border border-line bg-white pr-3 pl-9 text-sm outline-none transition placeholder:text-mute/70 focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
            />
          </div>
        }
      />

      {/* Tabs + sort */}
      <div className="anim-rise mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
                tab === t.key ? "bg-ink text-white" : "text-mute hover:text-ink"
              }`}
            >
              {t.label} <span className={`tnum ml-1 ${tab === t.key ? "text-white/60" : "text-mute/70"}`}>{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11.5px] font-bold text-mute">Urutkan:</span>
          <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-9">
            <option value="gmv">Omzet tertinggi</option>
            <option value="new">Terbaru bergabung</option>
            <option value="name">Nama A–Z</option>
          </Select>
        </div>
      </div>

      <Card pad={false} className="anim-rise overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={<Store className="size-5" />}
            title="Tidak ada toko yang cocok"
            desc="Coba ubah kata kunci atau filter status."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-line text-[10.5px] font-extrabold tracking-wider text-mute uppercase">
                  <th className="px-5 py-3">Toko</th>
                  <th className="px-4 py-3">Pemilik</th>
                  <th className="px-4 py-3">Kota</th>
                  <th className="px-4 py-3">Paket</th>
                  <th className="px-4 py-3 text-right">Produk</th>
                  <th className="px-4 py-3 text-right">Omzet 30 h</th>
                  <th className="px-4 py-3">Bergabung</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="group border-b border-line/70 transition last:border-0 hover:bg-canvas/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9.5 shrink-0 items-center justify-center rounded-lg text-[12px] font-extrabold" style={avatarStyle(s.name)}>
                          {s.name.split(" ").slice(0, 2).map((x) => x[0]).join("")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-bold">{s.name}</p>
                          <p className="truncate text-[11.5px] font-semibold text-mute">/{s.slug}.tokolink.store</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] font-semibold">{s.owner}</p>
                      <p className="tnum text-[11.5px] font-semibold text-mute">{s.phone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-semibold text-mute">{s.city}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={s.plan} />
                    </td>
                    <td className="tnum px-4 py-3.5 text-right text-[13px] font-bold">{num(s.products)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="tnum text-[13px] font-bold">{idr(s.gmv30)}</p>
                      <p className="tnum text-[11px] font-semibold text-mute">{num(s.orders30)} pesanan</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[12.5px] font-semibold">{dateFull(s.joinedAt)}</p>
                      <p className="text-[11px] font-semibold text-mute">aktif {timeAgo(s.lastActiveAt)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-0.5 opacity-60 transition group-hover:opacity-100">
                        <a
                          href={`https://www.tokolink.store/${s.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Lihat storefront"
                          className="inline-flex size-8 items-center justify-center rounded-lg text-mute transition hover:bg-white hover:text-ink hover:shadow-sm"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                        {s.plan === "free" ? (
                          <IconBtn
                            tone="brand"
                            label="Upgrade ke Premium"
                            disabled={pending.has(s.id + "-plan")}
                            onClick={() => run(s.id + "-plan", () => setStorePlan(s.id, "premium"))}
                          >
                            {pending.has(s.id + "-plan") ? (
                              <span className="size-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
                            ) : (
                              <Crown className="size-4" />
                            )}
                          </IconBtn>
                        ) : (
                          <IconBtn
                            tone="neutral"
                            label="Turunkan ke paket Gratis"
                            disabled={pending.has(s.id + "-plan")}
                            onClick={() => run(s.id + "-plan", () => setStorePlan(s.id, "free"))}
                          >
                            <Crown className="size-4 opacity-50" />
                          </IconBtn>
                        )}
                        {s.status === "suspended" ? (
                          <IconBtn
                            tone="ok"
                            label="Aktifkan kembali"
                            disabled={pending.has(s.id + "-st")}
                            onClick={() => run(s.id + "-st", () => setStoreStatus(s.id, "active"))}
                          >
                            {pending.has(s.id + "-st") ? (
                              <span className="size-4 animate-spin rounded-full border-2 border-ok-100 border-t-ok-600" />
                            ) : (
                              <CheckCircle2 className="size-4" />
                            )}
                          </IconBtn>
                        ) : (
                          <IconBtn tone="bad" label="Tangguhkan toko" onClick={() => setConfirmSuspend(s)}>
                            <Ban className="size-4" />
                          </IconBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="mt-3 text-[11.5px] font-semibold text-mute">
        Menampilkan {rows.length} dari {counts.all} toko · data omzet dihitung dari transaksi 30 hari terakhir.
      </p>

      {/* Modal tangguhkan */}
      <Modal
        open={confirmSuspend !== null}
        onClose={() => setConfirmSuspend(null)}
        title="Tangguhkan toko ini?"
        tone="bad"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmSuspend(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              loading={confirmSuspend ? pending.has(confirmSuspend.id + "-st") : false}
              onClick={() => {
                if (!confirmSuspend) return;
                const st = confirmSuspend;
                run(st.id + "-st", () => setStoreStatus(st.id, "suspended"));
                setConfirmSuspend(null);
              }}
            >
              Ya, tangguhkan
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-mute">
          Toko <b className="text-ink">{confirmSuspend?.name}</b> akan disembunyikan dari pencarian dan
          checkout-nya dinonaktifkan. Data produk, pesanan, dan saldo tetap aman — toko bisa
          diaktifkan kembali kapan saja.
        </p>
      </Modal>
    </div>
  );
}
