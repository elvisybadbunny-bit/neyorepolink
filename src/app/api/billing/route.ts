import { requirePermission } from "@/lib/core/session";
import { ensureSubscription } from "@/lib/services/billing.service";
import { getAllLimitStatuses } from "@/lib/services/limits.service";
import { getPlanFromCatalog, listPlansFromCatalog } from "@/lib/services/pricing-catalog.service";
import { getPricingEngineConfig, getRealCurrentCounts, quotePriceForCounts, computeModularUserModulePrice } from "@/lib/services/pricing-engine.service";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

/** GET /api/billing — current subscription, usage, dual pricing models, and available plans. */
export async function GET() {
  try {
    const user = await requirePermission("owner.dashboard");
    const sub = await ensureSubscription(user.tenantId);
    const limits = await getAllLimitStatuses(user.tenantId);
    const plan = await getPlanFromCatalog(sub.planKey);
    const plans = await listPlansFromCatalog();

    const config = await getPricingEngineConfig();
    const counts = await getRealCurrentCounts(user.tenantId);
    const optionalModulesCount = await db.tenantModule.count({
      where: {
        tenantId: user.tenantId,
        enabled: true,
        moduleKey: { notIn: ["students", "attendance", "finance", "bundi"] },
      },
    });

    const capacityQuote = quotePriceForCounts(counts.studentCount, counts.staffCount, counts.parentCount, config);
    const modularQuote = computeModularUserModulePrice(counts.studentCount, counts.staffCount, optionalModulesCount, config);

    return ok({
      subscription: {
        planKey: sub.planKey,
        planName: plan?.name ?? sub.planKey,
        status: sub.status,
        price: sub.grandfatheredPrice,
        currentPeriodEnd: sub.currentPeriodEnd,
        graceEndsAt: sub.graceEndsAt,
        pricingMode: sub.pricingMode,
        sizeBasedPriceKes: sub.sizeBasedPriceKes,
      },
      limits,
      plans,
      dualPricing: {
        currentMode: sub.pricingMode,
        activePriceKes: sub.sizeBasedPriceKes || (sub.pricingMode === "MODULAR_USERS_V1" ? modularQuote.termTotalKes : capacityQuote.monthlyPriceKes),
        capacityModel: {
          monthlyPriceKes: capacityQuote.monthlyPriceKes,
          rawScore: capacityQuote.rawScore,
        },
        modularModel: {
          termTotalKes: modularQuote.termTotalKes,
          baseCoreFeeKes: modularQuote.baseCoreFeeKes,
          studentFeeKes: modularQuote.studentFeeKes,
          staffFeeKes: modularQuote.staffFeeKes,
          modulesFeeKes: modularQuote.modulesFeeKes,
          optionalModulesCount,
        },
        rates: {
          perStudentRateKes: config.modularPerStudentRateKes,
          perStaffRateKes: config.modularPerStaffRateKes,
          baseCoreFeeKes: config.modularBaseCoreFeeKes,
          perModuleRateKes: config.modularPerModuleRateKes,
        },
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
