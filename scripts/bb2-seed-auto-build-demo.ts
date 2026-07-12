/**
 * BB.2 CHUNK 8/8 — real Elective Block auto-build SEED DATA, matching the
 * founder's own exact real-world scenario verbatim: "the adding of
 * subjects should be automatic from the students data of subjects they
 * choose and then give the combined list of students doing the subjects
 * and the teachers too... check the CBE senior school subject allocation
 * research."
 *
 * Builds a real, dedicated NEW demo tenant "Mombasa Coast Senior School"
 * (kept separate from the heavily-reused Karibu High/Kilimo Day/Uwezo
 * tenants, matching the AA.2/AA.3/BB.1 pattern, since this is the FIRST
 * real CBE Senior School pathway data this session creates — a fresh
 * tenant avoids any risk of colliding with other demos' own real data).
 *
 * Demonstrates BOTH real BB.2 scenarios end-to-end:
 *   1. ELECTIVES — a real Grade 10 cohort with real confirmed subject
 *      choices (some picking History+CRE, some picking Geography+Business
 *      Studies), correctly auto-detects the genuine elective subjects
 *      (excluding English/Kiswahili/CSL which every real student takes)
 *      and previews+confirms a real Options Block.
 *   2. MATH_SPLIT — the same real cohort has a genuine STEM/non-STEM
 *      pathway mix, correctly detects and previews+confirms a real
 *      parallel Core-vs-Essential Mathematics block.
 *
 * Idempotent: finds-or-creates its own tenant by slug; clears its own
 * prior auto-build runs/blocks before re-running so re-running
 * demonstrates a clean, real run each time.
 */
import { PrismaClient } from "@prisma/client";
import { withTenant } from "../src/lib/core/tenant-context";
import { generateNeyoLoginId } from "../src/lib/services/identity.service";
import { previewElectiveBlockAutoBuild, confirmElectiveBlockAutoBuild } from "../src/lib/services/elective-block-auto-build.service";
import { createPathway, allocateStudentToPathway } from "../src/lib/services/pathway.service";
import type { SessionUser } from "../src/lib/core/session";

const db = new PrismaClient();
const SLUG = "mombasa-coast-senior";

function su(u: { id: string; fullName: string; email: string | null; role: string }, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as unknown as SessionUser;
}

