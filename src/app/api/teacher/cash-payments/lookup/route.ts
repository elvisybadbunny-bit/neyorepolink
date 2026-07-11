/**
 * T.10 — real, row-scoped student lookup for the teacher cash-payment
 * form. Reuses the EXISTING real studentOpenInvoices() (A.3.8 row-scoping
 * already restricts a TEACHER/CLASS_TEACHER to their own class's students)
 * — never a new, separate scoping mechanism.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError, fail } from "@/lib/api/respond";
import { studentOpenInvoices } from "@/lib/services/finance.service";
import { scopeWhere } from "@/lib/services/student.service";
import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("portal.teacher");
    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 2) return ok({ students: [] });

    const students = await withTenant(user.tenantId, async () => {
      const scope = await scopeWhere(user);
      return tenantDb().student.findMany({
        where: {
          AND: [
            scope,
            { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { admissionNo: { contains: q } }] },
          ],
        },
        select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true },
        take: 10,
      });
    });

    return ok({
      students: students.map((s) => ({
        id: s.id,
        name: [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" "),
        admissionNo: s.admissionNo,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("portal.teacher");
    const { studentId } = await req.json().catch(() => ({}));
    if (!studentId) return fail("MISSING", "studentId required.", 400);
    return ok(await studentOpenInvoices(user, studentId));
  } catch (e) {
    return handleError(e);
  }
}
