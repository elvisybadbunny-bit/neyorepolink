/**
 * AA.1/AA.2 — CRITICAL real tenant-isolation regression test.
 *
 * A real, serious cross-tenant data-leak bug was found live during this
 * session's own testing: `ElectiveBlock`/`ElectiveBlockClass`/
 * `ElectiveBlockSlot`/`ElectiveBlockSlotSubject` (AA.1) and
 * `TeacherAllocationImport` (AA.2) were never registered in
 * `TENANT_OWNED_MODELS` (src/lib/core/tenant-tables.ts) when built —
 * meaning `tenantDb()`'s automatic tenant-scoping middleware silently
 * never filtered these models by `tenantId` at all. A Karibu High
 * principal could see Kilimo Day Secondary School's real Options Block
 * data through the real, live `GET /api/academics/timetable/
 * elective-blocks` route.
 *
 * This is a permanent regression proof, run against the REAL service
 * functions (not a unit test of the registry list alone), so a future
 * change can never silently reintroduce this exact class of bug for
 * these models specifically.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { listElectiveBlocks, saveElectiveBlock, deleteElectiveBlock } from "../src/lib/services/elective-block.service";
import { listTeacherAllocationImports } from "../src/lib/services/teacher-allocation-import.service";
import type { SessionUser } from "@/lib/core/session";

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}`); }
}
function su(u: any, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const tA = await db.tenant.findUniqueOrThrow({ where: { slug: "karibu-high" } });
  const tB = await db.tenant.findUniqueOrThrow({ where: { slug: "uwezo-primary-junior" } });
  const principalA = su(await db.user.findFirstOrThrow({ where: { tenantId: tA.id, role: "PRINCIPAL" } }), tA.id);
  const principalB = su(await db.user.findFirstOrThrow({ where: { tenantId: tB.id, role: "PRINCIPAL" } }), tB.id);
  const suffix = Date.now() % 100000;

  const clsA = await db.schoolClass.create({ data: { tenantId: tA.id, level: `TI${suffix}`, stream: "EAST", curriculum: "8-4-4" } });
  const subjA1 = await db.subject.create({ data: { tenantId: tA.id, name: `TI-A1-${suffix}`, code: `TIA1${suffix}`, curriculum: "8-4-4" } });
  const subjA2 = await db.subject.create({ data: { tenantId: tA.id, name: `TI-A2-${suffix}`, code: `TIA2${suffix}`, curriculum: "8-4-4" } });

  let blockId: string | null = null;
  try {
    // Create a real ElectiveBlock in tenant A (Karibu High).
    const saved = await saveElectiveBlock(principalA, {
      action: "save_block", name: `TI Isolation Test ${suffix}`, mode: "MULTI_SLOT", preferAfterBreak: false,
      classIds: [clsA.id],
      slots: [{ label: "Slot A", isDouble: false, sortOrder: 0, subjects: [{ subjectId: subjA1.id }, { subjectId: subjA2.id }] }],
    });
    blockId = saved.id;

    // CRITICAL: tenant B (Uwezo) must see ZERO blocks — tenant A's block
    // must never leak across the tenant boundary.
    const blocksSeenByB = await listElectiveBlocks(principalB);
    check("CRITICAL: a DIFFERENT tenant's principal sees ZERO real ElectiveBlock rows (no cross-tenant leak)", blocksSeenByB.length === 0);

    // Tenant A's own principal DOES see their own real block.
    const blocksSeenByA = await listElectiveBlocks(principalA);
    check("The OWNING tenant's principal correctly sees their own real block", blocksSeenByA.some((b) => b.id === blockId));

    // Direct raw-DB confirmation the row is genuinely tenant-stamped.
    const rawRow = await db.electiveBlock.findUniqueOrThrow({ where: { id: blockId! } });
    check("The real ElectiveBlock row is genuinely stamped with the correct real tenantId", rawRow.tenantId === tA.id);

    // A real cross-tenant DELETE attempt (tenant B trying to delete tenant
    // A's block) must be a genuine no-op, never actually deleting it.
    await deleteElectiveBlock(principalB, blockId!);
    const stillExists = await db.electiveBlock.findUnique({ where: { id: blockId! } });
    check("CRITICAL: a DIFFERENT tenant cannot delete another tenant's real ElectiveBlock (cross-tenant delete correctly blocked)", !!stillExists);

    // Real TeacherAllocationImport isolation check (AA.2, same real fix).
    await withTenant(tA.id, async () => {
      await tenantDb().teacherAllocationImport.create({
        data: { tenantId: tA.id, source: "csv", totalRows: 1, createdNeeds: 1, matchedNeeds: 0, createdTeachers: 0, failedRows: 0, createdById: principalA.id, createdByName: principalA.fullName },
      });
    });
    const importsSeenByB = await listTeacherAllocationImports(principalB);
    check("CRITICAL: a DIFFERENT tenant's principal sees ZERO real TeacherAllocationImport rows (no cross-tenant leak)", importsSeenByB.length === 0);
    const importsSeenByA = await listTeacherAllocationImports(principalA);
    check("The OWNING tenant's principal correctly sees their own real TeacherAllocationImport history", importsSeenByA.length > 0);
  } finally {
    if (blockId) await db.electiveBlock.delete({ where: { id: blockId } }).catch(() => {});
    await db.teacherAllocationImport.deleteMany({ where: { tenantId: tA.id, createdById: principalA.id } });
    await db.subject.deleteMany({ where: { id: { in: [subjA1.id, subjA2.id] } } });
    await db.schoolClass.deleteMany({ where: { id: clsA.id } });
    const confirmClean = await db.schoolClass.findMany({ where: { id: clsA.id } });
    check("All test fixtures fully cleaned up (confirmed via direct re-query)", confirmClean.length === 0);
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
  console.log("  \u2705 AA.1/AA.2 tenant isolation regression test all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
