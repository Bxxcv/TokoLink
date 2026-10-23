# MASTER_CONTEXT — TokoLink

**Tujuan:** Sumber utama konteks proyek untuk AI baru. Baca ini dulu sebelum mengerjakan apapun.

## 1. Visi produk

TokoLink = "satu link untuk semua toko" bagi UMKM Indonesia. Seller dapat 1 halaman publik (link-in-bio + katalog produk + checkout QRIS) yang bisa dibagikan lewat WhatsApp/Instagram, tanpa website sendiri.

## 2. Pengguna

- **Seller** — pemilik UMKM rumahan, awam teknologi, akses dari HP. Prioritas UX simpel.
- **Buyer** — pembeli dari link seller. Awalnya non-login (access_token), sekarang **wajib login** (buyer_id di orders). Lihat `docs/PRD.md`.
- **Admin** — platform: approve premium, proses withdrawal, pantau transaksi.

## 3. Stack

- Frontend: React 19 + Vite + Tailwind 4, TypeScript. Router custom di `src/lib/router.tsx` (BUKAN react-router).
- Backend: Supabase (Postgres + Auth + Storage + Realtime), RLS wajib.
- Payment: BuatQris (QRIS).
- Deploy: Vercel. Domain resmi: **tokolink.store**.

## 4. Struktur folder

```
TokoLink/
├── README.md
├── docs/ (PRD.md, ARCHITECTURE.md, THEME_ENGINE.md, handover/)
├── .opencode/ (AGENTS.md, TASKS.md, opencode.json, agents/, skill/, benchmarks.md)
├── database/ (schema.sql + migrate_*.sql)
├── api/ (Vercel serverless functions, self-contained)
├── src/ (pages, components, lib, storefront/)
├── public/ (assets, robots.txt, sitemap.xml)
├── middleware.ts (dihapus — Hobby plan max 12 functions)
└── .env (lokal, gitignored)
```

## 5. Keputusan produk (final)

- Multi-toko dalam 1 akun: **DIKERJAKAN** (Fase A+B selesai). Premium per akun, dompet gabung. Fase C (hapus seller_id lama) belum.
- Buyer wajib login (keputusan 18 Okt 2026).
- Transfer manual dengan bukti upload + admin review.
- Komisi platform 2% dari settings.platform_fee_percent, dipotong dari saldo seller.
- Fee BuatQris: `fee_by=user` (seller absorbs, bukan buyer).
- Ongkir: dihapus total, kirim via chat.
- Reset password: link ke /reset (halaman sudah ada).
- Kategori & kota: bebas diisi (custom).
- Tema: 8 tema engine + klasik. Default "klasik".
- Domain: tokolink.store (bukan tokolink.id).

## 6. Urutan baca dokumen (sesi baru)

1. `docs/handover/MASTER_CONTEXT.md` (ini)
2. `docs/handover/CURRENT_STATE.md`
3. `docs/handover/DECISIONS.md`
4. `.opencode/AGENTS.md` (aturan kerja)
5. `.opencode/TASKS.md` (backlog & status)
6. `docs/PRD.md` (kebutuhan produk)
7. `docs/ARCHITECTURE.md` (arsitektur)
8. `docs/handover/KNOWN_ISSUES.md`
9. `docs/handover/BACKLOG_MASTER.md`
10. `docs/handover/OPENCODE_TEAM.md`

## 7. Aturan kerja wajib

- Baca `.opencode/AGENTS.md` utuh sebelum menyentuh kode.
- Satu task per sesi, berurutan sesuai fase.
- Data frontend wajib real dari Supabase (zero tolerance data contoh di fitur selesai).
- RLS wajib di semua tabel.
- Jangan ubah schema.sql langsung; migrasi baru = file terpisah `database/migrate_*.sql`.
- Jangan tambah dependency tanpa persetujuan.
- Secret hanya di server env, tidak di VITE_*.
- Jangan deploy/migrasi produksi tanpa persetujuan eksplisit.
- Format laporan: Status / Intinya / Yang dikerjakan / Hasil tes / Kendala / Langkah berikutnya.

## 8. Sumber kebenaran

- Aturan kerja: `.opencode/AGENTS.md`
- Task & status: `.opencode/TASKS.md`
- Skema DB: `database/schema.sql` + `database/migrate_*.sql`
- Produk: `docs/PRD.md`
- Arsitektur: `docs/ARCHITECTURE.md`
- Standar tim: `.opencode/AGENTS.md` (section Standar Global Engineering)

## 9. Kontak & support

- WA: 085191245042
- Email: supporttokolink@gmail.com
- Jam: Senin–Sabtu 09:00–17:00 WIB
- Admin: Muhammad Farid, Yogyakarta
- Repo: https://github.com/Bxxcv/TokoLink
- Domain: tokolink.store