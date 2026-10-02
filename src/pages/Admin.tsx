import { useEffect, useState } from "react";
import { navigate } from "../lib/router";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_SETTINGS,
  loadAudit,
  loadSettings,
  logAudit,
  saveSettings,
  type AuditRow,
  type Settings,
} from "../lib/admin";
import {
  rupiah,
  rupiahShort,
  useApp,
} from "../lib/data";
import { AppShell } from "../components/layout";
import {
  Badge,
  Button,
  Card,
  CardHead,
  ConfirmDialog,
  EmptyState,
  Field,
  FieldRow,
  Icon,
  Input,
  Modal,
  PageHeader,
  Progress,
  Segmented,
  Select,
  Skeleton,
  TableWrap,
  Tabs,
  Td,
  Th,
  Toggle,
  cx,
} from "../components/ui";
import { BarRows, ChartFrame, Donut, LineChart } from "../components/charts";
import { StatCard } from "./DashboardA";

const D = DAY();

function DAY() {
  return Array.from({ length: 30 }, (_, i) => `${i + 1}`);
}

const statusTone = (s: string) =>
  s === "aktif" || s === "selesai" || s === "berhasil" || s === "disetujui" || s === "cocok"
    ? "green"
    : s === "menunggu" || s === "diproses" || s === "perlu cek" || s === "perlu_cek" || s === "belum verifikasi"
      ? "amber"
      : s === "ditolak" || s === "gagal" || s === "ditangguhkan"
        ? "red"
        : "blue";

const label = (s: string) =>
  ({
    aktif: "Aktif",
    selesai: "Selesai",
    berhasil: "Berhasil",
    disetujui: "Disetujui",
    cocok: "Cocok",
    menunggu: "Menunggu",
    diproses: "Diproses",
    "perlu cek": "Perlu dicek",
    perlu_cek: "Perlu dicek",
    "belum verifikasi": "Belum verifikasi",
    ditolak: "Ditolak",
    gagal: "Gagal",
    ditangguhkan: "Ditangguhkan",
  })[s] ?? s;

