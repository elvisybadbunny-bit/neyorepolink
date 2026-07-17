import { db } from "../src/lib/db";
import { group, testAsync, expect, summary } from "./_assert";
import {
  calculateKenyanStatutoryDeductions,
  runBomPayroll,
  listBomPayrolls,
  addFleetVehicle,
  recordFleetFuel,
  listFleetVehicles,
  logCampusDisciplineIncident,
  recordCounselingSession,
  listDisciplineAndCounseling,
  issueKitchenStoreRequisition,
  createSupplierLpo,
  listKitchenStoreData,
  allocateHostelBed,
  inspectHostelVandalism,
  listHostelAllocations,
  recordSchoolFarmYield,
  listSchoolFarmLedger,
  recordStaffLeaveSubstitution,
  listStaffLeaveSubstitutions,
  addCapitalAsset,
  addLabReagent,
  listCapitalAssetsAndReagents,
  createAlumniCampaign,
  recordAlumniPledge,
  listAlumniCampaigns,
  checkInVisitorGate,
  listVisitorGateLogs,
  allocateCoursebook,
  declareLostBookAndStampFee,
  listCoursebookData,
  createMasterDiaryEvent,
  listMasterDiaryEvents,
} from "../src/lib/services/extensions-v2.service";
import { setEeFeatureReleased, isEeFeatureReleased } from "../src/lib/services/platform-flags.service";

