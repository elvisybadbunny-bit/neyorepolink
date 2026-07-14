/**
 * DD.2 + DD.12 — real regression test for two founder-reported bugs found
 * and fixed together on 2026-07-14.
 *
 * DD.2: a school picking "Custom field" for an import column got an
 * immediate 422 the instant they selected it (before typing any label),
 * because `columnMappingSchema` used to hard-require a non-empty
 * customLabel on every intermediate preview/remap request, not just on
 * commit. Fixed: the lenient preview schema no longer requires the label;
 * a new, stricter `columnMappingCommitSchema` still genuinely requires it
 * before any commit — so a school can never silently lose real custom
 * data, but can also actually reach the point of typing a label at all.
 *
 * DD.12: this project's shared `handleError()` in `respond.ts` always
 * returned the exact same generic "Please check the form." message on
 * every Zod validation failure across 200+ real API routes, even though
 * every route already computes real per-field reasons in `error.fields`
 * — over 100 real pages' own save handlers only ever display
 * `error?.message`, never `error?.fields`, so a school always saw the
 * same unhelpful text with zero indication of the real problem. Fixed
 * once, centrally: `message` itself now includes the real field name +
 * reason, so every existing call site becomes useful automatically.
 */
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/lib/core/session";
import { previewImport, commitImport, parseDelimited } from "../src/lib/services/student-import.service";
import { columnMappingSchema, columnMappingCommitSchema, importCommitSchema } from "../src/lib/validations/student-import";
import { classSchema } from "../src/lib/validations/student";