/* ============================== ADMIN OVERVIEW ============================ */
export function AdminHome() {
  const { toast } = useApp();
  const [stats, setStats] = useState({
    sellers: 0,
    sellersNew: 0,
    gmvMonth: 0,
    txToday: 0,
    successRate: 0,
    feeMonth: 0,
    premiumWait: 0,
    wdWait: 0,
    payFailed: 0,
    daily: [] as number[],
  });
  const [recentPays, setRecentPays] = useState<
    { id: string; channel: string; amount: number | string; fee: number | string; status: string; seller: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

      const [{ count: sellers }, { data: profs }, { data: orders }, { data: pays }, { data: prems }, { data: wds }, { data: recent }] =
        await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("created_at").gte("created_at", weekAgo),
          supabase.from("orders").select("total,status,created_at").gte("created_at", monthAgo),
          supabase.from("payments").select("status,fee,created_at").gte("created_at", monthAgo),
          supabase.from("premium_requests").select("id").eq("status", "menunggu"),
          supabase.from("withdrawals").select("id,amount,status").eq("status", "menunggu"),
          supabase
            .from("payments")
            .select("id,channel,amount,fee,status,seller_id,profiles(store_name)")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);
      const ord = (orders ?? []) as { total: number | string; status: string; created_at: string }[];
      const pay = (pays ?? []) as { status: string; fee: number | string; created_at: string }[];
      const gmvMonth = ord
        .filter((o) => o.created_at >= startMonth)
        .reduce((s, o) => s + Number(o.total), 0);
      const txToday = ord.filter((o) => o.created_at >= startDay).length;
      const ok = pay.filter((p) => p.status === "berhasil").length;
      const daily: number[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
        daily.push(
          Math.round(
            ord.filter((o) => o.created_at.slice(0, 10) === d).reduce((s, o) => s + Number(o.total), 0) / 1000000,
          ),
        );
      }
      setStats({
        sellers: sellers ?? 0,
        sellersNew: (profs ?? []).length,
        gmvMonth,
        txToday,
        successRate: pay.length ? Math.round((ok / pay.length) * 1000) / 10 : 0,
        feeMonth: pay
          .filter((p) => p.created_at >= startMonth)
          .reduce((s, p) => s + Number(p.fee), 0),
        premiumWait: (prems ?? []).length,
        wdWait: (wds ?? []).length,
        payFailed: pay.filter((p) => p.status === "gagal").length,
        daily,
      });
      setRecentPays(
        ((recent ?? []) as {
          id: string; channel: string; amount: number | string; fee: number | string;
          status: string; profiles: { store_name: string | null } | { store_name: string | null }[] | null;
        }[]).map((r) => ({
          id: r.id,
          channel: r.channel,
          amount: r.amount,
          fee: r.fee,
          status: r.status,
          seller: Array.isArray(r.profiles) ? (r.profiles[0]?.store_name ?? "Toko") : (r.profiles?.store_name ?? "Toko"),
        })),
      );
      setLoading(false);
    })();
  }, []);

  const pendingTotal = stats.premiumWait + stats.wdWait;
  const today = new Date().toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <AppShell group="admin">
      <PageHeader
        index="A01"
        kicker="Admin Master"
        title="Ringkasan platform"
        desc={`Kondisi TokoLink hari ini, ${today} WIB. Data diperbarui tiap 5 menit.`}
        actions={
          <Button variant="secondary" onClick={() => toast("Ekspor ringkasan platform diunduh.", "info")}>
            <Icon name="download" size={16} /> Ekspor
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-line bg-navy-900 p-4 text-white sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-brand-300">
            <Icon name="shield" size={18} />
          </span>
          <div>
            <div className="text-[14.5px] font-bold">
              {pendingTotal === 0 ? "Semua antrean beres" : `${pendingTotal} hal menunggu persetujuan Anda`}
            </div>
            <p className="text-[13.5px] text-white/65">
              {stats.premiumWait} permintaan Premium dan {stats.wdWait} penarikan menunggu.
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button
            size="sm"
            className="bg-brand-500! text-navy-900! hover:bg-brand-400!"
            onClick={() => navigate("/admin/premium")}
          >
            Tinjau Premium
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="border-white/25! bg-transparent! text-white! hover:bg-white/10 hover:text-white"
            onClick={() => navigate("/admin/withdrawals")}
          >
            Penarikan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="GMV bulan ini" value={rupiahShort(stats.gmvMonth)} hint={`dari ${stats.sellers} toko`} loading={loading} />
        <StatCard label="Transaksi hari ini" value={String(stats.txToday)} hint={`${stats.successRate}% berhasil`} loading={loading} />
        <StatCard label="Pendapatan platform" value={rupiah(stats.feeMonth)} hint="dari biaya layanan" loading={loading} />
        <StatCard label="Penjual baru (7 hari)" value={String(stats.sellersNew)} hint="total tombol di bawah" loading={loading} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ChartFrame
            title="Nilai transaksi platform (GMV)"
            hint="30 hari terakhir, dalam juta rupiah"
            legend={
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11.5px] text-muted">
                  <span className="h-2 w-2 rounded-[2px] bg-navy-800" /> GMV
                </span>
                <span className="flex items-center gap-1.5 text-[11.5px] text-muted">
                  <span className="h-2 w-2 rounded-[2px] bg-brand-500" /> Biaya platform
                </span>
              </span>
            }
          >
            {loading ? (
              <div className="flex h-[200px] items-end gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="skeleton flex-1 rounded-t-md" style={{ height: `${40 + i * 6}%` }} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <LineChart series={stats.daily} labels={D} height={150} color="#0B2E6E" format={rupiahShort} />
                <LineChart series={stats.daily.map((v) => Math.round(v * 0.02 * 10) / 10)} labels={D} height={100} color="#1B9AE0" format={rupiahShort} yTicks={3} />
              </div>
            )}
          </ChartFrame>
        </Card>

        <Card>
          <CardHead title="Perlu tindakan" sub="Antrean persetujuan Anda" icon="alert" />
            <ul className="space-y-3">
              {[
                ["Permintaan Premium", `${stats.premiumWait} menunggu`, "/admin/premium", stats.premiumWait > 0 ? "amber" : "green"],
                ["Penarikan dana", `${stats.wdWait} menunggu`, "/admin/withdrawals", stats.wdWait > 0 ? "amber" : "green"],
                ["Pembayaran gagal", `${stats.payFailed} transaksi`, "/admin/payments", stats.payFailed > 0 ? "red" : "green"],
              ].map(([t, d, to, tone]) => (
              <li key={t}>
                <button
                  onClick={() => navigate(to)}
                  className="flex w-full items-center gap-3 rounded-md border border-line px-3 py-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  <span
                      className={cx(
                        "h-2 w-2 shrink-0 rounded-full",
                        tone === "red" ? "bg-bad" : tone === "green" ? "bg-ok" : "bg-warn",
                      )}
                  />
                  <span className="flex-1 text-[13.5px] font-bold text-ink">{t}</span>
                  <span className="tnum text-[12.5px] text-muted">{d}</span>
                  <Icon name="right" size={14} className="text-faint" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-linesoft pt-4">
            <div className="micro mb-3 text-faint">Status sistem</div>
            <ul className="space-y-2.5 text-[13px]">
              {[
                ["Gateway QRIS", "normal"],
                ["Sinkronisasi bank", "normal"],
                ["Notifikasi WhatsApp", "terlambat 3 mnt"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between">
                  <span className="text-muted">{k}</span>
                  <Badge tone={v === "normal" ? "green" : "amber"} dot>
                    {v}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-4" pad={false}>
        <div className="px-4 pb-1 pt-4 sm:px-5">
          <CardHead
            title="Transaksi terakhir"
            sub="Seluruh kanal pembayaran"
            icon="receipt"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/payments")}>
                Semua transaksi
              </Button>
            }
          />
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Toko</Th>
              <Th>Kanal</Th>
              <Th className="text-right">Nilai</Th>
              <Th className="text-right">Biaya</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {recentPays.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-canvas/70">
                <Td className="tnum text-[13px] font-semibold">{p.id.slice(0, 8).toUpperCase()}</Td>
                <Td className="text-[13.5px]">{p.seller}</Td>
                <Td>
                  <Badge tone={p.channel === "QRIS" ? "blue" : "gray"}>{p.channel}</Badge>
                </Td>
                <Td className="tnum text-right font-semibold">{rupiah(Number(p.amount))}</Td>
                <Td className="tnum text-right text-muted">{rupiah(Number(p.fee))}</Td>
                <Td>
                  <Badge tone={statusTone(p.status)} dot>
                    {label(p.status)}
                  </Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>
    </AppShell>
  );
}

/* =============================== SELLERS ================================= */
export function AdminSellers() {
  const { toast } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Semua");
  type SellerRow = {
    id: string; store_name: string | null; owner_name: string | null;
    city: string | null; plan: string; status: string; created_at: string;
  };
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [agg, setAgg] = useState<Map<string, { sales: number; orders: number }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SellerRow | null>(null);
  const [suspend, setSuspend] = useState<SellerRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: profs } = await supabase
      .from("profiles")
      .select("id,store_name,owner_name,city,plan,status,created_at")
      .eq("role", "seller")
      .order("created_at", { ascending: false });
    const rows = ((profs ?? []) as SellerRow[]);
    setSellers(rows);
    const { data: orders } = await supabase.from("orders").select("seller_id,total");
    const map = new Map<string, { sales: number; orders: number }>();
    ((orders ?? []) as { seller_id: string; total: number | string }[]).forEach((o) => {
      const cur = map.get(o.seller_id) ?? { sales: 0, orders: 0 };
      cur.sales += Number(o.total);
      cur.orders += 1;
      map.set(o.seller_id, cur);
    });
    setAgg(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const applySellerStatus = async (row: SellerRow, next: string) => {
    const prev = row.status;
    setSellers((ls) => ls.map((x) => (x.id === row.id ? { ...x, status: next } : x)));
    setSuspend(null);
    const { error } = await supabase.from("profiles").update({ status: next }).eq("id", row.id);
    if (error) {
      setSellers((ls) => ls.map((x) => (x.id === row.id ? { ...x, status: prev } : x)));
      toast("Gagal mengubah status.", "bad");
      return;
    }
    toast(
      next === "ditangguhkan" ? `${row.store_name ?? "Toko"} ditangguhkan.` : `${row.store_name ?? "Toko"} diaktifkan kembali.`,
      next === "ditangguhkan" ? "warn" : "ok",
    );
    void logAudit(
      next === "ditangguhkan" ? `Menangguhkan toko ${row.store_name ?? "Tanpa nama"}` : `Mengaktifkan toko ${row.store_name ?? "Tanpa nama"}`,
      row.id,
    );
  };

  const rows = sellers.filter(
    (s) =>
      (status === "Semua" || label(s.status) === status) &&
      ((s.store_name ?? "").toLowerCase().includes(q.toLowerCase()) ||
        (s.owner_name ?? "").toLowerCase().includes(q.toLowerCase())),
  );
  const nm = (s: SellerRow) => s.store_name || "Toko tanpa nama";

  return (
    <AppShell group="admin">
      <PageHeader
        index="A02"
        kicker="Operasi"
        title="Kelola penjual"
        desc={`${sellers.length} toko terdaftar. Verifikasi akun baru maksimal 1×24 jam pada hari kerja.`}
        actions={<Button variant="secondary" onClick={() => toast("Daftar penjual diekspor ke CSV.", "info")}>
          <Icon name="download" size={16} /> Ekspor daftar
        </Button>}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total penjual" value={String(sellers.length)} hint="terdaftar" loading={loading} />
        <StatCard label="Aktif" value={String(sellers.filter((s) => s.status === "aktif").length)} hint="bisa berjualan" loading={loading} />
        <StatCard label="Perlu verifikasi" value={String(sellers.filter((s) => s.status === "belum_verifikasi").length)} hint="lewat 1×24 jam" loading={loading} />
        <StatCard label="Ditangguhkan" value={String(sellers.filter((s) => s.status === "ditangguhkan").length)} hint="pelanggaran kebijakan" loading={loading} />
      </div>

      <Card pad={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:px-5">
          <div className="relative flex-1">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama toko atau pemilik…" className="h-10 pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-48 text-[13.5px]">
            {["Semua", "Aktif", "Belum verifikasi", "Ditangguhkan"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3 p-4 sm:p-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              icon="store"
              title="Penjual tidak ditemukan"
              desc={`Tidak ada penjual dengan kata kunci “${q}” pada status ${status}.`}
              action={
                <Button variant="secondary" onClick={() => { setQ(""); setStatus("Semua"); }}>
                  Reset pencarian
                </Button>
              }
            />
          </div>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Toko / pemilik</Th>
                <Th>Kota</Th>
                <Th>Paket</Th>
                <Th className="text-right">GMV</Th>
                <Th className="text-right">Pesanan</Th>
                <Th>Status</Th>
                <Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const a = agg.get(s.id) ?? { sales: 0, orders: 0 };
                return (
                <tr key={s.id} className="transition-colors hover:bg-canvas/70">
                  <Td>
                    <button onClick={() => setDetail(s)} className="text-left">
                      <div className="text-[14px] font-bold text-ink hover:text-brand-700">{nm(s)}</div>
                      <div className="text-[12.5px] text-faint">{s.owner_name || "—"}</div>
                    </button>
                  </Td>
                  <Td className="text-[13.5px]">{s.city || "—"}</Td>
                  <Td>
                    <Badge tone={s.plan === "premium" ? "blue" : "gray"}>{s.plan === "premium" ? "Premium" : "Gratis"}</Badge>
                  </Td>
                  <Td className="tnum text-right font-semibold">{rupiahShort(a.sales)}</Td>
                  <Td className="tnum text-right">{a.orders}</Td>
                  <Td>
                    <Badge tone={statusTone(s.status)} dot>
                      {label(s.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setDetail(s)}>
                        Detail
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setSuspend(s)}>
                        {s.status === "ditangguhkan" ? "Aktifkan" : "Tangguhkan"}
                      </Button>
                    </div>
                  </Td>
                </tr>
                );
              })}
            </tbody>
          </TableWrap>
        )}

        <div className="px-4 py-3.5 text-[13px] text-muted sm:px-5">
          Menampilkan <span className="tnum font-semibold text-ink">{rows.length}</span> dari {sellers.length} penjual
        </div>
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? nm(detail) : ""}
        eyebrow={`Detail penjual · ${detail?.id.slice(0, 8).toUpperCase() ?? ""}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDetail(null)}>
              Tutup
            </Button>
            <Button onClick={() => { setDetail(null); navigate("/admin/analytics"); }}>Lihat analitik toko</Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Pemilik", detail.owner_name || "—"],
                ["Kota", detail.city || "—"],
                ["Bergabung", new Date(detail.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })],
                ["Paket", detail.plan === "premium" ? "Premium" : "Gratis"],
                ["Total GMV", rupiah(agg.get(detail.id)?.sales ?? 0)],
                ["Jumlah pesanan", String(agg.get(detail.id)?.orders ?? 0)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md bg-canvas p-3">
                  <div className="micro text-faint">{k}</div>
                  <div className="mt-1 text-[14px] font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-line p-3.5">
              <div className="micro mb-2 text-faint">Status</div>
              <Badge tone={statusTone(detail.status)} dot>
                {label(detail.status)}
              </Badge>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!suspend}
        onClose={() => setSuspend(null)}
        title={suspend?.status === "ditangguhkan" ? `Aktifkan kembali ${suspend ? nm(suspend) : ""}?` : `Tangguhkan ${suspend ? nm(suspend) : ""}?`}
        body={
          suspend?.status === "ditangguhkan"
            ? "Toko akan kembali bisa menerima pesanan dan penarikan dana diaktifkan kembali."
            : "Toko akan berhenti menerima pesanan dan penarikan dana ditahan sampai tinjauan selesai. Pemilik menerima notifikasi."
        }
        confirmLabel={suspend?.status === "ditangguhkan" ? "Aktifkan" : "Tangguhkan toko"}
        tone={suspend?.status === "ditangguhkan" ? "primary" : "danger"}
        onConfirm={() => {
          if (!suspend) return;
          applySellerStatus(suspend, suspend.status === "ditangguhkan" ? "aktif" : "ditangguhkan");
        }}
      />
    </AppShell>
  );
}

/* ============================ PREMIUM REQUESTS =========================== */
export function AdminPremium() {
  const { toast } = useApp();
  type PRow = {
    id: string; plan: string; amount: number | string; proof_channel: string | null;
    status: string; created_at: string; seller_id: string;
    profiles: { store_name: string | null } | { store_name: string | null }[] | null;
  };
  const [list, setList] = useState<PRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");
  const [reject, setReject] = useState<PRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("premium_requests")
      .select("id,plan,amount,proof_channel,status,created_at,seller_id,profiles(store_name)")
      .order("created_at", { ascending: false });
    setList((data ?? []) as PRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const storeOf = (p: PRow) =>
    Array.isArray(p.profiles) ? (p.profiles[0]?.store_name ?? "Toko") : (p.profiles?.store_name ?? "Toko");

  const approve = async (row: PRow) => {
    const prev = row.status;
    setList((l) => l.map((x) => (x.id === row.id ? { ...x, status: "disetujui" } : x)));
    const { error: e1 } = await supabase
      .from("premium_requests")
      .update({ status: "disetujui", reviewed_at: new Date().toISOString() })
      .eq("id", row.id);
    let e2: unknown = null;
    if (!e1) {
      const r = await supabase.from("profiles").update({ plan: "premium" }).eq("id", row.seller_id);
      e2 = r.error;
    }
    if (e1 || e2) {
      setList((l) => l.map((x) => (x.id === row.id ? { ...x, status: prev } : x)));
      toast("Gagal menyetujui.", "bad");
      return;
    }
    toast("Permintaan Premium disetujui. Akses langsung aktif.");
    void logAudit(`Menyetujui Premium ${storeOf(row)}`, row.id, row.plan);
  };

  const doReject = async () => {
    if (!reject) return;
    const target = reject.id;
    setReject(null);
    setList((l) => l.map((x) => (x.id === target ? { ...x, status: "ditolak" } : x)));
    const { error } = await supabase
      .from("premium_requests")
      .update({ status: "ditolak", reviewed_at: new Date().toISOString() })
      .eq("id", target);
    if (error) {
      setList((l) => l.map((x) => (x.id === target ? { ...x, status: "menunggu" } : x)));
      toast("Gagal menolak.", "bad");
      return;
    }
    toast("Permintaan ditolak dan penjual diberi tahu.", "warn");
    void logAudit(`Menolak Premium ${storeOf(reject)}`, reject.id, reject.plan);
  };

  const filtered = list.filter((l) => (filter === "Semua" ? true : l.status === "menunggu"));
  const monthStart = new Date();
  monthStart.setDate(1);
  const thisMonth = list.filter((l) => new Date(l.created_at) >= monthStart);

  return (
    <AppShell group="admin">
      <PageHeader
        index="A03"
        kicker="Operasi"
        title="Permintaan Premium"
        desc="Penjual mengunggah bukti bayar manual. Tinjau dalam 1×24 jam supaya tidak ada toko tertahan."
        actions={<Segmented items={["Menunggu", "Semua"]} active={filter} onChange={setFilter} />}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Menunggu tinjauan" value={String(list.filter((l) => l.status === "menunggu").length)} hint="tinjau 1×24 jam" loading={loading} />
        <StatCard label="Disetujui bulan ini" value={String(thisMonth.filter((l) => l.status === "disetujui").length)} hint={rupiah(thisMonth.filter((l) => l.status === "disetujui").reduce((s, l) => s + Number(l.amount), 0))} loading={loading} />
        <StatCard label="Ditolak bulan ini" value={String(thisMonth.filter((l) => l.status === "ditolak").length)} hint="bukti bayar tidak jelas" loading={loading} />
      </div>

      <Card pad={false}>
        <div className="px-4 pb-1 pt-4 sm:px-5">
          <CardHead title="Antrean permintaan" sub="Urut terbaru" icon="star" />
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Toko</Th>
              <Th>Paket</Th>
              <Th className="text-right">Nilai</Th>
              <Th className="hidden md:table-cell">Bukti bayar</Th>
              <Th>Tanggal</Th>
              <Th>Status</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="p-4 sm:p-5">
                    <EmptyState icon="star" title="Tidak ada permintaan" desc="Pengajuan premium dari penjual akan muncul di sini." />
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-canvas/70">
                <Td className="tnum text-[13px] text-muted">{p.id.slice(0, 8).toUpperCase()}</Td>
                <Td className="text-[13.5px] font-semibold">{storeOf(p)}</Td>
                <Td className="text-[13.5px]">{p.plan}</Td>
                <Td className="tnum text-right font-bold">{rupiah(Number(p.amount))}</Td>
                <Td className="hidden md:table-cell">
                  <Badge tone={p.proof_channel === "QRIS" ? "blue" : "gray"}>{p.proof_channel ?? "—"}</Badge>
                </Td>
                <Td className="text-[13px] text-muted">
                  {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </Td>
                <Td>
                  <Badge tone={statusTone(p.status)} dot>
                    {label(p.status)}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" disabled={p.status !== "menunggu"} onClick={() => approve(p)}>
                      Setujui
                    </Button>
                    <Button size="sm" variant="ghost" disabled={p.status !== "menunggu"} onClick={() => setReject(p)}>
                      Tolak
                    </Button>
                  </div>
                </Td>
              </tr>
              ))
            )}
          </tbody>
        </TableWrap>
        <div className="px-4 py-3.5 text-[13px] text-muted sm:px-5">
          Persetujuan tercatat di log audit beserta nama admin yang menyetujui.
        </div>
      </Card>

      <ConfirmDialog
        open={!!reject}
        onClose={() => setReject(null)}
        title={`Tolak permintaan ${reject?.id.slice(0, 8).toUpperCase() ?? ""}?`}
        body="Penjual tetap bisa memakai paket Gratis. Alasan penolakan dikirim ke email pemilik toko dan bisa diunggah ulang."
        confirmLabel="Tolak permintaan"
        onConfirm={doReject}
      />
    </AppShell>
  );
}

/* =========================== WITHDRAWAL MANAGEMENT ======================= */
export function AdminWithdrawals() {
  const { toast } = useApp();
  type WRow = {
    id: string; bank: string; account_number: string; amount: number | string;
    fee: number | string; status: string; created_at: string; seller_id: string;
    profiles: { store_name: string | null } | { store_name: string | null }[] | null;
  };
  const [list, setList] = useState<WRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("semua");
  const [confirm, setConfirm] = useState<{ id: string; act: "proses" | "selesai" | "tolak" } | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("withdrawals")
      .select("id,bank,account_number,amount,fee,status,created_at,seller_id,profiles(store_name)")
      .order("created_at", { ascending: false });
    setList((data ?? []) as WRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const masked = (acct: string) => (acct.includes("•") ? acct : `•••• ${acct.slice(-4)}`);
  const storeOf = (w: WRow) =>
    Array.isArray(w.profiles) ? (w.profiles[0]?.store_name ?? "Toko") : (w.profiles?.store_name ?? "Toko");
  const filtered = list.filter((w) => (tab === "semua" ? true : w.status === tab));
  const sum = (st: string) => filtered.filter((w) => w.status === st).reduce((s, w) => s + Number(w.amount), 0);

  return (
    <AppShell group="admin">
      <PageHeader
        index="A04"
        kicker="Operasi"
        title="Penarikan dana"
        desc="Penarikan di atas Rp5.000.000 perlu persetujuan admin. Transfer dilakukan 09.00–16.00 WIB."
        actions={<Button variant="secondary" onClick={() => toast("Antrean transfer diunduh.", "info")}>
          <Icon name="download" size={16} /> Unduh antrean
        </Button>}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        <StatCard label="Menunggu" value={String(list.filter((l) => l.status === "menunggu").length)} hint={rupiah(sum("menunggu"))} loading={loading} />
        <StatCard label="Diproses" value={String(list.filter((l) => l.status === "diproses").length)} hint={rupiah(sum("diproses"))} loading={loading} />
        <StatCard label="Selesai" value={String(list.filter((l) => l.status === "selesai").length)} hint={rupiah(sum("selesai"))} loading={loading} />
        <StatCard label="Biaya transfer" value={rupiah(list.reduce((s, w) => s + Number(w.fee), 0))} hint="ditanggung platform" loading={loading} />
      </div>

      <Card pad={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:px-5">
          <Tabs
            className="flex-1 border-b-0"
            active={tab}
            onChange={setTab}
            items={[
              { id: "semua", label: "Semua", count: list.length },
              { id: "menunggu", label: "Menunggu", count: list.filter((l) => l.status === "menunggu").length },
              { id: "diproses", label: "Diproses", count: list.filter((l) => l.status === "diproses").length },
              { id: "selesai", label: "Selesai", count: list.filter((l) => l.status === "selesai").length },
            ]}
          />
          <Button variant="ghost" size="sm" onClick={load}>
            <Icon name="refresh" size={15} /> Muat ulang
          </Button>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Penjual</Th>
              <Th>Rekening</Th>
              <Th className="text-right">Diminta</Th>
              <Th className="text-right">Biaya</Th>
              <Th className="hidden md:table-cell">Tanggal</Th>
              <Th>Status</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((w) => (
              <tr key={w.id} className="transition-colors hover:bg-canvas/70">
                <Td className="tnum text-[13px] text-muted">{w.id.slice(0, 8).toUpperCase()}</Td>
                <Td className="text-[13.5px] font-semibold">{storeOf(w)}</Td>
                <Td className="text-[13.5px]">
                  {w.bank} <span className="tnum text-faint">{masked(w.account_number)}</span>
                </Td>
                <Td className="tnum text-right font-bold">{rupiah(Number(w.amount))}</Td>
                <Td className="tnum text-right text-muted">{rupiah(Number(w.fee))}</Td>
                <Td className="hidden text-[13px] text-muted md:table-cell">
                  {new Date(w.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </Td>
                <Td>
                  <Badge tone={statusTone(w.status)} dot>
                    {label(w.status)}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    {w.status === "diproses" ? (
                      <Button size="sm" onClick={() => setConfirm({ id: w.id, act: "selesai" })}>
                        Selesai
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={w.status !== "menunggu"}
                        onClick={() => setConfirm({ id: w.id, act: "proses" })}
                      >
                        Proses
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={w.status !== "menunggu"}
                      onClick={() => setConfirm({ id: w.id, act: "tolak" })}
                    >
                      Tolak
                    </Button>
                  </div>
                </Td>
              </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      </Card>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.act === "proses"
            ? `Proses penarikan ${confirm?.id.slice(0, 8).toUpperCase()}?`
            : confirm?.act === "selesai"
              ? `Selesaikan penarikan ${confirm?.id.slice(0, 8).toUpperCase()}?`
              : `Tolak penarikan ${confirm?.id.slice(0, 8).toUpperCase()}?`
        }
        body={
          confirm?.act === "proses"
            ? "Dana akan dikirim ke rekening penjual pada batch transfer berikutnya. Tindakan ini tercatat di log audit."
            : confirm?.act === "selesai"
              ? "Saldo penjual berkurang dan tercatat di ledger sebagai keluar."
              : "Dana dikembalikan ke saldo penjual dan alasan penolakan wajib diisi pada catatan internal."
        }
        confirmLabel={confirm?.act === "proses" ? "Proses transfer" : confirm?.act === "selesai" ? "Ya, selesai" : "Tolak penarikan"}
        tone={confirm?.act === "tolak" ? "danger" : "primary"}
        onConfirm={async () => {
          if (!confirm) return;
          const target = list.find((x) => x.id === confirm.id);
          if (!target) return;
          setConfirm(null);
          // Idempotent: baca ulang status, hanya proses dari state yang sah.
          const { data: fresh } = await supabase.from("withdrawals").select("status").eq("id", target.id).single();
          const cur = (fresh as { status: string } | null)?.status ?? target.status;
          const want =
            confirm.act === "proses" ? "diproses" : confirm.act === "selesai" ? "selesai" : "ditolak";
          const allowed =
            (confirm.act === "proses" && cur === "menunggu") ||
            (confirm.act === "selesai" && cur === "diproses") ||
            (confirm.act === "tolak" && cur === "menunggu");
          if (!allowed) {
            toast("Status sudah berubah. Muat ulang antrean.", "bad");
            load();
            return;
          }
          const { error } = await supabase.from("withdrawals").update({ status: want, processed_at: new Date().toISOString() }).eq("id", target.id);
          if (error) {
            toast("Gagal memperbarui status.", "bad");
            return;
          }
          if (want === "selesai") {
            await supabase.from("ledger").insert({
              seller_id: target.seller_id,
              label: `Penarikan ke ${target.bank}`,
              amount: -Math.abs(Number(target.amount)),
              type: "keluar",
            });
          }
          setList((l) => l.map((x) => (x.id === target.id ? { ...x, status: want } : x)));
          toast(
            want === "diproses" ? "Penarikan masuk antrean transfer." : want === "selesai" ? "Penarikan selesai, saldo berkurang." : "Penarikan ditolak.",
            want === "ditolak" ? "warn" : "ok",
          );
          void logAudit(
            want === "diproses" ? "Memproses penarikan" : want === "selesai" ? "Menyelesaikan penarikan" : "Menolak penarikan",
            target.id,
            `${target.bank} · ${rupiah(Number(target.amount))}`,
          );
        }}
      />
    </AppShell>
  );
}

/* =========================== PLATFORM ANALYTICS ========================== */
export function AdminAnalytics() {
  const [stats, setStats] = useState({
    gmv: 0, fee: 0, sellers: 0, premium: 0, gratis: 0,
    daily: [] as number[], weekly: [] as { label: string; value: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const { data: orders } = await supabase.from("orders").select("total,created_at");
      const { data: pays } = await supabase.from("payments").select("fee,created_at");
      const { data: profs } = await supabase.from("profiles").select("plan,created_at").eq("role", "seller");
      const ord = ((orders ?? []) as { total: number | string; created_at: string }[]);
      const gmv = ord.reduce((s, o) => s + Number(o.total), 0);
      const fee = ((pays ?? []) as { fee: number | string }[]).reduce((s, p) => s + Number(p.fee), 0);
      const sellers = (profs ?? []).length;
      const premium = (profs ?? []).filter((p) => (p as { plan: string }).plan === "premium").length;
      const daily: number[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
        daily.push(
          Math.round(ord.filter((o) => o.created_at.slice(0, 10) === d).reduce((s, o) => s + Number(o.total), 0) / 1000000),
        );
      }
      const weekly = [0, 1, 2, 3].map((w) => {
        const end = new Date(now.getTime() - w * 7 * 86400000);
        const start = new Date(now.getTime() - (w + 1) * 7 * 86400000);
        const label = w === 0 ? "Minggu ini" : w === 1 ? "Minggu lalu" : `${w} minggu lalu`;
        return {
          label,
          value: (profs ?? []).filter((p) => {
            const c = new Date((p as { created_at: string }).created_at);
            return c >= start && c < end;
          }).length,
        };
      });
      setStats({ gmv, fee, sellers, premium, gratis: sellers - premium, daily, weekly });
      setLoading(false);
    })();
  }, []);

  const avg = stats.sellers ? stats.gmv / stats.sellers : 0;
  return (
    <AppShell group="admin">
      <PageHeader
        index="A05"
        kicker="Analitik"
        title="Analitik platform"
        desc="Kesehatan bisnis TokoLink: pertumbuhan penjual, nilai transaksi, dan pendapatan layanan."
        actions={<Segmented items={["30 hari", "Kuartal", "Tahunan"]} active="30 hari" onChange={() => {}} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="GMV kumulatif" value={rupiahShort(stats.gmv)} hint="semua waktu" loading={loading} />
        <StatCard label="Pendapatan platform" value={rupiah(stats.fee)} hint="dari biaya layanan" loading={loading} />
        <StatCard label="Rata-rata GMV / toko" value={rupiahShort(Math.round(avg))} hint="total dibagi penjual" loading={loading} />
        <StatCard label="Total penjual" value={String(stats.sellers)} hint={`${stats.premium} premium`} loading={loading} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ChartFrame title="GMV & pendapatan platform" hint="30 hari terakhir">
            {loading ? (
              <div className="flex h-[200px] items-end gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="skeleton flex-1 rounded-t-md" style={{ height: `${50 + i * 5}%` }} />
                ))}
              </div>
            ) : (
              <LineChart series={stats.daily} labels={Array.from({ length: 30 }, (_, i) => `${i + 1}`)} height={210} color="#0B2E6E" format={rupiahShort} />
            )}
          </ChartFrame>
        </Card>

        <Card>
          <ChartFrame title="Distribusi paket" hint={`${stats.sellers} penjual terdaftar`}>
            <Donut
              centerValue={String(stats.sellers)}
              centerLabel="penjual"
              items={[
                { label: "Premium", value: stats.premium, color: "#0A69C4" },
                { label: "Gratis", value: stats.gratis, color: "#0B2E6E" },
              ]}
            />
          </ChartFrame>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <ChartFrame title="Kanal pembayaran" hint="Nilai transaksi bulan ini">
            <BarRows
              data={[
                { label: "QRIS", value: 942000000 },
                { label: "Transfer bank", value: 318000000 },
                { label: "Dompet digital", value: 146000000 },
                { label: "COD (uji coba)", value: 14000000 },
              ]}
              format={rupiahShort}
            />
          </ChartFrame>
        </Card>

        <Card>
          <ChartFrame title="Pertumbuhan penjual" hint="Penjual baru per minggu">
            <BarRows
              data={stats.weekly}
              format={(v) => `${v} toko`}
              color="#0B2E6E"
            />
          </ChartFrame>
        </Card>
      </div>
    </AppShell>
  );
}

/* =========================== PAYMENT MONITORING ========================== */
export function AdminPayments() {
  const { toast } = useApp();
  const [tab, setTab] = useState("semua");
  type PayRow = {
    id: string; order_id: string; channel: string; amount: number | string;
    fee: number | string; external_ref: string | null; status: string; created_at: string;
    seller_id: string; profiles: { store_name: string | null } | { store_name: string | null }[] | null;
  };
  const [rows, setRows] = useState<PayRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("payments")
        .select("id,order_id,channel,amount,fee,external_ref,status,created_at,seller_id,profiles(store_name)")
        .order("created_at", { ascending: false })
        .limit(200);
      setRows((data ?? []) as PayRow[]);
      setLoading(false);
    })();
  }, []);

  const storeOf = (p: PayRow) =>
    Array.isArray(p.profiles) ? (p.profiles[0]?.store_name ?? "Toko") : (p.profiles?.store_name ?? "Toko");
  const filtered = rows.filter((p) =>
    tab === "semua" ? true : tab === "gagal" ? p.status === "gagal" || p.status === "perlu_cek" : p.status === "berhasil",
  );

  return (
    <AppShell group="admin">
      <PageHeader
        index="A06"
        kicker="Operasi"
        title="Pemantauan pembayaran"
        desc="Semua transaksi masuk. Transaksi gagal perlu dicek paling lambat H+1."
        actions={<Button variant="secondary" onClick={() => toast("Rekonsiliasi dijalankan. Hasil dikirim via email.", "info")}>
          <Icon name="refresh" size={16} /> Jalankan rekonsiliasi
        </Button>}
      />

      <Tabs
        className="mb-4"
        active={tab}
        onChange={setTab}
        items={[
          { id: "semua", label: "Semua", count: rows.length },
          { id: "berhasil", label: "Berhasil", count: rows.filter((p) => p.status === "berhasil").length },
          { id: "masalah", label: "Gagal / perlu cek", count: rows.filter((p) => p.status === "gagal" || p.status === "perlu_cek").length },
        ]}
      />

      <Card pad={false}>
        {loading ? (
          <div className="space-y-3 p-4 sm:p-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState icon="checkCircle" title="Tidak ada masalah pembayaran" desc="Semua transaksi pada periode ini cocok dengan mutasi bank." />
          </div>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>ID transaksi</Th>
                <Th>Toko</Th>
                <Th>Kanal</Th>
                <Th className="hidden md:table-cell">Waktu</Th>
                <Th className="text-right">Nilai</Th>
                <Th className="text-right">Biaya</Th>
                <Th>Status</Th>
                <Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-canvas/70">
                  <Td>
                    <div className="tnum text-[13px] font-semibold">{p.external_ref ?? p.id.slice(0, 8).toUpperCase()}</div>
                    <div className="tnum text-[12px] text-faint">{p.order_id}</div>
                  </Td>
                  <Td className="text-[13.5px]">{storeOf(p)}</Td>
                  <Td>
                    <Badge tone={p.channel === "QRIS" ? "blue" : "gray"}>{p.channel}</Badge>
                  </Td>
                  <Td className="hidden text-[13px] text-muted md:table-cell">
                    {new Date(p.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </Td>
                  <Td className="tnum text-right font-bold">{rupiah(Number(p.amount))}</Td>
                  <Td className="tnum text-right text-muted">{rupiah(Number(p.fee))}</Td>
                  <Td>
                    <Badge tone={statusTone(p.status)} dot>
                      {label(p.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant={p.status === "gagal" || p.status === "perlu_cek" ? "secondary" : "ghost"}
                        onClick={() => navigate(`/admin/withdrawals`)}
                      >
                        Periksa
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-[13px] text-muted sm:px-5">
          <span>Total nilai pada tab ini</span>
          <span className="tnum font-bold text-ink">
            {rupiah(filtered.reduce((s, r) => s + Number(r.amount), 0))}
          </span>
        </div>
      </Card>
    </AppShell>
  );
}

/* ============================== USER MANAGEMENT ========================== */
export function AdminUsers() {
  const { toast } = useApp();
  const [q, setQ] = useState("");
  type URow = {
    id: string; email: string; last_sign_in: string | null; role: string;
    store_name: string; owner_name: string; city: string; plan: string; status: string;
  };
  const [rows, setRows] = useState<URow[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspend, setSuspend] = useState<URow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch("/api/admin-users", { headers: { authorization: `Bearer ${token}` } });
      const out = (await res.json()) as { users?: URow[]; error?: string };
      if (!res.ok) {
        toast(out.error ?? "Gagal memuat pengguna.", "bad");
        setLoading(false);
        return;
      }
      setRows(out.users ?? []);
    } catch {
      toast("Tidak bisa menghubungi server.", "bad");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter(
    (u) => u.owner_name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()),
  );

  const setStatus = async (row: URow, next: string) => {
    const prev = row.status;
    setRows((ls) => ls.map((x) => (x.id === row.id ? { ...x, status: next } : x)));
    setSuspend(null);
    const { error } = await supabase.from("profiles").update({ status: next }).eq("id", row.id);
    if (error) {
      setRows((ls) => ls.map((x) => (x.id === row.id ? { ...x, status: prev } : x)));
      toast("Gagal mengubah status.", "bad");
      return;
    }
    toast("Status akun diperbarui.", next === "ditangguhkan" ? "warn" : "ok");
    void logAudit(next === "ditangguhkan" ? `Menangguhkan akun ${row.email}` : `Mengaktifkan akun ${row.email}`, row.id);
  };

  return (
    <AppShell group="admin">
      <PageHeader
        index="A07"
        kicker="Sistem"
        title="Pengguna & akun"
        desc="Akun penjual, staf, dan admin. Peran menentukan halaman mana yang bisa dibuka."
        actions={<Button onClick={() => toast("Formulir undangan staf dibuka.", "info")}>
          <Icon name="plus" size={16} /> Undang pengguna
        </Button>}
      />

      <Card pad={false}>
        <div className="border-b border-line p-4 sm:px-5">
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email…" className="h-10 pl-9" />
          </div>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Nama</Th>
              <Th>Email</Th>
              <Th>Peran</Th>
              <Th className="hidden md:table-cell">Terakhir aktif</Th>
              <Th>Status</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="p-4 sm:p-5">
                    <EmptyState icon="users" title="Tidak ada pengguna" desc="Coba kata kunci lain." />
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-canvas/70">
                <Td className="tnum text-[13px] text-muted">{u.id.slice(0, 8).toUpperCase()}</Td>
                <Td>
                  <div className="text-[13.5px] font-semibold">{u.owner_name}</div>
                  <div className="text-[12px] text-faint">{u.store_name}</div>
                </Td>
                <Td className="text-[13.5px] text-muted">{u.email}</Td>
                <Td>
                  <Badge tone={u.role === "admin" ? "navy" : "blue"}>{u.role === "admin" ? "Admin" : "Penjual"}</Badge>
                </Td>
                <Td className="hidden text-[13px] text-muted md:table-cell">
                  {u.last_sign_in
                    ? new Date(u.last_sign_in).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                    : "Belum pernah"}
                </Td>
                <Td>
                  <Badge tone={statusTone(u.status)} dot>
                    {label(u.status)}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setStatus(u, u.status === "ditangguhkan" ? "aktif" : "ditangguhkan")
                      }
                    >
                      {u.status === "ditangguhkan" ? "Aktifkan" : "Tangguhkan"}
                    </Button>
                  </div>
                </Td>
              </tr>
              ))
            )}
          </tbody>
        </TableWrap>
        <div className="px-4 py-3.5 text-[13px] text-muted sm:px-5">
          {filtered.length} pengguna ditampilkan
        </div>
      </Card>

      <ConfirmDialog
        open={!!suspend}
        onClose={() => setSuspend(null)}
        title={`${suspend?.status === "ditangguhkan" ? "Aktifkan" : "Tangguhkan"} akun ${suspend?.email}?`}
        body={
          suspend?.status === "ditangguhkan"
            ? "Pengguna bisa masuk kembali dengan peran yang sama seperti sebelumnya."
            : "Pengguna langsung keluar dari seluruh sesi dan tidak bisa masuk sampai diaktifkan kembali."
        }
        confirmLabel="Konfirmasi"
        tone={suspend?.status === "ditangguhkan" ? "primary" : "danger"}
        onConfirm={() => {
          if (!suspend) return;
          setStatus(suspend, suspend.status === "ditangguhkan" ? "aktif" : "ditangguhkan");
        }}
      />
    </AppShell>
  );
}

/* ============================ SYSTEM SETTINGS ============================ */
type Channel = { t: string; d: string; on: boolean };

const parseChannels = (raw: string): Channel[] => {
  try {
    const v = JSON.parse(raw) as Channel[];
    if (Array.isArray(v) && v.length) return v;
  } catch {
    /* nilai rusak → pakai default */
  }
  return JSON.parse(DEFAULT_SETTINGS.channels) as Channel[];
};

export function AdminSystem() {
  const { toast } = useApp();
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  const [channels, setChannels] = useState<Channel[]>(parseChannels(DEFAULT_SETTINGS.channels));
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [health, setHealth] = useState<{ label: string; pct: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [close, setClose] = useState(false);

  const maintenanceOn = !!s.maintenance_until && new Date(s.maintenance_until).getTime() > Date.now();

  const load = async () => {
    setLoading(true);
    const [cfg, log, month] = await Promise.all([
      loadSettings(),
      loadAudit(6),
      Promise.resolve(new Date(Date.now() - 30 * 86400000).toISOString()),
    ]);
    setS(cfg);
    setChannels(parseChannels(cfg.channels));
    setAudit(log);

    const [{ data: pays }, { data: orders }, { data: wds }] = await Promise.all([
      supabase.from("payments").select("status").gte("created_at", month),
      supabase.from("orders").select("status").gte("created_at", month),
      supabase.from("withdrawals").select("status"),
    ]);
    const pct = (ok: number, total: number) => (total > 0 ? Math.round((ok / total) * 1000) / 10 : 0);
    const payRows = (pays ?? []) as { status: string }[];
    const ordRows = (orders ?? []) as { status: string }[];
    const wdRows = (wds ?? []) as { status: string }[];
    setHealth([
      { label: "Pembayaran berhasil", pct: pct(payRows.filter((p) => p.status === "berhasil").length, payRows.filter((p) => p.status !== "menunggu").length) },
      { label: "Pesanan tuntas", pct: pct(ordRows.filter((o) => o.status === "selesai").length, ordRows.filter((o) => o.status !== "batal").length) },
      { label: "Penarikan selesai", pct: pct(wdRows.filter((w) => w.status === "selesai").length, wdRows.length) },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k: keyof Settings, v: string) => setS((prev) => ({ ...prev, [k]: v }));

  const simpan = async () => {
    setSaving(true);
    const ok = await saveSettings({
      fee_qris_pct: s.fee_qris_pct,
      min_withdraw: s.min_withdraw,
      auto_withdraw_limit: s.auto_withdraw_limit,
      bank_fee: s.bank_fee,
      promo_max_days: s.promo_max_days,
    });
    await logAudit("Mengubah pengaturan sistem", "platform_settings", `Fee QRIS ${s.fee_qris_pct}% · min tarik Rp${s.min_withdraw}`);
    setSaving(false);
    if (!ok) {
      toast("Gagal menyimpan. Cek apakah migrasi Fase 6 sudah dijalankan.", "bad");
      return;
    }
    toast("Pengaturan sistem disimpan dan masuk log audit.");
    setAudit(await loadAudit(6));
  };

  const toggleChannel = async (c: Channel, on: boolean) => {
    const next = channels.map((x) => (x.t === c.t ? { ...x, on } : x));
    setChannels(next);
    const ok = await saveSettings({ channels: JSON.stringify(next) });
    await logAudit(`${on ? "Mengaktifkan" : "Menonaktifkan"} kanal ${c.t}`, "platform_settings");
    if (!ok) {
      setChannels(channels);
      toast("Gagal memperbarui kanal pembayaran.", "bad");
      return;
    }
    toast("Kanal pembayaran diperbarui.", "info");
    setAudit(await loadAudit(6));
  };

  const setMaintenance = async (on: boolean) => {
    const value = on ? new Date(Date.now() + 10 * 60000).toISOString() : "";
    const prev = s.maintenance_until;
    setS((x) => ({ ...x, maintenance_until: value }));
    const ok = await saveSettings({ maintenance_until: value });
    await logAudit(on ? "Mengaktifkan mode pemeliharaan" : "Mengakhiri mode pemeliharaan", "platform_settings", on ? "10 menit" : undefined);
    if (!ok) {
      setS((x) => ({ ...x, maintenance_until: prev }));
      toast("Gagal mengubah mode pemeliharaan.", "bad");
      return;
    }
    toast(on ? "Mode pemeliharaan aktif selama 10 menit." : "Mode pemeliharaan diakhiri.", on ? "warn" : "ok");
    setAudit(await loadAudit(6));
  };

  const when = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <AppShell group="admin">
      <PageHeader
        index="A08"
        kicker="Sistem"
        title="Pengaturan sistem"
        desc="Parameter platform. Perubahan berlaku untuk transaksi baru setelah disimpan."
        actions={
          <Button onClick={simpan} disabled={saving || loading}>
            {saving ? "Menyimpan…" : "Simpan pengaturan"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card>
            <CardHead title="Biaya & limit" sub="Berlaku untuk seluruh penjual" icon="wallet" />
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <Skeleton className="h-11" />
                <Skeleton className="h-11" />
                <Skeleton className="h-11" />
              </div>
            ) : (
              <>
                <FieldRow cols={3}>
                  <Field label="Biaya layanan QRIS (%)" hint="Saat ini 0,7%">
                    <Input value={s.fee_qris_pct} onChange={(e) => set("fee_qris_pct", e.target.value)} className="tnum" />
                  </Field>
                  <Field label="Minimum penarikan (Rp)">
                    <Input value={s.min_withdraw} onChange={(e) => set("min_withdraw", e.target.value.replace(/\D/g, ""))} className="tnum" />
                  </Field>
                  <Field label="Batas penarikan otomatis (Rp)">
                    <Input value={s.auto_withdraw_limit} onChange={(e) => set("auto_withdraw_limit", e.target.value.replace(/\D/g, ""))} className="tnum" />
                  </Field>
                </FieldRow>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Biaya transfer bank">
                    <Select value={s.bank_fee} onChange={(e) => set("bank_fee", e.target.value)}>
                      <option>Rp6.500</option>
                      <option>Gratis</option>
                      <option>Rp10.000</option>
                    </Select>
                  </Field>
                  <Field label="Masa berlaku kode promo maksimal">
                    <Select value={s.promo_max_days} onChange={(e) => set("promo_max_days", e.target.value)}>
                      <option>30 hari</option>
                      <option>90 hari</option>
                      <option>Tanpa batas</option>
                    </Select>
                  </Field>
                </div>
              </>
            )}
          </Card>

          <Card>
            <CardHead title="Kanal pembayaran aktif" sub="Pilihan yang dilihat pembeli saat checkout" icon="qr" />
            <ul className="divide-y divide-linesoft">
              {channels.map((c) => (
                <li key={c.t} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <div className="text-[14.5px] font-bold text-ink">{c.t}</div>
                    <div className="text-[13px] text-muted">{c.d}</div>
                  </div>
                  <Toggle
                    checked={c.on}
                    onChange={(v) => toggleChannel(c, v)}
                    label={c.t}
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-[#F3DDba]">
            <CardHead title="Mode pemeliharaan" sub="Saat aktif, penjual tidak bisa masuk selama 10 menit" icon="alert" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Badge tone={maintenanceOn ? "red" : "green"} dot>
                  {maintenanceOn ? "Pemeliharaan aktif" : "Layanan normal"}
                </Badge>
                <span className="text-[13.5px] text-muted">Pembeli tetap bisa membuka toko.</span>
              </div>
              <Button variant="danger" onClick={() => setClose(true)}>
                {maintenanceOn ? "Akhiri mode pemeliharaan" : "Aktifkan mode pemeliharaan"}
              </Button>
            </div>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHead title="Log audit terakhir" icon="shield" />
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
              </div>
            ) : audit.length === 0 ? (
              <p className="text-[13px] text-muted">Belum ada aksi tercatat.</p>
            ) : (
              <ul className="space-y-3.5">
                {audit.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <div>
                      <div className="text-[13.5px] font-semibold text-ink">{a.action}</div>
                      <div className="text-[12.5px] text-faint">
                        {a.actor_name ?? "Admin"} · {when(a.created_at)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHead title="Status layanan" sub="30 hari terakhir" icon="info" />
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
              </div>
            ) : (
              <ul className="space-y-2.5 text-[13.5px]">
                {health.map((h) => (
                  <li key={h.label}>
                    <div className="mb-1 flex justify-between">
                      <span className="text-muted">{h.label}</span>
                      <span className="tnum font-semibold text-ok">{h.pct.toFixed(1).replace(".", ",")}%</span>
                    </div>
                    <Progress value={h.pct} tone="ok" />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={close}
        onClose={() => setClose(false)}
        title={maintenanceOn ? "Akhiri mode pemeliharaan?" : "Aktifkan mode pemeliharaan?"}
        body={
          maintenanceOn
            ? "Seluruh penjual bisa masuk kembali dan transaksi berjalan normal."
            : "Penjual tidak bisa masuk ke dasbor selama 10 menit. Halaman toko dan checkout tetap berjalan untuk pembeli."
        }
        confirmLabel={maintenanceOn ? "Akhiri" : "Aktifkan 10 menit"}
        tone={maintenanceOn ? "primary" : "danger"}
        onConfirm={() => {
          const next = !maintenanceOn;
          setClose(false);
          setMaintenance(next);
        }}
      />
    </AppShell>
  );
}
