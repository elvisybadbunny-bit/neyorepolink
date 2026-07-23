import fs from "node:fs";
const read=(p)=>fs.readFileSync(p,"utf8");
const attempt=read("src/app/api/academics/question-bank/attempt/route.ts");
const guide=read("src/components/pathway-guide/pathway-guide-quiz.tsx");
const videos=read("src/components/learning-videos/learning-videos-client.tsx");
const videoApi=read("src/app/api/learning-videos/route.ts");
const cbe=read("src/components/cbc/cbc-client.tsx");
const checks=[
 [(attempt.match(/await req\.json\(\)/g)||[]).length===1,"question Check Answer consumes its request body once"],
 [guide.includes('isPublic ? `${apiBase}/glimpse` : apiBase')&&guide.includes('action: "glimpse"'),"signed-in and public KUCCPS glimpse use their real routes"],
 [guide.includes("setGlimpse([])")&&guide.includes("setMatched([])"),"KUCCPS failures stop loading instead of spinning forever"],
 [videos.includes("Save to school")&&videos.includes("Submit to NEYO bank"),"single video search offers school save and national-review submission"],
 [videoApi.includes('"submit-national"')&&videoApi.includes('scope: "NATIONAL"'),"national submission enters governed review instead of direct publication"],
 [!cbe.includes("KICD {s.code}")&&!cbe.includes("const presetable"),"individual KICD subject preset buttons no longer clutter CBE strands"],
];let passed=0;for(const[ok,msg]of checks){if(!ok)throw new Error(`FAIL: ${msg}`);console.log(`PASS ${++passed}: ${msg}`)}console.log(`CRITICAL WORKSPACE FIXES: ${passed}/${checks.length}`);
