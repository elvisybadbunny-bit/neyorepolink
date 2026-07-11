/**
 * B.19 Cafeteria — weekly meal plan, food inventory (REUSES the B.18 Kitchen
 * Store — one stock truth, no double entry), student meal cards BILLED TO
 * THE STUDENT'S INVOICE on issue (founder rule), and kitchen management
 * (issue food against a meal, see today's headcount per meal).
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { nextTenantId } from "@/lib/services/identity.service";
import { stockOut } from "@/lib/services/inventory.service";
import type { SessionUser } from "@/lib/core/session";

export class CafeteriaError extends Error {
  constructor(public code: "NOT_FOUND" | "DUPLICATE" | "INVALID" | "ALREADY", message: string) {
    super(message);
    this.name = "CafeteriaError";
  }
}

async function audit(user: SessionUser, action: string, entityType: string, entityId: string, metadata?: unknown) {
  await db.auditLog.create({
    data: {
      tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
      action, entityType, entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

const fullName = (s: { firstName: string; middleName: string | null; lastName: string }) =>
  [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");

// ---------------------------------------------------------------------------
// Flexible meal model (I.18)
// ---------------------------------------------------------------------------

export type CafeteriaMealModel = "HYBRID" | "CARDS_ONLY" | "BOARDING_GROUPS" | "NO_CARDS";
export type CafeteriaMealScope = "ALL" | "LUNCH" | "SUPPER";

function normalizeMealModel(value: string): CafeteriaMealModel {
  return (["HYBRID", "CARDS_ONLY", "BOARDING_GROUPS", "NO_CARDS"] as const).includes(value as CafeteriaMealModel)
    ? value as CafeteriaMealModel
    : "HYBRID";
}

function normalizeMealScope(value: string): CafeteriaMealScope {
  return (["ALL", "LUNCH", "SUPPER"] as const).includes(value as CafeteriaMealScope)
    ? value as CafeteriaMealScope
    : "ALL";
}

export async function cafeteriaPolicy(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tenant = await db.tenant.findUniqueOrThrow({
      where: { id: user.tenantId },
      select: { cafeteriaMealModel: true, cafeteriaMealScope: true, cafeteriaTableSize: true },
    });
    return {
      mealModel: normalizeMealModel(tenant.cafeteriaMealModel),
      mealScope: normalizeMealScope(tenant.cafeteriaMealScope),
      tableSize: tenant.cafeteriaTableSize,
      mealCardsEnabled: normalizeMealModel(tenant.cafeteriaMealModel) !== "NO_CARDS" && normalizeMealModel(tenant.cafeteriaMealModel) !== "BOARDING_GROUPS",
    };
  });
}

export async function setCafeteriaPolicy(user: SessionUser, input: { mealModel: CafeteriaMealModel; mealScope: CafeteriaMealScope }) {
  return withTenant(user.tenantId, async () => {
    const mealModel = normalizeMealModel(input.mealModel);
    const mealScope = normalizeMealScope(input.mealScope);
    const row = await db.tenant.update({
      where: { id: user.tenantId },
      data: { cafeteriaMealModel: mealModel, cafeteriaMealScope: mealScope },
      select: { cafeteriaMealModel: true, cafeteriaMealScope: true, cafeteriaTableSize: true },
    });
    await audit(user, "cafeteria.policy_updated", "tenant", user.tenantId, { mealModel, mealScope });
    return {
      mealModel: normalizeMealModel(row.cafeteriaMealModel),
      mealScope: normalizeMealScope(row.cafeteriaMealScope),
      tableSize: row.cafeteriaTableSize,
      mealCardsEnabled: mealModel !== "NO_CARDS" && mealModel !== "BOARDING_GROUPS",
    };
  });
}

// ---------------------------------------------------------------------------
// Meal planning (B.19.1)
// ---------------------------------------------------------------------------

export async function weekMenu(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().mealPlanEntry.findMany({ orderBy: [{ dayOfWeek: "asc" }] });
    return rows.map((r) => ({ id: r.id, dayOfWeek: r.dayOfWeek, mealType: r.mealType, menu: r.menu }));
  });
}

export async function setMenuEntry(user: SessionUser, input: { dayOfWeek: number; mealType: string; menu: string }) {
  return withTenant(user.tenantId, async () => {
    const row = await db.mealPlanEntry.upsert({
      where: { tenantId_dayOfWeek_mealType: { tenantId: user.tenantId, dayOfWeek: input.dayOfWeek, mealType: input.mealType } },
      create: { tenantId: user.tenantId, dayOfWeek: input.dayOfWeek, mealType: input.mealType, menu: input.menu },
      update: { menu: input.menu },
    });
    await audit(user, "cafeteria.menu_set", "mealPlanEntry", row.id, input);
    return row;
  });
}

// ---------------------------------------------------------------------------
// Food inventory (B.19.2) — the Kitchen Store view (B.18 reuse, no new tables)
// ---------------------------------------------------------------------------

export async function kitchenStock(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const kitchen = await tenantDb().store.findFirst({ where: { name: { contains: "Kitchen" }, archived: false } });
    if (!kitchen) return { storeId: null, items: [] as { id: string; name: string; qty: number; unit: string; low: boolean }[] };
    const items = await tenantDb().stockItem.findMany({
      where: { storeId: kitchen.id, archived: false },
      orderBy: { name: "asc" },
    });
    return {
      storeId: kitchen.id,
      items: items.map((i) => ({
        id: i.id, name: i.name, qty: i.qty, unit: i.unit,
        low: i.reorderLevel > 0 && i.qty <= i.reorderLevel,
      })),
    };
  });
}

/** Kitchen issues food for a meal — wraps the B.18 stockOut (one stock truth). */
export async function issueForMeal(user: SessionUser, input: { itemId: string; qty: number; meal: string }) {
  return stockOut(user, { itemId: input.itemId, qty: input.qty, reason: `Kitchen — ${input.meal}` });
}

