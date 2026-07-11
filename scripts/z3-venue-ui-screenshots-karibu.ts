/**
 * Z.3 CHUNK 5 — live Playwright verification against the smaller Karibu
 * High School tenant (2 classes only) for speed/reliability, given the
 * sandbox's memory constraints under the larger 27-class Uwezo tenant.
 */
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });

  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.getByText("Sign in with email & password", { exact: false }).click();
  await page.waitForTimeout(600);
  await page.locator("#email").fill("principal@karibuhigh.ac.ke");
  await page.locator("#password").fill("Karibu2026!");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/z3-debug-01-after-login.png", fullPage: false });

  await page.goto("http://localhost:3000/academics", { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(1500);
  const gotIt = page.getByText("Got it", { exact: true });
  if (await gotIt.count() > 0) { await gotIt.click().catch(() => {}); await page.waitForTimeout(300); }

  await page.getByRole("button", { name: "Smart Timetable", exact: true }).click();
  await page.waitForSelector("text=Venues & Labs", { timeout: 20000 }).catch(() => console.log("Venues & Labs card did not appear within 20s"));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/z3-06-smart-timetable-tab.png", fullPage: false });

  const venuesHeading = page.getByText("Venues & Labs", { exact: true });
  await venuesHeading.scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/z3-07-venues-card.png", fullPage: false });

  const nameInput = page.locator('input[placeholder="e.g. Chemistry Lab"]');
  await nameInput.fill("UI Test Physics Lab", { timeout: 15000 });
  const addButton = page.getByRole("button", { name: /Add venue/i });
  await addButton.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/z3-08-venue-added.png", fullPage: false });

  const venuesJson = await page.evaluate(async () => {
    const res = await fetch("/api/academics/timetable/venues");
    return res.json();
  });
  const added = venuesJson?.data?.venues?.find((v: any) => v.name === "UI Test Physics Lab");
  console.log("Real venue added via UI, confirmed via API re-query:", !!added, added?.shortCode);

  if (added) {
    const delRes = await page.evaluate(async (id: string) => {
      const res = await fetch("/api/academics/timetable/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      return res.json();
    }, added.id);
    console.log("Cleanup delete result:", JSON.stringify(delRes));
  }

  await browser.close();
  console.log("Screenshots captured.");
}

main().catch((e) => { console.error(e); process.exit(1); });
