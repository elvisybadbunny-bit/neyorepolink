import { requirePageUser } from "@/lib/core/page-guards";
import { effectivePermissionsForUser } from "@/lib/core/session";
import { db } from "@/lib/db";
import { TwoFactorCard } from "@/components/settings/two-factor-card";
import { PasskeysCard } from "@/components/settings/passkeys-card";
import { ConnectedAccountsCard } from "@/components/settings/connected-accounts-card";
import { DeviceAppUnlockCard } from "@/components/settings/device-app-unlock-card";
import { FinanceSecurityCard } from "@/components/settings/finance-security-card";
import { MyShellCard } from "@/components/settings/my-shell-card";
import { listPasskeys } from "@/lib/services/passkey.service";

export const dynamic = "force-dynamic";

/**
 * Settings → Security. Sectioned settings density (Principle 7).
 * Reads the real 2FA status for the signed-in user.
 */
export default async function SecuritySettingsPage() {
  const user = await requirePageUser({ isSecurityPage: true });
  const effectivePermissions = await effectivePermissionsForUser(user);

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { totpEnabled: true },
  });

  const passkeys = (await listPasskeys(user.id)).map((p) => ({
    id: p.id,
    deviceLabel: p.deviceLabel,
    createdAt: p.createdAt.toISOString(),
    lastUsedAt: p.lastUsedAt ? p.lastUsedAt.toISOString() : null,
  }));

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">
          Security
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Manage how you sign in and protect your NEYO account.
        </p>
      </div>

      <div className="rounded-2xl border border-navy-200 bg-white p-4 dark:border-navy-700 dark:bg-navy-900"><p className="text-xs font-bold uppercase tracking-wider text-navy-500">Your NEYO login identity</p><p className="mt-2 break-all font-mono text-sm font-bold text-navy-950 dark:text-white">{user.customNeyoEmail || user.neyoLoginId}</p><p className="mt-1 text-xs text-navy-500">Use this identity or your registered phone/email to sign in. It does not create an external email inbox.</p></div>

      <PasskeysCard initial={passkeys} />
      <DeviceAppUnlockCard hasPasskey={passkeys.length > 0} />
      <ConnectedAccountsCard />
      <TwoFactorCard initialEnabled={dbUser?.totpEnabled ?? false} />
      {effectivePermissions.includes("tenant.manage_settings") && <FinanceSecurityCard />}
      <MyShellCard />
    </div>
  );
}
