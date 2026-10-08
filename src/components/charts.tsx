import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { angka } from "../lib/format";

const cx = clsx;

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width));
    ro.observe(el);
    setW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

export function ChartFrame({
  title,
  hint,
  legend,
  children,
  right,
}: {
  title: string;
  hint?: string;
  legend?: ReactNode;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-extrabold text-ink">{title}</h3>
          {hint && <p className="text-[12.5px] text-muted">{hint}</p>}
        </div>
        <div className="flex items-center gap-3">
          {legend}
          {right}
        </div>
      </div>
      {children}
    </div>
  );
}

export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------- line / area ------------------------------ */
export function LineChart({
  series,
  labels,
  height = 190,
  format = (v: number) => angka(v),
  color = "#0A69C4",
  showDots = false,
  yTicks = 4,
}: {
  series: number[];
  labels: string[];
  height?: number;
  format?: (v: number) => string;
  color?: string;
  showDots?: boolean;
  yTicks?: number;
}) {
  const { ref, w } = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const padL = 52;
  const padR = 10;
  const padT = 12;
  const padB = 24;
  const width = Math.max(w, 240);
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const max = Math.max(...series);
  const niceMax = max <= 0 ? 1 : Math.ceil(max / (max > 1000 ? 500 : max > 200 ? 100 : 20)) * (max > 1000 ? 500 : max > 200 ? 100 : 20);
  const x = (i: number) => padL + (i / (series.length - 1)) * innerW;
  const y = (v: number) => padT + innerH - (v / niceMax) * innerH;
  const line = series.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)} ${padT + innerH} L${padL} ${padT + innerH} Z`;
  const step = Math.ceil(labels.length / 7);

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {w > 0 && (
        <svg
          width={width}
          height={height}
          className="block"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const px = e.clientX - rect.left;
            const i = Math.round(((px - padL) / innerW) * (series.length - 1));
            setHover(Math.max(0, Math.min(series.length - 1, i)));
          }}
        >
          <defs>
            <linearGradient id={`fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.16" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const v = (niceMax / yTicks) * i;
            const yy = y(v);
            return (
              <g key={i}>
                <line x1={padL} x2={width - padR} y1={yy} y2={yy} stroke="#ECF1F7" strokeWidth="1" />
                <text x={padL - 8} y={yy + 3.5} textAnchor="end" className="fill-[#64748F] font-mono" fontSize="10">
                  {format(v)}
                </text>
              </g>
            );
          })}
          <path d={area} fill={`url(#fill-${color.replace("#", "")})`} />
          <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {showDots &&
            series.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="2.6" fill="#fff" stroke={color} strokeWidth="1.6" />)}
          {labels.map((l, i) =>
            i % step === 0 || i === labels.length - 1 ? (
              <text
                key={i}
                x={x(i)}
                y={height - 6}
                textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
                className="fill-[#64748F] font-mono"
                fontSize="10"
              >
                {l}
              </text>
            ) : null,
          )}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} stroke="#0B2E6E" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(series[hover])} r="4.5" fill="#fff" stroke={color} strokeWidth="2.4" />
            </g>
          )}
        </svg>
      )}
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-line bg-white px-2.5 py-1.5 text-center shadow-lift"
          style={{ left: Math.min(Math.max(x(hover), 70), width - 70), top: 0 }}
        >
          <div className="micro text-faint">{labels[hover]}</div>
          <div className="tnum text-[13px] font-bold text-ink">{format(series[hover])}</div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- bars ---------------------------------- */
