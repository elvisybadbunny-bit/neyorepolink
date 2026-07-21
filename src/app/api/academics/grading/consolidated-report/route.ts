import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { fail, handleError } from "@/lib/api/respond";
import { db } from "@/lib/db";
import { getMasterReportCards } from "@/lib/services/computation-engine.service";
import { getConsolidatedReportContext } from "@/lib/services/consolidated-report-context.service";
import { getOrCreateReportNarratives } from "@/lib/services/report-narrative.service";
import { renderConsolidatedReportPdf } from "@/lib/documents/consolidated-report-pdf";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    const termId = request.nextUrl.searchParams.get("termId");
    const classId = request.nextUrl.searchParams.get("classId");
    const studentId = request.nextUrl.searchParams.get("studentId");
    if (!termId || !classId || !studentId)
      return fail(
        "INVALID",
        "termId, classId and studentId are required.",
        400,
      );
    const [report, context, narratives, tenant, term, schoolClass, snapshot] =
      await Promise.all([
        getMasterReportCards(user.tenantId, termId, classId),
        getConsolidatedReportContext(user.tenantId, termId, classId, studentId),
        getOrCreateReportNarratives(user.tenantId, termId, classId, studentId),
        db.tenant.findUnique({
          where: { id: user.tenantId },
          select: { name: true },
        }),
        db.academicTerm.findFirst({
          where: { id: termId, tenantId: user.tenantId },
        }),
        db.schoolClass.findFirst({
          where: { id: classId, tenantId: user.tenantId },
        }),
        db.reportPublicationSnapshot.findFirst({
          where: { tenantId: user.tenantId, termId, studentId },
          orderBy: { version: "desc" },
        }),
      ]);
    const learner = report.students.find(
      (student) => student.studentId === studentId,
    );
    if (!learner || !tenant || !term || !schoolClass)
      return fail(
        "NOT_FOUND",
        "The consolidated learner report was not found.",
        404,
      );
    const commentBySubject = new Map(
      narratives.comments.map((row) => [row.subjectId, row]),
    );
    const remarks = new Map(
      narratives.remarks.map((row) => [row.role, row.remark]),
    );
    const pdf = await renderConsolidatedReportPdf({
      schoolName: tenant.name,
      learnerName: learner.name,
      admissionNo: learner.admissionNo,
      className: [schoolClass.level, schoolClass.stream]
        .filter(Boolean)
        .join(" "),
      termLabel: `Term ${term.term}, ${term.year}`,
      subjects: learner.subjects.map((subject) => {
        const narrative = commentBySubject.get(subject.subjectId);
        return {
          name: subject.subjectName,
          finalMark: subject.finalMark,
          classMean: subject.classMean,
          deviation: subject.deviation,
          grade: subject.letterGrade ?? `CBE ${subject.cbcLevel ?? "—"}`,
          rank: subject.rank ? `${subject.rank}/${subject.outOf}` : "—",
          teacher: narrative?.resolvedTeacherName ?? "",
          comment: narrative?.comment ?? "",
          components: subject.components,
        };
      }),
      mean: learner.overall?.finalMark ?? 0,
      overallGrade:
        learner.overall?.letterGrade ??
        `CBE ${learner.overall?.cbcLevel ?? "—"}`,
      position: learner.overall?.rank
        ? `${learner.overall.rank}/${learner.overall.outOf}`
        : "—",
      rankingPolicy: report.presentation.rankingPolicy,
      dates: context.academicDates,
      fees: context.fees,
      trend: context.trend,
      classTeacherRemark: remarks.get("CLASS_TEACHER") ?? "",
      principalRemark: remarks.get("PRINCIPAL") ?? "",
      formulaVersion: report.presentation.formulaVersion,
      calculationHash: snapshot?.calculationHash ?? null,
      blackAndWhite: context.printMode === "BLACK_AND_WHITE",
    });
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="NEYO-${learner.admissionNo}-T${term.term}-${term.year}.pdf"`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
