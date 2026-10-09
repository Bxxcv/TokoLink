/**
 * Helper: client Supabase TEST sebagai seller yang login.
 * Butuh env: TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY,
 * TEST_SELLER_A_EMAIL/PASSWORD, TEST_SELLER_B_EMAIL/PASSWORD,
 * TEST_ADMIN_EMAIL/PASSWORD.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const hasEnv =
  !!process.env.TEST_SUPABASE_URL && !!process.env.TEST_SUPABASE_ANON_KEY;

export function testDb(): SupabaseClient {
  return createClient(
    process.env.TEST_SUPABASE_URL as string,
    process.env.TEST_SUPABASE_ANON_KEY as string,
    { auth: { persistSession: false } },
  );
}

export async function loginAs(email: string, password: string) {
  const db = testDb();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error("Login gagal: " + email);
  const authed = testDb();
  await authed.auth.setSession(data.session);
  return { db: authed, userId: data.user.id };
}

export function needEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`ENV ${name} belum diset (lihat tests/README.md)`);
  return v;
}
