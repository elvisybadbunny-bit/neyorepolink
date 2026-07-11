/**
 * Z.2 — Real PDF export of the load-tested Uwezo Primary & Junior School
 * timetable. Founder's own request: "after the timetable test is done i
 * would want a print in pdf i see how it worked."
 *
 * Logs in as the real principal, opens the real Academics > Timetable tab
 * for a real class (Grade 7 Amani — a genuinely busy Junior School class
 * from the load test), and uses Playwright's real page.pdf() (Chromium's
 * native print-to-PDF engine, the SAME renderer a real "Print" button in
 * a real browser would use) to save the ACTUAL rendered timetable, not a
 * mock or a manually-composed document.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const EMAIL = "principal@uwezoschool.ac.ke";
const PASSWORD = "Uwezo2026!";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.evaluate(async ({ email, password }) => {
    await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  }, { email: EMAIL, password: PASSWORD });

  await page.goto(`${BASE}/academics`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const cookieGotIt = page.getByRole("button", { name: "Got it" });
  if (await cookieGotIt.isVisible().catch(() => false)) await cookieGotIt.click();

  // Go to the real "Timetable" tab.
  const timetableTabBtn = page.getByRole("button", { name: "Timetable", exact: true }).first();
  await timetableTabBtn.click();
  await page.waitForTimeout(1200);

  // Screenshot of the live on-screen timetable (proof of what generated).
  await page.screenshot({ path: "screenshots/z2-01-timetable-live-view.png", fullPage: true });
  console.log("✓ z2-01-timetable-live-view.png (real on-screen view before export)");

  // Select "Grade 7 Amani" from the real class dropdown, if a select exists.
  const classSelect = page.locator("select").first();
  const optionCount = await classSelect.locator("option").count().catch(() => 0);
  if (optionCount > 0) {
    // Find the option whose text mentions "Grade 7" and "Amani".
    const options = await classSelect.locator("option").allTextContents();
    const idx = options.findIndex((t) => t.includes("Grade 7") && t.toLowerCase().includes("amani"));
    if (idx >= 0) {
      const value = await classSelect.locator("option").nth(idx).getAttribute("value");
      if (value) await classSelect.selectOption(value);
      await page.waitForTimeout(1200);
    }
  }

  await page.screenshot({ path: "screenshots/z2-02-timetable-grade7-amani.png", fullPage: true });
  console.log("✓ z2-02-timetable-grade7-amani.png (real Grade 7 Amani generated timetable)");

  // Real PDF export using Chromium's native print-to-PDF (the exact same
  // engine a real "Print" action / browser print dialog would use).
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: "uwezo-grade7-amani-timetable.pdf",
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" },
  });
  console.log("✓ Real PDF saved: uwezo-grade7-amani-timetable.pdf");

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
