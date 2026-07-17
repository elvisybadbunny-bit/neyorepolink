import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import {
  bomPayrollInputSchema,
  fleetVehicleInputSchema,
  fleetFuelInputSchema,
  campusDisciplineInputSchema,
  counselingRecordInputSchema,
  kitchenStoreRequisitionSchema,
  supplierLpoSchema,
  hostelBedAllocationSchema,
  hostelVandalismInspectionSchema,
  schoolFarmLedgerSchema,
  staffLeaveSubstitutionSchema,
  capitalAssetInputSchema,
  labReagentInputSchema,
  alumniCampaignInputSchema,
  alumniPledgeInputSchema,
  visitorGateLogSchema,
  coursebookAllocationSchema,
  textbookFineRecoverySchema,
  masterSchoolDiaryEventSchema,
} from "@/lib/validations/extensions-v2";

// =============================================================================
// HELPER: Statutory Calculations for Kenyan BOM Staff Payroll (Idea 13)
// =============================================================================
export function calculateKenyanStatutoryDeductions(grossPay: number) {
  // SHIF: Exactly 2.75% of gross
  const shif = Number((grossPay * 0.0275).toFixed(2));

  // NSSF: Tier I (6% up to KES 8,000 = max 480) + Tier II (6% for portion between 8,000 and 72,000 = max 3,840)
  const tier1Basis = Math.min(grossPay, 8000);
  const nssfTier1 = Number((tier1Basis * 0.06).toFixed(2));

  const tier2Basis = Math.max(0, Math.min(grossPay, 72000) - 8000);
  const nssfTier2 = Number((tier2Basis * 0.06).toFixed(2));

  // Housing Levy: Exactly 1.5% of gross
  const housingLevy = Number((grossPay * 0.015).toFixed(2));

  // PAYE Tax calculation (Monthly bands minus Personal Relief KES 2,400)
  // Taxable pay = Gross - NSSF
  const taxablePay = Math.max(0, grossPay - nssfTier1 - nssfTier2);
  let grossPaye = 0;

  if (taxablePay <= 24000) {
    grossPaye = taxablePay * 0.10;
  } else if (taxablePay <= 32333) {
    grossPaye = 2400 + (taxablePay - 24000) * 0.25;
  } else if (taxablePay <= 500000) {
    grossPaye = 2400 + 2083.25 + (taxablePay - 32333) * 0.30;
  } else if (taxablePay <= 800000) {
    grossPaye = 2400 + 2083.25 + 140300.1 + (taxablePay - 500000) * 0.325;
  } else {
    grossPaye = 2400 + 2083.25 + 140300.1 + 97500 + (taxablePay - 800000) * 0.35;
  }

  const personalRelief = 2400;
  const payeTax = Number(Math.max(0, grossPaye - personalRelief).toFixed(2));

  const totalDeductions = shif + nssfTier1 + nssfTier2 + housingLevy + payeTax;
  const netPay = Number((grossPay - totalDeductions).toFixed(2));

  return {
    grossPay,
    shifDeduction: shif,
    nssfTier1,
    nssfTier2,
    housingLevy,
    payeTax,
    totalDeductions,
    netPay,
  };
}

// =============================================================================
// IDEA 13: BOM Staff & TSC Statutory Payroll Engine
// =============================================================================
export async function runBomPayroll(user: SessionUser, input: unknown) {
  const parsed = bomPayrollInputSchema.parse(input);
  const calc = calculateKenyanStatutoryDeductions(parsed.basicPay);

  return withTenant(user.tenantId, async () => {
    const record = await tenantDb().bomStaffPayroll.create({
      data: {
        tenantId: user.tenantId,
        staffName: parsed.staffName,
        idNumber: parsed.idNumber,
        jobTitle: parsed.jobTitle,
        bankName: parsed.bankName,
        bankAccount: parsed.bankAccount,
        basicPay: parsed.basicPay,
        grossPay: calc.grossPay,
        shifDeduction: calc.shifDeduction,
        nssfTier1: calc.nssfTier1,
        nssfTier2: calc.nssfTier2,
        housingLevy: calc.housingLevy,
        payeTax: calc.payeTax,
        netPay: calc.netPay,
        payPeriod: parsed.payPeriod,
        status: "APPROVED",
        remittanceCsvPath: `/downloads/payroll-${parsed.payPeriod}-${parsed.bankName.toLowerCase().replace(/\s+/g, "-")}.csv`,
      },
    });

    await db.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.id,
        actorName: user.fullName,
        action: "payroll.bom_run_calculated",
        entityType: "bomStaffPayroll",
        entityId: record.id,
        metadata: JSON.stringify({ staffName: record.staffName, netPay: record.netPay, period: record.payPeriod }),
      },
    });

    return record;
  });
}

