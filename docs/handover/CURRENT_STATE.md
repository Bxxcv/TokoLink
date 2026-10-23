# CURRENT_STATE — Kondisi Proyek (18 Okt 2026)

**Tanggal pemeriksaan:** 18 Okt 2026  
**Branch:** main  
**Commit terakhir:** 14a2df6 "Hapus check-payment-status (Hobby 12 function limit)"  
**Remote:** https://github.com/Bxxcv/TokoLink.git (pushed, sinkron)

## 1. Fitur yang sudah berfungsi (VERIFIED)

- **Auth**: Login/register (email+password), reset password (/reset), buyer wajib login (/masuk, /daftar).
- **Multi-toko**: Fase A+B selesai (tabel stores, store_members, store_id di 7 tabel, RLS is_store_member). Fase C (hapus seller_id lama) belum.
- **Produk**: CRUD per toko, stok, kategori.
- **Orders/Checkout**: create-order server-side (harga dari DB, promo server-side, idempotensi). QRIS via BuatQris + webhook HMAC. Transfer manual dengan bukti upload + admin review.
- **Wallet/Withdraw**: ledger sum, RPC request_withdrawal (validasi saldo), admin_process_withdrawal.
- **Bio links, Discount, Hours, StoreQR, Theme engine**: selesai.
- **Admin**: Home, Sellers, Premium, Withdrawals, Payments, Users, System, Audit, Broadcast — semua query real.
- **Chat**: /chat buyer+seller, bot FAQ, widget floating, polling 5s.
- **Reports**: tabel reports + admin queue /admin/reports.
- **Status page**: /status.
- **Export CSV**: di AccountSettings.
- **Security hotfix**: IDOR store_members, chat impersonation, freemium bypass, PII leak profiles, force_open grant.

## 2. Fitur yang belum selesai / partial

- **Buyer wajib login**: migrasi buyer_id done, Checkout guard done, /orders done. Tracking token lama masih jalan (backward compat).
- **Transfer manual**: approve admin sekarang insert ledger (RPC admin_approve_transfer). Reject restore promo. ✅
- **Force open override**: toggle done, badge ikut force_open. ✅
- **Chat**: bot FAQ statis (kata kunci), eskalasi notifikasi belum, retensi 2-4 minggu belum diotomasi.
- **Promo publik**: S3 ditunda (kandidat fitur).
- **OG /{slug}**: hanya di /t/{slug} (Hobby plan max 12 functions).
- **Domain kustom**: belum.
- **Verifikasi penjual**: belum.
- **Studi kasus/testimoni**: section empty state (tanpa data palsu).
- **Smoke test E2E**: belum dijalankan.
- **Cek 7 tema di HP**: belum.

## 3. Status build & validasi

- `npm run build`: PASS (exit 0, ~1.1MB single-file).
- `npx tsc --noEmit`: 8 warning TS6133 (unused vars, pre-existing, tidak ada error baru).
- Vercel deploy: READY (commit 14a2df6).
- Supabase: migrasi buyer_id, transfer manual, buyer order_items, security hotfix, force_open, store select grant — semua sudah dijalankan via MCP.

## 4. Kondisi Git

- Branch: main
- Commit terakhir: 14a2df6
- Remote: https://github.com/Bxxcv/TokoLink.git (pushed, sinkron)
- Uncommitted: `.opencode/opencode.json` (vercel MCP disabled — perubahan user)
- Untracked: `Hasil_Audit_cyber/*`, `arena-brief/konfigurasi-open-api.txt`, `database/migrate_buyer_order_items.sql`, `database/migrate_force_open.sql`, `database/migrate_store_select_grant.sql`

## 5. Keterbatasan akses

- Supabase MCP: aktif (user re-enabled). Bisa query SQL via MCP.
- Vercel MCP: aktif (user auth). Bisa kelola env/deploy.
- Token Vercel di .env: kadang invalid/expired (user perlu buat token baru).
- Browser automation: tidak tersedia (tes manual oleh user).
- Produksi: tidak boleh ubah DB/deploy tanpa persetujuan eksplisit.

## 6. Masalah yang diketahui (belum terselesaikan)

- Webhook BuatQris: signing secret mismatch (user perlu samakan Vercel env dengan BuatQris dasbor).
- Callback URL BuatQris: sudah diperbaiki di .env (tokolink.store), perlu cek di Vercel env.
- Rate limit in-memory per instance (bisa dilewati traffic terdistribusi).
- Chat retensi 2-4 minggu belum diotomasi.
- Transfer manual approve: ledger sudah otomatis (fixed). Reject restore promo. ✅
- Bundle size 1.1MB single-file (no route splitting).
- Chat polling 5s tanpa backoff/visibility guard.
- Admin agregat di klien (limit 5000, bisa salah saat data besar).