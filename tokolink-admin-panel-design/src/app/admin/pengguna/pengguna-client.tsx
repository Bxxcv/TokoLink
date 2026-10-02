"use client";

import { Ban, CheckCircle2, KeyRound, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { resetUserPassword, setUserStatus } from "@/actions/admin";
import {
  Button,
  Card,
  EmptyState,
  IconBtn,
  PageHeader,
  Select,
  StatusBadge,
  useAdminAction,
} from "@/components/ui";
import { avatarStyle, dateFull, timeAgo } from "@/lib/format";

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLES = [
  { key: "all", label: "Semua" },
  { key: "admin", label: "Admin" },
  { key: "seller", label: "Seller" },
  { key: "buyer", label: "Buyer" },
] as const;

export default function PenggunaClient({ data }: { data: UserRow[] }) {
  const [role, setRole] = useState<(typeof ROLES)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const { run, pending } = useAdminAction();

  const counts = useMemo(
    () => ({
      all: data.length,
      admin: data.filter((u) => u.role === "admin").length,
      seller: data.filter((u) => u.role === "seller").length,
      buyer: data.filter((u) => u.role === "buyer").length,
    }),
    [data],
  );

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter(
      (u) =>
        (role === "all" || u.role === role) &&
        (s === "" || (u.name + u.email + u.phone).toLowerCase().includes(s)),
    );
  }, [data, role, q]);

  return (
    <div>
      <PageHeader
        title="Pengguna"
        desc="Akun admin, seller, dan pembeli yang terdaftar di platform."
      />

      <div className="anim-rise mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
          {ROLES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
                role === r.key ? "bg-ink text-white" : "text-mute hover:text-ink"
              }`}
            >
              {r.label}
              <span className={`tnum ml-1 ${role === r.key ? "text-white/60" : "text-mute/70"}`}>{counts[r.key]}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-56">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / email…"
            className="h-9.5 w-full rounded-xl border border-line bg-white pr-3 pl-9 text-sm outline-none transition placeholder:text-mute/70 focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
          />
        </div>
      </div>

      <Card pad={false} className="anim-rise overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<UserPlus className="size-5" />} title="Tidak ada pengguna" desc="Coba ubah kata kunci atau filter peran." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-line text-[10.5px] font-extrabold tracking-wider text-mute uppercase">
                  <th className="px-5 py-3">Pengguna</th>
                  <th className="px-4 py-3">Kontak</th>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Login terakhir</th>
                  <th className="px-4 py-3">Bergabung</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="group border-b border-line/70 transition last:border-0 hover:bg-canvas/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-extrabold" style={avatarStyle(u.name)}>
                          {u.name.split(" ").slice(0, 2).map((x) => x[0]).join("")}
                        </span>
                        <p className="text-[13.5px] font-bold">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[12.5px] font-semibold">{u.email}</p>
                      <p className="tnum text-[11.5px] font-semibold text-mute">{u.phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.role} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] font-semibold text-mute">
                      {u.lastLoginAt ? timeAgo(u.lastLoginAt) : "belum login"}
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] font-semibold text-mute">{dateFull(u.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-0.5 opacity-60 transition group-hover:opacity-100">
                        {u.role !== "admin" && (
                          <>
                            <IconBtn
                              tone="neutral"
                              label="Kirim link reset password"
                              disabled={pending.has(u.id + "-pw")}
                              onClick={() => run(u.id + "-pw", () => resetUserPassword(u.id))}
                            >
                              {pending.has(u.id + "-pw") ? (
                                <span className="size-4 animate-spin rounded-full border-2 border-line border-t-ink" />
                              ) : (
                                <KeyRound className="size-4" />
                              )}
                            </IconBtn>
                            {u.status === "suspended" ? (
                              <IconBtn
                                tone="ok"
                                label="Aktifkan akun"
                                disabled={pending.has(u.id + "-st")}
                                onClick={() => run(u.id + "-st", () => setUserStatus(u.id, "active"))}
                              >
                                {pending.has(u.id + "-st") ? (
                                  <span className="size-4 animate-spin rounded-full border-2 border-ok-100 border-t-ok-600" />
                                ) : (
                                  <CheckCircle2 className="size-4" />
                                )}
                              </IconBtn>
                            ) : (
                              <IconBtn
                                tone="bad"
                                label="Tangguhkan akun"
                                disabled={pending.has(u.id + "-st")}
                                onClick={() => run(u.id + "-st", () => setUserStatus(u.id, "suspended"))}
                              >
                                <Ban className="size-4" />
                              </IconBtn>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="mt-3 flex items-center gap-2 text-[11.5px] font-semibold text-mute">
        <Button variant="ghost" size="sm" disabled className="pointer-events-none opacity-60">
          <UserPlus className="size-3.5" />
          Tambah pengguna
        </Button>
        — akun biasanya dibuat saat seller mendaftar toko; dibuat manual hanya untuk admin baru.
      </p>
    </div>
  );
}
