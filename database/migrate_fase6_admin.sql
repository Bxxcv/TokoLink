-- ============================================================
-- TokoLink — Migrasi Fase 6: Admin Master
-- Jalankan di Supabase SQL Editor SETELAH database/schema.sql
-- (butuh function is_admin() yang dibuat di schema.sql).
--
-- Menambah 2 tabel:
--   1. platform_settings — pengaturan platform (fee, limit, kanal bayar,
--      mode pemeliharaan). Satu baris per kunci.
--   2. admin_audit_log  — jejak aksi admin (append-only, tidak ada policy
--      update/delete supaya riwayat tidak bisa dihapus).
-- ============================================================

-- ---------- platform_settings ----------
create table if not exists platform_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id) on delete set null
);

alter table platform_settings enable row level security;

-- Hanya admin (is_admin()) yang boleh baca & ubah. Tidak ada policy publik:
-- kalau nanti etalase butuh nilai tertentu (mis. kanal bayar aktif),
-- tambahkan policy SELECT terpisah di migrasi berikutnya.
drop policy if exists "admin manages platform settings" on platform_settings;
create policy "admin manages platform settings" on platform_settings
  for all using (is_admin()) with check (is_admin());

insert into platform_settings (key, value) values
  ('fee_qris_pct',        '0,7'),
  ('min_withdraw',        '50000'),
  ('auto_withdraw_limit', '5000000'),
  ('bank_fee',            'Rp6.500'),
  ('promo_max_days',      '90 hari'),
  ('maintenance_until',   ''),
  ('channels',            '[{"t":"QRIS","d":"Semua e-wallet dan m-banking","on":true},{"t":"Transfer bank manual","d":"Verifikasi otomatis via rekening bersama","on":true},{"t":"Dompet digital (GoPay, OVO, DANA)","d":"Sedang uji coba","on":false},{"t":"Bayar di tempat (COD)","d":"Baru untuk Jawa & Bali","on":false}]')
on conflict (key) do nothing;

-- ---------- admin_audit_log ----------
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  actor_name text,
  action text not null,
  target text,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx
  on admin_audit_log (created_at desc);

alter table admin_audit_log enable row level security;

drop policy if exists "admin reads audit log" on admin_audit_log;
create policy "admin reads audit log" on admin_audit_log
  for select using (is_admin());

-- Insert saja (append-only). actor_id harus = user yang login.
drop policy if exists "admin writes audit log" on admin_audit_log;
create policy "admin writes audit log" on admin_audit_log
  for insert with check (is_admin() and actor_id = auth.uid());
