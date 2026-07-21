import { redirect } from "next/navigation";
import { requirePageUser } from "@/lib/core/page-guards";
import { effectivePermissionsForUser } from "@/lib/core/session";
import { PayrollClient } from "@/components/payroll/payroll-client";

export const dynamic = "force-dynamic";

/** B.8 Payroll — salaries, statutory deductions, runs and payslips.
 *  ANY-of: staff.manage (leadership) OR finance.manage_structure (bursar). */
export default async function PayrollPage() {
  const user = await requirePageUser();
  const effectivePermissions = await effectivePermissionsForUser(user);
  if (!effectivePermissions.includes("staff.manage") && !effectivePermissions.includes("finance.manage_structure")) redirect("/forbidden");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">Payroll</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Gross to net with PAYE, SHIF, NSSF and the housing levy — payslips included.
        </p>
      </div>
      <PayrollClient />
    </div>
  );
}
