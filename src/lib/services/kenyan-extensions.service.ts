import { db } from "@/lib/db";
import { type SessionUser } from "@/lib/core/session";
import { checkFeatureReleaseAccess } from "@/lib/services/early-access-release.service";
import { qrDataUrl } from "@/lib/documents/qr";

/**
 * 12 Next-Gen Kenyan School Management Extension Suites (2026-07-18).
 * Exact, production-grade domain logic across MOE returns, FinTech clearing,
 * campus boarding safety, KNEC indexing studios, and co-curricular trips.
 */

export class KenyanExtensionError extends Error {
  constructor(public code: "FORBIDDEN" | "NOT_FOUND" | "INVALID" | "PAUSED", message: string) {
    super(message);
    this.name = "KenyanExtensionError";
  }
}

async function assertFeatureUnlocked(tenantId: string, key: string, label: string) {
  await checkFeatureReleaseAccess(tenantId, key).catch((err) => {
    throw new KenyanExtensionError("PAUSED", `🚧 Feature Restricted [${label}]: ${err.message}`);
  });
}

// ===========================================================================
// Idea 1: NEMIS Sync & Bulk Exporter (`/students` & `/staff`)
// ===========================================================================

export async function updateStudentNemisFields(
  tenantId: string,
  studentId: string,
  input: { nemisUpi?: string | null; birthCertNo?: string | null; specialNeedsCode?: string | null },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "moe.nemis_sync", "NEMIS Sync & Census Exporter");
  const student = await db.student.findFirst({ where: { id: studentId, tenantId } });
  if (!student) throw new KenyanExtensionError("NOT_FOUND", "Student not found.");

  return db.student.update({
    where: { id: studentId },
    data: {
      upiNumber: input.nemisUpi !== undefined ? input.nemisUpi : student.upiNumber,
      birthCertNo: input.birthCertNo !== undefined ? input.birthCertNo : student.birthCertNo,
      specialNeedsCode: input.specialNeedsCode !== undefined ? input.specialNeedsCode : student.specialNeedsCode,
    },
  });
}

export async function updateStaffStatutoryFields(
  tenantId: string,
  staffProfileId: string,
  input: { tscNumber?: string | null; kraPin?: string | null; nssfNo?: string | null; nhifNo?: string | null },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "moe.nemis_sync", "NEMIS Sync & Census Exporter");
  const staff = await db.staffProfile.findFirst({ where: { id: staffProfileId, tenantId } });
  if (!staff) throw new KenyanExtensionError("NOT_FOUND", "Staff profile not found.");

  return db.staffProfile.update({
    where: { id: staffProfileId },
    data: {
      tscNumber: input.tscNumber !== undefined ? input.tscNumber : staff.tscNumber,
      kraPin: input.kraPin !== undefined ? input.kraPin : staff.kraPin,
      nssfNo: input.nssfNo !== undefined ? input.nssfNo : staff.nssfNo,
      nhifNo: input.nhifNo !== undefined ? input.nhifNo : staff.nhifNo,
    },
  });
}

export async function exportNemisCensusBundle(tenantId: string) {
  await assertFeatureUnlocked(tenantId, "moe.nemis_sync", "NEMIS Sync & Census Exporter");
  const [students, staff] = await Promise.all([
    db.student.findMany({ where: { tenantId, status: "ACTIVE" }, orderBy: { admissionNo: "asc" } }),
    db.staffProfile.findMany({ where: { tenantId }, orderBy: { id: "asc" } }),
  ]);

  const studentRows = students.map((s) => ({
    AdmissionNumber: s.admissionNo,
    FullName: `${s.firstName} ${s.middleName || ""} ${s.lastName}`.trim(),
    Gender: s.gender,
    DateOfBirth: s.dateOfBirth || "—",
    NemisUPI: s.upiNumber || "PENDING",
    BirthCertificateNo: s.birthCertNo || "—",
    SpecialNeedsCode: s.specialNeedsCode || "NONE",
    Status: s.status,
  }));

  const staffRows = staff.map((st) => ({
    StaffProfileId: st.id,
    TSCNumber: st.tscNumber || "—",
    NationalID: st.nationalId || "—",
    KRAPin: st.kraPin || "—",
    NSSFNumber: st.nssfNo || "—",
    NHIFNumber: st.nhifNo || "—",
    Qualifications: st.qualifications || "—",
  }));

  return { studentRows, staffRows, studentCount: students.length, staffCount: staff.length };
}

