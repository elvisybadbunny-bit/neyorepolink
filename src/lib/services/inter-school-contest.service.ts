/**
 * EE.10 — Inter-School Contests (`EE.10`).
 * Built on the EE.8 self-marking question bank engine with real-time leaderboards.
 */

import { db } from "@/lib/db";
import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";
import type {
  CreateContestInput,
  RegisterForContestInput,
  SubmitContestAttemptInput,
  ListContestsQuery,
  ContestItem,
  ContestLeaderboardItem,
  ContestSchoolTeamRank,
} from "@/lib/validations/inter-school-contest";

export class InterSchoolContestError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "InterSchoolContestError";
  }
}

async function audit(user: SessionUser, action: string, entityId: string, metadata?: unknown) {
  try {
    await withTenant(user.tenantId, async () => {
      const tdb = tenantDb();
      await tdb.auditLog.create({
        data: {
          tenantId: user.tenantId,
          actorId: user.id,
          actorName: (user as any).fullName || "User",
          action,
          entityId,
          metadata: metadata ? JSON.stringify(metadata) : null,
        } as never,
      });
    });
  } catch (e) {
    console.error("Audit logging error:", e);
  }
}

/** Format seconds into readable time string e.g. "23m 40s" */
function formatSecs(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Create a new Inter-School Contest (`EE.10`). */
export async function createInterSchoolContest(user: SessionUser, input: CreateContestInput) {
  const totalMarks = input.questions.reduce((sum, q) => sum + (q.marks || 2), 0);

  const contest = await db.interSchoolContest.create({
    data: {
      hostTenantId: user.tenantId,
      createdById: user.id,
      createdByName: (user as any).fullName || "Contest Host",
      title: input.title,
      description: input.description || null,
      subjectId: input.subjectId || null,
      category: input.category,
      targetGradeBand: input.targetGradeBand,
      visibility: input.visibility,
      status: input.status,
      timeLimitMins: input.timeLimitMins,
      totalMarks,
    } as never,
  });

  for (let i = 0; i < input.questions.length; i++) {
    const q = input.questions[i];
    await db.contestQuestion.create({
      data: {
        contestId: contest.id,
        order: q.order || i + 1,
        questionBankId: q.questionBankId || null,
        prompt: q.prompt,
        questionType: q.questionType,
        optionsJson: JSON.stringify(q.options || []),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
        marks: q.marks || 2,
        diagramSvg: q.diagramSvg || null,
      } as never,
    });
  }

  // Auto-register the hosting school's team
  await db.contestRegistration.create({
    data: {
      contestId: contest.id,
      tenantId: user.tenantId,
      registeredById: user.id,
      registeredByName: (user as any).fullName || "Host School",
      schoolTeamName: `${user.tenantId} Host Team`,
    } as never,
  });

  await audit(user, "academics.inter_school_contest_created", contest.id, {
    title: contest.title,
    category: contest.category,
    questionCount: input.questions.length,
  });

  return contest;
}

/** List open/national and invited inter-school contests across NEYO (`EE.10`). */
export async function listInterSchoolContests(user: SessionUser, query: ListContestsQuery): Promise<ContestItem[]> {
  const AND: any[] = [
    {
      OR: [
        { visibility: "OPEN_NATIONAL" },
        { hostTenantId: user.tenantId },
        { registrations: { some: { tenantId: user.tenantId } } },
      ],
    },
  ];

  if (query.category) AND.push({ category: query.category });
  if (query.targetGradeBand) AND.push({ targetGradeBand: query.targetGradeBand });
  if (query.status) AND.push({ status: query.status });
  if (query.search) {
    AND.push({
      OR: [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ],
    });
  }

  // Browse national open OR hosted/registered by school
  const rows = await db.interSchoolContest.findMany({
    where: { AND },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      hostTenant: { select: { name: true } },
      subject: { select: { name: true } },
      registrations: { select: { tenantId: true, schoolTeamName: true } },
      _count: { select: { questions: true, registrations: true, attempts: true } },
    },
  });

  return rows.map((c) => {
    const myReg = c.registrations.find((r) => r.tenantId === user.tenantId);
    return {
      id: c.id,
      hostTenantId: c.hostTenantId,
      hostSchoolName: c.hostTenant.name,
      title: c.title,
      description: c.description,
      subjectId: c.subjectId,
      subjectName: c.subject?.name ?? null,
      category: c.category,
      targetGradeBand: c.targetGradeBand,
      visibility: c.visibility,
      status: c.status,
      timeLimitMins: c.timeLimitMins,
      totalMarks: c.totalMarks,
      questionCount: c._count.questions,
      registeredSchoolCount: c._count.registrations,
      attemptCount: c._count.attempts,
      isRegistered: Boolean(myReg),
      myTeamName: myReg?.schoolTeamName ?? null,
      createdAt: new Date(c.createdAt).toISOString(),
    };
  });
}

