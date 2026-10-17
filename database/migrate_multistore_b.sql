-- ============================================================
-- TokoLink — Multi-toko FASE B: RPC ikut stores (JALANKAN BARENG DEPLOY
-- KODE FASE B — kode lama yang masih tersimpan di browser buyer max
-- menunjukkan "WA belum diatur" selama transisi, tidak crash).
-- 1) track_order: join stores via orders.store_id (output SAMA PERSIS,
--    signature tidak berubah — kompatibel dua arah).
-- 2) store_contact_link: baca wa_number dari stores (param = store id).
-- Idempotent. Jalankan di SQL editor Supabase.
-- ============================================================

-- ---------- 1) track_order via stores ----------
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
    'store', s.store_name,
    'slug', s.store_slug,
    'external_ref', (select external_ref from payments where order_id = o.id order by created_at desc limit 1),
    'amount_due', coalesce(
      (select amount from payments where order_id = o.id order by created_at desc limit 1),
      o.total
    ),
    'shipping_method', o.shipping_method,
    'shipping_cost', coalesce(o.shipping_cost, 0),
    'wa_url', case
      when s.wa_number is null or btrim(s.wa_number) = '' then null
      else 'https://wa.me/' || case
        when regexp_replace(s.wa_number, '[^0-9]', '', 'g') like '0%'
          then '62' || substring(regexp_replace(s.wa_number, '[^0-9]', '', 'g') from 2)
        else regexp_replace(s.wa_number, '[^0-9]', '', 'g') end
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
  join stores s on s.id = o.store_id
  where o.id = p_id and o.access_token = p_token;
$$;

grant execute on function track_order(text, uuid) to anon, authenticated;

-- ---------- 2) store_contact_link via stores ----------
-- Param sengaja tetap bernama p_seller_id (nama parameter ikut dikunci saat
-- create or replace) supaya halaman lama yang masih mengirim USER id tidak
-- error; fungsi memetakan: cocokkan ke stores.id DULU, kalau tidak ada baru
-- ke stores.owner_id (user id → toko pertama). Hapus jalur owner_id di Fase C.
create or replace function store_contact_link(p_seller_id uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object('wa_url', case
    when wa_number is null or btrim(wa_number) = '' then null
    else 'https://wa.me/' || case
      when regexp_replace(wa_number, '[^0-9]', '', 'g') like '0%'
        then '62' || substring(regexp_replace(wa_number, '[^0-9]', '', 'g') from 2)
      else regexp_replace(wa_number, '[^0-9]', '', 'g') end
  end)
  from stores
  where id = p_seller_id or owner_id = p_seller_id
  order by (id = p_seller_id) desc
  limit 1;
$$;

grant execute on function store_contact_link(uuid) to anon, authenticated;

-- ---------- verifikasi ----------
-- select track_order('<id order selesai>', '<token>'); → slug/nama dari
-- stores. select store_contact_link('<id store>'); → {"wa_url": ...}.
