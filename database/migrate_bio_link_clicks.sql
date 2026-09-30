-- ============================================================
-- Halaman toko publik (StoreHome) sekarang benar-benar menampilkan
-- bio_links (sebelumnya hardcode 4 contoh, lihat catatan di
-- src/pages/Storefront.tsx). Buyer yang klik tautan itu belum tentu
-- login, jadi butuh RPC khusus buat naikkan `clicks` -- bukan buka
-- akses UPDATE bio_links ke publik (itu akan langgar pola RLS di
-- .opencode/skill/supabase-rls-patterns/SKILL.md).
-- Dibuat 30 Sep 2026.
-- ============================================================

create or replace function increment_bio_link_click(p_id uuid)
returns void as $$
  update bio_links set clicks = clicks + 1
  where id = p_id and is_active = true;
$$ language sql security definer set search_path = public;

grant execute on function increment_bio_link_click(uuid) to anon, authenticated;
