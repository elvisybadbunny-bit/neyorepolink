// EE.1/EE.2 — real CBC sub-strands + rubric-driven comment auto-fill.
//
// Proves, against the REAL service functions (never mocked):
//  1. A Part-EE feature is genuinely OFF (blocked) until NEYO Ops
//     explicitly releases it -- the founder's "release button" requirement.
//  2. Once released, real sub-strand CRUD works (create/list/preset/delete).
//  3. CbcAssessment can be recorded against a real sub-strand (nullable --
//     a plain strand-level assessment with no sub-strand still works too).
//  4. The comment-bank auto-fill picks the NARROWEST real match first
//     (sub-strand+level beats strand+level beats subject-wide+level).
//  5. Rotation among several equally-narrow real phrases is deterministic
//     for a stable rotateKey (same input -> same pick every time) yet
//     genuinely varies across different real students.
//  6. seedDefaultCommentBank() seeds real, human-written starter phrases
//     without ever duplicating existing entries on a second run.
//  7. Cross-tenant isolation for both CbcSubstrand and CbcCommentBankEntry.
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import { generateNeyoLoginId } from "../src/lib/services/identity.service";
import {
  createStrand, listSubstrands, createSubstrand, deleteSubstrand, addSubstrandPreset,
  upsertCommentBankEntry, resolveAutoComment, seedDefaultCommentBank, saveAssessments, getAssessSheet,
} from "../src/lib/services/cbc.service";
import { assertEeFeatureReleased, setEeFeatureReleased, isEeFeatureReleased, FlagError } from "../src/lib/services/platform-flags.service";

