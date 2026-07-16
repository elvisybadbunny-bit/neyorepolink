// DD.10 (continued) — real regression test for the founder's own further
// request beyond a single grade: "if the whole school got the same
// method it renders whole school" and "if a group has a certain same eg
// grade 1-3 it renders that to avoid repeating each every time" — while
// genuinely different real school sections (e.g. Pre-Primary vs Senior
// Secondary) can keep their own real different setup.
//
// Confirmed via ask_user: auto-detected agreement (no manual group
// naming yet) is the chosen approach. This proves:
//  1. getTimetableConfigAgreementForWholeSchool() honestly reports
//     agrees=true only when EVERY real active grade's own TimetableConfig
//     genuinely matches.
//  2. getTimetableConfigContiguousGroups() correctly detects a real
//     contiguous run of 2+ grades that agree with EACH OTHER while
//     genuinely differing from the rest of the school -- and never
//     reports that same run as a "whole school" group.
//  3. saveTimetableConfigForLevels() writes identically to every real
//     class across every given real level in one action.
//  4. Cross-tenant isolation.
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import { saveTimetableConfig, getTimetableConfigAgreementForWholeSchool, getTimetableConfigContiguousGroups, saveTimetableConfigForLevels } from "../src/lib/services/timetable-solver.service";
import { generateNeyoLoginId } from "../src/lib/services/identity.service";

