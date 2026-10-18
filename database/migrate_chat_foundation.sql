-- ============================================================
-- Chat foundation (P2) — tabel + RLS + RPC buyer. Idempoten.
-- Retensi 2-4 minggu: bersihkan via cron/manual (belum diotomasi).
-- ============================================================
create table if not exists chat_threads (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  seller_id uuid references profiles(id) on delete cascade,
  buyer_token uuid,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  sender_type text not null check (sender_type in ('buyer','seller','bot','admin')),
  sender_id uuid references profiles(id),
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table chat_threads enable row level security;
alter table chat_messages enable row level security;

-- Seller/admin baca thread tokonya.
drop policy if exists "seller reads own threads" on chat_threads;
create policy "seller reads own threads" on chat_threads
  for select using (is_store_member(store_id) or is_admin());

drop policy if exists "seller reads own messages" on chat_messages;
create policy "seller reads own messages" on chat_messages
  for select using (exists (
    select 1 from chat_threads t where t.id = thread_id
      and (is_store_member(t.store_id) or is_admin())
  ));

-- Seller/admin kirim pesan (insert) ke thread tokonya.
drop policy if exists "seller sends messages" on chat_messages;
create policy "seller sends messages" on chat_messages
  for insert with check (
    sender_type in ('seller','admin')
    and exists (select 1 from chat_threads t where t.id = thread_id
      and (is_store_member(t.store_id) or is_admin()))
  );

-- Buyer TIDAK akses langsung; lewat RPC security definer.

-- ---------- RPC: buyer buka chat (validasi access_token order) ----------
create or replace function buyer_open_chat(p_store_id uuid, p_order_token uuid, p_body text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_thread uuid; v_order record;
begin
  if p_body is null or length(btrim(p_body)) < 1 or length(p_body) > 2000 then
    raise exception 'PESAN_TIDAK_VALID';
  end if;
  select id, seller_id into v_order from orders
    where store_id = p_store_id and access_token = p_order_token limit 1;
  if v_order.id is null then raise exception 'ORDER_TIDAK_DITEMUKAN'; end if;
  insert into chat_threads (store_id, seller_id, buyer_token)
    values (p_store_id, v_order.seller_id, p_order_token) returning id into v_thread;
  insert into chat_messages (thread_id, sender_type, body) values (v_thread, 'buyer', btrim(p_body));
  return v_thread;
end;
$$;
grant execute on function buyer_open_chat(uuid, uuid, text) to anon, authenticated;

-- ---------- RPC: buyer balas chat ----------
create or replace function buyer_send_chat(p_thread_id uuid, p_order_token uuid, p_body text)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_thread record;
begin
  if p_body is null or length(btrim(p_body)) < 1 or length(p_body) > 2000 then
    raise exception 'PESAN_TIDAK_VALID';
  end if;
  select id, buyer_token into v_thread from chat_threads where id = p_thread_id;
  if v_thread.id is null or v_thread.buyer_token is distinct from p_order_token then
    raise exception 'AKSES_DITOLAK';
  end if;
  insert into chat_messages (thread_id, sender_type, body) values (p_thread_id, 'buyer', btrim(p_body));
  update chat_threads set last_message_at = now() where id = p_thread_id;
end;
$$;
grant execute on function buyer_send_chat(uuid, uuid, text) to anon, authenticated;

create index if not exists chat_threads_store_idx on chat_threads(store_id, last_message_at desc);
create index if not exists chat_messages_thread_idx on chat_messages(thread_id, created_at);
