# ARCHITECTURE — TokoLink

Diagram di sini pakai sintaks **Mermaid** (bisa dirender GitHub/editor
Markdown, dan tetap terbaca sebagai teks terstruktur kalau tidak
dirender). Ini pelengkap `docs/PRD.md` (APA) dan `AGENTS.md` (ATURAN) —
dokumen ini fokus ke BAGAIMANA sistemnya saling terhubung.

---

## 1. Diagram Sistem (High-Level)

```mermaid
graph TD
  Buyer[Buyer - tanpa akun] -->|browser HP/desktop| SPA
  Seller[Seller] -->|browser, login| SPA
  Admin[Admin] -->|browser, login role=admin| SPA

  SPA[React SPA - Vite build\nhosting: Vercel static] -->|query langsung, dibatasi RLS| Supabase[(Supabase\nPostgres + Auth + Storage)]
  SPA -->|POST, data sensitif| API

  subgraph API[Vercel Serverless Functions - folder api/]
    CreateOrder[api/create-order.ts]
    Webhook[api/buatqris-webhook.ts]
  end

  API -->|service_role key, bypass RLS| Supabase
  CreateOrder -->|generate QRIS| BuatQris[BuatQris\napi.buatqris.site]
  BuatQris -->|callback saat status berubah\nHMAC signed| Webhook
```

**Kenapa dua jalur ke Supabase (langsung dari SPA vs lewat API)?**
- SPA boleh query Supabase langsung untuk data yang aman dibatasi RLS
  (baca produk, baca punya sendiri, dst) — pakai `SUPABASE_ANON_KEY`.
- Apapun yang butuh **kredensial rahasia** (BuatQris) atau **hitung
  ulang harga di server supaya tidak bisa dimanipulasi buyer** (total
  checkout) HARUS lewat `api/*`, yang jalan di server pakai
  `SUPABASE_SERVICE_ROLE_KEY` + secret BuatQris. Tidak pernah sebaliknya.

---

## 2. ER Diagram (Skema Database)

```mermaid
erDiagram
  PROFILES ||--o{ PRODUCTS : "menjual"
  PROFILES ||--o{ ORDERS : "menerima"
  PROFILES ||--o{ BIO_LINKS : "punya"
  PROFILES ||--o{ DISCOUNT_CODES : "punya"
  PROFILES ||--o{ STORE_HOURS : "punya"
  PROFILES ||--o{ WITHDRAWALS : "mengajukan"
  PROFILES ||--o{ PREMIUM_REQUESTS : "mengajukan"
  PROFILES ||--o{ LEDGER : "punya riwayat saldo"

  ORDERS ||--|{ ORDER_ITEMS : "berisi"
  ORDERS ||--o{ PAYMENTS : "punya percobaan bayar"
  ORDERS ||--o| LEDGER : "referensi (ref_order_id)"
  PRODUCTS ||--o{ ORDER_ITEMS : "dipesan sebagai"

  PROFILES {
    uuid id PK
    text role "seller | admin"
    text store_slug UK
    text plan "gratis | premium"
  }
  PRODUCTS {
    uuid id PK
    uuid seller_id FK
    text status "aktif | nonaktif"
    numeric price
  }
  ORDERS {
    text id PK "format TL-YYMM-XXXX"
    uuid seller_id FK
    uuid access_token "buat lacak non-login"
    text status "menunggu|dikemas|dikirim|selesai|batal"
    text buyer_phone
    text buyer_address
  }
  ORDER_ITEMS {
    uuid id PK
    text order_id FK
    uuid product_id FK
    text product_name_snapshot "nama beku saat order dibuat"
  }
  PAYMENTS {
    uuid id PK
    text order_id FK
    text external_ref "transaction_id dari BuatQris"
    text status "menunggu|berhasil|gagal|cocok|perlu_cek"
  }
  LEDGER {
    uuid id PK
    uuid seller_id FK
    text type "masuk | keluar"
    numeric amount "positif=masuk, negatif=keluar"
  }
  WITHDRAWALS {
    uuid id PK
    uuid seller_id FK
    text status "menunggu|diproses|selesai|ditolak"
  }
  BIO_LINKS {
    uuid id PK
    uuid seller_id FK
  }
  DISCOUNT_CODES {
    uuid id PK
    uuid seller_id FK
    text type "persen|nominal|potongan_ongkir"
  }
  STORE_HOURS {
    uuid id PK
    uuid seller_id FK
    int day_of_week "0-6"
  }
  PREMIUM_REQUESTS {
    uuid id PK
    uuid seller_id FK
    text status "menunggu|disetujui|ditolak"
  }
```

