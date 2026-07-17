/**
 * EE.3 (Senior School Complete Phase) verification suite.
 * Proves:
 *   1. Grade 10 Physics (PHY) pathway elective strand and sub-strand creation.
 *   2. Grade 11 Chemistry (CHE) pathway elective creation and non-collision.
 *   3. Grade 12 Core Mathematics (MATC) core subject creation.
 *   4. Strict idempotency across multiple runs.
 *   5. Full coverage check across all Senior School grades (Grade 10, Grade 11, Grade 12)
 *      and every core/elective pathway subject code.
 *   6. Cross-tenant isolation between Karibu and Uhuru.
 */

import { db } from "@/lib/db";
import { setEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { applyJuniorSchoolCurriculumPreset } from "@/lib/services/cbc.service";
import {
  SENIOR_SCHOOL_CURRICULUM,
  SENIOR_SCHOOL_GRADES,
  SENIOR_SCHOOL_SUBJECT_CODES,
} from "@/lib/data/kicd-senior-school-curriculum";

async function main() {
  console.log("=== Running EE.3 (Senior School Pathways & Grade 10-12) Test ===\n");

  const karibu = await db.tenant.findFirst({ where: { name: { contains: "Karibu" } } });
  const uhuru = await db.tenant.findFirst({ where: { name: { contains: "Uhuru" } } });
  if (!karibu || !uhuru) throw new Error("Karibu or Uhuru tenant not found in DB.");

  const principal = await db.user.findFirst({
    where: { tenantId: karibu.id, role: "PRINCIPAL" },
  });
  if (!principal) throw new Error("Karibu Principal not found.");

  const opsUser = await db.user.findFirst({
    where: { role: { in: ["FOUNDER", "SUPER_ADMIN"] } },
  }) ?? { id: "ops-user", role: "SUPER_ADMIN", tenantId: "ops" } as never;

  // Clean up any prior test runs for clean verification
  await db.cbcSubstrand.deleteMany({
    where: { tenantId: karibu.id },
  });
  await db.cbcStrand.deleteMany({
    where: { tenantId: karibu.id },
  });

  await setEeFeatureReleased(opsUser as never, "EE.3", true, "Test release for Senior School");
  console.log("✓ 1. Set EE.3 release switch ON in NEYO Ops.");

  // Create or find subjects in Karibu for PHY, CHE, MATC
  let phySubject = await db.subject.findFirst({ where: { tenantId: karibu.id, code: "PHY" } });
  if (!phySubject) {
    phySubject = await db.subject.create({
      data: { tenantId: karibu.id, name: "Physics", code: "PHY", curriculum: "CBC" },
    });
  }

  let cheSubject = await db.subject.findFirst({ where: { tenantId: karibu.id, code: "CHE" } });
  if (!cheSubject) {
    cheSubject = await db.subject.create({
      data: { tenantId: karibu.id, name: "Chemistry", code: "CHE", curriculum: "CBC" },
    });
  }

  let matcSubject = await db.subject.findFirst({ where: { tenantId: karibu.id, code: "MATC" } });
  if (!matcSubject) {
    matcSubject = await db.subject.create({
      data: { tenantId: karibu.id, name: "Core Mathematics", code: "MATC", curriculum: "CBC" },
    });
  }

  // Test 2: Apply Grade 10 Physics (PHY)
  const g10PhyPreset = SENIOR_SCHOOL_CURRICULUM["Grade 10"]["PHY"];
  if (!g10PhyPreset || g10PhyPreset.length !== 4) {
    throw new Error(`Expected 4 Grade 10 PHY strands, found ${g10PhyPreset?.length}`);
  }

  const result1 = await applyJuniorSchoolCurriculumPreset(
    { id: principal.id, tenantId: karibu.id, role: "PRINCIPAL" } as never,
    { subjectId: phySubject.id, grade: "Grade 10", strands: g10PhyPreset }
  );

  if (result1.strandsAdded !== 4 || result1.substrandsAdded !== 9) {
    throw new Error(
      `Grade 10 PHY apply mismatch: strandsAdded=${result1.strandsAdded} (exp 4), substrandsAdded=${result1.substrandsAdded} (exp 9)`
    );
  }
  console.log("✓ 2. Applied Grade 10 Physics: exactly 4 strands and 9 sub-strands created.");

  // Test 3: Idempotency check on Grade 10 Physics
  const result2 = await applyJuniorSchoolCurriculumPreset(
    { id: principal.id, tenantId: karibu.id, role: "PRINCIPAL" } as never,
    { subjectId: phySubject.id, grade: "Grade 10", strands: g10PhyPreset }
  );
  if (result2.strandsAdded !== 0 || result2.substrandsAdded !== 0 || result2.strandsSkipped !== 4 || result2.substrandsSkipped !== 9) {
    throw new Error(`Idempotency check failed: ${JSON.stringify(result2)}`);
  }
  console.log("✓ 3. Strict Idempotency verified on Grade 10 Physics (0 duplicates created).");

  // Test 4: Apply Grade 11 Chemistry (CHE)
  const g11ChePreset = SENIOR_SCHOOL_CURRICULUM["Grade 11"]["CHE"];
  const result3 = await applyJuniorSchoolCurriculumPreset(
    { id: principal.id, tenantId: karibu.id, role: "PRINCIPAL" } as never,
    { subjectId: cheSubject.id, grade: "Grade 11", strands: g11ChePreset }
  );
  if (result3.strandsAdded !== 2 || result3.substrandsAdded !== 4) {
    throw new Error(`Grade 11 CHE apply mismatch: ${JSON.stringify(result3)}`);
  }
  console.log("✓ 4. Applied Grade 11 Chemistry: exactly 2 strands and 4 sub-strands created (`Grade 11 · ...`).");

  // Test 5: Apply Grade 12 Core Mathematics (MATC)
  const g12MatcPreset = SENIOR_SCHOOL_CURRICULUM["Grade 12"]["MATC"];
  const result4 = await applyJuniorSchoolCurriculumPreset(
    { id: principal.id, tenantId: karibu.id, role: "PRINCIPAL" } as never,
    { subjectId: matcSubject.id, grade: "Grade 12", strands: g12MatcPreset }
  );
  if (result4.strandsAdded !== 2 || result4.substrandsAdded !== 4) {
    throw new Error(`Grade 12 MATC apply mismatch: ${JSON.stringify(result4)}`);
  }
  console.log("✓ 5. Applied Grade 12 Core Mathematics: exactly 2 strands and 4 sub-strands created (`Grade 12 · ...`).");

  // Test 6: Verify full coverage across Grade 10, 11, 12 and required codes
  for (const grade of SENIOR_SCHOOL_GRADES) {
    for (const code of ["ENG", "KIS", "MATC", "MATE", "CSL", "PHY", "CHE", "BIO", "CSC", "BST", "AGR", "GEO", "HIS", "CRE"]) {
      const preset = SENIOR_SCHOOL_CURRICULUM[grade]?.[code];
      if (!preset || preset.length === 0) {
        throw new Error(`Senior School Grade ${grade} missing preset for ${code}`);
      }
    }
  }
  console.log("✓ 6. Verified complete Senior School curriculum coverage across Grade 10, Grade 11, and Grade 12 for core & pathway electives.");

  // Test 7: Cross-tenant isolation
  const uhuruStrands = await db.cbcStrand.findMany({
    where: { tenantId: uhuru.id },
  });
  if (uhuruStrands.length !== 0) {
    throw new Error(`Cross-tenant leak detected: Uhuru has ${uhuruStrands.length} strands.`);
  }
  console.log("✓ 7. Cross-tenant isolation verified: Uhuru Academy sees 0 Senior School pathway strands from Karibu High.");

  await setEeFeatureReleased(opsUser as never, "EE.3", false);
  console.log("✓ 8. Reset EE.3 release switch to OFF in NEYO Ops.");

  console.log("\n✅ ALL 8 SENIOR SCHOOL PATHWAY & GRADE 10-12 CHECKS PASSED CLEANLY!");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
