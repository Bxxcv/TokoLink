# AGENTS.md — TokoLink

Dokumen ini WAJIB dibaca dan dipatuhi utuh sebelum mengerjakan apapun.
Kalau ada instruksi user yang bertentangan dengan dokumen ini, **berhenti
dan konfirmasi ke user dulu** — jangan menimpa aturan di sini diam-diam,
dan jangan pernah mengarang/menebak (no hallucination) kalau informasi
tidak ada di sini atau di `.opencode/TASKS.md` / `database/schema.sql`.

---

## 0. TENTANG USER (baca ini dulu, ini menentukan CARA kamu ngomong)

User adalah **satu-satunya developer & product owner**, bekerja sendirian.
Dia **paham konsep produk & bisnis dengan baik**, tapi **awam di detail
implementasi teknis** (istilah database, network, dsb).

Aturan komunikasi wajib (ini sering dilanggar sebelumnya — jangan diulang):
1. **Jawaban ke user harus singkat, padat, jelas.** Bahasa Indonesia
   sederhana, bukan jargon. Kalau harus pakai istilah teknis, kasih
   penjelasan 1 kalimat pendek, jangan ceramah panjang.
2. **Jangan jelaskan hal yang tidak ditanya.** User tidak butuh kuliah
   tentang best-practice umum — dia butuh tahu: apa yang kamu kerjakan,
   apa dampaknya, dan apa yang perlu dia lakukan (kalau ada).
3. Setelah selesai satu task, laporkan dengan format singkat (lihat
   Bagian 5), bukan paragraf panjang.
4. Kalau nemu ambiguitas soal **keputusan produk** (bukan keputusan
   teknis), tanya dengan pertanyaan pendek + kasih 2-3 opsi konkret,
   jangan tanya terbuka yang bikin user harus mikir dari nol.

---

## 1. PROJECT CONTEXT BLOCK (konteks bisnis — WAJIB dipahami, bukan cuma dibaca)

**Apa TokoLink:** platform "satu link untuk semua toko" bagi penjual UMKM
Indonesia. Seller dapat 1 halaman publik (link-in-bio + katalog produk +
checkout QRIS) yang bisa dibagikan lewat WhatsApp/Instagram, tanpa perlu
website sendiri.

**Siapa penggunanya:**
- **Seller** — pemilik UMKM (kuliner rumahan, kerajinan, dll), awam
  teknologi, akses dari HP. Prioritas UX: sesimpel mungkin, minim langkah.
- **Buyer** — pembeli dari link yang dibagikan seller, seringnya BELUM
  PUNYA akun (tidak login) saat checkout maupun saat cek status pesanan.
- **Admin (kita)** — mengelola seluruh platform: approve premium,
  proses withdrawal, pantau seluruh transaksi.

**Model bisnis:** gratis dasar, ada tier premium (`profiles.plan`).
Platform kemungkinan ambil fee dari setiap transaksi (lihat kolom `fee`
di `payments`/`withdrawals`) — detail % fee belum final, jangan hardcode
angka, tanya user kalau butuh nilai pasti.

**Produk lama (referensi, JANGAN disalin buta):** NiagaBio — platform
sejenis yang jadi basis awal TokoLink. Standar keamanan (RLS,
`verifyAuth`, HMAC webhook, escape HTML) mengikuti standar NiagaBio.
Fitur boleh berkembang dari NiagaBio, TIDAK harus 1:1.

**Kenapa desainnya begini (jangan diubah tanpa izin):** UI/UX sudah
final, dibuat khusus mempertimbangkan seller yang awam teknologi —
alur checkout dan dashboard sengaja diminimalkan langkahnya. Perubahan
UI = perubahan keputusan produk, bukan keputusan teknis biasa.

---

## 2. MEMORY BLOCK (keputusan yang sudah final — jangan tanya ulang, jangan kontradiksi)

- Stack: **React 19 + Vite + Tailwind 4**, TypeScript. Router custom di
  `src/lib/router.tsx` — TIDAK pakai react-router.
- Backend: **Supabase** (Postgres + Auth + Storage + Realtime), RLS wajib
  di semua tabel.
- Payment: **BuatQris** (QRIS), lihat `.opencode/skill/buatqris-webhook/SKILL.md`.
- Deploy: **Vercel**. Sudah live di `tokolink-kappa.vercel.app`, domain
  custom `.store` menyusul.
- Tracking order buyer non-login: **Opsi A — kolom `orders.access_token`**
  (uuid acak), sudah diimplementasi di `database/migrate_fase3.sql`.
  Jangan bikin mekanisme lain.
