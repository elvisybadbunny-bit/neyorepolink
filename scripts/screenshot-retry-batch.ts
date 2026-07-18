import { chromium, type Page } from "playwright";

const BASE = "http://localhost:3000";

async function loginAs(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const resp = await page.request.post(`${BASE}/api/auth/password/login`, { data: { email, password } });
  console.log(`login ${email}:`, resp.status());
}

async function captureTab(page: Page, url: string, tabText: string, outName: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 20000 }).catch((e) => console.log("goto err", e.message.slice(0, 80)));
    await page.waitForTimeout(3000);
    // Bail out to retry if we got bounced to an unexpected page.
    if (page.url().includes("/login") || page.url().includes("/offline")) {
      console.log(`  [${outName}] landed on ${page.url()}, retrying...`);
      await page.waitForTimeout(2000);
      continue;
    }
    const btn = page.locator("button", { hasText: tabText });
    try {
      await btn.first().waitFor({ state: "visible", timeout: 10000 });
      await btn.first().click();
      await page.waitForTimeout(2200);
      await page.screenshot({ path: `screenshots/orphaned-features-audit/${outName}.png`, fullPage: true });
      console.log(`captured ${outName} (attempt ${attempt + 1})`);
      return;
    } catch {
      console.log(`  [${outName}] tab "${tabText}" not visible, retrying...`);
      await page.waitForTimeout(2000);
    }
  }
  console.log(`  [${outName}] FAILED after all retries`);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  await loginAs(page, "founder@karibuhigh.ac.ke", "Karibu2026!");

  await captureTab(page, "/finance", "Bank Clearing", "4-treasury-checks");
  await captureTab(page, "/hostel", "Exeat Passes", "5-exeat-passes");
  await captureTab(page, "/academics", "Record of Work", "9-record-of-work");

  // Teacher portal PTA booking -- separate handling since teacher login differs
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(`${BASE}/teacher`, { waitUntil: "domcontentloaded", timeout: 20000 }).catch((e) => console.log("goto err", e.message.slice(0, 80)));
    await page.waitForTimeout(3000);
    if (page.url().includes("/login") || page.url().includes("/offline")) {
      console.log(`  [6a] landed on ${page.url()}, retrying...`);
      await page.waitForTimeout(2000);
      continue;
    }
    const btn = page.locator("button", { hasText: "PTA Booking" });
    try {
      await btn.first().waitFor({ state: "visible", timeout: 10000 });
      await btn.first().click();
      await page.waitForTimeout(2200);
      await page.screenshot({ path: "screenshots/orphaned-features-audit/6a-pta-booking-teacher.png", fullPage: true });
      console.log(`captured 6a-pta-booking-teacher (attempt ${attempt + 1})`);
      break;
    } catch {
      console.log(`  [6a] tab not visible, retrying...`);
      await page.waitForTimeout(2000);
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
