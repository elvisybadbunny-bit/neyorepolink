/**
 * Z.3 — live Playwright verification: real Grade 7 Amani timetable view,
 * showing the free-period distribution fix live in the UI (after setting a
 * real freePeriodsPerWeek and regenerating via the live Master Button).
 */
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
  await page.waitForTimeout(2500);

  await page.goto("http://localhost:3000/academics", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // Dismiss cookie banner if present.
  const gotIt = page.getByText("Got it", { exact: true });
  if (await gotIt.count() > 0) {
    await gotIt.click().catch(() => {});
    await page.waitForTimeout(500);
  }

  await page.getByRole("button", { name: "Timetable", exact: true }).click();
  // Real class list loads async via /api/classes — wait for the native
  // <select> to actually populate with real options before proceeding.
  const classSelect = page.locator("select").first();
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelectorAll("select")[0] as HTMLSelectElement | undefined;
      return !!el && el.options.length > 1;
    },
    null,
    { timeout: 15000 }
  ).catch(() => console.log("class <select> did not populate within 15s"));
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/z3-03-timetable-tab.png", fullPage: false });

  const optionLabels = await classSelect.locator("option").allTextContents();
  console.log("Real class options:", optionLabels.length, optionLabels.map((o) => o.trim()));
  const grade7AmaniLabel = optionLabels.find((o) => o.trim() === "Grade 7 Amani");
  console.log("Matched label:", JSON.stringify(grade7AmaniLabel));
  if (grade7AmaniLabel) {
    await classSelect.selectOption({ label: grade7AmaniLabel });
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(700);
      const selectedNow = await classSelect.evaluate((el: HTMLSelectElement) => el.selectedOptions[0]?.textContent);
      console.log(`check ${i}: selected =`, selectedNow);
      if (selectedNow === "Grade 7 Amani") break;
      // Re-select in case a re-render reset it.
      await classSelect.selectOption({ label: grade7AmaniLabel }).catch(() => {});
    }
    // Wait for the real grid data to catch up to the real selected class
    // (a genuine "ENG7"/"MAT7" subject code appearing confirms Grade 7's
    // own real data has loaded, not a stale Grade 1 grid).
    await page.waitForSelector("text=/ENG7|MAT7|KIS7/", { timeout: 10000 }).catch(() => console.log("Grade 7 subject codes did not appear within 10s"));
    await page.waitForTimeout(800);
    await page.screenshot({ path: "screenshots/z3-04-grade7-amani-grid.png", fullPage: false });
    await page.screenshot({ path: "screenshots/z3-05-grade7-amani-grid-fullpage.png", fullPage: true });
  } else {
    console.log("Grade 7 Amani option not found; real options were:", optionLabels);
  }

  await browser.close();
  console.log("Screenshots captured.");
}

main().catch((e) => { console.error(e); process.exit(1); });
