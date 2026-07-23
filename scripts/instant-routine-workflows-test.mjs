import fs from"node:fs";const r=p=>fs.readFileSync(p,"utf8");const a=r("src/components/attendance/attendance-client.tsx"),c=r("src/components/cbc/cbc-client.tsx");const checks=[
[a.includes("registerCache")&&a.includes("initialData={registerCache"),"reopened attendance registers paint from cache"],
[a.includes("applySavedRegister")&&!a.slice(a.indexOf("async function save()"),a.indexOf("const counts")).includes("load();"),"attendance save updates locally without refetching the register"],
[a.includes("Saved offline")&&a.includes("onCache(updated)"),"offline attendance uses the same immediate local state"],
[c.includes("applySavedRound")&&!c.slice(c.indexOf("function applySavedRound"),c.indexOf("const marked",c.indexOf("function applySavedRound"))).includes("loadSheet();"),"CBE saves no longer blank and reload the learner sheet"],
[c.includes("setStudents((rows)")&&c.includes("latest: { level, date"),"saved CBE levels update learner history immediately"],
];let n=0;for(const[ok,m]of checks){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`INSTANT ROUTINE WORKFLOWS: ${n}/${checks.length}`);
