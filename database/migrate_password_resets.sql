-- ============================================================
-- TokoLink — Kode OTP reset sandi (Okt 2026)
-- Alur link Supabase terlalu rapuh (prefetch/token sekali pakai).
-- Gantinya: server bikin kode 6 digit → kirim via Brevo API →
-- verifikasi + ganti sandi via service_role. Hash disimpan, bukan
-- kode mentah. RLS: client TIDAK punya akses sama sekali.
-- Idempotent.
-- ============================================================

create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists password_resets_email_idx on password_resets (email, used, expires_at);

alter table password_resets enable row level security;

-- Tidak ada policy = tidak ada akses client. Server pakai service_role.
drop policy if exists "no client access" on password_resets;

revoke all on password_resets from anon, authenticated;

-- ---------- verifikasi ----------
-- select * from password_resets; → sebagai authenticated harus ERROR/0 baris.