// ===========================================================================
// Idea 2: MOE Statutory Returns Generator (`Form A / Form B`)
// ===========================================================================

export async function generateMoeStatutoryReturn(
  tenantId: string,
  returnType: "FORM_A" | "FORM_B",
  termKey = "2026-T2",
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "moe.statutory_returns", "MOE Statutory Returns Generator");
  const [students, staff, classes, books] = await Promise.all([
    db.student.findMany({ where: { tenantId, status: "ACTIVE" } }),
    db.user.count({ where: { tenantId, isActive: true, role: { in: ["TEACHER", "CLASS_TEACHER", "DEPUTY_PRINCIPAL", "PRINCIPAL"] } } }),
    db.schoolClass.count({ where: { tenantId, archived: false } }),
    db.libraryBookCopy.count({ where: { book: { tenantId }, status: { in: ["AVAILABLE", "ISSUED"] } } }),
  ]);

  const totalBoys = students.filter((s) => s.gender === "M").length;
  const totalGirls = students.filter((s) => s.gender === "F").length;
  const totalStudents = students.length;
  const totalTeachers = staff || 1;
  const classroomCount = Math.max(1, classes);
  const textbookCount = books;

  // Ideal crowding threshold = 45 students per classroom
  const idealCapacity = classroomCount * 45;
  const crowdingIndexPct = Math.round((totalStudents / idealCapacity) * 100);

  // Textbook ratio (e.g. "1:2")
  const ratioVal = totalStudents > 0 ? (textbookCount / totalStudents).toFixed(1) : "1.0";
  const textbookRatioStr = `1:${Math.max(1, Math.round(totalStudents / Math.max(1, textbookCount)))}`;

  const ret = await db.moeStatutoryReturn.upsert({
    where: { tenantId_termKey_returnType: { tenantId, termKey, returnType } },
    create: {
      tenantId,
      termKey,
      returnType,
      totalBoys,
      totalGirls,
      totalTeachers,
      classroomCount,
      textbookCount,
      crowdingIndexPct,
      textbookRatioStr,
      status: "DRAFT",
    },
    update: {
      totalBoys,
      totalGirls,
      totalTeachers,
      classroomCount,
      textbookCount,
      crowdingIndexPct,
      textbookRatioStr,
    },
  });

  await db.auditLog.create({
    data: {
      tenantId,
      actorId: actor.id,
      actorName: actor.fullName,
      action: "academics.moe_statutory_return_generated",
      entityType: "MoeStatutoryReturn",
      entityId: ret.id,
      metadata: JSON.stringify({ returnType, termKey, totalStudents, crowdingIndexPct, textbookRatioStr }),
    },
  }).catch(() => {});

  return ret;
}

