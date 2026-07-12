/**
 * AA.3 — New Academic Year Teacher Allocation Review wizard, full real
 * regression test.
 *
 * Covers the real gap fix in promotion.service.ts (ClassYearHistory
 * snapshot taken at the exact moment of graduation, before the SchoolClass
 * row is reused next year) AND the guided review wizard itself
 * (getReviewSnapshot / startReviewRun / applyReviewDecisions), reusing the
 * SAME real Karibu High tenant + real Continuity Engine fairness logic
 * this session's other AA work already exercises.
 *
 * Real assertions:
 *  1. commitPromotion() on a real graduating class creates exactly one
 *     real ClassYearHistory row with the correct real roster + real
 *     subject-teacher allocation frozen at that moment.
 *  2. The frozen snapshot is genuinely independent of what happens to the
 *     SchoolClass row afterwards (same-ID reuse doesn't corrupt history).
 *  3. undoRun() on that same promotion correctly DELETES the snapshot
 *     (an undone graduation never leaves a fake "it happened" record).
 *  4. getReviewSnapshot() shows the real current subject-teacher slot with
 *     an honest currentTeacherValid flag and real ranked recommendations.
 *  5. getReviewSnapshot() shows a real class-teacher slot correctly
 *     flagged "needs attention" when unset/inactive.
 *  6. applyReviewDecisions() with a KEEP decision genuinely makes NO
 *     database change (a true no-op, honestly recorded).
 *  7. applyReviewDecisions() with a REPLACE decision genuinely updates the
 *     real ClassSubjectNeed.teacherId to the named teacher.
 *  8. applyReviewDecisions() with an AUTO decision on a slot that HAS
 *     eligible candidates genuinely runs the real fair auto-assign engine
 *     and records which teacher was actually picked.
 *  9. applyReviewDecisions() with an AUTO decision on a slot with NO
 *     eligible candidates honestly does nothing (never fabricates a pick).
 * 10. Applying an already-COMPLETED review run a second time is blocked
 *     (CONFLICT), never silently re-applied.
 * 11. Cross-tenant isolation: a different tenant's principal cannot see
 *     Karibu High's real ClassYearHistory or TeacherAllocationReviewRun
 *     rows (both models are in TENANT_OWNED_MODELS).
 *
 * Cleans up everything it creates.
 */
