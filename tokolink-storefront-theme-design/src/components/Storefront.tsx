import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  AtSign,
  Check,
  ChevronDown,
  Clock,
  Download,
  Link2,
  Lock,
  MapPin,
  MessageCircle,
  Minus,
  Music2,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  /* @deprecated brand icons replaced by AtSign / ThumbsUp */
  Share2,
  ShoppingBag,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import type { BioLink, Product, ThemeDef } from "../lib/data";
import { copyText, downloadQrPng, rupiah } from "../lib/utils";
import { QrArt } from "./Qr";

/* ---------------------------------- ui ---------------------------------- */

type UI = {
  headH: number;
  card: string;
  photo: string;
  btn: string;
  border: string;
  stickyFilter: boolean;
  art: "plate" | "cup" | "hanger" | "tools" | "steamer" | "weave" | "terminal" | "notebook";
  headerTone: "surface" | "page" | "strip";
};

const UI: Record<number, UI> = {
  1: {
    headH: 56,
    card: "rounded-[14px]",
    photo: "rounded-[10px]",
    btn: "rounded-[12px]",
    border: "border border-black/10",
    stickyFilter: true,
    art: "plate",
    headerTone: "surface",
  },
  2: {
    headH: 64,
    card: "rounded-[4px]",
    photo: "rounded-[4px]",
    btn: "rounded-[2px]",
    border: "border border-black/[0.06]",
    stickyFilter: false,
    art: "cup",
    headerTone: "page",
  },
  3: {
    headH: 60,
    card: "rounded-[0px]",
    photo: "rounded-[0px]",
    btn: "rounded-[999px]",
    border: "border border-black/[0.10]",
    stickyFilter: false,
    art: "hanger",
    headerTone: "page",
  },
  4: {
    headH: 52,
    card: "rounded-[6px]",
    photo: "rounded-[4px]",
    btn: "rounded-[6px]",
    border: "border border-black/10",
    stickyFilter: true,
    art: "tools",
    headerTone: "strip",
  },
  5: {
    headH: 64,
    card: "rounded-[10px]",
    photo: "rounded-[8px]",
    btn: "rounded-[8px]",
    border: "border border-black/[0.08]",
    stickyFilter: false,
    art: "steamer",
    headerTone: "surface",
  },
  6: {
    headH: 68,
    card: "rounded-[18px]",
    photo: "rounded-[14px]",
    btn: "rounded-[999px]",
    border: "border border-black/[0.07]",
    stickyFilter: false,
    art: "weave",
    headerTone: "surface",
  },
  7: {
    headH: 52,
    card: "rounded-[8px]",
    photo: "rounded-[6px]",
    btn: "rounded-[6px]",
    border: "border border-white/10",
    stickyFilter: true,
    art: "terminal",
    headerTone: "strip",
  },
  8: {
    headH: 60,
    card: "rounded-[12px]",
    photo: "rounded-[10px]",
    btn: "rounded-[8px]",
    border: "border border-black/[0.07]",
    stickyFilter: false,
    art: "notebook",
    headerTone: "page",
  },
};

const linkIcon = (kind: BioLink["kind"], size = 18) => {
  switch (kind) {
    case "wa":
      return <MessageCircle size={size} strokeWidth={1.7} />;
    case "ig":
      return <AtSign size={size} strokeWidth={1.7} />;
    case "tiktok":
      return <Music2 size={size} strokeWidth={1.7} />;
    case "fb":
      return <ThumbsUp size={size} strokeWidth={1.7} />;
    default:
      return <Link2 size={size} strokeWidth={1.7} />;
  }
};

/* ------------------------------ empty art ------------------------------ */

function EmptyArt({ kind, color }: { kind: UI["art"]; color: string }) {
  const s = { stroke: color, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" as const };
  const common = { width: 104, height: 104, viewBox: "0 0 104 104" };
  switch (kind) {
    case "cup":
      return (
        <svg {...common}>
          <ellipse cx="52" cy="40" rx="24" ry="9" {...s} />
          <path d="M28 40c0 18 8 30 24 30s24-12 24-30" {...s} />
          <path d="M76 44c8-2 12 2 12 7s-5 10-12 9M46 22c-4-5 0-8 2-11M58 22c-4-5 0-8 2-11" {...s} />
        </svg>
      );
    case "hanger":
      return (
        <svg {...common}>
          <path d="M52 30c8 0 8 8 0 10L20 62h64L52 40" {...s} />
          <circle cx="52" cy="24" r="5" {...s} />
          <path d="M28 74h48" {...s} />
        </svg>
      );
    case "tools":
      return (
        <svg {...common}>
          <path d="M30 74 62 42M66 38l6-6a10 10 0 1 0-14 14l-6 6" {...s} />
          <rect x="24" y="66" width="16" height="16" rx="3" transform="rotate(-45 24 66)" {...s} />
          <path d="M58 70h20v14H58z" {...s} />
        </svg>
      );
    case "steamer":
      return (
        <svg {...common}>
          <path d="M26 50h52l-6 28H32z" {...s} />
          <path d="M26 50c0-12 12-20 26-20s26 8 26 20" {...s} />
          <path d="M44 22c2-4 0-6-1-8M58 22c2-4 0-6-1-8" {...s} />
        </svg>
      );
    case "weave":
      return (
        <svg {...common}>
          {[0, 1, 2, 3].map((i) => (
            <path key={`v${i}`} d={`M${30 + i * 15} 22v60`} {...s} />
          ))}
          {[0, 1, 2].map((i) => (
            <path key={`h${i}`} d={`M22 ${34 + i * 18}h60`} {...s} strokeDasharray="6 5" />
          ))}
        </svg>
      );
    case "terminal":
      return (
        <svg {...common}>
          <rect x="18" y="26" width="68" height="52" rx="6" {...s} />
          <path d="M30 48l10 8-10 8M48 64h24" {...s} />
        </svg>
      );
    case "notebook":
      return (
        <svg {...common}>
          <rect x="28" y="20" width="48" height="64" rx="5" {...s} />
          <path d="M38 36h28M38 48h28M38 60h16" {...s} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="52" cy="52" r="26" {...s} />
          <circle cx="52" cy="52" r="13" {...s} strokeDasharray="4 5" />
          <path d="M82 40h10M82 64h10" {...s} />
        </svg>
      );
  }
}

/* -------------------------------- card --------------------------------- */

interface CardCtx {
  theme: ThemeDef;
  ui: UI;
  dark: boolean;
  closed: boolean;
  onAdd: (p: Product) => void;
  added: string | null;
  wa?: BioLink;
}

function StockChip({ p, theme, dark }: { p: Product; theme: ThemeDef; dark: boolean }) {
  if (p.stock === 0) {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-[3px] text-[10px] font-semibold tracking-wide"
        style={{
          background: dark ? "rgba(240,101,90,.14)" : `${theme.badges.habis}22`,
          color: dark ? theme.badges.tutup : theme.badges.habis,
        }}
      >
        HABIS
      </span>
    );
  }
  if (p.stock <= 5) {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-[3px] text-[10px] font-semibold tnum"
        style={{
          background: dark ? "rgba(242,176,30,.16)" : `${theme.badges.sisa}1F`,
          color: theme.badges.sisa,
        }}
      >
        Sisa {p.stock}
      </span>
    );
  }
  return (
    <span className="text-[10px] tnum" style={{ color: theme.palette.muted }}>
      Stok {p.stock}
    </span>
  );
}

