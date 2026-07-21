import { CheckCircle2, CloudUpload, Database, ShieldAlert, WifiOff } from "lucide-react";
import { requirePageUser } from "@/lib/core/page-guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const QUEUED = [
  "Attendance register saves",
  "Exam marks autosave",
  "CBE rubric observation rounds",
  "Teacher records of work and syllabus coverage",
  "CBE Delivery sessions, learner evidence and support plans",
  "Supported gate-pass creation",
  "Visitor sign-in",
  "Plain cash/manual entries where live biometric approval is not required",
];

const SAVED = [
  "Learners, only when your role permits learner access",
  "Outstanding balances, only when your role permits finance access",
  "Calendar events",
  "Timetable slots",
  "Recent CBE Delivery sessions for academic roles",
  "Your own recent notifications",
];

const ONLINE = [
  "Sign-in, OTP, password recovery and passkey verification",
  "M-Pesa STK initiation, callbacks and provider status checks",
  "Biometric/action-ticket protected money actions",
  "Timetable generation, governance approval and publication",
  "Curriculum-design publication and intervention review",
  "Permission, security and sensitive settings changes",
  "File uploads, YouTube playback/search and external integrations",
];

export default async function OfflineCapabilitiesPage() {
  await requirePageUser();
  return (
    <div className="w-full space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300"><WifiOff className="h-4 w-4"/>Offline capabilities</div>
        <h1 className="mt-2 text-2xl font-bold text-navy-950 dark:text-white">What NEYO can safely do without internet</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-navy-600 dark:text-navy-300">Offline does not mean every server action is available. NEYO saves bounded data on this device and queues only actions that can be replayed once safely. Current permissions still decide what your device may store.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CapabilityCard icon={CloudUpload} title="Saved now, synced later" tone="blue" items={QUEUED}/>
        <CapabilityCard icon={Database} title="Read-only Bundle Saver" tone="green" items={SAVED}/>
        <CapabilityCard icon={ShieldAlert} title="Live connection required" tone="amber" items={ONLINE}/>
      </div>

      <Card className="border-navy-200 dark:border-navy-800">
        <CardHeader><CardTitle className="text-base">How to prepare this device</CardTitle></CardHeader>
        <CardContent>
          <ol className="grid gap-3 text-sm text-navy-600 dark:text-navy-300 sm:grid-cols-2">
            <Step number="1" text="Open NEYO online and allow the service worker to update."/>
            <Step number="2" text="On Dashboard, keep Bundle Saver enabled and press Sync saved data now."/>
            <Step number="3" text="Open the important screens once while connected so their page shell can be cached."/>
            <Step number="4" text="When offline, watch the top-bar count. Reconnect and press Sync if automatic sync has not completed."/>
            <Step number="5" text="If Review appears, open it. A rejected item was retained instead of disappearing."/>
            <Step number="6" text="On a shared device, use a device lock and clear saved data before handing it to another person."/>
          </ol>
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-100">
        <CheckCircle2 className="mr-2 inline h-4 w-4"/><strong>No paid offline provider:</strong> snapshots and pending actions use this device&apos;s IndexedDB. Reconnection sends the same bounded API request an online save would use, plus a small duplicate-protection receipt.
      </div>
    </div>
  );
}

function CapabilityCard({ icon: Icon, title, tone, items }: { icon: typeof WifiOff; title: string; tone: "blue"|"green"|"amber"; items: string[] }) {
  const colors = tone === "green" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300" : tone === "blue" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";
  return <Card className="h-full"><CardHeader><div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${colors}`}><Icon className="h-5 w-5"/></div><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><ul className="space-y-2">{items.map((item)=><li key={item} className="flex gap-2 text-xs leading-5 text-navy-600 dark:text-navy-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500"/>{item}</li>)}</ul></CardContent></Card>;
}

function Step({ number, text }: { number: string; text: string }) {
  return <li className="flex gap-3 rounded-2xl bg-navy-50 p-3 dark:bg-navy-900"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white dark:bg-white dark:text-navy-950">{number}</span><span>{text}</span></li>;
}
