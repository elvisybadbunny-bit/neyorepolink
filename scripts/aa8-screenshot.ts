import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  try {
    await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1500);
    const emailBtn = page.locator("text=Sign in with email");
    if (await emailBtn.count() > 0) await emailBtn.first().click();
    await page.fill("#email", "principal@karibuhigh.ac.ke");
    await page.fill("#password", "Karibu2026!");
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/password/login") && r.status() === 200, { timeout: 20000 }),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForURL(/dashboard/, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    await page.goto("http://localhost:3000/academics", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(4000);

    // Click the "Smart Timetable" / timetable-generator tab if not default.
    const tabCandidates = ["text=Smart Timetable", "text=Timetable"];
    for (const sel of tabCandidates) {
      const el = page.locator(sel).first();
      if (await el.count() > 0) { await el.click().catch(() => {}); break; }
    }
    await page.waitForTimeout(4000);

    // Scroll to the class subject lesson requirements card.
    await page.waitForSelector("text=Class subject lesson requirements", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const heading = page.locator("text=Class subject lesson requirements").first();
    if (await heading.count() > 0) {
      await heading.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
    }
    // Also try to dismiss the cookie banner if present, for a cleaner shot.
    const gotIt = page.locator("text=Got it").first();
    if (await gotIt.count() > 0) await gotIt.click().catch(() => {});
    await page.waitForTimeout(500);

    await page.screenshot({ path: "screenshots/aa8/lab-priority-blocking-ui.png", fullPage: false });
    console.log("Screenshot saved.");
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
