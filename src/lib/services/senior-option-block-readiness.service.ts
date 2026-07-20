import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";
const parse = <T>(value: string, fallback: T): T => { try { return JSON.parse(value) as T; } catch { return fallback; } };

/** Server-side Phase B/C generation gate. Rechecks live resources and stale choices. */
export async function seniorMathSplitReady(user: SessionUser, level: string) {
  return withTenant(user.tenantId, async () => {
    const db = tenantDb();
    const classes = await db.schoolClass.findMany({ where: { level, archived: false }, select: { id: true } });
    const prefs = await db.studentPathwayPreference.findMany({ where: { isAllocated: true, student: { classId: { in: classes.map((c) => c.id) } } }, include: { pathway: true } });
    const groups = new Set(prefs.map((pref) => pref.pathway.pathwayGroup).filter(Boolean));
    const mixed = groups.has("STEM") && [...groups].some((group) => group !== "STEM");
    if (!mixed) return { ready: true, required: false };
    const run = await db.electiveBlockAutoBuildRun.findFirst({ where: { level, kind: "MATH_SPLIT", status: "CONFIRMED" }, orderBy: { confirmedAt: "desc" } });
    if (!run?.createdElectiveBlockId || !run.confirmedAt) return { ready: false, required: true, reason: `${level} contains STEM and non-STEM learners but has no confirmed five-period Core/Essential Mathematics split.` };
    if (prefs.some((pref) => pref.updatedAt > run.confirmedAt!)) return { ready: false, required: true, reason: `${level} pathway allocation changed after the Mathematics split. Rebuild it before generation.` };
    const block = await db.electiveBlock.findFirst({ where: { id: run.createdElectiveBlockId, active: true }, include: { slots: { include: { subjects: true } } } });
    if (!block || block.slots.length !== 5 || block.slots.some((slot) => !/^Mathematics\b/.test(slot.label) || slot.subjects.length !== 2)) return { ready: false, required: true, reason: `${level} Mathematics split must contain exactly five parallel slots with Core and Essential Mathematics.` };
    const subjectRows = block.slots[0].subjects;
    const subjects = await db.subject.findMany({ where: { id: { in: subjectRows.map((row) => row.subjectId) } }, select: { id: true, mathVariant: true } });
    if (!subjects.some((subject) => subject.mathVariant === "CORE") || !subjects.some((subject) => subject.mathVariant === "ESSENTIAL")) return { ready: false, required: true, reason: `${level} Mathematics split does not contain both real Mathematics variants.` };
    if (subjectRows.some((row) => !row.teacherId)) return { ready: false, required: true, reason: `${level} Mathematics split has an unassigned teacher.` };
    if (new Set(subjectRows.map((row) => row.teacherId)).size !== 2) return { ready: false, required: true, reason: `${level} Core and Essential Mathematics run together and require two different teachers.` };
    const teacherLinks = await db.teacherSubject.findMany({ where: { subjectId: { in: subjectRows.map((row) => row.subjectId) }, teacherId: { in: subjectRows.map((row) => row.teacherId!).filter(Boolean) } } });
    if (subjectRows.some((row) => !teacherLinks.some((link) => link.subjectId === row.subjectId && link.teacherId === row.teacherId))) return { ready: false, required: true, reason: `${level} Mathematics teacher qualification changed after confirmation. Rebuild Phase C.` };
    return { ready: true, required: true, blockId: block.id, slotCount: 5 };
  });
}

