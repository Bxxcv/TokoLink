-- ============================================================
-- TokoLink — Migrasi pilihan tema toko (dijalankan di Supabase SQL Editor)
--
-- Menambah 1 kolom di store_theme: theme_id (teks).
-- Nilai: 'klasik' (tampilan bawaan) atau salah satu dari 8 tema
-- engine (01 ruang-seduh s/d 08 studio-tenang) — lihat
-- src/storefront/registry.ts & docs/THEME_ENGINE.md.
--
-- AMAN dijalankan kapan saja: kolom baru punya default, baris lama
-- otomatis dianggap 'klasik' (tampilan tidak berubah).
-- Berdiri sendiri — TIDAK mengubah database/schema.sql.
-- ============================================================

alter table store_theme
  add column if not exists theme_id text not null default 'klasik';

-- RLS ikut policy yang sudah ada ("seller manages own theme" dan
-- "public can read theme" di migrate_fase5_theme.sql) — kolom baru
-- otomatis tercakup, tidak perlu policy tambahan.
