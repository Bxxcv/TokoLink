-- ============================================================
-- Transfer manual (bukti upload) — P1
-- 1) payments.proof_url (bukti pembayaran)
-- 2) storage bucket payment-proofs (private) + RLS
-- ============================================================
alter table payments add column if not exists proof_url text;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- Buyer (yang punya order) boleh upload bukti ke path {order_id}/...
drop policy if exists "buyer upload proof" on storage.objects;
create policy "buyer upload proof" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and exists (select 1 from orders o where o.id = (storage.foldername(name))[1] and o.buyer_id = auth.uid())
  );

-- Buyer baca bukti miliknya sendiri.
drop policy if exists "buyer read own proof" on storage.objects;
create policy "buyer read own proof" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and exists (select 1 from orders o where o.id = (storage.foldername(name))[1] and o.buyer_id = auth.uid())
  );

-- Admin baca semua bukti.
drop policy if exists "admin read all proofs" on storage.objects;
create policy "admin read all proofs" on storage.objects
  for select to authenticated
  using (bucket_id = 'payment-proofs' and is_admin());

create index if not exists payments_proof_idx on payments(proof_url) where proof_url is not null;
