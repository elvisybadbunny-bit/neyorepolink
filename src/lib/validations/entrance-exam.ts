import { z } from "zod";

export const entranceExamPaperSchema = z.object({
  classId: z.string().min(1, "Choose the exact class/stream."),
  title: z.string().trim().min(3, "Paper title is required.").max(120).default("Entrance interview paper"),
  fileUrl: z.string().min(1, "File URL required."),
  fileName: z.string().trim().min(2, "Filename required.").max(180),
  hardcopyLocation: z.string().trim().min(3, "Hard-copy file location is required.").max(160),
});

export type EntranceExamPaperInput = z.infer<typeof entranceExamPaperSchema>;
