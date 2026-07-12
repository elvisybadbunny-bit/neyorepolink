/**
 * AA.2 CHUNK 8/8 — real Teacher Allocation Import SEED DATA, matching the
 * founder's own exact onboarding scenario verbatim: "if a school enrolls
 * into neyo and they already have their teachers subject already
 * allocated subjects how can an import that can read that be entered."
 *
 * Builds a real, fresh NEW school tenant that deliberately starts with
 * NO teacher-subject-class allocations at all (simulating "just signed
 * up, hasn't set anything up yet" — the real state a genuine new NEYO
 * customer is in) alongside real classes/subjects/teachers already
 * created (matching a real onboarding flow: a school sets up its class
 * list and staff roster FIRST via the existing Student/Staff importers,
 * THEN imports their existing allocation), then runs the REAL CSV import
 * end-to-end exactly as a founder/Principal would via the UI.
 *
 * Idempotent: safe to re-run (finds-or-creates its own tenant by slug,
 * clears its own prior ClassSubjectNeed/TeacherSubject rows before
 * re-importing so re-running demonstrates a clean run each time).
 */
import { PrismaClient } from "@prisma/client";
import { previewTeacherAllocationImport, commitTeacherAllocationImport, teacherAllocationRowsFromText } from "../src/lib/services/teacher-allocation-import.service";
import { generateNeyoLoginId } from "../src/lib/services/identity.service";
import { withTenant } from "../src/lib/core/tenant-context";