export async function listMoeReturns(tenantId: string) {
  return db.moeStatutoryReturn.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function submitMoeReturn(tenantId: string, id: string, actor: SessionUser) {
  await assertFeatureUnlocked(tenantId, "moe.statutory_returns", "MOE Statutory Returns Generator");
  return db.moeStatutoryReturn.update({
    where: { id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });
}

// ===========================================================================
// Idea 3: Post-Dated Checks & Bank Deposit Clearing Grid (`/finance`)
// ===========================================================================

export async function createTreasuryCheck(
  tenantId: string,
  input: {
    checkOrSlipNo: string;
    bankName: string;
    maturityDate: string | Date;
    amountKes: number;
    studentId?: string | null;
    guardianId?: string | null;
  },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "finance.treasury_checks", "Treasury Bank Clearing & Check Vault");
  return db.treasuryCheckAndBankSlip.create({
    data: {
      tenantId,
      checkOrSlipNo: input.checkOrSlipNo.trim().toUpperCase(),
      bankName: input.bankName.trim(),
      maturityDate: new Date(input.maturityDate),
      amountKes: Number(input.amountKes),
      studentId: input.studentId || null,
      guardianId: input.guardianId || null,
      status: "PENDING_CLEARANCE",
    },
  });
}

export async function listTreasuryChecks(tenantId: string, status?: string) {
  const where: any = { tenantId };
  if (status && status !== "ALL") where.status = status;
  return db.treasuryCheckAndBankSlip.findMany({
    where,
    orderBy: { maturityDate: "asc" },
  });
}

export async function clearTreasuryCheck(tenantId: string, id: string, actor: SessionUser) {
  await assertFeatureUnlocked(tenantId, "finance.treasury_checks", "Treasury Bank Clearing & Check Vault");
  const check = await db.treasuryCheckAndBankSlip.findFirst({ where: { id, tenantId } });
  if (!check) throw new KenyanExtensionError("NOT_FOUND", "Check or bank slip not found.");

  const updated = await db.treasuryCheckAndBankSlip.update({
    where: { id: check.id },
    data: { status: "CLEARED", clearedAt: new Date(), clearedBy: actor.fullName },
  });

  // Auto-record student payment if linked to a student
  if (check.studentId) {
    const st = await db.student.findUnique({ where: { id: check.studentId } });
    if (st) {
      await db.payment.create({
        data: {
          tenantId,
          accountRef: st.admissionNo,
          phone: "TREASURY-CHECK",
          amount: check.amountKes,
          provider: "treasury_check_slip",
          mpesaRef: check.checkOrSlipNo,
          status: "PAID",
          description: `Bank slip/check cleared (${check.bankName}) by ${actor.fullName}`,
          paidAt: new Date(),
        } as any,
      });
    }
  }

  return updated;
}

// ===========================================================================
// Idea 4: Student Tuck-Shop Pocket Money Wallet (`/cafeteria` / `/finance`)
// ===========================================================================

export async function ensureStudentPocketWallet(tenantId: string, studentId: string) {
  await assertFeatureUnlocked(tenantId, "finance.pocket_wallet", "Digital Student Tuck-Shop Pocket Wallet");
  const existing = await db.studentPocketWallet.findUnique({ where: { studentId } });
  if (existing) return existing;
  return db.studentPocketWallet.create({
    data: { tenantId, studentId, balanceKes: 0, totalDepositedKes: 0, totalSpentKes: 0 },
  });
}

export async function depositPocketMoney(
  tenantId: string,
  studentId: string,
  amountKes: number,
  description: string,
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "finance.pocket_wallet", "Digital Student Tuck-Shop Pocket Wallet");
  if (amountKes <= 0) throw new KenyanExtensionError("INVALID", "Deposit amount must be positive.");
  const wallet = await ensureStudentPocketWallet(tenantId, studentId);

  const updated = await db.studentPocketWallet.update({
    where: { id: wallet.id },
    data: {
      balanceKes: { increment: amountKes },
      totalDepositedKes: { increment: amountKes },
    },
  });

  await db.pocketWalletTransaction.create({
    data: {
      walletId: wallet.id,
      tenantId,
      studentId,
      type: "DEPOSIT",
      amountKes,
      description: description.trim() || "Pocket money top-up deposit",
      performedBy: actor.fullName,
    },
  });

  return updated;
}

