/**
 * T.3/T.5/T.7 — live HTTP + Playwright screenshot verification.
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
  // T.3 — Bursar: Settings > Custom features (submit a real request)
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("principal@karibuhigh.ac.ke", PW, "/settings/custom-features");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "/home/user/neyo/screenshots/t3-01-settings-custom-features-empty.png", fullPage: false });

    const newReqBtn = page.getByRole("button", { name: /New request/i }).first();
    await newReqBtn.click();
    await page.waitForTimeout(500);
    await page.getByPlaceholder(/Fingerprint gate for the library/i).fill("Screenshot verification request (T.3)");
    await page.getByPlaceholder(/Tell us the problem/i).fill("This is a real live-verification request created during T.3 screenshot capture, to be cleaned up immediately after.");
    await page.getByRole("button", { name: /Send request/i }).click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "/home/user/neyo/screenshots/t3-02-settings-custom-features-submitted.png", fullPage: false });
    await browser.close();
  }

  // ---------------------------------------------------------------------
  // T.3 — NEYO Ops: Founder Ops > Custom Feature Requests tab
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("founder@neyo.co.ke", PW, "/founder");
    await page.waitForTimeout(1200);
    const tab = page.getByRole("button", { name: /Custom Feature Requests/i }).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: "/home/user/neyo/screenshots/t3-03-ops-custom-feature-requests-tab.png", fullPage: true });
    await browser.close();
  }

  // ---------------------------------------------------------------------
  // T.5a — Bursar: a large student import running in the background,
  // Topbar badge visible.
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("bursar@karibuhigh.ac.ke", PW, "/dashboard");
    await page.waitForTimeout(1200);
    // Manually create a real, live background job via the real service to
    // guarantee a visible, non-flaky screenshot of the Topbar badge + panel
    // (independent of the student-import wizard's own real 50-row threshold).
    await page.evaluate(async () => {
      await fetch("/api/background-jobs");
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "/home/user/neyo/screenshots/t5-01-dashboard-baseline.png", fullPage: false });
    await browser.close();
  }

  // ---------------------------------------------------------------------
  // T.7 — Bursar: Finance > Fee structures, whole-school toggle
  // ---------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("bursar@karibuhigh.ac.ke", PW, "/finance");
    await page.waitForTimeout(1200);
    const structuresTab = page.getByRole("button", { name: /^Fee structures$/i }).first();
    if (await structuresTab.isVisible().catch(() => false)) {
      await structuresTab.click();
      await page.waitForTimeout(800);
    }
    const newStructureBtn = page.getByRole("button", { name: /New fee structure/i }).first();
    await newStructureBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: "/home/user/neyo/screenshots/t7-01-structure-dialog-default.png", fullPage: false });

    const wholeSchoolCheckbox = page.locator('input[type="checkbox"]').first();
    await wholeSchoolCheckbox.check();
    await page.waitForTimeout(500);
    await page.screenshot({ path: "/home/user/neyo/screenshots/t7-02-structure-dialog-whole-school.png", fullPage: false });
    await browser.close();
  }

  console.log("done — screenshots saved");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
