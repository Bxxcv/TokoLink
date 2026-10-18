-- ============================================================
-- Reports — laporan toko/pengguna (P1). Idempoten.
-- ============================================================
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references profiles(id) on delete set null,
  target_type text not null check (target_type in ('store','product','user')),
  target_id text not null,
  reason text not null check (length(reason) between 3 and 500),
  status text not null default 'menunggu' check (status in ('menunggu','ditinjau','ditolak','ditindak')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references profiles(id)
);

alter table reports enable row level security;

-- Siapa pun (termasuk anon) boleh membuat laporan, tapi tidak membaca.
drop policy if exists "anyone can create report" on reports;
create policy "anyone can create report" on reports
  for insert with check (true);

-- Hanya admin yang bisa baca/ubah status.
drop policy if exists "admin manages reports" on reports;
create policy "admin manages reports" on reports
  for all using (is_admin()) with check (is_admin());

create index if not exists reports_status_idx on reports(status, created_at desc);
create index if not exists reports_target_idx on reports(target_type, target_id);