export async function spendPocketMoney(
  tenantId: string,
  studentId: string,
  amountKes: number,
  description: string,
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "finance.pocket_wallet", "Digital Student Tuck-Shop Pocket Wallet");
  if (amountKes <= 0) throw new KenyanExtensionError("INVALID", "Spend amount must be positive.");
  const wallet = await ensureStudentPocketWallet(tenantId, studentId);
  if (wallet.isFrozen) throw new KenyanExtensionError("FORBIDDEN", "This student's pocket wallet is currently frozen.");
  if (wallet.balanceKes < amountKes) {
    throw new KenyanExtensionError("INVALID", `Insufficient pocket wallet balance (` +
      `Available: KES ${wallet.balanceKes.toLocaleString("en-KE")}, Required: KES ${amountKes.toLocaleString("en-KE")}).`);
  }

  const updated = await db.studentPocketWallet.update({
    where: { id: wallet.id },
    data: {
      balanceKes: { decrement: amountKes },
      totalSpentKes: { increment: amountKes },
    },
  });

  await db.pocketWalletTransaction.create({
    data: {
      walletId: wallet.id,
      tenantId,
      studentId,
      type: "SPEND",
      amountKes,
      description: description.trim() || "Tuck-shop / canteen purchase",
      performedBy: actor.fullName,
    },
  });

  return updated;
}

export async function getStudentPocketWalletDetails(tenantId: string, studentId: string) {
  const wallet = await ensureStudentPocketWallet(tenantId, studentId);
  const transactions = await db.pocketWalletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return { wallet, transactions };
}

// ===========================================================================
// Idea 5: Digital Boarding Exeat & Weekend Outing Pass Engine (`/hostel` / `/gate`)
// ===========================================================================

export async function requestBoardingExeatPass(
  tenantId: string,
  input: {
    studentId: string;
    reason: string;
    departureTime: string | Date;
    expectedReturnTime: string | Date;
  },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "hostel.exeat_pass", "Digital Boarding Exeat & Weekend Outing Pass Engine");
  const student = await db.student.findFirst({ where: { id: input.studentId, tenantId } });
  if (!student) throw new KenyanExtensionError("NOT_FOUND", "Student not found.");

  const stName = `${student.firstName} ${student.lastName}`.trim();
  const passNo = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
  const qrUrl = await qrDataUrl(`EXEAT:${tenantId}:${passNo}`);

  return db.boardingExeatPass.create({
    data: {
      tenantId,
      studentId: student.id,
      studentName: stName,
      passNo,
      reason: input.reason.trim(),
      departureTime: new Date(input.departureTime),
      expectedReturnTime: new Date(input.expectedReturnTime),
      status: "PENDING",
      qrDataUrl: qrUrl,
    },
  });
}

export async function approveBoardingExeatPass(
  tenantId: string,
  id: string,
  status: "APPROVED" | "REJECTED",
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "hostel.exeat_pass", "Digital Boarding Exeat & Weekend Outing Pass Engine");
  return db.boardingExeatPass.update({
    where: { id },
    data: { status, approvedBy: actor.fullName },
  });
}

export async function gateCheckExeatPass(
  tenantId: string,
  passNo: string,
  action: "CHECK_OUT" | "CHECK_IN",
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "hostel.exeat_pass", "Digital Boarding Exeat & Weekend Outing Pass Engine");
  const pass = await db.boardingExeatPass.findUnique({ where: { passNo: passNo.trim().toUpperCase() } });
  if (!pass || pass.tenantId !== tenantId) throw new KenyanExtensionError("NOT_FOUND", "Exeat pass not found.");

  if (action === "CHECK_OUT") {
    if (pass.status !== "APPROVED") {
      throw new KenyanExtensionError("INVALID", `Pass is currently ${pass.status} (must be APPROVED to check out of campus).`);
    }
    return db.boardingExeatPass.update({
      where: { id: pass.id },
      data: { status: "OFF_CAMPUS", actualDepartureTime: new Date(), gateCheckedOutBy: actor.fullName },
    });
  } else {
    // Check In (`returning to boarding`)
    return db.boardingExeatPass.update({
      where: { id: pass.id },
      data: { status: "RETURNED", actualReturnTime: new Date(), gateCheckedInBy: actor.fullName },
    });
  }
}

