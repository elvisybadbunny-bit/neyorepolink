/**
 * Z.3 — Real Venue/Lab pool service (founder-requested 2026-07-10).
 * Real CRUD for a school's own rooms/labs, real auto-generated printable
 * short codes (deduplicated per tenant) for both VENUES and TEACHERS —
 * the same short-code concept is reused for a teacher's printable
 * initials on the timetable (e.g. "MO" for Mary Omondi), resolved on
 * demand the first time a teacher's timetable is ever printed.
 */
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/core/session";
import type {
  CreateVenueInput,
  UpdateVenueInput,
  SetShortCodeInput,
} from "@/lib/validations/venue";

export class VenueError extends Error {
  code: "NOT_FOUND" | "DUPLICATE" | "INVALID";
  constructor(code: "NOT_FOUND" | "DUPLICATE" | "INVALID", message: string) {
    super(message);
    this.code = code;
    this.name = "VenueError";
  }
}

/** "Mary Omondi" -> "MO"; single-word name -> first 2 chars uppercased. */
export function initialsFromName(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "XX";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase().padEnd(2, "X");
  }
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return (first + last).toUpperCase();
}

/** "Chemistry Lab" -> "CHEM"; first word, truncated to 4 chars, uppercased. */
export function codeFromVenueName(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? name;
  const cleaned = firstWord.replace(/[^A-Za-z0-9]/g, "");
  const base = (cleaned || "VEN").slice(0, 4).toUpperCase();
  return base || "VEN";
}

/**
 * Ensures `candidate` is unique among `taken` by appending a numeric
 * suffix (2, 3, 4, ...) until it no longer collides. Real, deterministic,
 * safe to call repeatedly.
 */
function dedupeShortCode(candidate: string, taken: Set<string>): string {
  let code = candidate.toUpperCase();
  if (!taken.has(code)) return code;
  let n = 2;
  while (taken.has(`${candidate.toUpperCase()}${n}`)) n += 1;
  return `${candidate.toUpperCase()}${n}`;
}

export async function listVenues(user: SessionUser) {
  const venues = await db.venue.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: "asc" },
  });
  return venues.map((v) => ({
    id: v.id,
    name: v.name,
    shortCode: v.shortCode,
    supportsSubjectIds: JSON.parse(v.supportsSubjectIds || "[]") as string[],
    capacityPerPeriod: v.capacityPerPeriod,
    learnerCapacity: v.learnerCapacity,
    active: v.active,
    createdAt: v.createdAt,
  }));
}

export async function createVenue(user: SessionUser, input: CreateVenueInput) {
  const existing = await db.venue.findFirst({
    where: { tenantId: user.tenantId, name: { equals: input.name } },
  });
  if (existing) {
    throw new VenueError("DUPLICATE", `A venue named "${input.name}" already exists.`);
  }

  const existingCodes = await db.venue.findMany({
    where: { tenantId: user.tenantId, shortCode: { not: null } },
    select: { shortCode: true },
  });
  const taken = new Set(existingCodes.map((v) => (v.shortCode || "").toUpperCase()).filter(Boolean));
  const shortCode = dedupeShortCode(input.shortCode || codeFromVenueName(input.name), taken);

  const venue = await db.venue.create({
    data: {
      tenantId: user.tenantId,
      name: input.name,
      shortCode,
      supportsSubjectIds: JSON.stringify(input.supportsSubjectIds ?? []),
      capacityPerPeriod: input.capacityPerPeriod ?? 1,
      learnerCapacity: input.learnerCapacity ?? null,
    },
  });
  return {
    id: venue.id,
    name: venue.name,
    shortCode: venue.shortCode,
    supportsSubjectIds: JSON.parse(venue.supportsSubjectIds || "[]") as string[],
    capacityPerPeriod: venue.capacityPerPeriod,
    learnerCapacity: venue.learnerCapacity,
    active: venue.active,
  };
}

