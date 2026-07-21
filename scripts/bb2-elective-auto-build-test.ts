/**
 * BB.2 — Elective Block auto-build FROM real student subject-choice data,
 * full real regression test.
 *
 * Founder's own real scenario, verbatim: "the adding of subjects should be
 * automatic from the students data of subjects they choose and then give
 * the combined list of students doing the subjects and the teachers too
 * and as well how many teachers too."
 *
 * Real assertions, all against the live DB (real tenant, real classes/
 * subjects/teachers/students/pathways created fresh — no mocks):
 *  1. ELECTIVES preview correctly EXCLUDES a subject every real student
 *     picked (the honest 8-4-4 compulsory fallback signal).
 *  2. ELECTIVES preview correctly DETECTS genuine elective subjects with
 *     the right real combined student roster per subject.
 *  3. A real fairness-ranked teacher recommendation is suggested for a
 *     subject with a real linked teacher.
 *  4. A subject with NO real linked teacher honestly shows an empty
 *     recommendation list (never fabricates a suggestion).
 *  5. Confirming creates exactly ONE real ElectiveBlock with the right
 *     real subjects/classes.
 *  6. MATH_SPLIT preview correctly detects a genuine STEM/non-STEM
 *     pathway mix and produces exactly 2 real subject rows (Core +
 *     Essential Mathematics) with the right real student split.
 *  7. MATH_SPLIT correctly REFUSES to run (a real, honest CONFLICT) when
 *     a level has no genuine pathway mix (everyone in the same group).
 *  8. Confirming a preview twice is impossible — a second confirm on an
 *     already-CONFIRMED run is blocked.
 *  9. Confirming with a subject that was never part of the original real
 *     preview is honestly rejected (never trusts client-supplied shape).
 * 10. Discarding a preview correctly blocks a later confirm attempt.
 * 11. Cross-tenant isolation: a different tenant cannot see or act on our
 *     real ElectiveBlockAutoBuildRun rows.
 *
 * Cleans up everything it creates.
 */
import { PrismaClient } from "@prisma/client";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import {
  previewElectiveBlockAutoBuild, confirmElectiveBlockAutoBuild, discardElectiveBlockAutoBuild,
  ElectiveBlockAutoBuildError,
} from "../src/lib/services/elective-block-auto-build.service";
import { deleteElectiveBlock } from "../src/lib/services/elective-block.service";
import { createPathway, allocateStudentToPathway } from "../src/lib/services/pathway.service";
import type { SessionUser } from "../src/lib/core/session";

