"use client";

import { CheckCircle2, Crown, Paperclip, XCircle } from "lucide-react";
import { useState } from "react";
import { resolvePremium } from "@/actions/admin";
import {
  Button,
  Card,
  CardHead,
  EmptyState,
  Modal,
  PageHeader,
  StatusBadge,
  TextArea,
  useAdminAction,
  useToast,
} from "@/components/ui";
import { avatarStyle, idr, timeAgo, dateTimeFull } from "@/lib/format";

interface ReqRow {
  id: string;
  storeName: string;
  period: string;
  price: number;
  proof: string | null;
  note: string | null;
  status: string;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedNote: string | null;
}

interface ResolveTarget {
  id: string;
  storeName: string;
  decision: "approved" | "rejected";
  price: number;
}

export default function PremiumClient({ data }: { data: ReqRow[] }) {
  const { run, pending } = useAdminAction();
  const { push } = useToast();
  const [target, setTarget] = useState<ResolveTarget | null>(null);
  const [note, setNote] = useState("");

  const pendingRows = data.filter((r) => r.status === "pending");
  const history = data.filter((r) => r.status !== "pending");
  const totalPending = pendingRows.reduce((a, r) => a + r.price, 0);

  const confirm = () => {
    if (!target) return;
    const t = target;
    const n = note;
    run(t.id, () => resolvePremium(t.id, t.decision, n));
    setTarget(null);
    setNote("");
  };

  return (
    <div>
      <PageHeader
        title="Premium"
        desc="Setujui atau tolak upgrade paket Premium. Persetujuan otomatis mengaktifkan paket toko."
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
            <h3 className="font-display text-[15px] font-bold">Antrean persetujuan</h3>
            <p className="mt-0.5 text-xs text-mute">Periksa bukti pembayaran sebelum menyetujui</p>
          </div>
          <span className="tnum rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
            {pendingRows.length} menunggu
          </span>
        </div>
        {pendingRows.length === 0 ? (
          <EmptyState
            icon={<Crown className="size-5" />}
            title="Antrean kosong"
            desc="Semua permintaan premium sudah ditinjau. Kerja bagus!"
          />
        ) : (
          <div className="divide-y divide-line/70">
            {pendingRows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-canvas/50">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[12px] font-extrabold" style={avatarStyle(r.storeName)}>
                  {r.storeName.split(" ").slice(0, 2).map((x) => x[0]).join("")}
                </span>
                <div className="min-w-0 flex-1 basis-52">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-bold">{r.storeName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${r.period === "tahunan" ? "bg-brand-50 text-brand-700" : "bg-canvas text-mute"}`}>
                      {r.period === "tahunan" ? "Tahunan" : "Bulanan"}
                    </span>
                  </div>
                  {r.note ? (
                    <p className="mt-1 truncate text-[12px] font-semibold text-mute">“{r.note}”</p>
                  ) : (
                    <p className="mt-1 text-[12px] font-semibold text-mute">Diajukan {timeAgo(r.requestedAt)}</p>
                  )}
                </div>
                <p className="tnum font-display text-[15px] font-bold">{idr(r.price)}</p>
                {r.proof && (
                  <button
                    onClick={() => push({ variant: "info", title: "Bukti pembayaran", desc: `${r.proof} — di produksi, file bukti tersimpan di Supabase Storage.` })}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-mute transition hover:border-brand-300 hover:text-brand-600"
                  >
                    <Paperclip className="size-3.5" />
                    <span className="hidden max-w-40 truncate sm:block">{r.proof}</span>
                    <span className="sm:hidden">Bukti</span>
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ok"
                    size="sm"
                    className="h-8.5"
                    loading={pending.has(r.id + "-a")}
                    onClick={() => {
                      setTarget({ id: r.id, storeName: r.storeName, decision: "approved", price: r.price });
                      setNote("");
                    }}
                  >
                    <CheckCircle2 className="size-3.5" />
                    Setujui
                  </Button>
                  <Button
                    variant="dangerGhost"
                    size="sm"
                    className="h-8.5"
                    loading={pending.has(r.id + "-r")}
                    onClick={() => {
                      setTarget({ id: r.id, storeName: r.storeName, decision: "rejected", price: r.price });
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
        <div className="border-b border-line px-5 py-4">
          <CardHead title="Riwayat" sub="Semua keputusan tercatat otomatis di audit log" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-line text-[10.5px] font-extrabold tracking-wider text-mute uppercase">
                <th className="px-5 py-3">Toko</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3 text-right">Harga</th>
                <th className="px-4 py-3">Diajukan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3">Keputusan admin</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.id} className="border-b border-line/70 transition last:border-0 hover:bg-canvas/60">
                  <td className="px-5 py-3 text-[13px] font-bold">{r.storeName}</td>
                  <td className="px-4 py-3 text-[12.5px] font-semibold text-mute">{r.period === "tahunan" ? "Tahunan" : "Bulanan"}</td>
                  <td className="tnum px-4 py-3 text-right text-[13px] font-bold">{idr(r.price)}</td>
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

      {/* Modal keputusan */}
      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title={target?.decision === "approved" ? "Setujui upgrade premium?" : "Tolak permintaan?"}
        tone={target?.decision === "approved" ? "ok" : "bad"}
        footer={
          <>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Batal
            </Button>
            <Button variant={target?.decision === "approved" ? "ok" : "danger"} loading={target ? pending.has(target.id) : false} onClick={confirm}>
              {target?.decision === "approved" ? "Setujui & aktifkan" : "Tolak permintaan"}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-mute">
          {target?.decision === "approved" ? (
            <>
              Paket <b className="text-ink">{target?.storeName}</b> akan langsung berubah ke{" "}
              <b className="text-ink">Premium</b> setelah disetujui ({idr(target?.price ?? 0)}).
            </>
          ) : (
            <>
              Permintaan <b className="text-ink">{target?.storeName}</b> akan ditandai ditolak dan penjual
              akan diberi tahu.
            </>
          )}{" "}
          Aksi ini tercatat di audit log.
        </p>
        <div className="mt-4">
          <TextArea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan (opsional) — mis. “Bukti QRIS terverifikasi jam 14.20”"
          />
        </div>
      </Modal>
    </div>
  );
}
