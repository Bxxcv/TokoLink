# OPENCODE_TEAM — Tim AI TokoLink

## 1. Agent yang terdaftar (12 spesialis + 1 koordinator)

| Agent | Model | Mode | Steps | Edit | Bash | Tugas utama |
|-------|-------|------|-------|------|------|-------------|
| coordinator (Beam) | opencode/beam-free | primary | — | ask | ask | Koordinator utama, delegasi, verifikasi |
| frontend-dev | opencode/space-bunny-free | subagent | 25 | allow | deny | UI React, form, responsif |
| backend-dev | opencode/nemotron-3.5-super-vl-free | subagent | 30 | allow | allow | Server-side, RPC, webhook |
| database-engineer | opencode/mimo-v2.6-flash-free | subagent | 25 | allow | deny | Skema, migrasi, RLS |
| api-integration | opencode/mimo-v2.6-flash-free | subagent | 25 | allow | allow | Integrasi API luar |
| security-auditor | opencode/nemotron-3.5-super-vl-free | subagent | 30 | deny | allow | Audit keamanan (read-only) |
| qa-engineer | opencode/glm-5.3-flash-free | subagent | 25 | deny | allow | Uji build/tipe/alur |
| bug-investigator | opencode/nemotron-3.5-super-vl-free | subagent | 30 | deny | allow | Cari akar masalah |
| ui-ux-designer | opencode/space-bunny-free | subagent | 25 | deny | deny | Review UX + usulan |
| performance-engineer | opencode/deepseek-v4.1-flash-free | subagent | 25 | allow | allow | Skala, indeks, kuota |
| product-manager | opencode/longcat-2.5-preview-free | subagent | 15 | deny | deny | Keputusan produk, opsi |
| devops-engineer | opencode/nemotron-3.5-lightning-free | subagent | 20 | allow | allow | Deploy, env, cron |
| tech-writer | opencode/deepseek-v4.1-flash-free | subagent | 15 | allow | deny | Dokumentasi |

## 2. Konfigurasi

- `.opencode/opencode.json`: coordinator primary, instructions list, permission (edit/bash/webfetch = ask), mcp (vercel enabled).
- `.opencode/agents/*.md`: instruksi per-agent (frontmatter + body + standar kerja 10 poin + format laporan).
- `.opencode/AGENTS.md`: aturan kerja global + standar global engineering.
- `.opencode/TASKS.md`: backlog & status.
- `.opencode/benchmarks.md`: penempatan model + benchmark.
- `.opencode/skill/`: supabase-rls-patterns, buatqris-webhook, ui-interaction-patterns.

## 3. MCP

- **Supabase**: `https://mcp.supabase.com/mcp?project_ref=ilmghtuqftpfwyklsloe` — aktif (user re-enabled). Tools: database, debugging, development, functions, branching.
- **Vercel**: `https://mcp.vercel.com` — aktif (user auth via OAuth). Butuh sign-in via `/mcps`.

## 4. Mekanisme delegasi

- Coordinator (Beam) membagi tugas ke subagent via tool `Task`.
- Subagent bekerja paralel jika tidak konflik file.
- Subagent melaporkan: Status / Hasil / Perubahan / Tes / Kendala.
- Coordinator verifikasi hasil gabungan sebelum menyatakan selesai.
- Jika agent gagal/timeout: retry terbatas dengan konteks lebih ringkas.

## 5. Pembagian file (hindari konflik)

- `src/pages/Storefront.tsx`: frontend-dev, ui-ux-designer (review)
- `src/pages/DashboardA.tsx`, `DashboardB.tsx`: frontend-dev
- `src/pages/Admin.tsx`: frontend-dev (admin), security-auditor (review)
- `src/pages/Auth.tsx`, `Chat.tsx`: frontend-dev
- `src/components/layout.tsx`: frontend-dev
- `src/lib/*.ts`: backend-dev, database-engineer
- `api/*.ts`: backend-dev, api-integration
- `database/*.sql`: database-engineer
- `.opencode/*`, `docs/*`: tech-writer, coordinator

## 6. Masalah koordinasi yang terbukti

- Supabase MCP dilaporkan terlalu banyak tool (user nonaktifkan lalu aktifkan lagi).
- Vercel MCP: "maximum number of items is 128" error (tool count terlalu besar).
- Agent timeout pada task besar (langkah maksimum tercapai).
- DeepSeek report: agent tidak selalu mengikuti format laporan, tidak bertanya saat bingung, tidak memverifikasi sebelum klaim selesai.
- Penyebab: instruksi lama vs baru kontradiktif, model acak, tidak ada checkpoint verifikasi.

## 7. Konfigurasi yang perlu dipulihkan setelah instalasi ulang

1. `.opencode/opencode.json` — coordinator primary + instructions + mcp (vercel enabled, supabase optional).
2. `.opencode/agents/*.md` — 12 file instruksi per-agent.
3. `.opencode/AGENTS.md` — aturan kerja + standar global.
4. `.opencode/TASKS.md` — backlog & status.
5. `.opencode/benchmarks.md` — penempatan model.
6. `.opencode/skill/` — 3 skill (supabase-rls, buatqris-webhook, ui-interaction).
7. Re-enable Supabase MCP jika diperlukan (tools count besar).
8. Re-auth Vercel MCP via `/mcps` → vercel → Sign in.

## 8. Aturan pembagian kerja

- Satu task per sesi, berurutan sesuai fase.
- Tugas independen paralel; yang bergantung diurutkan.
- Konteks minimum, bukan seluruh riwayat.
- Tentukan pemilik file/tugas untuk hindari konflik edit.
- Minta bukti, perubahan, hasil tes, kendala ringkas.
- Verifikasi hasil gabungan sebelum menyatakan selesai.
- Jika agent gagal/timeout: retry terbatas dengan konteks lebih ringkas.
- Jangan panggil semua agent untuk tugas kecil.