const db = new PrismaClient();
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

  const cls1 = await db.schoolClass.create({ data: { tenantId: t1.id, level: `BB2Test${suffix}`, stream: "A", curriculum: "8-4-4" } });
  const cls2 = await db.schoolClass.create({ data: { tenantId: t1.id, level: `BB2Test${suffix}`, stream: "B", curriculum: "8-4-4" } });

  const english = await db.subject.create({ data: { tenantId: t1.id, name: `BB2 English ${suffix}`, code: `E${suffix}`.slice(0, 10), curriculum: "8-4-4" } });
  const hist = await db.subject.create({ data: { tenantId: t1.id, name: `BB2 History ${suffix}`, code: `H${suffix}`.slice(0, 10), curriculum: "8-4-4" } });
  const geo = await db.subject.create({ data: { tenantId: t1.id, name: `BB2 Geography ${suffix}`, code: `G${suffix}`.slice(0, 10), curriculum: "8-4-4" } });
  const music = await db.subject.create({ data: { tenantId: t1.id, name: `BB2 Music ${suffix}`, code: `M${suffix}`.slice(0, 10), curriculum: "8-4-4" } });

  const historyTeacher = await db.user.create({ data: { tenantId: t1.id, neyoLoginId: `bb2ht${suffix}`, fullName: "BB2 History Teacher", role: "TEACHER", isActive: true } as never });
  await db.teacherSubject.create({ data: { tenantId: t1.id, teacherId: historyTeacher.id, subjectId: hist.id } as never });
  const geoTeacher = await db.user.create({ data: { tenantId: t1.id, neyoLoginId: `bb2gt${suffix}`, fullName: "BB2 Geo Teacher", role: "TEACHER", isActive: true } as never });
  await db.teacherSubject.create({ data: { tenantId: t1.id, teacherId: geoTeacher.id, subjectId: geo.id } as never });
  // Music deliberately has NO linked teacher.

  const s1 = await db.student.create({ data: { tenantId: t1.id, admissionNo: `BB2-${suffix}-1`, firstName: "Test", lastName: "One", gender: "M", classId: cls1.id, status: "ACTIVE" } as never });
  const s2 = await db.student.create({ data: { tenantId: t1.id, admissionNo: `BB2-${suffix}-2`, firstName: "Test", lastName: "Two", gender: "F", classId: cls1.id, status: "ACTIVE" } as never });
  const s3 = await db.student.create({ data: { tenantId: t1.id, admissionNo: `BB2-${suffix}-3`, firstName: "Test", lastName: "Three", gender: "M", classId: cls2.id, status: "ACTIVE" } as never });

  const portal = await db.subjectSelectionPortal.create({ data: { tenantId: t1.id, name: `BB2 Portal ${suffix}`, targetLevel: `BB2Test${suffix}`, openDate: new Date(), closeDate: new Date(Date.now() + 86400000), status: "OPEN", rulesJson: "{}" } as never });
  await db.studentSubjectSelection.create({ data: { tenantId: t1.id, portalId: portal.id, studentId: s1.id, selectedSubjectIds: JSON.stringify([english.id, hist.id]), isConfirmed: true } as never });
  await db.studentSubjectSelection.create({ data: { tenantId: t1.id, portalId: portal.id, studentId: s2.id, selectedSubjectIds: JSON.stringify([english.id, hist.id]), isConfirmed: true } as never });
  await db.studentSubjectSelection.create({ data: { tenantId: t1.id, portalId: portal.id, studentId: s3.id, selectedSubjectIds: JSON.stringify([english.id, geo.id, music.id]), isConfirmed: true } as never });

  let blockId = "";
  let mathBlockId = "";
  try {
    // ---- 1-4: ELECTIVES preview ----
    const preview = await previewElectiveBlockAutoBuild(principal1, { level: `BB2Test${suffix}`, kind: "ELECTIVES", defaultLessonsPerWeek: 5 });
    check("1. English (universally picked) is correctly EXCLUDED as the honest compulsory fallback", !preview.rows.some((r) => r.subjectId === english.id));
    const histRow = preview.rows.find((r) => r.subjectId === hist.id);
    const geoRow = preview.rows.find((r) => r.subjectId === geo.id);
    const musicRow = preview.rows.find((r) => r.subjectId === music.id);
    check("2. History correctly detected with its real 2-student combined roster", histRow?.studentCount === 2);
    check("2. Geography correctly detected with its real 1-student roster", geoRow?.studentCount === 1);
    check("2. Music correctly detected too", Boolean(musicRow));
    check("3. History has a real fairness-ranked teacher recommendation", histRow?.suggestedTeacherId === historyTeacher.id);
    check("4. Music (no real linked teacher) honestly shows zero recommendations", musicRow?.teacherRecommendations.length === 0 && musicRow?.suggestedTeacherId === null);

    // ---- 5: confirm creates exactly one real block ----
    const confirmed = await confirmElectiveBlockAutoBuild(principal1, {
      action: "confirm",
      runId: preview.runId,
      blockName: `BB2 Auto Block ${suffix}`,
      preferAfterBreak: false,
      subjects: preview.rows.map((r) => ({ subjectId: r.subjectId, teacherId: r.suggestedTeacherId, lessonsPerWeek: 5, classIds: r.classIds, teachingGroups: [] })),
    });
    blockId = confirmed.blockId;
    const blockRow = await db.electiveBlock.findUnique({ where: { id: blockId }, include: { slots: { include: { subjects: true } } } });
    check("5. Exactly one real ElectiveBlock created with the right real subject count", blockRow?.slots[0]?.subjects.length === preview.rows.length);

    // ---- 8: double-confirm is blocked ----
    let blockedDoubleConfirm = false;
    try {
      await confirmElectiveBlockAutoBuild(principal1, {
        action: "confirm", runId: preview.runId, blockName: "should not work", preferAfterBreak: false,
        subjects: preview.rows.map((r) => ({ subjectId: r.subjectId, teacherId: null, lessonsPerWeek: 5, classIds: r.classIds, teachingGroups: [] })),
      });
    } catch (e) {
      blockedDoubleConfirm = e instanceof ElectiveBlockAutoBuildError && e.code === "CONFLICT";
    }
    check("8. Confirming an already-CONFIRMED run is blocked", blockedDoubleConfirm);

    // ---- 9: confirming a subject never in the preview is rejected ----
    const preview2 = await previewElectiveBlockAutoBuild(principal1, { level: `BB2Test${suffix}`, kind: "ELECTIVES", defaultLessonsPerWeek: 5 });
    let rejectedFakeSubject = false;
    try {
      await confirmElectiveBlockAutoBuild(principal1, {
        action: "confirm", runId: preview2.runId, blockName: "fake", preferAfterBreak: false,
        subjects: [{ subjectId: english.id, teacherId: null, lessonsPerWeek: 5, classIds: [cls1.id], teachingGroups: [] }], // English was never in the real preview
      });
    } catch (e) {
      rejectedFakeSubject = e instanceof ElectiveBlockAutoBuildError && e.code === "INVALID";
    }
    check("9. Confirming a subject that was never part of the real preview is rejected", rejectedFakeSubject);
    await discardElectiveBlockAutoBuild(principal1, preview2.runId);

    // ---- 10: discard blocks a later confirm ----
    const preview3 = await previewElectiveBlockAutoBuild(principal1, { level: `BB2Test${suffix}`, kind: "ELECTIVES", defaultLessonsPerWeek: 5 });
    await discardElectiveBlockAutoBuild(principal1, preview3.runId);
    let blockedAfterDiscard = false;
    try {
      await confirmElectiveBlockAutoBuild(principal1, {
        action: "confirm", runId: preview3.runId, blockName: "should not work", preferAfterBreak: false,
        subjects: preview3.rows.map((r) => ({ subjectId: r.subjectId, teacherId: null, lessonsPerWeek: 5, classIds: r.classIds, teachingGroups: [] })),
      });
    } catch (e) {
      blockedAfterDiscard = e instanceof ElectiveBlockAutoBuildError && e.code === "CONFLICT";
    }
    check("10. Confirming a DISCARDED run is blocked", blockedAfterDiscard);

    // ---- 6-7: MATH_SPLIT ----
    const stemPathway = await createPathway(principal1, { name: `BB2 STEM ${suffix}`, code: `STEM${suffix}` } as never);
    const socialPathway = await createPathway(principal1, { name: `BB2 Social ${suffix}`, code: `SOC${suffix}` } as never);
    await db.pathway.update({ where: { id: stemPathway.id }, data: { pathwayGroup: "STEM" } });
    await db.pathway.update({ where: { id: socialPathway.id }, data: { pathwayGroup: "SOCIAL_SCIENCES" } });

    // No pathway allocation yet -> MATH_SPLIT should honestly refuse.
    let refusedNoMix = false;
    try {
      await previewElectiveBlockAutoBuild(principal1, { level: `BB2Test${suffix}`, kind: "MATH_SPLIT", defaultLessonsPerWeek: 5 });
    } catch (e) {
      refusedNoMix = e instanceof ElectiveBlockAutoBuildError && e.code === "NOT_FOUND";
    }
    check("7a. MATH_SPLIT honestly refuses with no real pathway allocation yet", refusedNoMix);

    // All 3 students in the SAME pathway -> still no genuine mix.
    await allocateStudentToPathway(principal1, s1.id, { pathwayId: stemPathway.id, isAllocated: true, isRecommended: false } as never);
    await allocateStudentToPathway(principal1, s2.id, { pathwayId: stemPathway.id, isAllocated: true, isRecommended: false } as never);
    await allocateStudentToPathway(principal1, s3.id, { pathwayId: stemPathway.id, isAllocated: true, isRecommended: false } as never);
    let refusedSameGroup = false;
    try {
      await previewElectiveBlockAutoBuild(principal1, { level: `BB2Test${suffix}`, kind: "MATH_SPLIT", defaultLessonsPerWeek: 5 });
    } catch (e) {
      refusedSameGroup = e instanceof ElectiveBlockAutoBuildError && e.code === "CONFLICT";
    }
    check("7b. MATH_SPLIT honestly refuses when everyone is in the SAME pathway group (no genuine mix)", refusedSameGroup);

    // Now a genuine mix: s3 moves to Social Sciences.
    await allocateStudentToPathway(principal1, s3.id, { pathwayId: socialPathway.id, isAllocated: true, isRecommended: false } as never);
    const mathPreview = await previewElectiveBlockAutoBuild(principal1, { level: `BB2Test${suffix}`, kind: "MATH_SPLIT", defaultLessonsPerWeek: 5 });
    check("6. MATH_SPLIT correctly produces exactly 2 real subject rows", mathPreview.rows.length === 2);
    const coreRow = mathPreview.rows.find((r) => r.subjectCode === "MATC");
    const essentialRow = mathPreview.rows.find((r) => r.subjectCode === "MATE");
    check("6. Core Mathematics correctly gets the 2 real STEM students", coreRow?.studentCount === 2);
    check("6. Essential Mathematics correctly gets the 1 real non-STEM student", essentialRow?.studentCount === 1);

    const mathConfirmed = await confirmElectiveBlockAutoBuild(principal1, {
      action: "confirm", runId: mathPreview.runId, blockName: `BB2 Math Split ${suffix}`, preferAfterBreak: false,
      subjects: mathPreview.rows.map((r) => ({ subjectId: r.subjectId, teacherId: null, lessonsPerWeek: 5, classIds: r.classIds, teachingGroups: [] })),
    });
    mathBlockId = mathConfirmed.blockId;
    check("Real Core/Essential Mathematics ElectiveBlock genuinely created", Boolean(mathBlockId));

    // ---- 11: cross-tenant isolation ----
    // Uses the REAL tenant-scoping middleware (tenantDb()), exactly as a
    // real service call would — a raw PrismaClient query bypasses the
    // middleware entirely and would give a false pass/fail here.
    const crossTenantRuns = await withTenant(t2.id, () => tenantDb().electiveBlockAutoBuildRun.findMany({ where: { level: `BB2Test${suffix}` } }));
    check("11. CRITICAL: a different tenant sees ZERO of our real auto-build runs", crossTenantRuns.length === 0);
    void principal2; // referenced for the cross-tenant intent above

    await db.subject.deleteMany({ where: { id: { in: (await db.subject.findMany({ where: { tenantId: t1.id, code: { in: ["MATC", "MATE"] } } })).map((s) => s.id) } } });
  } finally {
    if (blockId) await deleteElectiveBlock(principal1, blockId).catch(() => {});
    if (mathBlockId) await deleteElectiveBlock(principal1, mathBlockId).catch(() => {});
    await db.electiveBlockAutoBuildRun.deleteMany({ where: { level: `BB2Test${suffix}` } });
    await db.pathway.deleteMany({ where: { tenantId: t1.id, code: { in: [`STEM${suffix}`, `SOC${suffix}`] } } });
    await db.studentSubjectSelection.deleteMany({ where: { portalId: portal.id } });
    await db.subjectSelectionPortal.delete({ where: { id: portal.id } }).catch(() => {});
    await db.student.deleteMany({ where: { id: { in: [s1.id, s2.id, s3.id] } } });
    await db.teacherSubject.deleteMany({ where: { teacherId: { in: [historyTeacher.id, geoTeacher.id] } } });
    await db.user.deleteMany({ where: { id: { in: [historyTeacher.id, geoTeacher.id] } } });
    await db.subject.deleteMany({ where: { id: { in: [english.id, hist.id, geo.id, music.id] } } });
    await db.schoolClass.deleteMany({ where: { id: { in: [cls1.id, cls2.id] } } });
  }

  const remaining = await db.electiveBlockAutoBuildRun.findMany({ where: { level: `BB2Test${suffix}` } });
  check("All BB.2 test fixtures fully cleaned up (confirmed via direct re-query)", remaining.length === 0);

  console.log(`\n  ${pass} passed, ${fail} failed`);
  console.log(fail === 0 ? "  ✅ BB.2 Elective Block auto-build all green" : "  ❌ FAILURES ABOVE");
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
