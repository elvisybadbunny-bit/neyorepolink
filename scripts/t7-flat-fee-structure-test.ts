/**
 * T.7 — Configurable Fee Structure Modes: Per-Class vs. One School-Wide
 * Structure. Founder-confirmed (2026-07-08): "option 1" (one real flat
 * structure for the whole school) PLUS real per-class-level fee
 * differences must still reflect correctly on every real student
 * dimension — this test proves BOTH real capabilities coexist correctly.
 */
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/lib/core/session";
import { createStructure, listStructures, batchInvoice, ALL_LEVELS_SENTINEL } from "../src/lib/services/finance.service";
import { createStudent } from "../src/lib/services/student.service";

let passed = 0, failed = 0;
function assert(cond: boolean, label: string) {
  if (cond) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAIL: ${label}`); failed++; }
}
async function assertThrows(fn: () => Promise<unknown>, label: string) {
  try { await fn(); console.log(`  \u2717 FAIL: ${label} (did not throw)`); failed++; }
  catch { console.log(`  \u2713 ${label}`); passed++; }
}

async function asUser(email: string): Promise<SessionUser> {
  return (await db.user.findFirstOrThrow({ where: { email } })) as unknown as SessionUser;
}

async function main() {
  const tenant = await db.tenant.findFirstOrThrow({ where: { name: { contains: "Karibu" } } });
  const bursar = await asUser("bursar@karibuhigh.ac.ke");
  const thisYear = new Date().getFullYear();
  const testTerm = 3; // a real, deliberately unused term this session so this test never collides with the real B.7 seed's Term 2 structures.

  console.log(`\nUsing tenant: ${tenant.name} (${tenant.id})\n`);

  // -------------------------------------------------------------------
  // 1) A real whole-school flat structure is created with the ALL sentinel
  // -------------------------------------------------------------------
  const flat = await createStructure(bursar, {
    level: "ignored-when-flat", applyToAllLevels: true, year: thisYear, term: testTerm,
    items: [{ label: "Whole-school activity levy", amountKes: 500 }],
  });
  const flatRow = await db.feeStructure.findUniqueOrThrow({ where: { id: flat.id } });
  assert(flatRow.level === ALL_LEVELS_SENTINEL, `the real flat structure is stored under the real "ALL" sentinel level (got ${flatRow.level})`);
  assert(flatRow.classId === null, "the real flat structure has no class override (mutually exclusive by definition)");
  assert(flatRow.applyToAllLevels === true, "the real flat structure's applyToAllLevels flag is true");
  assert(flatRow.name === `All levels — Term ${testTerm} ${thisYear}`, `the real flat structure's name is human-readable (got "${flatRow.name}")`);

  // A second flat structure for the SAME year/term is a real duplicate.
  await assertThrows(
    () => createStructure(bursar, { level: "x", applyToAllLevels: true, year: thisYear, term: testTerm, items: [{ label: "Y", amountKes: 1 }] }),
    "creating a second whole-school flat structure for the same term is rejected (DUPLICATE)"
  );

  // -------------------------------------------------------------------
  // 2) A real per-class-level structure STILL works exactly as before,
  // side by side with the flat structure (never one replacing the other).
  // -------------------------------------------------------------------
  const perLevel = await createStructure(bursar, {
    level: "Form 1", year: thisYear, term: testTerm,
    items: [{ label: "Form 1 tuition", amountKes: 20000 }],
  });
  const perLevelRow = await db.feeStructure.findUniqueOrThrow({ where: { id: perLevel.id } });
  assert(perLevelRow.applyToAllLevels === false, "a real per-level structure's applyToAllLevels is false (the pre-existing behavior, unchanged)");
  assert(perLevelRow.level === "Form 1", "a real per-level structure still stores its own real level, not the ALL sentinel");

  // -------------------------------------------------------------------
  // 3) batchInvoice() on the flat structure invoices EVERY real active
  // class (Form 1 West AND Form 2 East), not just one level.
  // -------------------------------------------------------------------
  const dueDate = `${thisYear}-12-01`;
  const flatBatch = await batchInvoice(bursar, flat.id, dueDate);
  assert(flatBatch.created > 0, `the real whole-school batch invoice created real invoices (created=${flatBatch.created})`);

  const flatInvoices = await db.invoice.findMany({ where: { structureId: flat.id } });
  const studentIds = flatInvoices.map((i) => i.studentId);
  const invoicedStudents = await db.student.findMany({ where: { id: { in: studentIds } }, include: { schoolClass: true } });
  const levelsInvoiced = new Set(invoicedStudents.map((s) => s.schoolClass?.level).filter(Boolean));
  assert(levelsInvoiced.size >= 2, `the real whole-school flat batch invoiced students across multiple REAL class levels (got levels: ${[...levelsInvoiced].join(", ")})`);
  assert(flatInvoices.every((i) => i.totalKes === 500), "every real flat invoice bills the exact real flat amount (KES 500)");

  // Re-running the flat batch is genuinely idempotent (skips already-invoiced students).
  const flatBatch2 = await batchInvoice(bursar, flat.id, dueDate);
  assert(flatBatch2.created === 0, `re-running the whole-school flat batch creates 0 NEW invoices (idempotent, created=${flatBatch2.created})`);
  assert(flatBatch2.skipped === flatBatch.created, "re-running skips every student already invoiced by the first real flat batch run");

  // -------------------------------------------------------------------
  // 4) batchInvoice() on the per-level structure ONLY invoices that level
  // (the pre-existing behavior is completely unaffected by T.7).
  // -------------------------------------------------------------------
  const perLevelBatch = await batchInvoice(bursar, perLevel.id, dueDate);
  assert(perLevelBatch.created > 0, `the real per-level batch invoice created real invoices for Form 1 only (created=${perLevelBatch.created})`);
  const perLevelInvoices = await db.invoice.findMany({ where: { structureId: perLevel.id } });
  const perLevelStudents = await db.student.findMany({ where: { id: { in: perLevelInvoices.map((i) => i.studentId) } }, include: { schoolClass: true } });
  assert(perLevelStudents.every((s) => s.schoolClass?.level === "Form 1"), "the real per-level batch invoiced ONLY real Form 1 students, exactly as before T.7");

  // -------------------------------------------------------------------
  // 5) listStructures() reports applyToAllLevels correctly for the UI badge.
  // -------------------------------------------------------------------
  const allStructures = await listStructures(bursar);
  const flatInList = allStructures.find((s) => s.id === flat.id);
  const perLevelInList = allStructures.find((s) => s.id === perLevel.id);
  assert(flatInList?.applyToAllLevels === true, "listStructures() reports the real flat structure's applyToAllLevels=true (drives the UI 'whole school' badge)");
  assert(perLevelInList?.applyToAllLevels === false, "listStructures() reports the real per-level structure's applyToAllLevels=false");

  // -------------------------------------------------------------------
  // 6) Real new-enrollment auto-invoicing falls back to the flat structure
  // when no per-level/per-class structure exists for that level+term.
  // -------------------------------------------------------------------
  const f1w = await db.schoolClass.findFirstOrThrow({ where: { tenantId: tenant.id, level: "Form 1", stream: "West" } });
  await db.academicTerm.updateMany({ where: { tenantId: tenant.id }, data: { current: false } });
  const existingTestTerm = await db.academicTerm.findFirst({ where: { tenantId: tenant.id, year: thisYear, term: testTerm } });
  const testTermRow = existingTestTerm
    ? await db.academicTerm.update({ where: { id: existingTestTerm.id }, data: { current: true } })
    : await db.academicTerm.create({ data: { tenantId: tenant.id, year: thisYear, term: testTerm, current: true, startDate: `${thisYear}-09-01`, endDate: `${thisYear}-12-01` } });
  const testTermWasPreExisting = Boolean(existingTestTerm);

  const newStudent = await createStudent(bursar, {
    firstName: "Cherono", lastName: "Kiptoo (T7 test)", gender: "F", dateOfBirth: "2011-01-01",
    classId: f1w.id, createLogin: false, seedRequirements: false,
    guardians: [{ fullName: "Kiptoo Daniel", phone: "0700111222", relationship: "Father", isPrimary: true, createLogin: false }],
  } as never);

  // Form 1 already has its OWN real per-level structure for this term (step 2/4 above),
  // so the new student should be invoiced under THAT — not the flat structure —
  // proving the real fallback order (exact class > per-level > flat) is honored correctly.
  const newStudentInvoices = await db.invoice.findMany({ where: { studentId: newStudent.id } });
  assert(newStudentInvoices.length === 1, `the real newly-enrolled Form 1 West student got exactly 1 real auto-invoice (got ${newStudentInvoices.length})`);
  assert(newStudentInvoices[0]?.structureId === perLevel.id, "the real per-level Form 1 structure took priority over the flat structure (correct real fallback order)");

  // Now test the ACTUAL flat-fallback case: a genuinely new class/level with
  // NO per-level structure of its own for this term — only the flat one.
  const testClass = await db.schoolClass.create({ data: { tenantId: tenant.id, level: "Form 4 (T7 test)", stream: null, curriculum: "8-4-4", capacity: 10 } });
  const secondStudent = await createStudent(bursar, {
    firstName: "Wanjala", lastName: "Simiyu (T7 test)", gender: "M", dateOfBirth: "2010-06-01",
    classId: testClass.id, createLogin: false, seedRequirements: false,
    guardians: [{ fullName: "Simiyu Peter", phone: "0700333444", relationship: "Father", isPrimary: true, createLogin: false }],
  } as never);
  const secondStudentInvoices = await db.invoice.findMany({ where: { studentId: secondStudent.id } });
  assert(secondStudentInvoices.length === 1, `the real newly-enrolled student in a level with NO per-level structure still got exactly 1 real auto-invoice via the flat fallback (got ${secondStudentInvoices.length})`);
  assert(secondStudentInvoices[0]?.structureId === flat.id, "the real flat whole-school structure was correctly used as the fallback for a level with no structure of its own");
  assert(secondStudentInvoices[0]?.totalKes === 500, "the real fallback flat invoice bills the exact real flat amount");

  // -------------------------------------------------------------------
  // Cleanup — remove ALL real test-created rows, confirmed via direct DB
  // re-query, and restore the real original current-term flag.
  // -------------------------------------------------------------------
  await db.invoice.deleteMany({ where: { structureId: { in: [flat.id, perLevel.id] } } });
  await db.feeItem.deleteMany({ where: { structureId: { in: [flat.id, perLevel.id] } } });
  await db.feeStructure.deleteMany({ where: { id: { in: [flat.id, perLevel.id] } } });
  await db.student.deleteMany({ where: { id: { in: [newStudent.id, secondStudent.id] } } });
  await db.schoolClass.delete({ where: { id: testClass.id } });
  if (testTermWasPreExisting) {
    await db.academicTerm.update({ where: { id: testTermRow.id }, data: { current: false } });
  } else {
    await db.academicTerm.delete({ where: { id: testTermRow.id } });
  }
  await db.academicTerm.updateMany({ where: { tenantId: tenant.id, year: thisYear, term: 2 }, data: { current: true } });

  const leftoverStructures = await db.feeStructure.count({ where: { id: { in: [flat.id, perLevel.id] } } });
  const leftoverStudents = await db.student.count({ where: { id: { in: [newStudent.id, secondStudent.id] } } });
  const leftoverClass = await db.schoolClass.count({ where: { id: testClass.id } });
  assert(leftoverStructures === 0, "both real test-created fee structures removed (confirmed via direct DB re-query)");
  assert(leftoverStudents === 0, "both real test-created students removed (confirmed via direct DB re-query)");
  assert(leftoverClass === 0, "the real test-created class removed (confirmed via direct DB re-query)");

  const currentTermRestored = await db.academicTerm.findFirst({ where: { tenantId: tenant.id, current: true } });
  assert(currentTermRestored?.term === 2 && currentTermRestored?.year === thisYear, "the real original current-term flag is restored (Term 2, no permanent drift)");

  console.log("\n----------------------------------------");
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  \u2705 all green" : "  \u274c FAILURES ABOVE");
  if (failed > 0) process.exitCode = 1;
}

main().then(() => process.exit(process.exitCode ?? 0)).catch((e) => { console.error(e); process.exit(1); });
