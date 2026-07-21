import { requirePagePermission } from "@/lib/core/page-guards";
import { effectivePermissionsForUser } from "@/lib/core/session";
import { can } from "@/lib/core/permissions";
import { CafeteriaClient } from "@/components/cafeteria/cafeteria-client";

export const dynamic = "force-dynamic";

/** B.19 Cafeteria — menu, kitchen board, meal cards billed to invoices. */
export default async function CafeteriaPage() {
  const user = await requirePagePermission("cafeteria.view");
  const effectivePermissions = await effectivePermissionsForUser(user);
  const hasEffective = (permission: Parameters<typeof can>[1]) => effectivePermissions.includes(permission);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">Cafeteria</h1>
      <p className="-mt-4 text-sm text-navy-500 dark:text-navy-400">
        The week&apos;s menu, today&apos;s headcount, and meal cards billed straight to student invoices.
      </p>
      <CafeteriaClient canManage={hasEffective("cafeteria.manage")} />
    </div>
  );
}
