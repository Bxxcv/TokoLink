# AGENTS.md — TokoLink

Dokumen ini WAJIB dibaca dan dipatuhi utuh sebelum mengerjakan apapun.
Kalau ada instruksi user yang bertentangan dengan dokumen ini, **berhenti
dan konfirmasi ke user dulu** — jangan menimpa aturan di sini diam-diam,
dan jangan pernah mengarang/menebak (no hallucination) kalau informasi
tidak ada di sini atau di `.opencode/TASKS.md` / `database/schema.sql`.

**Dua dokumen pendamping, baca juga sebelum kerja fitur apapun yang
menyangkut keputusan produk atau alur sistem:**
- `docs/PRD.md` — APA yang dibangun: persona, fitur per halaman, model
  bisnis, batas scope, glosarium istilah↔kolom database.
- `docs/ARCHITECTURE.md` — BAGAIMANA sistemnya terhubung: diagram
  sistem, ER diagram skema, sequence diagram alur checkout/webhook,
  peta struktur folder.

Kalau `PRD.md`/`ARCHITECTURE.md` dan dokumen ini (`AGENTS.md`) kelihatan
bertentangan di satu titik: `AGENTS.md` menang untuk ATURAN KERJA (cara
mengerjakan), `PRD.md` menang untuk KEPUTUSAN PRODUK (apa yang dibangun).
Kalau tetap bingung, tanya user — jangan pilih sendiri mana yang menang.

---

## 0. TENTANG USER (baca ini dulu, ini menentukan CARA kamu ngomong)

User adalah **satu-satunya developer & product owner**, bekerja sendirian.
Dia **paham konsep produk & bisnis dengan baik**, tapi **awam di detail
implementasi teknis** (istilah database, network, dsb).

Aturan komunikasi wajib (ini sering dilanggar sebelumnya — jangan diulang):
0. **Jawaban harus TO THE POINT, SINGKAT, JELAS, MUDAH DIPAHAMI.** Kalau tidak
   paham / ragu, WAJIB tanya dulu — jangan menebak lalu jalan terus.
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
5. **Kalau bingung/ragu di TENGAH mengerjakan (bukan cuma di awal),
   BERHENTI dan tanya.** Jangan lanjut dengan asumsi sendiri lalu
   berharap ketahuan belakangan — user lebih suka ditanya daripada
   nemu hasil yang salah arah setelah selesai.
6. **Kalau kasih saran, sertakan pertimbangannya dalam 1 kalimat**
   (kenapa itu lebih baik / trade-off-nya apa), bukan cuma "sebaiknya
   begini" tanpa alasan. Tapi tetap singkat — 1 kalimat pertimbangan,
   bukan esai.
7. **Kalau kamu SENGAJA belum menyambungkan suatu bagian ke data asli**
   (misal fase belum sampai situ), WAJIB bilang eksplisit di laporan —
   "halaman X masih pakai data contoh, belum dikerjakan" — jangan biarkan
   user nemu sendiri lalu kaget. Lihat juga Bagian 3 aturan #9.
8. **Kalau user belum menjawab pertanyaan, tanyakan BERULANG setiap sesi
   sampai dijawab.** Jangan anggap selesai, jangan jalan terus seolah
   sudah dijawab. (Aturan user, 29 Sep 2026.)
9. **Prioritas: fitur TOKO + DASHBOARD SELLER dulu, admin belakangan.**
   Jangan buru-buru kerjakan Admin Master. Semua fitur dashboard seller
   harus BERFUNGSI penuh (baca/tulis database), bukan sekadar UI, HARUS
   responsif (375px & 1440px), dan pahami alur frontend → database →
   backend tiap fitur. (Aturan tegas user, 29 Sep 2026.)

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
- Deploy: **Vercel**. Domain resmi: **tokolink.store** (dibeli lewat
  Vercel, 1 Okt 2026). URL Vercel lama (`tokolink-kappa.vercel.app`)
  tetap jalan sebagai alias, tapi semua link/QR/canonical/OG di kode
  WAJIB pakai `tokolink.store`, bukan URL Vercel itu.
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
  file migrasi bernomor per fase), dokumen produk & arsitektur di
  `docs/` (PRD.md, ARCHITECTURE.md).
