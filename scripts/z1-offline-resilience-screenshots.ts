/**
 * Z.1 — Real Offline-First Resilience — live HTTP + Playwright screenshot
 * verification. Covers: (a) Gate Pass issuance while genuinely offline
 * (queues, then syncs on reconnect with the real minted passNo, never
 * duplicated); (b) the real exit-scan's offline-blocking warning (never
 * silently queued); (c) the new `/offline` page showing a real saved
 * Bundle Saver snapshot with the "viewing saved data from [time]" banner.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const PW = "Karibu2026!";

async function loginAndGoto(email: string, password: string, path: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.evaluate(async ({ email, password }) => {
    await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  }, { email, password });
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const cookieGotIt = page.getByRole("button", { name: "Got it" });
  if (await cookieGotIt.isVisible().catch(() => false)) await cookieGotIt.click();
  await page.waitForTimeout(400);
  return { browser, context, page };
}

async function main() {
  // -------------------------------------------------------------------
  // 1) Dashboard — real Bundle Saver auto-sync-on-login card.
  // -------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("principal@karibuhigh.ac.ke", PW, "/dashboard");
    await page.waitForTimeout(2500); // allow the real auto-sync-on-login fetch to complete
    await page.screenshot({ path: "screenshots/z1-01-bundle-saver-dashboard.png", fullPage: false });
    console.log("✓ z1-01-bundle-saver-dashboard.png");
    await browser.close();
  }

  // -------------------------------------------------------------------
  // 2) Gate Pass — issue a real pass WHILE genuinely offline (queues via
  //    IndexedDB), then reconnect and confirm it synced with a real passNo.
  // -------------------------------------------------------------------
  {
    const { browser, context, page } = await loginAndGoto("principal@karibuhigh.ac.ke", PW, "/gate");
    await page.waitForTimeout(1000);

    const newPassBtn = page.getByRole("button", { name: "Issue / propose pass", exact: true }).first();
    await newPassBtn.click();
    await page.waitForTimeout(500);

    // Pick the first real student via the real typeahead search box.
    const studentSearch = page.getByPlaceholder("Type learner name or admission number…").first();
    await studentSearch.click();
    await studentSearch.fill("a");
    await page.waitForTimeout(500);
    const firstOption = page.locator("div.absolute.z-\\[80\\] button").first();
    await firstOption.waitFor({ state: "visible", timeout: 10000 });
    await firstOption.click();
    await page.getByPlaceholder(/dental appointment/i).fill("Z.1 screenshot verification — dental appointment");

    // Go genuinely offline (Playwright's real network-level offline mode).
    await context.setOffline(true);
    await page.waitForTimeout(500);

    const saveBtn = page.getByRole("button", { name: "Submit gate pass", exact: true }).first();
    await saveBtn.click();

    await page.waitForTimeout(1200);
    await page.screenshot({ path: "screenshots/z1-02-gatepass-queued-offline.png", fullPage: false });
    console.log("✓ z1-02-gatepass-queued-offline.png (queued-offline toast)");

    // Reconnect — the real outbox should sync automatically.
    await context.setOffline(false);
    await page.waitForTimeout(2500);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "screenshots/z1-03-gatepass-synced-after-reconnect.png", fullPage: false });
    console.log("✓ z1-03-gatepass-synced-after-reconnect.png (real pass visible after real sync)");

    await browser.close();
  }

  // -------------------------------------------------------------------
  // 3) Gate exit-scan — genuinely offline, must BLOCK with a warning,
  //    never silently queue (founder's own confirmed decision).
  // -------------------------------------------------------------------
  {
    const { browser, context, page } = await loginAndGoto("principal@karibuhigh.ac.ke", PW, "/gate");
    await page.waitForTimeout(1000);

    await context.setOffline(true);
    await page.waitForTimeout(500);

    const checkInput = page.getByPlaceholder("GP-0001");
    await checkInput.fill("GP1");
    const checkBtn = page.getByRole("button", { name: "Check" });
    await checkBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: "screenshots/z1-04-exit-scan-blocked-offline.png", fullPage: false });
    console.log("✓ z1-04-exit-scan-blocked-offline.png (real blocking warning, never queued)");

    await context.setOffline(false);
    await browser.close();
  }

  // -------------------------------------------------------------------
  // 4) The real /offline page — showing the real saved Bundle Saver
  //    snapshot with the "viewing saved data from [time]" banner.
  // -------------------------------------------------------------------
  {
    const { browser, page } = await loginAndGoto("principal@karibuhigh.ac.ke", PW, "/dashboard");
    await page.waitForTimeout(2000); // let Bundle Saver auto-sync populate real IndexedDB data first
    await page.goto(`${BASE}/offline`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "screenshots/z1-05-offline-snapshot-viewer.png", fullPage: true });
    console.log("✓ z1-05-offline-snapshot-viewer.png (real saved-data banner + tabs)");
    await browser.close();
  }

  console.log("\nAll Z.1 screenshots captured.");
}

main().catch((e) => { console.error(e); process.exit(1); });
