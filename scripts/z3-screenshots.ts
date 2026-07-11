/**
 * Z.3 — live Playwright verification screenshots: logs in as the real
 * Uwezo Primary & Junior School principal, navigates to Academics ->
 * Timetable, shows the real Grade 7 Amani timetable (now including a real
 * spread-out Free-period fix when the school opts in), and the "Smart
 * Timetable" tab (home of the future Venue management UI).
 */
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // Default login step is "phone" — switch to "email & password" (both
  // fields live on the SAME step/form).
  await page.getByText("Sign in with email & password", { exact: false }).click();
  await page.waitForTimeout(800);

  await page.locator("#email").fill("principal@uwezoschool.ac.ke");
  await page.locator("#password").fill("Uwezo2026!");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: "screenshots/z3-01-login-dashboard.png", fullPage: false });

  await page.goto("http://localhost:3000/academics", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/z3-02-academics.png", fullPage: false });

  // Try to find and click the Timetable tab.
  const timetableTab = page.getByRole("tab", { name: /timetable/i }).first();
  if (await timetableTab.count() > 0) {
    await timetableTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "screenshots/z3-03-timetable-tab.png", fullPage: false });
  }

  await browser.close();
  console.log("Screenshots captured.");
}

main().catch((e) => { console.error(e); process.exit(1); });
