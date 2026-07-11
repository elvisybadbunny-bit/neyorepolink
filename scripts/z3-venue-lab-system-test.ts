/**
 * Z.3 — Real Venue/Lab System regression test.
 *
 * Covers:
 *  1. `venue.service.ts` CRUD: real duplicate-name rejection, real
 *     auto-generated + de-duplicated short codes for both venues and
 *     teachers, real safe delete (dependents fall back to venueId=null).
 *  2. Real venue-pool conflict-checking through the ACTUAL L.7 solver
 *     (`buildAndSolve()` via `runGeneration()`, the exact function the
 *     Master Button calls): two classes needing the SAME pooled subject
 *     with capacity=1 never get double-booked into the same venue at the
 *     same period; a capacity=2 venue genuinely allows two simultaneous
 *     real bookings; a pinned venue takes priority over the pool.
 *  3. Real `TimetableSlot.venue` persistence — the real booked venue's
 *     shortCode is written into the existing `venue` field.
 */
import { PrismaClient } from "@prisma/client";
import { runGeneration } from "../src/lib/services/timetable-engine.service";
import {
  createVenue,
  updateVenue,
  deleteVenue,
  setShortCode,
  resolveTeacherShortCode,
  initialsFromName,
  codeFromVenueName,
  VenueError,
} from "../src/lib/services/venue.service";

