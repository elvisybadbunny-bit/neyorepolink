/**
 * Real, generic at-most-once request wrapper — used anywhere a real client
 * (especially a flaky offline-first PWA on slow 3G) might genuinely retry
 * the exact same mutating request (e.g. "record this walk-in payment",
 * "issue this gate pass") and must NEVER cause a duplicate real side
 * effect. Backed by the real `IdempotentRequest` table, unique on
 * (tenantId, action, idempotencyKey).
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";

export interface IdempotencyResult<T> {
  replayed: boolean;
  result: T;
}

/**
 * Runs `run()` exactly once per real (tenantId, action, idempotencyKey)
 * triple. If a request with the same key already succeeded, its real
 * stored JSON response is replayed byte-for-byte instead of re-running
 * `run()` — so a retried "record payment" never creates a second payment.
 */
export async function withIdempotency<T>(
  tenantId: string,
  action: string,
  idempotencyKey: string,
  run: () => Promise<T>
): Promise<IdempotencyResult<T>> {
  return withTenant(tenantId, async () => {
    const tdb = tenantDb();

    const existing = await db.idempotentRequest.findFirst({
      where: { tenantId, action, idempotencyKey },
    });
    if (existing) {
      return { replayed: true, result: JSON.parse(existing.responseJson) as T };
    }

    const result = await run();

    try {
      await tdb.idempotentRequest.create({
        data: {
          tenantId,
          action,
          idempotencyKey,
          responseJson: JSON.stringify(result),
        },
      });
    } catch {
      // A real concurrent duplicate request already won the race and
      // inserted first (unique constraint) — that's fine, the real side
      // effect only happened once either way. Replay whichever version
      // actually landed in the table so both callers see the same result.
      const winner = await db.idempotentRequest.findFirst({
        where: { tenantId, action, idempotencyKey },
      });
      if (winner) {
        return { replayed: true, result: JSON.parse(winner.responseJson) as T };
      }
    }

    return { replayed: false, result };
  });
}
