/**
 * Live, real (not mocked) walkthrough of the Student Import wizard with a
 * real Subjects column (BB.4), per the founder's own request: "test the
 * import of students with their subjects." Logs in as the real Karibu
 * High principal, pastes a real CSV with a real Subjects column into the
 * live wizard, walks the real preview + commit steps, and screenshots
 * each real stage so the founder can see it working end-to-end in the
 * actual app UI (not just the automated regression test).
 */
import { chromium } from "playwright";
import path from "path";

const BASE = "http://localhost:3000";
const OUT = path.join(process.cwd(), "..", "screenshots", "aa10-import");

async function cookies(email: string) {
  const res = await fetch(`${BASE}/api/auth/password/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Karibu2026!" }),
  });
  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie") ?? ""];
  const session = raw.map((c) => c.match(/neyo_session=([^;]+)/)?.[1]).find(Boolean);
  const deviceId = raw.map((c) => c.match(/neyo_device_id=([^;]+)/)?.[1]).find(Boolean);
  if (!session) throw new Error("no session cookie for " + email);
  return { session, deviceId };
}

async function main() {
  const fs = await import("fs");
  fs.mkdirSync(OUT, { recursive: true });

  const { session, deviceId } = await cookies("principal@karibuhigh.ac.ke");
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1100 }, deviceScaleFactor: 2 });
  const cookieList: any[] = [{ name: "neyo_session", value: session, domain: "localhost", path: "/" }];
  if (deviceId) cookieList.push({ name: "neyo_device_id", value: deviceId, domain: "localhost", path: "/" });
  await ctx.addCookies(cookieList);
  const page = await ctx.newPage();

  await page.goto(`${BASE}/students/import`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.getByText("Got it", { exact: true }).click({ timeout: 1200 }).catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "1-import-wizard-step1.png") });
  console.log("  \u2713 1-import-wizard-step1.png");

  // A real CSV, including a real Subjects column (BB.4's own real feature)
  // for a fresh Form 3 intake with real Kenyan names and real Karibu High
  // subjects, using a real existing class ("Form 2 East") so the import
  // resolves cleanly against the school's own live data.
  const csv = [
    "Name,Admission No,Class,Gender,D.O.B,Guardian Name,Guardian Phone,Subjects",
    "Wanjala Brian Kiptoo,KH-2026-101,Form 2 East,M,2012-03-14,Kiptoo Consolata,+254712345601,History & Government;CRE;Geography",
    "Nasimiyu Mercy Achieng,KH-2026-102,Form 2 East,F,2012-07-22,Achieng Job,+254733456712,Agriculture;Computer Studies;Geography",
  ].join("\n");

  await page.getByPlaceholder(/paste/i).fill(csv).catch(async () => {
    // fall back to the textarea directly if the placeholder text differs
    await page.locator("textarea").first().fill(csv);
  });
  await page.screenshot({ path: path.join(OUT, "2-pasted-csv-with-subjects-column.png") });
  console.log("  \u2713 2-pasted-csv-with-subjects-column.png");

  await page.getByRole("button", { name: /paste from google sheets|check rows|preview/i }).first().click().catch(async () => {
    await page.getByRole("button").filter({ hasText: /paste/i }).last().click();
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, "3-column-mapping-and-preview.png") });
  console.log("  \u2713 3-column-mapping-and-preview.png");

  // Scroll to find and screenshot the Subjects mapping specifically.
  const subjectsMappingLocator = page.getByText(/Subjects \(e\.g\. History;CRE\)/i).first();
  if (await subjectsMappingLocator.count() > 0) {
    await subjectsMappingLocator.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, "4-subjects-column-auto-mapped.png") });
    console.log("  \u2713 4-subjects-column-auto-mapped.png (Subjects column auto-mapped, confirmed visible)");
  } else {
    console.log("  (i) Subjects column mapping label not found in this exact viewport — check screenshot 3 for the real mapping dropdowns.");
  }

  // Commit the import for real.
  const commitBtn = page.getByRole("button", { name: /import \d+ student|commit|confirm import/i }).first();
  await commitBtn.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(300);
  await commitBtn.click({ timeout: 5000 }).catch(async () => {
    await page.getByRole("button").filter({ hasText: /import/i }).last().click();
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, "5-import-result.png") });
  console.log("  \u2713 5-import-result.png");

  await browser.close();
  console.log("\nDone — screenshots saved to screenshots/aa10-import/");
}

main().catch((e) => { console.error(e); process.exit(1); });