// ---------------------------------------------------------------------------
// Student meal cards (B.19.3) — FOUNDER RULE: billed on issue
// ---------------------------------------------------------------------------

export async function listCards(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const cards = await tenantDb().mealCard.findMany({ orderBy: { issuedAt: "desc" }, take: 100 });
    const invoiceIds = cards.map((c) => c.invoiceId);
    const invoices = invoiceIds.length
      ? await tenantDb().invoice.findMany({ where: { id: { in: invoiceIds } }, select: { id: true, status: true, invoiceNo: true } })
      : [];
    const iMap = new Map(invoices.map((i) => [i.id, i]));
    return cards.map((c) => ({
      id: c.id, cardNo: c.cardNo, studentName: c.studentName, admissionNo: c.admissionNo,
      planName: c.planName, meals: JSON.parse(c.meals) as string[],
      termFeeKes: c.termFeeKes, active: c.active,
      invoiceNo: iMap.get(c.invoiceId)?.invoiceNo ?? "—",
      invoiceStatus: iMap.get(c.invoiceId)?.status ?? "—",
      followsLiveDefault: c.followsLiveDefault,
    }));
  });
}

export async function issueCard(
  user: SessionUser,
  input: { studentId: string; meals: string[]; termFeeKes: number; year: number; term: number; feePlanId?: string; followsLiveDefault?: boolean }
) {
  return withTenant(user.tenantId, async () => {
    const student = await tenantDb().student.findFirst({ where: { id: input.studentId, status: "ACTIVE", deletedAt: null } });
    if (!student) throw new CafeteriaError("NOT_FOUND", "Student not found (or not active)." );
    const policy = await cafeteriaPolicy(user);
    if (!policy.mealCardsEnabled) throw new CafeteriaError("INVALID", "Meal cards are disabled by the school's cafeteria model.");
    if (policy.mealScope === "LUNCH" && input.meals.some((m) => m !== "LUNCH")) throw new CafeteriaError("INVALID", "This school currently allows lunch meal cards only.");
    if (policy.mealScope === "SUPPER" && input.meals.some((m) => m !== "SUPPER")) throw new CafeteriaError("INVALID", "This school currently allows supper meal cards only.");

    const planName = `${input.meals.map((m) => m.charAt(0) + m.slice(1).toLowerCase()).join(" + ")} plan — Term ${input.term} ${input.year}`;
    const dup = await tenantDb().mealCard.findFirst({ where: { studentId: student.id, year: input.year, term: input.term, active: true } });
    if (dup) throw new CafeteriaError("ALREADY", `${student.firstName} already has an active card this term (${dup.cardNo}). Cancel it first.`);

    // FOUNDER RULE: bill the invoice FIRST — no card without a ledger entry.
    const invoiceNo = await nextTenantId(user.tenantId, "INVOICE");
    const due = new Date(Date.now() + 3 * 3600_000 + 14 * 24 * 3600_000).toISOString().slice(0, 10);
    const invoice = await db.invoice.create({
      data: {
        tenantId: user.tenantId, invoiceNo, studentId: student.id,
        description: `Meals — ${planName}`,
        totalKes: input.termFeeKes, dueDate: due, status: "UNPAID",
        year: input.year, term: input.term,
      },
    });

    const count = await tenantDb().mealCard.count();
    const cardNo = `MC${count + 1}`;
    const card = await db.mealCard.create({
      data: {
        tenantId: user.tenantId, cardNo, studentId: student.id,
        studentName: fullName(student), admissionNo: student.admissionNo,
        planName, meals: JSON.stringify(input.meals), termFeeKes: input.termFeeKes,
        invoiceId: invoice.id, year: input.year, term: input.term,
        feePlanId: input.feePlanId ?? null,
        followsLiveDefault: input.followsLiveDefault ?? false,
      },
    });
    await audit(user, "cafeteria.card_issued", "mealCard", card.id, { cardNo, student: card.studentName, planName, invoiceNo, termFeeKes: input.termFeeKes, followsLiveDefault: input.followsLiveDefault ?? false });
    return { cardId: card.id, cardNo, invoiceId: invoice.id, invoiceNo, planName, studentName: card.studentName };
  });
}

