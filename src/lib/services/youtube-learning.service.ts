/**
 * EE.7 — YouTube learning library (`LearningVideo`): strand-to-video linking,
 * teacher link-submission + ops approval queue, zero API quota cost.
 */

import { db } from "@/lib/db";
import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";
import type {
  SubmitLearningVideoInput,
  OpsDecideLearningVideoInput,
  ListLearningVideosQuery,
  LearningVideoItem,
} from "@/lib/validations/youtube-learning";
import { KICD_YOUTUBE_VIDEO_SEEDS } from "@/lib/data/kicd-youtube-learning-library";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART2 } from "@/lib/data/kicd-youtube-learning-library-part2";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART3 } from "@/lib/data/kicd-youtube-learning-library-part3";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART4 } from "@/lib/data/kicd-youtube-learning-library-part4";

export class YouTubeLearningError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "YouTubeLearningError";
  }
}

async function audit(user: SessionUser, action: string, entityId: string, metadata?: unknown) {
  try {
    const tdb = tenantDb();
    await tdb.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.id,
        actorName: (user as any).fullName || "User",
        action,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      } as never,
    });
  } catch (e) {
    console.error("Audit logging error:", e);
  }
}

/** Parse an 11-char YouTube ID from any standard URL or raw ID string. */
export function extractYouTubeId(urlOrId: string): string | null {
  const clean = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  const match = clean.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  return match?.[1] ?? null;
}

/** Submit or save a learning video link for a KICD strand or school library (`EE.7`). */
export async function submitLearningVideo(user: SessionUser, input: SubmitLearningVideoInput) {
  const youtubeId = extractYouTubeId(input.youtubeUrlOrId);
  if (!youtubeId) {
    throw new YouTubeLearningError(
      "INVALID",
      "Please enter a valid YouTube video URL or 11-character video ID."
    );
  }

  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();

    if (input.subjectId) {
      const subj = await tdb.subject.findUnique({ where: { id: input.subjectId } });
      if (!subj) throw new YouTubeLearningError("NOT_FOUND", "Subject not found.");
    }
    if (input.strandId) {
      const strand = await tdb.cbcStrand.findUnique({ where: { id: input.strandId } });
      if (!strand) throw new YouTubeLearningError("NOT_FOUND", "CBC Strand not found.");
    }
    if (input.substrandId) {
      const substrand = await tdb.cbcSubstrand.findUnique({ where: { id: input.substrandId } });
      if (!substrand) throw new YouTubeLearningError("NOT_FOUND", "CBC Sub-strand not found.");
    }

    const approvalStatus = input.scope === "NATIONAL" ? "PENDING" : "APPROVED";
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

    const existing = await tdb.learningVideo.findFirst({
      where: { youtubeId },
    });

    let video;
    if (existing) {
      video = await tdb.learningVideo.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          description: input.description || existing.description,
          thumbnailUrl,
          subjectId: input.subjectId || existing.subjectId,
          strandId: input.strandId || existing.strandId,
          substrandId: input.substrandId || existing.substrandId,
          grade: input.grade || existing.grade,
          scope: input.scope,
          approvalStatus,
          savedById: user.id,
          savedByName: (user as any).fullName || "Teacher",
        } as never,
      });
    } else {
      video = await tdb.learningVideo.create({
        data: {
          tenantId: user.tenantId,
          youtubeId,
          title: input.title,
          description: input.description || null,
          thumbnailUrl,
          subjectId: input.subjectId || null,
          strandId: input.strandId || null,
          substrandId: input.substrandId || null,
          grade: input.grade || null,
          scope: input.scope,
          approvalStatus,
          savedById: user.id,
          savedByName: (user as any).fullName || "Teacher",
        } as never,
      });
    }

    await audit(user, "academics.learning_video_submitted", video.id, {
      youtubeId,
      title: input.title,
      scope: input.scope,
      approvalStatus,
    });

    return video;
  });
}

/**
 * Browse/search learning videos with ZERO YouTube API quota cost (`EE.7`).
 * Combines the school's own saved videos and NEYO Ops approved national videos (`scope: "NATIONAL"`).
 */