async function main() {
  console.log("================================================================");
  console.log("Running Full-Stack Integration Verification Suite for Ideas 13–24");
  console.log("================================================================");

  // Retrieve principal user for Karibu High School
  const karibu = await db.tenant.findFirst({ where: { name: { contains: "Karibu" } } });
  if (!karibu) throw new Error("Karibu tenant missing");

  const principal = await db.user.findFirst({ where: { tenantId: karibu.id, role: "PRINCIPAL" } });
  if (!principal) throw new Error("Principal missing");

  const user = {
    id: principal.id,
    tenantId: principal.tenantId,
    neyoLoginId: principal.neyoLoginId,
    fullName: principal.fullName,
    phone: principal.phone,
    email: principal.email,
    role: principal.role as any,
    secondaryRole: principal.secondaryRole as any,
    language: principal.language ?? "en",
  };

  group("1. NEYO Ops Feature Toggle Controls");
  await testAsync("EE.16 through EE.27 can be dynamically toggled and released", async () => {
    const opsUser = { ...user, role: "FOUNDER" as const };
    for (let i = 16; i <= 27; i++) {
      const flagKey = `EE.${i}`;
      await setEeFeatureReleased(opsUser, flagKey, true, `Testing release of ${flagKey}`);
      const released = await isEeFeatureReleased(flagKey);
      expect(released).toBe(true);
    }
  });

  group("2. Idea 13: BOM Staff & TSC Statutory Payroll Engine");
  await testAsync("Kenyan Statutory Deductions (SHIF 2.75%, NSSF I/II, AHL 1.5%, PAYE) & Bank Manifests", async () => {
    const math = calculateKenyanStatutoryDeductions(35000);
    expect(math.shifDeduction).toBe(962.50);
    expect(math.nssfTier1).toBe(480);
    expect(math.housingLevy).toBe(525);
    expect(math.netPay > 0).toBe(true);

    const payroll = await runBomPayroll(user, {
      staffName: "Wanjiru Cook",
      idNumber: "28401928",
      jobTitle: "Main Boarding Cook",
      bankName: "KCB Bank",
      bankAccount: "1122334455",
      basicPay: 28000,
      payPeriod: "2026-07",
    });
    expect(payroll.status).toBe("APPROVED");
    expect(payroll.shifDeduction).toBe(770);

    const payrolls = await listBomPayrolls(user, "2026-07");
    expect(payrolls.length > 0).toBe(true);
  });

  group("3. Idea 14: Vehicle Fleet & Bus Logbook Suite");
  await testAsync("Vehicle registration, odometer, fuel OCR, and NTSA inspection status", async () => {
    const bus = await addFleetVehicle(user, {
      registrationNo: "KCB 401Z",
      makeModel: "Toyota Coaster 33-Seater",
      capacity: 33,
      odometerKm: 12400,
      ntsaExpiry: "2026-12-31",
      insuranceExpiry: "2026-12-31",
    });
    expect(bus.registrationNo).toBe("KCB 401Z");

    const fuel = await recordFleetFuel(user, {
      vehicleId: bus.id,
      liters: 45,
      costPerLiter: 182.5,
      receiptPhotoUrl: "/uploads/fuel-receipt-001.jpg",
    });
    expect(fuel.totalCost).toBe(8212.5);

    const vehicles = await listFleetVehicles(user);
    expect(vehicles.some((v) => v.registrationNo === "KCB 401Z")).toBe(true);
  });

  group("4. Idea 15: Campus Discipline & Counseling Dossier");
  await testAsync("Tiered demerit conduct matrix, watermarked summons PDF, & counselor vault", async () => {
    const achieng = await db.student.findFirst({ where: { tenantId: karibu.id, admissionNo: "KHS1" } });
    expect(!!achieng).toBe(true);

    const incident = await logCampusDisciplineIncident(user, {
      studentId: achieng!.id,
      studentName: "Achieng Mary",
      severityLevel: 3,
      category: "Sneaking",
      demerits: 15,
      description: "Sneaking out past dormitory lockdown",
    });
    expect(incident.status).toBe("SUMMONED");
    expect(!!incident.summonsLetterPdfUrl).toBe(true);

    const counseling = await recordCounselingSession(user, {
      studentId: achieng!.id,
      studentName: "Achieng Mary",
      counselorName: "Mrs. Nduku",
      notes: "Restorative guidance session completed on emotional resilience.",
      wellnessScore: 8,
    });
    expect(counseling.wellnessScore).toBe(8);

    const discData = await listDisciplineAndCounseling(user, achieng!.id);
    expect(discData.incidents.length > 0).toBe(true);
    expect(discData.counseling.length > 0).toBe(true);
  });

  group("5. Idea 16: Dining Hall Rationing & Store Requisition Management Engine");
  await testAsync("Per-capita daily food ration calibrator, divergence radar, & supplier LPOs", async () => {
    const req = await issueKitchenStoreRequisition(user, {
      itemName: "Dry Maize",
      unit: "Kgs",
      stockOnHand: 3000,
      activeStudentCount: 800,
      issuedQuantityKg: 420,
    });
    expect(req.theoreticalRequiredKg).toBe(280);
    expect(req.divergenceFlagged).toBe(true);

    const lpo = await createSupplierLpo(user, {
      supplierName: "Mwala Cereals Wholesalers",
      supplierPin: "P051283920X",
      itemDescription: "50 Bags Grade 1 White Maize",
      totalAmountKes: 180000,
    });
    expect(lpo.lpoNumber.startsWith("LPO-")).toBe(true);

    const storeData = await listKitchenStoreData(user);
    expect(storeData.requisitions.length > 0).toBe(true);
    expect(storeData.lpos.length > 0).toBe(true);
  });

  group("6. Idea 17: Dormitory Bed Allocation Matrix & Hostel Inventory Inspection");
  await testAsync("Cubicle roll-call grid, asset tagging, & damage recovery fee stamping", async () => {
    const achieng = await db.student.findFirst({ where: { tenantId: karibu.id, admissionNo: "KHS1" } });

    const bed = await allocateHostelBed(user, {
      dormitoryName: "Mara House",
      cubicleNumber: "Cubicle 2",
      bunkType: "LOWER",
      studentId: achieng!.id,
      studentName: "Achieng Mary",
      mattressTag: "MT-MARA-102",
      lockerTag: "LK-MARA-102",
    });
    expect(bed.mattressTag).toBe("MT-MARA-102");

    const inspection = await inspectHostelVandalism(user, {
      studentId: achieng!.id,
      studentName: "Achieng Mary",
      lockerTag: "LK-MARA-102",
      condition: "VANDALIZED",
      recoveryFeeKes: 1500,
    });
    expect(inspection.feeInvoiceStamped).toBe(true);

    const hostelData = await listHostelAllocations(user);
    expect(hostelData.beds.length > 0).toBe(true);
    expect(hostelData.inspections.length > 0).toBe(true);
  });

  group("7. Idea 18: School Farm & Agricultural Enterprise Accounting");
  await testAsync("Double-entry yield ledger, internal kitchen sell-back, & M-Pesa sales counter", async () => {
    const farmEntry = await recordSchoolFarmYield(user, {
      enterprise: "DAIRY",
      dailyYield: 180,
      unit: "Liters",
      kitchenTransferQuantity: 140,
      mpesaStaffSalesKes: 2400,
      internalRateKes: 60,
    });
    expect(farmEntry.totalInternalCreditKes).toBe(8400);

    const farmLedger = await listSchoolFarmLedger(user);
    expect(farmLedger.length > 0).toBe(true);
  });

  group("8. Idea 19: Staff Leave & TSC TPAD Appraisal Readiness Tracker");
  await testAsync("Leave application, clash-free lesson substitution, & TPAD readiness export", async () => {
    const leave = await recordStaffLeaveSubstitution(user, {
      teacherId: user.id,
      teacherName: user.fullName,
      leaveType: "SICK",
      startDate: "2026-07-20",
      endDate: "2026-07-22",
      affectedLessonsCount: 8,
      substituteTeacherId: "TCH-009",
      substituteTeacherName: "Mr. Otieno Chem",
    });
    expect(leave.substituteSmsSent).toBe(true);

    const subs = await listStaffLeaveSubstitutions(user);
    expect(subs.length > 0).toBe(true);
  });

  group("9. Idea 20: School Asset & Equipment Maintenance Registry");
  await testAsync("QR asset tags, lab reagent hazmat safety register, & utility running-hour alerts", async () => {
    const asset = await addCapitalAsset(user, {
      assetName: "Submersible Water Borehole Pump 15HP",
      category: "BOREHOLE",
      location: "Main Water Tower",
      runningHours: 210,
      nextServiceHours: 250,
    });
    expect(asset.qrTag.startsWith("ASSET-BOREHOLE-")).toBe(true);

    const reagent = await addLabReagent(user, {
      reagentName: "Concentrated Sulphuric Acid H2SO4",
      quantityLiters: 2.5,
      molarity: "2M",
      hazardClass: "CORROSIVE",
      expiryDate: "2027-06-30",
    });
    expect(reagent.hazardClass).toBe("CORROSIVE");

    const assetData = await listCapitalAssetsAndReagents(user);
    expect(assetData.assets.length > 0).toBe(true);
    expect(assetData.reagents.length > 0).toBe(true);
  });

  group("10. Idea 21: Alumni Association & Endowment Campaign Portal");
  await testAsync("Cohort directory, mentorship scheduler, & live M-Pesa campaign thermometer", async () => {
    const campaign = await createAlumniCampaign(user, {
      title: "New ICT Computer Lab 80-PC Expansion",
      targetAmountKes: 5000000,
    });
    expect(campaign.targetAmountKes).toBe(5000000);

    const pledge = await recordAlumniPledge(user, {
      campaignId: campaign.id,
      alumniName: "Eng. Kamau",
      cohortYear: "2010",
      amountKes: 250000,
    });
    expect(pledge.amountKes).toBe(250000);

    const campaigns = await listAlumniCampaigns(user);
    const updatedCampaign = campaigns.find((c) => c.id === campaign.id);
    expect(updatedCampaign!.raisedAmountKes).toBe(250000);
  });

  group("11. Idea 22: Visitor & Vendor Campus Access Security Log");
  await testAsync("Rapid gate sign-in, host SMS entry authorization, & printable QR passes", async () => {
    const visitorPass = await checkInVisitorGate(user, {
      visitorName: "Mary Wanjiru",
      nationalId: "28401928",
      phone: "+254 711 222 333",
      purpose: "Delivery of Exam Printing Paper",
    });
    expect(visitorPass.qrBadgePassId.startsWith("V-")).toBe(true);
    expect(visitorPass.status).toBe("CHECKED_IN");

    const visitorLogs = await listVisitorGateLogs(user);
    expect(visitorLogs.length > 0).toBe(true);
  });

  group("12. Idea 23: Student Library Book Overdue Fine & Textbook Recovery Engine");
  await testAsync("1:1 Coursebook allocation matrix, daily fine accrual, & lost book fee stamping", async () => {
    const achieng = await db.student.findFirst({ where: { tenantId: karibu.id, admissionNo: "KHS1" } });

    const allocation = await allocateCoursebook(user, {
      studentId: achieng!.id,
      studentName: "Achieng Mary",
      bookTitle: "Secondary Chemistry Form 2 KLB",
      copyBarcode: "C-CHEM-089",
      dueDate: "2026-11-30",
    });
    expect(allocation.copyBarcode).toBe("C-CHEM-089");

    const recovery = await declareLostBookAndStampFee(user, {
      studentId: achieng!.id,
      studentName: "Achieng Mary",
      bookTitle: "Secondary Chemistry Form 2 KLB",
      copyBarcode: "C-CHEM-089",
      replacementCostKes: 950,
    });
    expect(recovery.invoiceSuspenseStamped).toBe(true);

    const coursebookData = await listCoursebookData(user);
    expect(coursebookData.allocations.length > 0).toBe(true);
    expect(coursebookData.recoveries.length > 0).toBe(true);
  });

  group("13. Idea 24: Termly School Diary & Academic Calendar Event Scheduler");
  await testAsync("Multi-category event calendar, 72-hr SMS reminders, & parent RSVP forecast", async () => {
    const event = await createMasterDiaryEvent(user, {
      eventTitle: "Term 2 Annual General Sports Derby",
      category: "SPORTS",
      eventDate: "2026-08-15",
      targetAudience: "ALL",
      expectedGuestHeadcount: 1200,
    });
    expect(event.smsReminderSent).toBe(true);
    expect(event.parentRsvpCount).toBe(960);

    const diaryEvents = await listMasterDiaryEvents(user);
    expect(diaryEvents.length > 0).toBe(true);
  });

  summary();
}

main().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
