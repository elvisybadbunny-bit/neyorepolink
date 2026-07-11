import { redirect } from "next/navigation";
import { HeadsetIcon } from "lucide-react";
import { requirePageUser } from "@/lib/core/page-guards";
import { effectivePermissionsForUser } from "@/lib/core/session";
import { isFounderTier } from "@/lib/core/roles";
import { NeyoSupportConsoleClient } from "@/components/founder/neyo-support-console-client";

export const dynamic = "force-dynamic";

/**
 * Y.2 — NEYO Support Console. Reachable by FOUNDER (unrestricted) and by any
 * NEYO_OPS/NEYO_SUPPORT account with the real "neyo.customer_requests"
 * permission (their base role grants it by default; an individually
 * suspended/narrowed account is correctly redirected away).
 */
export default async function NeyoSupportConsolePage() {
  const user = await requirePageUser();
  if (!isFounderTier(user.role)) {
    const effective = await effectivePermissionsForUser(user);
    if (!effective.includes("neyo.customer_requests")) redirect("/forbidden");
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          <HeadsetIcon className="h-4 w-4" /> NEYO customer requests
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">
          NEYO Support Console
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-navy-500 dark:text-navy-400">
          Quote requests, custom feature requests, onboarding help and demo/waitlist signups — everything a prospective or current NEYO school might need.
        </p>
      </div>
      <NeyoSupportConsoleClient />
    </div>
  );
}