// ---------------------------------------------------------------------------
// T.9 — real per-level default feeding cost plans + bulk issue
// ---------------------------------------------------------------------------

export async function listFeePlans(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const plans = await tenantDb().cafeteriaFeePlan.findMany({ where: { archived: false }, orderBy: [{ year: "desc" }, { term: "desc" }, { level: "asc" }] });
    return plans.map((p) => ({
      id: p.id, name: p.name, level: p.level, classId: p.classId,
      meals: JSON.parse(p.meals) as string[], termFeeKes: p.termFeeKes,
      year: p.year, term: p.term,
    }));
  });
}

export async function setFeePlan(
  user: SessionUser,
  input: { name: string; level: string; classId?: string; meals: string[]; termFeeKes: number; year: number; term: number }
) {
  return withTenant(user.tenantId, async () => {
    const dup = await tenantDb().cafeteriaFeePlan.findFirst({
      where: { level: input.level, year: input.year, term: input.term, classId: input.classId ?? null, archived: false },
    });
    if (dup) throw new CafeteriaError("DUPLICATE", `A fee plan for ${input.level} · Term ${input.term} ${input.year} already exists. Edit it instead.`);
    const plan = await db.cafeteriaFeePlan.create({
      data: {
        tenantId: user.tenantId, name: input.name, level: input.level, classId: input.classId ?? null,
        meals: JSON.stringify(input.meals), termFeeKes: input.termFeeKes, year: input.year, term: input.term,
      },
    });
    await audit(user, "cafeteria.fee_plan_set", "cafeteriaFeePlan", plan.id, { level: input.level, termFeeKes: input.termFeeKes });
    return plan;
  });
}

/**
 * T.9 — bulk-issue real meal cards + invoices to every ACTIVE student in a
 * fee plan's level/class, mirroring finance.service.ts's own batchInvoice()
 * exactly: idempotent (a student who already has an active card this term
 * is skipped, never double-billed), real per-student invoices, one action.
 */