export async function listBoardingExeatPasses(tenantId: string, status?: string) {
  const where: any = { tenantId };
  if (status && status !== "ALL") where.status = status;
  return db.boardingExeatPass.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

// ===========================================================================
// Idea 6: Infirmary Nurse Daily Medication Roll-Call Ledger (`/clinic`)
// ===========================================================================

export async function recordInfirmaryDosage(
  tenantId: string,
  input: {
    studentId: string;
    studentName: string;
    medicationPlanId?: string | null;
    doseName: string;
    scheduledTime: string; // Morning | Lunch | Evening
    status: "ADMINISTERED" | "MISSED" | "REFUSED";
    notes?: string | null;
  },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "clinic.dosage_grid", "Infirmary Nurse Medication Roll-Call Ledger");
  return db.infirmaryDosageLog.create({
    data: {
      tenantId,
      studentId: input.studentId,
      studentName: input.studentName,
      medicationPlanId: input.medicationPlanId || null,
      doseName: input.doseName.trim(),
      scheduledTime: input.scheduledTime,
      administeredAt: input.status === "ADMINISTERED" ? new Date() : null,
      administeredBy: actor.fullName,
      status: input.status,
      notes: input.notes ?? null,
    },
  });
}

export async function listTodayInfirmaryDosages(tenantId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const startOfDay = new Date(`${today}T00:00:00.000Z`);
  return db.infirmaryDosageLog.findMany({
    where: { tenantId, createdAt: { gte: startOfDay } },
    orderBy: { createdAt: "desc" },
  });
}

// ===========================================================================
// Idea 7: KNEC / KJSEA Candidate Index Studio (`By Admission or Exam Merit`)
// ===========================================================================

export async function registerKnecCandidates(
  tenantId: string,
  input: {
    knecCentreCode: string;
    candidateType: "KCSE" | "KJSEA";
    indexingMode: "ADMISSION_ORDER" | "EXAM_MERIT";
    placementExamId?: string | null;
  },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "academics.knec_studio", "KNEC / KJSEA National Candidate Index Studio");
  const centreCode = input.knecCentreCode.trim();
  if (!centreCode || centreCode.length < 5) {
    throw new KenyanExtensionError("INVALID", "A valid KNEC School Centre Code (min 5 characters) is required.");
  }

  // Find all active senior/candidate students
  const students = await db.student.findMany({
    where: { tenantId, status: "ACTIVE" },
    orderBy: { admissionNo: "asc" },
  });

  if (students.length === 0) throw new KenyanExtensionError("NOT_FOUND", "No active students found for candidate indexing.");

  let sortedStudents = [...students];

  // Option B: Sort by Exam Merit / Performance Ranking
  if (input.indexingMode === "EXAM_MERIT") {
    if (!input.placementExamId) {
      throw new KenyanExtensionError("INVALID", "Please select a specific placement exam to index candidates by performance merit.");
    }
    const results = await db.examResult.findMany({
      where: { examId: input.placementExamId },
      select: { studentId: true, marks: true },
    });
    const scoreMap = new Map(results.map((r) => [r.studentId, r.marks]));
    sortedStudents.sort((a, b) => {
      const scoreA = scoreMap.get(a.id) ?? -1;
      const scoreB = scoreMap.get(b.id) ?? -1;
      return scoreB - scoreA; // descending score
    });
  }

  const createdRows: any[] = [];
  for (let idx = 0; idx < sortedStudents.length; idx++) {
    const st = sortedStudents[idx];
    const rank = idx + 1;
    const indexNumber = `${centreCode}/${String(rank).padStart(3, "0")}`;
    const stName = `${st.firstName} ${st.middleName || ""} ${st.lastName}`.trim();

    const row = await db.knecCandidateRegistration.upsert({
      where: { tenantId_knecCentreCode_indexNumber: { tenantId, knecCentreCode: centreCode, indexNumber } },
      create: {
        tenantId,
        studentId: st.id,
        studentName: stName,
        admissionNo: st.admissionNo,
        knecCentreCode: centreCode,
        candidateType: input.candidateType,
        indexNumber,
        photo300x300Url: st.photoUrl || null,
        placementExamId: input.indexingMode === "EXAM_MERIT" ? input.placementExamId : null,
        meritRank: input.indexingMode === "EXAM_MERIT" ? rank : null,
        status: "REGISTERED",
      },
      update: {
        studentId: st.id,
        studentName: stName,
        admissionNo: st.admissionNo,
        photo300x300Url: st.photoUrl || null,
        placementExamId: input.indexingMode === "EXAM_MERIT" ? input.placementExamId : null,
        meritRank: input.indexingMode === "EXAM_MERIT" ? rank : null,
      },
    });
    createdRows.push(row);
  }

  await db.auditLog.create({
    data: {
      tenantId,
      actorId: actor.id,
      actorName: actor.fullName,
      action: "academics.knec_candidate_registration_completed",
      entityType: "KnecCandidateRegistration",
      metadata: JSON.stringify({ centreCode, candidateType: input.candidateType, indexingMode: input.indexingMode, totalRegistered: createdRows.length }),
    },
  }).catch(() => {});

  return { candidates: createdRows, totalRegistered: createdRows.length, centreCode, candidateType: input.candidateType };
}

