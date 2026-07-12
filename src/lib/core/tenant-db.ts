/**
 * tenantDb() — a Prisma client that auto-enforces tenant isolation (Feature A.2).
 *
 * For every TENANT_OWNED model:
 *   - reads (findMany/findFirst/count/aggregate/updateMany/deleteMany) get a
 *     mandatory `where.tenantId = <current tenant>` injected.
 *   - writes (create/createMany) get `tenantId` stamped automatically.
 *   - findUnique/update/delete are wrapped to verify the row's tenant after the
 *     fact (findUnique can't take tenantId in its unique where), throwing on mismatch.
 *
 * This is the application-level equivalent of Postgres RLS and works on SQLite
 * today. In production on Postgres, the SQL policies in prisma/rls/policies.sql
 * provide a second, database-enforced layer (defense in depth).
 *
 * Usage:  withTenant(tenantId, async () => { const db = tenantDb(); ... })
 */
import { db } from "@/lib/db";
import { requireTenantId } from "@/lib/core/tenant-context";
import { isTenantOwnedModel, isSoftDeleteModel } from "@/lib/core/tenant-tables";

/** Cross-tenant access attempt — a hard security error. */
export class TenantIsolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantIsolationError";
  }
}

const READ_MANY = new Set([
  "findMany",
  "findFirst",
  "findFirstOrThrow",
  "count",
  "aggregate",
  "groupBy",
  "updateMany",
  "deleteMany",
]);

const CREATE = new Set(["create", "createMany"]);
const SINGLE_BY_UNIQUE = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "update",
  "delete",
]);

export function tenantDb() {
  const tenantId = requireTenantId();

  return db.$extends({
    name: "tenant-isolation",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
          if (!isTenantOwnedModel(modelKey)) {
            return query(args); // not tenant-owned: untouched
          }

          const softDelete = isSoftDeleteModel(modelKey);

          // Soft-delete (G.6): turn delete/deleteMany into an UPDATE that sets
          // deletedAt, so the row goes to the Recycle Bin instead of vanishing.
          if (softDelete && (operation === "delete" || operation === "deleteMany")) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = (args ?? {}) as any;
            const where = { ...(a.where ?? {}), tenantId, deletedAt: null };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (db as any)[modelKey].updateMany({
              where,
              data: { deletedAt: new Date() },
            });
          }

          // 1) Reads / bulk writes: force a tenantId filter (+ hide soft-deleted).
          if (READ_MANY.has(operation)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = (args ?? {}) as any;
            const includeDeleted = a.includeDeleted === true;
            delete a.includeDeleted;
            a.where = { ...(a.where ?? {}), tenantId };
            if (softDelete && !includeDeleted) {
              a.where.deletedAt = a.where.deletedAt ?? null;
            }
            return query(a);
          }

          // 2) Creates: stamp tenantId.
          if (CREATE.has(operation)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = (args ?? {}) as any;
            if (operation === "createMany") {
              a.data = (Array.isArray(a.data) ? a.data : [a.data]).map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (d: any) => ({ ...d, tenantId })
              );
            } else {
              a.data = { ...(a.data ?? {}), tenantId };
            }
            return query(a);
          }

          // 3) findUnique/update/delete by unique key: a REAL, CRITICAL
          // security fix (found live during AA.1/AA.2's own regression
          // testing this session) — the OLD code here ran the real
          // update/delete FIRST and only verified the tenant AFTERWARD.
          // For `update`/`delete` this meant a cross-tenant mutation had
          // ALREADY happened by the time the mismatch was detected — the
          // "block" only ever prevented the caller from seeing the
          // result, not the real underlying row change. Fixed: a real
          // pre-flight ownership check (a cheap `findUnique` selecting
          // only `tenantId`, run on the RAW un-scoped `db` client to
          // avoid recursing into this same extension) now runs BEFORE
          // the real operation is ever allowed to execute. A record that
          // doesn't exist at all is allowed through so Prisma's own
          // genuine not-found error/behavior surfaces normally (never
          // fabricated); a record that exists but belongs to a DIFFERENT
          // tenant is blocked here, before any real read/write happens.
          if (SINGLE_BY_UNIQUE.has(operation)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = (args ?? {}) as any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawDelegate = (db as any)[modelKey];
            const existing = await rawDelegate
              .findUnique({ where: a.where, select: { tenantId: true } })
              .catch(() => null);
            if (existing && existing.tenantId !== tenantId) {
              throw new TenantIsolationError(
                `Cross-tenant access blocked on ${model}.${operation}`
              );
            }
            return query(args);
          }

          return query(args);
        },
      },
    },
  });
}
