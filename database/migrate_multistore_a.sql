-- ============================================================
-- TokoLink — Multi-toko FASE A: tabel stores (ADITIF, TANPA DOWNTIME)
-- Keputusan user 13 Okt 2026: Premium per AKUN, dompet GABUNGAN.
-- Maka yang pindah ke toko HANYA data etalase/katalog; plan, saldo,
-- rekening, premium_requests TETAP di user (profiles/ledger/dll
-- TIDAK disentuh file ini).
--
-- Prinsip aman: HANYA menambah (tabel/kolom/policy/view baru) +
-- backfill. TIDAK ada DROP kolom/tabel/policy lama, TIDAK ada ubah
-- signature RPC/view lama — kode production lama tetap jalan selama
-- Fase B (kode) belum deploy. Pembersihan kolom seller_id lama =
-- Fase C terpisah setelah Fase B terverifikasi.
-- Idempotent. Jalankan di SQL editor Supabase.
-- ============================================================

-- ---------- 1) tabel stores + store_members ----------
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  store_name text,
  store_slug text unique not null,
  city text,
  wa_number text,
  category text,
  bio text,
  address text,
  avatar_url text,
  cover_url text,
  is_closed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists stores_owner_idx on stores (owner_id);
create index if not exists stores_slug_idx on stores (store_slug);

create table if not exists store_members (
  store_id uuid not null references stores(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);
create index if not exists store_members_user_idx on store_members (user_id);

alter table stores enable row level security;
alter table store_members enable row level security;

-- Helper: apakah user login anggota toko ini?
create or replace function is_store_member(p_store_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (
  select 1 from store_members where store_id = p_store_id and user_id = auth.uid()
); $$;

-- stores: anggota kelola penuh, admin semua. Anon TIDAK (ada wa_number) —
-- publik baca lewat view public_stores_v2 di bawah (tanpa wa_number).
drop policy if exists "members manage stores" on stores;
create policy "members manage stores" on stores
  for all using (is_store_member(id) or is_admin())
  with check (is_store_member(id) or is_admin());

drop policy if exists "members read membership" on store_members;
create policy "members read membership" on store_members
  for select using (user_id = auth.uid() or is_admin());

drop policy if exists "members join stores" on store_members;
create policy "members join stores" on store_members
  for insert with check (user_id = auth.uid());

-- Etalase publik TANPA wa_number (pola sama seperti public_stores lama).
drop view if exists public_stores_v2;
create view public_stores_v2 as
  select id, owner_id, store_name, store_slug, city, category, bio,
         avatar_url, cover_url, is_closed, created_at
  from stores;
grant select on public_stores_v2 to anon, authenticated;

-- ---------- 2) backfill: 1 store per seller lama ----------
-- Hanya profil yang punya slug (toko beneran). Slug fallback dijamin unik.
insert into stores (owner_id, store_name, store_slug, city, wa_number,
  category, bio, address, avatar_url, cover_url, is_closed)
select id, store_name,
  coalesce(store_slug, 'toko-' || replace(id::text, '-', '')),
  city, wa_number, category, bio, address, avatar_url, cover_url,
  coalesce(is_closed, false)
from profiles
where role = 'seller'
  and not exists (select 1 from stores where stores.owner_id = profiles.id)
on conflict (store_slug) do nothing;

insert into store_members (store_id, user_id, role)
select s.id, s.owner_id, 'owner'
from stores s
where not exists (
  select 1 from store_members m
  where m.store_id = s.id and m.user_id = s.owner_id
);

-- ---------- 3) kolom store_id + backfill + isi-otomatis ----------
alter table products       add column if not exists store_id uuid references stores(id) on delete cascade;
alter table orders         add column if not exists store_id uuid references stores(id) on delete cascade;
alter table bio_links      add column if not exists store_id uuid references stores(id) on delete cascade;
alter table discount_codes add column if not exists store_id uuid references stores(id) on delete cascade;
alter table store_hours    add column if not exists store_id uuid references stores(id) on delete cascade;
alter table store_theme    add column if not exists store_id uuid references stores(id) on delete cascade;
alter table store_visits   add column if not exists store_id uuid references stores(id) on delete cascade;

-- Isi store_id dari toko milik seller (1:1 untuk semua data lama).
update products       p set store_id = s.id from stores s where p.store_id is null and s.owner_id = p.seller_id;
update orders         p set store_id = s.id from stores s where p.store_id is null and s.owner_id = p.seller_id;
update bio_links      p set store_id = s.id from stores s where p.store_id is null and s.owner_id = p.seller_id;
update discount_codes p set store_id = s.id from stores s where p.store_id is null and s.owner_id = p.seller_id;
update store_hours    p set store_id = s.id from stores s where p.store_id is null and s.owner_id = p.seller_id;
update store_theme    p set store_id = s.id from stores s where p.store_id is null and s.owner_id = p.seller_id;
update store_visits   p set store_id = s.id from stores s where p.store_id is null and s.owner_id = p.seller_id;

create index if not exists products_store_idx on products (store_id);
create index if not exists orders_store_idx on orders (store_id);
create index if not exists bio_links_store_idx on bio_links (store_id);
create index if not exists discount_codes_store_idx on discount_codes (store_id);
create index if not exists store_hours_store_idx on store_hours (store_id);
create index if not exists store_visits_store_idx on store_visits (store_id);

