-- ============================================================
-- TokoLink — Bayar Premium via QRIS otomatis (Okt 2026)
-- Keputusan user 12 Okt 2026: seller bayar 59rb/bln atau 588rb/thn
-- via QRIS BuatQris; plan jadi 'premium' OTOMATIS setelah webhook.
-- Alur tombol "Ajukan" manual tetap ada sebagai cadangan admin.
--
-- 1) profiles.premium_until: akhir masa Premium. NULL = Premium lama
--    (grandfathering, dianggap aktif selamanya) — JANGAN diisi untuk
--    akun yang sudah premium sebelum fitur ini.
-- 2) premium_requests.external_ref: transaction_id BuatQris (dicocokkan
--    webhook) + paid_at (kapan lunas) + status 'kedaluwarsa'.
-- 3) Trigger freemium (produk/tema/bio) jadi sadar kedaluwarsa: plan
--    'premium' yang sudah lewat premium_until dianggap gratis.
-- 4) Trigger protect_profiles_privileged: seller TIDAK boleh ubah
--    premium_until sendiri (sebelumnya hanya role/plan/status).
-- Idempotent. WAJIB dijalankan di SQL editor Supabase sebelum deploy.
-- ============================================================

alter table profiles
  add column if not exists premium_until timestamptz;

alter table premium_requests
  add column if not exists external_ref text;

alter table premium_requests
  add column if not exists paid_at timestamptz;

create unique index if not exists premium_requests_extref_uidx
  on premium_requests (external_ref) where external_ref is not null;

-- Status 'kedaluwarsa' untuk QR yang tidak dibayar (nama constraint
-- bawaan dari definisi CHECK inline di schema.sql).
alter table premium_requests
  drop constraint if exists premium_requests_status_check;
alter table premium_requests
  add constraint premium_requests_status_check
  check (status in ('menunggu', 'disetujui', 'ditolak', 'kedaluwarsa'));

-- ---------- trigger freemium: sadar kedaluwarsa ----------
-- Premium aktif = plan 'premium' DAN (tanpa batas waktu ATAU belum habis).
create or replace function check_product_gratis_cap()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_jwt_role text;
  v_plan text;
  v_until timestamptz;
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
  select plan, premium_until into v_plan, v_until from profiles where id = NEW.seller_id;
  if v_plan = 'premium' and (v_until is null or v_until > now()) then
    return NEW;
  end if;
  perform pg_advisory_xact_lock(hashtext('gratis_cap:' || NEW.seller_id::text));
  select count(*) into v_count from products where seller_id = NEW.seller_id;
  if v_count >= 20 then
    raise exception 'BATAS_PRODUK_GRATIS';
  end if;
  return NEW;
end;
$$;

create or replace function check_theme_gratis()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_jwt_role text;
  v_plan text;
  v_until timestamptz;
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
  if TG_OP = 'UPDATE'
     and OLD.theme_id is not distinct from NEW.theme_id then
    return NEW;
  end if;
  if NEW.theme_id = any (v_engine) then
    select plan, premium_until into v_plan, v_until from profiles where id = NEW.seller_id;
    if v_plan is distinct from 'premium' or (v_until is not null and v_until <= now()) then
      raise exception 'TEMA_PREMIUM';
    end if;
  end if;
  return NEW;
end;
$$;

create or replace function check_biolink_gratis_cap()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_jwt_role text;
  v_plan text;
  v_until timestamptz;
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
  select plan, premium_until into v_plan, v_until from profiles where id = NEW.seller_id;
  if v_plan = 'premium' and (v_until is null or v_until > now()) then
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

-- ---------- protect_profiles_privileged: kunci premium_until juga ----------
create or replace function protect_profiles_privileged()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_jwt_role text;
  v_actor_role text;
  v_is_admin boolean := false;
  v_is_service boolean := false;
begin
  begin
    v_jwt_role := auth.jwt() ->> 'role';
  exception when others then
    v_jwt_role := null;
  end;
  if v_jwt_role = 'service_role' or v_jwt_role is null then
    v_is_service := true;
  end if;

  if v_is_service then
    return NEW;
  end if;

  select role into v_actor_role from profiles where id = auth.uid();
  if v_actor_role = 'admin' then
    v_is_admin := true;
  end if;

  if TG_OP = 'INSERT' then
    if not v_is_admin then
      NEW.role := 'seller';
      NEW.plan := 'gratis';
      NEW.status := 'aktif';
      NEW.premium_until := null;
    end if;
    return NEW;
  end if;

  if NEW.id is distinct from OLD.id then
    raise exception 'ID_PROFIL_TIDAK_BOLEH_BERUBAH';
  end if;
  if not v_is_admin then
    if NEW.role is distinct from OLD.role then
      raise exception 'ROLE_TIDAK_BOLEH_BERUBAH';
    end if;
    if NEW.plan is distinct from OLD.plan then
      raise exception 'PLAN_TIDAK_BOLEH_BERUBAH';
    end if;
    if NEW.status is distinct from OLD.status then
      raise exception 'STATUS_TIDAK_BOLEH_BERUBAH';
    end if;
    if NEW.premium_until is distinct from OLD.premium_until then
      raise exception 'PREMIUM_UNTIL_TIDAK_BOLEH_BERUBAH';
    end if;
  end if;
  return NEW;
end;
$$;

-- ---------- verifikasi ----------
-- select column_name from information_schema.columns
--   where table_name in ('profiles','premium_requests')
--   and column_name in ('premium_until','external_ref','paid_at');
-- Harus 3 baris. Sebagai seller: update profiles set premium_until=now()
-- where id=auth.uid() → ERROR PREMIUM_UNTIL_TIDAK_BOLEH_BERUBAH.
