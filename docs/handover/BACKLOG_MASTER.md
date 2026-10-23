# BACKLOG_MASTER — Konsolidasi Task TokoLink

Sumber: `.opencode/TASKS.md`, laporan audit (Hasil_Qa.md, Hasil end-to-end.txt), keputusan user.

## Format task

- **ID**: T-XXX
- **Prioritas**: P0 (wajib sebelum launch) / P1 (sebelum skala) / P2 (penguat)
- **Status**: TODO / IN_PROGRESS / DONE / BLOCKED / DEFERRED
- **Bukti**: file:baris atau hasil tes

---

## P0 — Wajib sebelum launch

| ID | Task | Status | Bukti/Penanggung jawab |
|----|------|--------|------------------------|
| T-001 | Identitas pengelola (nama, alamat, kontak) tampil di /tentang | DONE | Storefront.tsx About() |
| T-002 | Kebijakan Privasi & Syarat Layanan publik | DONE | /legal/privacy, /legal/terms |
| T-003 | Halaman Harga + model bisnis | DONE | Landing.tsx Pricing() |
| T-004 | Gateway QRIS + webhook bertanda tangan + idempoten | DONE | buatqris-webhook.ts |
| T-005 | Sandbox terisolasi dari saldo nyata | PARTIAL | BUATQRIS_TEST=1 di env; perlu verifikasi |
| T-006 | Autorisasi antar seller (IDOR) | DONE | migrate_security_hotfix_store_members.sql |
| T-007 | Backup & uji restore Supabase | TODO | Butuh tindakan user (dashboard) |
| T-008 | Kanal support aktif | DONE | /tentang + footer WA/email |
| T-009 | Keputusan nama + cek merek DJKI | TODO | Tindakan user |
| T-010 | Route tidak ada → 404 sungguhan | DONE | NotFound di App.tsx (HTTP 200 karena SPA) |
| T-011 | Badan hukum / NIB | TODO | Tindakan user |
| T-012 | 2FA akun yang punya saldo | TODO | Butuh implementasi |
| T-013 | SOP insiden pembayaran | TODO | Dokumentasi |
| T-014 | Review draft legal oleh lawyer | TODO | Tindakan user |

## P1 — Sebelum skala naik

| ID | Task | Status | Bukti/Penanggung jawab |
|----|------|--------|------------------------|
| T-015 | Prerender/SSR landing & toko | DEFERRED | Optimasi ringan (meta/sitemap) saja |
| T-016 | OG dinamis per toko | DONE | /t/{slug} via store-meta.ts |
| T-017 | Header keamanan (CSP, HSTS) | DONE | vercel.json headers + CSP report-only |
| T-018 | Rate limit & proteksi brute force | PARTIAL | In-memory per instance; account lockout klien |
| T-019 | Mekanisme laporkan toko + takedown | PARTIAL | Tabel reports + admin queue + mailto |
| T-020 | Status page + error monitoring | DONE | /status + Vercel logs |
| T-021 | Uji beban | TODO | Butuh tool eksternal |
| T-022 | FAQ & onboarding | PARTIAL | FAQ di landing ada; onboarding belum |
| T-023 | Ekspor data penjual | DONE | CSV di AccountSettings |
| T-024 | Pencarian & filter produk di toko | DONE | StoreHome (q + cat) |
| T-025 | Override buka/tutup manual | DONE | force_open toggle + badge |
| T-026 | Transfer manual + bukti + admin review | DONE | migrate_transfer_manual + AdminPayments |
| T-027 | Buyer wajib login | DONE | migrate_buyer_login + Checkout guard |
| T-028 | Chat fondasi (tabel, RLS, RPC, UI) | DONE | migrate_chat_foundation + /chat |
| T-029 | Bot FAQ + eskalasi | PARTIAL | buyer_bot_reply (4 keyword) |
| T-030 | Login buyer terpisah (/masuk, /daftar) | DONE | Auth.tsx BuyerLogin/BuyerRegister |
| T-031 | QR logo seller (premium) | DONE | Storefront.tsx Qris overlay |
| T-032 | Badge notif refresh | DONE | markRead dispatch event |
| T-033 | Promo anti-refresh | DONE | type="button" |
| T-034 | City default kosong + auto kode pos | DONE | Storefront.tsx Checkout |
| T-035 | Payment labels clearer | DONE | Storefront.tsx Checkout |
| T-036 | Lockout login (klien 5x/15min) | DONE | Auth.tsx |
| T-037 | Testimoni section (empty state) | DONE | Landing.tsx Testimoni() |
| T-038 | Security hotfix ZIP (enforce_seller, chat impersonation) | DONE | migrate_security_hotfix_oct18.sql |
| T-039 | Security hotfix store_members IDOR | DONE | migrate_security_hotfix_store_members.sql |
| T-040 | Security hotfix profiles anon PII | DONE | migrate_security_profiles_anon.sql |
| T-041 | Store select grant (force_open) | DONE | migrate_store_select_grant.sql |
| T-042 | Transfer manual ledger fix (RPC) | DONE | migrate_transfer_approve_rpc.sql |
| T-043 | Buyer order_items read policy | DONE | migrate_buyer_order_items.sql |
| T-044 | Chat buyer login RLS+RPC | DONE | migrate_chat_buyer_login.sql |
| T-045 | Chat bot FAQ RPC | DONE | migrate_chat_bot_faq.sql |

