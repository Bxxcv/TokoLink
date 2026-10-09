# Test Browser TokoLink — cara jalan

Suite ini untuk dijalankan di **laptop kamu** (butuh browser beneran +
project Supabase TEST). Jangan arahkan ke production.

## 1. Siapkan project TEST

1. Buat project Supabase baru (gratis) → dapat URL + anon key.
2. SQL Editor TEST → jalankan SEMUA file `database/*.sql` berurutan:
   `schema.sql`, `migrate_fase3*.sql`, `migrate_fase5*.sql`,
   `migrate_platform_fee.sql`, `migrate_profiles_media.sql`,
   `migrate_storage.sql`, `migrate_traffic.sql`,
   `migrate_bio_link_clicks.sql`, `migrate_discount_created_at.sql`,
   `migrate_admin_audit_broadcast.sql`,
   `migrate_security_hotfix_critical.sql`,
   `migrate_fullrepair_part2.sql`, `migrate_fullrepair_part3.sql`,
   `migrate_theme_ids_v2.sql`, `migrate_freemium_caps.sql`,
   `migrate_hardening_upload.sql`.
3. Auth → buat 3 user: 2 seller + 1 admin (ubah `role` admin via SQL).
4. Seller A: tambah 2 produk + pastikan saldo > Rp100rb
   (cara cepat: insert `ledger` via SQL Editor sebagai postgres).
5. Jalankan aplikasi menunjuk TEST:
   `VITE_SUPABASE_URL=<test-url> VITE_SUPABASE_ANON_KEY=<test-key> npm run dev`
   Untuk T10: server API juga harus jalan dengan kredensial
   BuatQris SANDBOX (`npm run dev` + env server).

## 2. Install & jalan

```bash
cd tests
npm install
npx playwright install chromium
APP_URL=http://localhost:5173 \
TEST_SUPABASE_URL=https://xyz.supabase.co \
TEST_SUPABASE_ANON_KEY=eyJ... \
TEST_SELLER_A_EMAIL=a@test.id TEST_SELLER_A_PASSWORD=... \
TEST_SELLER_B_EMAIL=b@test.id TEST_SELLER_B_PASSWORD=... \
TEST_ADMIN_EMAIL=admin@test.id TEST_ADMIN_PASSWORD=... \
TEST_SELLER_ID=<uuid-A> TEST_PRODUCT_ID=<uuid-produk-A> \
TEST_BUATQRIS_SANDBOX=1 \
npx playwright test
```

Tanpa ENV → semua test API otomatis SKIP (bukan FAIL).

## 3. Daftar test

| ID | Tujuan | Cara lolos |
|---|---|---|
| T1 | Seller tak bisa jadi admin | update role error + role tetap seller |
| T2 | Tak bisa cetak saldo | insert ledger error + saldo sama |
| T3 | Withdraw raksasa + setujui sendiri | keduanya error |
| T4 | Anon tak baca PII | profiles kosong/error, view publik tanpa WA |
| T5 | Tak bisa palsukan payment/order | error + nilai tetap |
| T6–T8 | Login, /admin ditolak, lacak jujur | UI sesuai |
| T9 | 5 withdrawal bersamaan | lolos ≤2, total ≤ saldo |
| T10 | Checkout ganda | order_id sama |
| T11 | 360–1440 tak overflow + screenshot | scrollWidth ≤ innerWidth |

Kirim ke saya: output `npx playwright test` + screenshot yang gagal.
