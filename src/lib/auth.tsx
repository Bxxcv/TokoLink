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
  if (m.includes("user already registered")) return "Email ini sudah terdaftar. Masuk saja.";
  if (m.includes("password should be")) return "Kata sandi terlalu lemah.";
  if (m.includes("rate limit") || m.includes("too many requests"))
    return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
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

  const payload = { id: userId, role: "seller", ...(draft ?? {}) };
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

/** Bungkus halaman `/app/*`: belum login → redirect `/login`. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading, profile } = useAuth();
  const suspended = !!profile && profile.status === "ditangguhkan";
  useEffect(() => {
    if (loading) return;
    if (!session) navigate("/login");
    else if (suspended) {
      // Akun ditangguhkan admin → paksa keluar agar tidak bisa masuk lagi.
      supabase.auth.signOut().then(() => navigate("/login"));
    }
  }, [loading, session, suspended]);
  if (loading || !session || suspended) return null;
  return <>{children}</>;
}

/** Bungkus halaman `/admin/*`: belum login → `/login`, bukan admin → `/app`. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, loading, role, profile } = useAuth();
  const suspended = !!profile && profile.status === "ditangguhkan";
  useEffect(() => {
    if (loading) return;
    if (!session) navigate("/login");
    else if (suspended) {
      supabase.auth.signOut().then(() => navigate("/login"));
    } else if (role !== "admin") navigate("/app");
  }, [loading, session, role, suspended]);
  if (loading || !session || role !== "admin" || suspended) return null;
  return <>{children}</>;
}
