"use client";

import { useState } from "react";
import { idr, idrShort } from "@/lib/format";

/* ── Bar chart omzet (SVG murni) ───────────────────────────────────────── */
export function BarChart({ data, animateKey }: { data: { label: string; value: number }[]; animateKey: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 760;
  const H = 250;
  const P = { t: 18, r: 6, b: 30, l: 56 };
  const iw = W - P.l - P.r;
  const ih = H - P.t - P.b;

  const max = Math.max(...data.map((d) => d.value), 1);
  // bulatkan sumbu ke angka "indah"
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const niceMax = Math.ceil(max / pow) * pow * (max / (Math.ceil(max / pow) * pow) > 0.75 ? 1 : 1) || max;
  const top = niceMax >= max ? niceMax : niceMax + pow;
  const step = iw / data.length;
  const barW = Math.min(step * 0.62, 34);
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => top * f);
  const hoverIdx = hover !== null ? data[hover] : null;

  return (
    <div className="relative" key={animateKey}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {ticks.map((t, i) => {
          const y = P.t + ih - (t / top) * ih;
          return (
            <g key={i}>
              <line x1={P.l} x2={W - P.r} y1={y} y2={y} stroke="#ecebf3" strokeWidth={1} />
              <text x={P.l - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#8b8a99" className="tnum">
                {idrShort(t)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = top > 0 ? (d.value / top) * ih : 0;
          const x = P.l + i * step + (step - barW) / 2;
          const y = P.t + ih - h;
          const isHover = hover === i;
          return (
            <g key={i}>
              <rect
                x={P.l + i * step}
                y={P.t}
                width={step}
                height={ih}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(h, d.value > 0 ? 3 : 0)}
                rx={5}
                fill={isHover ? "#3b2dc2" : "#5b4cf5"}
                className="bar-grow"
                style={{ animationDelay: `${Math.min(i * 0.02, 0.4)}s`, transition: "fill .15s" }}
              />
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={H - 10} textAnchor="middle" fontSize={10.5} fill="#8b8a99">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hoverIdx && hover !== null && (
        <div
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-center shadow-lg"
          style={{ left: `${((P.l + hover * step + step / 2) / W) * 100}%` }}
        >
          <p className="whitespace-nowrap text-[11px] font-semibold text-white/70">{hoverIdx.label}</p>
          <p className="tnum whitespace-nowrap text-sm font-bold text-white">{idr(hoverIdx.value)}</p>
        </div>
      )}
    </div>
  );
}

/* ── Donut metode pembayaran ───────────────────────────────────────────── */
export function Donut({
  slices,
  centerTitle,
  centerSub,
  size = 168,
}: {
  slices: { label: string; value: number; color: string }[];
  centerTitle: string;
  centerSub: string;
  size?: number;
}) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const R = 62;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx={80} cy={80} r={R} fill="none" stroke="#f0eff6" strokeWidth={20} />
        {total > 0 &&
          slices.map((s, i) => {
            const frac = s.value / total;
            const len = frac * C;
            const off = -acc * C;
            acc += frac;
            if (len <= 0) return null;
            return (
              <circle
                key={i}
                cx={80}
                cy={80}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={20}
                strokeDasharray={`${Math.max(len - 2, 0.5)} ${C}`}
                strokeDashoffset={off}
                strokeLinecap="butt"
                style={{ transition: "stroke-dasharray .5s ease" }}
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="tnum font-display text-lg font-bold leading-5">{centerTitle}</p>
        <p className="mt-0.5 text-[10.5px] font-semibold text-mute">{centerSub}</p>
      </div>
    </div>
  );
}

/* ── Sparkline ─────────────────────────────────────────────────────────── */
export function Spark({ values, w = 96, h = 30, stroke = "#ffffff" }: { values: number[]; w?: number; h?: number; stroke?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - 3 - ((v - min) / range) * (h - 6)}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
    </svg>
  );
}
