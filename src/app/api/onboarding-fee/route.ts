import { NextRequest } from "next/server";
import { requirePermission, requireUser } from "@/lib/core/session";
import { handleError, ok } from "@/lib/api/respond";
import { approveOnboardingQuote, currentOnboardingForTenant, initiateOnboardingPayment, updateOnboardingChecklist } from "@/lib/services/onboarding-fee.service";
export const dynamic="force-dynamic";
export async function GET(){try{const user=await requireUser();return ok(await currentOnboardingForTenant(user.tenantId));}catch(error){return handleError(error)}}
export async function POST(req:NextRequest){try{const user=await requirePermission("owner.dashboard");const body=await req.json();if(body.action==="approve")return ok({quote:await approveOnboardingQuote(user,body.id)});if(body.action==="pay")return ok(await initiateOnboardingPayment(user,body));if(body.action==="checklist")return ok({run:await updateOnboardingChecklist(user,body)});throw new Error("Unsupported onboarding action.");}catch(error){return handleError(error)}}
