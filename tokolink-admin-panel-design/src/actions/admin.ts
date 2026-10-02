"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  broadcasts,
  premiumRequests,
  settings,
  stores,
  users,
  withdrawals,
  auditLog,
} from "@/db/schema";
import { reseedDemo } from "@/db/seed";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const ACTOR = "Muhammad Farid";

async function logAudit(
  action: string,
  target: string,
  detail: string,
  amount: number | null = null,
) {
  await db.insert(auditLog).values({
    actor: ACTOR,
    action,
    target,
    detail,
    amount,
  });
}

function done() {
  revalidatePath("/", "layout");
}

// ── Toko ─────────────────────────────────────────────────────────────────
export async function setStoreStatus(
  id: string,
  status: "active" | "suspended" | "pending",
): Promise<ActionResult> {
  const row = await db
    .update(stores)
    .set({ status })
    .where(eq(stores.id, id))
    .returning();
  const name = row[0]?.name ?? "toko";
  const label =
    status === "active" ? "Toko diaktifkan" : status === "suspended" ? "Toko ditangguhkan" : "Toko ditandai menunggu verifikasi";
  await logAudit(label, name, `Status toko diubah menjadi “${status}”.`);
  done();
  return { ok: true, message: `${label}: ${name}.` };
}

export async function setStorePlan(id: string, plan: "free" | "premium"): Promise<ActionResult> {
  const row = await db
    .update(stores)
    .set({ plan })
    .where(eq(stores.id, id))
    .returning();
  const name = row[0]?.name ?? "toko";
  if (plan === "premium") {
    await logAudit(
      "Upgrade premium manual",
      name,
      "Paket di-upgrade manual oleh admin (tanpa pembayaran masuk).",
      99000,
    );
    return { ok: true, message: `${name} di-upgrade ke Premium secara manual.` };
  }
  await logAudit(
    "Turun paket ke Gratis",
    name,
    "Paket Premium dimatikan manual oleh admin.",
    null,
  );
  done();
  return { ok: true, message: `${name} diturunkan ke paket Gratis.` };
}

// ── Premium ──────────────────────────────────────────────────────────────
export async function resolvePremium(
  id: string,
  decision: "approved" | "rejected",
  note: string,
): Promise<ActionResult> {
  const req = await db
    .update(premiumRequests)
    .set({
      status: decision,
      resolvedAt: new Date(),
      resolvedNote: note.trim() || null,
    })
    .where(eq(premiumRequests.id, id))
    .returning();
  const r = req[0];
  if (!r) return { ok: false, message: "Permintaan tidak ditemukan." };

  if (decision === "approved") {
    await db.update(stores).set({ plan: "premium" }).where(eq(stores.id, r.storeId));
    await logAudit(
      "Upgrade premium disetujui",
      r.storeName,
      `Paket ${r.period} · ${r.proof ?? "tanpa bukti"}${note ? " · Catatan: " + note : ""}`,
      r.price,
    );
    done();
    return { ok: true, message: `Premium ${r.storeName} disetujui & paket diaktifkan.` };
  }
  await logAudit(
    "Upgrade premium ditolak",
    r.storeName,
    note ? note : "Permintaan upgrade ditolak.",
    r.price,
  );
  done();
  return { ok: true, message: `Permintaan ${r.storeName} ditolak.` };
}

// ── Withdrawal ───────────────────────────────────────────────────────────
export async function resolveWithdrawal(
  id: string,
  decision: "processed" | "rejected",
  note: string,
): Promise<ActionResult> {
  const wd = await db
    .update(withdrawals)
    .set({
      status: decision,
      resolvedAt: new Date(),
      resolvedNote: note.trim() || null,
    })
    .where(eq(withdrawals.id, id))
    .returning();
  const w = wd[0];
  if (!w) return { ok: false, message: "Permintaan tidak ditemukan." };

  if (decision === "processed") {
    await logAudit(
      "Tarik dana diproses",
      w.storeName,
      `Dana dikirim ke ${w.bank} •• ${w.accountNo.split(" ").slice(-2).join(" ").replace(/\D/g, "").slice(-4)}${note ? " · " + note : ""}.`,
      w.amount,
    );
    done();
    return { ok: true, message: `Penarikan ${w.storeName} diproses.` };
  }
  await logAudit(
    "Tarik dana ditolak",
    w.storeName,
    note ? note : "Penarikan dana ditolak.",
    w.amount,
  );
  done();
  return { ok: true, message: `Penarikan ${w.storeName} ditolak.` };
}

