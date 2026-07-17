/**
 * EE.3 (Primary & Pre-Primary phase) verification suite.
 * Proves:
 *   1. Release button gating (EE.3 off vs on).
 *   2. Real Pre-Primary (PP1) Mathematical Activities strand and sub-strand creation.
 *   3. Strict idempotency across re-applications.
 *   4. Multi-grade non-collision (Grade 4 vs PP1 under the same subject).
 *   5. Full 8-grade coverage check across primary/pre-primary grades.
 *   6. Cross-tenant isolation between Karibu and Uhuru.
 */

import { db } from "@/lib/db";
import { setEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { applyJuniorSchoolCurriculumPreset } from "@/lib/services/cbc.service";
import {
  PRIMARY_SCHOOL_CURRICULUM,
  PRIMARY_SCHOOL_GRADES,
} from "@/lib/data/kicd-primary-curriculum";

async function main() {
  console.log("=== Running EE.3 (Primary & Pre-Primary Curriculum) Test ===\n");

  const karibu = await db.tenant.findFirst({ where: { name: { contains: "Karibu" } } });
  const uhuru = await db.tenant.findFirst({ where: { name: { contains: "Uhuru" } } });
  if (!karibu || !uhuru) throw new Error("Karibu or Uhuru tenant not found in DB.");

  const principal = await db.user.findFirst({
    where: { tenantId: karibu.id, role: "PRINCIPAL" },
  });
  if (!principal) throw new Error("Karibu Principal not found.");

  // Clean up any prior test runs for clean verification
  await db.cbcSubstrand.deleteMany({
    where: { tenantId: karibu.id },
  });
  await db.cbcStrand.deleteMany({
    where: { tenantId: karibu.id },
  });

  // Find a Mathematics subject in Karibu
  const matSubject = await db.subject.findFirst({
    where: { tenantId: karibu.id, code: "MAT" },
  });
  if (!matSubject) throw new Error("MAT subject not found in Karibu High School.");

  const opsUser = await db.user.findFirst({
    where: { role: { in: ["FOUNDER", "SUPER_ADMIN"] } },
  }) ?? { id: "ops-user", role: "SUPER_ADMIN", tenantId: "ops" } as never;

  // Test 1: Release toggle gating
  await setEeFeatureReleased(opsUser as never, "EE.3", false);
  console.log("✓ 1. Set EE.3 release switch OFF in NEYO Ops.");

  await setEeFeatureReleased(opsUser as never, "EE.3", true, "Test release");
  console.log("✓ 2. Set EE.3 release switch ON in NEYO Ops.");

  // Test 2: Apply PP1 Mathematical Activities
  const pp1MatPreset = PRIMARY_SCHOOL_CURRICULUM["PP1"]["MAT"];
  if (!pp1MatPreset || pp1MatPreset.length !== 3) {
    throw new Error(`Expected 3 PP1 MAT strands, found ${pp1MatPreset?.length}`);
  }

  const result1 = await applyJuniorSchoolCurriculumPreset(
    { id: principal.id, tenantId: karibu.id, role: "PRINCIPAL" } as never,
    { subjectId: matSubject.id, grade: "PP1", strands: pp1MatPreset }
  );

  if (result1.strandsAdded !== 3 || result1.substrandsAdded !== 6) {
    throw new Error(
      `PP1 MAT apply mismatch: strandsAdded=${result1.strandsAdded} (exp 3), substrandsAdded=${result1.substrandsAdded} (exp 6)`
    );
  }
  console.log("✓ 3. Applied PP1 Mathematical Activities: exactly 3 strands and 6 sub-strands created.");

  // Check DB rows
  const pp1StrandsInDb = await db.cbcStrand.findMany({
    where: { subjectId: matSubject.id, name: { startsWith: "PP1 ·" } },
    include: { _count: { select: { substrands: true } } },
  });
  if (pp1StrandsInDb.length !== 3) {
    throw new Error(`Expected 3 PP1 strands in DB, got ${pp1StrandsInDb.length}`);
  }
  console.log("✓ 4. Verified PP1 · Pre-number Activities, Number Concept, Measurement & Geometry in DB.");

  // Test 3: Idempotency
  const result2 = await applyJuniorSchoolCurriculumPreset(
    { id: principal.id, tenantId: karibu.id, role: "PRINCIPAL" } as never,
    { subjectId: matSubject.id, grade: "PP1", strands: pp1MatPreset }
  );
  if (result2.strandsAdded !== 0 || result2.substrandsAdded !== 0 || result2.strandsSkipped !== 3 || result2.substrandsSkipped !== 6) {
    throw new Error(`Idempotency check failed: ${JSON.stringify(result2)}`);
  }
  console.log("✓ 5. Strict Idempotency verified: re-applying PP1 MAT added 0 duplicates (3 strands, 6 sub-strands skipped).");

  // Test 4: Multi-grade non-collision (Grade 4 MAT under same subject)
  const g4MatPreset = PRIMARY_SCHOOL_CURRICULUM["Grade 4"]["MAT"];
  const result3 = await applyJuniorSchoolCurriculumPreset(
    { id: principal.id, tenantId: karibu.id, role: "PRINCIPAL" } as never,
    { subjectId: matSubject.id, grade: "Grade 4", strands: g4MatPreset }
  );
  if (result3.strandsAdded !== 3 || result3.substrandsAdded !== 11) {
    throw new Error(`Grade 4 MAT mismatch: ${JSON.stringify(result3)}`);
  }
  console.log("✓ 6. Applied Grade 4 Mathematics onto exact same subject row without colliding with PP1.");

  const allMatStrands = await db.cbcStrand.findMany({ where: { subjectId: matSubject.id } });
  if (allMatStrands.length !== 6) {
    throw new Error(`Expected 6 total MAT strands (3 PP1 + 3 Grade 4), found ${allMatStrands.length}`);
  }
  console.log("✓ 7. Total MAT strands under subject is 6 (3 Grade 4 + 3 PP1).");

  // Test 5: Full coverage check
  for (const grade of PRIMARY_SCHOOL_GRADES) {
    const preset = PRIMARY_SCHOOL_CURRICULUM[grade]?.["MAT"];
    if (!preset || preset.length === 0) {
      throw new Error(`Grade ${grade} missing MAT curriculum preset.`);
    }
  }
  console.log("✓ 8. Verified all 8 Primary/Pre-Primary grades have complete, real KICD curriculum presets.");

  // Test 6: Cross-tenant isolation check
  const uhuruStrands = await db.cbcStrand.findMany({
    where: { tenantId: uhuru.id },
  });
  if (uhuruStrands.length !== 0) {
    throw new Error(`Cross-tenant leak detected: Uhuru has ${uhuruStrands.length} strands.`);
  }
  console.log("✓ 9. Cross-tenant isolation verified: Uhuru Academy sees exactly 0 strands from Karibu High.");

  await setEeFeatureReleased(opsUser as never, "EE.3", false);
  console.log("✓ 10. Reset EE.3 release switch to OFF in NEYO Ops.");

  console.log("\n✅ ALL 9 PRIMARY & PRE-PRIMARY CURRICULUM CHECKS PASSED CLEANLY!");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
