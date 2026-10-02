// GET /api/admin-users — Task Fase 6 (hanya role=admin).
// Menggabungkan profiles + email & last_sign_in dari auth.users
// (tidak bisa dibaca client karena RLS auth schema).
// Auth: header "Authorization: Bearer <access_token user yang login>".

import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method tidak didukung." });

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !key) return res.status(500).json({ error: "Server belum dikonfigurasi." });

  const token = ((req.headers.authorization as string | undefined) ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Belum login." });

  const gate = createClient(url, anon, { auth: { persistSession: false } });
  const { data: me } = await gate.auth.getUser(token);
  if (!me.user) return res.status(401).json({ error: "Sesi tidak valid." });

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: prof } = await db.from("profiles").select("role").eq("id", me.user.id).single();
  if ((prof as { role: string } | null)?.role !== "admin") {
    return res.status(403).json({ error: "Khusus admin." });
  }

  // Gerbang pemilik: kalau OWNER_EMAILS diset, hanya email itu yang boleh
  // membaca daftar pengguna (panel admin khusus pemilik). Kosong = semua admin.
  const owners = (process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  if (owners.length && !owners.includes((me.user.email ?? "").toLowerCase())) {
    return res.status(403).json({ error: "Panel ini khusus pemilik platform." });
  }

  const { data: usersData, error } = await db.auth.admin.listUsers();
  if (error) return res.status(500).json({ error: "Gagal memuat pengguna." });
  const { data: profiles } = await db.from("profiles").select("*").order("created_at", { ascending: false });
  const byId = new Map(((profiles ?? []) as Record<string, unknown>[]).map((p) => [(p as { id: string }).id, p]));

  return res.status(200).json({
    users: (usersData.users ?? []).map((u) => {
      const p = (byId.get(u.id) ?? {}) as {
        role?: string; store_name?: string | null; owner_name?: string | null;
        city?: string | null; plan?: string; status?: string;
      };
      return {
        id: u.id,
        email: u.email ?? "—",
        last_sign_in: u.last_sign_in_at,
        role: p.role ?? "seller",
        store_name: p.store_name ?? "—",
        owner_name: p.owner_name ?? "—",
        city: p.city ?? "—",
        plan: p.plan ?? "gratis",
        status: p.status ?? "aktif",
      };
    }),
  });
}
