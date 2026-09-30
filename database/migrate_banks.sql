-- ============================================================
-- TokoLink — Migrasi rekening tersimpan (dijalankan di SQL Editor)
-- KEPUTUSAN user 29 Sep 2026: seller simpan ≥1 rekening, bisa tambah,
-- dan pilih saat tarik dana.
-- ============================================================

create table if not exists seller_banks (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  bank text not null,
  account_number text not null,
  holder text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table seller_banks enable row level security;

drop policy if exists "seller manages own banks" on seller_banks;
create policy "seller manages own banks" on seller_banks
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());
