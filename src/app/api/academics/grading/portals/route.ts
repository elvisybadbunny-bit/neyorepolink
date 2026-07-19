import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";

const actionSchema = z.object({
  action: z.enum(["OPEN", "CLOSE", "REOPEN_CORRECTION"]),
  portalId: z.string().optional(),
  termId: z.string().optional(),
  name: z.string().trim().min(3).optional(),
  closeDate: z.coerce.date().optional(),
});

export async function GET() {
  try {
    const user = await requirePermission("academics.view");
    return ok(await withTenant(user.tenantId, () => tenantDb().marksPortal.findMany({ orderBy: { createdAt: "desc" } })));
  } catch (error) { return handleError(error); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    const input = actionSchema.parse(await req.json());
    const result = await withTenant(user.tenantId, async () => {
      const tDb = tenantDb();
      if (input.action === "OPEN") {
        if (!input.termId || !input.name || !input.closeDate) throw new Error("Term, portal name and closing date are required.");
        const term = await tDb.academicTerm.findUnique({ where: { id: input.termId } });
        if (!term) throw new Error("Academic term not found.");
        const exams = await tDb.exam.findMany({ where: { year: term.year, term: term.term }, select: { id: true, name: true } });
        if (!exams.length) throw new Error("Create the term exam before opening marks entry.");
        // The exam timetable is the source of truth for papers/classes that are ready.
        const slots = await tDb.examTimetableSlot.findMany({ where: { examName: { in: exams.map((exam) => exam.name) } }, select: { examName: true, subjectId: true } });
        if (!slots.length) throw new Error("Publish the exam timetable before opening marks entry.");
        for (const exam of exams) {
          const subjectIds = Array.from(new Set(slots.filter((slot) => slot.examName === exam.name).map((slot) => slot.subjectId)));
          for (const subjectId of subjectIds) await tDb.examSubject.upsert({ where: { examId_subjectId: { examId: exam.id, subjectId } }, create: { examId: exam.id, subjectId }, update: {} });
        }
        return tDb.marksPortal.create({ data: { tenantId: user.tenantId, termId: term.id, name: input.name, openDate: new Date(), closeDate: input.closeDate, status: "OPEN" } });
      }
      if (!input.portalId) throw new Error("Portal is required.");
      const portal = await tDb.marksPortal.findUnique({ where: { id: input.portalId } });
      if (!portal) throw new Error("Marks portal not found.");
      if (input.action === "CLOSE") return tDb.marksPortal.update({ where: { id: portal.id }, data: { status: "CLOSED", closeDate: new Date() } });
      if (!["CLOSED", "PENDING_RELEASE"].includes(portal.status)) throw new Error("Only a closed, unreleased portal can be reopened for correction.");
      const closeDate = input.closeDate ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
      return tDb.marksPortal.update({ where: { id: portal.id }, data: { status: "CORRECTION_OPEN", openDate: new Date(), closeDate, computationProgress: 0, computationStartedAt: null, computationEndedAt: null } });
    });
    return ok(result);
  } catch (error) {
    if (error instanceof Error && !('code' in error)) return fail("INVALID", error.message, 400);
    return handleError(error);
  }
}
