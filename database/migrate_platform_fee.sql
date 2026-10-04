-- ============================================================
-- TokoLink — Komisi platform (4 Okt 2026)
-- Default 2% dari nilai pesanan, dipotong dari SALDO SELLER saat
-- settlement (bukan ditambahkan ke tagihan buyer) -- beda dari biaya
-- BuatQris yang `fee_by=user`. Dicatat sebagai baris ledger terpisah
-- ("keluar") supaya transparan di riwayat saldo seller, bukan diam-diam
-- memotong angka "Penjualan".
--
-- Ini ANGKA DEFAULT, bukan keputusan final -- ganti kapan saja tanpa
-- deploy ulang kode:
--   update settings set value = '3' where key = 'platform_fee_percent';
-- Set ke '0' buat matikan komisi sementara.
--
-- Butuh tabel `settings` dari database/migrate_admin_audit_broadcast.sql
-- -- jalankan itu dulu kalau belum. Idempotent (ON CONFLICT DO NOTHING).
-- ============================================================

insert into settings (key, value)
values ('platform_fee_percent', '2')
on conflict (key) do nothing;
