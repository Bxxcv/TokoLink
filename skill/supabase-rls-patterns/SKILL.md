---
name: supabase-rls-patterns
description: Pola RLS baku TokoLink. Baca ini sebelum menulis policy RLS untuk tabel manapun di schema.sql, supaya semua tabel konsisten dan tidak ada yang bocor.
---

# Pola RLS TokoLink

Dua peran: `seller` (baris `profiles.role='seller'`) dan `admin`
(`profiles.role='admin'`). Fungsi `is_admin()` sudah didefinisikan di
`schema.sql` — pakai itu, jangan tulis ulang logikanya di tiap policy.

## Pola A — Tabel milik seller (punya kolom `seller_id`)
Berlaku untuk: products, orders, order_items (via join), payments, ledger,
withdrawals, bio_links, discount_codes, store_hours, premium_requests.

```sql
create policy "seller manages own <table>" on <table>
  for all using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());
```

`order_items` tidak punya `seller_id` langsung — join lewat `orders`:
```sql
create policy "seller manages own order_items" on order_items
  for all using (
    exists (select 1 from orders o
            where o.id = order_items.order_id
              and (o.seller_id = auth.uid() or is_admin()))
  );
```

## Pola B — Data yang perlu dibaca publik (storefront)
Hanya untuk kolom yang memang tampil di halaman toko publik (tidak login):
- `products` (kolom aktif saja): `for select using (status = 'aktif')`
- `profiles` (untuk render nama toko/cover): `for select using (true)`,
  TAPI jangan pernah select kolom sensitif (email, dll) lewat query publik —
  batasi di level query frontend (pilih kolom eksplisit), bukan lewat RLS.

## Pola C — Buyer non-login lacak order sendiri
Order tracking (`OrderTracking` page) diakses buyer yang belum tentu punya
akun. JANGAN buka akses select bebas ke seluruh tabel `orders`. Opsi yang
harus didiskusikan dulu ke user sebelum implementasi:
1. Order id sengaja dibuat sulit ditebak (mis. UUID acak, bukan sequential)
   + policy select berdasarkan match id persis, tanpa listing.
2. Atau simpan token akses terpisah per order, dikirim ke buyer saat checkout.
Jangan pilih sendiri — ini keputusan produk, bukan teknis.

## Checklist sebelum lanjut ke task berikutnya
- [ ] Semua tabel baru di `schema.sql` sudah `enable row level security`
- [ ] Tidak ada tabel dengan `using (true)` untuk `for all` (hanya boleh untuk
      `for select` yang memang perlu publik, sesuai Pola B)
- [ ] Service role key tidak pernah dipanggil dari kode yang jalan di browser
