import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { toPng } from "html-to-image";

type Props = {
  naturalW: number;
  filename: string;
  label?: string;
  meta?: string;
  children: ReactNode;
  bare?: boolean;
  minScale?: number;
};

export function Plate({ naturalW, filename, label, meta, children, bare, minScale = 0.5 }: Props) {
  const inner = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [h, setH] = useState(0);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  useEffect(() => {
    const el = inner.current;
    const w = wrap.current;
    if (!el || !w) return;
    const update = () => {
      const avail = w.clientWidth;
      const s = Math.min(1, avail / naturalW);
      const eff = s < minScale ? minScale : s;
      setScale(eff);
      setH(Math.ceil(el.offsetHeight * eff));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    ro.observe(w);
    const t = window.setTimeout(update, 600);
    window.addEventListener("load", update);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
      window.removeEventListener("load", update);
    };
  }, [naturalW, minScale]);

  const download = async () => {
    const el = inner.current;
    if (!el || state === "busy") return;
    setState("busy");
    try {
      const url = await toPng(el, {
        width: naturalW,
        height: el.offsetHeight,
        pixelRatio: 2,
        cacheBust: true,
        style: { transform: "scale(1)", transformOrigin: "top left", margin: "0" },
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setState("done");
      window.setTimeout(() => setState("idle"), 2400);
    } catch {
      setState("error");
      window.setTimeout(() => setState("idle"), 3000);
    }
  };

  const caption = (
    <div className="flex items-baseline justify-between gap-4 pb-2">
      <span className="f-mono sc text-[10px]" style={{ color: "var(--neutral)" }}>
        {label}
        {meta ? <span style={{ color: "var(--ink)" }}> · {meta}</span> : null}
      </span>
      {!bare && (
        <button
          onClick={download}
          className="f-mono sc text-[10px] px-2.5 py-1.5 border transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          style={{ borderColor: "var(--ink)", color: state === "error" ? "var(--accent)" : "var(--ink)", cursor: "pointer", background: "transparent" }}
        >
          {state === "busy" ? "menyiapkan…" : state === "done" ? "tersimpan ✓" : state === "error" ? "gagal — coba lagi" : "ekspor png ↓"}
        </button>
      )}
    </div>
  );

  return (
    <div>
      {bare ? null : caption}
      <div ref={wrap} className="artboard-scroll" style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ width: naturalW * scale, height: h, background: "var(--paper-2)", overflow: "hidden" }}>
          <div style={{ width: naturalW, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <div ref={inner} style={{ width: naturalW }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Ekspor elemen apa pun (sampul, contact sheet) menjadi PNG tanpa proses scale. */
export function ExportButton({
  target,
  filename,
  children,
}: {
  target: RefObject<HTMLElement | null>;
  filename: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const run = async () => {
    const el = target.current;
    if (!el || state === "busy") return;
    setState("busy");
    try {
      const url = await toPng(el, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setState("done");
      window.setTimeout(() => setState("idle"), 2400);
    } catch {
      setState("idle");
    }
  };
  const style: CSSProperties = {
    borderColor: "var(--ink)",
    color: "var(--ink)",
    background: "transparent",
    cursor: "pointer",
  };
  return (
    <button onClick={run} className="f-mono sc text-[10px] px-3 py-2 border transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]" style={style}>
      {state === "busy" ? "menyiapkan…" : state === "done" ? "tersimpan ✓" : children}
    </button>
  );
}
