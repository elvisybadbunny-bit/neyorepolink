/**
 * PART EE.15 — Universal CBC/CBE Presets Engine (`EE.15`).
 *
 * "Where the schools never need to type in adding they just add the presets."
 * 1-Click universal application of:
 * 1. 7 Universal KICD Core Competencies (`J.4`).
 * 2. Official KICD 4-Point Formative Rubrics (`J.5` / `EE, ME, AE, BE`).
 * 3. Official KICD Core Values & Student Leadership Duty Areas (`StudentDutyArea`).
 *
 * Strictly idempotent (`0 duplicates on re-run`).
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import {
  KICD_UNIVERSAL_COMPETENCIES,
  KICD_4POINT_RUBRICS,
  KICD_CORE_VALUES_AND_DUTIES,
} from "@/lib/data/universal-presets-data";

export {
  KICD_UNIVERSAL_COMPETENCIES,
  KICD_4POINT_RUBRICS,
  KICD_CORE_VALUES_AND_DUTIES,
};

export class UniversalPresetError extends Error {
  constructor(public code: "FORBIDDEN" | "INVALID", message: string) {
    super(message);
    this.name = "UniversalPresetError";
  }
}

export const KICD_8POINT_RUBRICS = [
  {
    name: "High Exceeding Expectations (`EE+` — 8 Points)",
    code: "EE+-8",
    points: 8.0,
    level: 8,
    description: "Learner demonstrates exceptional mastery, innovation, complex problem solving, and synthesizes concepts autonomously across domains (90%-100%).",
  },
  {
    name: "Exceeding Expectations (`EE` — 7 Points)",
    code: "EE-7",
    points: 7.0,
    level: 7,
    description: "Learner demonstrates consistent advanced mastery, original execution, and thorough analytical depth (80%-89%).",
  },
  {
    name: "High Meeting Expectations (`ME+` — 6 Points)",
    code: "ME+-6",
    points: 6.0,
    level: 6,
    description: "Learner accurately completes required tasks with high precision and solid conceptual grasp (70%-79%).",
  },
  {
    name: "Meeting Expectations (`ME` — 5 Points)",
    code: "ME-5",
    points: 5.0,
    level: 5,
    description: "Learner reliably achieves curriculum learning outcomes and performs core tasks without error (60%-69%).",
  },
  {
    name: "High Approaching Expectations (`AE+` — 4 Points)",
    code: "AE+-4",
    points: 4.0,
    level: 4,
    description: "Learner grasps core principles but occasionally requires minor teacher hints or peer scaffolds (50%-59%).",
  },
  {
    name: "Approaching Expectations (`AE` — 3 Points)",
    code: "AE-3",
    points: 3.0,
    level: 3,
    description: "Learner understands basic concepts but requires structured step-by-step guidance to complete tasks (40%-49%).",
  },
  {
    name: "High Below Expectations (`BE+` — 2 Points)",
    code: "BE+-2",
    points: 2.0,
    level: 2,
    description: "Learner exhibits partial awareness but struggles with basic execution, needing frequent remedial assistance (30%-39%).",
  },
  {
    name: "Below Expectations (`BE` — 1 Point)",
    code: "BE-1",
    points: 1.0,
    level: 1,
    description: "Learner requires intensive 1-on-1 remedial intervention and foundational remediation to perform basic tasks (0%-29%).",
  },
];

export async function applyUniversalCbcPresets(user: SessionUser, presetType: "COMPETENCIES" | "RUBRICS" | "RUBRICS_8POINT" | "VALUES_DUTIES" | "ALL") {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    let addedCount = 0;
    let skippedCount = 0;

    if (presetType === "COMPETENCIES" || presetType === "ALL") {
      let group = await tdb.competencyGroup.findFirst({ where: { name: { contains: "Core KICD Competencies" } } });
      if (!group) {
        group = await tdb.competencyGroup.create({
          data: { tenantId: user.tenantId, code: "KICD-7-COMP", name: "7 Universal Core KICD Competencies (`EE.15`)", description: "Official national competency framework." } as never,
        });
      }

      for (const comp of KICD_UNIVERSAL_COMPETENCIES) {
        const exists = await tdb.competency.findFirst({ where: { groupId: group.id, name: { equals: comp.name, mode: "insensitive" } } });
        if (exists) { skippedCount++; continue; }
        await tdb.competency.create({
          data: {
            tenantId: user.tenantId,
            groupId: group.id,
            code: comp.code,
            name: comp.name,
            description: comp.description,
          } as never,
        });
        addedCount++;
      }
    }

    if (presetType === "RUBRICS" || presetType === "ALL") {
      for (const rub of KICD_4POINT_RUBRICS) {
        const exists = await tdb.rubric.findFirst({ where: { name: { equals: rub.name, mode: "insensitive" } } });
        if (exists) { skippedCount++; continue; }
        const created = await tdb.rubric.create({
          data: {
            tenantId: user.tenantId,
            name: rub.name,
            description: rub.description,
            category: "CBC",
            createdById: user.id,
          } as never,
        });
        const lvlNum = rub.code.includes("L4") ? 4 : rub.code.includes("L3") ? 3 : rub.code.includes("L2") ? 2 : 1;
        const codeAbbrev = rub.code.split("-")[0] || "EE";
        await tdb.rubricLevel.create({
          data: {
            tenantId: user.tenantId,
            rubricId: created.id,
            level: lvlNum,
            code: codeAbbrev,
            label: rub.name,
            descriptor: rub.description,
          } as never,
        });
        addedCount++;
      }
    }

    if (presetType === "RUBRICS_8POINT" || presetType === "ALL") {
      for (const rub of KICD_8POINT_RUBRICS) {
        const exists = await tdb.rubric.findFirst({ where: { name: { equals: rub.name, mode: "insensitive" } } });
        if (exists) { skippedCount++; continue; }
        const created = await tdb.rubric.create({
          data: {
            tenantId: user.tenantId,
            name: rub.name,
            description: rub.description,
            category: "COMPETENCY",
            createdById: user.id,
          } as never,
        });
        const codeAbbrev = rub.code.split("-")[0] || "ME";
        await tdb.rubricLevel.create({
          data: {
            tenantId: user.tenantId,
            rubricId: created.id,
            level: rub.level,
            code: codeAbbrev,
            label: rub.name,
            descriptor: rub.description,
            points: rub.points,
          } as never,
        });
        addedCount++;
      }
    }

    if (presetType === "VALUES_DUTIES" || presetType === "ALL") {
      for (const val of KICD_CORE_VALUES_AND_DUTIES) {
        const exists = await tdb.studentDutyArea.findFirst({ where: { name: { equals: val.name, mode: "insensitive" } } });
        if (exists) { skippedCount++; continue; }
        await tdb.studentDutyArea.create({
          data: {
            tenantId: user.tenantId,
            name: val.name,
            description: `[${val.category}] ${val.description}`,
          } as never,
        });
        addedCount++;
      }
    }

    await db.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.id,
        actorName: user.fullName,
        action: "cbc.universal_presets_applied",
        entityType: "universalPreset",
        entityId: presetType,
        metadata: JSON.stringify({ presetType, addedCount, skippedCount }),
      },
    });

    return { addedCount, skippedCount, presetType };
  });
}
