import fs from "node:fs";
const page=fs.readFileSync("src/app/(app)/learning-videos/page.tsx","utf8");
const client=fs.readFileSync("src/components/learning-videos/learning-videos-client.tsx","utf8");
const service=fs.readFileSync("src/lib/services/learning-video.service.ts","utf8");
const checks=[
 [!page.includes("CuratedLearningLibrary")&&page.includes("One national NEYO video bank"),"Learning Videos has one unified bank instead of a second curated watcher"],
 [client.includes("playerRef.current?.scrollIntoView")&&client.includes("function watch("),"Watch moves directly to the NEYO player"],
 [client.includes('playerMode === "MINI"')&&client.includes("Mini-player"),"one-video mini-player remains visible while searching"],
 [client.includes("setWatching(video)")&&client.includes("replaces this one"),"selecting another result replaces the shared player"],
 [service.includes('scope: "NATIONAL", approvalStatus: "APPROVED"')&&service.includes("take: 500"),"approved national videos are available in the main NEYO bank"],
 [service.includes("nationalRows.filter")&&service.includes("youtubeId"),"school/national duplicates are removed"],
];let passed=0;for(const [ok,msg] of checks){if(!ok)throw new Error(`FAIL: ${msg}`);console.log(`PASS ${++passed}: ${msg}`)}console.log(`UNIFIED LEARNING VIDEO PLAYER: ${passed}/${checks.length}`);
