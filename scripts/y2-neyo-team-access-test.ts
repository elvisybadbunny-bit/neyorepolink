/**
 * Y.2 — NEYO Team & Access (Founder page: create/suspend/edit NEYO
 * company accounts) + NEYO Support Console regression test. Founder's own
 * words (2026-07-09): "have a founder page for founders account that can
 * give the neyo support and any other neyo role to access but since am
 * alone for now me the founder can access everything in the system."
 * Covers: role/permission matrix correctness, FOUNDER=SUPER_ADMIN
 * equivalence, real account creation/suspension/deletion, individually-
 * granted extra permissions, and the real customer-request console access
 * boundary.
 */
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/lib/core/session";
import { effectivePermissionsForUser } from "../src/lib/core/session";
import { isFounderTier, ROLES } from "../src/lib/core/roles";
import { can, permissionsForRole } from "../src/lib/core/permissions";
import {
  createNeyoTeamMember,
  updateNeyoTeamMember,
  resetNeyoTeamMemberPassword,
  deleteNeyoTeamMember,
  listNeyoTeamMembers,
  NeyoTeamError,
} from "../src/lib/services/neyo-team.service";
import { assertCustomerRequestsAccess, NeyoSupportError } from "../src/lib/services/neyo-support.service";

let passed = 0, failed = 0;
function assert(cond: boolean, label: string) {
  if (cond) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAIL: ${label}`); failed++; }
}
async function assertThrows(fn: () => Promise<unknown>, label: string) {
  try { await fn(); console.log(`  \u2717 FAIL: ${label} (did not throw)`); failed++; }
  catch { console.log(`  \u2713 ${label}`); passed++; }
}

async function asUser(email: string): Promise<SessionUser> {
  return (await db.user.findFirstOrThrow({ where: { email } })) as unknown as SessionUser;
}

async function main() {
  const founder = await asUser("founder@neyo.co.ke");
  const bursar = await asUser("bursar@karibuhigh.ac.ke");

  console.log(`\nUsing founder: ${founder.fullName} (${founder.role})\n`);

  // -------------------------------------------------------------------
  // 1) Role/permission matrix correctness.
  // -------------------------------------------------------------------
  assert(ROLES.includes("FOUNDER"), "the real FOUNDER role exists in the 19-role enum");
  assert(ROLES.includes("NEYO_OPS"), "the real NEYO_OPS role exists");
  assert(ROLES.includes("NEYO_SUPPORT"), "the real NEYO_SUPPORT role exists");
  assert(ROLES.includes("SUPER_ADMIN"), "the legacy SUPER_ADMIN role is kept for backward compatibility");
  assert(isFounderTier("FOUNDER") && isFounderTier("SUPER_ADMIN"), "isFounderTier() recognises both real unrestricted tiers");
  assert(!isFounderTier("NEYO_OPS") && !isFounderTier("NEYO_SUPPORT"), "isFounderTier() correctly excludes the narrower company tiers");
  assert(can("FOUNDER", "neyo.team_manage"), "FOUNDER can manage the NEYO team (real, unrestricted)");
  assert(can("FOUNDER", "finance.manage_structure"), "FOUNDER has every real permission, including ordinary school ones (superset by design)");
  assert(!can("NEYO_SUPPORT", "neyo.team_manage"), "NEYO_SUPPORT cannot manage the NEYO team by default");
  assert(!can("NEYO_SUPPORT", "neyo.pricing_billing"), "NEYO_SUPPORT cannot touch pricing/billing by default");
  assert(!can("NEYO_OPS", "platform.founder_ops"), "NEYO_OPS does NOT get the full Founder Ops console by default (founder's own 'Founder-only for now' decision)");
  assert(permissionsForRole("NEYO_SUPPORT").includes("neyo.customer_requests"), "NEYO_SUPPORT's base permission set includes real customer-request access");

  // -------------------------------------------------------------------
  // 2) Founder-only guard: a non-founder cannot manage the NEYO team.
  // -------------------------------------------------------------------
  await assertThrows(
    () => createNeyoTeamMember(bursar, { fullName: "Should Fail", email: `y2-should-fail-${Date.now()}@example.test`, phone: "0712000111", role: "NEYO_SUPPORT", extraPermissions: [], note: "" }),
    "a real non-founder (BURSAR) cannot create a NEYO team account (FORBIDDEN)"
  );

  // -------------------------------------------------------------------
  // 3) Real account creation, listing, individually-granted extra
  // permissions, suspension, password reset, and deletion.
  // -------------------------------------------------------------------
  const testEmail = `y2-support-${Date.now()}@example.test`;
  const created = await createNeyoTeamMember(founder, {
    fullName: "Wanjiku Test Support", email: testEmail, phone: "0712345678", role: "NEYO_SUPPORT",
    extraPermissions: ["neyo.platform_flags"], note: "Y.2 regression test account",
  });
  assert(Boolean(created.user.id), "a real new NEYO_SUPPORT account is created");
  assert(created.tempPassword.length >= 8, "a real temporary password is generated and returned once");
  assert(created.neyoLoginId.startsWith("NEYO"), "the new account gets a real global NEYO login ID");

  const createdSessionUser = { ...created.user, secondaryRole: null } as unknown as SessionUser;
  const effectiveBase = await effectivePermissionsForUser(createdSessionUser);
  assert(effectiveBase.includes("neyo.customer_requests"), "the new account's effective permissions include its real base role access");
  assert(effectiveBase.includes("neyo.platform_flags"), "the new account's effective permissions include the real individually-granted extra permission");
  assert(!effectiveBase.includes("neyo.pricing_billing"), "the new account's effective permissions correctly EXCLUDE a permission never granted");

  const listed = await listNeyoTeamMembers();
  const foundInList = listed.find((m) => m.id === created.user.id);
  assert(Boolean(foundInList), "the new account appears in the real Founder Team list");
  assert(foundInList?.extraPermissions.includes("neyo.platform_flags") ?? false, "the real team list shows the individually-granted extra permission");

  // Duplicate-email rejection.
  await assertThrows(
    () => createNeyoTeamMember(founder, { fullName: "Duplicate", email: testEmail, phone: "0712345679", role: "NEYO_SUPPORT", extraPermissions: [], note: "" }),
    "creating a second account with the same real email is rejected (DUPLICATE)"
  );

  // Suspend the account: effective permissions must become empty, and the
  // real customer-request console must correctly reject it.
  await updateNeyoTeamMember(founder, { userId: created.user.id, active: false });
  const suspendedUser = await db.user.findUniqueOrThrow({ where: { id: created.user.id } });
  assert(suspendedUser.isActive === false, "suspending the account genuinely flips the real User.isActive too (blocks every login path, not just permissions)");
  const effectiveAfterSuspend = await effectivePermissionsForUser({ ...suspendedUser, secondaryRole: null } as unknown as SessionUser);
  assert(effectiveAfterSuspend.length === 0, "a suspended NEYO account has ZERO effective permissions, even though the User row still exists");
  await assertThrows(
    () => assertCustomerRequestsAccess({ ...suspendedUser, secondaryRole: null } as unknown as SessionUser),
    "a suspended account is correctly rejected by the real customer-request console access guard"
  );

  // Re-activate and confirm access returns.
  await updateNeyoTeamMember(founder, { userId: created.user.id, active: true });
  const reactivated = await db.user.findUniqueOrThrow({ where: { id: created.user.id } });
  assert(reactivated.isActive === true, "re-activating restores real User.isActive");
  await assertCustomerRequestsAccess({ ...reactivated, secondaryRole: null } as unknown as SessionUser);
  assert(true, "a re-activated account passes the real customer-request console access guard again");

  // Password reset.
  const resetResult = await resetNeyoTeamMemberPassword(founder, created.user.id);
  assert(resetResult.tempPassword.length >= 8, "resetting the password returns a real new temporary password");
  const afterReset = await db.user.findUniqueOrThrow({ where: { id: created.user.id } });
  assert(afterReset.passwordHash !== created.user.passwordHash, "the real stored password hash genuinely changed after reset");

  // Founder tier itself cannot be edited/deleted from this page.
  await assertThrows(
    () => updateNeyoTeamMember(founder, { userId: founder.id, active: false }),
    "the Founder account itself cannot be suspended/edited from this page (FORBIDDEN)"
  );
  await assertThrows(
    () => deleteNeyoTeamMember(founder, founder.id),
    "the Founder account itself cannot be deleted from this page (FORBIDDEN)"
  );

  // -------------------------------------------------------------------
  // 4) NEYO_OPS default access matches the founder's own "same safe
  // baseline as NEYO_SUPPORT for now" decision.
  // -------------------------------------------------------------------
  const opsEmail = `y2-ops-${Date.now()}@example.test`;
  const createdOps = await createNeyoTeamMember(founder, {
    fullName: "Kiptoo Test Ops", email: opsEmail, phone: "0722334455", role: "NEYO_OPS", extraPermissions: [], note: "",
  });
  const opsSessionUser = { ...createdOps.user, secondaryRole: null } as unknown as SessionUser;
  const opsEffective = await effectivePermissionsForUser(opsSessionUser);
  assert(opsEffective.includes("neyo.customer_requests"), "a fresh NEYO_OPS account defaults to real customer-request access");
  assert(!opsEffective.includes("neyo.platform_flags"), "a fresh NEYO_OPS account does NOT default to platform-flag access (founder's own safer-default decision)");
  await assertCustomerRequestsAccess(opsSessionUser);
  assert(true, "a fresh NEYO_OPS account passes the real customer-request console access guard");

  // -------------------------------------------------------------------
  // 5) A real ordinary school BURSAR is correctly blocked from the
  // customer-request console entirely.
  // -------------------------------------------------------------------
  await assertThrows(
    () => assertCustomerRequestsAccess(bursar),
    "a real ordinary school staff account (BURSAR) is blocked from the NEYO customer-request console"
  );

  // -------------------------------------------------------------------
  // Cleanup: remove every real row this test created, confirm removal.
  // -------------------------------------------------------------------
  await deleteNeyoTeamMember(founder, created.user.id);
  await deleteNeyoTeamMember(founder, createdOps.user.id);
  const remainingSupport = await db.user.count({ where: { id: created.user.id } });
  const remainingOps = await db.user.count({ where: { id: createdOps.user.id } });
  const remainingTeamRows = await db.neyoTeamMember.count({ where: { userId: { in: [created.user.id, createdOps.user.id] } } });
  assert(remainingSupport === 0, "the real test NEYO_SUPPORT account was deleted and confirmed removed via direct DB re-query");
  assert(remainingOps === 0, "the real test NEYO_OPS account was deleted and confirmed removed via direct DB re-query");
  assert(remainingTeamRows === 0, "both real NeyoTeamMember rows were cascade-deleted and confirmed removed via direct DB re-query");

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
