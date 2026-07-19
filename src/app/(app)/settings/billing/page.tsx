import { requirePagePermission } from "@/lib/core/page-guards";
import { ensureSubscription } from "@/lib/services/billing.service";
import { getAllLimitStatuses } from "@/lib/services/limits.service";
import { getPricingEngineConfig, getRealCurrentCounts, quotePriceForCounts, computeModularUserModulePrice, checkPricingOptimizationAdvisor } from "@/lib/services/pricing-engine.service";
import { db } from "@/lib/db";
import { BillingManager } from "@/components/settings/billing-manager";
import { ReferralCard } from "@/components/settings/referral-card";
import { InfluencerCodeCard } from "@/components/settings/influencer-code-card";

export const dynamic = "force-dynamic";

/** Settings → Billing (A.5). I.5: only School Owner + Principal see subscription plan/usage. */
export default async function BillingSettingsPage() {
  const user = await requirePagePermission("owner.dashboard");
  const sub = await ensureSubscription(user.tenantId);
  const limits = await getAllLimitStatuses(user.tenantId);
  const config = await getPricingEngineConfig();
  const counts = await getRealCurrentCounts(user.tenantId);
  const optionalModulesCount = await db.tenantModule.count({ where: { tenantId: user.tenantId, enabled: true, moduleKey: { notIn: ["students", "attendance", "finance", "bundi"] } } });
  const capacityQuote = quotePriceForCounts(counts.studentCount, counts.staffCount, counts.parentCount, config);
  const modularQuote = computeModularUserModulePrice(counts.studentCount, counts.staffCount, optionalModulesCount, config);
  const pricingModeName = sub.pricingMode === "MODULAR_USERS_V1" ? "Modular User & Module" : "Capacity Complete";
  const activePriceKes = sub.sizeBasedPriceKes || (sub.pricingMode === "MODULAR_USERS_V1" ? modularQuote.termTotalKes : capacityQuote.monthlyPriceKes);

  const data = {
    subscription: {
      planKey: sub.planKey,
      planName: pricingModeName,
      status: sub.status,
      price: activePriceKes,
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      pricingMode: sub.pricingMode,
      sizeBasedPriceKes: sub.sizeBasedPriceKes,
    },
    limits: limits.map((l) => ({
      metric: l.metric,
      used: l.used,
      limit: l.limit,
      blocked: l.blocked,
      overLimit: l.overLimit,
    })),
    plans: [],
    dualPricing: {
      optimizationAdvisor: await checkPricingOptimizationAdvisor(user.tenantId),
      currentMode: sub.pricingMode,
      activePriceKes,
      capacityModel: { monthlyPriceKes: capacityQuote.monthlyPriceKes, rawScore: capacityQuote.rawScore },
      modularModel: { termTotalKes: modularQuote.termTotalKes, baseCoreFeeKes: modularQuote.baseCoreFeeKes, studentFeeKes: modularQuote.studentFeeKes, staffFeeKes: modularQuote.staffFeeKes, modulesFeeKes: modularQuote.modulesFeeKes, optionalModulesCount },
      rates: { perStudentRateKes: config.modularPerStudentRateKes, perStaffRateKes: config.modularPerStaffRateKes, baseCoreFeeKes: config.modularBaseCoreFeeKes, perModuleRateKes: config.modularPerModuleRateKes },
    },
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">
          Billing
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Your NEYO plan, usage and payments. SMS is bought as a separate top-up outside the package.
        </p>
      </div>
      <BillingManager data={data} canManage={true} />
      <ReferralCard />
      <InfluencerCodeCard />
    </div>
  );
}
