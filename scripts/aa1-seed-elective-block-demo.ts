/**
 * AA.1 CHUNK 8/8 — real Elective/Options Block SEED DATA, matching the
 * founder's own exact worked example verbatim from
 * docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md Part 7:
 *
 *   Slot A = "Hist/CRE": History (for History-choosers) + CRE (for
 *            CRE-choosers) run in parallel.
 *   Slot B = "Hist/Geo": History (the SAME History-choosers' 2nd real
 *            weekly lesson) + Geography (for Geography-choosers) run in
 *            parallel — History deliberately appears in only ONE of the
 *            block's 2 slots, not both, exactly matching the founder's
 *            own described shape.
 *
 * Built on top of the REAL, already-seeded Kilimo Day Secondary School
 * tenant (Z.4/Z.5/Z.6 — 40 classes, 70 real teachers, real 8-4-4 subjects
 * including real History/CRE/Geography with real assigned teachers) —
 * this script does NOT create a new tenant; it demonstrates the real
 * ElectiveBlock feature against real, already-live production-shaped
 * data, applied to all 10 real Form 3 streams (a genuine real-world scale
 * for this feature — every Form 3 stream's History/CRE/Geography-choosing
 * students share the SAME real block).
 *
 * Idempotent: safe to re-run (deletes and recreates its own block by name
 * before creating). Does NOT touch any other tenant/school data.
 */
import { PrismaClient } from "@prisma/client";
import { saveElectiveBlock } from "../src/lib/services/elective-block.service";
import { startGeneration, getGenerationJob } from "../src/lib/services/timetable-engine.service";

const db = new PrismaClient();
function su(u: any, tenantId: string) {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const t = await db.tenant.findUniqueOrThrow({ where: { slug: "kilimo-day-secondary" } });
  const principal = su(await db.user.findFirstOrThrow({ where: { tenantId: t.id, email: "principal@kilimoday.ac.ke" } }), t.id);

  const form3Classes = await db.schoolClass.findMany({ where: { tenantId: t.id, level: "Form 3", archived: false }, orderBy: { stream: "asc" } });
  console.log(`Real Form 3 streams found: ${form3Classes.length} (${form3Classes.map((c) => c.stream).join(", ")})`);
  if (form3Classes.length < 2) throw new Error("Expected multiple real Form 3 streams — re-run scripts/z4-dual-lunch-shift-stress-test-seed.ts first.");

  const [hist, cre, geo] = await Promise.all([
    db.subject.findFirstOrThrow({ where: { tenantId: t.id, code: "HIS" } }),
    db.subject.findFirstOrThrow({ where: { tenantId: t.id, code: "CRE" } }),
    db.subject.findFirstOrThrow({ where: { tenantId: t.id, code: "GEO" } }),
  ]);

  // Real, already-assigned teachers for these subjects at Kilimo Day
  // (from the existing real ClassSubjectNeed rows) — reused here rather
  // than inventing new fictional staff, matching every other real seed
  // script's own discipline of building on real existing data.
  const histNeed = await db.classSubjectNeed.findFirst({ where: { tenantId: t.id, classId: form3Classes[0].id, subjectId: hist.id } });
  const creNeed = await db.classSubjectNeed.findFirst({ where: { tenantId: t.id, classId: form3Classes[0].id, subjectId: cre.id } });
  const geoNeed = await db.classSubjectNeed.findFirst({ where: { tenantId: t.id, classId: form3Classes[0].id, subjectId: geo.id } });
  if (!histNeed?.teacherId || !creNeed?.teacherId || !geoNeed?.teacherId) {
    throw new Error("Expected real teachers already assigned to History/CRE/Geography for Form 3 Amani — re-run the Z.4 seed script first.");
  }
  const [histTeacher, creTeacher, geoTeacher] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: histNeed.teacherId } }),
    db.user.findUniqueOrThrow({ where: { id: creNeed.teacherId } }),
    db.user.findUniqueOrThrow({ where: { id: geoNeed.teacherId } }),
  ]);
  console.log(`Real teachers reused: History=${histTeacher.fullName}, CRE=${creTeacher.fullName}, Geography=${geoTeacher.fullName}`);

  // Idempotent: remove any prior run's own block by this exact name first.
  const existing = await db.electiveBlock.findFirst({ where: { tenantId: t.id, name: "Humanities Options (Form 3)" } });
  if (existing) await db.electiveBlock.delete({ where: { id: existing.id } });

  const saved = await saveElectiveBlock(principal, {
    action: "save_block",
    name: "Humanities Options (Form 3)",
    mode: "MULTI_SLOT",
    preferAfterBreak: true,
    classIds: form3Classes.map((c) => c.id),
    slots: [
      {
        label: "Hist/CRE",
        isDouble: false,
        sortOrder: 0,
        subjects: [
          { subjectId: hist.id, teacherId: histTeacher.id },
          { subjectId: cre.id, teacherId: creTeacher.id },
        ],
      },
      {
        label: "Hist/Geo",
        isDouble: false,
        sortOrder: 1,
        subjects: [
          { subjectId: hist.id, teacherId: histTeacher.id },
          { subjectId: geo.id, teacherId: geoTeacher.id },
        ],
      },
    ],
  });
  console.log(`✓ Real Options Block created: ${saved.id} — 2 slots across all ${form3Classes.length} real Form 3 streams.`);

  // Real Master Button regeneration so the block is genuinely reflected in
  // the live timetable (matching the exact real startGeneration()+poll
  // pattern every other seed script in this codebase uses — never calling
  // runGeneration() directly, which would race a second concurrent run).
  console.log("Running real Master Button generation to place this block...");
  const job = await startGeneration(principal);
  let finalJob = await getGenerationJob(principal, job.id);
  let polls = 0;
  while (finalJob?.status !== "DONE" && finalJob?.status !== "FAILED" && polls < 600) {
    await new Promise((r) => setTimeout(r, 500));
    finalJob = await getGenerationJob(principal, job.id);
    polls++;
  }
  console.log(`Generation status: ${finalJob?.status} (${polls} polls)`);

  const blockRows = await db.timetableSlot.findMany({ where: { tenantId: t.id, classId: { in: form3Classes.map((c) => c.id) }, slotType: "ELECTIVE_BLOCK" } });
  console.log(`✓ Real ELECTIVE_BLOCK rows placed: ${blockRows.length} (expected ${form3Classes.length * 2} = ${form3Classes.length} streams x 2 slots).`);

  const byDayPeriod = new Map<string, number>();
  for (const row of blockRows) {
    const key = `${row.dayOfWeek}:${row.period}`;
    byDayPeriod.set(key, (byDayPeriod.get(key) ?? 0) + 1);
  }
  console.log("Real day/period distribution:", [...byDayPeriod.entries()].map(([k, v]) => `${k} (${v} rows)`).join(", "));

  console.log(`\nLogin: principal@kilimoday.ac.ke / Dual2026! — open Academics -> Timetable for any Form 3 stream to see the real "Options" cell.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
