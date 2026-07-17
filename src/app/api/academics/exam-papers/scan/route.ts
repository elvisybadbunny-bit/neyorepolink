/**
 * EE.5 — POST /api/academics/exam-papers/scan
 * Accepts an uploaded scan or camera photo of a rough/handwritten paper exam,
 * runs the OCR + deterministic question segmentation engine (`scanAndTidyExamPaper`),
 * and returns the extracted title, instructions, time allowed, total marks, and questions list.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { scanAndTidyExamPaper } from "@/lib/services/exam-paper-scan.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.5");

    let buffer: Buffer | null = null;
    let title = "";
    let defaultMarksPerQuestion = 2;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) return fail("INVALID", "No file provided in scan request.", 400);
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      title = (formData.get("title") as string) || "";
      const marksRaw = formData.get("defaultMarksPerQuestion");
      if (marksRaw) defaultMarksPerQuestion = parseInt(marksRaw.toString(), 10) || 2;
    } else {
      const body = await req.json();
      if (!body.imageBase64) {
        return fail("INVALID", "No imageBase64 or file provided in scan request.", 400);
      }
      buffer = Buffer.from(body.imageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      title = body.title || "";
      if (body.defaultMarksPerQuestion) defaultMarksPerQuestion = body.defaultMarksPerQuestion;
    }

    if (!buffer || buffer.length === 0) {
      return fail("INVALID", "Empty scan buffer received.", 400);
    }

    const result = await scanAndTidyExamPaper(user, buffer, {
      title: title || undefined,
      defaultMarksPerQuestion,
    });

    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
