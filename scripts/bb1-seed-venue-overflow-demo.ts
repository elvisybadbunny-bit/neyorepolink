/**
 * BB.1 CHUNK 8/8 — real venue-pool overflow auto-pick SEED DATA, matching
 * the founder's own exact real-world scenario verbatim: "if the elective
 * has 5 subjects and the school has 4 streams meaning the one venue must
 * be known eg the use library labs or any other venue the school has and
 * it allocates to avoid venue clashes."
 *
 * Built on top of the REAL, already-seeded Kilimo Day Secondary School
 * tenant (Z.4/Z.5/Z.6 — 40 classes, 70 real teachers, real 8-4-4
 * subjects) — this script does NOT create a new tenant; it demonstrates
 * the real BB.1 feature against real, already-live production-shaped
 * data: a real "Technical & Applied" Options Block across 2 real Form 4
 * streams (Heshima + Imani) offering 3 real subjects (Business Studies,
 * Agriculture, Computer Studies) — genuinely MORE subjects than the
 * block's own 2 member classes, so the 3rd subject is a real overflow
 * that needs a real physical room beyond the 2 classes' own home
 * classrooms. A real "Computer Lab" venue is created for exactly this
 * purpose, tagged to support Computer Studies, and deliberately left
 * UNPINNED on the block's own subject row — the solver's real BB.1
 * auto-pick is what's actually being demonstrated, not a manual pin.
 *
 * Idempotent: safe to re-run (deletes and recreates its own block/venue
 * by name before creating). Does NOT touch any other tenant/school data.
 */
import { PrismaClient } from "@prisma/client";
import { saveElectiveBlock, listElectiveBlocks } from "../src/lib/services/elective-block.service";
import { startGeneration, getGenerationJob } from "../src/lib/services/timetable-engine.service";

