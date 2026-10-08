/**
 * State global aplikasi: keranjang belanja + toast + kode promo.
 * Tidak ada data contoh di sini — isi keranjang dari produk database.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = { id: string; qty: number };
type Toast = { id: number; msg: string; tone: "ok" | "info" | "warn" | "bad" };

type AppCtx = {
  cart: CartItem[];
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  toast: (msg: string, tone?: Toast["tone"]) => void;
  toasts: Toast[];
  dismiss: (id: number) => void;
  promo: string | null;
  setPromo: (p: string | null) => void;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [promo, setPromo] = useState<string | null>(null);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (msg: string, tone: Toast["tone"] = "ok") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, msg, tone }]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
    },
    [],
  );

  const add = useCallback((id: string, qty = 1) => {
    setCart((c) => {
      const found = c.find((x) => x.id === id);
      if (found) return c.map((x) => (x.id === id ? { ...x, qty: x.qty + qty } : x));
      return [...c, { id, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((c) =>
      qty <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty } : x)),
    );
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const count = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const value = useMemo(
    () => ({ cart, add, setQty, clear, count, toast, toasts, dismiss, promo, setPromo }),
    [cart, add, setQty, clear, count, toast, toasts, dismiss, promo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp harus dipakai di dalam AppProvider");
  return c;
}
