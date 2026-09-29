import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { navigate } from "../lib/router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { digitsOnly, formatRibuan, isValidWA, normalizeWA } from "../lib/format";
import {
  NOTIFS,
  rupiah,
  useApp,
} from "../lib/data";
import { AppShell } from "../components/layout";
import { LogoMark } from "../components/Logo";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHead,
  ConfirmDialog,
  EmptyState,
  ErrorState,
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
  Textarea,
  Th,
  Toggle,
  cx,
} from "../components/ui";
import { BarRows, ChartFrame, LineChart } from "../components/charts";
import { StatCard } from "./DashboardA";
import { QRMark } from "./Landing";

/* ================================== WALLET ================================= */
/* ============================ LEDGER (Fase 4) ============================= */
type LedgerRow = {
  id: string;
  label: string;
  amount: number | string;
  type: string;
  ref_order_id: string | null;
  created_at: string;
};

/** Riwayat + saldo seller dari tabel `ledger` (saldo = jumlah semua amount). */
function useLedger() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(false);
    const { data, error } = await supabase
      .from("ledger")
      .select("id,label,amount,type,ref_order_id,created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      setLoadError(true);
      return;
    }
    setRows((data ?? []) as LedgerRow[]);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const balance = rows.reduce((s, r) => s + Number(r.amount), 0);
  return { rows, balance, loading, loadError, load };
}

export function Wallet() {
  const [tab, setTab] = useState("semua");
  const { user } = useAuth();
  const { rows, balance, loading, loadError, load } = useLedger();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("orders").select("total").eq("seller_id", user.id).eq("status", "menunggu");
      setPending(((data ?? []) as { total: number | string }[]).reduce((s, o) => s + Number(o.total), 0));
    })();
  }, [user?.id]);
  const filtered = rows.filter((r) => (tab === "semua" ? true : tab === "masuk" ? r.type === "masuk" : r.type === "keluar"));
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = rows.filter((r) => new Date(r.created_at) >= monthStart);
  const inMonth = thisMonth.filter((r) => r.type === "masuk").reduce((s, r) => s + Number(r.amount), 0);
  const outMonth = thisMonth.filter((r) => r.type === "keluar").reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
  // Saldo berjalan per baris (dari terlama): untuk kolom "Saldo".
  const running = new Map<string, number>();
  [...rows].reverse().forEach((r) => {
    const prev = [...running.values()].pop() ?? 0;
    running.set(r.id, prev + Number(r.amount));
  });
  // Seri grafik: bucket harian 14 hari terakhir (net per hari, ribuan Rp).
  const days: { key: string; net: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: d.toISOString().slice(0, 10), net: 0 });
  }
  rows.forEach((r) => {
    const k = new Date(r.created_at).toISOString().slice(0, 10);
    const b = days.find((d) => d.key === k);
    if (b) b.net += Number(r.amount);
  });

  return (
    <AppShell>
      <PageHeader
        index="06"
        kicker="Keuangan"
        title="Saldo"
        desc="Uang dari penjualan masuk ke sini sebelum Anda tarik ke rekening."
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()}>
              <Icon name="download" size={16} /> Unduh laporan
            </Button>
            <ButtonLink to="/app/withdraw">
              <Icon name="down" size={16} /> Tarik dana
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="notch relative overflow-hidden rounded-xl bg-navy-900 p-5 text-white lg:col-span-2">
          <div className="blueprint absolute inset-0 opacity-60" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="micro text-brand-300">Saldo tersedia</div>
                <div className="tnum mt-2 text-[38px] font-bold leading-none sm:text-[44px]">{rupiah(balance)}</div>
                <div className="mt-2.5 flex items-center gap-3 text-[13px] text-white/60">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Siap ditarik
                  </span>
                  <span>Minimum penarikan Rp50.000</span>
                </div>
              </div>
              <div className="text-right">
                <div className="micro text-white/62">Menunggu cair</div>
                <div className="tnum mt-1.5 text-[20px] font-bold">{rupiah(pending)}</div>
                <div className="mt-2.5">
                  <Badge tone="blue" dot>
                    Diproses 1 hari kerja
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5 border-t border-white/12 pt-5">
              <ButtonLink to="/app/withdraw" className="bg-brand-500! text-navy-900! hover:bg-brand-400!">
                Tarik dana
              </ButtonLink>
              <Button
                variant="secondary"
                className="border-white/25! bg-transparent! text-white! hover:border-white/50 hover:bg-white/10 hover:text-white"
                onClick={() => window.print()}
              >
                Mutasi saldo (PDF)
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <StatCard label="Masuk bulan ini" value={rupiah(inMonth)} hint={`${thisMonth.filter((r) => r.type === "masuk").length} transaksi`} />
          <StatCard label="Keluar bulan ini" value={rupiah(outMonth)} hint={`${thisMonth.filter((r) => r.type === "keluar").length} transaksi`} />
        </div>
      </div>

      <Card className="mt-4">
        <ChartFrame
          title="Arus saldo 30 hari"
          hint="Masuk vs keluar, dalam ribuan rupiah"
          legend={
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11.5px] text-muted">
                <span className="h-2 w-2 rounded-[2px] bg-brand-600" /> Masuk
              </span>
              <span className="flex items-center gap-1.5 text-[11.5px] text-muted">
                <span className="h-2 w-2 rounded-[2px] bg-warn" /> Keluar
              </span>
            </span>
          }
        >
          <LineChart
            series={days.map((d) => Math.round(d.net / 1000))}
            labels={days.map((d) => String(new Date(d.key + "T00:00:00").getDate()))}
            format={(v) => `${v}rb`}
          />
        </ChartFrame>
      </Card>

      <Card className="mt-4" pad={false}>
        <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <CardHead title="Riwayat transaksi" sub="30 hari terakhir" icon="receipt" />
          <Tabs
            className="mb-0 border-b-0"
            active={tab}
            onChange={setTab}
            items={[
              { id: "semua", label: "Semua" },
              { id: "masuk", label: "Masuk" },
              { id: "keluar", label: "Keluar" },
            ]}
          />
        </div>
        {loading ? (
          <div className="space-y-3 p-4 sm:p-5">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : loadError ? (
          <div className="p-4 sm:p-5">
            <ErrorState onRetry={load} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              icon="receipt"
              title="Belum ada transaksi"
              desc="Penjualan yang lunas otomatis masuk ke sini. Penarikan yang selesai tercatat sebagai keluar."
            />
          </div>
        ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Keterangan</Th>
              <Th className="hidden sm:table-cell">Kode</Th>
              <Th className="hidden sm:table-cell">Tanggal</Th>
              <Th className="text-right">Jumlah</Th>
              <Th className="text-right">Saldo</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const amt = Number(r.amount);
              const when = new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
              return (
              <tr key={r.id} className="transition-colors hover:bg-canvas/70">
                <Td>
                  <div className="flex items-center gap-3">
                    <span
                      className={cx(
                        "grid h-8 w-8 place-items-center rounded-md",
                        amt > 0 ? "bg-oksoft text-ok" : "bg-warnsoft text-warn",
                      )}
                    >
                      <Icon name={amt > 0 ? "arrowDown" : "arrowUp"} size={16} />
                    </span>
                    <div>
                      <div className="text-[13.5px] font-semibold text-ink">{r.label}</div>
                      <div className="text-[12px] text-faint sm:hidden">{when}</div>
                    </div>
                  </div>
                </Td>
                <Td className="tnum hidden text-[13px] text-muted sm:table-cell">{r.id.slice(0, 8).toUpperCase()}</Td>
                <Td className="hidden text-[13px] text-muted sm:table-cell">{when}</Td>
                <Td className={cx("tnum text-right font-bold", amt > 0 ? "text-ok" : "text-ink")}>
                  {amt > 0 ? "+" : "−"}
                  {rupiah(Math.abs(amt))}
                </Td>
                <Td className="tnum text-right text-muted">{rupiah(running.get(r.id) ?? 0)}</Td>
              </tr>
              );
            })}
          </tbody>
        </TableWrap>
        )}
        <div className="px-4 py-3.5 text-[12.5px] text-faint sm:px-5">
          Saldo dihitung ulang setiap transaksi masuk. Biaya layanan QRIS dipotong otomatis.
        </div>
      </Card>
    </AppShell>
  );
}

