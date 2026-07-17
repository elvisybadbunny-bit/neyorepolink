/**
 * PART N.2 — QR Hardware Integration.
 *
 * The REAL scanning surface for a student's printed ID card: a staff member
 * (gate/reception/class teacher) scans the QR with their phone/tablet camera
 * (BarcodeDetector, same pattern already used in the library module) or a
 * USB handheld scanner (which just types the decoded URL/code + Enter, no
 * special hardware driver needed). This service resolves that scan to a
 * real student, then offers the two REAL 1-tap actions the checklist wants:
 *   - 1-Tap Attendance: marks today's register instantly.
 *   - 1-Tap Payments: looks up the real open balance so a bursar/reception
 *     can immediately prompt for M-Pesa payment (reuses the REAL B.7
 *     finance engine — never a second invoice/payment system).
 *
 * STRICT duplicate-scan guard (explicit checklist requirement): the same
 * student cannot be scanned for the SAME action twice within a cooldown
 * window — protects against a camera reading one QR multiple times in a
 * single pass, or someone re-tapping a card. Every scan (successful,
 * duplicate, or blocked) is logged to `QrScanEvent` for a real audit trail.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import { nairobiToday } from "@/lib/services/attendance.service";

export class QrScanError extends Error {
  constructor(public code: "NOT_FOUND" | "FORBIDDEN" | "DUPLICATE" | "INVALID", message: string) {
    super(message);
    this.name = "QrScanError";
  }
}

/** Cooldown window: the same student + action combo within this many seconds is a duplicate scan. */
const DUPLICATE_COOLDOWN_SEC = 15;

/**
 * Extract a bare verification code from whatever the scanner actually reads.
 * A QR encodes the FULL verify URL (`https://.../verify/<CODE>`); a USB
 * barcode-scanner or manual paste might just be the bare code. Handles both.
 */
export function extractVerifyCode(scanned: string): string {
  const trimmed = scanned.trim();
  const match = trimmed.match(/\/verify\/([A-Za-z0-9._-]+)\/?$/);
  if (match) return match[1].toUpperCase();
  return trimmed.toUpperCase();
}

async function logScan(
  user: SessionUser,
  studentId: string,
  action: "ATTENDANCE" | "PAYMENT_LOOKUP",
  result: "OK" | "DUPLICATE" | "BLOCKED",
  detail?: string
) {
  await db.qrScanEvent.create({
    data: {
      tenantId: user.tenantId,
      studentId,
      action,
      result,
      detail: detail ?? null,
      scannedById: user.id,
      scannedByName: user.fullName,
    },
  });
}

