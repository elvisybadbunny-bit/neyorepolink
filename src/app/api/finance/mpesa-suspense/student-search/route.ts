import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("finance.record_payment");
    const query = (req.nextUrl.searchParams.get("q") || "").trim();
    if (query.length < 2) return ok({ students: [] });
    const students = await db.student.findMany({
      where: {
        tenantId: user.tenantId,
        deletedAt: null,
        OR: [
          { admissionNo: { contains: query, mode: "insensitive" } },
          { legacyAdmissionNo: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, admissionNo: true, firstName: true, lastName: true },
      take: 8,
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });
    return ok({ students });
  } catch (error) { return handleError(error); }
}