export async function listKnecCandidates(tenantId: string, candidateType = "ALL") {
  const where: any = { tenantId };
  if (candidateType !== "ALL") where.candidateType = candidateType;
  return db.knecCandidateRegistration.findMany({
    where,
    orderBy: { indexNumber: "asc" },
  });
}

export async function exportKnecCandidatesManifest(tenantId: string, candidateType = "ALL") {
  await assertFeatureUnlocked(tenantId, "academics.knec_studio", "KNEC / KJSEA National Candidate Index Studio");
  const candidates = await listKnecCandidates(tenantId, candidateType);
  const rows = candidates.map((c) => ({
    CentreCode: c.knecCentreCode,
    IndexNumber: c.indexNumber,
    CandidateName: c.studentName,
    AdmissionNo: c.admissionNo,
    CandidateType: c.candidateType,
    MeritRank: c.meritRank !== null ? `Rank ${c.meritRank}` : "Sequential",
    PhotoStatus: c.photo300x300Url ? "300x300 Photo Imprinted" : "Photo Missing",
  }));
  return { rows, count: rows.length };
}

// ===========================================================================
// Idea 8: Co-Curricular Sports & Tournament Trip Organizer (`/finance/activities`)
// ===========================================================================

export async function createSchoolTournamentTrip(
  tenantId: string,
  input: {
    title: string;
    venue: string;
    eventDate: string | Date;
    transportRouteId?: string | null;
    perDiemKes: number;
  },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "academics.tournament_trip", "Co-Curricular Tournament Trip Organizer");
  return db.schoolTournamentTrip.create({
    data: {
      tenantId,
      title: input.title.trim(),
      venue: input.venue.trim(),
      eventDate: new Date(input.eventDate),
      transportRouteId: input.transportRouteId || null,
      perDiemKes: Number(input.perDiemKes),
      status: "PLANNED",
    },
  });
}

export async function addTournamentParticipant(
  tenantId: string,
  tripId: string,
  input: { studentId: string; busSeatNo?: string | null },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "academics.tournament_trip", "Co-Curricular Tournament Trip Organizer");
  const student = await db.student.findFirst({ where: { id: input.studentId, tenantId } });
  if (!student) throw new KenyanExtensionError("NOT_FOUND", "Student not found.");

  const stName = `${student.firstName} ${student.lastName}`.trim();
  // Check fee clearance
  const unpaidInvoices = await db.invoice.count({ where: { tenantId, status: { in: ["UNPAID", "PARTIAL"] } } });
  const feeClearanceOk = unpaidInvoices === 0;

  return db.tournamentParticipant.upsert({
    where: { tripId_studentId: { tripId, studentId: student.id } },
    create: {
      tripId,
      tenantId,
      studentId: student.id,
      studentName: stName,
      feeClearanceOk,
      busSeatNo: input.busSeatNo || null,
      parentConsentStatus: "PENDING",
    },
    update: {
      busSeatNo: input.busSeatNo || null,
    },
  });
}

