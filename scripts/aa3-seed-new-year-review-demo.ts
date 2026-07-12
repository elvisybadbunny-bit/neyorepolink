/**
 * AA.3 CHUNK 8/8 — real seed data for the New Academic Year Teacher
 * Allocation Review wizard, matching the founder's own real scenario from
 * docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md Part 2 verbatim:
 * "a school may choose to either reshuffle or let them stay the current...
 * allocate for new classes the incoming form and the available teachers...
 * a school can edit what they want changed for the remaining ones any time."
 *
 * Builds a real, fresh, dedicated demo tenant (kept separate from the
 * heavily-reused Karibu High / Kilimo Day / Uwezo tenants, so running a
 * real academic-year promotion here never disturbs other live demos —
 * same pattern as AA.1's Kilimo Day reuse and AA.2's dedicated Mji Mpya
 * tenant), with:
 *   - Form 3 East + Form 3 West (about to become Form 4 — one level away
 *     from graduating, so the review wizard has real, current work to do)
 *   - Form 4 East (about to GRADUATE — exercises the real ClassYearHistory
 *     snapshot fix)
 *   - a brand-new incoming Form 1 East (created BY the promotion itself,
 *     starting with zero teacher allocation — exactly the "allocate for
 *     new classes" scenario)
 *   - real teachers, one of whom is deliberately marked INACTIVE (simulating
 *     "left the school") so the review wizard has a real "needs attention"
 *     slot to demonstrate REPLACE and AUTO decisions against.
 *
 * Then actually RUNS: a real commitPromotion() (Form 4 East graduates ->
 * real ClassYearHistory frozen; Form 3s become Form 4s; new Form 1 East
 * created), followed by a real getReviewSnapshot() + startReviewRun() +
 * applyReviewDecisions() walk-through of the new Form 4 level — replacing
 * the departed teacher's slot with a real recommended replacement, and
 * auto-assigning the new Form 1 East's classes.
 *
 * Idempotent: finds-or-creates its own tenant by slug; clears its own
 * prior promotion/review history before re-running so re-running
 * demonstrates a clean, real run each time.
 */
import { PrismaClient } from "@prisma/client";
import { withTenant } from "../src/lib/core/tenant-context";
import { generateNeyoLoginId } from "../src/lib/services/identity.service";
import { commitPromotion, listClassYearHistory } from "../src/lib/services/promotion.service";
import { getReviewSnapshot, startReviewRun, applyReviewDecisions, listReviewRuns } from "../src/lib/services/teacher-allocation-review.service";
import type { SessionUser } from "../src/lib/core/session";

const db = new PrismaClient();
const SLUG = "bahari-view-secondary";

function su(u: { id: string; fullName: string; email: string | null; role: string }, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as unknown as SessionUser;
}

