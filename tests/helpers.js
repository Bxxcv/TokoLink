/**
 * Helper test API TokoLink — Node murni, TANPA browser.
 * ENV: TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY,
 * TEST_SELLER_A_EMAIL/PASSWORD, TEST_SELLER_ID, TEST_PRODUCT_ID.
 */
const { createClient } = require("@supabase/supabase-js");

function hasEnv() {
  return !!process.env.TEST_SUPABASE_URL && !!process.env.TEST_SUPABASE_ANON_KEY;
}

function testDb() {
  return createClient(process.env.TEST_SUPABASE_URL, process.env.TEST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

async function loginAs(email, password) {
  const db = testDb();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error("Login gagal: " + email);
  const authed = testDb();
  await authed.auth.setSession(data.session);
  return { db: authed, userId: data.user.id };
}

function needEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`ENV ${name} belum diset (lihat tests/README.md)`);
  return v;
}

function sum(rows) {
  return rows.reduce((s, r) => s + Number(r.amount), 0);
}

module.exports = { hasEnv, testDb, loginAs, needEnv, sum };
