/**
 * T.5a — Background Task Runner. Zod validation for the read-only API
 * surface (jobs are only ever created server-side by a real long-running
 * feature calling `runBackgroundJob()` directly — never via a raw client
 * POST, so there is no create/update input schema exposed over HTTP).
 */
import { z } from "zod";

export const getBackgroundJobSchema = z.object({
  jobId: z.string().min(1),
});
export type GetBackgroundJobInput = z.infer<typeof getBackgroundJobSchema>;
