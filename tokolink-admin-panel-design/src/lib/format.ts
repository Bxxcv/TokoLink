// Formatter umum — aman dipakai di server & client.
import type { CSSProperties } from "react";

export function idr(n: number): string {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function idrShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000)
    return (
      "Rp " +
      (n / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 }) +
      " M"
    );
  if (abs >= 1_000_000)
    return (
      "Rp " +
      (n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) +
      " jt"
    );
  if (abs >= 1_000)
    return "Rp " + Math.round(n / 1_000).toLocaleString("id-ID") + " rb";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function num(n: number): string {
  return n.toLocaleString("id-ID");
}

export function pct(n: number): string {
  const v = Math.abs(n);
  const s = v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(".", ",");
  return (n >= 0 ? "+" : "−") + s + "%";
}

const dShort = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });
const dFull = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dtFull = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dLong = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function dateShort(iso: string): string {
  return dShort.format(new Date(iso));
}
export function dateFull(iso: string): string {
  return dFull.format(new Date(iso));
}
export function dateTimeFull(iso: string): string {
  return dtFull.format(new Date(iso));
}
export function dateLong(d: Date): string {
  return dLong.format(d);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return m + " mnt lalu";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " jam lalu";
  const d = Math.floor(h / 24);
  if (d < 7) return d + " hari lalu";
  const w = Math.floor(d / 7);
  if (w < 5) return w + " mgg lalu";
  return dateFull(iso);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter((w) => /^[a-zA-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

// Warna avatar deterministik dari nama
const HUES = [248, 217, 168, 12, 158, 288, 45, 262, 96, 330, 205, 32];
export function nameHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return HUES[h % HUES.length];
}

export function avatarStyle(name: string): CSSProperties {
  const hue = nameHue(name);
  return {
    backgroundColor: `hsl(${hue} 72% 94%)`,
    color: `hsl(${hue} 58% 34%)`,
  };
}
