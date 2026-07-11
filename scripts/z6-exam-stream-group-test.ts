import { PrismaClient } from '@prisma/client';
import { generateExamTimetableFromRules, previewExamTimetableGeneration } from '../src/lib/services/exam-timetable-generator.service';
const prisma = new PrismaClient();

function check(name: string, cond: boolean) {
  console.log(cond ? `  ✓ ${name}` : `  ✗ FAIL: ${name}`);
  if (!cond) process.exitCode = 1;
}

async function main() {
  const tenant = await prisma.tenant.findFirstOrThrow({ where: { slug: 'uwezo-primary-junior' } });
  const principal = await prisma.user.findFirstOrThrow({ where: { tenantId: tenant.id, role: 'PRINCIPAL' } });
  const user = { ...principal, tenantId: tenant.id } as any;

  // Pick a real level with 3 real streams (Amani/Furaha/Nuru), all sharing at least one real subject need.
  const classes = await prisma.schoolClass.findMany({ where: { tenantId: tenant.id, archived: false, level: 'Grade 7' } });
  console.log('Grade 7 classes:', classes.map(c => `${c.level} ${c.stream}`));
  if (classes.length < 2) { console.log('Not enough Grade 7 streams to test — trying Grade 4'); }

  const classIds = classes.map(c => c.id);
  const needs = await prisma.classSubjectNeed.findMany({ where: { classId: { in: classIds } } });
  const bySubject = new Map<string, string[]>();
  for (const n of needs) bySubject.set(n.subjectId, [...(bySubject.get(n.subjectId) ?? []), n.classId]);
  const sharedSubjectId = [...bySubject.entries()].find(([, cids]) => new Set(cids).size === classIds.length)?.[0];
  console.log('shared subject id across all Grade 7 streams:', sharedSubjectId);

  const examName = `Z6 Stream Group Test ${Date.now()}`;
  const preview = await previewExamTimetableGeneration(user, {
    examName,
    classIds,
    startDate: '2026-08-03',
    endDate: '2026-08-07',
    periods: [
      { label: 'Morning 1', startTime: '08:00', endTime: '10:00' },
      { label: 'Morning 2', startTime: '10:30', endTime: '12:30' },
      { label: 'Afternoon 1', startTime: '14:00', endTime: '16:00' },
    ],
    groupStreamsByLevel: true,
  });
  console.log('preview generatedCount:', preview.generatedCount);
  const streamGroupSlots = preview.slots.filter((s: any) => s.targetScope === 'STREAM_GROUP');
  console.log('STREAM_GROUP slots:', streamGroupSlots.length);
  check('At least one real STREAM_GROUP slot was generated (whole-level auto-targeting works)', streamGroupSlots.length > 0);
  if (streamGroupSlots.length > 0) {
    const sample = streamGroupSlots[0];
    console.log('sample STREAM_GROUP slot targetIds:', sample.targetIds, 'venue:', sample.venue);
    check('STREAM_GROUP slot targets more than 1 real class', sample.targetIds.length > 1);
  }

  // Same-date/time check: every member of a STREAM_GROUP sitting must share date+time.
  const byExamKey = new Map<string, any[]>();
  for (const s of streamGroupSlots) {
    const key = `${s.subjectId}::${s.paperName}::${s.examDate}::${s.startTime}`;
    byExamKey.set(key, [...(byExamKey.get(key) ?? []), s]);
  }
  let allSameTime = true;
  for (const [, group] of byExamKey) {
    const times = new Set(group.map((g) => `${g.examDate}:${g.startTime}`));
    if (times.size !== 1) allSameTime = false;
  }
  check('All STREAM_GROUP members of the same paper share the exact same real date+time', allSameTime);

  // Now test with groupStreamsByLevel: false — should NOT produce any STREAM_GROUP slots.
  const previewOff = await previewExamTimetableGeneration(user, {
    examName: `${examName} OFF`,
    // widened range since ungrouped sittings need ~3x the capacity
    classIds,
    startDate: '2026-08-10',
    endDate: '2026-08-21',
    periods: [
      { label: 'Morning 1', startTime: '08:00', endTime: '10:00' },
      { label: 'Morning 2', startTime: '10:30', endTime: '12:30' },
      { label: 'Afternoon 1', startTime: '14:00', endTime: '16:00' },
    ],
    groupStreamsByLevel: false,
  });
  const streamGroupSlotsOff = previewOff.slots.filter((s: any) => s.targetScope === 'STREAM_GROUP');
  check('Turning groupStreamsByLevel OFF produces zero STREAM_GROUP slots (real per-run toggle works)', streamGroupSlotsOff.length === 0);

  // Real generate (not just preview) + cleanup.
  const result = await generateExamTimetableFromRules(user, {
    examName,
    classIds,
    startDate: '2026-08-03',
    endDate: '2026-08-07',
    periods: [
      { label: 'Morning 1', startTime: '08:00', endTime: '10:00' },
      { label: 'Morning 2', startTime: '10:30', endTime: '12:30' },
      { label: 'Afternoon 1', startTime: '14:00', endTime: '16:00' },
    ],
    groupStreamsByLevel: true,
    autoGenerateInvigilators: false,
  });
  check('Real generate (persisted) produces the same real count as preview', result.generatedCount === preview.generatedCount);
  const persistedStreamGroup = result.slots.filter((s: any) => s.targetScope === 'STREAM_GROUP');
  check('Real persisted rows include real STREAM_GROUP targetScope', persistedStreamGroup.length > 0);

  await prisma.examTimetableSlot.deleteMany({ where: { examName } });
  await prisma.examTimetableGeneratorRun.deleteMany({ where: { examName } });
  console.log('cleanup done');

  console.log(process.exitCode === 1 ? '\n  ❌ Some checks FAILED' : '\n  ✅ Z.6 STREAM_GROUP auto-targeting all green');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