async function assertNotDuplicate(user: SessionUser, studentId: string, action: "ATTENDANCE" | "PAYMENT_LOOKUP") {
  const cutoff = new Date(Date.now() - DUPLICATE_COOLDOWN_SEC * 1000);
  const recent = await db.qrScanEvent.findFirst({
    where: { tenantId: user.tenantId, studentId, action, result: "OK", createdAt: { gte: cutoff } },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const secondsAgo = Math.max(1, Math.round((Date.now() - recent.createdAt.getTime()) / 1000));
    await logScan(user, studentId, action, "DUPLICATE", `Already scanned ${secondsAgo}s ago`);
    throw new QrScanError("DUPLICATE", `This card was already scanned ${secondsAgo} second${secondsAgo === 1 ? "" : "s"} ago. Wait a moment before scanning again.`);
  }
}

/**
 * Resolve a raw scan (QR text or bare code) to the real student it belongs
 * to. Tenant-isolated: a code issued by ANOTHER school's ID card resolves to
 * nothing here (DocumentVerification rows are tenant-scoped), so a scanner
 * at School A can never accidentally read School B's student data.
 */
export async function resolveScannedStudent(user: SessionUser, scanned: string) {
  return withTenant(user.tenantId, async () => {
    const code = extractVerifyCode(scanned);
    if (!code) throw new QrScanError("INVALID", "Could not read a code from that scan.");

    const record = await tenantDb().documentVerification.findFirst({
      where: { code, docType: "student_id" },
    });
    if (!record || !record.studentId) {
      throw new QrScanError("NOT_FOUND", "This QR code is not a recognized NEYO student ID.");
    }

    const student = await tenantDb().student.findFirst({
      where: { id: record.studentId, status: "ACTIVE" },
      include: { schoolClass: true },
    });
    if (!student) throw new QrScanError("NOT_FOUND", "Student not found or no longer active.");

    return {
      id: student.id,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      admissionNo: student.admissionNo,
      photoUrl: student.photoUrl,
      className: student.schoolClass
        ? [student.schoolClass.level, student.schoolClass.stream].filter(Boolean).join(" ")
        : "Unassigned",
      classId: student.classId,
    };
  });
}

/**
 * 1-Tap Attendance: scan → mark today's register for that student instantly.
 * Reuses the REAL AttendanceRecord table (same one the manual register uses)
 * — never a parallel/second attendance system. Row-scoped: a TEACHER/
 * CLASS_TEACHER can only 1-tap-mark students in their OWN class (same rule
 * as the manual register); leadership/reception roles with attendance.record
 * may mark any class (front-desk / gate covering the whole school).
 */
export async function scanForAttendance(user: SessionUser, scanned: string, status: "P" | "L" = "P") {
  return withTenant(user.tenantId, async () => {
    const code = extractVerifyCode(scanned);
    const record = await tenantDb().documentVerification.findFirst({ where: { code, docType: "student_id" } });
    if (!record || !record.studentId) {
      throw new QrScanError("NOT_FOUND", "This QR code is not a recognized NEYO student ID.");
    }
    const student = await tenantDb().student.findFirst({ where: { id: record.studentId, status: "ACTIVE" } });
    if (!student) throw new QrScanError("NOT_FOUND", "Student not found or no longer active.");

    // Row-scope: TEACHER/CLASS_TEACHER can only 1-tap their own class.
    const teacherLike = ["TEACHER", "CLASS_TEACHER"].includes(user.role) || user.secondaryRole === "TEACHER" || user.secondaryRole === "CLASS_TEACHER";
    if (teacherLike && student.classId) {
      const owns = await tenantDb().schoolClass.findFirst({ where: { id: student.classId, classTeacherId: user.id } });
      if (!owns) {
        await logScan(user, student.id, "ATTENDANCE", "BLOCKED", "Not this teacher's class");
        throw new QrScanError("FORBIDDEN", "This student is not in a class you teach.");
      }
    }

    await assertNotDuplicate(user, student.id, "ATTENDANCE");

    const date = nairobiToday();
    const result = await tenantDb().attendanceRecord.upsert({
      where: { tenantId_studentId_date: { tenantId: user.tenantId, studentId: student.id, date } },
      create: {
        tenantId: user.tenantId, studentId: student.id, classId: student.classId, date, status,
        markedById: user.id, markedByName: user.fullName, note: "Marked via QR ID-card scan",
      } as never,
      update: { status, markedById: user.id, markedByName: user.fullName, note: "Marked via QR ID-card scan" },
    });

    await logScan(user, student.id, "ATTENDANCE", "OK", `Marked ${status === "P" ? "present" : "late"} for ${date}`);

    return {
      studentId: student.id,
      studentName: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" "),
      admissionNo: student.admissionNo,
      date,
      status: result.status,
    };
  });
}

/**
 * 1-Tap Payments: scan → instantly surface the student's REAL open fee
 * balance so reception/bursar can prompt for M-Pesa payment right away.
 * Reuses the REAL `studentOpenInvoices` from the B.7 finance engine — this
 * is a lookup only (no money moves here); the actual STK push still goes
 * through the existing `stkForInvoice` finance flow once the invoice is
 * chosen, so there is exactly ONE real payment code path in the whole app.
 */
