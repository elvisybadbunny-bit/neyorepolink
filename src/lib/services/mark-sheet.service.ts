/**
 * EE.4 — Printable class mark sheets + scan-to-enter with delta/re-scan detection.
 * Built on the existing Bundi Intelligent OCR pipeline (enhanceImageForOcr, runLocalOcr, groupWordsIntoRows).
 *
 * All operations strictly scoped to `user.tenantId`.
 */

import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";
import {
  enhanceImageForOcr,
  runLocalOcr,
  groupWordsIntoRows,
  applyNumericOcrFixes,
  matchAgainstKnownValues,
  BundiIntelligentError,
} from "@/lib/services/bundi-intelligent.service";
import type {
  MarkSheetPrintData,
  MarkSheetStudentRow,
  MarkSheetScanResult,
  MarkSheetDeltaRow,
  ApplyMarkSheetDeltasInput,
} from "@/lib/validations/mark-sheet";

export class MarkSheetError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "MarkSheetError";
  }
}

async function audit(user: SessionUser, action: string, entityId: string, metadata?: unknown) {
  try {
    const tdb = tenantDb();
    await tdb.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.id,
        actorName: (user as any).fullName || "User",
        action,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      } as never,
    });
  } catch (e) {
    console.error("Audit logging error:", e);
  }
}

function getStudentFullName(s: { firstName: string; middleName?: string | null; lastName: string }): string {
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
}

