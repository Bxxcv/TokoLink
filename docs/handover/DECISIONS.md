# DECISIONS — Keputusan Produk & Teknis TokoLink

## A. Keputusan final (jangan kontradiksi)

| # | Keputusan | Sumber | Tanggal |
|---|-----------|--------|---------|
| 1 | Multi-toko dalam 1 akun: DIKERJAKAN (Fase A+B). Premium per akun, dompet gabung. Fase C (hapus seller_id lama) belum. | TASKS.md | 13 Okt 2026 |
| 2 | Buyer wajib login (buyer_id di orders, access_token tetap untuk link lama). | Keputusan user | 18 Okt 2026 |
| 3 | Transfer manual dengan bukti upload + admin review. | Keputusan user | 18 Okt 2026 |
| 4 | Komisi platform 2% (settings.platform_fee_percent), dipotong dari saldo seller. | TASKS.md | 4 Okt 2026 |
| 5 | Fee BuatQris: fee_by=user (seller absorbs, bukan buyer). | create-order.ts | — |
| 6 | Ongkir: dihapus total, kirim via chat. | TASKS.md | 8 Okt 2026 |
| 7 | Reset password: link ke /reset (halaman sudah ada). | TASKS.md | 10 Okt 2026 |
| 8 | Kategori & kota: bebas diisi (custom). | TASKS.md | 30 Sep 2026 |
| 9 | Tema: 8 tema engine + klasik. Default "klasik". | THEME_ENGINE.md | 2 Okt 2026 |
| 10 | Domain: tokolink.store (bukan tokolink.id). | AGENTS.md | 1 Okt 2026 |
| 11 | Tracking order buyer: Opsi A (kolom orders.access_token). | AGENTS.md | — |
| 12 | Login buyer terpisah (/masuk, /daftar) dari seller (/login, /register). | Keputusan user | 18 Okt 2026 |
| 13 | QR logo: seller Premium + avatar → logo seller; else logo TokoLink. | Keputusan user | 18 Okt 2026 |
| 14 | Free: 20 produk, tema Klasik, 3 bio link. Premium: 59rb/bln, 590rb/thn. | TASKS.md | 8 Okt 2026 |
| 15 | Account lockout: 5x gagal → blokir 15 menit (klien). | Keputusan user | 18 Okt 2026 |

## B. Keputusan yang masih sementara / belum final

| # | Item | Status | Catatan |
|---|------|--------|---------|
| 1 | Fee BuatQris (0.7%) diserap penjual vs buyer | DIPUTUSKAN: diserap penjual | Sudah fee_by=user |
| 2 | Platform fee % (2%) bisa berubah | Sementara | settings.platform_fee_percent, ubah via SQL/Admin |
| 3 | Warna aksen tidak berlaku di 8 tema baru | Belum dikonfirmasi user | Perubahan perilaku, perlu persetujuan |
| 4 | Timezone = WIB | Asumsi | Belum ada seller luar WIB komplain |
| 5 | Chat retensi 2-4 minggu | Belum diotomasi | Cron belum ada |
| 6 | OG dinamis di /{slug} | Ditunda | Butuh Pro plan atau merge functions |
| 7 | Domain kustom per toko | Belum | Premium feature, kompleks |
| 8 | Verifikasi penjual berjenjang | Belum | Butuh flow + dokumen |
| 9 | Studi kasus/testimoni | Empty state | Butuh data nyata dari user |

## C. Keputusan yang dibatalkan/diganti

| Lama | Baru | Alasan |
|------|------|--------|
| Buyer non-login (access_token) | Buyer wajib login | Keputusan user 18 Okt 2026 (keamanan) |
| Ongkir di checkout | Dihapus total, kirim via chat | Keputusan user 8 Okt 2026 |
| fee_by=buyer (buyer bayar gateway fee) | fee_by=user (seller absorbs) | Keputusan user 18 Okt 2026 |
| Middleware /t/ via edge function | Dihapus (Hobby 12 limit) | Deploy gagal |
| Multi-toko ditunda | Dikerjakan Fase A+B | Keputusan user 13 Okt 2026 |

## D. Keputusan yang belum dijawab pengguna

- Apakah buyer login via Google OAuth (butuh Google Cloud setup) atau email+password saja?
- Apakah transfer manual admin approve perlu notifikasi ke seller?
- Apakah chat eskalasi ke seller perlu notifikasi (existing notifications system)?
- Apakah ongkir otomatis via kurir (ditolak, kirim via chat) — final.

## E. Sumber keputusan

- `.opencode/AGENTS.md` (aturan kerja)
- `.opencode/TASKS.md` (backlog & status)
- `docs/PRD.md` (keputusan produk)
- `docs/ARCHITECTURE.md` (arsitektur)
- Chat user (keputusan tanggal tercatat di TASKS.md)