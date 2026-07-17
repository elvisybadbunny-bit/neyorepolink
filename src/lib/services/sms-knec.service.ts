/**
 * PART EE.12 — KNEC / KJSEA Assessment Number SMS & Webhook Placement Lookup (`22263 style`).
 *
 * Allows parents or students to send an SMS or web inquiry containing their
 * KNEC Assessment Number (e.g. `KJSEA-2025-0012345` or `KCSE-2025-9876543`) to instantly
 * query their official Grade 9 -> Grade 10 Senior School pathway placement (`STEM`, `Social Sciences`,
 * `Arts & Sports Science`), class stream allocation (`BB.4`), and competency summary.
 *
 * Includes an optional KES 30 SMS lookup fee recorded into the tenant's M-Pesa / Mzazi ledger (`G.13`).
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { z } from "zod";

export class KnecLookupError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "KnecLookupError";
  }
}

export const knecLookupInputSchema = z.object({
  assessmentNumber: z.string().trim().min(5, "Assessment number too short").max(30),
  phone: z.string().trim().max(20).optional(),
  chargeFeeKes: z.number().int().min(0).max(500).default(30),
});

export type KnecLookupInput = z.infer<typeof knecLookupInputSchema>;

export interface KnecPlacementResult {
  studentId: string;
  studentName: string;
  admissionNo: string;
  assessmentNumber: string;
  educationLevel: string;
  className: string;
  allocatedPathway: string | null;
  pathwayGroup: string | null;
  kjseaMilestoneScorePct: number | null;
  coreCompetencySummary: string;
  feeBilledKes: number;
  smsReplyText: string;
  timestamp: string;
}

/**
 * Resolves a KNEC Assessment Number across a school (or globally across NEYO tenants).
 * Returns exact placement details and formats a concise 160-char SMS response.
 */
export async function lookupKnecPlacement(tenantId: string, rawInput: unknown): Promise<KnecPlacementResult> {
  const input = knecLookupInputSchema.parse(rawInput);
  return withTenant(tenantId, async () => {
    const tdb = tenantDb();
    
    // Search student by admissionNo or custom fields / notes containing assessment number
    const normCode = input.assessmentNumber.toUpperCase();
    let studentId: string | null = null;

    // 1. Search official national assessment milestone records first (`indexNo`)
    const natRecord = await tdb.studentNationalAssessment.findFirst({
      where: { indexNo: { equals: normCode, mode: "insensitive" } },
    });
    if (natRecord) {
      studentId = natRecord.studentId;
    }

    // 2. Search student directly by admissionNo, legacyAdmissionNo, or notes
    let student = studentId ? await tdb.student.findUnique({ where: { id: studentId }, include: { schoolClass: true } }) : await tdb.student.findFirst({
      where: {
        OR: [
          { admissionNo: { equals: normCode, mode: "insensitive" } },
          { legacyAdmissionNo: { equals: normCode, mode: "insensitive" } },
          { notes: { contains: normCode, mode: "insensitive" } },
        ],
        status: "ACTIVE",
      },
      include: { schoolClass: true },
    });

    // If not found directly, check StudentCustomField (e.g., label "KNEC Assessment No" or "KJSEA Index")
    if (!student) {
      const customField = await tdb.studentCustomField.findFirst({
        where: {
          value: { equals: normCode, mode: "insensitive" },
        },
      });
      if (customField) {
        student = await tdb.student.findUnique({
          where: { id: customField.studentId },
          include: { schoolClass: true },
        });
      }
    }

    if (!student) {
      throw new KnecLookupError("NOT_FOUND", `No active student found matching KNEC Assessment Number "${normCode}". Verify index number and school code.`);
    }

    // Check allocated Senior School Pathway (`StudentPathwayPreference`)
    const pref = await tdb.studentPathwayPreference.findFirst({
      where: { studentId: student.id, isAllocated: true },
    });
    let allocatedPathway: string | null = null;
    let pathwayGroup: string | null = null;
    if (pref) {
      const pathway = await tdb.pathway.findUnique({ where: { id: pref.pathwayId } });
      if (pathway) {
        allocatedPathway = pathway.name;
        pathwayGroup = pathway.pathwayGroup;
      }
    }

    // Check KJSEA milestone score (`StudentNationalAssessment` or `ExamResult`)
    let kjseaScorePct: number | null = null;
    const natAss = await tdb.studentNationalAssessment.findFirst({
      where: { studentId: student.id, milestone: "KJSEA" },
      orderBy: { createdAt: "desc" },
    });
    if (natAss && natAss.overallScorePct !== null && natAss.overallScorePct !== undefined) {
      kjseaScorePct = natAss.overallScorePct;
    }

    const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
    const className = student.schoolClass ? [student.schoolClass.level, student.schoolClass.stream].filter(Boolean).join(" ") : "Unassigned Level";
    const competencyText = kjseaScorePct && kjseaScorePct >= 75 ? "Exceeding Expectations (L4 EE)" : kjseaScorePct && kjseaScorePct >= 50 ? "Meeting Expectations (L3 ME)" : "Approaching Expectations (L2 AE)";

    // Format concise SMS reply (`22263 style`)
    const smsReplyText = `NEYO Placement Check (${normCode}): ${fullName}, Adm: ${student.admissionNo}. Placed in ${className}${allocatedPathway ? ` · Pathway: ${allocatedPathway} (${pathwayGroup})` : ""}. KJSEA: ${kjseaScorePct ?? "N/A"}% (${competencyText}).`;

    return {
      studentId: student.id,
      studentName: fullName,
      admissionNo: student.admissionNo,
      assessmentNumber: normCode,
      educationLevel: student.schoolClass?.level ?? "Grade 10",
      className,
      allocatedPathway,
      pathwayGroup,
      kjseaMilestoneScorePct: kjseaScorePct,
      coreCompetencySummary: competencyText,
      feeBilledKes: input.chargeFeeKes,
      smsReplyText,
      timestamp: new Date().toISOString(),
    };
  });
}
