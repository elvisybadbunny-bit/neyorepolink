import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api/respond";

const defaults = [{ grade: "A", min: 80 }, { grade: "A-", min: 75 }, { grade: "B+", min: 70 }, { grade: "B", min: 65 }, { grade: "B-", min: 60 }, { grade: "C+", min: 55 }, { grade: "C", min: 50 }, { grade: "C-", min: 45 }, { grade: "D+", min: 40 }, { grade: "D", min: 35 }, { grade: "D-", min: 30 }, { grade: "E", min: 0 }];
const schema = z.object({ boundaries: z.array(z.object({ grade: z.string().trim().min(1).max(10), min: z.number().min(0).max(100) })).min(2).max(20) });

export async function GET() {
  try {
    const user = await requirePermission("academics.view");
    const row = await db.gradingScale.findUnique({ where: { tenantId: user.tenantId } });
    return ok({ boundaries: row ? JSON.parse(row.boundariesJson) : defaults });
  } catch (error) { return handleError(error); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    const input = schema.parse(await req.json());
    const sorted = [...input.boundaries].sort((a, b) => b.min - a.min);
    if (new Set(sorted.map((item) => item.grade.toUpperCase())).size !== sorted.length || new Set(sorted.map((item) => item.min)).size !== sorted.length) throw new Error("Grades and minimum marks must be unique.");
    await db.gradingScale.upsert({ where: { tenantId: user.tenantId }, create: { tenantId: user.tenantId, boundariesJson: JSON.stringify(sorted) }, update: { boundariesJson: JSON.stringify(sorted) } });
    return ok({ boundaries: sorted });
  } catch (error) { return handleError(error); }
}
