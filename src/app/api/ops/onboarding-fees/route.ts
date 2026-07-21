import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { handleError, ok } from "@/lib/api/respond";
import { createOnboardingFeeQuote, getOnboardingFeeConfig, listOnboardingFeeQuotes, reviewOnboardingFeeQuote, saveOnboardingFeeConfig } from "@/lib/services/onboarding-fee.service";
export const dynamic="force-dynamic";
export async function GET(){try{await requirePermission("platform.founder_ops");return ok({config:await getOnboardingFeeConfig(),quotes:await listOnboardingFeeQuotes()});}catch(error){return handleError(error)}}
export async function POST(req:NextRequest){try{const user=await requirePermission("platform.founder_ops");const body=await req.json();if(body.action==="save_config")return ok({config:await saveOnboardingFeeConfig(user,body.config)});if(body.action==="calculate")return ok({quote:await createOnboardingFeeQuote(user,body.input)});if(body.action==="review")return ok({quote:await reviewOnboardingFeeQuote(user,body)});throw new Error("Unsupported onboarding fee action.");}catch(error){return handleError(error)}}