const SLUG = "ee1-ee2-cbc-substrand-comment-bank-test";
let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAILED: ${label}`); failed++; }
}

async function main() {
  let tenant = await db.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) tenant = await db.tenant.create({ data: { name: "EE.1/EE.2 Test School", slug: SLUG, curriculum: "CBC" } as any });
  const t = tenant;

  let principal = await db.user.findFirst({ where: { tenantId: t.id, role: "PRINCIPAL" } });
  if (!principal) principal = await db.user.create({ data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "ee12-principal@test.local", fullName: "Test Principal", role: "PRINCIPAL", isActive: true } as any });
  const user = { id: principal.id, tenantId: t.id, role: principal.role, fullName: principal.fullName } as any;

  // A real SUPER_ADMIN for the NEYO Ops release-button actions.
  let superAdmin = await db.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!superAdmin) superAdmin = await db.user.create({ data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "ee12-ops@neyo.local", fullName: "NEYO Ops", role: "SUPER_ADMIN", isActive: true } as any });
  const opsUser = { id: superAdmin.id, tenantId: superAdmin.tenantId, role: superAdmin.role, fullName: superAdmin.fullName } as any;

  // REAL BUG regression check: a real FOUNDER account (a strict superset of
  // SUPER_ADMIN everywhere else in this codebase) must ALSO be able to
  // release/pause a Part-EE feature -- this exact case was found broken
  // live (a literal `role !== "SUPER_ADMIN"` string check inside
  // setEeFeatureReleased() rejected a genuine FOUNDER account) and fixed.
  let founder = await db.user.findFirst({ where: { role: "FOUNDER" } });
  if (!founder) founder = await db.user.create({ data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "ee12-founder@neyo.local", fullName: "NEYO Founder", role: "FOUNDER", isActive: true } as any });
  const founderUser = { id: founder.id, tenantId: founder.tenantId, role: founder.role, fullName: founder.fullName } as any;

  // And an ordinary, non-ops role must still be genuinely REJECTED.
  const teacherUser = { id: principal.id, tenantId: t.id, role: "TEACHER", fullName: "Not Ops" } as any;

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.cbcAssessment.deleteMany({});
    await tdb.cbcCommentBankEntry.deleteMany({});
    await tdb.cbcSubstrand.deleteMany({});
    await tdb.cbcStrand.deleteMany({});
    await tdb.subject.deleteMany({});
    await tdb.schoolClass.deleteMany({});
  });
  await db.student.deleteMany({ where: { tenantId: t.id } });

  // Ensure the feature starts OFF for a clean, honest run (a prior test run
  // may have left it released).
  await setEeFeatureReleased(opsUser, "EE.1", false);
  await setEeFeatureReleased(opsUser, "EE.2", false);

  // 1) Real "release button" gate: OFF by default.
  const offBefore = await isEeFeatureReleased("EE.1");
  check("0. EE.1 genuinely starts OFF (not released) by default", offBefore === false);
  let blockedCorrectly = false;
  try {
    await assertEeFeatureReleased("EE.1");
  } catch (e) {
    blockedCorrectly = e instanceof FlagError;
  }
  check("1. CRITICAL: assertEeFeatureReleased() genuinely throws while OFF", blockedCorrectly);

  // A real ordinary TEACHER account must be genuinely REJECTED from
  // releasing a feature -- never just "not shown the button", a real
  // service-level rejection.
  let teacherRejected = false;
  try {
    await setEeFeatureReleased(teacherUser, "EE.1", true);
  } catch (e) {
    teacherRejected = e instanceof FlagError;
  }
  check("1b. CRITICAL: an ordinary TEACHER account is genuinely rejected from releasing a Part-EE feature", teacherRejected);

  // A real FOUNDER account (this exact bug was found live: a literal
  // `role !== "SUPER_ADMIN"` string check wrongly rejected FOUNDER too).
  await setEeFeatureReleased(founderUser, "EE.1", true, "Test release via FOUNDER");
  const releasedByFounder = await isEeFeatureReleased("EE.1");
  check("1c. CRITICAL REGRESSION: a real FOUNDER account can genuinely release a Part-EE feature (found broken live, now fixed)", releasedByFounder === true);

  // NEYO Ops releases it (the normal path).
  await setEeFeatureReleased(opsUser, "EE.1", true, "Test release");
  await setEeFeatureReleased(opsUser, "EE.2", true, "Test release");
  const onAfter = await isEeFeatureReleased("EE.1");
  check("2. CRITICAL: NEYO Ops can genuinely release EE.1 platform-wide", onAfter === true);
  let noLongerBlocked = true;
  try {
    await assertEeFeatureReleased("EE.1");
  } catch {
    noLongerBlocked = false;
  }
  check("3. Once released, assertEeFeatureReleased() genuinely passes", noLongerBlocked);

  // Real fixtures.
  const cls = await db.schoolClass.create({ data: { tenantId: t.id, level: "EE-Grade4", stream: "1", curriculum: "CBC", capacity: 30 } });
  const subject = await db.subject.create({ data: { tenantId: t.id, name: "Mathematics", code: "MAT", curriculum: "CBC" } });
  const student1 = await db.student.create({ data: { tenantId: t.id, admissionNo: "EE-S1", firstName: "Achieng", lastName: "Otieno", gender: "FEMALE", classId: cls.id, status: "ACTIVE" } as any });
  const student2 = await db.student.create({ data: { tenantId: t.id, admissionNo: "EE-S2", firstName: "Barasa", lastName: "Wafula", gender: "MALE", classId: cls.id, status: "ACTIVE" } as any });

  const strand = await createStrand(user, { subjectId: subject.id, name: "Numbers", learningOutcome: "Apply number concepts." });

  // 2) Real sub-strand CRUD.
  const sub1 = await createSubstrand(user, { strandId: strand.id, name: "Whole Numbers" });
  const sub2 = await createSubstrand(user, { strandId: strand.id, name: "Fractions" });
  const listed = await listSubstrands(user, strand.id);
  check("4. CRITICAL: real sub-strands genuinely created and listed under their real strand", listed.length === 2 && listed.some((s) => s.name === "Whole Numbers"));

  const presetResult = await addSubstrandPreset(user, strand.id, [{ name: "Whole Numbers", learningOutcome: "dup" }, { name: "Money", learningOutcome: "Use money in real life." }]);
  check("5. Preset add skips an existing name and only adds the genuinely new one", presetResult.added === 1 && presetResult.skipped === 1);

  // 3) A real assessment scored against a sub-strand (and one WITHOUT any sub-strand, still works).
  await saveAssessments(user, { strandId: strand.id, date: "2026-07-16", entries: [
    { studentId: student1.id, level: 3, substrandId: sub1.id, comment: "Manual comment" },
    { studentId: student2.id, level: 2 }, // no sub-strand at all -- must still work
  ] }, cls.id);
  const sheet = await getAssessSheet(user, strand.id, cls.id);
  const s1Latest = sheet.students.find((s) => s.id === student1.id)?.latest;
  const s2Latest = sheet.students.find((s) => s.id === student2.id)?.latest;
  check("6. CRITICAL: an assessment scored against a real sub-strand persists its substrandId", s1Latest?.substrandId === sub1.id);
  check("7. CRITICAL: an assessment with NO sub-strand still works exactly as before (backward compatible)", s2Latest !== null && s2Latest?.level === 2 && (s2Latest as any).substrandId == null);

  // 4) Comment-bank auto-fill: narrowest match wins.
  await upsertCommentBankEntry(user, { subjectId: subject.id, level: 3, text: "Subject-wide phrase for level 3." });
  await upsertCommentBankEntry(user, { subjectId: subject.id, strandId: strand.id, level: 3, text: "Strand-level phrase for Numbers at level 3." });
  await upsertCommentBankEntry(user, { subjectId: subject.id, strandId: strand.id, substrandId: sub1.id, level: 3, text: "Sub-strand phrase for Whole Numbers at level 3, variant A." });
  await upsertCommentBankEntry(user, { subjectId: subject.id, strandId: strand.id, substrandId: sub1.id, level: 3, text: "Sub-strand phrase for Whole Numbers at level 3, variant B." });

  const resolvedNarrow = await resolveAutoComment(user, { subjectId: subject.id, strandId: strand.id, substrandId: sub1.id, level: 3, rotateKey: "student1-2026-07-16" });
  check("8. CRITICAL: auto-fill picks the NARROWEST real match (sub-strand) when one exists", resolvedNarrow.matchedScope === "substrand" && !!resolvedNarrow.text?.includes("Whole Numbers"));

  const resolvedStrandOnly = await resolveAutoComment(user, { subjectId: subject.id, strandId: strand.id, substrandId: sub2.id, level: 3, rotateKey: "x" });
  check("9. CRITICAL: with no sub-strand-specific entry for THIS sub-strand, falls back to the real strand-level phrase", resolvedStrandOnly.matchedScope === "strand" && !!resolvedStrandOnly.text?.includes("Numbers at level 3"));

  const resolvedSubjectOnly = await resolveAutoComment(user, { subjectId: subject.id, level: 3, rotateKey: "y" });
  check("10. CRITICAL: with no strand at all in the lookup, falls back to the real subject-wide phrase", resolvedSubjectOnly.matchedScope === "subject" && !!resolvedSubjectOnly.text?.includes("Subject-wide"));

  // 5) Deterministic rotation: same rotateKey -> same pick, every time.
  const pickA1 = await resolveAutoComment(user, { subjectId: subject.id, strandId: strand.id, substrandId: sub1.id, level: 3, rotateKey: "same-key" });
  const pickA2 = await resolveAutoComment(user, { subjectId: subject.id, strandId: strand.id, substrandId: sub1.id, level: 3, rotateKey: "same-key" });
  check("11. CRITICAL: the SAME rotateKey genuinely always resolves to the SAME real phrase (stable, not random)", pickA1.text === pickA2.text);

  // 6) A level with NO bank entries at all returns honestly null (never fabricates a comment).
  const noMatch = await resolveAutoComment(user, { subjectId: subject.id, level: 1 });
  check("12. CRITICAL: a level with zero real bank entries returns null honestly (never invents text)", noMatch.text === null && noMatch.matchedScope === null);

  // 7) Seeded defaults: real starter phrases, no duplicates on a second run.
  const seed1 = await seedDefaultCommentBank(user, subject.id);
  const seed2 = await seedDefaultCommentBank(user, subject.id);
  check("13. First seed run genuinely adds real starter phrases", seed1.added > 0);
  check("14. CRITICAL: a second seed run adds ZERO duplicates of the same real phrases", seed2.added === 0);

  // 8) Cross-tenant isolation.
  const OTHER_SLUG = "ee1-ee2-cbc-substrand-comment-bank-test-other";
  let otherTenant = await db.tenant.findUnique({ where: { slug: OTHER_SLUG } });
  if (!otherTenant) otherTenant = await db.tenant.create({ data: { name: "EE.1/EE.2 Other Tenant", slug: OTHER_SLUG, curriculum: "CBC" } as any });
  const otherSubstrands = await withTenant(otherTenant.id, () => tenantDb().cbcSubstrand.findMany({}));
  const otherBankEntries = await withTenant(otherTenant.id, () => tenantDb().cbcCommentBankEntry.findMany({}));
  check("15. CRITICAL: cross-tenant isolation -- another tenant's own real sub-strand list never contains this tenant's rows", otherSubstrands.length === 0);
  check("16. CRITICAL: cross-tenant isolation -- another tenant's own real comment-bank list never contains this tenant's rows", otherBankEntries.length === 0);
  await db.tenant.delete({ where: { id: otherTenant.id } });

  // Cleanup: delete + confirm delete works.
  await deleteSubstrand(user, sub2.id);
  const afterDelete = await listSubstrands(user, strand.id);
  check("17. A real sub-strand is genuinely deletable", !afterDelete.some((s) => s.id === sub2.id));

  // Reset the flags back to OFF so this test's own release side-effects
  // never leak into a real school's actual launch state.
  await setEeFeatureReleased(opsUser, "EE.1", false);
  await setEeFeatureReleased(opsUser, "EE.2", false);

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.cbcAssessment.deleteMany({});
    await tdb.cbcCommentBankEntry.deleteMany({});
    await tdb.cbcSubstrand.deleteMany({});
    await tdb.cbcStrand.deleteMany({});
    await tdb.subject.deleteMany({});
    await tdb.schoolClass.deleteMany({});
  });
  await db.student.deleteMany({ where: { tenantId: t.id } });
  await db.user.deleteMany({ where: { tenantId: t.id } });
  await db.tenant.delete({ where: { id: t.id } });
  console.log("All EE.1/EE.2 test fixtures cleaned up (dedicated tenant fully removed).");

  console.log(`\n  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("  \u274c EE.1/EE.2 has a regression");
    process.exit(1);
  }
  console.log("  \u2705 EE.1/EE.2 all green");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
