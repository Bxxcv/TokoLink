-- ============================================================
-- Security hotfix — 17 Okt 2026
-- 1) store_members: cegah self-join ke toko orang lain (IDOR cross-tenant).
--    Insert hanya boleh jika toko itu milik user sendiri (owner_id = auth.uid())
--    atau user adalah admin. Tidak ada update/delete policy → default deny.
-- 2) store_contact_link: batasi ke id toko saja (hapus fallback owner_id) supaya
--    nomor WA tidak bisa dipanen lewat user id / enumerasi.
-- ============================================================

-- 1) Perbaiki policy insert store_members
drop policy if exists "members join stores" on store_members;
create policy "members join stores" on store_members
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from stores s where s.id = store_id and (s.owner_id = auth.uid() or is_admin()))
  );

-- 2) Batasi store_contact_link ke id toko saja
create or replace function store_contact_link(p_seller_id uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object('wa_url', case
    when wa_number is null or btrim(wa_number) = '' then null
    else 'https://wa.me/' || case
      when regexp_replace(wa_number, '[^0-9]', '', 'g') like '0%'
        then '62' || substring(regexp_replace(wa_number, '[^0-9]', '', 'g') from 2)
      else regexp_replace(wa_number, '[^0-9]', '', 'g') end
  end)
  from stores
  where id = p_seller_id
  limit 1;
$$;

grant execute on function store_contact_link(uuid) to anon, authenticated;