export async function bulkIssueCards(user: SessionUser, feePlanId: string, followsLiveDefault = false) {
  return withTenant(user.tenantId, async () => {
    const plan = await tenantDb().cafeteriaFeePlan.findUnique({ where: { id: feePlanId } });
    if (!plan) throw new CafeteriaError("NOT_FOUND", "Fee plan not found.");
    const policy = await cafeteriaPolicy(user);
    if (!policy.mealCardsEnabled) throw new CafeteriaError("INVALID", "Meal cards are disabled by the school's cafeteria model.");

    const classes = await tenantDb().schoolClass.findMany({
      where: plan.classId ? { id: plan.classId, archived: false } : { level: plan.level, archived: false },
    });
    const students = await tenantDb().student.findMany({
      where: { classId: { in: classes.map((c) => c.id) }, status: "ACTIVE" },
    });

    const meals = JSON.parse(plan.meals) as string[];
    let issued = 0; let skipped = 0;
    const results: { studentName: string; cardNo?: string; skippedReason?: string }[] = [];

    for (const student of students) {
      const existing = await tenantDb().mealCard.findFirst({ where: { studentId: student.id, year: plan.year, term: plan.term, active: true } });
      if (existing) { skipped++; results.push({ studentName: fullName(student), skippedReason: `already has ${existing.cardNo}` }); continue; }
      const result = await issueCard(user, {
        studentId: student.id, meals, termFeeKes: plan.termFeeKes, year: plan.year, term: plan.term,
        feePlanId: plan.id, followsLiveDefault,
      });
      issued++;
      results.push({ studentName: result.studentName, cardNo: result.cardNo });
    }

    await audit(user, "cafeteria.bulk_issued", "cafeteriaFeePlan", plan.id, { issued, skipped, level: plan.level });
    return { issued, skipped, total: students.length, results };
  });
}

/**
 * T.9 — founder-confirmed: "a school chooses what they want" when a class's
 * live default feeding cost changes mid-term. This is the REAL, explicit,
 * staff-triggered sync action for cards that opted into followsLiveDefault
 * at issue time — it NEVER retroactively rewrites an already-raised
 * invoice; it only creates a real NEW top-up invoice for the real
 * difference (never a silent balance change), exactly mirroring how every
 * other NEYO mid-term cost change (T.8 transport) is handled.
 */
export async function syncCardToLiveDefault(user: SessionUser, cardId: string) {
  return withTenant(user.tenantId, async () => {
    const card = await tenantDb().mealCard.findUnique({ where: { id: cardId }, include: { feePlan: true } });
    if (!card) throw new CafeteriaError("NOT_FOUND", "Card not found.");
    if (!card.active) throw new CafeteriaError("INVALID", "This card is not active.");
    if (!card.followsLiveDefault) throw new CafeteriaError("INVALID", "This card is locked at its original fee — it does not follow the live default.");
    if (!card.feePlan) throw new CafeteriaError("INVALID", "This card has no linked fee plan to sync from.");

    const liveFee = card.feePlan.termFeeKes;
    const diff = liveFee - card.termFeeKes;
    if (diff === 0) return { changed: false, diffKes: 0 };

    if (diff > 0) {
      // The live default went UP — raise a real top-up invoice for the difference.
      const invoiceNo = await nextTenantId(user.tenantId, "INVOICE");
      const due = new Date(Date.now() + 3 * 3600_000 + 14 * 24 * 3600_000).toISOString().slice(0, 10);
      await db.invoice.create({
        data: {
          tenantId: user.tenantId, invoiceNo, studentId: card.studentId,
          description: `Meals top-up — ${card.planName} (cost update)`,
          totalKes: diff, dueDate: due, status: "UNPAID",
          year: card.year, term: card.term,
        },
      });
      await tenantDb().mealCard.update({ where: { id: cardId }, data: { termFeeKes: liveFee } });
      await audit(user, "cafeteria.card_synced", "mealCard", cardId, { diffKes: diff, newFeeKes: liveFee, invoiceNo });
      return { changed: true, diffKes: diff, invoiceNo };
    }

    // The live default went DOWN — record the new lower fee honestly, but
    // NEVER auto-refund/auto-credit (a real, deliberate school decision,
    // same conservative rule this codebase applies to every other real
    // mid-term decrease scenario — a human handles refunds manually).
    await tenantDb().mealCard.update({ where: { id: cardId }, data: { termFeeKes: liveFee } });
    await audit(user, "cafeteria.card_synced", "mealCard", cardId, { diffKes: diff, newFeeKes: liveFee, note: "decrease recorded, no auto-refund" });
    return { changed: true, diffKes: diff };
  });
}

// ---------------------------------------------------------------------------
// T.9 — real parent-portal enrollment self-service (mirrors T.8 transport
// route-change requests exactly)
// ---------------------------------------------------------------------------