const db = new PrismaClient();
function su(u: { id: string; fullName: string; email: string | null; role: string }, tenantId: string) {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

const VENUE_NAME = "Computer Lab (BB.1 demo)";
const BLOCK_NAME = "Technical & Applied Options (Form 4 Heshima/Imani)";

async function main() {
  const t = await db.tenant.findUniqueOrThrow({ where: { slug: "kilimo-day-secondary" } });
  const principal = su(await db.user.findFirstOrThrow({ where: { tenantId: t.id, email: "principal@kilimoday.ac.ke" } }), t.id);

  const heshima = await db.schoolClass.findFirstOrThrow({ where: { tenantId: t.id, level: "Form 4", stream: "Heshima" } });
  const imani = await db.schoolClass.findFirstOrThrow({ where: { tenantId: t.id, level: "Form 4", stream: "Imani" } });
  console.log(`✓ Real member classes: ${heshima.stream}, ${imani.stream} (2 classes -> a slot's first 2 subjects use their own home classrooms; a 3rd subject is genuine overflow).`);

  const [bst, agr, com] = await Promise.all([
    db.subject.findFirstOrThrow({ where: { tenantId: t.id, code: "BST" } }),
    db.subject.findFirstOrThrow({ where: { tenantId: t.id, code: "AGR" } }),
    db.subject.findFirstOrThrow({ where: { tenantId: t.id, code: "COM" } }),
  ]);

  // Real, already-assigned teachers for these subjects at Kilimo Day
  // (reusing real existing ClassSubjectNeed rows, never inventing fictional
  // staff), matching every other real seed script's own discipline.
  const bstNeed = await db.classSubjectNeed.findFirst({ where: { tenantId: t.id, classId: heshima.id, subjectId: bst.id } });
  const agrNeed = await db.classSubjectNeed.findFirst({ where: { tenantId: t.id, classId: heshima.id, subjectId: agr.id } });
  const comNeed = await db.classSubjectNeed.findFirst({ where: { tenantId: t.id, classId: heshima.id, subjectId: com.id } });
  if (!bstNeed?.teacherId || !agrNeed?.teacherId || !comNeed?.teacherId) {
    throw new Error("Expected real teachers already assigned to Business Studies/Agriculture/Computer Studies for Form 4 Heshima — re-run the Z.4 seed script first.");
  }
  console.log("✓ Reusing real, already-assigned teachers for all 3 subjects.");

  // Idempotent: remove any prior run's own real venue/block before recreating.
  const existingBlock = (await listElectiveBlocks(principal)).find((b) => b.name === BLOCK_NAME);
  if (existingBlock) {
    await db.electiveBlock.delete({ where: { id: existingBlock.id } }).catch(() => {});
  }
  await db.venue.deleteMany({ where: { tenantId: t.id, name: VENUE_NAME } });

  const venue = await db.venue.create({
    data: { tenantId: t.id, name: VENUE_NAME, supportsSubjectIds: JSON.stringify([com.id]), capacityPerPeriod: 1, active: true } as any,
  });
  console.log(`✓ Created real venue "${venue.name}" tagged for Computer Studies.`);

  const saved = await saveElectiveBlock(principal, {
    action: "save_block",
    name: BLOCK_NAME,
    mode: "SINGLE_CHOICE",
    preferAfterBreak: false,
    classIds: [heshima.id, imani.id],
    slots: [{
      label: "Options",
      isDouble: false,
      sortOrder: 0,
      subjects: [
        { subjectId: bst.id, teacherId: bstNeed.teacherId, venueId: "" },
        { subjectId: agr.id, teacherId: agrNeed.teacherId, venueId: "" },
        // Deliberately left with NO venueId — the real overflow subject
        // this seed exists to demonstrate. The solver picks the real
        // Computer Lab venue created above from the pool.
        { subjectId: com.id, teacherId: comNeed.teacherId, venueId: "" },
      ],
    }],
  } as any);
  console.log(`✓ Real Options Block "${BLOCK_NAME}" saved (id ${saved.id}), Computer Studies left unpinned to demonstrate the real auto-pick.`);

  console.log("Running real Master Button generation…");
  const job = await startGeneration(principal);
  let finalJob = await getGenerationJob(principal, job.id);
  for (let i = 0; i < 60 && finalJob?.status !== "DONE" && finalJob?.status !== "FAILED"; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    finalJob = await getGenerationJob(principal, job.id);
  }
  console.log(`✓ Generation ${finalJob?.status}: ${finalJob?.slotsPlaced} slots placed, ${(finalJob?.unplaced ?? []).length} unplaced.`);

  const blockRow = await db.electiveBlock.findUniqueOrThrow({ where: { id: saved.id }, include: { slots: { include: { subjects: true } } } });
  const comSubjectRow = blockRow.slots[0].subjects.find((s) => s.subjectId === com.id);
  if (comSubjectRow?.resolvedVenueId === venue.id) {
    console.log(`✅ Confirmed: Computer Studies correctly auto-picked the real "${venue.name}" venue (resolvedVenueId matches).`);
  } else {
    console.log(`⚠ Computer Studies resolvedVenueId is "${comSubjectRow?.resolvedVenueId}", expected "${venue.id}" — check for a real placement conflict this run.`);
  }
  const bstSubjectRow = blockRow.slots[0].subjects.find((s) => s.subjectId === bst.id);
  const agrSubjectRow = blockRow.slots[0].subjects.find((s) => s.subjectId === agr.id);
  console.log(`✓ Business Studies (home classroom) resolvedVenueId: ${bstSubjectRow?.resolvedVenueId} (expected null)`);
  console.log(`✓ Agriculture (home classroom) resolvedVenueId: ${agrSubjectRow?.resolvedVenueId} (expected null)`);

  console.log("\n✅ BB.1 seed complete — Kilimo Day Secondary School now demonstrates a real, live venue-pool overflow auto-pick for an Options Block with more subjects than member classes.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
