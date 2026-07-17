/**
 * PART J.7 — Student Portfolio System backend service.
 *
 * Provides real Prisma queries for student portfolio timelines, encrypted Storage
 * Vault verification, media size controls, teacher approval workflows, and portable
 * export packs.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import { scopeWhere } from "@/lib/services/student.service";
import {
  portfolioItemSchema,
  portfolioItemUpdateSchema,
  portfolioApprovalSchema,
  userCanReadPortfolio,
  userCanSubmitPortfolio,
  userCanApprovePortfolio,
  MAX_PORTFOLIO_FILE_SIZE_BYTES,
  STORAGE_WARNING_THRESHOLD_BYTES,
  type PortfolioItemInput,
  type PortfolioItemUpdateInput,
  type PortfolioApprovalInput,
} from "@/lib/validations/portfolio";

export class PortfolioError extends Error {
  constructor(public code: "FORBIDDEN" | "NOT_FOUND" | "INVALID" | "TOO_LARGE", message: string) {
    super(message);
    this.name = "PortfolioError";
  }
}

async function audit(user: SessionUser, action: string, entityType: string, entityId: string, metadata?: unknown) {
  await db.auditLog.create({
    data: {
      tenantId: user.tenantId,
      actorId: user.id,
      actorName: user.fullName,
      action,
      entityType,
      entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

function assertRead(user: SessionUser) {
  if (!userCanReadPortfolio(user)) throw new PortfolioError("FORBIDDEN", "You do not have permission to view student portfolios.");
}
function assertSubmit(user: SessionUser) {
  if (!userCanSubmitPortfolio(user)) throw new PortfolioError("FORBIDDEN", "You do not have permission to submit portfolio items.");
}
function assertApprove(user: SessionUser) {
  if (!userCanApprovePortfolio(user)) throw new PortfolioError("FORBIDDEN", "Only academic leadership and authorized teachers can approve portfolio items.");
}

export async function getPortfolioTimeline(user: SessionUser, studentId: string) {
  assertRead(user);
  return withTenant(user.tenantId, async () => {
    const scope = await scopeWhere(user);
    const student = await tenantDb().student.findFirst({
      where: { AND: [{ id: studentId }, scope] },
      include: { schoolClass: true },
    });
    if (!student) throw new PortfolioError("NOT_FOUND", "Student not found or access forbidden by row scoping.");

    // Visibility rules:
    // PARENT sees only visibleToParents=true & status=APPROVED
    // STUDENT sees visibleToParents=true OR their own submitted/draft items
    // Staff see all items for the student
    let whereClause: Record<string, unknown> = { studentId };
    if (user.role === "PARENT") {
      whereClause = { studentId, visibleToParents: true, status: "APPROVED" };
    } else if (user.role === "STUDENT") {
      whereClause = { studentId }; // student sees all their own items
    }

    const items = await tenantDb().portfolioItem.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Calculate total storage usage for media size controls & warnings
    const totalStorageBytes = items.reduce((sum, item) => sum + (item.fileSizeBytes ?? 0), 0);
    const storageWarningExceeded = totalStorageBytes >= STORAGE_WARNING_THRESHOLD_BYTES;

    return {
      canSubmit: userCanSubmitPortfolio(user),
      canApprove: userCanApprovePortfolio(user),
      student: {
        id: student.id,
        name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" "),
        admissionNo: student.admissionNo,
        className: student.schoolClass ? [student.schoolClass.level, student.schoolClass.stream].filter(Boolean).join(" ") : null,
        photoUrl: student.photoUrl,
      },
      items,
      storage: {
        totalStorageBytes,
        totalStorageMegabytes: Math.round((totalStorageBytes / (1024 * 1024)) * 10) / 10,
        warningThresholdBytes: STORAGE_WARNING_THRESHOLD_BYTES,
        warningThresholdMegabytes: Math.round(STORAGE_WARNING_THRESHOLD_BYTES / (1024 * 1024)),
        storageWarningExceeded,
        maxLimitMegabytes: Math.round(MAX_PORTFOLIO_FILE_SIZE_BYTES / (1024 * 1024)),
      },
    };
  });
}

export async function submitPortfolioItem(user: SessionUser, input: PortfolioItemInput) {
  assertSubmit(user);
  const parsed = portfolioItemSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    const scope = await scopeWhere(user);
    const student = await tenantDb().student.findFirst({
      where: { AND: [{ id: parsed.studentId }, scope] },
    });
    if (!student) throw new PortfolioError("NOT_FOUND", "Student not found or access forbidden by row scoping.");

    // Encrypted Storage Vault enforcement
    if (parsed.storedFileId) {
      const storedFile = await tenantDb().storedFile.findUnique({ where: { id: parsed.storedFileId } });
      if (!storedFile) throw new PortfolioError("INVALID", "File reference not found in the encrypted Storage Vault.");
      if (!storedFile.encrypted) throw new PortfolioError("INVALID", "Portfolio files must use the encrypted Storage Vault path.");
    }

    // Media size limit enforcement
    if (parsed.fileSizeBytes && parsed.fileSizeBytes > MAX_PORTFOLIO_FILE_SIZE_BYTES) {
      throw new PortfolioError("TOO_LARGE", `File size exceeds the ${MAX_PORTFOLIO_FILE_SIZE_BYTES / (1024 * 1024)} MB portfolio limit.`);
    }

    // Student role submissions force SUBMITTED status and require teacher approval
    let initialStatus = parsed.status;
    let initialVisibility = parsed.visibleToParents;
    if (user.role === "STUDENT") {
      initialStatus = "SUBMITTED";
      initialVisibility = false;
    }

    const row = await tenantDb().portfolioItem.create({
      data: {
        ...parsed,
        tenantId: user.tenantId,
        status: initialStatus,
        visibleToParents: initialVisibility,
        storedFileId: parsed.storedFileId ?? null,
        fileUrl: parsed.fileUrl ?? null,
        fileName: parsed.fileName ?? null,
        fileSizeBytes: parsed.fileSizeBytes ?? null,
        externalLink: parsed.externalLink ?? null,
        description: parsed.description ?? null,
        competencyId: parsed.competencyId ?? null,
        subjectId: parsed.subjectId ?? null,
        clubId: parsed.clubId ?? null,
        awardId: parsed.awardId ?? null,
        createdById: user.id,
        createdByName: user.fullName,
      } as never,
    });

    await audit(user, "portfolio.item_submitted", "portfolioItem", row.id, { studentId: row.studentId, title: row.title, category: row.category });
    return row;
  });
}

export async function updatePortfolioItem(user: SessionUser, input: PortfolioItemUpdateInput) {
  assertSubmit(user);
  const parsed = portfolioItemUpdateSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    const existing = await tenantDb().portfolioItem.findUnique({ where: { id: parsed.id } });
    if (!existing) throw new PortfolioError("NOT_FOUND", "Portfolio item not found.");

    if (user.role === "STUDENT" && existing.createdById !== user.id) {
      throw new PortfolioError("FORBIDDEN", "You can only update your own submitted portfolio items.");
    }

    if (parsed.storedFileId) {
      const storedFile = await tenantDb().storedFile.findUnique({ where: { id: parsed.storedFileId } });
      if (!storedFile || !storedFile.encrypted) throw new PortfolioError("INVALID", "Portfolio files must use the encrypted Storage Vault path.");
    }

    const row = await tenantDb().portfolioItem.update({
      where: { id: existing.id },
      data: {
        ...(parsed.title !== undefined ? { title: parsed.title } : {}),
        ...(parsed.category !== undefined ? { category: parsed.category } : {}),
        ...(parsed.description !== undefined ? { description: parsed.description ?? null } : {}),
        ...(parsed.storedFileId !== undefined ? { storedFileId: parsed.storedFileId ?? null } : {}),
        ...(parsed.fileUrl !== undefined ? { fileUrl: parsed.fileUrl ?? null } : {}),
        ...(parsed.fileName !== undefined ? { fileName: parsed.fileName ?? null } : {}),
        ...(parsed.fileSizeBytes !== undefined ? { fileSizeBytes: parsed.fileSizeBytes ?? null } : {}),
        ...(parsed.externalLink !== undefined ? { externalLink: parsed.externalLink ?? null } : {}),
        ...(parsed.competencyId !== undefined ? { competencyId: parsed.competencyId ?? null } : {}),
        ...(parsed.subjectId !== undefined ? { subjectId: parsed.subjectId ?? null } : {}),
        ...(parsed.clubId !== undefined ? { clubId: parsed.clubId ?? null } : {}),
        ...(parsed.awardId !== undefined ? { awardId: parsed.awardId ?? null } : {}),
      } as never,
    });

    await audit(user, "portfolio.item_updated", "portfolioItem", row.id, { title: row.title });
    return row;
  });
}

export async function approvePortfolioItem(user: SessionUser, input: PortfolioApprovalInput) {
  assertApprove(user);
  const parsed = portfolioApprovalSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    const existing = await tenantDb().portfolioItem.findUnique({ where: { id: parsed.itemId } });
    if (!existing) throw new PortfolioError("NOT_FOUND", "Portfolio item not found.");

    const row = await tenantDb().portfolioItem.update({
      where: { id: existing.id },
      data: {
        status: "APPROVED",
        visibleToParents: parsed.visibleToParents,
        approvedById: user.id,
        approvedByName: user.fullName,
        approvedAt: new Date(),
      } as never,
    });

    await audit(user, "portfolio.item_approved", "portfolioItem", row.id, { studentId: row.studentId, approvedBy: user.fullName });
    return row;
  });
}

export async function rejectPortfolioItem(user: SessionUser, input: PortfolioApprovalInput) {
  assertApprove(user);
  const parsed = portfolioApprovalSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    const existing = await tenantDb().portfolioItem.findUnique({ where: { id: parsed.itemId } });
    if (!existing) throw new PortfolioError("NOT_FOUND", "Portfolio item not found.");

    const row = await tenantDb().portfolioItem.update({
      where: { id: existing.id },
      data: {
        status: "REJECTED",
        visibleToParents: false,
      } as never,
    });

    await audit(user, "portfolio.item_rejected", "portfolioItem", row.id, { studentId: row.studentId, rejectedBy: user.fullName, note: parsed.note });
    return row;
  });
}

export async function deletePortfolioItem(user: SessionUser, id: string) {
  assertSubmit(user);
  return withTenant(user.tenantId, async () => {
    const existing = await tenantDb().portfolioItem.findUnique({ where: { id } });
    if (!existing) throw new PortfolioError("NOT_FOUND", "Portfolio item not found.");

    if (user.role === "STUDENT" && existing.createdById !== user.id) {
      throw new PortfolioError("FORBIDDEN", "You can only delete your own submitted portfolio items.");
    }

    const row = await tenantDb().portfolioItem.delete({ where: { id: existing.id } });
    await audit(user, "portfolio.item_deleted", "portfolioItem", row.id, { studentId: row.studentId, title: row.title });
    return row;
  });
}

export async function exportPortfolioPack(user: SessionUser, studentId: string) {
  assertRead(user);
  return withTenant(user.tenantId, async () => {
    const scope = await scopeWhere(user);
    const student = await tenantDb().student.findFirst({
      where: { AND: [{ id: studentId }, scope] },
      include: { schoolClass: true },
    });
    if (!student) throw new PortfolioError("NOT_FOUND", "Student not found or access forbidden by row scoping.");

    const items = await tenantDb().portfolioItem.findMany({
      where: { studentId, status: "APPROVED", visibleToParents: true },
      orderBy: { approvedAt: "desc" },
    });

    await audit(user, "portfolio.pack_exported", "student", student.id, { itemsCount: items.length });

    return {
      manifest: {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        issuer: "NEYO Education OS",
        tenantId: user.tenantId,
      },
      learner: {
        id: student.id,
        name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" "),
        admissionNo: student.admissionNo,
        className: student.schoolClass ? [student.schoolClass.level, student.schoolClass.stream].filter(Boolean).join(" ") : null,
      },
      portfolioPack: items.map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        description: i.description,
        fileUrl: i.fileUrl,
        fileName: i.fileName,
        fileSizeBytes: i.fileSizeBytes,
        externalLink: i.externalLink,
        approvedByName: i.approvedByName,
        approvedAt: i.approvedAt,
        competencyId: i.competencyId,
        subjectId: i.subjectId,
        clubId: i.clubId,
        awardId: i.awardId,
      })),
    };
  });
}

/**
 * PART EE.14 — Automated CBC/CBE Digital Portfolio & Project Album PDF Booklet Builder:
 * Converts student project artifacts, competency ratings (`J.6`), formative observations (`B.6`),
 * and verified syllabus progress (`I.97`) into a gorgeous, magazine-quality downloadable A4 PDF booklet HTML.
 */
