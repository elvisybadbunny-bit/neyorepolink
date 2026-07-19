import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api/respond";

const nullableText = (max: number) => z.string().trim().max(max).optional().nullable();
const schema = z.object({
  id: z.string().optional(), schoolName: z.string().trim().min(2).max(160), county: nullableText(80), town: nullableText(80),
  locationNotes: nullableText(300), schoolType: nullableText(60), estimatedLearners: z.coerce.number().int().min(1).max(100000).optional().nullable(),
  contactName: nullableText(120), contactRole: nullableText(80), contactPhone: nullableText(30), contactEmail: z.string().trim().email().max(160).optional().nullable().or(z.literal("")),
  stage: z.enum(["PLANNED", "VISITED", "FOLLOW_UP", "DEMO_BOOKED", "PILOT_PROPOSED", "WON", "LOST", "NOT_NOW"]),
  visitAt: z.coerce.date().optional().nullable(), meetingAt: z.coerce.date().optional().nullable(), followUpAt: z.coerce.date().optional().nullable(),
  outcome: nullableText(1000), painPoints: nullableText(1500), interestedModules: nullableText(1000), objections: nullableText(1000),
  currentSystem: nullableText(300), budgetNotes: nullableText(500), decisionProcess: nullableText(800), nextAction: nullableText(500), remarks: nullableText(1500),
  travelCostKes: z.coerce.number().int().min(0).max(1000000).optional().nullable(), consentToContact: z.boolean().default(false),
});

export async function GET() {
  try {
    await requirePermission("platform.founder_ops");
    return ok({ visits: await db.schoolOutreachVisit.findMany({ orderBy: [{ followUpAt: "asc" }, { updatedAt: "desc" }] }) });
  } catch (error) { return handleError(error); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("platform.founder_ops");
    const body = await req.json();
    if (body.action === "delete") { await db.schoolOutreachVisit.delete({ where: { id: z.string().parse(body.id) } }); return ok({ deleted: true }); }
    const input = schema.parse(body.visit);
    const { id, contactEmail, ...rest } = input;
    const data = { ...rest, contactEmail: contactEmail || null };
    const visit = id
      ? await db.schoolOutreachVisit.update({ where: { id }, data })
      : await db.schoolOutreachVisit.create({ data: { ...data, createdById: user.id, createdByName: user.fullName } });
    return ok({ visit });
  } catch (error) { return handleError(error); }
}