-- Trigger isi-otomatis: baris baru tanpa store_id (mis. kode lama yang
-- masih tulis seller_id) ikut toko pertama pemiliknya. Nama diawali
-- trg_00_ supaya jalan SEBELUM trigger cap freemium.
create or replace function fill_store_id()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_store uuid;
begin
  if NEW.store_id is not null then
    return NEW;
  end if;
  select s.id into v_store from stores s
    where s.owner_id = NEW.seller_id order by s.created_at limit 1;
  if v_store is null then
    raise exception 'TOKO_TIDAK_ADA';
  end if;
  NEW.store_id := v_store;
  return NEW;
end;
$$;

drop trigger if exists trg_00_fill_store_id_products on products;
create trigger trg_00_fill_store_id_products
  before insert on products for each row execute function fill_store_id();
drop trigger if exists trg_00_fill_store_id_bio_links on bio_links;
create trigger trg_00_fill_store_id_bio_links
  before insert on bio_links for each row execute function fill_store_id();
drop trigger if exists trg_00_fill_store_id_discount_codes on discount_codes;
create trigger trg_00_fill_store_id_discount_codes
  before insert on discount_codes for each row execute function fill_store_id();
drop trigger if exists trg_00_fill_store_id_store_hours on store_hours;
create trigger trg_00_fill_store_id_store_hours
  before insert on store_hours for each row execute function fill_store_id();
drop trigger if exists trg_00_fill_store_id_orders on orders;
create trigger trg_00_fill_store_id_orders
  before insert on orders for each row execute function fill_store_id();

-- ---------- 4) cap freemium dihitung PER TOKO ----------
-- (plan tetap di user per keputusan; yang berubah hanya cakupan hitung.)
create or replace function check_product_gratis_cap()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_jwt_role text;
  v_plan text;
  v_until timestamptz;
  v_count int;
begin
  begin
    v_jwt_role := auth.jwt() ->> 'role';
  exception when others then
    v_jwt_role := null;
  end;
  if v_jwt_role = 'service_role' or v_jwt_role is null then
    return NEW;
  end if;
  select plan, premium_until into v_plan, v_until from profiles where id = NEW.seller_id;
  if v_plan = 'premium' and (v_until is null or v_until > now()) then
    return NEW;
  end if;
  perform pg_advisory_xact_lock(hashtext('gratis_cap:' || coalesce(NEW.store_id::text, NEW.seller_id::text)));
  select count(*) into v_count from products where store_id = NEW.store_id;
  if v_count >= 20 then
    raise exception 'BATAS_PRODUK_GRATIS';
  end if;
  return NEW;
end;
$$;

create or replace function check_biolink_gratis_cap()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_jwt_role text;
  v_plan text;
  v_until timestamptz;
  v_count int;
begin
  begin
    v_jwt_role := auth.jwt() ->> 'role';
  exception when others then
    v_jwt_role := null;
  end;
  if v_jwt_role = 'service_role' or v_jwt_role is null then
    return NEW;
  end if;
  select plan, premium_until into v_plan, v_until from profiles where id = NEW.seller_id;
  if v_plan = 'premium' and (v_until is null or v_until > now()) then
    return NEW;
  end if;
  perform pg_advisory_xact_lock(hashtext('gratis_cap:' || coalesce(NEW.store_id::text, NEW.seller_id::text)));
  select count(*) into v_count from bio_links where store_id = NEW.store_id;
  if v_count >= 3 then
    raise exception 'BATAS_TAUTAN_GRATIS';
  end if;
  return NEW;
end;
$$;

-- ---------- 5) RLS keanggotaan (DITAMBAH, policy lama tetap jalan) ----------
drop policy if exists "members manage store products" on products;
create policy "members manage store products" on products
  for all using (is_store_member(store_id) or is_admin())
  with check (is_store_member(store_id) or is_admin());

drop policy if exists "members manage store orders" on orders;
create policy "members manage store orders" on orders
  for all using (is_store_member(store_id) or is_admin())
  with check (is_store_member(store_id) or is_admin());

drop policy if exists "members manage store bio" on bio_links;
create policy "members manage store bio" on bio_links
  for all using (is_store_member(store_id) or is_admin())
  with check (is_store_member(store_id) or is_admin());

drop policy if exists "members manage store promos" on discount_codes;
create policy "members manage store promos" on discount_codes
  for all using (is_store_member(store_id) or is_admin())
  with check (is_store_member(store_id) or is_admin());

drop policy if exists "members manage store hours" on store_hours;
create policy "members manage store hours" on store_hours
  for all using (is_store_member(store_id) or is_admin())
  with check (is_store_member(store_id) or is_admin());

drop policy if exists "members manage store theme" on store_theme;
create policy "members manage store theme" on store_theme
  for all using (is_store_member(store_id) or is_admin())
  with check (is_store_member(store_id) or is_admin());

drop policy if exists "members read store visits" on store_visits;
create policy "members read store visits" on store_visits
  for select using (is_store_member(store_id) or is_admin());

-- ---------- verifikasi (jalankan setelah di atas) ----------
-- 1) select count(*) from stores; → sama dengan jumlah seller berslug.
--    select seller_id, count(*) from products group by 1 having count(*)
--    <> (select count(*) from products where store_id is not null ...) → 0.
-- 2) select * from products where store_id is null; → 0 baris.
-- 3) Sebagai seller: insert produk baru → store_id terisi otomatis
--    (cek select store_id ... order by created_at desc limit 1).
-- 4) Halaman toko + checkout production tetap jalan normal (kode lama
--    baca seller_id yang tidak diubah).
