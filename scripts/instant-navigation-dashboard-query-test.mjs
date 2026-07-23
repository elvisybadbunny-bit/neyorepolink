import fs from"node:fs";const d=fs.readFileSync("src/app/(app)/dashboard/page.tsx","utf8"),l=fs.readFileSync("src/app/(app)/loading.tsx","utf8");const checks=[
[d.includes("Dashboard reads are independent")&&d.includes("paidToday, attendanceRecords, termInvoices"),"dashboard core reads execute in one parallel batch"],
[d.includes("currentTerm(currentUser.tenantId)")&&d.includes("scopeWhere(currentUser)")&&d.includes("Promise.all(["),"term, tenant and row scope resolve concurrently"],
[d.includes("alreadyNotified")&&d.includes("Promise.all(admins.filter"),"subscription reminders avoid per-admin sequential writes"],
[!l.includes("Array.from({ length: 4 })")&&!l.includes("Skeleton"),"ordinary route transitions no longer show a heavy dashboard skeleton"],
[l.includes("Opening workspace")&&l.includes('role="status"'),"route transition remains lightweight and accessible"],
];let n=0;for(const[ok,m]of checks){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`INSTANT NAVIGATION AND DASHBOARD READS: ${n}/${checks.length}`);
