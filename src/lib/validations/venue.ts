/**
 * Z.3 — Real Venue/Lab pool (founder-requested 2026-07-10). A school adds
 * its own real rooms (Chemistry Lab, Computer Lab, Home Science Room) and
 * tags each with which real subjects it can host — a POOL by subject-type,
 * so a school with 2 identical Science Labs lets the solver pick whichever
 * is genuinely free at a given real period, instead of pinning one exact
 * room per class-subject pair.
 */
import { z } from "zod";

const safeName = z
  .string()
  .trim()
  .min(2, "Venue name is too short")
  .max(80, "Venue name is too long")
  .regex(/^[\p{L}\p{N}\s'’().,&/+:-]+$/u, "Use letters, numbers and simple punctuation only");

const shortCode = z
  .string()
  .trim()
  .min(1)
  .max(10)
  .regex(/^[A-Za-z0-9]+$/, "Use letters/numbers only, no spaces")
  .transform((v) => v.toUpperCase())
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createVenueSchema = z.object({
  name: safeName,
  shortCode,
  supportsSubjectIds: z.array(z.string().trim().min(1)).max(60).default([]),
  capacityPerPeriod: z.coerce.number().int().min(1).max(10).default(1),
  learnerCapacity: z.coerce.number().int().min(1).max(5000).nullable().optional(),
});
export type CreateVenueInput = z.infer<typeof createVenueSchema>;

export const updateVenueSchema = createVenueSchema.partial().extend({
  id: z.string().trim().min(1),
  active: z.boolean().optional(),
});
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;

export const deleteVenueSchema = z.object({ id: z.string().trim().min(1) });

// Z.3 — real per-user/venue printable short code (e.g. "MO" for Mary
// Omondi, "CHEM" for Chemistry Lab). Auto-generated at first use,
// school-editable afterward.
export const setShortCodeSchema = z.object({
  kind: z.enum(["TEACHER", "VENUE"]),
  id: z.string().trim().min(1),
  shortCode: z
    .string()
    .trim()
    .min(1, "Enter a short code.")
    .max(10, "Keep the short code to 10 characters or fewer.")
    .regex(/^[A-Za-z0-9]+$/, "Use letters/numbers only, no spaces")
    .transform((v) => v.toUpperCase()),
});
export type SetShortCodeInput = z.infer<typeof setShortCodeSchema>;
