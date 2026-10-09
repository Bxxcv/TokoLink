-- ============================================================
-- TokoLink — Hardening upload Storage (Okt 2026)
-- Bucket "tokolink" tetap publik-baca (foto produk/etalase), tapi tulis
-- dibatasi ekstensi gambar. Sebelumnya policy hanya cek folder milik
-- sendiri — JWT yang bocor bisa dipakai menitip file non-gambar
-- (HTML/JS) yang ikut tersaji publik. Idempotent.
-- Catatan: validasi MIME + 2MB tetap juga di client (storage.ts).
-- ============================================================

drop policy if exists "seller upload own folder" on storage.objects;
create policy "seller upload own folder" on storage.objects
  for insert with check (
    bucket_id = 'tokolink'
    and (storage.foldername(name))[1] = auth.uid()::text
    and storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp')
  );

drop policy if exists "seller update own folder" on storage.objects;
create policy "seller update own folder" on storage.objects
  for update using (
    bucket_id = 'tokolink'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'tokolink'
    and (storage.foldername(name))[1] = auth.uid()::text
    and storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp')
  );

-- ---------- verifikasi ----------
-- Sebagai seller: upload avatar.png ke folder sendiri → boleh.
-- Upload test.html → ERROR policy. Baca publik foto lama tetap jalan.
