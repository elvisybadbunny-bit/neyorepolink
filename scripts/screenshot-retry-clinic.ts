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

  for (let attempt = 0; attempt < 4; attempt++) {
    await page.goto(`${BASE}/clinic`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    const retryBtn = page.locator("text=Retry");
    if (await retryBtn.count()) {
      console.log(`attempt ${attempt}: load failed, clicking retry / reloading`);
      await page.waitForTimeout(2000);
      continue;
    }
    break;
  }

  const btn = page.locator("button", { hasText: "Dosage Roll-Call" });
  await btn.first().waitFor({ state: "visible", timeout: 15000 });
  await btn.first().click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "screenshots/orphaned-features-audit/2-dosage-rollcall.png", fullPage: true });
  console.log("captured 2-dosage-rollcall (retry)");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
