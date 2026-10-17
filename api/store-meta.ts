// GET /t/:slug — halaman "kartu pintu" toko untuk PREVIEW LINK.
// Dipakai tautan yang DISALIN/DIBAGIKAN seller: WhatsApp/IG/FB membaca
// og:title/og:description/og:image DARI HTML INI (crawler tidak jalankan
// JS). Manusia langsung dialihkan ke halaman toko asli /s/{slug}.
//
// Kenapa bukan middleware: percobaan middleware.js sebelumnya bikin loop
// 508 di /reset (lihat riwayat). Rute /t/ ini terisolasi — kalau bermasalah,
// paling buruk hanya tautan /t/ yang gagal, halaman toko TIDAK tersentuh.
//
// Keamanan: slug disaring [a-z0-9-]; semua teks toko di-escape sebelum
// masuk HTML (store_name/bio/bio dsb berasal dari input seller).
//
// CATATAN VERCEL: SELF-CONTAINED (tanpa import relatif).

import { createClient } from "@supabase/supabase-js";

const BASE = "https://www.tokolink.store";
const FALLBACK_OG = `${BASE}/images/twitter_meta/twitter_card.jpg`;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  const s = String(u).trim();
  return /^https:\/\//i.test(s) ? s : null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).send("Method tidak didukung.");
    return;
  }
  const slug = String(req.query?.slug ?? "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug)) {
    res.status(302).setHeader("Location", `${BASE}/`);
    res.end();
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  let store: {
    store_name: string | null; store_slug: string | null; city: string | null;
    category: string | null; bio: string | null; avatar_url: string | null;
    cover_url: string | null; is_closed: boolean | null;
  } | null = null;
  if (url && key) {
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await db
      .from("stores")
      .select("store_name,store_slug,city,category,bio,avatar_url,cover_url,is_closed")
      .eq("store_slug", slug)
      .maybeSingle();
    store = (data as typeof store) ?? null;
  }

  // Toko tidak ada → jangan bikin halaman hantu; balik ke beranda.
  if (!store) {
    res.status(302).setHeader("Location", `${BASE}/`);
    res.end();
    return;
  }

  const name = (store.store_name ?? "").trim() || "Toko di TokoLink";
  const dest = `${BASE}/s/${slug}`;
  const img = safeUrl(store.cover_url) ?? safeUrl(store.avatar_url) ?? FALLBACK_OG;
  const bits = [store.category, store.city].map((x) => (x ?? "").trim()).filter(Boolean);
  const desc = (store.bio ?? "").trim()
    || `Lihat katalog, harga, dan checkout QRIS di ${name}${bits.length ? ` — ${bits.join(" · ")}` : ""}.`;
  const descTrim = desc.slice(0, 180);
  const title = `${name}${store.is_closed ? " (sedang tutup)" : ""} — TokoLink`;

  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(descTrim)}" />
<meta name="robots" content="noindex" />
<link rel="canonical" href="${esc(dest)}" />
<meta http-equiv="refresh" content="0;url=${esc(dest)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="TokoLink" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(descTrim)}" />
<meta property="og:image" content="${esc(img)}" />
<meta property="og:url" content="${esc(dest)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(descTrim)}" />
<meta name="twitter:image" content="${esc(img)}" />
<style>body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;display:grid;place-items:center;min-height:100vh;background:#0b1f3a;color:#fff}p{opacity:.85}a{color:#8ec5ff}</style>
</head>
<body>
<div style="text-align:center;padding:24px">
<p>Mengalihkan ke <b>${esc(name)}</b>…</p>
<p><a href="${esc(dest)}">Buka toko</a></p>
</div>
<script>location.replace(${JSON.stringify(dest)});</script>
</body>
</html>`;

  res.status(200);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  res.send(html);
}
