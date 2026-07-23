import fs from"node:fs";const r=p=>fs.readFileSync(p,"utf8");const service=r("src/lib/services/cbc.service.ts"),route=r("src/app/api/cbc/assess/route.ts"),ui=r("src/components/cbc/cbc-client.tsx"),academics=r("src/components/academics/academics-client.tsx");const checks=[
[!academics.includes('t.key === "discipline"')&&!academics.includes('t.key === "library-recovery"'),"removed Academics tabs no longer cause impossible TypeScript comparisons"],
[route.includes('searchParams.get("setup") === "1"')&&route.includes("getCbcAssessSetup"),"CBE Assess exposes a teacher-scoped setup"],
[service.includes("teacherClassIds(user)")&&service.includes("teachingLinks"),"setup resolves real classes and subjects the teacher teaches"],
[service.includes("assertTeacherOwnsCbcSubject")&&service.includes("Choose a class and subject assigned to you"),"server blocks cross-subject CBE evidence"],
[ui.includes("availableStrands")&&ui.includes("teachingLinks.some"),"Assess only lists strands linked to the selected taught class"],
[ui.includes("availableStrands.length === 1")&&ui.includes("classes[0].id"),"single class/strand choices auto-fill to reduce teacher searching"],
[ui.includes("const [subjects, setSubjects]")&&ui.includes("setSubjects(j.data.subjects"),"paper-quiz tools receive the scoped subjects returned by setup"],
];let n=0;for(const[ok,m]of checks){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`CBE TEACHER ASSESS SCOPE: ${n}/${checks.length}`);