- Multi-toko dalam 1 akun: **DITUNDA**, dicatat di backlog `.opencode/TASKS.md`.
  JANGAN dikerjakan di tengah fase manapun — butuh perubahan skema besar
  (pisah tabel `stores` dari `profiles`), harus jadi task tersendiri
  setelah MVP (Fase 0-7) stabil dan dikonfirmasi ulang ke user.
- Reset password: link saat ini mengarah ke `/` (BELUM ada halaman "buat
  kata sandi baru") — ini utang teknis yang harus dilunasi sebelum fitur
  Forgot Password dianggap selesai.
- File konfigurasi agent disimpan di `.opencode/` (AGENTS.md, TASKS.md,
  opencode.json, skill/), skema database di `database/` (schema.sql +
  file migrasi bernomor per fase).

---

## 3. ATURAN KERAS (Non-negotiable)

1. Jangan mengubah desain/UI kecuali diminta eksplisit.
2. Jangan membuat tabel/kolom/endpoint yang tidak ada di
   `database/schema.sql` atau migrasi yang sudah disetujui. Field baru →
   USULKAN dulu, jangan eksekusi langsung.
3. Jangan menambah dependency baru tanpa persetujuan user (lihat stack
   final di Bagian 2).
4. Service-role key / secret Supabase / BuatQris **tidak boleh** ada di
   kode frontend (`VITE_*`) — hanya di server functions.
5. RLS wajib aktif di semua tabel. Lihat
   `.opencode/skill/supabase-rls-patterns/SKILL.md` untuk pola bakunya.
6. **Satu task dari `.opencode/TASKS.md` per sesi, berurutan sesuai fase.**
   Dilarang lompat fase dengan alasan apapun (termasuk "lebih gampang",
   "sekalian") — kalau ada alasan kuat untuk keluar urutan, **tanya user
   dulu**, jangan putuskan sendiri. Ini pelanggaran paling sering terjadi
   sebelumnya — jangan diulang.
7. **Stop dan minta konfirmasi user SEBELUM**: menghapus file apapun,
   menambah dependency, mengubah `database/schema.sql` (migrasi baru
   boleh, tapi harus file terpisah bernomor fase, bukan edit schema.sql
   langsung), atau mengubah struktur folder `.opencode/`.
8. Kalau nemu bug/inkonsistensi di kode yang sudah ada, **laporkan**,
   jangan refactor besar-besaran tanpa izin.

---

## 4. PROTOKOL KERJA PER TASK (Starting State → Target State → Done When)

Setiap task di `.opencode/TASKS.md` diformat dengan 3 bagian: kondisi
awal, kondisi akhir yang harus dicapai, dan kriteria "selesai". Sebelum
mulai task manapun:

1. Baca task-nya utuh: Starting State, Target State, **Done When**.
2. Kerjakan HANYA file yang disebut di task itu. Jangan menyentuh file
   lain di luar scope, walau kelihatan "sambil benerin".
3. Untuk task yang menyentuh UI (bukan cuma query data), **Done When
   selalu termasuk**, kecuali disebutkan lain di task:
   - Loading state (skeleton/spinner) saat data masih fetch
   - Empty state (kalau data kosong, bukan cuma layar putih)
   - Error state (toast/pesan, bukan silent fail / crash blank)
   - Toggle/switch pakai **optimistic update**: UI berubah dulu, kalau
     request ke Supabase gagal → balikin ke state semula + tampilkan
     error. Jangan tunggu response dulu baru UI berubah (kelihatan lag).
   - Cek responsif di lebar **375px (HP) dan 1440px (desktop)** minimal
     — mayoritas seller akses dari HP, ini prioritas, bukan opsional.
4. Kalau task selesai dan semua Done When terpenuhi: centang `[x]` di
   `.opencode/TASKS.md`, lalu laporkan pakai format di Bagian 5.
5. Kalau task TIDAK bisa diselesaikan penuh (ada bagian yang perlu
   keputusan user): centang bagian yang selesai, tulis sub-bullet baru
   untuk sisanya, jangan dipaksa centang penuh.

---

## 5. FORMAT LAPORAN KE USER (wajib, ganti kebiasaan lama)

Setelah satu task selesai, laporkan PERSIS format ini, tidak lebih:

```
[nama task singkat]
- File diubah: [daftar file]
- Yang berubah: [1-2 kalimat, bahasa awam]
- Perlu kamu cek: [kalau ada -- spesifik, mis. "coba toggle di HP, dan isi 1 kode
  diskon buat tes" -- kalau tidak ada langsung tulis "tidak ada"]
```

Jangan tambahkan penjelasan konsep umum, jangan tulis ulang seluruh kode
di chat kecuali diminta. Kalau user nanya lebih dalam, baru jelaskan
detail — bukan didahulukan tanpa diminta.
