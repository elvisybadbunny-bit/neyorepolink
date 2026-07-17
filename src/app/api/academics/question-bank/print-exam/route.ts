/**
 * EE.8 — POST /api/academics/question-bank/print-exam
 * Generates official, high-contrast, printable examination paper data directly
 * from handpicked Question Bank entries across any grade (`Grade 1–6`, `Grade 7–9`, `Grade 10`).
 * Includes both the formatted printable exam paper block and the teacher answer key block.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { getPrintableQuestionBankExam } from "@/lib/services/question-bank.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { printQuestionBankExamSchema } from "@/lib/validations/question-bank";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.8");

    const input = printQuestionBankExamSchema.parse(await req.json());
    const data = await getPrintableQuestionBankExam(user, input);
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}
