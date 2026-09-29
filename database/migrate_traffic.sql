-- ============================================================
-- TokoLink — Migrasi tracking pengunjung (dijalankan di SQL Editor)
-- KEPUTUSAN user 29 Sep 2026: bangun tracking agar halaman Traffic real.
-- Anon BOLEH insert (beacon publik) tapi HANYA untuk seller_id yang
-- terdaftar; baca/ubah/hapus tetap milik seller + admin. Beacon
-- dibatasi 1x per sesi per toko di sisi frontend (sessionStorage).
-- ============================================================

create table if not exists store_visits (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  path text not null default '/',
  created_at timestamptz not null default now()
);

alter table store_visits enable row level security;

drop policy if exists "seller manages own visits" on store_visits;
create policy "seller manages own visits" on store_visits
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

drop policy if exists "public may log visits" on store_visits;
create policy "public may log visits" on store_visits
  for insert with check (
    exists (select 1 from profiles where id = store_visits.seller_id)
  );