export async function updateParentConsentStatus(
  tenantId: string,
  tripId: string,
  studentId: string,
  parentConsentStatus: "CONSENTED" | "DENIED"
) {
  return db.tournamentParticipant.update({
    where: { tripId_studentId: { tripId, studentId } },
    data: { parentConsentStatus },
  });
}

export async function listTournamentTrips(tenantId: string) {
  return db.schoolTournamentTrip.findMany({
    where: { tenantId },
    orderBy: { eventDate: "desc" },
    include: { participants: true },
  });
}

// ===========================================================================
// Idea 9: Teacher Record of Work Covered (`MOE QASO Inspection Tracker`)
// ===========================================================================

export async function recordSyllabusWorkCovered(
  tenantId: string,
  input: {
    teacherId: string;
    teacherName: string;
    subjectId: string;
    classId: string;
    strandName: string;
    substrandName: string;
    weekNumber: number;
    dateCovered: string | Date;
    status: "COVERED" | "BEHIND_SCHEDULE";
    supervisorComment?: string | null;
  },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "academics.record_of_work", "Syllabus Record of Work Covered Tracker");
  return db.teacherRecordOfWork.create({
    data: {
      tenantId,
      teacherId: input.teacherId,
      teacherName: input.teacherName,
      subjectId: input.subjectId,
      classId: input.classId,
      strandName: input.strandName.trim(),
      substrandName: input.substrandName.trim(),
      weekNumber: Number(input.weekNumber),
      dateCovered: new Date(input.dateCovered),
      status: input.status,
      supervisorComment: input.supervisorComment ?? null,
    },
  });
}

export async function listTeacherRecordsOfWork(
  tenantId: string,
  teacherId?: string | null,
  subjectId?: string | null,
  classId?: string | null
) {
  const where: any = { tenantId };
  if (teacherId && teacherId !== "ALL") where.teacherId = teacherId;
  if (subjectId && subjectId !== "ALL") where.subjectId = subjectId;
  if (classId && classId !== "ALL") where.classId = classId;
  return db.teacherRecordOfWork.findMany({
    where,
    orderBy: [{ weekNumber: "desc" }, { dateCovered: "desc" }],
    take: 100,
  });
}

// ===========================================================================
// Idea 10: Academic Consultation / PTA Day Slot Booking Portal
// ===========================================================================

export async function createPtaConsultationSlots(
  tenantId: string,
  teacherId: string,
  teacherName: string,
  slotDate: string | Date,
  startTimes: string[], // e.g. ["09:00 AM", "09:15 AM", ...]
  durationMins = 15,
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "portal.pta_booking", "Academic Consultation / PTA Day Slot Booking Portal");
  const created: any[] = [];
  const dateObj = new Date(slotDate);

  for (const startTime of startTimes) {
    const row = await db.ptaConsultationSlot.upsert({
      where: { tenantId_teacherId_slotDate_startTime: { tenantId, teacherId, slotDate: dateObj, startTime } },
      create: {
        tenantId,
        teacherId,
        teacherName,
        slotDate: dateObj,
        startTime,
        endTime: `${startTime} (${durationMins} mins)`,
        isBooked: false,
      },
      update: {},
    });
    created.push(row);
  }
  return created;
}

export async function bookPtaConsultationSlot(
  tenantId: string,
  slotId: string,
  guardianId: string,
  studentId: string,
  bookedTopic: string
) {
  await assertFeatureUnlocked(tenantId, "portal.pta_booking", "Academic Consultation / PTA Day Slot Booking Portal");
  const slot = await db.ptaConsultationSlot.findFirst({ where: { id: slotId, tenantId } });
  if (!slot) throw new KenyanExtensionError("NOT_FOUND", "Consultation slot not found.");
  if (slot.isBooked) throw new KenyanExtensionError("INVALID", "This consultation slot has already been booked by another parent.");

  return db.ptaConsultationSlot.update({
    where: { id: slot.id },
    data: {
      isBooked: true,
      bookedByGuardianId: guardianId,
      bookedByStudentId: studentId,
      bookedTopic: bookedTopic.trim(),
    },
  });
}

