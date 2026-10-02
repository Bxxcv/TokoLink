// Lapisan data server untuk Admin Master.
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLog,
  broadcasts,
  payments,
  premiumRequests,
  settings,
  stores,
  users,
  withdrawals,
} from "@/db/schema";

const DAY = 86400000;

export interface AuditRow {
  id: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
  amount: number | null;
  createdAt: string;
}

const auditRow = (r: {
  id: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
  amount: number | null;
  createdAt: Date;
}): AuditRow => ({ ...r, createdAt: r.createdAt.toISOString() });

// ── Shell (sidebar + topbar) ─────────────────────────────────────────────
export async function getShellData() {
  const [settingsRows, audit, storeRows, premP, wdP] = await Promise.all([
    db.select().from(settings),
    db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(6),
    db.select().from(stores),
    db.select().from(premiumRequests).where(eq(premiumRequests.status, "pending")),
    db.select().from(withdrawals).where(eq(withdrawals.status, "pending")),
  ]);
  const sm: Record<string, string> = Object.fromEntries(
    settingsRows.map((r) => [r.key, r.value]),
  );
  return {
    maintenanceOn: sm["maintenance"] === "on",
    maintenanceMessage: sm["maintenance_message"] ?? "",
    feePct: Number(sm["fee_pct"] ?? "2.5"),
    recentAudit: audit.map(auditRow),
    stores: storeRows.map((s) => ({ name: s.name, slug: s.slug })),
    pending: {
      premium: premP.length,
      withdrawals: wdP.length,
      stores: storeRows.filter((s) => s.status === "pending").length,
    },
  };
}

// ── Dashboard ────────────────────────────────────────────────────────────
interface PayLike {
  amount: number;
  status: string;
  method: string;
  createdAt: Date;
  storeName: string;
  storeId: string;
}

function windowMetrics(pays: PayLike[], w: number) {
  const end = Date.now();
  const start = end - w * DAY;
  const prevStart = start - w * DAY;
  const paid = pays.filter((p) => p.status === "paid");
  const inW = paid.filter((p) => p.createdAt.getTime() >= start && p.createdAt.getTime() <= end);
  const prev = paid.filter((p) => p.createdAt.getTime() >= prevStart && p.createdAt.getTime() < start);
  const gmv = inW.reduce((a, p) => a + p.amount, 0);
  const prevGmv = prev.reduce((a, p) => a + p.amount, 0);
  const orders = inW.length;
  const prevOrders = prev.length;
  const gmvDelta = prevGmv > 0 ? ((gmv - prevGmv) / prevGmv) * 100 : null;
  const ordersDelta = prevOrders > 0 ? ((orders - prevOrders) / prevOrders) * 100 : null;

  // seri waktu
  const buckets: { label: string; value: number }[] = [];
  const bucketDays = w === 90 ? 6 : 1;
  const n = Math.ceil(w / bucketDays);
  for (let i = n - 1; i >= 0; i--) {
    const bEnd = end - i * bucketDays * DAY;
    const bStart = bEnd - bucketDays * DAY;
    const v = paid
      .filter((p) => {
        const t = p.createdAt.getTime();
        return t > bStart && t <= bEnd;
      })
      .reduce((a, p) => a + p.amount, 0);
    const d = new Date(bEnd - (bucketDays * DAY) / 2);
    buckets.push({
      label: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(d),
      value: v,
    });
  }

  const methods = [
    { key: "qris", label: "QRIS", value: inW.filter((p) => p.method === "qris").reduce((a, p) => a + p.amount, 0) },
    { key: "transfer", label: "Transfer Bank", value: inW.filter((p) => p.method === "transfer").reduce((a, p) => a + p.amount, 0) },
    { key: "ewallet", label: "E-Wallet", value: inW.filter((p) => p.method === "ewallet").reduce((a, p) => a + p.amount, 0) },
  ];

  return { gmv, orders, gmvDelta, ordersDelta, series: buckets, methods };
}

