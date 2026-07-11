import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";

async function main() {
  const tenant = await db.tenant.findFirstOrThrow({ where: { slug: "uwezo-primary-junior" } });
  await withTenant(tenant.id, async () => {
    const tdb = tenantDb();
    const g7amani = await tdb.schoolClass.findFirstOrThrow({ where: { level: "Grade 7", stream: "Amani" } });
    const slots = await tdb.timetableSlot.findMany({ where: { classId: g7amani.id, slotType: "ACADEMIC" }, include: { subject: true } });
    console.log(`Grade 7 Amani real slots placed: ${slots.length}`);

    const config = await tdb.timetableConfig.findUnique({ where: { classId: g7amani.id } });
    console.log("Config:", JSON.stringify(config, null, 2));

    const needs = await tdb.classSubjectNeed.findMany({ where: { classId: g7amani.id } });
    const totalNeed = needs.reduce((s, n) => s + n.lessonsPerWeek, 0);
    console.log(`Total real lessons/week needed: ${totalNeed}`);

    // How many real slots exist per day?
    const byDay = new Map<number, number>();
    for (const s of slots) byDay.set(s.dayOfWeek, (byDay.get(s.dayOfWeek) ?? 0) + 1);
    console.log("Real slots placed per day:", Object.fromEntries(byDay));

    // What periods are actually filled Thu and Fri?
    for (const day of [4, 5]) {
      const daySlots = slots.filter(s => s.dayOfWeek === day).sort((a,b) => a.period - b.period);
      console.log(`Day ${day} filled periods:`, daySlots.map(s => `P${s.period}=${s.subject?.code}`));
    }
    console.log(`periodsPerDay in config: ${config?.periodsPerDay}`);
  });
}
main().finally(() => process.exit(0));
