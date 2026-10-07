import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { navigate } from "./router";

export type Role = "seller" | "admin";

export type Profile = {
  id: string;
  role: Role;
  store_name: string | null;
  store_slug: string | null;
  owner_name: string | null;
  city: string | null;
  wa_number: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  category: string | null;
  bio: string | null;
  address: string | null;
  is_closed: boolean;
  plan: string;
  status: string;
};

export type ProfileDraft = {
  owner_name?: string;
  store_name?: string;
  store_slug?: string;
  wa_number?: string;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  /** Muat ulang row `profiles` (dipakai setelah simpan pengaturan). */
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<AuthState>({
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
  refresh: async () => {},
});

export function useAuth() {
  return useContext(AuthCtx);
}

/** Pesan error Supabase Auth → bahasa Indonesia yang ramah. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email atau kata sandi salah.";
  if (m.includes("email not confirmed")) return "Email belum diverifikasi. Cek kotak masuk Anda.";
  if (m.includes("user already registered")) return "Email ini tidak bisa dipakai. Coba masuk atau pakai email lain.";
  if (m.includes("confirmation") && m.includes("email")) return "Email verifikasi gagal dikirim (SMTP bermasalah). Coba lagi atau hubungi admin.";
  if (m.includes("error sending")) return "Email verifikasi gagal dikirim (SMTP bermasalah). Coba lagi atau hubungi admin.";
  if (m.includes("rate limit") || m.includes("too many requests") || m.includes("email rate limit"))
    return "Terlalu banyak percobaan. Tunggu ±1 menit lalu coba lagi.";
  if (m.includes("password should be")) return "Kata sandi terlalu lemah.";
  return "Terjadi kesalahan. Coba lagi.";
}

/**
 * Pastikan row `profiles` ada untuk user yang login. Insert baris default
 * (role `seller`) kalau belum ada. Dipakai saat login & register — tanpa
 * trigger/database object baru, hanya tabel yang sudah ada di schema.sql.
 */
export async function ensureProfile(userId: string, draft?: ProfileDraft): Promise<Profile | null> {
  const { data: existing } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (existing) return existing as Profile;

  // SECURITY HOTFIX BUG-001: JANGAN kirim role/plan/status dari browser.
  // Nilai default aman (seller/gratis/aktif) ditentukan database + trigger
  // protect_profiles_privileged. Client hanya kirim field profil biasa.
  const payload = { id: userId, ...(draft ?? {}) };
  const { data: created, error } = await supabase.from("profiles").insert(payload).select("*").single();
  if (!error) return created as Profile;

  // Slug sudah dipakai seller lain → coba sekali lagi dengan akhiran unik.
  if (error.code === "23505" && draft?.store_slug) {
    const retry = { ...payload, store_slug: `${draft.store_slug}-${userId.slice(0, 4)}` };
    const second = await supabase.from("profiles").insert(retry).select("*").single();
    if (!second.error) return second.data as Profile;
  }
  return null;
}

function draftFromUser(user: User): ProfileDraft {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const pick = (k: string) => (typeof meta[k] === "string" ? (meta[k] as string) : undefined);
  return {
    owner_name: pick("owner_name"),
    store_name: pick("store_name"),
    store_slug: pick("store_slug"),
    wa_number: pick("wa_number"),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    role: null,
    loading: true,
    refresh: async () => {},
  });

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) return;
    const profile = await ensureProfile(session.user.id, draftFromUser(session.user));
    setState((prev) => ({ ...prev, profile, role: profile?.role ?? null }));
  }, []);

  useEffect(() => {
    let alive = true;

    const applySession = async (session: Session | null) => {
      if (!alive) return;
      if (!session) {
        setState((prev) => ({ session: null, user: null, profile: null, role: null, loading: false, refresh: prev.refresh }));
        return;
      }
      setState((prev) => ({ ...prev, session, user: session.user, loading: true }));
      const profile = await ensureProfile(session.user.id, draftFromUser(session.user));
      if (!alive) return;
      setState((prev) => ({ session, user: session.user, profile, role: profile?.role ?? null, loading: false, refresh: prev.refresh }));
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setState((prev) => ({ ...prev, refresh }));
  }, [refresh]);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

/** Keluar: hapus session Supabase lalu kembali ke halaman login. */
export async function signOut() {
  await supabase.auth.signOut();
  navigate("/login");
}

/** Bungkus halaman `/app/*`: belum login → redirect `/login`.
 *  Akun ditangguhkan/nonaktif → paksa keluar + ke halaman penjelasan. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading, profile } = useAuth();
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    if (!loading && !session) navigate("/login");
  }, [loading, session]);
  useEffect(() => {
    if (!loading && session && profile && profile.status !== "aktif") {
      setBlocked(true);
    }
  }, [loading, session, profile]);
  useEffect(() => {
    if (!blocked) return;
    supabase.auth.signOut().finally(() => navigate("/login"));
  }, [blocked]);
  if (loading || !session) return null;
  if (blocked || (profile && profile.status !== "aktif")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6 text-center">
        <div className="max-w-sm rounded-xl border border-line bg-white p-8 shadow-card">
          <h1 className="text-[20px] font-extrabold text-ink">Akun dinonaktifkan</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Akun Anda berstatus “{profile?.status}”. Hubungi admin TokoLink untuk mengaktifkan kembali.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

/** Bungkus halaman `/admin/*`: belum login → `/login`, bukan admin → `/app`. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, loading, role } = useAuth();
  useEffect(() => {
    if (loading) return;
    if (!session) navigate("/login");
    else if (role !== "admin") navigate("/app");
  }, [loading, session, role]);
  if (loading || !session || role !== "admin") return null;
  return <>{children}</>;
}
