import { chromium } from "playwright";

const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const resp = await page.request.post(`${BASE}/api/auth/password/login`, {
    data: { email: "founder@karibuhigh.ac.ke", password: "Karibu2026!" },
  });
  console.log("login:", resp.status());

  await page.goto(`${BASE}/founder`, { waitUntil: "domcontentloaded" });

  const healthTab = page.locator("button", { hasText: "Tenant Health Radar" });
  await healthTab.first().waitFor({ state: "visible", timeout: 30000 });
  await healthTab.first().click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/orphaned-features-audit/10-tenant-health-defcon.png", fullPage: true });
  console.log("captured 10-tenant-health-defcon");

  const smsTab = page.locator("button", { hasText: "SMS Health Monitor" });
  await smsTab.first().waitFor({ state: "visible", timeout: 15000 });
  await smsTab.first().click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/orphaned-features-audit/11-sms-health-monitor.png", fullPage: true });
  console.log("captured 11-sms-health-monitor");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
