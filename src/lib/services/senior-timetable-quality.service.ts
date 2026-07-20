import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
const parse = <T>(value: string, fallback: T): T => { try { return JSON.parse(value) as T; } catch { return fallback; } };

type Finding = { code: string; title: string; count: number; examples: string[]; advisory: true };
export async function buildSeniorTimetableQualityReport(tenantId: string, generationJobId: string) {
  return withTenant(tenantId, async () => {
    const db = tenantDb();
    const [proofs, subjects, configs] = await Promise.all([
      db.seniorLearnerTimetableProof.findMany({ where: { generationJobId }, select: { studentId: true, classId: true, timetableJson: true, valid: true } }),
      db.subject.findMany({ select: { id: true, name: true, code: true, departmentId: true } }),
      db.timetableConfig.findMany({ select: { classId: true, periodsPerDay: true } }),
    ]);
    const realStudents = await db.student.findMany({ where: { id: { in: proofs.map((proof) => proof.studentId) } }, select: { id: true, firstName: true, lastName: true, admissionNo: true } });
    const studentById = new Map(realStudents.map((student) => [student.id, student]));
    const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
    const periodsByClass = new Map(configs.map((config) => [config.classId, config.periodsPerDay]));
    const buckets = new Map<string, { title: string; examples: Set<string>; count: number }>();
    const add = (code: string, title: string, example: string) => { const row = buckets.get(code) ?? { title, examples: new Set<string>(), count: 0 }; row.count++; if (row.examples.size < 12) row.examples.add(example); buckets.set(code, row); };

    for (const proof of proofs) {
      if (!proof.valid) continue; // Phase E reports structural failures separately.
      const student = studentById.get(proof.studentId);
      const learner = student ? `${student.firstName} ${student.lastName} (${student.admissionNo})` : proof.studentId;
      const rows = parse<any[]>(proof.timetableJson, []).filter((row) => row.subjectId && subjectById.get(row.subjectId)?.code !== "LUNCH");
      const midpoint = Math.ceil((periodsByClass.get(proof.classId) ?? 8) / 2);
      const bySubject = new Map<string, any[]>();
      for (const row of rows) { const list = bySubject.get(row.subjectId) ?? []; list.push(row); bySubject.set(row.subjectId, list); }
      for (const [subjectId, subjectRows] of bySubject) {
        const subject = subjectById.get(subjectId); if (!subject || subjectRows.length < 4) continue;
        const morning = subjectRows.filter((row) => row.period <= midpoint).length;
        const afternoon = subjectRows.length - morning;
        if (Math.max(morning, afternoon) / subjectRows.length > 0.75) add("DAY_HALF_IMBALANCE", "Subject heavily concentrated in one half of the day", `${learner}: ${subject.name} ${morning} morning/${afternoon} afternoon`);
        const days = new Set(subjectRows.map((row) => row.dayOfWeek));
        if (subjectRows.length >= 5 && days.size < 4) add("POOR_WEEK_SPREAD", "Five-period subject is concentrated on too few days", `${learner}: ${subject.name} across ${days.size} day(s)`);
        const perDay = new Map<number, number>(); subjectRows.forEach((row) => perDay.set(row.dayOfWeek, (perDay.get(row.dayOfWeek) ?? 0) + 1));
        if ([...perDay.values()].some((count) => count >= 3)) add("THREE_IN_ONE_DAY", "Subject appears three or more times in one day", `${learner}: ${subject.name}`);
      }
      const byDay = new Map<number, any[]>();
      for (const row of rows) { const list = byDay.get(row.dayOfWeek) ?? []; list.push(row); byDay.set(row.dayOfWeek, list); }
      for (const [day, dayRows] of byDay) {
        dayRows.sort((a,b)=>a.period-b.period);
        for (let i=1;i<dayRows.length;i++) {
          const prev=dayRows[i-1], current=dayRows[i];
          if (current.period !== prev.period + 1 || current.subjectId === prev.subjectId) continue; // genuine same-subject doubles are reviewed elsewhere
          const a=subjectById.get(prev.subjectId), b=subjectById.get(current.subjectId);
          if (a?.departmentId && a.departmentId === b?.departmentId) add("SIMILAR_ADJACENCY", "Different subjects from the same department are consecutive", `${learner}: day ${day}, ${a.name} → ${b.name}`);
        }
      }
    }
    const findings: Finding[] = [...buckets.entries()].map(([code,row])=>({code,title:row.title,count:row.count,examples:[...row.examples],advisory:true as const})).sort((a,b)=>b.count-a.count||a.code.localeCompare(b.code));
    const score = Math.max(0, 100 - findings.reduce((sum,finding)=>sum + Math.min(20, finding.count), 0));
    const report = { status: findings.length ? "REVIEW" : "PASS", score, learnersAnalysed: proofs.filter((proof)=>proof.valid).length, findings, generatedAt: new Date().toISOString(), method: "DETERMINISTIC_RULES" };
    await db.timetableGenerationJob.update({ where: { id: generationJobId }, data: { qualityReportJson: JSON.stringify(report) } });
    return report;
  });
}
