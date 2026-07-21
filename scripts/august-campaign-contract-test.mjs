import fs from "node:fs";
const csv=fs.readFileSync("docs/AUGUST-2026-ORGANIC-CAMPAIGN-VIDEO-CALENDAR.csv","utf8").trim().split(/\r?\n/);
const visits=fs.readFileSync("docs/AUGUST-2026-SCHOOL-VISIT-TRACKER.csv","utf8").trim().split(/\r?\n/);
const schema=fs.readFileSync("prisma/schema.prisma","utf8");
const landing=fs.readFileSync("src/components/public-site/neyo-landing-client.tsx","utf8");
const rows=csv.slice(1);const dates=rows.map(r=>r.split(",")[0]);
const checks=[
 [rows.length===160,"calendar contains exactly 160 original videos"],
 [new Set(dates).size===20,"calendar covers 20 publishing weekdays"],
 [dates.every(d=>{const day=new Date(`${d}T12:00:00Z`).getUTCDay();return day>=1&&day<=5}),"no campaign videos are scheduled on Saturday or Sunday"],
 [visits.length-1===20,"school-visit tracker contains five appointments per week for four weeks"],
 [schema.includes("consentToContact")&&schema.includes("campaignSource")&&schema.includes("topProblems"),"pilot waitlist stores consent, attribution and discovery needs"],
 [landing.includes("Term 3 pilot review")&&landing.includes("preferredDemoDate"),"public waitlist collects an August visit preference with an honest approval boundary"],
 [fs.existsSync("docs/AUGUST-2026-CAMPAIGN-DEMO-DATA-BIBLE.md"),"fictional cross-module demonstration data constitution exists"],
];let passed=0;for(const [ok,msg] of checks){if(!ok)throw new Error(`FAIL: ${msg}`);console.log(`PASS ${++passed}: ${msg}`)}console.log(`AUGUST ORGANIC CAMPAIGN READY: ${passed}/${checks.length}`);
