-- ============================================================
-- TokoLink — Catatan penarikan (17 Okt 2026)
-- Tujuan: kolom "Catatan (opsional)" di form Tarik Dana BENAR-BENAR
-- tersimpan (sebelumnya input mati / tidak dikirim ke database).
--
-- 1) withdrawals.note (teks, opsional, maks 200 huruf).
-- 2) request_withdrawal: terima p_note (opsional) + simpan.
-- 3) admin_withdrawal_list: ikut mengembalikan note supaya admin
--    bisa membacanya (daftar & CSV).
--
-- Aman dijalankan berulang (idempotent). Kolom lama TIDAK diubah.
-- ============================================================

alter table withdrawals add column if not exists note text;

-- ---------- 1) request_withdrawal + p_note ----------
drop function if exists request_withdrawal(text, text, numeric);

create or replace function request_withdrawal(
  p_bank text,
  p_account_number text,
  p_amount numeric,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_bank text;
  v_acct text;
  v_amount numeric;
  v_note text;
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

  v_note := nullif(btrim(coalesce(p_note, '')), '');
  if v_note is not null and length(v_note) > 200 then
    raise exception 'CATATAN_TERLALU_PANJANG';
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

  insert into withdrawals (seller_id, bank, account_number, amount, fee, status, note)
  values (v_uid, v_bank, v_acct, v_amount, v_fee, 'menunggu', v_note)
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'amount', v_amount, 'fee', v_fee);
end;
$$;

-- ---------- 2) admin_withdrawal_list + note ----------
-- Return type berubah → wajib drop dulu (create or replace tidak bisa).
drop function if exists admin_withdrawal_list();

create or replace function admin_withdrawal_list()
returns table(
  id uuid, bank text, account_masked text, amount numeric, fee numeric,
  status text, created_at timestamptz, seller_id uuid, store_name text, note text
)
language plpgsql
stable security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'HANYA_ADMIN';
  end if;
  return query
    select w.id, w.bank,
           ('•••• ' || right(w.account_number, 4))::text,
           w.amount, w.fee, w.status, w.created_at,
           w.seller_id, p.store_name, w.note
    from withdrawals w
    join profiles p on p.id = w.seller_id
    order by w.created_at desc;
end;
$$;

-- ---------- verifikasi cepat ----------
-- select proname, pg_get_function_identity_arguments(oid)
--   from pg_proc where proname in ('request_withdrawal','admin_withdrawal_list');
-- request_withdrawal → p_bank text, p_account_number text, p_amount numeric, p_note text