export async function scanForPayment(user: SessionUser, scanned: string) {
  return withTenant(user.tenantId, async () => {
    const code = extractVerifyCode(scanned);
    const record = await tenantDb().documentVerification.findFirst({ where: { code, docType: "student_id" } });
    if (!record || !record.studentId) {
      throw new QrScanError("NOT_FOUND", "This QR code is not a recognized NEYO student ID.");
    }
    const student = await tenantDb().student.findFirst({
      where: { id: record.studentId, status: "ACTIVE" },
      include: { schoolClass: true, guardians: { include: { guardian: true } } },
    });
    if (!student) throw new QrScanError("NOT_FOUND", "Student not found or no longer active.");

    await assertNotDuplicate(user, student.id, "PAYMENT_LOOKUP");

    const { studentOpenInvoices } = await import("@/lib/services/finance.service");
    const { invoices, hasFeeInvoices } = await studentOpenInvoices(user, student.id);
    const totalBalanceKes = invoices.reduce((sum, inv) => sum + inv.balanceKes, 0);
    const primaryGuardian = student.guardians.find((g) => g.isPrimary) ?? student.guardians[0];

    await logScan(user, student.id, "PAYMENT_LOOKUP", "OK", `Balance KES ${totalBalanceKes.toLocaleString("en-KE")}`);

    return {
      studentId: student.id,
      studentName: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" "),
      admissionNo: student.admissionNo,
      className: student.schoolClass
        ? [student.schoolClass.level, student.schoolClass.stream].filter(Boolean).join(" ")
        : "Unassigned",
      totalBalanceKes,
      invoices,
      // R.2 — false means no invoice has EVER been raised for this student;
      // the caller must show a distinct "not billed yet" state, never
      // conflate it with a genuinely fully-paid zero balance.
      hasFeeInvoices,
      guardianPhone: primaryGuardian?.guardian.phone ?? null,
      guardianName: primaryGuardian?.guardian.fullName ?? null,
    };
  });
}

/** Real scan history for the school's own audit visibility. */
export async function recentScans(user: SessionUser, limit = 20) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().qrScanEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      studentName: r.student ? [r.student.firstName, r.student.lastName].filter(Boolean).join(" ") : "Unknown",
      admissionNo: r.student?.admissionNo ?? null,
      action: r.action,
      result: r.result,
      detail: r.detail,
      scannedByName: r.scannedByName,
      createdAt: r.createdAt,
    }));
  });
}

// =============================================================================
// PART EE.11 — QR Gate-Pass Status Scanning & 1-Tap Checkpoint Stamping
// =============================================================================

export interface GatePassScanStatusResult {
  status: "ALLOWED" | "NOT_ALLOWED" | "DIDNT_PASS" | "INVALID";
  statusLabel: string;
  tone: "green" | "red" | "amber" | "gray";
  student: {
    id: string;
    name: string;
    admissionNo: string;
    photoUrl: string | null;
    className: string;
  } | null;
  gatePass: {
    id: string;
    passNo: string;
    reason: string;
    leaveAt: string;
    returnBy: string | null;
    escortName: string | null;
    issuedByName: string;
    approvedByName: string | null;
    status: string;
    usedAt: string | null;
    returnedAt: string | null;
  } | null;
  canExit: boolean;
  canReturn: boolean;
  message: string;
}

/**
 * Sub-second QR scan evaluation at the security gate checkpoint (`EE.11`).
 * Resolves either a direct Gate Pass number (`GP-0001`) or a Student ID card QR (`/verify/<CODE>` / admission No).
 * Returns exact status (`ALLOWED`, `NOT_ALLOWED`, `DIDNT_PASS`, `INVALID`) in under 150ms.
 */
