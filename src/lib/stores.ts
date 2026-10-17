import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

export type StoreRef = {
  id: string;
  store_name: string | null;
  store_slug: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_closed: boolean | null;
};

const ACTIVE_KEY = "tl_active_store";
/** Event internal: memberi tahu SEMUA pemanggil useStores (layout, halaman,
 *  pemilih toko) supaya ikut pindah seketika — tanpa reload halaman. */
const ACTIVE_EVENT = "tl_active_store_change";

/** Daftar toko milik user login + toko aktif. 1 toko = langsung itu
 *  (pemilih disembunyikan pemanggil). Aktif tersimpan di localStorage. */
export function useStores() {
  const [stores, setStores] = useState<StoreRef[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setStores([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("store_members")
      .select("store_id, stores(id,store_name,store_slug,avatar_url,cover_url,is_closed)")
      .eq("user_id", uid)
      .order("store_id");
    const list = (((data ?? []) as {
      store_id: string;
      stores: StoreRef | StoreRef[] | null;
    }[]).map((r) => (Array.isArray(r.stores) ? r.stores[0] : r.stores)).filter(Boolean)) as StoreRef[];
    setStores(list);
    // Aktif tersimpan masih anggota? Kalau tidak, pakai toko pertama.
    const saved = (() => {
      try {
        return localStorage.getItem(ACTIVE_KEY);
      } catch {
        return null;
      }
    })();
    const ok = saved && list.some((s) => s.id === saved);
    const next = ok ? saved : (list[0]?.id ?? null);
    setActiveIdState(next);
    try {
      if (next) localStorage.setItem(ACTIVE_KEY, next);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* abaikan */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Ikut pindah saat pemanggil useStores lain mengubah toko aktif
  // (pemilih toko di header/drawer) — halaman & badge langsung ikut.
  useEffect(() => {
    const onActive = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (typeof id === "string" && id) setActiveIdState(id);
    };
    window.addEventListener(ACTIVE_EVENT, onActive);
    return () => window.removeEventListener(ACTIVE_EVENT, onActive);
  }, []);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    try {
      localStorage.setItem(ACTIVE_KEY, id);
    } catch {
      /* abaikan */
    }
    window.dispatchEvent(new CustomEvent(ACTIVE_EVENT, { detail: id }));
  }, []);

  const active = stores.find((s) => s.id === activeId) ?? stores[0] ?? null;
  return { stores, active, activeId: active?.id ?? null, setActiveId, reload: load, loading };
}
