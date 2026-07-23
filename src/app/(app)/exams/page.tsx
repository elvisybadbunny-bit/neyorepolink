import { requirePagePermission } from "@/lib/core/page-guards";
import { effectivePermissionsForUser } from "@/lib/core/session";
import { can } from "@/lib/core/permissions";
import { ExamsClient } from "@/components/exams/exams-client";
import { ExamAnalyticsClient } from "@/components/exams/exam-analytics-client";
import { ExamPrintClient } from "@/components/exams/exam-print-client";
import { AdvancedAnalyticsClient } from "@/components/exams/advanced-analytics-client";
import { getSchoolLevelActivationSummary } from "@/lib/services/school-profile.service";
import { ExamWidgetBoundary } from "@/components/exams/exam-widget-boundary";
import { ExamApplicationReviewCard } from "@/components/exams/exam-application-review-card";
import { ExamAutoGeneratorTab, ExamTimetableTab } from "@/components/academics/academics-client";
import { ComputationDashboardClient } from "@/components/academics/computation-dashboard";
import { KnecCandidateStudio } from "@/components/academics/knec-candidate-studio";

export const dynamic = "force-dynamic";

/** B.5 Examination — exams, marks entry, positions, report cards. */
export default async function ExamsPage() {
  const user = await requirePagePermission("exam.view");
  // School-level guidance is helpful but must never take the entire operational
  // Exams page down if an older/newly-migrated profile is temporarily incomplete.
  const schoolLevelActivation = await getSchoolLevelActivationSummary(user.tenantId).catch(() => ({
    shouldShowPathwayTools: false,
    shouldShowSubjectSelectionTools: false,
    isJuniorSchool: false,
    isSeniorSchool: false,
    isMixedSchool: false,
    educationLevelsOffered: [] as string[],
  }));

  const effectivePermissions = await effectivePermissionsForUser(user);
  const has = (permission: Parameters<typeof can>[1]) => effectivePermissions.includes(permission);
  const requestRoles = ["HOD", "DEAN_OF_STUDIES", "DEPUTY_PRINCIPAL", "PRINCIPAL", "SCHOOL_OWNER", "SUPER_ADMIN"];
  const approveRoles = ["PRINCIPAL", "SCHOOL_OWNER", "SUPER_ADMIN"];
  const canRequestRelease = requestRoles.includes(user.role) || (user.secondaryRole ? requestRoles.includes(user.secondaryRole) : false);
  const canApproveRelease = approveRoles.includes(user.role) || (user.secondaryRole ? approveRoles.includes(user.secondaryRole) : false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">Exams</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Set exams, enter marks, see positions and release report cards.
        </p>
      </div>
      {schoolLevelActivation.isJuniorSchool || schoolLevelActivation.isSeniorSchool ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-200">
          <p className="font-semibold">Level-aware Exams</p>
          <p className="mt-1 text-xs text-green-800 dark:text-green-300">
            Exam analytics here are most relevant for Junior School and Senior School. Pathway-heavy exam complexity should only be expected when Senior School is active.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200">
          <p className="font-semibold">Level-aware Exams</p>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
            Senior-pathway exam complexity is currently hidden because this school has not activated Junior School or Senior School in the School Profile.
          </p>
        </div>
      )}
      <ExamWidgetBoundary name="Exam workspace">
        <ExamsClient
          canManage={has("exam.manage")}
          canEnterMarks={has("exam.enter_marks")}
          canPublish={has("exam.publish")}
          canRequestRelease={canRequestRelease}
          canApproveRelease={canApproveRelease}
        />
      </ExamWidgetBoundary>
      <section id="grading" className="scroll-mt-20 space-y-4 border-t border-navy-100 pt-6 dark:border-navy-800"><div><h2 className="text-xl font-bold text-navy-900 dark:text-white">Grading Engine & consolidated reports</h2><p className="text-sm text-navy-500">Configure papers, contribution law, marks portals, computation, comments and result release in the Exams workspace.</p></div><ComputationDashboardClient canManage={has("academics.manage")} schoolLevelActivation={schoolLevelActivation} /></section>
      {has("exam.manage") ? <section className="space-y-4 border-t border-navy-100 pt-6 dark:border-navy-800"><div><h2 className="text-xl font-bold text-navy-900 dark:text-white">Exam timetable setup</h2><p className="text-sm text-navy-500">Manage papers, sessions, practical resources, venues and invigilators.</p></div><ExamTimetableTab canManage /></section> : null}
      {has("exam.manage") ? <section className="space-y-4 border-t border-navy-100 pt-6 dark:border-navy-800"><div><h2 className="text-xl font-bold text-navy-900 dark:text-white">Exam timetable auto-generator</h2><p className="text-sm text-navy-500">Preview deterministic placement before saving or approving a timetable.</p></div><ExamAutoGeneratorTab canManage schoolLevelActivation={schoolLevelActivation} /></section> : null}
      {has("academics.manage") ? <section className="space-y-4 border-t border-navy-100 pt-6 dark:border-navy-800"><KnecCandidateStudio canManage /></section> : null}
      {has("academics.manage") ? <ExamWidgetBoundary name="Exam application documents"><ExamApplicationReviewCard /></ExamWidgetBoundary> : null}
      <ExamWidgetBoundary name="Performance analytics"><ExamAnalyticsClient /></ExamWidgetBoundary>
      <ExamWidgetBoundary name="Advanced analytics"><AdvancedAnalyticsClient /></ExamWidgetBoundary>
      <ExamWidgetBoundary name="Bulk result printing"><ExamPrintClient /></ExamWidgetBoundary>
    </div>
  );
}
