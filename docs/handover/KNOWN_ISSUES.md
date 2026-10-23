# KNOWN_ISSUES — Bug & Risiko TokoLink

## Status label: VERIFIED / REPORTED / PARTIAL / UNVERIFIED / RESOLVED

---

## BUG-001: Halaman putih setelah "Saya sudah bayar" (QRIS)
- **Gejala:** Klik tombol "Saya sudah bayar" → halaman putih.
- **Akar masalah:** `order.id` undefined saat `order` null (early return tidak terpenuhi) → crash React.
- **Fix:** `order?.id ?? orderId` di onClick. ✅ DIPERBAIKI.
- **Status:** RESOLVED (commit d4730e8). Perlu tes runtime.

## BUG-002: React error #310 di PaymentStatus
- **Gejala:** Halaman putih di /checkout/status.
- **Akar masalah:** useState (proofFile dll.) dipanggil setelah early return (conditional hooks).
- **Fix:** Pindah useState ke atas sebelum early return. ✅ DIPERBAIKI.
- **Status:** RESOLVED (commit e13d3f6).

## BUG-003: Dashboard seller loading terus
- **Gejala:** Dashboard tidak tampil data, loading selamanya.
- **Akar masalah:** `if (!user || !activeId) return;` tanpa `setLoading(false)` → loading stuck. Juga 403 "permission denied for table stores" (role authenticated tidak punya GRANT SELECT di stores).
- **Fix:** (1) early return set loading false; (2) frontend workaround baca public_stores_v2; (3) migrasi GRANT SELECT. ✅ DIPERBAIKI.
- **Status:** RESOLVED (commit 5ccbfaf + migrate_store_select_grant.sql).

## BUG-004: Webhook BuatQris tidak fire → status "menunggu" terus
- **Gejala:** Pembayaran dikonfirmasi di BuatQris, tapi order status tidak berubah.
- **Akar masalah (dugaan):** (1) Callback URL di BuatQris dasbor/Vercel env salah (domain lama). (2) Signing secret mismatch → webhook ditolak 401. (3) Sandbox mode mungkin tidak trigger webhook.
- **Fix kode:** Webhook HMAC + idempotensi sudah benar. Perlu verifikasi config.
- **Status:** UNVERIFIED (butuh cek Vercel env + BuatQris dasbor + log).

## BUG-005: Transfer manual approve tidak catat ledger
- **Gejala:** Admin setujui transfer manual → order lunas, tapi saldo seller tidak bertambah.
- **Akar masalah:** Tombol Setujui hanya update status, tidak insert ledger.
- **Fix:** RPC `admin_approve_transfer` (atomik: payment+order+ledger masuk+komisi keluar). ✅ DIPERBAIKI.
- **Status:** RESOLVED (commit c311a25 + migrate_transfer_approve_rpc.sql).

## BUG-006: Chat buyer tidak bisa baca pesan
- **Gejala:** Setelah kirim pesan, chat kosong.
- **Akar masalah:** Tidak ada RLS buyer read policy pada chat_threads/chat_messages.
- **Fix:** Migrasi `migrate_chat_buyer_login.sql` + RLS buyer. ✅ DIPERBAIKI.
- **Status:** RESOLVED.

## BUG-007: Chat impersonasi admin
- **Gejala:** Seller bisa kirim pesan berlabel "admin".
- **Akar masalah:** Policy "seller sends messages" mengizinkan sender_type='admin' tanpa is_admin().
- **Fix:** Hotfix `migrate_security_hotfix_oct18.sql`. ✅ DIPERBAIKI.
- **Status:** RESOLVED.

## BUG-008: Freemium bypass (seller_id palsu)
- **Gejala:** Seller gratis bisa melebihi batas dengan set seller_id = UUID premium.
- **Akar masalah:** Trigger batas gratis baca plan dari seller_id, tidak dicek kepemilikan toko.
- **Fix:** Trigger `enforce_seller_from_store` (hotfix). ✅ DIPERBAIKI.
- **Status:** RESOLVED.

## BUG-009: PII leak (profiles anon read)
- **Gejala:** Anon bisa baca wa_number/owner_name/city dari profiles.
- **Akar masalah:** Policy `profiles_anon_storefront` SELECT USING (true).
- **Fix:** Drop policy. Storefront pakai view `public_stores_v2`. ✅ DIPERBAIKI.
- **Status:** RESOLVED.

