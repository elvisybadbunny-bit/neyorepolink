import { requirePagePermission, requirePageUser } from "@/lib/core/page-guards";
import { DataExportCard } from "@/components/settings/data-export-card";
import { DataDeletionRequestCard } from "@/components/settings/data-deletion-request-card";

export const dynamic = "force-dynamic";

/** Settings → Data. Export & portability (A.2.10) + U.3 deletion request. */
export default async function DataSettingsPage() {
  // A.3.7: redirect to /forbidden if the user can't export data.
  await requirePagePermission("tenant.export_data");
  const user = await requirePageUser();
  const canRequestDeletion = ["SUPER_ADMIN", "FOUNDER", "SCHOOL_OWNER", "PRINCIPAL"].includes(user.role);

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">
          Data & privacy
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Export your school&apos;s information at any time.
        </p>
      </div>

      <DataExportCard canExport={true} />
      <DataDeletionRequestCard canRequest={canRequestDeletion} />
    </div>
  );
}
