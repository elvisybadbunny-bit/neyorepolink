import { db } from "../src/lib/db";
import { group, testAsync, expect, summary } from "./_assert";
import { getGlobalUiVersion, setGlobalUiVersion } from "../src/lib/services/ui-version.service";

async function main() {
  console.log("================================================================");
  console.log("Running Integration Verification Suite for NEYO UI 2.0 Mode");
  console.log("================================================================");

  const karibu = await db.tenant.findFirst({ where: { name: { contains: "Karibu" } } });
  if (!karibu) throw new Error("Karibu tenant missing");

  const principal = await db.user.findFirst({ where: { tenantId: karibu.id, role: "PRINCIPAL" } });
  if (!principal) throw new Error("Principal user missing");

  const opsUser = {
    id: principal.id,
    tenantId: principal.tenantId,
    neyoLoginId: principal.neyoLoginId,
    fullName: principal.fullName,
    phone: principal.phone,
    email: principal.email,
    role: "FOUNDER" as const,
    secondaryRole: principal.secondaryRole as any,
    language: principal.language ?? "en",
  };

  group("1. NEYO Ops Global UI Version Toggle");
  await testAsync("Can toggle UI mode between v1 (Classic Web) and v2 (Native App 2.0)", async () => {
    // Set to v1
    await setGlobalUiVersion(opsUser, "v1");
    let v = await getGlobalUiVersion();
    expect(v).toBe("v1");

    // Toggle to v2
    await setGlobalUiVersion(opsUser, "v2");
    v = await getGlobalUiVersion();
    expect(v).toBe("v2");

    // Reset to v1 for default stability
    await setGlobalUiVersion(opsUser, "v1");
    v = await getGlobalUiVersion();
    expect(v).toBe("v1");
  });

  group("2. Audit Log Stamping on UI Version Change");
  await testAsync("Audit log entry is stamped when NEYO Ops changes UI version", async () => {
    await setGlobalUiVersion(opsUser, "v2");
    const log = await db.auditLog.findFirst({
      where: { action: "platform.ui_version_updated" },
      orderBy: { createdAt: "desc" },
    });
    expect(!!log).toBe(true);
    expect(log!.entityId).toBe("ui_version_default");
  });

  summary();
}

main().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
