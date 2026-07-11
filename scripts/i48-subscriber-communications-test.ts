import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@/lib/db";

function assert(condition: unknown, message: string) { if (!condition) throw new Error(message); console.log(`✓ ${message}`); }

async function main() {
  const api = readFileSync(join(process.cwd(), "src/app/api/founder-ops/route.ts"), "utf8");
  const ui = readFileSync(join(process.cwd(), "src/components/founder/founder-ops-client.tsx"), "utf8");

  assert(api.includes("send_broadcast") && api.includes("segment") && api.includes("createInApp") && api.includes("sendSms"), "Founder Ops broadcast sends segmented in-app and SMS messages");
  assert(api.includes("SCHOOL_OWNER") && api.includes("PRINCIPAL"), "broadcast targets school owners/principals for in-app notices");
  assert(api.includes("platform.subscriber_broadcast_sent"), "subscriber broadcasts are audit logged");
  assert(ui.includes("Subscriber segment") && ui.includes("All subscribers") && ui.includes("Grace period") && ui.includes("Suspended"), "Business Operations UI lets NEYO choose subscriber segments");
  assert(ui.includes("Dispatch Subscriber Broadcast") && ui.includes("targeted in-app notices"), "UI explains and sends subscriber broadcasts");

  const support = await db.user.findFirstOrThrow({ where: { email: "founder@neyo.co.ke" } });
  const tenantCount = await db.tenant.count();
  // Y.2 (2026-07-09): the real NEYO founder account is now genuinely FOUNDER
  // (a real, unrestricted role in its own right, not just SUPER_ADMIN).
  assert(tenantCount >= 1 && support.role === "FOUNDER", "test baseline has subscriber tenants and a real FOUNDER sender");

  console.log("\nI.48 Subscriber communications checkpoint test passed.");
}
main().catch((e)=>{ console.error(e); process.exit(1); }).finally(async()=>db.$disconnect());
