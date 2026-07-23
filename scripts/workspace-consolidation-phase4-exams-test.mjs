import fs from"node:fs";const r=p=>fs.readFileSync(p,"utf8");const a=r("src/components/academics/academics-client.tsx"),e=r("src/app/(app)/exams/page.tsx"),n=r("src/lib/core/navigation.ts"),c=r("src/lib/core/commands.ts");const checks=[
[!a.includes('label: "Exam Timetable"')&&!a.includes('label: "Exam Auto-Generator"'),"exam timetable controls removed from Academics navigation"],
[!a.includes('label: "KNEC Candidate Studio"')&&!a.includes('label: "Grading Engine"'),"KNEC and grading controls removed from Academics navigation"],
[e.includes("<ComputationDashboardClient")&&e.includes("<ExamTimetableTab")&&e.includes("<ExamAutoGeneratorTab")&&e.includes("<KnecCandidateStudio"),"Exams owns grading, timetable, generator and KNEC workspaces"],
[e.includes('id="grading"')&&n.includes('/exams#grading')&&c.includes('/exams#grading'),"Grading deep links now reach Exams"],
[a.includes("export function ExamTimetableTab")&&a.includes("export function ExamAutoGeneratorTab"),"existing full workflows are reused rather than copied"],
];let x=0;for(const[ok,m]of checks){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++x}: ${m}`)}console.log(`EXAMS CONSOLIDATION: ${x}/${checks.length}`);
