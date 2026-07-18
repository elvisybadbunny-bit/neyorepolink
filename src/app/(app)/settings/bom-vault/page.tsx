import { requirePagePermission } from "@/lib/core/page-guards";
import { BomVaultManager } from "@/components/settings/bom-vault-manager";

export const dynamic = "force-dynamic";

/**
 * Idea 11 — BOM & PA Board of Management Document Room. A real Board of
 * Management document vault with governance-document voting (financial
 * reports, audits, capex proposals, minutes). Backend existed with zero
 * UI until this fix -- found orphaned during a full-stack audit of a
 * prior AI session's "12 operational suites" commit.
 */
export default async function BomVaultPage() {
  await requirePagePermission("tenant.manage_settings");

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">
          BOM Governance Document Room
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Upload financial reports, audits, capex proposals and minutes for your Board of Management. Documents that
          require a formal vote are approved with 3 YES votes or rejected with 3 NO votes.
        </p>
      </div>
      <BomVaultManager />
    </div>
  );
}
