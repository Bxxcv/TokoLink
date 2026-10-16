-- ============================================================
-- TokoLink — Kunci RPC sensitif (DARURAT, Okt 2026)
-- Temuan dari Supabase linter 16 Okt 2026, diverifikasi di kode:
-- consume_promo, decrement_stock, restore_promo HANYA dipanggil dari
-- api/* (service_role) — tidak pernah dari browser. Tapi secara default
-- Postgres mengizinkan anon+authenticated mengeksekusinya langsung:
-- orang asing bisa menghabiskan kuota promo toko lain / mengnolkan
-- stok produk siapa pun. File ini mencabutnya.
--
-- Yang SENGAJA dibiarkan (linter noise, aman by design):
-- admin_* (cek is_admin() di dalam, non-admin dapat HANYA_ADMIN),
-- track_order/order_review/product_reviews/submit_review/store_* (butuh
-- token/param, mengembalikan null bila tidak cocok), request_withdrawal
-- (validasi saldo di dalam, untuk seller login), log_admin_action
-- (insert ... where is_admin(), non-admin = 0 baris), fungsi trigger
-- (error bila dipanggil langsung tanpa baris NEW).
-- Idempotent. Jalankan di SQL editor Supabase.
-- ============================================================

revoke execute on function consume_promo(uuid) from anon, authenticated;
revoke execute on function decrement_stock(uuid, int) from anon, authenticated;
revoke execute on function restore_promo(uuid) from anon, authenticated;

-- ---------- verifikasi ----------
-- 1) Linter: 3 nama di atas HILANG dari daftar anon/authenticated
--    executable (sisanya = noise yang disengaja, lihat daftar di atas).
-- 2) Checkout + webhook + batal order tetap jalan normal (mereka pakai
--    service_role yang tidak terpengaruh revoke ini).
