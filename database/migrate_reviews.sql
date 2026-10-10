-- ============================================================
-- TokoLink — Ulasan pembeli (Okt 2026, disetujui user 30 Sep 2026)
-- Syarat keras: hanya buyer dengan access_token order yang valid DAN
-- status order 'selesai' yang boleh kirim; 1 ulasan per order;
-- komentar teks biasa (frontend escape via React, tanpa innerHTML);
-- tulis HANYA via RPC (client tidak punya INSERT/UPDATE/DELETE).
-- Idempotent.
-- ============================================================

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  order_id text not null references orders(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  buyer_label text not null default 'Pembeli',
  created_at timestamptz not null default now(),
  unique (order_id)
);
create index if not exists reviews_product_idx on reviews (product_id);

alter table reviews enable row level security;

-- Publik boleh BACA (ulasan memang tampil di etalase). Tulis via RPC.
drop policy if exists "public reads reviews" on reviews;
create policy "public reads reviews" on reviews
  for select using (true);

drop policy if exists "seller reads own reviews" on reviews;
create policy "seller reads own reviews" on reviews
  for select using (seller_id = auth.uid() or is_admin());

revoke insert, update, delete on reviews from anon, authenticated;
grant select on reviews to anon, authenticated;

-- Kirim ulasan: token cocok + order selesai + belum pernah ulas.
create or replace function submit_review(
  p_order_id text, p_token uuid, p_product_id uuid,
  p_rating int, p_comment text
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_order record;
  v_label text;
  v_id uuid;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'RATING_TIDAK_VALID';
  end if;
  if p_comment is null or length(btrim(p_comment)) < 3 then
    raise exception 'KOMENTAR_TIDAK_VALID';
  end if;
  if length(p_comment) > 500 then
    raise exception 'KOMENTAR_TIDAK_VALID';
  end if;

  select o.seller_id, o.status, o.buyer_name
    into v_order
  from orders o
  where o.id = p_order_id and o.access_token = p_token;

  if not found then
    raise exception 'ORDER_TIDAK_DITEMUKAN';
  end if;
  if v_order.status <> 'selesai' then
    raise exception 'BELUM_SELESAI';
  end if;
  if not exists (
    select 1 from order_items
    where order_id = p_order_id and product_id = p_product_id
  ) then
    raise exception 'BUKAN_BARANG_ORDER';
  end if;

  v_label := substring(v_order.buyer_name from 1 for 1) || '***';

  insert into reviews (product_id, order_id, seller_id, rating, comment, buyer_label)
  values (
    p_product_id, p_order_id, v_order.seller_id,
    p_rating, btrim(p_comment), v_label
  )
  returning id into v_id;

  return v_id;
exception when unique_violation then
  raise exception 'SUDAH_ULAS';
end;
$$;

grant execute on function submit_review(text, uuid, uuid, int, text) to anon, authenticated;

-- Agregat + daftar publik per produk (1 RPC, tanpa buka tabel lebar).
create or replace function product_reviews(p_product_id uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'count', count(*),
    'avg', coalesce(round(avg(rating)::numeric, 1), 0),
    'items', coalesce(jsonb_agg(
      jsonb_build_object(
        'rating', rating, 'comment', comment,
        'buyer', buyer_label, 'at', created_at
      ) order by created_at desc
    ) filter (where id is not null), '[]'::jsonb)
  )
  from (select * from reviews where product_id = p_product_id order by created_at desc limit 20) r;
$$;

grant execute on function product_reviews(uuid) to anon, authenticated;

-- Ulasan milik order ini (untuk form: sudah isi atau belum).
create or replace function order_review(p_order_id text, p_token uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select case when o.id is null then null
    else (select jsonb_build_object('rating', r.rating, 'comment', r.comment)
            from reviews r where r.order_id = o.id)
  end
  from orders o
  where o.id = p_order_id and o.access_token = p_token;
$$;

grant execute on function order_review(text, uuid) to anon, authenticated;

-- track_order: item ikut sertakan product_id (untuk form ulasan).
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
        'id', product_id,
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

-- ---------- verifikasi ----------
-- Token salah → ORDER_TIDAK_DITEMUKAN. Order belum selesai → BELUM_SELESAI.
-- Kirim 2x → SUDAH_ULAS. Direct insert sebagai seller → ERROR privilege.
