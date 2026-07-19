import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api/respond";

const schema = z.object({
  names: z.array(z.string().trim().min(2).max(60)).min(1).max(100),
  curriculum: z.enum(["CBC", "8-4-4", "BOTH"]).default("CBC"),
});

function baseCode(name: string) {
  const words = name.toUpperCase().replace(/[^A-Z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const acronym = words.map((word) => word[0]).join("").slice(0, 4) || "SUB";
  const hash = createHash("sha1").update(name.toLowerCase()).digest("hex").slice(0, 4).toUpperCase();
  return `${acronym}${hash}`.slice(0, 8);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    const input = schema.parse(await req.json());
    const names = Array.from(new Set(input.names.map((name) => name.trim()).filter(Boolean)));
    const existing = await db.subject.findMany({ where: { tenantId: user.tenantId }, select: { name: true, code: true } });
    const existingNames = new Set(existing.map((subject) => subject.name.trim().toLowerCase()));
    const usedCodes = new Set(existing.map((subject) => subject.code.toUpperCase()));
    const created: Array<{ id: string; name: string; code: string; curriculum: string }> = [];
    const skipped: string[] = [];

    for (const name of names) {
      if (existingNames.has(name.toLowerCase())) { skipped.push(name); continue; }
      let code = baseCode(name);
      let suffix = 2;
      while (usedCodes.has(code)) {
        const ending = String(suffix++);
        code = `${baseCode(name).slice(0, 8 - ending.length)}${ending}`;
      }
      const subject = await db.subject.create({ data: { tenantId: user.tenantId, name, code, curriculum: input.curriculum } });
      usedCodes.add(code);
      existingNames.add(name.toLowerCase());
      created.push({ id: subject.id, name: subject.name, code: subject.code, curriculum: subject.curriculum });
    }

    await db.auditLog.create({ data: {
      tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
      action: "academics.subjects_bulk_created_from_import", entityType: "Subject", entityId: created[0]?.id ?? "none",
      metadata: JSON.stringify({ requested: names.length, created: created.map((subject) => ({ id: subject.id, name: subject.name, code: subject.code })), skipped }),
    } });
    return ok({ created, skipped });
  } catch (error) { return handleError(error); }
}
