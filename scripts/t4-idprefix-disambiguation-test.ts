/**
 * T.4 — Duplicate Human-Readable School ID Prefix Auto-Disambiguation.
 * Real, live tests using the founder's own cited example — two genuinely
 * different real school names ("Kahawa High School" / "Kirinyaga High
 * School") whose slugs compute the IDENTICAL literal prefix "KHS" — proving
 * the second (and third) real school sharing that prefix is auto-
 * disambiguated ("KHS2", "KHS3", ...), while every EXISTING, already-live
 * tenant's real prefix is never recomputed or changed.
 */
import { db } from "../src/lib/db";
import { computeUniqueIdPrefix, nextTenantId, peekNextTenantId, backfillIdPrefixes } from "../src/lib/services/identity.service";
import { prefixFromSlug } from "../src/lib/core/identity";

let passed = 0, failed = 0;
function assert(cond: boolean, label: string) {
  if (cond) { console.log(`  ✓ ${label}`); passed++; }
  else { console.log(`  ✗ FAIL: ${label}`); failed++; }
}

async function main() {
  // 1) Confirm the real collision the founder described actually exists at
  // the raw computation level, before testing the fix on top of it.
  const base1 = prefixFromSlug("kahawa-high-school");
  const base2 = prefixFromSlug("kirinyaga-high-school");
  assert(base1 === "KHS" && base2 === "KHS", `both real school names independently compute the identical literal base prefix "KHS" (got ${base1} / ${base2})`);

  // Snapshot every real pre-existing tenant's idPrefix BEFORE this test
  // touches anything, so we can prove none of them are ever altered.
  const before = await db.tenant.findMany({ select: { id: true, idPrefix: true } });
  const beforeMap = new Map(before.map((t) => [t.id, t.idPrefix]));

  const realSlug1 = `kahawa-high-school-t4-${Date.now()}-a`;
  const realSlug2 = `kirinyaga-high-school-t4-${Date.now()}-b`;
  const realSlug3 = `kahawa-high-school-t4-${Date.now()}-c`; // a genuine third real school, same base prefix

  // 2) The FIRST real school to ever claim "KHS" gets it exactly, unmodified.
  const kahawaPrefix = await computeUniqueIdPrefix("kahawa-high-school");
  assert(kahawaPrefix === "KHS", `the first real school computing "KHS" gets it exactly (got ${kahawaPrefix})`);
  const kahawaTenant = await db.tenant.create({ data: { name: "Kahawa High School (T4 test)", slug: realSlug1, idPrefix: kahawaPrefix } });

  // 3) The SECOND real school with the same base prefix is auto-disambiguated to "KHS2".
  const kirinyagaPrefix = await computeUniqueIdPrefix("kirinyaga-high-school");
  assert(kirinyagaPrefix === "KHS2", `the second real school sharing "KHS" is auto-disambiguated to "KHS2" (got ${kirinyagaPrefix})`);
  const kirinyagaTenant = await db.tenant.create({ data: { name: "Kirinyaga High School (T4 test)", slug: realSlug2, idPrefix: kirinyagaPrefix } });

  // 4) A real THIRD school sharing the same base prefix skips to "KHS3"
  // (both KHS and KHS2 are now genuinely taken).
  const thirdPrefix = await computeUniqueIdPrefix("kahawa-high-school");
  assert(thirdPrefix === "KHS3", `a real third school sharing the base prefix skips to "KHS3" (got ${thirdPrefix})`);
  const thirdTenant = await db.tenant.create({ data: { name: "Kahawa High School Annex (T4 test)", slug: realSlug3, idPrefix: thirdPrefix } });

  // 5) Real end-to-end proof: nextTenantId()/peekNextTenantId() use each
  // real tenant's OWN stored, disambiguated idPrefix — never a live
  // recomputation, and never colliding with another school's real IDs.
  const kahawaStudentId = await nextTenantId(kahawaTenant.id, "STUDENT");
  const kirinyagaStudentId = await nextTenantId(kirinyagaTenant.id, "STUDENT");
  const thirdStudentId = await nextTenantId(thirdTenant.id, "STUDENT");
  assert(kahawaStudentId === "KHSS1", `Kahawa's real first student ID uses its own real "KHS" prefix (got ${kahawaStudentId})`);
  assert(kirinyagaStudentId === "KHS2S1", `Kirinyaga's real first student ID uses its own real, disambiguated "KHS2" prefix (got ${kirinyagaStudentId})`);
  assert(thirdStudentId === "KHS3S1", `the third school's real first student ID uses its own real, disambiguated "KHS3" prefix (got ${thirdStudentId})`);
  assert(new Set([kahawaStudentId, kirinyagaStudentId, thirdStudentId]).size === 3, "all three real schools' first student IDs are genuinely distinct human-readable strings");

  const peeked = await peekNextTenantId(kirinyagaTenant.id, "STUDENT");
  assert(peeked === "KHS2S2", `peekNextTenantId() also honors the real stored disambiguated prefix (got ${peeked})`);

  // 6) CRITICAL: every real, PRE-EXISTING, already-live tenant's idPrefix
  // must be byte-identical to before this test ran — never recomputed.
  const after = await db.tenant.findMany({ where: { id: { in: before.map((t) => t.id) } }, select: { id: true, idPrefix: true } });
  const allUnchanged = after.every((t) => beforeMap.get(t.id) === t.idPrefix);
  assert(allUnchanged, "every real pre-existing tenant's idPrefix is byte-identical to before this test ran (never recomputed/changed)");

  // 7) backfillIdPrefixes() is a genuine no-op once every real tenant already has one.
  const rebackfill = await backfillIdPrefixes();
  assert(rebackfill.backfilled === 0, `re-running the real backfill finds 0 tenants needing it (got ${rebackfill.backfilled})`);

  // Cleanup — full removal, confirmed via direct DB re-query.
  const testTenantIds = [kahawaTenant.id, kirinyagaTenant.id, thirdTenant.id];
  await db.idSequence.deleteMany({ where: { tenantId: { in: testTenantIds } } });
  await db.tenant.deleteMany({ where: { id: { in: testTenantIds } } });

  const remaining = await db.tenant.count({ where: { id: { in: testTenantIds } } });
  console.log(`\nCleanup done. Remaining test tenants: ${remaining} (expected 0).`);
  assert(remaining === 0, "full cleanup confirmed via direct DB re-query");

  console.log("\n----------------------------------------");
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  ✅ all green" : "  ❌ FAILURES ABOVE");
  if (failed > 0) process.exitCode = 1;
}

main().then(() => process.exit(process.exitCode ?? 0)).catch((e) => { console.error(e); process.exit(1); });
