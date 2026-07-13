-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "idPrefix" TEXT,
    "county" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "osKey" TEXT NOT NULL DEFAULT 'school',
    "principalSignatureUrl" TEXT,
    "schoolStampUrl" TEXT,
    "curriculum" TEXT,
    "educationLevelsOffered" TEXT,
    "onboardedAt" TIMESTAMP(3),
    "referralCode" TEXT,
    "referredByTenantId" TEXT,
    "hasClaimedReferral" BOOLEAN NOT NULL DEFAULT false,
    "appliedCampaignId" TEXT,
    "appliedInfluencerCodeId" TEXT,
    "firstTermDiscountKes" INTEGER NOT NULL DEFAULT 0,
    "hasClaimedFirstTermDiscount" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "demoExpiresAt" TIMESTAMP(3),
    "schoolType" TEXT NOT NULL DEFAULT 'DAY',
    "uniformSupplierName" TEXT,
    "uniformSupplierPhone" TEXT,
    "pathwaySchoolType" TEXT NOT NULL DEFAULT 'NONE',
    "enabledPathwayGroups" TEXT DEFAULT '[]',
    "showReligiousHolidays" BOOLEAN NOT NULL DEFAULT true,
    "libraryFinesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "libraryFinePerDayKes" INTEGER NOT NULL DEFAULT 10,
    "motto" TEXT,
    "vision" TEXT,
    "mission" TEXT,
    "about" TEXT,
    "logoUrl" TEXT,
    "brandPrimary" TEXT,
    "brandAccent" TEXT,
    "addressLine" TEXT,
    "socialLinks" TEXT,
    "joiningRequirements" TEXT,
    "documentDesignJson" TEXT,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "gpsRadiusM" INTEGER,
    "collectionTargetPct" INTEGER NOT NULL DEFAULT 85,
    "poApprovalThresholdKes" INTEGER NOT NULL DEFAULT 50000,
    "expenseApprovalThresholdKes" INTEGER NOT NULL DEFAULT 20000,
    "siblingDiscountPct" INTEGER NOT NULL DEFAULT 0,
    "transportMidTermBillingRule" TEXT NOT NULL DEFAULT 'NEXT_TERM_ONLY',
    "allowParentTransportRequests" BOOLEAN NOT NULL DEFAULT false,
    "allowParentCafeteriaRequests" BOOLEAN NOT NULL DEFAULT false,
    "requireBiometricForFinance" BOOLEAN NOT NULL DEFAULT false,
    "allowTeacherCashPayments" BOOLEAN NOT NULL DEFAULT false,
    "feeReminderGraceDays" INTEGER NOT NULL DEFAULT 0,
    "feeReminderDedupeDays" INTEGER NOT NULL DEFAULT 3,
    "smsSpendAlertThresholdKes" INTEGER,
    "smsSpendAlertLastNotifiedPeriodKey" TEXT,
    "enforce2Fa" BOOLEAN NOT NULL DEFAULT false,
    "requireJointOwnerApproval" BOOLEAN NOT NULL DEFAULT false,
    "printLimitPerDay" INTEGER DEFAULT 0,
    "printStationMode" TEXT NOT NULL DEFAULT 'AUTO',
    "cafeteriaTableSize" INTEGER NOT NULL DEFAULT 8,
    "cafeteriaMealModel" TEXT NOT NULL DEFAULT 'HYBRID',
    "cafeteriaMealScope" TEXT NOT NULL DEFAULT 'ALL',
    "navVisibility" TEXT,
    "encryptedDek" TEXT,
    "dekIv" TEXT,
    "dekTag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tscNumber" TEXT,
    "nationalId" TEXT,
    "kraPin" TEXT,
    "qualifications" TEXT,
    "employmentDate" TEXT,
    "contractType" TEXT NOT NULL DEFAULT 'PERMANENT',
    "contractEndDate" TEXT,
    "emergencyContact" TEXT,
    "visibilityAreas" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubstituteAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leaveRequestId" TEXT NOT NULL,
    "timetableSlotId" TEXT NOT NULL,
    "originalTeacherId" TEXT NOT NULL,
    "originalTeacherName" TEXT NOT NULL,
    "substituteTeacherId" TEXT,
    "substituteTeacherName" TEXT,
    "coverageDates" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "confirmedById" TEXT,
    "confirmedByName" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "revertedById" TEXT,
    "revertedByName" TEXT,
    "revertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubstituteAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadline" TEXT,
    "open" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "postingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appraisal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "strengths" TEXT,
    "improvements" TEXT,
    "reviewerId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appraisal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplinaryRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "actionTaken" TEXT,
    "recordedById" TEXT NOT NULL,
    "recordedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisciplinaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT,
    "date" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 1,
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffSalary" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "basicKes" INTEGER NOT NULL,
    "houseAllowanceKes" INTEGER NOT NULL DEFAULT 0,
    "transportAllowanceKes" INTEGER NOT NULL DEFAULT 0,
    "otherAllowanceKes" INTEGER NOT NULL DEFAULT 0,
    "saccoKes" INTEGER NOT NULL DEFAULT 0,
    "loanKes" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "basicKes" INTEGER NOT NULL,
    "allowancesKes" INTEGER NOT NULL,
    "overtimeKes" INTEGER NOT NULL DEFAULT 0,
    "grossKes" INTEGER NOT NULL,
    "payeKes" INTEGER NOT NULL,
    "shifKes" INTEGER NOT NULL,
    "nssfKes" INTEGER NOT NULL,
    "housingLevyKes" INTEGER NOT NULL,
    "saccoKes" INTEGER NOT NULL,
    "loanKes" INTEGER NOT NULL,
    "netKes" INTEGER NOT NULL,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "classId" TEXT,
    "applyToAllLevels" BOOLEAN NOT NULL DEFAULT false,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeItem" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,

    CONSTRAINT "FeeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "structureId" TEXT,
    "description" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'FEE',
    "totalKes" INTEGER NOT NULL,
    "paidKes" INTEGER NOT NULL DEFAULT 0,
    "discountKes" INTEGER NOT NULL DEFAULT 0,
    "discountReason" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "printCount" INTEGER NOT NULL DEFAULT 0,
    "lastPrintedAt" TIMESTAMP(3),
    "lastPrintedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "dueDate" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherCashPaymentRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "submittedByName" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "resultPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherCashPaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CbcStrand" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "learningAreaId" TEXT,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "learningOutcome" TEXT,

    CONSTRAINT "CbcStrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CbcAssessment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "strandId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "comment" TEXT,
    "date" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CbcAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'EXAM',
    "maxMarks" INTEGER NOT NULL DEFAULT 100,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamReleaseApprovalRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "summaryJson" TEXT,

    CONSTRAINT "ExamReleaseApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSubject" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "ExamSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "marks" INTEGER NOT NULL,
    "enteredById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentType" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'SCHOOL_DEFINED',
    "scoreMode" TEXT NOT NULL DEFAULT 'MIXED',
    "defaultMaxMarks" INTEGER,
    "defaultWeight" INTEGER NOT NULL DEFAULT 0,
    "effectiveFrom" TEXT,
    "effectiveTo" TEXT,
    "evidenceAllowed" BOOLEAN NOT NULL DEFAULT true,
    "requiresModeration" BOOLEAN NOT NULL DEFAULT true,
    "rubricId" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assessmentTypeId" TEXT NOT NULL,
    "curriculumId" TEXT,
    "educationLevelId" TEXT,
    "gradeBandId" TEXT,
    "learningAreaId" TEXT,
    "subjectId" TEXT,
    "classId" TEXT,
    "academicTermId" TEXT,
    "examId" TEXT,
    "homeworkId" TEXT,
    "quizId" TEXT,
    "cbcStrandId" TEXT,
    "rubricId" TEXT,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "maxMarks" INTEGER,
    "dueDate" TEXT,
    "rubricJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "visibleToParents" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "scoreMarks" DOUBLE PRECISION,
    "scorePct" INTEGER,
    "rubricLevel" INTEGER,
    "rubricCode" TEXT,
    "narrative" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rubricId" TEXT,
    "sourceModule" TEXT,
    "sourceId" TEXT,
    "assessedById" TEXT NOT NULL,
    "assessedByName" TEXT NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderatedById" TEXT,
    "moderatedByName" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentEvidence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "storedFileId" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "contentType" TEXT,
    "evidenceType" TEXT NOT NULL DEFAULT 'FILE',
    "note" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "curriculumId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competency" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "groupId" TEXT,
    "curriculumId" TEXT,
    "learningAreaId" TEXT,
    "rubricId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyEvidence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sourceModule" TEXT NOT NULL DEFAULT 'MANUAL',
    "sourceId" TEXT,
    "assessmentRecordId" TEXT,
    "cbcAssessmentId" TEXT,
    "rubricId" TEXT,
    "level" INTEGER,
    "scorePct" INTEGER,
    "narrative" TEXT,
    "evidenceDate" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "recordedByName" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "visibleToParents" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Kenya',
    "context" TEXT,
    "activeVersion" TEXT NOT NULL DEFAULT 'v1',
    "effectiveFrom" TEXT,
    "effectiveTo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "previousVersionId" TEXT,
    "adoptedTemplateId" TEXT,
    "adoptedTemplateVersion" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationLevel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "levelKey" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeBand" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "educationLevelId" TEXT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "entryAge" INTEGER,
    "exitAge" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeBand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningArea" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityCategory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'gray',
    "description" TEXT,
    "maxPerWeek" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hodId" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "curriculum" TEXT NOT NULL,
    "curriculumId" TEXT,
    "learningAreaId" TEXT,
    "departmentId" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "mathVariant" TEXT,
    "compulsoryPathwayGroups" TEXT DEFAULT '[]',

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicTerm" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "curriculumId" TEXT,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademicTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DutyRosterEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "termLabel" TEXT NOT NULL,
    "rotationPeriod" TEXT NOT NULL,
    "weekNo" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "primaryTeacherId" TEXT NOT NULL,
    "primaryTeacherName" TEXT NOT NULL,
    "assistantTeacherId" TEXT,
    "assistantTeacherName" TEXT,
    "dutyTeamSize" INTEGER NOT NULL DEFAULT 2,
    "dutyTeacherIds" TEXT,
    "dutyTeacherNames" TEXT,
    "duties" TEXT NOT NULL,
    "generatedById" TEXT NOT NULL,
    "generatedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DutyRosterEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableSlot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT,
    "activityCategoryId" TEXT,
    "teacherId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "slotType" TEXT NOT NULL DEFAULT 'ACADEMIC',
    "weekRotation" TEXT NOT NULL DEFAULT 'ALL',
    "venue" TEXT,
    "electiveBlockSlotId" TEXT,

    CONSTRAINT "TimetableSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "objectives" TEXT,
    "strandId" TEXT,
    "competencyId" TEXT,
    "assessmentPlanId" TEXT,
    "activities" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homework" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "dueDate" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassNote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "homeworkId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "text" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "late" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradePct" INTEGER,
    "feedback" TEXT,
    "gradedById" TEXT,
    "gradedAt" TIMESTAMP(3),

    CONSTRAINT "HomeworkSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correctIndex" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "scorePct" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumThread" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkMessage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "audienceType" TEXT NOT NULL,
    "classId" TEXT,
    "audienceLabel" TEXT NOT NULL,
    "role" TEXT,
    "channel" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "sentCount" INTEGER NOT NULL,
    "skippedCount" INTEGER NOT NULL,
    "costKes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherCommsApprovalRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "audienceType" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "audienceLabel" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'in_app',
    "body" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "bulkMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherCommsApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryBook" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "isbn" TEXT,
    "category" TEXT,
    "shelf" TEXT,
    "copiesTotal" INTEGER NOT NULL DEFAULT 1,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryBookCopy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "copyNo" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryBookCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookIssue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "copyId" TEXT,
    "borrowerType" TEXT NOT NULL DEFAULT 'STUDENT',
    "studentId" TEXT,
    "borrowerUserId" TEXT,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL DEFAULT '',
    "issuedById" TEXT NOT NULL,
    "issuedByName" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TEXT NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "fineKes" INTEGER NOT NULL DEFAULT 0,
    "finePaid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BookIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hostel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "masterId" TEXT,
    "boardingFeeKes" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hostel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelRoom" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "HostelRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelAllocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "bedNo" INTEGER NOT NULL,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "HostelAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelAttendance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "hostelName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "markedById" TEXT NOT NULL,
    "markedByName" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostelAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportRoute" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stops" TEXT,
    "termFeeKes" INTEGER NOT NULL DEFAULT 0,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportShift" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "seatCapOverride" INTEGER,
    "termFeeKesOverride" INTEGER,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HardwareDeviceConnection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
    "deviceName" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "metadataJson" TEXT,
    "updatedById" TEXT,
    "updatedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HardwareDeviceConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GpsBusLocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "vehicleRegNo" TEXT,
    "trackerId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "speedKph" DOUBLE PRECISION,
    "headingDeg" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GpsBusLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CctvCamera" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "streamUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CctvCamera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "licenseExpiry" TEXT,
    "nationalId" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "regNo" TEXT NOT NULL,
    "make" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 33,
    "insuranceExpiry" TEXT,
    "inspectionExpiry" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleMaintenance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "costKes" INTEGER NOT NULL DEFAULT 0,
    "odometerKm" INTEGER,
    "garage" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "litres" DOUBLE PRECISION NOT NULL,
    "costKes" INTEGER NOT NULL,
    "odometerKm" INTEGER,
    "station" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "shiftId" TEXT,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "pickupStop" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "TransportAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportRouteChangeRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "currentRouteId" TEXT,
    "currentShiftId" TEXT,
    "requestedRouteId" TEXT NOT NULL,
    "requestedShiftId" TEXT,
    "requestedPickupStop" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "billingActionTaken" TEXT,
    "billingNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportRouteChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorderLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellPriceKes" INTEGER,
    "imageUrl" TEXT,
    "trackExpiry" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockBatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "batchNo" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "expiryDate" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "studentId" TEXT,
    "studentName" TEXT,
    "invoiceId" TEXT,
    "byId" TEXT NOT NULL,
    "byName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT,
    "custodian" TEXT,
    "acquiredOn" TEXT,
    "valueKes" INTEGER NOT NULL DEFAULT 0,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "depreciationPctPerYear" INTEGER NOT NULL DEFAULT 0,
    "nextMaintenanceOn" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMaintenance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'SERVICE',
    "costKes" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "byName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "menu" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlanEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CafeteriaTable" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "classLabel" TEXT NOT NULL,
    "tableNo" INTEGER NOT NULL,
    "seats" INTEGER NOT NULL,
    "studentsJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CafeteriaTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CafeteriaQueueEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "queueNo" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "classLabel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "servedAt" TIMESTAMP(3),
    "servedById" TEXT,
    "servedByName" TEXT,

    CONSTRAINT "CafeteriaQueueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealCard" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cardNo" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "meals" TEXT NOT NULL,
    "termFeeKes" INTEGER NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "followsLiveDefault" BOOLEAN NOT NULL DEFAULT false,
    "feePlanId" TEXT,

    CONSTRAINT "MealCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CafeteriaFeePlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "classId" TEXT,
    "meals" TEXT NOT NULL,
    "termFeeKes" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CafeteriaFeePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CafeteriaEnrollmentRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "resultCardId" TEXT,
    "resultNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CafeteriaEnrollmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniformOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "size" TEXT,
    "qty" INTEGER NOT NULL,
    "unitKes" INTEGER NOT NULL,
    "totalKes" INTEGER NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLACED',
    "placedById" TEXT NOT NULL,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "UniformOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformFlag" (
    "id" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomFeatureRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "quotedPriceKes" INTEGER,
    "quotedBillingCycle" TEXT,
    "opsNote" TEXT,
    "schoolReply" TEXT,
    "declineReason" TEXT,
    "deliveredFeatureKey" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "releasedToAllSchools" BOOLEAN NOT NULL DEFAULT false,
    "releasedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomFeatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "resultJson" TEXT,
    "error" TEXT,
    "startedById" TEXT NOT NULL,
    "startedByName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplineIncident" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "actionTaken" TEXT,
    "reportedById" TEXT NOT NULL,
    "reportedByName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "parentNotifiedAt" TIMESTAMP(3),
    "proofFileUrl" TEXT,
    "proofFileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisciplineIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suspension" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "conditions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "issuedById" TEXT NOT NULL,
    "issuedByName" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "parentNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suspension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounselingNote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "followUpOn" TEXT,
    "counselorId" TEXT NOT NULL,
    "counselorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CounselingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentMedical" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "conditions" TEXT,
    "allergies" TEXT,
    "shaNumber" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentMedical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicVisit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "complaint" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "medicationGiven" TEXT,
    "referredTo" TEXT,
    "recordedById" TEXT NOT NULL,
    "recordedByName" TEXT NOT NULL,
    "parentNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "drug" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationDose" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "givenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "byId" TEXT NOT NULL,
    "byName" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "MedicationDose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintJob" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "classId" TEXT,
    "classLabel" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "queuedBy" TEXT NOT NULL,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "printedAt" TIMESTAMP(3),

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintApprovalRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "docKind" TEXT NOT NULL,
    "docRef" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GatePass" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "passNo" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "leaveAt" TIMESTAMP(3) NOT NULL,
    "returnBy" TIMESTAMP(3),
    "escortName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "issuedById" TEXT NOT NULL,
    "issuedByName" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GatePass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupPerson" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nationalId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "addedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickupPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AltPickupAuthorization" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "pickerName" TEXT NOT NULL,
    "pickerPhone" TEXT,
    "relationship" TEXT,
    "code" TEXT NOT NULL,
    "screenshotUrl" TEXT,
    "screenshotName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AltPickupAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanicAlert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "note" TEXT,
    "raisedById" TEXT NOT NULL,
    "raisedByName" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "smsSent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PanicAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAttendance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "clockInAt" TIMESTAMP(3) NOT NULL,
    "clockOutAt" TIMESTAMP(3),
    "gpsVerified" BOOLEAN NOT NULL DEFAULT false,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "gpsDistanceM" INTEGER,

    CONSTRAINT "StaffAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionApplication" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dateOfBirth" TEXT,
    "gradeWanted" TEXT NOT NULL,
    "curriculum" TEXT,
    "previousSchool" TEXT,
    "guardianName" TEXT NOT NULL,
    "guardianPhone" TEXT NOT NULL,
    "guardianEmail" TEXT,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'online',
    "interviewDate" TEXT,
    "interviewTime" TEXT,
    "interviewNote" TEXT,
    "calendarEventId" TEXT,
    "depositRequiredKes" INTEGER NOT NULL DEFAULT 0,
    "depositPaidKes" INTEGER NOT NULL DEFAULT 0,
    "depositPaidAt" TIMESTAMP(3),
    "depositRef" TEXT,
    "decisionNote" TEXT,
    "letterCode" TEXT,
    "studentId" TEXT,
    "inquiryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "moves" TEXT NOT NULL,
    "undoneAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassYearHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "stream" TEXT,
    "curriculum" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "promotionRunId" TEXT,
    "studentCount" INTEGER NOT NULL,
    "roster" TEXT NOT NULL,
    "subjectTeachers" TEXT NOT NULL,
    "classTeacherId" TEXT,
    "classTeacherName" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassYearHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAllocationReviewRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "promotionRunId" TEXT,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "decisions" TEXT NOT NULL,
    "appliedCount" INTEGER NOT NULL DEFAULT 0,
    "autoFilledCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TeacherAllocationReviewRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassGroupingRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetLevel" TEXT,
    "ruleType" TEXT NOT NULL DEFAULT 'SUBJECT_SET',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "configJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassGroupingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherWorkloadRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT,
    "maxClasses" INTEGER,
    "maxLessonsPerWeek" INTEGER,
    "retainSubjectLoads" BOOLEAN NOT NULL DEFAULT true,
    "retainClassTeacher" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherWorkloadRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherContinuityAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "levelKey" TEXT NOT NULL,
    "subjectId" TEXT,
    "classId" TEXT,
    "teacherId" TEXT NOT NULL,
    "roleType" TEXT NOT NULL DEFAULT 'SUBJECT',
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherContinuityAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherTransferImpact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "replacementTeacherId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reason" TEXT,
    "affectedJson" TEXT NOT NULL DEFAULT '[]',
    "recommendationJson" TEXT NOT NULL DEFAULT '[]',
    "timetableJobId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherTransferImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrincipalDelegationTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "assignedToId" TEXT NOT NULL,
    "assignedToName" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedByName" TEXT NOT NULL,
    "dueDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrincipalDelegationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "smsSentAt" TIMESTAMP(3),
    "markedById" TEXT NOT NULL,
    "markedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrScanEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "detail" TEXT,
    "scannedById" TEXT NOT NULL,
    "scannedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrScanEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTransfer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "destinationSchool" TEXT NOT NULL,
    "destinationCounty" TEXT,
    "transferDate" TEXT NOT NULL,
    "reason" TEXT,
    "previousClassId" TEXT,
    "letterCode" TEXT,
    "reversedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentImport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fileName" TEXT,
    "source" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "createdRows" INTEGER NOT NULL,
    "updatedRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL,
    "errorRows" TEXT,
    "targetClassId" TEXT,
    "subjectSelectionsCreated" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassAllocationRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "classStrategy" TEXT NOT NULL,
    "streamCount" INTEGER,
    "capacityPerClass" INTEGER,
    "createdClassIds" TEXT NOT NULL DEFAULT '[]',
    "promotionRunId" TEXT,
    "timetableJobId" TEXT,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "classSubjectNeedsSeeded" INTEGER NOT NULL DEFAULT 0,
    "teachersAutoAssigned" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ClassAllocationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentCustomField" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVerification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT,

    CONSTRAINT "DocumentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantStorageProvider" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'NEYO_MANAGED_OBJECT_STORAGE',
    "status" TEXT NOT NULL DEFAULT 'DESIGN_READY',
    "accountEmail" TEXT,
    "rootFolderId" TEXT,
    "storageLimitBytes" BIGINT NOT NULL DEFAULT 16106127360,
    "storageUsedBytes" BIGINT NOT NULL DEFAULT 0,
    "encryptionMode" TEXT NOT NULL DEFAULT 'AES_256_GCM_ENVELOPE',
    "healthStatus" TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
    "lastHealthCheckAt" TIMESTAMP(3),
    "lastUpgradePromptAt" TIMESTAMP(3),
    "upgradePlan" TEXT,
    "notes" TEXT,
    "linkedStorageUrl" TEXT,
    "linkedStorageLabel" TEXT,
    "linkedStorageProvider" TEXT,
    "linkedStorageAddedById" TEXT,
    "linkedStorageAddedAt" TIMESTAMP(3),
    "linkedStorageVerifiedAt" TIMESTAMP(3),
    "linkedStorageLastCheckOk" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantStorageProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageUsageSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "usedBytes" BIGINT NOT NULL,
    "limitBytes" BIGINT NOT NULL,
    "percentUsed" INTEGER NOT NULL,
    "healthStatus" TEXT NOT NULL,
    "actionRequired" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorageUsageSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoredFile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "provider" TEXT NOT NULL DEFAULT 'LOCAL_OR_R2',
    "providerObjectId" TEXT,
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "encryptionMode" TEXT,
    "checksumSha256" TEXT,
    "wrappedKeyRef" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lifecycleTier" TEXT NOT NULL DEFAULT 'PERMANENT',
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "StoredFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageOptimizerRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "triggeredBy" TEXT NOT NULL,
    "triggeredByName" TEXT NOT NULL DEFAULT 'Storage Intelligence Engine',
    "duplicateFilesFound" INTEGER NOT NULL DEFAULT 0,
    "duplicateBytesFound" BIGINT NOT NULL DEFAULT 0,
    "temporaryFilesDeleted" INTEGER NOT NULL DEFAULT 0,
    "temporaryBytesFreed" BIGINT NOT NULL DEFAULT 0,
    "unusedFilesFlagged" INTEGER NOT NULL DEFAULT 0,
    "totalBytesFreed" BIGINT NOT NULL DEFAULT 0,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorageOptimizerRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'DIRECT',
    "title" TEXT,
    "classId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "requiresAck" BOOLEAN NOT NULL DEFAULT false,
    "urgentFallbackAt" TIMESTAMP(3),
    "fallbackSmsSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAcknowledgement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAcknowledgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageDeliveryReport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "readCount" INTEGER NOT NULL,
    "ackCount" INTEGER NOT NULL,
    "unreadCount" INTEGER NOT NULL,
    "smsFallbackSentCount" INTEGER NOT NULL DEFAULT 0,
    "unreadJson" TEXT,
    "summary" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "MessageDeliveryReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntercomCall" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "callerId" TEXT NOT NULL,
    "callerName" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RINGING',
    "acceptedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntercomCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebPushSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebPushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "channels" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optOut" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentCredential" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mpesa_daraja',
    "shortcode" TEXT,
    "environment" TEXT NOT NULL DEFAULT 'sandbox',
    "consumerKeyEnc" TEXT,
    "consumerSecretEnc" TEXT,
    "passkeyEnc" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mpesa_daraja',
    "amount" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "accountRef" TEXT,
    "invoiceId" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "checkoutRequestId" TEXT,
    "mpesaRef" TEXT,
    "resultCode" TEXT,
    "resultDesc" TEXT,
    "rawCallback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planKey" TEXT NOT NULL DEFAULT 'free_karibu',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "grandfatheredPrice" INTEGER NOT NULL DEFAULT 0,
    "addOns" TEXT,
    "pricingMode" TEXT NOT NULL DEFAULT 'SIZE_BASED_V2',
    "sizeBasedPriceKes" INTEGER NOT NULL DEFAULT 0,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "graceEndsAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantPricingSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentCount" INTEGER NOT NULL,
    "staffCount" INTEGER NOT NULL,
    "parentCount" INTEGER NOT NULL,
    "estimatedStorageGb" DOUBLE PRECISION NOT NULL,
    "estimatedAiOcrUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "alumniRecordCount" INTEGER NOT NULL DEFAULT 0,
    "alumniStorageGbAdded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "alumniFactorApplied" BOOLEAN NOT NULL DEFAULT false,
    "rawScore" DOUBLE PRECISION NOT NULL,
    "monthlyPriceKes" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "triggeredById" TEXT,
    "triggeredByName" TEXT,
    "note" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantPricingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolQuoteRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "schoolName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "declaredStudentCount" INTEGER,
    "declaredStaffCount" INTEGER,
    "declaredParentCount" INTEGER,
    "requestedEstimate" BOOLEAN NOT NULL DEFAULT false,
    "instantQuotedPriceKes" INTEGER,
    "formalQuoteRequested" BOOLEAN NOT NULL DEFAULT false,
    "finalQuotedPriceKes" INTEGER,
    "quotedById" TEXT,
    "quotedByName" TEXT,
    "quotedAt" TIMESTAMP(3),
    "quotePdfUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "onboardingAssistanceRequested" BOOLEAN NOT NULL DEFAULT false,
    "onboardingAssistanceNote" TEXT,
    "onboardingAssistanceDoneAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolQuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "referralDiscountKes" INTEGER NOT NULL DEFAULT 0,
    "campaignDiscountKes" INTEGER NOT NULL DEFAULT 0,
    "campaignId" TEXT,
    "influencerDiscountKes" INTEGER NOT NULL DEFAULT 0,
    "influencerCodeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL DEFAULT 'central_mpesa_stk',
    "phone" TEXT,
    "accountRef" TEXT,
    "checkoutRequestId" TEXT,
    "mpesaRef" TEXT,
    "resultCode" TEXT,
    "resultDesc" TEXT,
    "rawCallback" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageCounter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "periodKey" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerApprovalRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "payload" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnerApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "neyoLoginId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'RECEPTIONIST',
    "secondaryRole" TEXT,
    "passwordHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'en',
    "popupStyle" TEXT NOT NULL DEFAULT 'glass',
    "lgContrast" TEXT NOT NULL DEFAULT 'company',
    "shellVersion" TEXT,
    "canApplyDiscretionaryDecrease" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "bundleSaverEnabled" BOOLEAN NOT NULL DEFAULT true,
    "timetableShortCode" TEXT,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totpVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedGuardianAccount" (
    "id" TEXT NOT NULL,
    "primaryUserId" TEXT NOT NULL,
    "linkedUserId" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedGuardianAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthConnectedAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "OAuthConnectedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthState" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "redirectTo" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT,
    "deviceLabel" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiometricActionTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actionKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "BiometricActionTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebAuthnChallenge" (
    "id" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebAuthnChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TotpChallenge" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TotpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT,
    "purpose" TEXT NOT NULL DEFAULT 'LOGIN',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicLink" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT,
    "consumedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "deviceId" TEXT,
    "impersonatedUserId" TEXT,
    "viewAsReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantModule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "payload" TEXT,
    "result" TEXT,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdSequence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IdSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tier" TEXT NOT NULL DEFAULT 'SCHOOL',
    "environment" TEXT NOT NULL DEFAULT 'live',
    "sandboxTenantId" TEXT,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT NOT NULL,
    "signingSecret" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "lastDeliveryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 6,
    "responseStatus" INTEGER,
    "responseBody" TEXT,
    "error" TEXT,
    "nextAttemptAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsageLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "apiKeyId" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "requestBytes" INTEGER NOT NULL DEFAULT 0,
    "outcome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT NOT NULL,
    "endDate" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "type" TEXT NOT NULL DEFAULT 'event',
    "audienceRole" TEXT,
    "color" TEXT,
    "recurrence" TEXT,
    "recurUntil" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarFeedToken" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rotatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPolledAt" TIMESTAMP(3),

    CONSTRAINT "CalendarFeedToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "idNumber" TEXT,
    "purpose" TEXT NOT NULL,
    "host" TEXT,
    "studentId" TEXT,
    "badgeNo" TEXT NOT NULL,
    "signedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signedOutAt" TIMESTAMP(3),
    "createdById" TEXT,

    CONSTRAINT "VisitorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionInquiry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "studentName" TEXT,
    "gradeWanted" TEXT,
    "curriculum" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneMessage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "callerName" TEXT NOT NULL,
    "callerPhone" TEXT,
    "forUserId" TEXT NOT NULL,
    "forUserName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "conversationId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolClass" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "stream" TEXT,
    "curriculum" TEXT NOT NULL DEFAULT 'CBC',
    "curriculumId" TEXT,
    "gradeBandId" TEXT,
    "classTeacherId" TEXT,
    "capacity" INTEGER,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "legacyAdmissionNo" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dateOfBirth" TEXT,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "graduationYear" INTEGER,
    "finalClassLabel" TEXT,
    "isRepeating" BOOLEAN NOT NULL DEFAULT false,
    "repeatingSinceYear" INTEGER,
    "upiNumber" TEXT,
    "birthCertNo" TEXT,
    "classId" TEXT,
    "boardingType" TEXT NOT NULL DEFAULT 'BOARDER',
    "userId" TEXT,
    "admittedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "nationalId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGuardian" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL DEFAULT 'Parent',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudentGuardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "hardcopyLocation" TEXT NOT NULL DEFAULT 'Unspecified',
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentRequirement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "quantity" TEXT,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "fulfilled" BOOLEAN NOT NULL DEFAULT false,
    "fulfilledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "UniformSize" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UniformSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "contact" TEXT,
    "kraPin" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierContract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsOn" TEXT NOT NULL,
    "endsOn" TEXT NOT NULL,
    "valueKes" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "neededBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseQuote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "poNo" TEXT NOT NULL,
    "requestId" TEXT,
    "quoteId" TEXT,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalKes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "deliveredNote" TEXT,
    "deliveredValueKes" INTEGER,
    "supplierInvoiceNo" TEXT,
    "supplierInvoiceKes" INTEGER,
    "matchedAt" TIMESTAMP(3),
    "matchOk" BOOLEAN,
    "matchNote" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "costCenterId" TEXT,
    "costCenterName" TEXT,
    "payee" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "spentOn" TEXT NOT NULL,
    "note" TEXT,
    "receiptFileUrl" TEXT,
    "receiptFileName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermPulse" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "weekKey" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "weekEnd" TEXT NOT NULL,
    "activeStudents" INTEGER NOT NULL DEFAULT 0,
    "joinedThisWeek" INTEGER NOT NULL DEFAULT 0,
    "attendancePct" INTEGER NOT NULL DEFAULT 0,
    "attendancePrevPct" INTEGER NOT NULL DEFAULT 0,
    "attendanceMarked" INTEGER NOT NULL DEFAULT 0,
    "collectedWeekKes" INTEGER NOT NULL DEFAULT 0,
    "weeklyTargetKes" INTEGER NOT NULL DEFAULT 0,
    "collectionTermPct" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TermPulse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedView" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSubject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "isStrong" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSubjectNeed" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "lessonsPerWeek" INTEGER NOT NULL DEFAULT 5,
    "doubleCount" INTEGER NOT NULL DEFAULT 0,
    "allowSplitDouble" BOOLEAN NOT NULL DEFAULT false,
    "venueId" TEXT,
    "requiresMovement" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClassSubjectNeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT,
    "supportsSubjectIds" TEXT NOT NULL DEFAULT '[]',
    "capacityPerPeriod" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CombinationGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "lessonsPerWeek" INTEGER NOT NULL DEFAULT 4,
    "doubleCount" INTEGER NOT NULL DEFAULT 0,
    "scope" TEXT NOT NULL DEFAULT 'SELECTED',
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "venueId" TEXT,
    "requiresMovement" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CombinationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CombinationGroupClass" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "CombinationGroupClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectiveBlock" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'MULTI_SLOT',
    "preferAfterBreak" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectiveBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectiveBlockClass" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "ElectiveBlockClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectiveBlockSlot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isDouble" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ElectiveBlockSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectiveBlockSlotSubject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "venueId" TEXT,
    "resolvedVenueId" TEXT,
    "comboClassIdsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectiveBlockSlotSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectiveBlockAutoBuildRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'ELECTIVES',
    "previewJson" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PREVIEWED',
    "createdElectiveBlockId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "ElectiveBlockAutoBuildRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassCapacityOverflowRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT,
    "overflowCount" INTEGER NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'PENDING',
    "newClassId" TEXT,
    "autoAssignedTeacherCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "ClassCapacityOverflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableConstraint" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "isHard" BOOLEAN NOT NULL DEFAULT false,
    "configJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherTimeOff" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "TeacherTimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableGenerationJob" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "phase" TEXT NOT NULL DEFAULT 'Queued',
    "slotsPlaced" INTEGER NOT NULL DEFAULT 0,
    "unplacedJson" TEXT NOT NULL DEFAULT '[]',
    "warningsJson" TEXT NOT NULL DEFAULT '[]',
    "error" TEXT,
    "startedById" TEXT NOT NULL,
    "startedByName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "TimetableGenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningVideo" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "channelTitle" TEXT,
    "thumbnailUrl" TEXT,
    "savedById" TEXT NOT NULL,
    "savedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningVideoSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "classId" TEXT,
    "classLabel" TEXT,
    "castCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedById" TEXT NOT NULL,
    "startedByName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "LearningVideoSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlineClassSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "roomId" TEXT NOT NULL,
    "joinUrl" TEXT NOT NULL,
    "tvAccessCode" TEXT NOT NULL,
    "muteAllStudents" BOOLEAN NOT NULL DEFAULT false,
    "studentVideoDisabled" BOOLEAN NOT NULL DEFAULT false,
    "screenSharePeerId" TEXT,
    "recordingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnlineClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlineClassParticipant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "peerId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnlineClassParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlineClassSignal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "fromPeerId" TEXT NOT NULL,
    "toPeerId" TEXT,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnlineClassSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlineClassQuestion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "peerId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnlineClassQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "periodsPerDay" INTEGER NOT NULL DEFAULT 8,
    "freePeriodsPerWeek" INTEGER NOT NULL DEFAULT 4,
    "coCurricularCount" INTEGER NOT NULL DEFAULT 2,
    "coCurricularName" TEXT NOT NULL DEFAULT 'Games',
    "schoolDayStartTime" TEXT NOT NULL DEFAULT '08:00',
    "saturdayStartTime" TEXT NOT NULL DEFAULT '08:00',
    "saturdayEndTime" TEXT NOT NULL DEFAULT '12:40',
    "lessonDurationMins" INTEGER NOT NULL DEFAULT 40,
    "shortBreakStart" INTEGER NOT NULL DEFAULT 2,
    "shortBreakMins" INTEGER NOT NULL DEFAULT 15,
    "shortBreak2Start" INTEGER,
    "shortBreak2Mins" INTEGER,
    "gamesPeriodTarget" TEXT,
    "saturdayEarlyHome" BOOLEAN NOT NULL DEFAULT true,
    "longBreakStart" INTEGER NOT NULL DEFAULT 4,
    "longBreakMins" INTEGER NOT NULL DEFAULT 30,
    "lunchStart" INTEGER NOT NULL DEFAULT 6,
    "lunchMins" INTEGER NOT NULL DEFAULT 60,
    "hasRemedials" BOOLEAN NOT NULL DEFAULT false,
    "hasPreps" BOOLEAN NOT NULL DEFAULT false,
    "lunchShift" INTEGER NOT NULL DEFAULT 1,
    "lunchAfterPeriod" INTEGER,
    "hasSaturday" BOOLEAN NOT NULL DEFAULT true,
    "saturdayPeriodsCount" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "TimetableConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassVoiceRoom" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "roomKey" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'DISAPPEARING',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassVoiceRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassVoiceParticipant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "peerId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "ClassVoiceParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassVoiceSignal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "fromPeerId" TEXT NOT NULL,
    "toPeerId" TEXT,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassVoiceSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusTopic" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "termId" TEXT,
    "topic" TEXT NOT NULL,
    "scopeRef" TEXT,
    "deadline" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "coveredAt" TIMESTAMP(3),
    "teacherId" TEXT,
    "teacherName" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamTimetableGeneratorRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "classIdsJson" TEXT NOT NULL DEFAULT '[]',
    "periodJson" TEXT NOT NULL DEFAULT '[]',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "paperMode" TEXT NOT NULL DEFAULT 'ALL_SUBJECTS_SELECTED_CLASSES',
    "distributionMode" TEXT NOT NULL DEFAULT 'ONE_PAPER_PER_CLASS_PER_PERIOD',
    "generatedCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamTimetableGeneratorRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamTimetableSlot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "paperConfigId" TEXT,
    "examName" TEXT NOT NULL,
    "paperName" TEXT,
    "examDate" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "venue" TEXT,
    "targetScope" TEXT NOT NULL DEFAULT 'CLASS',
    "targetJson" TEXT DEFAULT '[]',
    "invigilatorScope" TEXT NOT NULL DEFAULT 'AUTO',
    "eligibleInvigilatorJson" TEXT DEFAULT '[]',
    "invigilatorJson" TEXT DEFAULT '[]',
    "warningJson" TEXT DEFAULT '[]',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamTimetableSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamMaterialRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "examDate" TEXT,
    "deadline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "checklistJson" TEXT,
    "hardcopyLocation" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamMaterialRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromiseToPay" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "promiseDate" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "planGroupId" TEXT,
    "installmentNo" INTEGER,
    "reminderSentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromiseToPay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCardDayCheckIn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "queueNo" INTEGER NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "printedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'WAITING',

    CONSTRAINT "ReportCardDayCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSiteSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "heroHeadline" TEXT NOT NULL DEFAULT 'Nurturing Excellence & Character',
    "heroSubheading" TEXT,
    "heroImageUrl" TEXT,
    "history" TEXT,
    "whyChooseUs" TEXT,
    "mapEmbedUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "primaryCtaLabel" TEXT NOT NULL DEFAULT 'Begin Application',
    "secondaryCtaLabel" TEXT NOT NULL DEFAULT 'Parent Portal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSiteLeader" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT,
    "photoUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSiteLeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSiteTestimonial" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "relationship" TEXT,
    "studentName" TEXT,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSiteTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSiteGalleryImage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'School life',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSiteGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSiteActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSiteActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsPost" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "imageFileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoIntegrationSecret" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "masked" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoIntegrationSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoCustomerThread" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "schoolName" TEXT NOT NULL,
    "contactUserId" TEXT,
    "contactName" TEXT NOT NULL,
    "contactRole" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "source" TEXT NOT NULL DEFAULT 'SCHOOL_OS',
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoCustomerThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoCustomerMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "body" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NeyoCustomerMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoContract" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "tenantId" TEXT,
    "contactName" TEXT NOT NULL,
    "contactRole" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "templateKey" TEXT NOT NULL DEFAULT 'SCHOOL_ONBOARDING',
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publicToken" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedByName" TEXT,
    "signedByRole" TEXT,
    "signatureText" TEXT,
    "signerIp" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoYoutubePost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeUrlOrId" TEXT,
    "youtubeId" TEXT,
    "caption" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'SCHOOLS',
    "channel" TEXT NOT NULL DEFAULT 'NEYO_YOUTUBE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" TIMESTAMP(3),
    "postedUrl" TEXT,
    "ownerName" TEXT,
    "schoolTenantId" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoYoutubePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoIdea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IDEA',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "ownerName" TEXT,
    "linkedFeatureKey" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoBuildLog" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shippedSummary" TEXT NOT NULL,
    "details" TEXT,
    "screenshotRefs" TEXT,
    "commitRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoBuildLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoMetricSnapshot" (
    "id" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "periodStart" TEXT NOT NULL,
    "periodEnd" TEXT NOT NULL,
    "revenueKes" INTEGER NOT NULL DEFAULT 0,
    "mrrKes" INTEGER NOT NULL DEFAULT 0,
    "payingSchools" INTEGER NOT NULL DEFAULT 0,
    "trialSchools" INTEGER NOT NULL DEFAULT 0,
    "activeSchools" INTEGER NOT NULL DEFAULT 0,
    "churnRiskSchools" INTEGER NOT NULL DEFAULT 0,
    "smsSpendKes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoFounderOpsEntry" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "periodKey" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "scheduledFor" TEXT,
    "completedAt" TIMESTAMP(3),
    "summary" TEXT,
    "notes" TEXT,
    "decisionsJson" TEXT,
    "actionItemsJson" TEXT,
    "metricsJson" TEXT,
    "audience" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoFounderOpsEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoCustomerInterview" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactRole" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "county" TEXT,
    "interviewDate" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'CALL',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "painPointsJson" TEXT,
    "quotesJson" TEXT,
    "opportunitiesJson" TEXT,
    "followUp" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoCustomerInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeavingCertificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "certificateType" TEXT NOT NULL,
    "certificateNo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STORED',
    "fileUrl" TEXT,
    "fileName" TEXT,
    "hardcopyLocation" TEXT NOT NULL DEFAULT 'Unspecified',
    "handedOverTo" TEXT,
    "handedOverAt" TIMESTAMP(3),
    "handedOverById" TEXT,
    "handedOverByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeavingCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntranceExamPaper" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT,
    "classLevel" TEXT NOT NULL,
    "classLabel" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Entrance interview paper',
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "hardcopyLocation" TEXT NOT NULL DEFAULT 'Admissions office file',
    "uploadedById" TEXT,
    "uploadedBy" TEXT,
    "printCount" INTEGER NOT NULL DEFAULT 0,
    "lastPrintedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntranceExamPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rubric" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricLevel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rubricId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "descriptor" TEXT,
    "points" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillsPassportEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "skillArea" TEXT NOT NULL,
    "ratingLevel" INTEGER NOT NULL,
    "evidenceSource" TEXT NOT NULL,
    "sourceId" TEXT,
    "narrative" TEXT,
    "evidenceDate" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "recordedByName" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillsPassportEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "storedFileId" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSizeBytes" INTEGER,
    "externalLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "visibleToParents" BOOLEAN NOT NULL DEFAULT false,
    "competencyId" TEXT,
    "subjectId" TEXT,
    "clubId" TEXT,
    "awardId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerJourneyPin" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sourceModule" TEXT NOT NULL,
    "sourceRecordId" TEXT,
    "entryId" TEXT NOT NULL,
    "note" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'STAFF',
    "pinnedById" TEXT NOT NULL,
    "pinnedByName" TEXT NOT NULL,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerJourneyPin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pathway" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pathwayGroup" TEXT,
    "trackName" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Pathway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PathwaySubjectRequirement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pathwayId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "isCore" BOOLEAN NOT NULL DEFAULT true,
    "minScorePct" INTEGER,

    CONSTRAINT "PathwaySubjectRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentPathwayPreference" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "pathwayId" TEXT NOT NULL,
    "choiceOrder" INTEGER NOT NULL DEFAULT 1,
    "teacherNotes" TEXT,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "isAllocated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPathwayPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentNationalAssessment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "milestone" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "indexNo" TEXT,
    "overallScorePct" INTEGER,
    "overallGrade" TEXT,
    "subjectsJson" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "recordedById" TEXT NOT NULL,
    "recordedByName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentNationalAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentArea" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "talentAreaId" TEXT NOT NULL,
    "termId" TEXT,
    "coachId" TEXT NOT NULL,
    "score" INTEGER,
    "notes" TEXT,
    "dateRecorded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portfolioItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonResource" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lessonPlanId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonObservation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lessonPlanId" TEXT NOT NULL,
    "studentId" TEXT,
    "strandId" TEXT,
    "competencyId" TEXT,
    "level" INTEGER,
    "note" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGoal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "termId" TEXT,
    "teacherId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TEXT,
    "acknowledgedByParent" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferPassportRequest" (
    "id" TEXT NOT NULL,
    "sourceTenantId" TEXT NOT NULL,
    "destinationTenantId" TEXT,
    "destinationEmail" TEXT,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "includedModules" TEXT NOT NULL,
    "consentBy" TEXT NOT NULL,
    "consentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payloadJson" TEXT,
    "importedAt" TIMESTAMP(3),
    "receivedById" TEXT,
    "receivedByName" TEXT,
    "lastAccessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferPassportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT 'v1',
    "effectiveFrom" TEXT,
    "effectiveTo" TEXT,
    "curriculumVersion" TEXT,
    "sectionsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityServiceActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "location" TEXT,
    "supervisorName" TEXT,
    "supervisorPhone" TEXT,
    "studentReflection" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "proofFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityServiceActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerDiscoveryRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "careerArea" TEXT,
    "notes" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "recordedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerDiscoveryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalCurriculumTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Kenya',
    "context" TEXT,
    "version" TEXT NOT NULL DEFAULT 'v1',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "learningAreasJson" TEXT NOT NULL DEFAULT '[]',
    "publishedAt" TIMESTAMP(3),
    "changeNote" TEXT,
    "announcedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalCurriculumTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarksPortal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "termId" TEXT,
    "name" TEXT NOT NULL,
    "openDate" TIMESTAMP(3) NOT NULL,
    "closeDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "computationStartedAt" TIMESTAMP(3),
    "computationEndedAt" TIMESTAMP(3),
    "computationProgress" INTEGER NOT NULL DEFAULT 0,
    "computationTotalRows" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarksPortal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermAggregationRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT,
    "subjectId" TEXT,
    "isTraditional" BOOLEAN NOT NULL DEFAULT false,
    "weightingsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermAggregationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterReportCard" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT,
    "finalMark" DOUBLE PRECISION NOT NULL,
    "cbcLevel" INTEGER,
    "letterGrade" TEXT,
    "rank" INTEGER,
    "outOf" INTEGER,
    "isTraditional" BOOLEAN NOT NULL DEFAULT false,
    "componentsJson" TEXT NOT NULL DEFAULT '[]',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterReportCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectPaperConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT,
    "name" TEXT NOT NULL,
    "outOfMarks" INTEGER NOT NULL DEFAULT 100,
    "weightPct" INTEGER NOT NULL,

    CONSTRAINT "SubjectPaperConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaperResult" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "examResultId" TEXT NOT NULL,
    "paperConfigId" TEXT NOT NULL,
    "marksScored" DOUBLE PRECISION,

    CONSTRAINT "PaperResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentApprovalRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedByRole" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "documentLabel" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedByName" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentDutyArea" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "genderConstraint" TEXT NOT NULL DEFAULT 'MIXED',
    "targetClassIds" TEXT NOT NULL DEFAULT '[]',
    "maxStudents" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StudentDutyArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentDutyAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "dutyAreaId" TEXT NOT NULL,
    "termId" TEXT,
    "assignedById" TEXT NOT NULL,
    "assignedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentDutyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectSelectionPortal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetLevel" TEXT NOT NULL,
    "openDate" TIMESTAMP(3) NOT NULL,
    "closeDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "rulesJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectSelectionPortal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSubjectSelection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "selectedSubjectIds" TEXT NOT NULL DEFAULT '[]',
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSubjectSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'REPEAT',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsMarginLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL,
    "costPerSmsKes" DOUBLE PRECISION NOT NULL,
    "pricePerSmsKes" DOUBLE PRECISION NOT NULL,
    "marginKes" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNBILLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsMarginLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralCredit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "counterpartTenantId" TEXT NOT NULL,
    "counterpartName" TEXT NOT NULL,
    "discountPct" DOUBLE PRECISION NOT NULL,
    "triggerPaymentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "appliedToPaymentId" TEXT,
    "appliedAmountKes" INTEGER,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "appliesTo" TEXT NOT NULL,
    "percentOff" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "personPhone" TEXT,
    "personEmail" TEXT,
    "discountPct" DOUBLE PRECISION NOT NULL,
    "commissionKes" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerCommission" (
    "id" TEXT NOT NULL,
    "influencerCodeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OWED',
    "paidAt" TIMESTAMP(3),
    "paidNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfluencerCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyPaymentSplitPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "totalAmountKes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "FamilyPaymentSplitPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyPaymentSplitItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,

    CONSTRAINT "FamilyPaymentSplitItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnecExportBatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "targetClassId" TEXT,
    "documentLabels" TEXT NOT NULL,
    "exportUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnecExportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundiImportUnlockCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tenantId" TEXT,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "note" TEXT,
    "issuedById" TEXT NOT NULL,
    "issuedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BundiImportUnlockCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundiFieldTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "domain" TEXT NOT NULL DEFAULT 'STUDENT',
    "fieldsJson" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BundiFieldTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundiImportSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "unlockCodeId" TEXT,
    "pipeline" TEXT NOT NULL DEFAULT 'BUNDI_INTELLIGENT',
    "domain" TEXT NOT NULL DEFAULT 'STUDENT',
    "contextNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL DEFAULT 1,
    "ocrConfidenceAvgPct" INTEGER,
    "fieldsTotal" INTEGER NOT NULL DEFAULT 0,
    "fieldsAiEscalated" INTEGER NOT NULL DEFAULT 0,
    "aiInvoked" BOOLEAN NOT NULL DEFAULT false,
    "templateMatchId" TEXT,
    "provider" TEXT,
    "model" TEXT,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costKes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extractedRowsJson" TEXT,
    "reviewedRowsJson" TEXT,
    "errorMessage" TEXT,
    "studentImportId" TEXT,
    "staffImportId" TEXT,
    "libraryImportId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BundiImportSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundiLearnedCorrection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "wrongText" TEXT NOT NULL,
    "correctText" TEXT NOT NULL,
    "timesSeen" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BundiLearnedCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundiDocumentTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "layoutSignature" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldsJson" TEXT NOT NULL,
    "timesUsed" INTEGER NOT NULL DEFAULT 1,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BundiDocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffImport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fileName" TEXT,
    "source" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "createdRows" INTEGER NOT NULL,
    "failedRows" INTEGER NOT NULL,
    "errorRows" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryImport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fileName" TEXT,
    "source" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "createdRows" INTEGER NOT NULL,
    "updatedRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL,
    "errorRows" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAllocationImport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fileName" TEXT,
    "source" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "createdNeeds" INTEGER NOT NULL,
    "matchedNeeds" INTEGER NOT NULL,
    "createdTeachers" INTEGER NOT NULL,
    "failedRows" INTEGER NOT NULL,
    "errorRows" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherAllocationImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amountKes" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "eventDate" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolActivityClass" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "SchoolActivityClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityParticipant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_PAID',
    "invoiceId" TEXT,
    "waivedReason" TEXT,
    "waivedById" TEXT,
    "waivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KuccpsCluster" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subjectRulesJson" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KuccpsCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KuccpsCourse" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minGradesJson" TEXT NOT NULL,
    "minMeanGrade" TEXT NOT NULL,
    "typicalCutoff" DOUBLE PRECISION,
    "careerAreas" TEXT NOT NULL DEFAULT '[]',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KuccpsCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PathwayGuideSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "studentId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "fullName" TEXT,
    "phone" TEXT,
    "interestsJson" TEXT NOT NULL DEFAULT '[]',
    "skillsJson" TEXT NOT NULL DEFAULT '[]',
    "valuesJson" TEXT NOT NULL DEFAULT '[]',
    "aspirationsJson" TEXT NOT NULL DEFAULT '[]',
    "recommendedGroup" TEXT,
    "recommendedTrack" TEXT,
    "recommendedSubjectsJson" TEXT NOT NULL DEFAULT '[]',
    "careerAreasJson" TEXT NOT NULL DEFAULT '[]',
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3),
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PathwayGuideSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PathwayGuidePayment" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "checkoutRequestId" TEXT,
    "mpesaRef" TEXT,
    "resultDesc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PathwayGuidePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoTeamMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "extraPermissionsJson" TEXT NOT NULL DEFAULT '[]',
    "note" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "invitedById" TEXT NOT NULL,
    "invitedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderAiQuery" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
    "contextJson" TEXT NOT NULL,
    "answer" TEXT,
    "provider" TEXT,
    "model" TEXT,
    "promptTokens" INTEGER,
    "outputTokens" INTEGER,
    "costUsd" DOUBLE PRECISION,
    "costKes" INTEGER,
    "errorMessage" TEXT,
    "askedById" TEXT NOT NULL,
    "askedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FounderAiQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "requestedByRole" TEXT NOT NULL,
    "resolvedById" TEXT,
    "resolvedByName" TEXT,
    "resolutionNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeyoCostSnapshot" (
    "id" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "periodStart" TEXT NOT NULL,
    "periodEnd" TEXT NOT NULL,
    "infraCostKes" INTEGER NOT NULL DEFAULT 0,
    "marketingSpendKes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeyoCostSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotentRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "responseJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_idPrefix_key" ON "Tenant"("idPrefix");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_referralCode_key" ON "Tenant"("referralCode");

-- CreateIndex
CREATE INDEX "Tenant_osKey_idx" ON "Tenant"("osKey");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_userId_key" ON "StaffProfile"("userId");

-- CreateIndex
CREATE INDEX "StaffProfile_tenantId_idx" ON "StaffProfile"("tenantId");

-- CreateIndex
CREATE INDEX "LeaveRequest_tenantId_userId_idx" ON "LeaveRequest"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "LeaveRequest_tenantId_status_idx" ON "LeaveRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "SubstituteAssignment_tenantId_leaveRequestId_idx" ON "SubstituteAssignment"("tenantId", "leaveRequestId");

-- CreateIndex
CREATE INDEX "SubstituteAssignment_tenantId_timetableSlotId_idx" ON "SubstituteAssignment"("tenantId", "timetableSlotId");

-- CreateIndex
CREATE INDEX "SubstituteAssignment_tenantId_status_idx" ON "SubstituteAssignment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "SubstituteAssignment_tenantId_substituteTeacherId_idx" ON "SubstituteAssignment"("tenantId", "substituteTeacherId");

-- CreateIndex
CREATE INDEX "JobPosting_tenantId_idx" ON "JobPosting"("tenantId");

-- CreateIndex
CREATE INDEX "Appraisal_tenantId_userId_idx" ON "Appraisal"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "DisciplinaryRecord_tenantId_userId_idx" ON "DisciplinaryRecord"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "TrainingRecord_tenantId_userId_idx" ON "TrainingRecord"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffSalary_userId_key" ON "StaffSalary"("userId");

-- CreateIndex
CREATE INDEX "StaffSalary_tenantId_idx" ON "StaffSalary"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_tenantId_period_key" ON "PayrollRun"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_runId_userId_key" ON "Payslip"("runId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_tenantId_level_year_term_classId_key" ON "FeeStructure"("tenantId", "level", "year", "term", "classId");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_studentId_idx" ON "Invoice"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_status_dueDate_idx" ON "Invoice"("tenantId", "status", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_tenantId_invoiceNo_key" ON "Invoice"("tenantId", "invoiceNo");

-- CreateIndex
CREATE INDEX "TeacherCashPaymentRequest_tenantId_status_idx" ON "TeacherCashPaymentRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "TeacherCashPaymentRequest_tenantId_invoiceId_idx" ON "TeacherCashPaymentRequest"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "CbcStrand_tenantId_subjectId_idx" ON "CbcStrand"("tenantId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "CbcStrand_tenantId_subjectId_name_key" ON "CbcStrand"("tenantId", "subjectId", "name");

-- CreateIndex
CREATE INDEX "CbcAssessment_tenantId_studentId_idx" ON "CbcAssessment"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "CbcAssessment_tenantId_strandId_date_idx" ON "CbcAssessment"("tenantId", "strandId", "date");

-- CreateIndex
CREATE INDEX "Exam_tenantId_year_term_idx" ON "Exam"("tenantId", "year", "term");

-- CreateIndex
CREATE INDEX "ExamReleaseApprovalRequest_tenantId_status_requestedAt_idx" ON "ExamReleaseApprovalRequest"("tenantId", "status", "requestedAt");

-- CreateIndex
CREATE INDEX "ExamReleaseApprovalRequest_tenantId_examId_idx" ON "ExamReleaseApprovalRequest"("tenantId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubject_examId_subjectId_key" ON "ExamSubject"("examId", "subjectId");

-- CreateIndex
CREATE INDEX "ExamResult_tenantId_examId_studentId_idx" ON "ExamResult"("tenantId", "examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamResult_examId_studentId_subjectId_key" ON "ExamResult"("examId", "studentId", "subjectId");

-- CreateIndex
CREATE INDEX "AssessmentType_tenantId_active_idx" ON "AssessmentType"("tenantId", "active");

-- CreateIndex
CREATE INDEX "AssessmentType_tenantId_category_idx" ON "AssessmentType"("tenantId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentType_tenantId_key_key" ON "AssessmentType"("tenantId", "key");

-- CreateIndex
CREATE INDEX "AssessmentPlan_tenantId_year_term_idx" ON "AssessmentPlan"("tenantId", "year", "term");

-- CreateIndex
CREATE INDEX "AssessmentPlan_tenantId_assessmentTypeId_idx" ON "AssessmentPlan"("tenantId", "assessmentTypeId");

-- CreateIndex
CREATE INDEX "AssessmentPlan_tenantId_classId_idx" ON "AssessmentPlan"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "AssessmentPlan_tenantId_subjectId_idx" ON "AssessmentPlan"("tenantId", "subjectId");

-- CreateIndex
CREATE INDEX "AssessmentPlan_tenantId_learningAreaId_idx" ON "AssessmentPlan"("tenantId", "learningAreaId");

-- CreateIndex
CREATE INDEX "AssessmentPlan_tenantId_status_idx" ON "AssessmentPlan"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AssessmentRecord_tenantId_studentId_idx" ON "AssessmentRecord"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "AssessmentRecord_tenantId_planId_idx" ON "AssessmentRecord"("tenantId", "planId");

-- CreateIndex
CREATE INDEX "AssessmentRecord_tenantId_status_idx" ON "AssessmentRecord"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AssessmentRecord_tenantId_sourceModule_sourceId_idx" ON "AssessmentRecord"("tenantId", "sourceModule", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentRecord_tenantId_planId_studentId_key" ON "AssessmentRecord"("tenantId", "planId", "studentId");

-- CreateIndex
CREATE INDEX "AssessmentEvidence_tenantId_recordId_idx" ON "AssessmentEvidence"("tenantId", "recordId");

-- CreateIndex
CREATE INDEX "AssessmentEvidence_tenantId_storedFileId_idx" ON "AssessmentEvidence"("tenantId", "storedFileId");

-- CreateIndex
CREATE INDEX "CompetencyGroup_tenantId_curriculumId_idx" ON "CompetencyGroup"("tenantId", "curriculumId");

-- CreateIndex
CREATE INDEX "CompetencyGroup_tenantId_active_idx" ON "CompetencyGroup"("tenantId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyGroup_tenantId_code_key" ON "CompetencyGroup"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Competency_tenantId_groupId_idx" ON "Competency"("tenantId", "groupId");

-- CreateIndex
CREATE INDEX "Competency_tenantId_curriculumId_idx" ON "Competency"("tenantId", "curriculumId");

-- CreateIndex
CREATE INDEX "Competency_tenantId_learningAreaId_idx" ON "Competency"("tenantId", "learningAreaId");

-- CreateIndex
CREATE INDEX "Competency_tenantId_active_idx" ON "Competency"("tenantId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_tenantId_code_key" ON "Competency"("tenantId", "code");

-- CreateIndex
CREATE INDEX "CompetencyEvidence_tenantId_competencyId_idx" ON "CompetencyEvidence"("tenantId", "competencyId");

-- CreateIndex
CREATE INDEX "CompetencyEvidence_tenantId_studentId_idx" ON "CompetencyEvidence"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "CompetencyEvidence_tenantId_sourceModule_sourceId_idx" ON "CompetencyEvidence"("tenantId", "sourceModule", "sourceId");

-- CreateIndex
CREATE INDEX "CompetencyEvidence_tenantId_assessmentRecordId_idx" ON "CompetencyEvidence"("tenantId", "assessmentRecordId");

-- CreateIndex
CREATE INDEX "CompetencyEvidence_tenantId_cbcAssessmentId_idx" ON "CompetencyEvidence"("tenantId", "cbcAssessmentId");

-- CreateIndex
CREATE INDEX "CompetencyEvidence_tenantId_visibleToParents_idx" ON "CompetencyEvidence"("tenantId", "visibleToParents");

-- CreateIndex
CREATE INDEX "Curriculum_tenantId_isActive_idx" ON "Curriculum"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Curriculum_tenantId_name_activeVersion_key" ON "Curriculum"("tenantId", "name", "activeVersion");

-- CreateIndex
CREATE INDEX "EducationLevel_tenantId_curriculumId_sequence_idx" ON "EducationLevel"("tenantId", "curriculumId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "EducationLevel_tenantId_curriculumId_name_key" ON "EducationLevel"("tenantId", "curriculumId", "name");

-- CreateIndex
CREATE INDEX "GradeBand_tenantId_curriculumId_sequence_idx" ON "GradeBand"("tenantId", "curriculumId", "sequence");

-- CreateIndex
CREATE INDEX "GradeBand_tenantId_educationLevelId_idx" ON "GradeBand"("tenantId", "educationLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "GradeBand_tenantId_curriculumId_name_key" ON "GradeBand"("tenantId", "curriculumId", "name");

-- CreateIndex
CREATE INDEX "LearningArea_tenantId_curriculumId_name_idx" ON "LearningArea"("tenantId", "curriculumId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "LearningArea_tenantId_curriculumId_code_key" ON "LearningArea"("tenantId", "curriculumId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityCategory_tenantId_name_key" ON "ActivityCategory"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_tenantId_name_key" ON "Department"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Subject_tenantId_idx" ON "Subject"("tenantId");

-- CreateIndex
CREATE INDEX "Subject_tenantId_curriculumId_idx" ON "Subject"("tenantId", "curriculumId");

-- CreateIndex
CREATE INDEX "Subject_tenantId_learningAreaId_idx" ON "Subject"("tenantId", "learningAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_tenantId_code_key" ON "Subject"("tenantId", "code");

-- CreateIndex
CREATE INDEX "AcademicTerm_tenantId_curriculumId_idx" ON "AcademicTerm"("tenantId", "curriculumId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicTerm_tenantId_year_term_key" ON "AcademicTerm"("tenantId", "year", "term");

-- CreateIndex
CREATE INDEX "DutyRosterEntry_tenantId_termLabel_idx" ON "DutyRosterEntry"("tenantId", "termLabel");

-- CreateIndex
CREATE INDEX "DutyRosterEntry_tenantId_primaryTeacherId_idx" ON "DutyRosterEntry"("tenantId", "primaryTeacherId");

-- CreateIndex
CREATE UNIQUE INDEX "DutyRosterEntry_tenantId_termLabel_weekNo_key" ON "DutyRosterEntry"("tenantId", "termLabel", "weekNo");

-- CreateIndex
CREATE INDEX "TimetableSlot_tenantId_teacherId_dayOfWeek_period_idx" ON "TimetableSlot"("tenantId", "teacherId", "dayOfWeek", "period");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableSlot_tenantId_classId_dayOfWeek_period_slotType_key" ON "TimetableSlot"("tenantId", "classId", "dayOfWeek", "period", "slotType");

-- CreateIndex
CREATE INDEX "LessonPlan_tenantId_teacherId_date_idx" ON "LessonPlan"("tenantId", "teacherId", "date");

-- CreateIndex
CREATE INDEX "LessonPlan_tenantId_classId_date_idx" ON "LessonPlan"("tenantId", "classId", "date");

-- CreateIndex
CREATE INDEX "Homework_tenantId_classId_dueDate_idx" ON "Homework"("tenantId", "classId", "dueDate");

-- CreateIndex
CREATE INDEX "Homework_tenantId_teacherId_idx" ON "Homework"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "ClassNote_tenantId_classId_idx" ON "ClassNote"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "ClassNote_tenantId_teacherId_idx" ON "ClassNote"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_homeworkId_idx" ON "HomeworkSubmission"("tenantId", "homeworkId");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_studentId_idx" ON "HomeworkSubmission"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmission_homeworkId_studentId_key" ON "HomeworkSubmission"("homeworkId", "studentId");

-- CreateIndex
CREATE INDEX "Quiz_tenantId_classId_idx" ON "Quiz"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "Quiz_tenantId_teacherId_idx" ON "Quiz"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "QuizQuestion_tenantId_quizId_idx" ON "QuizQuestion"("tenantId", "quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_tenantId_studentId_idx" ON "QuizAttempt"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttempt_quizId_studentId_key" ON "QuizAttempt"("quizId", "studentId");

-- CreateIndex
CREATE INDEX "ForumThread_tenantId_classId_idx" ON "ForumThread"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "ForumPost_tenantId_threadId_idx" ON "ForumPost"("tenantId", "threadId");

-- CreateIndex
CREATE INDEX "BulkMessage_tenantId_createdAt_idx" ON "BulkMessage"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherCommsApprovalRequest_tenantId_status_createdAt_idx" ON "TeacherCommsApprovalRequest"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherCommsApprovalRequest_tenantId_requestedById_idx" ON "TeacherCommsApprovalRequest"("tenantId", "requestedById");

-- CreateIndex
CREATE INDEX "LibraryBook_tenantId_archived_idx" ON "LibraryBook"("tenantId", "archived");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryBook_tenantId_isbn_key" ON "LibraryBook"("tenantId", "isbn");

-- CreateIndex
CREATE INDEX "LibraryBookCopy_tenantId_bookId_status_idx" ON "LibraryBookCopy"("tenantId", "bookId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryBookCopy_tenantId_bookId_copyNo_key" ON "LibraryBookCopy"("tenantId", "bookId", "copyNo");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryBookCopy_tenantId_code_key" ON "LibraryBookCopy"("tenantId", "code");

-- CreateIndex
CREATE INDEX "BookIssue_tenantId_bookId_idx" ON "BookIssue"("tenantId", "bookId");

-- CreateIndex
CREATE INDEX "BookIssue_tenantId_studentId_idx" ON "BookIssue"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "BookIssue_tenantId_returnedAt_idx" ON "BookIssue"("tenantId", "returnedAt");

-- CreateIndex
CREATE INDEX "Hostel_tenantId_idx" ON "Hostel"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Hostel_tenantId_name_key" ON "Hostel"("tenantId", "name");

-- CreateIndex
CREATE INDEX "HostelRoom_tenantId_hostelId_idx" ON "HostelRoom"("tenantId", "hostelId");

-- CreateIndex
CREATE UNIQUE INDEX "HostelRoom_tenantId_hostelId_name_key" ON "HostelRoom"("tenantId", "hostelId", "name");

-- CreateIndex
CREATE INDEX "HostelAllocation_tenantId_roomId_idx" ON "HostelAllocation"("tenantId", "roomId");

-- CreateIndex
CREATE INDEX "HostelAllocation_tenantId_studentId_idx" ON "HostelAllocation"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "HostelAttendance_tenantId_date_idx" ON "HostelAttendance"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "HostelAttendance_tenantId_studentId_date_key" ON "HostelAttendance"("tenantId", "studentId", "date");

-- CreateIndex
CREATE INDEX "TransportRoute_tenantId_idx" ON "TransportRoute"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TransportRoute_tenantId_name_key" ON "TransportRoute"("tenantId", "name");

-- CreateIndex
CREATE INDEX "TransportShift_tenantId_routeId_idx" ON "TransportShift"("tenantId", "routeId");

-- CreateIndex
CREATE UNIQUE INDEX "TransportShift_tenantId_routeId_name_key" ON "TransportShift"("tenantId", "routeId", "name");

-- CreateIndex
CREATE INDEX "HardwareDeviceConnection_tenantId_deviceType_status_idx" ON "HardwareDeviceConnection"("tenantId", "deviceType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "HardwareDeviceConnection_tenantId_deviceType_label_key" ON "HardwareDeviceConnection"("tenantId", "deviceType", "label");

-- CreateIndex
CREATE INDEX "GpsBusLocation_tenantId_trackerId_recordedAt_idx" ON "GpsBusLocation"("tenantId", "trackerId", "recordedAt");

-- CreateIndex
CREATE INDEX "GpsBusLocation_tenantId_vehicleId_recordedAt_idx" ON "GpsBusLocation"("tenantId", "vehicleId", "recordedAt");

-- CreateIndex
CREATE INDEX "CctvCamera_tenantId_status_idx" ON "CctvCamera"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CctvCamera_tenantId_name_key" ON "CctvCamera"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Driver_tenantId_idx" ON "Driver"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_tenantId_licenseNo_key" ON "Driver"("tenantId", "licenseNo");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_idx" ON "Vehicle"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_tenantId_regNo_key" ON "Vehicle"("tenantId", "regNo");

-- CreateIndex
CREATE INDEX "VehicleMaintenance_tenantId_vehicleId_date_idx" ON "VehicleMaintenance"("tenantId", "vehicleId", "date");

-- CreateIndex
CREATE INDEX "FuelLog_tenantId_vehicleId_date_idx" ON "FuelLog"("tenantId", "vehicleId", "date");

-- CreateIndex
CREATE INDEX "TransportAssignment_tenantId_routeId_idx" ON "TransportAssignment"("tenantId", "routeId");

-- CreateIndex
CREATE INDEX "TransportAssignment_tenantId_studentId_idx" ON "TransportAssignment"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "TransportAssignment_tenantId_shiftId_idx" ON "TransportAssignment"("tenantId", "shiftId");

-- CreateIndex
CREATE INDEX "TransportRouteChangeRequest_tenantId_status_idx" ON "TransportRouteChangeRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "TransportRouteChangeRequest_tenantId_studentId_idx" ON "TransportRouteChangeRequest"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Store_tenantId_idx" ON "Store"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_tenantId_name_key" ON "Store"("tenantId", "name");

-- CreateIndex
CREATE INDEX "StockItem_tenantId_storeId_idx" ON "StockItem"("tenantId", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "StockItem_tenantId_storeId_name_key" ON "StockItem"("tenantId", "storeId", "name");

-- CreateIndex
CREATE INDEX "StockBatch_tenantId_itemId_idx" ON "StockBatch"("tenantId", "itemId");

-- CreateIndex
CREATE INDEX "StockMovement_tenantId_itemId_createdAt_idx" ON "StockMovement"("tenantId", "itemId", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_tenantId_studentId_idx" ON "StockMovement"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Asset_tenantId_idx" ON "Asset"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_tenantId_tag_key" ON "Asset"("tenantId", "tag");

-- CreateIndex
CREATE INDEX "AssetMaintenance_tenantId_assetId_idx" ON "AssetMaintenance"("tenantId", "assetId");

-- CreateIndex
CREATE INDEX "MealPlanEntry_tenantId_idx" ON "MealPlanEntry"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanEntry_tenantId_dayOfWeek_mealType_key" ON "MealPlanEntry"("tenantId", "dayOfWeek", "mealType");

-- CreateIndex
CREATE INDEX "CafeteriaTable_tenantId_session_idx" ON "CafeteriaTable"("tenantId", "session");

-- CreateIndex
CREATE UNIQUE INDEX "CafeteriaTable_tenantId_session_classId_tableNo_key" ON "CafeteriaTable"("tenantId", "session", "classId", "tableNo");

-- CreateIndex
CREATE INDEX "CafeteriaQueueEntry_tenantId_date_session_status_idx" ON "CafeteriaQueueEntry"("tenantId", "date", "session", "status");

-- CreateIndex
CREATE INDEX "CafeteriaQueueEntry_tenantId_studentId_idx" ON "CafeteriaQueueEntry"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "CafeteriaQueueEntry_tenantId_date_session_studentId_key" ON "CafeteriaQueueEntry"("tenantId", "date", "session", "studentId");

-- CreateIndex
CREATE INDEX "MealCard_tenantId_studentId_idx" ON "MealCard"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "MealCard_tenantId_cardNo_key" ON "MealCard"("tenantId", "cardNo");

-- CreateIndex
CREATE INDEX "CafeteriaFeePlan_tenantId_archived_idx" ON "CafeteriaFeePlan"("tenantId", "archived");

-- CreateIndex
CREATE UNIQUE INDEX "CafeteriaFeePlan_tenantId_level_year_term_classId_key" ON "CafeteriaFeePlan"("tenantId", "level", "year", "term", "classId");

-- CreateIndex
CREATE INDEX "CafeteriaEnrollmentRequest_tenantId_status_idx" ON "CafeteriaEnrollmentRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CafeteriaEnrollmentRequest_tenantId_studentId_idx" ON "CafeteriaEnrollmentRequest"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "UniformOrder_tenantId_studentId_idx" ON "UniformOrder"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "UniformOrder_tenantId_status_idx" ON "UniformOrder"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UniformOrder_tenantId_orderNo_key" ON "UniformOrder"("tenantId", "orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformFlag_moduleKey_key" ON "PlatformFlag"("moduleKey");

-- CreateIndex
CREATE INDEX "CustomFeatureRequest_tenantId_status_idx" ON "CustomFeatureRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CustomFeatureRequest_status_idx" ON "CustomFeatureRequest"("status");

-- CreateIndex
CREATE INDEX "BackgroundJob_tenantId_status_idx" ON "BackgroundJob"("tenantId", "status");

-- CreateIndex
CREATE INDEX "BackgroundJob_tenantId_startedById_status_idx" ON "BackgroundJob"("tenantId", "startedById", "status");

-- CreateIndex
CREATE INDEX "DisciplineIncident_tenantId_studentId_idx" ON "DisciplineIncident"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "DisciplineIncident_tenantId_date_idx" ON "DisciplineIncident"("tenantId", "date");

-- CreateIndex
CREATE INDEX "Suspension_tenantId_studentId_idx" ON "Suspension"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Suspension_tenantId_status_idx" ON "Suspension"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CounselingNote_tenantId_studentId_idx" ON "CounselingNote"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentMedical_studentId_key" ON "StudentMedical"("studentId");

-- CreateIndex
CREATE INDEX "StudentMedical_tenantId_idx" ON "StudentMedical"("tenantId");

-- CreateIndex
CREATE INDEX "ClinicVisit_tenantId_studentId_idx" ON "ClinicVisit"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "ClinicVisit_tenantId_date_idx" ON "ClinicVisit"("tenantId", "date");

-- CreateIndex
CREATE INDEX "MedicationPlan_tenantId_studentId_idx" ON "MedicationPlan"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "MedicationDose_tenantId_planId_idx" ON "MedicationDose"("tenantId", "planId");

-- CreateIndex
CREATE INDEX "PrintJob_tenantId_status_idx" ON "PrintJob"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PrintJob_tenantId_classId_idx" ON "PrintJob"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "PrintApprovalRequest_tenantId_status_idx" ON "PrintApprovalRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PrintApprovalRequest_tenantId_requestedById_status_idx" ON "PrintApprovalRequest"("tenantId", "requestedById", "status");

-- CreateIndex
CREATE INDEX "GatePass_tenantId_status_idx" ON "GatePass"("tenantId", "status");

-- CreateIndex
CREATE INDEX "GatePass_tenantId_studentId_idx" ON "GatePass"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "GatePass_tenantId_passNo_key" ON "GatePass"("tenantId", "passNo");

-- CreateIndex
CREATE INDEX "PickupPerson_tenantId_studentId_idx" ON "PickupPerson"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "AltPickupAuthorization_tenantId_status_idx" ON "AltPickupAuthorization"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AltPickupAuthorization_tenantId_studentId_idx" ON "AltPickupAuthorization"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "PanicAlert_tenantId_createdAt_idx" ON "PanicAlert"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "StaffAttendance_tenantId_date_idx" ON "StaffAttendance"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAttendance_tenantId_userId_date_key" ON "StaffAttendance"("tenantId", "userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_studentId_key" ON "AdmissionApplication"("studentId");

-- CreateIndex
CREATE INDEX "AdmissionApplication_tenantId_status_idx" ON "AdmissionApplication"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AdmissionApplication_tenantId_createdAt_idx" ON "AdmissionApplication"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_tenantId_applicationNo_key" ON "AdmissionApplication"("tenantId", "applicationNo");

-- CreateIndex
CREATE INDEX "PromotionRun_tenantId_createdAt_idx" ON "PromotionRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassYearHistory_tenantId_graduationYear_idx" ON "ClassYearHistory"("tenantId", "graduationYear");

-- CreateIndex
CREATE INDEX "ClassYearHistory_tenantId_classId_idx" ON "ClassYearHistory"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "TeacherAllocationReviewRun_tenantId_createdAt_idx" ON "TeacherAllocationReviewRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherAllocationReviewRun_tenantId_level_idx" ON "TeacherAllocationReviewRun"("tenantId", "level");

-- CreateIndex
CREATE INDEX "ClassGroupingRule_tenantId_targetLevel_active_idx" ON "ClassGroupingRule"("tenantId", "targetLevel", "active");

-- CreateIndex
CREATE INDEX "TeacherWorkloadRule_tenantId_teacherId_idx" ON "TeacherWorkloadRule"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "TeacherContinuityAssignment_tenantId_levelKey_roleType_acti_idx" ON "TeacherContinuityAssignment"("tenantId", "levelKey", "roleType", "active");

-- CreateIndex
CREATE INDEX "TeacherContinuityAssignment_tenantId_teacherId_active_idx" ON "TeacherContinuityAssignment"("tenantId", "teacherId", "active");

-- CreateIndex
CREATE INDEX "TeacherTransferImpact_tenantId_teacherId_status_idx" ON "TeacherTransferImpact"("tenantId", "teacherId", "status");

-- CreateIndex
CREATE INDEX "PrincipalDelegationTask_tenantId_assignedToId_status_idx" ON "PrincipalDelegationTask"("tenantId", "assignedToId", "status");

-- CreateIndex
CREATE INDEX "PrincipalDelegationTask_tenantId_assignedById_createdAt_idx" ON "PrincipalDelegationTask"("tenantId", "assignedById", "createdAt");

-- CreateIndex
CREATE INDEX "AttendanceRecord_tenantId_classId_date_idx" ON "AttendanceRecord"("tenantId", "classId", "date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_tenantId_date_idx" ON "AttendanceRecord"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_tenantId_studentId_date_key" ON "AttendanceRecord"("tenantId", "studentId", "date");

-- CreateIndex
CREATE INDEX "QrScanEvent_tenantId_studentId_action_createdAt_idx" ON "QrScanEvent"("tenantId", "studentId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "StudentTransfer_tenantId_studentId_idx" ON "StudentTransfer"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "StudentImport_tenantId_createdAt_idx" ON "StudentImport"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassAllocationRun_tenantId_createdAt_idx" ON "ClassAllocationRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassAllocationRun_tenantId_level_idx" ON "ClassAllocationRun"("tenantId", "level");

-- CreateIndex
CREATE INDEX "StudentCustomField_tenantId_studentId_idx" ON "StudentCustomField"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCustomField_studentId_label_key" ON "StudentCustomField"("studentId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVerification_code_key" ON "DocumentVerification"("code");

-- CreateIndex
CREATE INDEX "DocumentVerification_tenantId_idx" ON "DocumentVerification"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentVerification_studentId_idx" ON "DocumentVerification"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantStorageProvider_tenantId_key" ON "TenantStorageProvider"("tenantId");

-- CreateIndex
CREATE INDEX "TenantStorageProvider_tenantId_status_idx" ON "TenantStorageProvider"("tenantId", "status");

-- CreateIndex
CREATE INDEX "TenantStorageProvider_provider_healthStatus_idx" ON "TenantStorageProvider"("provider", "healthStatus");

-- CreateIndex
CREATE INDEX "StorageUsageSnapshot_tenantId_createdAt_idx" ON "StorageUsageSnapshot"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "StorageUsageSnapshot_healthStatus_idx" ON "StorageUsageSnapshot"("healthStatus");

-- CreateIndex
CREATE UNIQUE INDEX "StoredFile_key_key" ON "StoredFile"("key");

-- CreateIndex
CREATE INDEX "StoredFile_tenantId_idx" ON "StoredFile"("tenantId");

-- CreateIndex
CREATE INDEX "StoredFile_category_idx" ON "StoredFile"("category");

-- CreateIndex
CREATE INDEX "StoredFile_lifecycleTier_idx" ON "StoredFile"("lifecycleTier");

-- CreateIndex
CREATE INDEX "StorageOptimizerRun_tenantId_createdAt_idx" ON "StorageOptimizerRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "StorageOptimizerRun_createdAt_idx" ON "StorageOptimizerRun"("createdAt");

-- CreateIndex
CREATE INDEX "Conversation_tenantId_idx" ON "Conversation"("tenantId");

-- CreateIndex
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_tenantId_classId_key" ON "Conversation"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_tenantId_idx" ON "Message"("tenantId");

-- CreateIndex
CREATE INDEX "Message_tenantId_urgentFallbackAt_fallbackSmsSentAt_idx" ON "Message"("tenantId", "urgentFallbackAt", "fallbackSmsSentAt");

-- CreateIndex
CREATE INDEX "MessageAcknowledgement_tenantId_userId_idx" ON "MessageAcknowledgement"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "MessageAcknowledgement_tenantId_messageId_idx" ON "MessageAcknowledgement"("tenantId", "messageId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageAcknowledgement_messageId_userId_key" ON "MessageAcknowledgement"("messageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageDeliveryReport_messageId_key" ON "MessageDeliveryReport"("messageId");

-- CreateIndex
CREATE INDEX "MessageDeliveryReport_tenantId_senderId_generatedAt_idx" ON "MessageDeliveryReport"("tenantId", "senderId", "generatedAt");

-- CreateIndex
CREATE INDEX "MessageDeliveryReport_tenantId_conversationId_idx" ON "MessageDeliveryReport"("tenantId", "conversationId");

-- CreateIndex
CREATE INDEX "IntercomCall_tenantId_callerId_status_idx" ON "IntercomCall"("tenantId", "callerId", "status");

-- CreateIndex
CREATE INDEX "IntercomCall_tenantId_targetId_status_idx" ON "IntercomCall"("tenantId", "targetId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WebPushSubscription_endpoint_key" ON "WebPushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "WebPushSubscription_tenantId_userId_idx" ON "WebPushSubscription"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_readAt_idx" ON "Notification"("recipientId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "NotificationTemplate_tenantId_idx" ON "NotificationTemplate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_tenantId_key_key" ON "NotificationTemplate"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCredential_tenantId_key" ON "PaymentCredential"("tenantId");

-- CreateIndex
CREATE INDEX "PaymentCredential_tenantId_idx" ON "PaymentCredential"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutRequestId_key" ON "Payment"("checkoutRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mpesaRef_key" ON "Payment"("mpesaRef");

-- CreateIndex
CREATE INDEX "Payment_tenantId_idx" ON "Payment"("tenantId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_deletedAt_idx" ON "Payment"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tenantId_key" ON "Subscription"("tenantId");

-- CreateIndex
CREATE INDEX "Subscription_tenantId_idx" ON "Subscription"("tenantId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "TenantPricingSnapshot_tenantId_idx" ON "TenantPricingSnapshot"("tenantId");

-- CreateIndex
CREATE INDEX "TenantPricingSnapshot_tenantId_calculatedAt_idx" ON "TenantPricingSnapshot"("tenantId", "calculatedAt");

-- CreateIndex
CREATE INDEX "SchoolQuoteRequest_status_idx" ON "SchoolQuoteRequest"("status");

-- CreateIndex
CREATE INDEX "SchoolQuoteRequest_tenantId_idx" ON "SchoolQuoteRequest"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_checkoutRequestId_key" ON "SubscriptionPayment"("checkoutRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_mpesaRef_key" ON "SubscriptionPayment"("mpesaRef");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_subscriptionId_idx" ON "SubscriptionPayment"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_tenantId_idx" ON "SubscriptionPayment"("tenantId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_status_idx" ON "SubscriptionPayment"("status");

-- CreateIndex
CREATE INDEX "UsageCounter_tenantId_idx" ON "UsageCounter"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UsageCounter_tenantId_metric_periodKey_key" ON "UsageCounter"("tenantId", "metric", "periodKey");

-- CreateIndex
CREATE INDEX "OwnerApprovalRequest_tenantId_status_idx" ON "OwnerApprovalRequest"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "User_neyoLoginId_key" ON "User"("neyoLoginId");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "LinkedGuardianAccount_primaryUserId_idx" ON "LinkedGuardianAccount"("primaryUserId");

-- CreateIndex
CREATE INDEX "LinkedGuardianAccount_linkedUserId_idx" ON "LinkedGuardianAccount"("linkedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedGuardianAccount_primaryUserId_linkedUserId_key" ON "LinkedGuardianAccount"("primaryUserId", "linkedUserId");

-- CreateIndex
CREATE INDEX "OAuthConnectedAccount_tenantId_idx" ON "OAuthConnectedAccount"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthConnectedAccount_provider_providerAccountId_key" ON "OAuthConnectedAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthConnectedAccount_userId_provider_key" ON "OAuthConnectedAccount"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthState_state_key" ON "OAuthState"("state");

-- CreateIndex
CREATE INDEX "OAuthState_userId_provider_idx" ON "OAuthState"("userId", "provider");

-- CreateIndex
CREATE INDEX "OAuthState_expiresAt_idx" ON "OAuthState"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_credentialId_key" ON "Credential"("credentialId");

-- CreateIndex
CREATE INDEX "Credential_userId_idx" ON "Credential"("userId");

-- CreateIndex
CREATE INDEX "BiometricActionTicket_userId_idx" ON "BiometricActionTicket"("userId");

-- CreateIndex
CREATE INDEX "BiometricActionTicket_tenantId_idx" ON "BiometricActionTicket"("tenantId");

-- CreateIndex
CREATE INDEX "WebAuthnChallenge_userId_idx" ON "WebAuthnChallenge"("userId");

-- CreateIndex
CREATE INDEX "WebAuthnChallenge_email_idx" ON "WebAuthnChallenge"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TotpChallenge_token_key" ON "TotpChallenge"("token");

-- CreateIndex
CREATE INDEX "TotpChallenge_userId_idx" ON "TotpChallenge"("userId");

-- CreateIndex
CREATE INDEX "RecoveryCode_userId_idx" ON "RecoveryCode"("userId");

-- CreateIndex
CREATE INDEX "OtpCode_phone_idx" ON "OtpCode"("phone");

-- CreateIndex
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_tokenHash_key" ON "MagicLink"("tokenHash");

-- CreateIndex
CREATE INDEX "MagicLink_email_idx" ON "MagicLink"("email");

-- CreateIndex
CREATE INDEX "MagicLink_expiresAt_idx" ON "MagicLink"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "TenantModule_tenantId_idx" ON "TenantModule"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantModule_tenantId_moduleKey_key" ON "TenantModule"("tenantId", "moduleKey");

-- CreateIndex
CREATE INDEX "JobRun_name_idx" ON "JobRun"("name");

-- CreateIndex
CREATE INDEX "JobRun_status_idx" ON "JobRun"("status");

-- CreateIndex
CREATE INDEX "JobRun_createdAt_idx" ON "JobRun"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdSequence_tenantId_entityType_key" ON "IdSequence"("tenantId", "entityType");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_tenantId_idx" ON "ApiKey"("tenantId");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_tier_idx" ON "ApiKey"("tier");

-- CreateIndex
CREATE INDEX "WebhookSubscription_tenantId_idx" ON "WebhookSubscription"("tenantId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_tenantId_idx" ON "WebhookDelivery"("tenantId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_nextAttemptAt_idx" ON "WebhookDelivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_subscriptionId_idx" ON "WebhookDelivery"("subscriptionId");

-- CreateIndex
CREATE INDEX "ApiUsageLog_tenantId_createdAt_idx" ON "ApiUsageLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ApiUsageLog_apiKeyId_createdAt_idx" ON "ApiUsageLog"("apiKeyId", "createdAt");

-- CreateIndex
CREATE INDEX "ApiUsageLog_statusCode_idx" ON "ApiUsageLog"("statusCode");

-- CreateIndex
CREATE INDEX "ApiUsageLog_createdAt_idx" ON "ApiUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_tenantId_idx" ON "CalendarEvent"("tenantId");

-- CreateIndex
CREATE INDEX "CalendarEvent_tenantId_date_idx" ON "CalendarEvent"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarFeedToken_userId_key" ON "CalendarFeedToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarFeedToken_token_key" ON "CalendarFeedToken"("token");

-- CreateIndex
CREATE INDEX "CalendarFeedToken_tenantId_idx" ON "CalendarFeedToken"("tenantId");

-- CreateIndex
CREATE INDEX "VisitorLog_tenantId_idx" ON "VisitorLog"("tenantId");

-- CreateIndex
CREATE INDEX "VisitorLog_tenantId_signedInAt_idx" ON "VisitorLog"("tenantId", "signedInAt");

-- CreateIndex
CREATE INDEX "VisitorLog_tenantId_studentId_idx" ON "VisitorLog"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "AdmissionInquiry_tenantId_idx" ON "AdmissionInquiry"("tenantId");

-- CreateIndex
CREATE INDEX "AdmissionInquiry_tenantId_status_idx" ON "AdmissionInquiry"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PhoneMessage_tenantId_idx" ON "PhoneMessage"("tenantId");

-- CreateIndex
CREATE INDEX "PhoneMessage_tenantId_createdAt_idx" ON "PhoneMessage"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "SchoolClass_tenantId_idx" ON "SchoolClass"("tenantId");

-- CreateIndex
CREATE INDEX "SchoolClass_tenantId_curriculumId_idx" ON "SchoolClass"("tenantId", "curriculumId");

-- CreateIndex
CREATE INDEX "SchoolClass_tenantId_gradeBandId_idx" ON "SchoolClass"("tenantId", "gradeBandId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_tenantId_level_stream_key" ON "SchoolClass"("tenantId", "level", "stream");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_tenantId_idx" ON "Student"("tenantId");

-- CreateIndex
CREATE INDEX "Student_tenantId_status_idx" ON "Student"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Student_tenantId_classId_idx" ON "Student"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "Student_deletedAt_idx" ON "Student"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Student_tenantId_admissionNo_key" ON "Student"("tenantId", "admissionNo");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_userId_key" ON "Guardian"("userId");

-- CreateIndex
CREATE INDEX "Guardian_tenantId_idx" ON "Guardian"("tenantId");

-- CreateIndex
CREATE INDEX "Guardian_tenantId_phone_idx" ON "Guardian"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "StudentGuardian_tenantId_idx" ON "StudentGuardian"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGuardian_studentId_guardianId_key" ON "StudentGuardian"("studentId", "guardianId");

-- CreateIndex
CREATE INDEX "StudentDocument_tenantId_idx" ON "StudentDocument"("tenantId");

-- CreateIndex
CREATE INDEX "StudentDocument_studentId_idx" ON "StudentDocument"("studentId");

-- CreateIndex
CREATE INDEX "StudentRequirement_tenantId_idx" ON "StudentRequirement"("tenantId");

-- CreateIndex
CREATE INDEX "StudentRequirement_studentId_idx" ON "StudentRequirement"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "UniformSize_tenantId_itemId_size_key" ON "UniformSize"("tenantId", "itemId", "size");

-- CreateIndex
CREATE INDEX "Supplier_tenantId_category_idx" ON "Supplier"("tenantId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_tenantId_name_key" ON "Supplier"("tenantId", "name");

-- CreateIndex
CREATE INDEX "SupplierContract_tenantId_supplierId_idx" ON "SupplierContract"("tenantId", "supplierId");

-- CreateIndex
CREATE INDEX "PurchaseRequest_tenantId_status_idx" ON "PurchaseRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PurchaseQuote_tenantId_requestId_idx" ON "PurchaseQuote"("tenantId", "requestId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_tenantId_status_idx" ON "PurchaseOrder"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_tenantId_poNo_key" ON "PurchaseOrder"("tenantId", "poNo");

-- CreateIndex
CREATE INDEX "ExpenseCategory_tenantId_archived_idx" ON "ExpenseCategory"("tenantId", "archived");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_tenantId_name_key" ON "ExpenseCategory"("tenantId", "name");

-- CreateIndex
CREATE INDEX "CostCenter_tenantId_archived_idx" ON "CostCenter"("tenantId", "archived");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_tenantId_name_key" ON "CostCenter"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Expense_tenantId_status_idx" ON "Expense"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Expense_tenantId_spentOn_idx" ON "Expense"("tenantId", "spentOn");

-- CreateIndex
CREATE INDEX "TermPulse_tenantId_createdAt_idx" ON "TermPulse"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TermPulse_tenantId_weekKey_key" ON "TermPulse"("tenantId", "weekKey");

-- CreateIndex
CREATE INDEX "SavedView_tenantId_userId_entityType_idx" ON "SavedView"("tenantId", "userId", "entityType");

-- CreateIndex
CREATE INDEX "TeacherSubject_tenantId_idx" ON "TeacherSubject"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSubject_tenantId_teacherId_subjectId_key" ON "TeacherSubject"("tenantId", "teacherId", "subjectId");

-- CreateIndex
CREATE INDEX "ClassSubjectNeed_tenantId_idx" ON "ClassSubjectNeed"("tenantId");

-- CreateIndex
CREATE INDEX "ClassSubjectNeed_tenantId_venueId_idx" ON "ClassSubjectNeed"("tenantId", "venueId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubjectNeed_tenantId_classId_subjectId_key" ON "ClassSubjectNeed"("tenantId", "classId", "subjectId");

-- CreateIndex
CREATE INDEX "Venue_tenantId_idx" ON "Venue"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_tenantId_name_key" ON "Venue"("tenantId", "name");

-- CreateIndex
CREATE INDEX "CombinationGroup_tenantId_idx" ON "CombinationGroup"("tenantId");

-- CreateIndex
CREATE INDEX "CombinationGroup_tenantId_venueId_idx" ON "CombinationGroup"("tenantId", "venueId");

-- CreateIndex
CREATE INDEX "CombinationGroupClass_tenantId_idx" ON "CombinationGroupClass"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CombinationGroupClass_groupId_classId_key" ON "CombinationGroupClass"("groupId", "classId");

-- CreateIndex
CREATE INDEX "ElectiveBlock_tenantId_idx" ON "ElectiveBlock"("tenantId");

-- CreateIndex
CREATE INDEX "ElectiveBlockClass_tenantId_idx" ON "ElectiveBlockClass"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectiveBlockClass_blockId_classId_key" ON "ElectiveBlockClass"("blockId", "classId");

-- CreateIndex
CREATE INDEX "ElectiveBlockSlot_tenantId_idx" ON "ElectiveBlockSlot"("tenantId");

-- CreateIndex
CREATE INDEX "ElectiveBlockSlot_blockId_idx" ON "ElectiveBlockSlot"("blockId");

-- CreateIndex
CREATE INDEX "ElectiveBlockSlotSubject_tenantId_idx" ON "ElectiveBlockSlotSubject"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectiveBlockSlotSubject_slotId_subjectId_key" ON "ElectiveBlockSlotSubject"("slotId", "subjectId");

-- CreateIndex
CREATE INDEX "ElectiveBlockAutoBuildRun_tenantId_createdAt_idx" ON "ElectiveBlockAutoBuildRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ElectiveBlockAutoBuildRun_tenantId_level_idx" ON "ElectiveBlockAutoBuildRun"("tenantId", "level");

-- CreateIndex
CREATE INDEX "ClassCapacityOverflowRun_tenantId_createdAt_idx" ON "ClassCapacityOverflowRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassCapacityOverflowRun_tenantId_classId_idx" ON "ClassCapacityOverflowRun"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "TimetableConstraint_tenantId_kind_idx" ON "TimetableConstraint"("tenantId", "kind");

-- CreateIndex
CREATE INDEX "TeacherTimeOff_tenantId_teacherId_idx" ON "TeacherTimeOff"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "TimetableGenerationJob_tenantId_status_idx" ON "TimetableGenerationJob"("tenantId", "status");

-- CreateIndex
CREATE INDEX "LearningVideo_tenantId_title_idx" ON "LearningVideo"("tenantId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "LearningVideo_tenantId_youtubeId_key" ON "LearningVideo"("tenantId", "youtubeId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningVideoSession_castCode_key" ON "LearningVideoSession"("castCode");

-- CreateIndex
CREATE INDEX "LearningVideoSession_tenantId_startedAt_idx" ON "LearningVideoSession"("tenantId", "startedAt");

-- CreateIndex
CREATE INDEX "LearningVideoSession_tenantId_classId_idx" ON "LearningVideoSession"("tenantId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "OnlineClassSession_roomId_key" ON "OnlineClassSession"("roomId");

-- CreateIndex
CREATE INDEX "OnlineClassSession_tenantId_classId_status_idx" ON "OnlineClassSession"("tenantId", "classId", "status");

-- CreateIndex
CREATE INDEX "OnlineClassSession_tenantId_teacherId_idx" ON "OnlineClassSession"("tenantId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "OnlineClassParticipant_peerId_key" ON "OnlineClassParticipant"("peerId");

-- CreateIndex
CREATE INDEX "OnlineClassParticipant_tenantId_sessionId_idx" ON "OnlineClassParticipant"("tenantId", "sessionId");

-- CreateIndex
CREATE INDEX "OnlineClassParticipant_tenantId_userId_idx" ON "OnlineClassParticipant"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "OnlineClassSignal_tenantId_sessionId_toPeerId_idx" ON "OnlineClassSignal"("tenantId", "sessionId", "toPeerId");

-- CreateIndex
CREATE INDEX "OnlineClassSignal_createdAt_idx" ON "OnlineClassSignal"("createdAt");

-- CreateIndex
CREATE INDEX "OnlineClassQuestion_tenantId_sessionId_status_idx" ON "OnlineClassQuestion"("tenantId", "sessionId", "status");

-- CreateIndex
CREATE INDEX "OnlineClassQuestion_tenantId_userId_idx" ON "OnlineClassQuestion"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableConfig_classId_key" ON "TimetableConfig"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassVoiceRoom_roomKey_key" ON "ClassVoiceRoom"("roomKey");

-- CreateIndex
CREATE INDEX "ClassVoiceRoom_tenantId_conversationId_status_idx" ON "ClassVoiceRoom"("tenantId", "conversationId", "status");

-- CreateIndex
CREATE INDEX "ClassVoiceRoom_tenantId_classId_status_idx" ON "ClassVoiceRoom"("tenantId", "classId", "status");

-- CreateIndex
CREATE INDEX "ClassVoiceRoom_expiresAt_idx" ON "ClassVoiceRoom"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClassVoiceParticipant_peerId_key" ON "ClassVoiceParticipant"("peerId");

-- CreateIndex
CREATE INDEX "ClassVoiceParticipant_tenantId_roomId_idx" ON "ClassVoiceParticipant"("tenantId", "roomId");

-- CreateIndex
CREATE INDEX "ClassVoiceParticipant_tenantId_userId_idx" ON "ClassVoiceParticipant"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassVoiceParticipant_roomId_userId_key" ON "ClassVoiceParticipant"("roomId", "userId");

-- CreateIndex
CREATE INDEX "ClassVoiceSignal_tenantId_roomId_toPeerId_idx" ON "ClassVoiceSignal"("tenantId", "roomId", "toPeerId");

-- CreateIndex
CREATE INDEX "ClassVoiceSignal_expiresAt_idx" ON "ClassVoiceSignal"("expiresAt");

-- CreateIndex
CREATE INDEX "ClassVoiceSignal_createdAt_idx" ON "ClassVoiceSignal"("createdAt");

-- CreateIndex
CREATE INDEX "SyllabusTopic_tenantId_classId_subjectId_idx" ON "SyllabusTopic"("tenantId", "classId", "subjectId");

-- CreateIndex
CREATE INDEX "SyllabusTopic_tenantId_status_deadline_idx" ON "SyllabusTopic"("tenantId", "status", "deadline");

-- CreateIndex
CREATE INDEX "ExamTimetableGeneratorRun_tenantId_examName_idx" ON "ExamTimetableGeneratorRun"("tenantId", "examName");

-- CreateIndex
CREATE INDEX "ExamTimetableSlot_tenantId_examDate_idx" ON "ExamTimetableSlot"("tenantId", "examDate");

-- CreateIndex
CREATE INDEX "ExamTimetableSlot_tenantId_classId_idx" ON "ExamTimetableSlot"("tenantId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamTimetableSlot_tenantId_classId_subjectId_examDate_start_key" ON "ExamTimetableSlot"("tenantId", "classId", "subjectId", "examDate", "startTime", "paperName");

-- CreateIndex
CREATE INDEX "ExamMaterialRecord_tenantId_status_idx" ON "ExamMaterialRecord"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ExamMaterialRecord_tenantId_examDate_idx" ON "ExamMaterialRecord"("tenantId", "examDate");

-- CreateIndex
CREATE INDEX "ExamMaterialRecord_tenantId_deadline_idx" ON "ExamMaterialRecord"("tenantId", "deadline");

-- CreateIndex
CREATE INDEX "PromiseToPay_tenantId_idx" ON "PromiseToPay"("tenantId");

-- CreateIndex
CREATE INDEX "PromiseToPay_studentId_idx" ON "PromiseToPay"("studentId");

-- CreateIndex
CREATE INDEX "PromiseToPay_invoiceId_idx" ON "PromiseToPay"("invoiceId");

-- CreateIndex
CREATE INDEX "PromiseToPay_tenantId_planGroupId_idx" ON "PromiseToPay"("tenantId", "planGroupId");

-- CreateIndex
CREATE INDEX "PromiseToPay_tenantId_promiseDate_status_idx" ON "PromiseToPay"("tenantId", "promiseDate", "status");

-- CreateIndex
CREATE INDEX "ReportCardDayCheckIn_tenantId_idx" ON "ReportCardDayCheckIn"("tenantId");

-- CreateIndex
CREATE INDEX "ReportCardDayCheckIn_studentId_idx" ON "ReportCardDayCheckIn"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicSiteSettings_tenantId_key" ON "PublicSiteSettings"("tenantId");

-- CreateIndex
CREATE INDEX "PublicSiteLeader_tenantId_published_sortOrder_idx" ON "PublicSiteLeader"("tenantId", "published", "sortOrder");

-- CreateIndex
CREATE INDEX "PublicSiteTestimonial_tenantId_published_sortOrder_idx" ON "PublicSiteTestimonial"("tenantId", "published", "sortOrder");

-- CreateIndex
CREATE INDEX "PublicSiteGalleryImage_tenantId_published_sortOrder_idx" ON "PublicSiteGalleryImage"("tenantId", "published", "sortOrder");

-- CreateIndex
CREATE INDEX "PublicSiteGalleryImage_tenantId_category_idx" ON "PublicSiteGalleryImage"("tenantId", "category");

-- CreateIndex
CREATE INDEX "PublicSiteActivity_tenantId_published_sortOrder_idx" ON "PublicSiteActivity"("tenantId", "published", "sortOrder");

-- CreateIndex
CREATE INDEX "NewsPost_tenantId_status_publishedAt_idx" ON "NewsPost"("tenantId", "status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsPost_tenantId_slug_key" ON "NewsPost"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "NeyoIntegrationSecret_key_key" ON "NeyoIntegrationSecret"("key");

-- CreateIndex
CREATE INDEX "NeyoIntegrationSecret_provider_idx" ON "NeyoIntegrationSecret"("provider");

-- CreateIndex
CREATE INDEX "NeyoCustomerThread_tenantId_status_idx" ON "NeyoCustomerThread"("tenantId", "status");

-- CreateIndex
CREATE INDEX "NeyoCustomerThread_status_priority_lastMessageAt_idx" ON "NeyoCustomerThread"("status", "priority", "lastMessageAt");

-- CreateIndex
CREATE INDEX "NeyoCustomerMessage_threadId_createdAt_idx" ON "NeyoCustomerMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "NeyoCustomerMessage_direction_createdAt_idx" ON "NeyoCustomerMessage"("direction", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NeyoContract_publicToken_key" ON "NeyoContract"("publicToken");

-- CreateIndex
CREATE INDEX "NeyoContract_status_createdAt_idx" ON "NeyoContract"("status", "createdAt");

-- CreateIndex
CREATE INDEX "NeyoContract_tenantId_idx" ON "NeyoContract"("tenantId");

-- CreateIndex
CREATE INDEX "NeyoYoutubePost_status_scheduledFor_idx" ON "NeyoYoutubePost"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "NeyoYoutubePost_createdAt_idx" ON "NeyoYoutubePost"("createdAt");

-- CreateIndex
CREATE INDEX "NeyoYoutubePost_schoolTenantId_idx" ON "NeyoYoutubePost"("schoolTenantId");

-- CreateIndex
CREATE INDEX "NeyoIdea_status_priority_idx" ON "NeyoIdea"("status", "priority");

-- CreateIndex
CREATE INDEX "NeyoIdea_createdAt_idx" ON "NeyoIdea"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NeyoBuildLog_dateKey_key" ON "NeyoBuildLog"("dateKey");

-- CreateIndex
CREATE INDEX "NeyoBuildLog_dateKey_idx" ON "NeyoBuildLog"("dateKey");

-- CreateIndex
CREATE INDEX "NeyoBuildLog_status_idx" ON "NeyoBuildLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "NeyoMetricSnapshot_periodKey_key" ON "NeyoMetricSnapshot"("periodKey");

-- CreateIndex
CREATE INDEX "NeyoMetricSnapshot_periodStart_idx" ON "NeyoMetricSnapshot"("periodStart");

-- CreateIndex
CREATE INDEX "NeyoFounderOpsEntry_kind_status_idx" ON "NeyoFounderOpsEntry"("kind", "status");

-- CreateIndex
CREATE INDEX "NeyoFounderOpsEntry_scheduledFor_idx" ON "NeyoFounderOpsEntry"("scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "NeyoFounderOpsEntry_kind_periodKey_key" ON "NeyoFounderOpsEntry"("kind", "periodKey");

-- CreateIndex
CREATE INDEX "NeyoCustomerInterview_interviewDate_idx" ON "NeyoCustomerInterview"("interviewDate");

-- CreateIndex
CREATE INDEX "NeyoCustomerInterview_status_idx" ON "NeyoCustomerInterview"("status");

-- CreateIndex
CREATE INDEX "NeyoCustomerInterview_schoolName_idx" ON "NeyoCustomerInterview"("schoolName");

-- CreateIndex
CREATE UNIQUE INDEX "LeavingCertificate_studentId_key" ON "LeavingCertificate"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "LeavingCertificate_certificateNo_key" ON "LeavingCertificate"("certificateNo");

-- CreateIndex
CREATE INDEX "LeavingCertificate_tenantId_idx" ON "LeavingCertificate"("tenantId");

-- CreateIndex
CREATE INDEX "EntranceExamPaper_tenantId_classLabel_idx" ON "EntranceExamPaper"("tenantId", "classLabel");

-- CreateIndex
CREATE UNIQUE INDEX "EntranceExamPaper_tenantId_classId_key" ON "EntranceExamPaper"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "Rubric_tenantId_category_idx" ON "Rubric"("tenantId", "category");

-- CreateIndex
CREATE INDEX "Rubric_tenantId_isArchived_idx" ON "Rubric"("tenantId", "isArchived");

-- CreateIndex
CREATE UNIQUE INDEX "Rubric_tenantId_name_key" ON "Rubric"("tenantId", "name");

-- CreateIndex
CREATE INDEX "RubricLevel_tenantId_rubricId_idx" ON "RubricLevel"("tenantId", "rubricId");

-- CreateIndex
CREATE UNIQUE INDEX "RubricLevel_tenantId_rubricId_level_key" ON "RubricLevel"("tenantId", "rubricId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "RubricLevel_tenantId_rubricId_code_key" ON "RubricLevel"("tenantId", "rubricId", "code");

-- CreateIndex
CREATE INDEX "SkillsPassportEntry_tenantId_studentId_idx" ON "SkillsPassportEntry"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "SkillsPassportEntry_tenantId_skillArea_idx" ON "SkillsPassportEntry"("tenantId", "skillArea");

-- CreateIndex
CREATE INDEX "SkillsPassportEntry_tenantId_evidenceSource_idx" ON "SkillsPassportEntry"("tenantId", "evidenceSource");

-- CreateIndex
CREATE INDEX "PortfolioItem_tenantId_studentId_idx" ON "PortfolioItem"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "PortfolioItem_tenantId_category_idx" ON "PortfolioItem"("tenantId", "category");

-- CreateIndex
CREATE INDEX "PortfolioItem_tenantId_status_idx" ON "PortfolioItem"("tenantId", "status");

-- CreateIndex
CREATE INDEX "LearnerJourneyPin_tenantId_studentId_idx" ON "LearnerJourneyPin"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "LearnerJourneyPin_tenantId_sourceModule_idx" ON "LearnerJourneyPin"("tenantId", "sourceModule");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerJourneyPin_tenantId_studentId_entryId_key" ON "LearnerJourneyPin"("tenantId", "studentId", "entryId");

-- CreateIndex
CREATE UNIQUE INDEX "Pathway_tenantId_code_key" ON "Pathway"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "PathwaySubjectRequirement_tenantId_pathwayId_subjectId_key" ON "PathwaySubjectRequirement"("tenantId", "pathwayId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPathwayPreference_tenantId_studentId_pathwayId_key" ON "StudentPathwayPreference"("tenantId", "studentId", "pathwayId");

-- CreateIndex
CREATE INDEX "StudentNationalAssessment_tenantId_studentId_idx" ON "StudentNationalAssessment"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "StudentNationalAssessment_tenantId_milestone_idx" ON "StudentNationalAssessment"("tenantId", "milestone");

-- CreateIndex
CREATE UNIQUE INDEX "StudentNationalAssessment_tenantId_studentId_milestone_year_key" ON "StudentNationalAssessment"("tenantId", "studentId", "milestone", "year");

-- CreateIndex
CREATE UNIQUE INDEX "TalentArea_tenantId_name_key" ON "TalentArea"("tenantId", "name");

-- CreateIndex
CREATE INDEX "TalentRecord_tenantId_studentId_idx" ON "TalentRecord"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "TalentRecord_tenantId_talentAreaId_idx" ON "TalentRecord"("tenantId", "talentAreaId");

-- CreateIndex
CREATE INDEX "LessonResource_tenantId_lessonPlanId_idx" ON "LessonResource"("tenantId", "lessonPlanId");

-- CreateIndex
CREATE INDEX "LessonObservation_tenantId_lessonPlanId_idx" ON "LessonObservation"("tenantId", "lessonPlanId");

-- CreateIndex
CREATE INDEX "LessonObservation_tenantId_studentId_idx" ON "LessonObservation"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "StudentGoal_tenantId_studentId_idx" ON "StudentGoal"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferPassportRequest_accessCode_key" ON "TransferPassportRequest"("accessCode");

-- CreateIndex
CREATE INDEX "TransferPassportRequest_sourceTenantId_idx" ON "TransferPassportRequest"("sourceTenantId");

-- CreateIndex
CREATE INDEX "TransferPassportRequest_destinationTenantId_idx" ON "TransferPassportRequest"("destinationTenantId");

-- CreateIndex
CREATE INDEX "TransferPassportRequest_studentId_idx" ON "TransferPassportRequest"("studentId");

-- CreateIndex
CREATE INDEX "TransferPassportRequest_status_idx" ON "TransferPassportRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ReportTemplate_tenantId_name_key" ON "ReportTemplate"("tenantId", "name");

-- CreateIndex
CREATE INDEX "CommunityServiceActivity_tenantId_studentId_idx" ON "CommunityServiceActivity"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "CareerDiscoveryRecord_tenantId_studentId_idx" ON "CareerDiscoveryRecord"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "MarksPortal_tenantId_idx" ON "MarksPortal"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TermAggregationRule_tenantId_classId_subjectId_key" ON "TermAggregationRule"("tenantId", "classId", "subjectId");

-- CreateIndex
CREATE INDEX "MasterReportCard_tenantId_termId_classId_idx" ON "MasterReportCard"("tenantId", "termId", "classId");

-- CreateIndex
CREATE INDEX "MasterReportCard_tenantId_studentId_idx" ON "MasterReportCard"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterReportCard_tenantId_termId_studentId_subjectId_key" ON "MasterReportCard"("tenantId", "termId", "studentId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectPaperConfig_tenantId_subjectId_classId_name_key" ON "SubjectPaperConfig"("tenantId", "subjectId", "classId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PaperResult_tenantId_examResultId_paperConfigId_key" ON "PaperResult"("tenantId", "examResultId", "paperConfigId");

-- CreateIndex
CREATE INDEX "StudentApprovalRequest_tenantId_studentId_idx" ON "StudentApprovalRequest"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentDutyArea_tenantId_name_key" ON "StudentDutyArea"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "StudentDutyAssignment_tenantId_studentId_termId_key" ON "StudentDutyAssignment"("tenantId", "studentId", "termId");

-- CreateIndex
CREATE INDEX "SubjectSelectionPortal_tenantId_idx" ON "SubjectSelectionPortal"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSubjectSelection_tenantId_portalId_studentId_key" ON "StudentSubjectSelection"("tenantId", "portalId", "studentId");

-- CreateIndex
CREATE INDEX "PromotionRequest_tenantId_studentId_idx" ON "PromotionRequest"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "SmsMarginLedger_tenantId_status_idx" ON "SmsMarginLedger"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCredit_triggerPaymentId_key" ON "ReferralCredit"("triggerPaymentId");

-- CreateIndex
CREATE INDEX "ReferralCredit_tenantId_status_idx" ON "ReferralCredit"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ReferralCredit_counterpartTenantId_idx" ON "ReferralCredit"("counterpartTenantId");

-- CreateIndex
CREATE INDEX "DiscountCampaign_appliesTo_active_idx" ON "DiscountCampaign"("appliesTo", "active");

-- CreateIndex
CREATE INDEX "DiscountCampaign_startDate_endDate_idx" ON "DiscountCampaign"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerCode_code_key" ON "InfluencerCode"("code");

-- CreateIndex
CREATE INDEX "InfluencerCode_active_idx" ON "InfluencerCode"("active");

-- CreateIndex
CREATE INDEX "InfluencerCommission_status_idx" ON "InfluencerCommission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerCommission_influencerCodeId_tenantId_key" ON "InfluencerCommission"("influencerCodeId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyPaymentSplitPlan_paymentId_key" ON "FamilyPaymentSplitPlan"("paymentId");

-- CreateIndex
CREATE INDEX "FamilyPaymentSplitPlan_tenantId_status_idx" ON "FamilyPaymentSplitPlan"("tenantId", "status");

-- CreateIndex
CREATE INDEX "FamilyPaymentSplitItem_planId_idx" ON "FamilyPaymentSplitItem"("planId");

-- CreateIndex
CREATE INDEX "KnecExportBatch_tenantId_idx" ON "KnecExportBatch"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BundiImportUnlockCode_code_key" ON "BundiImportUnlockCode"("code");

-- CreateIndex
CREATE INDEX "BundiImportUnlockCode_tenantId_idx" ON "BundiImportUnlockCode"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BundiFieldTemplate_tenantId_domain_key" ON "BundiFieldTemplate"("tenantId", "domain");

-- CreateIndex
CREATE INDEX "BundiImportSession_tenantId_status_idx" ON "BundiImportSession"("tenantId", "status");

-- CreateIndex
CREATE INDEX "BundiImportSession_tenantId_domain_idx" ON "BundiImportSession"("tenantId", "domain");

-- CreateIndex
CREATE INDEX "BundiImportSession_unlockCodeId_idx" ON "BundiImportSession"("unlockCodeId");

-- CreateIndex
CREATE INDEX "BundiLearnedCorrection_tenantId_domain_idx" ON "BundiLearnedCorrection"("tenantId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "BundiLearnedCorrection_tenantId_domain_fieldLabel_wrongText_key" ON "BundiLearnedCorrection"("tenantId", "domain", "fieldLabel", "wrongText");

-- CreateIndex
CREATE INDEX "BundiDocumentTemplate_tenantId_domain_idx" ON "BundiDocumentTemplate"("tenantId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "BundiDocumentTemplate_tenantId_domain_layoutSignature_key" ON "BundiDocumentTemplate"("tenantId", "domain", "layoutSignature");

-- CreateIndex
CREATE INDEX "StaffImport_tenantId_createdAt_idx" ON "StaffImport"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "LibraryImport_tenantId_createdAt_idx" ON "LibraryImport"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherAllocationImport_tenantId_createdAt_idx" ON "TeacherAllocationImport"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "SchoolActivity_tenantId_idx" ON "SchoolActivity"("tenantId");

-- CreateIndex
CREATE INDEX "SchoolActivity_tenantId_year_term_idx" ON "SchoolActivity"("tenantId", "year", "term");

-- CreateIndex
CREATE INDEX "SchoolActivityClass_tenantId_idx" ON "SchoolActivityClass"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolActivityClass_activityId_classId_key" ON "SchoolActivityClass"("activityId", "classId");

-- CreateIndex
CREATE INDEX "ActivityParticipant_tenantId_idx" ON "ActivityParticipant"("tenantId");

-- CreateIndex
CREATE INDEX "ActivityParticipant_tenantId_status_idx" ON "ActivityParticipant"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityParticipant_activityId_studentId_key" ON "ActivityParticipant"("activityId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "KuccpsCluster_number_key" ON "KuccpsCluster"("number");

-- CreateIndex
CREATE INDEX "KuccpsCourse_clusterId_idx" ON "KuccpsCourse"("clusterId");

-- CreateIndex
CREATE UNIQUE INDEX "PathwayGuideSession_paymentId_key" ON "PathwayGuideSession"("paymentId");

-- CreateIndex
CREATE INDEX "PathwayGuideSession_tenantId_idx" ON "PathwayGuideSession"("tenantId");

-- CreateIndex
CREATE INDEX "PathwayGuideSession_studentId_idx" ON "PathwayGuideSession"("studentId");

-- CreateIndex
CREATE INDEX "PathwayGuideSession_phone_idx" ON "PathwayGuideSession"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "PathwayGuidePayment_checkoutRequestId_key" ON "PathwayGuidePayment"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "PathwayGuidePayment_phone_idx" ON "PathwayGuidePayment"("phone");

-- CreateIndex
CREATE INDEX "PathwayGuidePayment_status_idx" ON "PathwayGuidePayment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "NeyoTeamMember_userId_key" ON "NeyoTeamMember"("userId");

-- CreateIndex
CREATE INDEX "NeyoTeamMember_active_idx" ON "NeyoTeamMember"("active");

-- CreateIndex
CREATE INDEX "FounderAiQuery_createdAt_idx" ON "FounderAiQuery"("createdAt");

-- CreateIndex
CREATE INDEX "FounderAiQuery_askedById_idx" ON "FounderAiQuery"("askedById");

-- CreateIndex
CREATE INDEX "ComplianceRequest_tenantId_idx" ON "ComplianceRequest"("tenantId");

-- CreateIndex
CREATE INDEX "ComplianceRequest_status_idx" ON "ComplianceRequest"("status");

-- CreateIndex
CREATE INDEX "ComplianceRequest_kind_idx" ON "ComplianceRequest"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "NeyoCostSnapshot_periodKey_key" ON "NeyoCostSnapshot"("periodKey");

-- CreateIndex
CREATE INDEX "NeyoCostSnapshot_periodStart_idx" ON "NeyoCostSnapshot"("periodStart");

-- CreateIndex
CREATE INDEX "IdempotentRequest_tenantId_createdAt_idx" ON "IdempotentRequest"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotentRequest_tenantId_action_idempotencyKey_key" ON "IdempotentRequest"("tenantId", "action", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_referredByTenantId_fkey" FOREIGN KEY ("referredByTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_appliedInfluencerCodeId_fkey" FOREIGN KEY ("appliedInfluencerCodeId") REFERENCES "InfluencerCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubstituteAssignment" ADD CONSTRAINT "SubstituteAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubstituteAssignment" ADD CONSTRAINT "SubstituteAssignment_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubstituteAssignment" ADD CONSTRAINT "SubstituteAssignment_timetableSlotId_fkey" FOREIGN KEY ("timetableSlotId") REFERENCES "TimetableSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryRecord" ADD CONSTRAINT "DisciplinaryRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffSalary" ADD CONSTRAINT "StaffSalary_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeItem" ADD CONSTRAINT "FeeItem_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "FeeStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "FeeStructure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCashPaymentRequest" ADD CONSTRAINT "TeacherCashPaymentRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCashPaymentRequest" ADD CONSTRAINT "TeacherCashPaymentRequest_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbcStrand" ADD CONSTRAINT "CbcStrand_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbcStrand" ADD CONSTRAINT "CbcStrand_learningAreaId_fkey" FOREIGN KEY ("learningAreaId") REFERENCES "LearningArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbcAssessment" ADD CONSTRAINT "CbcAssessment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbcAssessment" ADD CONSTRAINT "CbcAssessment_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "CbcStrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamReleaseApprovalRequest" ADD CONSTRAINT "ExamReleaseApprovalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamReleaseApprovalRequest" ADD CONSTRAINT "ExamReleaseApprovalRequest_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubject" ADD CONSTRAINT "ExamSubject_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentType" ADD CONSTRAINT "AssessmentType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentPlan" ADD CONSTRAINT "AssessmentPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentPlan" ADD CONSTRAINT "AssessmentPlan_assessmentTypeId_fkey" FOREIGN KEY ("assessmentTypeId") REFERENCES "AssessmentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentRecord" ADD CONSTRAINT "AssessmentRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentRecord" ADD CONSTRAINT "AssessmentRecord_planId_fkey" FOREIGN KEY ("planId") REFERENCES "AssessmentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentEvidence" ADD CONSTRAINT "AssessmentEvidence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentEvidence" ADD CONSTRAINT "AssessmentEvidence_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "AssessmentRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyGroup" ADD CONSTRAINT "CompetencyGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CompetencyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyEvidence" ADD CONSTRAINT "CompetencyEvidence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyEvidence" ADD CONSTRAINT "CompetencyEvidence_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationLevel" ADD CONSTRAINT "EducationLevel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationLevel" ADD CONSTRAINT "EducationLevel_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeBand" ADD CONSTRAINT "GradeBand_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeBand" ADD CONSTRAINT "GradeBand_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeBand" ADD CONSTRAINT "GradeBand_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "EducationLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningArea" ADD CONSTRAINT "LearningArea_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningArea" ADD CONSTRAINT "LearningArea_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityCategory" ADD CONSTRAINT "ActivityCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_learningAreaId_fkey" FOREIGN KEY ("learningAreaId") REFERENCES "LearningArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicTerm" ADD CONSTRAINT "AcademicTerm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicTerm" ADD CONSTRAINT "AcademicTerm_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyRosterEntry" ADD CONSTRAINT "DutyRosterEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_activityCategoryId_fkey" FOREIGN KEY ("activityCategoryId") REFERENCES "ActivityCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_electiveBlockSlotId_fkey" FOREIGN KEY ("electiveBlockSlotId") REFERENCES "ElectiveBlockSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "CbcStrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_assessmentPlanId_fkey" FOREIGN KEY ("assessmentPlanId") REFERENCES "AssessmentPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassNote" ADD CONSTRAINT "ClassNote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassNote" ADD CONSTRAINT "ClassNote_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "Homework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumThread" ADD CONSTRAINT "ForumThread_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ForumThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkMessage" ADD CONSTRAINT "BulkMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCommsApprovalRequest" ADD CONSTRAINT "TeacherCommsApprovalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBook" ADD CONSTRAINT "LibraryBook_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBookCopy" ADD CONSTRAINT "LibraryBookCopy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBookCopy" ADD CONSTRAINT "LibraryBookCopy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "LibraryBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookIssue" ADD CONSTRAINT "BookIssue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookIssue" ADD CONSTRAINT "BookIssue_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "LibraryBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookIssue" ADD CONSTRAINT "BookIssue_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "LibraryBookCopy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hostel" ADD CONSTRAINT "Hostel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelRoom" ADD CONSTRAINT "HostelRoom_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelAllocation" ADD CONSTRAINT "HostelAllocation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "HostelRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelAttendance" ADD CONSTRAINT "HostelAttendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportRoute" ADD CONSTRAINT "TransportRoute_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportRoute" ADD CONSTRAINT "TransportRoute_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportRoute" ADD CONSTRAINT "TransportRoute_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportShift" ADD CONSTRAINT "TransportShift_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportShift" ADD CONSTRAINT "TransportShift_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TransportRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportShift" ADD CONSTRAINT "TransportShift_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportShift" ADD CONSTRAINT "TransportShift_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HardwareDeviceConnection" ADD CONSTRAINT "HardwareDeviceConnection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GpsBusLocation" ADD CONSTRAINT "GpsBusLocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CctvCamera" ADD CONSTRAINT "CctvCamera_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportAssignment" ADD CONSTRAINT "TransportAssignment_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TransportRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportAssignment" ADD CONSTRAINT "TransportAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "TransportShift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportRouteChangeRequest" ADD CONSTRAINT "TransportRouteChangeRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportRouteChangeRequest" ADD CONSTRAINT "TransportRouteChangeRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBatch" ADD CONSTRAINT "StockBatch_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMaintenance" ADD CONSTRAINT "AssetMaintenance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMaintenance" ADD CONSTRAINT "AssetMaintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanEntry" ADD CONSTRAINT "MealPlanEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CafeteriaTable" ADD CONSTRAINT "CafeteriaTable_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CafeteriaQueueEntry" ADD CONSTRAINT "CafeteriaQueueEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealCard" ADD CONSTRAINT "MealCard_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealCard" ADD CONSTRAINT "MealCard_feePlanId_fkey" FOREIGN KEY ("feePlanId") REFERENCES "CafeteriaFeePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CafeteriaFeePlan" ADD CONSTRAINT "CafeteriaFeePlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CafeteriaEnrollmentRequest" ADD CONSTRAINT "CafeteriaEnrollmentRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CafeteriaEnrollmentRequest" ADD CONSTRAINT "CafeteriaEnrollmentRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniformOrder" ADD CONSTRAINT "UniformOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomFeatureRequest" ADD CONSTRAINT "CustomFeatureRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineIncident" ADD CONSTRAINT "DisciplineIncident_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingNote" ADD CONSTRAINT "CounselingNote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentMedical" ADD CONSTRAINT "StudentMedical_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicVisit" ADD CONSTRAINT "ClinicVisit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationPlan" ADD CONSTRAINT "MedicationPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationDose" ADD CONSTRAINT "MedicationDose_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MedicationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintApprovalRequest" ADD CONSTRAINT "PrintApprovalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatePass" ADD CONSTRAINT "GatePass_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupPerson" ADD CONSTRAINT "PickupPerson_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AltPickupAuthorization" ADD CONSTRAINT "AltPickupAuthorization_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanicAlert" ADD CONSTRAINT "PanicAlert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRun" ADD CONSTRAINT "PromotionRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassYearHistory" ADD CONSTRAINT "ClassYearHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAllocationReviewRun" ADD CONSTRAINT "TeacherAllocationReviewRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroupingRule" ADD CONSTRAINT "ClassGroupingRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherWorkloadRule" ADD CONSTRAINT "TeacherWorkloadRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherContinuityAssignment" ADD CONSTRAINT "TeacherContinuityAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTransferImpact" ADD CONSTRAINT "TeacherTransferImpact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrincipalDelegationTask" ADD CONSTRAINT "PrincipalDelegationTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrScanEvent" ADD CONSTRAINT "QrScanEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrScanEvent" ADD CONSTRAINT "QrScanEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTransfer" ADD CONSTRAINT "StudentTransfer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTransfer" ADD CONSTRAINT "StudentTransfer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentImport" ADD CONSTRAINT "StudentImport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAllocationRun" ADD CONSTRAINT "ClassAllocationRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCustomField" ADD CONSTRAINT "StudentCustomField_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCustomField" ADD CONSTRAINT "StudentCustomField_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVerification" ADD CONSTRAINT "DocumentVerification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVerification" ADD CONSTRAINT "DocumentVerification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantStorageProvider" ADD CONSTRAINT "TenantStorageProvider_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageUsageSnapshot" ADD CONSTRAINT "StorageUsageSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageOptimizerRun" ADD CONSTRAINT "StorageOptimizerRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAcknowledgement" ADD CONSTRAINT "MessageAcknowledgement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAcknowledgement" ADD CONSTRAINT "MessageAcknowledgement_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDeliveryReport" ADD CONSTRAINT "MessageDeliveryReport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDeliveryReport" ADD CONSTRAINT "MessageDeliveryReport_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntercomCall" ADD CONSTRAINT "IntercomCall_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebPushSubscription" ADD CONSTRAINT "WebPushSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebPushSubscription" ADD CONSTRAINT "WebPushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentCredential" ADD CONSTRAINT "PaymentCredential_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPricingSnapshot" ADD CONSTRAINT "TenantPricingSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolQuoteRequest" ADD CONSTRAINT "SchoolQuoteRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageCounter" ADD CONSTRAINT "UsageCounter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerApprovalRequest" ADD CONSTRAINT "OwnerApprovalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedGuardianAccount" ADD CONSTRAINT "LinkedGuardianAccount_primaryUserId_fkey" FOREIGN KEY ("primaryUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedGuardianAccount" ADD CONSTRAINT "LinkedGuardianAccount_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthConnectedAccount" ADD CONSTRAINT "OAuthConnectedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryCode" ADD CONSTRAINT "RecoveryCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicLink" ADD CONSTRAINT "MagicLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantModule" ADD CONSTRAINT "TenantModule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdSequence" ADD CONSTRAINT "IdSequence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "WebhookSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiUsageLog" ADD CONSTRAINT "ApiUsageLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiUsageLog" ADD CONSTRAINT "ApiUsageLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarFeedToken" ADD CONSTRAINT "CalendarFeedToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarFeedToken" ADD CONSTRAINT "CalendarFeedToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorLog" ADD CONSTRAINT "VisitorLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionInquiry" ADD CONSTRAINT "AdmissionInquiry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneMessage" ADD CONSTRAINT "PhoneMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_gradeBandId_fkey" FOREIGN KEY ("gradeBandId") REFERENCES "GradeBand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRequirement" ADD CONSTRAINT "StudentRequirement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniformSize" ADD CONSTRAINT "UniformSize_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniformSize" ADD CONSTRAINT "UniformSize_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierContract" ADD CONSTRAINT "SupplierContract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierContract" ADD CONSTRAINT "SupplierContract_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseQuote" ADD CONSTRAINT "PurchaseQuote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseQuote" ADD CONSTRAINT "PurchaseQuote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PurchaseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PurchaseRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermPulse" ADD CONSTRAINT "TermPulse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedView" ADD CONSTRAINT "SavedView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubjectNeed" ADD CONSTRAINT "ClassSubjectNeed_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubjectNeed" ADD CONSTRAINT "ClassSubjectNeed_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombinationGroup" ADD CONSTRAINT "CombinationGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombinationGroup" ADD CONSTRAINT "CombinationGroup_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombinationGroupClass" ADD CONSTRAINT "CombinationGroupClass_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CombinationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectiveBlock" ADD CONSTRAINT "ElectiveBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectiveBlockClass" ADD CONSTRAINT "ElectiveBlockClass_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ElectiveBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectiveBlockSlot" ADD CONSTRAINT "ElectiveBlockSlot_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ElectiveBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectiveBlockSlotSubject" ADD CONSTRAINT "ElectiveBlockSlotSubject_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ElectiveBlockSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectiveBlockSlotSubject" ADD CONSTRAINT "ElectiveBlockSlotSubject_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectiveBlockSlotSubject" ADD CONSTRAINT "ElectiveBlockSlotSubject_resolvedVenueId_fkey" FOREIGN KEY ("resolvedVenueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectiveBlockAutoBuildRun" ADD CONSTRAINT "ElectiveBlockAutoBuildRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassCapacityOverflowRun" ADD CONSTRAINT "ClassCapacityOverflowRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableConstraint" ADD CONSTRAINT "TimetableConstraint_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTimeOff" ADD CONSTRAINT "TeacherTimeOff_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableGenerationJob" ADD CONSTRAINT "TimetableGenerationJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningVideo" ADD CONSTRAINT "LearningVideo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningVideoSession" ADD CONSTRAINT "LearningVideoSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningVideoSession" ADD CONSTRAINT "LearningVideoSession_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "LearningVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineClassSession" ADD CONSTRAINT "OnlineClassSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineClassParticipant" ADD CONSTRAINT "OnlineClassParticipant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineClassParticipant" ADD CONSTRAINT "OnlineClassParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "OnlineClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineClassSignal" ADD CONSTRAINT "OnlineClassSignal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineClassSignal" ADD CONSTRAINT "OnlineClassSignal_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "OnlineClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineClassQuestion" ADD CONSTRAINT "OnlineClassQuestion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnlineClassQuestion" ADD CONSTRAINT "OnlineClassQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "OnlineClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableConfig" ADD CONSTRAINT "TimetableConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassVoiceRoom" ADD CONSTRAINT "ClassVoiceRoom_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassVoiceParticipant" ADD CONSTRAINT "ClassVoiceParticipant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassVoiceParticipant" ADD CONSTRAINT "ClassVoiceParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ClassVoiceRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassVoiceSignal" ADD CONSTRAINT "ClassVoiceSignal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassVoiceSignal" ADD CONSTRAINT "ClassVoiceSignal_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ClassVoiceRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusTopic" ADD CONSTRAINT "SyllabusTopic_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTimetableGeneratorRun" ADD CONSTRAINT "ExamTimetableGeneratorRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTimetableSlot" ADD CONSTRAINT "ExamTimetableSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamMaterialRecord" ADD CONSTRAINT "ExamMaterialRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseToPay" ADD CONSTRAINT "PromiseToPay_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseToPay" ADD CONSTRAINT "PromiseToPay_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseToPay" ADD CONSTRAINT "PromiseToPay_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseToPay" ADD CONSTRAINT "PromiseToPay_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCardDayCheckIn" ADD CONSTRAINT "ReportCardDayCheckIn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCardDayCheckIn" ADD CONSTRAINT "ReportCardDayCheckIn_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSiteSettings" ADD CONSTRAINT "PublicSiteSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSiteLeader" ADD CONSTRAINT "PublicSiteLeader_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSiteTestimonial" ADD CONSTRAINT "PublicSiteTestimonial_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSiteGalleryImage" ADD CONSTRAINT "PublicSiteGalleryImage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSiteActivity" ADD CONSTRAINT "PublicSiteActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeyoCustomerMessage" ADD CONSTRAINT "NeyoCustomerMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "NeyoCustomerThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavingCertificate" ADD CONSTRAINT "LeavingCertificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntranceExamPaper" ADD CONSTRAINT "EntranceExamPaper_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rubric" ADD CONSTRAINT "Rubric_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricLevel" ADD CONSTRAINT "RubricLevel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricLevel" ADD CONSTRAINT "RubricLevel_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillsPassportEntry" ADD CONSTRAINT "SkillsPassportEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillsPassportEntry" ADD CONSTRAINT "SkillsPassportEntry_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerJourneyPin" ADD CONSTRAINT "LearnerJourneyPin_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerJourneyPin" ADD CONSTRAINT "LearnerJourneyPin_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pathway" ADD CONSTRAINT "Pathway_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathwaySubjectRequirement" ADD CONSTRAINT "PathwaySubjectRequirement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathwaySubjectRequirement" ADD CONSTRAINT "PathwaySubjectRequirement_pathwayId_fkey" FOREIGN KEY ("pathwayId") REFERENCES "Pathway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathwaySubjectRequirement" ADD CONSTRAINT "PathwaySubjectRequirement_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPathwayPreference" ADD CONSTRAINT "StudentPathwayPreference_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPathwayPreference" ADD CONSTRAINT "StudentPathwayPreference_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPathwayPreference" ADD CONSTRAINT "StudentPathwayPreference_pathwayId_fkey" FOREIGN KEY ("pathwayId") REFERENCES "Pathway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNationalAssessment" ADD CONSTRAINT "StudentNationalAssessment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNationalAssessment" ADD CONSTRAINT "StudentNationalAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentArea" ADD CONSTRAINT "TalentArea_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentRecord" ADD CONSTRAINT "TalentRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentRecord" ADD CONSTRAINT "TalentRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentRecord" ADD CONSTRAINT "TalentRecord_talentAreaId_fkey" FOREIGN KEY ("talentAreaId") REFERENCES "TalentArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentRecord" ADD CONSTRAINT "TalentRecord_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentRecord" ADD CONSTRAINT "TalentRecord_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonResource" ADD CONSTRAINT "LessonResource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonResource" ADD CONSTRAINT "LessonResource_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonObservation" ADD CONSTRAINT "LessonObservation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonObservation" ADD CONSTRAINT "LessonObservation_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGoal" ADD CONSTRAINT "StudentGoal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGoal" ADD CONSTRAINT "StudentGoal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGoal" ADD CONSTRAINT "StudentGoal_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGoal" ADD CONSTRAINT "StudentGoal_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPassportRequest" ADD CONSTRAINT "TransferPassportRequest_sourceTenantId_fkey" FOREIGN KEY ("sourceTenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPassportRequest" ADD CONSTRAINT "TransferPassportRequest_destinationTenantId_fkey" FOREIGN KEY ("destinationTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPassportRequest" ADD CONSTRAINT "TransferPassportRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTemplate" ADD CONSTRAINT "ReportTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityServiceActivity" ADD CONSTRAINT "CommunityServiceActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityServiceActivity" ADD CONSTRAINT "CommunityServiceActivity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerDiscoveryRecord" ADD CONSTRAINT "CareerDiscoveryRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerDiscoveryRecord" ADD CONSTRAINT "CareerDiscoveryRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksPortal" ADD CONSTRAINT "MarksPortal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarksPortal" ADD CONSTRAINT "MarksPortal_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermAggregationRule" ADD CONSTRAINT "TermAggregationRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterReportCard" ADD CONSTRAINT "MasterReportCard_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectPaperConfig" ADD CONSTRAINT "SubjectPaperConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectPaperConfig" ADD CONSTRAINT "SubjectPaperConfig_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperResult" ADD CONSTRAINT "PaperResult_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperResult" ADD CONSTRAINT "PaperResult_examResultId_fkey" FOREIGN KEY ("examResultId") REFERENCES "ExamResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperResult" ADD CONSTRAINT "PaperResult_paperConfigId_fkey" FOREIGN KEY ("paperConfigId") REFERENCES "SubjectPaperConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentApprovalRequest" ADD CONSTRAINT "StudentApprovalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentApprovalRequest" ADD CONSTRAINT "StudentApprovalRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDutyArea" ADD CONSTRAINT "StudentDutyArea_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDutyAssignment" ADD CONSTRAINT "StudentDutyAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDutyAssignment" ADD CONSTRAINT "StudentDutyAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDutyAssignment" ADD CONSTRAINT "StudentDutyAssignment_dutyAreaId_fkey" FOREIGN KEY ("dutyAreaId") REFERENCES "StudentDutyArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDutyAssignment" ADD CONSTRAINT "StudentDutyAssignment_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectSelectionPortal" ADD CONSTRAINT "SubjectSelectionPortal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectSelection" ADD CONSTRAINT "StudentSubjectSelection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectSelection" ADD CONSTRAINT "StudentSubjectSelection_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "SubjectSelectionPortal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectSelection" ADD CONSTRAINT "StudentSubjectSelection_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRequest" ADD CONSTRAINT "PromotionRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRequest" ADD CONSTRAINT "PromotionRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMarginLedger" ADD CONSTRAINT "SmsMarginLedger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCredit" ADD CONSTRAINT "ReferralCredit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerCommission" ADD CONSTRAINT "InfluencerCommission_influencerCodeId_fkey" FOREIGN KEY ("influencerCodeId") REFERENCES "InfluencerCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerCommission" ADD CONSTRAINT "InfluencerCommission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyPaymentSplitPlan" ADD CONSTRAINT "FamilyPaymentSplitPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyPaymentSplitItem" ADD CONSTRAINT "FamilyPaymentSplitItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "FamilyPaymentSplitPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnecExportBatch" ADD CONSTRAINT "KnecExportBatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundiImportUnlockCode" ADD CONSTRAINT "BundiImportUnlockCode_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundiFieldTemplate" ADD CONSTRAINT "BundiFieldTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundiImportSession" ADD CONSTRAINT "BundiImportSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundiImportSession" ADD CONSTRAINT "BundiImportSession_unlockCodeId_fkey" FOREIGN KEY ("unlockCodeId") REFERENCES "BundiImportUnlockCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundiLearnedCorrection" ADD CONSTRAINT "BundiLearnedCorrection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundiDocumentTemplate" ADD CONSTRAINT "BundiDocumentTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffImport" ADD CONSTRAINT "StaffImport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryImport" ADD CONSTRAINT "LibraryImport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAllocationImport" ADD CONSTRAINT "TeacherAllocationImport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolActivity" ADD CONSTRAINT "SchoolActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolActivityClass" ADD CONSTRAINT "SchoolActivityClass_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "SchoolActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityParticipant" ADD CONSTRAINT "ActivityParticipant_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "SchoolActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KuccpsCourse" ADD CONSTRAINT "KuccpsCourse_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "KuccpsCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathwayGuideSession" ADD CONSTRAINT "PathwayGuideSession_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PathwayGuidePayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeyoTeamMember" ADD CONSTRAINT "NeyoTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotentRequest" ADD CONSTRAINT "IdempotentRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
