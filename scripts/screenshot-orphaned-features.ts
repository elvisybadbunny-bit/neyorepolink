/**
 * Captures real, live screenshots of all 9 previously-orphaned features
 * (built this session) to visually verify they are genuinely wired,
 * rendering, and full-stack -- not just present in source code.
 */
import { chromium, type Page } from "playwright";

const BASE = "http://localhost:3000";

async function loginAs(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const resp = await page.request.post(`${BASE}/api/auth/password/login`, { data: { email, password } });
  const body = await resp.json();
  console.log(`login ${email}:`, resp.status(), JSON.stringify(body).slice(0, 120));
  if (!body.ok) throw new Error(`login failed for ${email}`);
}

async function captureTab(page: Page, url: string, tabText: string | null, outName: string) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 20000 }).catch((e) => console.log("  goto err", (e as Error).message.slice(0, 80)));
    await page.waitForTimeout(3000);
    if (page.url().includes("/login") || page.url().includes("/offline")) {
      console.log(`  [${outName}] landed on ${page.url()}, retrying...`);
      await page.waitForTimeout(2000);
      continue;
    }
    if (tabText) {
      const btn = page.locator("button", { hasText: tabText });
      try {
        await btn.first().waitFor({ state: "visible", timeout: 10000 });
        await btn.first().click();
        await page.waitForTimeout(2200);
      } catch {
        console.log(`  [${outName}] tab "${tabText}" not visible, retrying whole page...`);
        await page.waitForTimeout(2000);
        continue;
      }
    } else {
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: `screenshots/orphaned-features-audit/${outName}.png`, fullPage: true });
    console.log(`captured ${outName} (attempt ${attempt + 1})`);
    return;
  }
  console.log(`  [${outName}] FAILED after all retries`);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  await loginAs(page, "founder@karibuhigh.ac.ke", "Karibu2026!");

  await captureTab(page, "/cafeteria", "Pocket Wallet", "1-pocket-wallet");
  await captureTab(page, "/clinic", "Dosage Roll-Call", "2-dosage-rollcall");
  await captureTab(page, "/finance/activities", "Tournament Trips", "3-tournament-trips");
  await captureTab(page, "/finance", "Bank Clearing", "4-treasury-checks");
  await captureTab(page, "/hostel", "Exeat Passes", "5-exeat-passes");
  await captureTab(page, "/teacher", "PTA Booking", "6a-pta-booking-teacher");
  await captureTab(page, "/reception", null, "7-lost-and-found");
  await captureTab(page, "/settings/bom-vault", null, "8-bom-vault");
  await captureTab(page, "/academics", "Record of Work", "9-record-of-work");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
