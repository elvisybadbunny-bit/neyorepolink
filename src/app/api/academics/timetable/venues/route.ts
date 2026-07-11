/**
 * Z.3 — Real Venue/Lab pool API.
 * GET  -> list every real venue for this school (labs/rooms + which
 *         subjects each supports, its capacity, and its printable code).
 * POST -> actions: create, update, delete, set_short_code (also used for a
 *         TEACHER short code, not just VENUE — the school's real printable
 *         staff abbreviation used on the printed timetable).
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  listVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  setShortCode,
  VenueError,
} from "@/lib/services/venue.service";
import { createVenueSchema, updateVenueSchema, deleteVenueSchema, setShortCodeSchema } from "@/lib/validations/venue";

export const dynamic = "force-dynamic";

function mapErr(e: unknown) {
  if (e instanceof VenueError) {
    const m = { NOT_FOUND: 404, DUPLICATE: 409, INVALID: 400 } as const;
    return fail(e.code, e.message, m[e.code]);
  }
  return null;
}

export async function GET() {
  try {
    const user = await requirePermission("academics.view");
    const venues = await listVenues(user);
    return ok({ venues });
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    const body = await req.json().catch(() => ({}));
    switch (body.action) {
      case "create": {
        const input = createVenueSchema.parse(body);
        return ok(await createVenue(user, input));
      }
      case "update": {
        const input = updateVenueSchema.parse(body);
        return ok(await updateVenue(user, input));
      }
      case "delete": {
        const input = deleteVenueSchema.parse(body);
        return ok(await deleteVenue(user, input.id));
      }
      case "set_short_code": {
        const input = setShortCodeSchema.parse(body);
        return ok(await setShortCode(user, input));
      }
      default:
        return fail("INVALID", "Unknown action.", 400);
    }
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}
