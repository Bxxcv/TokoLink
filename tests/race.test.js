/**
 * T9–T10: race condition (data dummy, request terbatas).
 * T9 butuh saldo test milik seller A. T10 butuh APP_URL + BuatQris SANDBOX.
 */
const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const { hasEnv, loginAs, needEnv, sum } = require("./helpers");

let ctx = null;
before(async () => {
  if (!hasEnv()) return;
  ctx = await loginAs(needEnv("TEST_SELLER_A_EMAIL"), needEnv("TEST_SELLER_A_PASSWORD"));
});

describe("race", () => {
  it("T9 N withdrawal bersamaan tak gandakan saldo", async (t) => {
    if (!ctx) return t.skip("ENV test belum diset");
    const { db, userId } = ctx;
    const balance = sum(
      ((await db.from("ledger").select("amount").eq("seller_id", userId)).data ?? []),
    );
    if (balance < 100000) return t.skip(`Saldo test kurang (${balance})`);
    const amt = Math.floor(balance / 2);
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        db.rpc("request_withdrawal", { p_bank: "BCA", p_account_number: "1234567890", p_amount: amt }),
      ),
    );
    const okCount = results.filter((r) => !r.error).length;
    assert.ok(okCount <= 2, `lolos ${okCount}, maks 2`);
    const pend = sum(
      (
        (await db.from("withdrawals").select("amount").eq("seller_id", userId).in("status", ["menunggu", "diproses"])).data ?? []
      ),
    );
    assert.ok(pend <= balance, "total antrean tak boleh melebihi saldo");
  });

  it("T10 checkout ganda = 1 order", async (t) => {
    if (!process.env.TEST_BUATQRIS_SANDBOX) return t.skip("TEST_BUATQRIS_SANDBOX belum diset");
    const baseURL = process.env.APP_URL ?? "http://localhost:5173";
    const key = `race-${Date.now()}`;
    const payload = {
      seller_id: needEnv("TEST_SELLER_ID"),
      buyer_name: "Race Tester",
      cart: [{ product_id: needEnv("TEST_PRODUCT_ID"), qty: 1 }],
      idempotency_key: key,
    };
    const [r1, r2] = await Promise.all([
      fetch(`${baseURL}/api/create-order`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json()),
      fetch(`${baseURL}/api/create-order`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json()),
    ]);
    assert.ok(r1.order_id, "order pertama jadi");
    assert.equal(r2.order_id, r1.order_id, "order kedua = order yang sama");
  });
});
