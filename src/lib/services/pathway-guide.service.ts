/**
 * Y.1 — NEYO Pathway Guide (Career & Subject Selection Guidance).
 *
 * A rule-based (no AI/Bundi dependency, matching J.18's own rule) engine that:
 *  1. Runs a real 4-pillar questionnaire (interests/skills/values/aspirations)
 *     and recommends a CBE Senior School pathway group + track + subject list,
 *     reusing the existing real KICD_SENIOR_SCHOOL_PATHWAYS taxonomy (P.1).
 *  2. Matches interests to career areas using the SAME taxonomy as the
 *     existing J.18 CareerDiscovery module (career areas stay ONE shared list
 *     across the whole product, never a duplicate parallel list).
 *  3. Matches the learner's RECOMMENDED SUBJECT COMBINATION against the
 *     seeded real KUCCPS cluster/course reference data to show which real
 *     degree courses that combination genuinely relates to.
 *
 * Founder correction 2026-07-09: this is CBE — learners are graded BE/AE/ME/EE
 * on the 4-point CBC rubric, not KCSE A-E letters, and a real Grade 9/Senior
 * School learner has no KCSE-style grade to enter at all. There is
 * deliberately NO grade-entry step anywhere in this service — course
 * matching is purely SUBJECT-COMBINATION based (does the learner's
 * recommended elective set contain a subject that could satisfy each of a
 * cluster's real subject-requirement slots). Per-course minimum-grade data
 * is shown only as informational "grades to aim for" copy on a course card.
 *
 * Works for BOTH:
 *  - A logged-in NEYO school student/parent (tenantId + studentId set,
 *    always fully unlocked/free — the founder's own rule: "if... they use
 *    neyo already... it should ... be free").
 *  - A genuine public outsider with no NEYO account at all (isPublic: true,
 *    tenantId/studentId null) — free interest-only result + a "glimpse" of
 *    a couple of possible KUCCPS clusters; the FULL matched-course list
 *    requires a small one-time M-Pesa STK unlock (PathwayGuidePayment),
 *    amount editable live from NEYO Ops.
 *
 * Two independent Founder-Ops switches gate visibility — reuses the existing
 * simple PlatformSetting on/off pattern (same family as
 * `platform-appearance.service.ts`'s `neyo_liquid_system_active`), NOT a new
 * ad-hoc table:
 *   - "pathway_guide_in_app_enabled"  -> gates the in-app student/parent view
 *   - "pathway_guide_public_enabled"  -> gates the public, no-login page
 * Both default ON (a missing row means "on"), per the founder's own
 * instruction ("it should be on but in neyo ops i can switch it off").
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import { normalizeKePhone } from "@/lib/validations/auth";
import { KICD_SENIOR_SCHOOL_PATHWAYS, type PathwayGroup } from "@/lib/validations/pathways";
import { CAREER_AREAS } from "@/lib/validations/career-discovery";
import {
  KUCCPS_CLUSTERS,
  PATHWAY_GUIDE_QUESTIONS,
  type GuideQuestion,
} from "@/lib/validations/pathway-guide";
import { MockProvider } from "@/lib/payments/mock-provider";
import { DarajaProvider } from "@/lib/payments/daraja-provider";
import type { PaymentProvider, ProviderCredentials } from "@/lib/payments/provider";
import { readCompanySecret } from "@/lib/services/company-secret.service";
import { appBaseUrl } from "@/lib/notifications/email";
import { verifyWebhookToken } from "@/lib/payments/daraja-provider";

export class PathwayGuideError extends Error {
  constructor(public code: "NOT_FOUND" | "FORBIDDEN" | "INVALID" | "PAYMENT_REQUIRED", message: string) {
    super(message);
    this.name = "PathwayGuideError";
  }
}

const IN_APP_FLAG_KEY = "pathway_guide_in_app_enabled";
const PUBLIC_FLAG_KEY = "pathway_guide_public_enabled";
const FEE_KEY = "pathway_guide_public_fee_kes";
const DEFAULT_FEE_KES = 10;

export async function isPathwayGuideInAppEnabled(): Promise<boolean> {
  const row = await db.platformSetting.findUnique({ where: { key: IN_APP_FLAG_KEY } });
  return row ? row.value !== "false" : true;
}

export async function isPathwayGuidePublicEnabled(): Promise<boolean> {
  const row = await db.platformSetting.findUnique({ where: { key: PUBLIC_FLAG_KEY } });
  return row ? row.value !== "false" : true;
}

export async function getPathwayGuideFeeKes(): Promise<number> {
  const row = await db.platformSetting.findUnique({ where: { key: FEE_KEY } });
  const n = row ? Number(row.value) : DEFAULT_FEE_KES;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : DEFAULT_FEE_KES;
}

export async function getPathwayGuideOpsSettings() {
  const [inAppEnabled, publicEnabled, feeKes] = await Promise.all([
    isPathwayGuideInAppEnabled(),
    isPathwayGuidePublicEnabled(),
    getPathwayGuideFeeKes(),
  ]);
  return { inAppEnabled, publicEnabled, feeKes };
}

export async function setPathwayGuideInAppEnabled(user: SessionUser, enabled: boolean) {
  await db.platformSetting.upsert({
    where: { key: IN_APP_FLAG_KEY },
    create: { key: IN_APP_FLAG_KEY, value: String(enabled), updatedBy: user.fullName },
    update: { value: String(enabled), updatedBy: user.fullName },
  });
  await db.auditLog.create({
    data: { tenantId: user.tenantId, actorId: user.id, actorName: user.fullName, action: enabled ? "pathway_guide.in_app_enabled" : "pathway_guide.in_app_disabled", entityType: "PlatformSetting", entityId: IN_APP_FLAG_KEY },
  });
  return getPathwayGuideOpsSettings();
}

export async function setPathwayGuidePublicEnabled(user: SessionUser, enabled: boolean) {
  await db.platformSetting.upsert({
    where: { key: PUBLIC_FLAG_KEY },
    create: { key: PUBLIC_FLAG_KEY, value: String(enabled), updatedBy: user.fullName },
    update: { value: String(enabled), updatedBy: user.fullName },
  });
  await db.auditLog.create({
    data: { tenantId: user.tenantId, actorId: user.id, actorName: user.fullName, action: enabled ? "pathway_guide.public_enabled" : "pathway_guide.public_disabled", entityType: "PlatformSetting", entityId: PUBLIC_FLAG_KEY },
  });
  return getPathwayGuideOpsSettings();
}

export async function setPathwayGuideFeeKes(user: SessionUser, amountKes: number) {
  if (!Number.isFinite(amountKes) || amountKes < 1 || amountKes > 1000) {
    throw new PathwayGuideError("INVALID", "Fee must be a whole number of KES between 1 and 1000.");
  }
  const rounded = Math.round(amountKes);
  await db.platformSetting.upsert({
    where: { key: FEE_KEY },
    create: { key: FEE_KEY, value: String(rounded), updatedBy: user.fullName },
    update: { value: String(rounded), updatedBy: user.fullName },
  });
  await db.auditLog.create({
    data: { tenantId: user.tenantId, actorId: user.id, actorName: user.fullName, action: "pathway_guide.fee_updated", entityType: "PlatformSetting", entityId: FEE_KEY, metadata: JSON.stringify({ amountKes: rounded }) },
  });
  return getPathwayGuideOpsSettings();
}

export function getGuideQuestions(): GuideQuestion[] {
  return PATHWAY_GUIDE_QUESTIONS;
}

function optionForAnswer(questionId: string, optionId: string) {
  const q = PATHWAY_GUIDE_QUESTIONS.find((x) => x.id === questionId);
  if (!q) return null;
  const opt = q.options.find((o) => o.id === optionId);
  if (!opt) return null;
  return { question: q, option: opt };
}

function scoreAnswers(answers: { questionId: string; optionId: string }[]) {
  const groupTally: Record<PathwayGroup, number> = { STEM: 0, SOCIAL_SCIENCES: 0, ARTS_SPORTS: 0 };
  const careerTally = new Map<string, number>();

  for (const ans of answers) {
    const match = optionForAnswer(ans.questionId, ans.optionId);
    if (!match) continue;
    for (const g of match.option.signalsGroups) groupTally[g] += 1;
    for (const c of match.option.signalsCareerAreas) careerTally.set(c, (careerTally.get(c) || 0) + 1);
  }

  const topGroup = (Object.entries(groupTally) as [PathwayGroup, number][]).sort((a, b) => b[1] - a[1])[0];
  const rankedCareers = [...careerTally.entries()].sort((a, b) => b[1] - a[1]).map(([area]) => area);

  return { groupTally, topGroup: topGroup?.[0] ?? "STEM", rankedCareers };
}

function pickTrackForGroup(group: PathwayGroup) {
  const official = KICD_SENIOR_SCHOOL_PATHWAYS.find((p) => p.group === group);
  if (!official || official.tracks.length === 0) return { trackName: null as string | null, subjects: [] as { name: string; code: string }[] };
  const track = official.tracks[0];
  return { trackName: track.trackName, subjects: track.electives };
}

export async function startGuideSession(input: { tenantId?: string | null; studentId?: string | null; isPublic: boolean; fullName?: string | null; phone?: string | null }) {
  const phone = input.phone ? normalizeKePhone(input.phone) : null;
  if (input.phone && !phone) throw new PathwayGuideError("INVALID", "Enter a valid Kenyan phone number, e.g. 0712 345 678.");
  const session = await db.pathwayGuideSession.create({
    data: {
      tenantId: input.tenantId || null,
      studentId: input.studentId || null,
      isPublic: input.isPublic,
      fullName: input.fullName || null,
      phone,
      unlocked: !input.isPublic,
      unlockedAt: !input.isPublic ? new Date() : null,
    },
  });
  return session;
}

async function getSessionOrThrow(sessionId: string) {
  const session = await db.pathwayGuideSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new PathwayGuideError("NOT_FOUND", "That guidance session was not found.");
  return session;
}

export async function submitGuideAnswers(input: { sessionId: string; answers: { questionId: string; optionId: string }[] }) {
  const session = await getSessionOrThrow(input.sessionId);
  const { topGroup, rankedCareers } = scoreAnswers(input.answers);
  const { trackName, subjects } = pickTrackForGroup(topGroup as PathwayGroup);

  const interests = input.answers.filter((a) => a.questionId.startsWith("int_"));
  const skills = input.answers.filter((a) => a.questionId.startsWith("skl_"));
  const values = input.answers.filter((a) => a.questionId.startsWith("val_"));
  const aspirations = input.answers.filter((a) => a.questionId.startsWith("asp_"));

  const updated = await db.pathwayGuideSession.update({
    where: { id: session.id },
    data: {
      interestsJson: JSON.stringify(interests),
      skillsJson: JSON.stringify(skills),
      valuesJson: JSON.stringify(values),
      aspirationsJson: JSON.stringify(aspirations),
      recommendedGroup: topGroup,
      recommendedTrack: trackName,
      recommendedSubjectsJson: JSON.stringify(subjects),
      careerAreasJson: JSON.stringify(rankedCareers.slice(0, 3)),
    },
  });
  return updated;
}

export interface MatchedCourseResult {
  clusterNumber: number;
  clusterName: string;
  courseName: string;
  matchedSlots: number;
  totalSlots: number;
  fullyMatches: boolean;
  minMeanGradeToAimFor: string;
  typicalCutoff: number | null;
}

function matchClusterToSubjects(subjectCodes: string[], rules: { slot: number; anyOf: string[] }[]) {
  let matchedSlots = 0;
  for (const rule of rules) {
    if (rule.anyOf.some((code) => subjectCodes.includes(code))) matchedSlots += 1;
  }
  return { matchedSlots, totalSlots: rules.length, fullyMatches: matchedSlots === rules.length };
}

export async function matchKuccpsCoursesForSubjects(subjectCodes: string[]): Promise<MatchedCourseResult[]> {
  const fullCodes = Array.from(new Set([...subjectCodes, "ENG", "KIS", "MAT"]));
  const clusters = await db.kuccpsCluster.findMany({ where: { archived: false }, include: { courses: { where: { archived: false } } }, orderBy: { number: "asc" } });
  const results: MatchedCourseResult[] = [];
  for (const cluster of clusters) {
    const rules: { slot: number; anyOf: string[] }[] = JSON.parse(cluster.subjectRulesJson);
    const { matchedSlots, totalSlots, fullyMatches } = matchClusterToSubjects(fullCodes, rules);
    if (matchedSlots === 0) continue;
    for (const course of cluster.courses) {
      results.push({
        clusterNumber: cluster.number,
        clusterName: cluster.name,
        courseName: course.name,
        matchedSlots,
        totalSlots,
        fullyMatches,
        minMeanGradeToAimFor: course.minMeanGrade,
        typicalCutoff: course.typicalCutoff,
      });
    }
  }
  return results.sort((a, b) => {
    if (a.fullyMatches !== b.fullyMatches) return a.fullyMatches ? -1 : 1;
    return b.matchedSlots - a.matchedSlots;
  });
}

export async function getKuccpsGlimpse(sessionId: string) {
  const session = await getSessionOrThrow(sessionId);
  const subjects: { name: string; code: string }[] = session.recommendedSubjectsJson ? JSON.parse(session.recommendedSubjectsJson) : [];
  if (subjects.length === 0) return [];
  const subjectCodes = subjects.map((s) => s.code);
  const fullCodes = Array.from(new Set([...subjectCodes, "ENG", "KIS", "MAT"]));
  const clusters = await db.kuccpsCluster.findMany({ where: { archived: false }, orderBy: { number: "asc" } });
  const matched = clusters
    .map((c) => {
      const rules: { slot: number; anyOf: string[] }[] = JSON.parse(c.subjectRulesJson);
      const { matchedSlots } = matchClusterToSubjects(fullCodes, rules);
      return { number: c.number, name: c.name, description: c.description, matchedSlots };
    })
    .filter((c) => c.matchedSlots > 0)
    .sort((a, b) => b.matchedSlots - a.matchedSlots)
    .slice(0, 3);
  return matched;
}

export async function getFullMatchedCourses(sessionId: string): Promise<MatchedCourseResult[]> {
  const session = await getSessionOrThrow(sessionId);
  if (session.isPublic && !session.unlocked) {
    throw new PathwayGuideError("PAYMENT_REQUIRED", "Unlock your full course match report first with the small one-time fee.");
  }
  const subjects: { name: string; code: string }[] = session.recommendedSubjectsJson ? JSON.parse(session.recommendedSubjectsJson) : [];
  return matchKuccpsCoursesForSubjects(subjects.map((s) => s.code));
}

export async function getGuideSessionFull(sessionId: string) {
  const session = await getSessionOrThrow(sessionId);
  let matchedCourses: MatchedCourseResult[] = [];
  if (session.recommendedSubjectsJson && session.unlocked) {
    const subjects: { name: string; code: string }[] = JSON.parse(session.recommendedSubjectsJson);
    matchedCourses = await matchKuccpsCoursesForSubjects(subjects.map((s) => s.code));
  }
  return { session, matchedCourses };
}

const mock = new MockProvider();
const daraja = new DarajaProvider();

async function secretOrEnv(key: string, envName: string) {
  return (await readCompanySecret(key)) || process.env[envName] || "";
}

async function centralCreds(): Promise<ProviderCredentials | null> {
  const shortcode = await secretOrEnv("central_daraja_shortcode", "NEYO_MPESA_SHORTCODE");
  const environmentRaw = (await secretOrEnv("central_daraja_environment", "NEYO_MPESA_ENVIRONMENT")) || "sandbox";
  const consumerKey = await secretOrEnv("central_daraja_consumer_key", "NEYO_DARAJA_CONSUMER_KEY");
  const consumerSecret = await secretOrEnv("central_daraja_consumer_secret", "NEYO_DARAJA_CONSUMER_SECRET");
  const passkey = await secretOrEnv("central_daraja_passkey", "NEYO_DARAJA_PASSKEY");
  if (!shortcode || !consumerKey || !consumerSecret || !passkey) return null;
  return { shortcode, environment: environmentRaw === "production" ? "production" : "sandbox", consumerKey, consumerSecret, passkey };
}

async function pathwayGuideGateway(): Promise<{ provider: PaymentProvider; creds: ProviderCredentials; live: boolean }> {
  const creds = await centralCreds();
  if (creds) return { provider: daraja, creds, live: true };
  if (process.env.NODE_ENV !== "production") {
    return { provider: mock, creds: { shortcode: "174379", environment: "sandbox", consumerKey: "mock", consumerSecret: "mock", passkey: "mock" }, live: false };
  }
  throw new PathwayGuideError("INVALID", "NEYO central M-Pesa credentials are not configured in NEYO Ops.");
}

function guideCallbackUrl(): string {
  const token = process.env.DARAJA_WEBHOOK_TOKEN;
  const base = `${appBaseUrl()}/api/pathway-guide/public/payment-callback`;
  return token ? `${base}?t=${encodeURIComponent(token)}` : base;
}

export async function startGuidePayment(input: { sessionId: string; phone: string }) {
  const session = await getSessionOrThrow(input.sessionId);
  if (!session.isPublic) throw new PathwayGuideError("INVALID", "This session is already free for NEYO school users.");
  if (session.unlocked) throw new PathwayGuideError("INVALID", "This session is already unlocked.");
  const phone = normalizeKePhone(input.phone);
  if (!phone) throw new PathwayGuideError("INVALID", "Enter a valid Kenyan phone number, e.g. 0712 345 678.");

  const amountKes = await getPathwayGuideFeeKes();
  const payment = await db.pathwayGuidePayment.create({ data: { phone, amountKes, status: "PENDING" } });

  const gateway = await pathwayGuideGateway();
  const result = await gateway.provider.stkPush(gateway.creds, {
    amount: amountKes,
    phone,
    accountRef: `NEYO-PATHGUIDE`,
    description: "NEYO Pathway Guide unlock",
    callbackUrl: guideCallbackUrl(),
  });
  if (!result.ok || !result.checkoutRequestId) {
    await db.pathwayGuidePayment.update({ where: { id: payment.id }, data: { status: "FAILED", resultDesc: result.message } });
    throw new PathwayGuideError("INVALID", result.message || "Could not start the M-Pesa payment.");
  }
  const updatedPayment = await db.pathwayGuidePayment.update({ where: { id: payment.id }, data: { checkoutRequestId: result.checkoutRequestId } });
  await db.pathwayGuideSession.update({ where: { id: session.id }, data: { paymentId: updatedPayment.id, phone } });
  return { payment: updatedPayment, checkoutRequestId: result.checkoutRequestId, amountKes };
}

export async function handleGuidePaymentCallback(body: unknown) {
  const gateway = await pathwayGuideGateway();
  const parsed = gateway.provider.parseCallback(body);
  if (!parsed.checkoutRequestId) throw new PathwayGuideError("INVALID", "Missing checkout request id in callback.");

  const payment = await db.pathwayGuidePayment.findUnique({ where: { checkoutRequestId: parsed.checkoutRequestId } });
  if (!payment) throw new PathwayGuideError("NOT_FOUND", "No matching pathway guide payment found.");
  if (payment.status === "PAID") return { alreadyProcessed: true };

  if (parsed.status !== "PAID") {
    await db.pathwayGuidePayment.update({ where: { id: payment.id }, data: { status: "FAILED", resultDesc: parsed.resultDesc || "Payment failed." } });
    return { alreadyProcessed: false, paid: false };
  }

  await db.pathwayGuidePayment.update({ where: { id: payment.id }, data: { status: "PAID", mpesaRef: parsed.mpesaRef || null, resultDesc: parsed.resultDesc || "Success" } });
  const session = await db.pathwayGuideSession.findUnique({ where: { paymentId: payment.id } });
  if (session) {
    await db.pathwayGuideSession.update({ where: { id: session.id }, data: { unlocked: true, unlockedAt: new Date() } });
  }
  return { alreadyProcessed: false, paid: true };
}

export function verifyGuideWebhookToken(token: string | null): boolean {
  return verifyWebhookToken(token);
}

export async function getGuidePaymentStatus(sessionId: string) {
  const session = await getSessionOrThrow(sessionId);
  if (!session.paymentId) return { unlocked: session.unlocked, status: "NONE" as const };
  const payment = await db.pathwayGuidePayment.findUnique({ where: { id: session.paymentId } });
  return { unlocked: session.unlocked, status: (payment?.status || "NONE") as "PENDING" | "PAID" | "FAILED" | "NONE" };
}

export async function myGuideSessionsForStudent(user: SessionUser, studentId: string) {
  return withTenant(user.tenantId, async () => {
    const tDb = tenantDb();
    // Real row-scoped ownership check enforced HERE in the service layer
    // (defense in depth, not just at the API route) — a PARENT only ever
    // sees students `scopeWhere()` actually returns for them; a staff role
    // like BURSAR/PRINCIPAL is intentionally unrestricted by scopeWhere(),
    // matching every other real per-student lookup in the codebase.
    const { scopeWhere } = await import("@/lib/services/student.service");
    const scope = await scopeWhere(user);
    const student = await tDb.student.findFirst({ where: { AND: [{ id: studentId, deletedAt: null }, scope] }, select: { id: true, firstName: true, lastName: true } });
    if (!student) throw new PathwayGuideError("NOT_FOUND", "Student not found.");
    return db.pathwayGuideSession.findMany({ where: { tenantId: user.tenantId, studentId }, orderBy: { createdAt: "desc" } });
  });
}

export async function seedKuccpsClusters(user: SessionUser) {
  let created = 0;
  let updated = 0;
  for (const seed of KUCCPS_CLUSTERS) {
    const cluster = await db.kuccpsCluster.upsert({
      where: { number: seed.number },
      create: { number: seed.number, name: seed.name, description: seed.description, subjectRulesJson: JSON.stringify(seed.subjectRules), displayOrder: seed.number },
      update: { name: seed.name, description: seed.description, subjectRulesJson: JSON.stringify(seed.subjectRules) },
    });
    for (const course of seed.courses) {
      const existing = await db.kuccpsCourse.findFirst({ where: { clusterId: cluster.id, name: course.name } });
      if (existing) {
        await db.kuccpsCourse.update({
          where: { id: existing.id },
          data: { minGradesJson: JSON.stringify(course.minGrades), minMeanGrade: course.minMeanGrade, typicalCutoff: course.typicalCutoff ?? null, careerAreas: JSON.stringify(course.careerAreas) },
        });
        updated += 1;
      } else {
        await db.kuccpsCourse.create({
          data: { clusterId: cluster.id, name: course.name, minGradesJson: JSON.stringify(course.minGrades), minMeanGrade: course.minMeanGrade, typicalCutoff: course.typicalCutoff ?? null, careerAreas: JSON.stringify(course.careerAreas) },
        });
        created += 1;
      }
    }
  }
  await db.auditLog.create({
    data: { tenantId: user.tenantId, actorId: user.id, actorName: user.fullName, action: "pathway_guide.kuccps_seeded", entityType: "KuccpsCluster", entityId: "bulk", metadata: JSON.stringify({ clusters: KUCCPS_CLUSTERS.length, created, updated }) },
  });
  return { clusters: KUCCPS_CLUSTERS.length, coursesCreated: created, coursesUpdated: updated };
}

export async function listKuccpsClusters() {
  return db.kuccpsCluster.findMany({ where: { archived: false }, include: { courses: { where: { archived: false } } }, orderBy: { number: "asc" } });
}

export async function listRecentGuideSessions(limit = 50) {
  return db.pathwayGuideSession.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

export async function guideUsageSummary() {
  const [totalSessions, publicSessions, unlockedPublicSessions, totalRevenue] = await Promise.all([
    db.pathwayGuideSession.count(),
    db.pathwayGuideSession.count({ where: { isPublic: true } }),
    db.pathwayGuideSession.count({ where: { isPublic: true, unlocked: true } }),
    db.pathwayGuidePayment.aggregate({ where: { status: "PAID" }, _sum: { amountKes: true } }),
  ]);
  return {
    totalSessions,
    publicSessions,
    unlockedPublicSessions,
    totalRevenueKes: totalRevenue._sum.amountKes || 0,
  };
}

export { CAREER_AREAS };
