/**
 * PART Y.2 — NEYO Team & Access validation.
 *
 * Founder's own words (2026-07-09): "have a founder page for founders
 * account that can give the neyo support and any other neyo role to access
 * but since am alone for now me the founder can access everything in the
 * system." A real Founder-only page to create/suspend/edit NEYO company
 * accounts (NEYO_OPS/NEYO_SUPPORT), with individually-grantable extra
 * permissions per account (founder's own answer: "option 3... you pick
 * permissions individually per account").
 */
import { z } from "zod";
import { normalizeKePhone } from "@/lib/validations/auth";
import { PERMISSIONS } from "@/lib/core/permissions";

/** Only these two real roles are ever created via this page — FOUNDER
 *  itself is never created here (there is exactly one real founder account,
 *  created directly, never self-service-invited), and SUPER_ADMIN is the
 *  legacy role, not offered for NEW accounts going forward. */
export const NEYO_TEAM_CREATABLE_ROLES = ["NEYO_OPS", "NEYO_SUPPORT"] as const;
export type NeyoTeamCreatableRole = (typeof NEYO_TEAM_CREATABLE_ROLES)[number];

export const createNeyoTeamMemberSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(1, "Phone is required").transform((val, ctx) => {
    const normalized = normalizeKePhone(val);
    if (!normalized) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid Kenyan phone number, e.g. 0712 345 678" });
      return z.NEVER;
    }
    return normalized;
  }),
  role: z.enum(NEYO_TEAM_CREATABLE_ROLES),
  extraPermissions: z.array(z.enum(PERMISSIONS as unknown as [string, ...string[]])).default([]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CreateNeyoTeamMemberInput = z.infer<typeof createNeyoTeamMemberSchema>;

export const updateNeyoTeamMemberSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(NEYO_TEAM_CREATABLE_ROLES).optional(),
  extraPermissions: z.array(z.enum(PERMISSIONS as unknown as [string, ...string[]])).optional(),
  active: z.boolean().optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});
export type UpdateNeyoTeamMemberInput = z.infer<typeof updateNeyoTeamMemberSchema>;

export const resetNeyoTeamMemberPasswordSchema = z.object({
  userId: z.string().cuid(),
});
