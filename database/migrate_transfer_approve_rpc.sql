-- RPC atomik untuk approve/reject transfer manual (P1).
-- Menggantikan update langsung di frontend yang tidak mencatat ledger.
create or replace function admin_approve_transfer(p_payment_id uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_pay record; v_fee_pct numeric; v_fee numeric; v_credit numeric;
begin
  if not is_admin() then raise exception 'HANYA_ADMIN'; end if;
  select id, order_id, seller_id, amount, status, channel into v_pay
    from payments where id = p_payment_id;
  if v_pay.id is null then raise exception 'PAYMENT_TIDAK_DITEMUKAN'; end if;
  if v_pay.channel <> 'Transfer manual' then raise exception 'BUKAN_TRANSFER_MANUAL'; end if;
  if v_pay.status = 'berhasil' then return jsonb_build_object('ok', true, 'deduped', true); end if;
  if v_pay.status <> 'menunggu' then raise exception 'STATUS_TIDAK_VALID'; end if;

  select coalesce((select value::numeric from settings where key='platform_fee_percent'), 2) into v_fee_pct;
  v_fee := round(v_pay.amount * v_fee_pct / 100, 2);
  v_credit := v_pay.amount - v_fee;

  update payments set status='berhasil', fee=v_fee where id = p_payment_id and status='menunggu';
  if not found then return jsonb_build_object('ok', true, 'deduped', true); end if;

  update orders set status='dikemas' where id = v_pay.order_id and status='menunggu';

  insert into ledger (seller_id, label, amount, type, ref_order_id)
    values (v_pay.seller_id, 'Penjualan ' || v_pay.order_id, v_credit, 'masuk', v_pay.order_id);
  if v_fee > 0 then
    insert into ledger (seller_id, label, amount, type, ref_order_id)
      values (v_pay.seller_id, 'Komisi platform ' || v_pay.order_id, -v_fee, 'keluar', v_pay.order_id);
  end if;

  return jsonb_build_object('ok', true, 'credit', v_credit, 'fee', v_fee);
end;
$$;
grant execute on function admin_approve_transfer(uuid) to authenticated;

create or replace function admin_reject_transfer(p_payment_id uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_pay record; v_promo uuid;
begin
  if not is_admin() then raise exception 'HANYA_ADMIN'; end if;
  select id, order_id, status, channel into v_pay from payments where id = p_payment_id;
  if v_pay.id is null then raise exception 'PAYMENT_TIDAK_DITEMUKAN'; end if;
  if v_pay.channel <> 'Transfer manual' then raise exception 'BUKAN_TRANSFER_MANUAL'; end if;
  if v_pay.status <> 'menunggu' then return jsonb_build_object('ok', true, 'deduped', true); end if;

  update payments set status='gagal' where id = p_payment_id and status='menunggu';
  update orders set status='batal' where id = v_pay.order_id and status='menunggu';

  select promo_id into v_promo from orders where id = v_pay.order_id;
  if v_promo is not null then
    perform restore_promo(v_promo);
  end if;

  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function admin_reject_transfer(uuid) to authenticated;