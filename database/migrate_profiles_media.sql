-- ============================================================
-- TokoLink — Migrasi profil media (dijalankan di Supabase SQL Editor)
-- KEPUTUSAN user 29 Sep 2026 (opsi A): semua fitur profil harus
-- berjalan — tambah kolom yang dipakai StoreSettings/AccountSettings.
-- Upload file-nya memakai bucket "tokolink" (migrate_storage.sql).
-- ============================================================

alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists cover_url text;
alter table profiles add column if not exists category text;
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists address text;

-- ---------- verifikasi ----------
-- select column_name from information_schema.columns
-- where table_name = 'profiles' and column_name in
-- ('avatar_url', 'cover_url', 'category', 'bio', 'address');
-- Harus 5 baris.
