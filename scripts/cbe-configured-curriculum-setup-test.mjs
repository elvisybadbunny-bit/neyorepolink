import fs from"node:fs";const r=p=>fs.readFileSync(p,"utf8");const service=r("src/lib/services/cbc.service.ts"),route=r("src/app/api/cbc/strands/route.ts"),ui=r("src/components/cbc/cbc-client.tsx");const checks=[
[service.includes("setupConfiguredSchoolCurriculum")&&service.includes("classSubjectNeed.findMany"),"setup reads configured class-subject requirements"],
[service.includes("PRIMARY_SCHOOL_CURRICULUM")&&service.includes("JUNIOR_SCHOOL_CURRICULUM_PART2")&&service.includes("SENIOR_SCHOOL_CURRICULUM"),"setup covers configured PP/Primary, Junior and Senior grades"],
[service.includes("applyJuniorSchoolCurriculumPreset")&&service.includes("configured.set"),"one idempotent preset path creates strands/sub-strands without duplicate pairs"],
[route.includes('action === "setup-configured-school"'),"one protected API action prepares the school curriculum"],
[ui.includes("Prepare all configured grades & subjects")&&ui.includes("showManualPresetBrowsers = false"),"CBE shows one setup action and hides repetitive manual preset browsers"],
];let n=0;for(const[ok,m]of checks){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`CONFIGURED CBE CURRICULUM SETUP: ${n}/${checks.length}`);
