---
name: ui-interaction-patterns
description: Pola wajib untuk toggle/switch dan cek responsif di TokoLink. Baca ini sebelum menyentuh komponen apapun yang punya toggle aktif/nonaktif atau sebelum menandai task UI selesai.
---

# Pola Toggle (Optimistic Update)

Salah satu bug yang sudah terjadi: toggle (mis. aktif/nonaktif produk,
bio link, kode diskon, jam buka) berubah tampilannya tapi tidak sinkron
dengan database, atau sebaliknya lag menunggu response.

**Pola yang benar:**
```tsx
const [isActive, setIsActive] = useState(initialValue);

async function handleToggle() {
  const previous = isActive;
  setIsActive(!previous); // 1. UI berubah DULUAN

  const { error } = await supabase
    .from('table_name')
    .update({ is_active: !previous })
    .eq('id', rowId);

  if (error) {
    setIsActive(previous); // 2. Gagal → balikin, JANGAN diam-diam
    toast.error('Gagal menyimpan, coba lagi');
  }
}
```

**Yang sering salah (jangan diulang):**
- Update state lokal TAPI lupa kirim ke Supabase (perubahan hilang saat
  refresh)
- Kirim ke Supabase dulu, baru update UI setelah response (terasa lag,
  UX buruk di koneksi lambat — mayoritas user TokoLink di HP)
- Tidak ada rollback saat request gagal (UI bilang aktif, DB bilang
  nonaktif — beda antara apa yang seller lihat vs kenyataan)
- Toggle bisa diklik berkali-kali sebelum request pertama selesai →
  race condition. Disable toggle sementara saat request berjalan.

# Cek Responsif — Wajib, Bukan Opsional

Mayoritas seller TokoLink akses dari HP. Setiap task yang menyentuh UI
HARUS dicek minimal di 2 lebar:
- **375px** (HP kecil — representasi HP low-end yang umum di UMKM)
- **1440px** (desktop — buat seller yang kerja dari laptop/warnet)

**Yang paling sering rusak kalau tidak dicek:**
- Tabel lebar (Orders, AdminPayments, dsb) meluber di HP — harus scroll
  horizontal terkontrol (`overflow-x-auto` pada container, bukan seluruh
  halaman ikut geser)
- Modal/dialog form (ProductForm, Withdraw) ketutup keyboard HP atau
  lebih tinggi dari layar — pastikan bisa di-scroll di dalam modal
  sendiri
- Tombol aksi (hapus, edit) ketumpuk/kegencet di layar sempit
- Grid produk (StoreHome) yang di desktop 3-4 kolom harus otomatis jadi
  1-2 kolom di HP, bukan tetap 4 kolom kecil-kecil

**Sebelum centang task manapun yang ubah tampilan:** buka di dua lebar
di atas, pastikan tidak ada elemen kepotong/tumpang tindih/perlu scroll
horizontal yang tidak disengaja.
