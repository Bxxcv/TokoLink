# Test Keamanan TokoLink — Node murni, tanpa browser

Test API langsung ke Supabase TEST. Tanpa Playwright/Chromium
(disengaja: tidak butuh browser untuk serangan RLS/race level API).

## 1. Siapkan project TEST

1. Project Supabase baru (gratis). SQL Editor → jalankan SEMUA file
   `database/*.sql` berurutan (lihat daftar di bawah).
2. Auth → buat 2 akun seller. Satu jadikan admin via SQL
   (`update profiles set role='admin' ...`).
3. Seller A: 2 produk + saldo > Rp100rb (insert `ledger` via SQL Editor).

Urutan migrasi: `schema.sql`, `migrate_fase3*.sql`,
`migrate_fase5_theme.sql`, `migrate_fase5_theme_id.sql`,
`migrate_platform_fee.sql`, `migrate_profiles_media.sql`,
`migrate_storage.sql`, `migrate_traffic.sql`,
`migrate_bio_link_clicks.sql`, `migrate_discount_created_at.sql`,
`migrate_admin_audit_broadcast.sql`,
`migrate_security_hotfix_critical.sql`, `migrate_fullrepair_part2.sql`,
`migrate_fullrepair_part3.sql`, `migrate_theme_ids_v2.sql`,
`migrate_freemium_caps.sql`, `migrate_hardening_upload.sql`.

## 2. Jalan

```bash
cd tests
npm install   # hanya @supabase/supabase-js
TEST_SUPABASE_URL=https://xyz.supabase.co \
TEST_SUPABASE_ANON_KEY=eyJ... \
TEST_SELLER_A_EMAIL=a@test.id TEST_SELLER_A_PASSWORD=... \
TEST_SELLER_ID=<uuid-A> TEST_PRODUCT_ID=<uuid-produk-A> \
TEST_BUATQRIS_SANDBOX=1 APP_URL=http://localhost:5173 \
npm test
```

Tanpa ENV → semua SKIP (bukan FAIL).

## 3. Daftar test

| ID | Tujuan | Lolos bila |
|---|---|---|
| T1 | Seller tak bisa jadi admin | error + role tetap seller |
| T2 | Tak bisa cetak saldo | error + saldo sama |
| T3 | Withdraw raksasa + setujui sendiri | keduanya error |
| T4 | Anon tak baca PII | profiles kosong/error, view tanpa WA |
| T5 | Tak bisa palsukan payment/order | error + nilai tetap |
| T9 | 5 withdrawal bersamaan | lolos ≤2, antrean ≤ saldo |
| T10 | Checkout ganda | order_id sama |

Dihapus dari versi sebelumnya: T6–T8 (login UI), T11 (screenshot
responsive) — butuh browser; lakukan manual di HP. T10 versi browser
diganti `fetch` langsung (sama maknanya untuk idempotensi).

Kirim output + yang FAIL ke engineer.