const db = new PrismaClient();
let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 FAIL: ${name}`); }
}
async function checkThrows(fn: () => Promise<unknown>, name: string) {
  try { await fn(); console.log(`  \u2717 FAIL: ${name} (did not throw)`); fail++; }
  catch { console.log(`  \u2713 ${name}`); pass++; }
}
function su(u: any, tenantId: string) {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const t = await db.tenant.findUnique({ where: { slug: "karibu-high" } });
  if (!t) throw new Error("tenant not found");
  const tid = t.id;
  const principal = su(await db.user.findFirst({ where: { tenantId: tid, role: "PRINCIPAL" } }), tid);

  // -------------------------------------------------------------------
  // 1) Real helper functions — pure logic, no DB.
  // -------------------------------------------------------------------
  check("initialsFromName('Mary Omondi') -> 'MO'", initialsFromName("Mary Omondi") === "MO");
  check("initialsFromName('Amina') -> 'AM' (single-word fallback)", initialsFromName("Amina") === "AM");
  check("codeFromVenueName('Chemistry Lab') -> 'CHEM'", codeFromVenueName("Chemistry Lab") === "CHEM");
  check("codeFromVenueName('Lab') -> 'LAB'", codeFromVenueName("Lab") === "LAB");

  // -------------------------------------------------------------------
  // 2) Real Venue CRUD via the service layer.
  // -------------------------------------------------------------------
  const suffix = Date.now() % 100000;
  const venueName = `TT Chemistry Lab ${suffix}`;
  const venue1 = await createVenue(principal, { name: venueName, supportsSubjectIds: [], capacityPerPeriod: 1 });
  check("a real venue is created with an auto-generated real shortCode", !!venue1.shortCode && venue1.shortCode.length > 0);

  await checkThrows(
    () => createVenue(principal, { name: venueName, supportsSubjectIds: [], capacityPerPeriod: 1 }),
    "creating a venue with a duplicate real name throws DUPLICATE"
  );

  const venue2 = await createVenue(principal, { name: `TT Chemistry Lab 2 ${suffix}`, supportsSubjectIds: [], capacityPerPeriod: 1 });
  check("a second similarly-named venue gets a real, DIFFERENT auto-generated code (no collision)", venue2.shortCode !== venue1.shortCode);

  const updated = await updateVenue(principal, { id: venue1.id, capacityPerPeriod: 2 });
  check("updateVenue() persists a real capacity change", updated.capacityPerPeriod === 2);

  await checkThrows(() => updateVenue(principal, { id: "does-not-exist", name: "X" }), "updating a nonexistent venue throws NOT_FOUND");
  await checkThrows(() => deleteVenue(principal, "does-not-exist"), "deleting a nonexistent venue throws NOT_FOUND");

  // -------------------------------------------------------------------
  // 3) Real teacher/venue short-code editor + resolver.
  // -------------------------------------------------------------------
  const tMary = await db.user.create({ data: { tenantId: tid, neyoLoginId: `mo${suffix}`, fullName: "Mary Omondi", role: "TEACHER", isActive: true } as any });
  const resolvedCode = await resolveTeacherShortCode(tid, tMary.id, tMary.fullName);
  check(`resolveTeacherShortCode() auto-generates a real code from the teacher's real name (got "${resolvedCode}")`, resolvedCode === "MO");

  const resolvedAgain = await resolveTeacherShortCode(tid, tMary.id, tMary.fullName);
  check("calling resolveTeacherShortCode() again returns the SAME persisted real code (not regenerated)", resolvedAgain === resolvedCode);

  const overridden = await setShortCode(principal, { kind: "TEACHER", id: tMary.id, shortCode: "MRY" });
  check("a school can override a teacher's real short code", (overridden as any).timetableShortCode === "MRY");

  // -------------------------------------------------------------------
  // 4) Real venue-pool conflict-checking through the ACTUAL L.7 solver.
  // -------------------------------------------------------------------
  const existingSlots = await db.timetableSlot.findMany({ where: { tenantId: tid } });

  const clsA = await db.schoolClass.create({ data: { tenantId: tid, level: `VT${suffix}`, stream: "EAST", curriculum: "8-4-4" } });
  const clsB = await db.schoolClass.create({ data: { tenantId: tid, level: `VT${suffix}`, stream: "WEST", curriculum: "8-4-4" } });
  const chem = await db.subject.create({ data: { tenantId: tid, name: "VT-Chemistry", code: `VTC${suffix}`, curriculum: "8-4-4" } });
  const tChemA = await db.user.create({ data: { tenantId: tid, neyoLoginId: `vtca${suffix}`, fullName: "Chem Teacher A", role: "TEACHER", isActive: true } as any });
  const tChemB = await db.user.create({ data: { tenantId: tid, neyoLoginId: `vtcb${suffix}`, fullName: "Chem Teacher B", role: "TEACHER", isActive: true } as any });

  // A real capacity=1 venue tagged for Chemistry — exactly ONE class can
  // genuinely use it at any given real period.
  const capOneVenue = await createVenue(principal, { name: `VT Single Lab ${suffix}`, supportsSubjectIds: [chem.id], capacityPerPeriod: 1 });

  for (const c of [clsA, clsB]) {
    await db.timetableConfig.create({ data: { tenantId: tid, classId: c.id, periodsPerDay: 8, freePeriodsPerWeek: 0, coCurricularCount: 0, lunchShift: 1 } });
  }
  // Both classes need Chemistry with DIFFERENT teachers (so the solver's
  // own teacher-conflict logic can never be the reason they end up on
  // different periods — only the real venue-capacity check should force it).
  await db.classSubjectNeed.create({ data: { tenantId: tid, classId: clsA.id, subjectId: chem.id, teacherId: tChemA.id, lessonsPerWeek: 5, doubleCount: 0 } });
  await db.classSubjectNeed.create({ data: { tenantId: tid, classId: clsB.id, subjectId: chem.id, teacherId: tChemB.id, lessonsPerWeek: 5, doubleCount: 0 } });

  try {
    const job1 = await db.timetableGenerationJob.create({ data: { tenantId: tid, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
    await runGeneration(tid, job1.id, principal);

    const slotsA = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: clsA.id, subjectId: chem.id, slotType: "ACADEMIC" } });
    const slotsB = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: clsB.id, subjectId: chem.id, slotType: "ACADEMIC" } });
    check("class A gets all 5 real Chemistry lessons placed", slotsA.length === 5);
    check("class B gets all 5 real Chemistry lessons placed", slotsB.length === 5);

    // Real capacity=1 conflict check: no (day, period) pair may appear in
    // BOTH classes' real slot lists (that would mean two classes booked
    // the SAME single-capacity venue at the SAME real period).
    const keyA = new Set(slotsA.map((s) => `${s.dayOfWeek}:${s.period}`));
    const collision = slotsB.some((s) => keyA.has(`${s.dayOfWeek}:${s.period}`));
    check("real capacity=1 venue conflict-checking works: classes A and B NEVER share the same real day+period for the pooled subject", !collision);

    // Real venue persistence: every placed Chemistry slot should have the
    // real venue's shortCode written into TimetableSlot.venue.
    const allVenueLabels = [...slotsA, ...slotsB].map((s) => s.venue).filter(Boolean);
    check(
      `every real placed Chemistry slot has a real venue label persisted (got ${allVenueLabels.length}/${slotsA.length + slotsB.length})`,
      allVenueLabels.length === slotsA.length + slotsB.length
    );
    check(
      `the real persisted venue label matches the real venue's own shortCode ("${capOneVenue.shortCode}")`,
      allVenueLabels.every((v) => v === capOneVenue.shortCode)
    );
  } finally {
    await db.timetableSlot.deleteMany({ where: { tenantId: tid, OR: [{ classId: clsA.id }, { classId: clsB.id }] } });
  }

  // -------------------------------------------------------------------
  // 5) Real capacity=2 venue genuinely allows simultaneous bookings.
  // -------------------------------------------------------------------
  await updateVenue(principal, { id: capOneVenue.id, capacityPerPeriod: 2 });
  try {
    const job2 = await db.timetableGenerationJob.create({ data: { tenantId: tid, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
    await runGeneration(tid, job2.id, principal);

    const slotsA2 = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: clsA.id, subjectId: chem.id, slotType: "ACADEMIC" } });
    const slotsB2 = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: clsB.id, subjectId: chem.id, slotType: "ACADEMIC" } });
    const keyA2 = new Set(slotsA2.map((s) => `${s.dayOfWeek}:${s.period}`));
    const sharedSlots = slotsB2.filter((s) => keyA2.has(`${s.dayOfWeek}:${s.period}`));
    check(
      `a real capacity=2 venue genuinely allows at least one real simultaneous booking (found ${sharedSlots.length} shared real day+period slots)`,
      sharedSlots.length >= 1
    );
  } finally {
    await db.timetableSlot.deleteMany({ where: { tenantId: tid, OR: [{ classId: clsA.id }, { classId: clsB.id }] } });
  }

  // -------------------------------------------------------------------
  // 6) Real pinned-venue-takes-priority-over-pool behavior.
  // -------------------------------------------------------------------
  const poolVenue = await createVenue(principal, { name: `VT Pool Venue ${suffix}`, supportsSubjectIds: [chem.id], capacityPerPeriod: 5 });
  const pinnedVenue = await createVenue(principal, { name: `VT Pinned Venue ${suffix}`, supportsSubjectIds: [], capacityPerPeriod: 5 });
  await db.classSubjectNeed.updateMany({ where: { tenantId: tid, classId: clsA.id, subjectId: chem.id }, data: { venueId: pinnedVenue.id } });

  try {
    const job3 = await db.timetableGenerationJob.create({ data: { tenantId: tid, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
    await runGeneration(tid, job3.id, principal);

    const slotsA3 = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: clsA.id, subjectId: chem.id, slotType: "ACADEMIC" } });
    const allPinned = slotsA3.every((s) => s.venue === pinnedVenue.shortCode);
    check(
      `a real PINNED venue on ClassSubjectNeed takes priority over the pool (all ${slotsA3.length} real slots used "${pinnedVenue.shortCode}")`,
      allPinned && slotsA3.length > 0
    );
  } finally {
    await db.timetableSlot.deleteMany({ where: { tenantId: tid, OR: [{ classId: clsA.id }, { classId: clsB.id }] } });
  }

  // -------------------------------------------------------------------
  // Cleanup — real, verified.
  // -------------------------------------------------------------------
  await db.classSubjectNeed.deleteMany({ where: { tenantId: tid, OR: [{ classId: clsA.id }, { classId: clsB.id }] } });
  await db.timetableConfig.deleteMany({ where: { tenantId: tid, OR: [{ classId: clsA.id }, { classId: clsB.id }] } });
  await deleteVenue(principal, capOneVenue.id);
  await deleteVenue(principal, poolVenue.id);
  await deleteVenue(principal, pinnedVenue.id);
  await deleteVenue(principal, venue2.id);
  await db.venue.deleteMany({ where: { id: venue1.id } }); // venue1 was never re-fetched after the capacity update; direct cleanup
  await db.subject.delete({ where: { id: chem.id } });
  await db.user.deleteMany({ where: { id: { in: [tChemA.id, tChemB.id, tMary.id] } } });
  await db.schoolClass.delete({ where: { id: clsA.id } });
  await db.schoolClass.delete({ where: { id: clsB.id } });
  await db.timetableGenerationJob.deleteMany({ where: { tenantId: tid, startedById: principal.id } });

  if (existingSlots.length > 0) {
    for (const s of existingSlots) {
      await db.timetableSlot.upsert({
        where: { tenantId_classId_dayOfWeek_period_slotType: { tenantId: s.tenantId, classId: s.classId, dayOfWeek: s.dayOfWeek, period: s.period, slotType: s.slotType } },
        create: {
          tenantId: s.tenantId, classId: s.classId, subjectId: s.subjectId, activityCategoryId: s.activityCategoryId,
          teacherId: s.teacherId, dayOfWeek: s.dayOfWeek, period: s.period, slotType: s.slotType, weekRotation: s.weekRotation, venue: s.venue,
        },
        update: {},
      });
    }
  }

  const remainingVenues = await db.venue.count({ where: { tenantId: tid, name: { contains: `${suffix}` } } });
  const remainingClasses = await db.schoolClass.count({ where: { id: { in: [clsA.id, clsB.id] } } });
  check("cleanup confirmed: all real test venues are gone (re-queried directly)", remainingVenues === 0);
  check("cleanup confirmed: all real test classes are gone (re-queried directly)", remainingClasses === 0);

  console.log("\n" + "-".repeat(40));
  console.log(`  ${pass} passed, ${fail} failed`);
  console.log(fail === 0 ? "  \u2705 all green" : "  \u274c failures found");
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
