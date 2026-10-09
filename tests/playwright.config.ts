import { defineConfig } from "@playwright/test";

const APP_URL = process.env.APP_URL ?? "http://localhost:5173";

if (!process.env.TEST_SUPABASE_URL || !process.env.TEST_SUPABASE_ANON_KEY) {
  console.warn(
    "[tests] TEST_SUPABASE_URL / TEST_SUPABASE_ANON_KEY belum diset — " +
      "test API akan SKIP. Lihat tests/README.md.",
  );
}

export default defineConfig({
  testDir: __dirname,
  timeout: 60_000,
  use: { baseURL: APP_URL },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
