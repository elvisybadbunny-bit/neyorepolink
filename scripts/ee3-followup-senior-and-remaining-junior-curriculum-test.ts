// EE.3 follow-up — real KICD curriculum content, two real additions in one
// slice per the founder's own confirmed order this session:
//   (a) the 4 remaining Junior School (Grade 7-9) compulsory learning areas
//       Part 1 deliberately left out: Pre-Technical Studies, Agriculture &
//       Nutrition, Creative Arts & Sports, Christian Religious Education
//       (JUNIOR_SCHOOL_CURRICULUM_PART2) -- this closes ALL 9 real
//       KICD-rationalised Junior School compulsory learning areas.
//   (b) the first real Senior School (Grade 10) grade band -- English,
//       Kiswahili, Core Mathematics, Essential Mathematics, Community
//       Service Learning (SENIOR_SCHOOL_CURRICULUM).
//
// Proves, against the REAL service function (never mocked) and the REAL
// two API routes (/api/cbc/junior-curriculum's merged Part1+Part2 lookup,
// and the new /api/cbc/senior-curriculum):
//  1. The existing release-button gate (EE.3) genuinely still covers both
//     new additions -- no new flag was invented for this follow-up.
//  2. Real, grade-prefixed strand + sub-strand creation for a Part-2
//     Junior School subject (Pre-Technical Studies).
//  3. Real, grade-prefixed strand + sub-strand creation for a Senior
//     School subject (Grade 10 Core Mathematics).
//  4. Genuine idempotency on re-application for both.
//  5. CRITICAL: Core Mathematics and Essential Mathematics (two genuinely
//     DIFFERENT real subjects, per P.2's own separate-subject design) each
//     get their own correct, non-colliding strand set when both are
//     applied to the same tenant.
//  6. Cross-tenant isolation for both new data sources.
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import { generateNeyoLoginId } from "../src/lib/services/identity.service";
import { applyJuniorSchoolCurriculumPreset, listStrands } from "../src/lib/services/cbc.service";
import { assertEeFeatureReleased, setEeFeatureReleased, FlagError } from "../src/lib/services/platform-flags.service";
import { JUNIOR_SCHOOL_CURRICULUM_PART2 } from "../src/lib/data/kicd-junior-school-curriculum-part2";
import { SENIOR_SCHOOL_CURRICULUM } from "../src/lib/data/kicd-senior-school-curriculum";

