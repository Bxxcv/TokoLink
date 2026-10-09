/**
 * T9–T10: race condition dengan request bersamaan (data dummy, terbatas).
 * T9 butuh saldo+withdraw valid milik seller A. T10 butuh endpoint
 * /api/create-order di APP_URL + kredensial BuatQris SANDBOX di server.
 */
import { expect, test } from "@playwright/test";
import { hasEnv, loginAs, needEnv } from "./helpers";

test.beforeEach(() => {
  test.skip(!hasEnv, "ENV test belum diset — SKIP, bukan FAIL.");
});

test("T9 N withdrawal bersamaan tak bisa gandakan saldo", async () => {
  const { db, userId } = await loginAs(
    needEnv("TEST_SELLER_A_EMAIL"),
    needEnv("TEST_SELLER_A_PASSWORD"),
  );
  const bal = await db.from("ledger").select("amount").eq("seller_id", userId);
  const balance = ((bal.data ?? []) as { amount: number | string }[]).reduce(
    (s, r) => s + Number(r.amount),
    0,
  );
  test.skip(balance < 100000, `Saldo test kurang (${balance}) — isi dulu via order sukses.`);
  const amt = Math.floor(balance / 2);
  const calls = Array.from({ length: 5 }, () =>
    db.rpc("request_withdrawal", {
      p_bank: "BCA",
      p_account_number: "1234567890",
      p_amount: amt,
    }),
  );
  const results = await Promise.all(calls);
  const okCount = results.filter((r) => !r.error).length;
  // Total yang lolos tak boleh melebihi saldo (2× setengah = habis pas).
  expect(okCount).toBeLessThanOrEqual(2);
  const pend = await db
    .from("withdrawals")
    .select("amount")
    .eq("seller_id", userId)
    .in("status", ["menunggu", "diproses"]);
  const pendSum = ((pend.data ?? []) as { amount: number | string }[]).reduce(
    (s, r) => s + Number(r.amount),
    0,
  );
  expect(pendSum).toBeLessThanOrEqual(balance);
});

test("T10 klik ganda checkout = 1 order (idempotensi)", async ({ request }) => {
  test.skip(
    !process.env.TEST_BUATQRIS_SANDBOX,
    "TEST_BUATQRIS_SANDBOX belum diset — SKIP.",
  );
  const baseURL = process.env.APP_URL ?? "http://localhost:5173";
  const key = `race-${Date.now()}`;
  const payload = {
    seller_id: needEnv("TEST_SELLER_ID"),
    buyer_name: "Race Tester",
    cart: [{ product_id: needEnv("TEST_PRODUCT_ID"), qty: 1 }],
    idempotency_key: key,
  };
  const [r1, r2] = await Promise.all([
    request.post(`${baseURL}/api/create-order`, { data: payload }),
    request.post(`${baseURL}/api/create-order`, { data: payload }),
  ]);
  const j1 = await r1.json();
  const j2 = await r2.json();
  expect(j1.order_id, "order pertama jadi").toBeTruthy();
  expect(j2.order_id, "order kedua = order yang sama").toBe(j1.order_id);
});
