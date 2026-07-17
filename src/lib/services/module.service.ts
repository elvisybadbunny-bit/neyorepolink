/**
 * Per-tenant module toggling service (Feature A.2.6).
 * Reads the Tenant root + the tenant-owned TenantModule table.
 */
import { db } from "@/lib/db";
import { MODULES, getModuleDef, isModuleKey } from "@/lib/core/modules";
import { recalculateTenantModularPricing, checkPricingOptimizationAdvisor } from "@/lib/services/pricing-engine.service";
import { isPaused } from "@/lib/services/platform-flags.service";
import { checkFeatureReleaseAccess } from "@/lib/services/early-access-release.service";
import { createInApp } from "@/lib/services/notification.service";

export class ModuleError extends Error {
  constructor(
    public reason: "UNKNOWN_MODULE" | "MODULE_LOCKED",
    message: string
  ) {
    super(message);
    this.name = "ModuleError";
  }
}

export interface ModuleState {
  key: string;
  label: string;
  description: string;
  href: string;
  core: boolean;
  enabled: boolean;
}

/**
 * Effective module states for a tenant: registry defaults merged with any
 * explicit overrides stored in TenantModule. Core modules are always enabled.
 */
export async function getModuleStates(tenantId: string): Promise<ModuleState[]> {
  const rows = await db.tenantModule.findMany({ where: { tenantId } });
  const overrides = new Map(rows.map((r) => [r.moduleKey, r.enabled]));
  // G.22: NEYO platform pause overrides EVERYTHING (even tenant-enabled).
  const { pausedModuleKeys } = await import("@/lib/services/platform-flags.service");
  const paused = await pausedModuleKeys();

  return MODULES.map((m) => ({
    key: m.key,
    label: m.label,
    description: m.description,
    href: m.href,
    core: m.core,
    enabled: paused.has(m.key)
      ? false // paused platform-wide while NEYO keeps building
      : m.core ? true : (overrides.get(m.key) ?? m.defaultOn),
  }));
}

/** Just the set of enabled module keys (used to filter the sidebar). */
export async function getEnabledModuleKeys(
  tenantId: string
): Promise<Set<string>> {
  const states = await getModuleStates(tenantId);
  return new Set(states.filter((s) => s.enabled).map((s) => s.key));
}

/** Enable/disable a module for a tenant. Core modules cannot be disabled. */
export async function setModule(
  tenantId: string,
  actor: { id: string; fullName: string },
  moduleKey: string,
  enabled: boolean
): Promise<ModuleState[]> {
  if (!isModuleKey(moduleKey)) {
    throw new ModuleError("UNKNOWN_MODULE", "That module does not exist.");
  }
  const def = getModuleDef(moduleKey)!;
  if (def.core && !enabled) {
    throw new ModuleError(
      "MODULE_LOCKED",
      `${def.label} is a core module and can't be turned off.`
    );
  }

  if (enabled) {
    const pausedCheck = await isPaused(moduleKey);
    if (pausedCheck.paused) {
      throw new ModuleError(
        "MODULE_LOCKED",
        `🚧 Module Not Released Yet: The [${def.label}] module is currently under active enhancement by NEYO Engineering and is not yet released (` +
          (pausedCheck.note || "coming soon") +
          `). Please choose another module from your sidebar to continue.`
      );
    }
    await checkFeatureReleaseAccess(tenantId, `module:${moduleKey}`).catch((err) => {
      throw new ModuleError(
        "MODULE_LOCKED",
        `🚧 Module Not Released Yet: The [${def.label}] module is currently restricted (` +
          err.message +
          `). Please choose another module from your sidebar to continue.`
      );
    });
  }

  await db.$transaction([
    db.tenantModule.upsert({
      where: { tenantId_moduleKey: { tenantId, moduleKey } },
      update: { enabled },
      create: { tenantId, moduleKey, enabled },
    }),
    db.auditLog.create({
      data: {
        tenantId,
        actorId: actor.id,
        actorName: actor.fullName,
        action: enabled ? "module.enabled" : "module.disabled",
        entityType: "TenantModule",
        entityId: moduleKey,
      },
    }),
  ]);

  await recalculateTenantModularPricing(tenantId).catch(() => {});

  // Smart Pricing Optimization Advisor check right upon module activation
  if (enabled && !def.core) {
    await checkPricingOptimizationAdvisor(tenantId).then(async (adv) => {
      if (adv.shouldSwitchToCapacity && adv.advisoryMessage) {
        await createInApp({
          tenantId,
          recipientId: actor.id,
          title: adv.advisoryTitle || "💡 Smart Pricing Advice: Switch to Capacity Complete",
          body: adv.advisoryMessage,
          category: "billing",
          href: "/settings/billing",
        });
      }
    }).catch(() => {});
  }

  return getModuleStates(tenantId);
}

/** Seed a tenant's modules to registry defaults (idempotent). */
export async function initialiseModules(tenantId: string): Promise<void> {
  for (const m of MODULES) {
    if (m.core) continue; // core modules need no row
    await db.tenantModule.upsert({
      where: { tenantId_moduleKey: { tenantId, moduleKey: m.key } },
      update: {},
      create: { tenantId, moduleKey: m.key, enabled: m.defaultOn },
    });
  }
}

/**
 * Enforce that a school has switched on the required prerequisite module before using a dependent feature.
 * e.g., assertModuleDependency(tenantId, "hostel", "Dormitory Bed Allocation")
 */
export async function assertModuleDependency(tenantId: string, requiredModuleKey: string, featureLabel: string): Promise<void> {
  const enabledKeys = await getEnabledModuleKeys(tenantId);
  if (!enabledKeys.has(requiredModuleKey)) {
    const def = getModuleDef(requiredModuleKey);
    const moduleLabel = def?.label || requiredModuleKey.toUpperCase();
    throw new ModuleError(
      "MODULE_LOCKED",
      `🔒 Prerequisite Module Required: The feature '${featureLabel}' requires the [${moduleLabel}] module to be active. Your school has not switched on [${moduleLabel}] in Settings → Modules. Please ask your Principal to enable [${moduleLabel}] first to unlock this capability.`
    );
  }
}
