-- ============================================================
-- TokoLink — FULL REPAIR part 3 (7 Okt 2026)
-- 1) Hilangkan ERROR Security Advisor "security_definer_view" pada
--    public_stores DENGAN TETAP menutup PII (bukan sekadar bungkam warning).
--    Caranya: view jadi security_invoker + anon HANYA dapat 9 kolom
--    etalase via column-grant (Postgres tetap batasi kolom walau policy
--    membolehkan baris). is_premium pindah ke RPC kecil.
-- 2) RPC store_is_premium: badge Premium jujur tanpa buka kolom plan.
-- Idempotent. Jalankan SETELAH part 1 & part 2.
-- ============================================================

-- Anon: cabut semua, beri hanya 9 kolom etalase.
revoke all on profiles from anon;
grant select (id, store_name, store_slug, city, avatar_url, cover_url, bio, category, is_closed)
  on profiles to anon;

-- Policy baris untuk anon (kolom tetap dibatasi grant di atas).
drop policy if exists "profiles_anon_storefront" on profiles;
create policy "profiles_anon_storefront" on profiles
  for select to anon using (true);

-- View tanpa kolom turunan plan + berjalan sebagai pemanggil.
-- (CREATE OR REPLACE tidak boleh buang kolom → DROP dulu.)
drop view if exists public_stores;
create view public_stores as
  select id, store_name, store_slug, city,
         avatar_url, cover_url, bio, category, is_closed
  from profiles;

alter view public_stores set (security_invoker = true);
grant select on public_stores to anon, authenticated;

-- Badge premium via RPC (boolean saja, kolom plan tetap tertutup).
create or replace function store_is_premium(p_seller_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select plan = 'premium' from profiles where id = p_seller_id), false);
$$;

grant execute on function store_is_premium(uuid) to anon, authenticated;

-- ---------- verifikasi ----------
-- 1) Sebagai ANON: select * from profiles limit 1; → ERROR kolom
--    (bukti PII tertutup), tapi select id,store_name from profiles → boleh.
-- 2) Advisor: ERROR security_definer_view untuk public_stores hilang.
-- 3) select store_is_premium('<seller_uuid>'); → true/false.
