/* AdminUI — shared visual parts: badges, circle buttons, charts, decor. */
import type { ReactNode } from "react";
import { ArrowUpRight, TrendDown, TrendUp } from "./icons";

/* ------------------------------------------------------------------ */
/* Tokens (sampled from the visual reference)                          */
export const AP = {
  accent: "#5741E9", // revenue card + bars
  ink: "#16171C",
  muted: "#9AA0AE",
  faint: "#B7BCC8",
  card: "#FFFFFF",
  canvas: "#F3F5FA",
  line: "#EEF0F6",
  dark: "#17181D",
  green: "#63D68C",
  greenText: "#0B7A45",
  red: "#F98080",
  redText: "#93202C",
  blue: "#7D8DF6",
  orange: "#EF8E50",
  yellow: "#F5C84C",
};

/* ------------------------------------------------------------------ */
export function TrendBadge({ dir, value }: { dir: "up" | "down"; value: string }) {
  const up = dir === "up";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10px] font-bold tracking-wide"
      style={{
        background: up ? "#7BE3A8" : "#FA8B8B",
        color: up ? "#086C3E" : "#8E1B26",
      }}
    >
      {up ? <TrendUp size={9} /> : <TrendDown size={9} />}
      {value}
    </span>
  );
}

export function CircleArrow({
  tone = "light",
  size = 38,
}: {
  tone?: "light" | "dark" | "white";
  size?: number;
}) {
  const style =
    tone === "dark"
      ? { background: AP.dark, color: "#fff" }
      : tone === "white"
        ? { background: "#fff", color: AP.dark, boxShadow: "0 6px 16px -8px rgba(23,24,29,.45)" }
        : { background: "#F0F1F6", color: AP.dark };
  return (
    <button
      type="button"
      aria-label="Open"
      className="grid shrink-0 place-items-center rounded-full transition-transform hover:scale-105"
      style={{ width: size, height: size, ...style }}
    >
      <ArrowUpRight size={size * 0.42} strokeWidth={2} />
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[18px] bg-white p-6 ${className}`}
      style={{ boxShadow: "0 1px 2px rgba(22,23,28,.04), 0 14px 34px -26px rgba(22,23,28,.18)" }}
    >
      {children}
    </div>
  );
}

/** Very subtle decorative wave lines (fingerprint-like arcs). */
export function Wave({ className = "", tone = "#C7D3F2" }: { className?: string; tone?: string }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true" fill="none">
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={i}
          d={`M-10 ${18 + i * 9} C 30 ${4 + i * 9}, 62 ${34 + i * 9}, 130 ${10 + i * 9}`}
          stroke={tone}
          strokeWidth="1"
          opacity={0.55 - i * 0.05}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Revenue bar chart                                                    */
const BARS = [
  { label: "1 AUG", v: 22400 },
  { label: "2 AUG", v: 9300 },
  { label: "3 AUG", v: 14867, tip: "$ 14,867" },
  { label: "4 AUG", v: 12600 },
  { label: "5 AUG", v: 16100 },
  { label: "6 AUG", v: 20900 },
  { label: "7 AUG", v: 24600 },
  { label: "8 AUG", v: 20800 },
];
const Y_TICKS = ["$ 25.000", "$ 20.000", "$ 15.000", "$ 10.000", "$ 5.000", "$ 0"];
const MAX = 25000;

export function RevenueBars() {
  return (
    <div className="mt-5 flex gap-3">
      {/* y axis */}
      <div className="flex h-[196px] flex-col justify-between text-right">
        {Y_TICKS.map((t) => (
          <span key={t} className="text-[9.5px] font-medium leading-none text-[#A6ACBA] tnum">
            {t}
          </span>
        ))}
      </div>
      {/* plot */}
      <div className="min-w-0 flex-1">
        <div className="relative h-[196px]">
        {/* gridlines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {Y_TICKS.map((t, i) => (
            <div key={t} className="border-t border-dashed" style={{ borderColor: i === Y_TICKS.length - 1 ? "#E3E6EE" : "#ECEEF4" }} />
          ))}
        </div>
        {/* bars */}
        <div className="absolute inset-0 flex items-end justify-between px-1 sm:px-2">
          {BARS.map((b) => (
            <div key={b.label} className="relative flex h-full w-[8%] max-w-[30px] items-end">
              {b.tip && (
                <span
                  className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[9.5px] font-bold text-[#16171C]"
                  style={{ bottom: `calc(${(b.v / MAX) * 100}% + 8px)`, boxShadow: "0 4px 14px -4px rgba(22,23,28,.25)" }}
                >
                  {b.tip}
                </span>
              )}
              <div
                className="w-full rounded-[7px] transition-opacity hover:opacity-90"
                style={{ height: `${(b.v / MAX) * 100}%`, background: AP.accent }}
              />
            </div>
          ))}
        </div>
        </div>
        {/* x labels — same flex geometry as the bars so they align */}
        <div className="mt-2 flex justify-between px-1 sm:px-2">
          {BARS.map((b) => (
            <span key={b.label} className="w-[8%] max-w-[30px] text-center text-[9px] font-semibold tracking-wide text-[#A6ACBA]">
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut — Sales by Category                                            */
export const CATEGORIES = [
  { name: "Apple MacBook Air M2", color: "#F2994A", pct: 25 },
  { name: "Apple Watch Series 9", color: "#5B7BF2", pct: 25 },
  { name: "Acoustics JBL Charge 5", color: "#F2C94C", pct: 20 },
  { name: "Acoustics Divoom SongBird-HQ", color: "#F2696E", pct: 15 },
  { name: "Apple AirPods Pro 2", color: "#6FCF97", pct: 15 },
];

export function Donut({ size = 168 }: { size?: number }) {
  const r = 40;
  const C = 2 * Math.PI * r;
  // clockwise from 12 o'clock: orange, green, red, yellow, blue (as reference)
  const order = [0, 4, 3, 2, 1];
  let acc = 0;
  const segs = order.map((i) => {
    const c = CATEGORIES[i];
    const start = acc;
    acc += c.pct;
    return { ...c, start };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0" aria-hidden="true">
      <g transform="rotate(-90 50 50)">
        {segs.map((s) => (
          <circle
            key={s.name}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="19"
            strokeDasharray={`${(s.pct / 100) * C - 1.2} ${C - (s.pct / 100) * C + 1.2}`}
            strokeDashoffset={-(s.start / 100) * C}
          />
        ))}
      </g>
      {segs.map((s) => {
        const a = ((s.start + s.pct / 2) / 100) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + r * Math.cos(a);
        const y = 50 + r * Math.sin(a);
        return (
          <text
            key={s.name}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="5.6"
            fontWeight="700"
            fill="#fff"
          >
            {s.pct}%
          </text>
        );
      })}
    </svg>
  );
}