/** Register a school team (`ContestRegistration`) for an open inter-school contest (`EE.10`). */
export async function registerForContest(user: SessionUser, input: RegisterForContestInput) {
  const contest = await db.interSchoolContest.findUnique({ where: { id: input.contestId } });
  if (!contest) throw new InterSchoolContestError("NOT_FOUND", "Contest not found.");

  if (contest.visibility === "INVITE_ONLY" && contest.hostTenantId !== user.tenantId) {
    throw new InterSchoolContestError("FORBIDDEN", "This is an invite-only contest. Please contact the hosting school.");
  }

  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const existing = await tdb.contestRegistration.findUnique({
      where: { contestId_tenantId: { contestId: input.contestId, tenantId: user.tenantId } },
    });
    if (existing) {
      throw new InterSchoolContestError("INVALID", "Your school is already registered for this contest.");
    }

    const tenant = await tdb.tenant.findUnique({ where: { id: user.tenantId }, select: { name: true } });
    const schoolTeamName = input.schoolTeamName || `${tenant?.name || "School"} Team`;

    const reg = await tdb.contestRegistration.create({
      data: {
        contestId: input.contestId,
        tenantId: user.tenantId,
        registeredById: user.id,
        registeredByName: (user as any).fullName || "Teacher",
        schoolTeamName,
      } as never,
    });

    await audit(user, "academics.contest_school_registered", contest.id, {
      schoolTeamName,
    });

    return reg;
  });
}

/** Retrieve one contest complete with ordered questions (`EE.10`). */
export async function getContestWithQuestions(user: SessionUser, contestId: string) {
  const contest = await db.interSchoolContest.findUnique({
    where: { id: contestId },
    include: {
      hostTenant: { select: { name: true } },
      subject: { select: { name: true } },
      questions: { orderBy: { order: "asc" } },
      registrations: { where: { tenantId: user.tenantId }, select: { schoolTeamName: true } },
    },
  });
  if (!contest) throw new InterSchoolContestError("NOT_FOUND", "Contest not found.");

  return {
    ...contest,
    hostSchoolName: contest.hostTenant.name,
    subjectName: contest.subject?.name ?? null,
    isRegistered: contest.registrations.length > 0,
    myTeamName: contest.registrations[0]?.schoolTeamName ?? null,
    questions: contest.questions.map((q) => ({
      ...q,
      options: JSON.parse(q.optionsJson || "[]") as string[],
    })),
  };
}

/** Submit student answers for zero-cost self-marking against contest questions (`EE.10`). */
export async function submitContestAttempt(
  user: SessionUser,
  studentId: string,
  input: SubmitContestAttemptInput
) {
  const contest = await db.interSchoolContest.findUnique({
    where: { id: input.contestId },
    include: { questions: true },
  });
  if (!contest) throw new InterSchoolContestError("NOT_FOUND", "Contest not found.");

  // Verify school is registered
  const reg = await db.contestRegistration.findUnique({
    where: { contestId_tenantId: { contestId: input.contestId, tenantId: user.tenantId } },
  });
  if (!reg && contest.hostTenantId !== user.tenantId) {
    throw new InterSchoolContestError("FORBIDDEN", "Your school must register for this contest before students submit.");
  }

  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const student = await tdb.student.findUnique({
      where: { id: studentId },
      select: { id: true, admissionNo: true, firstName: true, middleName: true, lastName: true },
    });
    if (!student) throw new InterSchoolContestError("NOT_FOUND", "Student profile not found.");

    const studentName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");

    // Self-mark all submitted answers with 0 running cost
    let score = 0;
    const questionResults: { questionId: string; isCorrect: boolean; marksAwarded: number }[] = [];

    for (const q of contest.questions) {
      const selected = input.answers[q.id]?.trim() || "";
      const isCorrect = selected.toLowerCase() === q.correctAnswer.trim().toLowerCase();
      const marksAwarded = isCorrect ? q.marks : 0;
      score += marksAwarded;
      questionResults.push({ questionId: q.id, isCorrect, marksAwarded });
    }

    const scorePct = Math.round((score / Math.max(1, contest.totalMarks)) * 100);

    const existingAttempt = await tdb.contestAttempt.findUnique({
      where: { contestId_studentId: { contestId: contest.id, studentId: student.id } },
    });

    let attempt;
    if (existingAttempt) {
      attempt = await tdb.contestAttempt.update({
        where: { id: existingAttempt.id },
        data: {
          answersJson: JSON.stringify(input.answers),
          score,
          totalMarks: contest.totalMarks,
          scorePct,
          timeTakenSecs: input.timeTakenSecs,
          status: "SUBMITTED",
          submittedAt: new Date(),
        } as never,
      });
    } else {
      attempt = await tdb.contestAttempt.create({
        data: {
          tenantId: user.tenantId,
          contestId: contest.id,
          studentId: student.id,
          studentName,
          admissionNo: student.admissionNo,
          answersJson: JSON.stringify(input.answers),
          score,
          totalMarks: contest.totalMarks,
          scorePct,
          timeTakenSecs: input.timeTakenSecs,
          status: "SUBMITTED",
          submittedAt: new Date(),
        } as never,
      });
    }

    await audit(user, "academics.contest_attempt_submitted", attempt.id, {
      contestId: contest.id,
      studentId: student.id,
      score,
      scorePct,
      timeTakenSecs: input.timeTakenSecs,
    });

    return {
      attemptId: attempt.id,
      score,
      totalMarks: contest.totalMarks,
      scorePct,
      timeTakenSecs: input.timeTakenSecs,
      timeFormatted: formatSecs(input.timeTakenSecs),
      questionResults,
    };
  });
}

