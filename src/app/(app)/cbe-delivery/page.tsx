import { redirect } from "next/navigation";
import { Route } from "lucide-react";
import { requirePageUser } from "@/lib/core/page-guards";
import { effectivePermissionsForUser } from "@/lib/core/session";
import { CbeDeliveryClient } from "@/components/cbe-delivery/cbe-delivery-client";

export const dynamic = "force-dynamic";
export default async function CbeDeliveryPage() {
  const user = await requirePageUser();
  const permissions = await effectivePermissionsForUser(user);
  if (!permissions.includes("academics.view")) redirect("/forbidden");
  return <div className="w-full space-y-5"><div><div className="flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-300"><Route className="h-4 w-4"/>CBE Delivery Hub</div><h1 className="mt-2 text-2xl font-bold text-navy-950 dark:text-white">Teach, observe and support from one curriculum point</h1><p className="mt-1 max-w-4xl text-sm leading-6 text-navy-600 dark:text-navy-300">Connect reviewed curriculum intent to what was actually delivered, the evidence each learner demonstrated and the next reviewed support action. This hub links NEYO’s existing CBE, Assessments, Competencies, Syllabus and Portfolio workflows—it does not replace them.</p></div><CbeDeliveryClient/></div>;
}
