/**
 * BB.7 — Dedicated Options Block/Subject-Combination Roster Prints — real
 * regression test. Founder's own explicit choice: venue/teacher details
 * belong in a SEPARATE print from the main timetable (never overcrowding
 * it), plus a separate print of the real subject-combination groups the
 * system itself generated.
 *
 * Covers: real Options Block venue/teacher/subject data correctly
 * extracted from real placed TimetableSlot rows (never a second, drifting
 * data source), real subject-combination grouping reusing the exact same
 * real algorithm the "Allocate Class"/L.7 engines already use, honest
 * empty states, and cross-tenant isolation.
 */
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import type { SessionUser } from "../src/lib/core/session";
import { getOptionsBlockRosterPrint, getSubjectCombinationRosterPrint } from "../src/lib/services/elective-block.service";

let passed = 0, failed = 0;
function check(label: string, cond: boolean) {
  if (cond) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.log(`  ✗ ${label}`); }
}

function su(u: { id: string; fullName: string; email: string | null; role: string }, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as unknown as SessionUser;
}

async function main() {
  // -----------------------------------------------------------------
  // 1. Venue roster — real Kilimo Day BB.1 seed block (Business Studies/
  //    Agriculture/Computer Studies, real teachers, one real venue).
  // -----------------------------------------------------------------
  const t1 = await db.tenant.findFirstOrThrow({ where: { slug: "kilimo-day-secondary" } });
  const p1 = su(await db.user.findFirstOrThrow({ where: { tenantId: t1.id, email: "principal@kilimoday.ac.ke" } }), t1.id);

  const venueRoster = await getOptionsBlockRosterPrint(p1, "Form 4");
  check("1. Venue roster finds real classes with a placed Options Block", venueRoster.classes.length >= 2);
  const heshima = venueRoster.classes.find((c) => c.className === "Form 4 Heshima");
  check("1. Real class 'Form 4 Heshima' is present", !!heshima);
  check("1. Real row has all 3 real subjects in this block", (heshima?.rows[0]?.subjects.length ?? 0) === 3);
  const bst = heshima?.rows[0]?.subjects.find((s: { subjectCode: string | null }) => s.subjectCode === "BST");
  check("1. Real Business Studies subject shows its real teacher name", bst?.teacherName === "Kiprotich Alfred");
  const com = heshima?.rows[0]?.subjects.find((s: { subjectCode: string | null }) => s.subjectCode === "COM");
  check("1. Real Computer Studies subject shows its real auto-picked venue (BB.1's own overflow pick)", com?.venue === "Computer Lab (BB.1 demo)");
  check("1. Real Business Studies subject correctly shows NO venue (home classroom, not an overflow subject)", bst?.venue === null);

  // Real honest empty state: a level with genuinely no placed Options Block.
  const emptyRoster = await getOptionsBlockRosterPrint(p1, "BB7Test Nonexistent Level");
  check("2. A level with no real placed Options Block honestly returns zero classes", emptyRoster.classes.length === 0);

  // -----------------------------------------------------------------
  // 3. Combination roster — real Mombasa Coast Grade 10 subject choices.
  // -----------------------------------------------------------------
  const t2 = await db.tenant.findFirstOrThrow({ where: { slug: "mombasa-coast-senior" } });
  const p2 = su(await db.user.findFirstOrThrow({ where: { tenantId: t2.id, email: "principal@mombasacoast.ac.ke" } }), t2.id);

  const comboRoster = await getSubjectCombinationRosterPrint(p2, "Grade 10");
  check("3. Combination roster finds real confirmed-choice groups", comboRoster.groups.length >= 2);
  const totalStudentsInGroups = comboRoster.groups.reduce((sum, g) => sum + g.studentCount, 0);
  check("3. Every real group's studentCount matches its own real students array length", comboRoster.groups.every((g) => g.studentCount === g.students.length));
  check("3. Real students appear with their own real admission numbers", comboRoster.groups.every((g) => g.students.every((s: { admissionNo: string }) => /^MCS-/.test(s.admissionNo))));
  check("3. Groups are sorted largest-first (matching the real grouping engine's own priority order)", comboRoster.groups.every((g, i) => i === 0 || comboRoster.groups[i - 1].studentCount >= g.studentCount));

  const emptyCombo = await getSubjectCombinationRosterPrint(p2, "BB7Test Nonexistent Level 2");
  check("4. A level with no real students honestly returns zero groups", emptyCombo.groups.length === 0);

  // -----------------------------------------------------------------
  // 5. CRITICAL: cross-tenant isolation — a different tenant's own
  //    principal never sees another school's real Options Block/roster
  //    data through these same two real functions.
  // -----------------------------------------------------------------
  const t3 = await db.tenant.findFirstOrThrow({ where: { slug: "uwezo-primary-junior" } });
  const p3 = su(await db.user.findFirstOrThrow({ where: { tenantId: t3.id, role: "PRINCIPAL" } }), t3.id);
  const crossTenantVenue = await getOptionsBlockRosterPrint(p3, "Form 4");
  check("5. CRITICAL: a different tenant's venue roster shows ZERO of Kilimo Day's real classes", crossTenantVenue.classes.length === 0);
  const crossTenantCombo = await getSubjectCombinationRosterPrint(p3, "Grade 10");
  check("5. CRITICAL: a different tenant's combination roster shows ZERO of Mombasa Coast's real students", crossTenantCombo.groups.length === 0);

  console.log(`\n  ${passed} passed, ${failed} failed`);
  if (failed > 0) { console.log("  ❌ BB.7 electives roster print has failures"); process.exit(1); }
  console.log("  ✅ BB.7 dedicated Options Block/subject-combination roster prints all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
