"use client";

import { Megaphone, Send, Store } from "lucide-react";
import { useState } from "react";
import { createBroadcast, sendDraftBroadcast } from "@/actions/admin";
import {
  Badge,
  Button,
  Card,
  CardHead,
  Field,
  Select,
  StatusBadge,
  TextArea,
  TextInput,
  useAdminAction,
} from "@/components/ui";
import { PageHeader } from "@/components/ui";
import { num, timeAgo } from "@/lib/format";

interface BcRow {
  id: string;
  title: string;
  message: string;
  segment: string;
  status: string;
  recipients: number;
  sentAt: string | null;
  createdBy: string;
}

interface Data {
  rows: BcRow[];
  segmentCounts: { all: number; premium: number; free: number };
}

const SEG_LABEL: Record<string, string> = {
  all: "Semua toko",
  premium: "Toko Premium",
  free: "Toko Gratis",
};

export default function PengumumanClient({ data }: { data: Data }) {
  const { run, pending } = useAdminAction();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [segment, setSegment] = useState<"all" | "premium" | "free">("all");

  const recipients =
    segment === "all"
      ? data.segmentCounts.all
      : segment === "premium"
        ? data.segmentCounts.premium
        : data.segmentCounts.free;

  const canSend = title.trim().length > 2 && message.trim().length > 10;

  const send = () => {
    if (!canSend) return;
    const t = title;
    const m = message;
    const s = segment;
    run("compose", () => createBroadcast({ title: t, message: m, segment: s }));
    setTitle("");
    setMessage("");
  };

  return (
    <div>
      <PageHeader
        title="Pengumuman"
        desc="Kirim broadcast ke dashboard & email seller — untuk maintenance, promo, atau info penting."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Composer */}
        <Card className="anim-rise h-fit xl:col-span-5">
          <CardHead title="Tulis pengumuman" sub="Muncul di bel notifikasi & email seller" />
          <div className="space-y-4">
            <Field label="Judul">
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="mis. Jadwal pemeliharaan sistem"
                maxLength={80}
              />
            </Field>
            <Field label="Pesan">
              <TextArea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan detail pengumuman… Singkat, jelas, dan ramah."
                maxLength={400}
              />
              <span className="mt-1 block text-right text-[11px] font-bold text-mute">
                {message.length}/400
              </span>
            </Field>
            <Field label="Target">
              <Select value={segment} onChange={(e) => setSegment(e.target.value as typeof segment)}>
                <option value="all">Semua toko aktif ({num(data.segmentCounts.all)})</option>
                <option value="premium">Toko Premium ({num(data.segmentCounts.premium)})</option>
                <option value="free">Toko Gratis ({num(data.segmentCounts.free)})</option>
              </Select>
            </Field>

            {/* Pratinjau */}
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-mute">Pratinjau</p>
              <div className="rounded-xl border border-line bg-canvas p-3.5">
                <div className="flex items-center gap-2.5 rounded-lg bg-white p-3 shadow-sm">
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Megaphone className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-bold">
                      {title.trim() || "Judul pengumuman"}
                    </p>
                    <p className="line-clamp-2 text-[11.5px] leading-4 text-mute">
                      {message.trim() || "Isi pesan akan tampil di sini…"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-[11.5px] font-semibold text-mute">
                Akan terkirim ke <b className="tnum text-ink">{num(recipients)}</b> toko
              </p>
              <Button onClick={send} disabled={!canSend} loading={pending.has("compose")}>
                <Send className="size-4" />
                Kirim sekarang
              </Button>
            </div>
          </div>
        </Card>

        {/* Riwayat */}
        <div className="xl:col-span-7">
          <Card className="anim-rise" pad={false}>
            <div className="border-b border-line px-5 py-4">
              <CardHead title="Riwayat" sub={`${data.rows.length} pengumuman dibuat`} />
            </div>
            <div className="divide-y divide-line/70">
              {data.rows.map((b) => (
                <div key={b.id} className="flex flex-wrap items-start gap-3 px-5 py-4">
                  <span
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
                      b.status === "sent" ? "bg-ok-50 text-ok-600" : "bg-warn-50 text-warn-600"
                    }`}
                  >
                    <Megaphone className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 basis-60">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13.5px] font-bold">{b.title}</p>
                      <StatusBadge status={b.status} />
                      <Badge tone="neutral">{SEG_LABEL[b.segment] ?? b.segment}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-5 text-mute">{b.message}</p>
                    <p className="mt-1.5 text-[11px] font-semibold text-mute">
                      {b.status === "sent"
                        ? `Terkirim ke ${num(b.recipients)} toko · ${b.sentAt ? timeAgo(b.sentAt) : ""}`
                        : `Disiapkan oleh ${b.createdBy}`}
                    </p>
                  </div>
                  {b.status === "draft" && (
                    <Button
                      variant="subtle"
                      size="sm"
                      loading={pending.has("draft-" + b.id)}
                      onClick={() => run("draft-" + b.id, () => sendDraftBroadcast(b.id))}
                    >
                      <Send className="size-3.5" />
                      Kirim draf
                    </Button>
                  )}
                </div>
              ))}
              {data.rows.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-14 text-center">
                  <Store className="size-5 text-mute" />
                  <p className="text-sm font-semibold">Belum ada pengumuman</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
