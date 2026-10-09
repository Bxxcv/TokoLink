/**
 * T1–T5: serangan authorization sebagai seller biasa (akun A).
 * Meledak = FAIL. Ditolak + data tidak berubah = PASS.
 */
import { expect, test } from "@playwright/test";
import { hasEnv, loginAs, needEnv, testDb } from "./helpers";

test.beforeEach(() => {
  test.skip(!hasEnv, "TEST_SUPABASE_URL/ANON_KEY belum diset — SKIP, bukan FAIL.");
});

test("T1 seller tidak bisa jadi admin", async () => {
  const { db, userId } = await loginAs(
    needEnv("TEST_SELLER_A_EMAIL"),
    needEnv("TEST_SELLER_A_PASSWORD"),
  );
  const { error } = await db
    .from("profiles")
    .update({ role: "admin", plan: "premium", status: "aktif" })
    .eq("id", userId);
  expect(error, "update role harus ditolak").toBeTruthy();
  const { data } = await db.from("profiles").select("role,plan").eq("id", userId).single();
  expect(data).toMatchObject({ role: "seller" });
});

test("T2 seller tidak bisa cetak saldo", async () => {
  const { db, userId } = await loginAs(
    needEnv("TEST_SELLER_A_EMAIL"),
    needEnv("TEST_SELLER_A_PASSWORD"),
  );
  const before = await db.from("ledger").select("amount").eq("seller_id", userId);
  const beforeSum = ((before.data ?? []) as { amount: number | string }[]).reduce(
    (s, r) => s + Number(r.amount),
    0,
  );
  const { error } = await db.from("ledger").insert({
    seller_id: userId,
    label: "Serangan test",
    amount: 100000000,
    type: "masuk",
  });
  expect(error, "insert ledger harus ditolak").toBeTruthy();
  const after = await db.from("ledger").select("amount").eq("seller_id", userId);
  const afterSum = ((after.data ?? []) as { amount: number | string }[]).reduce(
    (s, r) => s + Number(r.amount),
    0,
  );
  expect(afterSum, "saldo tidak boleh berubah").toBe(beforeSum);
});

test("T3 withdrawal di atas saldo ditolak + tak bisa setujui sendiri", async () => {
  const { db } = await loginAs(
    needEnv("TEST_SELLER_A_EMAIL"),
    needEnv("TEST_SELLER_A_PASSWORD"),
  );
  const over = await db.rpc("request_withdrawal", {
    p_bank: "BCA",
    p_account_number: "1234567890",
    p_amount: 999999999,
  });
  expect(over.error, "withdrawal raksasa harus ditolak").toBeTruthy();
  const mine = await db
    .from("withdrawals")
    .select("id,status")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (mine.data) {
    const upd = await db
      .from("withdrawals")
      .update({ status: "selesai" })
      .eq("id", (mine.data as { id: string }).id);
    expect(upd.error, "seller tak boleh ubah status").toBeTruthy();
  }
});

test("T4 anon tak bisa baca PII, view publik boleh", async () => {
  const anon = testDb();
  const full = await anon.from("profiles").select("*").limit(1);
  expect(
    full.error || (full.data ?? []).length === 0,
    "anon tidak boleh dapat baris profiles",
  ).toBeTruthy();
  const pub = await anon.from("public_stores").select("*").limit(1);
  expect(pub.error, "view publik harus bisa dibaca").toBeNull();
  if ((pub.data ?? []).length > 0) {
    expect(pub.data![0]).not.toHaveProperty("wa_number");
    expect(pub.data![0]).not.toHaveProperty("owner_name");
  }
});

test("T5 seller tak bisa palsukan payment/order", async () => {
  const { db } = await loginAs(
    needEnv("TEST_SELLER_A_EMAIL"),
    needEnv("TEST_SELLER_A_PASSWORD"),
  );
  const pays = await db.from("payments").select("id").limit(1);
  if ((pays.data ?? []).length > 0) {
    const upd = await db
      .from("payments")
      .update({ status: "berhasil" })
      .eq("id", (pays.data as { id: string }[])[0].id);
    expect(upd.error, "update payments harus ditolak").toBeTruthy();
  }
  const ords = await db.from("orders").select("id,total").limit(1);
  if ((ords.data ?? []).length > 0) {
    const row = (ords.data as { id: string; total: number }[])[0];
    const upd = await db.from("orders").update({ total: 1 }).eq("id", row.id);
    expect(upd.error, "update total harus ditolak").toBeTruthy();
    const again = await db.from("orders").select("total").eq("id", row.id).single();
    expect(Number((again.data as { total: number }).total)).toBe(Number(row.total));
  }
});
