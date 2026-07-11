import { PrismaClient } from '@prisma/client';
import { previewExamTimetableGeneration } from '../src/lib/services/exam-timetable-generator.service';
const prisma = new PrismaClient();

function check(name: string, cond: boolean) {
  console.log(cond ? `  ✓ ${name}` : `  ✗ FAIL: ${name}`);
  if (!cond) process.exitCode = 1;
}

async function main() {
  const tenant = await prisma.tenant.findFirstOrThrow({ where: { slug: 'uwezo-primary-junior' } });
  const principal = await prisma.user.findFirstOrThrow({ where: { tenantId: tenant.id, role: 'PRINCIPAL' } });
  const user = { ...principal, tenantId: tenant.id } as any;

  const classes = await prisma.schoolClass.findMany({ where: { tenantId: tenant.id, archived: false, level: 'Grade 7' } });
  const classIds = classes.map(c => c.id);
  const needs = await prisma.classSubjectNeed.findMany({ where: { classId: { in: classIds } } });
  const bySubject = new Map<string, string[]>();
  for (const n of needs) bySubject.set(n.subjectId, [...(bySubject.get(n.subjectId) ?? []), n.classId]);
  const sharedSubjectId = [...bySubject.entries()].find(([, cids]) => new Set(cids).size === classIds.length)?.[0]!;

  // Create a REAL CombinationGroup for just 2 of the 3 streams on this shared subject —
  // a deliberate school choice that should take priority over the inferred level-group.
  const twoStreamIds = classIds.slice(0, 2);
  const teacher = await prisma.user.findFirst({ where: { tenantId: tenant.id, role: 'TEACHER' } });
  const combo = await prisma.combinationGroup.create({
    data: {
      tenantId: tenant.id,
      name: 'Z6 Priority Test Combo',
      subjectId: sharedSubjectId,
      teacherId: teacher?.id ?? null,
      scope: 'SELECTED',
      source: 'MANUAL',
      active: true,
      members: { create: twoStreamIds.map((classId) => ({ tenantId: tenant.id, classId })) },
    },
  });

  const examName = `Z6 Combo Priority Test ${Date.now()}`;
  const preview = await previewExamTimetableGeneration(user, {
    examName,
    classIds,
    startDate: '2026-09-01',
    endDate: '2026-09-05',
    periods: [
      { label: 'Morning 1', startTime: '08:00', endTime: '10:00' },
      { label: 'Morning 2', startTime: '10:30', endTime: '12:30' },
      { label: 'Afternoon 1', startTime: '14:00', endTime: '16:00' },
    ],
    groupStreamsByLevel: true,
  });

  const slotsForSubject = preview.slots.filter((s: any) => s.subjectId === sharedSubjectId);
  const comboSlots = slotsForSubject.filter((s: any) => s.targetScope === 'COMBINATION');
  const streamGroupSlots = slotsForSubject.filter((s: any) => s.targetScope === 'STREAM_GROUP');
  console.log('combo slots:', comboSlots.length, 'stream-group slots:', streamGroupSlots.length);
  check('The real CombinationGroup (2 streams) takes priority — targetScope is COMBINATION, not STREAM_GROUP', comboSlots.length > 0);
  check('The 3rd stream (not in the combo) is scheduled independently, not folded into the 2-stream combo', comboSlots.every((s: any) => s.targetIds.length === 2));

  await prisma.combinationGroupClass.deleteMany({ where: { groupId: combo.id } });
  await prisma.combinationGroup.delete({ where: { id: combo.id } });
  console.log('cleanup done');

  console.log(process.exitCode === 1 ? '\n  ❌ Some checks FAILED' : '\n  ✅ Z.6 combination-group priority all green');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
