-- ============================================================
-- TokoLink — Tautan bio publik (dijalankan di Supabase SQL Editor)
-- Tautan AKTIF memang tampil di etalase publik, jadi boleh dibaca
-- semua orang. Klik dihitung via update terpisah (butuh policy update
-- clicks khusus anon? TIDAK — klik dicatat best-effort; kalau ditolak
-- RLS, etalase tetap jalan).
-- ============================================================

drop policy if exists "public can read active bio links" on bio_links;
create policy "public can read active bio links" on bio_links
  for select using (is_active = true);
