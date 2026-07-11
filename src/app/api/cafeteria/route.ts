/**
 * B.19 Cafeteria API.
 * GET  /api/cafeteria — week menu + kitchen stock + meal cards + today's kitchen board
 * GET  /api/cafeteria?feePlans=1 — T.9 real per-level fee plans
 * GET  /api/cafeteria?requests=1 — T.9 real staff view of enrollment requests
 * POST /api/cafeteria {action: setMenu|issueCard|cancelCard|kitchenIssue|setFeePlan|bulkIssue|syncCard|decideEnrollmentRequest|setEnrollmentPolicy}
 * issueCard bills the student's B.7 invoice (founder rule).
 * Permissions: cafeteria.view (read) / cafeteria.manage (write).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { menuEntrySchema, issueCardSchema, kitchenIssueSchema, feePlanSchema, bulkIssueCardsSchema, decideCafeteriaEnrollmentRequestSchema } from "@/lib/validations/cafeteria";
import {
  weekMenu, setMenuEntry, kitchenStock, issueForMeal, listCards, issueCard,
  cancelCard, kitchenToday, allocateCafeteriaTables, tableBoard, clearCafeteriaTables, queueBoard, joinMealQueue, serveMealQueue, cancelMealQueue, cafeteriaPolicy, setCafeteriaPolicy,
  listFeePlans, setFeePlan, bulkIssueCards, syncCardToLiveDefault,
  cafeteriaEnrollmentPolicy, setCafeteriaEnrollmentPolicy, listCafeteriaEnrollmentRequests, decideCafeteriaEnrollmentRequest,
} from "@/lib/services/cafeteria.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("cafeteria.view");
    // H.5 — seating plan board for a session.
    const sp = req.nextUrl.searchParams;
    if (sp.get("tables")) {
      const session = sp.get("session") === "SUPPER" ? "SUPPER" : "LUNCH";
      return ok(await tableBoard(user, session));
    }
    if (sp.get("queue")) {
      const raw = sp.get("session");
      const session = raw === "BREAKFAST" || raw === "SUPPER" ? raw : "LUNCH";
      return ok(await queueBoard(user, { session, date: sp.get("date") || undefined }));
    }
    if (sp.get("feePlans")) return ok({ feePlans: await listFeePlans(user) });
    if (sp.get("requests")) return ok({ requests: await listCafeteriaEnrollmentRequests(user, sp.get("status") || undefined) });
    if (sp.get("enrollmentPolicy")) return ok(await cafeteriaEnrollmentPolicy(user));
    const [menu, stock, cards, today, policy] = await Promise.all([
      weekMenu(user), kitchenStock(user), listCards(user), kitchenToday(user), cafeteriaPolicy(user),
    ]);
    return ok({ menu, stock, cards, today, policy });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("cafeteria.manage");
    const body = await req.json().catch(() => ({}));
    const action = z
      .object({ action: z.enum(["setMenu", "issueCard", "cancelCard", "kitchenIssue", "allocateTables", "clearTables", "joinQueue", "serveQueue", "cancelQueue", "setPolicy", "setFeePlan", "bulkIssue", "syncCard", "decideEnrollmentRequest", "setEnrollmentPolicy"]) })
      .parse(body).action;
    if (action === "setPolicy") {
      const input = z.object({ mealModel: z.enum(["HYBRID", "CARDS_ONLY", "BOARDING_GROUPS", "NO_CARDS"]), mealScope: z.enum(["ALL", "LUNCH", "SUPPER"]) }).parse(body);
      return ok(await setCafeteriaPolicy(user, input));
    }
    if (action === "setMenu") return ok(await setMenuEntry(user, menuEntrySchema.parse(body)));
    if (action === "issueCard") return ok(await issueCard(user, issueCardSchema.parse(body)), 201);
    if (action === "cancelCard") {
      const { cardId } = z.object({ cardId: z.string().min(1) }).parse(body);
      return ok(await cancelCard(user, cardId));
    }
    if (action === "setFeePlan") return ok(await setFeePlan(user, feePlanSchema.parse(body)), 201);
    if (action === "bulkIssue") {
      const input = bulkIssueCardsSchema.parse(body);
      return ok(await bulkIssueCards(user, input.feePlanId, input.followsLiveDefault), 201);
    }
    if (action === "syncCard") {
      const { cardId } = z.object({ cardId: z.string().min(1) }).parse(body);
      return ok(await syncCardToLiveDefault(user, cardId));
    }
    if (action === "setEnrollmentPolicy") {
      const { allow } = z.object({ allow: z.boolean() }).parse(body);
      return ok(await setCafeteriaEnrollmentPolicy(user, allow));
    }
    if (action === "decideEnrollmentRequest") {
      const { requestId, ...rest } = z.object({ requestId: z.string().min(1) }).and(decideCafeteriaEnrollmentRequestSchema).parse(body);
      return ok(await decideCafeteriaEnrollmentRequest(user, requestId, rest));
    }
    if (action === "allocateTables") {
      const { session, tableSize } = z
        .object({ session: z.enum(["LUNCH", "SUPPER"]), tableSize: z.coerce.number().int().min(2).max(50) })
        .parse(body);
      return ok(await allocateCafeteriaTables(user, { session, tableSize }), 201);
    }
    if (action === "clearTables") {
      const { session } = z.object({ session: z.enum(["LUNCH", "SUPPER"]) }).parse(body);
      return ok(await clearCafeteriaTables(user, session));
    }
    if (action === "joinQueue") {
      const input = z.object({ studentId: z.string().min(1), session: z.enum(["BREAKFAST", "LUNCH", "SUPPER"]), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }).parse(body);
      return ok(await joinMealQueue(user, input), 201);
    }
    if (action === "serveQueue") {
      const { id } = z.object({ id: z.string().min(1) }).parse(body);
      return ok(await serveMealQueue(user, id));
    }
    if (action === "cancelQueue") {
      const { id } = z.object({ id: z.string().min(1) }).parse(body);
      return ok(await cancelMealQueue(user, id));
    }
    return ok(await issueForMeal(user, kitchenIssueSchema.parse(body)), 201);
  } catch (e) {
    return handleError(e);
  }
}

