-- ============================================================
-- TokoLink — Migrasi ID 8 tema baru (Okt 2026)
-- Set tema lama diganti total (lihat Hasil_Repair/Brief_Desain_Tema.md).
-- Petakan pilihan seller lama ke padanan barunya (1:1 semantik) supaya
-- tidak ada toko yang mental ke tampilan default:
--
--   ruang-seduh    → kopi-sore        (kopi/bakery)
--   pasar-rapi     → warung-rame      (katalog padat kuliner)
--   lugas-jasa     → jasa-kilat       (jasa)
--   atelier        → butik-rapi       (fashion)
--   dapur-hari-ini → dapur-ngebul     (katering)
--   kriya-nusantara→ kriya-asli       (kerajinan)
--   pixel-goods    → digital-kilat    (digital)
--   studio-tenang  → konsultan-tenang (jasa profesional)
--
-- Nilai lain (termasuk 'klasik') dibiarkan. Idempotent.
-- ============================================================

update store_theme set theme_id = 'kopi-sore'
  where theme_id = 'ruang-seduh';
update store_theme set theme_id = 'warung-rame'
  where theme_id = 'pasar-rapi';
update store_theme set theme_id = 'jasa-kilat'
  where theme_id = 'lugas-jasa';
update store_theme set theme_id = 'butik-rapi'
  where theme_id = 'atelier';
update store_theme set theme_id = 'dapur-ngebul'
  where theme_id = 'dapur-hari-ini';
update store_theme set theme_id = 'kriya-asli'
  where theme_id = 'kriya-nusantara';
update store_theme set theme_id = 'digital-kilat'
  where theme_id = 'pixel-goods';
update store_theme set theme_id = 'konsultan-tenang'
  where theme_id = 'studio-tenang';

-- ---------- verifikasi ----------
-- select theme_id, count(*) from store_theme group by 1;
-- Tidak boleh ada lagi id lama di hasil.
