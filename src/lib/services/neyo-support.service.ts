/**
 * PART Y.2 — NEYO Support Console.
 *
 * Founder's own words (2026-07-09): a NEYO Support account "should be able
 * to answer inquiries, check requests, demo requests, quotation requests
 * and any other thing a customer may need — onboarding, planning and
 * guidance, and anything else they may need." This service aggregates the
 * REAL, already-existing customer-request surfaces (Part V's real
 * `SchoolQuoteRequest`, T.3's real `CustomFeatureRequest`, the real
 * `NeyoFounderOpsEntry` waitlist/demo-approval rows) into ONE real,
 * permission-gated (`neyo.customer_requests`) view — never a new,
 * duplicate request/ticket system, since all three already exist and are
 * already real, tested, working pipelines.
 */
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/core/session";
import { effectivePermissionsForUser } from "@/lib/core/session";
import { isFounderTier } from "@/lib/core/roles";
import { listQuoteRequests, sendFormalQuote, markOnboardingAssistanceDone } from "@/lib/services/school-quote.service";
import { listAllCustomFeatureRequests, updateCustomFeatureRequest } from "@/lib/services/custom-feature-request.service";
import type { SendFormalQuoteInput } from "@/lib/validations/pricing-engine";
import type { UpdateCustomFeatureRequestInput } from "@/lib/validations/custom-feature-request";

export class NeyoSupportError extends Error {
  constructor(public code: "FORBIDDEN", message: string) {
    super(message);
    this.name = "NeyoSupportError";
  }
}

export async function assertCustomerRequestsAccess(user: SessionUser) {
  if (isFounderTier(user.role)) return;
  const effective = await effectivePermissionsForUser(user);
  if (!effective.includes("neyo.customer_requests")) {
    throw new NeyoSupportError("FORBIDDEN", "You do not have access to NEYO customer requests.");
  }
}

export async function supportConsoleDashboard(user: SessionUser) {
  await assertCustomerRequestsAccess(user);

  const [quoteRequests, customFeatureRequests, waitlistEntries] = await Promise.all([
    listQuoteRequests(),
    listAllCustomFeatureRequests(),
    db.neyoFounderOpsEntry.findMany({ where: { kind: "WAITLIST" }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return {
    quoteRequests,
    customFeatureRequests,
    waitlistEntries,
    counts: {
      openQuotes: quoteRequests.filter((q) => q.status === "REQUESTED" || q.status === "QUOTED").length,
      pendingOnboardingHelp: quoteRequests.filter((q) => q.onboardingAssistanceRequested && !q.onboardingAssistanceDoneAt).length,
      openFeatureRequests: customFeatureRequests.filter((r) => !["DELIVERED", "DECLINED"].includes(r.status)).length,
      waitlistCount: waitlistEntries.length,
    },
  };
}

export async function supportSendFormalQuote(user: SessionUser, input: SendFormalQuoteInput) {
  await assertCustomerRequestsAccess(user);
  return sendFormalQuote(user, input);
}

export async function supportMarkOnboardingAssistanceDone(user: SessionUser, id: string) {
  await assertCustomerRequestsAccess(user);
  return markOnboardingAssistanceDone(user, id);
}

export async function supportUpdateCustomFeatureRequest(user: SessionUser, requestId: string, input: UpdateCustomFeatureRequestInput) {
  await assertCustomerRequestsAccess(user);
  return updateCustomFeatureRequest(user, requestId, input);
}
