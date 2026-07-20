import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";

const parse = <T>(value: string, fallback: T): T => { try { return JSON.parse(value) as T; } catch { return fallback; } };

/** Server-side publication/generation gate after Phase B confirmation. */
export async function seniorOptionBlocksReady(user: SessionUser, level: string) {
  return withTenant(user.tenantId, async () => {
    const db = tenantDb();
    const run = await db.electiveBlockAutoBuildRun.findFirst({ where: { level, kind: "ELECTIVES", status: "CONFIRMED" }, orderBy: { confirmedAt: "desc" } });
    if (!run?.createdElectiveBlockId) return { ready: false, reason: `No confirmed Phase B Option A/B/C build exists for ${level}.` };
    const block = await db.electiveBlock.findFirst({ where: { id: run.createdElectiveBlockId, active: true }, include: { slots: { include: { subjects: true } } } });
    if (!block) return { ready: false, reason: `The confirmed ${level} Phase B block is missing or inactive.` };
    const counts = { A: 0, B: 0, C: 0 };
    for (const slot of block.slots) {
      if (/^Option A\b/.test(slot.label)) counts.A++;
      if (/^Option B\b/.test(slot.label)) counts.B++;
      if (/^Option C\b/.test(slot.label)) counts.C++;
      if (slot.subjects.length === 0) return { ready: false, reason: `${slot.label} has no real subject.` };
    }
    if (counts.A !== 5 || counts.B !== 5 || counts.C !== 5) return { ready: false, reason: `${level} needs exactly A × 5, B × 5 and C × 5 option slots; found A ${counts.A}, B ${counts.B}, C ${counts.C}.` };
    const preview = parse<{ blockPlan?: { learnerProof?: { valid: boolean }[] } }>(run.previewJson, {});
    const proof = preview.blockPlan?.learnerProof ?? [];
    if (!proof.length || proof.some((row) => !row.valid)) return { ready: false, reason: `${level} has no complete valid per-learner A/B/C proof.` };
    return { ready: true, blockId: block.id, learnerProofCount: proof.length, slotCount: block.slots.length };
  });
}
