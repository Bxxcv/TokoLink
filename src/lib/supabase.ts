import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diset. Salin .env.example menjadi .env lalu isi dari Supabase dashboard."
  );
}

const REMEMBER_OFF_FLAG = "tl_remember_off";

/**
 * Session Supabase default-nya persisten (localStorage): tetap login walau
 * browser ditutup. Kalau user TIDAK centang "Ingat saya" di halaman login,
 * session hanya disimpan di memori → otomatis keluar saat tab ditutup.
 */
let memoryStore: Record<string, string> = {};

function persistAcrossRestarts(): boolean {
  try {
    return localStorage.getItem(REMEMBER_OFF_FLAG) !== "1";
  } catch {
    return true;
  }
}

const sessionStorageAdapter = {
  getItem(key: string): string | null {
    if (persistAcrossRestarts()) {
      try {
        return localStorage.getItem(key);
      } catch {
        return memoryStore[key] ?? null;
      }
    }
    return memoryStore[key] ?? null;
  },
  setItem(key: string, value: string): void {
    if (persistAcrossRestarts()) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        /* penyimpanan penuh/diblokir → fallback ke memori */
      }
    }
    memoryStore[key] = value;
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* abaikan */
    }
    delete memoryStore[key];
  },
};

/** Dipanggil SEBELUM sign-in/sign-up dengan nilai checkbox "Ingat saya". */
export function prepareSessionPersistence(remember: boolean): void {
  try {
    if (remember) localStorage.removeItem(REMEMBER_OFF_FLAG);
    else localStorage.setItem(REMEMBER_OFF_FLAG, "1");
  } catch {
    /* abaikan */
  }
  memoryStore = {};
}

/** Hapus sisa session persisten (dipakai setelah login tanpa "Ingat saya"). */
export function purgePersistedSessions(): void {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("sb-")) doomed.push(k);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* abaikan */
  }
}

// Client browser — HANYA pakai anon key. Service role key TIDAK BOLEH
// ada di file ini / di kode frontend manapun (lihat .opencode/AGENTS.md).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: sessionStorageAdapter },
});
