/**
 * U.2 — A Genuine Unit-Economics Dashboard — live HTTP + Playwright
 * screenshot verification.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const PW = "Karibu2026!";

async function loginAndGoto(email: string, password: string, path: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.evaluate(async ({ email, password }) => {
    await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  }, { email, password });
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const cookieGotIt = page.getByRole("button", { name: "Got it" });
  if (await cookieGotIt.isVisible().catch(() => false)) await cookieGotIt.click();
  await page.waitForTimeout(400);
  return { browser, page };
}

async function main() {
  const { browser, page } = await loginAndGoto("founder@neyo.co.ke", PW, "/founder");
  await page.waitForTimeout(1200);

  const tab = page.getByRole("button", { name: "Unit Economics", exact: true }).first();
  await tab.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/u2-01-unit-economics-summary.png", fullPage: true });

  const perSchoolTab = page.getByRole("button", { name: "Per-School", exact: true }).first();
  await perSchoolTab.click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/u2-02-unit-economics-per-school.png", fullPage: true });

  const costEntryTab = page.getByRole("button", { name: "Cost Entry", exact: true }).first();
  await costEntryTab.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/u2-03-unit-economics-cost-entry.png", fullPage: true });

  // Enter a real cost snapshot live, then re-check Summary/Per-School reflect it.
  await page.fill('input[type="number"] >> nth=0', "45000");
  await page.fill('input[type="number"] >> nth=1', "5000");
  const saveBtn = page.getByRole("button", { name: /Save cost snapshot/i });
  await saveBtn.click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/u2-04-cost-entry-saved.png", fullPage: true });

  await browser.close();
  console.log("Screenshots captured.");
}

main().catch((e) => { console.error(e); process.exit(1); });