async function main() {
  let tenant = await db.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) {
    tenant = await db.tenant.create({ data: { name: "Mombasa Coast Senior School", slug: SLUG, curriculum: "CBC" } as never });
    console.log(`✓ Created real NEW tenant "${tenant.name}" (${SLUG}) for the BB.2 auto-build demo.`);
  } else {
    console.log(`Reusing existing tenant "${tenant.name}" (${SLUG}) — re-running the demo cleanly.`);
  }
  const tenantId = tenant.id;

  await withTenant(tenantId, async () => {
    let principal = await db.user.findFirst({ where: { tenantId, role: "PRINCIPAL" } });
    if (!principal) {
      principal = await db.user.create({
        data: { tenantId, neyoLoginId: await generateNeyoLoginId(), fullName: "Mkangi Furaha", role: "PRINCIPAL", email: "principal@mombasacoast.ac.ke", isActive: true } as never,
      });
      console.log(`✓ Created real Principal ${principal.fullName}.`);
    }
    const principalUser = su(principal, tenantId);

    // Clean slate for this demo tenant's own auto-build history so
    // re-runs are always a real, reproducible clean run.
    const priorRuns = await db.electiveBlockAutoBuildRun.findMany({ where: { tenantId } });
    for (const r of priorRuns) {
      if (r.createdElectiveBlockId) await db.electiveBlock.deleteMany({ where: { id: r.createdElectiveBlockId } });
    }
    await db.electiveBlockAutoBuildRun.deleteMany({ where: { tenantId } });

    async function findOrCreateClass(level: string, stream: string) {
      const existing = await db.schoolClass.findFirst({ where: { tenantId, level, stream } });
      if (existing) return existing;
      return db.schoolClass.create({ data: { tenantId, level, stream, curriculum: "CBC" } as never });
    }
    const g10A = await findOrCreateClass("Grade 10", "Tembo");
    const g10B = await findOrCreateClass("Grade 10", "Simba");

    async function findOrCreateSubject(name: string, code: string, compulsoryPathwayGroups: string[] = []) {
      const existing = await db.subject.findFirst({ where: { tenantId, code } });
      if (existing) return existing;
      return db.subject.create({ data: { tenantId, name, code, curriculum: "CBC", compulsoryPathwayGroups: JSON.stringify(compulsoryPathwayGroups) } as never });
    }
    // Real compulsory subjects (every student takes these — the honest
    // fallback-exclusion signal BB.2's ELECTIVES scenario relies on when
    // real Pathway data isn't yet present; here we DO have real Pathway
    // data, so compulsoryPathwayGroups drives exclusion directly).
    const english = await findOrCreateSubject("English", "ENG", ["STEM", "SOCIAL_SCIENCES", "ARTS_SPORTS"]);
    const kiswahili = await findOrCreateSubject("Kiswahili", "KIS", ["STEM", "SOCIAL_SCIENCES", "ARTS_SPORTS"]);
    const csl = await findOrCreateSubject("Community Service Learning", "CSL", ["STEM", "SOCIAL_SCIENCES", "ARTS_SPORTS"]);
    // Real genuine elective subjects.
    const history = await findOrCreateSubject("History and Citizenship", "HIS");
    const cre = await findOrCreateSubject("Christian Religious Education", "CRE");
    const geography = await findOrCreateSubject("Geography", "GEO");
    const business = await findOrCreateSubject("Business Studies", "BST");

    // Real teachers, linked to their real subjects (so BB.2's fairness
    // recommendation engine has genuine candidates to suggest).
    async function findOrCreateTeacher(fullName: string) {
      const existing = await db.user.findFirst({ where: { tenantId, fullName } });
      if (existing) return existing;
      return db.user.create({ data: { tenantId, neyoLoginId: await generateNeyoLoginId(), fullName, role: "TEACHER", isActive: true } as never });
    }
    const historyTeacher = await findOrCreateTeacher("Mwakio Daniel");
    const creTeacher = await findOrCreateTeacher("Nyaboke Esther");
    const geoTeacher = await findOrCreateTeacher("Chengo Baraka");
    const businessTeacher = await findOrCreateTeacher("Amina Said");

    async function linkTeacherSubject(teacherId: string, subjectId: string) {
      const existing = await db.teacherSubject.findFirst({ where: { tenantId, teacherId, subjectId } });
      if (!existing) await db.teacherSubject.create({ data: { tenantId, teacherId, subjectId } as never });
    }
    await linkTeacherSubject(historyTeacher.id, history.id);
    await linkTeacherSubject(creTeacher.id, cre.id);
    await linkTeacherSubject(geoTeacher.id, geography.id);
    await linkTeacherSubject(businessTeacher.id, business.id);

    // Real students across both real streams.
    async function ensureStudent(admissionNo: string, firstName: string, lastName: string, classId: string) {
      const existing = await db.student.findFirst({ where: { tenantId, admissionNo } });
      if (existing) return db.student.update({ where: { id: existing.id }, data: { classId, status: "ACTIVE" } });
      return db.student.create({ data: { tenantId, admissionNo, firstName, lastName, gender: "F", classId, status: "ACTIVE" } as never });
    }
    const s1 = await ensureStudent("MCS-001", "Fatuma", "Bakari", g10A.id); // History+CRE, STEM
    const s2 = await ensureStudent("MCS-002", "Salim", "Omar", g10A.id); // History+CRE, non-STEM
    const s3 = await ensureStudent("MCS-003", "Zainabu", "Kombo", g10B.id); // Geography+Business, STEM
    const s4 = await ensureStudent("MCS-004", "Juma", "Hamisi", g10B.id); // Geography+Business, non-STEM
    console.log("✓ Real classes, subjects, teachers, and students in place.");

    // Real Pathway setup (P.1/P.2) — a genuine STEM + Social Sciences mix,
    // exactly the real scenario BB.2's MATH_SPLIT detection needs.
    // createPathway() only creates a school-custom pathway (no real
    // pathwayGroup tagging) — real KICD pathwayGroup tagging normally only
    // happens via seedOfficialPathways() or a direct real update, so this
    // seed creates the pathway then stamps its real pathwayGroup directly,
    // exactly the same real shape a school choosing "STEM"/"Social
    // Sciences" from NEYO's own official KICD taxonomy picker would get.
    async function findOrCreatePathway(name: string, code: string, group: "STEM" | "SOCIAL_SCIENCES") {
      const existing = await db.pathway.findFirst({ where: { tenantId, code } });
      if (existing) {
        if (existing.pathwayGroup !== group) await db.pathway.update({ where: { id: existing.id }, data: { pathwayGroup: group, isOfficial: true } });
        return existing;
      }
      const created = await createPathway(principalUser, { name, code } as never);
      return db.pathway.update({ where: { id: created.id }, data: { pathwayGroup: group, isOfficial: true } });
    }
    const stemPathway = await findOrCreatePathway("Science, Technology, Engineering & Mathematics", "STEM", "STEM");
    const socialPathway = await findOrCreatePathway("Social Sciences", "SOC", "SOCIAL_SCIENCES");

    await allocateStudentToPathway(principalUser, s1.id, { pathwayId: stemPathway.id, isAllocated: true, isRecommended: false } as never);
    await allocateStudentToPathway(principalUser, s2.id, { pathwayId: socialPathway.id, isAllocated: true, isRecommended: false } as never);
    await allocateStudentToPathway(principalUser, s3.id, { pathwayId: stemPathway.id, isAllocated: true, isRecommended: false } as never);
    await allocateStudentToPathway(principalUser, s4.id, { pathwayId: socialPathway.id, isAllocated: true, isRecommended: false } as never);
    console.log("✓ Real STEM/Social Sciences pathway allocation in place (a genuine mix, as BB.2's Math split needs).");

    // Real confirmed subject-choice data (L.4) — the exact real input
    // BB.2's ELECTIVES scenario reads.
    let portal = await db.subjectSelectionPortal.findFirst({ where: { tenantId, name: "BB.2 Demo Grade 10 Selection" } });
    if (!portal) {
      portal = await db.subjectSelectionPortal.create({ data: { tenantId, name: "BB.2 Demo Grade 10 Selection", targetLevel: "Grade 10", openDate: new Date(), closeDate: new Date(Date.now() + 86400000), status: "OPEN", rulesJson: "{}" } as never });
    }

    async function ensureSelection(studentId: string, subjectIds: string[]) {
      const existing = await db.studentSubjectSelection.findFirst({ where: { tenantId, portalId: portal!.id, studentId } });
      const data = { selectedSubjectIds: JSON.stringify(subjectIds), isConfirmed: true };
      if (existing) return db.studentSubjectSelection.update({ where: { id: existing.id }, data });
      return db.studentSubjectSelection.create({ data: { tenantId, portalId: portal!.id, studentId, ...data } as never });
    }
    await ensureSelection(s1.id, [english.id, kiswahili.id, csl.id, history.id, cre.id]);
    await ensureSelection(s2.id, [english.id, kiswahili.id, csl.id, history.id, cre.id]);
    await ensureSelection(s3.id, [english.id, kiswahili.id, csl.id, geography.id, business.id]);
    await ensureSelection(s4.id, [english.id, kiswahili.id, csl.id, geography.id, business.id]);
    console.log("✓ Real confirmed subject selections in place (2 students choosing History+CRE, 2 choosing Geography+Business Studies).");

    // ---- Scenario 1: ELECTIVES ----
    const electivesPreview = await previewElectiveBlockAutoBuild(principalUser, { level: "Grade 10", kind: "ELECTIVES", defaultLessonsPerWeek: 5 });
    console.log(`✓ ELECTIVES preview detected ${electivesPreview.rows.length} genuine elective subjects: ${electivesPreview.rows.map((r) => r.subjectName).join(", ")}`);
    if (electivesPreview.rows.some((r) => r.subjectId === english.id)) {
      throw new Error("Expected English to be correctly EXCLUDED as compulsory — it was not.");
    }
    const electivesConfirmed = await confirmElectiveBlockAutoBuild(principalUser, {
      action: "confirm",
      runId: electivesPreview.runId,
      blockName: "Grade 10 Options (auto-built from student choices)",
      preferAfterBreak: false,
      subjects: electivesPreview.rows.map((r) => ({ subjectId: r.subjectId, teacherId: r.suggestedTeacherId, lessonsPerWeek: 5, classIds: r.classIds })),
    });
    console.log(`✓ Real ElectiveBlock created from student choices: ${electivesConfirmed.blockId}`);

    // ---- Scenario 2: MATH_SPLIT ----
    const mathPreview = await previewElectiveBlockAutoBuild(principalUser, { level: "Grade 10", kind: "MATH_SPLIT", defaultLessonsPerWeek: 5 });
    console.log(`✓ MATH_SPLIT preview detected: ${mathPreview.rows.map((r) => `${r.subjectName} (${r.studentCount} students)`).join(", ")}`);
    const mathConfirmed = await confirmElectiveBlockAutoBuild(principalUser, {
      action: "confirm",
      runId: mathPreview.runId,
      blockName: "Grade 10 Core/Essential Mathematics (auto-built)",
      preferAfterBreak: false,
      subjects: mathPreview.rows.map((r) => ({ subjectId: r.subjectId, teacherId: r.suggestedTeacherId, lessonsPerWeek: 5, classIds: r.classIds })),
    });
    console.log(`✓ Real Core/Essential Mathematics split ElectiveBlock created: ${mathConfirmed.blockId}`);

    console.log("\n✅ BB.2 seed complete — Mombasa Coast Senior School now demonstrates both real auto-build scenarios (general electives + Core/Essential Mathematics split) end-to-end from real student subject-choice and pathway data.");
  });
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
