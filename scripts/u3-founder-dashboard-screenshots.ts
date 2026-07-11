/**
 * U.3 — Founder Morning Dashboard + Ask Bundi + Product Analytics +
 * Compliance — live HTTP + Playwright screenshot verification.
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
  // 1) Founder Ops -> Founder Dashboard tab -> Morning Dashboard sub-tab.
  {
    const { browser, page } = await loginAndGoto("founder@neyo.co.ke", PW, "/founder");
    await page.waitForTimeout(1200);
    const tab = page.getByRole("button", { name: /^Founder Dashboard$/i }).first();
    await tab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "screenshots/u3-01-morning-dashboard.png", fullPage: true });

    // 2) Ask Bundi sub-tab.
    const askTab = page.getByRole("button", { name: /^Ask Bundi$/i }).first();
    await askTab.click();
    await page.waitForTimeout(800);
    await page.fill('input[placeholder*="revenue drop"]', "Why did revenue drop this month?");
    const askBtn = page.getByRole("button", { name: /^Ask$/i });
    await askBtn.click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "screenshots/u3-02-ask-bundi.png", fullPage: true });

    // 3) Product Analytics sub-tab.
    const analyticsTab = page.getByRole("button", { name: /^Product Analytics$/i }).first();
    await analyticsTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/u3-03-product-analytics.png", fullPage: true });

    // 4) Compliance sub-tab.
    const complianceTab = page.getByRole("button", { name: /^Compliance$/i }).first();
    await complianceTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/u3-04-compliance.png", fullPage: true });

    await browser.close();
  }

  // 5) School-side: Settings > Data — the new deletion-request card.
  {
    const { browser, page } = await loginAndGoto("principal@karibuhigh.ac.ke", PW, "/settings/data");
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "screenshots/u3-05-settings-data-deletion-request.png", fullPage: true });
    await browser.close();
  }

  console.log("Screenshots captured.");
}

main().catch((e) => { console.error(e); process.exit(1); });
