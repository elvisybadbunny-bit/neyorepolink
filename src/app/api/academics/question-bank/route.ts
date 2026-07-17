/**
 * EE.8 — GET/POST /api/academics/question-bank
 * GET: list questions from national and school question banks (`listQuestionBank`).
 * POST: create a self-marking question with diagram support (`createQuestionEntry`).
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import {
  listQuestionBank,
  createQuestionEntry,
} from "@/lib/services/question-bank.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  listQuestionBankQuerySchema,
  createQuestionBankEntrySchema,
} from "@/lib/validations/question-bank";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.8");

    const query = listQuestionBankQuerySchema.parse({
      subjectId: req.nextUrl.searchParams.get("subjectId") || undefined,
      strandId: req.nextUrl.searchParams.get("strandId") || undefined,
      substrandId: req.nextUrl.searchParams.get("substrandId") || undefined,
      grade: req.nextUrl.searchParams.get("grade") || undefined,
      difficulty: req.nextUrl.searchParams.get("difficulty") || undefined,
      scope: req.nextUrl.searchParams.get("scope") || "ALL",
      search: req.nextUrl.searchParams.get("search") || undefined,
    });

    const questions = await listQuestionBank(user, query);
    return ok({ questions });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.8");

    const input = createQuestionBankEntrySchema.parse(await req.json());
    const created = await createQuestionEntry(user, input);
    return ok(created);
  } catch (e) {
    return handleError(e);
  }
}
