-- ============================================================
-- TokoLink — Batas paket Gratis vs Premium (Okt 2026)
-- Model yang disetujui user 8 Okt 2026:
--   GRATIS : 1 toko, maks 20 produk, tema Klasik, maks 3 tautan bio,
--            ringkasan dasbor (tanpa Analytics/Traffic/unduh).
--   PREMIUM: produk tanpa batas, 8 tema + badge, bio tanpa batas,
--            Analytics + Traffic + unduh Excel, bantuan prioritas.
-- Grandfathering: yang sudah lewat batas TETAP aman (cek hanya saat
-- TAMBAH/ganti baru), tidak ada data yang dihapus/diturunkan.
-- Idempotent.
-- ============================================================

-- ---------- 1) produk: gratis maks 20 ----------
create or replace function check_product_gratis_cap()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_jwt_role text;
  v_plan text;
  v_count int;
begin
  begin
    v_jwt_role := auth.jwt() ->> 'role';
  exception when others then
    v_jwt_role := null;
  end;
  if v_jwt_role = 'service_role' or v_jwt_role is null then
    return NEW;
  end if;
  select plan into v_plan from profiles where id = NEW.seller_id;
  if v_plan = 'premium' then
    return NEW;
  end if;
  -- Kunci per-seller: dua insert bersamaan tidak bisa lolos bareng.
  perform pg_advisory_xact_lock(hashtext('gratis_cap:' || NEW.seller_id::text));
  select count(*) into v_count from products where seller_id = NEW.seller_id;
  if v_count >= 20 then
    raise exception 'BATAS_PRODUK_GRATIS';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_product_gratis_cap on products;
create trigger trg_product_gratis_cap
  before insert on products
  for each row execute function check_product_gratis_cap();

-- ---------- 2) tema engine: khusus premium (klasik bebas) ----------
create or replace function check_theme_gratis()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_jwt_role text;
  v_plan text;
  v_engine text[] := array[
    'warung-rame', 'kopi-sore', 'butik-rapi', 'jasa-kilat',
    'dapur-ngebul', 'kriya-asli', 'digital-kilat', 'konsultan-tenang'
  ];
begin
  begin
    v_jwt_role := auth.jwt() ->> 'role';
  exception when others then
    v_jwt_role := null;
  end;
  if v_jwt_role = 'service_role' or v_jwt_role is null then
    return NEW;
  end if;
  -- Yang sudah pakai tema engine boleh tetap (ganti field lain aman).
  if TG_OP = 'UPDATE'
     and OLD.theme_id is not distinct from NEW.theme_id then
    return NEW;
  end if;
  if NEW.theme_id = any (v_engine) then
    select plan into v_plan from profiles where id = NEW.seller_id;
    if v_plan is distinct from 'premium' then
      raise exception 'TEMA_PREMIUM';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_theme_gratis on store_theme;
create trigger trg_theme_gratis
  before insert or update on store_theme
  for each row execute function check_theme_gratis();

-- ---------- 3) tautan bio: gratis maks 3 ----------
create or replace function check_biolink_gratis_cap()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_jwt_role text;
  v_plan text;
  v_count int;
begin
  begin
    v_jwt_role := auth.jwt() ->> 'role';
  exception when others then
    v_jwt_role := null;
  end;
  if v_jwt_role = 'service_role' or v_jwt_role is null then
    return NEW;
  end if;
  select plan into v_plan from profiles where id = NEW.seller_id;
  if v_plan = 'premium' then
    return NEW;
  end if;
  perform pg_advisory_xact_lock(hashtext('gratis_cap:' || NEW.seller_id::text));
  select count(*) into v_count from bio_links where seller_id = NEW.seller_id;
  if v_count >= 3 then
    raise exception 'BATAS_TAUTAN_GRATIS';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_biolink_gratis_cap on bio_links;
create trigger trg_biolink_gratis_cap
  before insert on bio_links
  for each row execute function check_biolink_gratis_cap();

-- ---------- verifikasi ----------
-- Sebagai seller GRATIS dengan 20 produk: insert produk → ERROR BATAS_PRODUK_GRATIS.
-- Sebagai seller GRATIS: update store_theme theme_id='kopi-sore' → ERROR TEMA_PREMIUM
-- (kecuali theme_id memang sudah itu). Sebagai PREMIUM: semua lolos.
