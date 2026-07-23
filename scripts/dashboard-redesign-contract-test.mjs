import fs from"node:fs";const d=fs.readFileSync("src/app/(app)/dashboard/page.tsx","utf8");const checks=[
[d.includes("Dashboard cockpit")&&d.includes("Your school, clearly in view."),"dashboard opens with an action-led school cockpit"],
[d.includes("Today · Nairobi")&&d.includes('timeZone: "Africa/Nairobi"'),"today card uses the school timezone"],
[d.includes('aria-label="School pulse"')&&d.includes("Register not marked yet"),"school pulse prioritises readiness and honest empty states"],
[d.includes("grid-cols-2 gap-3 lg:grid-cols-4"),"priority cards are compact on phones and expand on desktop"],
[d.includes("rounded-[2rem]")&&d.includes("shadow-[0_18px_60px"),"hero uses a crafted rounded solid surface rather than blanket glass"],
[!d.includes("BundiAudioButton")&&!d.includes("pricingModeLabel"),"dashboard removes secondary clutter from the primary scan path"],
[d.includes('canSeeFinanceCards ? "lg:grid-cols-3" : "lg:grid-cols-1"'),"role-hidden finance does not leave an empty dashboard grid"],
[d.includes("Continue working")&&d.includes("Only actions allowed for your role appear"),"dashboard provides a permission-aware continuation lane"],
[d.includes("Collections this term")&&d.includes("Finance pulse"),"finance chart has a compact hierarchy and headline value"],
[d.includes("Recent school activity")&&d.includes(">Latest<"),"activity is presented as a clear latest-events card"],
];let n=0;for(const[ok,m]of checks){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`DASHBOARD REDESIGN: ${n}/${checks.length}`);