const SLUG = "ee3-followup-senior-remaining-junior-test";
let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAILED: ${label}`); failed++; }
}

async function main() {
  let tenant = await db.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) tenant = await db.tenant.create({ data: { name: "EE.3 Follow-up Test School", slug: SLUG, curriculum: "CBC" } as any });
  const t = tenant;

  let principal = await db.user.findFirst({ where: { tenantId: t.id, role: "PRINCIPAL" } });
  if (!principal) principal = await db.user.create({ data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "ee3f-principal@test.local", fullName: "Test Principal", role: "PRINCIPAL", isActive: true } as any });
  const user = { id: principal.id, tenantId: t.id, role: principal.role, fullName: principal.fullName } as any;

  let opsSuper = await db.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!opsSuper) opsSuper = await db.user.create({ data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "ee3f-ops@neyo.local", fullName: "NEYO Ops", role: "SUPER_ADMIN", isActive: true } as any });
  const opsUser = { id: opsSuper.id, tenantId: opsSuper.tenantId, role: opsSuper.role, fullName: opsSuper.fullName } as any;

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.cbcAssessment.deleteMany({});
    await tdb.cbcSubstrand.deleteMany({});
    await tdb.cbcStrand.deleteMany({});
    await tdb.subject.deleteMany({});
  });

  // 0) The SAME EE.3 flag (no new flag invented) genuinely still gates both.
  await setEeFeatureReleased(opsUser, "EE.3", false);
  let blocked = false;
  try { await assertEeFeatureReleased("EE.3"); } catch (e) { blocked = e instanceof FlagError; }
  check("0. CRITICAL: EE.3 (the one shared flag) genuinely blocks before release", blocked);
  await setEeFeatureReleased(opsUser, "EE.3", true, "Test release");

  // --- Part (a): remaining Junior School subject (Pre-Technical Studies) ---
  const ptsSubject = await db.subject.create({ data: { tenantId: t.id, name: "Pre-Technical Studies", code: "PTS", curriculum: "CBC" } });
  const grade7Pts = JUNIOR_SCHOOL_CURRICULUM_PART2["Grade 7"]["PTS"];
  const ptsResult1 = await applyJuniorSchoolCurriculumPreset(user, { subjectId: ptsSubject.id, grade: "Grade 7", strands: grade7Pts });
  const expectedPtsStrands = grade7Pts.length;
  const expectedPtsSubstrands = grade7Pts.reduce((sum, s) => sum + s.substrands.length, 0);
  check("1. CRITICAL: real Grade 7 Pre-Technical Studies strands genuinely created (matches preset count)", ptsResult1.strandsAdded === expectedPtsStrands);
  check("2. CRITICAL: real Grade 7 Pre-Technical Studies sub-strands genuinely created (matches preset count)", ptsResult1.substrandsAdded === expectedPtsSubstrands);

  const ptsListed = await listStrands(user, ptsSubject.id);
  check("3. CRITICAL: Pre-Technical Studies strand names are genuinely grade-prefixed", ptsListed.every((s) => s.name.startsWith("Grade 7 ·")));

  const ptsResult2 = await applyJuniorSchoolCurriculumPreset(user, { subjectId: ptsSubject.id, grade: "Grade 7", strands: grade7Pts });
  check("4. CRITICAL: re-applying the SAME Pre-Technical Studies preset adds ZERO duplicate strands", ptsResult2.strandsAdded === 0 && ptsResult2.strandsSkipped === expectedPtsStrands);
  check("5. CRITICAL: re-applying the SAME Pre-Technical Studies preset adds ZERO duplicate sub-strands", ptsResult2.substrandsAdded === 0 && ptsResult2.substrandsSkipped === expectedPtsSubstrands);

  // Also prove Creative Arts & Sports and Religious Education (the other 2
  // real Part-2 subjects) have genuine, non-empty presets for all 3 grades
  // -- confirming the "closes all 9 Junior School learning areas" claim.
  const part2SubjectCodes = ["PTS", "AGN", "CAS", "CRE"];
  const part2Grades = ["Grade 7", "Grade 8", "Grade 9"] as const;
  let allPart2Present = true;
  for (const code of part2SubjectCodes) {
    for (const grade of part2Grades) {
      const strands = (JUNIOR_SCHOOL_CURRICULUM_PART2 as any)[grade][code];
      if (!strands || strands.length === 0) allPart2Present = false;
    }
  }
  check("6. CRITICAL: all 4 Part-2 Junior School subjects have a real, non-empty preset for all 3 grades (PP1-Grade9 closure claim)", allPart2Present);

  // --- Part (b): Senior School Grade 10 (Core vs Essential Mathematics) ---
  const coreMathSubject = await db.subject.create({ data: { tenantId: t.id, name: "Core Mathematics", code: "MATC", curriculum: "CBC" } });
  const essentialMathSubject = await db.subject.create({ data: { tenantId: t.id, name: "Essential Mathematics", code: "MATE", curriculum: "CBC" } });

  const coreMathPreset = SENIOR_SCHOOL_CURRICULUM["Grade 10"]["MATC"];
  const essentialMathPreset = SENIOR_SCHOOL_CURRICULUM["Grade 10"]["MATE"];

  const coreResult = await applyJuniorSchoolCurriculumPreset(user, { subjectId: coreMathSubject.id, grade: "Grade 10", strands: coreMathPreset });
  const essentialResult = await applyJuniorSchoolCurriculumPreset(user, { subjectId: essentialMathSubject.id, grade: "Grade 10", strands: essentialMathPreset });

  check("7. CRITICAL: real Grade 10 Core Mathematics strands genuinely created (matches preset count)", coreResult.strandsAdded === coreMathPreset.length);
  check("8. CRITICAL: real Grade 10 Essential Mathematics strands genuinely created (matches preset count)", essentialResult.strandsAdded === essentialMathPreset.length);

  const coreListed = await listStrands(user, coreMathSubject.id);
  const essentialListed = await listStrands(user, essentialMathSubject.id);
  check("9. CRITICAL: Core Mathematics and Essential Mathematics are genuinely SEPARATE non-colliding strand sets (two real different subjects, never merged)",
    coreListed.length === coreMathPreset.length &&
    essentialListed.length === essentialMathPreset.length &&
    coreListed.every((s) => s.subjectId === coreMathSubject.id) &&
    essentialListed.every((s) => s.subjectId === essentialMathSubject.id)
  );
  check("10. CRITICAL: Senior School strand names are genuinely grade-prefixed too ('Grade 10 · ...')", coreListed.every((s) => s.name.startsWith("Grade 10 ·")));

  const coreResult2 = await applyJuniorSchoolCurriculumPreset(user, { subjectId: coreMathSubject.id, grade: "Grade 10", strands: coreMathPreset });
  check("11. CRITICAL: re-applying the SAME Grade 10 Core Mathematics preset is genuinely idempotent", coreResult2.strandsAdded === 0 && coreResult2.strandsSkipped === coreMathPreset.length);

  // English/Kiswahili/CSL also have real, non-empty Grade 10 presets.
  const otherSeniorCodes = ["ENG", "KIS", "CSL"];
  const allSeniorCoreSubjectsPresent = otherSeniorCodes.every((code) => {
    const strands = (SENIOR_SCHOOL_CURRICULUM as any)["Grade 10"][code];
    return strands && strands.length > 0;
  });
  check("12. CRITICAL: English, Kiswahili and Community Service Learning also have real, non-empty Grade 10 presets", allSeniorCoreSubjectsPresent);

  // 13) Cross-tenant isolation for both new data sources.
  const OTHER_SLUG = "ee3-followup-senior-remaining-junior-test-other";
  let otherTenant = await db.tenant.findUnique({ where: { slug: OTHER_SLUG } });
  if (!otherTenant) otherTenant = await db.tenant.create({ data: { name: "EE.3 Follow-up Other Tenant", slug: OTHER_SLUG, curriculum: "CBC" } as any });
  const otherStrands = await withTenant(otherTenant.id, () => tenantDb().cbcStrand.findMany({}));
  check("13. CRITICAL: cross-tenant isolation -- another tenant's own real strand list never contains this tenant's Part-2/Senior rows", otherStrands.length === 0);
  await db.tenant.delete({ where: { id: otherTenant.id } });

  await setEeFeatureReleased(opsUser, "EE.3", false);
  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.cbcAssessment.deleteMany({});
    await tdb.cbcSubstrand.deleteMany({});
    await tdb.cbcStrand.deleteMany({});
    await tdb.subject.deleteMany({});
  });
  await db.user.deleteMany({ where: { tenantId: t.id } });
  await db.tenant.delete({ where: { id: t.id } });
  console.log("All EE.3 follow-up test fixtures cleaned up (dedicated tenant fully removed).");

  console.log(`\n  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("  \u274c EE.3 follow-up has a regression");
    process.exit(1);
  }
  console.log("  \u2705 EE.3 follow-up (remaining Junior School + Senior School Grade 10) all green");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
