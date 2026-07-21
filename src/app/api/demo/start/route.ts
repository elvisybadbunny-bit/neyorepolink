/** Public demo request intake. A request never creates or logs into a school until NEYO Ops approves it. */
import { NextRequest } from "next/server";
import { z } from "zod";
import { enforceRate, clientIp } from "@/lib/security/rate-limit";
import { ok, handleError } from "@/lib/api/respond";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
const schema=z.object({phone:z.string().trim().regex(/^(?:\+254|0)[17]\d{8}$/,"Use a valid Kenyan phone number."),email:z.string().trim().email().max(200),name:z.string().trim().min(2).max(120),schoolName:z.string().trim().max(160).optional()});
const normalize=(phone:string)=>phone.startsWith("0")?`+254${phone.slice(1)}`:phone;
export async function POST(req:NextRequest){try{enforceRate(`demo-request:${clientIp(req)}`,3,3600);const raw=await req.json();if(typeof raw.phone==="string")raw.phone=raw.phone.replace(/\s+/g,"");const input=schema.parse(raw);const request=await db.demoRequest.upsert({where:{email:input.email.toLowerCase()},create:{phone:normalize(input.phone),email:input.email.toLowerCase(),fullName:input.name,schoolName:input.schoolName||null,status:"PENDING"},update:{phone:normalize(input.phone),fullName:input.name,schoolName:input.schoolName||null,status:"PENDING",requestedAt:new Date(),approvedAt:null,approvedBy:null,spawnedTenantId:null,spawnedTenantSlug:null,notes:null}});return ok({requestId:request.id,status:"PENDING",message:"Your request is awaiting NEYO Ops review."},202);}catch(error){return handleError(error);}}
