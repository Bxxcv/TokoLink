# AGENTS.md — TokoLink

Instruksi ini WAJIB dipatuhi oleh AI agent (Muse Spark) yang bekerja di project ini.
Jangan improvisasi di luar dokumen ini. Kalau ragu atau instruksi kurang jelas,
**BERHENTI dan tanya ke user** — jangan menebak/mengarang (no hallucination).

## 1. Apa Project Ini

TokoLink — platform link-in-bio + storefront + checkout untuk UMKM Indonesia
(rebuild dari produk lama "NiagaBio", tapi dengan nama, desain, dan sebagian
stack baru). User adalah satu-satunya developer/product owner.

Status saat ini: **UI/UX sudah 100% jadi** (React 19 + Vite + Tailwind 4,
dengan data MOCK, belum ada backend). Tugas fase ini adalah **menyambungkan
UI yang sudah ada ke backend Supabase yang nyata** — BUKAN redesign,
BUKAN bikin halaman baru, BUKAN ganti framework/router.

## 2. Aturan Keras (Non-negotiable)

1. **Jangan mengubah desain/UI** kecuali diminta eksplisit. Tugasmu ganti
   sumber data (mock → Supabase), bukan tampilan.
2. **Jangan membuat tabel, kolom, atau endpoint yang tidak ada di
   `database/schema.sql`**. Kalau butuh field baru, USULKAN dulu ke user, jangan
   langsung eksekusi.
3. **Jangan menambah dependency/library baru** (routing lib, state
   management, UI kit lain, dst) tanpa persetujuan user. Stack sudah final:
   React 19 + Vite + Tailwind 4 + custom router (`src/lib/router.tsx`) +
   `@supabase/supabase-js`.
4. **Jangan pernah taruh secret/service-role key Supabase di kode
   frontend/browser.** Service role hanya boleh dipakai di server
   function (Vercel serverless), tidak pernah di client.
5. **Row Level Security (RLS) wajib aktif di semua tabel** — tidak ada
   tabel yang open policy tanpa alasan yang didiskusikan dulu.
6. **Kerjakan satu task dari `.opencode/TASKS.md` per sesi**, jangan lompat-lompat
   antar fase. Tandai task selesai baru lanjut task berikutnya.
7. Setiap selesai satu task: jelaskan singkat apa yang diubah + file mana
   saja yang disentuh. Jangan diam-diam mengubah file lain di luar scope
   task itu.
8. Kalau nemu bug/inkonsistensi di kode desain yang sudah ada, **laporkan**,
   jangan langsung refactor besar-besaran tanpa izin.

## 3. Stack & Struktur

```
src/
  components/   # Logo.tsx, ui.tsx, layout.tsx, charts.tsx — JANGAN diubah strukturnya
  lib/
    router.tsx  # custom router, tetap dipakai
    data.tsx    # MOCK DATA — ini yang berangsur digantikan Supabase queries
  pages/
    Landing.tsx, Auth.tsx, System.tsx
    Storefront.tsx   # StoreHome, ProductDetail, Cart, Checkout, Qris,
                      # PaymentStatus, OrderSuccess, OrderTracking
    DashboardA.tsx   # DashboardHome, Analytics, Traffic, Products,
                      # ProductForm, Orders, OrderDetail
    DashboardB.tsx   # Wallet, Withdraw, BioLinks, Theme, Discount,
                      # Hours, StoreQR, StoreSettings, AccountSettings,
                      # Notifications
    Admin.tsx        # AdminHome, AdminSellers, AdminPremium,
                      # AdminWithdrawals, AdminAnalytics, AdminPayments,
                      # AdminUsers, AdminSystem
```

Backend: Supabase (Postgres + Auth + Storage + Realtime). Payment: **BuatQris**
(QRIS). Deploy: Vercel. Referensi keamanan (wajib direplikasi, standar dari
produk lama NiagaBio):
- `verifyAuth` independen di setiap server function, tidak cuma andalkan RLS
- Webhook payment diverifikasi HMAC SHA256
- Rate limiting di endpoint sensitif (checkout, withdrawal)
- Escape semua output HTML dari user input, jangan pernah pakai
  `innerHTML` mentah dengan data user

## 4. Cara Kerja

1. Baca `.opencode/TASKS.md`, kerjakan task teratas yang belum selesai.
2. Baca `database/schema.sql` untuk nama tabel/kolom yang benar — **jangan
   mengarang nama kolom**.
3. Ganti import dari `lib/data.tsx` ke query Supabase secara bertahap per
   halaman, bukan sekaligus semua halaman.
4. Setelah satu task selesai, update checklist di `.opencode/TASKS.md` (centang),
   lalu berhenti — tunggu instruksi task berikutnya dari user.
5. Kalau task butuh keputusan produk (bukan teknis), tanya user, jangan
   putuskan sendiri.
