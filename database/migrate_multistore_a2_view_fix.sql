-- ============================================================
-- TokoLink — Multi-toko FASE A2: perbaiki view publik (linter Supabase)
-- Supabase menandai public_stores_v2 sebagai SECURITY DEFINER (default
-- view = hak pemilik, bukan hak pembaca). Ikuti pola view lama
-- public_stores: security_invoker = true.
--
-- KUNCI PENTING (jangan disederhanakan!): RLS hanya menutup BARIS,
-- bukan kolom. Supaya wa_number tidak terbaca publik SEMENTARA
-- anggota tetap bisa tulis tokonya sendiri, dipakai kombinasi:
--   policy baris (siapa boleh baris apa) + column-grant (kolom apa).
-- Idempotent. Jalankan di SQL editor Supabase.
-- ============================================================

alter view public_stores_v2 set (security_invoker = true);

-- Publik (anon, belum login): baca baris apa pun, TAPI hanya 11 kolom
-- etalase — wa_number TIDAK termasuk.
drop policy if exists "public reads storefront" on stores;
create policy "public reads storefront" on stores
  for select using (true);
revoke all on stores from anon;
grant select (id, owner_id, store_name, store_slug, city, category, bio,
  avatar_url, cover_url, is_closed, created_at)
  on stores to anon;

-- Login (authenticated): baca 11 kolom etalase milik siapa pun (untuk
-- buka toko orang sambil login), tulis PENUH tapi HANYA baris toko
-- sendiri (dikunci policy "members manage stores" per-baris).
revoke all on stores from authenticated;
grant select (id, owner_id, store_name, store_slug, city, category, bio,
  avatar_url, cover_url, is_closed, created_at)
  on stores to authenticated;
grant insert, update, delete on stores to authenticated;

-- Buat toko baru: pemiliknya harus diri sendiri (keanggotaan owner
-- dicatat terpisah di store_members oleh kode Fase B).
drop policy if exists "owners create stores" on stores;
create policy "owners create stores" on stores
  for insert with check (owner_id = auth.uid() or is_admin());

-- ---------- verifikasi ----------
-- 1) Database linter: peringatan security_definer_view untuk
--    public_stores_v2 HILANG.
-- 2) Anon: select wa_number from stores limit 1; → ERROR permission.
--    select store_name from stores limit 1; → OK.
-- 3) Login sebagai seller: select wa_number from stores limit 1;
--    → ERROR permission denied (kolom tertutup untuk semua).
--    update stores set city='X' where id=<toko sendiri>; → OK.
--    update stores set city='X' where id=<toko orang>; → 0 baris berubah.
-- 4) Halaman toko publik tetap terbuka normal.
