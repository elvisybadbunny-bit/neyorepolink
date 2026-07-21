import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import { getReportPresentationSetting } from "@/lib/services/report-presentation.service";

export async function getConsolidatedReportContext(
  tenantId: string,
  termId: string,
  classId: string,
  studentId: string,
) {
  return withTenant(tenantId, async () => {
    const tDb = tenantDb();
    const [term, student, presentation] = await Promise.all([
      tDb.academicTerm.findUnique({ where: { id: termId } }),
      tDb.student.findFirst({
        where: { id: studentId, classId },
        include: { schoolClass: true },
      }),
      getReportPresentationSetting(tenantId),
    ]);
    if (!term || !student)
      throw new Error("Learner or academic term was not found.");
    const nextTerm = await tDb.academicTerm.findFirst({
      where: {
        OR: [
          { year: term.year, term: { gt: term.term } },
          { year: { gt: term.year } },
        ],
      },
      orderBy: [{ year: "asc" }, { term: "asc" }],
    });
    const historyRows = await tDb.masterReportCard.findMany({
      where: { studentId, subjectId: null },
      orderBy: { computedAt: "asc" },
    });
    const historyTermIds = [...new Set(historyRows.map((row) => row.termId))];
    const historyTerms = historyTermIds.length
      ? await tDb.academicTerm.findMany({
          where: { id: { in: historyTermIds } },
          select: { id: true, year: true, term: true },
        })
      : [];
    const termById = new Map(historyTerms.map((row) => [row.id, row]));
    const trend = historyRows
      .map((row) => ({
        termId: row.termId,
        label: termById.has(row.termId)
          ? `T${termById.get(row.termId)!.term} ${termById.get(row.termId)!.year}`
          : "Prior term",
        mean: row.finalMark,
      }))
      .slice(-6);

    let fees: null | {
      balanceKes: number;
      nextTermFeeKes: number | null;
      nextTermLabel: string | null;
    } = null;
    if (presentation.showFeesOnReport) {
      const invoices = await tDb.invoice.findMany({
        where: { studentId },
        select: { totalKes: true, paidKes: true, discountKes: true },
      });
      const balanceKes = invoices.reduce(
        (sum, invoice) =>
          sum +
          Math.max(0, invoice.totalKes - invoice.discountKes - invoice.paidKes),
        0,
      );
      let nextTermFeeKes: number | null = null;
      if (nextTerm && student.schoolClass) {
        const structures = await tDb.feeStructure.findMany({
          where: { year: nextTerm.year, term: nextTerm.term },
          include: { items: true },
        });
        const structure =
          structures.find((row) => row.classId === classId) ??
          structures.find(
            (row) => !row.classId && row.level === student.schoolClass?.level,
          ) ??
          structures.find((row) => row.applyToAllLevels) ??
          null;
        nextTermFeeKes = structure
          ? structure.items.reduce((sum, item) => sum + item.amountKes, 0)
          : null;
      }
      fees = {
        balanceKes,
        nextTermFeeKes,
        nextTermLabel: nextTerm
          ? `Term ${nextTerm.term}, ${nextTerm.year}`
          : null,
      };
    }
    return {
      academicDates: {
        termStartDate: term.startDate,
        schoolClosedDate: term.endDate,
        nextTermBeginsDate: nextTerm?.startDate ?? null,
      },
      fees,
      trend,
      printMode: presentation.printMode,
    };
  });
}