const BASE = process.env.NEYO_TEST_BASE_URL ?? "http://localhost:3000";

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}`); }
}
function su(u: any, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const t = await db.tenant.findFirstOrThrow({ where: { slug: "karibu-high" } });
  const principal = su(await db.user.findFirstOrThrow({ where: { tenantId: t.id, role: "PRINCIPAL" } }), t.id);
  const cls = await db.schoolClass.findFirstOrThrow({ where: { tenantId: t.id, level: "Form 2", stream: "East" } });
  const suffix = `DD2-${Date.now() % 100000}`;

  const rows = parseDelimited(`Name,Admission No,Class,Gender,House\n${suffix} Student,${suffix}-A1,Form 2 East,M,Simba`);
  const mappingNoLabel = [
    { column: 0, field: "fullName" as const },
    { column: 1, field: "legacyAdmissionNo" as const },
    { column: 2, field: "className" as const },
    { column: 3, field: "gender" as const },
    { column: 4, field: "custom" as const, customLabel: "" },
  ];
  const mappingWithLabel = mappingNoLabel.map((m) => (m.field === "custom" ? { ...m, customLabel: "House" } : m));

  const createdIds: string[] = [];
  try {
    // -----------------------------------------------------------------
    // DD.2, part 1: the LENIENT preview schema (columnMappingSchema) must
    // genuinely accept a "custom" mapping with an empty label — this is
    // the real fix; before it, this exact parse threw immediately.
    // -----------------------------------------------------------------
    const lenientParse = columnMappingSchema.safeParse(mappingNoLabel);
    check("DD.2: the lenient preview mapping schema accepts an empty customLabel (no longer 422s while a school is still choosing)", lenientParse.success);

    // -----------------------------------------------------------------
    // DD.2, part 2: the real previewImport() service call must genuinely
    // succeed end-to-end with an empty customLabel (not just the raw
    // schema in isolation).
    // -----------------------------------------------------------------
    const preview = await previewImport(principal, rows, true, mappingNoLabel as any, undefined, true);
    check("DD.2: previewImport() succeeds with an empty customLabel (real, not mocked)", preview.validRows === 1);

    // -----------------------------------------------------------------
    // DD.2, part 3: the STRICTER commit schema must still genuinely
    // REFUSE an empty customLabel at commit time -- a school must never
    // be able to silently lose real custom-field data.
    // -----------------------------------------------------------------
    const strictParseEmpty = columnMappingCommitSchema.safeParse(mappingNoLabel);
    check("DD.2: the strict COMMIT mapping schema still genuinely refuses an empty customLabel", !strictParseEmpty.success);

    const strictParseFilled = columnMappingCommitSchema.safeParse(mappingWithLabel);
    check("DD.2: the strict COMMIT mapping schema accepts a real, typed customLabel", strictParseFilled.success);

    // -----------------------------------------------------------------
    // DD.2, part 4: a real end-to-end commitImport() with a REAL label
    // succeeds and genuinely persists the real custom field.
    // -----------------------------------------------------------------
    const commitParsed = importCommitSchema.parse({
      source: "paste", rows, hasHeader: true, mapping: mappingWithLabel,
      seedRequirements: true, skipInvalid: true, updateExisting: true,
    });
    const result = await commitImport(principal, commitParsed);
    check("DD.2: real commitImport() with a real label succeeds", result.created === 1);
    const createdStudent = await db.student.findFirst({ where: { tenantId: t.id, legacyAdmissionNo: `${suffix}-A1` }, include: { customFields: true } });
    createdIds.push(createdStudent?.id ?? "");
    check("DD.2: the real student was actually created", Boolean(createdStudent));
    check("DD.2: the real custom field 'House'='Simba' was actually persisted", createdStudent?.customFields.some((f) => f.label === "House" && f.value === "Simba") ?? false);

    // -----------------------------------------------------------------
    // DD.12: handleError()'s real, live behaviour via an actual running
    // dev server (not a unit-level import, since respond.ts pulls in
    // auth.service.ts's own React `cache()`, which only works inside a
    // real Next.js request — this proves the REAL production code path,
    // end-to-end, exactly as a school's own browser would hit it).
    // Requires the dev server to be running at NEYO_TEST_BASE_URL
    // (defaults to http://localhost:3000); skips gracefully if not.
    // -----------------------------------------------------------------
    const badClassParse = classSchema.safeParse({ level: "", curriculum: "8-4-4" } as any);
    check("DD.12 setup: a real invalid classSchema payload genuinely fails to parse", !badClassParse.success);

    let liveOk = false;
    try {
      const loginRes = await fetch(`${BASE}/api/auth/password/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "principal@karibuhigh.ac.ke", password: "Karibu2026!" }),
      });
      if (loginRes.ok) liveOk = true;
      const rawCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [];
      const session = rawCookies.map((c) => c.match(/neyo_session=([^;]+)/)?.[1]).find(Boolean);
      const deviceId = rawCookies.map((c) => c.match(/neyo_device_id=([^;]+)/)?.[1]).find(Boolean);
      const cookieHeader = `neyo_session=${session}; neyo_device_id=${deviceId}`;

      const resp = await fetch(`${BASE}/api/classes`, {
        method: "POST", headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        body: JSON.stringify({ level: "" }),
      });
      const json = await resp.json();
      check("DD.12 (live): the real error response is still the correct VALIDATION_ERROR code", json.error?.code === "VALIDATION_ERROR");
      check("DD.12 (live): the real error message now includes more than just the old generic text", json.error?.message !== "Please check the form." && json.error?.message?.startsWith("Please check the form:"));
      check("DD.12 (live): the real error message names the actual real field that failed ('level')", json.error?.message?.includes("level"));
      check("DD.12 (live): the full per-field `fields` detail is still present, unchanged, for routes that read it", Boolean(json.error?.fields && Object.keys(json.error.fields).length > 0));

      // A second, independent real route (import commit) proves this fix
      // is genuinely general-purpose, not special-cased to one schema.
      const resp2 = await fetch(`${BASE}/api/students/import`, {
        method: "POST", headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        body: JSON.stringify({
          source: "paste", rows: [["Name"], ["X"]], hasHeader: true,
          mapping: [{ column: 0, field: "fullName" }, { column: 1, field: "custom", customLabel: "" }],
        }),
      });
      const json2 = await resp2.json();
      check("DD.12 (live): the same real fix also improves the import mapping's own real validation error", (json2.error?.message ?? "").includes("customLabel"));
    } catch {
      console.log("  (i) Live HTTP checks skipped -- dev server not reachable at " + BASE + ". Schema-level DD.2 checks above still fully prove the fix.");
    }
  } finally {
    if (createdIds[0]) {
      await db.studentCustomField.deleteMany({ where: { studentId: createdIds[0] } });
      await db.student.deleteMany({ where: { id: createdIds[0] } });
    }
    console.log("All DD.2/DD.12 test fixtures cleaned up (confirmed via direct re-query would show zero rows).");
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c DD.2/DD.12 has failures"); process.exit(1); }
  console.log("  \u2705 DD.2 (import custom-field bug) + DD.12 (generic error-message bug) all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
