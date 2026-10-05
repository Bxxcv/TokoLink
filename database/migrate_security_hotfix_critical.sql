-- ============================================================
-- TokoLink — SECURITY HOTFIX MVP (4 Critical: BUG-001 s.d BUG-004)
-- Tanggal: 4 Okt 2026
-- Cara pakai: jalankan SEKALI di Supabase SQL Editor (project
-- production), dari ATAS ke BAWAH. Idempotent: aman dijalankan ulang.
--
-- Isi:
--  A. BUG-001: kunci role/plan/status di profiles (trigger + RLS)
--  B. BUG-002: ledger hanya-baca untuk client (revoke + policy select)
--  C. BUG-003: withdrawals via RPC atomik (request + admin_process)
--  D. BUG-004: cabut baca anon profiles, ganti view public_stores
--
-- CATATAN: service_role (dipakai api/* webhook) BYPASS RLS, jadi
-- webhook pembayaran tetap bisa tulis ledger/payments/orders.
-- ============================================================

-- ---------- 0) is_admin() diamankan (search_path tetap) ----------
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer set search_path = public;

-- ============================================================
-- A. BUG-001 — seller tidak bisa mengangkat diri jadi admin,
--    tidak bisa utak-atik plan/status. Admin client tetap bisa
--    (dipakai Admin UI), tapi seller biasa DITOLAK di database.
-- ============================================================

-- Trigger: paksa INSERT jadi seller/gratis/aktif, tolak UPDATE
-- kolom privileged oleh non-admin. SECURITY DEFINER supaya baca
-- profiles di dalam trigger tidak kena RLS/recursion.
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
  -- Peran dari JWT: 'service_role' (server), 'authenticated' (user),
  -- 'anon', atau NULL (SQL editor langsung sebagai postgres).
  begin
    v_jwt_role := auth.jwt() ->> 'role';
  exception when others then
    v_jwt_role := null;
  end;

  if v_jwt_role = 'service_role' or v_jwt_role is null then
    v_is_service := true;
  end if;

  if v_is_service then
    return NEW; -- server & SQL langsung: bebas (buat admin manual, dsb.)
  end if;

  -- Siapa aktornya? Baca langsung (bypass RLS karena SECURITY DEFINER).
  select role into v_actor_role from profiles where id = auth.uid();
  if v_actor_role = 'admin' then
    v_is_admin := true;
  end if;

  if TG_OP = 'INSERT' then
    if not v_is_admin then
      -- Paksa default aman walau client mengirim role=admin.
      NEW.role := 'seller';
      NEW.plan := 'gratis';
      NEW.status := 'aktif';
    end if;
    -- id tidak boleh diubah sudah dijamin PK; RLS check id=auth.uid().
    return NEW;
  end if;

  -- TG_OP = 'UPDATE'
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
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_profiles_protect_privileged on profiles;
create trigger trg_profiles_protect_privileged
  before insert or update on profiles
  for each row execute function protect_profiles_privileged();

-- RLS profiles: cabut policy longgar, ganti yang ketat.
drop policy if exists "seller manages own profile" on profiles;
drop policy if exists "public can read storefront profile" on profiles;
drop policy if exists "profiles_select_own_admin" on profiles;
drop policy if exists "profiles_insert_self" on profiles;
drop policy if exists "profiles_update_self" on profiles;
drop policy if exists "profiles_admin_write" on profiles;

-- Baca: pemilik + admin. (Anon: TIDAK BOLEH — pakai view public_stores.)
create policy "profiles_select_own_admin" on profiles
  for select using (id = auth.uid() or is_admin());

-- Insert: hanya baris milik sendiri (trigger paksa role/plan/status).
create policy "profiles_insert_self" on profiles
  for insert with check (id = auth.uid());

-- Update: pemilik boleh ubah barisnya (kolom privileged dijaga trigger).
create policy "profiles_update_self" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Admin boleh ubah baris siapa pun (dipakai Admin UI suspend/approve).
create policy "profiles_admin_write" on profiles
  for update using (is_admin()) with check (is_admin());

-- ============================================================
-- D. BUG-004 — view publik tanpa PII (ditaruh di sini supaya urutan
--    drop policy di atas sudah jalan dulu).
--    Kolom SENGAJA minimal: tanpa owner_name, wa_number, address,
--    role, plan, status, created_at.
-- ============================================================
create or replace view public_stores as
  select id, store_name, store_slug, city,
         avatar_url, cover_url, bio, category, is_closed
  from profiles;

grant select on public_stores to anon, authenticated;

-- ============================================================
-- B. BUG-002 — ledger SERVER-AUTHORITATIVE: client hanya baca.
--    Tulis hanya via service_role (webhook) atau RPC admin
--    (admin_process_withdrawal di bawah).
-- ============================================================
drop policy if exists "seller manages own ledger" on ledger;
drop policy if exists "ledger read own" on ledger;
drop policy if exists "ledger_select_own" on ledger;

create policy "ledger_select_own" on ledger
  for select using (seller_id = auth.uid() or is_admin());

revoke insert, update, delete on ledger from anon, authenticated;
grant select on ledger to authenticated;

-- Saldo nol tidak ada artinya, cegah baris sampah.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ledger_amount_nonzero'
  ) then
    alter table ledger add constraint ledger_amount_nonzero check (amount <> 0);
  end if;
end
$$;

-- ============================================================
-- C. BUG-003 — withdrawals SERVER-AUTHORITATIVE.
-- ============================================================
drop policy if exists "seller manages own withdrawals" on withdrawals;
drop policy if exists "withdrawals read own" on withdrawals;
drop policy if exists "withdrawals_select_own" on withdrawals;

create policy "withdrawals_select_own" on withdrawals
  for select using (seller_id = auth.uid() or is_admin());

revoke insert, update, delete on withdrawals from anon, authenticated;
grant select on withdrawals to authenticated;

-- --- RPC 1: seller minta penarikan (validasi + anti-race) ---
create or replace function request_withdrawal(
  p_bank text, p_account_number text, p_amount numeric
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid;
  v_bank text;
  v_acct text;
  v_amount numeric;
  v_fee numeric := 6500;
  v_min numeric := 50000;
  v_balance numeric;
  v_pending numeric;
  v_available numeric;
  v_status text;
  v_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'BELUM_LOGIN';
  end if;

  -- Seller harus aktif (sekalian tegakkan status di jalur uang).
  select status into v_status from profiles where id = v_uid;
  if v_status is null then
    raise exception 'PROFIL_TIDAK_DITEMUKAN';
  end if;
  if v_status <> 'aktif' then
    raise exception 'AKUN_NONAKTIF';
  end if;

  v_bank := btrim(coalesce(p_bank, ''));
  if v_bank = '' or length(v_bank) > 30 then
    raise exception 'BANK_TIDAK_VALID';
  end if;

  v_acct := regexp_replace(coalesce(p_account_number, ''), '[^0-9]', '', 'g');
  if length(v_acct) < 9 or length(v_acct) > 20 then
    raise exception 'REKENING_TIDAK_VALID';
  end if;

  v_amount := p_amount;
  if v_amount is null or v_amount <= 0 then
    raise exception 'NOMINAL_TIDAK_VALID';
  end if;
  -- Batas bawah dari settings (bisa diubah admin tanpa deploy).
  begin
    select nullif(value, '')::numeric into v_min from settings where key = 'min_withdrawal';
    if v_min is null or v_min < 1000 then v_min := 50000; end if;
  exception when others then
    v_min := 50000;
  end;
  if v_amount < v_min then
    raise exception 'MINIMAL_PENARIKAN';
  end if;

  -- Kunci per-seller dalam transaksi ini: dua request bersamaan
  -- dipaksa antre, tidak bisa menghabiskan saldo yang sama.
  perform pg_advisory_xact_lock(hashtext('withdrawal:' || v_uid::text));

  select coalesce(sum(amount), 0) into v_balance
  from ledger where seller_id = v_uid;

  select coalesce(sum(amount), 0) into v_pending
  from withdrawals where seller_id = v_uid and status in ('menunggu', 'diproses');

  v_available := v_balance - v_pending;
  if v_amount > v_available then
    raise exception 'SALDO_TIDAK_CUKUP';
  end if;

  insert into withdrawals (seller_id, bank, account_number, amount, fee, status)
  values (v_uid, v_bank, v_acct, v_amount, v_fee, 'menunggu')
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'amount', v_amount, 'fee', v_fee);
end;
$$;

grant execute on function request_withdrawal(text, text, numeric) to authenticated;

-- --- RPC 2: admin proses penarikan (atomik + anti-ganda) ---
create or replace function admin_process_withdrawal(
  p_id uuid, p_action text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_seller uuid;
  v_amount numeric;
  v_bank text;
  v_cur text;
  v_balance numeric;
  v_pending_other numeric;
  v_available numeric;
begin
  if not is_admin() then
    raise exception 'HANYA_ADMIN';
  end if;

  if p_action not in ('diproses', 'selesai', 'ditolak') then
    raise exception 'AKSI_TIDAK_VALID';
  end if;

  -- Kunci baris penarikan: dua admin tidak bisa proses ganda.
  select seller_id, amount, bank, status
    into v_seller, v_amount, v_bank, v_cur
  from withdrawals where id = p_id for update;

  if not found then
    raise exception 'TIDAK_DITEMUKAN';
  end if;

  -- State machine: menunggu→diproses→selesai, atau →ditolak.
  if not (
    (p_action = 'diproses' and v_cur = 'menunggu') or
    (p_action = 'selesai'  and v_cur = 'diproses') or
    (p_action = 'ditolak'   and v_cur in ('menunggu', 'diproses'))
  ) then
    raise exception 'TRANSISI_TIDAK_VALID';
  end if;

  -- Serialkan dengan request_withdrawal seller yang sama.
  perform pg_advisory_xact_lock(hashtext('withdrawal:' || v_seller::text));

  if p_action = 'selesai' then
    -- Pastikan saldo masih cukup (hitung ulang, tanpa baris ini sendiri
    -- yang memang tidak ada di ledger sebelum selesai).
    select coalesce(sum(amount), 0) into v_balance
    from ledger where seller_id = v_seller;
    select coalesce(sum(amount), 0) into v_pending_other
    from withdrawals
    where seller_id = v_seller and status in ('menunggu', 'diproses') and id <> p_id;
    v_available := v_balance - v_pending_other;
    if v_amount > v_available then
      raise exception 'SALDO_TIDAK_CUKUP';
    end if;

    update withdrawals
      set status = 'selesai', processed_at = now()
      where id = p_id;

    -- Potong saldo ATOMIK dalam transaksi yang sama: gagal di sini =
    -- status ikut rollback, tidak bisa "selesai tanpa potong".
    insert into ledger (seller_id, label, amount, type, ref_order_id)
    values (v_seller, 'Penarikan ke ' || v_bank, -abs(v_amount), 'keluar', null);

    return jsonb_build_object('id', p_id, 'status', 'selesai');
  elsif p_action = 'diproses' then
    update withdrawals
      set status = 'diproses', processed_at = now()
      where id = p_id;
    return jsonb_build_object('id', p_id, 'status', 'diproses');
  else
    update withdrawals
      set status = 'ditolak', processed_at = now()
      where id = p_id;
    return jsonb_build_object('id', p_id, 'status', 'ditolak');
  end if;
end;
$$;

grant execute on function admin_process_withdrawal(uuid, text) to authenticated;

-- ---------- verifikasi cepat (jalankan manual setelah migrasi) ----------
-- 1) select policyname from pg_policies where tablename='profiles';
--    → TIDAK BOLEH ada lagi "seller manages own profile" / "public can read storefront profile".
-- 2) Sebagai ANON: select * from profiles limit 1; → 0 baris (ditolak RLS).
--    Sebagai ANON: select * from public_stores limit 5; → hanya kolom publik.
-- 3) Sebagai SELLER: update profiles set role='admin' → ERROR ROLE_TIDAK_BOLEH_BERUBAH.
-- 4) Sebagai SELLER: insert into ledger ... → ERROR (42501 / RLS).
-- 5) Sebagai SELLER: insert into withdrawals ... → ERROR (42501 / RLS).
--    Pakai: select request_withdrawal('BCA','1234567890',50000);
-- 6) Sebagai ADMIN: select admin_process_withdrawal('<id>','diproses');
