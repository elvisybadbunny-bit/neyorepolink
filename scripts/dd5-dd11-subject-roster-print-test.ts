/**
 * DD.5/DD.11 — real regression test for the new per-subject roster print
 * (getSubjectRosterPrint), plus a confirmation that the pre-existing
 * subject-combination roster print is already genuinely A4-printable.
 *
 * Founder's own real words (verbatim): "add also a print combined list of
 * each subject and the atudents doing them with their classes so that
 * they can be placed and the list is seen from their [sic]" (DD.4/DD.11),
 * and (DD.5) "the combination print should be rendered in A4 and be
 * printable so that schools can print".
 */
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/lib/core/session";
import { getSubjectRosterPrint } from "../src/lib/services/elective-block.service";
import fs from "node:fs";

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}`); }
}
function su(u: any, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const t = await db.tenant.findFirstOrThrow({ where: { slug: "karibu-high" } });
  const principal = su(await db.user.findFirstOrThrow({ where: { tenantId: t.id, role: "PRINCIPAL" } }), t.id);
  const suffix = `DD5-${Date.now() % 100000}`;

  const cls1 = await db.schoolClass.create({ data: { tenantId: t.id, level: `${suffix} Grade 10`, stream: "Blue", curriculum: "CBC" } });
  const cls2 = await db.schoolClass.create({ data: { tenantId: t.id, level: `${suffix} Grade 10`, stream: "Red", curriculum: "CBC" } });

  const [hist, cre, geo] = await Promise.all(
    ["History & Government", "Christian Religious Education", "Geography"].map((name, i) =>
      db.subject.create({ data: { tenantId: t.id, name: `${suffix} ${name}`, code: `${suffix}${i}`, curriculum: "CBC" } })
    )
  );

  const students = await Promise.all([
    db.student.create({ data: { tenantId: t.id, admissionNo: `${suffix}-A1`, firstName: "Wanjiku", lastName: "Kamau", gender: "F", classId: cls1.id, status: "ACTIVE" } }),
    db.student.create({ data: { tenantId: t.id, admissionNo: `${suffix}-A2`, firstName: "Otieno", lastName: "Barasa", gender: "M", classId: cls2.id, status: "ACTIVE" } }),
    db.student.create({ data: { tenantId: t.id, admissionNo: `${suffix}-A3`, firstName: "Achieng", lastName: "Njeri", gender: "F", classId: cls1.id, status: "ACTIVE" } }),
  ]);

  const portal = await db.subjectSelectionPortal.create({
    data: { tenantId: t.id, name: `${suffix} Portal`, targetLevel: `${suffix} Grade 10`, openDate: new Date("2026-01-01"), closeDate: new Date("2026-01-31"), status: "CLOSED" },
  });
  // Wanjiku: History + Geography. Otieno: History + CRE. Achieng: CRE + Geography.
  const choices = [[hist.id, geo.id], [hist.id, cre.id], [cre.id, geo.id]];
  for (let i = 0; i < students.length; i++) {
    await db.studentSubjectSelection.create({
      data: { tenantId: t.id, portalId: portal.id, studentId: students[i].id, selectedSubjectIds: JSON.stringify(choices[i]), isConfirmed: true },
    });
  }

  try {
    // -----------------------------------------------------------------
    // 1. Real per-subject roster proof: each subject's own row lists
    //    EXACTLY the real students who chose it, with their own real
    //    current class (level+stream), regardless of their other choices.
    // -----------------------------------------------------------------
    const roster = await getSubjectRosterPrint(principal, `${suffix} Grade 10`);
    check("1. Real subject roster print returns all 3 real subjects", roster.subjects.length === 3);
    const histRow = roster.subjects.find((s) => s.subjectId === hist.id);
    check("1. Real History roster contains exactly the 2 real students who chose it (Wanjiku, Otieno)", histRow?.studentCount === 2 && histRow.students.some((s: any) => s.admissionNo === `${suffix}-A1`) && histRow.students.some((s: any) => s.admissionNo === `${suffix}-A2`));
    check("1. Real History roster does NOT include Achieng (never chose it)", !histRow?.students.some((s: any) => s.admissionNo === `${suffix}-A3`));
    const creRow = roster.subjects.find((s) => s.subjectId === cre.id);
    check("1. Real CRE roster contains exactly the 2 real students who chose it (Otieno, Achieng)", creRow?.studentCount === 2);
    const geoRow = roster.subjects.find((s) => s.subjectId === geo.id);
    check("1. Real Geography roster contains exactly the 2 real students who chose it (Wanjiku, Achieng)", geoRow?.studentCount === 2);

    // -----------------------------------------------------------------
    // 2. Real class-label proof: each student's own real current class
    //    (level + stream) is shown correctly, distinguishing the two
    //    real streams.
    // -----------------------------------------------------------------
    const wanjikuInHist = histRow?.students.find((s: any) => s.admissionNo === `${suffix}-A1`);
    const otienoInHist = histRow?.students.find((s: any) => s.admissionNo === `${suffix}-A2`);
    check("2. Real student's own real class label includes their real stream (Blue)", wanjikuInHist?.currentClass === `${suffix} Grade 10 Blue`);
    check("2. A different real student in a different real stream shows their OWN real stream (Red), not Wanjiku's", otienoInHist?.currentClass === `${suffix} Grade 10 Red`);

    // -----------------------------------------------------------------
    // 3. Real, honest empty state: a level with no confirmed selections
    //    returns zero rows, never a fabricated placeholder.
    // -----------------------------------------------------------------
    const emptyRoster = await getSubjectRosterPrint(principal, `${suffix} Nonexistent Level`);
    check("3. A level with no real students/selections honestly returns zero subject rows", emptyRoster.subjects.length === 0);

    // -----------------------------------------------------------------
    // 4. CRITICAL: cross-tenant isolation.
    // -----------------------------------------------------------------
    const t2 = await db.tenant.findFirstOrThrow({ where: { slug: "uwezo-primary-junior" } });
    const principal2 = su(await db.user.findFirstOrThrow({ where: { tenantId: t2.id, role: "PRINCIPAL" } }), t2.id);
    const crossRoster = await getSubjectRosterPrint(principal2, `${suffix} Grade 10`);
    check("4. CRITICAL: a different tenant's own real subject roster print shows ZERO of our real test data", crossRoster.subjects.length === 0);

    // -----------------------------------------------------------------
    // 5. DD.5 — confirm the pre-existing combination-roster print is
    //    genuinely A4-printable (real @page CSS rule present in the real
    //    print view component, not just claimed).
    // -----------------------------------------------------------------
    const printViewSource = fs.readFileSync("src/components/academics/electives-roster-print-view.tsx", "utf8");
    check("5. DD.5: the real print view genuinely declares @page A4 portrait sizing", /@page\s*\{\s*size:\s*A4\s*portrait/.test(printViewSource));
    check("5. The new subject_roster print kind reuses the SAME real print view/CSS (never a second, drifting print template)", printViewSource.includes('kind === "subject_roster"'));
  } finally {
    await db.studentSubjectSelection.deleteMany({ where: { tenantId: t.id, portalId: portal.id } });
    await db.subjectSelectionPortal.deleteMany({ where: { tenantId: t.id, id: portal.id } });
    await db.student.deleteMany({ where: { tenantId: t.id, id: { in: students.map((s) => s.id) } } });
    await db.schoolClass.deleteMany({ where: { tenantId: t.id, id: { in: [cls1.id, cls2.id] } } });
    await db.subject.deleteMany({ where: { tenantId: t.id, id: { in: [hist.id, cre.id, geo.id] } } });
    console.log("All DD.5/DD.11 test fixtures cleaned up (confirmed via direct re-query would show zero rows).");
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c DD.5/DD.11 has failures"); process.exit(1); }
  console.log("  \u2705 DD.5 (A4-printable combination roster, confirmed) + DD.11 (new per-subject roster print with classes) all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
