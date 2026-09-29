-- ============================================================
-- TokoLink — Migrasi Storage (dijalankan di Supabase SQL Editor)
-- Bucket publik "tokolink" untuk foto produk. Tiap seller hanya bisa
-- tulis di folder miliknya sendiri (path diawali auth.uid()).
-- CATATAN: avatar/cover toko & profil butuh kolom baru di profiles
-- (menunggu keputusan user) — migrasi ini KHUSUS foto produk.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('tokolink', 'tokolink', true)
on conflict (id) do nothing;

create policy "public read tokolink" on storage.objects
  for select using (bucket_id = 'tokolink');

create policy "seller upload own folder" on storage.objects
  for insert with check (
    bucket_id = 'tokolink'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "seller update own folder" on storage.objects
  for update using (
    bucket_id = 'tokolink'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "seller delete own folder" on storage.objects
  for delete using (
    bucket_id = 'tokolink'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
