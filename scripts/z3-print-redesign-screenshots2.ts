/**
 * Z.3 print redesign — live Playwright verification against the real,
 * fully-populated Grade 7 Amani class (Uwezo Primary & Junior School),
 * which has a real TimetableConfig + real lessons + real lunch break, to
 * confirm the merged lunch row and populated cells render correctly.
 */
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });

  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.getByText("Sign in with email & password", { exact: false }).click();
  await page.waitForTimeout(600);
  await page.locator("#email").fill("principal@uwezoschool.ac.ke");
  await page.locator("#password").fill("Uwezo2026!");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2500);

  const classesJson = await page.evaluate(async () => {
    const res = await fetch("/api/classes");
    return res.json();
  });
  const cls = classesJson.data.classes.find((c: any) => c.name === "Grade 7 Amani");
  console.log("Testing with real class:", cls.name, cls.id);

  await page.goto(`http://localhost:3000/print/timetable?classId=${cls.id}`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/z3-print-04-grade7-full.png", fullPage: true });

  await page.goto(`http://localhost:3000/print/timetable?classId=${cls.id}&vertical=1`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/z3-print-05-grade7-landscape.png", fullPage: true });

  await browser.close();
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
