-- ============================================================
-- TokoLink — Migrasi Fase 3.6 (dijalankan di Supabase SQL Editor)
-- Fungsi RPC lacak order buyer non-login (KEPUTUSAN: opsi A).
-- Aman: SECURITY DEFINER tapi HANYA mengembalikan 1 order bila id +
-- access_token cocok persis; kolom sensitif tidak ikut (nama buyer
-- disamarkan, tidak ada email/alamat/WA — kolom itu memang tidak ada).
-- Tanpa token yang benar fungsi mengembalikan NULL.
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

-- Boleh dipanggil anon (buyer belum login) maupun authenticated.
grant execute on function track_order(text, uuid) to anon, authenticated;

-- ---------- verifikasi ----------
-- select track_order('ID_TEST', 'TOKEN_TEST');
-- Cocok → json; salah → null.
