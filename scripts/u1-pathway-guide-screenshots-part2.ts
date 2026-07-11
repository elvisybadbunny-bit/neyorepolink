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

async function clickFirstOption(page: import("playwright").Page) {
  const optionButtons = page.locator("main button").filter({ hasNotText: /^(Back|Next|See my results|Start the questionnaire|Retry|Pay with M-Pesa)$/ });
  const count = await optionButtons.count();
  for (let i = 0; i < count; i++) {
    const btn = optionButtons.nth(i);
    if (await btn.isVisible().catch(() => false) && await btn.isEnabled().catch(() => false)) {
      await btn.click({ timeout: 3000 }).catch(() => {});
      return true;
    }
  }
  return false;
}

async function dismissCookieBanner(page: import("playwright").Page) {
  const gotIt = page.getByRole("button", { name: "Got it" });
  if (await gotIt.isVisible().catch(() => false)) await gotIt.click().catch(() => {});
}

async function runQuizToResults(page: import("playwright").Page) {
  for (let i = 0; i < 10; i++) {
    await dismissCookieBanner(page);
    await clickFirstOption(page);
    await page.waitForTimeout(600);
    await dismissCookieBanner(page);
    const finishBtn = page.getByRole("button", { name: "See my results" });
    if (await finishBtn.isVisible().catch(() => false)) {
      await finishBtn.click();
      await page.waitForTimeout(1500);
      break;
    }
    const nextBtn = page.getByRole("button", { name: "Next", exact: true });
    if (await nextBtn.isVisible().catch(() => false) && await nextBtn.isEnabled().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(500);
    }
  }
  await page.waitForTimeout(2000);
}

async function main() {
  // In-app quiz -> full free results
  {
    const { browser, page } = await loginAndGoto("parent@karibuhigh.ac.ke", PW, "/pathway-guide");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Start the questionnaire" }).click();
    await page.waitForTimeout(800);
    await runQuizToResults(page);
    await page.screenshot({ path: "screenshots/u1-06-inapp-results-full-free.png", fullPage: true });
    await browser.close();
    console.log("✓ In-app results screenshot captured.");
  }

  // NEYO Ops tab
  {
    const { browser, page } = await loginAndGoto("founder@neyo.co.ke", PW, "/founder");
    await page.waitForTimeout(1200);
    const tab = page.getByRole("button", { name: /^Pathway Guide$/i }).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: "screenshots/u1-07-ops-pathway-guide-tab.png", fullPage: true });
    await browser.close();
    console.log("✓ NEYO Ops tab screenshot captured.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