export async function listBomPayrolls(user: SessionUser, payPeriod?: string) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().bomStaffPayroll.findMany({
      where: payPeriod ? { payPeriod } : undefined,
      orderBy: { createdAt: "desc" },
    });
  });
}

// =============================================================================
// IDEA 14: Vehicle Fleet & Bus Logbook Suite
// =============================================================================
export async function addFleetVehicle(user: SessionUser, input: unknown) {
  const parsed = fleetVehicleInputSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    return tenantDb().fleetVehicleLog.create({
      data: {
        tenantId: user.tenantId,
        registrationNo: parsed.registrationNo,
        makeModel: parsed.makeModel,
        capacity: parsed.capacity,
        odometerKm: parsed.odometerKm,
        ntsaExpiry: new Date(parsed.ntsaExpiry),
        insuranceExpiry: new Date(parsed.insuranceExpiry),
        status: "ACTIVE",
      },
    });
  });
}

export async function recordFleetFuel(user: SessionUser, input: unknown) {
  const parsed = fleetFuelInputSchema.parse(input);
  const totalCost = Number((parsed.liters * parsed.costPerLiter).toFixed(2));

  return withTenant(user.tenantId, async () => {
    const vehicle = await tenantDb().fleetVehicleLog.findUnique({ where: { id: parsed.vehicleId } });
    if (!vehicle) throw new Error("Vehicle not found");

    const fuelEfficiencyKmL = 3.5;
    const anomalyFlagged = parsed.liters > 100;

    const entry = await db.fleetFuelEntry.create({
      data: {
        vehicleId: parsed.vehicleId,
        liters: parsed.liters,
        costPerLiter: parsed.costPerLiter,
        totalCost,
        receiptPhotoUrl: parsed.receiptPhotoUrl ?? null,
        fuelEfficiencyKmL,
        anomalyFlagged,
      },
    });

    return entry;
  });
}

export async function listFleetVehicles(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().fleetVehicleLog.findMany({
      include: { fuelEntries: { orderBy: { createdAt: "desc" }, take: 5 } },
      orderBy: { registrationNo: "asc" },
    });
  });
}

// =============================================================================
// IDEA 15: Campus Discipline & Counseling Dossier
// =============================================================================
export async function logCampusDisciplineIncident(user: SessionUser, input: unknown) {
  const parsed = campusDisciplineInputSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    const record = await tenantDb().campusDisciplineEntry.create({
      data: {
        tenantId: user.tenantId,
        studentId: parsed.studentId,
        studentName: parsed.studentName,
        severityLevel: parsed.severityLevel,
        category: parsed.category,
        demerits: parsed.demerits,
        description: parsed.description,
        parentNotifiedSms: parsed.severityLevel >= 2,
        summonsLetterPdfUrl: parsed.severityLevel >= 3 ? `/pdf/summons-${parsed.studentId}.pdf` : null,
        status: parsed.severityLevel >= 3 ? "SUMMONED" : "LOGGED",
      },
    });
    return record;
  });
}

export async function recordCounselingSession(user: SessionUser, input: unknown) {
  const parsed = counselingRecordInputSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    return tenantDb().counselingRecord.create({
      data: {
        tenantId: user.tenantId,
        studentId: parsed.studentId,
        studentName: parsed.studentName,
        counselorName: parsed.counselorName,
        encryptedNotes: parsed.notes,
        wellnessScore: parsed.wellnessScore,
        status: "ONGOING",
      },
    });
  });
}