export async function listPtaConsultationSlots(tenantId: string, teacherId?: string | null) {
  const where: any = { tenantId };
  if (teacherId && teacherId !== "ALL") where.teacherId = teacherId;
  return db.ptaConsultationSlot.findMany({
    where,
    orderBy: [{ slotDate: "asc" }, { startTime: "asc" }],
    take: 100,
  });
}

// ===========================================================================
// Idea 11: BOM & PA Board of Management Document Room (`/settings`)
// ===========================================================================

export async function uploadBomGovernanceDocument(
  tenantId: string,
  input: {
    title: string;
    category: "FINANCIAL_REPORT" | "AUDIT" | "CAPEX_PROPOSAL" | "MINUTES";
    fileUrl: string;
    requiresVote?: boolean;
  },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "settings.bom_vault", "BOM Board of Management Document Room");
  return db.bomGovernanceDocument.create({
    data: {
      tenantId,
      title: input.title.trim(),
      category: input.category,
      fileUrl: input.fileUrl,
      uploadedBy: actor.fullName,
      requiresVote: input.requiresVote ?? false,
      status: "OPEN",
    },
  });
}

export async function castBomDocumentVote(
  tenantId: string,
  documentId: string,
  vote: "YES" | "NO",
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "settings.bom_vault", "BOM Board of Management Document Room");
  const doc = await db.bomGovernanceDocument.findFirst({ where: { id: documentId, tenantId } });
  if (!doc) throw new KenyanExtensionError("NOT_FOUND", "Governance document not found.");

  const newYes = doc.votesYes + (vote === "YES" ? 1 : 0);
  const newNo = doc.votesNo + (vote === "NO" ? 1 : 0);
  const newStatus = newYes >= 3 ? "APPROVED" : newNo >= 3 ? "REJECTED" : "OPEN";

  return db.bomGovernanceDocument.update({
    where: { id: doc.id },
    data: { votesYes: newYes, votesNo: newNo, status: newStatus },
  });
}

export async function listBomGovernanceDocuments(tenantId: string, category?: string) {
  const where: any = { tenantId };
  if (category && category !== "ALL") where.category = category;
  return db.bomGovernanceDocument.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

// ===========================================================================
// Idea 12: Campus Lost & Found Photo Register (`/reception` & `/portal`)
// ===========================================================================

export async function recordLostAndFoundItem(
  tenantId: string,
  input: {
    title: string;
    description: string;
    category: "UNIFORM" | "BOOK" | "ELECTRONIC" | "OTHER";
    locationFound: string;
    photoUrl?: string | null;
  },
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "reception.lost_and_found", "Campus Lost & Found Photo Register");
  return db.lostAndFoundItem.create({
    data: {
      tenantId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      locationFound: input.locationFound.trim(),
      photoUrl: input.photoUrl || null,
      status: "UNCLAIMED",
      foundBy: actor.fullName,
    },
  });
}

export async function claimLostAndFoundItem(
  tenantId: string,
  id: string,
  studentId: string,
  actor: SessionUser
) {
  await assertFeatureUnlocked(tenantId, "reception.lost_and_found", "Campus Lost & Found Photo Register");
  const item = await db.lostAndFoundItem.findFirst({ where: { id, tenantId } });
  if (!item) throw new KenyanExtensionError("NOT_FOUND", "Lost item not found.");
  if (item.status === "CLAIMED") throw new KenyanExtensionError("INVALID", "This item has already been claimed.");

  return db.lostAndFoundItem.update({
    where: { id: item.id },
    data: {
      status: "CLAIMED",
      claimedByStudentId: studentId,
      claimedAt: new Date(),
    },
  });
}

export async function listLostAndFoundItems(tenantId: string, status?: string) {
  const where: any = { tenantId };
  if (status && status !== "ALL") where.status = status;
  return db.lostAndFoundItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
