import { useState } from "react";
import { AppShell } from "../components/layout";
import { Logo, LogoMark, TagGlyph } from "../components/Logo";
import {
  Badge,
  Button,
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
  Modal,
  PageHeader,
  Progress,
  Segmented,
  Select,
  Skeleton,
  TableWrap,
  Tabs,
  TagChip,
  Td,
  Textarea,
  Th,
  Toggle,
  cx,
} from "../components/ui";
import { BarRows, ChartFrame, Donut, LineChart, Sparkline } from "../components/charts";

const SWATCHES = [
  ["brand-600", "#0A69C4", "Aksi utama"],
  ["brand-500", "#1B9AE0", "Aksen dari logo"],
  ["navy-800", "#0B2E6E", "Permukaan kuat"],
  ["navy-900", "#061B45", "Latar hero & panel"],
  ["canvas", "#F4F8FC", "Latar aplikasi"],
  ["line", "#DFE6F0", "Garis rambut"],
  ["ink", "#0A1830", "Teks utama"],
  ["muted", "#46566F", "Teks sekunder"],
];

const TYPE = [
  ["Display / wordmark", "Chakra Petch Bold", "28–62px · tracking −0,015em"],
  ["Judul halaman", "Plus Jakarta Sans ExtraBold", "26–40px · tracking −0,03em"],
  ["Teks isi & UI", "Plus Jakarta Sans Regular/Semibold", "13–17px"],
  ["Label mikro & angka", "IBM Plex Mono Medium", "10,5px · tracking 0,16em / tabular"],
];

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mb-4">
      <CardHead title={title} />
      {children}
    </Card>
  );
}