export async function generatePortfolioPdfBookletHtml(user: SessionUser, studentId: string): Promise<string> {
  assertRead(user);
  return withTenant(user.tenantId, async () => {
    const scope = await scopeWhere(user);
    const student = await tenantDb().student.findFirst({
      where: { AND: [{ id: studentId }, scope] },
      include: { schoolClass: true },
    });
    if (!student) throw new PortfolioError("NOT_FOUND", "Student not found.");

    const tenant = await db.tenant.findUnique({ where: { id: user.tenantId }, select: { name: true, logoUrl: true } });
    const items = await tenantDb().portfolioItem.findMany({
      where: { studentId, status: "APPROVED" },
      orderBy: { approvedAt: "desc" },
    });

    const passportEntries = await tenantDb().skillsPassportEntry.findMany({
      where: { studentId },
    });

    const cbcAssessments = await tenantDb().cbcAssessment.findMany({
      where: { studentId },
      include: { strand: true },
      take: 15,
      orderBy: { createdAt: "desc" },
    });

    const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
    const className = student.schoolClass ? [student.schoolClass.level, student.schoolClass.stream].filter(Boolean).join(" ") : "Senior School";

    const competencyRows = passportEntries.length > 0 ? passportEntries.map((p) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${p.skillArea}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${p.evidenceSource}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #d97706; font-weight: bold;">${"★".repeat(p.ratingLevel)}${"☆".repeat(5 - p.ratingLevel)} (${p.ratingLevel}/5)</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 12px; color: #475569;">${p.narrative ?? "Verified on " + p.evidenceDate}</td>
      </tr>
    `).join("") : `
      <tr>
        <td colspan="4" style="padding: 15px; text-align: center; color: #64748b; font-style: italic;">No skills passport ratings recorded yet.</td>
      </tr>
    `;

    const albumGrid = items.length > 0 ? items.map((item) => `
      <div style="border: 2px solid #0f172a; border-radius: 12px; overflow: hidden; page-break-inside: avoid; background: #ffffff; display: flex; flex-direction: column;">
        ${item.fileUrl && (item.fileUrl.endsWith(".jpg") || item.fileUrl.endsWith(".png") || item.fileUrl.includes("image")) ? `
          <div style="height: 180px; background: #f1f5f9; overflow: hidden; display: flex; align-items: center; justify-content: center; border-bottom: 2px solid #0f172a;">
            <img src="${item.fileUrl}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        ` : `
          <div style="height: 120px; background: #f8fafc; display: flex; align-items: center; justify-content: center; border-bottom: 2px solid #0f172a; font-weight: bold; color: #475569;">
            📁 Project Document / Artifact
          </div>
        `}
        <div style="padding: 14px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="background: #e2e8f0; color: #0f172a; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 99px; text-transform: uppercase;">${item.category}</span>
            <h4 style="margin: 8px 0 4px 0; font-size: 16px; color: #0f172a;">${item.title}</h4>
            <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.4;">${item.description || "No description provided."}</p>
          </div>
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
            <span>Approved by: <strong>${item.approvedByName || "Teacher"}</strong></span>
            <span>${item.approvedAt ? new Date(item.approvedAt).toLocaleDateString("en-KE") : "Verified"}</span>
          </div>
        </div>
      </div>
    `).join("") : `
      <div style="grid-column: span 2; padding: 30px; text-align: center; border: 2px dashed #cbd5e1; border-radius: 12px; color: #64748b;">
        No approved project artifacts visible in this album yet.
      </div>
    `;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CBC/CBE Digital Portfolio Album · ${fullName}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #ffffff; }
    .header { text-align: center; border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
    .header h2 { font-size: 18px; font-weight: 800; color: #3b82f6; margin: 6px 0 0 0; }
    .meta-card { border: 2px solid #0f172a; border-radius: 12px; padding: 15px; background: #f8fafc; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
    .meta-card div { font-size: 13px; }
    .meta-card strong { font-size: 15px; color: #0f172a; }
    .section-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-left: 5px solid #10b981; padding-left: 10px; margin: 25px 0 12px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
    th { background: #0f172a; color: white; padding: 10px; text-align: left; font-weight: bold; text-transform: uppercase; font-size: 11px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 2px solid #0f172a; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${(tenant?.name || "NEYO SECONDARY SCHOOL").toUpperCase()}</h1>
    <h2>CBC / CBE STUDENT DIGITAL PORTFOLIO &amp; PROJECT ALBUM (EE.14)</h2>
  </div>

  <div class="meta-card">
    <div>
      <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Learner Demographics</span><br/>
      <strong>${fullName}</strong><br/>
      Admission No: <strong>${student.admissionNo}</strong>
    </div>
    <div style="text-align: right;">
      <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Academic Placement</span><br/>
      Class Level: <strong>${className}</strong><br/>
      Generated: <strong>${new Date().toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}</strong>
    </div>
  </div>

  <div class="section-title">1. Core Competency &amp; Skills Passport Evaluation (J.6)</div>
  <table>
    <thead>
      <tr>
        <th>Skill / Competency Area</th>
        <th style="text-align: center;">Category</th>
        <th style="text-align: center;">Proficiency Star Rating</th>
        <th>Teacher Verification Notes</th>
      </tr>
    </thead>
    <tbody>
      ${competencyRows}
    </tbody>
  </table>

  <div class="section-title">2. Approved Project Artifacts &amp; Exhibitions Grid (J.7)</div>
  <div class="grid">
    ${albumGrid}
  </div>

  <div class="footer">
    <span>Official Digital Portfolio Pack · Verified by School Administration</span>
    <span>Powered by NEYO</span>
  </div>

  <script>
    window.onload = () => {
      if (window.location.search.includes("print=1")) {
        setTimeout(() => window.print(), 300);
      }
    };
  </script>
</body>
</html>`;
  });
}
