# SKILLS_AND_TOOLS — Inventaris Skill & Tool TokoLink

## 1. Skill yang ada di repository

| Skill | Lokasi | Tujuan |
|-------|--------|--------|
| supabase-rls-patterns | `.opencode/skill/supabase-rls-patterns/SKILL.md` | Pola RLS baku untuk semua tabel |
| buatqris-webhook | `.opencode/skill/buatqris-webhook/SKILL.md` | Integrasi BuatQris (create order, webhook HMAC) |
| ui-interaction-patterns | `.opencode/skill/ui-interaction-patterns/SKILL.md` | Pola toggle & responsif |

## 2. MCP yang terkonfigurasi

| MCP | URL | Status | Tools count |
|-----|-----|--------|-------------|
| Supabase | `https://mcp.supabase.com/mcp?project_ref=ilmghtuqftpfwyklsloe&features=...` | Aktif (user re-enabled) | Banyak (bisa >128 jika digabung Vercel) |
| Vercel | `https://mcp.vercel.com` | Aktif (user auth via OAuth) | Banyak (bisa >128) |

## 3. Tool count issue

- OpenCode limit: 128 tools total.
- Supabase MCP + Vercel MCP + built-in tools bisa melebihi 128 → error "maximum number of items is 128".
- Solusi: nonaktifkan salah satu MCP (Supabase jika tidak perlu DB query, atau Vercel jika tidak perlu deploy).
- Atau kelola via API (VERCEL_TOKEN, SUPABASE_SERVICE_ROLE_KEY) tanpa MCP.

## 4. Rekomendasi evaluasi `obra/superpowers`

**Status: BELUM DIPASANG** (belum terverifikasi).

- Repository: https://github.com/obra/superpowers (perlu verifikasi resmi).
- Tujuan: pekerjaan kompleks multi-agent.
- Langkah berikutnya: verifikasi repository resmi, instruksi instalasi, kompatibilitas dengan OpenCode v1.19.0, izin yang diminta, metode pemasangan paling aman.
- Jangan pasang sekarang. Jangan mengambil repository yang salah.

## 5. Validasi skill

- Setiap skill harus dibaca sebelum menyentuh fitur terkait (aturan di AGENTS.md).
- Skill tidak otomatis aktif; agent harus memanggil `skill` tool.
- Verifikasi: baca SKILL.md, ikuti aturan di dalamnya.