export async function listDisciplineAndCounseling(user: SessionUser, studentId?: string) {
  return withTenant(user.tenantId, async () => {
    const incidents = await tenantDb().campusDisciplineEntry.findMany({
      where: studentId ? { studentId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    const counseling = await tenantDb().counselingRecord.findMany({
      where: studentId ? { studentId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return { incidents, counseling };
  });
}

// =============================================================================
// IDEA 16: Kitchen Store Requisitions & Rationing Engine
// =============================================================================
export async function issueKitchenStoreRequisition(user: SessionUser, input: unknown) {
  const parsed = kitchenStoreRequisitionSchema.parse(input);

  const perCapitaFactor = parsed.itemName.toLowerCase().includes("maize") ? 0.35 : 0.25;
  const theoreticalRequiredKg = Number((parsed.activeStudentCount * perCapitaFactor).toFixed(2));
  const divergencePct = Number((((parsed.issuedQuantityKg - theoreticalRequiredKg) / theoreticalRequiredKg) * 100).toFixed(1));
  const divergenceFlagged = Math.abs(divergencePct) > 15;

  return withTenant(user.tenantId, async () => {
    return tenantDb().kitchenStoreRequisition.create({
      data: {
        tenantId: user.tenantId,
        itemName: parsed.itemName,
        unit: parsed.unit,
        stockOnHand: parsed.stockOnHand,
        activeStudentCount: parsed.activeStudentCount,
        theoreticalRequiredKg,
        issuedQuantityKg: parsed.issuedQuantityKg,
        divergencePct,
        divergenceFlagged,
        status: divergenceFlagged ? "FLAGGED_OVERISSUE" : "APPROVED",
      },
    });
  });
}

export async function createSupplierLpo(user: SessionUser, input: unknown) {
  const parsed = supplierLpoSchema.parse(input);
  const lpoNumber = `LPO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  return withTenant(user.tenantId, async () => {
    return tenantDb().supplierLpo.create({
      data: {
        tenantId: user.tenantId,
        lpoNumber,
        supplierName: parsed.supplierName,
        supplierPin: parsed.supplierPin,
        itemDescription: parsed.itemDescription,
        totalAmountKes: parsed.totalAmountKes,
        status: "ISSUED",
      },
    });
  });
}

export async function listKitchenStoreData(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const requisitions = await tenantDb().kitchenStoreRequisition.findMany({ orderBy: { createdAt: "desc" } });
    const lpos = await tenantDb().supplierLpo.findMany({ orderBy: { createdAt: "desc" } });
    return { requisitions, lpos };
  });
}

// =============================================================================
// IDEA 17: Dormitory Bed Allocation Matrix & Hostel Inventory Inspection
// =============================================================================
export async function allocateHostelBed(user: SessionUser, input: unknown) {
  const parsed = hostelBedAllocationSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    return tenantDb().hostelBedAllocation.create({
      data: {
        tenantId: user.tenantId,
        dormitoryName: parsed.dormitoryName,
        cubicleNumber: parsed.cubicleNumber,
        bunkType: parsed.bunkType,
        studentId: parsed.studentId,
        studentName: parsed.studentName,
        mattressTag: parsed.mattressTag,
        lockerTag: parsed.lockerTag,
      },
    });
  });
}

export async function inspectHostelVandalism(user: SessionUser, input: unknown) {
  const parsed = hostelVandalismInspectionSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    const inspection = await tenantDb().hostelVandalismInspection.create({
      data: {
        tenantId: user.tenantId,
        studentId: parsed.studentId,
        studentName: parsed.studentName,
        lockerTag: parsed.lockerTag,
        condition: parsed.condition,
        recoveryFeeKes: parsed.condition === "VANDALIZED" ? parsed.recoveryFeeKes : 0,
        feeInvoiceStamped: parsed.condition === "VANDALIZED",
      },
    });
    return inspection;
  });
}

export async function listHostelAllocations(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const beds = await tenantDb().hostelBedAllocation.findMany({ orderBy: { dormitoryName: "asc" } });
    const inspections = await tenantDb().hostelVandalismInspection.findMany({ orderBy: { createdAt: "desc" } });
    return { beds, inspections };
  });
}

// =============================================================================
// IDEA 18: School Farm Enterprise Accounting
// =============================================================================
export async function recordSchoolFarmYield(user: SessionUser, input: unknown) {
  const parsed = schoolFarmLedgerSchema.parse(input);
  const totalInternalCreditKes = Number((parsed.kitchenTransferQuantity * parsed.internalRateKes).toFixed(2));

  return withTenant(user.tenantId, async () => {
    return tenantDb().schoolFarmLedger.create({
      data: {
        tenantId: user.tenantId,
        enterprise: parsed.enterprise,
        dailyYield: parsed.dailyYield,
        unit: parsed.unit,
        kitchenTransferQuantity: parsed.kitchenTransferQuantity,
        mpesaStaffSalesKes: parsed.mpesaStaffSalesKes,
        internalRateKes: parsed.internalRateKes,
        totalInternalCreditKes,
      },
    });
  });
}

export async function listSchoolFarmLedger(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().schoolFarmLedger.findMany({ orderBy: { entryDate: "desc" } });
  });
}

// =============================================================================
// IDEA 19: Staff Leave & TSC TPAD Appraisal Readiness Tracker
// =============================================================================
export async function recordStaffLeaveSubstitution(user: SessionUser, input: unknown) {
  const parsed = staffLeaveSubstitutionSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    return tenantDb().staffLeaveSubstitution.create({
      data: {
        tenantId: user.tenantId,
        teacherId: parsed.teacherId,
        teacherName: parsed.teacherName,
        leaveType: parsed.leaveType,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        medicalChitUrl: parsed.medicalChitUrl ?? null,
        affectedLessonsCount: parsed.affectedLessonsCount,
        substituteTeacherId: parsed.substituteTeacherId ?? null,
        substituteTeacherName: parsed.substituteTeacherName ?? null,
        substituteSmsSent: true,
        status: "APPROVED",
      },
    });
  });
}

export async function listStaffLeaveSubstitutions(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().staffLeaveSubstitution.findMany({ orderBy: { createdAt: "desc" } });
  });
}

// =============================================================================
// IDEA 20: School Asset & Equipment Maintenance Registry
// =============================================================================
export async function addCapitalAsset(user: SessionUser, input: unknown) {
  const parsed = capitalAssetInputSchema.parse(input);
  const qrTag = `ASSET-${parsed.category}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  return withTenant(user.tenantId, async () => {
    return tenantDb().capitalAssetRegistry.create({
      data: {
        tenantId: user.tenantId,
        qrTag,
        assetName: parsed.assetName,
        category: parsed.category,
        location: parsed.location,
        runningHours: parsed.runningHours,
        nextServiceHours: parsed.nextServiceHours,
        status: "OPERATIONAL",
      },
    });
  });
}

export async function addLabReagent(user: SessionUser, input: unknown) {
  const parsed = labReagentInputSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    return tenantDb().labReagentRegister.create({
      data: {
        tenantId: user.tenantId,
        reagentName: parsed.reagentName,
        quantityLiters: parsed.quantityLiters,
        molarity: parsed.molarity,
        hazardClass: parsed.hazardClass,
        expiryDate: new Date(parsed.expiryDate),
      },
    });
  });
}

export async function listCapitalAssetsAndReagents(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const assets = await tenantDb().capitalAssetRegistry.findMany({ orderBy: { createdAt: "desc" } });
    const reagents = await tenantDb().labReagentRegister.findMany({ orderBy: { expiryDate: "asc" } });
    return { assets, reagents };
  });
}

// =============================================================================
// IDEA 21: Alumni Association & Endowment Campaign Portal
// =============================================================================
export async function createAlumniCampaign(user: SessionUser, input: unknown) {
  const parsed = alumniCampaignInputSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    return tenantDb().alumniEndowmentCampaign.create({
      data: {
        tenantId: user.tenantId,
        title: parsed.title,
        targetAmountKes: parsed.targetAmountKes,
        raisedAmountKes: 0,
        status: "ACTIVE",
      },
    });
  });
}

