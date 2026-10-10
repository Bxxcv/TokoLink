/**
 * Vercel Edge Middleware — OG dinamis per toko untuk PREMIUM (Bot crawler).
 *
 * Cara kerja: kalau user-agent = crawler (WhatsApp/FB/X/Telegram/dll)
 * DAN path = /{slug} (satu segmen, bukan rute aplikasi), ambil profil
 * toko via Supabase REST (anon key) lalu kembalikan HTML mini berisi
 * meta og:title/description/image KHUSUS toko itu.
 *
 * Bukan bot / bukan slug / gagal apapun → teruskan normal (situs tak
 * pernah rusak oleh file ini). Tanpa dependency, tanpa ubah build.
 */

export const config = { matcher: ["/:slug"] };

const RESERVED = new Set([
  "s", "login", "register", "forgot", "cart", "checkout", "order",
  "app", "admin", "legal", "system", "api", "reset",
]);

const BOTS = [
  "facebookexternalhit", "facebot", "whatsapp", "twitterbot",
  "telegrambot", "linkedinbot", "slackbot", "discordbot",
];

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default async function middleware(request) {
  try {
    const ua = (request.headers.get("user-agent") || "").toLowerCase();
    if (!BOTS.some((b) => ua.includes(b))) return fetch(request);

    const url = new URL(request.url);
    const seg = url.pathname.split("/").filter(Boolean);
    if (seg.length !== 1 || RESERVED.has(seg[0].toLowerCase())) return fetch(request);

    const base = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
    if (!base || !key) return fetch(request);

    const r = await fetch(
      `${base}/rest/v1/profiles?store_slug=eq.${encodeURIComponent(seg[0])}&select=store_name,bio,city,plan`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!r.ok) return fetch(request);
    const rows = await r.json();
    const store = Array.isArray(rows) ? rows[0] : null;
    // OG khusus hanya untuk toko PREMIUM; gratis dapat meta standar (index.html).
    if (!store || store.plan !== "premium") return fetch(request);

    const title = esc(store.store_name || "Toko");
    const desc = esc(store.bio || `Katalog ${store.store_name || "toko"}${store.city ? ` — ${store.city}` : ""}`);
    const page = esc(`${url.origin}/${encodeURIComponent(seg[0])}`);
    const img = esc(`${url.origin}/images/twitter_meta/twitter_card.jpg`);
    const html =
      `<!doctype html><html lang="id"><head><meta charset="utf-8">` +
      `<title>${title} — TokoLink</title>` +
      `<meta property="og:type" content="website">` +
      `<meta property="og:site_name" content="TokoLink">` +
      `<meta property="og:title" content="${title} — TokoLink">` +
      `<meta property="og:description" content="${desc}">` +
      `<meta property="og:url" content="${page}">` +
      `<meta property="og:image" content="${img}">` +
      `<meta name="twitter:card" content="summary_large_image">` +
      `<meta name="twitter:title" content="${title} — TokoLink">` +
      `<meta name="twitter:description" content="${desc}">` +
      `<meta name="twitter:image" content="${img}">` +
      `<meta http-equiv="refresh" content="0;url=${page}">` +
      `</head><body><a href="${page}">${title}</a></body></html>`;
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  } catch {
    return fetch(request);
  }
}