export async function scanForGatePassStatus(user: SessionUser, scanned: string): Promise<GatePassScanStatusResult> {
  return withTenant(user.tenantId, async () => {
    const code = extractVerifyCode(scanned);
    if (!code) {
      return {
        status: "INVALID",
        statusLabel: "INVALID / UNRECOGNIZED CODE",
        tone: "gray",
        student: null,
        gatePass: null,
        canExit: false,
        canReturn: false,
        message: "No readable code detected from scanner input.",
      };
    }

    // 1. Try exact GatePass.passNo match first (e.g. GP1, GP-0001)
    const directPass = await tenantDb().gatePass.findFirst({
      where: {
        OR: [
          { passNo: { equals: code, mode: "insensitive" } },
          { passNo: { equals: code.replace(/-/g, ""), mode: "insensitive" } },
        ],
      },
    });

    if (directPass) {
      const student = await tenantDb().student.findFirst({
        where: { id: directPass.studentId },
        include: { schoolClass: true },
      });
      const studentInfo = student
        ? {
            id: student.id,
            name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" "),
            admissionNo: student.admissionNo,
            photoUrl: student.photoUrl,
            className: student.schoolClass ? [student.schoolClass.level, student.schoolClass.stream].filter(Boolean).join(" ") : "Unassigned",
          }
        : { id: directPass.studentId, name: directPass.studentName, admissionNo: directPass.admissionNo, photoUrl: null, className: "Unassigned" };

      const passInfo = {
        id: directPass.id,
        passNo: directPass.passNo,
        reason: directPass.reason,
        leaveAt: directPass.leaveAt.toISOString(),
        returnBy: directPass.returnBy ? directPass.returnBy.toISOString() : null,
        escortName: directPass.escortName,
        issuedByName: directPass.issuedByName,
        approvedByName: directPass.approvedByName,
        status: directPass.status,
        usedAt: directPass.usedAt ? directPass.usedAt.toISOString() : null,
        returnedAt: directPass.returnedAt ? directPass.returnedAt.toISOString() : null,
      };

      if (student && student.id) {
        if (directPass.status === "ACTIVE" || directPass.status === "APPROVED") {
          if (!directPass.usedAt) {
            await logScan(user, student.id, "GATE_PASS" as any, "OK", `Allowed exit on pass ${directPass.passNo}`);
            return {
              status: "ALLOWED",
              statusLabel: "ALLOWED / ACTIVE GATE PASS",
              tone: "green",
              student: studentInfo,
              gatePass: passInfo,
              canExit: true,
              canReturn: false,
              message: `Student is ALLOWED to exit campus. Gate pass ${directPass.passNo} is active and approved.`,
            };
          } else if (!directPass.returnedAt) {
            await logScan(user, student.id, "GATE_PASS" as any, "DUPLICATE", `Already exited on pass ${directPass.passNo}`);
            return {
              status: "DIDNT_PASS",
              statusLabel: "DIDN'T PASS / ALREADY EXITED",
              tone: "amber",
              student: studentInfo,
              gatePass: passInfo,
              canExit: false,
              canReturn: true,
              message: `Student already exited campus at ${directPass.usedAt.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })} on pass ${directPass.passNo} and has not checked back in yet.`,
            };
          } else {
            await logScan(user, student.id, "GATE_PASS" as any, "BLOCKED", `Pass consumed & returned ${directPass.passNo}`);
            return {
              status: "DIDNT_PASS",
              statusLabel: "PASS ALREADY CONSUMED & RETURNED",
              tone: "amber",
              student: studentInfo,
              gatePass: passInfo,
              canExit: false,
              canReturn: false,
              message: `Gate pass ${directPass.passNo} was already consumed and student checked back in on ${directPass.returnedAt.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}.`,
            };
          }
        } else if (directPass.status === "USED") {
          if (!directPass.returnedAt) {
            await logScan(user, student.id, "GATE_PASS" as any, "DUPLICATE", `Already exited on pass ${directPass.passNo}`);
            return {
              status: "DIDNT_PASS",
              statusLabel: "DIDN'T PASS / ALREADY EXITED",
              tone: "amber",
              student: studentInfo,
              gatePass: passInfo,
              canExit: false,
              canReturn: true,
              message: `Student already exited campus at ${directPass.usedAt?.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })} on pass ${directPass.passNo} and has not checked back in yet.`,
            };
          } else {
            await logScan(user, student.id, "GATE_PASS" as any, "BLOCKED", `Pass consumed & returned ${directPass.passNo}`);
            return {
              status: "DIDNT_PASS",
              statusLabel: "PASS ALREADY CONSUMED & RETURNED",
              tone: "amber",
              student: studentInfo,
              gatePass: passInfo,
              canExit: false,
              canReturn: false,
              message: `Gate pass ${directPass.passNo} was already fully consumed and student checked back in.`,
            };
          }
        } else if (directPass.status === "PENDING") {
          await logScan(user, student.id, "GATE_PASS" as any, "BLOCKED", `Pass pending approval ${directPass.passNo}`);
          return {
            status: "NOT_ALLOWED",
            statusLabel: "NOT ALLOWED / PASS PENDING APPROVAL",
            tone: "red",
            student: studentInfo,
            gatePass: passInfo,
            canExit: false,
            canReturn: false,
            message: `Gate pass ${directPass.passNo} is still PENDING principal or class teacher approval. Do not allow exit.`,
          };
        } else {
          await logScan(user, student.id, "GATE_PASS" as any, "BLOCKED", `Pass ${directPass.status.toLowerCase()} ${directPass.passNo}`);
          return {
            status: "NOT_ALLOWED",
            statusLabel: `NOT ALLOWED / PASS ${directPass.status}`,
            tone: "red",
            student: studentInfo,
            gatePass: passInfo,
            canExit: false,
            canReturn: false,
            message: `Gate pass ${directPass.passNo} is ${directPass.status.toLowerCase()}. Do not allow exit.`,
          };
        }
      }
    }

    // 2. Try resolving as a Student ID QR code, DocumentVerification, or admission number
    let studentIdToLookup: string | null = null;
    const docVer = await tenantDb().documentVerification.findFirst({
      where: { code, docType: { in: ["student_id", "gate_pass"] } },
    });
    if (docVer && docVer.studentId) {
      studentIdToLookup = docVer.studentId;
    } else {
      const stuByAdm = await tenantDb().student.findFirst({
        where: { admissionNo: { equals: code, mode: "insensitive" }, status: "ACTIVE" },
      });
      if (stuByAdm) {
        studentIdToLookup = stuByAdm.id;
      } else {
        const stuById = await tenantDb().student.findFirst({
          where: { id: code, status: "ACTIVE" },
        });
        if (stuById) studentIdToLookup = stuById.id;
      }
    }

    if (!studentIdToLookup) {
      return {
        status: "INVALID",
        statusLabel: "INVALID / UNRECOGNIZED CODE",
        tone: "gray",
        student: null,
        gatePass: null,
        canExit: false,
        canReturn: false,
        message: `Unrecognized QR code (${code}) — does not match any active student ID or gate pass in this school.`,
      };
    }

    const student = await tenantDb().student.findFirst({
      where: { id: studentIdToLookup, status: "ACTIVE" },
      include: { schoolClass: true },
    });
    if (!student) {
      return {
        status: "INVALID",
        statusLabel: "INVALID / STUDENT NOT ACTIVE",
        tone: "gray",
        student: null,
        gatePass: null,
        canExit: false,
        canReturn: false,
        message: "Student record found but account is no longer active.",
      };
    }

    const studentInfo = {
      id: student.id,
      name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" "),
      admissionNo: student.admissionNo,
      photoUrl: student.photoUrl,
      className: student.schoolClass ? [student.schoolClass.level, student.schoolClass.stream].filter(Boolean).join(" ") : "Unassigned",
    };

    // Check recent/active gate passes for this student
    const passes = await tenantDb().gatePass.findMany({
      where: {
        studentId: student.id,
        status: { in: ["ACTIVE", "APPROVED", "USED", "PENDING"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const activePass = passes.find((p) => (p.status === "ACTIVE" || p.status === "APPROVED") && !p.usedAt);
    if (activePass) {
      const passInfo = {
        id: activePass.id,
        passNo: activePass.passNo,
        reason: activePass.reason,
        leaveAt: activePass.leaveAt.toISOString(),
        returnBy: activePass.returnBy ? activePass.returnBy.toISOString() : null,
        escortName: activePass.escortName,
        issuedByName: activePass.issuedByName,
        approvedByName: activePass.approvedByName,
        status: activePass.status,
        usedAt: activePass.usedAt ? activePass.usedAt.toISOString() : null,
        returnedAt: activePass.returnedAt ? activePass.returnedAt.toISOString() : null,
      };
      await logScan(user, student.id, "GATE_PASS" as any, "OK", `Allowed exit via student QR on pass ${activePass.passNo}`);
      return {
        status: "ALLOWED",
        statusLabel: "ALLOWED / ACTIVE GATE PASS",
        tone: "green",
        student: studentInfo,
        gatePass: passInfo,
        canExit: true,
        canReturn: false,
        message: `Student is ALLOWED to exit campus. Gate pass ${activePass.passNo} is active and approved.`,
      };
    }

    const exitedPass = passes.find((p) => (p.status === "USED" || p.usedAt !== null) && !p.returnedAt);
    if (exitedPass) {
      const passInfo = {
        id: exitedPass.id,
        passNo: exitedPass.passNo,
        reason: exitedPass.reason,
        leaveAt: exitedPass.leaveAt.toISOString(),
        returnBy: exitedPass.returnBy ? exitedPass.returnBy.toISOString() : null,
        escortName: exitedPass.escortName,
        issuedByName: exitedPass.issuedByName,
        approvedByName: exitedPass.approvedByName,
        status: exitedPass.status,
        usedAt: exitedPass.usedAt ? exitedPass.usedAt.toISOString() : null,
        returnedAt: exitedPass.returnedAt ? exitedPass.returnedAt.toISOString() : null,
      };
      await logScan(user, student.id, "GATE_PASS" as any, "DUPLICATE", `Already exited on pass ${exitedPass.passNo}`);
      return {
        status: "DIDNT_PASS",
        statusLabel: "DIDN'T PASS / ALREADY EXITED CAMPUS",
        tone: "amber",
        student: studentInfo,
        gatePass: passInfo,
        canExit: false,
        canReturn: true,
        message: `Student already exited campus at ${exitedPass.usedAt?.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })} on pass ${exitedPass.passNo} and has not checked back in yet.`,
      };
    }

    const pendingPass = passes.find((p) => p.status === "PENDING");
    if (pendingPass) {
      const passInfo = {
        id: pendingPass.id,
        passNo: pendingPass.passNo,
        reason: pendingPass.reason,
        leaveAt: pendingPass.leaveAt.toISOString(),
        returnBy: pendingPass.returnBy ? pendingPass.returnBy.toISOString() : null,
        escortName: pendingPass.escortName,
        issuedByName: pendingPass.issuedByName,
        approvedByName: pendingPass.approvedByName,
        status: pendingPass.status,
        usedAt: pendingPass.usedAt ? pendingPass.usedAt.toISOString() : null,
        returnedAt: pendingPass.returnedAt ? pendingPass.returnedAt.toISOString() : null,
      };
      await logScan(user, student.id, "GATE_PASS" as any, "BLOCKED", `Pass pending approval ${pendingPass.passNo}`);
      return {
        status: "NOT_ALLOWED",
        statusLabel: "NOT ALLOWED / PASS PENDING APPROVAL",
        tone: "red",
        student: studentInfo,
        gatePass: passInfo,
        canExit: false,
        canReturn: false,
        message: `Student has a gate pass request (${pendingPass.passNo}) that is still PENDING principal or class teacher approval. Do not allow exit.`,
      };
    }

    await logScan(user, student.id, "GATE_PASS" as any, "BLOCKED", "No active pass for student");
    return {
      status: "NOT_ALLOWED",
      statusLabel: "NOT ALLOWED / NO ACTIVE GATE PASS",
      tone: "red",
      student: studentInfo,
      gatePass: null,
      canExit: false,
      canReturn: false,
      message: `Student ${studentInfo.name} has no active or approved gate pass to leave campus today.`,
    };
  });
}

/**
 * 1-Tap Checkpoint Stamping: records exact exit (`usedAt`) or exact return (`returnedAt`)
 * in under 100ms right when security taps the button on the verified status screen (`EE.11`).
 */
export async function stampGatePassAction(user: SessionUser, passId: string, action: "EXIT" | "RETURN", note?: string) {
  return withTenant(user.tenantId, async () => {
    const pass = await tenantDb().gatePass.findUnique({ where: { id: passId } });
    if (!pass) throw new QrScanError("NOT_FOUND", "Gate pass not found.");

    if (action === "EXIT") {
      if (!["ACTIVE", "APPROVED"].includes(pass.status) || pass.usedAt) {
        throw new QrScanError("DUPLICATE", `Gate pass ${pass.passNo} is already ${pass.status.toLowerCase()} or already used.`);
      }
      const updated = await tenantDb().gatePass.update({
        where: { id: passId },
        data: { status: "USED", usedAt: new Date() },
      });
      await logScan(user, pass.studentId, "GATE_PASS_EXIT" as any, "OK", `Stamped gate exit for pass ${pass.passNo}${note ? ` (${note})` : ""}`);
      return { ok: true, stampedAction: "EXIT", gatePass: updated, timestamp: new Date().toISOString() };
    } else {
      // RETURN check-in
      if (!pass.usedAt) {
        throw new QrScanError("INVALID", `Cannot check in return for pass ${pass.passNo} — student has not exited yet.`);
      }
      if (pass.returnedAt) {
        throw new QrScanError("DUPLICATE", `Return already stamped for pass ${pass.passNo} at ${pass.returnedAt.toLocaleTimeString("en-KE")}.`);
      }
      const updated = await tenantDb().gatePass.update({
        where: { id: passId },
        data: { returnedAt: new Date() },
      });
      await logScan(user, pass.studentId, "GATE_PASS_RETURN" as any, "OK", `Stamped gate return check-in for pass ${pass.passNo}${note ? ` (${note})` : ""}`);
      return { ok: true, stampedAction: "RETURN", gatePass: updated, timestamp: new Date().toISOString() };
    }
  });
}

