import fs from"node:fs";const r=p=>fs.readFileSync(p,"utf8");const q=r("src/components/academics/question-bank-modal.tsx"),c=r("src/components/cbc/cbc-client.tsx");const checks=[
[q.includes("embedded?: boolean")&&q.includes("QuestionBankSurface"),"Question Bank supports a real inline surface"],
[q.includes('embedded ? <section className={className}>'),"embedded mode renders in page flow rather than a dialog portal"],
[c.includes("Question Bank & Book Scan")&&c.includes("embedded subjects={subjects}"),"CBE places Question Bank and Book Scan directly after strands"],
[!c.includes("questionBankModalOpen")&&!c.includes("setQuestionBankModalOpen"),"old Question Bank popup state is removed"],
[!c.includes("> Practice\n")||!c.includes("activeQuestionStrandId"),"per-strand popup buttons no longer duplicate the inline bank"],
];let n=0;for(const[ok,m]of checks){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`INLINE QUESTION BANK: ${n}/${checks.length}`);