export async function cafeteriaEnrollmentPolicy(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tenant = await db.tenant.findUniqueOrThrow({ where: { id: user.tenantId }, select: { allowParentCafeteriaRequests: true } });
    return { allowParentCafeteriaRequests: tenant.allowParentCafeteriaRequests };
  });
}

export async function setCafeteriaEnrollmentPolicy(user: SessionUser, allow: boolean) {
  return withTenant(user.tenantId, async () => {
    const row = await db.tenant.update({ where: { id: user.tenantId }, data: { allowParentCafeteriaRequests: allow }, select: { allowParentCafeteriaRequests: true } });
    await audit(user, "cafeteria.enrollment_policy_updated", "tenant", user.tenantId, { allow });
    return row;
  });
}

export async function createCafeteriaEnrollmentRequest(
  user: SessionUser,
  input: { studentId: string; action: "ENROLL" | "CANCEL"; reason?: string }
) {
  return withTenant(user.tenantId, async () => {
    const { allowParentCafeteriaRequests } = await cafeteriaEnrollmentPolicy(user);
    if (!allowParentCafeteriaRequests) throw new CafeteriaError("INVALID", "This school hasn't enabled parent-requested cafeteria changes.");

    // Row-scope: a parent may only request for their OWN child.
    const { scopeWhere } = await import("@/lib/services/student.service");
    const scope = await scopeWhere(user);
    const student = await tenantDb().student.findFirst({ where: { AND: [{ id: input.studentId }, scope] } });
    if (!student) throw new CafeteriaError("NOT_FOUND", "Student not found.");

    const existingPending = await tenantDb().cafeteriaEnrollmentRequest.findFirst({ where: { studentId: student.id, status: "PENDING" } });
    if (existingPending) throw new CafeteriaError("ALREADY", "There is already a pending cafeteria request for this learner.");

    const row = await db.cafeteriaEnrollmentRequest.create({
      data: {
        tenantId: user.tenantId, studentId: student.id,
        requestedById: user.id, requestedByName: user.fullName,
        action: input.action, reason: input.reason ?? null,
      },
    });
    await audit(user, "cafeteria.enrollment_requested", "cafeteriaEnrollmentRequest", row.id, { studentId: student.id, action: input.action });
    return row;
  });
}

export async function listCafeteriaEnrollmentRequests(user: SessionUser, status?: string) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().cafeteriaEnrollmentRequest.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: { student: { select: { firstName: true, middleName: true, lastName: true, admissionNo: true, classId: true } } },
    });
    return rows.map((r) => ({
      id: r.id, studentId: r.studentId, studentName: fullName(r.student), admissionNo: r.student.admissionNo,
      action: r.action, reason: r.reason, status: r.status,
      requestedByName: r.requestedByName, createdAt: r.createdAt,
      decidedByName: r.decidedByName, decidedAt: r.decidedAt, declineReason: r.declineReason,
    }));
  });
}

/** Row-scoped: a parent's own cafeteria enrollment requests + their child's current card status. */
export async function parentCafeteriaRequests(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().cafeteriaEnrollmentRequest.findMany({
      where: { requestedById: user.id },
      orderBy: { createdAt: "desc" },
      include: { student: { select: { firstName: true, middleName: true, lastName: true } } },
    });
    return rows.map((r) => ({
      id: r.id, studentId: r.studentId, studentName: fullName(r.student),
      action: r.action, status: r.status, createdAt: r.createdAt,
      decidedAt: r.decidedAt, declineReason: r.declineReason,
    }));
  });
}

