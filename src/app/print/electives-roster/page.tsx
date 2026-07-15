/**
 * BB.7 — Real, dedicated print-only pages for Options Block venue/teacher
 * detail and subject-combination rosters. Deliberately OUTSIDE the
 * authenticated app-shell (same real pattern as the pre-existing
 * `/print/timetable` route), so printing this page can never show app
 * chrome. Founder's own explicit instruction: this detail belongs in a
 * SEPARATE print, never embedded in/overcrowding the main timetable grid.
 *
 * Real query params:
 *   ?kind=venue_roster&level=<optional level>   — per-class real Options
 *     Block subject/teacher/venue breakdown (every class if level omitted).
 *   ?kind=combination_roster&level=<required level> — the real
 *     subject-combination groups the system generated from student choices.
 *   ?kind=subject_roster&level=<required level> — DD.4/DD.11: every real
 *     subject at a level with its own full real student roster and each
 *     student's own real current class, for physically placing students.
 */
import { requireUser } from "@/lib/core/session";
import { db } from "@/lib/db";
import { getOptionsBlockRosterPrint, getSubjectCombinationRosterPrint, getSubjectRosterPrint } from "@/lib/services/elective-block.service";
import { ElectivesRosterPrintView } from "@/components/academics/electives-roster-print-view";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ElectivesRosterPrintRoute({
  searchParams,
}: {
  searchParams: { kind?: string; level?: string };
}) {
  const user = await requireUser();
  const tenant = await db.tenant.findUnique({ where: { id: user.tenantId }, select: { name: true, logoUrl: true } });

  if (searchParams.kind === "venue_roster") {
    const data = await getOptionsBlockRosterPrint(user, searchParams.level || undefined);
    return (
      <ElectivesRosterPrintView
        tenantName={tenant?.name}
        tenantLogoUrl={tenant?.logoUrl}
        kind="venue_roster"
        venueData={data}
      />
    );
  }

  if (searchParams.kind === "combination_roster") {
    if (!searchParams.level) redirect("/academics");
    const data = await getSubjectCombinationRosterPrint(user, searchParams.level);
    return (
      <ElectivesRosterPrintView
        tenantName={tenant?.name}
        tenantLogoUrl={tenant?.logoUrl}
        kind="combination_roster"
        comboData={data}
      />
    );
  }

  if (searchParams.kind === "subject_roster") {
    if (!searchParams.level) redirect("/academics");
    const data = await getSubjectRosterPrint(user, searchParams.level);
    return (
      <ElectivesRosterPrintView
        tenantName={tenant?.name}
        tenantLogoUrl={tenant?.logoUrl}
        kind="subject_roster"
        subjectData={data}
      />
    );
  }

  redirect("/academics");
}
