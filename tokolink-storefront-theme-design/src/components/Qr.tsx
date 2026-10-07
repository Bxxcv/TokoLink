import { qrMatrix } from "../lib/utils";

export function QrArt({
  seed,
  px = 168,
  dark = "#111111",
  light = "#FFFFFF",
  modules = 25,
}: {
  seed: string;
  px?: number;
  dark?: string;
  light?: string;
  modules?: number;
}) {
  const m = qrMatrix(seed, modules);
  const quiet = 2;
  const total = modules + quiet * 2;
  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${total} ${total}`}
      role="img"
      aria-label={`Matriks QR preview untuk ${seed}`}
      style={{ display: "block", background: light, borderRadius: 4 }}
    >
      <rect width={total} height={total} fill={light} />
      {m.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c + quiet} y={r + quiet} width={1} height={1} fill={dark} /> : null,
        ),
      )}
    </svg>
  );
}
