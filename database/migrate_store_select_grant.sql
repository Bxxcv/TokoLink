-- ============================================================
-- Fix: role authenticated tidak punya GRANT SELECT di tabel stores
-- (hanya insert/update/delete). Akibatnya query store_members yang
-- join stores(...) gagal 403 "permission denied for table stores",
-- dan dashboard seller loading terus.
-- Idempoten. Jalankan di Supabase SQL Editor.
-- ============================================================
grant select (id, owner_id, store_name, store_slug, city, category, bio,
  avatar_url, cover_url, is_closed, force_open, created_at)
  on stores to authenticated, anon;

-- Pastikan view publik juga expose force_open (grant kolom).
grant select (id, owner_id, store_name, store_slug, city, category, bio,
  avatar_url, cover_url, is_closed, force_open, created_at)
  on public_stores_v2 to anon, authenticated;
