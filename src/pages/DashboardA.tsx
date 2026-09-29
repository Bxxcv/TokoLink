import { useEffect, useState } from "react";
import { navigate } from "../lib/router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import {
  DAY_LABELS,
  FUNNEL,
  HOURLY,
  ORDERS,
  SALES_30,
  SOURCES,
  STATUS_LABEL,
  TOP_PRODUCTS,
  VISITORS_30,
  angka,
  rupiah,
  rupiahShort,
  useApp,
  type Order,
  type OrderStatus,
} from "../lib/data";
import { AppShell } from "../components/layout";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHead,
  Checkbox,
  ConfirmDialog,
  Delta,
  Dropdown,
  EmptyState,
  ErrorState,
  Field,
  FieldRow,
  Icon,
  Input,
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
import {
  BarChart,
  BarRows,
  ChartFrame,
  ChartSkeleton,
  Donut,
  Funnel,
  Legend,
  LineChart,
  Sparkline,
  useFakeLoad,
} from "../components/charts";
import { CATEGORIES, type Product } from "../lib/data";
import { digitsOnly, formatRibuan } from "../lib/format";
import { mapProduct, type DbProduct } from "../lib/products";

/* -------------------------------- stat card -------------------------------- */
export function StatCard({
  label,
  value,
  delta,
  hint,
  spark,
  action,
  loading = false,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  spark?: number[];
  action?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="micro text-faint">{label}</span>
        {delta !== undefined && <Delta value={delta} />}
      </div>
      {loading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      ) : (
        <>
          <div className="tnum mt-2.5 text-[26px] font-bold leading-none text-ink">{value}</div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <span className="text-[12.5px] text-muted">{hint}</span>
            {spark && <Sparkline values={spark} />}
          </div>
          {action && <div className="mt-3.5 border-t border-linesoft pt-3">{action}</div>}
        </>
      )}
    </div>
  );
}

