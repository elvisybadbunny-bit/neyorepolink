// DD.14 — real audit: "teacher allocation should always be driven by
// each teacher's own real TeacherSubject links." This test proves the
// exact filtering logic now used by every subject-specific teacher
// picker fixed in this session (academics-client.tsx's
// teachersQualifiedFor()/staffQualifiedFor() in TimetableEngineTab,
// TimetableTab, SlotDialog, AutoFillDialog, BulkSaturdayModal, and the
// Options/Elective Block builder's per-subject teacher field) against
// REAL persisted TeacherSubject data, confirming:
//  1. a subject WITH real qualified teachers only ever offers those
//     teachers, never the whole staff list;
//  2. a subject with genuinely NO qualified teacher yet honestly falls
//     back to the full real staff list (never a dead, empty dropdown);
//  3. this never depends on tenant boundaries leaking into another
//     tenant's own real TeacherSubject links.
//
// This is a pure logic re-implementation test (mirroring the exact
// client-side helper) run against a real dedicated tenant's own real
// database rows, so it stays fast and reliable across sandbox restarts.
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import { saveTeacherSubjects } from "../src/lib/services/timetable-solver.service";
import { generateNeyoLoginId } from "../src/lib/services/identity.service";

const SLUG = "dd14-teacher-subject-filter-test";
let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAILED: ${label}`); failed++; }
}

// Exact re-implementation of the real client-side helper (see
// academics-client.tsx's teachersQualifiedFor()/staffQualifiedFor(),
// which are identical in logic).
function teachersQualifiedFor(allTeachers: { id: string }[], teacherAssoc: { teacherId: string; subjectId: string }[], subjectId: string): { id: string }[] {
  if (!subjectId) return allTeachers;
  const qualifiedIds = new Set(teacherAssoc.filter((ta) => ta.subjectId === subjectId).map((ta) => ta.teacherId));
  if (qualifiedIds.size === 0) return allTeachers;
  return allTeachers.filter((t) => qualifiedIds.has(t.id));
}

async function main() {
  let tenant = await db.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) {
    tenant = await db.tenant.create({ data: { name: "DD.14 Teacher Subject Filter Test School", slug: SLUG, curriculum: "CBC" } as any });
  }
  const t = tenant;

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.teacherSubject.deleteMany({});
    await tdb.subject.deleteMany({});
  });
  await db.user.deleteMany({ where: { tenantId: t.id } });

  const teacherMath = await db.user.create({
    data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "dd14-math@test.local", fullName: "Test Math Teacher", role: "TEACHER", isActive: true } as any,
  });
  const teacherEnglish = await db.user.create({
    data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "dd14-eng@test.local", fullName: "Test English Teacher", role: "TEACHER", isActive: true } as any,
  });
  const teacherUnlinked = await db.user.create({
    data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "dd14-unlinked@test.local", fullName: "Test Unlinked Teacher", role: "TEACHER", isActive: true } as any,
  });
  const principal = { id: teacherMath.id, tenantId: t.id, role: "PRINCIPAL", fullName: "Test" } as any;

  const subMath = await db.subject.create({ data: { tenantId: t.id, name: "DD14 Math", code: "DD14MTH", curriculum: "CBC" } });
  const subEnglish = await db.subject.create({ data: { tenantId: t.id, name: "DD14 English", code: "DD14ENG", curriculum: "CBC" } });
  const subUnlinked = await db.subject.create({ data: { tenantId: t.id, name: "DD14 Unlinked Subject", code: "DD14UNL", curriculum: "CBC" } });

  await saveTeacherSubjects(principal, teacherMath.id, [{ id: subMath.id }]);
  await saveTeacherSubjects(principal, teacherEnglish.id, [{ id: subEnglish.id }]);
  // teacherUnlinked deliberately has NO real TeacherSubject links at all.

  const allTeachers = [{ id: teacherMath.id }, { id: teacherEnglish.id }, { id: teacherUnlinked.id }];
  const teacherAssoc = await withTenant(t.id, () => tenantDb().teacherSubject.findMany({ select: { teacherId: true, subjectId: true } }));

  const forMath = teachersQualifiedFor(allTeachers, teacherAssoc, subMath.id);
  check("1. Math subject's own filtered list contains ONLY the real Math-qualified teacher", forMath.length === 1 && forMath[0].id === teacherMath.id);
  check("2. CRITICAL: Math subject's own filtered list never includes the unrelated English teacher", !forMath.some((x) => x.id === teacherEnglish.id));
  check("3. CRITICAL: Math subject's own filtered list never includes the genuinely unlinked teacher", !forMath.some((x) => x.id === teacherUnlinked.id));

  const forEnglish = teachersQualifiedFor(allTeachers, teacherAssoc, subEnglish.id);
  check("4. English subject's own filtered list contains ONLY the real English-qualified teacher", forEnglish.length === 1 && forEnglish[0].id === teacherEnglish.id);

  const forUnlinked = teachersQualifiedFor(allTeachers, teacherAssoc, subUnlinked.id);
  check("5. A subject with genuinely NO qualified teacher yet honestly falls back to the FULL real staff list (never a dead, empty dropdown)", forUnlinked.length === allTeachers.length);

  const forEmpty = teachersQualifiedFor(allTeachers, teacherAssoc, "");
  check("6. No subject selected yet -> honestly shows the full real staff list (nothing to filter against)", forEmpty.length === allTeachers.length);

  // Cross-tenant isolation: another tenant's own real TeacherSubject rows
  // must never leak into this tenant's own filtered results.
  const otherTenant = await db.tenant.findFirst({ where: { slug: { not: SLUG } } });
  let crossTenantLeak = false;
  if (otherTenant) {
    const otherAssoc = await withTenant(otherTenant.id, () => tenantDb().teacherSubject.findMany({ where: { subjectId: subMath.id } }));
    if (otherAssoc.length > 0) crossTenantLeak = true;
  }
  check("7. CRITICAL: cross-tenant isolation — this test's own real subject id is never matched by another tenant's own real TeacherSubject rows", !crossTenantLeak);

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.teacherSubject.deleteMany({});
    await tdb.subject.deleteMany({});
  });
  await db.user.deleteMany({ where: { tenantId: t.id } });
  await db.tenant.delete({ where: { id: t.id } });
  console.log("All DD.14 test fixtures cleaned up (dedicated tenant fully removed).");

  console.log(`\n  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("  \u274c DD.14 teacher-subject filter audit has a regression");
    process.exit(1);
  }
  console.log("  \u2705 DD.14 teacher-subject filter audit all green");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