export async function seniorOptionBlocksReady(user: SessionUser, level: string) {
  return withTenant(user.tenantId, async () => {
    const db = tenantDb();
    const run = await db.electiveBlockAutoBuildRun.findFirst({ where: { level, kind: "ELECTIVES", status: "CONFIRMED" }, orderBy: { confirmedAt: "desc" } });
    if (!run?.createdElectiveBlockId || !run.confirmedAt) return { ready: false, reason: `No confirmed Phase B Option A/B/C build exists for ${level}.` };
    const [block, classes, portal] = await Promise.all([
      db.electiveBlock.findFirst({ where: { id: run.createdElectiveBlockId, active: true }, include: { slots: { include: { subjects: true } } } }),
      db.schoolClass.findMany({ where: { level, archived: false }, select: { id: true } }),
      db.subjectSelectionPortal.findFirst({ where: { targetLevel: level }, orderBy: { createdAt: "desc" }, include: { selections: true } }),
    ]);
    if (!block) return { ready: false, reason: `The confirmed ${level} Phase B block is missing or inactive.` };
    if (portal?.selections.some((selection) => selection.isConfirmed && selection.updatedAt > run.confirmedAt!)) return { ready: false, reason: `${level} has confirmed choices changed after Phase B. Rebuild A/B/C proof before generation.` };
    const activeStudents = await db.student.count({ where: { classId: { in: classes.map((c) => c.id) }, status: "ACTIVE", deletedAt: null } });
    const preview = parse<{ rows?: any[]; blockPlan?: { learnerProof?: { valid: boolean }[] } }>(run.previewJson, {});
    const proof = preview.blockPlan?.learnerProof ?? [];
    if (!proof.length || proof.some((row) => !row.valid) || proof.length !== activeStudents) return { ready: false, reason: `${level} learner proof covers ${proof.length}/${activeStudents} active learners. Rebuild Phase B.` };

    const counts = { A: 0, B: 0, C: 0 };
    for (const slot of block.slots) {
      if (/^Option A\b/.test(slot.label)) counts.A++;
      if (/^Option B\b/.test(slot.label)) counts.B++;
      if (/^Option C\b/.test(slot.label)) counts.C++;
      if (slot.subjects.length === 0) return { ready: false, reason: `${slot.label} has no real subject.` };
    }
    if (counts.A !== 5 || counts.B !== 5 || counts.C !== 5) return { ready: false, reason: `${level} needs A × 5, B × 5 and C × 5; found A ${counts.A}, B ${counts.B}, C ${counts.C}.` };

    // One representative row per subject (the same assignment repeats five times).
    const assignmentBySubject = new Map<string, any>();
    for (const slot of block.slots) for (const subject of slot.subjects) if (!assignmentBySubject.has(subject.subjectId)) assignmentBySubject.set(subject.subjectId, subject);
    const assignments = [...assignmentBySubject.values()];
    if (assignments.some((assignment) => !assignment.teacherId)) return { ready: false, reason: `${level} has an option subject without a teacher.` };
    const [teacherLinks, venues] = await Promise.all([
      db.teacherSubject.findMany({ where: { subjectId: { in: assignments.map((a) => a.subjectId) }, teacherId: { in: assignments.map((a) => a.teacherId) } } }),
      db.venue.findMany({ where: { id: { in: assignments.map((a) => a.venueId).filter(Boolean) }, active: true } }),
    ]);
    for (const assignment of assignments) {
      if (!teacherLinks.some((link) => link.subjectId === assignment.subjectId && link.teacherId === assignment.teacherId)) return { ready: false, reason: `A Phase C teacher qualification changed after confirmation. Rebuild ${level} resources.` };
      const row = preview.rows?.find((candidate) => candidate.subjectId === assignment.subjectId);
      if (row?.requiresSharedVenue && !assignment.venueId) return { ready: false, reason: `${row.subjectName} still needs a shared venue.` };
      if (assignment.venueId) {
        const venue = venues.find((candidate) => candidate.id === assignment.venueId);
        if (!venue || venue.learnerCapacity == null || venue.learnerCapacity < (row?.studentCount ?? 0)) return { ready: false, reason: `${row?.subjectName ?? "An option subject"}'s selected venue is missing or too small.` };
        if (!parse<string[]>(venue.supportsSubjectIds, []).includes(assignment.subjectId)) return { ready: false, reason: `${venue.name} is no longer tagged for ${row?.subjectName ?? "the assigned subject"}.` };
      }
    }
    return { ready: true, blockId: block.id, learnerProofCount: proof.length, slotCount: block.slots.length, resourceSubjectCount: assignments.length };
  });
}
