import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { committeeReviewTimetable, draftTimetablePreview, headApproveTimetable, publishApprovedTimetable, returnTimetableForCorrection, timetableGovernanceBoard } from "@/lib/services/timetable-governance.service";
export const dynamic = "force-dynamic";
export async function GET(req:NextRequest){try{const user=await requirePermission("academics.view");const jobId=req.nextUrl.searchParams.get("jobId");if(jobId)return ok({preview:await draftTimetablePreview(user,jobId)});return ok({jobs:await timetableGovernanceBoard(user)});}catch(error){return handleError(error);}}
export async function POST(req:NextRequest){try{const user=await requirePermission("academics.manage");const body=z.object({action:z.enum(["committee_review","return","head_approve","publish"]),jobId:z.string().min(1),note:z.string().max(3000).optional().default("")}).parse(await req.json());if(body.action==="committee_review")return ok(await committeeReviewTimetable(user,body.jobId,body.note));if(body.action==="return")return ok(await returnTimetableForCorrection(user,body.jobId,body.note));if(body.action==="head_approve")return ok(await headApproveTimetable(user,body.jobId,body.note));return ok(await publishApprovedTimetable(user,body.jobId,body.note));}catch(error){return handleError(error);}}
