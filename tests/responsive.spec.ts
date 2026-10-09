/**
 * T11: responsive — tidak ada horizontal overflow yang tak disengaja,
 * di 360 / 375 / 390 / 768 / 1440. Screenshot disimpan ke test-results/.
 */
import { expect, test } from "@playwright/test";

const WIDTHS = [360, 375, 390, 768, 1440];
const PAGES = ["/", "/login", "/cart"];

for (const w of WIDTHS) {
  for (const path of PAGES) {
    test(`T11 ${path} @${w}px tak overflow`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto(path);
      await page.waitForTimeout(2000);
      const overflow = await page.evaluate(() => {
        const se = document.scrollingElement;
        return se ? se.scrollWidth - window.innerWidth : 0;
      });
      await page.screenshot({
        path: `test-results/shot-${path.replace(/\//g, "_")}-${w}.png`,
      });
      expect(overflow, `overflow ${overflow}px di ${path} @${w}`).toBeLessThanOrEqual(1);
    });
  }
}
