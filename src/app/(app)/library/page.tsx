import { requirePagePermission } from "@/lib/core/page-guards";
import { effectivePermissionsForUser } from "@/lib/core/session";
import { can } from "@/lib/core/permissions";
import { LibraryClient } from "@/components/library/library-client";

export const dynamic = "force-dynamic";

/** B.15 Library — catalog, issue/return, fines, barcode, reading history. */
export default async function LibraryPage() {
  const user = await requirePagePermission("library.view");
  const effectivePermissions = await effectivePermissionsForUser(user);
  const hasEffective = (permission: Parameters<typeof can>[1]) => effectivePermissions.includes(permission);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">Library</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Catalog, track physical copies, issue and return books, and apply your school&apos;s configured overdue-fine policy.
        </p>
      </div>
      <LibraryClient canManage={hasEffective("library.manage")} />
    </div>
  );
}