function Monogram({ p, theme, dark }: { p: Product; theme: ThemeDef; dark: boolean }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1 text-center"
      style={{
        background: dark ? "#0E1116" : `${theme.palette.text}08`,
        backgroundImage: dark
          ? "linear-gradient(rgba(237,241,245,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(237,241,245,.06) 1px,transparent 1px)"
          : "linear-gradient(rgba(0,0,0,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.045) 1px,transparent 1px)",
        backgroundSize: "12px 12px",
      }}
    >
      <span className="px-2 text-[9px] leading-tight tracking-[0.14em]" style={{ color: theme.palette.muted }}>
        {p.sku}
      </span>
      <span className="text-[9px]" style={{ color: theme.palette.muted, opacity: 0.8 }}>
        belum ada foto
      </span>
    </div>
  );
}

function Photo({ p, theme, className }: { p: Product; theme: ThemeDef; className: string }) {
  const [broken, setBroken] = useState(false);
  if (!p.photo || broken) return <div className={className}> <Monogram p={p} theme={theme} dark={theme.n === 7} /> </div>;
  return (
    <img
      src={p.photo}
      alt={p.name}
      loading="lazy"
      onError={() => setBroken(true)}
      className={`${className} object-cover`}
      style={{ display: "block" }}
    />
  );
}

function CoverImage({ src, name, theme }: { src: string; name: string; theme: ThemeDef }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-full w-full items-end p-3" style={{ background: `${theme.palette.accent}14` }}>
        <span className="text-[10px] tracking-[0.12em] uppercase" style={{ color: theme.palette.muted }}>
          {name} · seller belum mengunggah foto sampul
        </span>
      </div>
    );
  }
  return <img src={src} alt={`Sampul ${name}`} onError={() => setFailed(true)} className="h-full w-full object-cover" loading="lazy" />;
}

function BuyButton({ p, ctx, wide }: { p: Product; ctx: CardCtx; wide?: boolean }) {
  const { theme, ui, closed, onAdd, added, dark } = ctx;
  const justAdded = added === p.id;

  if (closed) {
    return (
      <span
      className={`tap inline-flex ${wide ? "w-full min-w-0 flex-1" : ""} items-center justify-center gap-1.5 text-[12px] font-semibold ${ui.btn}`}
      style={{
        height: 44,
        background: dark ? "#262C34" : `${theme.palette.text}0C`,
          color: theme.palette.muted,
          cursor: "not-allowed",
          padding: wide ? undefined : "0 12px",
        }}
        aria-disabled="true"
      >
        <Lock size={14} /> Toko tutup
      </span>
    );
  }
  if (p.stock === 0) {
    return (
      <span
        className={`inline-flex ${wide ? "w-full min-w-0 flex-1" : ""} items-center justify-center text-[12px] font-semibold ${ui.btn}`}
        style={{
          height: 44,
          background: dark ? "transparent" : `${theme.badges.habis}14`,
          color: theme.palette.muted,
          border: dark ? "1px dashed rgba(237,241,245,.22)" : "1px dashed rgba(0,0,0,.18)",
          padding: wide ? undefined : "0 12px",
        }}
        aria-disabled="true"
      >
        {theme.n === 5 ? "Habis hari ini" : "Stok habis"}
      </span>
    );
  }
  const label =
    theme.layout === "menu" ? "+ Pesan" : theme.layout === "dense" ? "+ ADD" : theme.layout === "rows" ? "+ Tambah" : added === p.id ? "Ditambahkan ✓" : theme.layout === "editorial" || theme.layout === "single" || theme.layout === "story" ? "Tambah ke keranjang" : "Tambah";
  return (
    <button
      type="button"
      onClick={() => onAdd(p)}
      className={`tap inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap text-[13px] font-bold ${ui.btn} ${wide ? "w-full min-w-0 flex-1" : ""}`}
      style={{
        height: theme.layout === "single" ? 48 : 44,
        background: justAdded ? (dark ? "#1E2530" : `${theme.palette.accent}14`) : theme.palette.accent,
        color: justAdded ? theme.palette.accent : theme.onAccent,
        border: justAdded ? `1px solid ${theme.palette.accent}` : "1px solid transparent",
        boxShadow: dark ? "none" : "0 1px 0 rgba(0,0,0,.06)",
        padding: wide ? undefined : "0 12px",
        fontFamily: justAdded ? undefined : theme.fonts.bodyStack,
      }}
    >
      {justAdded ? <Check size={14} /> : theme.layout === "menu" || theme.layout === "vertical" ? null : <Plus size={14} />}
      {label}
    </button>
  );
}

