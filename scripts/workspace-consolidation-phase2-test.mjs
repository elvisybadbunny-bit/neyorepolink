import fs from "node:fs";const read=p=>fs.readFileSync(p,"utf8");
const academics=read("src/components/academics/academics-client.tsx");const analytics=read("src/components/exams/advanced-analytics-client.tsx");
const checks=[
 [academics.includes('label: "Subjects & Departments"')&&!academics.includes('label: "Departments"'),"Academics has one Subjects & Departments destination"],
 [academics.includes('<SubjectsTab canManage={canManage} /><div')&&academics.includes('<DepartmentsTab canManage='),"subjects and departments render in one workspace"],
 [analytics.includes("data.competencyGaps?.overall")&&analytics.includes("const list ="),"advanced analytics tolerates partial/older payloads"],
 [analytics.includes("const wellbeing = data.wellbeingIndicators ??"),"advanced analytics has safe wellbeing defaults"],
];let n=0;for(const[ok,m]of checks){if(!ok)throw new Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`WORKSPACE CONSOLIDATION PHASE 2: ${n}/${checks.length}`);
