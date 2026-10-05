-- ============================================================
-- TokoLink — FULL REPAIR part 2 (P1/P2: BUG-005..022 dkk)
-- Tanggal: 4 Okt 2026
-- Cara pakai: jalankan di Supabase SQL Editor SETELAH
-- database/migrate_security_hotfix_critical.sql. Idempotent.
--
-- Isi:
--  1) Public read bio_links aktif + store_hours (etalase butuh ini;
--     sebelumnya anon tidak dapat apa-apa → tautan & badge mati)
--  2) public_stores: tambah is_premium (badge jujur, tanpa buka PII)
--  3) RPC store_contact_link: URL wa.me tanpa bocorkan nomor mentah
--  4) payments/order_items: seller hanya-baca (tulis via server)
--  5) orders: cabut insert/delete client; update seller dibatasi
--     transisi maju + trigger state machine
--  6) discount_codes: constraint nilai wajar
--  7) RPC consume_promo: increment kuota atomik
--  8) orders: kolom shipping_method/shipping_cost/idempotency_key
--  9) track_order: ikutkan ongkir + nominal tagihan
-- ============================================================

-- ---------- 1) public read yang memang untuk etalase ----------
drop policy if exists "public can read active bio links" on bio_links;
create policy "public can read active bio links" on bio_links
  for select using (is_active = true);

drop policy if exists "public can read store hours" on store_hours;
create policy "public can read store hours" on store_hours
  for select using (true);

-- ---------- 2) is_premium publik (boolean turunan, bukan kolom plan) ----------
create or replace view public_stores as
  select id, store_name, store_slug, city,
         avatar_url, cover_url, bio, category, is_closed,
         (plan = 'premium') as is_premium
  from profiles;

grant select on public_stores to anon, authenticated;

-- ---------- 3) link WA tanpa bocorkan nomor mentah ----------
-- Mengembalikan URL wa.me siap-pakai (atau null). Nomor asli tidak
-- pernah keluar dari database — frontend tinggal window.open().
create or replace function store_contact_link(p_seller_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_wa text;
  v_digits text;
begin
  select wa_number into v_wa from profiles where id = p_seller_id;
  if v_wa is null or btrim(v_wa) = '' then
    return jsonb_build_object('wa_url', null);
  end if;
  v_digits := regexp_replace(v_wa, '[^0-9]', '', 'g');
  if v_digits like '0%' then
    v_digits := '62' || substring(v_digits from 2);
  end if;
  if length(v_digits) < 9 then
    return jsonb_build_object('wa_url', null);
  end if;
  return jsonb_build_object('wa_url', 'https://wa.me/' || v_digits);
end;
$$;

grant execute on function store_contact_link(uuid) to anon, authenticated;

-- ============================================================
-- 4) payments & order_items: SERVER-AUTHORITATIVE (tulis via webhook)
-- ============================================================
drop policy if exists "seller manages own payments" on payments;
drop policy if exists "payments_select_own" on payments;
create policy "payments_select_own" on payments
  for select using (seller_id = auth.uid() or is_admin());

revoke insert, update, delete on payments from anon, authenticated;
grant select on payments to authenticated;

drop policy if exists "seller manages own order_items" on order_items;
drop policy if exists "order_items_select_own" on order_items;
create policy "order_items_select_own" on order_items
  for select using (
    exists (select 1 from orders o
            where o.id = order_items.order_id
              and (o.seller_id = auth.uid() or is_admin()))
  );

revoke insert, update, delete on order_items from anon, authenticated;
grant select on order_items to authenticated;

-- ============================================================
-- 5) orders: server yang buat/hapus; seller hanya majukan status
-- ============================================================
drop policy if exists "seller manages own orders" on orders;
drop policy if exists "orders_select_own" on orders;
drop policy if exists "orders_update_fulfill" on orders;

create policy "orders_select_own" on orders
  for select using (seller_id = auth.uid() or is_admin());

