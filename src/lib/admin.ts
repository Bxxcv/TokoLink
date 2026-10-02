/**
 * Helper khusus halaman Admin Master: pengaturan platform + log audit.
 * Semua query di sini butuh RLS is_admin() (lihat
 * database/migrate_fase6_admin.sql) — aman dipanggil dari browser karena
 * hanya memakai anon key.
 */
import { supabase } from "./supabase";

export type Settings = Record<string, string>;

/** Nilai bawaan kalau tabel `platform_settings` belum diisi. */
export const DEFAULT_SETTINGS: Settings = {
  fee_qris_pct: "0,7",
  min_withdraw: "50000",
  auto_withdraw_limit: "5000000",
  bank_fee: "Rp6.500",
  promo_max_days: "90 hari",
  maintenance_until: "",
  channels: JSON.stringify([
    { t: "QRIS", d: "Semua e-wallet dan m-banking", on: true },
    { t: "Transfer bank manual", d: "Verifikasi otomatis via rekening bersama", on: true },
    { t: "Dompet digital (GoPay, OVO, DANA)", d: "Sedang uji coba", on: false },
    { t: "Bayar di tempat (COD)", d: "Baru untuk Jawa & Bali", on: false },
  ]),
};

/** Baca semua pengaturan; kunci yang belum ada diisi nilai default. */
export async function loadSettings(): Promise<Settings> {
  const { data } = await supabase.from("platform_settings").select("key,value");
  const out: Settings = { ...DEFAULT_SETTINGS };
  ((data ?? []) as { key: string; value: string }[]).forEach((r) => {
    out[r.key] = r.value;
  });
  return out;
}

/** Simpan pengaturan (upsert per kunci). Gagal → false, jangan diamkan. */
export async function saveSettings(patch: Settings): Promise<boolean> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id ?? null;
  const rows = Object.entries(patch).map(([key, value]) => ({
    key,
    value: String(value),
    updated_at: new Date().toISOString(),
    updated_by: uid,
  }));
  if (rows.length === 0) return true;
  const { error } = await supabase
    .from("platform_settings")
    .upsert(rows, { onConflict: "key" });
  return !error;
}

/** Catat satu aksi admin ke `admin_audit_log`. Gagal tidak boleh mengganggu UX. */
export async function logAudit(action: string, target?: string, detail?: string): Promise<void> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user) return;
    await supabase.from("admin_audit_log").insert({
      actor_id: user.id,
      actor_name:
        (user.user_metadata?.owner_name as string | undefined) ??
        user.email ??
        "Admin",
      action,
      target: target ?? null,
      detail: detail ?? null,
    });
  } catch {
    /* log audit tidak boleh memblokir aksi utama */
  }
}

export type AuditRow = {
  id: string;
  actor_name: string | null;
  action: string;
  target: string | null;
  detail: string | null;
  created_at: string;
};

/** 6 aksi admin terakhir untuk sidebar "Log audit terakhir". */
export async function loadAudit(limit = 6): Promise<AuditRow[]> {
  const { data } = await supabase
    .from("admin_audit_log")
    .select("id,actor_name,action,target,detail,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as AuditRow[];
}

/* ------------------------------ owner gate ------------------------------ */

/**
 * Daftar email pemilik platform (`VITE_OWNER_EMAILS`, dipisah koma).
 * Ini hanya gerbang TAMPILAN (menyembunyikan /admin dari admin lain) —
 * keamanan sesungguhnya tetap di RLS + server function.
 */
export function ownerEmails(): string[] {
  const raw = (import.meta.env.VITE_OWNER_EMAILS as string | undefined) ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return ownerEmails().includes(email.trim().toLowerCase());
}