export function BarChart({
  data,
  height = 190,
  format = (v: number) => angka(v),
  color = "#1B9AE0",
}: {
  data: { label: string; value: number }[];
  height?: number;
  format?: (v: number) => string;
  color?: string;
}) {
  const { ref, w } = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const padL = 44;
  const padB = 22;
  const padT = 10;
  const width = Math.max(w, 240);
  const innerW = width - padL - 8;
  const innerH = height - padT - padB;
  const max = Math.max(...data.map((d) => d.value), 1);
  const bw = (innerW / data.length) * 0.62;
  const step = innerW / data.length;

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {w > 0 && (
        <svg width={width} height={height} className="block" onMouseLeave={() => setHover(null)}>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={padL} x2={width - 8} y1={padT + innerH * (1 - t)} y2={padT + innerH * (1 - t)} stroke="#ECF1F7" />
              <text x={padL - 7} y={padT + innerH * (1 - t) + 3.5} textAnchor="end" fontSize="10" className="fill-[#64748F] font-mono">
                {format(Math.round(max * t))}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const h = (d.value / max) * innerH;
            const bx = padL + i * step + (step - bw) / 2;
            return (
              <g key={i} onMouseEnter={() => setHover(i)}>
                <rect x={padL + i * step} y={padT} width={step} height={innerH} fill="transparent" />
                <rect
                  x={bx}
                  y={padT + innerH - h}
                  width={bw}
                  height={h}
                  rx="3"
                  fill={hover === i ? "#0B2E6E" : color}
                  opacity={hover === null || hover === i ? 1 : 0.55}
                  className="transition-[fill,opacity] duration-150"
                />
                <text
                  x={padL + i * step + step / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="10"
                  className="fill-[#64748F] font-mono"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-md border border-line bg-white px-2.5 py-1.5 text-center shadow-lift">
          <div className="text-[11px] text-muted">{data[hover].label}</div>
          <div className="tnum text-[13px] font-bold text-ink">{format(data[hover].value)}</div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- donut ---------------------------------- */
export function Donut({
  items,
  centerValue,
  centerLabel,
  size = 168,
}: {
  items: { label: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ECF1F7" strokeWidth="15" />
          {items.map((i) => {
            const len = (i.value / total) * c;
            const el = (
              <circle
                key={i.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={i.color}
                strokeWidth="15"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                className="transition-[stroke-dasharray] duration-500"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="tnum text-[19px] font-bold leading-none text-ink">{centerValue}</div>
          <div className="micro mt-1.5 text-faint">{centerLabel}</div>
        </div>
      </div>
      <ul className="min-w-[160px] flex-1 space-y-2.5">
        {items.map((i) => (
          <li key={i.label} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-muted">
              <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: i.color }} />
              {i.label}
            </span>
            <span className="tnum font-semibold text-ink">
              {i.value}
              <span className="ml-1 text-[11px] font-normal text-faint">
                {Math.round((i.value / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------ horizontal bars --------------------------- */
export function BarRows({
  data,
  format = (v: number) => angka(v),
  color = "#0A69C4",
}: {
  data: { label: string; value: number; note?: string }[];
  format?: (v: number) => string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3.5">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-[13.5px] font-semibold text-ink">{d.label}</span>
            <span className="tnum shrink-0 text-[13px] font-semibold text-ink">{format(d.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-linesoft">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${(d.value / max) * 100}%`, background: i === 0 ? color : `${color}99` }}
            />
          </div>
          {d.note && <div className="mt-1 text-[11.5px] text-faint">{d.note}</div>}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------- funnel --------------------------------- */
export function Funnel({ items }: { items: { label: string; value: number }[] }) {
  const top = items[0].value || 1;
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => {
        const pct = (it.value / top) * 100;
        const drop = i === 0 ? null : Math.round((it.value / items[i - 1].value - 1) * 100);
        return (
          <li key={it.label} className="flex items-center gap-3">
            <span className="w-[120px] shrink-0 text-[12.5px] text-muted sm:w-[140px]">{it.label}</span>
            <span className="relative h-8 flex-1 overflow-hidden rounded-sm bg-canvas">
              <span
                className="absolute inset-y-0 left-0 rounded-sm transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(pct, 6)}%`, background: i === 0 ? "#0B2E6E" : "#1B9AE0", opacity: 1 - i * 0.12 }}
              />
              <span className="absolute inset-y-0 left-3 flex items-center gap-2">
                <span className="tnum text-[12.5px] font-bold text-white drop-shadow-[0_1px_1px_rgba(6,27,69,.45)]">
                  {angka(it.value)}
                </span>
                <span className="tnum text-[11px] font-medium text-white/85">
                  {Math.round((it.value / top) * 100)}%
                </span>
              </span>
            </span>
            <span className="w-11 shrink-0 text-right">
              {drop !== null && (
                <span className={cx("tnum text-[11.5px] font-semibold", drop < 0 ? "text-bad" : "text-ok")}>
                  {drop}%
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------- sparkline -------------------------------- */
export function Sparkline({
  values,
  color = "#1B9AE0",
  width = 96,
  height = 28,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / (max - min || 1)) * (height - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -------------------------- loading / empty chart ------------------------- */
export function ChartSkeleton({ height = 190 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {[42, 68, 55, 82, 61, 90, 74, 58].map((h, i) => (
        <div key={i} className="skeleton flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function useFakeLoad(deps: unknown[] = [], ms = 650) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return loading;
}