export async function decideCafeteriaEnrollmentRequest(
  user: SessionUser,
  requestId: string,
  input: { approve: boolean; declineReason?: string; feePlanId?: string }
) {
  return withTenant(user.tenantId, async () => {
    const request = await tenantDb().cafeteriaEnrollmentRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new CafeteriaError("NOT_FOUND", "Request not found.");
    if (request.status !== "PENDING") throw new CafeteriaError("ALREADY", "This request has already been decided.");

    if (!input.approve) {
      const row = await tenantDb().cafeteriaEnrollmentRequest.update({
        where: { id: requestId },
        data: { status: "DECLINED", decidedById: user.id, decidedByName: user.fullName, decidedAt: new Date(), declineReason: input.declineReason ?? null },
      });
      await audit(user, "cafeteria.enrollment_declined", "cafeteriaEnrollmentRequest", requestId, { reason: input.declineReason });
      return row;
    }

    let resultCardId: string | null = null;
    let resultNote: string;

    if (request.action === "CANCEL") {
      const activeCard = await tenantDb().mealCard.findFirst({ where: { studentId: request.studentId, active: true } });
      if (activeCard) {
        await cancelCard(user, activeCard.id);
        resultCardId = activeCard.id;
        resultNote = `Card ${activeCard.cardNo} cancelled.`;
      } else {
        resultNote = "No active card found to cancel.";
      }
    } else {
      // ENROLL — needs a real fee plan to issue from.
      if (!input.feePlanId) throw new CafeteriaError("INVALID", "Pick a fee plan to enroll this learner into.");
      const plan = await tenantDb().cafeteriaFeePlan.findUnique({ where: { id: input.feePlanId } });
      if (!plan) throw new CafeteriaError("NOT_FOUND", "Fee plan not found.");
      const meals = JSON.parse(plan.meals) as string[];
      const issued = await issueCard(user, {
        studentId: request.studentId, meals, termFeeKes: plan.termFeeKes,
        year: plan.year, term: plan.term, feePlanId: plan.id,
      });
      resultCardId = issued.cardId;
      resultNote = `Card ${issued.cardNo} issued (${issued.invoiceNo}).`;
    }

    const row = await tenantDb().cafeteriaEnrollmentRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", decidedById: user.id, decidedByName: user.fullName, decidedAt: new Date(), resultCardId, resultNote },
    });
    await audit(user, "cafeteria.enrollment_approved", "cafeteriaEnrollmentRequest", requestId, { resultNote });
    return row;
  });
}


export async function cancelCard(user: SessionUser, cardId: string) {
  return withTenant(user.tenantId, async () => {
    const card = await tenantDb().mealCard.findUnique({ where: { id: cardId } });
    if (!card) throw new CafeteriaError("NOT_FOUND", "Card not found.");
    if (!card.active) throw new CafeteriaError("ALREADY", "Card is already cancelled.");
    const row = await tenantDb().mealCard.update({ where: { id: cardId }, data: { active: false, cancelledAt: new Date() } });
    await audit(user, "cafeteria.card_cancelled", "mealCard", cardId, { cardNo: card.cardNo });
    return row;
  });
}

// ---------------------------------------------------------------------------
// Kitchen management (B.19.4) — today's headcount per meal + low stock
// ---------------------------------------------------------------------------

export async function kitchenToday(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const cards = await tenantDb().mealCard.findMany({ where: { active: true } });
    const headcount: Record<string, number> = { BREAKFAST: 0, LUNCH: 0, SUPPER: 0 };
    for (const c of cards) {
      for (const m of JSON.parse(c.meals) as string[]) headcount[m] = (headcount[m] ?? 0) + 1;
    }
    // Boarders eat all meals regardless of cards (boarding fee covers meals).
    const boarders = await tenantDb().hostelAllocation.count({ where: { releasedAt: null } });

    const nairobiNow = new Date(Date.now() + 3 * 3600_000);
    const jsDay = nairobiNow.getUTCDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;
    const todayMenu = await tenantDb().mealPlanEntry.findMany({ where: { dayOfWeek } });

    const stock = await kitchenStock(user);

    // B.21 link: FOOD-allergy register for the kitchen crew (safety board).
    const { allergyRegister } = await import("@/lib/services/clinic.service");
    const allergic = await allergyRegister(user).catch(() => []);

    return {
      dayOfWeek,
      todayMenu: todayMenu.map((m) => ({ mealType: m.mealType, menu: m.menu })),
      headcount: {
        BREAKFAST: headcount.BREAKFAST + boarders,
        LUNCH: headcount.LUNCH + boarders,
        SUPPER: headcount.SUPPER + boarders,
      },
      dayScholarsWithCards: cards.length,
      boarders,
      lowStock: stock.items.filter((i) => i.low),
      foodAllergies: allergic.map((a) => ({ studentName: a.studentName, className: a.className, allergies: a.allergies })),
    };
  });
}