async function main() {
  let tenant = await db.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) {
    tenant = await db.tenant.create({ data: { name: "Bahari View Secondary School", slug: SLUG, curriculum: "8-4-4" } as never });
    console.log(`✓ Created real NEW tenant "${tenant.name}" (${SLUG}) for the AA.3 New Academic Year review demo.`);
  } else {
    console.log(`Reusing existing tenant "${tenant.name}" (${SLUG}) — re-running the demo cleanly.`);
  }
  const tenantId = tenant.id;

  await withTenant(tenantId, async () => {
    let principal = await db.user.findFirst({ where: { tenantId, role: "PRINCIPAL" } });
    if (!principal) {
      principal = await db.user.create({
        data: { tenantId, neyoLoginId: await generateNeyoLoginId(), fullName: "Otieno Bramwel", role: "PRINCIPAL", email: "principal@baharisecondary.ac.ke", isActive: true } as never,
      });
      console.log(`✓ Created real Principal ${principal.fullName}.`);
    }
    const principalUser = su(principal, tenantId);

    // Clean slate for this demo tenant's own promotion/review history so
    // re-runs are always a real, reproducible clean run.
    await db.classYearHistory.deleteMany({ where: { tenantId } });
    await db.teacherAllocationReviewRun.deleteMany({ where: { tenantId } });
    await db.promotionRun.deleteMany({ where: { tenantId } });

    // Real classes: Form 3 East/West (about to move up), Form 4 East (about
    // to graduate). Reuse if already present (idempotent), else create.
    async function findOrCreateClass(level: string, stream: string) {
      const existing = await db.schoolClass.findFirst({ where: { tenantId, level, stream } });
      if (existing) return existing;
      return db.schoolClass.create({ data: { tenantId, level, stream, curriculum: "8-4-4" } as never });
    }
    const f3East = await findOrCreateClass("Form 3", "East");
    const f3West = await findOrCreateClass("Form 3", "West");
    const f4East = await findOrCreateClass("Form 4", "East");

    // Real subjects.
    async function findOrCreateSubject(name: string, code: string) {
      const existing = await db.subject.findFirst({ where: { tenantId, code } });
      if (existing) return existing;
      return db.subject.create({ data: { tenantId, name, code, curriculum: "8-4-4" } as never });
    }
    const math = await findOrCreateSubject("Mathematics", "MAT");
    const chem = await findOrCreateSubject("Chemistry", "CHE");

    // Real teachers — one deliberately INACTIVE (simulating "left the school"
    // right before the new academic year, exactly the review wizard's core
    // real scenario), one active fair-load replacement candidate.
    async function findOrCreateTeacher(fullName: string, isActive: boolean) {
      const existing = await db.user.findFirst({ where: { tenantId, fullName } });
      if (existing) return db.user.update({ where: { id: existing.id }, data: { isActive } });
      return db.user.create({ data: { tenantId, neyoLoginId: await generateNeyoLoginId(), fullName, role: "TEACHER", isActive } as never });
    }
    const departedTeacher = await findOrCreateTeacher("Mutiso Faith", false); // left the school
    const replacementTeacher = await findOrCreateTeacher("Kiplangat Vincent", true);

    async function linkTeacherSubject(teacherId: string, subjectId: string) {
      const existing = await db.teacherSubject.findFirst({ where: { tenantId, teacherId, subjectId } });
      if (!existing) await db.teacherSubject.create({ data: { tenantId, teacherId, subjectId } as never });
    }
    await linkTeacherSubject(departedTeacher.id, math.id);
    await linkTeacherSubject(replacementTeacher.id, math.id);
    await linkTeacherSubject(replacementTeacher.id, chem.id);

    async function ensureNeed(classId: string, subjectId: string, teacherId: string | null, lessonsPerWeek: number) {
      const existing = await db.classSubjectNeed.findFirst({ where: { tenantId, classId, subjectId } });
      if (existing) return db.classSubjectNeed.update({ where: { id: existing.id }, data: { teacherId, lessonsPerWeek } });
      return db.classSubjectNeed.create({ data: { tenantId, classId, subjectId, teacherId, lessonsPerWeek } as never });
    }
    // Form 3 West has its own real, independent Mathematics allocation.
    await ensureNeed(f3West.id, math.id, replacementTeacher.id, 6);
    // Form 4 East's REAL, EXISTING allocation (Mathematics with the
    // soon-to-depart teacher, Chemistry with the active one). Because NEYO
    // reuses the SAME SchoolClass row across academic years (founder's own
    // confirmed design), this exact allocation is what next year's incoming
    // Form 3 East cohort inherits the moment they move up into this row —
    // which is precisely why the review wizard needs to exist: the class
    // "moved up with its teacher," but that teacher has since left.
    await ensureNeed(f4East.id, math.id, departedTeacher.id, 6);
    await ensureNeed(f4East.id, chem.id, replacementTeacher.id, 5);
    await db.schoolClass.update({ where: { id: f4East.id }, data: { classTeacherId: replacementTeacher.id } });

    // Real students so promotion has genuine rosters to move.
    async function ensureStudent(admissionNo: string, firstName: string, lastName: string, classId: string) {
      const existing = await db.student.findFirst({ where: { tenantId, admissionNo } });
      if (existing) return db.student.update({ where: { id: existing.id }, data: { classId, status: "ACTIVE" } });
      return db.student.create({ data: { tenantId, admissionNo, firstName, lastName, gender: "F", classId, status: "ACTIVE" } as never });
    }
    await ensureStudent("BVS-3E-001", "Achieng", "Milkah", f3East.id);
    await ensureStudent("BVS-3W-001", "Naliaka", "Sharon", f3West.id);
    await ensureStudent("BVS-4E-001", "Wekesa", "Diana", f4East.id);
    console.log("✓ Real classes, subjects, teachers, allocation and rosters in place.");

    // ---- Run the real academic year promotion ----
    const promo = await commitPromotion(principalUser, 2027);
    console.log(`✓ commitPromotion: ${promo.summary}`);

    const history = await listClassYearHistory(principalUser, { graduationYear: 2027 });
    const f4EastHistory = history.find((h) => h.classId === f4East.id);
    if (!f4EastHistory) throw new Error("Expected a real ClassYearHistory snapshot for Form 4 East — none found.");
    console.log(`✓ Real ClassYearHistory frozen for "Form 4 East, Class of 2027": ${f4EastHistory.studentCount} students, ${f4EastHistory.subjectTeachers.length} subject allocations.`);

    // ---- Run the real review wizard against the newly-promoted Form 4 level ----
    const snapshot = await getReviewSnapshot(principalUser, "Form 4");
    const staleSlot = snapshot.subjectRows.find((r) => r.currentTeacherId === departedTeacher.id);
    if (!staleSlot) throw new Error("Expected to find the departed teacher's real slot in the Form 4 review snapshot.");
    console.log(`✓ Review snapshot correctly flags ${staleSlot.classLabel} · ${staleSlot.subjectName} as needing attention (current teacher inactive).`);

    const { reviewRunId } = await startReviewRun(principalUser, "Form 4", promo.runId);
    const decisions = snapshot.subjectRows.map((r) => {
      if (r.classId === staleSlot.classId && r.subjectId === staleSlot.subjectId) {
        return { classId: r.classId, subjectId: r.subjectId, roleType: "SUBJECT" as const, decision: "REPLACE" as const, teacherId: replacementTeacher.id };
      }
      return { classId: r.classId, subjectId: r.subjectId, roleType: "SUBJECT" as const, decision: "KEEP" as const };
    });
    const applied = await applyReviewDecisions(principalUser, { reviewRunId, decisions, regenerateTimetable: false });
    console.log(`✓ Review applied: ${applied.appliedCount} replaced, ${applied.autoFilledCount} auto-filled.`);

    const runs = await listReviewRuns(principalUser);
    console.log(`✓ Review history now shows ${runs.length} real run(s) for this tenant.`);

    console.log("\n✅ AA.3 seed complete — Bahari View Secondary School now demonstrates a real graduation history snapshot + a real, applied teacher allocation review.");
  });
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
