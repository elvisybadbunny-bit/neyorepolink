/**
 * EE.10 — Inter-School Contests (`EE.10`).
 * Validation schemas and TypeScript definitions.
 */

import { z } from "zod";

export const createContestSchema = z.object({
  title: z.string().min(1),
  description: z.string().trim().max(1000).optional().nullable(),
  subjectId: z.string().optional().nullable(),
  category: z.enum(["MATHEMATICS", "SCIENCE", "CODING_ICT", "DEBATE", "GENERAL"]).default("MATHEMATICS"),
  targetGradeBand: z.string().min(1).default("Grade 7–9 (Junior School)"),
  visibility: z.enum(["OPEN_NATIONAL", "INVITE_ONLY"]).default("OPEN_NATIONAL"),
  status: z.enum(["DRAFT", "UPCOMING", "ACTIVE", "ENDED", "ARCHIVED"]).default("UPCOMING"),
  timeLimitMins: z.number().int().min(5).max(300).default(45),
  questions: z.array(
    z.object({
      order: z.number().int().min(1),
      questionBankId: z.string().optional().nullable(),
      prompt: z.string().min(1),
      questionType: z.enum(["MULTIPLE_CHOICE", "SHORT_ANSWER", "TRUE_FALSE"]).default("MULTIPLE_CHOICE"),
      options: z.array(z.string()).default([]),
      correctAnswer: z.string().min(1),
      explanation: z.string().trim().max(1000).optional().nullable(),
      marks: z.number().int().min(1).default(2),
      diagramSvg: z.string().optional().nullable(),
    })
  ).min(1),
});
export type CreateContestInput = z.infer<typeof createContestSchema>;

export const registerForContestSchema = z.object({
  contestId: z.string().min(1),
  schoolTeamName: z.string().trim().max(100).optional().nullable(),
});
export type RegisterForContestInput = z.infer<typeof registerForContestSchema>;

export const submitContestAttemptSchema = z.object({
  contestId: z.string().min(1),
  answers: z.record(z.string()), // map of questionId -> selectedAnswer
  timeTakenSecs: z.number().int().min(1).default(120),
});
export type SubmitContestAttemptInput = z.infer<typeof submitContestAttemptSchema>;

export const listContestsQuerySchema = z.object({
  category: z.string().optional(),
  targetGradeBand: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});
export type ListContestsQuery = z.infer<typeof listContestsQuerySchema>;

export interface ContestItem {
  id: string;
  hostTenantId: string;
  hostSchoolName: string;
  title: string;
  description: string | null;
  subjectId: string | null;
  subjectName?: string | null;
  category: string;
  targetGradeBand: string;
  visibility: string;
  status: string;
  timeLimitMins: number;
  totalMarks: number;
  questionCount: number;
  registeredSchoolCount: number;
  attemptCount: number;
  isRegistered: boolean;
  myTeamName?: string | null;
  createdAt: string;
}

export interface ContestLeaderboardItem {
  rank: number;
  studentId: string;
  studentName: string;
  admissionNo: string;
  schoolName: string;
  schoolTeamName?: string | null;
  score: number;
  totalMarks: number;
  scorePct: number;
  timeTakenSecs: number;
  timeFormatted: string; // e.g. "23m 40s"
  medal: "GOLD" | "SILVER" | "BRONZE" | null;
}

export interface ContestSchoolTeamRank {
  rank: number;
  schoolName: string;
  schoolTeamName?: string | null;
  teamScore: number; // sum of top 3 students
  topStudentsCount: number;
  trophy: "GOLD_TROPHY" | "SILVER_TROPHY" | "BRONZE_TROPHY" | null;
}
