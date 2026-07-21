import { createHash } from "node:crypto";
import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";

export const RANKING_POLICIES = [
  "SHOW_RANKINGS",
  "HIDE_RANKINGS",
  "BANDS_ONLY",
] as const;
export const REPORT_PRINT_MODES = ["COLOUR", "BLACK_AND_WHITE"] as const;
export const REPORT_FORMULA_VERSION = "AVAILABLE_WORK_V1";

export async function getReportPresentationSetting(tenantId: string) {
  return withTenant(tenantId, async () => {
    const row = await tenantDb().reportPresentationSetting.findUnique({
      where: { tenantId },
    });
    return (
      row ?? {
        tenantId,
        rankingPolicy: "SHOW_RANKINGS",
        showFeesOnReport: false,
        comparisonBaseline: "CLASS_MEAN",
        printMode: "COLOUR",
        formulaVersion: REPORT_FORMULA_VERSION,
      }
    );
  });
}

export async function saveReportPresentationSetting(
  tenantId: string,
  input: {
    rankingPolicy: string;
    showFeesOnReport: boolean;
    printMode: string;
  },
) {
  if (
    !RANKING_POLICIES.includes(
      input.rankingPolicy as (typeof RANKING_POLICIES)[number],
    )
  )
    throw new Error("Choose a valid ranking policy.");
  if (
    !REPORT_PRINT_MODES.includes(
      input.printMode as (typeof REPORT_PRINT_MODES)[number],
    )
  )
    throw new Error("Choose colour or black-and-white printing.");
  return withTenant(tenantId, () =>
    tenantDb().reportPresentationSetting.upsert({
      where: { tenantId },
      create: {
        tenantId,
        rankingPolicy: input.rankingPolicy,
        showFeesOnReport: input.showFeesOnReport,
        printMode: input.printMode,
        formulaVersion: REPORT_FORMULA_VERSION,
      },
      update: {
        rankingPolicy: input.rankingPolicy,
        showFeesOnReport: input.showFeesOnReport,
        printMode: input.printMode,
      },
    }),
  );
}

export function canonicalReportHash(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
