import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import clsx from "clsx";
import { Link, navigate } from "../lib/router";
import { useApp } from "../lib/data";

export const cx = clsx;

/* ---------------------------------- icons --------------------------------- */
const PATHS: Record<string, ReactNode> = {
  home: <path d="M4 10.6 12 4l8 6.6V19a1.5 1.5 0 0 1-1.5 1.5H15V15H9v5.5H5.5A1.5 1.5 0 0 1 4 19z" />,
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  box: (
    <>
      <path d="M20.5 7.8 12 3.5 3.5 7.8v8.4L12 20.5l8.5-4.3z" />
      <path d="M3.5 7.8 12 12l8.5-4.2M12 12v8.5" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.5h12v17l-2.5-1.6L13 20.5l-2.5-1.6L8 20.5 6 19z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  wallet: (
    <>
      <rect x="3.5" y="6" width="17" height="13" rx="2.5" />
      <path d="M3.5 10h17M16 14.5h1.5" />
    </>
  ),
  chart: <path d="M4 20V4M4 20h16M8 16.5v-5M12.5 16.5v-9M17 16.5v-3" />,
  chartAlt: (
    <>
      <path d="M4 19h16" />
      <path d="M6.5 15.5 10 11l3 2.5 4.5-6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M16 5.6a3 3 0 0 1 0 5.8M17.5 14.9c2 .7 3.2 2.3 3.6 4.6" />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
      <path d="M14 14h3v3h-3zM19.5 14h1M14 19.5h1M17.5 19.5h3M19.5 17h1" />
    </>
  ),
  link: (
    <>
      <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.54 3.54 0 0 0-5-5l-1.2 1.2" />
      <path d="M13.5 10.5a3.5 3.5 0 0 0-5 0L6 13a3.54 3.54 0 0 0 5 5l1.2-1.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.4 1.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5Z" />
      <path d="M10.2 18.7a2 2 0 0 0 3.6 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20c.7-3.7 3.6-5.6 7.2-5.6s6.5 1.9 7.2 5.6" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.5 15.5 4 4" />
    </>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  chevron: <path d="m8.5 10.5 3.5 3.5 3.5-3.5" />,
  right: <path d="m10 7.5 4.5 4.5L10 16.5" />,
  left: <path d="M14 7.5 9.5 12 14 16.5" />,
  down: <path d="M12 5.5v13M6.5 13l5.5 5.5L17.5 13" />,
  arrowUp: <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />,
  arrowDown: <path d="M12 5v14M6.5 13.5 12 19l5.5-5.5" />,
  arrowRight: <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />,
  check: <path d="m5.5 12.5 4.2 4.2 8.8-9.4" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.2 12.3 2.6 2.6 5-5.4" />
    </>
  ),
  x: <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
  alert: (
    <>
      <path d="M12 4.5 21 19.5H3z" />
      <path d="M12 10v4M12 16.6v.4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.8v.4" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.8 12.2h9.4L17.5 7" />
      <path d="M10.3 10.5v5.5M13.7 10.5v5.5" />
    </>
  ),
  edit: <path d="M4.5 19.5h4L19 9a2.1 2.1 0 0 0-3-3L5.5 16.5zM14.5 7.5l2 2" />,
  eye: (
    <>
      <path d="M2.8 12S6.5 6 12 6s9.2 6 9.2 6-3.7 6-9.2 6-9.2-6-9.2-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M10.7 5.4A9.8 9.8 0 0 1 12 5.3c5.5.6 8.7 6.7 8.7 6.7a18.4 18.4 0 0 1-2.2 3M6.8 6.5A18 18 0 0 0 3.3 12s3.2 6.2 8.7 6.7c2 .2 3.8-.1 5.3-.8" />
      <path d="M4 4l16 16" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 5.5h-9a2 2 0 0 0-2 2v9" />
    </>
  ),
  download: <path d="M12 4v11M7 10.5l5 5 5-5M4.5 19.5h15" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  more: (
    <>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  truck: (
    <>
      <path d="M3.5 6.5h10v10h-10zM13.5 10h3.2l3.3 3.2v3.3h-6.5z" />
      <circle cx="7" cy="17.8" r="1.8" />
      <circle cx="17" cy="17.8" r="1.8" />
    </>
  ),
  star: (
    <path d="m12 4.5 2.3 4.9 5.2.7-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2L4.5 10l5.2-.7z" />
  ),
  wa: (
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  ),
  ig: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.8" cy="7.2" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  logout: <path d="M14 7.5V5.5h-9v13h9v-2M10.5 12h9M16.5 8.5 20 12l-3.5 3.5" />,
  tag: (
    <path d="M4.6 12.3 11 5.9a2 2 0 0 1 1.4-.6h5.2a2 2 0 0 1 2 2v5.2a2 2 0 0 1-.6 1.4l-6.4 6.4a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8Z" />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19 6v6c0 4-3 7-7 8.5C8 19 5 16 5 12V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  refresh: <path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5M19.5 4.5V9H15" />,
  external: <path d="M14 4.5h5.5V10M19 5 11 13M17 14v4.5A1.5 1.5 0 0 1 15.5 20h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10" />,
  image: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 17 4.5-4 3.5 3 3-2.5L20 17" />
    </>
  ),
  layers: <path d="m12 3.5 8.5 4.3L12 12 3.5 7.8zM3.5 12.2 12 16.5l8.5-4.3M3.5 16.4 12 20.7l8.5-4.3" />,
  send: <path d="M20.5 3.5 3.5 10.2l7 2.8 2.8 7zM20.5 3.5 10.5 13.2" />,
  store: <path d="M4 9.5 5.5 4.5h13L20 9.5M4 9.5v10h16v-10M4 9.5a2.6 2.6 0 0 0 5.3 0 2.6 2.6 0 0 0 5.4 0 2.6 2.6 0 0 0 5.3 0" />,
};

export function Icon({
  name,
  size = 18,
  className = "",
  strokeWidth = 1.7,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  // Solid brand glyphs (e.g. WhatsApp) are drawn as fill shapes — stroking
  // them would render as overlapping outlines, so they opt out of stroke.
  const filled = name === "wa";
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={filled ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? PATHS.tag}
    </svg>
  );
}

/* -------------------------------- buttons --------------------------------- */
type Variant = "primary" | "navy" | "secondary" | "ghost" | "danger" | "link";
type Size = "sm" | "md" | "lg";

export const btnCls = (variant: Variant = "primary", size: Size = "md", notch = true) =>
  cx(
    "relative inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[background-color,color,border-color,transform,box-shadow] duration-150 ease-out",
    "disabled:pointer-events-none disabled:opacity-45 select-none whitespace-nowrap",
    size === "sm" && "h-9 px-3.5 text-[13px]",
    size === "md" && "h-11 px-5 text-[14.5px]",
    size === "lg" && "h-12 px-6 text-[15px]",
    variant === "primary" && cx("bg-brand-600 text-white hover:bg-brand-700 active:translate-y-px shadow-xs", notch && "notch-sm"),
    variant === "navy" && cx("bg-navy-800 text-white hover:bg-navy-900 active:translate-y-px shadow-xs", notch && "notch-sm"),
    variant === "secondary" &&
      "bg-white text-ink border border-line hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:translate-y-px",
    variant === "ghost" && "text-muted hover:text-ink hover:bg-linesoft",
    variant === "danger" && cx("bg-bad text-white hover:bg-[#a82020] active:translate-y-px shadow-xs", notch && "notch-sm"),
    variant === "link" && "text-brand-700 hover:text-brand-600 underline underline-offset-4 decoration-brand-200 h-auto px-0",
  );

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  notch = true,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  notch?: boolean;
}) {
  return (
    <button
      className={cx(btnCls(variant, size, notch), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size={15} className="-ml-1" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = "primary",
  size = "md",
  notch = true,
  className,
  children,
  onClick,
}: {
  to: string;
  variant?: Variant;
  size?: Size;
  notch?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link to={to} className={cx(btnCls(variant, size, notch), className)} onClick={onClick}>
      {children}
    </Link>
  );
}

export function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={cx("animate-spin", className)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/* --------------------------------- badges --------------------------------- */
export type Tone = "blue" | "navy" | "green" | "amber" | "red" | "gray" | "cyan";

const TONES: Record<Tone, string> = {
  blue: "bg-brand-50 text-brand-700 border-brand-200",
  navy: "bg-navy-800 text-white border-navy-800",
  cyan: "bg-brand-500 text-white border-brand-500",
  green: "bg-oksoft text-[#0a7a55] border-[#bfe9db]",
  amber: "bg-warnsoft text-warn border-[#f3ddba]",
  red: "bg-badsoft text-bad border-[#f6cfcf]",
  gray: "bg-linesoft text-muted border-line",
};

export function Badge({
  tone = "gray",
  children,
  dot = false,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-[3px] text-[11.5px] font-semibold leading-none",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Chamfered eyebrow chip — the signature price-tag plate. */
export function TagChip({
  children,
  tone = "blue",
  className = "",
}: {
  children: ReactNode;
  tone?: "blue" | "navy" | "white";
  className?: string;
}) {
  return (
    <span
      className={cx(
        "notch-sm inline-flex items-center gap-2 px-3 py-1.5 micro",
        tone === "blue" && "bg-brand-50 text-brand-700",
        tone === "navy" && "bg-navy-800 text-brand-200",
        tone === "white" && "bg-white/12 text-white backdrop-blur-[2px]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------------------------------- cards --------------------------------- */
export function Card({
  children,
  className = "",
  pad = true,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-xl border border-line bg-white shadow-card",
        pad && "p-4 sm:p-5",
        hover && "corner-mark transition-[box-shadow,border-color,transform] duration-150 hover:border-brand-300 hover:shadow-lift hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHead({
  title,
  sub,
  action,
  icon,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-ink">
          {icon && <Icon name={icon} size={17} className="text-brand-500" />}
          {title}
        </h3>
        {sub && <p className="mt-1 text-[13px] leading-snug text-muted">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* --------------------------------- inputs --------------------------------- */
const inputBase =
  "w-full rounded-md border bg-white px-3.5 text-[15px] text-ink placeholder:text-faint outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-canvas disabled:text-faint";

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className = "",
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      {label && (
        <span className="mb-1.5 flex items-baseline gap-1 text-[13px] font-semibold text-ink">
          {label}
          {required && <span className="text-brand-600">*</span>}
          {!required && <span className="micro text-faint">opsional</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-bad">
          <Icon name="alert" size={13} /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-[12.5px] leading-snug text-faint">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({ invalid, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cx(
        inputBase,
        "h-11",
        invalid ? "border-bad ring-4 ring-badsoft" : "border-line",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

export function Textarea({
  invalid,
  className,
  rows = 4,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      rows={rows}
      className={cx(
        inputBase,
        "resize-y py-2.5 leading-relaxed",
        invalid ? "border-bad ring-4 ring-badsoft" : "border-line",
        className,
      )}
      {...rest}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cx(inputBase, "h-11 appearance-none border-line pr-9", className)}
        {...rest}
      >
        {children}
      </select>
      <Icon
        name="chevron"
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 ease-in-out",
        checked ? "border-brand-600 bg-brand-600" : "border-line bg-[#E4EAF3]",
      )}
    >
      <span
        className={cx(
          "absolute left-0 top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-xs transition-transform duration-300 ease-in-out",
          checked ? "translate-x-[23px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex items-start gap-2.5 text-left"
    >
      <span
        className={cx(
          "mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-xs border transition-colors duration-150",
          checked ? "border-brand-600 bg-brand-600 text-white" : "border-[#C4CFDF] bg-white group-hover:border-brand-400",
        )}
      >
        {checked && <Icon name="check" size={12} strokeWidth={3} />}
      </span>
      {children && <span className="text-[13.5px] leading-snug text-muted">{children}</span>}
    </button>
  );
}

/* --------------------------------- tabs ----------------------------------- */
export function Tabs({
  items,
  active,
  onChange,
  className = "",
}: {
  items: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cx("tl-scroll -mb-px flex gap-1 overflow-x-auto border-b border-line", className)}>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={cx(
            "relative whitespace-nowrap px-3.5 pb-2.5 pt-1 text-[14px] font-semibold transition-colors duration-150",
            active === it.id ? "text-brand-700" : "text-muted hover:text-ink",
          )}
        >
          {it.label}
          {typeof it.count === "number" && (
            <span className={cx("ml-1.5 tnum text-[12px]", active === it.id ? "text-brand-600" : "text-faint")}>
              {it.count}
            </span>
          )}
          <span
            className={cx(
              "absolute inset-x-2 -bottom-px h-[2.5px] rounded-t-full transition-opacity duration-150",
              active === it.id ? "bg-brand-600 opacity-100" : "opacity-0",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function Segmented({
  items,
  active,
  onChange,
  size = "md",
}: {
  items: string[];
  active: string;
  onChange: (v: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex rounded-md border border-line bg-canvas p-1">
      {items.map((i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={cx(
            "notch-sm rounded-[5px] font-semibold transition-colors duration-150",
            size === "sm" ? "px-2.5 py-1 text-[12.5px]" : "px-3.5 py-1.5 text-[13.5px]",
            active === i ? "bg-white text-brand-700 shadow-xs" : "text-muted hover:text-ink",
          )}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------- table ---------------------------------- */
export function TableWrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("tl-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0", className)}>
      <table className="w-full min-w-[560px] border-collapse text-left">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cx("micro border-b border-line pb-2.5 pr-4 text-faint last:pr-0", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={cx("border-b border-linesoft py-3 pr-4 align-middle last:pr-0", className)}>{children}</td>;
}

/* --------------------------------- modal ---------------------------------- */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="fade absolute inset-0 bg-navy-900/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          "rise relative w-full overflow-hidden rounded-t-xl border border-line bg-white shadow-lift sm:rounded-xl",
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-linesoft bg-canvas px-5 py-4">
          <div>
            {eyebrow && <div className="micro mb-1 text-brand-600">{eyebrow}</div>}
            <h2 className="text-[17px] font-extrabold text-ink">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="-mr-1 rounded-md p-1.5 text-faint transition-colors hover:bg-white hover:text-ink"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-linesoft bg-canvas px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Hapus",
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      eyebrow="Konfirmasi"
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3.5">
        <div
          className={cx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            tone === "danger" ? "bg-badsoft text-bad" : "bg-brand-50 text-brand-700",
          )}
        >
          <Icon name={tone === "danger" ? "alert" : "info"} size={18} />
        </div>
        <p className="text-[14px] leading-relaxed text-muted">{body}</p>
      </div>
    </Modal>
  );
}

/* -------------------------------- dropdown -------------------------------- */
export function Dropdown({
  trigger,
  items,
  align = "right",
  width = "w-56",
}: {
  trigger: (p: { open: boolean }) => ReactNode;
  items: { label: string; icon?: string; onClick?: () => void; danger?: boolean; sep?: boolean }[];
  align?: "left" | "right";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center"
      >
        {trigger({ open })}
      </button>
      {open && (
        <div
          className={cx(
            "fade absolute z-50 mt-2 overflow-hidden rounded-lg border border-line bg-white py-1.5 shadow-lift",
            align === "right" ? "right-0" : "left-0",
            width,
          )}
        >
          {items.map((it, i) => (
            <div key={i}>
              {it.sep && <div className="my-1.5 h-px bg-linesoft" />}
              <button
                type="button"
                onClick={() => {
                  it.onClick?.();
                  setOpen(false);
                }}
                className={cx(
                  "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13.5px] font-medium transition-colors duration-100",
                  it.danger ? "text-bad hover:bg-badsoft" : "text-muted hover:bg-brand-50 hover:text-brand-700",
                )}
              >
                {it.icon && <Icon name={it.icon} size={16} />}
                {it.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------- states + feedback --------------------------- */
export function EmptyState({
  icon = "box",
  title,
  desc,
  action,
}: {
  icon?: string;
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD7E7] bg-canvas/70 px-6 py-12 text-center">
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-white text-brand-500 shadow-xs">
        <Icon name={icon} size={22} />
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-[1px] bg-brand-500" />
      </div>
      <h4 className="text-[15px] font-extrabold text-ink">{title}</h4>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry, desc }: { onRetry?: () => void; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#F3CFCF] bg-badsoft/60 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-bad shadow-xs">
        <Icon name="alert" size={22} />
      </div>
      <h4 className="text-[15px] font-extrabold text-ink">Data belum bisa dimuat</h4>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">
        {desc ?? "Koneksi terputus sebentar. Coba muat ulang, data Anda aman di server."}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          <Icon name="refresh" size={15} /> Muat ulang
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cx("skeleton rounded-md", className)} />;
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-linesoft py-3.5">
      <Skeleton className="h-10 w-10 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function ToastHost() {
  const { toasts, dismiss } = useApp();
  const tones = {
    ok: { bar: "bg-ok", icon: "checkCircle", color: "text-ok" },
    info: { bar: "bg-brand-500", icon: "info", color: "text-brand-600" },
    warn: { bar: "bg-warn", icon: "alert", color: "text-warn" },
    bad: { bar: "bg-bad", icon: "alert", color: "text-bad" },
  } as const;
  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[90] flex flex-col items-stretch gap-2 sm:left-auto sm:right-5 sm:bottom-5 sm:w-[360px]">
      {toasts.map((t) => {
        const tone = tones[t.tone];
        return (
          <div
            key={t.id}
            className="rise pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-lg border border-line bg-white px-4 py-3 shadow-lift"
          >
            <span className={cx("absolute left-0 top-0 h-full w-[3px]", tone.bar)} />
            <Icon name={tone.icon} size={18} className={cx("mt-px shrink-0", tone.color)} />
            <p className="flex-1 text-[13.5px] font-medium leading-snug text-ink">{t.msg}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Tutup notifikasi"
              className="-mr-1 -mt-1 rounded p-1 text-faint hover:text-ink"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- page header ------------------------------ */
export function PageHeader({
  index,
  kicker,
  title,
  desc,
  actions,
  className = "",
}: {
  index?: string;
  kicker?: string;
  title: string;
  desc?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {(index || kicker) && (
          <div className="micro mb-2 flex items-center gap-2 text-brand-600">
            {index && <span className="text-ink">{index}</span>}
            {index && kicker && <span className="h-px w-5 bg-brand-300" />}
            {kicker && <span>{kicker}</span>}
          </div>
        )}
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[32px]">
          {title}
        </h1>
        {desc && <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">{desc}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* --------------------------------- misc ----------------------------------- */
export function Money({ value, className = "" }: { value: number; className?: string }) {
  return <span className={cx("tnum", className)}>{"Rp" + value.toLocaleString("id-ID")}</span>;
}

export function Delta({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 tnum text-[12px] font-semibold",
        up ? "text-ok" : "text-bad",
      )}
    >
      <Icon name={up ? "arrowUp" : "arrowDown"} size={12} strokeWidth={2.4} />
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

export function Progress({ value, tone = "blue" }: { value: number; tone?: "blue" | "navy" | "ok" | "amber" }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-linesoft">
      <div
        className={cx(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          tone === "blue" && "bg-brand-500",
          tone === "navy" && "bg-navy-800",
          tone === "ok" && "bg-ok",
          tone === "amber" && "bg-warn",
        )}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-md bg-navy-800 font-bold text-brand-300"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx("mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function FieldRow({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div
      className={cx(
        "grid gap-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        cols === 3 && "grid-cols-1 sm:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

export function QuickLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <button
      onClick={() => navigate(to)}
      className="group flex items-center gap-2 text-[13px] font-semibold text-brand-700 transition-colors hover:text-brand-600"
    >
      <Icon name={icon} size={15} />
      {label}
      <Icon name="right" size={13} className="transition-transform duration-150 group-hover:translate-x-0.5" />
    </button>
  );
}
