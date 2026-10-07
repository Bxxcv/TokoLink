import { THEMES, type ThemeDef } from "./data";

function stackNames(s: string) {
  return s
    .split(",")
    .map((x) => x.trim().replace(/"/g, ""))
    .join(", ");
}

export function themeMarkdown(t: ThemeDef): string {
  const p = t.palette;
  return `# Tema ${t.n} — ${t.name}
- Sasaran: ${t.sasaran}
- Suasana: ${t.mood}
- Palet: latar ${p.bg}, permukaan ${p.surface}, teks ${p.text}, redup ${p.muted}, aksen ${p.accent} (teks di atas aksen: ${t.onAccent}). Token semantik badge (bukan warna identitas ke-6): BUKA ${t.badges.buka}, TUTUP ${t.badges.tutup}, HABIS ${t.badges.habis}, SISA N ${t.badges.sisa}.
- Font: display ${t.fonts.display} — fallback ${stackNames(t.fonts.displayStack)}; isi ${t.fonts.body} — fallback ${stackNames(t.fonts.bodyStack)}. Tepat 2 keluarga.
- Ritme kartu: ${t.metrics.radius}; rasio foto ${t.metrics.photo}; gap antar kartu ${t.metrics.gap}; tinggi tombol ${t.metrics.button}.
- Header: ${t.spec.header}
- Profil & sampul: ${t.spec.profile}
- Tautan bio: ${t.spec.links}
- Jam lengkap: ${t.spec.hours}
- Filter: ${t.spec.filter}
- Kartu produk: ${t.spec.card}
- Keadaan tutup / stok 0 / kosong: ${t.spec.states}
- QR: ${t.spec.qr}
- Sketsa ASCII sederhana susunan HP (360px):

\`\`\`text
${t.ascii}
\`\`\`
`;
}

export function allThemesMarkdown(): string {
  const head = `# TokoLink — Etalase Toko: 8 Tema Baru
Format serahan per tema (Sasaran / Palet / Font / Header / Profil & sampul / Tautan bio /
Jam lengkap / Filter / Kartu produk / Keadaan tutup-stok0-kosong / QR / Sketsa ASCII).

Aturan yang dipegang semua tema:
1. Tidak ada elemen tanpa data — tanpa statistik karangan, badge palsu, janji, atau galeri.
2. Satu-satunya CTA beli = "tambah ke keranjang" → checkout QRIS. WA hanya sekunder (tanya stok).
3. Field yang dipakai: toko (nama, kota, bio, logo, sampul, status + jam hari ini + 7 hari, QR,
   jumlah keranjang), tautan bio (label + URL + ikon), produk (1 foto, nama, kategori, harga,
   stok/HABIS, SKU, deskripsi), filter (kategori asli + cari + reset).
4. Status TUTUP selalu terlihat dan mematikan tombol beli.
5. Mobile-first 360px, tanpa scroll horizontal, target sentuh >= 44px.

---

`;
  const table =
    `## Tabel palet & font (8 tema)\n\n` +
    `| # | Tema | Latar | Permukaan | Teks | Redup | Aksen | Display | Isi |\n` +
    `|---|------|-------|-----------|------|-------|-------|---------|-----|\n` +
    THEMES.map(
      (t) =>
        `| ${t.n} | ${t.name} | ${t.palette.bg} | ${t.palette.surface} | ${t.palette.text} | ${t.palette.muted} | ${t.palette.accent} | ${t.fonts.display} | ${t.fonts.body} |`,
    ).join("\n") +
    `\n\n`;

  return head + table + THEMES.map(themeMarkdown).join("\n---\n\n") + `\n`;
}
