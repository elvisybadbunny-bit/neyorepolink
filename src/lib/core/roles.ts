/**
 * NEYO — The Roles (Feature A.3).
 * Canonical, single source of truth. Zod schemas + permission matrix import from here.
 *
 * Y.2 (2026-07-09) — real NEYO company role tiers added, per the founder's
 * own words: "start over" the single undifferentiated SUPER_ADMIN role into
 * real distinct tiers for running the COMPANY (not a school): FOUNDER (you,
 * unrestricted — everything in the system), NEYO_OPS (broader internal
 * tooling, still excludes the most sensitive founder-only actions), and
 * NEYO_SUPPORT (customer-facing: inquiries, quote/demo requests, custom
 * feature requests, onboarding/guidance — never platform flags, pricing,
 * or team management). SUPER_ADMIN is kept (not removed) for backward
 * compatibility with existing seeded/demo data and any code path that still
 * checks for it explicitly — `can()`/`permissionsForRole()` treat it
 * identically to FOUNDER (full access), so nothing that already worked
 * breaks. New company accounts going forward should use FOUNDER/NEYO_OPS/
 * NEYO_SUPPORT, not SUPER_ADMIN.
 */
export const ROLES = [
  "SUPER_ADMIN", // legacy NEYO platform staff (kept for backward compatibility — full access, same as FOUNDER)
  "FOUNDER", // NEYO founder — unrestricted, everything in the system
  "NEYO_OPS", // NEYO company operations staff — broad internal tooling, excludes the most sensitive founder-only actions
  "NEYO_SUPPORT", // NEYO customer support staff — inquiries, quotes, demos, custom feature requests, onboarding guidance
  "SCHOOL_OWNER", // director / proprietor
  "PRINCIPAL", // head teacher
  "DEPUTY_PRINCIPAL",
  "DEAN_OF_STUDIES",
  "HOD", // head of department
  "TEACHER",
  "CLASS_TEACHER",
  "BURSAR", // finance
  "ACCOUNTANT",
  "RECEPTIONIST", // front office
  "LIBRARIAN",
  "HOSTEL_MASTER",
  "SUPPORT_STAFF",
  "PARENT",
  "STUDENT",
] as const;

export type Role = (typeof ROLES)[number];

/** Human-readable labels for the UI. */
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "NEYO Admin (legacy)",
  FOUNDER: "NEYO Founder",
  NEYO_OPS: "NEYO Operations",
  NEYO_SUPPORT: "NEYO Support",
  SCHOOL_OWNER: "School Owner",
  PRINCIPAL: "Principal",
  DEPUTY_PRINCIPAL: "Deputy Principal",
  DEAN_OF_STUDIES: "Dean of Studies",
  HOD: "Head of Department",
  TEACHER: "Teacher",
  CLASS_TEACHER: "Class Teacher",
  BURSAR: "Bursar",
  ACCOUNTANT: "Accountant",
  RECEPTIONIST: "Receptionist",
  LIBRARIAN: "Librarian",
  HOSTEL_MASTER: "Hostel Master",
  SUPPORT_STAFF: "Support Staff",
  PARENT: "Parent",
  STUDENT: "Student",
};

/** Real NEYO company-staff roles (never a school role) — used to gate the
 *  Founder Team page and to decide whether a user belongs to "NEYO the
 *  company" for row-scoping / navigation purposes. */
export const NEYO_COMPANY_ROLES: Role[] = ["SUPER_ADMIN", "FOUNDER", "NEYO_OPS", "NEYO_SUPPORT"];

export function isNeyoCompanyRole(role: Role): boolean {
  return NEYO_COMPANY_ROLES.includes(role);
}

/** True for the two real "unrestricted, full access" tiers (legacy
 *  SUPER_ADMIN and the new real FOUNDER role) — use this instead of a bare
 *  `role === "SUPER_ADMIN"` equality check anywhere in the codebase, so a
 *  real FOUNDER account is never accidentally locked out of a feature that
 *  only ever checked for the old role name directly. */
export function isFounderTier(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "FOUNDER";
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