export async function getDashboardData() {
  const [payRows, storeRows, userRows, audit] = await Promise.all([
    db.select().from(payments),
    db.select().from(stores),
    db.select().from(users),
    db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(6),
  ]);
  const now = Date.now();

  const top = new Map<string, { name: string; slug: string; gmv: number; orders: number }>();
  for (const p of payRows) {
    if (p.status !== "paid" || p.createdAt.getTime() < now - 30 * DAY) continue;
    const st = storeRows.find((s) => s.id === p.storeId);
    const cur = top.get(p.storeId) ?? { name: p.storeName, slug: st?.slug ?? "", gmv: 0, orders: 0 };
    cur.gmv += p.amount;
    cur.orders += 1;
    top.set(p.storeId, cur);
  }
  const topStores = [...top.values()].sort((a, b) => b.gmv - a.gmv).slice(0, 5);

  const [premP, wdP, storeP] = await Promise.all([
    db.select().from(premiumRequests).where(eq(premiumRequests.status, "pending")),
    db.select().from(withdrawals).where(eq(withdrawals.status, "pending")),
    db.select().from(stores).where(eq(stores.status, "pending")),
  ]);

  return {
    windows: {
      "7": windowMetrics(payRows, 7),
      "30": windowMetrics(payRows, 30),
      "90": windowMetrics(payRows, 90),
    },
    topStores,
    recentAudit: audit.map(auditRow),
    totals: {
      totalStores: storeRows.length,
      activeStores: storeRows.filter((s) => s.status === "active").length,
      pendingStores: storeP.length,
      premiumStores: storeRows.filter((s) => s.plan === "premium").length,
      totalUsers: userRows.length,
      newUsers7: userRows.filter((u) => u.createdAt.getTime() >= now - 7 * DAY).length,
    },
    pending: {
      premium: premP.length,
      premiumAmount: premP.reduce((a, r) => a + r.price, 0),
      withdrawals: wdP.length,
      withdrawalAmount: wdP.reduce((a, r) => a + r.amount, 0),
      stores: storeP.length,
    },
  };
}

// ── Toko ─────────────────────────────────────────────────────────────────
export async function getStoresData() {
  const [storeRows, payRows] = await Promise.all([
    db.select().from(stores),
    db.select().from(payments),
  ]);
  const now = Date.now();
  const stats = new Map<string, { gmv: number; orders: number }>();
  for (const p of payRows) {
    if (p.status !== "paid" || p.createdAt.getTime() < now - 30 * DAY) continue;
    const cur = stats.get(p.storeId) ?? { gmv: 0, orders: 0 };
    cur.gmv += p.amount;
    cur.orders += 1;
    stats.set(p.storeId, cur);
  }
  return storeRows
    .map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      owner: s.owner,
      phone: s.phone,
      city: s.city,
      plan: s.plan,
      status: s.status,
      products: s.products,
      joinedAt: s.joinedAt.toISOString(),
      lastActiveAt: s.lastActiveAt.toISOString(),
      gmv30: stats.get(s.id)?.gmv ?? 0,
      orders30: stats.get(s.id)?.orders ?? 0,
    }))
    .sort((a, b) => b.gmv30 - a.gmv30);
}

// ── Premium / Transaksi / Withdrawal / Pengguna / Broadcast / Audit ─────
export async function getPremiumData() {
  const rows = await db.select().from(premiumRequests).orderBy(desc(premiumRequests.requestedAt));
  return rows.map((r) => ({
    id: r.id,
    storeName: r.storeName,
    period: r.period,
    price: r.price,
    proof: r.proof,
    note: r.note,
    status: r.status,
    requestedAt: r.requestedAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
    resolvedNote: r.resolvedNote,
  }));
}

export async function getPaymentsData() {
  const rows = await db.select().from(payments).orderBy(desc(payments.createdAt));
  return rows.map((r) => ({
    id: r.id,
    invoiceNo: r.invoiceNo,
    storeName: r.storeName,
    item: r.item,
    amount: r.amount,
    fee: r.fee,
    method: r.method,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getWithdrawalsData() {
  const rows = await db.select().from(withdrawals).orderBy(desc(withdrawals.requestedAt));
  return rows.map((r) => ({
    id: r.id,
    storeName: r.storeName,
    amount: r.amount,
    bank: r.bank,
    accountNo: r.accountNo,
    status: r.status,
    requestedAt: r.requestedAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
    resolvedNote: r.resolvedNote,
  }));
}

export async function getUsersData() {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    role: r.role,
    status: r.status,
    lastLoginAt: r.lastLoginAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getBroadcastsData() {
  const [rows, storeRows] = await Promise.all([
    db.select().from(broadcasts),
    db.select().from(stores),
  ]);
  const active = storeRows.filter((s) => s.status === "active");
  return {
    rows: rows
      .map((r) => ({
        id: r.id,
        title: r.title,
        message: r.message,
        segment: r.segment,
        status: r.status,
        recipients: r.recipients,
        sentAt: r.sentAt?.toISOString() ?? null,
        createdBy: r.createdBy,
      }))
      .sort((a, b) => (b.sentAt ?? "").localeCompare(a.sentAt ?? "") || 0),
    segmentCounts: {
      all: active.length,
      premium: active.filter((s) => s.plan === "premium").length,
      free: active.filter((s) => s.plan === "free").length,
    },
  };
}

export async function getAuditData() {
  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(200);
  return rows.map(auditRow);
}

export async function getSettingsData() {
  const rows = await db.select().from(settings);
  const sm: Record<string, string> = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    maintenanceOn: sm["maintenance"] === "on",
    maintenanceMessage: sm["maintenance_message"] ?? "",
    feePct: Number(sm["fee_pct"] ?? "2.5"),
  };
}
