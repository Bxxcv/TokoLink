-- Bot FAQ: jawaban otomatis berbasis kata kunci (P2 fondasi).
create or replace function buyer_bot_reply(p_thread_id uuid, p_order_token uuid, p_question text)
returns text
language plpgsql security definer set search_path = public
as $$
declare v_thread record; v_ans text;
begin
  select id, buyer_token into v_thread from chat_threads where id = p_thread_id;
  if v_thread.id is null or v_thread.buyer_token is distinct from p_order_token then
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
grant execute on function buyer_bot_reply(uuid, uuid, text) to anon, authenticated;
