/**
 * T.1 — Per-Physical-Copy Library Tracking screenshots.
 * Logs in as librarian, opens the Library catalog, opens the Copies dialog
 * for "The River and the Source" to show real per-copy codes/statuses, and
 * captures the Issue tab showing a scanned-copy result.
 */
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.evaluate(async () => {
    await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "library@karibuhigh.ac.ke", password: "Karibu2026!" }),
    });
  });

  await page.goto("http://localhost:3000/library", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const cookieGotIt = page.getByRole("button", { name: "Got it" });
  if (await cookieGotIt.isVisible().catch(() => false)) await cookieGotIt.click();
  await page.waitForTimeout(300);

  // Open the "Copies" dialog for The River and the Source.
  const copiesBtn = page.getByRole("button", { name: /Copies|Track copies/ }).first();
  await copiesBtn.click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "/home/user/neyo/screenshots/t1-01-copies-dialog.png", fullPage: false });

  // Close and go to the Issue tab, scan the copy code.
  const closeBtn = page.getByRole("button", { name: "Close" }).first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  const issueTabBtn = page.getByRole("button", { name: "Issue a book" });
  if (await issueTabBtn.isVisible().catch(() => false)) {
    await issueTabBtn.click();
    await page.waitForTimeout(800);
    const barcodeInput = page.locator('input[placeholder="9789966882XXX"]');
    await barcodeInput.fill("8C24712870"); // Copy 2's real code, seeded AVAILABLE
    await barcodeInput.press("Enter");
    await page.waitForTimeout(800);
    await page.screenshot({ path: "/home/user/neyo/screenshots/t1-02-issue-scan-copy.png", fullPage: false });
  }

  await browser.close();
  console.log("done");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
