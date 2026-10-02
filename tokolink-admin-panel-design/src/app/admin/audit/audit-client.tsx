"use client";

import { Banknote, Download, ScrollText, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, EmptyState, PageHeader, useToast } from "@/components/ui";
import { dateTimeFull, idr, timeAgo } from "@/lib/format";

interface AuditRow {
  id: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
  amount: number | null;
  createdAt: string;
}

const TABS = [
  { key: "all", label: "Semua" },
  { key: "money", label: "Menyentuh Uang" },
  { key: "system", label: "Sistem & Platform" },
] as const;

export default function AuditClient({ data }: { data: AuditRow[] }) {
  const { push } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter(
      (a) =>
        (tab === "all" ||
          (tab === "money" ? a.amount !== null : a.amount === null)) &&
        (s === "" || (a.action + a.target + a.detail + a.actor).toLowerCase().includes(s)),
    );
  }, [data, tab, q]);

  const counts = useMemo(
    () => ({
      all: data.length,
      money: data.filter((a) => a.amount !== null).length,
      system: data.filter((a) => a.amount === null).length,
    }),
    [data],
  );

  const exportCsv = () => {
    const head = ["Waktu", "Admin", "Aksi", "Target", "Detail", "Jumlah (IDR)"];
    const lines = rows.map((a) =>
      [a.createdAt, a.actor, `"${a.action}"`, `"${a.target}"`, `"${a.detail}"`, a.amount ?? ""].join(","),
    );
    const blob = new Blob(["\uFEFF" + [head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `audit-log-tokolink-${new Date().toISOString().slice(0, 10)}.csv`;
    el.click();
    URL.revokeObjectURL(url);
    push({ variant: "success", title: "Audit log diekspor", desc: `${rows.length} entri diunduh sebagai CSV.` });
  };

  return (
    <div>
      <PageHeader
        title="Audit Log"
        desc="Jejak setiap aksi admin — siapa, apa, kapan. Aksi yang menyentuh uang ditandai khusus."
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
              {t.label}
              <span className={`tnum ml-1 ${tab === t.key ? "text-white/60" : "text-mute/70"}`}>{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-60">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari aksi / target / detail…"
            className="h-9.5 w-full rounded-xl border border-line bg-white pr-3 pl-9 text-sm outline-none transition placeholder:text-mute/70 focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
          />
        </div>
      </div>

      <Card pad={false} className="anim-rise overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<ScrollText className="size-5" />} title="Belum ada entri" desc="Setiap aksi admin akan tercatat di sini secara otomatis." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead>
                <tr className="border-b border-line text-[10.5px] font-extrabold tracking-wider text-mute uppercase">
                  <th className="px-5 py-3">Waktu</th>
                  <th className="px-4 py-3">Aksi</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Detail</th>
                  <th className="px-5 py-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-b border-line/70 align-top transition last:border-0 hover:bg-canvas/60">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-[12.5px] font-bold">{timeAgo(a.createdAt)}</p>
                      <p className="text-[11px] font-semibold text-mute">{dateTimeFull(a.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-bold ${
                          a.amount !== null ? "bg-brand-50 text-brand-700" : "bg-canvas text-mute"
                        }`}
                      >
                        {a.amount !== null ? <Banknote className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
                        {a.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-bold">{a.target}</td>
                    <td className="max-w-80 px-4 py-3.5 text-[12.5px] leading-5 font-semibold text-mute">{a.detail}</td>
                    <td className="tnum px-5 py-3.5 text-right text-[13px] font-bold">
                      {a.amount !== null ? idr(a.amount) : <span className="text-mute/60">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <p className="mt-3 text-[11.5px] font-semibold text-mute">
        Menampilkan {rows.length} entri terbaru · entri dengan nilai rupiah berarti menyentuh uang (premium, penarikan, fee).
      </p>
    </div>
  );
}