/** Generate the real data needed to print a high-contrast class mark sheet. */
export async function getMarkSheetPrintData(
  user: SessionUser,
  input: { examId: string; subjectId: string; classId: string; type?: "NUMERICAL" | "RUBRIC" }
): Promise<MarkSheetPrintData> {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const tenant = await tdb.tenant.findUnique({ where: { id: user.tenantId }, select: { name: true } });
    const exam = await tdb.exam.findUnique({ where: { id: input.examId } });
    if (!exam) throw new MarkSheetError("NOT_FOUND", "Exam not found.");

    const subject = await tdb.subject.findUnique({ where: { id: input.subjectId } });
    if (!subject) throw new MarkSheetError("NOT_FOUND", "Subject not found.");

    const schoolClass = await tdb.schoolClass.findUnique({ where: { id: input.classId } });
    if (!schoolClass) throw new MarkSheetError("NOT_FOUND", "Class not found.");

    const students = await tdb.student.findMany({
      where: { classId: input.classId, status: "ACTIVE" },
      orderBy: { admissionNo: "asc" },
      select: { id: true, admissionNo: true, firstName: true, middleName: true, lastName: true },
    });

    const studentIds = students.map((s) => s.id);

    // Fetch existing numerical exam results or CBC assessment rubrics
    const existingResults = await tdb.examResult.findMany({
      where: { examId: input.examId, subjectId: input.subjectId, studentId: { in: studentIds } },
    });
    const resultMap = new Map<string, number>(existingResults.map((r) => [r.studentId, r.marks]));

    const existingAssessments = await tdb.cbcAssessment.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { date: "desc" },
    });
    const rubricMap = new Map<string, { level: number; comment: string | null }>();
    for (const a of existingAssessments) {
      if (!rubricMap.has(a.studentId)) {
        rubricMap.set(a.studentId, { level: a.level, comment: a.comment });
      }
    }

    const rows: MarkSheetStudentRow[] = students.map((s) => ({
      studentId: s.id,
      admissionNumber: s.admissionNo,
      fullName: getStudentFullName(s),
      currentMark: resultMap.get(s.id) ?? null,
      currentRubricLevel: rubricMap.get(s.id)?.level ?? null,
      currentComment: rubricMap.get(s.id)?.comment ?? null,
    }));

    const trackingRef = `MS-EXAM-${input.examId}-SUB-${input.subjectId}-CLS-${input.classId}`;

    return {
      trackingRef,
      schoolName: tenant?.name ?? "NEYO School",
      examId: exam.id,
      examName: exam.name,
      year: exam.year,
      term: exam.term,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      classId: schoolClass.id,
      className: `${schoolClass.level} ${schoolClass.stream}`.trim(),
      maxMarks: exam.maxMarks,
      type: input.type ?? "NUMERICAL",
      students: rows,
      generatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Scan an uploaded mark sheet image/PDF, run local OCR (`enhanceImageForOcr` + `runLocalOcr`),
 * extract tracking header and table rows, and deterministically compute exact score deltas.
 */
export async function scanMarkSheetAndDetectDeltas(
  user: SessionUser,
  imageBuffer: Buffer,
  hint?: { examId?: string; subjectId?: string; classId?: string }
): Promise<MarkSheetScanResult> {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();

    // Stage 1: Image enhancement (real, zero-cost)
    const enhancedBuffer = await enhanceImageForOcr(imageBuffer);

    // Stage 2: Run local OCR
    const ocr = await runLocalOcr(enhancedBuffer);
    const fullText = ocr.fullText;

    // Try to extract exact trackingRef code from header if present
    let trackingRefFound: string | null = null;
    const refMatch = fullText.match(/MS-EXAM-([a-zA-Z0-9_-]+)-SUB-([a-zA-Z0-9_-]+)-CLS-([a-zA-Z0-9_-]+)/);
    if (refMatch) {
      trackingRefFound = refMatch[0];
    }

    const examId = hint?.examId || refMatch?.[1] || "";
    const subjectId = hint?.subjectId || refMatch?.[2] || "";
    const classId = hint?.classId || refMatch?.[3] || "";

    if (!examId || !subjectId || !classId) {
      throw new MarkSheetError(
        "INVALID",
        "Could not detect exact Exam, Subject, and Class tracking reference from scan header. Please select the Exam, Class, and Subject manually."
      );
    }

    const exam = await tdb.exam.findUnique({ where: { id: examId } });
    const subject = await tdb.subject.findUnique({ where: { id: subjectId } });
    const schoolClass = await tdb.schoolClass.findUnique({ where: { id: classId } });

    if (!exam || !subject || !schoolClass) {
      throw new MarkSheetError("NOT_FOUND", "The Exam, Subject, or Class referenced in this mark sheet does not exist.");
    }

    // Load real active students in this class
    const students = await tdb.student.findMany({
      where: { classId, status: "ACTIVE" },
      orderBy: { admissionNo: "asc" },
      select: { id: true, admissionNo: true, firstName: true, middleName: true, lastName: true },
    });

    const existingResults = await tdb.examResult.findMany({
      where: { examId, subjectId, studentId: { in: students.map((s) => s.id) } },
    });
    const resultMap = new Map<string, number>(existingResults.map((r) => [r.studentId, r.marks]));

    // Stage 3: Row and field detection
    const detectedRows = groupWordsIntoRows(ocr.words, 24);

    const deltaRows: MarkSheetDeltaRow[] = [];
    const matchedStudentIds = new Set<string>();

    const knownAdmissions = students.map((s) => s.admissionNo);
    const knownNames = students.map((s) => getStudentFullName(s));

    for (const row of detectedRows) {
      const rowText = row.words.map((w) => w.text).join(" ");

      // Match admission number or student name against real class roster
      let matchedStudent = students.find((s) => {
        const cleanAdm = applyNumericOcrFixes(s.admissionNo);
        return (
          rowText.includes(s.admissionNo) ||
          (cleanAdm.length >= 3 && rowText.includes(cleanAdm))
        );
      });

      if (!matchedStudent) {
        // Try exact/fuzzy name matching on this row
        const matchedName = matchAgainstKnownValues(rowText, knownNames, 3);
        if (matchedName) {
          matchedStudent = students.find((s) => getStudentFullName(s) === matchedName);
        }
      }

      if (!matchedStudent || matchedStudentIds.has(matchedStudent.id)) {
        continue;
      }
      matchedStudentIds.add(matchedStudent.id);

      // Look for candidate number/mark tokens in the right-most part of the row
      // (in a standard mark sheet, the score box is the rightmost column)
      const wordsRight = [...row.words].sort((a, b) => b.bbox.x0 - a.bbox.x0);
      let newMarkCandidate: number | null = null;
      let rawOcrToken = "";
      let confidencePct = 100;

      for (const w of wordsRight.slice(0, 4)) {
        const cleanToken = applyNumericOcrFixes(w.text.trim());
        const num = parseInt(cleanToken, 10);
        // Valid numerical mark out of exam.maxMarks
        if (!isNaN(num) && num >= 0 && num <= exam.maxMarks) {
          // Verify it's not the student's admission number itself
          if (cleanToken !== matchedStudent.admissionNo) {
            newMarkCandidate = num;
            rawOcrToken = w.text;
            confidencePct = w.confidencePct;
            break;
          }
        }
      }

      const oldMark = resultMap.get(matchedStudent.id) ?? null;
      let status: MarkSheetDeltaRow["status"] = "UNCHANGED";

      if (newMarkCandidate === null) {
        status = "UNCERTAIN_REVIEW";
      } else if (oldMark === null) {
        status = "NEW_ENTRY";
      } else if (oldMark !== newMarkCandidate) {
        status = "CHANGED_DELTA";
      } else {
        status = "UNCHANGED";
      }

      if (confidencePct < 65 && newMarkCandidate !== null) {
        status = "UNCERTAIN_REVIEW";
      }

      deltaRows.push({
        studentId: matchedStudent.id,
        admissionNumber: matchedStudent.admissionNo,
        studentName: getStudentFullName(matchedStudent),
        oldMark,
        newMark: newMarkCandidate,
        status,
        confidencePct,
        rawOcrText: rawOcrToken || rowText.slice(-15),
        reviewNote:
          status === "UNCERTAIN_REVIEW"
            ? "Handwriting unclear or below confidence threshold. Please verify."
            : undefined,
      });
    }

    // Add any student who wasn't detected on the scan sheet at all
    for (const s of students) {
      if (!matchedStudentIds.has(s.id)) {
        const oldMark = resultMap.get(s.id) ?? null;
        deltaRows.push({
          studentId: s.id,
          admissionNumber: s.admissionNo,
          studentName: getStudentFullName(s),
          oldMark,
          newMark: null,
          status: oldMark !== null ? "UNCHANGED" : "UNCERTAIN_REVIEW",
          confidencePct: 0,
          rawOcrText: "(Not detected on scan)",
          reviewNote: "Row not detected in scan. Please enter manually if marked.",
        });
      }
    }

    // Sort by admission number
    deltaRows.sort((a, b) => a.admissionNumber.localeCompare(b.admissionNumber));

    const unchangedCount = deltaRows.filter((r) => r.status === "UNCHANGED").length;
    const changedDeltaCount = deltaRows.filter((r) => r.status === "CHANGED_DELTA").length;
    const uncertainCount = deltaRows.filter((r) => r.status === "UNCERTAIN_REVIEW").length;
    const newEntryCount = deltaRows.filter((r) => r.status === "NEW_ENTRY").length;

    await audit(user, "academics.mark_sheet_scanned", exam.id, {
      subjectId: subject.id,
      classId: schoolClass.id,
      totalStudents: students.length,
      unchangedCount,
      changedDeltaCount,
      uncertainCount,
      newEntryCount,
    });

    return {
      trackingRefFound,
      examId: exam.id,
      examName: exam.name,
      subjectId: subject.id,
      subjectName: subject.name,
      classId: schoolClass.id,
      className: `${schoolClass.level} ${schoolClass.stream}`.trim(),
      totalStudentsOnSheet: students.length,
      unchangedCount,
      changedDeltaCount,
      uncertainCount,
      newEntryCount,
      rows: deltaRows,
      pipelineStats: {
        ocrWordsDetected: ocr.words.length,
        rowsGrouped: detectedRows.length,
        enhancementApplied: true,
      },
    };
  });
}

