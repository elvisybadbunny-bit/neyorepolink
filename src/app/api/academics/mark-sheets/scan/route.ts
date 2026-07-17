/**
 * EE.4 — POST /api/academics/mark-sheets/scan
 * Accepts a scanned/photographed physical mark sheet (multipart/form-data or base64 JSON),
 * runs the Bundi Intelligent OCR + delta detection engine (`scanMarkSheetAndDetectDeltas`),
 * and returns the exact score deltas (`unchanged`, `changed`, `uncertain`).
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { scanMarkSheetAndDetectDeltas } from "@/lib/services/mark-sheet.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.4");

    let buffer: Buffer | null = null;
    let examId = "";
    let subjectId = "";
    let classId = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) return fail("INVALID", "No file provided in scan request.", 400);
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      examId = (formData.get("examId") as string) || "";
      subjectId = (formData.get("subjectId") as string) || "";
      classId = (formData.get("classId") as string) || "";
    } else {
      const body = await req.json();
      if (!body.imageBase64) {
        return fail("INVALID", "No imageBase64 or file provided in scan request.", 400);
      }
      buffer = Buffer.from(body.imageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      examId = body.examId || "";
      subjectId = body.subjectId || "";
      classId = body.classId || "";
    }

    if (!buffer || buffer.length === 0) {
      return fail("INVALID", "Empty scan buffer received.", 400);
    }

    const result = await scanMarkSheetAndDetectDeltas(user, buffer, {
      examId: examId || undefined,
      subjectId: subjectId || undefined,
      classId: classId || undefined,
    });

    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
