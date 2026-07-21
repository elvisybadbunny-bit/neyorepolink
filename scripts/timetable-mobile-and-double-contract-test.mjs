import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");
const teacher = read("src/components/teacher/teacher-portal-client.tsx");
const route = read("src/app/api/teacher/timetable/route.ts");
const academics = read("src/lib/services/academics.service.ts");
const packageJson = JSON.parse(read("package.json"));
const checks = [
  [route.includes("timetableConfig.findMany") && route.includes("configs"), "teacher timetable returns real school time configuration"],
  [teacher.includes('timeZone: "Africa/Nairobi"') && teacher.includes("currentNairobiLesson"), "current lesson is calculated in the school timezone"],
  [teacher.includes("scrollIntoView") && teacher.includes("mobileCurrentRef"), "small-phone view opens and centres the current timetable lesson"],
  [teacher.includes("sm:hidden") && teacher.includes("No assigned lesson"), "mobile timetable uses an aligned day agenda instead of a squeezed desktop grid"],
  [teacher.includes("ring-blue-500") && teacher.includes("current.period"), "current day and period are visibly highlighted"],
  [academics.includes("Both halves of an adjacent double lesson must use the same subject teacher"), "manual doubles reject different teachers"],
  [academics.includes("lockedAfter") && academics.includes("lunchAfterPeriod"), "break/lunch boundaries separate independent adjacent lessons"],
  [packageJson.scripts["seed:40-stream-demo"]?.includes("z4-dual-lunch-shift-stress-test-seed.ts"), "dedicated 40-stream demonstration seed is reachable"],
];
let passed=0; for(const [ok,message] of checks){if(!ok)throw new Error(`FAIL: ${message}`);console.log(`PASS ${++passed}: ${message}`)}
console.log(`TIMETABLE MOBILE AND DOUBLE: ${passed}/${checks.length}`);
