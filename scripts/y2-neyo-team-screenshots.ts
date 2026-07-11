/**
 * Y.2 — NEYO Team & Access + NEYO Support Console — live HTTP + Playwright
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
  // 1) Founder Ops -> Team & Access tab (should show the real Founder account, unrestricted)
  {
    const { browser, page } = await loginAndGoto("founder@neyo.co.ke", PW, "/founder");
    await page.waitForTimeout(1200);
    const tab = page.getByRole("button", { name: /^Team & Access$/i }).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: "screenshots/y2-01-founder-team-access-tab.png", fullPage: true });

    // 2) Create a real NEYO Support account live.
    const newBtn = page.getByRole("button", { name: /New team account/i });
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(600);
      await page.fill('input[placeholder="e.g. Wanjiku Njoroge"]', "Kamau Test Support");
      await page.fill('input[placeholder="name@neyo.co.ke"]', `y2-screenshot-${Date.now()}@example.test`);
      await page.fill('input[placeholder="07XX XXX XXX"]', "0712998877");
      await page.screenshot({ path: "screenshots/y2-02-create-team-account-dialog.png" });
      const createBtn = page.getByRole("button", { name: /Create account/i });
      await createBtn.click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: "screenshots/y2-03-new-account-credentials.png" });
      const doneBtn = page.getByRole("button", { name: "Done" });
      if (await doneBtn.isVisible().catch(() => false)) await doneBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: "screenshots/y2-04-team-list-with-new-account.png", fullPage: true });
    }
    await browser.close();
    console.log("✓ Founder Team & Access screenshots captured.");
  }

  // 3) NEYO Support Console (as the Founder, since it's also accessible there).
  {
    const { browser, page } = await loginAndGoto("founder@neyo.co.ke", PW, "/neyo-support-console");
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "screenshots/y2-05-neyo-support-console.png", fullPage: true });
    await browser.close();
    console.log("✓ NEYO Support Console screenshot captured.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