/* ================================ OVERVIEW ================================ */
export function DashboardHome() {
  const { toast } = useApp();
  const { profile } = useAuth();
  const firstName = profile?.owner_name?.trim().split(" ")[0] || "Seller";
  const storeSlug = profile?.store_slug || "";
  const loading = useFakeLoad([], 700);
  const [check, setCheck] = useState([true, true, false, false]);
  const done = check.filter(Boolean).length;

  return (
    <AppShell>
      <PageHeader
        index="01"
        kicker="Beranda"
        title={`Selamat pagi, ${firstName}.`}
        desc="Ringkasan toko 30 hari terakhir. Diperbarui 12 Feb 2025, 09:44 WIB."
        actions={
          <>
            <ButtonLink to={`/s/${storeSlug}`} variant="secondary">
              <Icon name="external" size={16} /> Lihat toko
            </ButtonLink>
            <ButtonLink to="/app/products/new">
              <Icon name="plus" size={16} /> Tambah produk
            </ButtonLink>
          </>
        }
      />

      {/* attention banner */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#F3DDba] bg-warnsoft p-4 sm:flex-row sm:items-center">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-warn">
          <Icon name="alert" size={19} />
        </span>
        <div className="flex-1">
          <div className="text-[14.5px] font-bold text-ink">Ada 3 hal yang perlu diperhatikan</div>
          <p className="text-[13.5px] text-muted">
            1 pesanan menunggu bayar lebih dari 3 jam, Madu Hutan stok habis, jam buka Minggu belum diatur.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            navigate("/app/orders");
            toast("Menampilkan pesanan menunggu bayar.", "info");
          }}
        >
          Urus sekarang
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Omzet 30 hari"
          value="Rp38.420.000"
          delta={18}
          hint="vs 30 hari sebelumnya"
          spark={SALES_30.slice(-12)}
          loading={loading}
        />
        <StatCard label="Pesanan" value="142" delta={11} hint="3 perlu diproses" spark={VISITORS_30.slice(-12)} loading={loading} />
        <StatCard label="Pengunjung" value="2.390" delta={27} hint="62% dari tautan bio" spark={FUNNEL.map((f) => f.value)} loading={loading} />
        <StatCard
          label="Saldo tersedia"
          value="Rp4.280.000"
          hint="Bisa ditarik kapan saja"
          loading={loading}
          action={
            <ButtonLink to="/app/withdraw" variant="link">
              Tarik dana sekarang
            </ButtonLink>
          }
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" pad={false}>
          <div className="p-4 sm:p-5">
            <ChartFrame
              title="Omzet harian"
              hint="30 hari terakhir · dalam ribuan rupiah"
              legend={<Legend items={[{ color: "#0A69C4", label: "Omzet" }]} />}
              right={
                <ButtonLink to="/app/analytics" variant="ghost" size="sm">
                  Lihat analitik <Icon name="right" size={14} />
                </ButtonLink>
              }
            >
              {loading ? (
                <ChartSkeleton />
              ) : (
                <LineChart
                  series={SALES_30}
                  labels={DAY_LABELS}
                  format={(v) => (v >= 1000 ? `${Math.round(v / 1000)}rb` : String(v))}
                />
              )}
            </ChartFrame>
          </div>
          <div className="grid gap-px border-t border-line bg-line sm:grid-cols-3">
            {[
              ["Rata-rata per hari", "Rp1.280.667"],
              ["Hari tersibuk", "Sabtu"],
              ["Nilai rata-rata pesanan", "Rp136.000"],
            ].map(([l, v]) => (
              <div key={l} className="bg-white px-4 py-3.5">
                <div className="micro text-faint">{l}</div>
                <div className="tnum mt-1 text-[16px] font-bold text-ink">{v}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {/* setup checklist */}
          <Card>
            <CardHead
              title="Lengkapi toko Anda"
              sub={`${done} dari ${check.length} langkah selesai`}
              icon="checkCircle"
              action={<span className="tnum text-[13px] font-bold text-brand-700">{Math.round((done / check.length) * 100)}%</span>}
            />
            <Progress value={(done / check.length) * 100} />
            <ul className="mt-4 space-y-3">
              {[
                "Unggah foto profil & sampul toko",
                "Tambahkan minimal 5 produk",
                "Atur jam buka toko",
                "Cetak QR toko untuk kasir",
              ].map((t, i) => (
                <li key={t}>
                  <Checkbox checked={check[i]} onChange={(v) => setCheck((c) => c.map((x, j) => (j === i ? v : x)))}>
                    <span className={cx(check[i] && "line-through text-faint")}>{t}</span>
                  </Checkbox>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHead title="Pesanan terbaru" icon="receipt" action={<ButtonLink to="/app/orders" variant="link">Semua</ButtonLink>} />
            <ul className="-mt-1 space-y-3">
              {ORDERS.slice(0, 4).map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => navigate(`/app/orders/${o.id}`)}
                    className="group flex w-full items-center gap-3 rounded-md px-1 py-1.5 text-left transition-colors hover:bg-canvas"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-ink">{o.customer}</span>
                      <span className="tnum block text-[12px] text-faint">{o.id}</span>
                    </span>
                    <span className="text-right">
                      <span className="tnum block text-[13.5px] font-bold text-ink">{rupiah(o.total)}</span>
                      <span
                        className={cx(
                          "block text-[11.5px] font-semibold",
                          o.status === "menunggu" ? "text-warn" : o.status === "batal" ? "text-bad" : "text-brand-700",
                        )}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* top products */}
      <Card className="mt-4">
        <CardHead
          title="Produk paling laris"
          sub="Berdasarkan jumlah terjual, 30 hari terakhir"
          icon="star"
          action={<ButtonLink to="/app/products" variant="link">Kelola produk</ButtonLink>}
        />
        <BarRows
          data={TOP_PRODUCTS.map((t) => ({ label: t.label, value: t.value, note: rupiah(t.revenue) + " omzet" }))}
          format={(v) => `${v} terjual`}
        />
      </Card>
    </AppShell>
  );
}

/* ================================ ANALYTICS =============================== */
export function Analytics() {
  const { toast } = useApp();
  const [period, setPeriod] = useState("30 hari");
  const [failed, setFailed] = useState(false);
  const loading = useFakeLoad([period], 600);

  const mul = period === "7 hari" ? 0.26 : period === "90 hari" ? 2.8 : 1;
  const series = SALES_30.map((v) => Math.round(v * mul));

  return (
    <AppShell>
      <PageHeader
        index="02"
        kicker="Analitik"
        title="Analitik penjualan"
        desc="Angka yang bisa langsung dipakai mengambil keputusan: berapa omzet, kapan ramai, produk mana yang laku."
        actions={
          <>
            <Segmented items={["7 hari", "30 hari", "90 hari"]} active={period} onChange={setPeriod} />
              <Button variant="secondary" onClick={() => toast("Laporan Excel sedang disiapkan, akan dikirim ke email Anda.", "info")}>
              <Icon name="download" size={16} /> Unduh Excel
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Omzet" value={rupiah(38420000 * mul)} delta={18} hint="Setelah potongan diskon" loading={loading} />
        <StatCard label="Pesanan" value={angka(Math.round(142 * mul))} delta={11} hint="1,9% dibatalkan" loading={loading} />
        <StatCard label="Rata-rata nilai pesanan" value={rupiah(270563)} delta={6} hint="Naik karena paket hampers" loading={loading} />
        <StatCard label="Konversi" value="3,8%" delta={-3} hint="Pengunjung → pesanan" loading={loading} />
      </div>

      <Card className="mt-4">
        <ChartFrame
          title={`Omzet ${period}`}
          hint="Geser kursor pada grafik untuk melihat angka per hari"
          legend={<Legend items={[{ color: "#0A69C4", label: "Omzet" }, { color: "#1B9AE0", label: "Pengunjung" }]} />}
          right={
            <button
              onClick={() => setFailed((f) => !f)}
              className="micro text-faint underline underline-offset-4 hover:text-brand-700"
            >
              {failed ? "Coba lagi" : "Simulasi gangguan"}
            </button>
          }
        >
          {failed ? (
            <ErrorState onRetry={() => setFailed(false)} desc="Laporan omzet gagal dimuat dari server. Filter periode tetap tersimpan." />
          ) : loading ? (
            <ChartSkeleton height={220} />
          ) : (
            <div className="space-y-2">
              <LineChart series={series} labels={DAY_LABELS} height={150} format={rupiahShort} />
              <LineChart
                series={VISITORS_30.map((v) => Math.round(v * mul))}
                labels={DAY_LABELS}
                height={110}
                color="#1B9AE0"
                format={(v) => String(v)}
                yTicks={3}
              />
            </div>
          )}
        </ChartFrame>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <ChartFrame title="Pesanan per hari" hint="Jumlah pesanan masuk, bukan nilai">
            {loading ? <ChartSkeleton /> : (
              <BarChart
                data={DAY_LABELS.slice(-14).map((l, i) => ({ label: l, value: Math.max(1, Math.round((SALES_30.slice(-14)[i] / 1400) * 12)) }))}
                format={(v) => String(v)}
              />
            )}
          </ChartFrame>
        </Card>

        <Card>
          <ChartFrame title="Status pesanan" hint="142 pesanan pada periode ini">
            <Donut
              centerValue="142"
              centerLabel="pesanan"
              items={[
                { label: "Selesai", value: 104, color: "#0E9F6E" },
                { label: "Sedang dikirim", value: 18, color: "#0A69C4" },
                { label: "Dikemas", value: 11, color: "#1B9AE0" },
                { label: "Menunggu bayar", value: 5, color: "#B45309" },
                { label: "Dibatalkan", value: 4, color: "#C62828" },
              ]}
            />
          </ChartFrame>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHead title="Produk terlaris" sub="Peringkat berdasarkan jumlah terjual" icon="box" />
        <BarRows data={TOP_PRODUCTS.map((t) => ({ label: t.label, value: t.value, note: rupiahShort(t.revenue) }))} format={(v) => `${v} pcs`} />
      </Card>

      <Card className="mt-4" pad={false}>
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <CardHead title="Rekap mingguan" sub="Siap dilaporkan ke pembukuan" />
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Minggu</Th>
              <Th className="text-right">Pesanan</Th>
              <Th className="text-right">Omzet</Th>
              <Th className="text-right">Diskon</Th>
              <Th className="text-right">Pengunjung</Th>
              <Th className="text-right">Konversi</Th>
            </tr>
          </thead>
          <tbody>
            {[
              ["6 – 12 Feb", 38, 10420000, 336000, 641, "5,9%"],
              ["30 Jan – 5 Feb", 34, 9180000, 224000, 588, "5,8%"],
              ["23 – 29 Jan", 31, 8640000, 168000, 552, "5,6%"],
              ["16 – 22 Jan", 25, 6730000, 112000, 461, "5,4%"],
              ["9 – 15 Jan", 14, 3450000, 84000, 148, "9,5%"],
            ].map(([w, o, omz, disc, vis, conv]) => (
              <tr key={String(w)} className="transition-colors hover:bg-canvas/70">
                <Td className="font-semibold text-ink">{w}</Td>
                <Td className="tnum text-right">{o}</Td>
                <Td className="tnum text-right font-semibold">{rupiah(Number(omz))}</Td>
                <Td className="tnum text-right text-warn">−{rupiah(Number(disc))}</Td>
                <Td className="tnum text-right">{vis}</Td>
                <Td className="tnum text-right font-semibold text-brand-700">{conv}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        <div className="flex items-center justify-between px-4 py-3.5 text-[12.5px] text-faint sm:px-5">
          <span>Menampilkan 5 dari 5 minggu</span>
          <span className="micro">Sumber: TokoLink Analytics</span>
        </div>
      </Card>
    </AppShell>
  );
}

/* ================================= TRAFFIC ================================ */
export function Traffic() {
  const [period, setPeriod] = useState("30 hari");
  const loading = useFakeLoad([period], 550);

  return (
    <AppShell>
      <PageHeader
        index="03"
        kicker="Pengunjung"
        title="Pengunjung & lalu lintas"
        desc="Dari mana pembeli datang, kapan mereka berkunjung, dan di mana mereka berhenti."
        actions={<Segmented items={["7 hari", "30 hari", "90 hari"]} active={period} onChange={setPeriod} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pengunjung" value="2.390" delta={27} hint="1.436 lihat produk" loading={loading} />
        <StatCard label="Masuk keranjang" value="418" delta={14} hint="17,5% dari pengunjung" loading={loading} />
        <StatCard label="Checkout" value="172" delta={9} hint="142 berhasil bayar" loading={loading} />
        <StatCard label="Konversi" value="3,8%" delta={-3} hint="Turun 0,1 poin" loading={loading} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ChartFrame
            title="Pengunjung harian"
            hint={`30 hari terakhir · total 2.390 kunjungan`}
            legend={<Legend items={[{ color: "#1B9AE0", label: "Pengunjung" }]} />}
          >
            {loading ? <ChartSkeleton /> : <LineChart series={VISITORS_30} labels={DAY_LABELS} color="#1B9AE0" format={(v) => String(v)} />}
          </ChartFrame>
        </Card>

        <Card>
          <CardHead title="Sumber pengunjung" sub="Bagaimana pembeli menemukan toko" icon="link" />
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : (
            <BarRows data={SOURCES.map((s) => ({ label: s.label, value: s.visitors, note: `${s.value}% dari total` }))} color="#0A69C4" />
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHead title="Perjalanan sampai pesanan" sub="Berapa banyak yang lolos di tiap langkah" icon="layers" />
          {loading ? <ChartSkeleton height={180} /> : <Funnel items={FUNNEL} />}
          <div className="mt-4 rounded-md bg-canvas p-3.5">
            <div className="flex items-start gap-2.5">
              <Icon name="info" size={16} className="mt-0.5 shrink-0 text-brand-600" />
              <p className="text-[13px] leading-relaxed text-muted">
                Penurunan terbesar ada di langkah <strong className="text-ink">lihat produk → keranjang</strong>.
                Tambahkan foto lebih banyak dan tombol “beli” yang jelas untuk menaikkan angka ini.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <ChartFrame title="Jam paling ramai" hint="Rata-rata pengunjung per jam (WIB)">
            {loading ? <ChartSkeleton height={170} /> : <BarChart data={HOURLY.map((v, i) => ({ label: `${i}`, value: v }))} format={(v) => String(v)} color="#0B2E6E" />}
          </ChartFrame>
          <p className="mt-2 text-[12.5px] text-muted">
            Ramai pukul <span className="tnum font-semibold text-ink">19.00–20.00</span>. Waktu terbaik
            memasang promosi.
          </p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <ChartFrame title="Perangkat" hint="Pengunjung berdasarkan jenis layar">
            <Donut
              centerValue="82%"
              centerLabel="lewat HP"
              items={[
                { label: "HP Android", value: 1734, color: "#0A69C4" },
                { label: "iPhone", value: 226, color: "#1B9AE0" },
                { label: "Desktop", value: 287, color: "#0B2E6E" },
                { label: "Lainnya", value: 143, color: "#B45309" },
              ]}
            />
          </ChartFrame>
        </Card>

        <Card>
          <CardHead title="Sumber berbayar" sub="Iklan & promosi berbayar" icon="send" />
          <EmptyState
            icon="chart"
            title="Belum ada data"
            desc="Anda belum memasang tautan iklan berbayar. Saat ada yang datang dari iklan, angkanya muncul di sini."
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate("/app/bio")}>
                Atur tautan promosi
              </Button>
            }
          />
        </Card>
      </div>
    </AppShell>
  );
}

/* ================================ PRODUCTS ================================ */
export function Products() {
  const { toast } = useApp();
  const { user, profile } = useAuth();
  const slug = profile?.store_slug ?? "";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const [status, setStatus] = useState("Semua status");
  const [del, setDel] = useState<Product | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(false);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      setLoadError(true);
      return;
    }
    setItems(((data ?? []) as DbProduct[]).map(mapProduct));
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const duplicate = async (p: Product) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("products")
      .insert({
        seller_id: user.id,
        name: `${p.name} (salinan)`,
        category: p.cat,
        price: p.price,
        unit: p.unit || null,
        image_url: p.img.startsWith("images/") ? null : p.img,
        stock: p.stock,
        sku: p.sku || null,
        status: "nonaktif",
        weight_gram: p.weight,
        description: p.desc || null,
      })
      .select("*")
      .single();
    if (error || !data) {
      toast("Gagal menduplikat produk.", "bad");
      return;
    }
    setItems((xs) => [mapProduct(data as DbProduct), ...xs]);
    toast(`“${p.name}” diduplikat sebagai draf.`);
  };

  const confirmDelete = async () => {
    if (!del) return;
    const target = del;
    setDel(null);
    const { error } = await supabase.from("products").delete().eq("id", target.id);
    if (error) {
      toast("Produk gagal dihapus.", "bad");
      return;
    }
    setItems((xs) => xs.filter((p) => p.id !== target.id));
    toast("Produk dihapus.", "warn");
  };

  const rows = items.filter(
    (p) =>
      (cat === "Semua" || p.cat === cat) &&
      (status === "Semua status" || (status === "Aktif" ? p.status === "aktif" : p.status === "nonaktif")) &&
      (p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())),
  );
  const isPristine = items.length === 0 && q === "" && cat === "Semua" && status === "Semua status";

  return (
    <AppShell>
      <PageHeader
        index="04"
        kicker="Produk"
        title="Produk"
        desc={`${items.length} produk di toko Anda, ${items.filter((p) => p.stock === 0).length} di antaranya stok habis.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => toast("Impor produk dari CSV belum aktif di prototipe.", "info")}>
              <Icon name="download" size={16} /> Impor
            </Button>
            <ButtonLink to="/app/products/new">
              <Icon name="plus" size={16} /> Tambah produk
            </ButtonLink>
          </>
        }
      />

      <Card pad={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:px-5">
          <div className="relative flex-1">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau SKU produk…" className="h-10 pl-9" />
          </div>
          <div className="flex gap-2">
            <Select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 text-[13.5px]">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-36 text-[13.5px]">
              {["Semua status", "Aktif", "Nonaktif"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-4 sm:p-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-2/3" />
          </div>
        ) : loadError ? (
          <div className="p-4 sm:p-5">
            <ErrorState onRetry={load} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              icon={isPristine ? "box" : "search"}
              title={isPristine ? "Belum ada produk" : "Tidak ada produk yang cocok"}
              desc={
                isPristine
                  ? "Tambahkan produk pertama agar toko Anda bisa mulai menerima pesanan."
                  : `Pencarian “${q}” pada kategori ${cat} tidak menemukan apa pun. Ubah kata kunci atau filternya.`
              }
              action={
                isPristine ? (
                  <ButtonLink to="/app/products/new">
                    <Icon name="plus" size={16} /> Tambah produk pertama
                  </ButtonLink>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQ("");
                      setCat("Semua");
                      setStatus("Semua status");
                    }}
                  >
                    Reset filter
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden sm:block">
              <TableWrap>
                <thead>
                  <tr>
                    <Th className="w-14">Foto</Th>
                    <Th>Produk</Th>
                    <Th className="text-right">Harga</Th>
                    <Th className="text-right">Stok</Th>
                    <Th className="text-right">Terjual</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="group transition-colors hover:bg-canvas/70">
                      <Td>
                        <img src={p.img} alt="" className="h-11 w-11 rounded-md border border-line object-cover" />
                      </Td>
                      <Td>
                        <button onClick={() => navigate(`/app/products/${p.id}/edit`)} className="text-left">
                          <div className="text-[14px] font-bold text-ink group-hover:text-brand-700">{p.name}</div>
                          <div className="tnum text-[12px] text-faint">
                            {p.sku} · {p.cat}
                          </div>
                        </button>
                      </Td>
                      <Td className="tnum text-right font-semibold">{rupiah(p.price)}</Td>
                      <Td className="text-right">
                        <span
                          className={cx(
                            "tnum text-[13.5px] font-semibold",
                            p.stock === 0 ? "text-bad" : p.stock <= 15 ? "text-warn" : "text-ink",
                          )}
                        >
                          {p.stock}
                        </span>
                      </Td>
                      <Td className="tnum text-right">{p.sold}</Td>
                      <Td>
                        <Badge tone={p.status === "aktif" ? "green" : "gray"} dot>
                          {p.status === "aktif" ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1">
                          {[
                            { i: "eye", label: "Lihat di toko", go: () => navigate(`/s/${slug}/p/${p.id}`) },
                            { i: "edit", label: "Edit produk", go: () => navigate(`/app/products/${p.id}/edit`) },
                            { i: "copy", label: "Duplikat produk", go: () => duplicate(p) },
                            { i: "trash", label: "Hapus produk", go: () => setDel(p) },
                          ].map((a) => (
                            <button
                              key={a.i}
                              onClick={(e) => {
                                e.stopPropagation();
                                a.go();
                              }}
                              title={a.label}
                              aria-label={a.label}
                              className={cx(
                                "rounded-md p-2 transition-colors duration-150",
                                a.i === "trash"
                                  ? "text-faint hover:bg-badsoft hover:text-bad"
                                  : "text-faint hover:bg-brand-50 hover:text-brand-700",
                              )}
                            >
                              <Icon name={a.i} size={16} />
                            </button>
                          ))}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>

            {/* mobile cards */}
            <ul className="divide-y divide-linesoft sm:hidden">
              {rows.map((p) => (
                <li key={p.id} className="flex gap-3 p-4">
                  <img src={p.img} alt="" className="h-16 w-16 rounded-md border border-line object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => navigate(`/app/products/${p.id}/edit`)} className="text-left">
                        <div className="text-[14.5px] font-bold leading-snug text-ink">{p.name}</div>
                        <div className="tnum text-[12px] text-faint">{p.sku}</div>
                      </button>
                      <Dropdown
                        trigger={() => (
                          <span className="rounded-md p-1.5 text-faint">
                            <Icon name="more" size={18} />
                          </span>
                        )}
                        items={[
                          { label: "Edit produk", icon: "edit", onClick: () => navigate(`/app/products/${p.id}/edit`) },
                          { label: "Lihat di toko", icon: "eye", onClick: () => navigate(`/s/${slug}/p/${p.id}`) },
                          { label: "Hapus produk", icon: "trash", danger: true, sep: true, onClick: () => setDel(p) },
                        ]}
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[13px]">
                      <span className="tnum font-bold text-brand-700">{rupiah(p.price)}</span>
                      <span className={cx("tnum", p.stock === 0 ? "text-bad" : "text-muted")}>stok {p.stock}</span>
                      <span className="tnum text-faint">terjual {p.sold}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-[13px] text-muted sm:px-5">
          <span>
            Menampilkan <span className="tnum font-semibold text-ink">{rows.length}</span> dari{" "}
            <span className="tnum">{items.length}</span> produk
          </span>
          <div className="flex items-center gap-1.5">
            <button disabled className="rounded-md border border-line px-2.5 py-1.5 text-faint disabled:opacity-45">
              <Icon name="left" size={14} />
            </button>
            <span className="tnum rounded-md bg-navy-800 px-3 py-1.5 text-[13px] font-bold text-white">1</span>
            <button disabled className="rounded-md border border-line px-2.5 py-1.5 text-faint disabled:opacity-45">
              <Icon name="right" size={14} />
            </button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title={`Hapus “${del?.name ?? ""}”?`}
        body="Produk akan dihapus permanen beserta riwayat tampilannya. Pesanan lama tetap tersimpan. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus permanen"
        onConfirm={confirmDelete}
      />
    </AppShell>
  );
}

/* ============================== PRODUCT FORM ============================== */
export function ProductForm({ id }: { id?: string }) {
  const { toast } = useApp();
  const { user } = useAuth();
  const editing = !!id;
  const [existing, setExisting] = useState<Product | null>(null);
  const [loading, setLoading] = useState(editing);
  const [f, setF] = useState({
    name: "",
    cat: "Kue & Snack",
    price: "",
    stock: "",
    sku: "",
    weight: "500",
    desc: "",
    active: true,
    showStock: true,
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      setLoading(false);
      if (error || !data) {
        toast("Produk tidak ditemukan.", "bad");
        navigate("/app/products");
        return;
      }
      const mapped = mapProduct(data as DbProduct);
      setExisting(mapped);
      setF({
        name: mapped.name,
        cat: mapped.cat,
        price: String(mapped.price),
        stock: String(mapped.stock),
        sku: mapped.sku,
        weight: String(mapped.weight),
        desc: mapped.desc,
        active: mapped.status !== "nonaktif",
        showStock: true,
      });
    })();
  }, [id]);

  const save = async () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 4) e.name = "Nama produk minimal 4 karakter.";
    if (!f.price || Number(f.price) <= 0) e.price = "Masukkan harga jual.";
    if (f.stock === "") e.stock = "Isi stok, boleh 0.";
    setErr(e);
    if (Object.keys(e).length) {
      toast("Lengkapi isian yang ditandai merah.", "bad");
      return;
    }
    if (!user) {
      toast("Sesi berakhir. Masuk lagi.", "bad");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        seller_id: user.id,
        name: f.name.trim(),
        category: f.cat,
        price: Number(f.price),
        stock: Number(f.stock),
        sku: f.sku.trim() || null,
        weight_gram: f.weight === "" ? null : Number(f.weight),
        description: f.desc.trim() || null,
        status: f.active ? "aktif" : "nonaktif",
        ...(editing ? {} : { unit: null, image_url: null }),
      };
      const { error } = editing
        ? await supabase.from("products").update(payload).eq("id", id)
        : await supabase.from("products").insert(payload);
      if (error) {
        toast("Gagal menyimpan produk.", "bad");
        return;
      }
      toast(editing ? "Perubahan produk disimpan." : "Produk baru berhasil ditambahkan.");
      navigate("/app/products");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl space-y-3 py-10">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        index="04"
        kicker={editing ? "Edit produk" : "Tambah produk"}
        title={editing ? f.name || "Edit produk" : "Tambah produk baru"}
        desc={
          editing
            ? "Perubahan langsung terlihat oleh pembeli setelah disimpan."
            : "Isi yang penting dulu: nama, foto, harga, dan stok. Sisanya bisa menyusul."
        }
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate("/app/products")}>
              Batal
            </Button>
            <Button variant="secondary" loading={saving} onClick={save}>
              Simpan sebagai draf
            </Button>
          </>
        }
      />

      <form
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="space-y-4">
          <Card>
            <CardHead title="Informasi produk" sub="Yang pembeli baca pertama kali" icon="tag" />
            <div className="space-y-4">
              <Field label="Nama produk" required error={err.name}>
                <Input
                  value={f.name}
                  invalid={!!err.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Contoh: Kue Lapis Legit 380g"
                />
              </Field>
              <FieldRow cols={2}>
                <Field label="Kategori" required>
                  <Select value={f.cat} onChange={(e) => set("cat", e.target.value)}>
                    {CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Kode produk (SKU)" hint="Untuk pencatatan sendiri">
                  <Input value={f.sku} onChange={(e) => set("sku", e.target.value)} placeholder="LL-380" />
                </Field>
              </FieldRow>
              <Field label="Deskripsi" hint="Cara penyimpanan, level pedas, atau isinya apa.">
                <Textarea
                  value={f.desc}
                  onChange={(e) => set("desc", e.target.value)}
                  placeholder="Tulis seperti menjelaskan ke pembeli di depan toko…"
                  rows={5}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHead title="Foto produk" sub="Maksimal 6 foto, format JPG atau PNG" icon="image" />
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              <div className="relative overflow-hidden rounded-md border border-line">
                <img
                  src={existing?.img ?? "images/p-lapis.jpg"}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <span className="micro absolute left-0 top-0 bg-brand-600 px-1.5 py-0.5 text-white">Utama</span>
              </div>
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toast("Pilih foto dari galeri perangkat.", "info")}
                  className="grid aspect-square place-items-center rounded-md border border-dashed border-[#CBD7E7] bg-canvas text-faint transition-colors hover:border-brand-400 hover:text-brand-600"
                >
                  <Icon name="plus" size={18} />
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead title="Harga & stok" sub="Angka yang menentukan pesanan masuk" icon="wallet" />
            <FieldRow cols={3}>
                <Field label="Harga jual" required error={err.price}>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-faint">Rp</span>
                    <Input
                      value={formatRibuan(f.price)}
                      invalid={!!err.price}
                      inputMode="numeric"
                      onChange={(e) => set("price", digitsOnly(e.target.value))}
                      placeholder="85.000"
                      className="tnum pl-9"
                    />
                  </div>
                </Field>
              <Field label="Stok tersedia" required error={err.stock}>
                <Input
                  value={f.stock}
                  invalid={!!err.stock}
                  inputMode="numeric"
                  onChange={(e) => set("stock", e.target.value.replace(/\D/g, ""))}
                  placeholder="12"
                  className="tnum"
                />
              </Field>
              <Field label="Berat kirim (gram)" hint="Untuk hitung ongkir">
                <Input
                  value={f.weight}
                  inputMode="numeric"
                  onChange={(e) => set("weight", e.target.value.replace(/\D/g, ""))}
                  className="tnum"
                />
              </Field>
            </FieldRow>
            <div className="mt-4 space-y-3 rounded-md bg-canvas p-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13.5px] text-muted">Tampilkan sisa stok ke pembeli</span>
                <Toggle checked={f.showStock} onChange={(v) => set("showStock", v)} label="Tampilkan stok" />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                <span className="text-[13.5px] text-muted">Produk aktif di toko</span>
                <Toggle checked={f.active} onChange={(v) => set("active", v)} label="Produk aktif" />
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-line bg-white p-4 shadow-card">
            <div className="micro mb-3 text-brand-600">Pratinjau di toko</div>
            <div className="overflow-hidden rounded-lg border border-line">
              <img
                src={existing?.img ?? "images/p-lapis.jpg"}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-3">
                <div className="micro text-faint">{f.cat}</div>
                <div className="mt-1 text-[14px] font-bold text-ink">{f.name || "Nama produk"}</div>
                <div className="tnum mt-1 text-[15px] font-bold text-brand-700">
                  {rupiah(Number(f.price || 0))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white p-4 shadow-card">
            <CardHead title="Tips singkat" icon="info" />
            <ul className="space-y-2.5 text-[13px] leading-relaxed text-muted">
              <li className="flex gap-2">
                <Icon name="check" size={14} className="mt-1 shrink-0 text-brand-600" strokeWidth={2.6} />
                Foto terang dengan satu warna latar lebih menarik.
              </li>
              <li className="flex gap-2">
                <Icon name="check" size={14} className="mt-1 shrink-0 text-brand-600" strokeWidth={2.6} />
                Tulis ukuran pada nama, misalnya “380g” atau “isi 10”.
              </li>
              <li className="flex gap-2">
                <Icon name="check" size={14} className="mt-1 shrink-0 text-brand-600" strokeWidth={2.6} />
                Stok 0 membuat produk tetap tampil, tapi tombol beli mati.
              </li>
            </ul>
          </div>
        </aside>

        {/* sticky save bar */}
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-white/97 px-4 py-3 backdrop-blur-sm lg:bottom-0 lg:left-[248px] lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <span className="hidden text-[13px] text-muted sm:block">
              {f.name ? `Perubahan belum disimpan untuk “${f.name}”` : "Belum ada perubahan"}
            </span>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button type="button" variant="secondary" onClick={() => navigate("/app/products")} className="flex-1 sm:flex-none">
                Batal
              </Button>
              <Button type="submit" loading={saving} className="flex-1 sm:flex-none">
                {editing ? "Simpan perubahan" : "Simpan produk"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AppShell>
  );
}

/* ================================= ORDERS ================================= */
export function Orders() {
  const [tab, setTab] = useState("semua");
  const [q, setQ] = useState("");
  const { user, profile } = useAuth();
  const storeSlug = profile?.store_slug || "";
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(false);
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id,buyer_name,buyer_city,total,status,channel,created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    if (error || !orders) {
      setLoading(false);
      setLoadError(true);
      return;
    }
    const ids = orders.map((o) => o.id);
    const { data: items } = ids.length
      ? await supabase.from("order_items").select("order_id,product_name_snapshot,qty").in("order_id", ids)
      : { data: [] as { order_id: string; product_name_snapshot: string; qty: number }[] };
    const byOrder = new Map<string, { product_name_snapshot: string; qty: number }[]>();
    ((items ?? []) as { order_id: string; product_name_snapshot: string; qty: number }[]).forEach((it) => {
      const arr = byOrder.get(it.order_id) ?? [];
      arr.push(it);
      byOrder.set(it.order_id, arr);
    });
    setRows(
      orders.map((o) => {
        const list = byOrder.get(o.id) ?? [];
        return {
          id: o.id,
          customer: o.buyer_name,
          city: o.buyer_city ?? "",
          items: list.map((i) => `${i.product_name_snapshot} ×${i.qty}`).join(", ") || "—",
          qty: list.reduce((s, i) => s + i.qty, 0),
          total: Number(o.total),
          status: o.status as OrderStatus,
          date: new Date(o.created_at).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          channel: o.channel ?? "—",
        };
      }),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const counts = {
    semua: rows.length,
    menunggu: rows.filter((o) => o.status === "menunggu").length,
    dikemas: rows.filter((o) => o.status === "dikemas").length,
    dikirim: rows.filter((o) => o.status === "dikirim").length,
    selesai: rows.filter((o) => o.status === "selesai").length,
    refund: rows.filter((o) => o.status === "batal").length,
  };
  const filtered = rows.filter(
    (o) =>
      (tab === "semua" || o.status === tab || (tab === "refund" && o.status === "batal")) &&
      (o.customer.toLowerCase().includes(q.toLowerCase()) || o.id.toLowerCase().includes(q.toLowerCase())),
  );
  const isPristine = rows.length === 0 && q === "" && tab === "semua";

  return (
    <AppShell>
      <PageHeader
        index="05"
        kicker="Pesanan"
        title="Pesanan"
        desc="3 pesanan perlu diproses hari ini. Pesanan masuk otomatis setelah pembayaran terkonfirmasi."
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()}>
              <Icon name="download" size={16} /> Cetak daftar
            </Button>
            <ButtonLink to={`/s/${storeSlug}`} variant="secondary">
              <Icon name="external" size={16} /> Lihat toko
            </ButtonLink>
          </>
        }
      />

      <Tabs
        className="mb-4"
        active={tab}
        onChange={setTab}
        items={[
          { id: "semua", label: "Semua", count: counts.semua },
          { id: "menunggu", label: "Menunggu bayar", count: counts.menunggu },
          { id: "dikemas", label: "Dikemas", count: counts.dikemas },
          { id: "dikirim", label: "Dikirim", count: counts.dikirim },
          { id: "selesai", label: "Selesai", count: counts.selesai },
          { id: "refund", label: "Refund", count: counts.refund },
        ]}
      />

      <Card pad={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:px-5">
          <div className="relative flex-1">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nomor pesanan atau nama pembeli…" className="h-10 pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-10">
              <Icon name="calendar" size={15} /> 14 Jan – 12 Feb
            </Button>
            <Button variant="ghost" size="sm" className="h-10">
              <Icon name="filter" size={15} /> Filter
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-4 sm:p-5">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-2/3" />
          </div>
        ) : loadError ? (
          <div className="p-4 sm:p-5">
            <ErrorState onRetry={load} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              icon="receipt"
              title={isPristine ? "Belum ada pesanan" : tab === "refund" ? "Belum ada pengembalian dana" : "Tidak ada pesanan di sini"}
              desc={
                isPristine
                  ? "Pesanan masuk otomatis setelah pembeli membayar. Bagikan tautan tokomu untuk mulai berjualan."
                  : tab === "refund"
                    ? "Kalau ada pembeli yang minta uang kembali, permintaannya akan muncul di sini beserta alasannya."
                    : `Tidak ada pesanan yang cocok dengan “${q}”. Coba ubah kata kunci atau pilih tab lain.`
              }
              action={
                tab === "refund" || isPristine ? undefined : (
                  <Button variant="secondary" onClick={() => { setQ(""); setTab("semua"); }}>
                    Tampilkan semua
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden sm:block">
              <TableWrap>
            <thead>
              <tr>
                <Th>Nomor pesanan</Th>
                <Th>Pembeli</Th>
                <Th className="hidden md:table-cell">Produk</Th>
                <Th className="text-right">Total</Th>
                <Th>Bayar</Th>
                <Th>Status</Th>
                <Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="cursor-pointer transition-colors hover:bg-canvas/70" onClick={() => navigate(`/app/orders/${o.id}`)}>
                  <Td>
                    <div className="tnum text-[13.5px] font-bold text-ink">{o.id}</div>
                    <div className="text-[12px] text-faint">{o.date}</div>
                  </Td>
                  <Td>
                    <div className="text-[13.5px] font-semibold text-ink">{o.customer}</div>
                    <div className="text-[12px] text-faint">{o.city}</div>
                  </Td>
                  <Td className="hidden max-w-[220px] md:table-cell">
                    <div className="truncate text-[13.5px] text-muted">{o.items}</div>
                    <div className="tnum text-[12px] text-faint">{o.qty} barang</div>
                  </Td>
                  <Td className="tnum text-right font-bold">{rupiah(o.total)}</Td>
                  <Td>
                    <Badge tone={o.channel === "QRIS" ? "blue" : "gray"}>{o.channel}</Badge>
                  </Td>
                  <Td>
                    <Badge
                      tone={
                        o.status === "selesai"
                          ? "green"
                          : o.status === "menunggu"
                            ? "amber"
                            : o.status === "batal"
                              ? "red"
                              : "blue"
                      }
                      dot
                    >
                      {STATUS_LABEL[o.status]}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/orders/${o.id}`);
                        }}
                      >
                        Detail
                      </Button>
                    </div>
                  </Td>
                </tr>
                ))}
              </tbody>
            </TableWrap>
            </div>

            {/* mobile cards */}
            <ul className="divide-y divide-linesoft sm:hidden">
              {filtered.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => navigate(`/app/orders/${o.id}`)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="tnum text-[13.5px] font-bold text-ink">{o.id}</div>
                      <div className="truncate text-[12px] text-faint">
                        {o.date} · {o.customer}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge
                          tone={
                            o.status === "selesai"
                              ? "green"
                              : o.status === "menunggu"
                                ? "amber"
                                : o.status === "batal"
                                  ? "red"
                                  : "blue"
                          }
                          dot
                        >
                          {STATUS_LABEL[o.status]}
                        </Badge>
                        <Badge tone={o.channel === "QRIS" ? "blue" : "gray"}>{o.channel}</Badge>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="tnum text-[14.5px] font-bold text-ink">{rupiah(o.total)}</div>
                      <Icon name="right" size={14} className="ml-auto mt-1 text-faint" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-[13px] text-muted sm:px-5">
          <span>
            Menampilkan <span className="tnum font-semibold text-ink">{filtered.length}</span> pesanan
          </span>
          <span className="micro">Halaman 1 dari 1</span>
        </div>
      </Card>
    </AppShell>
  );
}

/* =============================== ORDER DETAIL ============================= */
export function OrderDetail({ id }: { id: string }) {
  const { toast } = useApp();
  const [o, setO] = useState<Order | null>(null);
  const [lines, setLines] = useState<{ name: string; qty: number; price: number }[]>([]);
  const [pay, setPay] = useState<{ channel: string; fee: number; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmShip, setConfirmShip] = useState(false);
  const [cancel, setCancel] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data: order } = await supabase
        .from("orders")
        .select("id,buyer_name,buyer_phone,buyer_city,buyer_address,buyer_note,total,status,channel,created_at")
        .eq("id", id)
        .maybeSingle();
      if (!order) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name_snapshot,qty,price_snapshot")
        .eq("order_id", id);
      const { data: pays } = await supabase
        .from("payments")
        .select("channel,fee,status,created_at")
        .eq("order_id", id)
        .order("created_at", { ascending: false })
        .limit(1);
      setO({
        id: order.id,
        customer: order.buyer_name,
        city: order.buyer_city ?? "",
        items: "",
        qty: 0,
        total: Number(order.total),
        status: order.status as OrderStatus,
        date: new Date(order.created_at).toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        channel: order.channel ?? "—",
        phone: order.buyer_phone ?? "",
        address: order.buyer_address ?? "",
        note: order.buyer_note ?? "",
      });
      setLines(
        ((items ?? []) as { product_name_snapshot: string; qty: number; price_snapshot: number | string }[]).map(
          (i) => ({ name: i.product_name_snapshot, qty: i.qty, price: Number(i.price_snapshot) }),
        ),
      );
      const latest = (pays ?? [])[0] as { channel: string; fee: number | string; status: string } | undefined;
      setPay(latest ? { channel: latest.channel, fee: Number(latest.fee), status: latest.status } : null);
      setLoading(false);
    })();
  }, [id]);

  const setStatus = async (next: OrderStatus, okMsg: string) => {
    if (!o) return;
    const prev = o.status;
    setO({ ...o, status: next });
    setConfirmShip(false);
    setCancel(false);
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", o.id);
    if (error) {
      setO({ ...o, status: prev });
      toast("Gagal mengubah status.", "bad");
      return;
    }
    toast(okMsg);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-3 py-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </AppShell>
    );
  }

  if (notFound || !o) {
    return (
      <AppShell>
        <div className="py-6">
          <EmptyState
            icon="receipt"
            title="Pesanan tidak ditemukan"
            desc="Pesanan ini sudah dihapus atau bukan milik tokomu."
            action={
              <Button variant="secondary" onClick={() => navigate("/app/orders")}>
                Kembali ke pesanan
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  const nextLabel = o.status === "dikemas" ? "Tandai dikirim" : o.status === "dikirim" ? "Tandai selesai" : null;
  const steps = ["Menunggu bayar", "Dikemas", "Dikirim", "Selesai"];
  const stepIndex = o.status === "selesai" ? 3 : o.status === "dikirim" ? 2 : o.status === "dikemas" ? 1 : 0;

  return (
    <AppShell>
      <div className="mb-5">
        <button
          onClick={() => navigate("/app/orders")}
          className="mb-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted hover:text-brand-700"
        >
          <Icon name="left" size={15} /> Semua pesanan
        </button>
        <PageHeader
          index="05"
          kicker={`Pesanan ${o.date}`}
          title={o.id}
          desc={`${o.customer} · ${o.city} · ${lines.reduce((s, l) => s + l.qty, 0)} barang`}
          actions={
            <>
              <Button variant="secondary" onClick={() => toast("Membuka chat WhatsApp pembeli…", "info")}>
                <Icon name="wa" size={16} className="text-[#0a7a56]" /> Chat pembeli
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                <Icon name="receipt" size={16} /> Cetak nota
              </Button>
              <Button
                onClick={() => setConfirmShip(true)}
                disabled={!nextLabel}
              >
                <Icon name="truck" size={16} /> {nextLabel ?? "Tandai dikirim"}
              </Button>
            </>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            tone={o.status === "selesai" ? "green" : o.status === "menunggu" ? "amber" : o.status === "batal" ? "red" : "blue"}
            dot
          >
            {STATUS_LABEL[o.status]}
          </Badge>
          <Badge tone="gray">{o.channel}</Badge>
          <span className="text-[13px] text-muted">Dibuat {o.date} WIB</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-4">
          <Card>
            <CardHead title="Progres pesanan" icon="truck" />
            <ol className="flex items-start justify-between gap-2">
              {steps.map((s, i) => (
                <li key={s} className="flex flex-1 flex-col items-center gap-2 text-center">
                  <span
                    className={cx(
                      "grid h-8 w-8 place-items-center rounded-full border-2 text-[13px] font-bold",
                      i <= stepIndex ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-faint",
                    )}
                  >
                    {i < stepIndex ? <Icon name="check" size={15} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={cx("text-[12.5px] font-semibold", i <= stepIndex ? "text-ink" : "text-faint")}>
                    {s}
                  </span>
                  {i < steps.length - 1 && (
                    <span
                      className={cx(
                        "absolute left-[calc(50%+20px)] top-4 hidden h-0.5 w-[calc(100%-40px)] sm:block",
                        i < stepIndex ? "bg-brand-500" : "bg-line",
                      )}
                    />
                  )}
                </li>
              ))}
            </ol>
          </Card>

          <Card pad={false}>
            <div className="px-4 pb-1 pt-4 sm:px-5">
              <CardHead title="Isi pesanan" icon="box" />
            </div>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Produk</Th>
                  <Th className="text-center">Jumlah</Th>
                  <Th className="text-right">Harga</Th>
                  <Th className="text-right">Subtotal</Th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.name}>
                    <Td>
                      <div className="text-[13.5px] font-semibold text-ink">{l.name}</div>
                    </Td>
                    <Td className="tnum text-center">{l.qty}</Td>
                    <Td className="tnum text-right">{rupiah(l.price)}</Td>
                    <Td className="tnum text-right font-semibold">{rupiah(l.price * l.qty)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div className="flex justify-end gap-6 px-4 py-4 sm:px-5">
              <dl className="w-full max-w-xs space-y-2 text-[13.5px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal barang</dt>
                  <dd className="tnum font-semibold">{rupiah(lines.reduce((s, l) => s + l.price * l.qty, 0))}</dd>
                </div>
                <div className="flex justify-between border-t border-linesoft pt-2 text-[15px]">
                  <dt className="font-bold text-ink">Total</dt>
                  <dd className="tnum font-bold text-brand-700">{rupiah(o.total)}</dd>
                </div>
              </dl>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHead title="Data pembeli" icon="user" />
              <dl className="space-y-2.5 text-[13.5px]">
                <div>
                  <dt className="micro text-faint">Nama</dt>
                  <dd className="text-ink">{o.customer}</dd>
                </div>
                <div>
                  <dt className="micro text-faint">Kota</dt>
                  <dd className="text-ink">{o.city || "—"}</dd>
                </div>
                <div>
                  <dt className="micro text-faint">WhatsApp</dt>
                  <dd className="tnum text-ink">{o.phone || "—"}</dd>
                </div>
                {o.address && (
                  <div>
                    <dt className="micro text-faint">Alamat</dt>
                    <dd className="text-ink">{o.address}</dd>
                  </div>
                )}
                {o.note && (
                  <div>
                    <dt className="micro text-faint">Catatan</dt>
                    <dd className="text-ink">{o.note}</dd>
                  </div>
                )}
              </dl>
            </Card>
            <Card>
              <CardHead title="Pengiriman" icon="truck" />
              <dl className="space-y-2.5 text-[13.5px]">
                <div>
                  <dt className="micro text-faint">Status</dt>
                  <dd className="text-ink">{STATUS_LABEL[o.status]}</dd>
                </div>
                <div>
                  <dt className="micro text-faint">Nomor resi</dt>
                  <dd className="tnum text-ink">Belum diisi</dd>
                </div>
              </dl>
              <p className="mt-3 text-[12.5px] leading-relaxed text-faint">
                Input resi menyusul setelah alur pesanan backend selesai.
              </p>
            </Card>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="notch rounded-xl border border-line bg-white p-5 shadow-card">
            <div className="micro mb-3 text-brand-600">Pembayaran</div>
            <div className="tnum text-[26px] font-bold leading-none text-ink">{rupiah(o.total)}</div>
            <div className="mt-1.5 text-[13px] text-muted">{pay?.channel ?? o.channel}</div>
            <div className="mt-4 space-y-2.5 border-t border-linesoft pt-4 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <Badge tone={pay?.status === "berhasil" ? "green" : o.status === "menunggu" ? "amber" : "blue"}>
                  {pay?.status === "berhasil" ? "Lunas" : o.status === "menunggu" ? "Belum dibayar" : STATUS_LABEL[o.status]}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Biaya layanan</span>
                <span className="tnum font-semibold">−{rupiah(pay?.fee ?? 0)}</span>
              </div>
              <div className="flex justify-between border-t border-linesoft pt-2.5">
                <span className="font-bold text-ink">Masuk saldo</span>
                <span className="tnum font-bold text-ok">{rupiah(o.total - (pay?.fee ?? 0))}</span>
              </div>
            </div>
            <ButtonLink to="/app/wallet" variant="secondary" className="mt-4 w-full">
              Lihat saldo
            </ButtonLink>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <div className="micro mb-3 text-faint">Tindakan lain</div>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" onClick={() => toast("Label pengiriman diunduh.")}>
                <Icon name="download" size={16} /> Unduh label kirim
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-bad hover:bg-badsoft"
                onClick={() => setCancel(true)}
                disabled={o.status === "selesai" || o.status === "batal"}
              >
                <Icon name="trash" size={16} /> Batalkan pesanan
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmShip}
        onClose={() => setConfirmShip(false)}
        title={o.status === "dikirim" ? "Tandai pesanan selesai?" : "Tandai pesanan sudah dikirim?"}
        body={
          o.status === "dikirim"
            ? "Pesanan selesai dan arsip tersimpan."
            : "Pembeli akan menerima notifikasi beserta nomor resi. Pastikan paket sudah diserahkan ke kurir."
        }
        confirmLabel={o.status === "dikirim" ? "Ya, selesaikan" : "Ya, kirim notifikasi"}
        tone="primary"
        onConfirm={() =>
          setStatus(
            o.status === "dikirim" ? "selesai" : "dikirim",
            o.status === "dikirim" ? "Pesanan selesai." : "Pesanan ditandai dikirim.",
          )
        }
      />
      <ConfirmDialog
        open={cancel}
        onClose={() => setCancel(false)}
        title={`Batalkan pesanan ${o.id}?`}
        body="Pembeli akan diberi tahu dan dana dikembalikan penuh. Riwayat pembatalan tetap tersimpan untuk laporan Anda."
        confirmLabel="Batalkan pesanan"
        onConfirm={() => setStatus("batal", "Pesanan dibatalkan dan dana dikembalikan.")}
      />
    </AppShell>
  );
}
