import { useState } from "react";
import { navigate } from "../lib/router";
import { useAuth } from "../lib/auth";
import {
  BALANCE_HISTORY,
  BIO_LINKS,
  DISCOUNTS,
  HOURS,
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
  Field,
  FieldRow,
  Icon,
  Input,
  Modal,
  PageHeader,
  Progress,
  Segmented,
  Select,
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
export function Wallet() {
  const [tab, setTab] = useState("semua");
  const rows = BALANCE_HISTORY.filter((r) =>
    tab === "semua" ? true : tab === "masuk" ? r.amount > 0 : r.amount < 0,
  );

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
                <div className="tnum mt-2 text-[38px] font-bold leading-none sm:text-[44px]">Rp4.280.000</div>
                <div className="mt-2.5 flex items-center gap-3 text-[13px] text-white/60">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Siap ditarik
                  </span>
                  <span>Minimum penarikan Rp50.000</span>
                </div>
              </div>
              <div className="text-right">
                <div className="micro text-white/62">Menunggu cair</div>
                <div className="tnum mt-1.5 text-[20px] font-bold">Rp1.250.000</div>
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
          <StatCard label="Masuk bulan ini" value="Rp38.420.000" delta={18} hint="142 transaksi" />
          <StatCard label="Ditarik tahun ini" value="Rp58.400.000" hint="12 kali penarikan" spark={[12, 18, 15, 24, 22, 30, 28]} />
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
            series={[280, 310, 260, 420, 480, 430, 520, 610, 540, 680, 720, 640, 780, 810, 760, 900, 840, 960, 1020, 980, 1100]}
            labels={Array.from({ length: 21 }, (_, i) => `${i + 1}`)}
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
            {rows.map((r, i) => (
              <tr key={r.id} className="transition-colors hover:bg-canvas/70">
                <Td>
                  <div className="flex items-center gap-3">
                    <span
                      className={cx(
                        "grid h-8 w-8 place-items-center rounded-md",
                        r.amount > 0 ? "bg-oksoft text-ok" : "bg-warnsoft text-warn",
                      )}
                    >
                      <Icon name={r.amount > 0 ? "arrowDown" : "arrowUp"} size={16} />
                    </span>
                    <div>
                      <div className="text-[13.5px] font-semibold text-ink">{r.label}</div>
                      <div className="text-[12px] text-faint sm:hidden">{r.date}</div>
                    </div>
                  </div>
                </Td>
                <Td className="tnum hidden text-[13px] text-muted sm:table-cell">{r.id}</Td>
                <Td className="hidden text-[13px] text-muted sm:table-cell">{r.date}</Td>
                <Td className={cx("tnum text-right font-bold", r.amount > 0 ? "text-ok" : "text-ink")}>
                  {r.amount > 0 ? "+" : "−"}
                  {rupiah(Math.abs(r.amount))}
                </Td>
                <Td className="tnum text-right text-muted">{rupiah(4280000 - i * 180000)}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
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
  const [amount, setAmount] = useState("500000");
  const [bank, setBank] = useState("BCA •••• 4821 (Ani Rahayu)");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const balance = 4280000;
  const fee = 6500;
  const value = Number(amount || 0);

  const submit = () => {
    if (value < 50000) return setErr("Penarikan minimal Rp50.000.");
    if (value > balance) return setErr("Jumlah melebihi saldo tersedia.");
    setErr("");
    setConfirm(true);
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
          <CardHead title="Formulir penarikan" sub="Saldo tersedia Rp4.280.000" icon="wallet" />
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
                <option>BCA •••• 4821 (Ani Rahayu)</option>
                <option>Mandiri •••• 3345 (Ani Rahayu)</option>
                <option>Tambah rekening baru…</option>
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
              {[
                ["11 Feb 2025", 1250000, "Selesai"],
                ["4 Feb 2025", 980000, "Selesai"],
                ["28 Jan 2025", 1750000, "Selesai"],
              ].map(([d, v, s]) => (
                <li key={String(d)} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="tnum text-[13.5px] font-bold text-ink">{rupiah(Number(v))}</div>
                    <div className="text-[12px] text-faint">{d} · BCA •••• 4821</div>
                  </div>
                  <Badge tone="green" dot>
                    {s}
                  </Badge>
                </li>
              ))}
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
        onConfirm={() => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            toast("Permintaan penarikan diterima. Dana cair maksimal 1 hari kerja.");
            navigate("/app/wallet");
          }, 900);
        }}
      />
    </AppShell>
  );
}

/* ================================= BIO LINKS =============================== */
export function BioLinks() {
  const { toast } = useApp();
  const [links, setLinks] = useState(BIO_LINKS);
  const [del, setDel] = useState<{ id: string; label: string } | null>(null);

  const toggle = (id: string) => setLinks((l) => l.map((x) => (x.id === id ? { ...x, on: !x.on } : x)));

  return (
    <AppShell>
      <PageHeader
        index="07"
        kicker="Tampilan"
        title="Tautan bio"
        desc="Satu halaman berisi semua tautan penting. Taruh alamatnya di bio Instagram, WhatsApp, dan TikTok."
        actions={
          <>
            <Button variant="secondary" onClick={() => toast("Tautan disalin: tokolink.id/dapoer-bu-ani")}>
              <Icon name="copy" size={16} /> Salin tautan
            </Button>
            <Button
              onClick={() => {
                setLinks((l) => [
                  ...l,
                  { id: "b" + Date.now(), label: "Tautan baru", url: "tokolink.id/dapoer-bu-ani/baru", icon: "link", clicks: 0, on: true },
                ]);
                toast("Tautan baru ditambahkan.");
              }}
            >
              <Icon name="plus" size={16} /> Tambah tautan
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          {links.map((l, i) => (
            <div
              key={l.id}
              className={cx(
                "flex flex-col gap-3 rounded-xl border bg-white p-4 transition-[border-color,box-shadow] duration-150 sm:flex-row sm:items-center",
                l.on ? "border-line shadow-card" : "border-dashed border-line bg-canvas/60",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-canvas text-faint">
                  <Icon name="menu" size={16} />
                </span>
                <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-md", l.on ? "bg-brand-50 text-brand-600" : "bg-white text-faint")}>
                  <Icon name={l.icon === "link" ? "link" : l.icon === "doc" ? "receipt" : l.icon} size={17} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <Input
                  value={l.label}
                  onChange={(e) => setLinks((ls) => ls.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)))}
                  className="h-9 border-transparent bg-transparent px-2 font-semibold hover:border-line focus:bg-white"
                  aria-label="Judul tautan"
                />
                <Input
                  value={l.url}
                  onChange={(e) => setLinks((ls) => ls.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)))}
                  className="mt-0.5 h-8 border-transparent bg-transparent px-2 text-[13px] text-muted hover:border-line focus:bg-white"
                  aria-label="Alamat tautan"
                />
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-right">
                  <span className="tnum block text-[14px] font-bold text-ink">{l.clicks.toLocaleString("id-ID")}</span>
                  <span className="micro text-faint">klik</span>
                </span>
                <Toggle checked={l.on} onChange={() => toggle(l.id)} label={`Tampilkan ${l.label}`} />
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
          ))}

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
                <div className="mt-2 text-[14px] font-extrabold text-ink">Dapoer Bu Ani</div>
                <div className="text-[11.5px] text-faint">@dapoer.buani</div>
              </div>
              <ul className="mt-3.5 space-y-2">
                {links
                  .filter((l) => l.on)
                  .map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center gap-2.5 rounded-md border border-line bg-canvas px-3 py-2.5 text-[12.5px] font-semibold text-ink"
                    >
                      <Icon name={l.icon === "doc" ? "receipt" : l.icon} size={15} className="text-brand-600" />
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
        onConfirm={() => {
          setLinks((l) => l.filter((x) => x.id !== del?.id));
          toast("Tautan dihapus.", "warn");
        }}
      />
    </AppShell>
  );
}

/* ================================== THEME ================================== */
export function Theme() {
  const { toast } = useApp();
  const { profile } = useAuth();
  const storeName = profile?.store_name || "Dapoer Bu Ani";
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
  const [list, setList] = useState(DISCOUNTS);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", type: "Persen", value: "", min: "", limit: "", until: "" });
  const [err, setErr] = useState("");

  const create = () => {
    if (form.code.trim().length < 3) return setErr("Kode minimal 3 karakter, tanpa spasi.");
    if (!form.value) return setErr("Isi nilai diskon.");
    setList((l) => [
      {
        code: form.code.toUpperCase().replace(/\s/g, ""),
        type: form.type,
        value: form.type === "Persen" ? `${form.value}%` : rupiah(Number(form.value)),
        min: Number(form.min || 0),
        used: 0,
        limit: Number(form.limit || 100),
        until: form.until || "31 Des 2025",
        on: true,
      },
      ...l,
    ]);
    setErr("");
    setOpen(false);
    setForm({ code: "", type: "Persen", value: "", min: "", limit: "", until: "" });
    toast("Kode promo dibuat dan langsung bisa dipakai pembeli.");
  };

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
        <StatCard label="Promo dipakai bulan ini" value="46" delta={22} hint="dari 3 kode aktif" spark={[4, 8, 6, 12, 10, 16, 22]} />
        <StatCard label="Diskon diberikan" value="Rp748.000" hint="0,9% dari omzet" />
        <StatCard label="Pesanan dari promo" value="38" delta={18} hint="31% dari total pesanan" />
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
            {list.map((d) => (
              <tr key={d.code} className="transition-colors hover:bg-canvas/70">
                <Td>
                  <span className="notch-sm inline-block bg-navy-800 px-2.5 py-1.5 tnum text-[13px] font-bold tracking-wider text-brand-300">
                    {d.code}
                  </span>
                </Td>
                <Td>
                  <div className="text-[14px] font-bold text-ink">{d.value}</div>
                  <div className="text-[12px] text-faint">{d.type}</div>
                </Td>
                <Td className="tnum hidden text-[13.5px] md:table-cell">{rupiah(d.min)}</Td>
                <Td className="hidden text-[13.5px] text-muted md:table-cell">{d.until}</Td>
                <Td>
                  <div className="min-w-[120px]">
                    <div className="mb-1 flex justify-between text-[12.5px]">
                      <span className="tnum font-semibold text-ink">{d.used}</span>
                      <span className="tnum text-faint">/{d.limit}</span>
                    </div>
                    <Progress value={(d.used / d.limit) * 100} tone={d.used >= d.limit ? "amber" : "blue"} />
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    <Badge tone={d.on ? "green" : "gray"} dot>
                      {d.on ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <Toggle
                      checked={d.on}
                      onChange={(v) => {
                        setList((ls) => ls.map((x) => (x.code === d.code ? { ...x, on: v } : x)));
                        toast(`Kode ${d.code} ${v ? "diaktifkan" : "dinonaktifkan"}.`, v ? "ok" : "warn");
                      }}
                      label={`Status ${d.code}`}
                    />
                  </div>
                </Td>
              </tr>
            ))}
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
            <Button onClick={create}>Simpan kode</Button>
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
                value={form.value}
                inputMode="numeric"
                onChange={(e) => {
                  setForm((f) => ({ ...f, value: e.target.value.replace(/\D/g, "") }));
                  setErr("");
                }}
                placeholder={form.type === "Persen" ? "5" : "10000"}
                className="tnum"
              />
            </Field>
          </FieldRow>
          <FieldRow cols={3}>
            <Field label="Minimum belanja">
              <Input
                value={form.min}
                inputMode="numeric"
                onChange={(e) => setForm((f) => ({ ...f, min: e.target.value.replace(/\D/g, "") }))}
                placeholder="50000"
                className="tnum"
              />
            </Field>
            <Field label="Batas pemakaian">
              <Input
                value={form.limit}
                inputMode="numeric"
                onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value.replace(/\D/g, "") }))}
                placeholder="50"
                className="tnum"
              />
            </Field>
            <Field label="Berlaku sampai">
              <Input value={form.until} onChange={(e) => setForm((f) => ({ ...f, until: e.target.value }))} placeholder="28 Feb 2025" />
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
  const [rows, setRows] = useState(HOURS);
  const set = (d: string, k: "on" | "open" | "close", v: string | boolean) =>
    setRows((r) => r.map((x) => (x.d === d ? { ...x, [k]: v } : x)));

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
              onClick={() => setRows(HOURS.map((h) => ({ ...h, on: true })))}
            >
              Buka setiap hari
            </Button>
            <Button onClick={() => toast("Jam buka disimpan.")}>Simpan jam buka</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card pad={false}>
          <ul className="divide-y divide-linesoft">
            {rows.map((h) => (
              <li key={h.d} className={cx("flex items-center gap-4 px-4 py-3.5 sm:px-5", !h.on && "bg-canvas/60")}>
                <Toggle checked={h.on} onChange={(v) => set(h.d, "on", v)} label={`Buka ${h.d}`} />
                <span className={cx("w-24 text-[14.5px] font-bold", h.on ? "text-ink" : "text-faint")}>{h.d}</span>
                {h.on ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      type="time"
                      value={h.open}
                      onChange={(e) => set(h.d, "open", e.target.value)}
                      className="tnum h-10 w-[110px]"
                      aria-label={`Jam buka ${h.d}`}
                    />
                    <span className="text-faint">–</span>
                    <Input
                      type="time"
                      value={h.close}
                      onChange={(e) => set(h.d, "close", e.target.value)}
                      className="tnum h-10 w-[110px]"
                      aria-label={`Jam tutup ${h.d}`}
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
  const [style, setStyle] = useState("Standar");
  const styles = ["Standar", "Bingkai toko", "Hitam putih"];

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
            <Button onClick={() => toast("QR diunduh sebagai PNG resolusi tinggi.")}>
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
              <QRMark size={228} fg={style === "Bingkai toko" ? "#FFFFFF" : "#061B45"} />
              <div className="mt-3 flex items-center justify-center gap-2">
                <LogoMark size={26} />
                <span className={cx("font-display text-[15px] font-bold", style === "Bingkai toko" ? "text-white" : "text-navy-800")}>
                  Dapoer Bu Ani
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
                  <dd className="tnum font-semibold text-ink">tokolink.id/dapoer-bu-ani</dd>
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
  const [plan, setPlan] = useState("Bulanan");
  const [close, setClose] = useState(false);
  const [notifs, setNotifs] = useState([
    { t: "Pesanan baru", d: "WhatsApp + notifikasi aplikasi", on: true },
    { t: "Pembayaran diterima", d: "Notifikasi aplikasi", on: true },
    { t: "Stok hampir habis", d: "WhatsApp", on: true },
    { t: "Ringkasan jualan mingguan", d: "Email setiap Senin", on: false },
  ]);
  const [f, setF] = useState({
    name: "Dapoer Bu Ani",
    slug: "dapoer-bu-ani",
    cat: "Kue & Snack",
    city: "Bandung",
    phone: "0812-3456-7890",
    bio: "Masakan rumahan dan bumbu jadi, dimasak pagi hari dikirim siang.",
    address: "Jl. Cihampelas No. 28, Bandung 40131",
  });

  return (
    <AppShell>
      <PageHeader
        index="08"
        kicker="Pengaturan"
        title="Pengaturan toko"
        desc="Informasi yang tampil di halaman publik dan dipakai untuk keperluan pengiriman."
        actions={<Button onClick={() => toast("Pengaturan toko disimpan.")}>Simpan perubahan</Button>}
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
                <Field label="Nomor WhatsApp" required>
                  <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
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
              <ButtonLink to="/s/dapoer-bu-ani" variant="secondary" className="w-full justify-start">
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
  const [twoFA, setTwoFA] = useState(true);
  const [del, setDel] = useState(false);

  return (
    <AppShell>
      <PageHeader
        index="08"
        kicker="Akun"
        title="Profil & keamanan"
        desc="Data pemilik akun. Tidak tampil di halaman toko kecuali nama yang Anda tulis di profil."
        actions={<Button onClick={() => toast("Profil akun disimpan.")}>Simpan profil</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card>
            <CardHead title="Profil" icon="user" />
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex items-start gap-4">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-[26px] font-bold text-brand-300">
                  AR
                </span>
                <Button variant="secondary" size="sm" onClick={() => toast("Pilih foto profil baru.", "info")}>
                  Ganti foto
                </Button>
              </div>
              <div className="flex-1 space-y-4">
                <FieldRow cols={2}>
                  <Field label="Nama lengkap" required>
                    <Input defaultValue="Ani Rahayu" />
                  </Field>
                  <Field label="Nama tampilan" hint="Muncul di pesanan dan chat.">
                    <Input defaultValue="Bu Ani" />
                  </Field>
                </FieldRow>
                <FieldRow cols={2}>
                  <Field label="Email" required>
                    <Input defaultValue="ani@dapoerbuani.id" type="email" />
                  </Field>
                  <Field label="Nomor WhatsApp" required>
                    <Input defaultValue="0812-3456-7890" />
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
