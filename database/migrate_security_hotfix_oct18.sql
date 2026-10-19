-- ============================================================
-- TokoLink — Security hotfix 18 Okt 2026 (hasil review kode terbaru)
-- Idempotent. Jalankan di Supabase SQL Editor (project TEST dulu).
--
-- 1) BYPASS BATAS GRATIS: setelah multi-toko, policy "members manage
--    store ..." hanya cek keanggotaan toko (store_id), TIDAK cek
--    seller_id. Trigger batas gratis (produk 20 / tautan 3 / tema)
--    membaca plan dari NEW.seller_id. Seller gratis bisa mengisi
--    seller_id = UUID seller premium (owner_id toko publik terlihat di
--    public_stores_v2) → dianggap premium → batas lolos.
--    Perbaikan: seller_id SELALU dipaksa = pemilik toko dari store_id.
--
-- 2) CHAT IMPERSONASI ADMIN: policy "seller sends messages" mengizinkan
--    anggota toko menulis sender_type='admin' → seller bisa kirim pesan
--    berlabel "admin" ke pembeli (phishing). Perbaikan: seller hanya
--    boleh 'seller'; 'admin' hanya untuk admin sungguhan; sender_id
--    harus diri sendiri.
-- ============================================================

-- ---------- 1) paksa seller_id = pemilik toko ----------
create or replace function enforce_seller_from_store()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_owner uuid;
begin
  if NEW.store_id is null then
    return NEW; -- fill_store_id (trg_00_fill_*) yang mengisi, lalu RLS menolak bila bukan anggota
  end if;
  select owner_id into v_owner from stores where id = NEW.store_id;
  if v_owner is null then
    raise exception 'TOKO_TIDAK_ADA';
  end if;
  NEW.seller_id := v_owner;
  return NEW;
end;
$$;

-- Nama "trg_00_z_..." → jalan SETELAH trg_00_fill_store_id_* dan
-- SEBELUM trigger batas gratis (trg_product_gratis_cap, dst).
drop trigger if exists trg_00_z_enforce_seller_products on products;
create trigger trg_00_z_enforce_seller_products
  before insert or update of seller_id, store_id on products
  for each row execute function enforce_seller_from_store();

drop trigger if exists trg_00_z_enforce_seller_bio_links on bio_links;
create trigger trg_00_z_enforce_seller_bio_links
  before insert or update of seller_id, store_id on bio_links
  for each row execute function enforce_seller_from_store();

drop trigger if exists trg_00_z_enforce_seller_discount_codes on discount_codes;
create trigger trg_00_z_enforce_seller_discount_codes
  before insert or update of seller_id, store_id on discount_codes
  for each row execute function enforce_seller_from_store();

drop trigger if exists trg_00_z_enforce_seller_store_hours on store_hours;
create trigger trg_00_z_enforce_seller_store_hours
  before insert or update of seller_id, store_id on store_hours
  for each row execute function enforce_seller_from_store();

drop trigger if exists trg_00_z_enforce_seller_store_theme on store_theme;
create trigger trg_00_z_enforce_seller_store_theme
  before insert or update of seller_id, store_id on store_theme
  for each row execute function enforce_seller_from_store();

-- Fungsi trigger tidak perlu bisa dipanggil langsung dari API.
revoke execute on function enforce_seller_from_store() from anon, authenticated;

-- ---------- 2) chat: kunci sender_type & sender_id ----------
drop policy if exists "seller sends messages" on chat_messages;
create policy "seller sends messages" on chat_messages
  for insert with check (
    (
      sender_type = 'seller'
      and (sender_id is null or sender_id = auth.uid())
      and exists (
        select 1 from chat_threads t
        where t.id = thread_id and is_store_member(t.store_id)
      )
    )
    or
    (
      sender_type = 'admin'
      and is_admin()
      and (sender_id is null or sender_id = auth.uid())
    )
  );

-- ---------- verifikasi ----------
-- A) Cek apakah ada yang SUDAH memalsukan seller_id (harus 0 baris semua):
--    select 'products' t, count(*) from products p join stores s on s.id = p.store_id where p.seller_id <> s.owner_id
--    union all select 'bio_links', count(*) from bio_links p join stores s on s.id = p.store_id where p.seller_id <> s.owner_id
--    union all select 'discount_codes', count(*) from discount_codes p join stores s on s.id = p.store_id where p.seller_id <> s.owner_id
--    union all select 'store_hours', count(*) from store_hours p join stores s on s.id = p.store_id where p.seller_id <> s.owner_id
--    union all select 'store_theme', count(*) from store_theme p join stores s on s.id = p.store_id where p.seller_id <> s.owner_id;
-- B) Sebagai seller GRATIS: insert produk dengan seller_id = UUID seller premium
--    → baris tersimpan dengan seller_id = diri sendiri, dan batas 20 produk
--    tetap berlaku (error BATAS_PRODUK_GRATIS di produk ke-21).
-- C) Sebagai seller: insert chat_messages sender_type='admin' → ditolak RLS.
