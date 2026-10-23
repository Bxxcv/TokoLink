# ANDROID_RECOVERY_GUIDE — Pemulihan dari Nol (Acode/OpenCode)

## 1. Sebelum menghapus data Acode

Checklist amankan data:
- [ ] Source code tersimpan di GitHub (commit + push terbaru).
- [ ] File baru/untracked sudah dicommit atau disalin ke lokasi aman.
- [ ] Dokumentasi handover tersimpan di luar data Acode (GitHub, cloud, atau HP lain).
- [ ] `.env` (berisi secret) sudah dicatat di password manager (JANGAN di Git).
- [ ] Riwayat chat penting (keputusan produk) sudah diringkas di DECISIONS.md.
- [ ] Daftar task/backlog tersimpan di `.opencode/TASKS.md` (sudah di-push).
- [ ] Screenshot bukti (jika ada) tersimpan di lokasi aman.
- [ ] Semua perubahan lokal sudah di-commit (`git status` bersih).

## 2. Apa yang hilang vs tetap saat hapus data Acode

| Item | Hilang? | Keterangan |
|------|---------|------------|
| Source code proyek | Tergantung | Jika tersimpan di /public/TokoLink dan tidak di-backup → hilang. Pastikan push ke GitHub dulu. |
| Konfigurasi OpenCode (.opencode/) | Hilang | Perlu dipulihkan dari Git (sudah di-commit). |
| Agent instructions (.opencode/agents/) | Hilang | Perlu dipulihkan dari Git. |
| Kredensial (.env) | Hilang | Perlu diisi ulang dari password manager/dashboard. |
| Session Supabase/Vercel | Hilang | Perlu login ulang. |
| MCP config (/public/.config/opencode/) | Hilang | Perlu setup ulang. |
| Node modules | Hilang | `npm install` ulang. |
| Riwayat chat AI | Hilang | Tidak bisa dipulihkan; gunakan handover docs. |

## 3. Langkah pemulihan

### 3.1 Pasang terminal & Node.js

Pilihan (pilih sesuai ketersediaan):
- **Termux** (Android): `pkg install nodejs git` (versi Node mungkin lebih lama, cek kompatibilitas).
- **Acode + terminal plugin**: jika tersedia.
- **Code-server / VS Code web**: jika akses internet stabil.

Pastikan Node.js >= 18 dan npm tersedia: `node --version && npm --version`.

### 3.2 Pulihkan repository

```bash
cd /public
git clone https://github.com/Bxxcv/TokoLink.git
cd TokoLink
```

Jika ada perubahan lokal yang belum di-push, pulihkan dari backup manual dulu.

### 3.3 Pasang dependency

```bash
npm install
```

### 3.4 Pulihkan konfigurasi

1. Salin `.env.example` → `.env`, isi dari password manager / dashboard.
2. Pasang OpenCode (sesuai instruksi resmi): `npm install -g opencode` atau metode lain.
3. Verifikasi: `opencode --version` (harus v1.19.0 atau kompatibel).
4. Konfigurasi agent sudah di repo (`.opencode/`), tidak perlu setup manual.

### 3.5 Hubungkan MCP

1. **Supabase:** edit `/public/.config/opencode/opencode.json`:
   ```json
   { "mcp": { "supabase": { "type": "remote", "url": "https://mcp.supabase.com/mcp?project_ref=ilmghtuqftpfwyklsloe&features=docs,account,database,debugging,development,functions,branching", "enabled": true } } }
   ```
2. **Vercel:** `/mcps` → vercel → Sign in (OAuth) atau pakai `VERCEL_TOKEN` di `.env`.
3. Verifikasi: `opencode mcp list` → kedua server connected.

### 3.6 Validasi

```bash
npm run build          # harus PASS
npx tsc --noEmit       # cek error baru
```

### 3.7 Baca konteks

1. Baca `docs/handover/MASTER_CONTEXT.md`.
2. Baca `docs/handover/CURRENT_STATE.md`.
3. Baca `.opencode/AGENTS.md` (aturan kerja).
4. Baca `.opencode/TASKS.md` (backlog & status).
5. Baca `docs/PRD.md` dan `docs/ARCHITECTURE.md`.

### 3.8 Lanjutkan task

- Task prioritas pertama: lihat `BACKLOG_MASTER.md` (P0 sisa).
- Jalankan migrasi SQL yang belum diterapkan (cek `CURRENT_STATE.md`).
- Verifikasi env Vercel (BUATQRIS_TEST, callback URL, signing secret).

## 4. Checklist setelah instalasi ulang

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

## 5. Catatan penting

- Penghapusan data Acode **tidak** otomatis menghapus konfigurasi OS (Node.js, Git) jika diinstall via Termux/system. Tapi konfigurasi OpenCode (`/public/.config/opencode/`) dan riwayat chat **hilang**.
- File proyek di `/public/TokoLink` **hilang** jika tidak di-backup/push. Pastikan `git push` sebelum hapus.
- Kredensial (`.env`) **hilang** — simpan di password manager sebelum hapus.
- MCP config **hilang** — setup ulang setelah install.
- Jangan anggap penghapusan data Acode = reset total sistem. Node.js dan Git mungkin tetap ada.