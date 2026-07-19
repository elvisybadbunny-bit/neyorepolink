import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { ok, fail, handleError } from "@/lib/api/respond";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requirePermission("exam.enter_marks");
    const classId = req.nextUrl.searchParams.get("classId");
    if (!classId) return fail("INVALID", "Class is required.", 400);
    const data = await withTenant(user.tenantId, async () => {
      const tDb = tenantDb();
      const exam = await tDb.exam.findUnique({ where: { id: params.id } });
      if (!exam) return null;
      const slots = await tDb.examTimetableSlot.findMany({ where: { examName: exam.name, classId }, select: { subjectId: true } });
      const subjectIds = Array.from(new Set(slots.map((slot) => slot.subjectId)));
      return tDb.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true, code: true }, orderBy: { name: "asc" } });
    });
    if (!data) return fail("NOT_FOUND", "Exam not found.", 404);
    return ok({ subjects: data });
  } catch (error) { return handleError(error); }
}
