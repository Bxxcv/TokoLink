import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ── Toko (tenant / seller) ────────────────────────────────────────────────
export const stores = pgTable(
  "stores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    owner: text("owner").notNull(),
    phone: text("phone").notNull(),
    city: text("city").notNull(),
    plan: text("plan").notNull().default("free"), // free | premium
    status: text("status").notNull().default("active"), // active | pending | suspended
    products: integer("products").notNull().default(0),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("stores_slug_idx").on(t.slug), index("stores_status_idx").on(t.status)],
);

// ── Pengguna platform (admin, seller, buyer) ──────────────────────────────
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    role: text("role").notNull().default("buyer"), // admin | seller | buyer
    status: text("status").notNull().default("active"), // active | suspended
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

// ── Transaksi pembayaran (checkout QRIS / transfer) ───────────────────────
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceNo: text("invoice_no").notNull(),
    storeId: uuid("store_id").notNull(),
    storeName: text("store_name").notNull(),
    item: text("item").notNull(),
    amount: integer("amount").notNull(), // rupiah
    fee: integer("fee").notNull().default(0), // fee platform, rupiah
    method: text("method").notNull().default("qris"), // qris | transfer | ewallet
    status: text("status").notNull().default("paid"), // paid | pending | failed
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("payments_invoice_idx").on(t.invoiceNo),
    index("payments_store_idx").on(t.storeId),
    index("payments_created_idx").on(t.createdAt),
  ],
);

// ── Permintaan upgrade premium ────────────────────────────────────────────
export const premiumRequests = pgTable(
  "premium_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id").notNull(),
    storeName: text("store_name").notNull(),
    period: text("period").notNull().default("bulanan"), // bulanan | tahunan
    price: integer("price").notNull(), // rupiah
    proof: text("proof"), // nama file bukti pembayaran
    status: text("status").notNull().default("pending"), // pending | approved | rejected
    note: text("note"), // catatan penjual
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedNote: text("resolved_note"), // catatan admin
  },
  (t) => [index("premium_status_idx").on(t.status)],
);

// ── Penarikan dana seller (withdrawal) ────────────────────────────────────
export const withdrawals = pgTable(
  "withdrawals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id").notNull(),
    storeName: text("store_name").notNull(),
    amount: integer("amount").notNull(), // rupiah
    bank: text("bank").notNull(),
    accountNo: text("account_no").notNull(), // tersensor
    status: text("status").notNull().default("pending"), // pending | processed | rejected
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedNote: text("resolved_note"),
  },
  (t) => [index("wd_status_idx").on(t.status)],
);

// ── Broadcast / pengumuman ke seller ──────────────────────────────────────
export const broadcasts = pgTable("broadcasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  segment: text("segment").notNull().default("all"), // all | premium | free
  status: text("status").notNull().default("sent"), // sent | draft
  recipients: integer("recipients").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdBy: text("created_by").notNull(),
});

// ── Audit log (ringkas: siapa, aksi, target, kapan, jumlah?) ──────────────
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    target: text("target").notNull(),
    detail: text("detail").notNull().default(""),
    amount: integer("amount"), // rupiah, nullable
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

// ── Pengaturan platform (key/value) ───────────────────────────────────────
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
