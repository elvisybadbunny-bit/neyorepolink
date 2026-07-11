import { PrismaClient } from '@prisma/client';
import { generateExamTimetableFromRules } from '../src/lib/services/exam-timetable-generator.service';
const prisma = new PrismaClient();
async function main() {
  const tenant = await prisma.tenant.findFirstOrThrow({ where: { slug: 'karibu-high' } });
  const principal = await prisma.user.findFirstOrThrow({ where: { tenantId: tenant.id, email: 'principal@karibuhigh.ac.ke' } });
  const user = { ...principal, tenantId: tenant.id } as any;
  const classes = await prisma.schoolClass.findMany({ where: { tenantId: tenant.id, archived: false }, take: 2 });
  console.log('classes:', classes.map(c => c.level + ' ' + c.stream));
  const result = await generateExamTimetableFromRules(user, {
    examName: `Quick Check ${Date.now()}`,
    classIds: classes.map(c => c.id),
    startDate: '2026-07-14',
    endDate: '2026-07-20',
    periods: [
      { label: 'Morning 1', startTime: '08:00', endTime: '10:00' },
      { label: 'Morning 2', startTime: '10:30', endTime: '12:30' },
      { label: 'Afternoon 1', startTime: '14:00', endTime: '16:00' },
    ],
    autoGenerateInvigilators: true,
  });
  console.log('generatedCount:', result.generatedCount);
  console.log('sample paper names:', [...new Set(result.slots.map((s:any) => s.paperName))]);
  console.log('invigilatorsGenerated:', result.invigilatorsGenerated);
  console.log('sample invigilator summary:', result.invigilatorSummary);
  // cleanup
  await prisma.examTimetableSlot.deleteMany({ where: { examName: result.run.examName } });
  await prisma.examTimetableGeneratorRun.deleteMany({ where: { examName: result.run.examName } });
  console.log('cleanup done');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
