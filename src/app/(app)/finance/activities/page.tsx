import { requirePagePermission } from "@/lib/core/page-guards";
import { effectivePermissionsForUser } from "@/lib/core/session";
import { can } from "@/lib/core/permissions";
import { ActivitiesClient } from "@/components/finance/activities-client";

export const dynamic = "force-dynamic";

/** R.6 — Trips & activities: a "Form 4 trip"-style optional fee tracker,
 * kept deliberately separate from B.7 compulsory fee invoicing. */
export default async function ActivitiesPage() {
  const user = await requirePagePermission("finance.view");
  const effectivePermissions = await effectivePermissionsForUser(user);
  const hasEffective = (permission: Parameters<typeof can>[1]) => effectivePermissions.includes(permission);

  return (
    <ActivitiesClient
      canManage={hasEffective("finance.manage_structure")}
      canRecord={hasEffective("finance.record_payment")}
    />
  );
}
