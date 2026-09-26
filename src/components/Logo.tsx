/**
 * TokoLink brand artwork — official raster assets in public/images/Icon/.
 * - LogoMark: square price-tag mark (logo-mark.webp)
 * - Logo: horizontal lockup with wordmark (logo-lockup.webp)
 * Both are pre-cropped, noise-cleaned derivatives of the supplied masters,
 * so every call site renders the real logo without layout adjustments.
 */

const MARK_SRC = "images/Icon/logo-mark.webp";
const LOCKUP_SRC = "images/Icon/logo-lockup.webp";

export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={MARK_SRC}
      alt="TokoLink"
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{ width: size, height: "auto", display: "block" }}
    />
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
  void tone;
  void wordClass;
  if (!word) {
    return <LogoMark size={size} className={className} />;
  }
  return (
    <img
      src={LOCKUP_SRC}
      alt="TokoLink"
      draggable={false}
      className={className}
      style={{ height: size, width: "auto", display: "block" }}
    />
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
