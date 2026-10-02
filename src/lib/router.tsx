import { useCallback, useEffect, useState, type ReactNode } from "react";

export function currentPath(): string {
  const raw = window.location.hash.replace(/^#/, "");
  if (raw) return raw.startsWith("/") ? raw : "/" + raw;
  // QR/link toko memakai path (/s/slug) tanpa hash — kalau hash kosong,
  // baca pathname supaya hasil scan langsung membuka tokonya (bukan beranda).
  // (Request /api/* tidak pernah sampai ke SPA — ditangani serverless.)
  const p = window.location.pathname;
  return p && p !== "/" ? p : "/";
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
    if (!window.location.hash) window.location.hash = "/";
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
  title?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export function Link({ to, children, className = "", title, onClick, ariaLabel }: LinkProps) {
  return (
    <a
      href={`#${to}`}
      title={title}
      aria-label={ariaLabel}
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
