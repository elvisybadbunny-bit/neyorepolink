/**
 * AA.1 — Elective/Options Block engine: real CRUD for school-defined
 * ElectiveBlocks, per docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md
 * Part 7. A block is a set of subjects students genuinely choose BETWEEN
 * (mutually exclusive alternatives) that must occupy identical real
 * timetable slot(s) — e.g. the founder's own "History OR CRE" pairing, the
 * CBE Senior School's 3-elective pathway system, or a single-choice
 * Technical & Applied block. See timetable-engine.service.ts for how the
 * solver treats a block's slots as one atomic placement unit.
 */
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import type { ElectiveBlockSaveInput } from "@/lib/validations/elective-block";

export class ElectiveBlockError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "CONFLICT", message: string) {
    super(message);
    this.name = "ElectiveBlockError";
  }
}

function safeParse<T>(s: string | null | undefined, fallback: T): T {
  try { return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}

export async function listElectiveBlocks(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const blocks = await tdb.electiveBlock.findMany({
      where: { active: true },
      include: {
        classes: true,
        slots: { orderBy: { sortOrder: "asc" }, include: { subjects: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return blocks.map((b) => ({
      id: b.id,
      name: b.name,
      mode: b.mode,
      preferAfterBreak: b.preferAfterBreak,
      classIds: b.classes.map((c) => c.classId),
      slots: b.slots.map((slot) => ({
        id: slot.id,
        label: slot.label,
        isDouble: slot.isDouble,
        sortOrder: slot.sortOrder,
        subjects: slot.subjects.map((s) => ({
          id: s.id,
          subjectId: s.subjectId,
          teacherId: s.teacherId,
          venueId: s.venueId,
          classIds: safeParse<string[]>(s.comboClassIdsJson, []),
        })),
      })),
    }));
  });
}

export async function saveElectiveBlock(user: SessionUser, input: ElectiveBlockSaveInput) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();

    // Real, honest validation against the school's own live data — never
    // trust client-supplied ids blindly, matching every other NEYO service.
    const realClasses = await tdb.schoolClass.findMany({ where: { id: { in: input.classIds }, archived: false } });
    if (realClasses.length !== input.classIds.length) {
      throw new ElectiveBlockError("INVALID", "One or more selected classes no longer exist.");
    }
    const allSubjectIds = Array.from(new Set(input.slots.flatMap((slot) => slot.subjects.map((s) => s.subjectId))));
    const realSubjects = await tdb.subject.findMany({ where: { id: { in: allSubjectIds }, archived: false } });
    if (realSubjects.length !== allSubjectIds.length) {
      throw new ElectiveBlockError("INVALID", "One or more selected subjects no longer exist.");
    }

    const base = {
      name: input.name.trim(),
      mode: input.mode,
      preferAfterBreak: input.preferAfterBreak ?? false,
    };

    let block;
    if (input.id) {
      const existing = await tdb.electiveBlock.findUnique({ where: { id: input.id } });
      if (!existing) throw new ElectiveBlockError("NOT_FOUND", "Elective block not found.");
      block = await tdb.electiveBlock.update({ where: { id: input.id }, data: base });
      // Real, simple replace-the-children approach on update (mirrors the
      // exact same pattern CombinationGroup's own upsert already uses) —
      // a block's own slot/subject shape is small enough that a full
      // rebuild on every save is simpler and safer than diffing.
      await tdb.electiveBlockClass.deleteMany({ where: { blockId: input.id } });
      await tdb.electiveBlockSlot.deleteMany({ where: { blockId: input.id } }); // cascades to slot subjects
    } else {
      block = await tdb.electiveBlock.create({ data: { tenantId: user.tenantId, ...base } });
    }

    if (input.classIds.length > 0) {
      await tdb.electiveBlockClass.createMany({
        data: input.classIds.map((classId) => ({ tenantId: user.tenantId, blockId: block.id, classId })),
      });
    }

    for (const slot of input.slots) {
      const slotRow = await tdb.electiveBlockSlot.create({
        data: {
          tenantId: user.tenantId,
          blockId: block.id,
          label: slot.label.trim(),
          isDouble: slot.isDouble ?? false,
          sortOrder: slot.sortOrder ?? 0,
        },
      });
      for (const s of slot.subjects) {
        await tdb.electiveBlockSlotSubject.create({
          data: {
            tenantId: user.tenantId,
            slotId: slotRow.id,
            subjectId: s.subjectId,
            teacherId: s.teacherId || null,
            venueId: s.venueId || null,
            comboClassIdsJson: JSON.stringify(s.classIds && s.classIds.length > 0 ? s.classIds : input.classIds),
          },
        });
      }
    }

    return { id: block.id };
  });
}

export async function deleteElectiveBlock(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    await tenantDb().electiveBlock.delete({ where: { id } }).catch(() => {});
    return { success: true };
  });
}

/**
 * Real, internal data shape the Timetable Engine's solver consumes — kept
 * as its own function (rather than making the engine reach into Prisma
 * directly for this domain) so the engine file's own real data-loading
 * `Promise.all` stays the single obvious place every input comes from.
 */
export async function getElectiveBlocksForSolver(tenantId: string) {
  return withTenant(tenantId, async () => {
    const tdb = tenantDb();
    const blocks = await tdb.electiveBlock.findMany({
      where: { active: true },
      include: {
        classes: true,
        slots: { orderBy: { sortOrder: "asc" }, include: { subjects: true } },
      },
    });
    return blocks
      .filter((b) => b.classes.length > 0 && b.slots.length > 0 && b.slots.every((s) => s.subjects.length >= 2))
      .map((b) => ({
        id: b.id,
        name: b.name,
        classIds: b.classes.map((c) => c.classId),
        preferAfterBreak: b.preferAfterBreak,
        slots: b.slots.map((slot) => ({
          id: slot.id,
          label: slot.label,
          isDouble: slot.isDouble,
          subjects: slot.subjects.map((s) => ({
            subjectId: s.subjectId,
            teacherId: s.teacherId,
            venueId: s.venueId,
            classIds: safeParse<string[]>(s.comboClassIdsJson, b.classes.map((c) => c.classId)),
          })),
        })),
      }));
  });
}