function WaLink({ ctx, variant }: { ctx: CardCtx; variant: "icon" | "text" | "none" }) {
  const { wa, theme, dark } = ctx;
  if (!wa || variant === "none") return null;
  if (variant === "icon") {
    return (
      <a
        href={wa.url}
        target="_blank"
        rel="noreferrer"
        className="tap inline-flex items-center justify-center gap-1 rounded-[8px] text-[11px]"
        style={{ height: 44, width: 44, border: `1px solid ${dark ? "rgba(237,241,245,.2)" : "rgba(0,0,0,.16)"}`, color: theme.palette.muted }}
        aria-label="Tanya stok lewat WhatsApp"
        title="Tanya stok (bukan order)"
      >
        <MessageCircle size={17} />
      </a>
    );
  }
  return (
    <a
      href={wa.url}
      target="_blank"
      rel="noreferrer"
      className="tap inline-flex items-center gap-1.5 text-[12px] underline underline-offset-2"
      style={{ color: theme.palette.muted, minHeight: 32 }}
    >
      <MessageCircle size={14} /> tanya stok via WhatsApp
    </a>
  );
}

function ProductCard({ p, ctx }: { p: Product; ctx: CardCtx }) {
  const { theme, ui, dark } = ctx;
  const L = theme.layout;

  const nameStyle = { fontFamily: L === "editorial" || L === "vertical" || L === "story" || L === "single" ? theme.fonts.displayStack : theme.fonts.bodyStack };
  const nameClass =
    L === "editorial"
      ? "text-[18px] leading-snug"
      : L === "vertical"
        ? "text-[15px] leading-snug"
        : L === "story"
          ? "text-[15px] leading-snug"
          : L === "single"
            ? "text-[17px] leading-snug"
            : L === "menu"
              ? "text-[15px] leading-snug"
              : L === "dense"
                ? "text-[13px] leading-snug"
                : "text-[13px] leading-snug";

  const priceNode = (
    <span className="tnum font-extrabold" style={{ color: theme.palette.accent, fontSize: L === "editorial" ? 17 : L === "menu" ? 16 : 15 }}>
      {rupiah(p.price)}
    </span>
  );

  if (L === "grid2") {
    return (
      <article className={`overflow-hidden ${ui.card} ${ui.border}`} style={{ background: theme.palette.surface }}>
        <div className="relative">
          <Photo p={p} theme={theme} className={`w-full aspect-square ${ui.photo}`} />
          {p.stock === 0 && (
            <span
              className="absolute bottom-1.5 left-1.5 rounded-[6px] px-1.5 py-[3px] text-[10px] font-extrabold tracking-wide"
              style={{ background: theme.badges.habis, color: dark ? "#0E1116" : "#fff" }}
            >
              HABIS
            </span>
          )}
          {p.stock > 0 && p.stock <= 5 && (
            <span
              className="absolute bottom-1.5 left-1.5 rounded-[6px] px-1.5 py-[3px] text-[10px] font-extrabold tnum"
              style={{ background: theme.badges.sisa, color: "#2B2200" }}
            >
              SISA {p.stock}
            </span>
          )}
        </div>
        <div className="space-y-1 p-2.5">
          <h4 className={`line-clamp-2 font-extrabold ${""}`} style={{ ...nameStyle, ...{ fontSize: 13, lineHeight: 1.25 } }}>
            {p.name}
          </h4>
          <div className="text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: theme.palette.muted }}>
            {p.category}
          </div>
          <div className="flex items-end justify-between">
            {priceNode}
            <StockChip p={p} theme={theme} dark={dark} />
          </div>
          <div className="flex gap-1.5 pt-1">
            <BuyButton p={p} ctx={ctx} wide />
            <WaLink ctx={ctx} variant="icon" />
          </div>
        </div>
      </article>
    );
  }

  if (L === "rows" || L === "dense") {
    const isDark = dark;
    return (
      <article className={`flex items-stretch gap-3 p-2.5 ${ui.card} ${ui.border}`} style={{ background: theme.palette.surface }}>
        <div className={`h-[62px] w-[88px] shrink-0 overflow-hidden ${ui.photo}`}>
          <Photo p={p} theme={theme} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className={`line-clamp-2 ${nameClass} font-semibold`} style={nameStyle}>
            {p.name}
          </h4>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[10px]" style={{ color: theme.palette.muted }}>
            <span className="tracking-[0.1em] uppercase">{p.category}</span>
            <span>·</span>
            <span className="tracking-[0.04em]">{p.sku}</span>
          </div>
          <p className="mt-1 line-clamp-1 text-[11px] leading-snug" style={{ color: theme.palette.muted }}>
            {p.desc}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
            <div className="flex min-w-0 items-center gap-2">
              {priceNode}
              <StockChip p={p} theme={theme} dark={isDark} />
            </div>
            <BuyButton p={p} ctx={ctx} />
          </div>
        </div>
      </article>
    );
  }

  if (L === "menu") {
    return (
      <article className={`flex gap-3 p-3 ${ui.card} ${ui.border}`} style={{ background: theme.palette.surface }}>
        <div className="relative shrink-0">
          <Photo p={p} theme={theme} className={`h-[104px] w-[104px] ${ui.photo}`} />
          {p.stock === 0 && (
            <span
              className="stamp-in absolute -bottom-2 -right-2 rounded-[4px] border-2 px-1.5 py-[2px] text-[10px] font-black tracking-[0.14em]"
              style={{ borderColor: theme.badges.tutup, color: theme.badges.tutup, background: theme.palette.surface, transform: "rotate(-14deg)" }}
            >
              HABIS
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className={`${nameClass} font-bold`} style={nameStyle}>
            {p.name}
          </h4>
          <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug" style={{ color: theme.palette.muted }}>
            {p.desc}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={{ color: theme.palette.muted }}>
              {p.category}
            </span>
            <span className="hairline h-px flex-1" style={{ color: `${theme.palette.text}44` }} />
            {priceNode}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <StockChip p={p} theme={theme} dark={dark} />
              <span className="text-[10px]" style={{ color: theme.palette.muted }}>
                {p.sku}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <WaLink ctx={ctx} variant="icon" />
              <BuyButton p={p} ctx={ctx} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (L === "single") {
    return (
      <article className={`overflow-hidden ${ui.card} ${ui.border}`} style={{ background: theme.palette.surface }}>
        {p.photo && <Photo p={p} theme={theme} className="h-[168px] w-full" />}
        <div className="space-y-2 p-4">
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: theme.palette.muted }}>
            {p.category} · {p.sku}
          </div>
          <h4 className={`${nameClass} font-medium`} style={nameStyle}>
            {p.name}
          </h4>
          <p className="text-[13px] leading-relaxed" style={{ color: theme.palette.muted }}>
            {p.desc}
          </p>
          <div className="flex items-center justify-between pt-1" style={{ borderTop: `1px solid ${theme.palette.text}14` }}>
            {priceNode}
            <StockChip p={p} theme={theme} dark={dark} />
          </div>
          <BuyButton p={p} ctx={ctx} wide />
          {p.stock === 0 && <WaLink ctx={ctx} variant="text" />}
        </div>
      </article>
    );
  }

  // editorial · vertical · story
  const ratio = L === "vertical" ? "aspect-[3/4]" : "aspect-[4/5]";
  return (
    <article className={`${ui.card} overflow-hidden ${ui.border}`} style={{ background: theme.palette.surface }}>
      <Photo p={p} theme={theme} className={`w-full ${ratio} ${ui.photo}`} />
      <div className={L === "vertical" ? "space-y-1.5 py-3" : "space-y-1.5 py-4"}>
        <div className="flex items-center justify-between text-[10px] tracking-[0.14em] uppercase" style={{ color: theme.palette.muted }}>
          <span>{p.category}</span>
          {p.stock === 0 && <span style={{ color: theme.badges.habis }}>Habis</span>}
        </div>
        <h4 className={`${nameClass} font-medium`} style={nameStyle}>
          {p.name}
        </h4>
        {L !== "vertical" && (
          <p className="line-clamp-2 text-[13px] leading-relaxed" style={{ color: theme.palette.muted }}>
            {p.desc}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="flex items-baseline gap-2">
            {priceNode}
            {L !== "vertical" && <span className="text-[9px] tracking-wide" style={{ color: theme.palette.muted }}>{p.sku}</span>}
          </span>
          <StockChip p={p} theme={theme} dark={dark} />
        </div>
        <div className="pt-2">
          <BuyButton p={p} ctx={ctx} wide />
        </div>
        {L === "story" && (
          <div className="pt-1 text-center">
            <WaLink ctx={ctx} variant="text" />
          </div>
        )}
      </div>
    </article>
  );
}

/* ------------------------------ Storefront ------------------------------ */

export type CatalogState = "normal" | "no-products" | "no-results";

export function Storefront({
  theme,
  mode,
  forceClosed,
  catalogState,
}: {
  theme: ThemeDef;
  mode: "mobile" | "desktop";
  forceClosed: boolean;
  catalogState: CatalogState;
}) {
  const store = theme.store;
  const ui = UI[theme.n];
  const p = theme.palette;
  const dark = theme.n === 7;
  const display = { fontFamily: theme.fonts.displayStack };
  const closed = forceClosed || !store.open;

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Semua");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [added, setAdded] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"none" | "cart" | "qr">("none");
  const [hoursOpen, setHoursOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (catalogState === "no-results") {
      setQuery("pasta gigi elektronik");
      setCat("Semua");
    } else if (catalogState === "no-products") {
      setQuery("");
      setCat("Semua");
    }
  }, [catalogState]);

  useEffect(() => {
    setQuery("");
    setCat("Semua");
    setCart({});
    setSheet("none");
  }, [theme.n]);

  const products = catalogState === "no-products" ? [] : store.products;
  const categories = useMemo(() => {
    const set = new Map<string, number>();
    products.forEach((x) => set.set(x.category, (set.get(x.category) ?? 0) + 1));
    return Array.from(set.entries());
  }, [products]);
  const filtered = useMemo(
    () =>
      products.filter(
        (x) =>
          (cat === "Semua" || x.category === cat) &&
          (query.trim() === "" ||
            x.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            x.sku.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [products, cat, query],
  );

  const dirty = query.trim() !== "" || cat !== "Semua";
  const cartCount = store.cartStart + Object.values(cart).reduce((a, b) => a + b, 0);
  const cartItems = Object.entries(cart)
    .map(([id, q]) => ({ product: store.products.find((x) => x.id === id)!, qty: q }))
    .filter((x) => x.product);
  const total = cartItems.reduce((s, x) => s + x.product.price * x.qty, 0);
  const wa = store.links.find((l) => l.kind === "wa");

  function showToast(t: string) {
    setToast(t);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 1800);
  }

  function add(p2: Product) {
    setCart((c) => ({ ...c, [p2.id]: (c[p2.id] ?? 0) + 1 }));
    setAdded(p2.id);
    showToast(`${p2.name} masuk keranjang`);
    window.setTimeout(() => setAdded((a) => (a === p2.id ? null : a)), 900);
  }

  async function share() {
    const url = `https://tokolink.id/${store.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: store.name, text: `${store.name} · ${store.city}`, url });
        showToast("Tautan dibagikan");
        return;
      }
    } catch {
      /* dibatalkan pengguna */
    }
    const ok = await copyText(url);
    showToast(ok ? "Tautan etalase disalin" : "Tidak bisa menyalin di browser ini");
  }

  const ctx: CardCtx = { theme, ui, dark, closed, onAdd: add, added, wa };

  const cols =
    mode === "mobile"
      ? theme.layout === "grid2"
        ? "grid-cols-2"
        : theme.layout === "story" && theme.n === 6
          ? "grid-cols-1"
          : "grid-cols-1"
      : theme.layout === "grid2"
        ? "grid-cols-4"
        : theme.layout === "story" || theme.layout === "editorial" || theme.layout === "vertical"
          ? "grid-cols-3"
          : theme.layout === "menu" || theme.layout === "single"
            ? "grid-cols-2"
            : "grid-cols-2";

  const gap = theme.layout === "grid2" ? "gap-2" : theme.layout === "rows" || theme.layout === "dense" ? "gap-1.5" : "gap-4";

  const nextOpen = (() => {
    const from = store.todayIndex;
    for (let i = 1; i <= 7; i++) {
      const d = store.hours[(from + i) % 7];
      if (d.range) return `${d.day} ${d.range.split("–")[0]}`;
    }
    return "segera";
  })();

  const IconButton = ({
    label,
    onClick,
    children,
    badge,
  }: {
    label: string;
    onClick?: () => void;
    children: React.ReactNode;
    badge?: number;
  }) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="tap relative inline-flex items-center justify-center rounded-[10px]"
      style={{ width: 44, height: 44, border: dark ? "1px solid rgba(237,241,245,.14)" : "1px solid rgba(0,0,0,.10)", color: p.text, background: "transparent" }}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className="pop-in absolute -top-1 -right-1 min-w-[18px] rounded-full px-1 text-[10px] font-bold leading-[18px]"
          style={{ background: p.accent, color: theme.onAccent }}
        >
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: p.bg, color: p.text, fontFamily: theme.fonts.bodyStack }}
    >
      {/* ================= HEADER ================= */}
      <header
        className={`z-30 shrink-0 ${ui.headerTone === "page" ? "" : ""}`}
        style={{
          background: ui.headerTone === "surface" ? p.surface : "transparent",
          borderBottom: ui.headerTone === "surface" || ui.headerTone === "strip" ? `1px solid ${p.text}${dark ? "1A" : "14"}` : "none",
        }}
      >
        <div className="flex items-center gap-2.5 px-3 py-2">
          <span
            className="grid shrink-0 place-items-center text-[13px] font-bold"
            style={{
              width: theme.layout === "dense" ? 30 : theme.layout === "rows" ? 28 : 40,
              height: theme.layout === "dense" ? 30 : theme.layout === "rows" ? 28 : 40,
              borderRadius: theme.layout === "vertical" || theme.layout === "editorial" || theme.layout === "rows" || theme.layout === "dense" ? 6 : 999,
              background: p.accent,
              color: theme.onAccent,
              fontFamily: display.fontFamily,
            }}
          >
            {store.logoText}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className="truncate"
                style={{
                  fontFamily: display.fontFamily,
                  fontSize: theme.layout === "rows" || theme.layout === "dense" ? 14 : theme.layout === "editorial" ? 20 : 17,
                  fontWeight: theme.layout === "rows" || theme.layout === "dense" ? 700 : 600,
                  letterSpacing: theme.layout === "dense" ? "0.02em" : "-0.01em",
                  textTransform: theme.layout === "dense" ? "uppercase" : "none",
                }}
              >
                {store.name}
              </h3>
              {theme.n === 2 && (
                <span className="ml-auto flex items-center gap-1 text-[11px]" style={{ color: closed ? theme.badges.tutup : theme.badges.buka }}>
                  <span className="live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: closed ? theme.badges.tutup : theme.badges.buka }} />
                  {closed ? "TUTUP" : "BUKA"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: p.muted }}>
              <MapPin size={11} strokeWidth={2} />
              <span className="truncate">{store.city}</span>
              {theme.n !== 2 && (
                <span
                  className="ml-1 inline-flex items-center gap-1 rounded-full px-1.5 py-[1px] text-[9px] font-bold tracking-[0.1em]"
                  style={{ background: closed ? `${theme.badges.tutup}1F` : `${theme.badges.buka}1F`, color: closed ? theme.badges.tutup : theme.badges.buka }}
                >
                  {closed ? "TUTUP" : "BUKA"}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <IconButton label="Tampilkan QR toko" onClick={() => setSheet("qr")}>
              <QrCode size={18} strokeWidth={1.8} />
            </IconButton>
            <IconButton label="Bagikan tautan etalase" onClick={share}>
              <Share2 size={18} strokeWidth={1.8} />
            </IconButton>
            <IconButton label={`Keranjang: ${cartCount} item`} onClick={() => setSheet("cart")} badge={cartCount}>
              <ShoppingBag size={18} strokeWidth={1.8} />
            </IconButton>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 pb-2 text-[11px]" style={{ color: closed ? theme.badges.tutup : p.muted }}>
          <Clock size={12} strokeWidth={2} />
          <span className="truncate">
            {closed ? `TUTUP · buka lagi ${nextOpen}` : `${store.today} · ${store.todayHours}`}
          </span>
          <button
            type="button"
            onClick={() => setHoursOpen((v) => !v)}
            className="tap ml-auto inline-flex items-center gap-1 rounded-[8px] px-1.5 text-[11px] font-semibold"
            style={{ minHeight: 32, color: p.accent }}
          >
            7 hari <ChevronDown size={13} className={hoursOpen ? "rotate-180 transition" : "transition"} />
          </button>
        </div>
        {hoursOpen && (
          <div className="px-3 pb-2.5" style={{ borderTop: `1px solid ${p.text}12` }}>
            <ul className="pt-1.5">
              {store.hours.map((h, i) => (
                <li
                  key={h.day}
                  className="flex items-center justify-between gap-2 rounded-[6px] px-1.5 py-[3px] text-[11px]"
                  style={{
                    background: i === store.todayIndex ? `${p.accent}14` : "transparent",
                    fontWeight: i === store.todayIndex ? 700 : 400,
                  }}
                >
                  <span style={{ color: p.muted }}>{h.day}</span>
                  <span className="tnum" style={{ color: h.range ? p.text : theme.badges.tutup }}>
                    {h.range ?? (theme.n === 7 ? "— (bantuan 09.00–17.00)" : "Tutup")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* ================= BODY ================= */}
      <div className="frame-scroll relative flex-1 overflow-y-auto">
        {closed && (
          <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold" style={{ background: `${theme.badges.tutup}14`, color: theme.badges.tutup }}>
            <AlertTriangle size={14} strokeWidth={2} />
            Toko tutup — tombol tambah nonaktif. Buka lagi {nextOpen}.
          </div>
        )}

        {/* SAMAPUL + PROFIL */}
        {theme.cover !== "none" && store.coverPhoto && (
          <div className={theme.cover === "full" ? "relative h-[152px] w-full overflow-hidden" : "relative h-[216px] w-full overflow-hidden"}>
            <CoverImage src={store.coverPhoto} name={store.name} theme={theme} />
            {theme.n === 5 && <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: p.accent }} />}
          </div>
        )}

        <section className={theme.cover === "half" ? `-mt-7 rounded-t-[14px] px-4 pt-4 pb-3 ${mode === "desktop" ? "mx-3" : "mx-3"}` : "px-4 pt-3.5 pb-3"} style={{ background: theme.cover === "half" ? p.surface : "transparent" }}>
          {store.bio ? (
            <p
              className="text-[14px] leading-relaxed"
              style={{ fontFamily: theme.layout === "story" || theme.layout === "editorial" ? display.fontFamily : undefined, fontSize: theme.layout === "editorial" ? 15 : 14, color: p.text }}
            >
              {theme.n === 7 && <span style={{ color: p.accent }}>&gt; </span>}
              {store.bio}
            </p>
          ) : (
            <p className="text-[12px]" style={{ color: p.muted }}>
              {store.city} · {products.length} produk di katalog — seller belum mengisi bio.
            </p>
          )}

          {theme.n === 6 && (
            <blockquote className="mt-2.5 border-l-2 pl-3 text-[12px] italic" style={{ borderColor: p.accent, fontFamily: display.fontFamily, color: p.muted }}>
              “{store.bio.split(".").find((s) => s.trim().length > 20) ?? store.bio}”
            </blockquote>
          )}
        </section>

        {/* TAUTAN BIO */}
        {store.links.length > 0 && (
          <section className="px-3 pb-3" style={{ borderTop: `1px solid ${p.text}12` }}>
            <h4 className="pt-3 pb-1.5 text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: p.muted, fontFamily: theme.fonts.displayStack }}>
              {theme.n === 2 ? "Catatan & kanal" : theme.n === 6 ? "Kanal & catatan" : "Ikuti / hubungi"}
            </h4>
            <ul className={theme.layout === "story" || theme.n === 5 ? "grid grid-cols-1 gap-1.5 min-[380px]:grid-cols-2" : "divide-y"} style={{ borderColor: `${p.text}12` }}>
              {store.links.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="tap group flex items-center gap-2.5 rounded-[10px] py-2"
                    style={{
                      minHeight: 44,
                      padding: theme.n === 5 || theme.layout === "story" ? "8px 10px" : "8px 4px",
                      background: theme.n === 5 || theme.layout === "story" ? p.surface : "transparent",
                      border: theme.n === 5 ? "1px dashed rgba(0,0,0,.2)" : theme.layout === "story" ? `1px solid ${p.text}12` : "none",
                    }}
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                      style={{
                        background: l.kind === "wa" ? `${p.accent}14` : `${p.text}0A`,
                        color: l.kind === "wa" ? p.accent : p.text,
                        borderLeft: l.kind === "wa" && theme.n === 1 ? `3px solid #25D366` : undefined,
                      }}
                    >
                      {linkIcon(l.kind)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{l.label}</span>
                      <span className="block truncate text-[10px]" style={{ color: p.muted }}>
                        {l.url.replace(/^https?:\/\//, "")}
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide" style={{ color: p.muted }}>
                      {l.kind === "link" ? "tautan" : l.kind}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FILTER */}
        {products.length > 0 && (
          <section
            className={`px-3 py-2.5 ${ui.stickyFilter ? "sticky" : ""}`}
            style={{
              top: 0,
              zIndex: ui.stickyFilter ? 20 : undefined,
              background: ui.stickyFilter ? `${p.bg}F2` : "transparent",
              backdropFilter: ui.stickyFilter ? "blur(6px)" : undefined,
              borderBottom: ui.stickyFilter ? `1px solid ${p.text}12` : `1px solid ${p.text}12`,
            }}
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2" style={{ color: p.muted }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={theme.n === 7 ? "cari nama atau SKU…" : theme.n === 4 ? "cari layanan atau kode…" : theme.n === 2 ? "cari biji, pastry, alat…" : "cari nama produk…"}
                  className="w-full text-[13px] outline-none"
                  style={{
                    height: theme.n === 2 || theme.n === 7 ? 40 : 44,
                    paddingLeft: 34,
                    paddingRight: 30,
                    color: p.text,
                    background: theme.n === 2 || theme.n === 7 ? "transparent" : dark ? "#0E1116" : p.surface,
                    borderRadius: theme.n === 2 ? 0 : theme.n === 7 ? 0 : theme.n === 3 ? 0 : ui.btn,
                    border: theme.n === 2 || theme.n === 7 ? "none" : `1px solid ${p.text}1F`,
                    borderBottom: theme.n === 2 || theme.n === 7 ? `1px solid ${p.text}33` : undefined,
                    fontFamily: theme.n === 7 ? theme.fonts.bodyStack : undefined,
                  }}
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Hapus kata kunci"
                    onClick={() => setQuery("")}
                    className="tap absolute top-1/2 right-1 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full"
                    style={{ color: p.muted, background: `${p.text}0A` }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="button"
                disabled={!dirty}
                onClick={() => {
                  setQuery("");
                  setCat("Semua");
                  showToast("Filter direset");
                }}
                className="tap inline-flex items-center gap-1 rounded-[8px] px-2 text-[11px] font-semibold"
                style={{
                  height: 40,
                  color: dirty ? p.accent : `${p.muted}99`,
                  border: `1px solid ${dirty ? `${p.accent}66` : `${p.text}14`}`,
                  cursor: dirty ? "pointer" : "not-allowed",
                }}
              >
                <RotateCcw size={13} /> {theme.n === 7 ? "RESET" : "Reset"}
              </button>
            </div>
            <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
              {["Semua", ...categories.map(([c]) => c)].map((c) => {
                const active = cat === c;
                const count = c === "Semua" ? products.length : products.filter((x) => x.category === c).length;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className="tap shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-semibold"
                    style={{
                      minHeight: 34,
                      background: active ? (theme.n === 5 ? p.text : p.accent) : p.surface,
                      color: active ? (theme.n === 5 ? p.bg : theme.onAccent) : p.text,
                      border: `1px solid ${active ? "transparent" : `${p.text}1F`}`,
                      fontFamily: theme.n === 7 ? theme.fonts.bodyStack : undefined,
                    }}
                  >
                    {c} <span className="tnum opacity-70">{theme.n === 7 ? `(${count})` : count}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* KATALOG */}
        <section className="px-3 pt-3 pb-6">
          {catalogState === "no-products" ? (
            <EmptyBlock
              theme={theme}
              ui={ui}
              title="Belum ada produk di etalase ini"
              body={`${store.name} belum menambahkan produk. Begitu ada, kartunya langsung tampil di sini — tanpa placeholder palsu.`}
            />
          ) : filtered.length === 0 ? (
            <EmptyBlock
              theme={theme}
              ui={ui}
              title={`Tidak ada hasil untuk “${query}”`}
              body="Coba kata lain, atau atur ulang filter untuk melihat seluruh katalog."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCat("Semua");
                  }}
                  className="tap mt-3 inline-flex items-center gap-1.5 px-3 text-[12px] font-bold"
                  style={{ height: 40, borderRadius: ui.btn, background: p.accent, color: theme.onAccent }}
                >
                  <RotateCcw size={14} /> Atur ulang filter
                </button>
              }
            />
          ) : (
            <>
              <div className="mb-2.5 flex items-baseline justify-between">
                <h4 className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: p.muted, fontFamily: theme.fonts.displayStack }}>
                  {theme.n === 5 ? "Papan menu hari ini" : theme.n === 4 ? "Daftar layanan" : "Katalog"}
                </h4>
                <span className="text-[11px] tnum" style={{ color: p.muted }}>
                  {filtered.length} dari {products.length}
                </span>
              </div>
              <div className={`grid ${cols} ${gap}`}>
                {filtered.map((x) => (
                  <ProductCard key={x.id} p={x} ctx={ctx} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* FOOTER + QR */}
        <footer className="px-4 pt-4 pb-6 text-center" style={{ borderTop: `1px solid ${p.text}12`, background: theme.n === 2 ? p.surface : "transparent" }}>
          {(theme.n === 2 || theme.n === 7 || theme.n === 8) && (
            <div
              className="mx-auto mb-3 inline-flex flex-col items-center gap-2 p-3"
              style={{ borderRadius: 12, background: theme.n === 7 ? p.surface : "transparent", border: dark ? `1px solid ${p.text}1A` : undefined }}
            >
              <QrArt seed={store.slug} px={140} dark={dark ? "#EDF1F5" : p.text} light={dark ? "#EDF1F5" : p.surface} />
              <p className="text-[11px]" style={{ color: p.muted }}>
                Pindai untuk buka etalase ini
              </p>
              <button
                type="button"
                onClick={() => {
                  downloadQrPng(store.slug, `tokolink-${store.slug}-qr.png`);
                  showToast("QR PNG diunduh");
                }}
                className="tap inline-flex items-center gap-1.5 px-3 text-[12px] font-semibold"
                style={{ height: 40, borderRadius: ui.btn, border: `1px solid ${p.accent}`, color: p.accent }}
              >
                <Download size={14} /> Unduh PNG
              </button>
            </div>
          )}
          <div className="text-[12px] font-semibold" style={{ fontFamily: display.fontFamily }}>
            {store.name} · {store.city}
          </div>
          <div className="mt-1 text-[11px]" style={{ color: p.muted }}>
            Dibuat dengan{" "}
            <span className="font-bold" style={{ color: dark ? p.text : p.accent }}>
              TokoLink
            </span>
          </div>
        </footer>
      </div>

      {/* ================= OVERLAY ================= */}
      {sheet !== "none" && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end" style={{ background: "rgba(8,10,12,.5)" }} onClick={() => setSheet("none")}>
          {sheet === "qr" ? (
            <div className="sheet-up rounded-t-[18px] p-5 text-center" style={{ background: p.surface }} onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto mb-3 h-1 w-9 rounded-full" style={{ background: `${p.text}22` }} />
              <h5 className="text-[15px] font-bold" style={{ fontFamily: display.fontFamily }}>
                QR etalase {store.name}
              </h5>
              <p className="mt-1 text-[11px]" style={{ color: p.muted }}>
                Pindai untuk membuka halaman toko ini di HP lain.
              </p>
              <div className="mt-4 flex justify-center">
                <div className="p-3" style={{ background: "#fff", borderRadius: 10, boxShadow: "0 6px 22px rgba(0,0,0,.14)" }}>
                  <QrArt seed={store.slug} px={168} />
                </div>
              </div>
              <p className="mt-3 truncate text-[10px]" style={{ color: p.muted, fontFamily: theme.fonts.bodyStack }}>
                tokolink.id/{store.slug}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    downloadQrPng(store.slug, `tokolink-${store.slug}-qr.png`);
                    showToast("QR PNG 1024px diunduh");
                  }}
                  className="tap flex-1 text-[13px] font-bold"
                  style={{ height: 44, borderRadius: ui.btn, background: p.accent, color: theme.onAccent }}
                >
                  Unduh PNG
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyText(`https://tokolink.id/${store.slug}`);
                    showToast(ok ? "Tautan disalin" : "Gagal menyalin");
                  }}
                  className="tap flex-1 text-[13px] font-semibold"
                  style={{ height: 44, borderRadius: ui.btn, border: `1px solid ${p.text}26`, color: p.text, background: "transparent" }}
                >
                  Salin tautan
                </button>
              </div>
              <p className="mt-3 text-[10px] leading-snug" style={{ color: p.muted }}>
                Matriks di atas = preview desain. QR asli digenerate server dari URL etalase.
              </p>
            </div>
          ) : (
            <div className="sheet-up rounded-t-[18px] p-5" style={{ background: p.surface }} onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto mb-3 h-1 w-9 rounded-full" style={{ background: `${p.text}22` }} />
              <div className="flex items-center justify-between">
                <h5 className="text-[15px] font-bold" style={{ fontFamily: display.fontFamily }}>
                  Keranjang
                </h5>
                <button type="button" onClick={() => setSheet("none")} className="tap grid h-8 w-8 place-items-center rounded-full" style={{ background: `${p.text}0D` }} aria-label="Tutup keranjang">
                  <X size={16} />
                </button>
              </div>
              {cartItems.length === 0 ? (
                <p className="py-6 text-center text-[12px]" style={{ color: p.muted }}>
                  Keranjang masih kosong. Tekan “{theme.layout === "menu" ? "+ Pesan" : "Tambah"}” di kartu produk.
                </p>
              ) : (
                <ul className="mt-2 divide-y" style={{ borderColor: `${p.text}14` }}>
                  {cartItems.map(({ product, qty }) => (
                    <li key={product.id} className="flex items-center gap-2 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold">{product.name}</p>
                        <p className="text-[11px] tnum" style={{ color: p.accent }}>
                          {rupiah(product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1" style={{ borderRadius: 8, border: `1px solid ${p.text}1F` }}>
                        <button
                          type="button"
                          aria-label="Kurangi"
                          className="grid h-8 w-8 place-items-center"
                          onClick={() =>
                            setCart((c) => {
                              const n = (c[product.id] ?? 0) - 1;
                              const copy = { ...c };
                              if (n <= 0) delete copy[product.id];
                              else copy[product.id] = n;
                              return copy;
                            })
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-4 text-center text-[12px] tnum">{qty}</span>
                        <button
                          type="button"
                          aria-label="Tambah satu lagi"
                          className="grid h-8 w-8 place-items-center"
                          disabled={closed || qty >= product.stock}
                          onClick={() => setCart((c) => ({ ...c, [product.id]: (c[product.id] ?? 0) + 1 }))}
                          style={{ color: closed || qty >= product.stock ? p.muted : p.text, cursor: closed || qty >= product.stock ? "not-allowed" : "pointer" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Hapus dari keranjang"
                        className="tap grid h-8 w-8 place-items-center rounded-[8px]"
                        style={{ color: p.muted }}
                        onClick={() =>
                          setCart((c) => {
                            const copy = { ...c };
                            delete copy[product.id];
                            return copy;
                          })
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: `${p.text}14` }}>
                <span className="text-[12px]" style={{ color: p.muted }}>
                  {cartCount} item · total
                </span>
                <span className="text-[17px] font-extrabold tnum" style={{ color: p.accent }}>
                  {rupiah(total)}
                </span>
              </div>
              <p className="mt-2 text-[10px] leading-snug" style={{ color: p.muted }}>
                Checkout QRIS, detail produk, dan lacak pesanan = halaman bersama yang sudah final — di luar cakupan 8 tema ini.
              </p>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2">
          <div className="pop-in rounded-full px-3.5 py-2 text-[12px] font-semibold shadow-lg" style={{ background: dark ? p.surface : p.text, color: dark ? p.text : p.bg }}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyBlock({
  theme,
  ui,
  title,
  body,
  action,
}: {
  theme: ThemeDef;
  ui: UI;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const dark = theme.n === 7;
  return (
    <div
      className="flex flex-col items-center justify-center px-5 py-9 text-center"
      style={{
        borderRadius: ui.card,
        border: dark ? "1px dashed rgba(237,241,245,.22)" : `1px dashed ${theme.palette.text}33`,
        background: dark ? theme.palette.surface : `${theme.palette.surface}80`,
      }}
    >
      <EmptyArt kind={ui.art} color={theme.palette.muted} />
      <h5 className="mt-2 text-[15px] font-bold" style={{ fontFamily: theme.fonts.displayStack }}>
        {title}
      </h5>
      <p className="mt-1 max-w-[30ch] text-[12px] leading-relaxed" style={{ color: theme.palette.muted }}>
        {body}
      </p>
      {action}
    </div>
  );
}
