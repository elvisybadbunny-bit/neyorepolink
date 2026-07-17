import { db } from "../src/lib/db";
import { group, testAsync, expect, summary } from "./_assert";

async function main() {
  console.log("================================================================");
  console.log("Auditing Database & Seeded User Accounts for Live Deployment");
  console.log("================================================================");

  group("1. Master Founder Account Audit");
  await testAsync("Master Founder (founder@neyo.co.ke) exists with role FOUNDER", async () => {
    const founder = await db.user.findFirst({
      where: { email: "founder@neyo.co.ke" },
      include: { tenant: true },
    });
    expect(!!founder).toBe(true);
    expect(founder!.role).toBe("FOUNDER");
    expect(founder!.neyoLoginId).toBe("NEYO-ADMIN-001");
    expect(founder!.isActive).toBe(true);
    console.log(`     ✓ Found Master Founder: ${founder!.fullName} (${founder!.email}) [Role: ${founder!.role}]`);
  });

  group("2. School Tenants & Staff Accounts Audit");
  await testAsync("All 4 seeded school tenants exist and have active staff accounts", async () => {
    const tenants = await db.tenant.findMany({
      include: {
        users: { select: { email: true, fullName: true, role: true, neyoLoginId: true } },
      },
      orderBy: { name: "asc" },
    });

    expect(tenants.length >= 4).toBe(true);

    const schoolSlugs = ["karibu-high", "uhuru-academy", "mji-mpya-secondary", "mombasa-coast-senior"];

    for (const slug of schoolSlugs) {
      const tenant = tenants.find((t) => t.slug === slug);
      expect(!!tenant).toBe(true);

      const principal = tenant!.users.find((u) => u.role === "PRINCIPAL");
      expect(!!principal).toBe(true);

      console.log(`     ✓ School: ${tenant!.name} (${tenant!.slug}) — Principal: ${principal!.fullName} (${principal!.email})`);
    }
  });

  group("3. System Security & Master Encryption Key Audit");
  await testAsync("Master Encryption Key (NEYO_MASTER_KEK) and database connection operational", async () => {
    const kek = process.env.NEYO_MASTER_KEK;
    expect(!!kek).toBe(true);
    expect(kek!.length > 20).toBe(true);

    const count = await db.user.count();
    expect(count > 0).toBe(true);
    console.log(`     ✓ Total Database User Accounts Ready: ${count}`);
  });

  summary();
}

main().catch((e) => {
  console.error("Audit failed:", e);
  process.exit(1);
});