## P2 — Penguat kepercayaan

| ID | Task | Status | Catatan |
|----|------|--------|---------|
| T-046 | Chat realtime (Supabase Realtime) | TODO | Saat ini polling 5s |
| T-047 | Chat retensi 2-4 minggu (cron) | TODO | Belum diotomasi |
| T-048 | Eskalasi notifikasi ke seller (chat) | TODO | Belum |
| T-049 | Studi kasus/testimoni (data nyata) | TODO | Butuh data dari user |
| T-050 | Verifikasi penjual berjenjang | TODO | Butuh flow + dokumen |
| T-051 | Domain kustom per toko | TODO | Premium, kompleks |
| T-052 | OG dinamis di /{slug} | TODO | Butuh Pro plan atau merge functions |
| T-053 | Account lockout server-side | TODO | Saat ini klien saja |
| T-054 | Rate limit Redis/Upstash | TODO | Saat ini in-memory |
| T-055 | CAPTCHA/Turnstile | TODO | Belum |
| T-056 | Analitik mendalam (funnel, drop-off) | TODO | Belum |
| T-057 | Tema kustomisasi (banner upload) | TODO | Belum |
| T-058 | Multi-store Fase C (hapus seller_id lama) | TODO | Setelah MVP stabil |
| T-059 | Smoke test end-to-end | TODO | Belum dijalankan |
| T-060 | Cek 7 tema di HP (visual) | TODO | Butuh screenshot user |

## Konflik backlog

- `.opencode/TASKS.md` dan backlog di atas konsisten. TASKS.md adalah sumber utama status.
- Beberapa item P0 (badan hukum, DJKI, backup, 2FA, SOP, review legal) memerlukan tindakan user, bukan kode.
- Item P2 (domain kustom, verifikasi penjual, OG /{slug}) memerlukan keputusan produk atau upgrade infra.

## Prioritas eksekusi (urutan disarankan)

1. P0 sisa: badan hukum/NIB, cek merek DJKI, backup+uji restore, 2FA, SOP insiden, review legal.
2. P1: rate limit Redis, laporkan toko UI (sudah mailto), uji beban, FAQ/onboarding, ekspor data penuh.
3. P2: chatbot bot FAQ+eskalasi, studi kasus/testimoni, verifikasi penjual, domain kustom, OG /{slug}.
4. Tes E2E sandbox + cek 7 tema di HP.