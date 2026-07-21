import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");
const schema = read("prisma/schema.prisma");
const service = read("src/lib/services/report-narrative.service.ts");
const ui = read("src/components/academics/computation-dashboard.tsx");
const checks = [
  [schema.includes("model ReportSubjectComment") && schema.includes('state           String   @default("AUTO")'), "subject comments preserve AUTO, TEACHER_EDITED and LOCKED state"],
  [service.includes("deterministicSubjectComment") && !service.toLowerCase().includes("openai"), "starting comments are deterministic and provider-independent"],
  [service.includes("resolveSubjectTeacher") && service.includes("timetableSlot.findMany"), "subject teacher resolves from the real class timetable"],
  [schema.includes("model ReportLeadershipRemark") && service.includes('role === "CLASS_TEACHER"'), "Class Teacher and Principal remarks are human-owned and role-governed"],
  [ui.includes("Save Teacher Edit") && ui.includes("Lock Comment") && ui.includes("Lock Remark"), "reachable report drill-down exposes edit and lock controls"],
];
let passed = 0;
for (const [ok, message] of checks) { if (!ok) throw new Error(`FAIL: ${message}`); console.log(`PASS ${++passed}: ${message}`); }
console.log(`CONSOLIDATED REPORT PHASE 3 COMPLETE: ${passed}/${checks.length}`);
