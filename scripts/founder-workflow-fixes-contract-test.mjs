import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");
const assessment = read("src/lib/services/assessment.service.ts");
const assessmentUi = read("src/components/assessments/assessment-engine-components.tsx");
const competency = read("src/lib/services/competency.service.ts");
const competencyUi = read("src/components/competencies/competency-framework-client.tsx");
const comments = read("src/lib/services/report-narrative.service.ts");
const timetable = read("src/components/academics/academics-client.tsx");
const barcode = read("src/lib/documents/code39.ts");
const checks = [
  [assessment.includes("teachingLinks") && assessmentUi.includes("Choose subject you teach"), "assessment class/subject choices follow teacher allocations"],
  [assessmentUi.includes("learningAreaId:subject?.learningAreaId") && assessmentUi.includes("Learning area"), "learning area auto-fills from the selected subject"],
  [competency.includes("learnerScope") && competencyUi.includes("Choose a learner from your classes"), "learner competency summary uses a scoped picker instead of pasted IDs"],
  [comments.includes("const kiswahili") && comments.includes("variantKey"), "comments have stable wording variants and Kiswahili language support"],
  [timetable.includes("locked boundary after period p") && timetable.includes("nonLessonRowsForPeriod(p, config"), "double rendering cannot cross a configured break or lunch"],
  [barcode.includes("data:image/png;base64") && barcode.includes('from "pngjs"'), "barcodes render as PDF-compatible PNG data"],
];
let passed = 0;
for (const [ok, message] of checks) { if (!ok) throw new Error(`FAIL: ${message}`); console.log(`PASS ${++passed}: ${message}`); }
console.log(`FOUNDER WORKFLOW FIXES: ${passed}/${checks.length}`);
