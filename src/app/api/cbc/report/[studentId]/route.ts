/**
 * B.6 competency profile (JSON) + KICD-format report PDF (?format=pdf).
 * exam.view; parents row-scoped to own child via studentCompetencies.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { studentCompetencies } from "@/lib/services/cbc.service";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const user = await requirePermission("exam.view");
    const data = await studentCompetencies(user, params.studentId);
    const format = req.nextUrl.searchParams.get("format") === "pdf" ? "PDF" : "JSON";
    await db.auditLog.create({ data: { tenantId: user.tenantId, actorId: user.id, actorName: user.fullName, action: "cbc.learner_report_accessed", entityType: "Student", entityId: params.studentId, metadata: JSON.stringify({ format, role: user.role }) } });
    if (format === "PDF") {
      const { buildCbcReportPdf } = await import("@/lib/services/document.service");
      const { pdf, fileName } = await buildCbcReportPdf(user, data);
      return new Response(new Uint8Array(pdf), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${fileName}"` },
      });
    }
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}
