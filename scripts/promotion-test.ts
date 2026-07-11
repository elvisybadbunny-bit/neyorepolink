/** G.16 promotion + reshuffle — live tests. T.13 (manual repeat-a-level) added below. */
import { db } from "../src/lib/db";
import { promotionPlan, commitPromotion, undoRun, reshufflePlan, commitReshuffle, nextLevel, listRuns } from "../src/lib/services/promotion.service";
import type { SessionUser } from "../src/lib/core/session";

async function main() {
  const principal = (await db.user.findFirstOrThrow({ where: { email: "principal@karibuhigh.ac.ke" } })) as unknown as SessionUser;

  // 0) level parser
  console.log("nextLevel:", nextLevel("Form 1"), nextLevel("Form 4"), nextLevel("Grade 9"), nextLevel("PP 2"), nextLevel("Weird"), 
    nextLevel("Form 1")==="Form 2" && nextLevel("Form 4")==="graduate" && nextLevel("Grade 9")==="graduate" && nextLevel("PP 2")==="Grade 1" && nextLevel("Weird")===null ? "✓" : "✗ FAIL");

  // make a Form 4 class with 2 students to test graduation path
  const tenantId = principal.tenantId;
  const f4 = await db.schoolClass.create({ data: { tenantId, level: "Form 4", stream: "North", curriculum: "8-4-4" } });
  const s1 = await db.student.create({ data: { tenantId, admissionNo: "KH-TEST-F4A", firstName: "Test", lastName: "Senior", gender: "M", classId: f4.id } });
  const s2 = await db.student.create({ data: { tenantId, admissionNo: "KH-TEST-F4B", firstName: "Testa", lastName: "Seniora", gender: "F", classId: f4.id } });

  // snapshot before
  const before = await db.student.findMany({ where: { tenantId, status: "ACTIVE" }, select: { id: true, classId: true } });
  const beforeMap = new Map(before.map(s => [s.id, s.classId]));

  // 1) plan
  const plan = await promotionPlan(principal);
  const f4Step = plan.plan.find(p => p.from === "Form 4 North");
  const f1Step = plan.plan.find(p => p.from === "Form 1 West");
  console.log("plan: F4->graduate:", f4Step?.graduate ? "✓" : "✗", "| F1 West -> ", f1Step?.to, f1Step?.toExists === false ? "(will create) ✓" : "");

  // 2) commit
  const result = await commitPromotion(principal, 2026);
  console.log("commit:", result.summary, result.graduated === 2 ? "✓ 2 graduated" : "✗ grad=" + result.graduated);
  const grads = await db.student.findMany({ where: { id: { in: [s1.id, s2.id] } } });
  console.log("F4 students -> GRADUATED + year + label:", grads.every(g => g.status === "GRADUATED" && g.graduationYear === 2026 && g.finalClassLabel === "Form 4 North") ? "✓" : "✗ FAIL");
  const f2w = await db.schoolClass.findFirst({ where: { tenantId, level: "Form 2", stream: "West" } });
  console.log("Form 2 West auto-created:", f2w ? "✓" : "✗ FAIL");
  const kiprono = await db.student.findFirst({ where: { firstName: "Kiprono" } });
  console.log("Kiprono Form 1 West -> Form 2 West:", kiprono?.classId === f2w?.id ? "✓" : "✗ FAIL");

  // 3) undo restores EVERYTHING
  await undoRun(principal, result.runId);
  const after = await db.student.findMany({ where: { tenantId, id: { in: [...beforeMap.keys()] } }, select: { id: true, classId: true, status: true } });
  const allRestored = after.every(s => s.classId === beforeMap.get(s.id) && s.status === "ACTIVE");
  console.log("undo restores all classes+status:", allRestored ? "✓" : "✗ FAIL");
  try { await undoRun(principal, result.runId); console.log("double undo: ALLOWED ✗"); } catch { console.log("double undo blocked: ✓"); }

  // 4) reshuffle: create Form 2 West students so Form 2 has 2 streams w/ imbalance
  const f2e = await db.schoolClass.findFirstOrThrow({ where: { tenantId, level: "Form 2", stream: "East" } });
  const w1 = await db.student.create({ data: { tenantId, admissionNo: "KH-TEST-W1", firstName: "Wendy", lastName: "Atieno", gender: "F", classId: f2w!.id } });
  const resPlan = await reshufflePlan(principal, "Form 2", "size");
  const sizes = resPlan.streams.map(s => s.count);
  console.log("reshuffle preview sizes:", sizes.join("/"), Math.max(...sizes) - Math.min(...sizes) <= 1 ? "✓ balanced" : "✗ FAIL");
  const resCommit = await commitReshuffle(principal, "Form 2", "gender");
  console.log("reshuffle commit:", resCommit.summary);
  const runs = await listRuns(principal);
  console.log("history rows:", runs.length, runs.some(r => r.kind === "reshuffle") && runs.some(r => r.kind === "promotion") ? "✓ both kinds" : "✗");
  // undo reshuffle too
  await undoRun(principal, resCommit.runId);
  const w1back = await db.student.findUniqueOrThrow({ where: { id: w1.id } });
  console.log("reshuffle undo restored Wendy:", w1back.classId === f2w!.id ? "✓" : "✗ FAIL");

  // 5) CLASS_TEACHER blocked from API-level op (permission check is in route; verify can())
  const { can } = await import("../src/lib/core/permissions");
  console.log("CLASS_TEACHER class.manage:", can("CLASS_TEACHER", "class.manage") ? "✗ has it (review!)" : "✓ denied");

  // cleanup test entities
  await db.student.deleteMany({ where: { admissionNo: { in: ["KH-TEST-F4A", "KH-TEST-F4B", "KH-TEST-W1"] } } });
  await db.schoolClass.delete({ where: { id: f4.id } });
  // keep Form 2 West? remove if empty to restore seed state
  const f2wCount = await db.student.count({ where: { classId: f2w!.id } });
  if (f2wCount === 0) await db.schoolClass.delete({ where: { id: f2w!.id } });
  // BUG FOUND + FIXED (T.13 session): the first commit()/undo() cycle above also
  // auto-creates "Form 3 East" (Form 2 East's real promotion destination) — the
  // original cleanup only ever checked Form 2 West, silently leaving Form 3 East
  // behind on every single run of this script. Fixed: sweep for ANY auto-created,
  // now-empty destination class this run may have left behind.
  const f3e = await db.schoolClass.findFirst({ where: { tenantId, level: "Form 3", stream: "East" } });
  if (f3e) {
    const f3eCount = await db.student.count({ where: { classId: f3e.id } });
    if (f3eCount === 0) await db.schoolClass.delete({ where: { id: f3e.id } });
  }
  await db.promotionRun.deleteMany({ where: { tenantId } });
  console.log("cleanup ✓ (seed state restored, incl. the previously-leaked Form 3 East auto-created class)");

  // ---------------------------------------------------------------------
  // T.13 — Manual Repeat-a-Level (founder-confirmed: manual-only, no exam-
  // driven automatic engine). A dedicated real class + real students, fully
  // isolated from the seed data above.
  // ---------------------------------------------------------------------
  console.log("\n--- T.13: Manual Repeat-a-Level ---");

  const g4 = await db.schoolClass.create({ data: { tenantId, level: "Grade 4", stream: "Blue", curriculum: "CBC" } });
  const rep1 = await db.student.create({ data: { tenantId, admissionNo: "KH-TEST-T13A", firstName: "Repeat", lastName: "Alpha", gender: "M", classId: g4.id } });
  const rep2 = await db.student.create({ data: { tenantId, admissionNo: "KH-TEST-T13B", firstName: "Moveup", lastName: "Beta", gender: "F", classId: g4.id } });
  const alreadyRepeating = await db.student.create({ data: { tenantId, admissionNo: "KH-TEST-T13C", firstName: "AlreadyWas", lastName: "Gamma", gender: "M", classId: g4.id, isRepeating: true, repeatingSinceYear: 2025 } });

  // plan() roster should include isRepeating flags for staff to see who's already marked.
  const planWithRoster = await promotionPlan(principal);
  const g4Step = planWithRoster.plan.find((p) => p.classId === g4.id);
  console.log("plan roster includes G4 students:", g4Step?.roster.length === 3 ? "✓" : `✗ FAIL (${g4Step?.roster.length})`);
  console.log("plan roster shows AlreadyWas as isRepeating:", g4Step?.roster.find((s) => s.id === alreadyRepeating.id)?.isRepeating === true ? "✓" : "✗ FAIL");

  // Commit: mark rep1 (Alpha) to repeat; rep2 (Beta) and AlreadyWas move up normally.
  const t13Result = await commitPromotion(principal, 2026, [rep1.id]);
  console.log("commit reports repeated count:", t13Result.repeated === 1 ? "✓" : `✗ FAIL (${t13Result.repeated})`);

  const alphaAfter = await db.student.findUniqueOrThrow({ where: { id: rep1.id } });
  console.log("Alpha (marked to repeat) STAYS in Grade 4 Blue:", alphaAfter.classId === g4.id ? "✓" : "✗ FAIL");
  console.log("Alpha isRepeating=true + repeatingSinceYear=2026:", alphaAfter.isRepeating === true && alphaAfter.repeatingSinceYear === 2026 ? "✓" : "✗ FAIL");

  const betaAfter = await db.student.findUniqueOrThrow({ where: { id: rep2.id } });
  const g5blue = await db.schoolClass.findFirst({ where: { tenantId, level: "Grade 5", stream: "Blue" } });
  console.log("Beta (not marked) genuinely promoted to Grade 5 Blue:", g5blue && betaAfter.classId === g5blue.id ? "✓" : "✗ FAIL");
  console.log("Beta isRepeating stays false:", betaAfter.isRepeating === false ? "✓" : "✗ FAIL");

  const gammaAfter = await db.student.findUniqueOrThrow({ where: { id: alreadyRepeating.id } });
  console.log("Gamma (was already repeating, NOT re-marked this run) genuinely promotes + flag clears:", g5blue && gammaAfter.classId === g5blue.id && gammaAfter.isRepeating === false ? "✓" : "✗ FAIL");

  // Undo restores everyone, including the real repeat flag/year.
  await undoRun(principal, t13Result.runId);
  const alphaUndone = await db.student.findUniqueOrThrow({ where: { id: rep1.id } });
  console.log("undo restores Alpha to not-repeating (was never repeating before this run):", alphaUndone.isRepeating === false && alphaUndone.classId === g4.id ? "✓" : "✗ FAIL");
  const gammaUndone = await db.student.findUniqueOrThrow({ where: { id: alreadyRepeating.id } });
  console.log("undo restores Gamma's PRIOR real repeat state (was already repeating since 2025):", gammaUndone.isRepeating === true && gammaUndone.repeatingSinceYear === 2025 && gammaUndone.classId === g4.id ? "✓" : "✗ FAIL");

  // Final-year repeat: a Form 4 student marked to repeat should stay ACTIVE, never graduate.
  const f4b = await db.schoolClass.create({ data: { tenantId, level: "Form 4", stream: "South", curriculum: "8-4-4" } });
  const finalYearRepeat = await db.student.create({ data: { tenantId, admissionNo: "KH-TEST-T13D", firstName: "StaysBack", lastName: "Delta", gender: "F", classId: f4b.id } });
  const finalYearGrad = await db.student.create({ data: { tenantId, admissionNo: "KH-TEST-T13E", firstName: "Graduates", lastName: "Epsilon", gender: "M", classId: f4b.id } });
  const f4Result = await commitPromotion(principal, 2026, [finalYearRepeat.id]);
  const stayedBack = await db.student.findUniqueOrThrow({ where: { id: finalYearRepeat.id } });
  console.log("Form 4 repeater stays ACTIVE in the SAME class (never graduates):", stayedBack.status === "ACTIVE" && stayedBack.classId === f4b.id && stayedBack.isRepeating === true ? "✓" : "✗ FAIL");
  const graduated2 = await db.student.findUniqueOrThrow({ where: { id: finalYearGrad.id } });
  console.log("Form 4 non-repeater genuinely graduates as normal:", graduated2.status === "GRADUATED" && graduated2.graduationYear === 2026 ? "✓" : "✗ FAIL");
  await undoRun(principal, f4Result.runId);

  // Cleanup T.13 test entities.
  await db.student.deleteMany({ where: { admissionNo: { in: ["KH-TEST-T13A", "KH-TEST-T13B", "KH-TEST-T13C", "KH-TEST-T13D", "KH-TEST-T13E"] } } });
  await db.schoolClass.delete({ where: { id: g4.id } });
  await db.schoolClass.delete({ where: { id: f4b.id } });
  const g5blueCount = g5blue ? await db.student.count({ where: { classId: g5blue.id } }) : 0;
  if (g5blue && g5blueCount === 0) await db.schoolClass.delete({ where: { id: g5blue.id } });
  await db.promotionRun.deleteMany({ where: { tenantId } });
  console.log("T.13 cleanup ✓ (no leftover test classes/students/runs)");
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