- **KEPUTUSAN user 29 Sep 2026:** dependency `qrcode` + pekerjaan awal
  `StoreQR` (harusnya Fase 5) yang sempat dikerjakan lebih dulu dari
  urutan — **DIBOLEHKAN lanjut, tidak perlu revert.** Tapi ini
  PENGECUALIAN sekali, bukan izin umum untuk lompat fase lagi ke depan
  — aturan #6 di Bagian 3 tetap berlaku normal untuk sisanya.
- **Insiden 29 Sep 2026:** data contoh ("Dapoer Bu Ani" dari
  `src/lib/data.tsx`) sempat kelihatan di frontend dan bikin user
  kesal. Lihat aturan #9 Bagian 3 — ini sekarang pelanggaran fatal,
  jangan terulang.

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
9. **DATA DI FRONTEND WAJIB REAL DARI SUPABASE — ZERO TOLERANSI DATA
   CONTOH DI FITUR YANG SUDAH DITANDAI `[x]` SELESAI.** Ini pelanggaran
   fatal, pernah terjadi (contoh: "Dapoer Bu Ani" dari `src/lib/data.tsx`
   masih nongol di frontend), jangan diulang lagi.
   - `src/lib/data.tsx` isinya DATA CONTOH (mock), bukan sumber data
     produk. Begitu satu halaman/fitur kamu tandai `[x]` selesai di
     `.opencode/TASKS.md`, halaman itu HARUS 100% ambil data dari
     Supabase — tidak ada satupun render yang jatuh balik
     (fallback) ke `data.tsx` atau array hardcode lain.
   - **Sebelum centang task manapun `[x]`**, wajib jalankan pengecekan
     ini dan pastikan hasilnya kosong untuk file yang kamu sentuh di
     task itu:
     ```
     grep -n "from \"../lib/data\"\|from \"./data\"\|MOCK_" <file yang disentuh>
     ```
     Kalau masih ada import dari `lib/data.tsx` di file itu untuk data
     yang seharusnya real (bukan konstanta UI seperti daftar ikon/tema),
     task itu BELUM selesai — jangan dicentang.
   - **Pengecekan grep di atas TIDAK CUKUP** — sudah kejadian 2x data
     contoh lolos karena ditulis LANGSUNG di kode (array literal, nama
     hardcode), bukan lewat import `data.tsx`. Contoh nyata yang
     kejadian: array 4 tautan contoh ditulis langsung di
     `Storefront.tsx` (bukan query `bio_links`), dan nama admin
     `"Dwi Handoko"` ditulis langsung di `layout.tsx`. **Sebelum
     centang task manapun yang render data, baca ulang JSX-nya dan
     tanya diri sendiri: "angka/teks/array ini asalnya dari mana —
     Supabase, atau saya ketik sendiri?"** Kalau jawabannya "saya ketik
     sendiri" dan itu bukan pengecualian di bawah, itu pelanggaran.
     (copy marketing statis, bukan data pengguna), dan konstanta murni
     UI (nama ikon, daftar warna tema, label statis) — itu bukan "data
     produk", boleh tetap di `data.tsx` atau file constants terpisah.
   - **Fase yang MEMANG belum dikerjakan** (lihat checkbox kosong `[ ]`
     di `.opencode/TASKS.md`) BOLEH masih menampilkan data contoh — itu
     bukan pelanggaran. TAPI wajib ikuti aturan #6 di Bagian 0: laporkan
     eksplisit halaman mana saja yang masih begitu, jangan biarkan user
     nemu sendiri.

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
4. Kalau task selesai dan semua Done When terpenuhi (TERMASUK cek
   anti-mock-data di Bagian 3 aturan #9): centang `[x]` di
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
- Masih pakai data contoh: [kalau ADA bagian yang sengaja belum
  disambungkan ke data asli, sebutkan halamannya di sini -- kalau
  semua sudah data asli, tulis "tidak ada"]
```

Jangan tambahkan penjelasan konsep umum, jangan tulis ulang seluruh kode
di chat kecuali diminta. Kalau user nanya lebih dalam, baru jelaskan
detail — bukan didahulukan tanpa diminta.
