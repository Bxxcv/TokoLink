-- ============================================================
-- TokoLink — Audit log & broadcast pengumuman untuk Admin Master
-- Diturunkan dari desain referensi admin panel (2 Okt 2026) -- skema
-- tabelnya dipakai sebagai acuan, TAPI diadaptasi ke konvensi Supabase
-- kita (profiles sebagai FK, bukan teks bebas; RLS pola is_admin()
-- dari database/schema.sql). Lihat .opencode/skill/supabase-rls-patterns.
-- Scope sengaja diminimalkan (bukan sistem log lengkap/template
-- management) -- lihat diskusi di TASKS.md soal AdminSystem.
-- ============================================================

-- ── audit_log: siapa, aksi apa, kapan -- khusus aksi yang nyentuh uang
-- (approve premium, proses withdrawal), bukan log semua klik. ──────────
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references profiles(id),
  action text not null,              -- mis. 'approve_premium', 'withdrawal_selesai'
  target_type text not null,         -- mis. 'premium_requests', 'withdrawals'
  target_id uuid,
  detail text not null default '',
  amount numeric(12,2),              -- rupiah, nullable (cuma relevan buat aksi uang)
  created_at timestamptz not null default now()
);
create index audit_log_created_idx on audit_log (created_at desc);

alter table audit_log enable row level security;

create policy "admin reads audit log" on audit_log
  for select using (is_admin());

-- Insert HANYA lewat RPC security definer -- supaya admin tidak bisa
-- menulis entri log palsu/menghapus jejak lewat client langsung.
create or replace function log_admin_action(
  p_action text, p_target_type text, p_target_id uuid,
  p_detail text default '', p_amount numeric default null
) returns void as $$
  insert into audit_log (actor_id, action, target_type, target_id, detail, amount)
  select auth.uid(), p_action, p_target_type, p_target_id, p_detail, p_amount
  where is_admin();
$$ language sql security definer set search_path = public;

grant execute on function log_admin_action(text, text, uuid, text, numeric) to authenticated;

-- ── broadcasts: pengumuman admin ke seller (bukan sistem template/CMS,
-- cukup judul+pesan+target segmen). ────────────────────────────────────
create table broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  segment text not null default 'all' check (segment in ('all', 'premium', 'gratis')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

alter table broadcasts enable row level security;

create policy "admin manages broadcasts" on broadcasts
  for all using (is_admin()) with check (is_admin());

create policy "seller reads broadcasts for their segment" on broadcasts
  for select using (
    segment = 'all'
    or (segment = 'premium' and exists (
      select 1 from profiles where id = auth.uid() and plan = 'premium'
    ))
    or (segment = 'gratis' and exists (
      select 1 from profiles where id = auth.uid() and plan = 'gratis'
    ))
  );

-- ── settings: key/value sederhana, dipakai AdminSystem (mis. maintenance
-- mode, fee platform -- lihat docs/PRD.md §3 yang masih TBD). ──────────
create table settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

create policy "admin manages settings" on settings
  for all using (is_admin()) with check (is_admin());

create policy "public reads settings" on settings
  for select using (true); -- mis. maintenance_mode perlu dibaca halaman publik
