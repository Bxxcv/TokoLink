-- ============================================================
-- TokoLink — Kunci tulis premium_requests (Okt 2026)
-- Temuan audit 12 Okt 2026: policy lama "seller manages own
-- premium_requests" (FOR ALL) membiarkan seller mengubah baris
-- tagihannya SENDIRI — mis. set status 'disetujui' agar layar
-- PremiumPay terlihat lunas (plan tetap aman karena dikunci trigger,
-- tapi antrean admin kotor + klaim palsu). Perbaikan: seller hanya
-- boleh BACA miliknya + BUAT baris baru miliknya. Ubah status hanya
-- admin (webhook pakai service_role, bypass RLS).
-- Idempotent. Jalankan di SQL editor Supabase.
-- ============================================================

drop policy if exists "seller manages own premium_requests" on premium_requests;

-- Baca: pemilik + admin.
create policy "seller reads own premium_requests" on premium_requests
  for select using (seller_id = auth.uid() or is_admin());

-- Buat: hanya baris milik sendiri (dipakai alur manual lama; alur QRIS
-- lewat service_role).
create policy "seller creates own premium_requests" on premium_requests
  for insert with check (seller_id = auth.uid());

-- Ubah/hapus: hanya admin (dipakai AdminPremium approve/tolak).
create policy "admin manages premium_requests" on premium_requests
  for all using (is_admin())
  with check (is_admin());

-- ---------- verifikasi ----------
-- Sebagai seller: update premium_requests set status='disetujui' where
-- seller_id=auth.uid() → 0 baris berubah (ditolak RLS).
-- Sebagai seller: insert dengan seller_id milik orang lain → ERROR RLS.
