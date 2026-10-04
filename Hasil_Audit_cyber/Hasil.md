# TokoLink Full Audit

**Tanggal:** 4 Oktober 2026
**Target:** https://www.tokolink.store (production) + repo `Bxxcv/TokoLink`
**Commit/version:** `653abe05613ef0cb5f5ac9f864e9f77dcb132fbb` (branch `arena/01a10712-tokolink`, 2026-10-04 20:01 WIB)
**Auditor:** Red team / AppSec / QA / UX composite review
**Metode:** source-first (AGENTS.md, TASKS.md, docs/*, database/schema.sql + 16 migrasi, api/*, src/*, 8 tema), dilanjutkan verifikasi silang ke UI production.

---

## Catatan Metode & Batasan (WAJIB DIBACA)

1. **Arsitektur yang diaudit:** React 19 + Vite (single-file build) → Vercel static → Supabase (Postgres + Auth + Storage) → BuatQris (QRIS). Tidak ada backend otentik selain Supabase RLS + 4 Vercel serverless function (`create-order`, `buatqris-webhook`, `admin-users`, `delete-account`).
2. **Kontrol keamanan nyata hanya 3 lapis:** (a) RLS Postgres, (b) HMAC webhook BuatQris, (c) in-memory rate limit di 2 endpoint. Tidak ada WAF, tidak ada Edge middleware, tidak ada security headers, tidak ada server-side order/withdrawal validation selain `create-order`.
3. **Batasan sandbox:** environment audit **tidak mempunyai akses jaringan keluar** (`curl`/`node fetch` diblokir). Karena itu:
   - Eksploitasi *live* terhadap `https://www.tokolink.store`, project Supabase, dan endpoint `/api/*` **tidak dapat dijalankan** dari sandbox ini.
   - Temuan yang bergantung pada semantik SQL/Postgres RLS, TypeScript, dan React ditandai **Confirmed** (dibuktikan dari source + aturan resmi Postgres/PostgREST/Supabase).
   - Temuan yang memerlukan konfirmasi konfigurasi runtime (mis. apakah "Confirm email" aktif di Supabase, apakah migrasi sudah dijalankan) ditandai **Unverified** dan diberi langkah verifikasi aman.
4. **Tidak ada data production yang diubah, dihapus, atau diambil secara massal.** Seluruh analisis bersifat static + pembacaan halaman publik.
5. Dokumentasi (`docs/THEME_ENGINE.md`, `.opencode/TASKS.md`, komentar "SUDAH DIPERBAIKI") **tidak dipercaya**; setiap klaim diverifikasi ke source. Beberapa klaim terbukti salah (lihat BUG-008, BUG-023, BUG-041).

---

## Ringkasan Temuan

| Severity | Jumlah | Nomor |
|---|---|---|
| Critical | 4 | BUG-001 – BUG-004 |
| High | 9 | BUG-005 – BUG-013 |
| Medium | 27 | BUG-014 – BUG-040 |
| Low | 14 | BUG-041 – BUG-054 |
| **Total temuan bernomor** | **54** | |
| Informational (bukan bug) | 7 | lihat bagian *Informational* |
| **Total keseluruhan** | **61** | |

---

## Executive Summary

TokoLink **belum aman dan belum layak dipakai untuk uang sungguhan**. Audit menemukan 4 temuan Critical yang masing-masing berdiri sendiri sudah cukup untuk (a) mengambil alih seluruh platform, atau (b) mencetak saldo palsu lalu menariknya menjadi uang nyata.

Akar masalahnya bukan satu bug, melainkan **satu keputusan desain yang salah dan diulang ke 11 tabel**: RLS policy `for all using (seller_id = auth.uid()) with check (seller_id = auth.uid())`. Policy ini hanya memvalidasi **baris mana** yang boleh disentuh, **bukan kolom apa** yang boleh diubah dan **bukan apakah nilainya masuk akal**. Akibatnya:

- Seller bisa mengubah `profiles.role` miliknya sendiri menjadi `admin` → **BUG-001 (privilege escalation total)**.
- Seller bisa `INSERT` baris `ledger` positif sebesar apa pun ke `seller_id`-nya sendiri → **BUG-002 (cetak saldo)**.
- Seller bisa `UPDATE` status `withdrawals` miliknya menjadi `selesai` → **BUG-003**.
- Semua tabel `profiles` bisa dibaca **anonim tanpa login** (`using (true)`) → **BUG-004 (bocor PII seluruh seller: nama asli, nomor WA, alamat)**.

Di atas itu, **tidak ada satupun validasi sisi-server untuk uang**: penarikan dana tidak dicek saldonya, tidak ada reserve dana, dan saldo belum dipotong sampai admin menekan "Selesai". Jadi BUG-002 + BUG-003 adalah rantai pencurian langsung.

Dari sisi produk, temuan paling menyakitkan bukan keamanan, melainkan **UI yang berbohong**. Audit menemukan **21 tombol/fitur yang terlihat bekerja tetapi tidak melakukan apa-apa** — termasuk tombol "Chat WhatsApp" di halaman toko (hanya memunculkan toast), tombol "Batalkan pesanan" (order tetap `menunggu` selamanya), tombol "Simpan pengaturan" di Admin System (tidak menyimpan apa-apa), dan **log audit admin yang seluruhnya hardcoded** dengan nama "Dwi Handoko" dan "Sari Utami". Halaman checkout menjanjikan ongkir Rp10.000–18.000 yang **tidak pernah ditagihkan**; halaman toko memasang badge **"Premium"** di semua toko termasuk yang gratis; dan landing page menampilkan "4.820 toko aktif" serta "Rp12,8 M diproses" yang semuanya angka mati.

Untuk 8 tema: **fitur inti TokoLink hilang di sebagian besar tema**. 7 dari 8 tema **tidak merender tautan bio sama sekali** (padahal ini produk link-in-bio), dan 6 dari 8 tema **mengabaikan status "toko ditutup"** sehingga pembeli tetap bisa belanja saat seller menutup toko.

**Rekomendasi utama:** jangan buka pendaftaran publik / jangan promosikan sampai BUG-001 s.d. BUG-004 ditutup. Tiga di antaranya bisa diperbaiki dalam hitungan jam hanya dengan SQL (lihat *Recommended Fix Priority*).

---

## Critical Findings

### BUG-001 — Privilege escalation vertikal: seller bisa mengangkat dirinya sendiri menjadi admin

**Category:** Security (Authorization / Privilege Escalation / Mass Assignment)
**Severity:** Critical
**Confidence:** Confirmed (source + semantik RLS Postgres)

**Location:**
- `database/schema.sql:149-152` (policy `profiles`)
- `src/lib/auth.tsx:73-88` (`ensureProfile`)
- `src/lib/auth.tsx:176-185` (`RequireAdmin`)
- `api/admin-users.ts:24-27` (gate admin)

**Evidence:**
```sql
-- database/schema.sql:150-152
create policy "seller manages own profile" on profiles
  for all using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());
```
`for all` mencakup INSERT **dan** UPDATE. `with check` hanya memverifikasi bahwa **kolom `id`** pada baris baru sama dengan `auth.uid()`. **Tidak ada pembatasan level kolom.** Kolom `role` didefinisikan dengan CHECK yang justru mengizinkan nilai `admin`:
```sql
-- database/schema.sql:7
role text not null default 'seller' check (role in ('seller', 'admin')),
```
Fungsi `is_admin()` (`schema.sql:139-143`) membaca `profiles.role`, jadi semua policy `or is_admin()` di 11 tabel langsung terbuka. `RequireAdmin` (`auth.tsx:176-185`) juga hanya membaca `role` dari `profiles`, dan `api/admin-users.ts:24` memverifikasi admin dengan query ke `profiles.role` — keduanya ikut runtuh.

**Problem:**
Setiap akun seller yang login dapat mempromosikan dirinya sendiri. Tidak ada trigger, tidak ada column-level privilege, tidak ada lapis verifikasi kedua.

**Reproduction (aman, tanpa menyentuh data production):**
Cukup dijalankan pada project Supabase **test** milik sendiri:
```js
// SETELAH login sebagai seller biasa (punya JWT)
await supabase.from("profiles").update({ role: "admin" }).eq("id", myUid);
// atau saat registrasi, sebelum ensureProfile() sempat jalan:
await supabase.from("profiles").insert({ id: myUid, role: "admin" });
```
Lalu buka `https://www.tokolink.store/#/admin` — `RequireAdmin` lolos.

**Impact:**
- Akses penuh ke seluruh `/admin/*`.
- `api/admin-users` mengembalikan **email + `last_sign_in_at` seluruh user** (`auth.admin.listUsers()`).
- RLS `or is_admin()` memberi akses baca+tulis ke **semua** baris di `products`, `orders`, `order_items`, `payments`, `ledger`, `withdrawals` (termasuk **nomor rekening bank lengkap**), `bio_links`, `discount_codes`, `store_hours`, `premium_requests`, `store_theme`, `store_visits`.
- Bisa menyetujui permintaan Premium milik sendiri, menandai penarikan dana sendiri `selesai`, menangguhkan seller lain.

**Attack scenario:**
Attacker mendaftar akun gratis (tidak butuh verifikasi email bila fitur itu nonaktif — lihat BUG-040), login, satu permintaan HTTP, menjadi super-admin. Waktu tempuh: < 30 detik, tanpa tooling khusus, tanpa eksploit memory/code-execution.

**Recommended fix:**
1. **Jangan** biarkan `role`/`plan`/`status` ditulis dari client. Cabut dengan:
   ```sql
   revoke update (role, plan, status) on profiles from authenticated;
   ```
   atau lebih bersih: pindahkan `role` ke tabel terpisah `user_roles(user_id, role)` yang **tidak punya policy write untuk authenticated**, dan ubah `is_admin()` menjadi `SECURITY DEFINER` yang membaca tabel itu.
2. Ganti policy `profiles` menjadi dua policy terpisah:
   ```sql
   create policy "profile self read"   on profiles for select using (id = auth.uid() or is_admin());
   create policy "profile self update" on profiles for update
     using (id = auth.uid()) with check (id = auth.uid());
   -- + trigger BEFORE UPDATE yang menolak perubahan role/plan/status
   --   kecuali auth.jwt() ->> 'role' = 'service_role'
   ```
3. Tambahkan `supabase.auth.getUser()` + verifikasi role di **setiap** serverless function (sudah benar di `admin-users`, belum ada di `create-order`).
4. Audit: cek `select id, role from profiles where role='admin'` — cocokkan dengan daftar admin yang sah.

---

### BUG-002 — Pemalsuan saldo dompet: seller bisa INSERT baris `ledger` sebesar apa pun

**Category:** Security + Business Logic (Financial)
**Severity:** Critical
**Confidence:** Confirmed (source + semantik RLS)

**Location:**
- `database/migrate_fase3.sql:31-33` (policy `ledger`)
- `src/pages/DashboardB.tsx:61-89` (`useLedger` — saldo = `SUM(ledger.amount)`)
- `src/pages/DashboardB.tsx:318-360` (`Withdraw` — validasi saldo **hanya di client**)

**Evidence:**
```sql
-- database/migrate_fase3.sql:31-33
create policy "seller manages own ledger" on ledger
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());
```
`for all` = INSERT diizinkan selama `seller_id = auth.uid()`. Tidak ada constraint yang membatasi `amount`, tidak ada trigger, tidak ada RPC khusus. Sementara saldo dihitung murni dari tabel ini:
```ts
// src/pages/DashboardB.tsx:89
const balance = rows.reduce((s, r) => s + Number(r.amount), 0);
```
Satu-satunya pemeriksa saldo ada di browser:
```ts
// src/pages/DashboardB.tsx:324
if (value > balance) return setErr("Jumlah melebihi saldo tersedia.");
```

**Problem:**
Sumber kebenaran saldo (tabel `ledger`) bisa ditulis bebas oleh pemiliknya sendiri. Tidak ada otoritas server yang mensinkronkan `ledger` dengan `payments`/`orders`.

**Reproduction (project test):**
```js
await supabase.from("ledger").insert({
  seller_id: myUid,
  label: "Penjualan TL-2510-0001",
  amount: 500000000,      // Rp5 miliar
  type: "masuk",
});
```
Refresh `/app/wallet` → saldo Rp500.000.000. Lanjut ke BUG-003.

**Impact:**
Inflasi saldo tanpa batas → penarikan dana nyata → kerugian finansial langsung bagi TokoLink (platform membayar transfer ke rekening attacker dari kas sendiri, karena tidak ada escrow per-transaksi).

**Attack scenario:**
Daftar → mint Rp500 juta → ajukan penarikan → (jika admin tidak teliti) dana cair. Atau kombinasikan dengan BUG-001 untuk **menyetujui penarikan sendiri**. Deteksi sangat sulit karena baris `ledger` palsu tampak identik dengan baris asli di UI admin.

**Recommended fix:**
1. Cabut INSERT/UPDATE/DELETE langsung:
   ```sql
   revoke insert, update, delete on ledger from authenticated, anon;
   create policy "ledger read own" on ledger for select using (seller_id = auth.uid() or is_admin());
   ```
2. Semua mutasi `ledger` **wajib** lewat `SECURITY DEFINER` RPC / edge function yang memverifikasi bahwa `payments.status='berhasil'` untuk `ref_order_id` terkait, dan bersifat idempoten.
3. Tambahkan constraint: `alter table ledger add constraint ledger_amount_nonzero check (amount <> 0);` dan trigger yang menolak baris `masuk` tanpa `ref_order_id` yang valid.
4. Buat fungsi `seller_balance(uuid)` `STABLE SECURITY DEFINER` dan pakai itu (bukan `SUM` di client) untuk semua tampilan saldo.

---

### BUG-003 — Penarikan dana tanpa validasi server, tanpa reserve saldo, dan bisa disetujui sendiri

**Category:** Business Logic + Security (Financial)
**Severity:** Critical
**Confidence:** Confirmed

**Location:**
- `src/pages/DashboardB.tsx:318-360` (`Withdraw`)
- `database/migrate_fase3.sql:36-38` (policy `withdrawals`)
- `src/pages/Admin.tsx:946-990` (`AdminWithdrawals.onConfirm`)

**Evidence:**
Tiga celah berdiri sendiri dan saling menguatkan:

**(a) Tidak ada validasi server.** `Withdraw` melakukan `insert` langsung dari browser. Pemeriksa `value > balance` (baris 324) dan `value < 50000` (baris 323) hidup **hanya di client**. Tidak ada edge function `request-withdrawal`. RLS mengizinkan INSERT dengan `seller_id = auth.uid()` berapa pun nilainya.

**(b) Tidak ada reserve dana.** Saat permintaan dibuat, **tidak ada baris `ledger` pengurangan**. Saldo baru benar-benar berkurang hanya ketika admin menekan "Selesai" (`Admin.tsx:972-981`). Jadi saldo yang ditampilkan ke seller tetap utuh.
```ts
// src/pages/Admin.tsx:972-981 — pemotongan saldo terjadi DI SINI, di browser admin
if (want === "selesai") {
  await supabase.from("ledger").insert({
    seller_id: target.seller_id,
    label: `Penarikan ke ${target.bank}`,
    amount: -Math.abs(Number(target.amount)),
    type: "keluar",
  });
}
```

**(c) Seller bisa menyetujui penarikan sendiri.** Policy `for all` pada `withdrawals` memberi hak UPDATE. Seller dapat:
```js
await supabase.from("withdrawals").update({ status: "selesai" }).eq("id", myWithdrawalId);
```
Karena pemotongan saldo ada di kode **browser admin** (bukan trigger DB), jalur ini **tidak memotong saldo sama sekali** — status jadi `selesai` sementara saldo tetap penuh.

**Problem:**
Siklus uang (request → approve → ledger) seluruhnya di sisi client, tanpa transaksi database, tanpa pemeriksaan saldo otoritatif, tanpa idempotensi.

**Reproduction (project test):**
1. Saldo Rp100.000.
2. Ajukan penarikan Rp100.000 sebanyak 10× (tombol "Semua saldo" diklik berulang) → 10 baris `menunggu`, total Rp1.000.000, saldo UI tetap Rp100.000.
3. Lewati antrean: `update withdrawals set status='selesai' where seller_id=me` → semua jadi `selesai`, saldo **tetap** Rp100.000.

**Impact:**
- Double-spending klasik: satu saldo ditarik berkali-kali.
- Admin dapat mencairkan penarikan melebihi saldo → saldo negatif → rugi riil.
- Seller dapat menandai penarikan lunas tanpa saldo terpotong → saldo abadi.

**Attack scenario (rantai):**
BUG-002 (mint saldo) → ajukan penarikan → BUG-001 (jadi admin) → buka `/admin/withdrawals` → "Proses" → "Selesai" → dana cair ke rekening attacker, dan baris `ledger` "Penarikan" yang ditulis admin akan menetralkan sebagian saldo palsu sehingga jejaknya rapi.

**Recommended fix:**
1. Pindahkan seluruh alur penarikan ke serverless function `request-withdrawal` yang, **dalam satu transaksi Postgres**:
   - mengunci baris seller (`SELECT ... FOR UPDATE` atau `pg_advisory_xact_lock(seller_id)`),
   - menghitung saldo otoritatif dari `ledger`,
   - menolak bila `amount < 50000` atau `amount > saldo - saldo_ditahan`,
   - **langsung** menulis baris `ledger` `keluar` (reserve) saat permintaan dibuat,
   - membalikkan reserve jika ditolak.
2. `revoke insert, update, delete on withdrawals from authenticated;` — hanya SELECT untuk pemilik. Status hanya boleh diubah lewat RPC admin-side.
3. Tambahkan partial unique index untuk mencegah permintaan ganda dalam jendela waktu tertentu.
4. Tampilkan "Saldo tersedia" dan "Saldo ditahan" terpisah di UI.

---

### BUG-004 — Kebocoran PII massal: seluruh tabel `profiles` dapat dibaca anonim tanpa login

**Category:** Security (Information Disclosure / IDOR massal)
**Severity:** Critical
**Confidence:** Confirmed

**Location:**
- `database/schema.sql:154-155`
- `src/pages/Storefront.tsx:52-60` (query publik)
- `database/migrate_profiles_media.sql` (kolom `address`, `bio`)

**Evidence:**
```sql
-- database/schema.sql:154-155
create policy "public can read storefront profile" on profiles
  for select using (true); -- perlu untuk render halaman toko publik
```
Tidak ada `column`-level privilege. PostgREST mengizinkan `select=*` untuk peran `anon`. Kolom yang terekspos (gabungan `schema.sql` + `migrate_profiles_media.sql` + `migrate_profiles_media`):

`id, role, store_name, store_slug, owner_name, city, wa_number, plan, status, created_at, avatar_url, cover_url, category, bio, address, is_closed`

**Problem:**
Kebutuhan sebenarnya hanya **satu baris** (profil toko yang sedang dibuka). Policy membuka **semua baris, semua kolom, untuk siapa pun**. Ini melanggar prinsip least-privilege dan (di Indonesia) UU Pelindungan Data Pribadi: nama lengkap pemilik, nomor WhatsApp, dan alamat lengkap adalah data pribadi.

**Reproduction (aman — cukup 1 baris, tanpa mengambil data massal):**
```
GET /rest/v1/profiles?select=id,role,plan,status&limit=1
apikey: <VITE_SUPABASE_ANON_KEY>   ← key ini ada di bundle JS publik
```
Jika mengembalikan 1 baris → policy `using (true)` aktif dan seluruh tabel dapat di-enumerasi dengan pagination.

**Impact:**
- Database seluruh seller TokoLink (nama asli + nomor WA + alamat + kota) dapat diunduh siapa pun tanpa akun.
- `role` terekspos → attacker tahu persis akun mana yang admin → target phishing/kredensial (lihat rantai BUG-004 → BUG-001).
- Kompetitor bisa mengkloning seluruh katalog + harga + stok (juga via `products`, lihat BUG-018).
- Nomor WA seller → spam/penipuan berkedok TokoLink → kerusakan reputasi platform.

**Attack scenario:**
Scrape `profiles` → dapatkan daftar seller + nomor WA → kirim SMS/WA phishing "TokoLink: toko Anda akan dinonaktifkan, klik link" → curi sesi seller → lalu BUG-001 untuk eskalasi. Atau jual database UMKM.

**Recommended fix:**
1. Hapus policy `using (true)`. Ganti dengan pembacaan publik yang **terbatas kolom**:
   ```sql
   revoke select on profiles from anon;
   create policy "public reads storefront card" on profiles
     for select using (true);
   -- + batasi kolom:
   grant select (id, store_name, store_slug, city, avatar_url, cover_url, bio, category, is_closed) on profiles to anon;
   ```
   `owner_name`, `wa_number`, `address`, `role`, `plan`, `status`, `created_at` **tidak boleh** bisa dibaca `anon`.
2. Nomor WA: simpan terpisah di tabel `seller_contacts` tanpa akses anon; render tombol WA lewat RPC yang mengembalikan URL `wa.me` yang sudah diformat, bukan nomor mentah.
3. Rotasi/audit: anggap PII ini sudah bocor; siapkan notifikasi ke seller bila diperlukan.

---

## High Findings

### BUG-005 — Seller dapat memalsukan status pembayaran dan menghapus jejak transaksi

**Category:** Security (Business Logic / Data Integrity)
**Severity:** High
**Confidence:** Confirmed

**Location:** `database/migrate_fase3.sql:26-28` (policy `payments`), `:20-24` (`orders`), `:11-19` (`order_items`)

**Evidence:**
```sql
create policy "seller manages own payments" on payments
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());
```
`for all` = SELECT + INSERT + UPDATE + DELETE.

**Problem:**
Tidak ada otoritas server atas siklus pembayaran selain webhook (yang hanya menulis saat event datang dari BuatQris).

**Reproduction (project test):**
```js
// Tandai lunas tanpa bayar sepeser pun:
await supabase.from("payments").update({ status: "berhasil", fee: 0 }).eq("order_id", myOrderId);
// Besarkan nilai order:
await supabase.from("orders").update({ total: 999999999 }).eq("id", myOrderId);
// Hapus jejak:
await supabase.from("payments").delete().eq("order_id", myOrderId);
```

**Impact:**
- GMV, "Tingkat selesai", dan `AdminAnalytics` dapat dipompa/dimanipulasi siapa pun.
- `AdminPayments` kehilangan kemampuan rekonsiliasi: transaksi gagal bisa dihapus.
- Karena `ledger` tidak pernah diturunkan dari `payments` (BUG-002), baris `payments.status='berhasil'` palsu **tidak** otomatis memberi uang — tetapi menjadi alat rekayasa sosial yang kuat ("lihat, sistem bilang sudah bayar") dan merusak pelaporan.
- Status `orders` juga bisa diubah (`selesai` pada order belum bayar) → metrik palsu.

**Attack scenario:**
Seller nakal memompa omzet 30 hari untuk terlihat "toko terpercaya" di mata admin, atau untuk mengajukan limit/Program Premium. Atau seller memalsukan `selesai` pada order yang belum dibayar lalu menagih pembeli.

**Recommended fix:**
```sql
revoke insert, update, delete on payments from authenticated, anon;
revoke update, delete on orders from authenticated;   -- seller hanya boleh ubah status pengiriman
create policy "seller reads own payments" on payments for select using (seller_id = auth.uid() or is_admin());
create policy "seller ships own orders" on orders for update
  using (seller_id = auth.uid()) with check (seller_id = auth.uid() and status in ('dikemas','dikirim','selesai'));
```
Perubahan status **bayar** hanya lewat webhook/service-role. Transisi `orders.status` sebaiknya divalidasi trigger state-machine (lihat BUG-014).

---

### BUG-006 — Status `ditangguhkan` tidak pernah ditegakkan; seller yang ditangguhkan tetap bisa berjualan dan bisa memulihkan dirinya sendiri

**Category:** Security (Authorization bypass) + Business Logic
**Severity:** High
**Confidence:** Confirmed

**Location:**
- `src/lib/auth.tsx:157-172` (`RequireAuth`)
- `src/pages/Admin.tsx:1331` (`AdminUsers.setStatus`)
- `src/pages/Admin.tsx:419` (`AdminSellers.setStatus`)

**Evidence:**
Satu-satunya gerbang `/app/*`:
```ts
// src/lib/auth.tsx:157-172
export function RequireAuth({ children }) {
  const { session, loading } = useAuth();
  useEffect(() => { if (!loading && !session) navigate("/login"); }, [loading, session]);
  if (loading || !session) return null;
  return <>{children}</>;          // ← profile.status TIDAK pernah diperiksa
}
```
Tidak ada satu pun `grep profiles.status == 'ditangguhkan'` di seluruh `src/`.

Dialog admin menjanjikan hal yang tidak terjadi:
```tsx
// src/pages/Admin.tsx (ConfirmDialog body, AdminUsers)
"Pengguna langsung keluar dari seluruh sesi dan tidak bisa masuk sampai diaktifkan kembali."
```
Realitanya `setStatus` hanya melakukan `update profiles set status='ditangguhkan'` — tidak ada `auth.admin.signOut`, tidak ada revoke sesi, tidak ada pemeriksaan saat `signInWithPassword`.

**Impact:**
- Penangguhan akun adalah **operasi kosmetik**. Seller yang ditangguhkan (mis. karena penipuan) tetap bisa login, menerima order, menarik dana.
- Karena BUG-001, seller yang ditangguhkan cukup `update profiles set status='aktif'` untuk membatalkan penangguhan sendiri.
- Klaim UI bahwa pengguna "langsung keluar dari seluruh sesi" adalah kepalsuan yang bisa dipakai admin untuk merasa aman secara keliru.

**Recommended fix:**
1. `RequireAuth` wajib memeriksa `profile.status !== 'aktif'` → paksa `signOut()` + arahkan ke halaman penjelasan.
2. Tambahkan trigger/RPC admin yang memanggil `auth.admin.signOut(jti)` atau set `banned_until` di `auth.users` saat menangguhkan.
3. Lindungi `profiles.status` dari tulisan client (sama seperti `role`, lihat BUG-001).

---

### BUG-007 — Paket Premium bisa diaktifkan sendiri secara gratis

**Category:** Business Logic (Revenue bypass)
**Severity:** High
**Confidence:** Confirmed

**Location:** `database/schema.sql:14` (`plan` CHECK), `database/schema.sql:150-152` (policy `profiles`)

**Evidence:**
```sql
plan text not null default 'gratis' check (plan in ('gratis', 'premium')),
```
Dengan policy `for all ... with check (id = auth.uid())`, seller bebas melakukan:
```js
await supabase.from("profiles").update({ plan: "premium" }).eq("id", myUid);
```

**Impact:**
Semua fitur berbayar gratis untuk siapa pun yang tahu triknya. Alur resmi (`premium_requests` → admin approve, `Admin.tsx:654-657`) menjadi tidak ada artinya. Karena badge "Premium" di storefront juga hardcoded (BUG-030), seller bahkan tidak perlu melakukan ini untuk **tampak** premium.

**Recommended fix:**
Sama seperti BUG-001: `plan` tidak boleh ditulis client. Ubah hanya lewat RPC/service-role setelah pembayaran terverifikasi.

---

### BUG-008 — Log audit tidak pernah ditulis; Admin System menampilkan log audit palsu yang di-hardcode

**Category:** Security (Audit / Accountability) + Hardcoded UI
**Severity:** High
**Confidence:** Confirmed

**Location:**
- `database/migrate_admin_audit_broadcast.sql:8-40` (tabel `audit_log` + RPC `log_admin_action`)
- `src/pages/Admin.tsx` — **tidak ada satupun pemanggilan `log_admin_action`**
- `src/pages/Admin.tsx:1526-1541` (sidebar "Log audit terakhir")
- `src/pages/Admin.tsx:930-935` (dialog penarikan)

**Evidence:**
```sql
-- migrate_admin_audit_broadcast.sql:27-38
create or replace function log_admin_action(...) returns void as $$
  insert into audit_log (...) select auth.uid(), ... where is_admin();
$$ language sql security definer set search_path = public;
grant execute on function log_admin_action(text, text, uuid, text, numeric) to authenticated;
```
Pencarian di seluruh `src/` untuk `log_admin_action` dan `audit_log` **menghasilkan nol**. Yang ditampilkan ke admin justru array literal:
```tsx
// src/pages/Admin.tsx:1527-1532
["Dwi Handoko", "Menyetujui PRM-0089", "12 Feb 08:31"],
["Sari Utami", "Mengubah biaya QRIS 0,75% → 0,7%", "11 Feb 16:04"],
["Dwi Handoko", "Menangguhkan SLR-0127", "10 Feb 11:22"],
["Sistem", "Sinkronisasi bank selesai", "10 Feb 04:00"],
```
Sementara dialog penarikan secara eksplisit berbohong:
```tsx
// src/pages/Admin.tsx (ConfirmDialog body, act === "proses")
"Dana akan dikirim ke rekening penjual pada batch transfer berikutnya. Tindakan ini tercatat di log audit."
```

**Problem:**
Infrastruktur audit dibangun (dan diklaim di `.opencode/TASKS.md` sebagai "khusus aksi yang nyentuh uang"), tetapi tidak pernah dihubungkan. Admin melihat panel "Log audit terakhir" berisi aktivitas **fiktif** dengan nama orang yang tidak ada.

**Impact:**
- **Nol akuntabilitas** pada aksi yang memindahkan uang (approve premium, setujui penarikan). Tidak ada jejak siapa melakukan apa.
- Admin mendapat rasa aman palsu ("tercatat di log audit") padahal tidak ada apa-apa.
- Bila terjadi sengketa/penipuan, tidak ada bukti forensik.
- Ini juga contoh paling mencolok dari pola "UI terlihat terhubung tetapi tidak".

**Recommended fix:**
1. Panggil `log_admin_action` di `AdminWithdrawals.onConfirm` (proses/selesai/tolak) dan `AdminPremium.approve`/`doReject`, plus `AdminUsers.setStatus`, `AdminSellers.setStatus`.
2. Ganti panel "Log audit terakhir" dengan query nyata `select * from audit_log order by created_at desc limit 10` (join ke `profiles` untuk nama aktor). Hapus array literal.
3. Tambahkan `actor_id` juga pada aksi serverless (webhook, `delete-account`).

---

### BUG-009 — Nomor rekening bank lengkap seluruh seller dikirim ke browser admin

**Category:** Security (Sensitive data exposure)
**Severity:** High
**Confidence:** Confirmed

**Location:** `src/pages/Admin.tsx:804-813`, `:872` (fungsi `masked`), `:880-884`

**Evidence:**
```ts
// src/pages/Admin.tsx:805-813
const { data } = await supabase
  .from("withdrawals")
  .select("id,bank,account_number,amount,fee,status,created_at,seller_id,profiles(store_name)")
  .order("created_at", { ascending: false });
```
Komentar di `database/schema.sql:107` berbunyi: *"account_number text not null, — simpan penuh di server, mask saat ditampilkan"*. Kenyataannya:
```ts
// src/pages/Admin.tsx:872
const masked = (acct: string) => (acct.includes("•") ? acct : `•••• ${acct.slice(-4)}`);
```
`masked()` hanya menyamarkan **saat render**. Nilai lengkap sudah ada di memori JS, di DevTools, di tab Network, dan di cache.

**Impact:**
- Setiap admin (dan setiap attacker yang memakai BUG-001) memperoleh nomor rekening bank lengkap seluruh seller.
- Digabung BUG-004 (nomor WA + alamat + nama asli), ini menjadi profil lengkap untuk penipuan perbankan / social engineering.

**Recommended fix:**
`revoke select (account_number) ...` atau sediakan view/RPC `withdrawals_admin_v` yang sudah mengembalikan `account_number_masked`. Nomor utuh hanya boleh diakses lewat endpoint server-side terpisah dengan audit log, saat admin benar-benar akan transfer.

---

### BUG-010 — Total yang ditampilkan saat checkout tidak sama dengan jumlah yang ditagihkan; ongkos kirim dan promo "potongan ongkir" hilang di server

**Category:** Business Logic (Payment) + Functional
**Severity:** High
**Confidence:** Confirmed

**Location:**
- `src/pages/Storefront.tsx:1265-1268` (`useTotals` — total versi client)
- `src/pages/Storefront.tsx:1618-1632` (`Checkout.submit` — payload ke server)
- `api/create-order.ts:118` (`const total = subtotal - discount;`)

**Evidence:**
Client menghitung:
```ts
// src/pages/Storefront.tsx:1264-1267
const baseShipping = subtotal === 0 ? 0 : subtotal >= 200000 ? 0 : SHIP;  // SHIP = 10000
const shipping = Math.max(0, baseShipping - shipDisc);
const total = subtotal - discount + shipping;
```
dan menampilkannya sebagai **"Total bayar"** (`Storefront.tsx:1895-1898`). Tetapi payload checkout:
```ts
// src/pages/Storefront.tsx:1618-1632
body: JSON.stringify({
  seller_id, buyer_name, buyer_phone, buyer_city, buyer_address,
  buyer_note, channel: "QRIS",
  cart: items.map((i) => ({ product_id: i.p.id, qty: i.qty })),
  promo_code: promo,
}),
```
**Tidak ada field ongkos kirim, tidak ada metode pengiriman, tidak ada `form.ship`.** Server lalu menghitung:
```ts
// api/create-order.ts:118
const total = subtotal - discount;      // ← ongkir tidak pernah masuk
```
dan untuk tipe promo ketiga:
```ts
// api/create-order.ts:110-113
if (match.type === "persen")  discount = Math.round((subtotal * Number(match.value)) / 100);
else if (match.type === "nominal") discount = Math.min(Math.round(Number(match.value)), subtotal);
// type 'potongan_ongkir' → discount TETAP 0, diabaikan total
```

**Problem:**
Tiga inkonsistensi sekaligus:
1. Ongkos kirim Rp10.000 (atau Rp0 bila subtotal ≥ Rp200.000) **tidak pernah ditagihkan**. README mengklaim *"total dihitung ulang di server"* — benar, tetapi dengan rumus yang berbeda dari yang ditampilkan ke pembeli.
2. Pilihan kurir "GoSend instan Rp18.000" di UI **tidak berpengaruh apa-apa** terhadap harga (lihat BUG-034).
3. Promo bertipe **"Potongan ongkir"** divalidasi dan ditampilkan sebagai berlaku di keranjang (`Storefront.tsx:1250-1253`), tetapi **server mengabaikannya sepenuhnya** (`create-order.ts` tidak memiliki cabang `potongan_ongkir`).

**Impact:**
- Seller menerima lebih sedikit dari yang dijanjikan UI (ongkir hilang) — atau, bila ongkir nantinya benar-benar dihitung, pembeli membayar jumlah yang berbeda dari yang tertera di layar. Keduanya adalah masalah kepercayaan dan bisa jadi sengketa.
- Promo "gratis ongkir" adalah janji kosong: pembeli melihat potongan, kenyataannya tidak ada.
- Angka "Total bayar" di halaman checkout dan angka di QRIS berbeda → pembeli bingung, mengira ditipu (ini persis bug yang menurut `migrate_fase3d_amount.sql` pernah terjadi antara `orders.total` dan `payments.amount`).

**Recommended fix:**
1. Kirim `shipping_method` dari client; server yang **menentukan** biayanya dari tabel aturan (bukan dari client).
2. `create-order` wajib menghitung `total = subtotal - discount + shipping - shipDiscount`, menangani `potongan_ongkir`, dan menyimpan `orders.shipping`/`orders.shipping_method` (perlu migrasi kolom).
3. Kembalikan rincian (`subtotal, discount, shipping, total, amount_due`) dari `create-order` dan **tampilkan angka dari respons server**, jangan dari hitungan client.

---

### BUG-011 — Stok tidak pernah divalidasi maupun dikurangi; landing page mengklaim sebaliknya

**Category:** Business Logic (Inventory) + False claim
**Severity:** High
**Confidence:** Confirmed

**Location:**
- `api/create-order.ts:71-79` (loop subtotal)
- `src/pages/Landing.tsx` (klaim "Stok berkurang otomatis" / "Stok berkurang sendiri")
- `database/schema.sql:29` (kolom `products.stock`), `:36` (`sold`)

**Evidence:**
```ts
// api/create-order.ts:72-78
for (const line of body.cart) {
  const p = byId.get(line.product_id);
  if (!p || line.qty <= 0) continue;         // ← satu-satunya validasi qty
  subtotal += Number(p.price) * line.qty;
  lines.push({ product_id: line.product_id, name: p.name, qty: line.qty, price: Number(p.price) });
}
```
Tidak ada `p.stock >= line.qty`. Tidak ada `update products set stock = stock - qty`. Tidak ada `update products set sold = sold + qty` di mana pun (kolom `sold` hanya diisi `ProductForm` saat edit manual dan **selalu 0** untuk produk baru karena `payload` di `DashboardA.tsx:1128-1140` tidak menyertakan `sold`).

Landing page production (`https://www.tokolink.store`) menyatakan:
- "Stok berkurang otomatis." (bagian 02, poin "Etalase & keranjang sendiri")
- "Stok berkurang sendiri, jadi tidak ada pesanan dobel." (bagian 05)

**Problem:**
Fitur yang diiklankan sebagai nilai jual utama **tidak ada implementasinya sama sekali**.

**Impact:**
- Overselling: 50 pembeli bisa memesan produk berstok 2. Seller baru tahu saat mengemas.
- Kolom `sold` selalu 0 → "Terjual" di ProductDetail selalu 0 → produk terlaris di analitik selalu kosong/acak.
- `DashboardHome` "Stok tersedia" dan notifikasi "Stok habis" tetap akurat (karena tidak ada yang mengubah stok), jadi seller tidak punya sinyal bahwa sistem tidak mengelola inventori.

**Recommended fix:**
1. Di `create-order`: validasi `p.stock >= qty` (atau putuskan eksplisit bahwa stok hanya indikatif — tetapi **jangan** mengklaim "berkurang otomatis" di landing).
2. Kurangi stok **secara atomik** setelah pembayaran berhasil (di webhook): `update products set stock = stock - qty where id = ... and stock >= qty returning *` dalam transaksi yang sama dengan penulisan `ledger`.
3. Tambah `sold = sold + qty` di jalur yang sama.
4. Perbaiki atau hapus klaim di `Landing.tsx`.

---

### BUG-012 — Halaman status pembayaran tidak pernah mengonfirmasi pembayaran, dan order yang dibatalkan ditampilkan selesai

**Category:** Functional + UX (Critical buyer flow)
**Severity:** High
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:2115-2125` (`PaymentStatus`), `:2387-2395` (`OrderTracking.doneMap`)

**Evidence:**
```ts
// src/pages/Storefront.tsx:2118-2120
const step = !order ? 0 : order.status === "menunggu" ? 0 : order.status === "dikemas" ? 2 : 3;
const finished = order?.status === "selesai";
```
Satu-satunya status yang dianggap "lunas" adalah `selesai`. Tetapi webhook menetapkan `dikemas` saat pembayaran berhasil (`api/buatqris-webhook.ts:104`). Maka setelah pembayaran diterima, pembeli melihat:
- Judul: **"Sedang mengonfirmasi ke bank…"** (`Storefront.tsx:2163`), dengan spinner berputar,
- Sub-judul: "Biasanya selesai dalam beberapa detik. Jangan tutup layar ini."

dan itu bertahan **sampai seller secara manual menandai order `selesai`** — bisa berhari-hari.

Kedua, `OrderTracking`:
```ts
// src/pages/Storefront.tsx:2388-2393
const doneMap: Record<string, boolean[]> = {
  menunggu: [true, false, false, false, false],
  dikemas:  [true, true,  true,  false, false],
  dikirim:  [true, true,  true,  true,  false],
  selesai:  [true, true,  true,  true,  true],
  batal:    [true, false, false, false, false],
};
```
`doneMap` untuk `batal` benar, **tetapi** `PaymentStatus` tidak punya kasus `batal` — status apa pun selain `menunggu`/`dikemas` jatuh ke `step = 3`. Jadi order **kadaluarsa/dibatalkan** (`batal`, ditulis webhook `payment.expired`) ditampilkan dengan **keempat langkah selesai semua** dan tombol "Lihat konfirmasi" + "Lacak pesanan" aktif.

**Impact:**
- Pembeli yang sudah membayar QRIS tidak pernah mendapat konfirmasi → cemas, menghubungi seller, atau membatalkan pesanan di aplikasi bank karena mengira gagal.
- Pembeli yang pembayarannya kadaluarsa melihat "Siap dikirim" → mengira barang dikirim padahal dibatalkan.
- Ini adalah layar paling sensitif secara emosional dalam seluruh alur belanja, dan ia memberi informasi yang salah di dua arah sekaligus.

**Recommended fix:**
1. `PaymentStatus` wajib memetakan status secara eksplisit, bukan `else → 3`:
   - `menunggu` → menunggu pembayaran (dengan hitung mundur kadaluarsa)
   - `dikemas` → **"Pembayaran diterima"** (teks sukses, spinner dihentikan)
   - `dikirim` → dalam pengiriman
   - `selesai` → selesai
   - `batal` → layar kegagalan yang jelas + ajakan pesan ulang
2. Pisahkan "status pembayaran" (`payments.status`) dari "status pengiriman" (`orders.status`) — saat ini satu kolom dipakai untuk dua konsep, dan itulah akar bug ini.
3. Hentikan polling saat status terminal (lihat BUG-025).

---

### BUG-013 — Tombol "Batalkan pesanan" di halaman QRIS tidak membatalkan apa-apa

**Category:** Functional + UX (Dead UI)
**Severity:** High
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:2089-2108` (tombol + `ConfirmDialog`)

**Evidence:**
```tsx
// src/pages/Storefront.tsx:2092-2094
<button onClick={() => setConfirmCancel(true)} ...>Batalkan pesanan</button>
...
// src/pages/Storefront.tsx:2100-2107
<ConfirmDialog
  title="Batalkan pesanan ini?"
  body="Pesanan dan pembayaran yang sudah dilakukan tidak bisa dikembalikan otomatis. Hubungi penjual bila Anda sudah terlanjur membayar."
  confirmLabel="Ya, batalkan"
  onConfirm={() => {
    toast("Pesanan dibatalkan.", "warn");
    navigate(`/s/${storeSlug}`);
  }}
/>
```
Tidak ada `fetch`, tidak ada `supabase.update`. Satu-satunya efek adalah toast dan pindah halaman.

**Impact:**
- Pembeli menekan "Batalkan pesanan", melihat konfirmasi "Pesanan dibatalkan", dan menyimpulkan tidak akan ditagih. Kenyataannya order tetap berstatus `menunggu`, QR tetap hidup, dan — paling buruk — pembeli yang sudah terlanjur memindai QR tetap membayar untuk order yang ia yakini dibatalkan.
- Seller melihat antrean order `menunggu` yang tidak pernah dibersihkan.
- Dialog secara jujur menyebut "tidak bisa dikembalikan otomatis" — jadi pengembangnya tahu ini belum selesai, tetapi tombolnya tetap dirilis.

**Recommended fix:**
Buat endpoint `POST /api/cancel-order` yang memverifikasi `order.id` + `access_token`, hanya mengizinkan pembatalan saat `status='menunggu'`, menandai `payments.status='gagal'` dan `orders.status='batal'`, lalu menampilkan hasil **dari respons server** (bukan toast asumsi).

---

## Medium Findings

### BUG-014 — Race condition pada kuota kode promo (`used_count` read-modify-write non-atomik)

**Category:** Business Logic (TOCTOU)
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `api/create-order.ts:87-116` (baca), `:165-167` (tulis)

**Evidence:**
```ts
// api/create-order.ts:100-104 — BACA
const match = codes.find((d) => String(d.code).toLowerCase() === code.toLowerCase()) as
  | { id: string; ... used_count: number; ... } | undefined;
...
promoUsed = match.used_count;
...
// api/create-order.ts:165-167 — TULIS (nilai dari hasil baca di atas)
if (promoId) {
  await db.from("discount_codes").update({ used_count: promoUsed + 1 }).eq("id", promoId);
}
```
Tidak ada `.eq("used_count", promoUsed)` (optimistic concurrency), tidak ada transaksi, tidak ada unique constraint yang melacak pemakaian per order.

**Impact:**
Kode promo ber-kuota (mis. `LIBURAN`, limit 50) bisa dipakai tanpa batas jika beberapa checkout terjadi bersamaan. Kerugian diskon ditanggung seller.

**Recommended fix:**
```sql
-- di create-order, ganti update() dengan RPC atomik:
update discount_codes
   set used_count = used_count + 1
 where id = promoId
   and (usage_limit is null or used_count < usage_limit)
returning id;      -- 0 baris = kuota habis → tolak promo, hitung ulang total
```
Tambahkan pula tabel `promo_redemptions(order_id, code_id)` dengan unique constraint supaya promo tidak bisa dipakai ulang pada order yang sama.

---

### BUG-015 — `create-order` tanpa idempotensi dan menerima `seller_id` dari client

**Category:** API / Business Logic
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `api/create-order.ts:40-53`, `:121-146`

**Evidence:**
```ts
// api/create-order.ts:51-53
if (!body?.seller_id || !body?.buyer_name || !Array.isArray(body?.cart) || body.cart.length === 0) { ... }
```
`seller_id` diambil mentah dari body; tidak ada pemeriksaan bahwa seller itu `status='aktif'` atau bahwa slug-nya valid. Tidak ada header `Idempotency-Key`, tidak ada nonce, tidak ada pencocokan keranjang yang sudah pernah diproses.

**Impact:**
- **Order spam:** siapa pun bisa membuat pesanan palsu untuk **seller mana pun** dengan nama/alamat/telepon fiktif. Dashboard seller dipenuhi order `menunggu` bodong, notifikasi "Pesanan baru" aktif, dan seller menghabiskan waktu menghubungi nomor palsu.
- **Duplikasi order:** klik ganda pada tombol "Bayar dengan QRIS" (atau retry jaringan) menghasilkan 2 order + 2 QRIS untuk barang yang sama.
- Seller yang ditangguhkan (BUG-006) tetap menerima order.

**Recommended fix:**
1. Terima `store_slug`, bukan `seller_id`; server yang menerjemahkannya.
2. Tolak bila `profiles.status <> 'aktif'`.
3. Terima header `Idempotency-Key`; simpan di `orders.idempotency_key` dengan unique index, kembalikan order yang sudah ada bila kunci dipakai ulang.
4. Batasi panjang `buyer_name`/`buyer_address`/`buyer_note` (saat ini tanpa batas) dan `qty` (saat ini hanya `> 0`).

---

### BUG-016 — Rate limit dapat dilewati karena Ip diambil dari header `x-forwarded-for` yang dikendalikan klien

**Category:** Security (Rate-limit bypass)
**Severity:** Medium
**Confidence:** Likely (berdasar source + perilaku umum proxy Vercel)

**Location:** `api/create-order.ts:28-38`, `api/buatqris-webhook.ts:33-43`, `api/_lib.ts:46-48`

**Evidence:**
```ts
// api/create-order.ts:29
const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ?? "unknown";
```
`split(",")[0]` mengambil **nilai pertama**. Di Vercel, header `x-forwarded-for` yang dikirim klien umumnya **digabung** dengan IP asli (`<nilai-dari-klien>, <ip-asli>`), sehingga elemen pertama adalah nilai yang dikendalikan penyerang. Header yang可靠的 adalah `x-vercel-forwarded-for`. Selain itu, penyimpanannya `globalThis.__coHits` — **per-instance in-memory**, jadi batasnya hangus setiap kali fungsi cold-start atau discale ke instance baru.

**Impact:**
Batas "30 permintaan/menit" hilang sepenuhnya: cukup acak nilai header tiap permintaan. Dipakai untuk BUG-015 (spam order) dan untuk membanjiri pembuatan QRIS di BuatQris.

**Verifikasi yang disarankan (aman):** kirim 50 permintaan `POST /api/create-order` dengan `X-Forwarded-For` berbeda-beda; jika tidak ada `429`, celah terkonfirmasi.

**Recommended fix:**
Pakai `req.headers["x-real-ip"] ?? req.headers["x-vercel-forwarded-for"]?.split(",")[0]` dan pindahkan penyimpanan ke Vercel KV / Upstash Redis (bukan `globalThis`).

---

### BUG-017 — Endpoint anonim tanpa rate limit: `increment_bio_link_click` dan insert `store_visits`

**Category:** Security (API abuse) + Data integrity
**Severity:** Medium
**Confidence:** Confirmed

**Location:**
- `database/migrate_bio_link_clicks.sql:9-16`
- `database/migrate_traffic.sql:29-33`
- `src/pages/Storefront.tsx:470-476`, `:1336-1347`

**Evidence:**
```sql
create or replace function increment_bio_link_click(p_id uuid) returns void as $$
  update bio_links set clicks = clicks + 1 where id = p_id and is_active = true;
$$ language sql security definer set search_path = public;
grant execute on function increment_bio_link_click(uuid) to anon, authenticated;
```
Tidak ada pemeriksaan kepemilikan, tidak ada rate limit, tidak ada dedupe. `SECURITY DEFINER` + `anon` = siapa pun dapat menaikkan penghitung tautan **toko mana pun** tanpa batas.

```sql
create policy "public may log visits" on store_visits
  for insert with check (exists (select 1 from profiles where id = store_visits.seller_id));
```
`exists` hanya memastikan seller-nya ada. Anon dapat menyisipkan jutaan baris `store_visits` untuk seller mana pun. Pelindung di frontend sekadar `sessionStorage` (`Storefront.tsx:1340-1343`) — dilewati dengan tidak memakai browser.

**Impact:**
- Analitik "Pengunjung" dan "Klik tautan" dapat dipalsukan sepenuhnya (kompetitor memompa angka toko sendiri, atau merusak metrik toko lain).
- Tabel `store_visits` dapat dijadikan tempat pembuangan → biaya storage Supabase dan perlambatan query `Traffic` (yang mengambil **seluruh** baris periode tanpa limit).

**Recommended fix:**
Tambahkan rate limit per IP di Edge/proxy, batasi ukuran payload, dan lakukan agregasi harian (tabel `store_visits_daily`) alih-alih menyimpan satu baris per kunjungan. Untuk klik tautan, pakai RPC yang mencatat hash IP + id tautan dengan jendela waktu.

---

### BUG-018 — Katalog produk dan kode promo dapat di-enumerasi lintas toko oleh siapa pun

**Category:** Security (Information Disclosure)
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `database/schema.sql:145-146`, `database/migrate_fase3.sql:70-71`

**Evidence:**
```sql
create policy "public can read active products" on products
  for select using (status = 'aktif');          -- tanpa filter seller_id

create policy "public can read active discount codes" on discount_codes
  for select using (is_active = true);          -- tanpa filter seller_id
```

**Problem:**
Kebutuhan sebenarnya adalah "baca produk **toko yang sedang dibuka**". Policy memberi "baca semua produk semua toko".

**Impact:**
- Kompetitor dapat memantau harga, stok, SKU, dan deskripsi seluruh toko di platform (kolom `seller_id` ikut dikembalikan, sehingga katalog bisa dikelompokkan per toko).
- Seluruh kode promo aktif **global** dapat diambil, lengkap dengan `value`, `min_purchase`, `usage_limit`, `used_count`, `valid_until` — lalu dipakai di toko mana pun yang kebetulan punya kode sama, atau disalahgunakan untuk promo silang.

**Recommended fix:**
Jangan membuka `select` bebas. Sediakan RPC `public_store(slug)` / `public_products(seller_id)` `SECURITY DEFINER` yang menerima slug dan hanya mengembalikan baris toko itu. Untuk promo, hapus policy publik dan lakukan validasi kode **seluruhnya di server** pada `create-order` (yang memang sudah memvalidasi ulang).

---

### BUG-019 — Webhook pembayaran tidak melakukan rekonsiliasi nominal dan tidak berjalan dalam transaksi

**Category:** Business Logic (Payment)
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `api/buatqris-webhook.ts:77-138`

**Evidence:**
```ts
// api/buatqris-webhook.ts:77-91
const { data: payment } = await db.from("payments")
  .select("id,order_id,seller_id,amount,fee,status")
  .eq("external_ref", payload.transaction_id).maybeSingle();
...
// api/buatqris-webhook.ts:94-95
const fee = Number(payload.admin_fee ?? 0);
```
`payment.amount` (nilai yang kita minta) **tidak pernah dibandingkan** dengan `payload.total_amount` (nilai yang benar-benar dibayar). `credit_amount` dari payload dipercaya mentah-mentah:
```ts
// api/buatqris-webhook.ts:105
const credit = Number(payload.credit_amount ?? Number(payment.amount) - fee);
```
Lalu tiga penulisan terpisah, tanpa transaksi:
```ts
await db.from("payments").update({ status: "berhasil", fee }).eq("id", payment.id).eq("status","menunggu").select("id");   // klaim — BAGUS
await db.from("orders").update({ status: "dikemas" }).eq("id", payment.order_id);
await db.from("ledger").insert({ ... amount: credit ... });
```

**Yang sudah benar:** klaim `.eq("status","menunggu")` + `select("id")` membuat dedup tahan terhadap pengiriman ganda konkuren (Postgres READ COMMITTED akan mengembalikan 0 baris pada permintaan kedua). Ini patut diapresiasi.

**Yang masih salah:**
1. Tidak ada rekonsiliasi nominal. Jika BuatQris mengembalikan `total_amount` berbeda dari `payment.amount`, selisihnya tidak pernah ketahuan.
2. Tidak ada transaksi: bila `ledger.insert` gagal (jeda jaringan, constraint), `payments.status` sudah `berhasil` tetapi seller **tidak menerima uang** — tidak ada retry, tidak ada rollback.
3. `orders.status` ditimpa menjadi `dikemas` tanpa memeriksa status lama. Webhook yang terlambat dapat menurunkan status order yang sudah `dikirim`/`selesai` kembali ke `dikemas`.
4. Event selain `payment.success`/`payment.expired` menandai `gagal` tetapi **membiarkan `orders.status = 'menunggu'`** — order menggantung tanpa batas waktu.
5. `credit_amount` dari payload dipakai langsung; tidak ada batas atas (mis. `credit <= payment.amount`).
6. Tidak ada proteksi replay berbasis timestamp (dedup berbasis status sudah cukup untuk saat ini, tetapi tidak untuk event `payment.expired` yang datang **setelah** `payment.success` — expired akan menimpa `orders.status` menjadi `batal` pada order yang sudah lunas, karena cabang expired tidak memeriksa status payment).

**Recommended fix:**
1. Bandingkan `Number(payload.total_amount) === Number(payment.amount)`; bila beda, tandai `payments.status='perlu_cek'` dan jangan kreditkan `ledger`.
2. Bungkus klaim + update order + insert ledger + insert fee platform dalam satu RPC Postgres (atau `rpc('settle_payment', ...)`) sehingga atomik.
3. Sebelum menulis `orders.status`, periksa status saat ini dan tolak transisi mundur.
4. Tambahkan pemeriksaan `payment.status === 'menunggu'` juga di cabang `expired`.

---

### BUG-020 — Diskon persen > 100% tidak divalidasi di server, menghasilkan order dengan total negatif

**Category:** Business Logic (Validation)
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `api/create-order.ts:109-118`, `src/pages/DashboardB.tsx:1404`

**Evidence:**
Pemeriksaan `> 100` ada **hanya di browser**:
```ts
// src/pages/DashboardB.tsx:1404
if (form.type === "Persen" && Number(form.value) > 100) return setErr("Persen maksimal 100.");
```
Tidak ada CHECK constraint di `discount_codes.value`, dan `create-order` tidak membatasi:
```ts
// api/create-order.ts:110-118
if (match.type === "persen") discount = Math.round((subtotal * Number(match.value)) / 100);
...
const total = subtotal - discount;
```
Order tetap **ditulis ke database** sebelum pemeriksaan ambang:
```ts
// api/create-order.ts:121-146  → insert orders (total bisa ≤ 0)
// api/create-order.ts:172-174  → baru dicek: if (total < 1000) return 400
```

**Impact:**
- Seller (atau siapa pun dengan akses tulis ke `discount_codes`) dapat membuat kode 500% → order tercatat dengan `total` negatif dan status `menunggu`. Order sampah menumpuk di dashboard, merusak "Omzet".
- Respons 400 menyertakan `order_id` + `access_token`, jadi order sampah itu bahkan bisa dilacak pembeli.

**Recommended fix:**
`alter table discount_codes add constraint discount_value_sane check (type <> 'persen' or (value > 0 and value <= 100));` dan di `create-order`: `discount = Math.min(discount, subtotal)`, serta validasi `total >= 1000` **sebelum** insert.

---

### BUG-021 — Penarikan dana, perubahan status order, dan persetujuan premium tidak memiliki audit trail apa pun

**Category:** Security (Audit) — lihat juga BUG-008
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/Admin.tsx:946-990`, `:649-666`, `:1330-1341`, `:419-425`

Ini adalah sisi "aksi" dari BUG-008. Tidak ada panggilan `log_admin_action` di `AdminWithdrawals`, `AdminPremium`, `AdminUsers`, maupun `AdminSellers`. Selain itu, kode persetujuan bersifat **read-then-write** tanpa optimism concurrency:
```ts
// src/pages/Admin.tsx:957-971
const { data: fresh } = await supabase.from("withdrawals").select("status").eq("id", target.id).single();
const allowed = (confirm.act === "proses" && cur === "menunggu") || ...;
if (!allowed) { toast("Status sudah berubah. Muat ulang antrean.", "bad"); load(); return; }
const { error } = await supabase.from("withdrawals").update({ status: want, ... }).eq("id", target.id);
```
Dua admin yang membuka dialog bersamaan dapat berdua melewati pemeriksaan `allowed` (TOCTOU), dan bagian `insert ledger` (baris 972-981) dapat tereksekusi dua kali → saldo seller dipotong ganda.

**Recommended fix:**
`.update({...}).eq("id", id).eq("status", cur)` dan periksa `returning`. Pindahkan seluruh blok (update + ledger + audit log) ke satu RPC `admin_process_withdrawal(p_id uuid, p_action text)` `SECURITY DEFINER` dengan `is_admin()` di dalamnya.

---

### BUG-022 — `delete-account` menghapus akun beserta seluruh jejak tanpa pemeriksaan saldo/order tertunda

**Category:** Business Logic (Data integrity)
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `api/delete-account.ts:23-27`, `src/pages/DashboardB.tsx:2585-2615`

**Evidence:**
```ts
// api/delete-account.ts:24
const { error } = await db.auth.admin.deleteUser(me.user.id);
// profiles + data seller ikut terhapus via ON DELETE CASCADE.
```
UI menjanjikan:
```tsx
// src/pages/DashboardB.tsx (ConfirmDialog body)
"Seluruh toko, produk, dan riwayat pesanan akan dihapus permanen. Saldo yang masih ada HARUS ditarik dulu — setelah dihapus tidak bisa kembali."
```
Tetapi tidak ada pemeriksaan: saldo `ledger`, permintaan penarikan berstatus `menunggu`/`diproses`, atau order yang belum selesai. `ON DELETE CASCADE` di `withdrawals`, `ledger`, `orders` (schema.sql) berarti semuanya lenyap.

**Impact:**
- Seller dengan penarikan `diproses` menghapus akun → baris penarikan hilang → admin kehilangan rujukan rekening → dana tidak pernah cair (atau cair tanpa jejak).
- Seller dengan order `dikemas` menghapus akun → pembeli tidak bisa lagi melacak pesanan (`track_order` mengembalikan NULL) dan seller tidak bisa dihubungi.
- Bukti transaksi hilang — masalah serius untuk kepatuhan dan sengketa.

**Recommended fix:**
Sebelum `deleteUser`, tolak bila ada `withdrawals.status in ('menunggu','diproses')` atau saldo > 0 atau `orders.status in ('menunggu','dikemas','dikirim')`. Atau (lebih baik) lakukan **soft delete**: set `profiles.status='dihapus'`, anonimkan data pembeli, dan hapus keras setelah masa retensi 30 hari. Semua ini harus dicatat di `audit_log`.

---

### BUG-023 — 7 dari 8 tema tidak menampilkan tautan bio sama sekali

**Category:** Functional / Storefront / Theme Audit
**Severity:** Medium (High untuk proposisi nilai produk)
**Confidence:** Confirmed

**Location:** `src/storefront/themes/*.tsx`, `src/storefront/types.ts:51-52`

**Evidence:**
Kontrak mewajibkan:
```ts
// src/storefront/types.ts:51-52
bioLinks: ThemeBioLink[];
onOpenBioLink: (l: ThemeBioLink) => void;
```
Pemeriksaan per file (pencarian literal `bioLinks` / `onOpenBioLink`):

| Tema | Merender tautan bio? |
|---|---|
| 01 Ruang Seduh | ✅ satu-satunya yang ya |
| 02 Pasar Rapi | ❌ |
| 03 Lugas Jasa | ❌ |
| 04 Atelier | ❌ |
| 05 Dapur Hari Ini | ❌ |
| 06 Kriya Nusantara | ❌ |
| 07 Pixel Goods | ❌ |
| 08 Studio Tenang | ❌ |

`StoreHome` tetap mengambil data (`Storefront.tsx:~700`) dan tetap mengirimkannya, lalu diabaikan.

**Problem:**
TokoLink diposisikan sebagai **"link-in-bio + storefront"**. Tema adalah fitur yang dijual ("satu data, delapan wajah"). Tetapi memilih 7 dari 8 wajah akan **menghapus seluruh tautan** — WhatsApp, Instagram, TikTok, katalog PDF, marketplace — yang justru alasan utama seller memakai link-in-bio. Tidak ada peringatan di halaman Tema; seller baru menyadari setelah tautannya hilang dari toko.

**Impact:**
Seller kehilangan konversi tanpa tahu penyebabnya. Ini adalah kehilangan fitur diam-diam pada produk inti.

**Recommended fix:**
Wajibkan semua tema merender blok tautan bio (atau sediakan komponen bersama `<BioLinkRow/>` yang dipakai semua tema). Tambahkan tes kontrak yang memeriksa bahwa setiap tema menggunakan `bioLinks`.

---

### BUG-024 — 6 dari 8 tema mengabaikan status "toko ditutup" (`is_closed`)

**Category:** Business Logic / Theme Audit
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/storefront/themes/*.tsx`

**Evidence:**
```ts
// ✅ benar:
src/storefront/themes/pasar-rapi.tsx:111   const canAdd = showCart && !closed;
src/storefront/themes/ruang-seduh.tsx:162  const canAdd = showCart && !closed;

// ❌ lupa `closed`:
atelier.tsx:75            const canAdd = showCart;
dapur-hari-ini.tsx:87     const canAdd = showCart;
kriya-nusantara.tsx:35    const canAdd = showCart;
lugas-jasa.tsx:80         const canAdd = showCart;
pixel-goods.tsx:73        const canAdd = showCart;
studio-tenang.tsx:34      const canAdd = showCart;
```

**Problem:**
Fitur "Tutup toko sementara" (`StoreSettings` → `profiles.is_closed`, `DashboardB.tsx:2285-2300`) **hanya bekerja di tema Klasik, Pasar Rapi, dan Ruang Seduh**. Di 6 tema lain, pembeli tetap melihat tombol tambah-ke-keranjang aktif dan dapat menyelesaikan checkout.

**Impact:**
Seller yang sengaja menutup toko (stok habis, sedang libur, kewalahan order) tetap menerima pesanan baru dan harus menolaknya manual — persis masalah yang coba diselesaikan fitur ini.

**Recommended fix:**
Samakan menjadi `const canAdd = showCart && !closed;` di semua tema; lebih baik lagi, pindahkan perhitungan itu ke `StoreHome` dan kirim sebagai prop `canAdd` agar tidak bisa lupa lagi.

---

### BUG-025 — Polling agresif 3 detik tanpa henti

**Category:** Performance
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:1310-1336` (`useOrderStatus`)

**Evidence:**
```ts
// src/pages/Storefront.tsx:1333-1334
fetchOnce();
const poll = window.setInterval(fetchOnce, 3000);
```
Interval **tidak pernah dihentikan** meski status sudah terminal (`selesai` / `batal`). Setiap tik memanggil RPC `track_order` (SECURITY DEFINER). Halaman `Qris`, `PaymentStatus`, dan `OrderSuccess` semuanya memakai hook ini. Ditambah `Qris` menjalankan interval **1 detik** terpisah untuk hitung mundur (`Storefront.tsx:1965-1968`).

**Impact:**
- ~20 permintaan/menit per tab yang terbuka. Bila pembeli membiarkan layar QRIS terbuka 15 menit (masa berlaku QR) = 300 permintaan, dan layar status bisa terbuka berjam-jam.
- Beban langsung ke project Supabase (kuota) dan ke database; pada traffic ramai ini setara dengan beban self-DoS.
- Boros baterai & kuota — krusial karena audiens TokoLink adalah pembeli HP di Indonesia.

**Recommended fix:**
Gunakan Supabase Realtime (`postgres_changes` pada `orders`) atau hentikan interval saat status terminal, dan terapkan backoff (3s → 10s → 30s → berhenti), serta jeda polling saat tab tidak terlihat (`document.visibilityState`).

---

### BUG-026 — Query tanpa batas dan tanpa paginasi pada halaman admin & order

**Category:** Performance / Scalability
**Severity:** Medium
**Confidence:** Confirmed

**Location:**
- `src/pages/Admin.tsx:104-105` (`orders`, `payments` seluruh platform, tanpa `.limit`)
- `src/pages/Admin.tsx:1173-1178` (`.limit(200)`)
- `src/pages/DashboardA.tsx:1384-1396` (semua order seller)
- `src/pages/DashboardB.tsx:52-58` (semua `products` seller)
- `src/pages/DashboardB.tsx:61-86` (semua `ledger` seller)

**Evidence:**
```ts
// src/pages/Admin.tsx:104-105
supabase.from("orders").select("total,status,created_at").gte("created_at", monthAgo),
supabase.from("payments").select("status,fee,created_at").gte("created_at", monthAgo),
```
Seluruh baris platform ditarik ke browser. `AdminPayments` memotong di 200 baris tetapi lalu menjumlahkan:
```tsx
// src/pages/Admin.tsx:1267-1271
<span>Total nilai pada tab ini</span>
<span>{rupiah(filtered.reduce((s, r) => s + Number(r.amount), 0))}</span>
```
— jadi angkanya adalah total **200 baris pertama**, bukan total tab. Labelnya menyesatkan.

**Impact:**
- Lambat/browser hang begitu platform punya puluhan ribu order.
- Ringkasan admin salah saji (under-report) tanpa indikasi bahwa data dipotong.

**Recommended fix:**
Pakai agregasi di database (RPC `platform_stats(range)`) atau `.range()` + `count: "exact"` dengan paginasi nyata. Tampilkan "Menampilkan 1–50 dari 1.243".

---

### BUG-027 — Pelacakan pesanan menampilkan cap waktu palsu dan klaim layanan palsu

**Category:** Hardcoded / Dead UI
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:2397-2413`

**Evidence:**
```ts
// src/pages/Storefront.tsx:2397-2401
const made = new Date(order.created_at).toLocaleString("id-ID", {...});
const timeline = [
  { t: "Pesanan dibuat",        d: made,                    ... },
  { t: "Pembayaran diterima",   d: done[1] ? made : "—",    ... },
  { t: "Dikemas penjual",       d: done[2] ? made : "—",    ... },
  { t: "Sedang dikirim",        d: done[3] ? made : "—",    ... },
  { t: "Selesai",               d: done[4] ? made : "—",    ... },
];
```
Setiap langkah yang "selesai" diberi cap waktu **yang sama persis** dengan waktu pembuatan order. Jadi bila order dibuat 1 Okt dan baru dikirim 3 Okt, UI mengatakan "Sedang dikirim — 1 Okt 09:41".
```tsx
// src/pages/Storefront.tsx:2542
<div className="text-[12.5px] text-faint">Balas chat ≤ 10 menit</div>
```
Tidak ada sistem chat, tidak ada SLA, dan tombol "Butuh bantuan" di bawahnya hanya memunculkan toast (BUG-031).

**Impact:**
Pembeli melihat garis waktu yang mustahil (semua kejadian terjadi pada detik yang sama) → kehilangan kepercayaan. Klaim "balas ≤ 10 menit" adalah janji yang tidak bisa ditepati platform.

**Recommended fix:**
Simpan cap waktu nyata (`orders.paid_at`, `packed_at`, `shipped_at`, `completed_at`) — perlu migrasi — dan tampilkan dari situ. Hapus klaim SLA.

---

### BUG-028 — Pesan error database mentah ditampilkan ke pengguna

**Category:** Error Handling / Information Disclosure
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/DashboardB.tsx:1414-1417`, `:1374`

**Evidence:**
```ts
// src/pages/DashboardB.tsx:1414-1417
setErr(
  error.code === "23505"
    ? `Kode ${code} sudah dipakai. Pakai nama lain.`
    : `Gagal menyimpan (${error.message}). Screenshot pesan ini ke developer.`,
);
```
```ts
// src/pages/DashboardB.tsx:1374
setLoadError(error.message);
```
`error.message` dari PostgREST berisi detail internal Postgres (nama kolom, nama constraint, kadang nama skema/tabel, hint). Ini diletakkan langsung ke UI.

**Impact:**
- Membocorkan struktur database internal ke pengguna biasa.
- Menyuruh pengguna "screenshot pesan ini ke developer" adalah pengalihan tanggung jawab debugging ke pelanggan.
- Pesan tidak dapat dipahami seller awam (bahasa Inggris, jargon SQL).

**Recommended fix:**
Petakan `error.code` ke pesan bahasa Indonesia yang ramah; kirim `error.message` hanya ke logger (Sentry/dsb.), tidak pernah ke UI.

---

### BUG-029 — Halaman `Checkout` menampilkan layar kosong bila produk gagal dimuat

**Category:** Error Handling
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:1645`, `:1561-1567`

**Evidence:**
```ts
// src/pages/Storefront.tsx:1643-1645
  };
  if (items.length === 0) return null;
  return ( ... );
```
`useTotals` hanya mengisi `items` setelah query Supabase selesai. Bila query gagal (jaringan putus, RLS error, sesi kedaluwarsa), `items` tetap `[]` dan komponen mengembalikan `null` → **layar putih total**, tanpa pesan, tanpa tombol kembali.

Bandingkan dengan `Orders` di dashboard yang punya `loadError` + `<ErrorState onRetry={load} />` — pola yang benar sudah ada, tetapi tidak diterapkan di alur checkout yang justru lebih kritis. Pola yang sama muncul di `ProductDetail` bila `products` gagal (hanya `notFound`).

**Impact:**
Pembeli yang sedang mengisi data pengiriman lalu koneksinya putus akan melihat halaman kosong; semua isian hilang, tidak ada petunjuk apa yang terjadi.

**Recommended fix:**
Bedakan "sedang memuat" / "kosong" / "gagal". Tampilkan `<ErrorState onRetry=... />` saat `error`, dan simpan draf form di `sessionStorage` agar tidak hilang.

---

### BUG-030 — Badge "Premium" dipasang di semua halaman toko tanpa kecuali

**Category:** Hardcoded UI / Trust
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:~640` (StoreHome, profil), `src/pages/DashboardB.tsx:2229-2234` (sidebar pengaturan), `src/pages/DashboardB.tsx:2213-2217`

**Evidence:**
```tsx
// src/pages/Storefront.tsx — bagian profil toko
<h1 ...>{name}</h1>
<Badge tone="blue">Premium</Badge>
```
Nilai ini **literal**. Query profil publik (`Storefront.tsx:52-60`) bahkan tidak menyertakan kolom `plan`:
```ts
.select("id,store_name,store_slug,city,owner_name,wa_number,avatar_url,cover_url,bio,is_closed")
```
Jadi badge tidak mungkin berasal dari data. Di dashboard, kartu paket juga statis:
```tsx
// src/pages/DashboardB.tsx:2229-2234
<div className="micro text-brand-300">Paket saat ini</div>
<span className="text-[24px] font-extrabold">Premium</span>
<span>Rp59.000/bln</span>
<p>Perpanjang otomatis 12 Mar 2025. Biaya QRIS 0,5% dan laporan bisa diunduh.</p>
```
sementara tombol di bawah kartu yang sama memakai data asli:
```tsx
// src/pages/DashboardB.tsx:2255
{(profile?.plan ?? "gratis") === "premium" ? "Paket Premium aktif" : "Ajukan Premium"}
```
Jadi satu sidebar menampilkan "Premium · perpanjang 12 Mar 2025" **dan** tombol "Ajukan Premium" secara bersamaan untuk seller gratis.

**Impact:**
- Pembeli diberi sinyal kepercayaan palsu ("toko premium") yang tidak dapat dipertanggungjawabkan TokoLink.
- Seller gratis melihat dirinya sudah Premium → tidak pernah membayar → kerugian pendapatan.
- Tanggal "12 Mar 2025" adalah tanggal mati dari data contoh, sudah lebih dari setahun lalu.

**Recommended fix:**
Ambil `plan` pada query publik dan render `<Badge>` bersyarat. Di dashboard, seluruh kartu paket harus dibangun dari `profile.plan` + `premium_requests` terakhir.

---

### BUG-031 — Tombol "Chat WhatsApp" tidak membuka WhatsApp (toast saja)

**Category:** Dead UI / UX (Critical CTA)
**Severity:** Medium — lihat juga BUG-042 untuk daftar lengkap
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:~660` (StoreHome), `:1390-1400` (ProductDetail desktop), `:1420-1430` (ProductDetail mobile), `:2356-2362` (OrderSuccess), `:2544-2550` (OrderTracking)

**Evidence:**
Tidak ada satu pun `wa.me`, `api.whatsapp.com`, atau `window.open` untuk WhatsApp di `src/` kecuali satu tempat (`DashboardA.tsx:1789`, khusus seller). Semua CTA pembeli bunyinya:
```tsx
onClick={() => toast(wa ? "Membuka chat WhatsApp " + wa : "Nomor WhatsApp toko belum diatur.", "info")}
```
```tsx
onClick={() => toast("Membuka chat WhatsApp dengan detail pesanan…", "info")}
```
```tsx
onClick={() => toast("Membuka chat WhatsApp penjual…", "info")}
```
Nomor WA toko **sudah tersedia** di state (`store.wa_number`). Yang hilang tinggal pembuatan URL `https://wa.me/62...`.

**Impact:**
Ini tombol paling sering ditekan pembeli Indonesia. Ia menampilkan pesan yang secara aktif **berbohong** ("Membuka chat…") sementara tidak terjadi apa-apa. Pembeli mengira aplikasinya rusak atau HP-nya bermasalah. Landing page juga menjanjikan "Tombol WhatsApp — tanya stok tanpa salin nomor" dan "Setiap produk punya tombol WhatsApp yang membuka chat dengan detail pesanan sudah terisi" — keduanya tidak benar.

**Recommended fix:**
```ts
const waHref = (n: string, text?: string) =>
  `https://wa.me/${n.replace(/\D/g,"").replace(/^0/,"62")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
// lalu: window.open(waHref(wa, `Halo, saya mau tanya stok ${p.name}`), "_blank", "noopener");
```

---

### BUG-032 — Tombol "Bagikan" di halaman toko hanya menampilkan toast, tidak menyalin apa-apa

**Category:** Dead UI
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:~610-620` (tombol Bagikan di cover), `onShare` untuk semua tema (`Storefront.tsx:602-607`)

**Evidence:**
```tsx
// src/pages/Storefront.tsx — tombol "Bagikan" pada cover
onClick={() => {
  setShared(true);
  toast(`Tautan toko disalin: tokolink.store/s/${slug}`, "info");   // ← klaim "disalin"
  setTimeout(() => setShared(false), 1600);
}}
```
Tidak ada `navigator.clipboard.writeText`. Padahal **di modal QR di halaman yang sama** implementasinya sudah benar:
```tsx
// src/pages/Storefront.tsx — tombol "Salin tautan" di modal QR
const url = `https://tokolink.store/s/${slug}`;
if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
toast("Tautan QR disalin.");
```
Jadi dua tombol "salin" di satu halaman: satu bekerja, satu berpura-pura. `onShare` yang dikirim ke 8 tema juga hanya toast.

**Impact:**
Seller/pembeli menekan "Bagikan", melihat "Tautan toko disalin", mencoba menempel ke WhatsApp → yang terkirim adalah sesuatu yang lain. Kehilangan momen berbagi organik (growth loop utama produk).

**Recommended fix:**
Pakai `navigator.clipboard.writeText(...)` dengan fallback `navigator.share(...)`; tampilkan toast sukses hanya bila operasi benar-benar berhasil.

---

### BUG-033 — Janji pengiriman, estimasi, dan garansi dipasang mati di setiap produk setiap toko

**Category:** Hardcoded UI / Legal
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:1360-1375` (ProductDetail info blok), `Storefront.tsx:~680` (strip status toko), `Storefront.tsx:1815-1821` (opsi ongkir), `Storefront.tsx:1847-1850` (kode pos)

**Evidence:**
```tsx
// src/pages/Storefront.tsx:1361-1364
["truck", "Pengiriman", "GoSend instan Rp18.000 · JNE reguler Rp10.000"],
["clock", "Estimasi tiba", "Bandung hari ini · luar kota 2–3 hari"],
["shield", "Garansi toko", "Barang rusak atau salah kirim diganti penuh"],
```
- "Bandung hari ini" muncul di **setiap** toko, di kota mana pun seller berada.
- "Garansi toko … diganti penuh" adalah kewajiban hukum yang dipasang platform **atas nama seller**, tanpa persetujuan seller dan tanpa dana.
- Strip status: `"Pesanan sebelum 15.00 dikirim hari ini juga."` — janji operasional yang tidak bisa dipenuhi seller yang tidak tahu klaim itu ada.
- Opsi ongkir: `["Ambil sendiri di toko", "Jl. Cihampelas No. 28", "Gratis"]` — alamat **contoh** (Bandung) ditampilkan sebagai alamat toko asli.
- `Kode pos` ber-`defaultValue="40131"` dan tidak pernah dikirim (`Storefront.tsx:1847-1850`).

Catatan: `.opencode/TASKS.md` mencatat ini sebagai backlog ("masih angka tetap … **Tanya user dulu**"), jadi ini sudah disadari — tetapi sudah berada di production dan terlihat pembeli.

**Impact:**
Risiko hukum/komplain konsumen atas janji yang dibuat TokoLink atas nama seller. Plus kebingungan: buyer di Surabaya melihat "Bandung hari ini".

**Recommended fix:**
Jadikan per-seller (kolom `profiles.shipping_note`, `return_policy`) dengan default kosong; bila kosong, sembunyikan bloknya. Hapus `defaultValue="40131"` atau kirim nilainya.

---

### BUG-034 — Pilihan kurir dan metode pembayaran "Transfer bank" tidak berpengaruh apa-apa

**Category:** Dead UI / Business Logic
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:1802-1830` (kurir), `:1836-1860` (pembayaran), `:1600-1606` (tolak non-QRIS)

**Evidence:**
Tiga opsi kurir dengan harga berbeda (Gratis / Rp18.000 / Rp10.000):
```tsx
["Reguler (2–3 hari)", "JNE / J&T", shipping === 0 ? "Gratis" : rupiah(SHIP)],
["GoSend instan (hari ini)", "Kurir dalam kota", rupiah(18000)],
["Ambil sendiri di toko", "Jl. Cihampelas No. 28", "Gratis"],
```
`form.ship` disimpan di state tetapi **tidak pernah dikirim** ke `create-order` (lihat BUG-010). Jadi ketiga opsi menghasilkan tagihan identik.

Metode pembayaran:
```tsx
[["QRIS", "qr", "Semua e-wallet & m-banking", "Biaya 0,7%"],
 ["Transfer bank", "wallet", "BCA / Mandiri / BRI", "Verifikasi manual"]]
```
Tetapi:
```ts
// src/pages/Storefront.tsx:1600-1603
if (form.pay !== "QRIS") {
  toast("Saat ini pembayaran hanya via QRIS.", "bad");
  return;
}
```
Opsi "Transfer bank — Verifikasi manual" ditawarkan, lalu ditolak setelah pembeli mengisi seluruh formulir.

**Impact:**
Pembeli memilih GoSend (mengharapkan barang sampai hari ini, membayar lebih) tetapi tagihannya sama dengan reguler → seller mengirim reguler → komplain. Atau pembeli memilih transfer bank, mengisi alamat lengkap, lalu baru ditolak → frustrasi dan kemungkinan besar pergi.

**Recommended fix:**
Kirim `form.ship` dan biaya ongkir ke server (lihat BUG-010). Sembunyikan opsi "Transfer bank" sampai benar-benar didukung, atau tandai jelas "Segera hadir" dan nonaktifkan.

---

### BUG-035 — Tombol "Batalkan pesanan" seller mengklaim dana dikembalikan, padahal tidak ada refund dan pembeli tidak diberi tahu

**Category:** Business Logic + False claim
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/DashboardA.tsx:2022-2030`, `:1989-1992`

**Evidence:**
```tsx
// src/pages/DashboardA.tsx:2024-2026 (isi dialog)
body="Pembeli akan diberi tahu dan dana dikembalikan penuh. Riwayat pembatalan tetap tersimpan untuk laporan Anda."
// src/pages/DashboardA.tsx:2028
onConfirm={() => setStatus("batal", "Pesanan dibatalkan dan dana dikembalikan.")}
```
Realitas `setStatus`:
```ts
// src/pages/DashboardA.tsx:1715-1725
const { error } = await supabase.from("orders").update({ status: next }).eq("id", o.id);
```
Tidak ada: notifikasi ke pembeli (tidak ada sistem email/WA), perubahan `payments.status` (tetap `berhasil`), baris `ledger` balik, atau panggilan refund ke BuatQris. Tombol ini juga **aktif untuk order yang sudah dibayar** (`disabled` hanya untuk `selesai`/`batal`, baris 1995) — jadi seller dapat membatalkan order berstatus `dikemas`/`dikirim`.

**Impact:**
- Seller diberi konfirmasi bahwa dana dikembalikan → seller tidak pernah mengembalikan → pembeli dirugikan, platform yang dipersalahkan.
- Seller jahat dapat menerima pembayaran QRIS lalu "membatalkan" order dan mengantongi uangnya, sementara pembeli melihat status "Dibatalkan" dan mengira uangnya kembali.
- Tidak ada resi/nomor pelacakan di skema, tetapi dialog pengiriman menjanjikan "Pembeli akan menerima notifikasi beserta nomor resi" (`DashboardA.tsx:2011`).

**Recommended fix:**
Pisahkan "tolak order (belum bayar)" dari "refund (sudah bayar)". Refund harus memanggil API BuatQris/transfer balik dan menulis `ledger` negatif, serta mengirim notifikasi nyata. Sampai itu ada, ganti teks dialog menjadi jujur dan batasi pembatalan hanya untuk status `menunggu`.

---

### BUG-036 — Tidak ada header keamanan sama sekali (CSP, X-Frame-Options, HSTS, dll.)

**Category:** Security (Hardening)
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `vercel.json` (seluruh isi)

**Evidence:**
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
Tidak ada blok `"headers"`. Tidak ada `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`.

**Impact:**
- Tanpa CSP, satu XSS (lihat catatan mitigasi di bawah) langsung menjadi sesi-pencurian tanpa hambatan.
- Tanpa `X-Frame-Options`/`frame-ancestors`, halaman TokoLink dapat di-iframe untuk clickjacking (mis. membingkai halaman QRIS untuk mengarahkan pembayaran).
- `Referrer-Policy` absen → URL pelacakan order **berisi `access_token`** (`#/order/TL-xxxx?token=<uuid>`) dapat bocor lewat header Referer ke pihak ketiga.

**Mitigasi yang sudah ada (patut dicatat):** tidak ditemukan satu pun `dangerouslySetInnerHTML`, `innerHTML`, atau `eval(` di seluruh `src/` — React meng-escape secara bawaan, dan URL tautan bio selalu dipaksa berawalan `https://` (`Storefront.tsx:474`), sehingga `javascript:` tidak dapat dieksekusi. Jadi saat ini **tidak ada XSS yang dikonfirmasi**; penambahan CSP adalah pertahanan berlapis, bukan perbaikan bug aktif.

**Recommended fix:**
Tambahkan ke `vercel.json`:
```json
"headers": [{
  "source": "/(.*)",
  "headers": [
    { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
  ]
}]
```

---

### BUG-037 — Halaman desain sistem internal (`/#/system`) dapat diakses publik

**Category:** Informational disclosure
**Severity:** Medium (rendah secara teknis, sedang secara kerapian)
**Confidence:** Confirmed

**Location:** `src/App.tsx:96`, `src/pages/System.tsx`

**Evidence:**
```ts
// src/App.tsx:96
if (path === "/system") return <SystemPage />;
```
Tidak dibungkus `RequireAuth` (`Shell()` di `App.tsx:209-217` hanya melindungi `app` dan `admin`). Halaman ini berisi seluruh token desain, palet warna, skala tipografi, radius, dan inventaris komponen internal. `public/robots.txt` berisi `User-agent: * / Allow: /`, jadi halaman ini juga dapat diindeks mesin pencari.

**Impact:**
Bocornya panduan internal dan peta komponen; mempermudah pembuatan phishing yang sangat meyakinkan (clone identik). Juga terindeks Google.

**Recommended fix:**
Bungkus dengan `RequireAuth` (atau hapus dari build production), dan tambahkan `Disallow: /#/system`-style handling atau jadikan rute internal.

---

### BUG-038 — Galeri produk palsu: 3 thumbnail dari satu foto yang sama

**Category:** Hardcoded / Dead UI
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:1006`, `:1024-1050`

**Evidence:**
```ts
// src/pages/Storefront.tsx:1006
const positions = ["50% 50%", "20% 30%", "80% 70%"];
```
```tsx
<img src={p.img} ... style={{ objectPosition: positions[shot] }} />
...
{positions.map((pos, i) => (
  <button key={pos} onClick={() => setShot(i)} aria-label={`Foto ${i + 1}`} ...>
    <img src={p.img} alt="" ... style={{ objectPosition: pos }} />
    <span ...>0{i + 1}</span>
  </button>
))}
```
Skema hanya punya satu kolom `products.image_url`. "Galeri" ini adalah foto yang sama dipotong di tiga posisi berbeda, diberi label 01/02/03, seolah ada tiga foto.

**Impact:**
Pembeli mengira produk punya beberapa foto, menggeser-geser, dan melihat potongan gambar yang sama → kesan murahan dan menurunkan kepercayaan. Mengklik thumbnail memberi ilusi interaksi tanpa informasi baru.

**Recommended fix:**
Hapus carousel sampai ada tabel `product_images`. Tampilkan satu foto saja.

---

### BUG-039 — Statistik landing page seluruhnya angka mati yang disajikan sebagai data platform nyata

**Category:** Hardcoded / Trust / Legal
**Severity:** Medium
**Confidence:** Confirmed

**Location:** `src/pages/Landing.tsx:287-289`, `:630-633`, `:739-760`, `:765`, `:772`

**Evidence:**
```tsx
// src/pages/Landing.tsx:287-289
["4.820", "toko aktif"],
["Rp12,8 M", "diproses tahun ini"],
["10 menit", "rata-rata siap jualan"],
```
```tsx
// src/pages/Landing.tsx:677 (disclaimer)
"Angka diambil dari rata-rata toko aktif TokoLink, 90 hari terakhir. Hasil tiap toko bisa berbeda."
```
```tsx
// src/pages/Landing.tsx:756-764
["Omzet", "Rp38.420.000", "+18,4%"],
["Pesanan", "142", "+11,2%"],
["Pengunjung", "2.390", "+26,7%"],
...
// src/pages/Landing.tsx:772
<span>Diperbarui 12 Feb 2025, 09:44</span>
<span>Sumber: TokoLink Analytics</span>
```
Semuanya literal. Tidak ada query ke database di `Landing.tsx`. Pratinjau analitik juga memakai `SALES_30` dan `DAY_LABELS` dari `src/lib/data.tsx` (data contoh). Tombol periode "7 hari / 30 hari / Tahun ini" (`Landing.tsx:746-760`) hanya mengubah warna tombol — `const data = SALES_30;` pada baris 689 tidak pernah berubah.

**Impact:**
Klaim kinerja platform yang tidak berdasar di halaman pertama yang dilihat calon seller + disclaimer yang mengesankan data asli. Ini area berisiko secara hukum (iklan) dan merusak kredibilitas begitu ketahuan. Cap waktu "12 Feb 2025" juga sudah lebih dari setahun lampau.

**Recommended fix:**
Ambil angka asli lewat RPC agregat (dengan cache), atau hapus seluruh blok statistik + pratinjau analitik sampai ada datanya. Hapus tombol periode yang tidak berfungsi.

---

### BUG-040 — Verifikasi email / enumerasi akun: belum dapat dipastikan (perlu verifikasi konfigurasi)

**Category:** Security (Auth)
**Severity:** Medium (Unverified)
**Confidence:** Unverified

**Location:** `src/pages/Auth.tsx:289-306`, `src/lib/auth.tsx:57-66`

**Evidence:**
```ts
// src/pages/Auth.tsx:303-307
// Kalau verifikasi email AKTIF, tidak ada session → minta user cek email.
if (!data.session) { setSent(contact.trim()); return; }
```
Kode **mendukung** kedua kondisi, jadi tidak bisa disimpulkan dari source apakah "Confirm email" aktif di project Supabase production.

Hal yang bisa dikonfirmasi dari source:
- Tidak ada captcha / pembatasan laju di sisi aplikasi untuk registrasi.
- Enumerasi akun: `register` memetakan `error.message.includes("already registered")` ke pesan spesifik "Email ini sudah terdaftar. Masuk saja." (`auth.tsx:61`) → penyerang dapat menguji apakah suatu email terdaftar di TokoLink. Ini kebocoran privasi bagi seller (status "memakai TokoLink"-nya diketahui).
- `forgot` menampilkan layar "Tautan sudah dikirim" untuk email apa pun (Supabase mengembalikan sukses meski email tidak ada) → **tidak** ada enumerasi di alur lupa sandi. Bagus.

**Langkah verifikasi aman:** daftar dengan email sekali pakai di production; bila langsung masuk ke `/app` tanpa klik tautan verifikasi, maka konfirmasi email **nonaktif** → eskalasi ke High (siapa pun dapat mendaftar atas nama email orang lain dan, dengan BUG-001, menjadi admin).

**Recommended fix:**
Aktifkan "Confirm email" di Supabase. Samakan pesan error registrasi ("Jika email belum terdaftar, kami sudah mengirim tautan…") untuk mencegah enumerasi. Tambahkan captcha (hCaptcha/Turnstile) di registrasi.

---

## Low Findings

### BUG-041 — 21 tombol/field/toggle yang terlihat aktif tetapi tidak mempunyai logika

**Category:** Hardcoded / Dead UI
**Severity:** Low (masing-masing) — kumulatifnya Medium/High
**Confidence:** Confirmed

Daftar lengkap, dengan lokasi dan bukti:

| # | Lokasi | Elemen | Yang terjadi |
|---|---|---|---|
| 1 | `Storefront.tsx:~660` | "Chat WhatsApp" (toko) | toast saja — tidak membuka WA |
| 2 | `Storefront.tsx:1390-1400` | "Pesan via WhatsApp" (produk, desktop) | toast saja |
| 3 | `Storefront.tsx:1420-1430` | ikon WA (sticky mobile) | toast saja |
| 4 | `Storefront.tsx:2356-2362` | "Chat penjual" (OrderSuccess) | toast saja |
| 5 | `Storefront.tsx:2544-2550` | "Butuh bantuan" (OrderTracking) | toast saja |
| 6 | `Storefront.tsx:~610-620` | "Bagikan" (cover toko) | toast "disalin" tanpa clipboard |
| 7 | `Storefront.tsx:602-607` | `onShare` (semua 8 tema) | toast tanpa clipboard |
| 8 | `Storefront.tsx:2092-2107` | "Batalkan pesanan" (QRIS) | toast + pindah halaman; order tetap `menunggu` |
| 9 | `Storefront.tsx:1815-1821` | Pilihan kurir | tidak memengaruhi harga |
| 10 | `Storefront.tsx:1847-1850` | Input "Kode pos" | `defaultValue="40131"`, tidak dikirim |
| 11 | `Storefront.tsx:~1310-1320` | Stepper "3 Bayar" / "4 Selesai" | menuju `/checkout/qris` & `/checkout/success` **tanpa** `id`/`token` → halaman "Pesanan tidak ditemukan" |
| 12 | `DashboardB.tsx:1745-1748` | "Simpan jam buka" | toast "Jam buka disimpan." — perubahan sudah tersimpan per field, tombol ini tidak melakukan apa-apa |
| 13 | `DashboardB.tsx:1811-1816` | Kartu "Status sekarang → Toko sedang buka · Sampai 20.00 WIB" | hardcoded; tidak membaca `store_hours` atau jam nyata |
| 14 | `DashboardB.tsx:1939-1944` | "Pemindaian bulan ini — 405 kali" | literal |
| 15 | `DashboardB.tsx:1975-1985` | Grafik "Performa QR" (218/96/64) | literal |
| 16 | `DashboardB.tsx:2191-2200` | 4 toggle Notifikasi | state lokal, tidak ada tabel, tidak tersimpan |
| 17 | `DashboardB.tsx:~2240` | Segmented "Bulanan/Tahunan" | toast "Paket diubah ke X. Selisih tagihan dihitung otomatis." — tidak ada perubahan apa pun |
| 18 | `DashboardB.tsx:2463-2468` | Input "Nama tampilan" | `defaultValue=""`, tidak dikirim, tidak disimpan |
| 19 | `DashboardA.tsx:1985-1989` | "Unduh label kirim" | toast "Label pengiriman diunduh." — tidak ada pembuatan label |
| 20 | `Admin.tsx:823-825` | "Unduh antrean" | toast "Antrean transfer diunduh." — tidak ada unduhan |
| 21 | `Admin.tsx:1197-1199` | "Jalankan rekonsiliasi" | toast "Rekonsiliasi dijalankan. Hasil dikirim via email." — tidak ada sistem email |
| 22 | `Admin.tsx:1315-1317` | "Undang pengguna" | toast "Formulir undangan staf dibuka." — tidak ada formulir |
| 23 | `Admin.tsx:1477` | "Simpan pengaturan" (Admin System) | toast "…dan masuk log audit." — tidak menyimpan, tidak mencatat log |
| 24 | `Admin.tsx:1513-1520` | 4 toggle kanal pembayaran | state lokal; tidak memengaruhi checkout |
| 25 | `Admin.tsx:1530-1536` | "Aktifkan mode pemeliharaan" | state lokal; tidak menulis `settings`, tidak ada yang membacanya |
| 26 | `Admin.tsx:1549-1558` | "Status layanan" 99,98% / 99,91% / 99,72% | literal |
| 27 | `Admin.tsx:1262-1268` | "Periksa" (AdminPayments) | `navigate("/admin/withdrawals")` — salah tujuan; seharusnya detail pembayaran |
| 28 | `Auth.tsx:240-242` | "Masuk lewat WhatsApp" | `setErr("Masuk via WhatsApp belum tersedia…")` |
| 29 | `DashboardA.tsx:476-482` | "Simulasi gangguan" (Analitik) | toggle debug pengembang yang ikut ter-deploy |
| 30 | `DashboardA.tsx:281-303` | Checklist "Lengkapi toko Anda" | `useState([true,true,false,false])` — 2 langkah pertama ditandai selesai padahal belum tentu; tidak dibaca dari data; hilang saat refresh |

**Catatan khusus #29:** tombol "Simulasi gangguan" di halaman Analitik seller adalah sakelar debug yang sengaja memicu tampilan error. Ia berada di production, ditulis sangat kecil (`micro text-faint underline`) sehingga gampang tidak sengaja diklik seller — yang lalu mengira laporannya rusak. Ini harus dihapus, bukan diperbaiki.

---

### BUG-042 — Grafik omzet dashboard memakai sumbu tanggal hardcoded Jan–Feb

**Category:** Hardcoded (Fake date)
**Severity:** Low (dampak kepercayaan: Medium)
**Confidence:** Confirmed

**Location:** `src/pages/DashboardA.tsx:260`, `src/lib/data.tsx:155-158`

**Evidence:**
```ts
// src/lib/data.tsx:155-158
export const DAY_LABELS = [
  "14 Jan", "15", "16", ... "1 Feb", ... "12",
];
```
```tsx
// src/pages/DashboardA.tsx:258-262
<LineChart series={daily} labels={DAY_LABELS.slice(-30)} ... />
```
`daily` dihitung dari `orders` asli (baris 150-157), tetapi sumbu X selalu "14 Jan … 12". Jadi data hari ini dilabeli tanggal Januari. `Analytics` (baris 409) sudah benar karena membuat `labels` dari `dayKeys`.

**Recommended fix:**
Gunakan `dayKeys` seperti di `Analytics`; hapus `DAY_LABELS` dari `data.tsx` atau batasi pemakaiannya hanya untuk pratinjau landing.

---

### BUG-043 — Pengaturan "Halaman dilihat" identik dengan "Pengunjung"; label "WIB" pada grafik jam memakai zona waktu browser

**Category:** Functional / Data accuracy
**Severity:** Low
**Confidence:** Confirmed

**Location:** `src/pages/DashboardA.tsx:625-626`, `:604`, `:648`

**Evidence:**
```tsx
// src/pages/DashboardA.tsx:625-626
<StatCard label="Pengunjung"       value={angka(visits.length)} hint="kunjungan tercatat" ... />
<StatCard label="Halaman dilihat"  value={angka(visits.length)} hint={`${topPaths.length} halaman berbeda`} ... />
```
Dua metrik berbeda, angka yang sama persis. Beacon hanya mencatat **satu** kunjungan per sesi per toko (`Storefront.tsx:1336-1347`, guard `sessionStorage`), jadi pageview tidak pernah direkam.
```tsx
// src/pages/DashboardA.tsx:648
<ChartFrame title="Pesanan per jam" hint="Jam order masuk (WIB)">
  ... orders.filter((o) => new Date(o.created_at).getHours() === h)
```
`getHours()` memakai zona waktu **browser seller**, bukan WIB. Seller di luar WIB (atau HP dengan zona salah) melihat jam yang bergeser. Kontras: `StoreHome` menghitung badge buka/tutup dengan benar memakai `timeZone: "Asia/Jakarta"` (`Storefront.tsx:~500`), jadi pola yang benar sudah ada di codebase.

**Recommended fix:**
Hapus kartu "Halaman dilihat" atau catat pageview terpisah. Konversi jam dengan `toLocaleString("en-US", { timeZone: "Asia/Jakarta" })` seperti di storefront.

---

### BUG-044 — Nilai bawaan contoh tersimpan ke profil seller nyata

**Category:** Hardcoded / Data pollution
**Severity:** Low
**Confidence:** Confirmed

**Location:** `src/pages/DashboardB.tsx:2071-2078`, `:2078-2085`

**Evidence:**
```ts
// src/pages/DashboardB.tsx:2071-2078
const [f, setF] = useState({
  ...
  bio: "Masakan rumahan dan bumbu jadi, dimasak pagi hari dikirim siang.",
  address: "Jl. Cihampelas No. 28, Bandung 40131",
});
```
`save()` menulis apa pun yang ada di `f`:
```ts
// src/pages/DashboardB.tsx:2080-2084
bio: f.bio.trim() || null,
address: f.address.trim() || null,
```
Seller yang membuka Pengaturan Toko dan menekan "Simpan perubahan" tanpa menyunting apa-apa akan menyimpan **deskripsi dan alamat contoh** ke profilnya. Alamat "Jl. Cihampelas No. 28, Bandung" lantas tampil di tokonya.

**Recommended fix:**
Inisialisasi `bio`/`address` dengan string kosong dan biarkan placeholder yang memberi contoh (atribut `placeholder`, bukan `value`).

---

### BUG-045 — Badge angka di navigasi admin hardcoded (2 dan 1)

**Category:** Hardcoded UI
**Severity:** Low
**Confidence:** Confirmed

**Location:** `src/components/layout.tsx:70-71`

**Evidence:**
```ts
{ label: "Permintaan Premium", to: "/admin/premium",   icon: "star",   badge: 2 },
{ label: "Penarikan dana",     to: "/admin/withdrawals", icon: "wallet", badge: 1 },
```
Ironisnya, `AppShell` **sudah** menghitung badge Pesanan secara live (`layout.tsx:~175-192`) dan badge notifikasi secara live — jadi pola yang benar ada, tinggal tidak diterapkan di sini. Dokumen internal `.opencode/skill/ui-interaction-patterns/SKILL.md` bahkan secara eksplisit memperingatkan: *"Contoh yang sudah terjadi: … badge keranjang bohong … Jangan ulangi."*

**Impact:**
Admin melihat "2 permintaan premium" yang selalu 2, berapa pun kenyataannya → bisa mengabaikan antrean nyata.

**Recommended fix:**
Ambil jumlah `premium_requests`/`withdrawals` berstatus `menunggu` bersamaan dengan penghitungan badge Pesanan yang sudah ada.

---

### BUG-046 — Filter dan paginasi palsu

**Category:** Dead UI
**Severity:** Low
**Confidence:** Confirmed

**Location:**
- `src/pages/DashboardA.tsx:1613-1617` — "Halaman 1 dari 1" pada tabel Pesanan (tidak ada paginasi; semua order ditarik sekaligus)
- `src/pages/Admin.tsx:1177` — `.limit(200)` tanpa indikator pemotongan (lihat BUG-026)
- `src/pages/DashboardA.tsx:1543-1555` — tab "Refund" memetakan ke `orders.status='batal'`; tidak ada fitur refund (lihat BUG-035)
- `src/pages/Landing.tsx:746-760` — tombol periode "7 hari / 30 hari / Tahun ini" tidak mengubah data

**Recommended fix:**
Terapkan paginasi nyata atau hapus teks "Halaman 1 dari 1". Ganti label tab "Refund" menjadi "Dibatalkan" sampai fitur refund benar-benar ada.

---

### BUG-047 — Nomor dukungan WhatsApp dan alamat email pengirim palsu

**Category:** Hardcoded
**Severity:** Low
**Confidence:** Confirmed

**Location:** `src/pages/Auth.tsx:508`, `:497`

**Evidence:**
```tsx
// src/pages/Auth.tsx:508
Tidak menerima email setelah 5 menit? Hubungi WhatsApp 0812-0000-0000.
```
```tsx
// src/pages/Auth.tsx:496-497
dan folder spam. Tautan reset ada di email dari <span className="font-bold">halo@tokolink.store</span>.
```
`0812-0000-0000` jelas nomor contoh. Pengirim `halo@tokolink.store` bergantung pada konfigurasi SMTP Supabase (bawaan Supabase adalah `noreply@<project>.supabase.co`) — kemungkinan besar klaim ini salah, sehingga pembeli mencari email yang tidak pernah datang dari alamat itu.

**Recommended fix:**
Ganti dengan kanal dukungan nyata atau hapus. Verifikasi konfigurasi SMTP, lalu samakan teks dengan pengirim sebenarnya.

---

### BUG-048 — `api/_lib.ts` adalah kode mati; helper diduplikasi di 3 endpoint

**Category:** Code quality / Maintainability
**Severity:** Low (Informational)
**Confidence:** Confirmed

**Location:** `api/_lib.ts` (seluruh file)

**Evidence:**
`_lib.ts` mengekspor `adminDb`, `verifyAuthOptional`, `rateLimit`, `clientIp`, `newOrderId`, `json` — **tidak ada satu pun yang diimpor** oleh `create-order.ts`, `buatqris-webhook.ts`, `admin-users.ts`, maupun `delete-account.ts`. Alasannya ada di komentar `create-order.ts:4-6`: *"function di /api HARUS … SELF-CONTAINED (tanpa import relatif — resolver ESM Vercel gagal memuat './_lib')"*.

Akibatnya tiga implementasi rate limit terpisah (`_lib.ts:34`, `create-order.ts:30-38`, `webhook.ts:35-43`) dengan ambang berbeda (30/30/60) — semuanya dengan cacat yang sama (BUG-016). `newOrderId()` diduplikasi.

Dampak praktis: siapa pun yang kelak memperbaiki rate limit di `_lib.ts` akan mengira masalahnya selesai, padahal production memakai salinan lain. Ini jebakan pemeliharaan.

**Recommended fix:**
Hapus `_lib.ts`, atau perbaiki konfigurasi bundling Vercel (`includeFiles` / `outputFileTracingIncludes`) sehingga import relatif bekerja, lalu satukan.

---

### BUG-049 — Ruang ID pesanan hanya 9.000 per bulan dengan 3 kali percobaan

**Category:** Reliability
**Severity:** Low
**Confidence:** Confirmed

**Location:** `api/_lib.ts:51-57`, `api/create-order.ts:16-22`, `:123-145`

**Evidence:**
```ts
const rand = Math.floor(1000 + Math.random() * 9000);   // 1000–9999
return `TL-${yy}${mm}-${rand}`;
```
Format `TL-YYMM-XXXX` → 9.000 kemungkinan per bulan. Loop hanya 3 percobaan (`create-order.ts:123`). Dengan paradoks ulang tahun, probabilitas tabrakan melewati 50% sekitar 110 order/bulan; pada 500 order/bulan, peluang 3 percobaan berturut-turut gagal bukanlah hal yang mustahil, dan saat itu terjadi `create-order` mengembalikan 500 "Gagal membuat pesanan" walaupun data pembeli valid.

Catatan: karena ID dapat ditebak, `orders.id` **bukan** rahasia — rahasia sebenarnya adalah `access_token` (UUID), dan `track_order` memang mewajibkan keduanya. Jadi ini masalah ketersediaan, bukan keamanan.

**Recommended fix:**
Perpanjang menjadi 6 karakter acak (`crypto.randomInt`) atau pakai pendekatan "cari celah terkecil" di query; tingkatkan percobaan ke 10.

---

### BUG-050 — File `schema.sql` ganda (root dan `database/`) tanpa penanda usang

**Category:** Maintainability / Operational risk
**Severity:** Low
**Confidence:** Confirmed

**Location:** `schema.sql` dan `database/schema.sql`

**Evidence:**
```bash
$ diff schema.sql database/schema.sql   # → identik
```
`AGENTS.md` memerintahkan: *"Baca `schema.sql` untuk nama tabel/kolom yang benar"*, sedangkan `.opencode/TASKS.md` merujuk `database/schema.sql`. Keduanya identik hari ini, dan `.opencode/TASKS.md` mencatat keputusan user 1 Okt 2026 bahwa `database/schema.sql` adalah lokasi yang benar — tetapi file root tidak dihapus.

**Impact:**
Risiko operasional tinggi: bila kelak hanya satu yang diperbarui, agen atau manusia dapat menjalankan versi usang ke SQL Editor — terutama berbahaya untuk file yang berisi policy RLS, seperti perbaikan BUG-001/002/003 nanti.

**Recommended fix:**
Hapus `schema.sql` di root, atau jadikan ia sebuah `NOTICE`/symlink yang berisi penunjuk ke `database/schema.sql`.

---

### BUG-051 — Katalog kota: 116 entri dan dua daftar kota yang berbeda antara checkout dan pengaturan

**Category:** Functional / UX
**Severity:** Low
**Confidence:** Confirmed

**Location:** `src/lib/cities.ts` (116 kota), `src/pages/Storefront.tsx:1546-1560` (CityCombobox), `src/pages/DashboardB.tsx:2165-2171` (Select kota)

**Evidence:**
Checkout memakai combobox yang bisa mencari dari 116 kota dan mengizinkan ketikan bebas ("Tidak ketemu — ketikanmu tetap dipakai"). Tetapi Pengaturan Toko memakai dropdown keras:
```tsx
// src/pages/DashboardB.tsx:2167-2170
<option value="">Pilih kota…</option>
{["Bandung", "Cimahi", "Jakarta Selatan", "Surabaya", "Yogyakarta"].map((c) => (
```
Seller yang berada di kota lain **tidak dapat memilih kotanya sendiri** di profil toko, padahal checkout pembeli mendukung 116 kota.

**Recommended fix:**
Pakai `CITIES` yang sama di kedua tempat (dan tambahkan kota/kabupaten yang masih kurang dari 514 kabupaten/kota Indonesia).

---

### BUG-052 — Halaman "Syarat & Privasi" menyatakan dirinya draf yang belum ditinjau hukum, tetapi ditautkan dari setiap toko

**Category:** Legal / Trust
**Severity:** Low
**Confidence:** Confirmed

**Location:** `src/pages/Storefront.tsx:288-306` (`LegalPrivacy`), `Storefront.tsx:~150` (footer "Syarat & privasi")

**Evidence:**
```tsx
// src/pages/Storefront.tsx:293-295
Draf awal — belum ditinjau tim hukum. Tolong perbarui sebelum dipakai sebagai
dokumen resmi ke pengguna.
```
Kalimat pengantar internal ini ditampilkan **kepada pembeli**, di halaman yang ditautkan dari footer setiap toko. Isinya juga menyatakan "Data pembayaran diproses oleh penyedia QRIS (BuatQris), TokoLink tidak menyimpan detail kartu/rekening kamu" — sementara TokoLink justru **menyimpan nomor rekening bank lengkap** seller (BUG-009), walau bukan milik pembeli.

**Recommended fix:**
Selesaikan peninjauan hukum sebelum dipublikasikan, atau sembunyikan halaman ini sampai siap.

---

### BUG-053 — Keranjang dan promo dapat dipakai lintas toko, lalu ditolak di akhir

**Category:** UX / Business Logic
**Severity:** Low
**Confidence:** Confirmed

**Location:** `src/lib/data.tsx:326-374` (keranjang global), `src/pages/Storefront.tsx:1592-1597`

**Evidence:**
Keranjang adalah satu state global tanpa kaitan toko (`AppProvider`, `data.tsx:326-374`). Pembeli dapat menambah produk dari Toko A, membuka Toko B, menambah produk lagi — badge keranjang menjumlahkan keduanya. Penolakan baru terjadi di checkout:
```ts
// src/pages/Storefront.tsx:1592-1597
const sellerIds = [...new Set(items.map((i) => i.sellerId))];
if (sellerIds.length > 1) {
  toast("Keranjang berisi produk beda toko. Selesaikan satu toko dulu.", "bad");
  return;
}
```
Lebih buruk: halaman Keranjang hanya memakai `items[0].sellerId` untuk menampilkan nama toko dan tautan "Tambah produk lain" (`Storefront.tsx:1369-1377`), jadi keranjang multi-toko **tampak** seperti milik satu toko.

**Recommended fix:**
Pisahkan keranjang per `seller_id`, atau konfirmasi saat pembeli menambah produk dari toko berbeda ("Keranjang akan dikosongkan karena Anda pindah toko").

---

### BUG-054 — Bundel single-file ~938 kB tanpa pemecahan kode; font dimuat berlebihan

**Category:** Performance
**Severity:** Low
**Confidence:** Confirmed (build) / Likely (dampak)

**Location:** `vite.config.ts:11` (`viteSingleFile()`), `index.html:19-21`

**Evidence:**
```ts
// vite.config.ts:11
plugins: [react(), tailwindcss(), viteSingleFile()],
```
`vite-plugin-singlefile` menggabungkan seluruh JS+CSS ke satu `index.html`. `docs/THEME_ENGINE.md` §8 mencatat hasil build **938 kB (246 kB gzip)** — dan itu sebelum 8 tema selesai; dengan semua tema + `qrcode` + `supabase-js` sekarang, ukurannya pasti lebih besar. Semua halaman (landing, storefront, dashboard seller, admin) termuat dalam satu berkas, jadi pembeli yang hanya ingin melihat toko tetap mengunduh seluruh dashboard dan admin.

`index.html:19-21` memuat **9 keluarga font** (Archivo, Bricolage Grotesque, Chakra Petch, Fraunces, IBM Plex Mono, IBM Plex Sans, Instrument Serif, Newsreader, Plus Jakarta Sans, Space Grotesk) dari Google Fonts dengan `display=swap`, ditambah 2 `preconnect`. Itu 3 permintaan pemblokiran render sebelum huruf pertama tampil.

**Impact:**
Pada HP low-end dengan koneksi 3G — profil mayoritas pengguna TokoLink — waktu muat pertama akan terasa lama, dan itu langsung menurunkan konversi toko.

**Recommended fix:**
Hapus `viteSingleFile()` dan biarkan Vite memecah kode; lazy-load rute dashboard/admin dengan `React.lazy`. Kurangi font ke 2–3 keluarga yang benar-benar dipakai, dan self-host ketimbang memuat dari Google Fonts.

---

## Informational

1. **Tidak ada XSS yang terkonfirmasi.** Nol penggunaan `dangerouslySetInnerHTML`/`innerHTML`/`eval` di `src/`; React meng-escape secara bawaan; tautan bio selalu dipaksa berawalan `https://` (`Storefront.tsx:474`). CSP (BUG-036) tetap disarankan sebagai pertahanan berlapis.
2. **Verifikasi webhook BuatQris sudah cukup baik.** HMAC SHA-256 atas raw body dengan `timingSafeEqual` (`buatqris-webhook.ts:50-55`) dan klaim status bersyarat untuk dedup (baris 97-103) adalah implementasi yang benar. Yang kurang: rekonsiliasi nominal dan atomisitas (BUG-019).
3. **Dedup webhook tahan race.** Pola `update ... where status='menunggu' returning id` benar-benar mencegah kredit ganda di bawah konkurensi — ini sering salah di aplikasi sejenis.
4. **Pola optimistic-update pada toggle sudah benar** di `Discount.setActive`, `BioLinks`, `StoreSettings` — UI berubah dulu, rollback + toast bila gagal, sesuai `.opencode/skill/ui-interaction-patterns/SKILL.md`.
5. **Masking nama pembeli di `track_order`** (`substring(buyer_name from 1 for 1) || '***'`) adalah keputusan privasi yang tepat.
6. **Tidak ada proteksi CSRF yang diperlukan pada API** karena semua endpoint memakai header `Authorization: Bearer` yang tidak dapat dikirim lintas-origin tanpa CORS; dan tidak ada CORS header yang dipasang (bagus).
7. **Folder `Hasil_Audit_cyber/` sebelumnya tidak ada** — laporan ini adalah versi pertama, jadi tidak ada cadangan lama yang perlu dipertahankan.

---

## Functional Bugs

Ringkasan terpusat (detail ada di masing-masing BUG):

| ID | Gejala yang terlihat pengguna |
|---|---|
| BUG-010 | "Total bayar" di checkout ≠ nominal di QRIS; promo gratis-ongkir tidak berlaku |
| BUG-011 | Stok tidak pernah berkurang; "Terjual" selalu 0; landing mengklaim sebaliknya |
| BUG-012 | Status pembayaran tidak pernah menampilkan "lunas"; order batal tampak selesai |
| BUG-013 | Tombol "Batalkan pesanan" tidak membatalkan |
| BUG-023 | Tautan bio hilang di 7/8 tema |
| BUG-024 | "Tutup toko" tidak berlaku di 6/8 tema |
| BUG-027 | Garis waktu pelacakan memakai satu cap waktu untuk semua langkah |
| BUG-029 | Checkout menjadi layar kosong bila produk gagal dimuat |
| BUG-034 | Pilihan kurir tidak mengubah harga; "Transfer bank" ditolak di akhir |
| BUG-035 | Pembatalan order mengklaim refund padahal tidak ada |
| BUG-041 | 30 tombol/field mati (tabel lengkap di atas) |
| BUG-043 | "Halaman dilihat" = "Pengunjung"; label "WIB" memakai zona browser |
| BUG-044 | Bio & alamat contoh tersimpan ke profil seller nyata |
| BUG-046 | Paginasi palsu; tab "Refund" tidak ada fiturnya |
| BUG-049 | `create-order` bisa gagal 500 karena tabrakan ID pada volume tinggi |
| BUG-053 | Keranjang lintas toko baru ditolak di langkah terakhir |

---

## Hardcoded / Dead UI

**Data palsu yang ditampilkan sebagai data nyata:**

| Lokasi | Nilai |
|---|---|
| `Storefront.tsx:~640` | Badge "Premium" di semua toko |
| `DashboardB.tsx:2229-2234` | Kartu "Premium · Rp59.000/bln · Perpanjang otomatis 12 Mar 2025" |
| `Landing.tsx:287-289` | 4.820 toko aktif · Rp12,8 M · 10 menit |
| `Landing.tsx:630-633` | 62% · 3,8% · 2 hari · 0,7% |
| `Landing.tsx:756-764` | Rp38.420.000 · 142 · 2.390 (+18,4%/+11,2%/+26,7%) |
| `Landing.tsx:772` | "Diperbarui 12 Feb 2025, 09:44 · Sumber: TokoLink Analytics" |
| `Admin.tsx:1527-1532` | Log audit: Dwi Handoko, Sari Utami, PRM-0089, SLR-0127 |
| `Admin.tsx:1549-1558` | Uptime 99,98% / 99,91% / 99,72% |
| `Admin.tsx:70-71` | Badge navigasi: Premium 2, Penarikan 1 |
| `DashboardB.tsx:1939-1985` | 405 pemindaian; grafik QR 218/96/64 |
| `DashboardA.tsx:281-303` | Checklist dengan 2 dari 4 langkah sudah "selesai" |
| `DashboardA.tsx:260` | Sumbu tanggal grafik: "14 Jan … 12" |
| `DashboardA.tsx:1613-1617` | "Halaman 1 dari 1" |
| `DashboardB.tsx:1811-1816` | "Toko sedang buka · Sampai 20.00 WIB" |
| `Storefront.tsx:1006` | Galeri 3 foto dari 1 berkas gambar |
| `Storefront.tsx:1361-1364` | Ongkir Rp18.000/Rp10.000 · "Bandung hari ini" · "diganti penuh" |
| `Storefront.tsx:1819` | "Ambil sendiri — Jl. Cihampelas No. 28" |
| `Storefront.tsx:1849` | Kode pos 40131 |
| `Storefront.tsx:2399` | "Balas chat ≤ 10 menit" |
| `Storefront.tsx:~680` | "Pesanan sebelum 15.00 dikirim hari ini juga." |
| `Auth.tsx:508` | WhatsApp dukungan 0812-0000-0000 |
| `DashboardA.tsx:1543` | "3 pesanan perlu diproses hari ini." (deskripsi halaman Pesanan) |
| `Admin.tsx:~178` | "Data diperbarui tiap 5 menit." (tidak ada pembaruan otomatis) |

**Fitur yang infrastrukturnya ada di database tetapi tidak pernah dipakai kode:**
- `audit_log` + RPC `log_admin_action` — tidak pernah dipanggil (BUG-008)
- Tabel `broadcasts` + policy segmen — tidak ada UI maupun query
- Tabel `settings` — hanya dibaca oleh webhook untuk `platform_fee_percent`; tidak ada UI Admin
- `store_theme.show_reviews` — ada toggle di dashboard, tidak dibaca storefront mana pun
- `products.weight_gram` — ada di formulir, tidak pernah dipakai untuk menghitung ongkir
- `api/_lib.ts` — seluruh modul tidak terpakai (BUG-048)

---

## Business Logic Issues

1. **Uang dapat dicetak dan ditarik** (BUG-002 + BUG-003). Tidak ada otoritas server atas saldo.
2. **Ongkos kirim tidak pernah masuk transaksi** (BUG-010).
3. **Stok tidak dikelola** padahal diiklankan (BUG-011).
4. **Pembatalan ≠ pengembalian dana**, tetapi UI menyatakan sebaliknya (BUG-035, BUG-013).
5. **Kuota promo dapat dilampaui** lewat race (BUG-014).
6. **Order dapat dibuat untuk seller mana pun** tanpa batasan (BUG-015).
7. **Diskon persen > 100%** lolos sampai ke database (BUG-020).
8. **Nilai pembayaran tidak direkonsiliasi** dengan yang diminta (BUG-019).
9. **Status order adalah state machine tanpa penjaga**: webhook dapat menurunkan status; seller dapat melompat ke status apa pun (BUG-005, BUG-019).
10. **Transisi status tidak konsisten** antara pembeli dan seller: `dikemas` berarti "sudah bayar" bagi pembeli dan "siap kirim" bagi seller — akar BUG-012.
11. **Penghapusan akun menghancurkan kewajiban yang belum selesai** (BUG-022).
12. **Penangguhan akun tidak berdampak apa-apa** (BUG-006).
13. **Premium dapat diaktifkan sendiri** (BUG-007).
14. **Keranjang bersifat global lintas toko** (BUG-053).

---

## Security Findings

**Ringkasan matriks RLS per tabel** (verified dari `database/schema.sql` + 16 migrasi):

| Tabel | RLS | SELECT | INSERT | UPDATE | DELETE | Catatan |
|---|---|---|---|---|---|---|
| `profiles` | ✅ | **anon semua baris** | self | **self, semua kolom** | — | 🔴 BUG-001, 004, 006, 007 |
| `products` | ✅ | anon (semua toko) | self | self | self | 🟠 BUG-018; lintas-toko terbaca |
| `orders` | ✅ | self/admin | self | **self, kolom apa pun** | self | 🟠 BUG-005 |
| `order_items` | ✅ | via orders | via orders | via orders | via orders | 🟠 BUG-005 |
| `payments` | ✅ | self/admin | self | **self** | **self** | 🔴 BUG-005 |
| `ledger` | ✅ | self/admin | **self → cetak saldo** | self | self | 🔴 BUG-002 |
| `withdrawals` | ✅ | self/admin | **self, nominal bebas** | **self → setujui sendiri** | self | 🔴 BUG-003 |
| `bio_links` | ✅ | self/admin | self | self | self | wajar |
| `discount_codes` | ✅ | **anon semua toko** | self | self | self | 🟠 BUG-018, 020 |
| `store_hours` | ✅ | self/admin | self | self | self | wajar |
| `premium_requests` | ✅ | self/admin | self | self | self | 🟠 BUG-007 (plan di profiles) |
| `store_theme` | ✅ | **anon** | self | self | self | wajar |
| `store_visits` | ✅ | self/admin | **anon (seller mana pun)** | self | self | 🟠 BUG-017 |
| `audit_log` | ✅ | admin | RPC only | — | — | ⚫ RPC tidak pernah dipanggil (BUG-008) |
| `broadcasts` | ✅ | segmen | admin | admin | admin | ⚫ tidak pernah dipakai |
| `settings` | ✅ | **anon** | admin | admin | admin | 🟠 konfigurasi internal terbaca publik |

**Akar masalah tunggal:** policy `for all using (<owner>) with check (<owner>)` dipakai di 11 tabel. Ia menjawab *"baris siapa?"* tetapi tidak pernah menjawab *"kolom apa?"* maupun *"nilai yang masuk akal?"*. Semua temuan Critical dan High di atas berasal dari satu pola ini.

**Temuan lain:** BUG-016 (bypass rate limit), BUG-017 (endpoint anon tanpa batas), BUG-028 (bocor pesan error), BUG-036 (nol header keamanan), BUG-037 (`/system` publik), BUG-040 (enumerasi akun, unverified).

**Tidak ditemukan (dinyatakan PASS):** SQL injection (semua akses lewat PostgREST terparameterisasi; tidak ada `.rpc()` dengan SQL mentah dari input pengguna), XSS, CSRF pada endpoint ber-token, SSRF (tidak ada fetch yang menerima URL dari pengguna), path traversal, prototype pollution, penggunaan `innerHTML`, kebocoran service-role key ke frontend (`grep` tidak menemukan `SERVICE_ROLE` di `src/`; hanya di `api/`), open redirect (tautan bio selalu dipaksa `https://`).

---

## Theme Audit

Diuji dengan skrip yang memeriksa **setiap** prop kontrak (`src/storefront/types.ts`) terhadap kedelapan berkas tema.

| Fitur | 01 Ruang Seduh | 02 Pasar Rapi | 03 Lugas Jasa | 04 Atelier | 05 Dapur Hari Ini | 06 Kriya Nusantara | 07 Pixel Goods | 08 Studio Tenang |
|---|---|---|---|---|---|---|---|---|
| Profil & bio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tautan bio** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kategori (chip) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pencarian | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reset filter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Harga | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Stok (cap HABIS) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tambah ke keranjang | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bilah keranjang | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Hormati "toko tutup"** (`is_closed`) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Badge buka/tutup | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Panel jam lengkap (`hourRows`) | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **QR toko** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CTA WhatsApp | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Foto sampul (`coverUrl`) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Logo/avatar | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Warna aksen seller | ❌* | ❌* | ❌* | ❌* | ❌* | ❌* | ❌* | ❌* |
| Responsif (grid menumpuk) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

\* Tidak diterapkan di semua tema — ini **disengaja** dan terdokumentasi (`docs/THEME_ENGINE.md` §11); bukan temuan.

**Temuan tema:**
- 🔴 **BUG-023** — tautan bio hilang di 7/8 tema. Fitur inti produk lenyap.
- 🔴 **BUG-024** — `is_closed` diabaikan di 6/8 tema.
- 🟠 **QR toko hilang di 6/8 tema** — `showQR` tidak berpengaruh; `qrData`/`onOpenQR` hanya dipakai `ruang-seduh` dan `pasar-rapi`. Seller yang sudah mencetak QR tidak punya cara menampilkannya di toko.
- 🟡 **Panel jam lengkap hilang di 3 tema** (Pasar Rapi, Dapur Hari Ini, Pixel Goods) — ketiganya masih menampilkan badge buka/tutup, jadi tidak separah temuan di atas, tetapi pengaturan "tampilkan jam" kehilangan sebagian isinya.
- 🟡 **Foto sampul hanya dipakai Ruang Seduh** — seller yang mengunggah sampul (fitur yang diiklankan: "Pilih warna tema … sampai foto sampul") tidak melihatnya di 7 tema.
- 🟡 **Afirmasi tombol beli sangat lemah di 2 tema:**
  - `kriya-nusantara.tsx:157` — tombol tambah hanya berupa teks harga + tanda plus (`{rupiah(item.price)} +`). Tidak ada pembeli awam yang akan menebak bahwa teks harga itu tombol.
  - `atelier.tsx:54-59` — tombol "Tambah" berupa teks kapital 9,5 px dengan jarak huruf lebar. Di HP, target sentuhnya jauh di bawah 44×44 px yang direkomendasikan, dan secara visual tampak seperti label keterangan, bukan tombol.
- ✅ **Tidak ada data contoh di berkas tema.** Pemeriksaan `grep` untuk pola `Rp<angka>`, "contoh", "Lorem", "dummy", "4,9", "ulasan" hanya menemukan komentar dan atribut `placeholder` — isi tema murni dari props. Ini **bersih** dan patut diapresiasi.
- ✅ Semua tema memakai satu alur beli (`onAdd` → `/cart` → checkout QRIS). Tidak ada tema yang mengalihkan order ke WhatsApp, sesuai aturan di `src/storefront/types.ts:6-11`.

**Catatan verifikasi:** `docs/THEME_ENGINE.md` §9 menyatakan *"Belum diuji dengan browser sungguhan"* dan §10 *"Wajib cek manual 375px & 1440px oleh user"*. Audit ini memeriksa secara statis (struktur kelas Tailwind responsif sudah dipakai konsisten, tidak ada lebar tetap ≥1024 px) tetapi **belum menggantikan** pengujian perangkat nyata. Responsif tema: **Unverified — perlu pengujian manual.**

---

## Buyer/UX Audit

Bertindak sebagai pembeli awam yang pertama kali membuka `tokolink.store/s/{slug}` dari tautan WhatsApp.

### Yang berhasil ✅
- Halaman toko langsung memberi tahu **apa yang dijual**: foto produk, nama, harga, dan kategori terlihat tanpa menggulir.
- Harga jelas dan konsisten memakai format rupiah Indonesia.
- Status stok jujur: cap "Stok habis" dan badge "sisa N" (walau stok tidak benar-benar dikelola, lihat BUG-011).
- Badge buka/tutup dihitung dengan benar terhadap zona WIB — detail yang sering salah di aplikasi lokal.
- Ikon tautan bio otomatis sesuai jenis URL (WhatsApp/Instagram/TikTok/dll.) — sentuhan yang bagus.

### Kritik tajam ❌

**1. Tombol utama toko tidak melakukan apa-apa.**
Dua tombol terbesar di bawah nama toko adalah **"Chat WhatsApp"** (hijau, menonjol) dan **"QR toko"**. Yang pertama adalah CTA paling wajar bagi pembeli Indonesia — dan ia **hanya memunculkan toast**. Tidak ada `wa.me`, tidak ada perpindahan halaman. Pembeli mengetuk, melihat "Membuka chat WhatsApp 0812…", menunggu, lalu menyadari tidak terjadi apa-apa. Ini bukan bug kecil: ini adalah satu-satunya jalur "tanya stok" yang dijanjikan landing page, dan ia mati. (BUG-031)

**2. "Bagikan" mengaku menyalin tautan, tetapi tidak.**
Tombol "Bagikan" di sampul menampilkan toast **"Tautan toko disalin: tokolink.store/s/…"**. Tidak ada pemanggilan clipboard. Pembeli menempel ke WhatsApp, yang muncul adalah sesuatu yang lain. Ironisnya, tombol "Salin tautan" **di dalam modal QR** bekerja dengan benar — jadi dua tombol "salin" di satu halaman, satu nyata satu palsu. (BUG-032)

**3. Redundansi CTA WhatsApp yang membingungkan hierarchy.**
Di halaman **produk** ada WhatsApp di tiga tempat sekaligus: tombol "Pesan via WhatsApp" di samping "Tambah ke keranjang" (desktop), ikon WA di bilah lengket bawah (mobile), dan — pada tema tertentu — tautan WA di blok tautan bio. Ketiganya memiliki **hierarki visual yang sama kuat** dengan tombol beli. Untuk produk link-in-bio, itu berarti dua CTA yang bersaing di posisi paling mahal: "beli sekarang" vs "tanya dulu". Sebagian besar pembeli akan memilih yang lebih dulu dikenali (WA), yang ternyata adalah jalan buntu (poin 1). CTA utama seharusnya tunggal: **tambah ke keranjang**.

**4. Harga di layar bukan harga yang dibayar.**
Ringkasan pesanan menampilkan "Subtotal", "Diskon", "Ongkos kirim", lalu **"Total bayar"** dengan angka besar. Pembeli memilih "GoSend instan Rp18.000" dan melihat total bertambah — lalu QRIS menagih jumlah tanpa ongkir itu. Dua angka berbeda untuk satu transaksi adalah pembunuh kepercayaan nomor satu di e-commerce Indonesia. (BUG-010, BUG-034)

**5. Layar pembayaran tidak pernah mengatakan "berhasil".**
Setelah memindai QRIS dan uang benar-benar berpindah, halaman tetap menampilkan spinner dan teks **"Sedang mengonfirmasi ke bank…"** — bisa berhari-hari, sampai seller sempat menandai pesanan selesai secara manual. Momen yang seharusnya menjadi konfirmasi paling melegankan justru menjadi momen kecemasan. Sebaliknya, saat pembayaran **kadaluarsa**, keempat langkah progres ditampilkan selesai semua seolah pesanan dikirim. (BUG-012)

**6. "Batalkan pesanan" yang tidak membatalkan.**
Dialognya jujur soal refund ("tidak bisa dikembalikan otomatis"), tetapi tombol "Ya, batalkan" hanya menampilkan toast lalu mengembalikan pembeli ke halaman toko. Order tetap hidup. Bila pembeli sudah terlanjur memindai QR, ia tetap membayar untuk pesanan yang ia yakini dibatalkan. (BUG-013)

**7. Galeri produk yang memperdaya.**
Tiga thumbnail berlabel 01/02/03, semuanya foto yang sama dipotong berbeda. Pembeli menggeser dan melihat gambar identik → kesan "toko ini asal-asalan". (BUG-038)

**8. Janji yang dibuat platform atas nama seller.**
"Pesanan sebelum 15.00 dikirim hari ini juga." — muncul di **setiap** toko, terlepas dari jam operasional maupun kesiapan seller. "Bandung hari ini · luar kota 2–3 hari" muncul meski seller berada di Surabaya. "Barang rusak atau salah kirim diganti penuh" adalah kewajiban hukum yang dipasang TokoLink untuk seller tanpa sepengetahuannya. Opsi "Ambil sendiri di toko — Jl. Cihampelas No. 28" menampilkan alamat **contoh** seolah alamat toko asli. (BUG-033)

**9. Badge "Premium" di semua toko.**
Sinyal kepercayaan yang seharusnya berarti sesuatu, dipasang mati di setiap toko. Pembeli tidak bisa membedakan toko terverifikasi dari toko baru. (BUG-030)

**10. Bilah lengket mobile mengganggu.**
Di storefront klasik, tombol "Lihat keranjang" melayang di `bottom: calc(5rem + safe-area)` dan tombol "Tambah · Rp…" menempel di `bottom: 0` pada halaman produk. Keduanya bertumpuk di ruang yang sama pada layar pendek, dan tombol "Tambah" menutupi baris produk terakhir. Dua bilah lengket sekaligus adalah satu terlalu banyak.

**11. Tidak ada konfirmasi "produk ditambahkan" yang terlihat jelas.**
`setelah add()` hanya ada toast kecil di pojok. Untuk pembeli yang menekan "+" berulang-ulang pada beberapa produk, tidak ada indikator jumlah di dekat tombol — satu-satunya umpan balik adalah badge keranjang di pojok kanan atas, di luar jangkauan ibu jari (dan di HP posisinya bertolak belakang dengan tombol yang baru ditekan).

**12. Keranjang terasa "milik toko" padahal global.**
Saat keranjang berisi barang dari dua toko, halaman Keranjang hanya menampilkan nama satu toko dan tautan "Tambah produk lain" ke toko itu. Pembeli baru diberi tahu ada masalah setelah mengisi seluruh formulir pengiriman. (BUG-053)

**13. "Dibuat dengan TokoLink" + "Laporkan toko" di footer.**
Dua tautan ini, ditambah "Syarat & privasi" yang isinya mengaku *"Draf awal — belum ditinjau tim hukum"* (BUG-052), membongkar ke awam bahwa ini platform rakitan. Kalimat draf internal itu tidak boleh pernah melihat mata pembeli.

**Skor keseluruhan (skala 1–10):**

| Aspek | Skor | Catatan |
|---|---|---|
| Kejelasan (clarity) | 7 | Langsung paham apa yang dijual; harga & stok jelas |
| Kepercayaan (trust) | 3 | Badge Premium palsu, janji pengiriman palsu, kebocoran PII |
| Navigasi | 6 | Kategori & pencarian bekerja; stepper checkout rusak |
| Keterbacaan | 8 | Tipografi & hierarki visual sangat baik |
| CTA | 2 | Tombol terpenting mati; hierarchy kacau; CTA saling bersaing |
| Hierarki visual | 6 | Bagus di tingkat halaman, lemah di tingkat kartu produk |
| Konsistensi | 4 | Berbeda drastis antar-tema; fitur hilang tanpa peringatan |
| Mobile UX | 6 | Responsif secara teknis, tetapi bilah lengket bertumpuk |
| Checkout UX | 3 | Total tidak cocok, promo diabaikan, layar putih saat gagal |
| Keyakinan membeli | 2 | Tidak ada konfirmasi pembayaran; tidak ada jalur tanya-stok |

---

## Responsive Audit

**Metode:** inspeksi statis terhadap kelas Tailwind dan gaya sebaris — **bukan** pengujian perangkat nyata. Kode ini tidak dapat dijalankan di browser dari sandbox, jadi bagian ini **Verified secara struktur / Unverified secara visual**.

**Yang sudah benar (struktur):**
- Tema storefront memakai grid fluid (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, `grid-cols-1 lg:grid-cols-[...]`) yang menumpuk dengan benar.
- Tidak ada lebar tetap ≥1024 px. Lebar tetap terbesar: `lg:w-[356px]` (ruang-seduh), `lg:w-[264px]` (lugas-jasa), `max-w-[420px]` pada bilah bawah — semuanya di dalam breakpoint `lg:` atau dibatasi `max-w`, jadi aman.
- Tabel admin/seller dibungkus `TableWrap` (`overflow-x-auto`) dan punya versi kartu mobile (`sm:hidden`) untuk Pesanan. Pola yang benar.
- Modal memakai `max-w-sm`/`max-w-lg` dan konten dapat digulir.
- Bilah bawah mobile memperhitungkan `env(safe-area-inset-bottom)`.

**Risiko yang ditemukan secara statis:**
1. **Bilah lengket ganda di halaman produk** (desktop `hidden lg:flex` vs mobile `lg:hidden`) — aman, tetapi pada **tablet 768 px** kedua versi berada di bawah `lg`, jadi yang tampil hanya versi mobile; tombol "Pesan via WhatsApp" desktop hilang tanpa pengganti. Perlu verifikasi visual di 768 px.
2. **`Storefront.tsx:1843-1859`** — dua `Field` dalam `grid sm:grid-cols-2` pada 360 px akan menumpuk; `Select` bank + `Input` nomor rekening di `grid-cols-2` (`DashboardB.tsx:~440`) berpotensi memotong nomor rekening panjang pada 360 px.
3. **`Admin.tsx:1259-1266`** — tabel 8 kolom dengan `TableWrap`; pada 360 px akan menggeser horizontal cukup jauh (dapat diterima karena dibungkus, tetapi tombol aksi berada di kolom paling kanan dan butuh geser panjang).
4. **`Storefront.tsx:1024-1050`** — 3 thumbnail `w-20` + 2 celah `gap-2.5` = 260 px; aman di 360 px, tetapi rapat.
5. **`DashboardA.tsx` OrderDetail** — `TASKS.md` mencatat keluhan pengguna 1 Okt 2026 bahwa halaman ini tidak responsif di HP dan pengembang belum dapat mereproduksinya. Struktur grid/stacking tampak konsisten dengan halaman lain; **tanpa tangkapan layar dari perangkat nyata, ini tetap belum terpecahkan.** Disarankan pengujian langsung di 360 px.

**Status: butuh pengujian manual pada 360 / 375 / 390 / 430 / 768 / 1024 / 1440 px.** Tidak dapat diselesaikan dari sandbox ini.

---

## Performance Audit

| Masalah | Lokasi | Dampak |
|---|---|---|
| Polling 3 detik tanpa henti | `Storefront.tsx:1333` | ~20 req/menit per tab; tidak berhenti di status terminal (BUG-025) |
| Hitung mundur 1 detik | `Storefront.tsx:1965-1968` | 60 render/menit pada halaman QRIS |
| Query tanpa batas | `Admin.tsx:104-105`, `DashboardA.tsx:1384`, `DashboardB.tsx:52-86` | Seluruh tabel ditarik ke browser (BUG-026) |
| Bundel tunggal ~938 kB+ | `vite.config.ts:11` | Pembeli mengunduh dashboard + admin + 8 tema sekaligus (BUG-054) |
| 10 keluarga font eksternal | `index.html:19-21` | 3 permintaan pemblokiran render |
| `buildNotifications` berjalan di header | `layout.tsx:~188` | 3 query tambahan pada **setiap** perpindahan halaman seller |
| `countUnread` memanggil ulang `buildNotifications` | `notifications.ts:143-147` | Query sama dijalankan 2× per pemuatan halaman |
| Permintaan ganda `store_theme` | `Storefront.tsx:~380` dan `~395` | Dua query terpisah ke tabel yang sama (akibat pemisahan `theme_id` yang defensif — dapat disatukan bila migrasi sudah pasti dijalankan) |
| Tidak ada lazy loading gambar di luar tema | `Storefront.tsx:259` (ProductCard `loading="lazy"` ✅, tetapi `ProductDetail` galeri tidak) | Gambar besar dimuat lebih awal dari perlu |

**Tidak ditemukan:** tidak ada N+1 pada `order_items` (sudah memakai satu query `.in("order_id", ids)` — ini benar), dan `AdminHome` sudah memakai `Promise.all` untuk 7 query paralel (juga benar).

---

## Error Handling Audit

| Kondisi | Perilaku | Penilaian |
|---|---|---|
| Jaringan putus saat checkout | `items.length === 0 → return null` → **layar putih kosong** | 🔴 BUG-029 |
| Jaringan putus di daftar Pesanan | `<ErrorState onRetry={load} />` | ✅ Benar |
| Jaringan putus di Kode Promo | `setLoadError(error.message)` → menampilkan pesan Postgres mentah | 🔴 BUG-028 |
| Order tidak ditemukan | `EmptyState` + tombol kembali | ✅ Benar |
| Toko tidak ditemukan | `EmptyState` dengan slug yang dicari | ✅ Benar |
| Sesi kedaluwarsa | `RequireAuth` → `/login` | ✅ Benar |
| Bukan admin mengakses `/admin` | `RequireAdmin` → `/app` | ✅ Benar (tetapi bisa dilewati via BUG-001) |
| QRIS gagal dibuat | Pesan "QR belum jadi" + tombol kembali, order tetap tersimpan | 🟡 Sebagian — order menggantung tanpa bisa dibayar |
| Total di bawah Rp1.000 | 400 dengan pesan jelas | ✅ Benar |
| Kredensial BuatQris belum dipasang | 500 + `qr_pending: true` | 🟡 Pesan teknis, tetapi tidak bocor rahasia |
| Webhook tanpa tanda tangan | 401 tanpa isi | ✅ Benar |
| Event webhook tidak dikenal | 400 "Event tidak dikenal." | ✅ Benar |
| 404 rute | Halaman 404 kustom dengan tautan contoh toko | ✅ Baik |
| Server error pada `/api/*` | Pesan generik ("Gagal membuat pesanan.") | ✅ Tidak membocorkan stack trace |

**Tidak ada** stack trace, SQL, atau internal identifier yang sampai ke pengguna **kecuali** BUG-028.

---

## Attack Chains

### Rantai A — "Dari pendaftar gratis ke pencurian uang" (Critical)

```
Daftar akun seller gratis
      ↓  (BUG-001: policy profiles hanya mengecek id, bukan kolom)
UPDATE profiles SET role='admin' WHERE id=me
      ↓  (BUG-004: SELECT profiles using(true) → baca semua)
Baca seluruh seller: nama asli, nomor WA, alamat
      ↓  (BUG-002: INSERT ledger tanpa batas)
INSERT ledger (amount=+500.000.000, type='masuk') → saldo Rp500 juta
      ↓  (BUG-003: tidak ada validasi saldo di server)
Ajukan penarikan Rp500.000.000 ke rekening sendiri
      ↓  (BUG-001 lagi: sudah jadi admin)
Buka /admin/withdrawals → "Proses" → "Selesai"
      ↓  (BUG-009: nomor rekening ikut dikirim, jadi attacker juga punya data seller lain)
Dana cair. BUG-008 memastikan tidak ada jejak audit.
```
**Total kerugian potensial:** tidak terbatas. **Waktu tempuh:** < 5 menit. **Jejak:** nol.

### Rantai B — "Seller nakal menggandakan penarikan" (High)

```
Saldo Rp1.000.000
      ↓  (BUG-003b: tidak ada reserve dana; saldo UI tidak berkurang saat mengajukan)
Klik "Semua saldo" → ajukan penarikan Rp1.000.000
Ulangi 10× → 10 permintaan menunggu, total Rp10.000.000
      ↓  (BUG-003c: policy for all pada withdrawals)
UPDATE withdrawals SET status='selesai' WHERE seller_id=me
      ↓  (pemotongan saldo ada di kode browser admin, bukan trigger DB)
Saldo TETAP Rp1.000.000, tetapi 10 penarikan tercatat "Selesai"
      ↓  (BUG-008: tidak ada audit)
Admin melihat antrean kosong; tidak ada yang pernah memotong saldo
```

### Rantai C — "Phishing presisi dari PII yang bocor" (High)

```
BUG-004 → scrape profiles (nama asli + WA + kota + alamat)
      ↓  (kolom role juga terbaca)
Filter role='admin' → daftar target bernilai tinggi
      ↓
Kirim WA: "TokoLink: toko Anda akan dinonaktifkan karena verifikasi. Klik link."
      ↓  (korban login di halaman tiruan → attacker pegang JWT)
Gunakan JWT korban → BUG-001 → eskalasi ke admin (bila korban seller)
                            → atau langsung BUG-003 (tarik dana korban)
```

### Rantai D — "Order spam sebagai senjata" (Medium)

```
BUG-015 (seller_id dari client) + BUG-016 (bypass rate limit)
      ↓
Kirim 10.000 POST /api/create-order untuk toko target
dengan buyer_name/phone/address acak
      ↓
Dashboard seller dipenuhi order 'menunggu' bodong
Notifikasi "Pesanan baru" aktif terus (notifications.ts:64-75)
      ↓
Seller kehilangan kemampuan membedakan order nyata → order asli terlewat
Beban database & biaya BuatQris naik
```

### Rantai E — "Pembeli dirugikan tanpa sadar" (Medium, dampak reputasi)

```
BUG-010 (ongkir tidak pernah ditagih) + BUG-034 (pilihan kurir tidak berpengaruh)
      ↓
Pembeli memilih "GoSend instan Rp18.000", melihat Total bayar +Rp18.000
      ↓
Seller (yang tidak pernah menerima ongkir itu) mengirim lewat JNE reguler
      ↓
BUG-031 (tombol WA mati) → pembeli tidak punya cara menghubungi seller
      ↓
BUG-012 (tidak pernah ada konfirmasi "lunas") → pembeli mengira pembayarannya gagal
      ↓
Komplain, ulasan buruk, pembeli tidak pernah kembali
```

### Rantai F — Low + Low = Medium

```
BUG-006 (status ditangguhkan tidak ditegakkan)
   +  BUG-001 (seller bisa tulis kolom apa pun di profiles)
   =  Penangguhan akun sepenuhnya dapat dibatalkan sendiri.
      Seller yang ditangguhkan karena penipuan cukup menjalankan
      UPDATE profiles SET status='aktif' WHERE id=me.
      Fitur moderasi admin menjadi tidak ada gunanya.
```

```
BUG-018 (baca produk & promo lintas toko, anon)
   +  BUG-005 (seller bisa menulis payments/orders milik sendiri)
   =  Kompetitor memantau harga & stok seluruh platform secara real-time,
      sambil memanipulasi metrik tokonya sendiri agar tampak sukses.
```

---

## False Positive / Unverified

| Klaim | Status | Mengapa |
|---|---|---|
| XSS pada nama produk / tautan bio | **False positive** | Tidak ada `innerHTML`/`dangerouslySetInnerHTML` di `src/`; React meng-escape; tautan bio dipaksa berawalan `https://` sehingga `javascript:` tidak dapat dijalankan. |
| SQL injection | **False positive** | Semua akses data lewat PostgREST/supabase-js terparameterisasi; tidak ada perangkaian SQL dari input pengguna. |
| Open redirect lewat tautan bio | **False positive** | `Storefront.tsx:474` selalu membubuhkan `https://` bila skema tidak ada; `//evil.com` menjadi `https:////evil.com` yang tidak ditangani sebagai host eksternal. |
| Kebocoran service-role key ke frontend | **False positive** | `grep` tidak menemukan `SERVICE_ROLE` di `src/`; hanya muncul di `api/`, dan `src/lib/supabase.ts` memakai anon key sesuai aturan `AGENTS.md`. |
| CSRF pada `/api/delete-account` | **False positive** | Memerlukan header `Authorization: Bearer`; tidak ada header CORS yang dipasang, sehingga pemanggilan lintas-origin dari browser akan diblok. |
| "Stok berkurang otomatis" | **FALSE** (bukan false positive) | Tidak ada kode pengurangan stok di mana pun. Landing page salah. (BUG-011) |
| "Log audit mencatat aksi uang" | **FALSE** | `log_admin_action` tidak pernah dipanggil; panel log berisi data literal. (BUG-008) |
| "Audit hardcode tema bersih" (klaim `docs/THEME_ENGINE.md` §11) | **Sebagian benar** | Benar untuk data contoh di dalam berkas tema, tetapi tema **menghilangkan** fitur (tautan bio, QR, status tutup) yang tidak disebut di dokumen. |
| Efektivitas rate limit | **Unverified** | Diperlukan pengiriman ~50 permintaan dengan `X-Forwarded-For` bervariasi ke production. (BUG-016) |
| Konfirmasi email aktif di Supabase | **Unverified** | Kode mendukung kedua kondisi. Uji dengan mendaftar memakai email sekali pakai. (BUG-040) |
| Migrasi sudah dijalankan di production | **Unverified** | 16 berkas migrasi harus dijalankan manual. `Theme.saveTheme` memang punya penanganan error bila `theme_id` belum ada, yang mengisyaratkan migrasi pernah tertinggal. Periksa dengan `select column_name from information_schema.columns where table_name='orders' and column_name='access_token';` |
| Responsivitas nyata di 360/375/390/430/768/1024/1440 px | **Unverified** | Hanya inspeksi statis; tidak ada browser di sandbox. Termasuk keluhan `OrderDetail` yang belum terpecahkan. |
| Kerentanan dependensi (`npm audit`) | **Unverified** | Tidak ada jaringan di sandbox untuk menjalankan `npm audit`. Jalankan secara lokal. |
| `is_closed` tidak dihormati di 6 tema | **Confirmed** (kode) | `const canAdd = showCart;` tanpa `!closed`. Belum diverifikasi di browser. |
| `track_order` dapat di-brute-force | **False positive** | Membutuhkan kecocokan persis `id` + UUID `access_token`; tidak ada kebocoran waktu yang dapat dimanfaatkan pada pencarian kunci utama. |

---

## Recommended Fix Priority

### 🚨 P0 — Hentikan pendaftaran/transaksi baru sampai selesai (target: hari ini)

Semua berupa SQL + sedikit kode; tidak perlu deploy ulang untuk sebagian besar.

1. **BUG-001** — Cabut kemampuan menulis `role`:
   ```sql
   revoke update (role, plan, status) on profiles from authenticated;
   ```
   Lalu verifikasi: `select id, role, plan, status from profiles where role <> 'seller' or plan <> 'gratis' or status <> 'aktif';` — selidiki setiap baris yang muncul.
2. **BUG-002** — Cabut kemampuan menulis `ledger`:
   ```sql
   revoke insert, update, delete on ledger from authenticated, anon;
   create policy "ledger read own" on ledger for select using (seller_id = auth.uid() or is_admin());
   ```
   Lalu audit: `select seller_id, sum(amount) from ledger group by 1 order by 2 desc limit 20;` dan cocokkan dengan `payments` yang benar-benar `berhasil`. Baris yang tidak cocok adalah saldo palsu.
3. **BUG-003** — Cabut kemampuan menulis `withdrawals` dan bekukan antrean:
   ```sql
   revoke insert, update, delete on withdrawals from authenticated, anon;
   create policy "withdrawals read own" on withdrawals for select using (seller_id = auth.uid() or is_admin());
   ```
   **Jangan cairkan penarikan yang sedang `menunggu`/`diproses`** sebelum diverifikasi terhadap saldo `ledger` yang sudah dibersihkan.
4. **BUG-004** — Tutup kebocoran PII:
   ```sql
   revoke select on profiles from anon, authenticated;
   create policy "public reads storefront card" on profiles for select using (true);
   grant select (id, store_name, store_slug, city, avatar_url, cover_url, bio, category, is_closed) on profiles to anon, authenticated;
   -- catatan: grant kolom perlu diuji karena PostgREST memakai policy + privilege;
   -- bila tidak memungkinkan, pakai view/RPC `public_store(slug)` dan cabut akses tabel.
   ```

### ⚡ P1 — Dalam minggu ini

5. **BUG-008** — Panggil `log_admin_action` di keempat aksi admin; ganti panel log dengan data nyata; cabut `grant execute` dari peran yang tidak perlu.
6. **BUG-010 + BUG-034** — Kirim & validasi ongkos kirim di server; tangani promo `potongan_ongkir`; tampilkan angka dari respons server.
7. **BUG-012 + BUG-013** — Petakan status `PaymentStatus` secara eksplisit; buat endpoint pembatalan order yang nyata; pisahkan status bayar dari status kirim.
8. **BUG-011** — Validasi & kurangi stok secara atomik di webhook; perbarui `sold`; perbaiki atau hapus klaim landing.
9. **BUG-023 + BUG-024** — Wajibkan tautan bio dan `is_closed` di semua tema; tambahkan tes kontrak tema.
10. **BUG-031 + BUG-032** — Buat URL `wa.me` yang nyata dan salin clipboard yang nyata. Dua perbaikan kecil dengan dampak konversi terbesar dari seluruh laporan ini.
11. **BUG-009** — Jangan kirim `account_number` utuh ke browser.
12. **BUG-005** — Batasi `payments`/`orders` hanya-baca untuk seller; status bayar hanya lewat webhook.
13. **BUG-006** — Tegakkan `profiles.status` di `RequireAuth`; cabut sesi saat menangguhkan.
14. **BUG-036** — Tambahkan header keamanan di `vercel.json`.

### 🔧 P2 — Bulan ini

15. **BUG-014** — Update `used_count` secara atomik bersyarat.
16. **BUG-015 + BUG-016** — Idempotensi `create-order`; `store_slug` alih-alih `seller_id`; IP dari `x-vercel-forwarded-for`; rate limit terpusat (Vercel KV/Upstash).
17. **BUG-019** — Rekonsiliasi nominal + bungkus penyelesaian pembayaran dalam satu RPC transaksional.
18. **BUG-025 + BUG-026 + BUG-054** — Realtime/backoff; paginasi; pemecahan kode.
19. **BUG-017** — Rate limit & agregasi untuk beacon pengunjung dan klik tautan.
20. **BUG-018** — Ganti policy baca publik dengan RPC terlingkup.
21. **BUG-020, BUG-022, BUG-028, BUG-029, BUG-035** — Validasi diskon; pemeriksaan sebelum hapus akun; pemetaan pesan error; state galat di checkout; penanganan refund yang jujur.
22. **BUG-030, BUG-033, BUG-038, BUG-039, BUG-042, BUG-044, BUG-045, BUG-047, BUG-052** — Bersihkan seluruh hardcoded: badge Premium, janji pengiriman, galeri palsu, statistik landing, sumbu tanggal, nilai bawaan contoh, badge navigasi, nomor dukungan, halaman privasi.
23. **BUG-037, BUG-048, BUG-050** — Lindungi `/system`; hapus `_lib.ts` atau satukan; hapus `schema.sql` ganda.

### 📋 P3 — Backlog

24. **BUG-040** — Verifikasi & aktifkan konfirmasi email; tambahkan captcha; samakan pesan registrasi.
25. **BUG-041** — Selesaikan atau hapus ke-30 tombol mati, satu per satu. Mulai dari "Simulasi gangguan" (hapus saja).
26. **BUG-043, BUG-046, BUG-049, BUG-051, BUG-053** — Metrik akurat, paginasi nyata, ID order lebih panjang, daftar kota konsisten, keranjang per toko.
27. **Pengujian yang belum dapat dilakukan di sini:** matriks responsif 360–1440 px, `OrderDetail` di HP (keluhan pengguna 1 Okt), `npm audit`, verifikasi bahwa ke-16 migrasi sudah dijalankan di project production.

---

## Lampiran — Cara Memverifikasi Sendiri (aman, tanpa merusak production)

**A. Uji privilege escalation (butuh project Supabase test):**
```js
const { data: { user } } = await supabase.auth.signInWithPassword({ email, password });
const before = await supabase.from("profiles").select("role").eq("id", user.id).single();
await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
const after = await supabase.from("profiles").select("role").eq("id", user.id).single();
console.log(before.data.role, "→", after.data.role);   // "seller → admin" = BUG-001 terkonfirmasi
```
Lakukan **hanya** di project Supabase test milik sendiri. Jangan di production.

**B. Uji kebocoran PII (satu baris, tidak massal):**
```
GET /rest/v1/profiles?select=id,role&limit=1
apikey: <VITE_SUPABASE_ANON_KEY dari bundle JS>
```
Mengembalikan 200 dengan data → BUG-004 terkonfirmasi. Hentikan di situ; jangan menarik seluruh tabel.

**C. Uji bypass rate limit:**
Kirim 50× `POST /api/create-order` dengan `X-Forwarded-For` berbeda-beda. Tidak ada `429` → BUG-016 terkonfirmasi.

**D. Uji konfirmasi email (BUG-040):**
Daftar dengan email sekali pakai. Bila langsung masuk ke `/app` tanpa mengklik tautan verifikasi → konfirmasi email nonaktif.

**E. Uji cermin production secara lokal:**
```bash
cp .env.example .env      # isi dari project Supabase TEST (bukan production)
npm install && npm run dev
```
Lalu jalankan daftar periksa: daftar → 2 produk → pilih tiap-tiap dari 8 tema → periksa apakah tautan bio & QR masih ada → tutup toko → periksa apakah tombol beli benar-benar mati → checkout → QRIS sandbox.

---

*Laporan selesai. 54 temuan bernomor: 4 Critical, 9 High, 27 Medium, 14 Low — ditambah 7 catatan Informational.*
*Temuan Critical danHigh terbesar bukan berasal dari kerumitan, melainkan dari satu pola RLS yang diulang ke 11 tabel tanpa pernah mempertanyakan "kolom apa" dan "nilai apa yang masuk akal". Perbaiki polanya, dan 6 dari 12 temuan teratas hilang bersama-sama.*
