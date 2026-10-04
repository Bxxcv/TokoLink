-- ============================================================
-- TokoLink — Migrasi Fase 3d (Supabase SQL Editor)
-- Bug: halaman PaymentStatus menampilkan `orders.total` (harga produk
-- SEBELUM biaya BuatQris), padahal yang benar-benar harus dibayar
-- buyer adalah `payments.amount` (sudah termasuk kode unik/biaya
-- BuatQris -- lihat api/create-order.ts, sesuai saran dokumen BuatQris
-- "cocokkan dengan total_amount"). Akibatnya buyer lihat 2 angka beda
-- (QR: Rp100.623, status: Rp99.999) padahal cuma 1 transaksi.
-- track_order sebelumnya tidak mengembalikan payments.amount sama
-- sekali -- frontend memang tidak punya aksesnya. Ditambahkan di sini.
-- Jalankan SETELAH migrate_fase3b_tracking.sql. Idempotent.
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
    -- Jumlah SEBENARNYA yang ditagih ke buyer (termasuk biaya BuatQris).
    -- Fallback ke o.total kalau belum ada baris payments (jarang terjadi,
    -- mis. order dibuat tapi panggilan ke BuatQris sempat gagal).
    'amount_due', coalesce(
      (select amount from payments where order_id = o.id order by created_at desc limit 1),
      o.total
    ),
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
