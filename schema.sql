-- ============================================================
-- TokoLink — Draft Schema v1
-- Diturunkan langsung dari shape mock data di src/lib/data.tsx
-- Agent: jangan ubah nama tabel/kolom di file ini tanpa persetujuan user.
-- Semua tabel WAJIB RLS aktif.
-- ============================================================

-- ---------- profiles (seller & admin, 1:1 dengan auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'seller' check (role in ('seller', 'admin')),
  store_name text,
  store_slug text unique,
  owner_name text,
  city text,
  wa_number text,
  plan text not null default 'gratis' check (plan in ('gratis', 'premium')),
  status text not null default 'aktif'
    check (status in ('aktif', 'ditangguhkan', 'belum_verifikasi')),
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  category text not null,
  price numeric(12,2) not null,
  unit text,
  image_url text,
  stock int not null default 0,
  sku text,
  sold int not null default 0,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  weight_gram int,
  description text,
  created_at timestamptz not null default now()
);

-- ---------- orders ----------
create table orders (
  id text primary key,                       -- format: TL-YYMM-XXXX
  seller_id uuid not null references profiles(id) on delete cascade,
  buyer_name text not null,
  buyer_city text,
  total numeric(12,2) not null,
  status text not null default 'menunggu'
    check (status in ('menunggu', 'dikemas', 'dikirim', 'selesai', 'batal')),
  channel text,                               -- 'QRIS' | 'Transfer BCA' | dst
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name_snapshot text not null,
  qty int not null,
  price_snapshot numeric(12,2) not null
);

-- ---------- payments (transaksi gateway, 1 order bisa retry beberapa payment) ----------
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  channel text not null,                      -- 'QRIS' | 'Transfer manual'
  amount numeric(12,2) not null,
  fee numeric(12,2) not null default 0,
  external_ref text,                          -- id transaksi dari BuatQris
  status text not null default 'menunggu'
    check (status in ('berhasil', 'cocok', 'gagal', 'perlu_cek', 'menunggu')),
  created_at timestamptz not null default now()
);

-- ---------- ledger (riwayat saldo seller) ----------
create table ledger (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  label text not null,
  amount numeric(12,2) not null,              -- positif = masuk, negatif = keluar
  type text not null check (type in ('masuk', 'keluar')),
  ref_order_id text references orders(id),
  created_at timestamptz not null default now()
);

-- ---------- withdrawals ----------
create table withdrawals (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  bank text not null,
  account_number text not null,               -- simpan penuh di server, mask saat ditampilkan
  amount numeric(12,2) not null,
  fee numeric(12,2) not null default 6500,
  status text not null default 'menunggu'
    check (status in ('menunggu', 'diproses', 'selesai', 'ditolak')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- ---------- bio_links ----------
create table bio_links (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  label text not null,
  url text not null,
  icon text,                                  -- 'wa' | 'ig' | 'link' | 'doc'
  clicks int not null default 0,
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- ---------- discount_codes ----------
create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  code text not null,
  type text not null check (type in ('persen', 'nominal', 'potongan_ongkir')),
  value numeric(12,2) not null,
  min_purchase numeric(12,2) not null default 0,
  usage_limit int,
  used_count int not null default 0,
  valid_until date,
  is_active boolean not null default true,
  unique (seller_id, code)
);

-- ---------- store_hours ----------
create table store_hours (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Senin
  open_time time,
  close_time time,
  is_open boolean not null default true,
  unique (seller_id, day_of_week)
);

-- ---------- premium_requests ----------
create table premium_requests (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  plan text not null,                         -- 'Premium Bulanan' | 'Premium Tahunan'
  amount numeric(12,2) not null,
  proof_channel text,
  proof_file_url text,
  status text not null default 'menunggu'
    check (status in ('menunggu', 'disetujui', 'ditolak')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ============================================================
-- RLS — pola dasar: seller cuma boleh akses baris miliknya sendiri,
-- admin (profiles.role = 'admin') boleh akses semua.
-- Agent: terapkan pola sama untuk SEMUA tabel di atas, jangan ada yang
-- kelewat.
-- ============================================================

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table ledger enable row level security;
alter table withdrawals enable row level security;
alter table bio_links enable row level security;
alter table discount_codes enable row level security;
alter table store_hours enable row level security;
alter table premium_requests enable row level security;

-- contoh pola untuk products — REPLIKASI pola ini ke semua tabel lain
-- yang punya kolom seller_id:
create policy "seller manages own products" on products
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

create policy "public can read active products" on products
  for select using (status = 'aktif');

-- profiles: seller lihat/edit profil sendiri, admin lihat semua
create policy "seller manages own profile" on profiles
  for all using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());

create policy "public can read storefront profile" on profiles
  for select using (true); -- perlu untuk render halaman toko publik

-- TODO agent: buat policy sejenis untuk orders, order_items, payments,
-- ledger, withdrawals, bio_links, discount_codes, store_hours,
-- premium_requests — orders butuh policy tambahan supaya buyer (belum
-- tentu login) tetap bisa lihat status order miliknya sendiri via
-- order id, diskusikan mekanismenya ke user dulu sebelum implementasi.