export function SystemPage() {
  const [tab, setTab] = useState("preview");
  const [checked, setChecked] = useState(true);
  const [toggle, setToggle] = useState(true);
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <AppShell>
      <PageHeader
        index="00"
        kicker="Pustaka komponen"
        title="Sistem desain TokoLink"
        desc="Warna, tipografi, jarak, dan seluruh komponen yang dipakai di halaman publik, toko, dasbor penjual, dan Admin Master."
        actions={<Button variant="secondary" onClick={() => window.print()}>Cetak spesifikasi</Button>}
      />

      <Row title="Warna & token">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map(([name, hex, use]) => (
            <div key={name} className="overflow-hidden rounded-lg border border-line">
              <div className="h-14" style={{ background: hex }} />
              <div className="bg-white p-3">
                <div className="tnum text-[13px] font-bold text-ink">{hex}</div>
                <div className="text-[12.5px] text-muted">{use}</div>
                <div className="micro mt-1 text-faint">{name}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {[4, 6, 8, 12, 16, 24, 32, 48].map((r) => (
            <span key={r} className="rounded-md border border-line bg-canvas px-3 py-2">
              <span className="tnum text-[13px] font-semibold text-ink">{r}px</span>
            </span>
          ))}
          <span className="rounded-md bg-navy-800 px-3 py-2">
            <span className="tnum text-[13px] font-semibold text-white">radius utama 8px · kartu 12px</span>
          </span>
        </div>
      </Row>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead title="Tipografi" sub="Satu keluarga untuk UI, mono untuk angka" />
          <ul className="divide-y divide-linesoft">
            {TYPE.map(([role, family, spec]) => (
              <li key={role} className="py-3">
                <div className="micro text-brand-600">{role}</div>
                <div className="mt-1 text-[17px] font-extrabold text-ink">{family}</div>
                <div className="text-[13px] text-muted">{spec}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHead title="Identitas logo" sub="Artwork resmi dari public/images/Icon" />
          <div className="flex flex-wrap items-center gap-5">
            <Logo size={44} />
            <Logo size={32} />
            <LogoMark size={38} />
            <span className="flex h-14 w-14 items-center justify-center rounded-md bg-navy-900">
              <LogoMark size={38} />
            </span>
            <TagGlyph size={28} className="text-brand-500" />
          </div>
          <div className="mt-4 rounded-md bg-canvas p-3.5 text-[13px] leading-relaxed text-muted">
            Logo memakai file artwork resmi (logo-mark / logo-lockup). Tidak diubah bentuk,
            warna, atau proporsinya; cukup atur ukuran tampilannya.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <TagChip>01 / micro label</TagChip>
            <TagChip tone="navy">Sudut potong</TagChip>
            <TagChip tone="white">Chip di latar gelap</TagChip>
          </div>
        </Card>
      </div>

      <Row title="Tombol">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button>Utama</Button>
            <Button variant="navy">Navy</Button>
            <Button variant="secondary">Sekunder</Button>
            <Button variant="ghost">Hantu</Button>
            <Button variant="danger">Berbahaya</Button>
            <Button variant="link">Tautan teks</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button size="sm">Kecil</Button>
            <Button size="md">Sedang</Button>
            <Button size="lg">Besar</Button>
            <Button loading>Memuat</Button>
            <Button disabled>Nonaktif</Button>
            <Button variant="secondary" disabled>
              Nonaktif
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button>
              <Icon name="plus" size={16} /> Dengan ikon
            </Button>
            <Button variant="secondary">
              <Icon name="download" size={16} /> Unduh
            </Button>
            <Icon name="check" size={22} className="text-brand-600" />
            <Icon name="qr" size={22} className="text-navy-800" />
            <Icon name="wa" size={22} className="text-[#0a7a56]" />
          </div>
        </div>
      </Row>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead title="Formulir" sub="Label, bantuan, kesalahan, nonaktif" />
          <div className="space-y-4">
            <Field label="Nama produk" required hint="Tulis persis seperti di kemasan.">
              <Input defaultValue="Kue Lapis Legit 380g" />
            </Field>
            <Field label="Harga" error="Harga harus lebih dari Rp0.">
              <Input defaultValue="0" invalid />
            </Field>
            <Field label="Kategori">
              <Select defaultValue="Kue & Snack">
                {["Kue & Snack", "Sambal & Bumbu", "Kopi & Minuman"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Deskripsi (opsional)">
              <Textarea defaultValue="Dibuat pagi hari, tanpa pengawet." rows={3} />
            </Field>
            <Field label="Kolom nonaktif">
              <Input defaultValue="Tidak bisa diubah" disabled />
            </Field>
            <FieldRow cols={2}>
              <div className="flex items-center justify-between rounded-md border border-line bg-canvas px-3.5 py-3">
                <span className="text-[13.5px] font-semibold text-ink">Sakelar</span>
                <Toggle checked={toggle} onChange={setToggle} label="Sakelar" />
              </div>
              <div className="rounded-md border border-line bg-canvas px-3.5 py-3">
                <Checkbox checked={checked} onChange={setChecked}>
                  Centang persetujuan
                </Checkbox>
              </div>
            </FieldRow>
          </div>
        </Card>

        <Card>
          <CardHead title="Navigasi, tab & menu" />
          <div className="space-y-5">
            <Tabs
              active={tab}
              onChange={setTab}
              items={[
                { id: "preview", label: "Pratinjau", count: 4 },
                { id: "riwayat", label: "Riwayat" },
                { id: "kosong", label: "Refund", count: 0 },
              ]}
            />
            <Segmented items={["7 hari", "30 hari", "90 hari"]} active="30 hari" onChange={() => {}} />
            <div className="flex flex-wrap items-center gap-3">
              <Dropdown
                trigger={() => (
                  <span className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3.5 text-[14px] font-semibold text-ink">
                    Menu tindakan <Icon name="chevron" size={16} />
                  </span>
                )}
                items={[
                  { label: "Edit produk", icon: "edit" },
                  { label: "Lihat di toko", icon: "eye" },
                  { label: "Duplikat", icon: "copy" },
                  { label: "Hapus", icon: "trash", danger: true, sep: true },
                ]}
              />
              <Button variant="secondary" onClick={() => setModal(true)}>
                Buka modal
              </Button>
              <Button variant="danger" onClick={() => setConfirm(true)}>
                Dialog konfirmasi
              </Button>
            </div>
            <div className="rounded-lg border border-line bg-canvas p-4">
              <div className="micro mb-3 text-faint">Status data</div>
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-2 pt-1 text-[13px] text-muted">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
                  Memuat data…
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Row title="Lencana, indikator & progres">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone="blue" dot>Aktif</Badge>
          <Badge tone="green" dot>Selesai</Badge>
          <Badge tone="amber" dot>Menunggu</Badge>
          <Badge tone="red" dot>Gagal</Badge>
          <Badge tone="navy">Premium</Badge>
          <Badge tone="gray">Nonaktif</Badge>
          <Badge tone="cyan">QRIS</Badge>
          <span className="flex items-center gap-2 text-[13.5px] font-semibold text-ok">
            <Delta value={18} /> omzet naik
          </span>
          <span className="tnum text-[13px] text-muted">
            <Sparkline values={[4, 8, 6, 12, 9, 16]} />
          </span>
        </div>
        <div className="mt-4 max-w-md space-y-3">
          <div>
            <div className="mb-1.5 flex justify-between text-[13px]">
              <span className="text-muted">Pemakaian kode promo</span>
              <span className="tnum font-semibold text-ink">14 / 50</span>
            </div>
            <Progress value={28} />
          </div>
          <Progress value={72} tone="ok" />
          <Progress value={45} tone="amber" />
        </div>
      </Row>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card pad={false}>
          <div className="px-4 pb-1 pt-4 sm:px-5">
            <CardHead title="Tabel" sub="Header mono, baris hairline, hover lembut" />
          </div>
          <TableWrap>
            <thead>
              <tr>
                <Th>Produk</Th>
                <Th className="text-right">Harga</Th>
                <Th className="text-right">Stok</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              <tr className="transition-colors hover:bg-canvas/70">
                <Td className="font-semibold">Kue Lapis Legit 380g</Td>
                <Td className="tnum text-right">Rp85.000</Td>
                <Td className="tnum text-right">12</Td>
                <Td>
                  <Badge tone="green">Aktif</Badge>
                </Td>
              </tr>
              <tr className="transition-colors hover:bg-canvas/70">
                <Td className="font-semibold">Madu Hutan 500ml</Td>
                <Td className="tnum text-right">Rp120.000</Td>
                <Td className="tnum text-right text-bad">0</Td>
                <Td>
                  <Badge tone="red">Stok habis</Badge>
                </Td>
              </tr>
            </tbody>
          </TableWrap>
        </Card>

        <Card>
          <ChartFrame title="Contoh grafik" hint="Sumbu mono, garis kisi tipis, tooltip jelas">
            <div className="space-y-4">
              <LineChart
                series={[420, 510, 380, 640, 720, 580, 690, 810, 760, 940]}
                labels={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
                height={130}
                format={(v) => `${v}rb`}
              />
              <BarRows data={[{ label: "QRIS", value: 96 }, { label: "Transfer", value: 41 }]} />
              <Donut
                centerValue="142"
                centerLabel="pesanan"
                size={120}
                items={[
                  { label: "Selesai", value: 104, color: "#0E9F6E" },
                  { label: "Proses", value: 30, color: "#0A69C4" },
                  { label: "Batal", value: 8, color: "#C62828" },
                ]}
              />
            </div>
          </ChartFrame>
        </Card>
      </div>

      <Row title="Keadaan kosong & kesalahan">
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyState
            icon="box"
            title="Keranjang masih kosong"
            desc="Pilih produk dulu dari katalog toko. Barang yang dipilih tersimpan sampai Anda selesai belanja."
            action={<Button size="sm">Lihat produk</Button>}
          />
          <ErrorState onRetry={() => {}} />
        </div>
      </Row>

      <div className={cx("grid gap-4 lg:grid-cols-3")}>
        <Card>
          <div className="micro mb-2 text-faint">Bayangan 1 · kartu</div>
          <div className="rounded-xl border border-line bg-white p-4 shadow-card">shadow-card</div>
        </Card>
        <Card>
          <div className="micro mb-2 text-faint">Bayangan 2 · terangkat</div>
          <div className="rounded-xl border border-line bg-white p-4 shadow-lift">shadow-lift</div>
        </Card>
        <Card>
          <div className="micro mb-2 text-faint">Sudut potong (notch)</div>
          <div className="notch rounded-xl bg-navy-800 p-4 text-white">clip-path 12px</div>
        </Card>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Judul modal"
        eyebrow="Eyebrow mono"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Batal
            </Button>
            <Button onClick={() => setModal(false)}>Simpan</Button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed text-muted">
          Modal dipakai untuk tugas singkat: membuat kode promo, melihat detail penjual, atau mengunduh
          QR. Esc menutup, klik area gelap menutup, dan gulir halaman di kunci selama terbuka.
        </p>
      </Modal>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Hapus produk ini?"
        body="Produk dihapus permanen beserta riwayat tampilannya. Pesanan lama tetap tersimpan."
        confirmLabel="Hapus permanen"
        onConfirm={() => {}}
      />
    </AppShell>
  );
}
