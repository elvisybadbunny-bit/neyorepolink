import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok,handleError } from "@/lib/api/respond";
import { saveSubjectStaffingRule,teacherElectiveStaffingReport } from "@/lib/services/teacher-elective-staffing.service";
export const dynamic="force-dynamic";
export async function GET(){try{const user=await requirePermission("academics.view");return ok({report:await teacherElectiveStaffingReport(user)});}catch(error){return handleError(error);}}
export async function POST(req:NextRequest){try{const user=await requirePermission("academics.manage");const input=z.object({subjectId:z.string().min(1),recommendedMaxGroupSize:z.coerce.number().int().min(1).max(500).nullable().optional(),practicalMaxGroupSize:z.coerce.number().int().min(1).max(500).nullable().optional(),practicalHeavy:z.boolean()}).parse(await req.json());return ok({result:await saveSubjectStaffingRule(user,input)});}catch(error){return handleError(error);}}
