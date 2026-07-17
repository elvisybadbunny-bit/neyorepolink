import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  listStudentDuties,
  saveStudentDutyArea,
  deleteStudentDutyArea,
  removeStudentDutyAssignment,
  autoAssignStudentDuties,
  StudentDutyError,
} from "@/lib/services/student-duty.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("student.view");
    const classId = req.nextUrl.searchParams.get("classId") || undefined;
    const termId = req.nextUrl.searchParams.get("termId") || undefined;
    const data = await listStudentDuties(user, { classId, termId });
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    const body = await req.json().catch(() => ({}));

    switch (body.action) {
      case "save_area":
        return ok(await saveStudentDutyArea(user, body.area));
      case "delete_area":
        if (!body.id) return fail("INVALID", "id required.", 400);
        return ok(await deleteStudentDutyArea(user, body.id));
      case "remove_assignment":
        if (!body.id) return fail("INVALID", "id required.", 400);
        return ok(await removeStudentDutyAssignment(user, body.id));
      case "auto_assign":
        return ok(await autoAssignStudentDuties(user, { classId: body.classId, termId: body.termId }));
      default:
        return fail("INVALID", "Unknown action.", 400);
    }
  } catch (err) {
    if (err instanceof StudentDutyError) {
      return fail(err.code, err.message, err.code === "NOT_FOUND" ? 404 : 400);
    }
    return handleError(err);
  }
}
