/**
 * Z.4 — Real screenshots of all 10 real Form 1 stream timetables at
 * Kilimo Day Secondary School, per the founder's own request.
 */
import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 1200 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const loginResult = await page.evaluate(async () => {
    const res = await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "principal@kilimoday.ac.ke", password: "Dual2026!" }),
    });
    return { status: res.status, ok: res.ok };
  });
  console.log("login:", loginResult);

  const classesResp = await page.evaluate(async () => {
    const res = await fetch("/api/classes");
    return res.json();
  });
  const form1Classes = (classesResp?.data?.classes ?? []).filter((c: any) => c.level === "Form 1");
  console.log(`Found ${form1Classes.length} real Form 1 classes:`, form1Classes.map((c: any) => c.stream).join(", "));

  fs.mkdirSync("screenshots/z4-form1", { recursive: true });

  for (const cls of form1Classes) {
    await page.goto(`${BASE}/print/timetable?classId=${cls.id}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(300);
    const fileName = `screenshots/z4-form1/Form_1_${cls.stream}.png`;
    const pageEl = page.locator(".ptt-page").first();
    await pageEl.screenshot({ path: fileName });
    console.log(`✓ ${fileName}`);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
