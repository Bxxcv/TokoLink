import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESERVED = new Set([
  "s", "login", "register", "forgot", "cart", "checkout", "order",
  "app", "admin", "legal", "system", "api", "tentang", "kontak", "harga",
]);

const CRAWLER = /bot|crawler|spider|facebookexternalhit|whatsapp|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|googlebot|bingbot|yandex|duckduckbot|baiduspider/i;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const m = pathname.match(/^\/([^/]+)\/?$/);
  if (!m) return NextResponse.next();
  const slug = m[1].toLowerCase();
  if (RESERVED.has(slug) || slug.includes(".")) return NextResponse.next();
  if (!CRAWLER.test(req.headers.get("user-agent") || "")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/t/${slug}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/:path*"],
};
