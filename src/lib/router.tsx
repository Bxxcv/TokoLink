import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";

export function currentPath(): string {
  // Hash dulu (navigasi dalam aplikasi, tanpa reload).
  const raw = window.location.hash.replace(/^#/, "");
  if (raw) return raw.startsWith("/") ? raw : "/" + raw;
  // Tanpa hash (dibuka langsung / dari QR / dibagikan): baca path + query.
  // Ini yang bikin tautan tokolink.store/s/{slug} bisa dibuka langsung.
  const p = window.location.pathname;
  const q = window.location.search;
  const base = p && p !== "/" ? p : "/";
  return base + q;
}

export function navigate(to: string) {
  if (currentPath() === to) return;
  window.location.hash = to;
}

export function useRoute(): string {
  const [path, setPath] = useState<string>(() =>
    typeof window === "undefined" ? "/" : currentPath(),
  );
  useEffect(() => {
    const onChange = () => {
      setPath(currentPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

export function useIsActive(path: string) {
  return useCallback(
    (to: string, exact = false) =>
      exact ? path === to : path === to || path.startsWith(to === "/" ? "\u0000" : to + "/") || path === to,
    [path],
  );
}

type LinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export function Link({ to, children, className = "", style, title, onClick, ariaLabel }: LinkProps) {
  return (
    <a
      href={`#${to}`}
      title={title}
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
