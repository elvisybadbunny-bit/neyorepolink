/**
 * T.2/T.6/T.14 — live HTTP + Playwright screenshot verification.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const PW = "Karibu2026!";

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
  // ---------------------------------------------------------------------
  // T.2/T.6 — NEYO Ops: Founder Ops discount campaigns + influencer codes tabs
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("founder@neyo.co.ke", PW, "/founder");
    await page.waitForTimeout(1200);
    const campaignsTab = page.getByRole("button", { name: /^Discount Campaigns$/i }).first();
    if (await campaignsTab.isVisible().catch(() => false)) {
      await campaignsTab.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: "/home/user/neyo/screenshots/t2-01-ops-discount-campaigns-tab.png", fullPage: true });

    const influencerTab = page.getByRole("button", { name: /^Influencer Codes$/i }).first();
    if (await influencerTab.isVisible().catch(() => false)) {
      await influencerTab.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: "/home/user/neyo/screenshots/t6-01-ops-influencer-codes-tab.png", fullPage: true });
    await browser.close();
  }

  // ---------------------------------------------------------------------
  // T.6 — School: Settings > Billing (referral + influencer code cards)
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("principal@karibuhigh.ac.ke", PW, "/settings/billing");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "/home/user/neyo/screenshots/t6-02-settings-billing-influencer-card.png", fullPage: true });
    await browser.close();
  }

  // ---------------------------------------------------------------------
  // T.14 — Parent portal: "Pay for more than one child at once" card
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("parent@karibuhigh.ac.ke", PW, "/portal");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "/home/user/neyo/screenshots/t14-01-parent-portal-split-payment-card.png", fullPage: false });

    const payNowBtn = page.getByRole("button", { name: /Pay now/i }).first();
    if (await payNowBtn.isVisible().catch(() => false)) {
      await payNowBtn.click();
      await page.waitForTimeout(700);
      await page.screenshot({ path: "/home/user/neyo/screenshots/t14-02-split-payment-dialog.png", fullPage: false });
    }
    await browser.close();
  }

  console.log("done — screenshots saved");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
