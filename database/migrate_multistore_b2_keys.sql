-- ============================================================
-- TokoLink — Multi-toko FASE B2: kunci per-toko (JALANKAN BARENG DEPLOY
-- KODE FASE B).
-- 1) store_theme: kunci tama dari seller_id PINDAH ke store_id (1 tema
--    per TOKO, bukan per user). Baris lama ikut (store_id sudah dibackfill).
-- 2) discount_codes: unik (seller_id,code) → unik (store_id,code) supaya
--    dua toko boleh pakai nama kode yang sama.
-- 3) store_hours: unik (seller_id,hari) → unik (store_id,hari).
-- Kolom seller_id lama TETAP ADA (dibersihkan Fase C). Idempotent.
-- ============================================================

-- ---------- 1) store_theme re-key ----------
alter table store_theme add column if not exists store_id uuid references stores(id) on delete cascade;
-- Isi yang masih null (baris dibuat kode lama setelah Fase A).
update store_theme t set store_id = s.id from stores s
  where t.store_id is null and s.owner_id = t.seller_id;
alter table store_theme drop constraint if exists store_theme_pkey;
-- Pastikan 1 baris per toko (gabung duplikat bila ada, pertahankan terbaru).
delete from store_theme a using store_theme b
  where a.store_id is not null and b.store_id is not null
    and a.store_id = b.store_id and a.updated_at < b.updated_at;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'store_theme_pkey') then
    alter table store_theme add primary key (store_id);
  end if;
end $$;

-- ---------- 2) discount unique per toko ----------
alter table discount_codes
  drop constraint if exists discount_codes_seller_id_code_key;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'discount_codes_store_id_code_key') then
    alter table discount_codes
      add constraint discount_codes_store_id_code_key unique (store_id, code);
  end if;
end $$;

-- ---------- 3) hours unique per toko ----------
alter table store_hours
  drop constraint if exists store_hours_seller_id_day_of_week_key;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'store_hours_store_id_day_key') then
    alter table store_hours
      add constraint store_hours_store_id_day_key unique (store_id, day_of_week);
  end if;
end $$;

-- ---------- verifikasi ----------
-- insert store_theme (seller_id, store_id, ...) dua toko beda → OK.
-- insert discount_codes code sama di 2 store_id beda → OK; store sama → 23505.
