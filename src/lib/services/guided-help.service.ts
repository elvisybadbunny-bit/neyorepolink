import { z } from "zod";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/core/session";

const statusSchema = z.enum(["DRAFT", "REVIEWED", "PUBLISHED", "ARCHIVED"]);
const youtubeId = (value: string) => {
  const clean = value.trim();
  const match = clean.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/i);
  return match?.[1] || (/^[A-Za-z0-9_-]{11}$/.test(clean) ? clean : "");
};

export const guidedHelpSaveSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3).max(160),
  youtubeUrlOrId: z.string().trim().min(1).max(500),
  routePattern: z.string().trim().startsWith("/").max(240),
  actionKey: z.string().trim().max(120).optional().or(z.literal("")),
  roles: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  language: z.string().trim().min(2).max(20).default("en"),
  durationSeconds: z.coerce.number().int().min(1).max(7200).nullable().optional(),
  transcript: z.string().trim().max(30000).optional().or(z.literal("")),
  thumbnailUrl: z.string().url().max(500).optional().or(z.literal("")),
  status: statusSchema.default("DRAFT"),
});

function routeMatches(pattern: string, pathname: string) {
  if (pattern.endsWith("/*")) return pathname.startsWith(pattern.slice(0, -1));
  return pattern === pathname;
}

export async function contextualGuides(user: SessionUser, pathname: string, actionKey?: string) {
  const rows = await db.guidedHelpVideo.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ routePattern: "desc" }, { version: "desc" }], take: 100 });
  return rows.filter((row) => {
    if (!routeMatches(row.routePattern, pathname)) return false;
    if (row.actionKey && row.actionKey !== actionKey) return false;
    const roles = JSON.parse(row.rolesJson || "[]") as string[];
    return roles.length === 0 || roles.includes(user.role) || Boolean(user.secondaryRole && roles.includes(user.secondaryRole));
  }).map((row) => ({ id: row.id, title: row.title, youtubeId: row.youtubeId, routePattern: row.routePattern, actionKey: row.actionKey, language: row.language, durationSeconds: row.durationSeconds, version: row.version, transcript: row.transcript, thumbnailUrl: row.thumbnailUrl || `https://img.youtube.com/vi/${row.youtubeId}/mqdefault.jpg` }));
}

export async function listGuidedHelpVideos() {
  return db.guidedHelpVideo.findMany({ orderBy: { updatedAt: "desc" }, take: 300 });
}

export async function saveGuidedHelpVideo(actor: SessionUser, raw: unknown) {
  const input = guidedHelpSaveSchema.parse(raw);
  const id = youtubeId(input.youtubeUrlOrId);
  if (!id) throw new Error("Use a valid YouTube link or 11-character video ID.");
  const existing = input.id ? await db.guidedHelpVideo.findUnique({ where: { id: input.id } }) : null;
  const publishing = input.status === "PUBLISHED";
  const reviewed = input.status === "REVIEWED" || publishing;
  const data = {
    title: input.title, youtubeId: id, routePattern: input.routePattern,
    actionKey: input.actionKey || null, rolesJson: JSON.stringify(input.roles), language: input.language,
    durationSeconds: input.durationSeconds ?? null, transcript: input.transcript || null,
    thumbnailUrl: input.thumbnailUrl || null, status: input.status,
    version: existing && (existing.youtubeId !== id || existing.routePattern !== input.routePattern || existing.transcript !== (input.transcript || null)) ? existing.version + 1 : existing?.version ?? 1,
    reviewedById: reviewed ? actor.id : null, reviewedByName: reviewed ? actor.fullName : null,
    reviewedAt: reviewed ? new Date() : null, publishedAt: publishing ? (existing?.publishedAt ?? new Date()) : null,
  };
  if (existing) return db.guidedHelpVideo.update({ where: { id: existing.id }, data });
  return db.guidedHelpVideo.create({ data: { ...data, createdById: actor.id, createdByName: actor.fullName } });
}
