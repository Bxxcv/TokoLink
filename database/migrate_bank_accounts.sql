-- ============================================================
-- TokoLink — Rekening tersimpan seller (Okt 2026)
-- Seller bisa simpan beberapa rekening, pilih saat withdraw.
-- request_withdrawal TIDAK berubah (terima bank+rekening langsung).
-- Idempotent.
-- ============================================================

create table if not exists seller_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  bank text not null,
  account_number text not null,
  account_name text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (seller_id, bank, account_number)
);

alter table seller_bank_accounts enable row level security;

drop policy if exists "seller manages own bank accounts" on seller_bank_accounts;
create policy "seller manages own bank accounts" on seller_bank_accounts
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());

-- Satu default per seller: trigger kecil.
create or replace function ensure_single_default_account()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if NEW.is_default then
    update seller_bank_accounts
      set is_default = false
      where seller_id = NEW.seller_id and id <> NEW.id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_single_default_account on seller_bank_accounts;
create trigger trg_single_default_account
  after insert or update on seller_bank_accounts
  for each row execute function ensure_single_default_account();

-- ---------- verifikasi ----------
-- insert 2 rekening (satu default) → yang lama otomatis non-default.
-- seller lain tidak bisa select/insert ke seller_id orang.
