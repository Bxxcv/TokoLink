const RESERVED = new Set([
  "s", "login", "register", "forgot", "cart", "checkout", "order",
  "app", "admin", "legal", "system", "api", "tentang", "kontak", "harga", "chat",
]);

const CRAWLER = /bot|crawler|spider|facebookexternalhit|whatsapp|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|googlebot|bingbot|yandex|duckduckbot|baiduspider/i;

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const m = url.pathname.match(/^\/([^/]+)\/?$/);
  if (!m) return;
  const slug = m[1].toLowerCase();
  if (RESERVED.has(slug) || slug.includes(".")) return;
  const ua = request.headers.get("user-agent") || "";
  if (!CRAWLER.test(ua)) return;
  const rewriteUrl = new URL(`/t/${slug}`, request.url);
  const res = new Response(null, { status: 200 });
  res.headers.set("x-middleware-rewrite", rewriteUrl.toString());
  return res;
}

export const config = {
  matcher: ["/:path*"],
};
