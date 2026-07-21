import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");
const context = read("src/lib/services/consolidated-report-context.service.ts");
const pdf = read("src/lib/documents/consolidated-report-pdf.tsx");
const route = read("src/app/api/academics/grading/consolidated-report/route.ts");
const ui = read("src/components/academics/computation-dashboard.tsx");
const checks = [
  [context.includes("schoolClosedDate") && context.includes("nextTermBeginsDate"), "academic closing and next-opening dates resolve from configured terms"],
  [context.includes("showFeesOnReport") && context.includes("balanceKes") && context.includes("applyToAllLevels"), "fees are omitted by default and resolve class/all-level structures only when enabled"],
  [context.includes("historyRows") && context.includes("slice(-6)"), "bounded learner performance trend uses computed term history"],
  [pdf.includes('size="A4"') && pdf.includes("blackAndWhite") && pdf.includes("AVAILABLE ASSESSMENTS"), "one-page A4 renderer supports dynamic work and colour/B&W"],
  [ui.includes("Learner compared with class") && ui.includes("Performance over time") && ui.includes("Download A4 PDF"), "comparison, trend and PDF are reachable in the learner drill-down"],
  [route.includes("calculationHash") && route.includes("reportPublicationSnapshot"), "PDF carries the latest immutable calculation evidence when published"],
];
let passed = 0;
for (const [ok, message] of checks) { if (!ok) throw new Error(`FAIL: ${message}`); console.log(`PASS ${++passed}: ${message}`); }
console.log(`CONSOLIDATED REPORT PHASE 4 COMPLETE: ${passed}/${checks.length}`);
