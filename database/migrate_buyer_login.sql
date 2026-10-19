-- ============================================================
-- Buyer wajib login (P0/P1 keputusan user 18 Okt 2026)
-- 1) orders.buyer_id → FK auth.users (nullable, backward-compat link token).
-- 2) RLS: buyer baca order miliknya (buyer_id = auth.uid()).
-- 3) Index buyer_id.
-- ============================================================
alter table orders add column if not exists buyer_id uuid references auth.users(id) on delete set null;
create index if not exists orders_buyer_idx on orders(buyer_id, created_at desc);

-- Policy tambahan: buyer baca order miliknya sendiri (tanpa menghapus policy seller).
drop policy if exists "buyer reads own orders" on orders;
create policy "buyer reads own orders" on orders
  for select using (buyer_id = auth.uid());
