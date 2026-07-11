/**
 * Z.3 print redesign — live Playwright verification: real login, real
 * single-class print page (portrait, horizontal days), real single-class
 * print page with vertical days (landscape), real teacher print page.
 */
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });

  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.getByText("Sign in with email & password", { exact: false }).click();
  await page.waitForTimeout(500);
  await page.locator("#email").fill("principal@karibuhigh.ac.ke");
  await page.locator("#password").fill("Karibu2026!");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2000);

  const classesJson = await page.evaluate(async () => {
    const res = await fetch("/api/classes");
    return res.json();
  });
  const cls = classesJson.data.classes[0];
  console.log("Testing with real class:", cls.name, cls.id);

  // Portrait (horizontal days, default).
  await page.goto(`http://localhost:3000/print/timetable?classId=${cls.id}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/z3-print-01-portrait.png", fullPage: true });

  // Landscape (vertical days).
  await page.goto(`http://localhost:3000/print/timetable?classId=${cls.id}&vertical=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/z3-print-02-landscape.png", fullPage: true });

  // Real teacher print page.
  const teachersJson = await page.evaluate(async () => {
    const res = await fetch("/api/conversations/recipients");
    return res.json();
  });
  const teacher = (teachersJson.data.recipients || []).find((t: any) => ["TEACHER", "CLASS_TEACHER"].includes(t.role));
  if (teacher) {
    console.log("Testing with real teacher:", teacher.fullName, teacher.id);
    await page.goto(`http://localhost:3000/print/timetable?teacherId=${teacher.id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/z3-print-03-teacher.png", fullPage: true });
  }

  await browser.close();
  console.log("Print redesign screenshots captured.");
}

main().catch((e) => { console.error(e); process.exit(1); });
