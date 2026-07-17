/**
 * EE.5 — GET/POST /api/academics/exam-papers
 * GET: lists all tidied/saved exam papers inside the school's `ScannedExamPaper` library.
 * POST: saves or updates a tidied exam paper with teacher edits (`saveTidiedExamPaper`).
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import {
  listScannedExamPapers,
  saveTidiedExamPaper,
} from "@/lib/services/exam-paper-scan.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { saveTidiedExamPaperSchema } from "@/lib/validations/exam-paper-scan";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.5");

    const subjectId = req.nextUrl.searchParams.get("subjectId") || undefined;
    const classId = req.nextUrl.searchParams.get("classId") || undefined;
    const status = req.nextUrl.searchParams.get("status") || undefined;

    const rows = await listScannedExamPapers(user, { subjectId, classId, status });
    return ok({ papers: rows });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.5");

    const input = saveTidiedExamPaperSchema.parse(await req.json());
    const saved = await saveTidiedExamPaper(user, input);
    return ok(saved);
  } catch (e) {
    return handleError(e);
  }
}
