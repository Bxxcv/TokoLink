# BRIEF DESAIN 8 TEMA TOKO — untuk AI Desainer

Untuk: AI lain (tugas kamu HANYA desain visual, bukan kode).
Yang mengkode + me-review: engineer TokoLink (Muse Spark).
Baca sampai habis sebelum mendesain. Kalau ada aturan yang dilanggar,
desainmu DITOLAK dan harus diulang.

---

## 1. KONTEKS (wajib paham)

TokoLink = "satu link untuk semua toko" bagi UMKM Indonesia. Satu halaman
toko berisi: profil + tautan bio + katalog produk + keranjang + checkout QRIS.
Pembeli 90% dari HP, sering koneksi lambat. Seller awam teknologi.

Kamu mendesain ulang **halaman ETALASE TOKO saja** (katalog + profil),
sebanyak **8 TEMA baru** (ganti total 8 tema lama yang tampilannya tidak
jelas). Halaman lain (detail produk, keranjang, checkout, bayar QRIS,
lacak pesanan) adalah halaman BERSAMA yang tidak kamu desain — jangan
sentuh, tapi lihat Bagian 5 supaya nyambung.

## 2. ATURAN MATI (pelanggaran = ditolak)

1. **Setiap elemen visual HARUS punya data asli.** Dilarang keras: tombol
   yang tidak ngapa-ngapain, angka statistik karangan ("4.820 toko",
   "rating 4,9"), badge palsu ("Premium" untuk semua), janji palsu
   ("garansi diganti penuh", "dikirim hari ini juga"), galeri 3 foto
   padahal cuma 1 foto. Kalau datanya tidak ada, elemennya JANGAN DIGAMBAR
   (atau gambar sebagai empty state, lihat Bagian 4).
2. **Satu-satunya tombol beli** = "tambah ke keranjang" → alur QRIS.
   Dilarang mengarahkan order ke WhatsApp. Tombol chat WA BOLEH ada tapi
   hanya sekunder (untuk tanya stok), tidak boleh lebih menonjol dari
   tombol beli.
3. **Data yang tersedia** (inilah SATU-SATUNYA yang boleh kamu tampilkan —
   jangan mengarang field baru):
   - Toko: nama, kota, bio/deskripsi, logo (avatar), foto sampul (cover),
     status buka/tutup + jam hari ini + jam 7 hari, QR toko, jumlah isi
     keranjang.
   - Tautan bio: daftar (label + URL + ikon otomatis: WA/IG/TikTok/FB/link).
   - Produk per item: foto (SATU foto per produk, bukan galeri), nama,
     kategori, harga (Rupiah), stok (angka / HABIS), SKU, deskripsi singkat.
   - Filter: daftar kategori asli toko + pencarian nama + reset filter.
4. **Status "toko tutup" WAJIB terlihat dan mematikan tombol beli.**
   Desain keadaan: tombol tambah mati/ganti tulisan "Toko tutup".
5. **Mobile-first.** Desain di 360px DULU, baru naik ke desktop. Tidak boleh
   ada konten kepotong kiri-kanan, tidak boleh scroll horizontal halaman.
   Target sentuh tombol ≥44px di HP.

## 3. SARAN ARAH GAYA (dari engineer, boleh kamu kembangkan)

Tetap berjiwa UMKM Indonesia tapi terlihat JELAS seperti toko (masalah tema
lama: tidak kelihatan seperti tempat belanja). Cirinya per tema:
foto produk BESAR dan dominan, harga jelas dalam Rupiah, tombol beli paling
menonjol di tiap kartu, kategori + pencarian gampang dijangkau ibu jari.
Boleh beda kepribadian per tema (ramai/pasar, tenang/premium, playful,
gelap/terang), tapi SEMUA harus lolos aturan Bagian 2 dan 4.

## 4. 8 TEMA (arsitektur + pembeli sasaran — jangan tukar)

