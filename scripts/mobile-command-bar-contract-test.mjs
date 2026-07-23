import fs from"node:fs";const r=p=>fs.readFileSync(p,"utf8");const top=r("src/components/shell/topbar.tsx"),layout=r("src/app/(app)/layout.tsx"),v1=r("src/components/shell/app-shell.tsx"),v2=r("src/components/shell/app-shell-v2.tsx"),switcher=r("src/components/shell/school-switcher.tsx");const checks=[
[top.includes("Mobile-only precision bar")&&top.includes("sm:hidden"),"new command bar is mobile-only"],
[(()=>{const bar=top.slice(top.indexOf("Mobile-only precision bar"));return bar.indexOf('aria-label="Open Liquid navigation"')<bar.indexOf("mobileWordmarkUrl")&&bar.indexOf("mobileWordmarkUrl")<bar.indexOf('aria-label="Search NEYO"')})(),"mobile order is menu, NEYO wordmark/account, search"],
[top.includes("rounded-full")&&top.includes("<NotificationBell />"),"notifications live in the circular right-side card"],
[layout.includes('key: "neyo_wordmark_light_url"')&&layout.includes("mobileWordmarkUrl={mobileWordmark?.value"),"active NEYO Ops wordmark drives the mobile logo"],
[switcher.includes("mobileTrigger")&&top.includes("<SchoolSwitcher") ,"parent multi-school switching remains reachable from the logo-chevron card"],
[v1.includes("hidden border-b")&&v2.includes("hidden border-b"),"mobile breadcrumbs are removed while desktop breadcrumbs remain"],
[top.includes("border border-white/70 bg-white/80")&&top.includes("backdrop-blur-xl"),"menu, logo, search and notification controls retain crafted card surfaces"],
];let n=0;for(const[ok,m]of checks){if(!ok)throw Error(`FAIL: ${m}`);console.log(`PASS ${++n}: ${m}`)}console.log(`MOBILE COMMAND BAR: ${n}/${checks.length}`);