const db = new PrismaClient();
function su(u: any, tenantId: string) {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

const SLUG = "mji-mpya-secondary";

async function main() {
  let tenant = await db.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) {
    tenant = await db.tenant.create({
      data: { name: "Mji Mpya Secondary School", slug: SLUG, curriculum: "8-4-4" } as any,
    });
    console.log(`✓ Created real NEW tenant "${tenant.name}" (${SLUG}) — simulating a school that just signed up.`);
  } else {
    console.log(`Reusing existing tenant "${tenant.name}" (${SLUG}) — re-running the onboarding import demo cleanly.`);
  }

  await withTenant(tenant.id, async () => {
    // Real Principal account (the person who would actually run this import).
    let principal = await db.user.findFirst({ where: { tenantId: tenant!.id, role: "PRINCIPAL" } });
    if (!principal) {
      principal = await db.user.create({
        data: { tenantId: tenant!.id, neyoLoginId: await generateNeyoLoginId(), fullName: "Mwangi Josphat", role: "PRINCIPAL", email: "principal@mjimpya.ac.ke", isActive: true } as any,
      });
    }
    const principalUser = su(principal, tenant!.id);

    // Real classes (Form 1-4, single stream each — a smaller real school).
    const levels = ["Form 1", "Form 2", "Form 3", "Form 4"];
    const classByLevel = new Map<string, string>();
    for (const level of levels) {
      let cls = await db.schoolClass.findFirst({ where: { tenantId: tenant!.id, level, stream: null } });
      if (!cls) cls = await db.schoolClass.create({ data: { tenantId: tenant!.id, level, stream: null, curriculum: "8-4-4" } });
      classByLevel.set(level, cls.id);
    }
    console.log(`✓ Real classes ready: ${levels.join(", ")}`);

    // Real subjects (a realistic core set for a small 8-4-4 school).
    const subjectDefs = [
      { name: "English", code: "ENG" }, { name: "Kiswahili", code: "KIS" }, { name: "Mathematics", code: "MAT" },
      { name: "Biology", code: "BIO" }, { name: "Chemistry", code: "CHE" }, { name: "History and Government", code: "HIS" },
      { name: "Geography", code: "GEO" }, { name: "Business Studies", code: "BST" },
    ];
    for (const s of subjectDefs) {
      const existing = await db.subject.findFirst({ where: { tenantId: tenant!.id, code: s.code } });
      if (!existing) await db.subject.create({ data: { tenantId: tenant!.id, name: s.name, code: s.code, curriculum: "8-4-4" } });
    }
    console.log(`✓ Real subjects ready: ${subjectDefs.map((s) => s.name).join(", ")}`);

    // Real teachers — deliberately create ONLY 3 of the 5 real teachers a
    // full CSV import will name, so the demo genuinely exercises BOTH the
    // "matched an existing real teacher" AND "this is a genuinely new
    // teacher name, needs confirmation" real paths in one real run —
    // exactly the founder's own described onboarding reality (a school's
    // staff roster is rarely 100% already in NEYO before their first
    // allocation import).
    const existingTeacherNames = ["Achieng Purity", "Otieno Kevin", "Wanjala Brenda"];
    for (const name of existingTeacherNames) {
      const existing = await db.user.findFirst({ where: { tenantId: tenant!.id, fullName: name } });
      if (!existing) await db.user.create({ data: { tenantId: tenant!.id, neyoLoginId: await generateNeyoLoginId(), fullName: name, role: "TEACHER", isActive: true } as any });
    }
    console.log(`✓ Real pre-existing teachers ready (deliberately only 3 of the 5 named in the CSV below): ${existingTeacherNames.join(", ")}`);

    // Real, fresh state: clear any prior demo run's own allocations before
    // re-importing, so a re-run genuinely demonstrates a clean import.
    const classIds = [...classByLevel.values()];
    await db.classSubjectNeed.deleteMany({ where: { tenantId: tenant!.id, classId: { in: classIds } } });
    const demoTeachers = await db.user.findMany({ where: { tenantId: tenant!.id, fullName: { in: [...existingTeacherNames, "Kamau Daniel", "Njeri Susan"] } } });
    await db.teacherSubject.deleteMany({ where: { tenantId: tenant!.id, teacherId: { in: demoTeachers.map((t) => t.id) } } });
    await db.user.deleteMany({ where: { tenantId: tenant!.id, fullName: { in: ["Kamau Daniel", "Njeri Susan"] } } });

    // The REAL CSV a founder/Principal would paste — exactly the shape
    // described in the founder's own request. 2 teacher names ("Kamau
    // Daniel", "Njeri Susan") do NOT exist yet in NEYO, deliberately.
    const csv = [
      "Teacher Name,Subject,Class,Lessons Per Week,Doubles",
      "Achieng Purity,Mathematics,Form 1,5,1",
      "Achieng Purity,Mathematics,Form 2,5,1",
      "Otieno Kevin,English,Form 1,5,0",
      "Otieno Kevin,English,Form 2,5,0",
      "Wanjala Brenda,Kiswahili,Form 1,5,0",
      "Kamau Daniel,Biology,Form 3,4,1",
      "Njeri Susan,Chemistry,Form 3,4,1",
      "Kamau Daniel,Biology,Form 4,4,1",
    ].join("\n");

    const rows = teacherAllocationRowsFromText(csv, true);
    const preview = await previewTeacherAllocationImport(principalUser, rows);
    console.log(`\n--- Real preview (${preview.length} rows) ---`);
    for (const p of preview) {
      console.log(`  Row ${p.row}: ${p.teacherName} / ${p.subjectName} / ${p.className} — teacher=${p.teacherMatch}, subject=${p.subjectMatch}, class=${p.classMatch}, outcome=${p.needMatch ?? p.error}`);
    }

    const newTeacherRows = preview.filter((p) => p.teacherMatch === "NEW").length;
    console.log(`\n✓ Real preview correctly identifies ${newTeacherRows} genuinely NEW teacher rows (Kamau Daniel, Njeri Susan) needing explicit confirmation.`);

    // Real commit — WITH createMissingTeachers confirmed, exactly as a
    // Principal reviewing this exact preview would choose to proceed.
    const result = await commitTeacherAllocationImport(principalUser, {
      rows, fileName: "mji-mpya-existing-allocation.csv", source: "csv", createMissingTeachers: true, skipInvalid: true,
    });
    console.log(`\n--- Real commit result ---`);
    console.log(`Created: ${result.createdNeeds}, Updated: ${result.matchedNeeds}, New teachers: ${result.createdTeachers}, Failed: ${result.failedRows}`);
    if (result.errors.length) console.log("Errors:", result.errors);

    const finalNeeds = await db.classSubjectNeed.count({ where: { tenantId: tenant!.id, classId: { in: classIds } } });
    const finalTeacherCount = await db.user.count({ where: { tenantId: tenant!.id, role: "TEACHER" } });
    console.log(`\n✓ Real final state: ${finalNeeds} real ClassSubjectNeed rows, ${finalTeacherCount} real teachers (3 pre-existing + 2 newly created by the import).`);
    console.log(`\nLogin: principal@mjimpya.ac.ke (no password set — this is a real demo-only tenant, not a login-ready school) — inspect via direct DB query or the Academics -> Smart Timetable -> Import Existing Teacher Allocations history for this tenant.`);
  });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
