"use client";

import { ChevronLeft, ChevronRight, Download, ReceiptText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Card, EmptyState, PageHeader, Select, StatusBadge, useToast } from "@/components/ui";
import { dateTimeFull, idr, num } from "@/lib/format";

interface PayRow {
  id: string;
  invoiceNo: string;
  storeName: string;
  item: string;
  amount: number;
  fee: number;
  method: string;
  status: string;
  createdAt: string;
}

const METHOD_BADGE: Record<string, { label: string; cls: string }> = {
  qris: { label: "QRIS", cls: "bg-brand-50 text-brand-700" },
  transfer: { label: "Transfer", cls: "bg-ok-50 text-ok-700" },
  ewallet: { label: "E-Wallet", cls: "bg-warn-50 text-warn-700" },
};

const STATUS_TABS = [
  { key: "all", label: "Semua" },
  { key: "paid", label: "Lunas" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Gagal" },
] as const;

const PAGE_SIZE = 10;

export default function TransaksiClient({ data, feePct }: { data: PayRow[]; feePct: number }) {
  const { push } = useToast();
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]["key"]>("all");
  const [method, setMethod] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const counts = useMemo(
    () => ({
      all: data.length,
      paid: data.filter((p) => p.status === "paid").length,
      pending: data.filter((p) => p.status === "pending").length,
      failed: data.filter((p) => p.status === "failed").length,
    }),
    [data],
  );
  const gmv30 = useMemo(() => {
    const now = Date.now();
    return data
      .filter((p) => p.status === "paid" && now - new Date(p.createdAt).getTime() < 30 * 86400000)
      .reduce((a, p) => a + p.amount, 0);
  }, [data]);
  const pendingAmount = useMemo(
    () => data.filter((p) => p.status === "pending").reduce((a, p) => a + p.amount, 0),
    [data],
  );

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter(
      (p) =>
        (tab === "all" || p.status === tab) &&
        (method === "all" || p.method === method) &&
        (s === "" || (p.invoiceNo + p.storeName + p.item).toLowerCase().includes(s)),
    );
  }, [data, tab, method, q]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportCsv = () => {
    const head = ["Invoice", "Toko", "Item", "Metode", "Status", "Total", "Fee", "Bersih", "Waktu"];
    const lines = rows.map((p) =>
      [
        p.invoiceNo,
        `"${p.storeName}"`,
        `"${p.item}"`,
        p.method,
        p.status,
        p.amount,
        p.fee,
        p.amount - p.fee,
        p.createdAt,
      ].join(","),
    );
    const blob = new Blob(["\uFEFF" + [head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaksi-tokolink-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    push({ variant: "success", title: "CSV diunduh", desc: `${rows.length} baris transaksi diekspor.` });
  };

  return (
    <div>
      <PageHeader
        title="Transaksi"
        desc="Pantau seluruh checkout platform — QRIS, transfer bank, dan e-wallet."
        right={
          <button
            onClick={exportCsv}
            className="inline-flex h-9.5 items-center gap-1.5 rounded-lg border border-line bg-white px-4 text-sm font-semibold transition hover:bg-canvas"
          >
            <Download className="size-4" />
            Ekspor CSV
          </button>
        }
      />

      {/* Ringkasan */}
      <div className="stagger mb-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card className="!p-4">
          <p className="text-[11.5px] font-bold text-mute">Omzet lunas · 30 hari</p>
          <p className="tnum mt-1.5 font-display text-[22px] font-bold">{idr(gmv30)}</p>
          <p className="tnum mt-1 text-[11px] font-semibold text-mute">fee platform {feePct.toLocaleString("id-ID")}% sudah dipotong</p>
        </Card>
        <Card className="!p-4">
          <p className="text-[11.5px] font-bold text-mute">Transaksi lunas</p>
          <p className="tnum mt-1.5 font-display text-[22px] font-bold text-ok-600">{num(counts.paid)}</p>
          <p className="mt-1 text-[11px] font-semibold text-mute">rata-rata {counts.paid > 0 ? idr(Math.round(gmv30 / Math.max(counts.paid, 1))) : "—"}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-[11.5px] font-bold text-mute">Pending</p>
          <p className="tnum mt-1.5 font-display text-[22px] font-bold text-warn-600">{num(counts.pending)}</p>
          <p className="tnum mt-1 text-[11px] font-semibold text-mute">{idr(pendingAmount)} belum dikonfirmasi</p>
        </Card>
        <Card className="!p-4">
          <p className="text-[11.5px] font-bold text-mute">Gagal / batal</p>
          <p className="tnum mt-1.5 font-display text-[22px] font-bold text-bad-600">{num(counts.failed)}</p>
          <p className="mt-1 text-[11px] font-semibold text-mute">periksa webhook BuatQris bila naik</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="anim-rise mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
                tab === t.key ? "bg-ink text-white" : "text-mute hover:text-ink"
              }`}
            >
              {t.label}
              <span className={`tnum ml-1 ${tab === t.key ? "text-white/60" : "text-mute/70"}`}>{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-52">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mute" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Invoice / toko / item…"
            className="h-9.5 w-full rounded-xl border border-line bg-white pr-3 pl-9 text-sm outline-none transition placeholder:text-mute/70 focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
          />
        </div>
        <Select
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            setPage(1);
          }}
          className="h-9.5"
        >
          <option value="all">Semua metode</option>
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer Bank</option>
          <option value="ewallet">E-Wallet</option>
        </Select>
      </div>

      <Card pad={false} className="anim-rise overflow-hidden">
        {pageRows.length === 0 ? (
          <EmptyState icon={<ReceiptText className="size-5" />} title="Tidak ada transaksi" desc="Ubah filter atau kata kunci pencarian." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-line text-[10.5px] font-extrabold tracking-wider text-mute uppercase">
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-4 py-3">Toko</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Fee</th>
                  <th className="px-4 py-3 text-right">Bersih</th>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p) => (
                  <tr key={p.id} className="border-b border-line/70 transition last:border-0 hover:bg-canvas/60">
                    <td className="tnum px-5 py-3 font-mono text-[12px] font-bold text-brand-700">{p.invoiceNo}</td>
                    <td className="px-4 py-3 text-[13px] font-bold">{p.storeName}</td>
                    <td className="max-w-52 truncate px-4 py-3 text-[12.5px] font-semibold text-mute">{p.item}</td>
                    <td className="px-4 py-3">
                      <Badge tone="neutral" className={METHOD_BADGE[p.method]?.cls ?? ""}>
                        {METHOD_BADGE[p.method]?.label ?? p.method}
                      </Badge>
                    </td>
                    <td className="tnum px-4 py-3 text-right text-[13px] font-bold">{idr(p.amount)}</td>
                    <td className="tnum px-4 py-3 text-right text-[12.5px] font-semibold text-mute">{idr(p.fee)}</td>
                    <td className="tnum px-4 py-3 text-right text-[13px] font-bold text-ok-700">{idr(p.amount - p.fee)}</td>
                    <td className="px-4 py-3 text-[12px] font-semibold whitespace-nowrap text-mute">{dateTimeFull(p.createdAt)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <p className="tnum text-[12px] font-semibold text-mute">
            {num(rows.length)} transaksi · halaman {safePage}/{pages}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-lg border border-line p-1.5 text-mute transition hover:bg-canvas disabled:opacity-40"
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={safePage >= pages}
              className="rounded-lg border border-line p-1.5 text-mute transition hover:bg-canvas disabled:opacity-40"
              aria-label="Berikutnya"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
