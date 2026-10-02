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
TokoLink/
├── README.md                    # profil repo (publik)
├── LICENSE                      # proprietary — Muhammad Farid
├── docs/
│   ├── PRD.md                     # APA yang dibangun & kenapa
│   ├── ARCHITECTURE.md            # file ini — BAGAIMANA sistem terhubung
│   ├── THEME_ENGINE.md            # laporan implementasi 8 tema
│   └── LOVABLE_BRIEF_THEME.md     # brief desain tema (arsip)
├── .opencode/
│   ├── AGENTS.md                  # aturan kerja agent (WAJIB dibaca duluan)
│   ├── TASKS.md                   # backlog kerja, urutan wajib
│   ├── opencode.json              # config model & permission
│   └── skill/                     # panduan teknis spesifik per topik
│       ├── supabase-rls-patterns/
│       ├── buatqris-webhook/
│       └── ui-interaction-patterns/
├── database/
│   ├── schema.sql                 # skema utama (SUMBER KEBENARAN kolom)
│   └── migrate_*.sql              # migrasi bertahap (fase3, fase5_theme,
│                                  # fase5_theme_id, storage, traffic, …)
├── api/                         # Vercel serverless functions (server-only)
│   ├── _lib.ts                    # helper bersama
│   ├── create-order.ts
│   ├── buatqris-webhook.ts
│   ├── admin-users.ts
│   └── delete-account.ts
├── src/
│   ├── components/                # UI reusable — JANGAN diubah strukturnya
│   ├── lib/
│   │   ├── router.tsx               # custom router, tetap dipakai
│   │   ├── supabase.ts              # client Supabase (anon key, aman di browser)
│   │   ├── auth.tsx                 # session + profil
│   │   ├── links.ts                 # detectLinkIcon() sentral (semua tema pakai ini)
│   │   ├── format.ts products.ts storage.ts cities.ts
│   │   └── data.tsx                 # DATA CONTOH lama — lihat AGENTS.md #9
│   ├── storefront/                # THEME ENGINE (hanya presentasi, tanpa query)
│   │   ├── types.ts                 # kontrak data tema ← halaman toko
│   │   ├── registry.ts              # daftar 8 tema + status tersedia
│   │   └── themes/                  # 1 file per tema + index.ts (peta ID→komponen)
│   └── pages/                     # satu file per grup halaman (lihat PRD.md §4)
└── public/                      # aset statis (logo, gambar, OG image)
```

---

## 5. Theme Engine (8 tema, satu data)

```mermaid
graph TD
  SH[StoreHome - ambil SEMUA data\nprofil, produk, bio, jam, tema, QR] --> P{Punya theme_id\nengine?}
  P -->|tidak / klasik| Legacy[JSX bawaan lama]
  P -->|ya| Engine[ENGINE_COMPONENTS map]
  Engine --> T1[01 Ruang Seduh]
  Engine --> T2[02 Pasar Rapi]
  Engine --> T3[03 Lugas Jasa]
  Engine --> T4[04 Atelier]
  Engine --> T5[05 Dapur Hari Ini]
  Engine --> T6[06 Kriya Nusantara]
  Engine --> T7[07 Pixel Goods]
  Engine --> T8[08 Studio Tenang]
  T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 --> Cart[onAdd → /cart → checkout → QRIS\nsama untuk semua tema]
```

**Aturan yang WAJIB dipegang** (detail: `docs/THEME_ENGINE.md`):
1. Tema hanya menerima props (`src/storefront/types.ts`) — dilarang query Supabase/auth/cart langsung.
2. Tidak ada teks/harga/stok contoh di file tema; yang tidak ada datanya dibuang, bukan dikarang.
3. Bilah/CTA tema selalu mengarah ke `/cart` — tidak pernah mengalihkan order ke WhatsApp.
4. Pilihan seller tersimpan di `store_theme.theme_id` (`klasik` = bawaan); tambah tema baru = tambah file + 1 baris di peta, tanpa ubah alur beli.
