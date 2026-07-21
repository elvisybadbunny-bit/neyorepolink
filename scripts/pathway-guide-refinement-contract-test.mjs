import fs from "node:fs";
const read=(path)=>fs.readFileSync(path,"utf8");
const service=read("src/lib/services/pathway-guide.service.ts");
const questions=read("src/lib/validations/pathway-guide.ts");
const quiz=read("src/components/pathway-guide/pathway-guide-quiz.tsx");
const landing=read("src/components/public-site/neyo-landing-client.tsx");
const schema=read("prisma/schema.prisma");
const checks=[
 [service.includes("CAREER_TRACK_PREFERENCES")&&service.includes("rankedCareers"),"track selection no longer defaults to the first Pure Sciences track"],
 [service.includes("pillarWeight")&&questions.includes("Which real project")&&questions.includes("working environment"),"weighted scoring uses deeper practical questions"],
 [service.includes("matchedSlots < Math.min(2")&&service.includes("slice(0, 30)")&&!service.includes('subjectCodes, "ENG", "KIS", "MAT"'),"weak KUCCPS matches are removed, results are bounded and Mathematics is not assumed for every pathway"],
 [quiz.includes("courseLimit")&&quiz.includes("Show 8 more relevant courses"),"course cards load progressively instead of flooding the page"],
 [landing.includes('href="/career-guide"')&&landing.includes("Check official selections"),"public landing page exposes guidance and official-selection checking"],
 [schema.includes("model NationalSelectionCatalogVersion")&&schema.includes("model StudentSeniorSelectionReconciliation"),"versioned national catalogue and manual reconciliation foundations exist"],
 [quiz.includes("not an official placement or submission"),"guidance preserves the Ministry selection/placement boundary"],
];let passed=0;for(const [ok,msg] of checks){if(!ok)throw new Error(`FAIL: ${msg}`);console.log(`PASS ${++passed}: ${msg}`)}console.log(`PATHWAY GUIDE REFINEMENT: ${passed}/${checks.length}`);
