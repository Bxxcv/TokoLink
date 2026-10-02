"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";

/* ── Toast ─────────────────────────────────────────────────────────────── */
type ToastVariant = "success" | "error" | "info";
interface Toast {
  id: number;
  variant: ToastVariant;
  title: string;
  desc?: string;
}
interface ToastCtx {
  push: (t: { variant?: ToastVariant; title: string; desc?: string }) => void;
}

const ToastContext = createContext<ToastCtx>({ push: () => {} });
export const useToast = () => useContext(ToastContext);

let toastSeq = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback(
    (t: { variant?: ToastVariant; title: string; desc?: string }) => {
      const id = toastSeq++;
      setToasts((cur) => [...cur.slice(-3), { id, variant: t.variant ?? "success", title: t.title, desc: t.desc }]);
      window.setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 4200);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="anim-toast pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-[0_12px_32px_-8px_rgba(27,26,35,0.18)]"
          >
            {t.variant === "success" && <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ok-500" />}
            {t.variant === "error" && <XCircle className="mt-0.5 size-5 shrink-0 text-bad-500" />}
            {t.variant === "info" && <Info className="mt-0.5 size-5 shrink-0 text-brand-500" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-5">{t.title}</p>
              {t.desc && <p className="mt-0.5 text-xs leading-4 text-mute">{t.desc}</p>}
            </div>
            <button
              onClick={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))}
              className="rounded-md p-1 text-mute transition hover:bg-canvas hover:text-ink"
              aria-label="Tutup"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Hook aksi admin (transition + toast) ──────────────────────────────── */
export function useAdminAction() {
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [, start] = useTransition();
  const { push } = useToast();

  const run = useCallback(
    (id: string, fn: () => Promise<{ ok: boolean; message: string }>) => {
      setPending((s) => new Set(s).add(id));
      start(async () => {
        try {
          const res = await fn();
          push(
            res.ok
              ? { variant: "success", title: res.message }
              : { variant: "error", title: "Gagal", desc: res.message },
          );
        } catch {
          push({ variant: "error", title: "Terjadi kesalahan", desc: "Coba lagi sebentar lagi." });
        } finally {
          setPending((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          });
        }
      });
    },
    [push],
  );

  return { run, pending };
}

/* ── Badge ────────────────────────────────────────────────────────────── */
const badgeTones = {
  neutral: "bg-canvas text-mute",
  brand: "bg-brand-50 text-brand-700",
  ok: "bg-ok-50 text-ok-700",
  warn: "bg-warn-50 text-warn-700",
  bad: "bg-bad-50 text-bad-700",
} as const;

export function Badge({
  tone = "neutral",
  dot,
  children,
  className = "",
}: {
  tone?: keyof typeof badgeTones;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badgeTones[tone]} ${className}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export const statusMeta: Record<string, { label: string; tone: keyof typeof badgeTones }> = {
  active: { label: "Aktif", tone: "ok" },
  pending: { label: "Menunggu", tone: "warn" },
  suspended: { label: "Ditangguhkan", tone: "bad" },
  free: { label: "Gratis", tone: "neutral" },
  premium: { label: "Premium", tone: "brand" },
  paid: { label: "Lunas", tone: "ok" },
  failed: { label: "Gagal", tone: "bad" },
  approved: { label: "Disetujui", tone: "ok" },
  rejected: { label: "Ditolak", tone: "bad" },
  processed: { label: "Diproses", tone: "ok" },
  draft: { label: "Draf", tone: "warn" },
  sent: { label: "Terkirim", tone: "ok" },
  admin: { label: "Admin", tone: "brand" },
  seller: { label: "Seller", tone: "ok" },
  buyer: { label: "Buyer", tone: "neutral" },
};

export function StatusBadge({ status }: { status: string }) {
  const m = statusMeta[status] ?? { label: status, tone: "neutral" as const };
  return (
    <Badge tone={m.tone} dot>
      {m.label}
    </Badge>
  );
}

/* ── Tombol ────────────────────────────────────────────────────────────── */
const btnVariants = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:scale-[0.98]",
  subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100 active:scale-[0.98]",
  outline: "border border-line bg-white text-ink hover:bg-canvas active:scale-[0.98]",
  ghost: "text-mute hover:bg-canvas hover:text-ink",
  danger: "bg-bad-500 text-white shadow-sm hover:bg-bad-600 active:scale-[0.98]",
  dangerGhost: "bg-bad-50 text-bad-700 hover:bg-bad-100 active:scale-[0.98]",
  ok: "bg-ok-500 text-white shadow-sm hover:bg-ok-600 active:scale-[0.98]",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof btnVariants;
  size?: "sm" | "md";
  loading?: boolean;
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${
        size === "sm" ? "h-8 px-3 text-xs" : "h-9.5 px-4 text-sm"
      } ${btnVariants[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function IconBtn({
  label,
  tone = "neutral",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: "neutral" | "bad" | "brand" | "ok" }) {
  const tones = {
    neutral: "text-mute hover:bg-canvas hover:text-ink",
    bad: "text-mute hover:bg-bad-50 hover:text-bad-600",
    brand: "text-mute hover:bg-brand-50 hover:text-brand-600",
    ok: "text-mute hover:bg-ok-50 hover:text-ok-600",
  };
  return (
    <button
      title={label}
      aria-label={label}
      className={`inline-flex size-8 items-center justify-center rounded-lg transition ${tones[tone]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ── Form ──────────────────────────────────────────────────────────────── */
export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`h-9.5 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition placeholder:text-mute/70 focus:border-brand-400 focus:ring-3 focus:ring-brand-100 ${className}`}
      {...rest}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      className={`w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm leading-6 outline-none transition placeholder:text-mute/70 focus:border-brand-400 focus:ring-3 focus:ring-brand-100 ${className}`}
      {...rest}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select
      className={`h-9.5 rounded-lg border border-line bg-white px-3 text-sm font-medium outline-none transition focus:border-brand-400 focus:ring-3 focus:ring-brand-100 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mute">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label ?? "toggle"}
      onClick={() => onChange(!on)}
      className={`relative h-6.5 w-11.5 shrink-0 rounded-full transition-colors duration-200 ${
        on ? "bg-brand-500" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5.5 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

/* ── Modal ────────────────────────────────────────────────────────────── */
export function Modal({
  open,
  onClose,
  title,
  tone = "neutral",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  tone?: "neutral" | "bad" | "ok";
  children?: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const ring = { neutral: "text-mute", bad: "text-bad-500", ok: "text-ok-500" }[tone];
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="anim-pop relative w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className={`font-display text-base font-bold ${ring}`}>{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-mute transition hover:bg-canvas" aria-label="Tutup">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-3">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/* ── Kartu & layout kecil ──────────────────────────────────────────────── */
export function Card({
  children,
  className = "",
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(27,26,35,0.04)] ${pad ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function CardHead({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 className="font-display text-[15px] font-bold">{title}</h3>
        {sub && <p className="mt-0.5 text-xs text-mute">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function PageHeader({
  title,
  desc,
  right,
}: {
  title: string;
  desc: string;
  right?: ReactNode;
}) {
  return (
    <div className="anim-rise mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[26px] font-bold leading-8 tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-mute">{desc}</p>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, desc }: { icon: ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-canvas text-mute">{icon}</div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      {desc && <p className="mt-1 max-w-xs text-xs text-mute">{desc}</p>}
    </div>
  );
}
