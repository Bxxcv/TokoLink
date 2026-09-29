-- ============================================================
-- TokoLink — Migrasi tema toko (dijalankan di Supabase SQL Editor)
-- Tabel store_theme: pengaturan tampilan per seller (1 baris per seller).
-- Dibaca publik agar etalase bisa menerapkan warna/susunannya.
-- ============================================================

create table if not exists store_theme (
  seller_id uuid primary key references profiles(id) on delete cascade,
  accent text not null default 'Biru',
  layout text not null default 'Kisi',
  show_hours boolean not null default true,
  show_qr boolean not null default true,
  show_reviews boolean not null default false,
  show_cart boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table store_theme enable row level security;

drop policy if exists "seller manages own theme" on store_theme;
create policy "seller manages own theme" on store_theme
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

drop policy if exists "public can read theme" on store_theme;
create policy "public can read theme" on store_theme
  for select using (true);
