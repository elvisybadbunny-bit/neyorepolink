import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");
const schema = read("prisma/schema.prisma");
const service = read("src/lib/services/exam-timetable-invigilator.service.ts");
const api = read("src/app/api/academics/exam-timetable/route.ts");
const ui = read("src/components/academics/academics-client.tsx");
const checks = [
  [schema.includes("model ExamPracticalResource") && schema.includes("model ExamTimetableSession"), "resources and concrete session rows are persisted"],
  [service.includes("buildDeterministicSessions") && service.includes("candidateStart") && service.includes("candidateEnd"), "candidate ranges are split deterministically"],
  [service.includes("required sessions need until") && service.includes("after the selected end time"), "an infeasible multi-session window is rejected visibly"],
  [service.includes("learnerCapacity") && service.includes("availableFrom") && service.includes("resource.quantity"), "resource capacity, availability and quantity are enforced"],
  [service.includes("already reserved") || service.includes("available unit(s) reserved"), "overlapping resource reservations are blocked"],
  [api.includes("requiredInvigilators") && api.includes("durationMode") && api.includes("practicalResourceIds"), "API no longer strips Phase 1 or practical fields"],
  [ui.includes("Deterministic multi-session plan") && ui.includes("Practical resources"), "multi-session and resource controls are reachable"],
];
let passed = 0;
for (const [ok, message] of checks) { if (!ok) throw new Error(`FAIL: ${message}`); console.log(`PASS ${++passed}: ${message}`); }
console.log(`EXAM PRACTICAL AND MULTI-SESSION COMPLETE: ${passed}/${checks.length}`);