Detail kolom lengkap + RLS policy → `database/schema.sql` dan file
migrasi bernomor di folder yang sama. **Diagram ini ringkasan, bukan
sumber kebenaran** — kalau ada beda antara diagram ini dan
`schema.sql`, **`schema.sql` yang benar**, laporkan selisihnya ke user.

---

## 3. Alur Checkout & Pembayaran (Sequence Diagram)

```mermaid
sequenceDiagram
  participant B as Buyer (browser)
  participant F as Frontend (Checkout/Qris page)
  participant CO as api/create-order.ts
  participant DB as Supabase
  participant BQ as BuatQris
  participant WH as api/buatqris-webhook.ts

  B->>F: Isi keranjang + data diri, klik Bayar
  F->>CO: POST cart + kode promo (bukan total!)
  CO->>DB: Ambil harga PRODUK ASLI (bukan dari browser)
  CO->>DB: Validasi kode promo (kalau ada)
  CO->>DB: Insert orders (menunggu) + order_items + payments (menunggu)
  CO->>BQ: api_create_qris (account_id + secret_token dari ENV server)
  BQ-->>CO: qr_url, total_amount, transaction_id
  CO->>DB: Update payments.external_ref = transaction_id
  CO-->>F: order_id + access_token + data QR
  F-->>B: Tampilkan QR (halaman Qris)

  B->>BQ: Scan & bayar dari e-wallet/m-banking
  BQ->>WH: POST webhook (event payment.success, HMAC signed)
  WH->>WH: Verifikasi signature (raw body, timingSafeEqual)
  WH->>DB: Update payments.status=berhasil (idempotent, cek status lama)
  WH->>DB: Update orders.status=dikemas
  WH->>DB: Insert ledger (type=masuk)
  WH-->>BQ: 200 OK

  F->>DB: Polling/baca status order (RPC track_order pakai access_token)
  F-->>B: Tampilkan "Pembayaran berhasil"
```

**Aturan yang WAJIB dipegang dari diagram ini** (jangan diubah tanpa
tanya user dulu):
1. Total yang dipakai untuk BuatQris SELALU dihitung ulang di server
   (`api/create-order.ts`) dari harga produk di database — tidak pernah
   percaya angka total yang dikirim browser.
2. Status pembayaran final HANYA berubah lewat webhook (`api/buatqris-
   webhook.ts`), tidak pernah lewat redirect URL di browser saja.
3. `access_token` (bukan `order_id` saja) yang jadi kunci buyer non-login
   melihat status pesanannya sendiri — lihat Memory Block `AGENTS.md`.

---

## 4. Struktur Folder

```
TokoLink-main/
├── docs/
│   ├── PRD.md                 # APA yang dibangun & kenapa
│   └── ARCHITECTURE.md        # file ini — BAGAIMANA sistem terhubung
├── .opencode/
│   ├── AGENTS.md                # aturan kerja agent (WAJIB dibaca duluan)
│   ├── TASKS.md                 # backlog kerja, urutan wajib
│   ├── opencode.json            # config model & permission
│   └── skill/                   # panduan teknis spesifik per topik
│       ├── supabase-rls-patterns/
│       ├── buatqris-webhook/
│       └── ui-interaction-patterns/
├── database/
│   ├── schema.sql                # skema utama (SUMBER KEBENARAN kolom)
│   └── migrate_faseX*.sql        # migrasi bertahap, bernomor per fase
├── api/                        # Vercel serverless functions (server-only)
│   ├── _lib.ts                   # helper bersama (lihat catatan di AGENTS.md)
│   ├── create-order.ts
│   └── buatqris-webhook.ts
├── src/
│   ├── components/               # UI reusable — JANGAN diubah strukturnya
│   ├── lib/
│   │   ├── router.tsx              # custom router, tetap dipakai
│   │   ├── supabase.ts             # client Supabase (anon key, aman di browser)
│   │   └── data.tsx                # DATA CONTOH lama — lihat AGENTS.md #9
│   └── pages/                    # satu file per grup halaman (lihat PRD.md §4)
└── public/                     # aset statis (gambar demo, logo)
```
