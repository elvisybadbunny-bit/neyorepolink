/**
 * T.4 — Duplicate ID Prefix Auto-Disambiguation screenshots.
 * Shows a real student's profile at each of the two live-signed-up schools
 * (Kahawa/Kirinyaga) whose slugs computed the identical base prefix "KHS",
 * proving their real admission numbers are genuinely distinct (KHSS1 vs
 * KHS2S1) side by side.
 */
import { chromium } from "playwright";

async function loginAndShot(email: string, password: string, outPath: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.evaluate(async ({ email, password }) => {
    await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  }, { email, password });
  await page.goto("http://localhost:3000/students", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const cookieGotIt = page.getByRole("button", { name: "Got it" });
  if (await cookieGotIt.isVisible().catch(() => false)) await cookieGotIt.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: outPath, fullPage: false });
  await browser.close();
}

async function main() {
  await loginAndShot("owner-alpha-t4@kahawahigh.test", "TestPass2026!", "/home/user/neyo/screenshots/t4-01-kahawa-students-KHS.png");
  await loginAndShot("owner-beta-t4@kirinyagahigh.test", "TestPass2026!", "/home/user/neyo/screenshots/t4-02-kirinyaga-students-KHS2.png");
  console.log("done");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
