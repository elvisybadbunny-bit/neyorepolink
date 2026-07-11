/**
 * T.9/T.10/T.11 — live HTTP + Playwright screenshot verification.
 * Logs in as real seeded users (bursar, Chebet Faith the CLASS_TEACHER,
 * and the real seeded parent) against the fresh production server and
 * exercises each real new surface, capturing screenshots.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";

async function loginAndGoto(email: string, password: string, path: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
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
  await page.waitForTimeout(2000);
  const cookieGotIt = page.getByRole("button", { name: "Got it" });
  if (await cookieGotIt.isVisible().catch(() => false)) await cookieGotIt.click();
  await page.waitForTimeout(400);
  return { browser, page };
}

async function main() {
  const PW = "Karibu2026!";

  // ---------------------------------------------------------------------
  // T.9 — Bursar: cafeteria fee plans + requests tabs
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("bursar@karibuhigh.ac.ke", PW, "/cafeteria");
    await page.waitForTimeout(1000);
    const feePlansTab = page.getByRole("button", { name: /Fee plans/i }).first();
    if (await feePlansTab.isVisible().catch(() => false)) {
      await feePlansTab.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: "/home/user/neyo/screenshots/t9-01-fee-plans-tab.png", fullPage: false });

    const requestsTab = page.getByRole("button", { name: /Requests/i }).first();
    if (await requestsTab.isVisible().catch(() => false)) {
      await requestsTab.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: "/home/user/neyo/screenshots/t9-02-requests-tab.png", fullPage: false });
    await browser.close();
  }

  // ---------------------------------------------------------------------
  // T.9 — Parent: portal cafeteria request card (on the child detail view)
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("parent@karibuhigh.ac.ke", PW, "/portal");
    await page.waitForTimeout(1500);
    const firstChildCard = page.locator("button:has-text('Achieng')").first();
    if (await firstChildCard.isVisible().catch(() => false)) {
      await firstChildCard.click();
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: "/home/user/neyo/screenshots/t9-03-parent-portal-cafeteria-card.png", fullPage: true });
    await browser.close();
  }

  // ---------------------------------------------------------------------
  // T.10 — Teacher Chebet Faith: cash payments tab
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("f.chebet@karibuhigh.ac.ke", PW, "/teacher");
    await page.waitForTimeout(1200);
    const cashTab = page.getByRole("button", { name: /Cash payments/i }).first();
    if (await cashTab.isVisible().catch(() => false)) {
      await cashTab.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: "/home/user/neyo/screenshots/t10-01-teacher-cash-tab.png", fullPage: false });
    await browser.close();
  }

  // ---------------------------------------------------------------------
  // T.10/T.11 — Bursar: finance "Cash & reminders" tab
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("bursar@karibuhigh.ac.ke", PW, "/finance");
    await page.waitForTimeout(1200);
    const cashRemTab = page.getByRole("button", { name: /Cash & reminders/i }).first();
    if (await cashRemTab.isVisible().catch(() => false)) {
      await cashRemTab.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: "/home/user/neyo/screenshots/t10-t11-01-finance-cash-reminders-tab.png", fullPage: true });
    await browser.close();
  }

  console.log("done — screenshots saved");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
