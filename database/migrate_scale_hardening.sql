-- ============================================================
-- TokoLink — Skala + hardening (Okt 2026, hasil audit 6 agen)
-- 1) Indeks kolom terpanas (sebelumnya HAMPIR NOL — FK tidak otomatis
--    diindeks; query seller + webhook melambat saat data 100x).
-- 2) CHECK harga/stok (NOT VALID = data lama tidak dicek, baris baru
--    wajib benar; validasi frontend saja tidak cukup).
-- 3) Cabut GRANT consume_promo dari authenticated (hanya service_role
--    yang memanggil via create-order; cegah bakar kuota toko lain).
-- 4) Cabut baca publik tabel settings (tidak ada halaman publik yang
--    baca; admin tetap via policy admin, webhook via service_role).
-- 5) Cabut insert anon store_visits (diganti /api/visit + rate limit).
-- 6) orders.promo_id + RPC restore_promo (kuota kembali saat batal).
-- Idempotent. Jalankan di SQL editor Supabase.
-- ============================================================

-- ---------- 1) indeks ----------
create index if not exists orders_seller_created_idx on orders (seller_id, created_at desc);
create index if not exists orders_status_idx on orders (status);
create index if not exists order_items_order_idx on order_items (order_id);
create index if not exists payments_order_idx on payments (order_id);
create index if not exists payments_extref_idx on payments (external_ref);
create index if not exists payments_seller_idx on payments (seller_id);
create index if not exists ledger_seller_created_idx on ledger (seller_id, created_at desc);
create index if not exists products_seller_idx on products (seller_id);
create index if not exists store_visits_seller_created_idx on store_visits (seller_id, created_at desc);
create index if not exists withdrawals_seller_status_idx on withdrawals (seller_id, status);
create index if not exists discount_codes_seller_idx on discount_codes (seller_id);
create index if not exists bio_links_seller_idx on bio_links (seller_id);
create index if not exists reviews_seller_idx on reviews (seller_id);
create index if not exists premium_requests_seller_status_idx on premium_requests (seller_id, status);

-- ---------- 2) CHECK harga & stok ----------
alter table products
  drop constraint if exists products_price_check;
alter table products
  add constraint products_price_check check (price > 0) not valid;
alter table products
  drop constraint if exists products_stock_check;
alter table products
  add constraint products_stock_check check (stock >= 0) not valid;

-- ---------- 3) consume_promo hanya service_role ----------
revoke execute on function consume_promo(uuid) from authenticated;

-- ---------- 4) settings: admin saja ----------
drop policy if exists "public reads settings" on settings;

-- ---------- 5) store_visits: insert hanya via server ----------
drop policy if exists "public may log visits" on store_visits;

-- ---------- 6) kuota promo kembali ----------
alter table orders
  add column if not exists promo_id uuid;

create or replace function restore_promo(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update discount_codes
  set used_count = greatest(0, used_count - 1)
  where id = p_id;
end;
$$;

revoke execute on function restore_promo(uuid) from anon, authenticated;

-- ---------- verifikasi ----------
-- select indexname from pg_indexes where schemaname='public'
--   and indexname like '%_idx' order by 1;  -- harus 14+ baris baru di atas
-- insert products(seller_id,name,category,price) values (... ,0)
--   sebagai seller → ERROR products_price_check.
-- select * from discount_codes; sebagai anon → 0 baris.
