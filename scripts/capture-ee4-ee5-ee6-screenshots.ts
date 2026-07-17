/**
 * Live Playwright screenshot capture for EE.4, EE.5, and EE.6 UI changes.
 */

import { chromium } from "playwright";
import { db } from "@/lib/db";
import { setEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { saveTidiedExamPaper } from "@/lib/services/exam-paper-scan.service";

async function main() {
  console.log("Preparing database fixtures & flags for live UI screenshots...");

  const karibu = await db.tenant.findFirst({ where: { name: { contains: "Karibu" } } });
  if (!karibu) throw new Error("Karibu tenant not found.");

  const principal = await db.user.findFirst({
    where: { tenantId: karibu.id, role: "PRINCIPAL" },
  });
  if (!principal) throw new Error("Karibu Principal not found.");

  const opsUser = await db.user.findFirst({
    where: { role: { in: ["FOUNDER", "SUPER_ADMIN"] } },
  }) ?? { id: "ops-user", role: "SUPER_ADMIN", tenantId: "ops" } as never;

  // Release EE.4, EE.5, and EE.6 platform-wide for screenshot capture
  await setEeFeatureReleased(opsUser as never, "EE.4", true, "Screenshot release");
  await setEeFeatureReleased(opsUser as never, "EE.5", true, "Screenshot release");
  await setEeFeatureReleased(opsUser as never, "EE.6", true, "Screenshot release");

  const cheSubject = await db.subject.findFirst({ where: { tenantId: karibu.id, code: "CHE" } })
    || await db.subject.findFirst({ where: { tenantId: karibu.id } });
  const schoolClass = await db.schoolClass.findFirst({ where: { tenantId: karibu.id } });
  if (!cheSubject || !schoolClass) throw new Error("Missing subject or class.");

  // Create a sample tidied paper in Karibu library
  await saveTidiedExamPaper(principal as never, {
    subjectId: cheSubject.id,
    classId: schoolClass.id,
    title: "Form 3 Chemistry End of Term 2 Exam (Sample Scan)",
    instructions: "Answer all questions cleanly in the spaces provided. Show working.",
    timeAllowedMins: 120,
    totalMarks: 35,
    status: "TIDIED",
    privacyTier: "PUBLIC_SHARED",
    questions: [
      {
        id: "sample-1",
        questionNumber: 1,
        prompt: "Define atomic number and mass number of an element.",
        questionType: "STRUCTURED",
        options: [],
        marks: 4,
        confidencePct: 96,
      },
      {
        id: "sample-2",
        questionNumber: 2,
        prompt: "Which of the following elements is an alkali metal?",
        questionType: "MULTIPLE_CHOICE",
        options: ["Sodium", "Chlorine", "Argon", "Calcium"],
        marks: 2,
        confidencePct: 99,
      },
      {
        id: "sample-3",
        questionNumber: 3,
        prompt: "Discuss the industrial synthesis of sulfuric acid via the Contact process, stating all conditions and catalysts.",
        questionType: "ESSAY",
        options: [],
        marks: 15,
        confidencePct: 92,
      },
    ],
  });

  // Approve public sharing on that paper so National Exam Bank shows it
  await db.scannedExamPaper.updateMany({
    where: { title: "Form 3 Chemistry End of Term 2 Exam (Sample Scan)" },
    data: { privacyTier: "PUBLIC_SHARED", sharingApprovalStatus: "APPROVED", sharingDecidedAt: new Date() },
  });

  console.log("Launching Chromium to capture screenshots on localhost:3000...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2, // High-res Liquid Glass capture
  });
  const page = await context.newPage();

  try {
    await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const emailBtn = page.locator("text=Sign in with email");
    if (await emailBtn.count() > 0) await emailBtn.first().click();

    await page.fill("#email", "principal@karibuhigh.ac.ke");
    await page.fill("#password", "Karibu2026!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(1500);

    console.log("Navigating to Academics -> Exams...");
    await page.goto("http://localhost:3000/exams", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Click on the first exam card or row to open ExamDetail
    const examCard = page.locator("li, tr, .card, div").filter({ hasText: "Term" }).first();
    if (await examCard.count() > 0) {
      await examCard.click().catch(() => {});
      await page.waitForTimeout(2000);
    }

    // Click "Enter marks" tab if available
    const enterMarksBtn = page.locator("button:has-text('Enter marks')").first();
    if (await enterMarksBtn.count() > 0) {
      await enterMarksBtn.click();
      await page.waitForTimeout(2000);
    }

    // Select class and subject in MarksEntry dropdowns to reveal EE.4/EE.5/EE.6 buttons
    const selects = await page.locator("select").all();
    if (selects.length >= 2) {
      await selects[0].selectOption({ index: 1 }).catch(() => {});
      await page.waitForTimeout(500);
      await selects[1].selectOption({ index: 1 }).catch(() => {});
      await page.waitForTimeout(1500);
    }

    // Capture 1: Main enter marks view showing the 3 new buttons (EE.4, EE.5, EE.6)
    await page.screenshot({ path: "screenshots/ee4-ee5-ee6-buttons-active.png" });
    console.log("Captured screenshots/ee4-ee5-ee6-buttons-active.png");

    // Capture 2: Open EE.4 Paper Sheet / Scan Modal
    const ee4Btn = page.locator("button:has-text('EE.4')").first();
    if (await ee4Btn.count() > 0) {
      await ee4Btn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: "screenshots/ee4-mark-sheet-modal.png" });
      console.log("Captured screenshots/ee4-mark-sheet-modal.png");
      // Close modal
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1000);
    }

    // Capture 3: Open EE.5 Tidy Scanned Exam Modal
    const ee5Btn = page.locator("button:has-text('EE.5')").first();
    if (await ee5Btn.count() > 0) {
      await ee5Btn.click();
      await page.waitForTimeout(1500);
      // Click on Review & Tidy tab to show side-by-side workspace and questions
      const tidyTab = page.locator("button:has-text('Review & Tidy')").first();
      if (await tidyTab.count() > 0) await tidyTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: "screenshots/ee5-exam-tidying-workspace.png" });
      console.log("Captured screenshots/ee5-exam-tidying-workspace.png");

      // Click on Print / Export tab to show printable Kenyan layout (`⌘P`)
      const printTab = page.locator("button:has-text('Print / Export')").first();
      if (await printTab.count() > 0) await printTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: "screenshots/ee5-printable-exam-layout.png" });
      console.log("Captured screenshots/ee5-printable-exam-layout.png");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(1000);
    }

    // Capture 4: Open EE.6 National Exam Bank Modal
    const ee6Btn = page.locator("button:has-text('EE.6')").first();
    if (await ee6Btn.count() > 0) {
      await ee6Btn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: "screenshots/ee6-national-public-exam-bank.png" });
      console.log("Captured screenshots/ee6-national-public-exam-bank.png");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1000);
    }

  } catch (err) {
    console.error("Screenshot error:", err);
  } finally {
    await browser.close();
    await db.$disconnect();
    console.log("Screenshot capture complete!");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
