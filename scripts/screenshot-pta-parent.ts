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
    data: { email: "parent@karibuhigh.ac.ke", password: "Karibu2026!" },
  });
  console.log("parent login:", resp.status());

  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(`${BASE}/portal`, { waitUntil: "domcontentloaded" }).catch(() => {});
    await page.waitForTimeout(2500);
    if (page.url().includes("/login") || page.url().includes("/offline")) {
      console.log("bounced, retrying...");
      continue;
    }
    break;
  }

  // Dismiss the cookie/install banners that intercept pointer events.
  await page.addStyleTag({ content: ".no-print.fixed.inset-x-0.bottom-0 { display: none !important; }" }).catch(() => {});
  await page.waitForTimeout(500);

  const firstChildCard = page.locator("button").first();
  if (await firstChildCard.count()) {
    await firstChildCard.click({ force: true }).catch((e) => console.log("click failed:", e.message.slice(0, 100)));
    await page.waitForTimeout(3000);
  }

  const ptaHeading = page.locator("text=Book an academic consultation");
  try {
    await ptaHeading.first().scrollIntoViewIfNeeded({ timeout: 10000 });
    await page.waitForTimeout(1500);
  } catch {
    console.log("PTA heading not found, scrolling to bottom instead");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: "screenshots/orphaned-features-audit/6b-pta-booking-parent.png", fullPage: true });
  console.log("captured 6b-pta-booking-parent");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
