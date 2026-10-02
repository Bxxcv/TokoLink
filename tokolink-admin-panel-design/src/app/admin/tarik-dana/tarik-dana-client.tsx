"use client";

import { Banknote, CheckCircle2, Landmark, XCircle } from "lucide-react";
import { useState } from "react";
import { resolveWithdrawal } from "@/actions/admin";
import {
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  StatusBadge,
  TextArea,
  useAdminAction,
} from "@/components/ui";
import { avatarStyle, dateTimeFull, idr, timeAgo } from "@/lib/format";

interface WdRow {
  id: string;
  storeName: string;
  amount: number;
  bank: string;
  accountNo: string;
  status: string;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedNote: string | null;
}

interface Target {
  id: string;
  storeName: string;
  amount: number;
  bank: string;
  accountNo: string;
  decision: "processed" | "rejected";
}

export default function TarikDanaClient({ data }: { data: WdRow[] }) {
  const { run, pending } = useAdminAction();
  const [target, setTarget] = useState<Target | null>(null);
  const [note, setNote] = useState("");

  const pendingRows = data.filter((r) => r.status === "pending");
  const history = data.filter((r) => r.status !== "pending");
  const totalPending = pendingRows.reduce((a, r) => a + r.amount, 0);
  const totalProcessed = history.filter((r) => r.status === "processed").reduce((a, r) => a + r.amount, 0);

  const confirm = () => {
    if (!target) return;
    const t = target;
    const n = note;
    run(t.id, () => resolveWithdrawal(t.id, t.decision, n));
    setTarget(null);
    setNote("");
  };

  return (
    <div>
      <PageHeader
        title="Tarik Dana"
        desc="Proses penarikan saldo dompet seller. Verifikasi nama pemilik rekening sebelum mengirim dana."
        right={
          <div className="rounded-xl border border-line bg-white px-4 py-2.5 text-right">
            <p className="text-[10.5px] font-extrabold tracking-wider text-mute uppercase">Menunggu</p>
            <p className="tnum font-display text-lg font-bold">
              {idr(totalPending)} <span className="text-[11px] font-bold text-mute">· {pendingRows.length} toko</span>
            </p>
          </div>
        }
      />

      {/* Antrean */}
      <Card pad={false} className="anim-rise overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="font-display text-[15px] font-bold">Antrean penarikan</h3>
            <p className="mt-0.5 text-xs text-mute">Estimasi pencairan ke rekening 1×24 jam setelah diproses</p>
          </div>
          <span className="tnum rounded-full bg-ok-50 px-2.5 py-1 text-[11px] font-bold text-ok-700">
            {pendingRows.length} menunggu
          </span>
        </div>
        {pendingRows.length === 0 ? (
          <EmptyState icon={<Banknote className="size-5" />} title="Tidak ada penarikan menunggu" desc="Dompet semua seller sudah tersalurkan." />
        ) : (
          <div className="divide-y divide-line/70">
            {pendingRows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-canvas/50">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[12px] font-extrabold" style={avatarStyle(r.storeName)}>
                  {r.storeName.split(" ").slice(0, 2).map((x) => x[0]).join("")}
                </span>
                <div className="min-w-0 flex-1 basis-52">
                  <p className="text-[14px] font-bold">{r.storeName}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-mute">
                    <Landmark className="size-3.5" />
                    {r.bank} · {r.accountNo}
                  </p>
                </div>
                <p className="tnum font-display text-[16px] font-bold">{idr(r.amount)}</p>
                <p className="text-[11.5px] font-semibold text-mute">diajukan {timeAgo(r.requestedAt)}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ok"
                    size="sm"
                    className="h-8.5"
                    loading={pending.has(r.id + "-p")}
                    onClick={() => {
                      setTarget({ id: r.id, storeName: r.storeName, amount: r.amount, bank: r.bank, accountNo: r.accountNo, decision: "processed" });
                      setNote("");
                    }}
                  >
                    <CheckCircle2 className="size-3.5" />
                    Proses
                  </Button>
                  <Button
                    variant="dangerGhost"
                    size="sm"
                    className="h-8.5"
                    loading={pending.has(r.id + "-r")}
                    onClick={() => {
                      setTarget({ id: r.id, storeName: r.storeName, amount: r.amount, bank: r.bank, accountNo: r.accountNo, decision: "rejected" });
                      setNote("");
                    }}
                  >
                    <XCircle className="size-3.5" />
                    Tolak
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Riwayat */}
      <Card pad={false} className="anim-rise mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="font-display text-[15px] font-bold">Riwayat penarikan</h3>
            <p className="mt-0.5 text-xs text-mute">
              Total tersalurkan: <b className="tnum text-ink">{idr(totalProcessed)}</b>
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-line text-[10.5px] font-extrabold tracking-wider text-mute uppercase">
                <th className="px-5 py-3">Toko</th>
                <th className="px-4 py-3">Rekening tujuan</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3">Diajukan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3">Catatan admin</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.id} className="border-b border-line/70 transition last:border-0 hover:bg-canvas/60">
                  <td className="px-5 py-3 text-[13px] font-bold">{r.storeName}</td>
                  <td className="px-4 py-3 text-[12.5px] font-semibold text-mute">
                    {r.bank} · <span className="tnum">{r.accountNo}</span>
                  </td>
                  <td className="tnum px-4 py-3 text-right text-[13px] font-bold">{idr(r.amount)}</td>
                  <td className="px-4 py-3 text-[12.5px] font-semibold text-mute">{timeAgo(r.requestedAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="max-w-72 px-5 py-3">
                    <p className="truncate text-[12.5px] font-semibold text-mute">{r.resolvedNote ?? "—"}</p>
                    {r.resolvedAt && <p className="text-[11px] font-semibold text-mute/70">{dateTimeFull(r.resolvedAt)}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title={target?.decision === "processed" ? "Konfirmasi pengiriman dana" : "Tolak penarikan?"}
        tone={target?.decision === "processed" ? "ok" : "bad"}
        footer={
          <>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Batal
            </Button>
            <Button
              variant={target?.decision === "processed" ? "ok" : "danger"}
              loading={target ? pending.has(target.id) : false}
              onClick={confirm}
            >
              {target?.decision === "processed" ? `Kirim ${idr(target?.amount ?? 0)}` : "Tolak penarikan"}
            </Button>
          </>
        }
      >
        <div className="space-y-2 rounded-xl bg-canvas p-3.5 text-[13px] font-semibold">
          <p>
            Toko <b>{target?.storeName}</b>
          </p>
          <p className="tnum">
            Rekening {target?.bank} · {target?.accountNo}
          </p>
          <p className="tnum font-display text-base font-bold text-ink">{idr(target?.amount ?? 0)}</p>
        </div>
        <p className="mt-3 text-[13px] leading-6 text-mute">
          {target?.decision === "processed"
            ? "Pastikan nama pemilik rekening cocok dengan identitas toko yang terverifikasi. Aksi tercatat di audit log."
            : "Dana akan dikembalikan ke dompet seller. Aksi tercatat di audit log."}
        </p>
        <div className="mt-3">
          <TextArea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan (opsional) — mis. “Rekening cocok, dana dikirim via m-banking”"
          />
        </div>
      </Modal>
    </div>
  );
}
