/**
 * T6–T8: login UI + otorisasi rute + alur buyer read-only.
 * Butuh APP_URL (default http://localhost:5173) + akun test.
 */
import { expect, test, type Page } from "@playwright/test";
import { hasEnv, needEnv } from "./helpers";

test.beforeEach(() => {
  test.skip(!hasEnv, "ENV test belum diset — SKIP, bukan FAIL.");
});

async function loginAsSeller(page: Page) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(needEnv("TEST_SELLER_A_EMAIL"));
  await page.locator('input[type="password"]').fill(needEnv("TEST_SELLER_A_PASSWORD"));
  await page.getByRole("button", { name: /masuk/i }).click();
  await expect.poll(() => page.url(), { timeout: 15000 }).toContain("/app");
}

test("T6 login seller masuk /app", async ({ page }) => {
  await loginAsSeller(page);
});

test("T7 seller tak bisa buka /admin (ditolak ke /app)", async ({ page }) => {
  await loginAsSeller(page);
  await page.goto("/#/admin");
  await page.waitForTimeout(1500);
  expect(page.url()).not.toContain("/admin");
});

test("T8 halaman lacak tanpa token = tidak ditemukan (jujur)", async ({ page }) => {
  await page.goto("/#/order/TL-0000-XXXX?token=00000000-0000-0000-0000-000000000000");
  await expect(page.getByText(/tidak ditemukan/i).first()).toBeVisible({ timeout: 15000 });
});
