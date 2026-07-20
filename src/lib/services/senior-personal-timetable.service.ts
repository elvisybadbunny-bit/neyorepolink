import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";

const parse = <T>(value: string | null | undefined, fallback: T): T => { try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } };
const familyOf = (label: string) => label.split("·")[0].trim();

export async function generateSeniorLearnerTimetableProofs(tenantId: string, generationJobId: string) {
  return withTenant(tenantId, async () => {
    const db = tenantDb();
    const classes = await db.schoolClass.findMany({ where: { archived: false }, select: { id: true, level: true, stream: true } });
    const seniorClasses = classes.filter((c) => /(?:Grade|Form)\s*(?:10|11|12)/i.test(c.level));
    if (!seniorClasses.length) return { valid: 0, invalid: 0, proofs: [] };
    const classIds = seniorClasses.map((c) => c.id);
    const [students, slots, subjects, prefs, portals] = await Promise.all([
      db.student.findMany({ where: { classId: { in: classIds }, status: "ACTIVE", deletedAt: null }, select: { id: true, firstName: true, lastName: true, admissionNo: true, classId: true } }),
      db.timetableSlot.findMany({ where: { classId: { in: classIds }, slotType: { in: ["ACADEMIC", "ELECTIVE_BLOCK"] } }, orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }] }),
      db.subject.findMany({ where: { archived: false }, select: { id: true, name: true, code: true, mathVariant: true } }),
      db.studentPathwayPreference.findMany({ where: { isAllocated: true }, include: { pathway: true } }),
      db.subjectSelectionPortal.findMany({ where: { targetLevel: { in: [...new Set(seniorClasses.map((c) => c.level))] } }, orderBy: { createdAt: "desc" }, include: { selections: true } }),
    ]);
    const electiveSlotIds = [...new Set(slots.map((slot) => slot.electiveBlockSlotId).filter((id): id is string => Boolean(id)))];
    const electiveSlots = await db.electiveBlockSlot.findMany({ where: { id: { in: electiveSlotIds } }, include: { block: { include: { classes: true } }, subjects: true } });
    const electiveById = new Map(electiveSlots.map((slot) => [slot.id, slot]));
    const mathSplitClassIds = new Set(electiveSlots.filter((slot) => familyOf(slot.label) === "Mathematics").flatMap((slot) => slot.block.classes.map((row) => row.classId)));
    const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
    const classById = new Map(seniorClasses.map((klass) => [klass.id, klass]));
    const prefByStudent = new Map(prefs.map((pref) => [pref.studentId, pref]));
    const selectionsByStudent = new Map<string, string[]>();
    for (const portal of portals) for (const selection of portal.selections) if (selection.isConfirmed && !selectionsByStudent.has(selection.studentId)) selectionsByStudent.set(selection.studentId, parse(selection.selectedSubjectIds, []));

    await db.seniorLearnerTimetableProof.deleteMany({ where: { generationJobId } });
    const output: any[] = [];
    for (const student of students) {
      const klass = classById.get(student.classId!)!;
      const selected = new Set(selectionsByStudent.get(student.id) ?? []);
      const pathwayGroup = prefByStudent.get(student.id)?.pathway.pathwayGroup ?? null;
      const expectedMathVariant = pathwayGroup === "STEM" ? "CORE" : pathwayGroup ? "ESSENTIAL" : null;
      const issues: string[] = [];
      const rows: any[] = [];
      const familySubjects: Record<string, string[]> = { "Option A": [], "Option B": [], "Option C": [], Mathematics: [] };
      const occupied = new Set<string>();
      for (const slot of slots.filter((candidate) => candidate.classId === student.classId)) {
        const timeKey = `${slot.dayOfWeek}:${slot.period}`;
        if (occupied.has(timeKey)) issues.push(`Two personal lessons resolve to day ${slot.dayOfWeek}, period ${slot.period}.`);
        occupied.add(timeKey);
        if (slot.slotType === "ACADEMIC" && slot.subjectId) {
          const subject = subjectById.get(slot.subjectId);
          rows.push({ dayOfWeek: slot.dayOfWeek, period: slot.period, kind: "CORE_OR_SUPPORT", subjectId: slot.subjectId, subjectName: subject?.name ?? "Subject", subjectCode: subject?.code ?? "", teacherId: slot.teacherId, venue: slot.venue });
          continue;
        }
        if (slot.slotType !== "ELECTIVE_BLOCK" || !slot.electiveBlockSlotId) continue;
        const definition = electiveById.get(slot.electiveBlockSlotId);
        if (!definition) { issues.push(`Missing block definition for day ${slot.dayOfWeek}, period ${slot.period}.`); continue; }
        const family = familyOf(definition.label);
        let candidates = definition.subjects.filter((row) => selected.has(row.subjectId));
        if (family === "Mathematics") candidates = definition.subjects.filter((row) => subjectById.get(row.subjectId)?.mathVariant === expectedMathVariant);
        if (candidates.length !== 1) {
          issues.push(`${family} at day ${slot.dayOfWeek}, period ${slot.period} resolves to ${candidates.length} subjects instead of one.`);
          continue;
        }
        const picked = candidates[0];
        const subject = subjectById.get(picked.subjectId);
        (familySubjects[family] ??= []).push(picked.subjectId);
        rows.push({ dayOfWeek: slot.dayOfWeek, period: slot.period, kind: family === "Mathematics" ? "MATHEMATICS_SPLIT" : "OPTION_BLOCK", family, subjectId: picked.subjectId, subjectName: subject?.name ?? "Subject", subjectCode: subject?.code ?? "", teacherId: picked.teacherId, venueId: picked.venueId ?? picked.resolvedVenueId });
      }
      for (const family of ["Option A", "Option B", "Option C"] as const) {
        const ids = familySubjects[family];
        if (ids.length !== 5) issues.push(`${family} has ${ids.length}/5 personal periods.`);
        if (new Set(ids).size > 1) issues.push(`${family} changes subject across the week.`);
      }
      if (expectedMathVariant && mathSplitClassIds.has(student.classId!)) {
        const ids = familySubjects.Mathematics;
        if (ids.length !== 5) issues.push(`Mathematics split has ${ids.length}/5 personal periods.`);
        if (new Set(ids).size > 1) issues.push("Mathematics variant changes across the week.");
      } else if (expectedMathVariant) {
        const ordinaryMath = rows.filter((row) => row.kind === "CORE_OR_SUPPORT" && subjectById.get(row.subjectId)?.mathVariant === expectedMathVariant);
        if (ordinaryMath.length !== 5) issues.push(`${expectedMathVariant === "CORE" ? "Core" : "Essential"} Mathematics has ${ordinaryMath.length}/5 personal periods.`);
      }
      const optionAId = familySubjects["Option A"][0] ?? null;
      const optionBId = familySubjects["Option B"][0] ?? null;
      const optionCId = familySubjects["Option C"][0] ?? null;
      for (const id of [optionAId, optionBId, optionCId]) if (id && !selected.has(id)) issues.push("Personal option subject is not in the learner's confirmed choices.");
      const valid = issues.length === 0;
      const proof = await db.seniorLearnerTimetableProof.create({ data: { generationJobId, studentId: student.id, classId: student.classId!, level: klass.level, valid, timetableJson: JSON.stringify(rows), issuesJson: JSON.stringify(issues), optionAId, optionBId, optionCId, mathVariant: expectedMathVariant } });
      output.push({ id: proof.id, studentId: student.id, studentName: `${student.firstName} ${student.lastName}`, admissionNo: student.admissionNo, className: [klass.level, klass.stream].filter(Boolean).join(" "), valid, issues, timetable: rows });
    }
    return { valid: output.filter((proof) => proof.valid).length, invalid: output.filter((proof) => !proof.valid).length, proofs: output };
  });
}

export async function latestSeniorLearnerProofs(user: SessionUser, studentId?: string) {
  return withTenant(user.tenantId, async () => {
    const db = tenantDb();
    const latestJob = await db.timetableGenerationJob.findFirst({ where: { status: "DONE" }, orderBy: { startedAt: "desc" } });
    if (!latestJob) return { job: null, proofs: [] };
    const proofs = await db.seniorLearnerTimetableProof.findMany({ where: { generationJobId: latestJob.id, ...(studentId ? { studentId } : {}) }, include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } }, orderBy: { createdAt: "asc" } });
    return { job: { id: latestJob.id, startedAt: latestJob.startedAt, valid: latestJob.learnerProofValid, invalid: latestJob.learnerProofInvalid }, proofs: proofs.map((proof) => ({ ...proof, studentName: `${proof.student.firstName} ${proof.student.lastName}`, admissionNo: proof.student.admissionNo, timetable: parse(proof.timetableJson, []), issues: parse(proof.issuesJson, []) })) };
  });
}
