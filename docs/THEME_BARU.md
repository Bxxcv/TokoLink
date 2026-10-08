# Tema Etalase — Set Baru (Okt 2026)

Menggantikan `THEME_ENGINE.md` lama (set 8 tema pertama sudah dihapus).

## Set aktif (8 + Klasik)

| ID | Nama | Untuk |
|---|---|---|
| klasik | Klasik | Bawaan (tetap didukung) |
| warung-rame | Warung Rame | Kuliner harian |
| kopi-sore | Kopi Sore | Kopi & bakery artisan |
| butik-rapi | Butik Rapi | Fashion |
| jasa-kilat | Jasa Kilat | Servis & jasa |
| dapur-ngebul | Dapur Ngebul | Katering & jajanan |
| kriya-asli | Kriya Asli | Kerajinan, handmade |
| digital-kilat | Digital Kilat | Produk digital (gelap) |
| konsultan-tenang | Konsultan Tenang | Jasa profesional |

Spesifikasi desain: `Hasil_Repair/Brief_Desain_Tema.md` (sumber AI desainer).

## Aturan engine (tetap)

- Kontrak props: `src/storefront/types.ts` — tema HANYA presentasi,
  dilarang query Supabase / sentuh auth / cart langsung.
- Peta ID → komponen: `src/storefront/themes/index.ts`.
- Daftar + nama tampilan: `src/storefront/registry.ts`.
- Helper bersama: `src/storefront/themes/shared.tsx`
  (`ThemeBioLinks`, `nextOpenText`, `skuShort`, `hasPhoto`).
- Pilihan seller tersimpan di `store_theme.theme_id`.
- Migrasi ID lama → baru: `database/migrate_theme_ids_v2.sql`.
- Warna aksen dashboard (`store_theme.accent`) TIDAK dipakai tema engine
  (tiap tema punya palet sendiri) — dipakai tampilan Klasik + Checkout.

## Font

Semua font tema dipetakan ke yang sudah dimuat di `index.html`
(Bricolage Grotesque, Fraunces, Newsreader, Instrument Serif,
IBM Plex Mono/Sans, Space Grotesk, Plus Jakarta Sans, Archivo).
Dilarang menambah font tanpa persetujuan (lihat AGENTS.md aturan #3).
