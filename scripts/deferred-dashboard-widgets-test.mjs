import fs from"node:fs";const page=fs.readFileSync("src/app/(app)/dashboard/page.tsx","utf8"),deferred=fs.readFileSync("src/components/dashboard/deferred-dashboard-section.tsx","utf8");const checks=[
[deferred.includes("IntersectionObserver")&&deferred.includes('rootMargin: "240px 0px"'),"secondary widgets mount shortly before entering view"],
[page.includes('label="Intercom"')&&page.includes("<DashboardIntercomClient"),"Intercom polling is deferred below the primary dashboard"],
[page.includes('label="Offline and data saver"')&&page.includes("<PwaDataSaverCard"),"offline widget is deferred"],
[page.includes('label="Latest school activity"')&&page.includes("<ActivityFeed"),"activity feed network work is deferred"],
[page.includes('label="Delegation controls"')&&page.includes("<PrincipalDelegationCard"),"leadership delegation loads only near view"],
[deferred.includes('role="status"')&&deferred.includes("will open as it comes into view"),"deferred sections retain an accessible lightweight placeholder"],
];let n=0;for(const[ok,m]of checks){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`DEFERRED DASHBOARD WIDGETS: ${n}/${checks.length}`);