// ---------------------------------------------------------------------------
// H.5 Cafeteria Table Allocation
// Seat students per CLASS (never mixed across classes/streams) at tables of a
// chosen size, for a meal session (LUNCH | SUPPER). Idempotent per session.
// ---------------------------------------------------------------------------

type Session = "LUNCH" | "SUPPER";

function classLabelOf(cls: { level: string; stream: string | null }) {
  return [cls.level, cls.stream].filter(Boolean).join(" ");
}

/**
 * Allocate dining tables for a meal session. For each non-archived class, the
 * active learners are chunked into tables of `tableSize` (last table may be
 * partial). Re-running replaces the previous plan for that session and stores
 * the chosen size as the school default. Returns the seating board.
 */
export async function allocateCafeteriaTables(
  user: SessionUser,
  input: { session: Session; tableSize: number }
) {
  return withTenant(user.tenantId, async () => {
    const size = Math.trunc(input.tableSize);
    if (!Number.isFinite(size) || size < 2 || size > 50) {
      throw new CafeteriaError("INVALID", "Table size must be between 2 and 50 seats.");
    }
    if (input.session !== "LUNCH" && input.session !== "SUPPER") {
      throw new CafeteriaError("INVALID", "Session must be LUNCH or SUPPER.");
    }

    const classes = await tenantDb().schoolClass.findMany({
      where: { archived: false },
      orderBy: [{ level: "asc" }, { stream: "asc" }],
    });

    // Wipe any previous plan for this session — re-allocation is idempotent.
    await db.cafeteriaTable.deleteMany({ where: { tenantId: user.tenantId, session: input.session } });

    let tablesCreated = 0;
    let seatedStudents = 0;
    for (const cls of classes) {
      const students = await tenantDb().student.findMany({
        where: { classId: cls.id, status: "ACTIVE", deletedAt: null },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      });
      if (students.length === 0) continue;
      const label = classLabelOf(cls);
      let tableNo = 0;
      for (let i = 0; i < students.length; i += size) {
        tableNo++;
        const group = students.slice(i, i + size).map((s) => ({
          id: s.id,
          name: fullName(s),
          admNo: s.admissionNo,
        }));
        await db.cafeteriaTable.create({
          data: {
            tenantId: user.tenantId,
            session: input.session,
            classId: cls.id,
            classLabel: label,
            tableNo,
            seats: size,
            studentsJson: JSON.stringify(group),
          },
        });
        tablesCreated++;
        seatedStudents += group.length;
      }
    }

    // Remember the chosen size as the school default.
    await db.tenant.update({ where: { id: user.tenantId }, data: { cafeteriaTableSize: size } });
    await audit(user, "cafeteria.tables_allocated", "tenant", user.tenantId, {
      session: input.session, tableSize: size, tablesCreated, seatedStudents,
    });

    return tableBoard(user, input.session);
  });
}

/** Read the seating plan for a session, grouped by class. */
export async function tableBoard(user: SessionUser, session: Session) {
  return withTenant(user.tenantId, async () => {
    const tenant = await tenantDb().tenant.findUnique({ where: { id: user.tenantId } });
    const rows = await tenantDb().cafeteriaTable.findMany({
      where: { session },
      orderBy: [{ classLabel: "asc" }, { tableNo: "asc" }],
    });
    const byClass = new Map<string, { classLabel: string; tables: { tableNo: number; seats: number; students: { id: string; name: string; admNo: string }[] }[] }>();
    for (const r of rows) {
      const entry = byClass.get(r.classId) ?? { classLabel: r.classLabel, tables: [] };
      entry.tables.push({ tableNo: r.tableNo, seats: r.seats, students: JSON.parse(r.studentsJson) });
      byClass.set(r.classId, entry);
    }
    return {
      session,
      tableSize: tenant?.cafeteriaTableSize ?? 8,
      totalTables: rows.length,
      totalSeated: rows.reduce((n, r) => n + (JSON.parse(r.studentsJson) as unknown[]).length, 0),
      classes: Array.from(byClass.values()),
    };
  });
}

/** Clear the seating plan for a session. */
export async function clearCafeteriaTables(user: SessionUser, session: Session) {
  return withTenant(user.tenantId, async () => {
    const res = await db.cafeteriaTable.deleteMany({ where: { tenantId: user.tenantId, session } });
    await audit(user, "cafeteria.tables_cleared", "tenant", user.tenantId, { session, removed: res.count });
    return { cleared: res.count };
  });
}

