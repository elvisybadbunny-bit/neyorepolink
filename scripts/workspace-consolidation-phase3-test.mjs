import fs from"node:fs";const r=p=>fs.readFileSync(p,"utf8");const a=r("src/components/academics/academics-client.tsx"),d=r("src/app/(app)/discipline/page.tsx"),l=r("src/app/(app)/library/page.tsx"),s=r("src/app/(app)/syllabus/page.tsx");const c=[
[!a.includes('label: "Discipline & Summons"')&&d.includes("<DisciplineSuite />"),"discipline/summons moved to Discipline"],
[!a.includes('label: "Textbook Fines"')&&l.includes("<TextbookFineSuite />"),"textbook fines moved to Library"],
[!a.includes('label: "Record of Work"')&&s.includes("<RecordOfWorkClientTab"),"Record of Work moved to Syllabus"],
[s.includes('permissions.includes("academics.manage")'),"Syllabus preserves Record of Work write permission"],
];let n=0;for(const[ok,m]of c){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`WORKSPACE CONSOLIDATION PHASE 3: ${n}/${c.length}`);
