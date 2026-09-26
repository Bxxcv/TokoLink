/**
 * TokoLink brand mark — reproduced from the supplied logo, not redesigned.
 * Price tag + punched eyelet + navy ring + corner bracket, drawn as vector.
 */
export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="TokoLink"
    >
      <defs>
        <linearGradient id="tlTag" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4FBEF2" />
          <stop offset="55%" stopColor="#1B9AE0" />
          <stop offset="100%" stopColor="#1177BE" />
        </linearGradient>
        <g id="tlPixel">
          <rect width="7" height="7" rx="1" />
        </g>
      </defs>

      {/* tag body, rotated so the eyelet points up-right like the logo */}
      <g transform="translate(41 53) rotate(45)">
        <rect
          x="-23"
          y="-31"
          width="46"
          height="62"
          rx="11"
          fill="url(#tlTag)"
          stroke="#123C90"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <rect
          x="-11.5"
          y="-4"
          width="23"
          height="31"
          rx="8.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* punched eyelet */}
        <circle cx="0" cy="-25" r="8.5" fill="#1B9AE0" stroke="#123C90" strokeWidth="5" />
      </g>

      {/* ring through the eyelet */}
      <circle cx="63" cy="30" r="13.5" fill="none" stroke="#123C90" strokeWidth="7" />

      {/* registration bracket + pixel accents from the logo */}
      <path
        d="M60 66 V82 H79"
        fill="none"
        stroke="#1B9AE0"
        strokeWidth="6.5"
        strokeLinecap="butt"
      />
      <g fill="#1B9AE0">
        <use href="#tlPixel" x="9" y="30" />
        <rect x="17" y="43" width="7" height="7" rx="1" />
      </g>
    </svg>
  );
}

type Tone = "light" | "dark";

export function Logo({
  size = 34,
  word = true,
  tone = "light",
  className = "",
  wordClass = "",
}: {
  size?: number;
  word?: boolean;
  tone?: Tone;
  className?: string;
  wordClass?: string;
}) {
  const wordColor =
    tone === "dark" ? "text-brand-500" : "text-navy-800";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} className="shrink-0" />
      {word && (
        <span
          className={`font-display font-bold leading-none ${wordColor} ${wordClass}`}
          style={{
            fontSize: Math.round(size * 0.78),
            letterSpacing: "-0.015em",
          }}
        >
          TokoLink
        </span>
      )}
    </span>
  );
}

/** Small standalone tag glyph used as a bullet / step marker. */
export function TagGlyph({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M4.6 12.3 11 5.9a2 2 0 0 1 1.4-.6h5.2a2 2 0 0 1 2 2v5.2a2 2 0 0 1-.6 1.4l-6.4 6.4a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="15.8" cy="8.2" r="1.6" fill="currentColor" />
    </svg>
  );
}
