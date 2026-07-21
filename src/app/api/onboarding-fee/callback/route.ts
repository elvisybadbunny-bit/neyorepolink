import { NextRequest, NextResponse } from "next/server";
import { handleError, ok } from "@/lib/api/respond";
import { verifyWebhookToken } from "@/lib/payments/daraja-provider";
import { handleOnboardingPaymentCallback } from "@/lib/services/onboarding-fee.service";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest){try{if(!verifyWebhookToken(req.nextUrl.searchParams.get("t")))return NextResponse.json({ResultCode:1,ResultDesc:"Unauthorized"},{status:401});return ok(await handleOnboardingPaymentCallback(await req.json().catch(()=>({}))));}catch(error){return handleError(error)}}