export async function listLearningVideos(
  user: SessionUser,
  query: ListLearningVideosQuery
): Promise<LearningVideoItem[]> {
  const whereFilters: any = {};
  if (query.subjectId) whereFilters.subjectId = query.subjectId;
  if (query.strandId) whereFilters.strandId = query.strandId;
  if (query.substrandId) whereFilters.substrandId = query.substrandId;
  if (query.grade) whereFilters.grade = query.grade;
  if (query.search) {
    whereFilters.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  // 1. Fetch school-specific videos
  const schoolVideos = await withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const whereSchool = { ...whereFilters };
    if (query.scope === "SCHOOL") whereSchool.scope = "SCHOOL";
    else if (query.scope === "NATIONAL") whereSchool.scope = "NATIONAL";

    return tdb.learningVideo.findMany({
      where: whereSchool,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { name: true } },
        strand: { select: { name: true } },
        substrand: { select: { name: true } },
      },
    });
  });

  // 2. Fetch national approved videos across all tenants if scope allows
  let nationalVideos: any[] = [];
  if (query.scope === "ALL" || query.scope === "NATIONAL") {
    const whereNational = {
      ...whereFilters,
      scope: "NATIONAL",
      approvalStatus: "APPROVED",
      tenantId: { not: user.tenantId }, // avoid duplicates if school owns one
    };
    nationalVideos = await db.learningVideo.findMany({
      where: whereNational,
      orderBy: { approvedAt: "desc" },
      take: 100,
      include: {
        subject: { select: { name: true } },
        strand: { select: { name: true } },
        substrand: { select: { name: true } },
      },
    });
  }

  const combined = [...schoolVideos, ...nationalVideos];

  return combined.map((v) => ({
    id: v.id,
    youtubeId: v.youtubeId,
    title: v.title,
    description: v.description,
    channelTitle: v.channelTitle || "Educational Channel",
    thumbnailUrl: v.thumbnailUrl || `https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`,
    savedById: v.savedById,
    savedByName: v.savedByName,
    subjectId: v.subjectId,
    strandId: v.strandId,
    substrandId: v.substrandId,
    grade: v.grade,
    scope: v.scope,
    approvalStatus: v.approvalStatus,
    approvedByName: v.approvedByName,
    approvedAt: v.approvedAt ? new Date(v.approvedAt).toISOString() : null,
    rejectionReason: v.rejectionReason,
    subjectName: v.subject?.name ?? null,
    strandName: v.strand?.name ?? null,
    substrandName: v.substrand?.name ?? null,
    createdAt: new Date(v.createdAt).toISOString(),
  }));
}

/** NEYO Ops only: list all pending national YouTube learning video submissions across every school tenant. */
export async function listPendingNationalVideos(opsUser: SessionUser) {
  if (!["FOUNDER", "SUPER_ADMIN", "NEYO_OPS"].includes(opsUser.role)) {
    throw new YouTubeLearningError("FORBIDDEN", "Only NEYO Ops can review national video submissions.");
  }

  const rows = await db.learningVideo.findMany({
    where: { scope: "NATIONAL", approvalStatus: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      tenant: { select: { name: true } },
      subject: { select: { name: true, code: true } },
      strand: { select: { name: true } },
      substrand: { select: { name: true } },
    },
  });

  return rows.map((r) => ({
    ...r,
    schoolName: r.tenant.name,
    subjectName: r.subject?.name ?? null,
    strandName: r.strand?.name ?? null,
    substrandName: r.substrand?.name ?? null,
  }));
}

/** NEYO Ops only: decide (`APPROVED` vs `REJECTED`) on a pending national YouTube video submission. */
export async function decideNationalVideoSubmission(opsUser: SessionUser, input: OpsDecideLearningVideoInput) {
  if (!["FOUNDER", "SUPER_ADMIN", "NEYO_OPS"].includes(opsUser.role)) {
    throw new YouTubeLearningError("FORBIDDEN", "Only NEYO Ops can decide national video submissions.");
  }

  const video = await db.learningVideo.findUnique({ where: { id: input.videoId } });
  if (!video) throw new YouTubeLearningError("NOT_FOUND", "Learning video not found in repository.");

  const updated = await db.learningVideo.update({
    where: { id: input.videoId },
    data: {
      approvalStatus: input.status,
      approvedById: input.status === "APPROVED" ? opsUser.id : null,
      approvedByName: input.status === "APPROVED" ? ((opsUser as any).fullName || "NEYO Ops") : null,
      approvedAt: input.status === "APPROVED" ? new Date() : null,
      rejectionReason: input.status === "REJECTED" ? (input.rejectionReason || "Did not meet curriculum quality standards.") : null,
    } as never,
  });

  return updated;
}

/**
 * Live search against YouTube Data API v3 if API key and daily quota permit (`search.list` = 100 units).
 * Automatically falls back to local database matches when unconfigured or out of quota.
 */