/* ================================= WITHDRAW ================================ */
export function Withdraw() {
  const { toast } = useApp();
  const { user, profile } = useAuth();
  const { balance } = useLedger();
  const [amount, setAmount] = useState("500000");
  const [bank, setBank] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [history, setHistory] = useState<{ amount: number | string; status: string; created_at: string; bank: string }[]>([]);
  const fee = 6500;
  const value = Number(amount || 0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("withdrawals")
        .select("amount,status,created_at,bank")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setHistory((data ?? []) as { amount: number | string; status: string; created_at: string; bank: string }[]);
    })();
  }, [user?.id]);

  const submit = () => {
    if (value < 50000) return setErr("Penarikan minimal Rp50.000.");
    if (value > balance) return setErr("Jumlah melebihi saldo tersedia.");
    if (!bank) return setErr("Pilih rekening tujuan.");
    setErr("");
    setConfirm(true);
  };

  const confirmWithdraw = async () => {
    if (!user) return;
    setConfirm(false);
    setLoading(true);
    try {
      const { error } = await supabase.from("withdrawals").insert({
        seller_id: user.id,
        bank: bank || "BCA",
        account_number: bank || "BCA",
        amount: value,
        fee,
        status: "menunggu",
      });
      if (error) {
        toast("Gagal membuat penarikan.", "bad");
        return;
      }
      toast("Permintaan penarikan diterima. Dana cair maksimal 1 hari kerja.");
      navigate("/app/wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        index="06"
        kicker="Keuangan"
        title="Tarik dana"
        desc="Dana masuk ke rekening Anda pada hari kerja berikutnya, paling lambat 1 hari kerja."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
            <CardHead title="Formulir penarikan" sub={`Saldo tersedia ${rupiah(balance)}`} icon="wallet" />
          <div className="space-y-4">
            <Field label="Jumlah yang ditarik" required error={err}>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-faint">Rp</span>
                <Input
                  value={amount ? Number(amount).toLocaleString("id-ID") : ""}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  invalid={!!err}
                  inputMode="numeric"
                  className="tnum h-12 pl-9 text-[18px] font-bold"
                />
              </div>
            </Field>

            <div className="flex flex-wrap gap-2">
              {[
                ["Rp50.000", 50000],
                ["Rp100.000", 100000],
                ["Rp500.000", 500000],
                ["Semua saldo", balance],
              ].map(([l, v]) => (
                <button
                  key={String(l)}
                  onClick={() => {
                    setAmount(String(v));
                    setErr("");
                  }}
                  className={cx(
                    "notch-sm px-3 py-1.5 text-[13px] font-semibold transition-colors duration-150",
                    amount === String(v) ? "bg-navy-800 text-white" : "border border-line bg-white text-muted hover:border-brand-300 hover:text-brand-700",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <Field label="Rekening tujuan" required>
              <Select value={bank} onChange={(e) => setBank(e.target.value)}>
                <option value="">{`Pilih rekening… (${profile?.owner_name || "Pemilik"})`}</option>
                <option>BCA •••• 4821</option>
                <option>Mandiri •••• 3345</option>
              </Select>
            </Field>

            <Field label="Catatan (opsional)">
              <Input placeholder="Contoh: untuk beli bahan baku" />
            </Field>

            <div className="rounded-lg border border-line bg-canvas p-4 text-[13.5px]">
              <div className="flex justify-between py-1">
                <span className="text-muted">Jumlah penarikan</span>
                <span className="tnum font-semibold text-ink">{rupiah(value)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Biaya transfer</span>
                <span className="tnum font-semibold text-ink">−{rupiah(fee)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-line pt-2.5 text-[15px]">
                <span className="font-bold text-ink">Diterima di rekening</span>
                <span className="tnum font-bold text-brand-700">{rupiah(Math.max(0, value - fee))}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button size="lg" loading={loading} onClick={submit} className="flex-1 h-14! text-[16px]!">
                Tarik dana sekarang
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/app/wallet")}>
                Kembali ke saldo
              </Button>
            </div>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHead title="Riwayat penarikan" icon="clock" />
            <ul className="space-y-3.5">
              {history.length === 0 ? (
                <li className="text-[13px] text-faint">Belum ada penarikan.</li>
              ) : (
                history.map((h) => (
                  <li key={`${h.created_at}-${h.amount}`} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="tnum text-[13.5px] font-bold text-ink">{rupiah(Number(h.amount))}</div>
                      <div className="text-[12px] text-faint">
                        {new Date(h.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} · {h.bank}
                      </div>
                    </div>
                    <Badge tone={h.status === "selesai" ? "green" : h.status === "ditolak" ? "red" : h.status === "diproses" ? "blue" : "amber"} dot>
                      {h.status === "selesai" ? "Selesai" : h.status === "ditolak" ? "Ditolak" : h.status === "diproses" ? "Diproses" : "Menunggu"}
                    </Badge>
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card>
            <CardHead title="Yang perlu diketahui" icon="info" />
            <ul className="space-y-2.5 text-[13px] leading-relaxed text-muted">
              <li className="flex gap-2">
                <Icon name="check" size={14} className="mt-1 shrink-0 text-brand-600" strokeWidth={2.6} />
                Penarikan diproses pada jam kerja (Senin–Jumat, 09.00–16.00 WIB).
              </li>
              <li className="flex gap-2">
                <Icon name="check" size={14} className="mt-1 shrink-0 text-brand-600" strokeWidth={2.6} />
                Biaya transfer Rp6.500 berlaku untuk semua bank.
              </li>
              <li className="flex gap-2">
                <Icon name="check" size={14} className="mt-1 shrink-0 text-brand-600" strokeWidth={2.6} />
                Nama pemilik rekening harus sama dengan data akun.
              </li>
            </ul>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Konfirmasi penarikan"
        body={`Anda akan menarik ${rupiah(value)} ke ${bank}. Biaya transfer ${rupiah(fee)}, sehingga yang diterima ${rupiah(Math.max(0, value - fee))}. Dana tidak bisa ditarik kembali setelah diproses.`}
        confirmLabel="Ya, tarik dana"
        tone="primary"
        onConfirm={confirmWithdraw}
      />
    </AppShell>
  );
}

/* ================================= BIO LINKS =============================== */
export function BioLinks() {
  const { toast } = useApp();
  const { user, profile } = useAuth();
  const storeName = profile?.store_name || "";
  const storeSlug = profile?.store_slug || "";
  type BRow = {
    id: string; label: string; url: string; icon: string | null;
    clicks: number; is_active: boolean; sort_order: number;
  };
  const [links, setLinks] = useState<BRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [del, setDel] = useState<{ id: string; label: string } | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("bio_links")
      .select("*")
      .eq("seller_id", user.id)
      .order("sort_order", { ascending: true });
    setLinks((data ?? []) as BRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const toggle = async (id: string) => {
    const cur = links.find((x) => x.id === id);
    if (!cur) return;
    setLinks((l) => l.map((x) => (x.id === id ? { ...x, is_active: !x.is_active } : x)));
    const { error } = await supabase.from("bio_links").update({ is_active: !cur.is_active }).eq("id", id);
    if (error) {
      setLinks((l) => l.map((x) => (x.id === id ? { ...x, is_active: cur.is_active } : x)));
      toast("Gagal mengubah status tautan.", "bad");
    }
  };

  const saveField = async (id: string, patch: Partial<BRow>) => {
    const { error } = await supabase.from("bio_links").update(patch).eq("id", id);
    if (error) {
      toast("Gagal menyimpan tautan.", "bad");
      load();
    }
  };

  const addLink = async () => {
    if (!user) return;
    const maxOrder = links.reduce((s, l) => Math.max(s, l.sort_order), -1);
    const { data, error } = await supabase
      .from("bio_links")
      .insert({
        seller_id: user.id,
        label: "Tautan baru",
        url: `tokolink.id/${storeSlug}/baru`,
        icon: "link",
        sort_order: maxOrder + 1,
      })
      .select("*")
      .single();
    if (error || !data) {
      toast("Gagal menambah tautan.", "bad");
      return;
    }
    setLinks((l) => [...l, data as BRow]);
    toast("Tautan baru ditambahkan.");
  };

  const confirmDelete = async () => {
    if (!del) return;
    const target = del.id;
    setDel(null);
    setLinks((l) => l.filter((x) => x.id !== target));
    const { error } = await supabase.from("bio_links").delete().eq("id", target);
    if (error) {
      toast("Gagal menghapus tautan.", "bad");
      load();
      return;
    }
    toast("Tautan dihapus.", "warn");
  };

  return (
    <AppShell>
      <PageHeader
        index="07"
        kicker="Tampilan"
        title="Tautan bio"
        desc="Satu halaman berisi semua tautan penting. Taruh alamatnya di bio Instagram, WhatsApp, dan TikTok."
        actions={
          <>
            <Button variant="secondary" onClick={() => toast(`Tautan disalin: tokolink.id/${storeSlug}`)}>
              <Icon name="copy" size={16} /> Salin tautan
            </Button>
            <Button
              onClick={addLink}
            >
              <Icon name="plus" size={16} /> Tambah tautan
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : links.length === 0 ? (
            <EmptyState
              icon="link"
              title="Belum ada tautan"
              desc="Tambahkan WhatsApp, Instagram, atau katalog agar pembeli mudah menghubungimu."
            />
          ) : (
          links.map((l, i) => (
            <div
              key={l.id}
              className={cx(
                "flex flex-col gap-3 rounded-xl border bg-white p-4 transition-[border-color,box-shadow] duration-150 sm:flex-row sm:items-center",
                l.is_active ? "border-line shadow-card" : "border-dashed border-line bg-canvas/60",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-canvas text-faint">
                  <Icon name="menu" size={16} />
                </span>
                <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-md", l.is_active ? "bg-brand-50 text-brand-600" : "bg-white text-faint")}>
                  <Icon name={(l.icon ?? "link") === "link" ? "link" : l.icon === "doc" ? "receipt" : (l.icon ?? "link")} size={17} />
                </span>
              </div>
                <div className="min-w-0 flex-1">
                  <Input
                    value={l.label}
                    onChange={(e) => setLinks((ls) => ls.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)))}
                    onBlur={(e) => saveField(l.id, { label: e.target.value })}
                    className="h-9 border-transparent bg-transparent px-2 font-semibold hover:border-line focus:bg-white"
                    aria-label="Judul tautan"
                  />
                  <Input
                    value={l.url}
                    onChange={(e) => setLinks((ls) => ls.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)))}
                    onBlur={(e) => saveField(l.id, { url: e.target.value })}
                    className="mt-0.5 h-8 border-transparent bg-transparent px-2 text-[13px] text-muted hover:border-line focus:bg-white"
                    aria-label="Alamat tautan"
                  />
                </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-right">
                  <span className="tnum block text-[14px] font-bold text-ink">{l.clicks.toLocaleString("id-ID")}</span>
                  <span className="micro text-faint">klik</span>
                </span>
                <Toggle checked={l.is_active} onChange={() => toggle(l.id)} label={`Tampilkan ${l.label}`} />
                <button
                  onClick={() => setDel({ id: l.id, label: l.label })}
                  aria-label="Hapus tautan"
                  className="rounded-md p-2 text-faint transition-colors hover:bg-badsoft hover:text-bad"
                >
                  <Icon name="trash" size={17} />
                </button>
              </div>
              <span className="micro hidden text-faint sm:block">{String(i + 1).padStart(2, "0")}</span>
            </div>
          ))
          )}

          <div className="rounded-xl border border-dashed border-line bg-canvas/60 p-4 text-[13px] text-muted">
            Tarikan tautan bisa disusun dengan menahan tombol ⠿ di sebelah kiri. Urutan di sini sama
            dengan urutan di halaman pembeli.
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-line bg-navy-900 p-4">
            <div className="micro mb-3 flex items-center justify-between text-brand-300">
              <span>Pratinjau halaman</span>
              <span>HP</span>
            </div>
            <div className="rounded-lg bg-white p-3.5">
              <div className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-navy-800">
                  <LogoMark size={32} />
                </span>
                <div className="mt-2 text-[14px] font-extrabold text-ink">{storeName}</div>
                <div className="text-[11.5px] text-faint">@{storeSlug}</div>
              </div>
              <ul className="mt-3.5 space-y-2">
                {links
                  .filter((l) => l.is_active)
                  .map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center gap-2.5 rounded-md border border-line bg-canvas px-3 py-2.5 text-[12.5px] font-semibold text-ink"
                    >
                      <Icon name={(l.icon ?? "link") === "doc" ? "receipt" : (l.icon ?? "link")} size={15} className="text-brand-600" />
                      <span className="truncate">{l.label}</span>
                    </li>
                  ))}
              </ul>
              <div className="mt-3 flex items-center justify-center gap-2 rounded-md bg-canvas py-2">
                <QRMark size={40} />
                <span className="text-[10.5px] leading-tight text-faint">
                  Pindai
                  <br />
                  buka toko
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title={`Hapus tautan “${del?.label ?? ""}”?`}
        body="Tautan langsung hilang dari halaman bio Anda. Riwayat jumlah klik tetap tersimpan."
        confirmLabel="Hapus tautan"
        onConfirm={confirmDelete}
      />
    </AppShell>
  );
}

/* ================================== THEME ================================== */
export function Theme() {
  const { toast } = useApp();
  const { profile } = useAuth();
  const storeName = profile?.store_name || "";
  const [accent, setAccent] = useState("Biru");
  const [layout, setLayout] = useState("Kisi");
  const [sections, setSections] = useState({ hours: true, qr: true, reviews: false, cart: true });
  const [saved, setSaved] = useState(true);

  const accents: Record<string, string> = {
    Biru: "#0A69C4",
    Navy: "#0B2E6E",
    Toska: "#1B9AE0",
    Hijau: "#0E9F6E",
    "Jingga hangat": "#B45309",
  };

  return (
    <AppShell>
      <PageHeader
        index="07"
        kicker="Tampilan"
        title="Tampilan toko"
        desc="Atur warna dan susunan halaman toko. Perubahan langsung terlihat oleh pembeli setelah disimpan."
        actions={
          <>
            <Button variant="ghost" onClick={() => setSaved(true)}>
              Batalkan perubahan
            </Button>
            <Button
              loading={!saved}
              onClick={() => {
                setSaved(false);
                setTimeout(() => {
                  setSaved(true);
                  toast("Tampilan toko berhasil disimpan.");
                }, 700);
              }}
            >
              Simpan tampilan
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card>
            <CardHead title="Warna aksen" sub="Dipakai untuk tombol, harga, dan tautan" icon="tag" />
            <div className="flex flex-wrap gap-2.5">
              {Object.entries(accents).map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => {
                    setAccent(name);
                    setSaved(false);
                  }}
                  className={cx(
                    "flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-[13.5px] font-semibold transition-colors duration-150",
                    accent === name ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line text-muted hover:border-brand-200",
                  )}
                >
                  <span className="h-5 w-5 rounded-[4px]" style={{ background: hex }} />
                  {name}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead title="Susunan katalog" sub="Bagaimana produk ditampilkan di halaman utama" icon="grid" />
            <div className="grid grid-cols-3 gap-3">
              {["Kisi", "Daftar", "Sorotan"].map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLayout(l);
                    setSaved(false);
                  }}
                  className={cx(
                    "rounded-lg border p-3 text-left transition-colors duration-150",
                    layout === l ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-200",
                  )}
                >
                  <span className="mb-2.5 flex h-16 gap-1.5">
                    {l === "Daftar"
                      ? [0, 1, 2].map((i) => <span key={i} className="h-4 flex-1 rounded-sm bg-white shadow-xs" />)
                      : l === "Sorotan"
                        ? [0, 1].map((i) => <span key={i} className={cx("rounded-sm bg-white shadow-xs", i === 0 ? "flex-[2]" : "flex-1")} />)
                        : [0, 1, 2].map((i) => <span key={i} className="flex-1 rounded-sm bg-white shadow-xs" />)}
                  </span>
                  <span className="text-[13px] font-bold text-ink">{l}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead title="Bagian halaman" sub="Tampilkan atau sembagian yang tidak dipakai" icon="layers" />
            <ul className="divide-y divide-linesoft">
              {[
                ["hours", "Jam buka", "Pembeli tahu kapan Anda melayani."],
                ["qr", "QR toko", "QR bisa dipindai langsung dari halaman."],
                ["reviews", "Ulasan pembeli", "Tampilkan rating dan komentar terakhir."],
                ["cart", "Keranjang belanja", "Wajib bila Anda ingin pembelian lewat halaman."],
              ].map(([k, t, d]) => (
                <li key={k} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <div className="text-[14.5px] font-bold text-ink">{t}</div>
                    <div className="text-[13px] text-muted">{d}</div>
                  </div>
                  <Toggle
                    checked={sections[k as keyof typeof sections]}
                    onChange={(v) => {
                      setSections((s) => ({ ...s, [k]: v }));
                      setSaved(false);
                    }}
                    label={t}
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHead title="Foto sampul & profil" icon="image" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="overflow-hidden rounded-lg border border-line">
                  <img src="images/store-cover.jpg" alt="" className="aspect-[16/7] w-full object-cover" />
                </div>
                <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => toast("Pilih foto sampul baru.", "info")}>
                  Ganti sampul
                </Button>
              </div>
              <div>
                <div className="flex aspect-[16/7] items-center justify-center rounded-lg border border-line bg-canvas">
                  <LogoMark size={54} />
                </div>
                <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => toast("Pilih logo baru.", "info")}>
                  Ganti logo toko
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-line bg-navy-900 p-4">
            <div className="micro mb-3 flex items-center justify-between text-brand-300">
              <span>Pratinjau langsung</span>
              <span>{layout}</span>
            </div>
            <div className="overflow-hidden rounded-lg bg-white">
              <div className="relative h-24">
                <img src="images/store-cover.jpg" alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 to-transparent" />
                <span className="absolute bottom-2.5 left-2.5 flex h-8 w-8 items-center justify-center rounded-md bg-white">
                  <LogoMark size={22} />
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-extrabold text-ink">{storeName}</span>
                  <span className="rounded-sm bg-oksoft px-1.5 py-0.5 text-[10.5px] font-bold text-[#0a7a55]">
                    Buka
                  </span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {["Semua", "Kue", "Sambal"].map((c, i) => (
                    <span
                      key={c}
                      className="rounded-sm px-2 py-1 text-[11px] font-semibold"
                      style={{
                        background: i === 0 ? accents[accent] : "#F4F8FC",
                        color: i === 0 ? "#fff" : "#46566F",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className={cx("mt-2.5 grid gap-2", layout === "Daftar" ? "grid-cols-1" : "grid-cols-2")}>
                  {["images/p-lapis.jpg", "images/p-sambal.jpg"].map((src) => (
                    <div key={src} className={cx("overflow-hidden rounded-md border border-line", layout === "Daftar" && "flex")}>
                      <img src={src} alt="" className={cx("object-cover", layout === "Daftar" ? "h-12 w-12" : "aspect-[4/3] w-full")} />
                      <div className="p-2">
                        <div className="h-1.5 w-3/4 rounded-full bg-linesoft" />
                        <div className="tnum mt-1.5 text-[11px] font-bold" style={{ color: accents[accent] }}>
                          Rp85.000
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {sections.qr && (
                  <div className="mt-2.5 flex items-center justify-center gap-2 rounded-md bg-canvas py-2">
                    <QRMark size={34} />
                    <span className="text-[10.5px] text-faint">QR toko aktif</span>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-white/55">
              Pratinjau memakai data toko asli Anda. Warna aksen berlaku untuk seluruh halaman.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

/* ================================ DISCOUNT ================================ */
export function Discount() {
  const { toast } = useApp();
  const { user } = useAuth();
  type DRow = {
    id: string; code: string; type: string; value: number | string;
    min_purchase: number | string; usage_limit: number | null; used_count: number;
    valid_until: string | null; is_active: boolean;
  };
  const [list, setList] = useState<DRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", type: "Persen", value: "", min: "", limit: "", until: "" });
  const [err, setErr] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setList((data ?? []) as DRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const dbType = (label: string) => (label === "Persen" ? "persen" : label === "Nominal" ? "nominal" : "potongan_ongkir");
  const labelType = (t: string) => (t === "persen" ? "Persen" : t === "nominal" ? "Nominal" : "Potongan ongkir");
  const fmtDate = (d: string | null) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Tanpa batas";

  const create = async () => {
    const code = form.code.trim().toUpperCase().replace(/\s+/g, "");
    if (code.length < 3) return setErr("Kode minimal 3 karakter, tanpa spasi.");
    if (!form.value || Number(form.value) <= 0) return setErr("Isi nilai diskon.");
    if (form.type === "Persen" && Number(form.value) > 100) return setErr("Persen maksimal 100.");
    if (!user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("discount_codes")
        .insert({
          seller_id: user.id,
          code,
          type: dbType(form.type),
          value: Number(form.value),
          min_purchase: Number(form.min || 0),
          usage_limit: form.limit ? Number(form.limit) : null,
          valid_until: form.until || null,
          is_active: true,
        })
        .select("*")
        .single();
      if (error) {
        setErr(error.code === "23505" ? `Kode ${code} sudah dipakai. Pakai nama lain.` : "Gagal menyimpan kode.");
        return;
      }
      setList((l) => [data as DRow, ...l]);
      setErr("");
      setOpen(false);
      setForm({ code: "", type: "Persen", value: "", min: "", limit: "", until: "" });
      toast("Kode promo dibuat dan langsung bisa dipakai pembeli.");
    } finally {
      setSaving(false);
    }
  };

  const setActive = async (id: string, v: boolean, code: string) => {
    // Optimistic: UI berubah dulu, gagal → kembalikan + error.
    setList((ls) => ls.map((x) => (x.id === id ? { ...x, is_active: v } : x)));
    const { error } = await supabase.from("discount_codes").update({ is_active: v }).eq("id", id);
    if (error) {
      setList((ls) => ls.map((x) => (x.id === id ? { ...x, is_active: !v } : x)));
      toast("Gagal mengubah status kode.", "bad");
      return;
    }
    toast(`Kode ${code} ${v ? "diaktifkan" : "dinonaktifkan"}.`, v ? "ok" : "warn");
  };

  const usedTotal = list.reduce((s, d) => s + d.used_count, 0);
  const activeCount = list.filter((d) => d.is_active).length;

  return (
    <AppShell>
      <PageHeader
        index="05"
        kicker="Promo"
        title="Kode promo"
        desc="Beri potongan harga untuk pembeli baru, hari besar, atau untuk menyetok barang yang lama tidak laku."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Icon name="plus" size={16} /> Buat kode promo
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Promo dipakai" value={String(usedTotal)} hint={`dari ${list.length} kode`} loading={loading} />
        <StatCard label="Kode aktif" value={String(activeCount)} hint="bisa dipakai pembeli" loading={loading} />
        <StatCard label="Total kode" value={String(list.length)} hint="terdaftar di toko" loading={loading} />
      </div>

      <Card pad={false}>
        <div className="px-4 pb-1 pt-4 sm:px-5">
          <CardHead title="Semua kode" sub={`${list.length} kode terdaftar`} icon="tag" />
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Kode</Th>
              <Th>Potongan</Th>
              <Th className="hidden md:table-cell">Minimum belanja</Th>
              <Th className="hidden md:table-cell">Berlaku sampai</Th>
              <Th>Pemakaian</Th>
              <Th className="text-right">Status</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="p-4 sm:p-5">
                    <EmptyState
                      icon="tag"
                      title="Belum ada kode promo"
                      desc="Buat kode pertama untuk menarik pembeli baru atau menghabiskan stok lama."
                    />
                  </div>
                </td>
              </tr>
            ) : (
              list.map((d) => (
              <tr key={d.id} className="transition-colors hover:bg-canvas/70">
                <Td>
                  <span className="notch-sm inline-block bg-navy-800 px-2.5 py-1.5 tnum text-[13px] font-bold tracking-wider text-brand-300">
                    {d.code}
                  </span>
                </Td>
                <Td>
                  <div className="text-[14px] font-bold text-ink">
                    {d.type === "persen" ? `${d.value}%` : rupiah(Number(d.value))}
                  </div>
                  <div className="text-[12px] text-faint">{labelType(d.type)}</div>
                </Td>
                <Td className="tnum hidden text-[13.5px] md:table-cell">{rupiah(Number(d.min_purchase))}</Td>
                <Td className="hidden text-[13.5px] text-muted md:table-cell">{fmtDate(d.valid_until)}</Td>
                <Td>
                  <div className="min-w-[120px]">
                    <div className="mb-1 flex justify-between text-[12.5px]">
                      <span className="tnum font-semibold text-ink">{d.used_count}</span>
                      <span className="tnum text-faint">/{d.usage_limit ?? "∞"}</span>
                    </div>
                    <Progress
                      value={d.usage_limit ? (d.used_count / d.usage_limit) * 100 : 0}
                      tone={d.usage_limit != null && d.used_count >= d.usage_limit ? "amber" : "blue"}
                    />
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    <Badge tone={d.is_active ? "green" : "gray"} dot>
                      {d.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <Toggle checked={d.is_active} onChange={(v) => setActive(d.id, v, d.code)} label={`Status ${d.code}`} />
                  </div>
                </Td>
              </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Buat kode promo"
        eyebrow="Promo baru"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={create} loading={saving}>Simpan kode</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Kode promo" required error={err} hint="Contoh: HARIAN5, LIBURLEBARAN">
            <Input
              value={form.code}
              onChange={(e) => {
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }));
                setErr("");
              }}
              placeholder="HARIAN5"
              className="tnum tracking-wider"
            />
          </Field>
          <FieldRow cols={2}>
            <Field label="Jenis potongan" required>
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {["Persen", "Nominal", "Potongan ongkir"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label={form.type === "Persen" ? "Nilai (persen)" : "Nilai (rupiah)"} required>
              <Input
                value={form.type === "Persen" ? form.value : formatRibuan(form.value)}
                inputMode="numeric"
                onChange={(e) => {
                  setForm((f) => ({ ...f, value: digitsOnly(e.target.value) }));
                  setErr("");
                }}
                placeholder={form.type === "Persen" ? "5" : "10.000"}
                className="tnum"
              />
            </Field>
          </FieldRow>
          <FieldRow cols={3}>
            <Field label="Minimum belanja">
              <Input
                value={formatRibuan(form.min)}
                inputMode="numeric"
                onChange={(e) => setForm((f) => ({ ...f, min: digitsOnly(e.target.value) }))}
                placeholder="50.000"
                className="tnum"
              />
            </Field>
            <Field label="Batas pemakaian" hint="Kosongkan = tanpa batas">
              <Input
                value={form.limit}
                inputMode="numeric"
                onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value.replace(/\D/g, "") }))}
                placeholder="50"
                className="tnum"
              />
            </Field>
            <Field label="Berlaku sampai" hint="Kosongkan = selamanya">
              <Input type="date" value={form.until} onChange={(e) => setForm((f) => ({ ...f, until: e.target.value }))} className="tnum" />
            </Field>
          </FieldRow>
        </div>
      </Modal>
    </AppShell>
  );
}

/* ================================== HOURS ================================== */
export function Hours() {
  const { toast } = useApp();
  const { user } = useAuth();
  const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  type HRow = { id: string; day: number; open: string; close: string; on: boolean };
  const [rows, setRows] = useState<HRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("store_hours")
      .select("id,day_of_week,open_time,close_time,is_open")
      .eq("seller_id", user.id);
    const have = new Map<number, HRow>();
    ((data ?? []) as { id: string; day_of_week: number; open_time: string | null; close_time: string | null; is_open: boolean }[]).forEach(
      (r) => {
        have.set(r.day_of_week, {
          id: r.id,
          day: r.day_of_week,
          open: (r.open_time ?? "08:00").slice(0, 5),
          close: (r.close_time ?? "20:00").slice(0, 5),
          on: r.is_open,
        });
      },
    );
    // Seed 7 hari bila belum ada (default: buka 08–20, Minggu libur).
    const missing = DAYS.map((_, d) => d).filter((d) => !have.has(d));
    if (missing.length > 0) {
      await supabase.from("store_hours").insert(
        missing.map((d) => ({
          seller_id: user.id,
          day_of_week: d,
          open_time: "08:00",
          close_time: d === 6 ? "15:00" : "20:00",
          is_open: d !== 6,
        })),
      );
      const { data: retry } = await supabase
        .from("store_hours")
        .select("id,day_of_week,open_time,close_time,is_open")
        .eq("seller_id", user.id);
      ((retry ?? []) as { id: string; day_of_week: number; open_time: string | null; close_time: string | null; is_open: boolean }[]).forEach(
        (r) => {
          have.set(r.day_of_week, {
            id: r.id,
            day: r.day_of_week,
            open: (r.open_time ?? "08:00").slice(0, 5),
            close: (r.close_time ?? "20:00").slice(0, 5),
            on: r.is_open,
          });
        },
      );
    }
    setRows(DAYS.map((_, d) => have.get(d) ?? { id: "", day: d, open: "08:00", close: "20:00", on: d !== 6 }));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const set = async (d: number, k: "on" | "open" | "close", v: string | boolean) => {
    const cur = rows.find((x) => x.day === d);
    if (!cur || !cur.id) return;
    setRows((r) => r.map((x) => (x.day === d ? { ...x, [k]: v } : x)));
    const patch =
      k === "on" ? { is_open: v as boolean } : k === "open" ? { open_time: v as string } : { close_time: v as string };
    const { error } = await supabase.from("store_hours").update(patch).eq("id", cur.id);
    if (error) {
      setRows((r) => r.map((x) => (x.day === d ? { ...cur } : x)));
      toast("Gagal menyimpan jam.", "bad");
    }
  };

  const openAll = async () => {
    if (!user) return;
    setSavingAll(true);
    try {
      const { error } = await supabase.from("store_hours").update({ is_open: true }).eq("seller_id", user.id);
      if (error) {
        toast("Gagal menyimpan.", "bad");
        return;
      }
      setRows((r) => r.map((x) => ({ ...x, on: true })));
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        index="07"
        kicker="Toko"
        title="Jam buka"
        desc="Pembeli melihat status buka atau tutup di halaman toko. Di luar jam ini, pesanan tetap masuk tetapi dikirim keesokan harinya."
        actions={
          <>
            <Button
              variant="secondary"
              loading={savingAll}
              onClick={openAll}
            >
              Buka setiap hari
            </Button>
            <Button onClick={() => toast("Jam buka disimpan.")}>Simpan jam buka</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {loading ? (
          <Card pad={false}>
            <div className="space-y-3 p-4 sm:p-5">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </Card>
        ) : (
        <Card pad={false}>
          <ul className="divide-y divide-linesoft">
            {rows.map((h) => (
              <li key={h.day} className={cx("flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:flex-nowrap sm:px-5", !h.on && "bg-canvas/60")}>
                <Toggle checked={h.on} onChange={(v) => set(h.day, "on", v)} label={`Buka ${DAYS[h.day]}`} />
                <span className={cx("w-24 text-[14.5px] font-bold", h.on ? "text-ink" : "text-faint")}>{DAYS[h.day]}</span>
                {h.on ? (
                  <div className="flex min-w-[200px] flex-1 basis-full items-center gap-2 sm:basis-auto">
                    <Input
                      type="time"
                      value={h.open}
                      onChange={(e) => set(h.day, "open", e.target.value)}
                      className="tnum h-10 min-w-0 flex-1 sm:w-[110px] sm:flex-none"
                      aria-label={`Jam buka ${DAYS[h.day]}`}
                    />
                    <span className="shrink-0 text-faint">–</span>
                    <Input
                      type="time"
                      value={h.close}
                      onChange={(e) => set(h.day, "close", e.target.value)}
                      className="tnum h-10 min-w-0 flex-1 sm:w-[110px] sm:flex-none"
                      aria-label={`Jam tutup ${DAYS[h.day]}`}
                    />
                  </div>
                ) : (
                  <span className="flex-1 text-[13.5px] text-faint">Tutup / libur</span>
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3.5 sm:px-5">
            <span className="text-[13px] text-muted">
              Zona waktu <span className="font-semibold text-ink">WIB (GMT+7)</span>
            </span>
            <Button variant="secondary" size="sm" onClick={() => toast("Jam akhir pekan disalin ke hari kerja.")}>
              Salin ke hari kerja
            </Button>
          </div>
        </Card>
        )}

        <aside className="space-y-4">
          <Card>
            <CardHead title="Status sekarang" icon="clock" />
            <div className="flex items-center gap-3 rounded-lg bg-oksoft p-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-ok">
                <Icon name="check" size={20} />
              </span>
              <div>
                <div className="text-[14.5px] font-bold text-ink">Toko sedang buka</div>
                <div className="tnum text-[13px] text-muted">Sampai 20.00 WIB</div>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-muted">Pesanan di luar jam buka</span>
                <span className="font-semibold text-ink">Tetap diterima</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Pengiriman</span>
                <span className="font-semibold text-ink">Diproses hari berikutnya</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Hari libur khusus" sub="Cut-off, libur lebaran, atau libur keluarga" icon="calendar" />
            <EmptyState
              icon="calendar"
              title="Belum ada jadwal libur"
              desc="Tambahkan tanggal libur supaya pembeli tidak menunggu barang dikirim di hari yang salah."
              action={
                <Button size="sm" onClick={() => toast("Pilih tanggal libur.", "info")}>
                  Tambah tanggal libur
                </Button>
              }
            />
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

/* ==================================== QR =================================== */
export function StoreQR() {
  const { toast } = useApp();
  const { profile } = useAuth();
  const storeName = profile?.store_name || "";
  const storeSlug = profile?.store_slug || "";
  const [style, setStyle] = useState("Standar");
  const styles = ["Standar", "Bingkai toko", "Hitam putih"];
  const [qrData, setQrData] = useState("");

  useEffect(() => {
    let alive = true;
    setQrData("");
    QRCode.toDataURL(`https://tokolink.id/${storeSlug}`, { width: 456, margin: 2 })
      .then((url) => {
        if (alive) setQrData(url);
      })
      .catch(() => {
        if (alive) toast("Gagal membuat kode QR.", "bad");
      });
    return () => {
      alive = false;
    };
  }, [storeSlug]);

  const download = () => {
    if (!qrData) return;
    const a = document.createElement("a");
    a.href = qrData;
    a.download = `qr-${storeSlug}.png`;
    a.click();
    toast("QR diunduh ke perangkat.");
  };

  return (
    <AppShell>
      <PageHeader
        index="07"
        kicker="Toko"
        title="QR toko"
        desc="Cetak dan tempel QR ini di kasir, etalase, atau kemasan. Semua yang memindai akan langsung membuka toko Anda."
        actions={
          <>
            <Button variant="secondary" onClick={() => toast("Tautan QR disalin.")}>
              <Icon name="copy" size={16} /> Salin tautan
            </Button>
            <Button onClick={download}>
              <Icon name="download" size={16} /> Unduh PNG
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="relative overflow-hidden">
          <div className="grid items-center gap-8 sm:grid-cols-[auto_minmax(0,1fr)]">
            <div
              className={cx(
                "relative mx-auto rounded-xl border border-line p-6",
                style === "Bingkai toko" ? "bg-navy-900" : "bg-white",
              )}
            >
              {qrData ? (
                <img
                  src={qrData}
                  alt={`QR toko ${storeName}`}
                  width={228}
                  height={228}
                  className="h-[228px] w-[228px] rounded-md"
                  style={style === "Hitam putih" ? { filter: "grayscale(1)" } : undefined}
                />
              ) : (
                <Skeleton className="h-[228px] w-[228px]" />
              )}
              <div className="mt-3 flex items-center justify-center gap-2">
                <LogoMark size={26} />
                <span className={cx("font-display text-[15px] font-bold", style === "Bingkai toko" ? "text-white" : "text-navy-800")}>
                  {storeName}
                </span>
              </div>
            </div>

            <div>
              <div className="micro text-brand-600">Gaya QR</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {styles.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={cx(
                      "notch-sm px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-150",
                      style === s ? "bg-navy-800 text-white" : "border border-line bg-white text-muted hover:border-brand-300 hover:text-brand-700",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <dl className="mt-5 space-y-3 border-t border-linesoft pt-4 text-[13.5px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Alamat</dt>
                  <dd className="tnum font-semibold text-ink">tokolink.id/{storeSlug}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Ukuran cetak</dt>
                  <dd className="font-semibold text-ink">5 × 5 cm (min. 2 cm)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Pemindaian bulan ini</dt>
                  <dd className="tnum font-semibold text-ink">405 kali</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => window.print()}>
                  <Icon name="image" size={16} /> Cetak stiker
                </Button>
                <Button variant="secondary" onClick={() => toast("QR dibagikan ke WhatsApp.")}>
                  <Icon name="send" size={16} /> Bagikan
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHead title="Tips pemasangan" icon="info" />
            <ul className="space-y-3 text-[13.5px] leading-relaxed text-muted">
              {[
                "Tempel dekat kasir setinggi dada, supaya nyaman dipindai.",
                "Cetak di kertas putih polos, hindari laminasi glossy reflektif.",
                "Letakkan juga di kemasan supaya pembeli datang lagi.",
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="tnum grid h-5 w-5 shrink-0 place-items-center rounded-sm bg-brand-50 text-[11px] font-bold text-brand-700">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHead title="Performa QR" icon="chartAlt" />
            <BarRows
              data={[
                { label: "QR kasir toko", value: 218 },
                { label: "QR kemasan", value: 96 },
                { label: "QR status WhatsApp", value: 64 },
              ]}
              format={(v) => `${v} pindaian`}
            />
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

/* ================================= SETTINGS ================================ */
export function StoreSettings() {
  const { toast } = useApp();
  const { user, profile, loading: authLoading, refresh } = useAuth();
  const [plan, setPlan] = useState("Bulanan");
  const [close, setClose] = useState(false);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);
  const [f, setF] = useState({
    name: "",
    slug: "",
    cat: "Kue & Snack",
    city: "",
    phone: "",
    bio: "Masakan rumahan dan bumbu jadi, dimasak pagi hari dikirim siang.",
    address: "Jl. Cihampelas No. 28, Bandung 40131",
  });

  // Muat sekali dari profiles. cat/bio/address belum ada kolomnya di schema
  // → tetap lokal sampai diputuskan.
  useEffect(() => {
    if (authLoading || initialized.current) return;
    initialized.current = true;
    setF((x) => ({
      ...x,
      name: profile?.store_name ?? "",
      slug: profile?.store_slug ?? "",
      city: profile?.city ?? "",
      phone: profile?.wa_number ?? "",
    }));
  }, [authLoading, profile]);

  const save = async () => {
    if (!user) {
      toast("Sesi berakhir. Masuk lagi.", "bad");
      return;
    }
    const slugNorm = f.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (f.name.trim().length < 3) {
      toast("Nama toko minimal 3 karakter.", "bad");
      return;
    }
    if (!slugNorm) {
      toast("Alamat tautan tidak valid.", "bad");
      return;
    }
    if (f.phone && !isValidWA(f.phone)) {
      toast("Nomor WhatsApp tidak valid. Contoh: 0812xxxxxxx.", "bad");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          store_name: f.name.trim(),
          store_slug: slugNorm,
          city: f.city || null,
          wa_number: f.phone.trim() || null,
        })
        .eq("id", user.id);
      if (error) {
        toast(error.code === "23505" ? "Alamat tautan sudah dipakai toko lain." : "Gagal menyimpan.", "bad");
        return;
      }
      setF((x) => ({ ...x, slug: slugNorm }));
      await refresh();
      toast("Pengaturan toko disimpan.");
    } finally {
      setSaving(false);
    }
  };
  const [notifs, setNotifs] = useState([
    { t: "Pesanan baru", d: "WhatsApp + notifikasi aplikasi", on: true },
    { t: "Pembayaran diterima", d: "Notifikasi aplikasi", on: true },
    { t: "Stok hampir habis", d: "WhatsApp", on: true },
    { t: "Ringkasan jualan mingguan", d: "Email setiap Senin", on: false },
  ]);

  return (
    <AppShell>
      <PageHeader
        index="08"
        kicker="Pengaturan"
        title="Pengaturan toko"
        desc="Informasi yang tampil di halaman publik dan dipakai untuk keperluan pengiriman."
        actions={<Button onClick={save} loading={saving}>Simpan perubahan</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card>
            <CardHead title="Identitas toko" sub="Tampil di halaman toko dan nota" icon="store" />
            <div className="space-y-4">
              <FieldRow cols={2}>
                <Field label="Nama toko" required>
                  <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                </Field>
                <Field label="Alamat tautan" hint="Ubah dengan hati-hati, tautan lama bisa mati.">
                  <div className="flex items-stretch">
                    <span className="flex items-center rounded-l-md border border-r-0 border-line bg-canvas px-3 text-[13.5px] text-faint">
                      tokolink.id/
                    </span>
                    <Input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className="rounded-l-none" />
                  </div>
                </Field>
              </FieldRow>
              <FieldRow cols={2}>
                <Field label="Kategori utama" required>
                  <Select value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}>
                    {["Kue & Snack", "Sambal & Bumbu", "Kopi & Minuman", "Panen & Herbal", "Fashion", "Kerajinan"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Kota asal" required>
                  <Select value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>
                    <option value="">Pilih kota…</option>
                    {["Bandung", "Cimahi", "Jakarta Selatan", "Surabaya", "Yogyakarta"].map((c) => (
                      <option key={c}>{option(c)}</option>
                    ))}
                  </Select>
                </Field>
              </FieldRow>
              <Field label="Deskripsi singkat" hint="Maksimal 200 karakter.">
                <Textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} rows={3} />
              </Field>
              <FieldRow cols={2}>
                <Field label="Nomor WhatsApp" required hint="Contoh: 0812xxxxxxx">
                  <Input
                    value={f.phone}
                    inputMode="tel"
                    onChange={(e) => setF({ ...f, phone: normalizeWA(e.target.value) })}
                    placeholder="0812xxxxxxx"
                  />
                </Field>
                <Field label="Alamat lengkap toko">
                  <Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
                </Field>
              </FieldRow>
            </div>
          </Card>

          <Card>
            <CardHead title="Notifikasi" sub="Kapan TokoLink menghubungi Anda" icon="bell" />
            <ul className="divide-y divide-linesoft">
              {notifs.map((n) => (
                <li key={n.t} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <div className="text-[14.5px] font-bold text-ink">{n.t}</div>
                    <div className="text-[13px] text-muted">{n.d}</div>
                  </div>
                  <Toggle
                    checked={n.on}
                    onChange={(v) => {
                      setNotifs((xs) => xs.map((x) => (x.t === n.t ? { ...x, on: v } : x)));
                      toast("Preferensi notifikasi diperbarui.", "info");
                    }}
                    label={n.t}
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-[#F6CFCF]">
            <CardHead title="Zona berbahaya" sub="Tindakan di sini tidak bisa dibatalkan" icon="alert" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[14.5px] font-bold text-ink">Tutup toko sementara</div>
                <p className="text-[13.5px] text-muted">Halaman toko tetap bisa dibuka, tetapi tombol beli dimatikan.</p>
              </div>
              <Button variant="danger" onClick={() => setClose(true)}>
                Tutup toko
              </Button>
            </div>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="notch rounded-xl border border-line bg-navy-900 p-5 text-white">
            <div className="micro text-brand-300">Paket saat ini</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[24px] font-extrabold">Premium</span>
              <span className="tnum text-[15px] text-white/60">Rp59.000/bln</span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-white/65">
              Perpanjang otomatis 12 Mar 2025. Biaya QRIS 0,5% dan laporan bisa diunduh.
            </p>
            <Segmented
              items={["Bulanan", "Tahunan"]}
              active={plan}
              onChange={(v) => {
                setPlan(v);
                toast(`Paket diubah ke ${v}. Selisih tagihan dihitung otomatis.`, "info");
              }}
            />
            <Button
              className="mt-3 w-full bg-brand-500! text-navy-900! hover:bg-brand-400!"
              onClick={() => toast("Membuka halaman pembayaran langganan…", "info")}
            >
              Ganti paket
            </Button>
          </div>

          <Card>
            <CardHead title="Tautan penting" icon="link" />
            <div className="space-y-2">
              <ButtonLink to={`/s/${f.slug || ""}`} variant="secondary" className="w-full justify-start">
                <Icon name="external" size={16} /> Lihat halaman toko
              </ButtonLink>
              <ButtonLink to="/app/qr" variant="secondary" className="w-full justify-start">
                <Icon name="qr" size={16} /> Unduh QR toko
              </ButtonLink>
              <ButtonLink to="/app/theme" variant="secondary" className="w-full justify-start">
                <Icon name="image" size={16} /> Ubah tampilan toko
              </ButtonLink>
            </div>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={close}
        onClose={() => setClose(false)}
        title="Tutup toko sementara?"
        body="Pembeli tidak bisa membuat pesanan baru selama toko ditutup. Pesanan berjalan tetap diproses seperti biasa, dan Anda bisa membuka kembali kapan saja."
        confirmLabel="Tutup toko"
        onConfirm={() => toast("Toko ditutup sementara. Buka kembali kapan saja di pengaturan.", "warn")}
      />
    </AppShell>
  );
}

function option(c: string) {
  return c;
}

/* ================================== ACCOUNT ================================ */
export function AccountSettings() {
  const { toast } = useApp();
  const { user, profile, loading: authLoading, refresh } = useAuth();
  const [twoFA, setTwoFA] = useState(true);
  const [del, setDel] = useState(false);
  const [owner, setOwner] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (authLoading || initialized.current) return;
    initialized.current = true;
    setOwner(profile?.owner_name ?? "");
    setPhone(profile?.wa_number ?? "");
  }, [authLoading, profile]);

  const initials = (owner.trim() || "S").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const save = async () => {
    if (!user) {
      toast("Sesi berakhir. Masuk lagi.", "bad");
      return;
    }
    if (owner.trim().length < 3) {
      toast("Nama lengkap minimal 3 karakter.", "bad");
      return;
    }
    if (!isValidWA(phone)) {
      toast("Nomor WhatsApp tidak valid. Contoh: 0812xxxxxxx.", "bad");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ owner_name: owner.trim(), wa_number: phone.trim() || null })
        .eq("id", user.id);
      if (error) {
        toast("Gagal menyimpan profil.", "bad");
        return;
      }
      await refresh();
      toast("Profil akun disimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        index="08"
        kicker="Akun"
        title="Profil & keamanan"
        desc="Data pemilik akun. Tidak tampil di halaman toko kecuali nama yang Anda tulis di profil."
        actions={<Button onClick={save} loading={saving}>Simpan profil</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card>
            <CardHead title="Profil" icon="user" />
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex items-start gap-4">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-[26px] font-bold text-brand-300">
                  {initials}
                </span>
                <Button variant="secondary" size="sm" onClick={() => toast("Pilih foto profil baru.", "info")}>
                  Ganti foto
                </Button>
              </div>
              <div className="flex-1 space-y-4">
                <FieldRow cols={2}>
                  <Field label="Nama lengkap" required>
                    <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Nama Anda" />
                  </Field>
                  <Field label="Nama tampilan" hint="Muncul di pesanan dan chat.">
                    <Input defaultValue="" placeholder="Nama panggilan" />
                  </Field>
                </FieldRow>
                <FieldRow cols={2}>
                  <Field label="Email" required>
                    <Input defaultValue={user?.email ?? ""} type="email" readOnly />
                  </Field>
                  <Field label="Nomor WhatsApp" required hint="Contoh: 0812xxxxxxx">
                    <Input
                      value={phone}
                      inputMode="tel"
                      onChange={(e) => setPhone(normalizeWA(e.target.value))}
                      placeholder="0812xxxxxxx"
                    />
                  </Field>
                </FieldRow>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Kata sandi" sub="Terakhir diubah 4 bulan lalu" icon="lock" />
            <div className="grid gap-4 sm:max-w-md">
              <Field label="Kata sandi saat ini" required>
                <Input type="password" placeholder="••••••••" />
              </Field>
              <Field label="Kata sandi baru" required hint="Minimal 8 karakter, campur angka dan huruf.">
                <Input type="password" placeholder="••••••••" />
              </Field>
              <Field label="Ulangi kata sandi baru" required>
                <Input type="password" placeholder="••••••••" />
              </Field>
              <div>
                <Button variant="secondary" onClick={() => toast("Kata sandi berhasil diganti.")}>
                  Ganti kata sandi
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-[#F6CFCF]">
            <CardHead title="Hapus akun" sub="Tindakan ini permanen" icon="alert" />
            <p className="text-[13.5px] leading-relaxed text-muted">
              Menghapus akun akan menurunkan seluruh halaman toko, produk, dan riwayat pesanan. Saldo
              yang masih ada harus ditarik terlebih dahulu.
            </p>
            <Button variant="danger" className="mt-4" onClick={() => setDel(true)}>
              Hapus akun saya
            </Button>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHead title="Keamanan akun" icon="shield" />
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[14.5px] font-bold text-ink">Verifikasi lewat WhatsApp</div>
                <p className="text-[13px] text-muted">Diminta saat login dari perangkat baru.</p>
              </div>
              <Toggle checked={twoFA} onChange={(v) => { setTwoFA(v); toast(v ? "Verifikasi WhatsApp diaktifkan." : "Verifikasi WhatsApp dimatikan.", v ? "ok" : "warn"); }} label="Verifikasi WhatsApp" />
            </div>
          </Card>

          <Card>
            <CardHead title="Perangkat aktif" icon="settings" />
            <ul className="space-y-3.5">
              {[
                ["Samsung A54", "Bandung · aktif sekarang", true],
                ["Chrome di Windows", "Bandung · 11 Feb 2025", false],
                ["iPhone 13", "Jakarta · 2 Feb 2025", false],
              ].map(([d, w, now]) => (
                <li key={String(d)} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13.5px] font-bold text-ink">{d}</div>
                    <div className="text-[12.5px] text-faint">{w}</div>
                  </div>
                  {now ? (
                    <Badge tone="green" dot>
                      Ini perangkat
                    </Badge>
                  ) : (
                    <button className="text-[12.5px] font-semibold text-bad hover:underline">Keluarkan</button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={del}
        onClose={() => setDel(false)}
        title="Hapus akun TokoLink?"
        body="Seluruh toko, produk, dan riwayat pesanan akan dihapus permanen dalam 30 hari. Tindakan ini tidak bisa dibatalkan — pastikan saldo sudah ditarik."
        confirmLabel="Ya, hapus akun"
        onConfirm={() => toast("Permintaan penghapusan akun diterima. Kami mengirim konfirmasi ke email Anda.", "warn")}
      />
    </AppShell>
  );
}

/* ============================== NOTIFICATIONS ============================= */
export function Notifications() {
  const { toast } = useApp();
  const [list, setList] = useState(NOTIFS);
  const [tab, setTab] = useState("semua");

  const shown = list.filter((n) =>
    tab === "semua" ? true : tab === "belum" ? n.unread : tab === "pesanan" ? n.title.toLowerCase().includes("pesanan") || n.title.toLowerCase().includes("pembayaran") : n.tone === "warn",
  );

  return (
    <AppShell>
      <PageHeader
        index="08"
        kicker="Pemberitahuan"
        title="Notifikasi"
        desc="Semua yang terjadi di toko, dari pesanan masuk sampai penarikan dana."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              setList((l) => l.map((n) => ({ ...n, unread: false })));
              toast("Semua notifikasi ditandai sudah dibaca.", "info");
            }}
          >
            Tandai semua dibaca
          </Button>
        }
      />

      <Tabs
        className="mb-4"
        active={tab}
        onChange={setTab}
        items={[
          { id: "semua", label: "Semua", count: list.length },
          { id: "belum", label: "Belum dibaca", count: list.filter((n) => n.unread).length },
          { id: "pesanan", label: "Pesanan & bayar" },
          { id: "sistem", label: "Peringatan sistem" },
        ]}
      />

      {shown.length === 0 ? (
        <EmptyState
          icon="bell"
          title="Tidak ada notifikasi di sini"
          desc="Ketika ada pesanan masuk, pembayaran diterima, atau stok menipis, pemberitahuannya muncul di sini."
          action={
            <Button variant="secondary" onClick={() => setTab("semua")}>
              Lihat semua
            </Button>
          }
        />
      ) : (
        <Card pad={false}>
          <ul className="divide-y divide-linesoft">
            {shown.map((n) => (
              <li
                key={n.id}
                className={cx(
                  "flex gap-3.5 px-4 py-4 transition-colors hover:bg-canvas/70 sm:px-5",
                  n.unread && "bg-brand-50/60",
                )}
              >
                <span
                  className={cx(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-md",
                    n.tone === "ok" ? "bg-oksoft text-ok" : n.tone === "warn" ? "bg-warnsoft text-warn" : "bg-brand-50 text-brand-600",
                  )}
                >
                  <Icon name={n.tone === "ok" ? "checkCircle" : n.tone === "warn" ? "alert" : "receipt"} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[14.5px] font-bold text-ink">{n.title}</span>
                    <span className="micro text-faint">{n.time}</span>
                  </div>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{n.body}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {n.title.includes("Pesanan") && (
                      <Button size="sm" variant="secondary" onClick={() => navigate("/app/orders/TL-2502-0192")}>
                        Lihat pesanan
                      </Button>
                    )}
                    {n.title.includes("stok") && (
                      <Button size="sm" variant="secondary" onClick={() => navigate("/app/products/p4/edit")}>
                        Perbarui stok
                      </Button>
                    )}
                    {n.unread && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setList((l) => l.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
                      >
                        Tandai dibaca
                      </Button>
                    )}
                  </div>
                </div>
                {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </AppShell>
  );
}
