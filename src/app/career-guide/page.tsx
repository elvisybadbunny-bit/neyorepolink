import { PathwayGuideQuiz } from "@/components/pathway-guide/pathway-guide-quiz";

export const dynamic = "force-dynamic";

/**
 * Y.1 — NEYO Pathway Guide, PUBLIC page (no NEYO account, no login, no app
 * shell — same "outside" pattern as /mzazi/[code]). Any member of the public
 * — a Grade 9/Senior School learner or parent who has never used NEYO — can
 * run the real interest/subject-combination questionnaire for free, with a
 * small one-time M-Pesa unlock for the full KUCCPS matched-course list.
 * Founder-Ops-controlled via a dedicated on/off flag, independent of the
 * in-app version.
 */
export default function CareerGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-10 dark:from-navy-950 dark:via-navy-950 dark:to-navy-900">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">NEYO</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">Pathway Guide</h1>
          <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">
            Free career &amp; subject-selection guidance for Kenyan learners — no NEYO account needed.
          </p>
        </div>
        <PathwayGuideQuiz apiBase="/api/pathway-guide/public" isPublic />
        <p className="text-center text-xs text-navy-400 dark:text-navy-500">
          Already using NEYO at your school? <a href="/pathway-guide" className="font-semibold text-indigo-600 hover:underline">Use the free in-app version instead</a>.
        </p>
      </div>
    </div>
  );
}
