import fs from "node:fs";
const config=fs.readFileSync("next.config.mjs","utf8");
const search=fs.readFileSync("src/lib/services/youtube-learning.service.ts","utf8");
const learning=fs.readFileSync("src/lib/services/learning-video.service.ts","utf8");
const ui=fs.readFileSync("src/components/learning-videos/learning-videos-client.tsx","utf8");
const checks=[
 [config.includes("frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com"),"CSP permits privacy-enhanced YouTube frames"],
 [search.includes("videoEmbeddable=true")&&search.includes("safeSearch=strict"),"academic live search requests safe embeddable videos"],
 [learning.includes('url.searchParams.set("videoEmbeddable", "true")'),"Learning Videos search requests embeddable results"],
 [ui.includes("Open on YouTube")&&ui.includes("owner later blocks embedding"),"player offers an honest fallback when a video owner changes embed policy"],
];let passed=0;for(const [ok,msg] of checks){if(!ok)throw new Error(`FAIL: ${msg}`);console.log(`PASS ${++passed}: ${msg}`)}console.log(`YOUTUBE EMBED PLAYBACK: ${passed}/${checks.length}`);
