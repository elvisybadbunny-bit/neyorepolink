import { redirect } from "next/navigation";
import { ReceiptText, Download } from "lucide-react";
import { requirePageUser } from "@/lib/core/page-guards";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STAFF_ROLES = new Set([
  "SCHOOL_OWNER", "PRINCIPAL", "DEPUTY_PRINCIPAL", "DEAN_OF_STUDIES", "HOD",
  "TEACHER", "CLASS_TEACHER", "BURSAR", "ACCOUNTANT", "RECEPTIONIST",
  "LIBRARIAN", "HOSTEL_MASTER", "SUPPORT_STAFF",
]);

export default async function MyPayslipsPage() {
  const user = await requirePageUser();
  if (!STAFF_ROLES.has(user.role)) redirect("/forbidden");
  const rows = await db.payslip.findMany({
    where: { userId: user.id, run: { tenantId: user.tenantId, status: "APPROVED" } },
    include: { run: { select: { period: true, status: true, approvedAt: true } } },
  });
  rows.sort((a, b) => b.run.period.localeCompare(a.run.period));
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-navy-900 dark:text-navy-50">My payslips</h1><p className="mt-1 text-sm text-navy-500">Only approved payroll runs appear here. Your salary details are private to you and authorized payroll leadership.</p></div>{rows.length === 0 ? <Card><CardContent className="p-8 text-center text-sm text-navy-500">No approved payslips are available yet.</CardContent></Card> : <div className="space-y-3">{rows.map((p) => <Card key={p.id}><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><div className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-green-600"/><p className="font-semibold text-navy-900 dark:text-navy-50">{p.run.period}</p><Badge tone="green">approved</Badge></div><p className="mt-1 text-sm text-navy-500">Gross {formatKES(p.grossKes)} · Deductions {formatKES(p.payeKes + p.shifKes + p.nssfKes + p.housingLevyKes + p.saccoKes + p.loanKes)} · Net <strong>{formatKES(p.netKes)}</strong></p></div><a href={`/api/payroll/payslip/${p.id}`}><Button variant="secondary"><Download className="h-4 w-4"/> Download PDF</Button></a></CardContent></Card>)}</div>}</div>;
}
