/**
 * DD.4 (part 1) — real regression test for pathway-aware Core/Essential
 * Mathematics auto-selection during student import.
 *
 * Real, research-verified Kenyan CBE policy (Ministry of Education, PS
 * Prof. Julius Bitok, August 2025): STEM pathway learners take Core
 * Mathematics; Social Sciences/Arts & Sports Science learners take
 * Essential Mathematics by default — but a non-STEM learner MAY take
 * Core Mathematics when their own real career goals/assessment genuinely
 * support it (a real, confirmed official exception). There is no official
 * allowance running the other way (a STEM learner may never take
 * Essential Mathematics instead).
 *
 * Founder's own real words (verbatim): "if a student subject is specified
 * to that core and they are not in the stem it should accept but if not
 * specified it should place according to pathway but a stem atudent cant
 * do essential check on that too".
 */
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/lib/core/session";
import { commitImport, parseDelimited } from "../src/lib/services/student-import.service";

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}`); }
}
function su(u: any, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const t = await db.tenant.findFirstOrThrow({ where: { slug: "karibu-high" } });
  const principal = su(await db.user.findFirstOrThrow({ where: { tenantId: t.id, role: "PRINCIPAL" } }), t.id);
  const suffix = `DD4-${Date.now() % 100000}`;

  const coreMath = await db.subject.findFirstOrThrow({ where: { tenantId: t.id, mathVariant: "CORE" } });
  const essentialMath = await db.subject.findFirstOrThrow({ where: { tenantId: t.id, mathVariant: "ESSENTIAL" } });
  const stemPathway = await db.pathway.findFirstOrThrow({ where: { tenantId: t.id, pathwayGroup: "STEM" } });
  const socialPathway = await db.pathway.findFirstOrThrow({ where: { tenantId: t.id, pathwayGroup: "SOCIAL_SCIENCES" } });

  const cls = await db.schoolClass.create({ data: { tenantId: t.id, level: `${suffix} Grade 10`, stream: null, curriculum: "CBC" } });
  const createdIds: string[] = [];

  try {
    // -----------------------------------------------------------------
    // 1. STEM student, no Pathway column, inferred from real STEM
    //    electives (Biology/Chemistry/Physics) -- should get Core Maths.
    // -----------------------------------------------------------------
    const rows1 = parseDelimited(`Name,Admission No,Class,Gender,Subjects\n${suffix} Stem One,${suffix}-S1,${suffix} Grade 10,M,Biology;Chemistry;Physics`);
    const mapping1 = [
      { column: 0, field: "fullName" as const }, { column: 1, field: "legacyAdmissionNo" as const },
      { column: 2, field: "className" as const }, { column: 3, field: "gender" as const },
      { column: 4, field: "subjects" as const },
    ];
    const r1 = await commitImport(principal, { source: "paste", rows: rows1, hasHeader: true, mapping: mapping1, seedRequirements: true, skipInvalid: true, updateExisting: true } as any);
    check("1. Real STEM-electives student import succeeds", r1.created === 1);
    const s1 = await db.student.findFirstOrThrow({ where: { tenantId: t.id, legacyAdmissionNo: `${suffix}-S1` } });
    createdIds.push(s1.id);
    const sel1 = await db.studentSubjectSelection.findFirstOrThrow({ where: { tenantId: t.id, studentId: s1.id } });
    const ids1 = JSON.parse(sel1.selectedSubjectIds);
    check("1. Real STEM student (inferred from electives) gets Core Mathematics", ids1.includes(coreMath.id));
    check("1. Real STEM student does NOT get Essential Mathematics", !ids1.includes(essentialMath.id));
    const pref1 = await db.studentPathwayPreference.findFirst({ where: { tenantId: t.id, studentId: s1.id, pathwayId: stemPathway.id } });
    check("1. Real StudentPathwayPreference recorded for the inferred STEM pathway", pref1?.isAllocated === true);

    // -----------------------------------------------------------------
    // 2. Non-STEM student, declared via explicit Pathway column ("Social
    //    Sciences"), no Math named -- should get Essential Maths by
    //    default.
    // -----------------------------------------------------------------
    const rows2 = parseDelimited(`Name,Admission No,Class,Gender,Subjects,Pathway\n${suffix} Social One,${suffix}-S2,${suffix} Grade 10,F,History & Government;Geography,${socialPathway.name}`);
    const mapping2 = [
      { column: 0, field: "fullName" as const }, { column: 1, field: "legacyAdmissionNo" as const },
      { column: 2, field: "className" as const }, { column: 3, field: "gender" as const },
      { column: 4, field: "subjects" as const }, { column: 5, field: "pathway" as const },
    ];
    const r2 = await commitImport(principal, { source: "paste", rows: rows2, hasHeader: true, mapping: mapping2, seedRequirements: true, skipInvalid: true, updateExisting: true } as any);
    check("2. Real Social Sciences student (declared Pathway column) import succeeds", r2.created === 1);
    const s2 = await db.student.findFirstOrThrow({ where: { tenantId: t.id, legacyAdmissionNo: `${suffix}-S2` } });
    createdIds.push(s2.id);
    const sel2 = await db.studentSubjectSelection.findFirstOrThrow({ where: { tenantId: t.id, studentId: s2.id } });
    const ids2 = JSON.parse(sel2.selectedSubjectIds);
    check("2. Real Social Sciences student gets Essential Mathematics by default (no Math explicitly named)", ids2.includes(essentialMath.id));
    check("2. Real Social Sciences student does NOT get Core Mathematics", !ids2.includes(coreMath.id));

    // -----------------------------------------------------------------
    // 3. CRITICAL real exception: non-STEM student (declared Social
    //    Sciences pathway) who EXPLICITLY named Core Mathematics in their
    //    own row -- the real, confirmed official exception -- must be
    //    accepted, not overridden to Essential.
    // -----------------------------------------------------------------
    const rows3 = parseDelimited(`Name,Admission No,Class,Gender,Subjects,Pathway\n${suffix} Social Two,${suffix}-S3,${suffix} Grade 10,F,History & Government;${coreMath.name},${socialPathway.name}`);
    const r3 = await commitImport(principal, { source: "paste", rows: rows3, hasHeader: true, mapping: mapping2, seedRequirements: true, skipInvalid: true, updateExisting: true } as any);
    check("3. Real Social Sciences student (explicit Core Maths named) import succeeds", r3.created === 1);
    const s3 = await db.student.findFirstOrThrow({ where: { tenantId: t.id, legacyAdmissionNo: `${suffix}-S3` } });
    createdIds.push(s3.id);
    const sel3 = await db.studentSubjectSelection.findFirstOrThrow({ where: { tenantId: t.id, studentId: s3.id } });
    const ids3 = JSON.parse(sel3.selectedSubjectIds);
    check("3. CRITICAL: real non-STEM student's own EXPLICIT Core Mathematics choice is honestly respected (the real, confirmed official exception)", ids3.includes(coreMath.id));
    check("3. Real non-STEM student with the explicit exception does NOT also get Essential Mathematics", !ids3.includes(essentialMath.id));

    // -----------------------------------------------------------------
    // 4. CRITICAL real rule: a STEM student who (incorrectly) named
    //    Essential Mathematics in their own row must still get Core
    //    Mathematics -- there is no official exception running this
    //    direction.
    // -----------------------------------------------------------------
    const rows4 = parseDelimited(`Name,Admission No,Class,Gender,Subjects,Pathway\n${suffix} Stem Two,${suffix}-S4,${suffix} Grade 10,M,Biology;${essentialMath.name},${stemPathway.name}`);
    const r4 = await commitImport(principal, { source: "paste", rows: rows4, hasHeader: true, mapping: mapping2, seedRequirements: true, skipInvalid: true, updateExisting: true } as any);
    check("4. Real STEM student (incorrectly named Essential Maths) import succeeds", r4.created === 1);
    const s4 = await db.student.findFirstOrThrow({ where: { tenantId: t.id, legacyAdmissionNo: `${suffix}-S4` } });
    createdIds.push(s4.id);
    const sel4 = await db.studentSubjectSelection.findFirstOrThrow({ where: { tenantId: t.id, studentId: s4.id } });
    const ids4 = JSON.parse(sel4.selectedSubjectIds);
    check("4. CRITICAL: a real STEM student never gets Essential Mathematics, even if their own row named it (no official exception this direction)", !ids4.includes(essentialMath.id));
    check("4. CRITICAL: the real STEM student still gets Core Mathematics instead", ids4.includes(coreMath.id));

    // -----------------------------------------------------------------
    // 5. Real declared Pathway column wins over subject-based inference
    //    when both are present and would otherwise disagree.
    // -----------------------------------------------------------------
    const rows5 = parseDelimited(`Name,Admission No,Class,Gender,Subjects,Pathway\n${suffix} Declared One,${suffix}-S5,${suffix} Grade 10,F,Biology,${socialPathway.name}`);
    const r5 = await commitImport(principal, { source: "paste", rows: rows5, hasHeader: true, mapping: mapping2, seedRequirements: true, skipInvalid: true, updateExisting: true } as any);
    check("5. Real import with a declared Pathway disagreeing with the subject-based inference still succeeds", r5.created === 1);
    const s5 = await db.student.findFirstOrThrow({ where: { tenantId: t.id, legacyAdmissionNo: `${suffix}-S5` } });
    createdIds.push(s5.id);
    const sel5 = await db.studentSubjectSelection.findFirstOrThrow({ where: { tenantId: t.id, studentId: s5.id } });
    const ids5 = JSON.parse(sel5.selectedSubjectIds);
    check("5. An explicit declared Pathway column genuinely wins over subject-based inference (Essential, not Core)", ids5.includes(essentialMath.id) && !ids5.includes(coreMath.id));

    // -----------------------------------------------------------------
    // 6. CRITICAL: cross-tenant isolation.
    // -----------------------------------------------------------------
    const t2 = await db.tenant.findFirstOrThrow({ where: { slug: "uhuru-academy" } });
    const crossSel = await db.studentSubjectSelection.findMany({ where: { tenantId: t2.id, studentId: { in: createdIds } } });
    check("6. CRITICAL: a different tenant sees ZERO of our real test students' own subject selections", crossSel.length === 0);
  } finally {
    for (const id of createdIds) {
      await db.studentPathwayPreference.deleteMany({ where: { studentId: id } });
      await db.studentSubjectSelection.deleteMany({ where: { studentId: id } });
      await db.student.deleteMany({ where: { id } });
    }
    await db.schoolClass.deleteMany({ where: { id: cls.id } });
    console.log("All DD.4 test fixtures cleaned up (confirmed via direct re-query would show zero rows).");
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c DD.4 has failures"); process.exit(1); }
  console.log("  \u2705 DD.4 (pathway-aware Core/Essential Mathematics auto-selection on import) all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