/**
 * Compile live national Individual Leaderboard & School Team Trophy Rankings (`EE.10`).
 * Ties in score are broken deterministically by faster completion speed (`timeTakenSecs ASC`).
 */
export async function getContestLeaderboard(user: SessionUser, contestId: string) {
  const contest = await db.interSchoolContest.findUnique({ where: { id: contestId } });
  if (!contest) throw new InterSchoolContestError("NOT_FOUND", "Contest not found.");

  const allAttempts = await db.contestAttempt.findMany({
    where: { contestId, status: "SUBMITTED" },
    orderBy: [
      { score: "desc" },
      { timeTakenSecs: "asc" }, // speed tie-breaker!
      { submittedAt: "asc" },
    ],
    take: 100,
    include: {
      tenant: { select: { name: true } },
    },
  });

  const registrations = await db.contestRegistration.findMany({
    where: { contestId },
  });
  const teamMap = new Map<string, string>(registrations.map((r) => [r.tenantId, r.schoolTeamName || r.tenantId]));

  const individual: ContestLeaderboardItem[] = allAttempts.map((a, idx) => {
    let medal: ContestLeaderboardItem["medal"] = null;
    if (idx === 0) medal = "GOLD";
    else if (idx === 1) medal = "SILVER";
    else if (idx === 2) medal = "BRONZE";

    return {
      rank: idx + 1,
      studentId: a.studentId,
      studentName: a.studentName,
      admissionNo: a.admissionNo,
      schoolName: a.tenant.name,
      schoolTeamName: teamMap.get(a.tenantId) ?? null,
      score: a.score,
      totalMarks: a.totalMarks,
      scorePct: a.scorePct,
      timeTakenSecs: a.timeTakenSecs,
      timeFormatted: formatSecs(a.timeTakenSecs),
      medal,
    };
  });

  // Calculate School Team Trophy rankings (aggregate top 3 students per school)
  const schoolScoresMap = new Map<string, { schoolName: string; teamName: string | null; topScores: number[] }>();
  for (const item of individual) {
    if (!schoolScoresMap.has(item.schoolName)) {
      schoolScoresMap.set(item.schoolName, {
        schoolName: item.schoolName,
        teamName: item.schoolTeamName ?? null,
        topScores: [],
      });
    }
    const grp = schoolScoresMap.get(item.schoolName)!;
    if (grp.topScores.length < 3) {
      grp.topScores.push(item.score);
    }
  }

  const schoolRanksRaw = Array.from(schoolScoresMap.values()).map((grp) => ({
    schoolName: grp.schoolName,
    schoolTeamName: grp.teamName,
    teamScore: grp.topScores.reduce((sum, s) => sum + s, 0),
    topStudentsCount: grp.topScores.length,
  }));

  schoolRanksRaw.sort((a, b) => b.teamScore - a.teamScore);

  const schoolRanks: ContestSchoolTeamRank[] = schoolRanksRaw.map((grp, idx) => {
    let trophy: ContestSchoolTeamRank["trophy"] = null;
    if (idx === 0) trophy = "GOLD_TROPHY";
    else if (idx === 1) trophy = "SILVER_TROPHY";
    else if (idx === 2) trophy = "BRONZE_TROPHY";

    return {
      rank: idx + 1,
      schoolName: grp.schoolName,
      schoolTeamName: grp.schoolTeamName,
      teamScore: grp.teamScore,
      topStudentsCount: grp.topStudentsCount,
      trophy,
    };
  });

  return {
    contestId: contest.id,
    title: contest.title,
    category: contest.category,
    status: contest.status,
    totalMarks: contest.totalMarks,
    individualLeaderboard: individual,
    schoolTeamRankings: schoolRanks,
    generatedAt: new Date().toISOString(),
  };
}
