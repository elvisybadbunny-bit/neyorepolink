/**
 * AA.2 — Teacher Allocation Import API.
 * GET  -> real import history (last 20 runs).
 * POST -> multipart file, pasted table, pasted text, or direct JSON rows —
 *         same 3 input shapes as every other NEYO bulk importer.
 *         action="preview" returns the real match preview (never writes);
 *         action="commit" (default) actually creates/updates real rows.
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  TeacherAllocationImportError,
  teacherAllocationRowsFromFile,
  teacherAllocationRowsFromText,
  teacherAllocationRowsFromTable,
  previewTeacherAllocationImport,
  commitTeacherAllocationImport,
  listTeacherAllocationImports,
} from "@/lib/services/teacher-allocation-import.service";
import { teacherAllocationImportRowSchema } from "@/lib/validations/teacher-allocation-import";

export const dynamic = "force-dynamic";

const rowSchema = teacherAllocationImportRowSchema.partial({ lessonsPerWeek: true, doubleCount: true });

const importSchema = z.object({
  action: z.enum(["preview", "commit"]).default("commit"),
  rows: z.array(rowSchema).optional(),
  table: z.array(z.array(z.string())).optional(),
  text: z.string().optional(),
  hasHeader: z.boolean().default(true),
  fileName: z.string().optional(),
  source: z.enum(["csv", "xlsx", "paste", "bundi"]).default("paste"),
  createMissingTeachers: z.boolean().default(false),
  skipInvalid: z.boolean().default(true),
}).refine((v) => v.rows || v.table || v.text, { message: "Provide teacher allocation rows, table rows, or pasted text." });

function mapErr(e: unknown) {
  if (e instanceof TeacherAllocationImportError) {
    const m = { NOT_FOUND: 404, INVALID: 400, EMPTY: 400, BAD_FILE: 400 } as const;
    return fail(e.code, e.message, m[e.code]);
  }
  return null;
}

export async function GET() {
  try {
    const user = await requirePermission("academics.view");
    const imports = await listTeacherAllocationImports(user);
    return ok({ imports });
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const hasHeader = form.get("hasHeader") !== "false";
      const action = form.get("action") === "preview" ? "preview" : "commit";
      const createMissingTeachers = form.get("createMissingTeachers") === "true";
      if (!(file instanceof File)) throw new TeacherAllocationImportError("BAD_FILE");
      const bytes = Buffer.from(await file.arrayBuffer());
      const rows = await teacherAllocationRowsFromFile(file.name, bytes, hasHeader);
      if (action === "preview") return ok({ preview: await previewTeacherAllocationImport(user, rows) });
      return ok(await commitTeacherAllocationImport(user, { rows, fileName: file.name, source: "xlsx", createMissingTeachers, skipInvalid: true }));
    }

    const body = importSchema.parse(await req.json());
    const rows = body.rows
      ? body.rows.map((r) => teacherAllocationImportRowSchema.parse(r))
      : body.table
      ? teacherAllocationRowsFromTable(body.table, body.hasHeader)
      : teacherAllocationRowsFromText(body.text || "", body.hasHeader);

    if (body.action === "preview") return ok({ preview: await previewTeacherAllocationImport(user, rows) });
    return ok(await commitTeacherAllocationImport(user, {
      rows, fileName: body.fileName, source: body.source,
      createMissingTeachers: body.createMissingTeachers, skipInvalid: body.skipInvalid,
    }));
  } catch (err) {
    return mapErr(err) ?? handleError(err);
  }
}
