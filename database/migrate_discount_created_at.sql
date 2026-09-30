-- ============================================================
-- Fix: discount_codes.created_at tidak pernah ada di schema.sql asli
-- (salah desain awal), padahal halaman Kode Promo query .order("created_at").
-- Akibatnya: SELECT selalu gagal -> "Data belum bisa dimuat" di
-- src/pages/DashboardB.tsx (Discount). Dibuat 30 Sep 2026.
-- ============================================================

alter table discount_codes
  add column if not exists created_at timestamptz not null default now();
