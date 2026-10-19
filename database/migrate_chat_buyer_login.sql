-- Chat buyer wajib login: tambah buyer_id + RLS buyer.
alter table chat_threads add column if not exists buyer_id uuid references auth.users(id) on delete set null;
create index if not exists chat_threads_buyer_idx on chat_threads(buyer_id, last_message_at desc);

-- buyer baca thread miliknya
drop policy if exists "buyer reads own threads" on chat_threads;
create policy "buyer reads own threads" on chat_threads
  for select using (buyer_id = auth.uid());

-- buyer baca pesan di thread miliknya
drop policy if exists "buyer reads own messages" on chat_messages;
create policy "buyer reads own messages" on chat_messages
  for select using (exists (
    select 1 from chat_threads t where t.id = chat_messages.thread_id and t.buyer_id = auth.uid()
  ));

-- Buyer insert pesan lewat RPC saja; langsung insert ditolak (RLS default deny).

-- Perbarui buyer_open_chat: wajib login + buyer_id = pemilik order.
create or replace function buyer_open_chat(p_store_id uuid, p_order_token uuid, p_body text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_thread uuid; v_order record; v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'BELUM_LOGIN'; end if;
  if p_body is null or length(btrim(p_body)) < 1 or length(p_body) > 2000 then
    raise exception 'PESAN_TIDAK_VALID';
  end if;
  select id, seller_id, buyer_id into v_order from orders
    where store_id = p_store_id and access_token = p_order_token limit 1;
  if v_order.id is null then raise exception 'ORDER_TIDAK_DITEMUKAN'; end if;
  if v_order.buyer_id is distinct from v_uid then raise exception 'BUKAN_PEMILIK_ORDER'; end if;
  insert into chat_threads (store_id, seller_id, buyer_id, buyer_token)
    values (p_store_id, v_order.seller_id, v_uid, p_order_token) returning id into v_thread;
  insert into chat_messages (thread_id, sender_type, body) values (v_thread, 'buyer', btrim(p_body));
  return v_thread;
end;
$$;
grant execute on function buyer_open_chat(uuid, uuid, text) to authenticated;

-- buyer_send_chat: wajib login + pemilik thread
create or replace function buyer_send_chat(p_thread_id uuid, p_order_token uuid, p_body text)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_thread record; v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'BELUM_LOGIN'; end if;
  if p_body is null or length(btrim(p_body)) < 1 or length(p_body) > 2000 then
    raise exception 'PESAN_TIDAK_VALID';
  end if;
  select id, buyer_id, buyer_token into v_thread from chat_threads where id = p_thread_id;
  if v_thread.id is null or v_thread.buyer_id is distinct from v_uid or v_thread.buyer_token is distinct from p_order_token then
    raise exception 'AKSES_DITOLAK';
  end if;
  insert into chat_messages (thread_id, sender_type, body) values (p_thread_id, 'buyer', btrim(p_body));
  update chat_threads set last_message_at = now() where id = p_thread_id;
end;
$$;
grant execute on function buyer_send_chat(uuid, uuid, text) to authenticated;

-- buyer_bot_reply: wajib login + pemilik thread
create or replace function buyer_bot_reply(p_thread_id uuid, p_order_token uuid, p_question text)
returns text
language plpgsql security definer set search_path = public
as $$
declare v_thread record; v_ans text; v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'BELUM_LOGIN'; end if;
  select id, buyer_id, buyer_token into v_thread from chat_threads where id = p_thread_id;
  if v_thread.id is null or v_thread.buyer_id is distinct from v_uid or v_thread.buyer_token is distinct from p_order_token then
    raise exception 'AKSES_DITOLAK';
  end if;
  v_ans := case
    when p_question ilike '%ongkir%' or p_question ilike '%ongkos%' then 'Ongkir dihitung saat chat dengan penjual (kirim via chat).'
    when p_question ilike '%bayar%' or p_question ilike '%qris%' then 'Pembayaran lewat QRIS otomatis. Setelah bayar, status pesanan akan berubah otomatis.'
    when p_question ilike '%status%' or p_question ilike '%lacak%' then 'Cek status pesanan lewat tautan yang kamu terima saat checkout.'
    when p_question ilike '%jam%' or p_question ilike '%buka%' then 'Jam buka toko tertera di halaman toko (zona WIB).'
    else null
  end;
  if v_ans is not null then
    insert into chat_messages (thread_id, sender_type, body) values (p_thread_id, 'bot', v_ans);
    update chat_threads set last_message_at = now() where id = p_thread_id;
  end if;
  return v_ans;
end;
$$;
grant execute on function buyer_bot_reply(uuid, uuid, text) to authenticated;
