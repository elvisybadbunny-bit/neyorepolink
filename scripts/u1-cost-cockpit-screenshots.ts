/**
 * U.1 — NEYO Ops Cost Cockpit + school-facing SMS Spend Alert — live HTTP
 * + Playwright screenshot verification.
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
  // 1) Founder Ops -> Unit Economics -> Cost Cockpit sub-tab.
  {
    const { browser, page } = await loginAndGoto("founder@neyo.co.ke", PW, "/founder");
    await page.waitForTimeout(1200);
    const tab = page.getByRole("button", { name: "Unit Economics", exact: true }).first();
    await tab.click();
    await page.waitForTimeout(1000);
    const cockpitTab = page.getByRole("button", { name: "Cost Cockpit", exact: true }).first();
    await cockpitTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "screenshots/u1-01-cost-cockpit.png", fullPage: true });

    const trendsTab = page.getByRole("button", { name: "Trends", exact: true }).first();
    await trendsTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/u1-02-cost-trends.png", fullPage: true });

    await browser.close();
  }

  // 2) School-side: Finance -> Cash & reminders -> SMS Spend Alert card.
  {
    const { browser, page } = await loginAndGoto("principal@karibuhigh.ac.ke", PW, "/finance");
    await page.waitForTimeout(1500);
    const cashTab = page.getByRole("button", { name: /Cash & reminders/i }).first();
    if (await cashTab.isVisible().catch(() => false)) {
      await cashTab.click();
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: "screenshots/u1-03-sms-spend-alert-card.png", fullPage: true });
    await browser.close();
  }

  console.log("Screenshots captured.");
}

main().catch((e) => { console.error(e); process.exit(1); });