const SLUG = "dd10-whole-school-group-test";
let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAILED: ${label}`); failed++; }
}

async function main() {
  let tenant = await db.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) {
    tenant = await db.tenant.create({ data: { name: "DD.10 Whole School Group Test", slug: SLUG, curriculum: "CBC" } as any });
  }
  const t = tenant;

  let principal = await db.user.findFirst({ where: { tenantId: t.id, role: "PRINCIPAL" } });
  if (!principal) {
    principal = await db.user.create({
      data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "dd10ws-principal@test.local", fullName: "Test Principal", role: "PRINCIPAL", isActive: true } as any,
    });
  }
  const user = { id: principal.id, tenantId: t.id, role: principal.role, fullName: principal.fullName } as any;

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.timetableConfig.deleteMany({});
    await tdb.schoolClass.deleteMany({});
  });

  // Real 5-grade school: Grade1/2/3 (Lower Primary, all sharing the SAME
  // real config), Grade4 (Upper Primary, genuinely DIFFERENT config),
  // Grade5 (Senior, genuinely DIFFERENT again).
  const g1 = await db.schoolClass.create({ data: { tenantId: t.id, level: "DD10WS-Grade1", stream: "A", curriculum: "CBC", capacity: 30 } });
  const g2 = await db.schoolClass.create({ data: { tenantId: t.id, level: "DD10WS-Grade2", stream: "A", curriculum: "CBC", capacity: 30 } });
  const g3 = await db.schoolClass.create({ data: { tenantId: t.id, level: "DD10WS-Grade3", stream: "A", curriculum: "CBC", capacity: 30 } });
  const g4 = await db.schoolClass.create({ data: { tenantId: t.id, level: "DD10WS-Grade4", stream: "A", curriculum: "CBC", capacity: 30 } });
  const g5 = await db.schoolClass.create({ data: { tenantId: t.id, level: "DD10WS-Grade5", stream: "A", curriculum: "CBC", capacity: 30 } });

  const lowerPrimaryConfig = {
    periodsPerDay: 6, lessonDurationMins: 30, schoolDayStartTime: "08:00",
    shortBreakStart: 2, shortBreakMins: 15, longBreakStart: 0, longBreakMins: 0,
    lunchStart: 4, lunchMins: 40, hasSaturday: false, freePeriodsPerWeek: 0,
    coCurricularCount: 0, coCurricularName: "Games",
  } as any;
  const upperPrimaryConfig = {
    periodsPerDay: 8, lessonDurationMins: 35, schoolDayStartTime: "08:00",
    shortBreakStart: 2, shortBreakMins: 15, longBreakStart: 4, longBreakMins: 20,
    lunchStart: 6, lunchMins: 45, hasSaturday: false, freePeriodsPerWeek: 0,
    coCurricularCount: 0, coCurricularName: "Games",
  } as any;
  const seniorConfig = {
    periodsPerDay: 10, lessonDurationMins: 40, schoolDayStartTime: "07:30",
    shortBreakStart: 3, shortBreakMins: 10, longBreakStart: 6, longBreakMins: 30,
    lunchStart: 8, lunchMins: 50, hasSaturday: true, saturdayPeriodsCount: 4, saturdayStartTime: "08:00", saturdayEndTime: "12:00", freePeriodsPerWeek: 0,
    coCurricularCount: 0, coCurricularName: "Games",
  } as any;

  await saveTimetableConfig(user, { ...lowerPrimaryConfig, classId: g1.id });
  await saveTimetableConfig(user, { ...lowerPrimaryConfig, classId: g2.id });
  await saveTimetableConfig(user, { ...lowerPrimaryConfig, classId: g3.id });
  await saveTimetableConfig(user, { ...upperPrimaryConfig, classId: g4.id });
  await saveTimetableConfig(user, { ...seniorConfig, classId: g5.id });

  // 1. Whole-school agreement must be FALSE (genuinely 3 different real configs across 5 grades).
  const wholeSchool = await getTimetableConfigAgreementForWholeSchool(user);
  check("1. Whole-school agreement is honestly FALSE when real grades genuinely differ", wholeSchool.agrees === false);
  check("1b. Whole-school check reports all 5 real levels in the school's own natural order", wholeSchool.levels.length === 5 && wholeSchool.levels[0] === "DD10WS-Grade1" && wholeSchool.levels[4] === "DD10WS-Grade5");

  // 2. Contiguous groups: Grade1-2-3 should be detected as a real group (3 grades sharing the SAME config).
  const groups = await getTimetableConfigContiguousGroups(user);
  const lowerGroup = groups.groups.find((g) => g.levels.includes("DD10WS-Grade1"));
  check("2. CRITICAL: Grade1-2-3 correctly detected as one real contiguous group (they genuinely agree with each other)", !!lowerGroup && lowerGroup.levels.length === 3 && lowerGroup.levels.join(",") === "DD10WS-Grade1,DD10WS-Grade2,DD10WS-Grade3");
  check("3. CRITICAL: Grade4 (Upper Primary) is NOT included in the Lower Primary group -- it genuinely has its own different real config", !lowerGroup?.levels.includes("DD10WS-Grade4"));
  check("4. CRITICAL: Grade5 (Senior) is NOT included in any group with Grade1-4 -- it genuinely has its own different real config, own real different teachers/structure", !groups.groups.some((g) => g.levels.includes("DD10WS-Grade5") && g.levels.some((l) => l !== "DD10WS-Grade5")));

  // 3. Real whole-grade-group save: apply a NEW shared config to Grade1-2-3 as one action.
  const newSharedConfig = {
    periodsPerDay: 7, lessonDurationMins: 32, schoolDayStartTime: "08:15",
    shortBreakStart: 2, shortBreakMins: 12, longBreakStart: 0, longBreakMins: 0,
    lunchStart: 5, lunchMins: 42, hasSaturday: false, freePeriodsPerWeek: 0,
    coCurricularCount: 0, coCurricularName: "Games",
  };
  const saveResult = await saveTimetableConfigForLevels(user, ["DD10WS-Grade1", "DD10WS-Grade2", "DD10WS-Grade3"], newSharedConfig as any);
  check("5. saveTimetableConfigForLevels() reports all 3 real classes updated", saveResult.updatedCount === 3);

  const updatedConfigs = await withTenant(t.id, () => tenantDb().timetableConfig.findMany({ where: { classId: { in: [g1.id, g2.id, g3.id] } } }));
  check("6. CRITICAL: every real class in the group genuinely got the new shared periodsPerDay", updatedConfigs.every((c) => c.periodsPerDay === 7));
  check("6b. CRITICAL: every real class in the group genuinely got the new shared lessonDurationMins", updatedConfigs.every((c) => c.lessonDurationMins === 32));

  // Grade4/5 must be completely untouched by the group save.
  const g4Config = await withTenant(t.id, () => tenantDb().timetableConfig.findFirst({ where: { classId: g4.id } }));
  check("7. CRITICAL: Grade4's own real config is completely untouched by the Grade1-3 group save", g4Config?.periodsPerDay === 8 && g4Config?.lessonDurationMins === 35);

  // 4. Cross-tenant isolation: a second dedicated tenant with a class of
  // the SAME real level NAME must never be counted in this tenant's own
  // whole-school/group computations.
  const OTHER_SLUG = "dd10-whole-school-group-test-other";
  let otherTenant = await db.tenant.findUnique({ where: { slug: OTHER_SLUG } });
  if (!otherTenant) {
    otherTenant = await db.tenant.create({ data: { name: "DD.10 Other Tenant", slug: OTHER_SLUG, curriculum: "CBC" } as any });
  }
  await withTenant(otherTenant.id, async () => {
    const tdb = tenantDb();
    await tdb.timetableConfig.deleteMany({});
    await tdb.schoolClass.deleteMany({});
  });
  const otherClass = await db.schoolClass.create({ data: { tenantId: otherTenant.id, level: "DD10WS-Grade1", stream: "Z", curriculum: "CBC", capacity: 30 } });
  await saveTimetableConfig({ id: principal.id, tenantId: otherTenant.id, role: "PRINCIPAL", fullName: "Other" } as any, { ...seniorConfig, classId: otherClass.id });

  const wholeSchoolAfterOther = await getTimetableConfigAgreementForWholeSchool(user);
  check("8. CRITICAL: cross-tenant isolation -- another tenant's own real class with the SAME level name never leaks into this tenant's own whole-school computation", wholeSchoolAfterOther.levels.length === 5);

  await withTenant(otherTenant.id, async () => {
    const tdb = tenantDb();
    await tdb.timetableConfig.deleteMany({});
    await tdb.schoolClass.deleteMany({});
  });
  await db.tenant.delete({ where: { id: otherTenant.id } });

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.timetableConfig.deleteMany({});
    await tdb.schoolClass.deleteMany({});
  });
  await db.user.deleteMany({ where: { tenantId: t.id } });
  await db.tenant.delete({ where: { id: t.id } });
  console.log("All DD.10 whole-school/group test fixtures cleaned up (dedicated tenant fully removed).");

  console.log(`\n  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("  \u274c DD.10 whole-school/contiguous-group config has a regression");
    process.exit(1);
  }
  console.log("  \u2705 DD.10 whole-school/contiguous-group config all green");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
