import { requirePageUser } from "@/lib/core/page-guards";
import { PathwayGuideQuiz } from "@/components/pathway-guide/pathway-guide-quiz";

export const dynamic = "force-dynamic";

/**
 * Y.1 — NEYO Pathway Guide, in-app entry point. Free for every logged-in
 * NEYO school user (student/parent/staff). Optionally linked to a real
 * Student via ?studentId=... (e.g. from the Parent Portal launcher card).
 */
export default async function PathwayGuidePage({
  searchParams,
}: {
  searchParams: { studentId?: string };
}) {
  const user = await requirePageUser();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">
          NEYO Pathway Guide
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Career and subject-selection guidance — free for NEYO school families.
        </p>
      </div>
      <PathwayGuideQuiz
        apiBase="/api/pathway-guide"
        isPublic={false}
        studentId={searchParams.studentId}
        studentName={user.fullName}
      />
    </div>
  );
}