export async function searchLiveYouTubeIfQuotaAllowed(user: SessionUser, queryString: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return {
      source: "LOCAL_DATABASE_FALLBACK",
      message: "Live YouTube API search is currently disabled (no YOUTUBE_API_KEY). Showing instant matches from our zero-quota national repository (`EE.7`).",
      videos: await listLearningVideos(user, { search: queryString, scope: "ALL" }),
    };
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(
      queryString + " educational lesson"
    )}&type=video&key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      throw new Error(`YouTube API returned ${res.status}`);
    }
    const json = await res.json();
    const items = (json.items || []).map((item: any) => ({
      id: item.id.videoId,
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
      savedById: "",
      savedByName: "YouTube Live Search",
      scope: "NEW_LIVE",
      approvalStatus: "UNSAVED",
    }));

    return {
      source: "LIVE_YOUTUBE_API",
      message: `Found ${items.length} live matches from YouTube (100 API quota units used). Click "Save & Link to Strand" to preserve for zero-quota future viewing (EE.7).`,
      videos: items,
    };
  } catch (err) {
    return {
      source: "LOCAL_DATABASE_FALLBACK",
      message: "Live YouTube search quota exceeded or network timeout. Showing instant matches from our zero-quota national repository (EE.7).",
      videos: await listLearningVideos(user, { search: queryString, scope: "ALL" }),
    };
  }
}

/**
 * Idempotently seed our curated KICD YouTube Learning Library (`EE.7`).
 * Links exact educational videos to real subjects, strands, and sub-strands across Kenya.
 */
export async function seedAllYouTubeLearningVideos(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    let seededCount = 0;
    let skippedCount = 0;

    const allYouTubeSeeds = [...KICD_YOUTUBE_VIDEO_SEEDS, ...KICD_YOUTUBE_VIDEO_SEEDS_PART2, ...KICD_YOUTUBE_VIDEO_SEEDS_PART3, ...KICD_YOUTUBE_VIDEO_SEEDS_PART4];
    for (const seed of allYouTubeSeeds) {
      let subj = await tdb.subject.findFirst({ where: { code: seed.subjectCode } });
      if (!subj) {
        const namesMap: Record<string, string> = {
          MAT: "Mathematics", ENG: "English", KIS: "Kiswahili", ISC: "Integrated Science",
          SST: "Social Studies", PTS: "Pre-Technical Studies", AGN: "Agriculture & Nutrition",
          CAS: "Creative Arts & Sports", CRE: "Christian Religious Education", ENV: "Environmental Activities",
          MATC: "Core Mathematics", MATE: "Essential Mathematics", CSL: "Community Service Learning",
          PHY: "Physics", CHE: "Chemistry", BIO: "Biology", CSC: "Computer Studies", BST: "Business Studies",
          AGR: "Agriculture", GEO: "Geography", HIS: "History and Citizenship",
        };
        subj = await tdb.subject.create({
          data: {
            tenantId: user.tenantId,
            name: namesMap[seed.subjectCode] || seed.subjectCode,
            code: seed.subjectCode,
            curriculum: "CBC",
          } as never,
        });
      }

      let strand = await tdb.cbcStrand.findFirst({
        where: { subjectId: subj.id, name: `${seed.grade} · ${seed.strandName}` },
      });
      if (!strand) {
        strand = await tdb.cbcStrand.create({
          data: {
            tenantId: user.tenantId,
            subjectId: subj.id,
            name: `${seed.grade} · ${seed.strandName}`,
          } as never,
        });
      }

      let substrand = await tdb.cbcSubstrand.findFirst({
        where: { strandId: strand.id, name: seed.substrandName },
      });
      if (!substrand) {
        substrand = await tdb.cbcSubstrand.create({
          data: {
            tenantId: user.tenantId,
            strandId: strand.id,
            name: seed.substrandName,
          } as never,
        });
      }

      const exists = await tdb.learningVideo.findFirst({
        where: {
          tenantId: user.tenantId,
          youtubeId: seed.youtubeId,
        },
      });
      if (exists) {
        skippedCount++;
        continue;
      }

      await tdb.learningVideo.create({
        data: {
          tenantId: user.tenantId,
          youtubeId: seed.youtubeId,
          title: seed.title,
          description: seed.description,
          channelTitle: seed.channelTitle,
          thumbnailUrl: `https://img.youtube.com/vi/${seed.youtubeId}/hqdefault.jpg`,
          savedById: user.id,
          savedByName: (user as any).fullName || "KICD Curriculum Repository",
          subjectId: subj.id,
          strandId: strand.id,
          substrandId: substrand.id,
          grade: seed.grade,
          scope: "NATIONAL",
          approvalStatus: "APPROVED",
          approvedById: user.id,
          approvedByName: "NEYO Ops Master Registry",
          approvedAt: new Date(),
        } as never,
      });
      seededCount++;
    }

    await audit(user, "academics.youtube_library_seeded", "ALL_STRANDS", {
      seededCount,
      skippedCount,
    });

    return { seededCount, skippedCount };
  });
}
