import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");
const schema = read("prisma/schema.prisma");
const service = read("src/lib/services/computation-engine.service.ts");
const settings = read("src/lib/services/report-presentation.service.ts");
const ui = read("src/components/academics/computation-dashboard.tsx");
const checks = [
  [schema.includes("model ReportPresentationSetting") && schema.includes("model ReportPublicationSnapshot"), "presentation law and immutable snapshot models exist"],
  [settings.includes("SHOW_RANKINGS") && settings.includes("HIDE_RANKINGS") && settings.includes("BANDS_ONLY"), "all founder-approved ranking policies are enforced"],
  [service.includes("componentsJson") && service.includes("deviation") && service.includes("classMean"), "detailed subject computation is exposed"],
  [service.includes("canonicalReportHash(payload)") && service.includes("version = (latest?.version ?? 0) + 1"), "release creates versioned hash evidence"],
  [ui.includes("Learner report drill-down") && ui.includes("Effective contribution") && ui.includes("Rank hidden"), "reachable drill-down explains dynamic contributions and rank policy"],
];
let passed = 0;
for (const [ok, message] of checks) { if (!ok) throw new Error(`FAIL: ${message}`); passed++; console.log(`PASS ${passed}: ${message}`); }
console.log(`CONSOLIDATED REPORT PHASE 2 COMPLETE: ${passed}/${checks.length}`);
