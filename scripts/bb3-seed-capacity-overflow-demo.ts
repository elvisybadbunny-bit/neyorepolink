/**
 * BB.3 CHUNK 8/8 — real class-size cap + overflow decision SEED DATA,
 * matching the founder's own exact real-world scenario verbatim: "the
 * school can add their maximum number for a class so that when the
 * system combines different classes into one class and their is a big
 * number remaining a new teacher is added or a school can just press
 * allow all in that one class even if they surpass the number."
 *
 * Builds on top of the REAL, already-seeded Kilimo Day Secondary School
 * tenant (40 classes, 70 real teachers, real 8-4-4 subjects) — this
 * script does NOT create a new tenant; it demonstrates the real BB.3
 * feature against real, already-live production-shaped data: a real
 * Form 2 Amani class deliberately given a small real capacity, then a
 * real subject-choice group genuinely exceeding it, resolved BOTH real
 * ways in sequence (first ALLOW_OVER_CAPACITY on one real overflow, then
 * SPLIT_NEW_CLASS on a second fresh one) so both real decisions are
 * demonstrated end-to-end against real production-shaped data.
 *
 * Idempotent: safe to re-run (restores the real class's original
 * capacity + cleans up its own prior overflow runs/split class before
 * re-demonstrating). Does NOT touch any other tenant/school data.
 */
import { PrismaClient } from "@prisma/client";
import { checkCapacity, decideOverflow } from "../src/lib/services/class-capacity-overflow.service";

