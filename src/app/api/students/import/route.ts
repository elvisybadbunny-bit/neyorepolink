/**
 * B.1 Bulk import — commit + history (Chunk 4).
 * GET  -> recent import history.
 * POST -> commit a previewed import (creates the students). Real, opt-in
 *         T.5a background mode: pass `runInBackground: true` to return
 *         immediately with a real tracked job id instead of blocking the
 *         HTTP response until every row is processed — a genuinely large
 *         import (hundreds of rows) no longer holds a spinner hostage; the
 *         school gets a real notification the moment it's actually done,
 *         wherever they've navigated to since.
 * Permission: student.create.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { importCommitSchema } from "@/lib/validations/student-import";
import { commitImport, listImports } from "@/lib/services/student-import.service";
import { createInApp } from "@/lib/services/notification.service";
import { runBackgroundJob } from "@/lib/services/background-job.service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    const user = await requirePermission("student.create");
    return ok({ imports: await listImports(user) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("student.create");
    const body = importCommitSchema.parse(await req.json());

    // In-process fire-and-forget work is unsafe on Vercel: the invocation may
    // freeze immediately after returning, leaving the job at 5% forever.
    // Keep Vercel imports attached to the request until a durable Redis worker
    // owns serialised import payloads.
    if (body.runInBackground && process.env.VERCEL !== "1") {
      const job = await runBackgroundJob(
        user,
        { kind: "STUDENT_IMPORT", label: `Importing ${body.rows.length} row${body.rows.length === 1 ? "" : "s"} from ${body.fileName || "a pasted list"}` },
        async () => commitImport(user, body),
        (result) => `${result.created} learner${result.created === 1 ? "" : "s"} created${result.updated ? ` · ${result.updated} updated` : ""} · ${result.failed.length} row${result.failed.length === 1 ? "" : "s"} need review.`
      );
      return ok({ backgroundJobId: job.id, runningInBackground: true });
    }

    await createInApp({
      tenantId: user.tenantId,
      recipientId: user.id,
      title: "Student import running",
      body: `Importing ${body.rows.length} row${body.rows.length === 1 ? "" : "s"}. You can keep working while NEYO checks the file.`,
      category: "system",
      href: "/students/import",
    });
    const result = await commitImport(user, body);
    await createInApp({
      tenantId: user.tenantId,
      recipientId: user.id,
      title: "Student import complete",
      body: `${result.created} learner${result.created === 1 ? "" : "s"} created${result.updated ? ` · ${result.updated} updated` : ""} · ${result.failed.length} row${result.failed.length === 1 ? "" : "s"} need review.`,
      category: "system",
      href: "/students/import",
    });
    return ok(result);

  } catch (e) {
    return handleError(e);
  }
}
