import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await page.evaluate(async () => {
    await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "principal@uwezoschool.ac.ke", password: "Uwezo2026!" }),
    });
  });

  const classId = "cmre9vwsn005mwvgxcbf5gbi9"; // Grade 7 Amani
  await page.goto(`${BASE}/print/timetable?classId=${classId}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(500);

  fs.mkdirSync("pdfs/uwezo/classes", { recursive: true });
  await page.pdf({
    path: "pdfs/uwezo/classes/Grade_7_Amani.pdf",
    format: "A4",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
    preferCSSPageSize: true,
  });
  console.log("PDF written:", fs.statSync("pdfs/uwezo/classes/Grade_7_Amani.pdf").size, "bytes");

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