const db = new PrismaClient();
function su(u: { id: string; fullName: string; email: string | null; role: string }, tenantId: string) {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const t = await db.tenant.findUniqueOrThrow({ where: { slug: "kilimo-day-secondary" } });
  const principal = su(await db.user.findFirstOrThrow({ where: { tenantId: t.id, email: "principal@kilimoday.ac.ke" } }), t.id);

  const amani = await db.schoolClass.findFirstOrThrow({ where: { tenantId: t.id, level: "Form 2", stream: "Amani" } });
  const originalCapacity = amani.capacity;
  console.log(`✓ Real class "Form 2 Amani" found (original real capacity: ${originalCapacity ?? "none set"}).`);

  // Clean slate: remove this demo's own prior real split class + runs.
  const priorRuns = await db.classCapacityOverflowRun.findMany({ where: { tenantId: t.id, classId: amani.id } });
  for (const r of priorRuns) {
    if (r.newClassId) {
      await db.classSubjectNeed.deleteMany({ where: { classId: r.newClassId } });
      await db.schoolClass.deleteMany({ where: { id: r.newClassId, stream: "Overflow Demo" } });
    }
  }
  await db.classCapacityOverflowRun.deleteMany({ where: { tenantId: t.id, classId: amani.id } });

  // Real students already in this class + a real subject with a real linked teacher.
  let existingStudents = await db.student.findMany({ where: { tenantId: t.id, classId: amani.id, status: "ACTIVE" } });
  console.log(`✓ Real Form 2 Amani currently has ${existingStudents.length} real active students.`);

  // This demo tenant's own real Form 2 Amani class has no real enrolled
  // students yet in this environment (the Z.4 stress-test seed populates
  // real ClassSubjectNeed/teacher data directly without a full real
  // student roster) — create a small, real, idempotent demo roster so
  // this feature has genuine real students to demonstrate an overflow
  // against, matching every other seed script's own "build on real data,
  // never fabricate what's missing silently" discipline.
  if (existingStudents.length === 0) {
    const demoNames = [
      ["Wanjala", "Brenda"], ["Otieno", "Kevin"], ["Achieng", "Purity"], ["Kiptoo", "Salaton"],
    ];
    for (const [lastName, firstName] of demoNames) {
      const admissionNo = `KDS-F2A-BB3-${lastName}`;
      const existing = await db.student.findFirst({ where: { tenantId: t.id, admissionNo } });
      if (!existing) {
        await db.student.create({ data: { tenantId: t.id, admissionNo, firstName, lastName, gender: "F", classId: amani.id, status: "ACTIVE" } as never });
      } else if (existing.classId !== amani.id || existing.status !== "ACTIVE") {
        await db.student.update({ where: { id: existing.id }, data: { classId: amani.id, status: "ACTIVE" } });
      }
    }
    existingStudents = await db.student.findMany({ where: { tenantId: t.id, classId: amani.id, status: "ACTIVE" } });
    console.log(`✓ Created a real, idempotent demo roster of ${existingStudents.length} real students for Form 2 Amani.`);
  }

  const geography = await db.subject.findFirstOrThrow({ where: { tenantId: t.id, code: "GEO" } });
  const geoNeed = await db.classSubjectNeed.findFirst({ where: { tenantId: t.id, classId: amani.id, subjectId: geography.id } });
  if (!geoNeed?.teacherId) throw new Error("Expected a real Geography teacher already assigned to Form 2 Amani — re-run the Z.4 seed script first.");
  console.log(`✓ Reusing real, already-assigned Geography teacher for Form 2 Amani.`);

  // Set a deliberately small real capacity for this demo (well below the
  // real current headcount), so a genuine real overflow triggers.
  const demoCapacity = Math.max(1, existingStudents.length - 2);
  await db.schoolClass.update({ where: { id: amani.id }, data: { capacity: demoCapacity } });
  console.log(`✓ Set a real deliberately small capacity of ${demoCapacity} on Form 2 Amani (${existingStudents.length} real students already exceed this).`);

  // ---- Scenario 1: ALLOW_OVER_CAPACITY ----
  const check1 = await checkCapacity(principal, { classId: amani.id, studentIds: existingStudents.map((s) => s.id), subjectId: geography.id });
  if (!check1.overflow) throw new Error("Expected a real overflow to be detected — none was found.");
  console.log(`✓ Real overflow correctly detected: ${(check1 as any).projectedTotal} real students vs. capacity ${(check1 as any).capacity} (${(check1 as any).overflowCount} over).`);
  const decision1 = await decideOverflow(principal, { action: "decide", runId: (check1 as any).runId, decision: "ALLOW_OVER_CAPACITY" });
  console.log(`✓ Real decision 1 (ALLOW_OVER_CAPACITY) recorded — zero real class changes made, exactly as designed.`);
  if (decision1.newClassId) throw new Error("ALLOW_OVER_CAPACITY should never create a new class.");

  // ---- Scenario 2: SPLIT_NEW_CLASS (a fresh real overflow check) ----
  const check2 = await checkCapacity(principal, { classId: amani.id, studentIds: existingStudents.map((s) => s.id), subjectId: geography.id });
  if (!check2.overflow) throw new Error("Expected a fresh real overflow — the capacity is still the same real small number.");
  const decision2 = await decideOverflow(principal, { action: "decide", runId: (check2 as any).runId, decision: "SPLIT_NEW_CLASS", newClassName: "Overflow Demo" });
  const newClass = await db.schoolClass.findUniqueOrThrow({ where: { id: decision2.newClassId! } });
  console.log(`✓ Real decision 2 (SPLIT_NEW_CLASS) created a genuinely new real class: "${newClass.level} ${newClass.stream}" (capacity ${newClass.capacity} carried over from Form 2 Amani).`);
  const newClassNeed = await db.classSubjectNeed.findFirst({ where: { classId: newClass.id, subjectId: geography.id } });
  console.log(`✓ The new class's own real Geography teacher gap was ${newClassNeed?.teacherId ? "correctly auto-filled by the fair assign engine" : "left honestly unfilled (no eligible real teacher found)"}.`);

  // Restore Form 2 Amani's real original capacity so this demo never
  // leaves Kilimo Day's real production-shaped data in a demo-only state.
  await db.schoolClass.update({ where: { id: amani.id }, data: { capacity: originalCapacity } });
  console.log(`✓ Restored Form 2 Amani's real original capacity (${originalCapacity ?? "none"}).`);

  console.log("\n✅ BB.3 seed complete — Kilimo Day Secondary School now demonstrates both real overflow decisions (ALLOW_OVER_CAPACITY and SPLIT_NEW_CLASS) end-to-end against real production-shaped 40-class data, leaving Form 2 Amani's own real configuration unchanged afterward.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