## BUG-010: IDOR store_members (self-join)
- **Gejala:** Seller bisa gabung ke toko orang lain.
- **Akar masalah:** Policy insert hanya cek user_id = auth.uid().
- **Fix:** Hotfix `migrate_security_hotfix_store_members.sql`. ✅ DIPERBAIKI.
- **Status:** RESOLVED.

## BUG-011: Promo "Pakai" refresh halaman
- **Gejala:** Klik "Pakai" kode promo → halaman refresh.
- **Akar masalah:** Button default type="submit" di dalam form.
- **Fix:** type="button". ✅ DIPERBAIKI.
- **Status:** RESOLVED.

## BUG-012: Badge notif tidak hilang setelah "tandai semua"
- **Gejala:** Badge "Pesanan" tetap muncul setelah mark all read.
- **Akar masalah:** Badge effect tidak re-run setelah markRead.
- **Fix:** Custom event "tl_notif_read" + notifTick state. ✅ DIPERBAIKI.
- **Status:** RESOLVED.

## BUG-013: City hardcoded "Bandung"
- **Gejala:** Input kota default "Bandung", buyer harus hapus.
- **Fix:** Default kosong + CityCombobox. ✅ DIPERBAIKI.
- **Status:** RESOLVED.

## BUG-014: Lockout login (klien)
- **Gejala:** Tidak ada proteksi brute force login.
- **Fix:** 5x gagal → blokir 15 menit (localStorage per email). ✅ DIPERBAIKI (klien saja).
- **Status:** PARTIAL (server-side belum).

## BUG-015: Transfer manual admin approve tidak catat ledger
- **Gejala:** Saldo seller tidak bertambah setelah approve.
- **Akar masalah:** Tombol Setujui hanya update status, tidak insert ledger.
- **Fix:** RPC `admin_approve_transfer` (atomik). ✅ DIPERBAIKI.
- **Status:** RESOLVED.

## BUG-016: OG share link menampilkan logo TokoLink
- **Gejala:** Preview WhatsApp tampilkan logo TokoLink, bukan foto toko.
- **Akar masalah:** Store belum upload cover/avatar → fallback logo TokoLink.
- **Status:** BY DESIGN (perlu upload cover/avatar). Tidak ada bug.

## BUG-017: Chat seller terlalu ribet
- **Gejala:** UI chat seller membingungkan.
- **Status:** PARTIAL (UX review done, perbaikan sebagian applied).

## BUG-018: Dashboard orders/notifications menumpuk
- **Gejala:** Data terasa bertumpuk.
- **Status:** UNVERIFIED (perlu UX review lebih lanjut).

## BUG-019: Spinner tidak mutar
- **Gejala:** Animasi loading tidak berjalan.
- **Status:** UNVERIFIED (kemungkinan stuck loading, perlu cek console).

## BUG-020: Sandbox mode tidak jalan
- **Gejala:** BUATQRIS_TEST=test=1 → mode live.
- **Akar masalah:** Format env salah (harus "1", bukan "test=1").
- **Fix:** Normalisasi di kode (test=1 → 1). ✅ DIPERBAIKI. Perlu set Vercel env = "1".
- **Status:** RESOLVED (kode), PARTIAL (config Vercel).

## Risiko tersisa

1. Webhook BuatQris: signing secret mismatch (config, bukan kode).
2. Rate limit in-memory per instance (bisa dilewati).
3. Chat retensi 2-4 minggu belum diotomasi.
4. Bundle size 1.1MB single-file (no route splitting).
5. Chat polling 5s tanpa backoff/visibility guard.
6. Admin agregat di klien (limit 5000, bisa salah saat data besar).
7. Account lockout hanya klien (server-side belum).
8. Domain kustom, verifikasi penjual, OG /{slug} (Pro plan).

## Langkah investigasi berikutnya

1. Verifikasi webhook: samakan signing secret Vercel env dengan BuatQris dasbor.
2. Tes end-to-end sandbox: checkout → bayar → status berubah.
3. Cek console browser untuk spinner issue.
4. Uji beban: 100x data untuk verifikasi agregat admin.