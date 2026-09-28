-- ============================================================
-- TokoLink — Migrasi Fase 3b (dijalankan di Supabase SQL Editor)
-- Penambahan SEKALI: track_order juga mengembalikan external_ref
-- (transaction_id BuatQris) agar halaman QR bisa menurunkan URL gambar
-- tanpa kolom baru. Idempotent: CREATE OR REPLACE aman dijalankan ulang.
-- Jalankan SETELAH migrate_fase3_tracking.sql.
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
