-- ============================================================
-- TokoLink — Migrasi Fase 3 (dijalankan di Supabase SQL Editor)
-- 1) Kolom access_token di orders (KEPUTUSAN user: opsi A, link token
--    per order untuk lacak buyer non-login)
-- 2) RLS policy Pola A untuk 9 tabel yang belum punya policy
--    (pola sama persis seperti "seller manages own products")
-- 3) Baca publik untuk kode promo AKTIF (kode promo sifatnya dibagikan
--    ke buyer; server tetap verifikasi ulang saat create-order)
-- Agent: file ini hanya dibaca user + dijalankan manual, bukan via kode.
-- ============================================================

-- ---------- 1) access_token ----------
alter table orders
  add column if not exists access_token uuid not null default gen_random_uuid();

-- ---------- 2) seller manages own (Pola A) ----------
create policy "seller manages own orders" on orders
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

create policy "seller manages own order_items" on order_items
  for all using (
    exists (select 1 from orders o
            where o.id = order_items.order_id
              and (o.seller_id = auth.uid() or is_admin()))
  )
  with check (
    exists (select 1 from orders o
            where o.id = order_items.order_id
              and (o.seller_id = auth.uid() or is_admin()))
  );

create policy "seller manages own payments" on payments
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

create policy "seller manages own ledger" on ledger
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

create policy "seller manages own withdrawals" on withdrawals
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

create policy "seller manages own bio_links" on bio_links
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

create policy "seller manages own discount_codes" on discount_codes
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

create policy "seller manages own store_hours" on store_hours
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

create policy "seller manages own premium_requests" on premium_requests
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

-- ---------- 3) publik: kode promo aktif ----------
-- Kode promo dibagikan ke buyer (banner toko), jadi boleh dibaca publik.
-- Kolom sensitif tidak ada di tabel ini; validasi final tetap di server.
create policy "public can read active discount codes" on discount_codes
  for select using (is_active = true);

-- ---------- verifikasi (jalankan setelah di atas) ----------
-- select tablename, policyname from pg_policies
-- where schemaname = 'public' order by 1, 2;
-- Harus muncul 4 policy products/profiles (lama) + 10 policy baru di atas.
-- select column_name, data_type from information_schema.columns
-- where table_name = 'orders' and column_name = 'access_token';
