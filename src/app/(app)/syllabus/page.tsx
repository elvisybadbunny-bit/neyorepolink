import { requirePagePermission } from "@/lib/core/page-guards";
import { SyllabusClient } from "@/components/syllabus/syllabus-client";
import { RecordOfWorkClientTab } from "@/components/academics/record-of-work-client-tab";
import { effectivePermissionsForUser } from "@/lib/core/session";

export const dynamic = "force-dynamic";

export default async function SyllabusPage() {
  const user = await requirePagePermission("academics.view");
  const permissions = await effectivePermissionsForUser(user);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-navy-50">Syllabus coverage</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">Track required scope, deadlines and taught topics per class and subject.</p>
      </div>
      <SyllabusClient />
      <section className="border-t border-navy-100 pt-6 dark:border-navy-800"><div className="mb-4"><h2 className="text-xl font-bold text-navy-900 dark:text-white">Record of Work</h2><p className="text-sm text-navy-500">Record delivered lessons beside the syllabus scope they fulfil.</p></div><RecordOfWorkClientTab canManage={permissions.includes("academics.manage")} /></section>
    </div>
  );
}