/** Apply confirmed mark sheet deltas to the live database inside a clean transaction. */
export async function applyMarkSheetDeltas(
  user: SessionUser,
  input: ApplyMarkSheetDeltasInput
): Promise<{ updatedCount: number; newCount: number; unchangedSkipped: number }> {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const exam = await tdb.exam.findUnique({ where: { id: input.examId } });
    if (!exam) throw new MarkSheetError("NOT_FOUND", "Exam not found.");

    let updatedCount = 0;
    let newCount = 0;
    let unchangedSkipped = 0;

    await tdb.$transaction(async (tx) => {
      for (const d of input.deltas) {
        // Skip explicitly unchanged rows or null scores
        if (d.status === "UNCHANGED" || d.newMark === null || d.newMark === undefined) {
          unchangedSkipped++;
          continue;
        }

        const existing = await tx.examResult.findUnique({
          where: {
            examId_studentId_subjectId: {
              examId: input.examId,
              studentId: d.studentId,
              subjectId: input.subjectId,
            },
          },
        });

        if (existing) {
          if (existing.marks === d.newMark) {
            unchangedSkipped++;
            continue;
          }
          await tx.examResult.update({
            where: { id: existing.id },
            data: { marks: d.newMark, enteredById: user.id },
          });
          updatedCount++;
        } else {
          await tx.examResult.create({
            data: {
              tenantId: user.tenantId,
              examId: input.examId,
              studentId: d.studentId,
              subjectId: input.subjectId,
              marks: d.newMark,
              enteredById: user.id,
            } as never,
          });
          newCount++;
        }
      }
    });

    await audit(user, "academics.mark_sheet_deltas_applied", input.examId, {
      subjectId: input.subjectId,
      classId: input.classId,
      updatedCount,
      newCount,
      unchangedSkipped,
    });

    return { updatedCount, newCount, unchangedSkipped };
  });
}
