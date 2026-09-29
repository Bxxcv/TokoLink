-- ============================================================
-- TokoLink — Migrasi Fase 3c (dijalankan di Supabase SQL Editor)
-- KEPUTUSAN user 29 Sep 2026: tambah kontak buyer di orders agar
-- seller bisa hubungi/kirim barang. Data ini TIDAK ikut ke RPC
-- track_order (privasi buyer).
-- ============================================================

alter table orders add column if not exists buyer_phone text;
alter table orders add column if not exists buyer_address text;
alter table orders add column if not exists buyer_note text;

-- ---------- verifikasi ----------
-- select column_name from information_schema.columns
-- where table_name = 'orders' and column_name in
-- ('buyer_phone', 'buyer_address', 'buyer_note');
-- Harus 3 baris.
