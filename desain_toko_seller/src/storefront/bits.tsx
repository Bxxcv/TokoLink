import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "../data/themes";

export const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");

export const initials = (n: string) =>
  n
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function vars(t: Theme): CSSProperties {
  return {
    ["--p" as string]: t.tokens.paper,
    ["--panel" as string]: t.tokens.panel,
    ["--ink" as string]: t.tokens.ink,
    ["--inkS" as string]: t.tokens.inkSoft,
    ["--line" as string]: t.tokens.line,
    ["--ac" as string]: t.tokens.accent,
    ["--acI" as string]: t.tokens.accentInk,
    ["--ok" as string]: t.tokens.ok,
    ["--r" as string]: `${t.tokens.radius}px`,
    background: t.tokens.paper,
    color: t.tokens.ink,
    fontFamily: t.tokens.body,
    fontSize: t.tokens.bodySize,
    lineHeight: 1.5,
  } as CSSProperties;
}

export function Label({ t, children, style }: { t: Theme; children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: t.tokens.body,
        fontSize: 10,
        fontWeight: 600,
        textTransform: t.tokens.labelTransform,
        letterSpacing: t.tokens.labelTracking,
        color: t.tokens.inkSoft,
        display: "block",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Monogram({ t, size = 44 }: { t: Theme; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        background: t.tokens.accent,
        color: t.tokens.accentInk,
        fontFamily: t.tokens.display,
        fontWeight: t.tokens.displayWeight,
        fontSize: size * 0.42,
        letterSpacing: "-0.02em",
        borderRadius: t.tokens.radius,
        flexShrink: 0,
      }}
    >
      {initials(t.store.name)}
    </span>
  );
}

export function Strip({ t, h, style, children }: { t: Theme; h: number; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div
      style={{
        height: h,
        backgroundImage: `url(${t.img})`,
        backgroundSize: "cover",
        backgroundPosition: "center 55%",
        backgroundColor: t.tokens.panel,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Satu kuarter dari strip 4 produk — dipakai sebagai thumbnail katalog. */
export function Thumb({ t, i, style }: { t: Theme; i: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        backgroundImage: `url(${t.img})`,
        backgroundSize: "400% 100%",
        backgroundPosition: `${(i % 4) * 33.3333}% center`,
        backgroundColor: t.tokens.panel,
        ...style,
      }}
    />
  );
}

export function Dot({ t }: { t: Theme }) {
  return <span aria-hidden style={{ width: 7, height: 7, borderRadius: 99, background: t.tokens.ok, display: "inline-block" }} />;
}

const QR = ["1111101", "1000101", "1011101", "1010000", "1101111", "1001011", "1010111"];

export function QrMark({ t, size = 56 }: { t: Theme; size?: number }) {
  const cell = size / 7;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <rect width={size} height={size} fill={t.tokens.accentInk} />
      {QR.map((row, y) =>
        row.split("").map((c, x) =>
          c === "1" ? (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={t.tokens.accent} />
          ) : null,
        ),
      )}
    </svg>
  );
}

export function WaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.2a8.8 8.8 0 0 0-7.5 13.4L3.2 21l4.6-1.2A8.8 8.8 0 1 0 12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 8.5c.3 2.6 3.1 5.4 5.7 5.8l1-1.4 1.9.8-.4 1.6c-3 .7-7.1-2.7-8-6.2l1.6-.6.9 1.7-1.4.2-.8-1.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Price({ t, v, size = 16, weight = 500, color }: { t: Theme; v: number; size?: number; weight?: number; color?: string }) {
  return (
    <span className="f-mono tnum" style={{ fontSize: size, fontWeight: weight, color: color ?? t.tokens.ink, letterSpacing: "-0.01em" }}>
      {rp(v)}
    </span>
  );
}
