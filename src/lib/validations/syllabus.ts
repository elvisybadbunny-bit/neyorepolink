import { z } from "zod";

const dateYmd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const SYLLABUS_STATUSES = ["PLANNED", "IN_PROGRESS", "COVERED", "LATE"] as const;

export const syllabusCreateSchema = z.object({
  action: z.literal("create"),
  classId: z.string().min(1, "Pick a class."),
  subjectId: z.string().min(1, "Pick a subject."),
  termId: z.string().optional().or(z.literal("")),
  topic: z.string().trim().min(3, "Topic is required.").max(160),
  scopeRef: z.string().trim().max(120).optional().or(z.literal("")),
  deadline: dateYmd,
  teacherId: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const syllabusUpdateSchema = z.object({
  action: z.literal("update"),
  id: z.string().min(1),
  status: z.enum(SYLLABUS_STATUSES),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const syllabusDeleteSchema = z.object({
  action: z.literal("delete"),
  id: z.string().min(1),
});

export const syllabusSyncSchema = z.object({
  action: z.literal("sync"),
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  strandId: z.string().optional().or(z.literal("")),
  substrandId: z.string().optional().or(z.literal("")),
  topicName: z.string().optional().or(z.literal("")),
  lessonPlanId: z.string().optional().or(z.literal("")),
});

export const syllabusActionSchema = z.discriminatedUnion("action", [
  syllabusCreateSchema,
  syllabusUpdateSchema,
  syllabusDeleteSchema,
  syllabusSyncSchema,
]);

export type SyllabusCreateInput = z.infer<typeof syllabusCreateSchema>;
export type SyllabusUpdateInput = z.infer<typeof syllabusUpdateSchema>;