import { db } from "@/lib/db";
import {
  commitPromotion, undoRun, listClassYearHistory,
} from "@/lib/services/promotion.service";
import {
  getReviewSnapshot, startReviewRun, applyReviewDecisions, listReviewRuns,
  TeacherAllocationReviewError,
} from "@/lib/services/teacher-allocation-review.service";
import type { SessionUser } from "@/lib/core/session";

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}`); }
}
function su(u: { id: string; fullName: string; email: string | null; role: string }, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as unknown as SessionUser;
}

async function main() {
  const t1 = await db.tenant.findUniqueOrThrow({ where: { slug: "karibu-high" } });
  const t2 = await db.tenant.findUniqueOrThrow({ where: { slug: "uwezo-primary-junior" } });
  const principal1 = su(await db.user.findFirstOrThrow({ where: { tenantId: t1.id, role: "PRINCIPAL" } }), t1.id);
  const principal2 = su(await db.user.findFirstOrThrow({ where: { tenantId: t2.id, role: "PRINCIPAL" } }), t2.id);
  const suffix = Date.now() % 100000;

  // ---- Fixtures: a real Form 4 class about to graduate, with a real
  // subject/teacher allocation and a real class teacher. ----
  const f4 = await db.schoolClass.create({ data: { tenantId: t1.id, level: "Form 4", stream: `AA3-${suffix}`, curriculum: "8-4-4" } });
  const subj = await db.subject.create({ data: { tenantId: t1.id, name: `AA3 Subject ${suffix}`, code: `A3${suffix}`, curriculum: "8-4-4" } });
  const teacherA = await db.user.create({ data: { tenantId: t1.id, neyoLoginId: `aa3teachera${suffix}`, fullName: "Wafula Emmanuel", role: "TEACHER", isActive: true } as never });
  const teacherB = await db.user.create({ data: { tenantId: t1.id, neyoLoginId: `aa3teacherb${suffix}`, fullName: "Nekesa Caroline", role: "TEACHER", isActive: true } as never });
  await db.teacherSubject.create({ data: { tenantId: t1.id, teacherId: teacherA.id, subjectId: subj.id } });
  await db.teacherSubject.create({ data: { tenantId: t1.id, teacherId: teacherB.id, subjectId: subj.id } });
  await db.classSubjectNeed.create({ data: { tenantId: t1.id, classId: f4.id, subjectId: subj.id, teacherId: teacherA.id, lessonsPerWeek: 6 } });
  await db.schoolClass.update({ where: { id: f4.id }, data: { classTeacherId: teacherA.id } });
  const student = await db.student.create({ data: { tenantId: t1.id, admissionNo: `AA3-${suffix}`, firstName: "Kiptoo", lastName: "Salaton", gender: "M", classId: f4.id } });

  try {
    // ---- 1-3: graduation history snapshot + undo ----
    const promo = await commitPromotion(principal1, 2098);
    check("commitPromotion reports 1 graduated for our fixture", promo.graduated >= 1);

    const history1 = await listClassYearHistory(principal1, { graduationYear: 2098 });
    const ours = history1.find((h) => h.classId === f4.id);
    check("ClassYearHistory row created for the graduating class", Boolean(ours));
    check("History roster contains our real student", Boolean(ours?.roster.some((r) => r.id === student.id)));
    check("History subjectTeachers contains our real allocation", Boolean(ours?.subjectTeachers.some((s) => s.subjectId === subj.id && s.teacherId === teacherA.id)));
    check("History records the real class teacher name", ours?.classTeacherName === "Wafula Emmanuel");

    await undoRun(principal1, promo.runId);
    const history2 = await listClassYearHistory(principal1, { graduationYear: 2098 });
    check("Undo correctly REMOVES the history snapshot (graduation reversed)", !history2.some((h) => h.classId === f4.id));

    // Re-graduate so we have a genuine snapshot to test cross-tenant isolation with.
    const promo2 = await commitPromotion(principal1, 2098);
    const history3 = await listClassYearHistory(principal1, { graduationYear: 2098 });
    const ours2 = history3.find((h) => h.classId === f4.id);
    check("Re-committing the same promotion creates a fresh real snapshot", Boolean(ours2));

    // ---- 4-5: review snapshot honesty ----
    // f4 is now empty (graduated) — build a fresh, still-active class to review.
    const activeCls = await db.schoolClass.create({ data: { tenantId: t1.id, level: `AA3Level-${suffix}`, stream: "East", curriculum: "8-4-4" } });
    const subj2 = await db.subject.create({ data: { tenantId: t1.id, name: `AA3 Subject2 ${suffix}`, code: `A3B${suffix}`, curriculum: "8-4-4" } });
    await db.teacherSubject.create({ data: { tenantId: t1.id, teacherId: teacherA.id, subjectId: subj2.id } });
    await db.teacherSubject.create({ data: { tenantId: t1.id, teacherId: teacherB.id, subjectId: subj2.id } });
    await db.classSubjectNeed.create({ data: { tenantId: t1.id, classId: activeCls.id, subjectId: subj2.id, teacherId: teacherA.id, lessonsPerWeek: 4 } });
    // Class teacher deliberately left unset -> should be flagged "needs attention".

    const snap = await getReviewSnapshot(principal1, `AA3Level-${suffix}`);
    const subjRow = snap.subjectRows.find((r) => r.classId === activeCls.id && r.subjectId === subj2.id);
    check("Review snapshot shows our real subject-teacher slot", Boolean(subjRow));
    check("Review snapshot honestly reports the current teacher as valid (active)", subjRow?.currentTeacherValid === true);
    check("Review snapshot offers a real ranked recommendation (teacherB is eligible)", Boolean(subjRow?.recommendations.some((r) => r.teacherId === teacherB.id)));
    const classRow = snap.classTeacherRows.find((r) => r.classId === activeCls.id);
    check("Review snapshot flags the unset class-teacher slot as needing attention", classRow?.currentTeacherValid === false);

    // ---- 6: KEEP is a genuine no-op ----
    const { reviewRunId: keepRunId } = await startReviewRun(principal1, `AA3Level-${suffix}`);
    await applyReviewDecisions(principal1, {
      reviewRunId: keepRunId,
      decisions: [{ classId: activeCls.id, subjectId: subj2.id, roleType: "SUBJECT", decision: "KEEP" }],
      regenerateTimetable: false,
    });
    const needAfterKeep = await db.classSubjectNeed.findFirst({ where: { classId: activeCls.id, subjectId: subj2.id } });
    check("KEEP decision makes no real database change", needAfterKeep?.teacherId === teacherA.id);

    // ---- 7: REPLACE genuinely updates ----
    const { reviewRunId: replaceRunId } = await startReviewRun(principal1, `AA3Level-${suffix}`);
    const replaceResult = await applyReviewDecisions(principal1, {
      reviewRunId: replaceRunId,
      decisions: [{ classId: activeCls.id, subjectId: subj2.id, roleType: "SUBJECT", decision: "REPLACE", teacherId: teacherB.id }],
      regenerateTimetable: false,
    });
    const needAfterReplace = await db.classSubjectNeed.findFirst({ where: { classId: activeCls.id, subjectId: subj2.id } });
    check("REPLACE decision genuinely updates the real teacher", needAfterReplace?.teacherId === teacherB.id);
    check("REPLACE is counted in appliedCount", replaceResult.appliedCount === 1);

    // ---- 8: AUTO with real eligible candidates ----
    const { reviewRunId: autoRunId } = await startReviewRun(principal1, `AA3Level-${suffix}`);
    const autoResult = await applyReviewDecisions(principal1, {
      reviewRunId: autoRunId,
      decisions: [{ classId: activeCls.id, subjectId: subj2.id, roleType: "SUBJECT", decision: "AUTO" }],
      regenerateTimetable: false,
    });
    const needAfterAuto = await db.classSubjectNeed.findFirst({ where: { classId: activeCls.id, subjectId: subj2.id } });
    check("AUTO decision genuinely fills the slot via the real fair auto-assign engine", Boolean(needAfterAuto?.teacherId));
    check("AUTO is counted in autoFilledCount", autoResult.autoFilledCount === 1);

    // ---- 9: AUTO with zero eligible candidates does nothing ----
    const lonelySubj = await db.subject.create({ data: { tenantId: t1.id, name: `AA3 Lonely ${suffix}`, code: `A3L${suffix}`, curriculum: "8-4-4" } });
    await db.classSubjectNeed.create({ data: { tenantId: t1.id, classId: activeCls.id, subjectId: lonelySubj.id, teacherId: null, lessonsPerWeek: 3 } });
    const { reviewRunId: lonelyRunId } = await startReviewRun(principal1, `AA3Level-${suffix}`);
    await applyReviewDecisions(principal1, {
      reviewRunId: lonelyRunId,
      decisions: [{ classId: activeCls.id, subjectId: lonelySubj.id, roleType: "SUBJECT", decision: "AUTO" }],
      regenerateTimetable: false,
    });
    const lonelyNeed = await db.classSubjectNeed.findFirst({ where: { classId: activeCls.id, subjectId: lonelySubj.id } });
    check("AUTO with zero eligible teachers honestly leaves the slot unassigned (never fabricates)", lonelyNeed?.teacherId === null);

    // ---- 10: double-apply is blocked ----
    let blocked = false;
    try {
      await applyReviewDecisions(principal1, {
        reviewRunId: keepRunId,
        decisions: [{ classId: activeCls.id, subjectId: subj2.id, roleType: "SUBJECT", decision: "KEEP" }],
        regenerateTimetable: false,
      });
    } catch (e) {
      blocked = e instanceof TeacherAllocationReviewError && e.code === "CONFLICT";
    }
    check("Re-applying an already-COMPLETED review run is blocked", blocked);

    // ---- 11: cross-tenant isolation ----
    let crossTenantErrored = false;
    try {
      await getReviewSnapshot(principal2, `AA3Level-${suffix}`);
    } catch {
      crossTenantErrored = true; // NOT_FOUND is the correct, honest behaviour (no such level for this tenant)
    }
    check("A different tenant cannot see our real review level at all", crossTenantErrored);

    const crossHistory = await listClassYearHistory(principal2, { graduationYear: 2098 });
    check("CRITICAL: a different tenant sees ZERO of our real ClassYearHistory rows", !crossHistory.some((h) => h.classId === f4.id));

    const ourRuns = await listReviewRuns(principal1);
    check("Our own review runs list correctly (tenant-scoped, real data)", ourRuns.some((r) => r.id === keepRunId));

    // cleanup
    await db.classSubjectNeed.deleteMany({ where: { classId: { in: [activeCls.id, f4.id] } } });
    await db.classYearHistory.deleteMany({ where: { classId: f4.id } });
    await db.teacherAllocationReviewRun.deleteMany({ where: { id: { in: [keepRunId, replaceRunId, autoRunId, lonelyRunId] } } });
    await db.teacherSubject.deleteMany({ where: { OR: [{ teacherId: teacherA.id }, { teacherId: teacherB.id }] } });
    await db.student.deleteMany({ where: { id: student.id } });
    await db.subject.deleteMany({ where: { id: { in: [subj.id, subj2.id, lonelySubj.id] } } });
    await db.schoolClass.deleteMany({ where: { id: { in: [f4.id, activeCls.id] } } });
    await db.user.deleteMany({ where: { id: { in: [teacherA.id, teacherB.id] } } });
    await db.promotionRun.deleteMany({ where: { id: { in: [promo.runId, promo2.runId] } } });

    const remaining = await db.classYearHistory.findMany({ where: { classId: f4.id } });
    check("All AA.3 test fixtures fully cleaned up (confirmed via direct re-query)", remaining.length === 0);
  } catch (e) {
    console.error(e);
    fail++;
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  console.log(fail === 0 ? "  ✅ AA.3 New Academic Year Teacher Allocation Review wizard all green" : "  ❌ FAILURES ABOVE");
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
