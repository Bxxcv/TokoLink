# RECOVERY_CHECKLIST — Checklist Sebelum & Setelah Hapus Data Acode

## Sebelum hapus data Acode

- [ ] Source code tersimpan di GitHub (commit + push terbaru).
- [ ] File baru/untracked sudah dicommit atau disalin ke lokasi aman.
- [ ] Dokumentasi handover tersimpan di luar data Acode (GitHub, cloud, atau HP lain).
- [ ] `.env` (berisi secret) sudah dicatat di password manager (JANGAN di Git).
- [ ] Riwayat chat penting (keputusan produk) sudah diringkas di DECISIONS.md.
- [ ] Daftar task/backlog tersimpan di `.opencode/TASKS.md` (sudah di-push).
- [ ] Screenshot bukti (jika ada) tersimpan di lokasi aman.
- [ ] Semua perubahan lokal sudah di-commit (`git status` bersih).
- [ ] Salinan dokumentasi handover tersimpan di luar Acode (Google Drive, HP lain, dll).

## Setelah instalasi ulang

- [ ] `git clone` berhasil
- [ ] `npm install` berhasil
- [ ] `npm run build` PASS
- [ ] `npx tsc --noEmit` (hanya warning lama)
- [ ] `.env` terisi (dari password manager)
- [ ] OpenCode terpasang (`opencode --version`)
- [ ] Supabase MCP connected (`opencode mcp list`)
- [ ] Vercel MCP connected (atau VERCEL_TOKEN valid)
- [ ] Baca MASTER_CONTEXT.md + CURRENT_STATE.md + TASKS.md
- [ ] Lanjutkan task prioritas pertama dari BACKLOG_MASTER.md

## Catatan penting

- Penghapusan data Acode **tidak** otomatis menghapus konfigurasi OS (Node.js, Git) jika diinstall via Termux/system. Tapi konfigurasi OpenCode (`/public/.config/opencode/`) dan riwayat chat **hilang**.
- File proyek di `/public/TokoLink` **hilang** jika tidak di-backup/push. Pastikan `git push` sebelum hapus.
- Kredensial (`.env`) **hilang** — simpan di password manager sebelum hapus.
- MCP config **hilang** — setup ulang setelah install.
- Jangan anggap penghapusan data Acode = reset total sistem. Node.js dan Git mungkin tetap ada.