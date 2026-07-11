import { requirePagePermission } from "@/lib/core/page-guards";
import { CustomFeatureRequestsCard } from "@/components/settings/custom-feature-requests-card";

export const dynamic = "force-dynamic";

/** Settings → Custom features (T.3). Ask NEYO for a bespoke feature. */
export default async function CustomFeaturesSettingsPage() {
  await requirePagePermission("tenant.manage_settings");

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">
          Custom features
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Ask NEYO to build something bespoke for your school.
        </p>
      </div>

      <CustomFeatureRequestsCard />
    </div>
  );
}
