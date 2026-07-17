const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:5432/neyo",
  });
  await client.connect();

  console.log("Connected to PostgreSQL. Running base migrations...");

  const migrationFiles = [
    "20260713174433_init_postgres",
    "20260714060738_aa8_lab_rotation_priority_blocking",
    "20260714084849_aa9_scope_fix_class_teacher_rotate_flag",
    "20260714175345_aa10_exam_elective_block_awareness",
    "20260714182747_aa10_followup_elective_block_prefer_split_exam_sittings",
    "20260716073212_aa6_blocked_timetable_slot",
    "20260716093315_ee1_ee2_cbc_substrand_comment_bank",
    "20260716180000_ee5_scanned_exam_paper",
    "20260716200000_ee6_exam_sharing_approval",
    "20260716220000_ee7_youtube_learning_library",
    "20260716233000_ee8_question_bank",
    "20260717010000_ee9_paper_quiz_formative",
    "20260717030000_ee10_inter_school_contests",
    "20260717050000_ee11_qr_gate_pass",
    "20260717080000_demo_requests_and_custom_emails",
    "20260717160000_ops_management_and_storage_minimization",
    "20260717180000_bundi_ocr_quota_and_release_controls",
    "20260718000000_moe_fintech_safety_and_academic_extensions",
  ];

  for (const m of migrationFiles) {
    const file = path.join(__dirname, `../prisma/migrations/${m}/migration.sql`);
    if (fs.existsSync(file)) {
      const sql = fs.readFileSync(file, "utf8");
      try {
        await client.query(sql);
        console.log(`✓ Applied migration: ${m}`);
      } catch (err) {
        console.log(`Notice on ${m}: ${err.message}`);
      }
    }
  }

  console.log("Creating new tables for Ideas 13 through 24...");

  const newTablesSql = `
  -- Idea 13
  CREATE TABLE IF NOT EXISTS "BomStaffPayroll" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "staffName" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankAccount" TEXT NOT NULL,
    "basicPay" DOUBLE PRECISION NOT NULL,
    "grossPay" DOUBLE PRECISION NOT NULL,
    "shifDeduction" DOUBLE PRECISION NOT NULL,
    "nssfTier1" DOUBLE PRECISION NOT NULL,
    "nssfTier2" DOUBLE PRECISION NOT NULL,
    "housingLevy" DOUBLE PRECISION NOT NULL,
    "payeTax" DOUBLE PRECISION NOT NULL,
    "netPay" DOUBLE PRECISION NOT NULL,
    "payPeriod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "remittanceCsvPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Idea 14
  CREATE TABLE IF NOT EXISTS "FleetVehicleLog" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "makeModel" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 62,
    "odometerKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ntsaExpiry" TIMESTAMP(3) NOT NULL,
    "insuranceExpiry" TIMESTAMP(3) NOT NULL,
    "safetyScore" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "FleetFuelEntry" (
    "id" TEXT PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "costPerLiter" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "receiptPhotoUrl" TEXT,
    "fuelEfficiencyKmL" DOUBLE PRECISION NOT NULL,
    "anomalyFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Idea 15
  CREATE TABLE IF NOT EXISTS "CampusDisciplineEntry" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severityLevel" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "demerits" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "summonsLetterPdfUrl" TEXT,
    "parentNotifiedSms" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'LOGGED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "CounselingRecord" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "counselorName" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encryptedNotes" TEXT NOT NULL,
    "wellnessScore" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'ONGOING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Idea 16
  CREATE TABLE IF NOT EXISTS "KitchenStoreRequisition" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "stockOnHand" DOUBLE PRECISION NOT NULL,
    "activeStudentCount" INTEGER NOT NULL,
    "theoreticalRequiredKg" DOUBLE PRECISION NOT NULL,
    "issuedQuantityKg" DOUBLE PRECISION NOT NULL,
    "divergencePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "divergenceFlagged" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "SupplierLpo" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "lpoNumber" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "supplierPin" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "totalAmountKes" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Idea 17
  CREATE TABLE IF NOT EXISTS "HostelBedAllocation" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "dormitoryName" TEXT NOT NULL,
    "cubicleNumber" TEXT NOT NULL,
    "bunkType" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "mattressTag" TEXT NOT NULL,
    "lockerTag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "HostelVandalismInspection" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "lockerTag" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "recoveryFeeKes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feeInvoiceStamped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Idea 18
  CREATE TABLE IF NOT EXISTS "SchoolFarmLedger" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "enterprise" TEXT NOT NULL,
    "dailyYield" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "kitchenTransferQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mpesaStaffSalesKes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "internalRateKes" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "totalInternalCreditKes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Idea 19
  CREATE TABLE IF NOT EXISTS "StaffLeaveSubstitution" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "medicalChitUrl" TEXT,
    "affectedLessonsCount" INTEGER NOT NULL DEFAULT 0,
    "substituteTeacherId" TEXT,
    "substituteTeacherName" TEXT,
    "substituteSmsSent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Idea 20
  CREATE TABLE IF NOT EXISTS "CapitalAssetRegistry" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "qrTag" TEXT NOT NULL UNIQUE,
    "assetName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "runningHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nextServiceHours" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "status" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "LabReagentRegister" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "reagentName" TEXT NOT NULL,
    "quantityLiters" DOUBLE PRECISION NOT NULL,
    "molarity" TEXT NOT NULL,
    "hazardClass" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Idea 21
  CREATE TABLE IF NOT EXISTS "AlumniEndowmentCampaign" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetAmountKes" DOUBLE PRECISION NOT NULL,
    "raisedAmountKes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "AlumniPledge" (
    "id" TEXT PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "alumniName" TEXT NOT NULL,
    "cohortYear" TEXT NOT NULL,
    "amountKes" DOUBLE PRECISION NOT NULL,
    "mpesaReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Idea 22
  CREATE TABLE IF NOT EXISTS "VisitorGateLog" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "hostStaffId" TEXT,
    "hostStaffName" TEXT,
    "purpose" TEXT NOT NULL,
    "custodyAlertTriggered" BOOLEAN NOT NULL DEFAULT false,
    "entryApproved" BOOLEAN NOT NULL DEFAULT true,
    "qrBadgePassId" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutTime" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'CHECKED_IN'
  );

  -- Idea 23
  CREATE TABLE IF NOT EXISTS "CoursebookAllocation" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "copyBarcode" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "TextbookFineRecovery" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "copyBarcode" TEXT NOT NULL,
    "replacementCostKes" DOUBLE PRECISION NOT NULL,
    "invoiceSuspenseStamped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Idea 24
  CREATE TABLE IF NOT EXISTS "MasterSchoolDiaryEvent" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "smsReminderSent" BOOLEAN NOT NULL DEFAULT false,
    "parentRsvpCount" INTEGER NOT NULL DEFAULT 0,
    "expectedGuestHeadcount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `;

  await client.query(newTablesSql);
  console.log("✓ All 12 new tables created successfully!");

  await client.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
