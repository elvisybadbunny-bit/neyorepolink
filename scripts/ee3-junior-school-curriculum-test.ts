// EE.3 — real KICD Junior School (Grade 7-9) curriculum content library.
//
// Proves, against the REAL service function (never mocked):
//  1. The release-button gate genuinely blocks the feature until NEYO Ops
//     releases it.
//  2. applyJuniorSchoolCurriculumPreset() creates real, grade-prefixed
//     strands (so Grade 7/8/9 Mathematics' own genuinely different
//     "Numbers" strand content never collides into one strand row) AND
//     their real sub-strands, in one action.
//  3. Applying the SAME preset twice is genuinely idempotent -- zero
//     duplicate strands or sub-strands on a second run.
//  4. Applying two DIFFERENT grades' presets for the SAME subject creates
//     genuinely separate, non-colliding strand sets.
//  5. Cross-tenant isolation.
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import { generateNeyoLoginId } from "../src/lib/services/identity.service";
import { applyJuniorSchoolCurriculumPreset, listStrands } from "../src/lib/services/cbc.service";
import { assertEeFeatureReleased, setEeFeatureReleased, FlagError } from "../src/lib/services/platform-flags.service";
import { JUNIOR_SCHOOL_CURRICULUM } from "../src/lib/data/kicd-junior-school-curriculum";

const SLUG = "ee3-junior-school-curriculum-test";
let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAILED: ${label}`); failed++; }
}

async function main() {
  let tenant = await db.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) tenant = await db.tenant.create({ data: { name: "EE.3 Test School", slug: SLUG, curriculum: "CBC" } as any });
  const t = tenant;

  let principal = await db.user.findFirst({ where: { tenantId: t.id, role: "PRINCIPAL" } });
  if (!principal) principal = await db.user.create({ data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "ee3-principal@test.local", fullName: "Test Principal", role: "PRINCIPAL", isActive: true } as any });
  const user = { id: principal.id, tenantId: t.id, role: principal.role, fullName: principal.fullName } as any;

  let opsSuper = await db.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!opsSuper) opsSuper = await db.user.create({ data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "ee3-ops@neyo.local", fullName: "NEYO Ops", role: "SUPER_ADMIN", isActive: true } as any });
  const opsUser = { id: opsSuper.id, tenantId: opsSuper.tenantId, role: opsSuper.role, fullName: opsSuper.fullName } as any;

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.cbcAssessment.deleteMany({});
    await tdb.cbcSubstrand.deleteMany({});
    await tdb.cbcStrand.deleteMany({});
    await tdb.subject.deleteMany({});
  });

  await setEeFeatureReleased(opsUser, "EE.3", false);

  // 1) Real release-button gate.
  let blocked = false;
  try { await assertEeFeatureReleased("EE.3"); } catch (e) { blocked = e instanceof FlagError; }
  check("0. CRITICAL: EE.3 genuinely blocked while NEYO Ops has not released it", blocked);
  await setEeFeatureReleased(opsUser, "EE.3", true, "Test release");
  let unblocked = true;
  try { await assertEeFeatureReleased("EE.3"); } catch { unblocked = false; }
  check("1. Once released, EE.3 genuinely passes", unblocked);

  const subject = await db.subject.create({ data: { tenantId: t.id, name: "Mathematics", code: "MAT", curriculum: "CBC" } });

  // 2) Real, grade-prefixed strand + sub-strand creation.
  const grade7Preset = JUNIOR_SCHOOL_CURRICULUM["Grade 7"]["MAT"];
  const result1 = await applyJuniorSchoolCurriculumPreset(user, { subjectId: subject.id, grade: "Grade 7", strands: grade7Preset });
  const expectedStrands = grade7Preset.length;
  const expectedSubstrands = grade7Preset.reduce((sum, s) => sum + s.substrands.length, 0);
  check("2. CRITICAL: real Grade 7 strands genuinely created (matches the real preset's own strand count)", result1.strandsAdded === expectedStrands);
  check("3. CRITICAL: real Grade 7 sub-strands genuinely created (matches the real preset's own sub-strand count)", result1.substrandsAdded === expectedSubstrands);

  const listed = await listStrands(user, subject.id);
  check("4. CRITICAL: strand names are genuinely grade-prefixed (e.g. 'Grade 7 · Numbers'), never bare 'Numbers'", listed.every((s) => s.name.startsWith("Grade 7 ·")));

  // 3) Idempotency: re-applying the SAME preset adds nothing new.
  const result2 = await applyJuniorSchoolCurriculumPreset(user, { subjectId: subject.id, grade: "Grade 7", strands: grade7Preset });
  check("5. CRITICAL: re-applying the SAME preset adds ZERO duplicate strands", result2.strandsAdded === 0 && result2.strandsSkipped === expectedStrands);
  check("6. CRITICAL: re-applying the SAME preset adds ZERO duplicate sub-strands", result2.substrandsAdded === 0 && result2.substrandsSkipped === expectedSubstrands);

  // 4) A DIFFERENT grade's preset for the SAME subject creates a genuinely
  // separate, non-colliding strand set (proves the grade-prefix actually
  // prevents the real cross-grade collision this design exists to avoid).
  const grade8Preset = JUNIOR_SCHOOL_CURRICULUM["Grade 8"]["MAT"];
  const result3 = await applyJuniorSchoolCurriculumPreset(user, { subjectId: subject.id, grade: "Grade 8", strands: grade8Preset });
  check("7. CRITICAL: a DIFFERENT grade's own real strands are added separately, never colliding with Grade 7's own strands", result3.strandsAdded === grade8Preset.length);
  const listedAfterBoth = await listStrands(user, subject.id);
  const grade7Count = listedAfterBoth.filter((s) => s.name.startsWith("Grade 7 ·")).length;
  const grade8Count = listedAfterBoth.filter((s) => s.name.startsWith("Grade 8 ·")).length;
  check("8. CRITICAL: both grades' own real strand sets coexist correctly under the same real subject", grade7Count === expectedStrands && grade8Count === grade8Preset.length);

  // 5) Cross-tenant isolation.
  const OTHER_SLUG = "ee3-junior-school-curriculum-test-other";
  let otherTenant = await db.tenant.findUnique({ where: { slug: OTHER_SLUG } });
  if (!otherTenant) otherTenant = await db.tenant.create({ data: { name: "EE.3 Other Tenant", slug: OTHER_SLUG, curriculum: "CBC" } as any });
  const otherStrands = await withTenant(otherTenant.id, () => tenantDb().cbcStrand.findMany({}));
  check("9. CRITICAL: cross-tenant isolation -- another tenant's own real strand list never contains this tenant's rows", otherStrands.length === 0);
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
  console.log("All EE.3 test fixtures cleaned up (dedicated tenant fully removed).");

  console.log(`\n  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("  \u274c EE.3 has a regression");
    process.exit(1);
  }
  console.log("  \u2705 EE.3 all green");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
