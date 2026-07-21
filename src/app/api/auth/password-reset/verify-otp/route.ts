import crypto from "crypto";
import { NextRequest } from "next/server";
import { hash as argonHash } from "@node-rs/argon2";
import { ok, handleError } from "@/lib/api/respond";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_TTL_DAYS } from "@/lib/core/session";
import { createSessionToken } from "@/lib/services/auth.service";
import { enforceRate, clientIp } from "@/lib/security/rate-limit";
export const dynamic="force-dynamic";
const digest=(value:string)=>crypto.createHmac("sha256",process.env.NEYO_MASTER_KEK||"neyo-dev-recovery-key").update(value).digest("hex");
export async function POST(req:NextRequest){try{enforceRate(`pwd-reset-verify:${clientIp(req)}`,8,900);const body=await req.json().catch(()=>({}));const{phoneOrEmail,otpCode,newPassword}=body;if(!phoneOrEmail||!otpCode||!newPassword)throw new Error("Please provide your account identifier, OTP code, and new password.");if(String(newPassword).length<8)throw new Error("New password must be at least 8 characters long.");const query=String(phoneOrEmail).trim();const user=await db.user.findFirst({where:{isActive:true,OR:[{phone:query},{email:query},{customNeyoEmail:query},{neyoLoginId:query.toUpperCase()}]}});if(!user?.recoveryOtpCode||!user.recoveryOtpExpiresAt||user.recoveryOtpExpiresAt<new Date()||user.recoveryOtpCode!==digest(String(otpCode).trim()))throw new Error("Invalid or expired recovery code. Request a new code.");const passwordHash=await argonHash(String(newPassword));await db.$transaction([db.session.deleteMany({where:{userId:user.id}}),db.user.update({where:{id:user.id},data:{passwordHash,recoveryOtpCode:null,recoveryOtpExpiresAt:null,hasSetInitialPassword:true}})]);const token=await createSessionToken(user.id,{userAgent:req.headers.get("user-agent")??undefined,ipAddress:req.headers.get("x-forwarded-for")?.split(",")[0].trim()??undefined});const res=ok({user:{id:user.id,fullName:user.fullName,role:user.role},message:"Password reset and other sessions revoked."});res.cookies.set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:SESSION_TTL_DAYS*24*60*60});return res;}catch(error){return handleError(error);}}
