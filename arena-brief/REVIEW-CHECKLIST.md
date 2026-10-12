# REVIEW CHECKLIST — dipakai saya saat file MiMo datang (12 Okt 2026)

Untuk SETIAP file di `arena-brief/hasil/`, semua harus ✅ sebelum dipasang.
Satu ❌ = tulis ke `REVISI.md`, jangan pasang.

## A. Kontrak & struktur
- [ ] Nama file & nama export SAMA dengan file lama (`index.ts` tidak diubah).
- [ ] Props HANYA `ThemeStorefrontProps`; tidak ada prop tambahan/wajib baru.
- [ ] Tidak ada import `supabase` / `fetch` / `auth` / `localStorage` /
      `window.location` / library baru / file CSS baru.
- [ ] Tidak ada `innerHTML` / `dangerouslySetInnerHTML`.

## B. Anti data-contoh (ZERO TOLERANSI)
- [ ] `grep -n "MOCK_\|contoh\|lorem\|1\.284\|terjual\|4,9\|4\.9\|10\.000\|Followers\|Gratis ongkir\|Gratis Ongkir\|Masuk\|Daftar\|Wishlist\|Visa\|Mastercard\|tokolink\.id" <file>` KOSONG
      (kecuali kata "Daftar" pada tombol yang memang ke halaman daftar seller).
- [ ] Setiap angka/teks di JSX ditelusur ke props §4 BRIEF. Tidak ketemu
      asalnya = karangan = tolak.
- [ ] Rating/terjual/followers: hanya dari data real (`sold`, RPC ulasan
      yang sudah ada) atau TIDAK DITAMPILKAN sama sekali.
- [ ] Empty state ada untuk: 0 produk, tanpa bio, tanpa foto, toko tutup.
- [ ] Bahasa Indonesia semua. Harga lewat `rupiah()`. Domain hanya
      `tokolink.store` (tanpa `/s/` pendek yang salah — format rute asli
      `/s/:slug`, URL pendek `/{slug}`).

## C. Alur beli & logika (anti bug tersembunyi — periksa HALAMAN per HALAMAN)
- [ ] Tombol Tambah/Pesan SELALU memanggil `onAdd(p)` dengan objek Product
      asli (jangan rakit objek sendiri — field kurang = cart crash).
- [ ] `stock === 0` atau `closed` = tombol MATI + cap HABIS/Tutup. Tidak ada
      jalan memasukkan barang habis ke keranjang.
- [ ] Tidak ada link/order via WhatsApp (`wa.me` dengan isi order). Chat WA
      hanya via `onChatWA` yang disediakan.
- [ ] Bilah/CTA keranjang SELALU ke `/cart` (cek string "/cart" ada).
- [ ] Pencarian + kategori memanggil `onQ`/`onCat` (jangan filter array
      lokal sendiri — `items` sudah difilter StoreHome).
- [ ] Hooks (useState/useEffect) SELALU di atas, sebelum return manapun
      (pelajaran insiden ProductDetail putih 12 Okt 2026).
- [ ] Tidak ada `setInterval`/listener tanpa cleanup `return () => ...`.

## D. Database (kerja berdua — periksa QUERY per QUERY)
- [ ] Tidak ada file migrasi / perubahan `database/` / `api/` dari MiMo.
- [ ] `KEBUTUHAN-DATA.md` (kalau ada): tiap item diputuskan — tolak, atau
      saya buatkan migrasi bernomor + RLS + trigger pengaman.
- [ ] Query MiMo (kalau ada): tabel+kolom ADA di `schema.sql`; pakai anon
      key; RLS menutup (baca: hanya milik sendiri/publik); tulis sensitif
      (uang/status/role) HANYA via RPC existing; tidak ada secret di kode.
- [ ] RLS check: buka sebagai seller A — data seller B tidak boleh terbaca.

## E. Responsif & UX
- [ ] 375px: tanpa scroll horizontal halaman; teks tidak bertumpuk;
      tombol bisa diklik ibu-ibu (min 44px tinggi untuk aksi utama).
- [ ] 1440px: tidak melebar tak terkendali (max-width container).
- [ ] Loading (skeleton), error (pesan), kosong (empty state) ada.
- [ ] Kontras teks terbaca (khusus tema gelap: Pixel, Atelier).

## F. Pasang
- [ ] `tsc --noEmit`: tidak ada error BARU. `npm run build`: PASS.
- [ ] Centang progres di `.opencode/TASKS.md` + lapor format standar.
