/**
 * EE.8 — POST /api/academics/question-bank/seed-junior
 * Idempotently populates our comprehensive Junior School question repository (`JUNIOR_SCHOOL_QUESTION_SEEDS`).
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { seedJuniorSchoolQuestionBank } from "@/lib/services/question-bank.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.8");

    const seeded = await seedJuniorSchoolQuestionBank(user);
    return ok(seeded);
  } catch (e) {
    return handleError(e);
  }
}
