# ENVIRONMENT_AND_MCP — Setup & Integrasi TokoLink

## 1. Environment (terverifikasi)

- **OS:** Linux (container/sandbox)
- **Node.js:** v22.23.2
- **npm:** (bundled with node)
- **Git:** tersedia
- **OpenCode:** v1.19.0
- **Terminal:** bash (shell)

## 2. Lokasi konfigurasi penting

| File | Lokasi | Keterangan |
|------|--------|------------|
| `.env` (lokal) | `/public/TokoLink/.env` | Secret lokal (gitignored). JANGAN commit. |
| `.env.example` | `/public/TokoLink/.env.example` | Template (tanpa nilai). |
| `opencode.json` (root) | `/public/TokoLink/opencode.json` | Model default: opencode/beam-free |
| `.opencode/opencode.json` | `/public/TokoLink/.opencode/opencode.json` | Coordinator + instructions + MCP |
| Supabase MCP config | `/public/.config/opencode/opencode.json` | Supabase + Vercel MCP |
| Agent instructions | `/public/TokoLink/.opencode/agents/*.md` | 12 file |
| Skill | `/public/TokoLink/.opencode/skill/` | 3 skill |

## 3. Variabel lingkungan (nama + fungsi + verifikasi)

| Nama | Tipe | Fungsi | Verifikasi |
|------|------|--------|------------|
| VITE_SUPABASE_URL | config (publik) | URL Supabase | Cek di Supabase dashboard → Settings → API |
| VITE_SUPABASE_ANON_KEY | config (publik) | Anon key Supabase | Dashboard → Settings → API |
| SUPABASE_URL | secret (server) | URL Supabase (server) | Sama dengan VITE_SUPABASE_URL |
| SUPABASE_ANON_KEY | secret (server) | Anon key (server) | Sama dengan VITE_SUPABASE_ANON_KEY |
| SUPABASE_SERVICE_ROLE_KEY | secret (server) | Bypass RLS (server only) | Dashboard → Settings → API → service_role |
| BUATQRIS_ACCOUNT_ID | secret (server) | ID akun BuatQris | Dasbor BuatQris → Open API → Kredensial |
| BUATQRIS_SECRET_TOKEN | secret (server) | Token rahasia BuatQris | Dasbor → Open API → Kredensial |
| BUATQRIS_SIGNING_SECRET | secret (server) | Verifikasi HMAC webhook | Dasbor → Open API → Signing Secret |
| BUATQRIS_TEST | secret (server) | `0`=live, `1`=sandbox | Set di Vercel env |
| BUATQRIS_CALLBACK_URL | secret (server) | URL webhook | `https://tokolink.store/api/buatqris-webhook` |
| CRON_SECRET | secret (server) | Proteksi /api/sweep-stale | Generate acak (openssl rand -hex 32) |
| BREVO_API_KEY | secret (server) | Kirim OTP reset sandi | Dasbor Brevo → API Keys |
| BREVO_SENDER_EMAIL | secret (server) | Email pengirim (terverifikasi) | Dasbor Brevo → Senders |
| TOKEN_GITHUB | secret (lokal) | Push GitHub | github.com/settings/tokens |
| VERCEL_TOKEN | secret (lokal) | Kelola Vercel via API | vercel.com/account/tokens |

**JANGAN** tampilkan nilai secret di chat, log, commit, atau dokumentasi. Jangan commit .env.

## 4. Status Supabase MCP

- **Konfigurasi:** ditemukan di `/public/.config/opencode/opencode.json`.
- **URL:** `https://mcp.supabase.com/mcp?project_ref=ilmghtuqftpfwyklsloe&features=docs,account,database,debugging,development,functions,branching`
- **Status:** aktif (user re-enabled). Tools berhasil dipanggil (query SQL, apply migration).
- **Keterbatasan:** tool count besar (bisa membanjiri context). User bisa nonaktifkan jika perlu.
- **Cara verifikasi:** `opencode mcp list` → supabase harus "connected".

## 5. Status Vercel MCP

- **Konfigurasi:** ditemukan di `/public/.config/opencode/opencode.json` dan `.opencode/opencode.json`.
- **URL:** `https://mcp.vercel.com`
- **Status:** aktif, butuh sign-in via `/mcps` → vercel → Sign in (OAuth).
- **Error yang pernah terjadi:** "maximum number of items is 128" (tool count terlalu besar) + "invalid_value".
- **Dugaan penyebab:** Vercel MCP mengekspos terlalu banyak tool; OpenCode limit 128 tools total.
- **Cara diagnosis:** coba nonaktifkan Supabase MCP dulu, lalu aktifkan Vercel MCP saja, restart OpenCode, cek `/mcps`.
- **Alternatif:** kelola Vercel via `VERCEL_TOKEN` di `.env` + node fetch (sudah dipakai sebelumnya).

## 6. Batas akses

- **Development:** lokal (Acode/terminal), .env dengan nilai asli, Supabase MCP aktif.
- **Staging:** belum ada environment terpisah.
- **Production:** Vercel (tokolink.store). JANGAN ubah DB/deploy tanpa persetujuan eksplisit.
- **Sandbox BuatQris:** BUATQRIS_TEST=1 (preview/dev), 0 (production).

## 7. Pemulihan koneksi

1. Pastikan `.env` ada dan terisi (salin dari `.env.example`).
2. Pasang OpenCode: `npm install -g opencode` (atau sesuai instruksi resmi).
3. Pasang dependency proyek: `npm install`.
4. Verifikasi build: `npm run build`.
5. Verifikasi tipe: `npx tsc --noEmit`.
6. Hubungkan Supabase MCP: edit `/public/.config/opencode/opencode.json` → supabase enabled: true.
7. Hubungkan Vercel MCP: `/mcps` → vercel → Sign in (atau pakai VERCEL_TOKEN).
8. Verifikasi: `opencode mcp list` → kedua server connected.
9. Baca `docs/handover/MASTER_CONTEXT.md` → `CURRENT_STATE.md` → `TASKS.md`.