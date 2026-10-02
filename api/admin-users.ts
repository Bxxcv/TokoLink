// GET /api/admin-users — daftar pengguna (hanya role=admin).
// POST /api/admin-users — buat link reset password untuk user (body: { user_id }).
// Menggabungkan profiles + email & last_sign_in dari auth.users
// (tidak bisa dibaca client karena RLS auth schema).
// Auth: header "Authorization: Bearer <access_token user yang login>".

import { createClient } from "@supabase/supabase-js";

async function requireAdmin(req: any, url: string, anon: string, key: string) {
  const token = ((req.headers.authorization as string | undefined) ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const gate = createClient(url, anon, { auth: { persistSession: false } });
  const { data: me } = await gate.auth.getUser(token);
  if (!me.user) return null;
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: prof } = await db.from("profiles").select("role").eq("id", me.user.id).single();
  if ((prof as { role: string } | null)?.role !== "admin") return null;
  return db;
}

export default async function handler(req: any, res: any) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !key) return res.status(500).json({ error: "Server belum dikonfigurasi." });

  const db = await requireAdmin(req, url, anon, key);
  if (!db) return res.status(403).json({ error: "Khusus admin." });

  // Buat link reset password (kirim manual ke user via WA/email).
  if (req.method === "POST") {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as { user_id?: string };
    if (!body?.user_id) return res.status(400).json({ error: "user_id wajib diisi." });
    const { data: target, error: terr } = await db.auth.admin.getUserById(body.user_id);
    if (terr || !target.user?.email) return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    const { data: link, error: lerr } = await db.auth.admin.generateLink({
      type: "recovery",
      email: target.user.email,
    });
    if (lerr || !link.properties?.action_link) return res.status(500).json({ error: "Gagal membuat link reset." });
    return res.status(200).json({ reset_link: link.properties.action_link });
  }

  if (req.method !== "GET") return res.status(405).json({ error: "Method tidak didukung." });

  const { data: usersData, error } = await db.auth.admin.listUsers();
  if (error) return res.status(500).json({ error: "Gagal memuat pengguna." });
  const { data: profiles } = await db.from("profiles").select("*").order("created_at", { ascending: false });
  const byId = new Map(((profiles ?? []) as Record<string, unknown>[]).map((p) => [(p as { id: string }).id, p]));

  return res.status(200).json({
    users: (usersData.users ?? []).map((u) => {
      const p = (byId.get(u.id) ?? {}) as {
        role?: string; store_name?: string | null; owner_name?: string | null;
        city?: string | null; plan?: string; status?: string; wa_number?: string | null;
        created_at?: string | null;
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
        phone: p.wa_number ?? "—",
        created_at: (p.created_at ?? u.created_at) ?? null,
      };
    }),
  });
}