-- Seller boleh UPDATE barisnya; KOLOM & TRANSISI dijaga trigger
-- (menunggu→batal, dikemas→dikirim, dikirim→selesai). Admin bebas.
create policy "orders_update_fulfill" on orders
  for update using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

revoke insert, delete on orders from anon, authenticated;
grant select, update on orders to authenticated;

-- State machine orders: cegah lompat/mundur & ubah data uang.
create or replace function protect_orders_transition()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_jwt_role text;
  v_actor_role text;
begin
  begin
    v_jwt_role := auth.jwt() ->> 'role';
  exception when others then
    v_jwt_role := null;
  end;

  -- Server (webhook/create-order) & SQL langsung: bebas.
  if v_jwt_role = 'service_role' or v_jwt_role is null then
    return NEW;
  end if;

  select role into v_actor_role from profiles where id = auth.uid();
  if v_actor_role = 'admin' then
    return NEW; -- admin boleh (dicatat audit di frontend)
  end if;

  -- Seller: identitas, uang & data buyer TIDAK BOLEH berubah.
  if NEW.id is distinct from OLD.id
     or NEW.seller_id is distinct from OLD.seller_id
     or NEW.total is distinct from OLD.total
     or NEW.buyer_name is distinct from OLD.buyer_name
     or coalesce(NEW.access_token, '00000000-0000-0000-0000-000000000000'::uuid)
        is distinct from coalesce(OLD.access_token, '00000000-0000-0000-0000-000000000000'::uuid) then
    raise exception 'ORDER_TIDAK_BOLEH_BERUBAH';
  end if;

  -- Hanya transisi maju yang jujur. Batal HANYA dari menunggu
  -- (order berbayar tidak bisa "dibatalkan" sepihak — perlu refund
  -- manual yang dicatat, di luar scope otomatis).
  if (OLD.status = 'menunggu' and NEW.status = 'batal')
     or (OLD.status = 'dikemas' and NEW.status = 'dikirim')
     or (OLD.status = 'dikirim' and NEW.status = 'selesai') then
    return NEW;
  end if;
  if NEW.status = OLD.status then
    return NEW;
  end if;
  raise exception 'TRANSISI_STATUS_TIDAK_VALID';
end;
$$;

drop trigger if exists trg_orders_transition on orders;
create trigger trg_orders_transition
  before update on orders
  for each row execute function protect_orders_transition();

-- ============================================================
-- 6) discount_codes: nilai harus wajar
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'discount_value_sane') then
    alter table discount_codes add constraint discount_value_sane check (
      value > 0
      and (type <> 'persen' or value <= 100)
      and min_purchase >= 0
    );
  end if;
end
$$;

-- Hapus baca anon SEMUA kode promo (enumerasi lintas toko, BUG-018).
-- Preview promo pindah ke endpoint server /api/validate-promo.
drop policy if exists "public can read active discount codes" on discount_codes;

-- ---------- 7) kuota promo atomik (anti-race, BUG-014) ----------
-- Naikkan used_count HANYA bila kuota masih ada. 0 baris = habis.
create or replace function consume_promo(p_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_n int;
begin
  update discount_codes
     set used_count = used_count + 1
   where id = p_id
     and is_active = true
     and (usage_limit is null or used_count < usage_limit);
  get diagnostics v_n = row_count;
  return v_n > 0;
end;
$$;

grant execute on function consume_promo(uuid) to authenticated;

-- Stok atomik: kurangi & tambah terjual hanya bila stok cukup.
create or replace function decrement_stock(p_product_id uuid, p_qty int)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_n int;
begin
  if p_qty is null or p_qty < 1 then
    return false;
  end if;
  update products
     set stock = stock - p_qty,
         sold = sold + p_qty
   where id = p_product_id
     and stock >= p_qty;
  get diagnostics v_n = row_count;
  return v_n > 0;
end;
$$;

-- ============================================================
-- 8) kolom ongkir + idempotensi di orders
-- ============================================================
alter table orders
  add column if not exists shipping_method text,
  add column if not exists shipping_cost numeric(12,2) not null default 0,
  add column if not exists idempotency_key text;