1. **Warung Rame** — kuliner harian. Suasana pasar ramai tapi rapi.
2. **Kopi Sore** — kopi/bakery artisan. Hangat, editorial, tenang.
3. **Butik Rapi** — fashion. Foto vertikal besar, tempo lambat.
4. **Jasa Kilat** — servis/jasa. Utilitarian: daftar, kode, harga jelas.
5. **Dapur Ngebul** — katering/jajanan. Papan menu + cap HABIS jujur.
6. **Kriya Asli** — kerajinan/handmade. Etalase + blok cerita pembuat.
7. **Digital Kilat** — produk digital. Presisi, mono, boleh tema GELAP.
8. **Konsultan Tenang** — jasa profesional. Satu kolom lapang, CTA tenang.

## 5. BAGIAN WAJIB PER TEMA (urut dari atas, tidak boleh ada yang hilang)

1. **Header**: logo, nama toko, kota/kabupaten, badge BUKA/TUTUP (+ jam hari
   ini), tombol Bagikan, tombol QR toko, tombol Keranjang (+ jumlah).
2. **Profil**: foto sampul (boleh full/half/tanpa — nyatakan), bio (kalau
   kosong: tampilkan kota/katalog saja, jangan karang deskripsi).
3. **Tautan bio**: SELURUH daftar (bisa 0–10 tautan). Kalau 0: blok hilang
   total, bukan tampil kosong.
4. **Jam lengkap** (opsional tampil, data selalu ada): 7 hari + status hari ini.
5. **Filter**: chip kategori + kolom cari + tombol reset.
6. **Kartu produk** (ini intinya, detailkan!): ukuran & rasio foto, posisi
   nama, format harga, cap HABIS / sisa N, tombol tambah (bentuk, warna,
   tulisan), keadaan saat stok 0 dan saat toko tutup.
7. **Keadaan kosong**: toko tanpa produk + hasil cari nol (gambar + kalimat).
8. **Footer**: nama toko + kota + "Dibuat dengan TokoLink".
9. **QR toko**: tampil di mana (header/modal/samping) + tombol unduh.

## 6. WARNA & TIPOGRAFI (kamu yang desain, ini rambu-rambunya)

- Tiap tema: tetapkan **maksimal 5 warna**: latar, permukaan/kartu, teks,
  teks redup, 1 warna AKSEN (untuk tombol beli + harga). Tulis kode hex
  semuanya. Kontras teks:latar minimal 4,5:1.
- Maksimal **2 keluarga font** per tema (1 display + 1 isi), sebutkan nama
  + fallback sistem.
- Tombol beli HARUS warna aksen (paling mencolok di kartu). Tombol chat WA
  sekunder (outline/polosan). Tombol mati jelas beda (abu, tidak bisa diklik).
- Badge: BUKA (hijau), TUTUP (merah), HABIS (abu/merah), SISA N (kuning).
  Tulis hex masing-masing.

## 7. FORMAT SERAHAN (wajib persis begini, per tema)

```markdown
# Tema N — [Nama]
- Sasaran: ...
- Palet: latar #..., permukaan #..., teks #..., redup #..., aksen #...
- Font: display ..., isi ...
- Header: (jelaskan susunan + perilaku mobile)
- Profil & sampul: ...
- Tautan bio: ...
- Filter: ...
- Kartu produk: ...
- Keadaan tutup / stok 0 / kosong: ...
- QR: ...
- Sketsa ASCII sederhana susunan HP (360px)
```

Satu file per tema ATAU satu file berisi 8 bagian — bebas, asal lengkap.
Tidak perlu kode, tidak perlu gambar AI. Teks presisi > gambar cantik.

## 8. YANG TIDAK PERLU KAMU DESAIN

Foto produk (1 foto asli per produk), galeri (tidak ada — 1 foto saja),
halaman checkout, QRIS, lacak pesanan: semua halaman bersama, sudah final.
Fokus 100% ke etalase.
