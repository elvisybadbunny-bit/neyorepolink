/**
 * T.13 — Manual Repeat-a-Level screenshots.
 * Logs in as principal, opens the Promotion page, expands a class roster to
 * show the repeat checkboxes, ticks one, then visits a student profile that
 * carries a real isRepeating flag to show the amber "Repeating" badge.
 */
import { chromium } from "playwright";
import { db } from "../src/lib/db";

async function main() {
  // Seed a REAL, temporary isRepeating student so the profile badge has
  // something real to show (cleaned up at the end).
  const tenant = await db.tenant.findFirstOrThrow({ where: { slug: "karibu-high" } });
  const demoRepeater = await db.student.create({
    data: {
      tenantId: tenant.id,
      admissionNo: "KH-DEMO-REPEAT",
      firstName: "Demo",
      lastName: "Repeater",
      gender: "M",
      status: "ACTIVE",
      isRepeating: true,
      repeatingSinceYear: 2026,
      classId: (await db.schoolClass.findFirstOrThrow({ where: { tenantId: tenant.id, level: "Form 2", stream: "East" } })).id,
    },
  });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.evaluate(async () => {
    await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "principal@karibuhigh.ac.ke", password: "Karibu2026!" }),
    });
  });

  // 1) Promotion page — expand Form 2 East roster to show repeat checkboxes.
  await page.goto("http://localhost:3000/students/promotion", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const cookieGotIt = page.getByRole("button", { name: "Got it" });
  if (await cookieGotIt.isVisible().catch(() => false)) await cookieGotIt.click();
  await page.waitForTimeout(300);

  const markRepeatsButtons = page.getByRole("button", { name: /repeating|Mark repeats/ });
  const count = await markRepeatsButtons.count();
  if (count > 0) {
    await markRepeatsButtons.first().click();
    await page.waitForTimeout(500);
    // tick the first checkbox in the expanded roster
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.check();
      await page.waitForTimeout(400);
    }
  }
  await page.screenshot({ path: "/home/user/neyo/screenshots/t13-01-promotion-repeat-checkboxes.png", fullPage: false });

  // 2) Student profile with a real isRepeating flag — the amber badge.
  await page.goto(`http://localhost:3000/students/${demoRepeater.id}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "/home/user/neyo/screenshots/t13-02-profile-repeating-badge.png", fullPage: false });

  await browser.close();

  // cleanup the demo student
  await db.student.delete({ where: { id: demoRepeater.id } });
  console.log("done, demo student cleaned up");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