// ── Broadcast ────────────────────────────────────────────────────────────
export async function createBroadcast(input: {
  title: string;
  message: string;
  segment: "all" | "premium" | "free";
}): Promise<ActionResult> {
  const storeRows = await db.select().from(stores);
  const active = storeRows.filter((s) => s.status === "active");
  const recipients =
    input.segment === "all"
      ? active.length
      : active.filter((s) => (input.segment === "premium" ? s.plan === "premium" : s.plan === "free")).length;
  await db.insert(broadcasts).values({
    title: input.title.trim(),
    message: input.message.trim(),
    segment: input.segment,
    status: "sent",
    recipients,
    sentAt: new Date(),
    createdBy: ACTOR,
  });
  const segLabel =
    input.segment === "all" ? "semua toko" : `toko ${input.segment === "premium" ? "Premium" : "Gratis"}`;
  await logAudit(
    "Pengumuman terkirim",
    "Broadcast",
    `“${input.title.trim()}” dikirim ke ${recipients} toko (${segLabel}).`,
  );
  done();
  return { ok: true, message: `Pengumuman terkirim ke ${recipients} toko.` };
}

export async function sendDraftBroadcast(id: string): Promise<ActionResult> {
  const row = await db
    .update(broadcasts)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(broadcasts.id, id))
    .returning();
  const b = row[0];
  if (!b) return { ok: false, message: "Draf tidak ditemukan." };
  await logAudit("Pengumuman terkirim", "Broadcast", `Draf “${b.title}” dikirim.`);
  done();
  return { ok: true, message: `“${b.title}” dikirim.` };
}

// ── Pengguna ─────────────────────────────────────────────────────────────
export async function setUserStatus(
  id: string,
  status: "active" | "suspended",
): Promise<ActionResult> {
  const row = await db
    .update(users)
    .set({ status })
    .where(eq(users.id, id))
    .returning();
  const name = row[0]?.name ?? "pengguna";
  await logAudit(
    status === "suspended" ? "Pengguna ditangguhkan" : "Pengguna diaktifkan",
    name,
    "Dilakukan dari Admin Master.",
  );
  done();
  return {
    ok: true,
    message: status === "suspended" ? `Akun ${name} ditangguhkan.` : `Akun ${name} diaktifkan.`,
  };
}

export async function resetUserPassword(id: string): Promise<ActionResult> {
  const row = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const email = row[0]?.email ?? "pengguna";
  await logAudit("Reset password dipicu", "Pengguna", `Link reset dikirim ke ${email} (demo).`);
  done();
  return { ok: true, message: `Link reset password dikirim ke ${email}.` };
}

// ── Pengaturan ───────────────────────────────────────────────────────────
export async function saveMaintenance(
  on: boolean,
  message: string,
): Promise<ActionResult> {
  await db.insert(settings)
    .values({ key: "maintenance", value: on ? "on" : "off" })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: on ? "on" : "off" },
    });
  await db.insert(settings)
    .values({ key: "maintenance_message", value: message.trim() })
    .onConflictDoUpdate({ target: settings.key, set: { value: message.trim() } });
  await logAudit(
    on ? "Mode maintenance diaktifkan" : "Mode maintenance dimatikan",
    "Sistem",
    on ? `Pesan: “${message.trim() || "—"}”` : "Semua layanan kembali normal.",
  );
  done();
  return {
    ok: true,
    message: on ? "Mode maintenance aktif. Toko akan melihat halaman maintenance." : "Mode maintenance dimatikan.",
  };
}

export async function saveFee(pct: number): Promise<ActionResult> {
  const clamped = Math.min(10, Math.max(0, Number(pct.toFixed(1))));
  await db.insert(settings)
    .values({ key: "fee_pct", value: String(clamped) })
    .onConflictDoUpdate({ target: settings.key, set: { value: String(clamped) } });
  await logAudit(
    "Fee platform diubah",
    "Pengaturan",
    `Fee transaksi platform diatur ke ${clamped.toLocaleString("id-ID")}%.`,
  );
  done();
  return { ok: true, message: `Fee platform disimpan: ${clamped.toLocaleString("id-ID")}%.` };
}

// ── Data demo ────────────────────────────────────────────────────────────
export async function reseed(): Promise<ActionResult> {
  await reseedDemo();
  done();
  return { ok: true, message: "Data demo dimuat ulang." };
}
