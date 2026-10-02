"use client";

import { AlertTriangle, Database, Info, Percent, Server } from "lucide-react";
import { useState } from "react";
import { reseed, saveFee, saveMaintenance } from "@/actions/admin";
import {
  Button,
  Card,
  CardHead,
  Field,
  Modal,
  PageHeader,
  TextArea,
  TextInput,
  Toggle,
  useAdminAction,
} from "@/components/ui";

interface Cfg {
  maintenanceOn: boolean;
  maintenanceMessage: string;
  feePct: number;
}

export default function SistemClient({ data }: { data: Cfg }) {
  const { run, pending } = useAdminAction();
  const [on, setOn] = useState(data.maintenanceOn);
  const [msg, setMsg] = useState(data.maintenanceMessage);
  const [fee, setFee] = useState(String(data.feePct));
  const [reseedOpen, setReseedOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Sistem"
        desc="Pengaturan global platform — hanya perlu disentuh sesekali."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Maintenance */}
        <Card className="anim-rise">
          <CardHead
            title="Mode maintenance"
            sub="Tampilkan halaman maintenance di seluruh storefront & checkout"
            right={<Toggle on={on} onChange={setOn} label="Mode maintenance" />}
          />
          <div className={`rounded-xl p-4 transition ${on ? "bg-warn-50" : "bg-canvas"}`}>
            {on ? (
              <p className="flex items-start gap-2 text-[13px] font-semibold leading-6 text-warn-700">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                Maintenance aktif — banner peringatan juga tampil di seluruh halaman Admin Master
                sampai Anda mematikannya.
              </p>
            ) : (
              <p className="text-[13px] font-semibold leading-6 text-mute">
                Semua layanan berjalan normal. Aktifkan saat ada pemeliharaan database atau
                perubahan gateway QRIS.
              </p>
            )}
          </div>
          <div className="mt-4">
            <Field label="Pesan untuk seller & pembeli">
              <TextArea
                rows={2}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="mis. Pemeliharaan terjadwal 02.00–04.00 WIB, toko kembali normal sebentar lagi."
                maxLength={160}
              />
            </Field>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              loading={pending.has("maint")}
              onClick={() => run("maint", () => saveMaintenance(on, msg))}
            >
              Simpan pengaturan
            </Button>
          </div>
        </Card>

        {/* Fee platform */}
        <Card className="anim-rise">
          <CardHead
            title="Fee platform"
            sub="Persentase potongan dari setiap transaksi yang lunas"
            right={
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Percent className="size-4.5" />
              </span>
            }
          />
          <div className="rounded-xl bg-canvas p-4">
            <p className="text-[13px] font-semibold leading-6 text-mute">
              Fee dipotong otomatis dari total checkout sebelum masuk ke dompet seller.
              Perubahan langsung tercatat di audit log dan berlaku untuk transaksi baru.
            </p>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <div className="w-32">
              <Field label="Persentase">
                <TextInput
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                />
              </Field>
            </div>
            <div className="tnum flex-1 rounded-xl border border-dashed border-line bg-white px-4 py-3 text-[13px] font-semibold text-mute">
              Contoh: transaksi Rp 100.000 → seller menerima{" "}
              <b className="text-ink">
                {`Rp ${Math.round(100000 * (1 - (parseFloat(fee.replace(",", ".")) || 0) / 100)).toLocaleString("id-ID")}`}
              </b>{" "}
              (potongan {`Rp ${Math.round(100000 * ((parseFloat(fee.replace(",", ".")) || 0) / 100)).toLocaleString("id-ID")}`})
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              loading={pending.has("fee")}
              onClick={() => run("fee", () => saveFee(parseFloat(fee.replace(",", ".")) || 0))}
            >
              Simpan fee
            </Button>
          </div>
        </Card>

        {/* Data demo */}
        <Card className="anim-rise">
          <CardHead
            title="Data demo"
            sub="Seluruh data di build ini adalah data contoh untuk menguji UI"
            right={
              <span className="flex size-9 items-center justify-center rounded-lg bg-canvas text-mute">
                <Database className="size-4.5" />
              </span>
            }
          />
          <p className="text-[13px] font-semibold leading-6 text-mute">
            Jika Anda sudah mengutak-atik data (menyetujui premium, memproses penarikan,
            menangguhkan toko), muat ulang untuk mengembalikan ke kondisi awal yang konsisten.
          </p>
          <div className="mt-4 flex justify-end">
            <Button variant="dangerGhost" onClick={() => setReseedOpen(true)}>
              <Database className="size-4" />
              Muat ulang data demo
            </Button>
          </div>
        </Card>

        {/* Tentang */}
        <Card className="anim-rise">
          <CardHead
            title="Tentang build ini"
            sub="Admin Master — pratinjau UI"
            right={
              <span className="flex size-9 items-center justify-center rounded-lg bg-canvas text-mute">
                <Server className="size-4.5" />
              </span>
            }
          />
          <ul className="space-y-2.5 text-[13px] font-semibold text-mute">
            <li className="flex items-start gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-500" />
              Scope mengikuti PRD: AdminSellers, AdminPremium, AdminWithdrawals,
              AdminPayments, AdminUsers, AdminAnalytics — plus audit log ringkas,
              broadcast seller, dan pengaturan platform.
            </li>
            <li className="flex items-start gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-500" />
              Saat produksi, halaman ini tinggal dicolokkan ke backend Supabase TokoLink
              (tabel <code className="rounded bg-canvas px-1 text-[12px]">stores</code>,{" "}
              <code className="rounded bg-canvas px-1 text-[12px]">orders</code>,{" "}
              <code className="rounded bg-canvas px-1 text-[12px]">wallet</code>) dengan{" "}
              <code className="rounded bg-canvas px-1 text-[12px]">profiles.role = "admin"</code> —
              tanpa RBAC berlebihan.
            </li>
            <li className="flex items-start gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-500" />
              Setiap aksi yang menyentuh uang otomatis menulis entri ke audit log
              sebagai jejak untuk mencegah sengketa.
            </li>
          </ul>
        </Card>
      </div>

      <Modal
        open={reseedOpen}
        onClose={() => setReseedOpen(false)}
        title="Muat ulang data demo?"
        tone="bad"
        footer={
          <>
            <Button variant="outline" onClick={() => setReseedOpen(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              loading={pending.has("reseed")}
              onClick={() => {
                run("reseed", () => reseed());
                setReseedOpen(false);
              }}
            >
              Ya, muat ulang
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-mute">
          Semua perubahan yang sudah Anda buat (persetujuan, penarikan, status toko,
          audit log) akan dihapus dan diganti dengan data contoh baru.
        </p>
      </Modal>
    </div>
  );
}
