import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission, requireUser } from "@/lib/core/session";
import { withTenant } from "@/lib/core/tenant-context";
import { withIdempotency } from "@/lib/services/idempotency.service";
import { ok, handleError } from "@/lib/api/respond";
import {
  cbeDeliveryBoard, createDeliverySession, createIntervention,
  recordDeliveryEvidence, reviewIntervention, saveCurriculumDesign,
} from "@/lib/services/cbe-delivery.service";

export const dynamic = "force-dynamic";
const stringList = z.array(z.string().trim().min(1)).max(30).default([]);
const base = z.object({ action: z.string() });

export async function GET() {
  try {
    const user = await requirePermission("academics.view");
    return ok({ board: await withTenant(user.tenantId, cbeDeliveryBoard) });
  } catch (error) { return handleError(error); }
}

export async function POST(req: NextRequest) {
  try {
    const body = base.passthrough().parse(await req.json());
    const user = await requireUser();
    const idempotencyKey = req.headers.get("Idempotency-Key");
    const once = async <T,>(action: string, run: () => Promise<T>) => {
      if (!idempotencyKey) return run();
      return (await withIdempotency(user.tenantId, `cbe_delivery.${action}`, idempotencyKey, run)).result;
    };
    if (body.action === "save_design") {
      await requirePermission("academics.manage");
      const input = z.object({
        substrandId: z.string().min(1), suggestedLearningExperiences: stringList,
        keyInquiryQuestions: stringList, competencyCodes: stringList, values: stringList,
        pertinentIssues: stringList, crossLearningAreaLinks: z.array(z.object({ learningArea: z.string().min(1), connection: z.string().min(1) })).max(20).default([]),
        communityServiceIdeas: stringList, suggestedResources: stringList, assessmentCriteria: stringList,
        lessonAllocation: z.number().int().min(1).max(100).nullable().optional(), sourceLabel: z.string().max(200).optional(),
        sourceVersion: z.string().max(100).optional(), sourceReference: z.string().max(300).optional(),
        reviewStatus: z.enum(["DRAFT", "REVIEWED", "PUBLISHED"]).default("DRAFT"),
      }).parse(body);
      return ok({ result: await withTenant(user.tenantId, () => saveCurriculumDesign(user, input)) });
    }
    if (body.action === "create_session") {
      await requirePermission("academics.manage");
      const input = z.object({ curriculumDesignId: z.string().min(1), classId: z.string().min(1), deliveredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), status: z.enum(["PLANNED", "DELIVERED", "REVIEWED"]).default("PLANNED"), deliveryNotes: z.string().max(3000).optional(), nextSteps: z.string().max(2000).optional(), resourceLinks: stringList, timetableSlotId: z.string().optional(), lessonPlanId: z.string().optional(), syllabusTopicId: z.string().optional(), assessmentPlanId: z.string().optional() }).parse(body);
      return ok({ result: await once("create_session", () => withTenant(user.tenantId, () => createDeliverySession(user, input))) });
    }
    if (body.action === "record_evidence") {
      await requirePermission("exam.enter_marks");
      const input = z.object({ deliverySessionId: z.string().min(1), studentId: z.string().min(1), level: z.number().int().min(1).max(4).nullable().optional(), observation: z.string().min(3).max(3000), evidenceUrl: z.string().url().optional().or(z.literal("")), cbcAssessmentId: z.string().optional(), assessmentRecordId: z.string().optional(), competencyEvidenceId: z.string().optional(), portfolioItemId: z.string().optional() }).parse(body);
      return ok({ result: await once("record_evidence", () => withTenant(user.tenantId, () => recordDeliveryEvidence(user, input))) });
    }
    if (body.action === "create_intervention") {
      await requirePermission("exam.enter_marks");
      const input = z.object({ deliverySessionId: z.string().optional(), studentId: z.string().min(1), substrandId: z.string().min(1), reason: z.string().min(3).max(1000), actionType: z.enum(["QUESTION_SET", "SIMULATION", "RESOURCE", "RETEACH", "GOAL", "OTHER"]), actionDetails: z.string().min(3).max(2000), targetLevel: z.number().int().min(1).max(4).nullable().optional(), reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), parentSummary: z.string().max(1500).optional() }).parse(body);
      return ok({ result: await once("create_intervention", () => withTenant(user.tenantId, () => createIntervention(user, input))) });
    }
    if (body.action === "review_intervention") {
      await requirePermission("exam.enter_marks");
      const input = z.object({ id: z.string().min(1), status: z.enum(["IN_PROGRESS", "REVIEWED", "CLOSED"]), outcome: z.string().max(2000).optional(), reviewedLevel: z.number().int().min(1).max(4).nullable().optional(), parentSummary: z.string().max(1500).optional() }).parse(body);
      return ok({ result: await withTenant(user.tenantId, () => reviewIntervention(user, input)) });
    }
    throw new Error("Unsupported CBE Delivery action.");
  } catch (error) { return handleError(error); }
}
