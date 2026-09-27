import { useEffect, useState } from "react";
import { navigate } from "../lib/router";
import { supabase } from "../lib/supabase";
import {
  ADMIN_USERS,
  PAYMENTS,
  PREMIUM_REQUESTS,
  SALES_30,
  SELLERS,
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
import { BarRows, ChartFrame, Donut, LineChart, useFakeLoad } from "../components/charts";
import { StatCard } from "./DashboardA";

const D = DAY();

function DAY() {
  return Array.from({ length: 30 }, (_, i) => `${i + 1}`);
}

const statusTone = (s: string) =>
  s === "aktif" || s === "selesai" || s === "berhasil" || s === "disetujui" || s === "cocok"
    ? "green"
    : s === "menunggu" || s === "diproses" || s === "perlu cek" || s === "belum verifikasi"
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
    "belum verifikasi": "Belum verifikasi",
    ditolak: "Ditolak",
    gagal: "Gagal",
    ditangguhkan: "Ditangguhkan",
  })[s] ?? s;

/* ============================== ADMIN OVERVIEW ============================ */
export function AdminHome() {
  const { toast } = useApp();
  const loading = useFakeLoad([], 650);

  return (
    <AppShell group="admin">
      <PageHeader
        index="A01"
        kicker="Admin Master"
        title="Ringkasan platform"
        desc="Kondisi TokoLink hari ini, 12 Feb 2025 09:45 WIB. Data diperbarui tiap 5 menit."
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
            <div className="text-[14.5px] font-bold">3 hal menunggu persetujuan Anda</div>
            <p className="text-[13.5px] text-white/65">
              2 permintaan Premium dan 1 penarikan dana di atas Rp5.000.000.
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
        <StatCard label="GMV bulan ini" value="Rp1,42 M" delta={16} hint="dari 4.820 toko" spark={SALES_30.slice(-12)} loading={loading} />
        <StatCard label="Transaksi hari ini" value="2.148" delta={9} hint="97,4% berhasil" loading={loading} />
        <StatCard label="Pendapatan platform" value="Rp48.720.000" delta={12} hint="biaya layanan 0,7%" loading={loading} />
        <StatCard label="Penjual baru (7 hari)" value="184" delta={-4} hint="perlu verifikasi 12" loading={loading} />
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
                <LineChart series={SALES_30.map((v) => v * 36)} labels={D} height={150} color="#0B2E6E" format={rupiahShort} />
                <LineChart series={SALES_30.map((v) => v * 1.3)} labels={D} height={100} color="#1B9AE0" format={rupiahShort} yTicks={3} />
              </div>
            )}
          </ChartFrame>
        </Card>

        <Card>
          <CardHead title="Perlu tindakan" sub="Antrean persetujuan Anda" icon="alert" />
          <ul className="space-y-3">
            {[
              ["Permintaan Premium", "2 menunggu", "/admin/premium", "amber"],
              ["Penarikan dana", "1 di atas limit", "/admin/withdrawals", "amber"],
              ["Akun dilaporkan", "1 laporan baru", "/admin/users", "red"],
              ["Pembayaran gagal", "3 transaksi", "/admin/payments", "red"],
            ].map(([t, d, to, tone]) => (
              <li key={t}>
                <button
                  onClick={() => navigate(to)}
                  className="flex w-full items-center gap-3 rounded-md border border-line px-3 py-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  <span
                    className={cx(
                      "h-2 w-2 shrink-0 rounded-full",
                      tone === "red" ? "bg-bad" : "bg-warn",
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
            {PAYMENTS.slice(0, 5).map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-canvas/70">
                <Td className="tnum text-[13px] font-semibold">{p.id}</Td>
                <Td className="text-[13.5px]">{p.store}</Td>
                <Td>
                  <Badge tone={p.channel === "QRIS" ? "blue" : "gray"}>{p.channel}</Badge>
                </Td>
                <Td className="tnum text-right font-semibold">{rupiah(p.amount)}</Td>
                <Td className="tnum text-right text-muted">{rupiah(p.fee)}</Td>
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
  const [detail, setDetail] = useState<(typeof SELLERS)[number] | null>(null);
  const [suspend, setSuspend] = useState<(typeof SELLERS)[number] | null>(null);

  const rows = SELLERS.filter(
    (s) =>
      (status === "Semua" || label(s.status) === status) &&
      (s.name.toLowerCase().includes(q.toLowerCase()) || s.owner.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <AppShell group="admin">
      <PageHeader
        index="A02"
        kicker="Operasi"
        title="Kelola penjual"
        desc="4.820 toko aktif. Verifikasi akun baru maksimal 1×24 jam pada hari kerja."
        actions={<Button variant="secondary" onClick={() => toast("Daftar penjual diekspor ke CSV.", "info")}>
          <Icon name="download" size={16} /> Ekspor daftar
        </Button>}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total penjual" value="5.104" delta={7} hint="+184 minggu ini" />
        <StatCard label="Aktif (30 hari)" value="4.820" hint="94,4% dari total" />
        <StatCard label="Perlu verifikasi" value="12" hint="lewat 1×24 jam" />
        <StatCard label="Ditangguhkan" value="37" hint="pelanggaran kebijakan" />
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

        {rows.length === 0 ? (
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
                <Th>ID</Th>
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
              {rows.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-canvas/70">
                  <Td className="tnum text-[13px] text-muted">{s.id}</Td>
                  <Td>
                    <button onClick={() => setDetail(s)} className="text-left">
                      <div className="text-[14px] font-bold text-ink hover:text-brand-700">{s.name}</div>
                      <div className="text-[12.5px] text-faint">{s.owner}</div>
                    </button>
                  </Td>
                  <Td className="text-[13.5px]">{s.city}</Td>
                  <Td>
                    <Badge tone={s.plan === "Premium" ? "blue" : "gray"}>{s.plan}</Badge>
                  </Td>
                  <Td className="tnum text-right font-semibold">{rupiahShort(s.sales)}</Td>
                  <Td className="tnum text-right">{s.orders}</Td>
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
              ))}
            </tbody>
          </TableWrap>
        )}

        <div className="px-4 py-3.5 text-[13px] text-muted sm:px-5">
          Menampilkan <span className="tnum font-semibold text-ink">{rows.length}</span> dari 5.104 penjual
        </div>
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name ?? ""}
        eyebrow={`Detail penjual · ${detail?.id ?? ""}`}
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
                ["Pemilik", detail.owner],
                ["Kota", detail.city],
                ["Bergabung", detail.joined],
                ["Paket", detail.plan],
                ["Total GMV", rupiah(detail.sales)],
                ["Jumlah pesanan", String(detail.orders)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md bg-canvas p-3">
                  <div className="micro text-faint">{k}</div>
                  <div className="mt-1 text-[14px] font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-line p-3.5">
              <div className="micro mb-2 text-faint">Verifikasi</div>
              <ul className="space-y-2 text-[13.5px] text-muted">
                <li className="flex items-center gap-2">
                  <Icon name="checkCircle" size={15} className="text-ok" /> Identitas (KTP) terverifikasi
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="checkCircle" size={15} className="text-ok" /> Rekening bank cocok
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="clock" size={15} className="text-warn" /> NPWP belum dilampirkan
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!suspend}
        onClose={() => setSuspend(null)}
        title={suspend?.status === "ditangguhkan" ? `Aktifkan kembali ${suspend?.name}?` : `Tangguhkan ${suspend?.name}?`}
        body={
          suspend?.status === "ditangguhkan"
            ? "Toko akan kembali bisa menerima pesanan dan penarikan dana diaktifkan kembali."
            : "Toko akan berhenti menerima pesanan dan penarikan dana ditahan sampai tinjauan selesai. Pemilik menerima notifikasi."
        }
        confirmLabel={suspend?.status === "ditangguhkan" ? "Aktifkan" : "Tangguhkan toko"}
        tone={suspend?.status === "ditangguhkan" ? "primary" : "danger"}
        onConfirm={() =>
          toast(
            suspend?.status === "ditangguhkan"
              ? `${suspend?.name} diaktifkan kembali.`
              : `${suspend?.name} ditangguhkan.`,
            suspend?.status === "ditangguhkan" ? "ok" : "warn",
          )
        }
      />
    </AppShell>
  );
}

/* ============================ PREMIUM REQUESTS =========================== */
export function AdminPremium() {
  const { toast } = useApp();
  const [list, setList] = useState(PREMIUM_REQUESTS);
  const [reject, setReject] = useState<(typeof PREMIUM_REQUESTS)[number] | null>(null);

  const approve = (id: string) => {
    setList((l) => l.map((x) => (x.id === id ? { ...x, status: "disetujui" } : x)));
    toast("Permintaan Premium disetujui. Akses langsung aktif.");
  };

  return (
    <AppShell group="admin">
      <PageHeader
        index="A03"
        kicker="Operasi"
        title="Permintaan Premium"
        desc="Penjual mengunggah bukti bayar manual. Tinjau dalam 1×24 jam supaya tidak ada toko tertahan."
        actions={<Segmented items={["Menunggu", "Semua"]} active="Semua" onChange={() => {}} />}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Menunggu tinjauan" value={String(list.filter((l) => l.status === "menunggu").length)} hint="rata-rata 4 jam" />
        <StatCard label="Disetujui bulan ini" value="64" delta={21} hint="Rp31.420.000" />
        <StatCard label="Ditolak bulan ini" value="7" hint="bukti bayar tidak jelas" />
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
            {list.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-canvas/70">
                <Td className="tnum text-[13px] text-muted">{p.id}</Td>
                <Td className="text-[13.5px] font-semibold">{p.seller}</Td>
                <Td className="text-[13.5px]">{p.plan}</Td>
                <Td className="tnum text-right font-bold">{rupiah(p.amount)}</Td>
                <Td className="hidden md:table-cell">
                  <Badge tone={p.proof === "QRIS" ? "blue" : "gray"}>{p.proof}</Badge>
                </Td>
                <Td className="text-[13px] text-muted">{p.date}</Td>
                <Td>
                  <Badge tone={statusTone(p.status)} dot>
                    {label(p.status)}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" disabled={p.status !== "menunggu"} onClick={() => approve(p.id)}>
                      Setujui
                    </Button>
                    <Button size="sm" variant="ghost" disabled={p.status !== "menunggu"} onClick={() => setReject(p)}>
                      Tolak
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        <div className="px-4 py-3.5 text-[13px] text-muted sm:px-5">
          Persetujuan tercatat di log audit beserta nama admin yang menyetujui.
        </div>
      </Card>

      <ConfirmDialog
        open={!!reject}
        onClose={() => setReject(null)}
        title={`Tolak permintaan ${reject?.id ?? ""}?`}
        body="Penjual tetap bisa memakai paket Gratis. Alasan penolakan dikirim ke email pemilik toko dan bisa diunggah ulang."
        confirmLabel="Tolak permintaan"
        onConfirm={() => {
          setList((l) => l.map((x) => (x.id === reject?.id ? { ...x, status: "ditolak" } : x)));
          toast("Permintaan ditolak dan penjual diberi tahu.", "warn");
        }}
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
        }}
      />
    </AppShell>
  );
}

/* =========================== PLATFORM ANALYTICS ========================== */
export function AdminAnalytics() {
  const loading = useFakeLoad([], 600);
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
        <StatCard label="GMV kumulatif" value="Rp18,4 M" delta={23} hint="sejak 2024" loading={loading} />
        <StatCard label="Pendapatan platform" value="Rp624.800.000" delta={19} hint="biaya layanan + langganan" loading={loading} />
        <StatCard label="Rata-rata GMV / toko" value="Rp8,9 jt" delta={6} hint="per bulan" loading={loading} />
        <StatCard label="Churn langganan" value="2,4%" delta={-8} hint="turun, bagus" loading={loading} />
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
              <LineChart series={SALES_30.map((v) => v * 36)} labels={Array.from({ length: 30 }, (_, i) => `${i + 1}`)} height={210} color="#0B2E6E" format={rupiahShort} />
            )}
          </ChartFrame>
        </Card>

        <Card>
          <ChartFrame title="Distribusi paket" hint="5.104 penjual terdaftar">
            <Donut
              centerValue="5.104"
              centerLabel="penjual"
              items={[
                { label: "Premium bulanan", value: 1240, color: "#0A69C4" },
                { label: "Premium tahunan", value: 686, color: "#1B9AE0" },
                { label: "Gratis", value: 3178, color: "#0B2E6E" },
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
              data={[
                { label: "Minggu ini", value: 184 },
                { label: "Minggu lalu", value: 192 },
                { label: "2 minggu lalu", value: 168 },
                { label: "3 minggu lalu", value: 154 },
              ]}
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
  const rows = PAYMENTS.filter((p) =>
    tab === "semua" ? true : tab === "gagal" ? p.status === "gagal" || p.status === "perlu cek" : p.status === "berhasil",
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
          { id: "semua", label: "Semua", count: PAYMENTS.length },
          { id: "berhasil", label: "Berhasil" },
          { id: "masalah", label: "Gagal / perlu cek", count: 2 },
        ]}
      />

      <Card pad={false}>
        {rows.length === 0 ? (
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
              {rows.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-canvas/70">
                  <Td className="tnum text-[13px] font-semibold">{p.id}</Td>
                  <Td className="text-[13.5px]">{p.store}</Td>
                  <Td>
                    <Badge tone={p.channel === "QRIS" ? "blue" : "gray"}>{p.channel}</Badge>
                  </Td>
                  <Td className="hidden text-[13px] text-muted md:table-cell">{p.time}</Td>
                  <Td className="tnum text-right font-bold">{rupiah(p.amount)}</Td>
                  <Td className="tnum text-right text-muted">{rupiah(p.fee)}</Td>
                  <Td>
                    <Badge tone={statusTone(p.status)} dot>
                      {label(p.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant={p.status === "gagal" || p.status === "perlu cek" ? "secondary" : "ghost"}
                        onClick={() => toast(`Detail transaksi ${p.id} dibuka.`, "info")}
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
            {rupiah(rows.reduce((s, r) => s + r.amount, 0))}
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
  const [suspend, setSuspend] = useState<(typeof ADMIN_USERS)[number] | null>(null);
  const rows = ADMIN_USERS.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q.toLowerCase()));

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
            {rows.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-canvas/70">
                <Td className="tnum text-[13px] text-muted">{u.id}</Td>
                <Td className="text-[13.5px] font-semibold">{u.name}</Td>
                <Td className="text-[13.5px] text-muted">{u.email}</Td>
                <Td>
                  <Badge tone={u.role === "Admin" ? "navy" : "blue"}>{u.role}</Badge>
                </Td>
                <Td className="hidden text-[13px] text-muted md:table-cell">{u.last}</Td>
                <Td>
                  <Badge tone={statusTone(u.status)} dot>
                    {label(u.status)}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => toast(`Profil ${u.name} dibuka.`, "info")}>
                      Detail
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSuspend(u)}>
                      {u.status === "ditangguhkan" ? "Aktifkan" : "Tangguhkan"}
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        <div className="px-4 py-3.5 text-[13px] text-muted sm:px-5">
          {rows.length} pengguna ditampilkan
        </div>
      </Card>

      <ConfirmDialog
        open={!!suspend}
        onClose={() => setSuspend(null)}
        title={`${suspend?.status === "ditangguhkan" ? "Aktifkan" : "Tangguhkan"} akun ${suspend?.name}?`}
        body={
          suspend?.status === "ditangguhkan"
            ? "Pengguna bisa masuk kembali dengan peran yang sama seperti sebelumnya."
            : "Pengguna langsung keluar dari seluruh sesi dan tidak bisa masuk sampai diaktifkan kembali."
        }
        confirmLabel="Konfirmasi"
        tone={suspend?.status === "ditangguhkan" ? "primary" : "danger"}
        onConfirm={() => toast("Status akun diperbarui.", suspend?.status === "ditangguhkan" ? "ok" : "warn")}
      />
    </AppShell>
  );
}

/* ============================ SYSTEM SETTINGS ============================ */
export function AdminSystem() {
  const { toast } = useApp();
  const [maintenance, setMaintenance] = useState(false);
  const [fee, setFee] = useState("0,7");
  const [minWithdraw, setMinWithdraw] = useState("50000");
  const [close, setClose] = useState(false);
  const [channels, setChannels] = useState([
    { t: "QRIS", d: "Semua e-wallet dan m-banking", on: true },
    { t: "Transfer bank manual", d: "Verifikasi otomatis via rekening bersama", on: true },
    { t: "Dompet digital (GoPay, OVO, DANA)", d: "Sedang uji coba", on: false },
    { t: "Bayar di tempat (COD)", d: "Baru untuk Jawa & Bali", on: false },
  ]);

  return (
    <AppShell group="admin">
      <PageHeader
        index="A08"
        kicker="Sistem"
        title="Pengaturan sistem"
        desc="Parameter platform. Perubahan berlaku untuk transaksi baru setelah disimpan."
        actions={<Button onClick={() => toast("Pengaturan sistem disimpan dan masuk log audit.")}>Simpan pengaturan</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card>
            <CardHead title="Biaya & limit" sub="Berlaku untuk seluruh penjual" icon="wallet" />
            <FieldRow cols={3}>
              <Field label="Biaya layanan QRIS (%)" hint="Saat ini 0,7%">
                <Input value={fee} onChange={(e) => setFee(e.target.value)} className="tnum" />
              </Field>
              <Field label="Minimum penarikan (Rp)">
                <Input value={minWithdraw} onChange={(e) => setMinWithdraw(e.target.value.replace(/\D/g, ""))} className="tnum" />
              </Field>
              <Field label="Batas penarikan otomatis (Rp)">
                <Input defaultValue="5000000" className="tnum" />
              </Field>
            </FieldRow>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Biaya transfer bank">
                <Select defaultValue="Rp6.500">
                  <option>Rp6.500</option>
                  <option>Gratis</option>
                  <option>Rp10.000</option>
                </Select>
              </Field>
              <Field label="Masa berlaku kode promo maksimal">
                <Select defaultValue="90 hari">
                  <option>30 hari</option>
                  <option>90 hari</option>
                  <option>Tanpa batas</option>
                </Select>
              </Field>
            </div>
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
                    onChange={(v) => {
                      setChannels((xs) => xs.map((x) => (x.t === c.t ? { ...x, on: v } : x)));
                      toast("Kanal pembayaran diperbarui.", "info");
                    }}
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
                <Badge tone={maintenance ? "red" : "green"} dot>
                  {maintenance ? "Pemeliharaan aktif" : "Layanan normal"}
                </Badge>
                <span className="text-[13.5px] text-muted">Pembeli tetap bisa membuka toko.</span>
              </div>
              <Button variant="danger" onClick={() => setClose(true)}>
                {maintenance ? "Akhiri mode pemeliharaan" : "Aktifkan mode pemeliharaan"}
              </Button>
            </div>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHead title="Log audit terakhir" icon="shield" />
            <ul className="space-y-3.5">
              {[
                ["Dwi Handoko", "Menyetujui PRM-0089", "12 Feb 08:31"],
                ["Sari Utami", "Mengubah biaya QRIS 0,75% → 0,7%", "11 Feb 16:04"],
                ["Dwi Handoko", "Menangguhkan SLR-0127", "10 Feb 11:22"],
                ["Sistem", "Sinkronisasi bank selesai", "10 Feb 04:00"],
              ].map(([who, what, when]) => (
                <li key={what} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink">{what}</div>
                    <div className="text-[12.5px] text-faint">
                      {who} · {when}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHead title="Status layanan" icon="info" />
            <ul className="space-y-2.5 text-[13.5px]">
              {[
                ["API publik", "99,98%"],
                ["Webhook pembayaran", "99,91%"],
                ["Pengiriman notifikasi", "99,72%"],
              ].map(([k, v]) => (
                <li key={k}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-muted">{k}</span>
                    <span className="tnum font-semibold text-ok">{v}</span>
                  </div>
                  <Progress value={parseFloat(v.replace("%", "").replace(",", "."))} tone="ok" />
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={close}
        onClose={() => setClose(false)}
        title={maintenance ? "Akhiri mode pemeliharaan?" : "Aktifkan mode pemeliharaan?"}
        body={
          maintenance
            ? "Seluruh penjual bisa masuk kembali dan transaksi berjalan normal."
            : "Penjual tidak bisa masuk ke dasbor selama 10 menit. Halaman toko dan checkout tetap berjalan untuk pembeli."
        }
        confirmLabel={maintenance ? "Akhiri" : "Aktifkan 10 menit"}
        tone={maintenance ? "primary" : "danger"}
        onConfirm={() => {
          setMaintenance((m) => !m);
          toast(maintenance ? "Mode pemeliharaan diakhiri." : "Mode pemeliharaan aktif selama 10 menit.", maintenance ? "ok" : "warn");
        }}
      />
    </AppShell>
  );
}
