import fs from"node:fs";const s=fs.readFileSync("src/components/syllabus/syllabus-client.tsx","utf8");const block=s.slice(s.indexOf("async function update"),s.indexOf("if (!board)"));const checks=[
[s.includes("function applyStatus")&&s.includes("coveragePct"),"syllabus status and metrics update locally"],
[!block.includes("load();"),"ordinary status updates do not refetch the whole syllabus board"],
[block.includes("applyStatus(id, previous)")&&block.includes("previous syllabus status was restored"),"failed updates roll back safely"],
[s.includes("updatingId === t.id"),"only the row being reconciled shows a busy state"],
];let n=0;for(const[ok,m]of checks){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`INSTANT SYLLABUS STATUS: ${n}/${checks.length}`);