do $$
begin
  if not exists (select 1 from pg_indexes where indexname = 'orders_idempotency_key_uidx') then
    create unique index orders_idempotency_key_uidx on orders (idempotency_key)
      where idempotency_key is not null;
  end if;
end
$$;

-- ============================================================
-- 9) track_order: ikutkan ongkir, metode kirim & nominal tagihan
-- ============================================================
create or replace function track_order(p_id text, p_token uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id,
    'status', o.status,
    'total', o.total,
    'channel', o.channel,
    'created_at', o.created_at,
    'buyer', substring(o.buyer_name from 1 for 1) || '***',
    'city', o.buyer_city,
    'store', p.store_name,
    'slug', p.store_slug,
    'external_ref', (select external_ref from payments where order_id = o.id order by created_at desc limit 1),
    'amount_due', coalesce(
      (select amount from payments where order_id = o.id order by created_at desc limit 1),
      o.total
    ),
    'shipping_method', o.shipping_method,
    'shipping_cost', coalesce(o.shipping_cost, 0),
    'wa_url', case
      when p.wa_number is null or btrim(p.wa_number) = '' then null
      else 'https://wa.me/' || case
        when regexp_replace(p.wa_number, '[^0-9]', '', 'g') like '0%'
          then '62' || substring(regexp_replace(p.wa_number, '[^0-9]', '', 'g') from 2)
        else regexp_replace(p.wa_number, '[^0-9]', '', 'g') end
    end,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', product_name_snapshot,
        'qty', qty,
        'price', price_snapshot
      ))
      from order_items where order_id = o.id
    ), '[]'::jsonb)
  )
  from orders o
  join profiles p on p.id = o.seller_id
  where o.id = p_id and o.access_token = p_token;
$$;

grant execute on function track_order(text, uuid) to anon, authenticated;

-- ============================================================
-- 10) BUG-009 — nomor rekening TIDAK ke browser admin sekaligus.
-- Daftar via RPC (tersamarkan), nomor utuh hanya on-demand + tercatat.
-- ============================================================
create or replace function admin_withdrawal_list()
returns table (
  id uuid, bank text, account_masked text,
  amount numeric, fee numeric, status text,
  created_at timestamptz, seller_id uuid, store_name text
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'HANYA_ADMIN';
  end if;
  return query
    select w.id, w.bank,
           ('•••• ' || right(w.account_number, 4))::text,
           w.amount, w.fee, w.status, w.created_at,
           w.seller_id, p.store_name
    from withdrawals w
    join profiles p on p.id = w.seller_id
    order by w.created_at desc;
end;
$$;

grant execute on function admin_withdrawal_list() to authenticated;

-- Nomor utuh, hanya saat admin benar-benar transfer (diaudit).
create or replace function admin_withdrawal_account(p_id uuid)
returns text
language plpgsql stable security definer set search_path = public
as $$
declare
  v_acct text;
begin
  if not is_admin() then
    raise exception 'HANYA_ADMIN';
  end if;
  select account_number into v_acct from withdrawals where id = p_id;
  if v_acct is null then
    raise exception 'TIDAK_DITEMUKAN';
  end if;
  perform log_admin_action('withdrawal_lihat_rekening', 'withdrawals', p_id, 'Melihat nomor rekening untuk transfer', null);
  return v_acct;
end;
$$;

grant execute on function admin_withdrawal_account(uuid) to authenticated;

-- ---------- verifikasi cepat ----------
-- 1) anon: select * from bio_links where is_active=true limit 1; → boleh
-- 2) anon: select * from payments limit 1; → 0 baris
-- 3) seller: update payments set status='berhasil' → ERROR (42501)
-- 4) seller: update orders set total=1 → ERROR ORDER_TIDAK_BOLEH_BERUBAH
-- 5) select store_contact_link('<seller_uuid>'); → {wa_url}
