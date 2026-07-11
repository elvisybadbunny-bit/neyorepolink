import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.getByText("Sign in with email & password", { exact: false }).click();
  await page.waitForTimeout(500);
  await page.locator("#email").fill("principal@uwezoschool.ac.ke");
  await page.locator("#password").fill("Uwezo2026!");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2000);

  await page.goto("http://localhost:3000/academics", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const gotIt = page.getByText("Got it", { exact: true });
  if (await gotIt.count() > 0) { await gotIt.click().catch(() => {}); await page.waitForTimeout(300); }
  await page.getByRole("button", { name: "Timetable", exact: true }).click();
  await page.waitForTimeout(2500);

  // Dump the toolbar HTML near "Print all classes" to find the real picker.
  const html = await page.locator("body").innerHTML();
  const idx = html.indexOf("Print all classes");
  console.log(html.slice(Math.max(0, idx - 3000), idx + 500));

  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