// ---------------------------------------------------------------------------
// I.19 — Cafeteria meal serving queue
// ---------------------------------------------------------------------------

type QueueSession = "BREAKFAST" | "LUNCH" | "SUPPER";

function todayYmd() {
  return new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
}

export async function queueBoard(user: SessionUser, input: { date?: string; session: QueueSession }) {
  return withTenant(user.tenantId, async () => {
    const date = input.date || todayYmd();
    const rows = await tenantDb().cafeteriaQueueEntry.findMany({
      where: { date, session: input.session },
      orderBy: [{ queueNo: "asc" }],
    });
    return {
      date,
      session: input.session,
      waiting: rows.filter((r) => r.status === "WAITING").length,
      served: rows.filter((r) => r.status === "SERVED").length,
      cancelled: rows.filter((r) => r.status === "CANCELLED").length,
      rows: rows.map((r) => ({
        id: r.id,
        queueNo: r.queueNo,
        studentId: r.studentId,
        studentName: r.studentName,
        admissionNo: r.admissionNo,
        classLabel: r.classLabel,
        status: r.status,
        joinedAt: r.joinedAt,
        servedAt: r.servedAt,
        servedByName: r.servedByName,
      })),
    };
  });
}

export async function joinMealQueue(user: SessionUser, input: { studentId: string; date?: string; session: QueueSession }) {
  return withTenant(user.tenantId, async () => {
    const date = input.date || todayYmd();
    const student = await tenantDb().student.findFirst({
      where: { id: input.studentId, status: "ACTIVE", deletedAt: null },
      include: { schoolClass: true },
    });
    if (!student) throw new CafeteriaError("NOT_FOUND", "Student not found or inactive.");

    const existing = await tenantDb().cafeteriaQueueEntry.findFirst({
      where: { date, session: input.session, studentId: student.id },
    });
    if (existing) throw new CafeteriaError("ALREADY", `${fullName(student)} is already in the ${input.session.toLowerCase()} queue.`);

    const last = await tenantDb().cafeteriaQueueEntry.findFirst({
      where: { date, session: input.session },
      orderBy: { queueNo: "desc" },
      select: { queueNo: true },
    });
    const queueNo = (last?.queueNo ?? 0) + 1;
    const row = await db.cafeteriaQueueEntry.create({
      data: {
        tenantId: user.tenantId,
        date,
        session: input.session,
        queueNo,
        studentId: student.id,
        studentName: fullName(student),
        admissionNo: student.admissionNo,
        classLabel: student.schoolClass ? classLabelOf(student.schoolClass) : null,
      },
    });
    await audit(user, "cafeteria.queue_joined", "cafeteriaQueueEntry", row.id, { queueNo, session: input.session, date });
    return row;
  });
}

export async function serveMealQueue(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    const row = await tenantDb().cafeteriaQueueEntry.findUnique({ where: { id } });
    if (!row) throw new CafeteriaError("NOT_FOUND", "Queue entry not found.");
    if (row.status !== "WAITING") throw new CafeteriaError("ALREADY", "This learner is no longer waiting in the queue.");
    const updated = await tenantDb().cafeteriaQueueEntry.update({
      where: { id },
      data: { status: "SERVED", servedAt: new Date(), servedById: user.id, servedByName: user.fullName } as never,
    });
    await audit(user, "cafeteria.queue_served", "cafeteriaQueueEntry", id, { queueNo: row.queueNo, session: row.session, date: row.date });
    return updated;
  });
}

export async function cancelMealQueue(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    const row = await tenantDb().cafeteriaQueueEntry.findUnique({ where: { id } });
    if (!row) throw new CafeteriaError("NOT_FOUND", "Queue entry not found.");
    if (row.status !== "WAITING") throw new CafeteriaError("ALREADY", "This learner is no longer waiting in the queue.");
    const updated = await tenantDb().cafeteriaQueueEntry.update({ where: { id }, data: { status: "CANCELLED" } as never });
    await audit(user, "cafeteria.queue_cancelled", "cafeteriaQueueEntry", id, { queueNo: row.queueNo, session: row.session, date: row.date });
    return updated;
  });
}