export async function updateVenue(user: SessionUser, input: UpdateVenueInput) {
  const venue = await db.venue.findFirst({ where: { id: input.id, tenantId: user.tenantId } });
  if (!venue) throw new VenueError("NOT_FOUND", "Venue not found.");

  if (input.name && input.name !== venue.name) {
    const dupe = await db.venue.findFirst({
      where: { tenantId: user.tenantId, name: { equals: input.name }, id: { not: venue.id } },
    });
    if (dupe) throw new VenueError("DUPLICATE", `A venue named "${input.name}" already exists.`);
  }

  let shortCode = venue.shortCode;
  if (input.shortCode && input.shortCode !== venue.shortCode) {
    const existingCodes = await db.venue.findMany({
      where: { tenantId: user.tenantId, shortCode: { not: null }, id: { not: venue.id } },
      select: { shortCode: true },
    });
    const taken = new Set(existingCodes.map((v) => (v.shortCode || "").toUpperCase()).filter(Boolean));
    shortCode = dedupeShortCode(input.shortCode, taken);
  }

  const updated = await db.venue.update({
    where: { id: venue.id },
    data: {
      name: input.name ?? venue.name,
      shortCode,
      supportsSubjectIds:
        input.supportsSubjectIds !== undefined ? JSON.stringify(input.supportsSubjectIds) : venue.supportsSubjectIds,
      capacityPerPeriod: input.capacityPerPeriod ?? venue.capacityPerPeriod,
      learnerCapacity: input.learnerCapacity === undefined ? venue.learnerCapacity : input.learnerCapacity,
      active: input.active ?? venue.active,
    },
  });
  return {
    id: updated.id,
    name: updated.name,
    shortCode: updated.shortCode,
    supportsSubjectIds: JSON.parse(updated.supportsSubjectIds || "[]") as string[],
    capacityPerPeriod: updated.capacityPerPeriod,
    learnerCapacity: updated.learnerCapacity,
    active: updated.active,
  };
}

export async function deleteVenue(user: SessionUser, id: string) {
  const venue = await db.venue.findFirst({ where: { id, tenantId: user.tenantId } });
  if (!venue) throw new VenueError("NOT_FOUND", "Venue not found.");
  await db.venue.delete({ where: { id: venue.id } });
  return { deleted: true, id: venue.id };
}

/**
 * Real short-code setter, handles both a VENUE's own printable code and a
 * TEACHER's own printable initials — same de-duplication rule for both,
 * scoped separately (a venue code and a teacher code never collide with
 * each other since they render in different cell positions).
 */
export async function setShortCode(user: SessionUser, input: SetShortCodeInput) {
  if (input.kind === "VENUE") {
    const venue = await db.venue.findFirst({ where: { id: input.id, tenantId: user.tenantId } });
    if (!venue) throw new VenueError("NOT_FOUND", "Venue not found.");
    const existingCodes = await db.venue.findMany({
      where: { tenantId: user.tenantId, shortCode: { not: null }, id: { not: venue.id } },
      select: { shortCode: true },
    });
    const taken = new Set(existingCodes.map((v) => (v.shortCode || "").toUpperCase()).filter(Boolean));
    if (taken.has(input.shortCode.toUpperCase())) {
      throw new VenueError("DUPLICATE", `"${input.shortCode}" is already used by another venue.`);
    }
    const updated = await db.venue.update({ where: { id: venue.id }, data: { shortCode: input.shortCode } });
    return { kind: "VENUE" as const, id: updated.id, shortCode: updated.shortCode };
  }

  const teacher = await db.user.findFirst({ where: { id: input.id, tenantId: user.tenantId } });
  if (!teacher) throw new VenueError("NOT_FOUND", "Teacher not found.");
  const existingCodes = await db.user.findMany({
    where: { tenantId: user.tenantId, timetableShortCode: { not: null }, id: { not: teacher.id } },
    select: { timetableShortCode: true },
  });
  const taken = new Set(existingCodes.map((u) => (u.timetableShortCode || "").toUpperCase()).filter(Boolean));
  if (taken.has(input.shortCode.toUpperCase())) {
    throw new VenueError("DUPLICATE", `"${input.shortCode}" is already used by another teacher.`);
  }
  const updated = await db.user.update({
    where: { id: teacher.id },
    data: { timetableShortCode: input.shortCode },
  });
  return { kind: "TEACHER" as const, id: updated.id, timetableShortCode: updated.timetableShortCode };
}

/**
 * On-demand resolver: returns a teacher's existing real printable short
 * code, or generates + persists one from their real full name the first
 * time it's needed (e.g. the first time their timetable is printed).
 * Real de-duplication against every other teacher's code in the tenant.
 */
export async function resolveTeacherShortCode(
  tenantId: string,
  teacherId: string,
  fullName: string
): Promise<string> {
  const teacher = await db.user.findFirst({
    where: { id: teacherId, tenantId },
    select: { timetableShortCode: true },
  });
  if (teacher?.timetableShortCode) return teacher.timetableShortCode;

  const existingCodes = await db.user.findMany({
    where: { tenantId, timetableShortCode: { not: null } },
    select: { timetableShortCode: true },
  });
  const taken = new Set(existingCodes.map((u) => (u.timetableShortCode || "").toUpperCase()).filter(Boolean));
  const code = dedupeShortCode(initialsFromName(fullName), taken);

  await db.user.update({ where: { id: teacherId }, data: { timetableShortCode: code } });
  return code;
}
