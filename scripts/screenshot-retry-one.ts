import { chromium } from "playwright";

const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const resp = await page.request.post(`${BASE}/api/auth/password/login`, {
    data: { email: "founder@karibuhigh.ac.ke", password: "Karibu2026!" },
  });
  console.log("login:", resp.status());

  await page.goto(`${BASE}/finance/activities`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const btn = page.locator("button", { hasText: "Tournament Trips" });
  await btn.first().waitFor({ state: "visible", timeout: 15000 });
  await btn.first().click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/orphaned-features-audit/3-tournament-trips.png", fullPage: true });
  console.log("captured 3-tournament-trips (retry)");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
