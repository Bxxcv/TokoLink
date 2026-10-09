/**
 * T1–T5: serangan authorization sebagai seller biasa (akun A).
 * Ditolak + data tak berubah = PASS. Tanpa ENV → SKIP (bukan FAIL).
 */
const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const { hasEnv, loginAs, needEnv, sum, testDb } = require("./helpers");

let ctx = null;
before(async () => {
  if (!hasEnv()) return;
  ctx = await loginAs(needEnv("TEST_SELLER_A_EMAIL"), needEnv("TEST_SELLER_A_PASSWORD"));
});

describe("RLS attacks (akun seller A)", () => {
  it("T1 seller tidak bisa jadi admin", async (t) => {
    if (!ctx) return t.skip("ENV test belum diset");
    const { db, userId } = ctx;
    const { error } = await db
      .from("profiles")
      .update({ role: "admin", plan: "premium", status: "aktif" })
      .eq("id", userId);
    assert.ok(error, "update role harus ditolak");
    const { data } = await db.from("profiles").select("role,plan").eq("id", userId).single();
    assert.equal(data.role, "seller");
  });

  it("T2 seller tidak bisa cetak saldo", async (t) => {
    if (!ctx) return t.skip("ENV test belum diset");
    const { db, userId } = ctx;
    const before = sum(((await db.from("ledger").select("amount").eq("seller_id", userId)).data ?? []));
    const { error } = await db.from("ledger").insert({
      seller_id: userId,
      label: "Serangan test",
      amount: 100000000,
      type: "masuk",
    });
    assert.ok(error, "insert ledger harus ditolak");
    const after = sum(((await db.from("ledger").select("amount").eq("seller_id", userId)).data ?? []));
    assert.equal(after, before, "saldo tidak boleh berubah");
  });

  it("T3 withdrawal raksasa + setujui sendiri ditolak", async (t) => {
    if (!ctx) return t.skip("ENV test belum diset");
    const { db } = ctx;
    const over = await db.rpc("request_withdrawal", {
      p_bank: "BCA",
      p_account_number: "1234567890",
      p_amount: 999999999,
    });
    assert.ok(over.error, "withdrawal raksasa harus ditolak");
    const mine = await db
      .from("withdrawals")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (mine.data) {
      const upd = await db.from("withdrawals").update({ status: "selesai" }).eq("id", mine.data.id);
      assert.ok(upd.error, "seller tak boleh ubah status");
    }
  });

  it("T4 anon tak bisa baca PII, view publik boleh", async (t) => {
    if (!hasEnv()) return t.skip("ENV test belum diset");
    const anon = testDb();
    const full = await anon.from("profiles").select("*").limit(1);
    assert.ok(full.error || (full.data ?? []).length === 0, "anon tidak boleh dapat baris profiles");
    const pub = await anon.from("public_stores").select("*").limit(1);
    assert.equal(pub.error, null, "view publik harus bisa dibaca");
    if ((pub.data ?? []).length > 0) {
      assert.ok(!("wa_number" in pub.data[0]), "tanpa wa_number");
      assert.ok(!("owner_name" in pub.data[0]), "tanpa owner_name");
    }
  });

  it("T5 seller tak bisa palsukan payment/order", async (t) => {
    if (!ctx) return t.skip("ENV test belum diset");
    const { db } = ctx;
    const pays = await db.from("payments").select("id").limit(1);
    if ((pays.data ?? []).length > 0) {
      const upd = await db.from("payments").update({ status: "berhasil" }).eq("id", pays.data[0].id);
      assert.ok(upd.error, "update payments harus ditolak");
    }
    const ords = await db.from("orders").select("id,total").limit(1);
    if ((ords.data ?? []).length > 0) {
      const row = ords.data[0];
      const upd = await db.from("orders").update({ total: 1 }).eq("id", row.id);
      assert.ok(upd.error, "update total harus ditolak");
      const again = await db.from("orders").select("total").eq("id", row.id).single();
      assert.equal(Number(again.data.total), Number(row.total));
    }
  });
});