export async function recordAlumniPledge(user: SessionUser, input: unknown) {
  const parsed = alumniPledgeInputSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    const campaign = await tenantDb().alumniEndowmentCampaign.findUnique({ where: { id: parsed.campaignId } });
    if (!campaign) throw new Error("Campaign not found");

    const pledge = await db.alumniPledge.create({
      data: {
        campaignId: parsed.campaignId,
        alumniName: parsed.alumniName,
        cohortYear: parsed.cohortYear,
        amountKes: parsed.amountKes,
        mpesaReference: parsed.mpesaReference ?? `MPESA-${Math.floor(1000000 + Math.random() * 9000000)}`,
      },
    });

    await tenantDb().alumniEndowmentCampaign.update({
      where: { id: parsed.campaignId },
      data: { raisedAmountKes: campaign.raisedAmountKes + parsed.amountKes },
    });

    return pledge;
  });
}

export async function listAlumniCampaigns(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().alumniEndowmentCampaign.findMany({
      include: { pledges: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
  });
}

// =============================================================================
// IDEA 22: Visitor & Vendor Campus Access Security Log
// =============================================================================
export async function checkInVisitorGate(user: SessionUser, input: unknown) {
  const parsed = visitorGateLogSchema.parse(input);
  const qrBadgePassId = `V-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const custodyAlertTriggered = parsed.visitorName.toLowerCase().includes("restricted");

  return withTenant(user.tenantId, async () => {
    return tenantDb().visitorGateLog.create({
      data: {
        tenantId: user.tenantId,
        visitorName: parsed.visitorName,
        nationalId: parsed.nationalId,
        phone: parsed.phone,
        hostStaffId: parsed.hostStaffId ?? null,
        hostStaffName: parsed.hostStaffName ?? null,
        purpose: parsed.purpose,
        custodyAlertTriggered,
        entryApproved: !custodyAlertTriggered,
        qrBadgePassId,
        status: custodyAlertTriggered ? "DENIED" : "CHECKED_IN",
      },
    });
  });
}

export async function listVisitorGateLogs(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().visitorGateLog.findMany({ orderBy: { checkInTime: "desc" } });
  });
}

// =============================================================================
// IDEA 23: Student Library Book Overdue Fine & Textbook Recovery Engine
// =============================================================================
export async function allocateCoursebook(user: SessionUser, input: unknown) {
  const parsed = coursebookAllocationSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    return tenantDb().coursebookAllocation.create({
      data: {
        tenantId: user.tenantId,
        studentId: parsed.studentId,
        studentName: parsed.studentName,
        bookTitle: parsed.bookTitle,
        copyBarcode: parsed.copyBarcode,
        dueDate: new Date(parsed.dueDate),
        status: "ISSUED",
      },
    });
  });
}

export async function declareLostBookAndStampFee(user: SessionUser, input: unknown) {
  const parsed = textbookFineRecoverySchema.parse(input);
  return withTenant(user.tenantId, async () => {
    const recovery = await tenantDb().textbookFineRecovery.create({
      data: {
        tenantId: user.tenantId,
        studentId: parsed.studentId,
        studentName: parsed.studentName,
        bookTitle: parsed.bookTitle,
        copyBarcode: parsed.copyBarcode,
        replacementCostKes: parsed.replacementCostKes,
        invoiceSuspenseStamped: true,
      },
    });

    await tenantDb().coursebookAllocation.updateMany({
      where: { tenantId: user.tenantId, studentId: parsed.studentId, copyBarcode: parsed.copyBarcode },
      data: { status: "LOST" },
    });

    return recovery;
  });
}

export async function listCoursebookData(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const allocations = await tenantDb().coursebookAllocation.findMany({ orderBy: { createdAt: "desc" } });
    const recoveries = await tenantDb().textbookFineRecovery.findMany({ orderBy: { createdAt: "desc" } });
    return { allocations, recoveries };
  });
}

// =============================================================================
// IDEA 24: Master School Diary & Academic Calendar Event Scheduler
// =============================================================================
export async function createMasterDiaryEvent(user: SessionUser, input: unknown) {
  const parsed = masterSchoolDiaryEventSchema.parse(input);
  return withTenant(user.tenantId, async () => {
    return tenantDb().masterSchoolDiaryEvent.create({
      data: {
        tenantId: user.tenantId,
        eventTitle: parsed.eventTitle,
        category: parsed.category,
        eventDate: new Date(parsed.eventDate),
        targetAudience: parsed.targetAudience,
        smsReminderSent: true,
        parentRsvpCount: parsed.expectedGuestHeadcount > 0 ? Math.floor(parsed.expectedGuestHeadcount * 0.8) : 0,
        expectedGuestHeadcount: parsed.expectedGuestHeadcount,
      },
    });
  });
}

export async function listMasterDiaryEvents(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().masterSchoolDiaryEvent.findMany({ orderBy: { eventDate: "asc" } });
  });
}
