CREATE TABLE "CbeCurriculumDesign" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "substrandId" TEXT NOT NULL,
  "suggestedLearningExperiences" TEXT,
  "keyInquiryQuestions" TEXT,
  "competencyCodes" TEXT,
  "values" TEXT,
  "pertinentIssues" TEXT,
  "crossLearningAreaLinks" TEXT,
  "communityServiceIdeas" TEXT,
  "suggestedResources" TEXT,
  "assessmentCriteria" TEXT,
  "lessonAllocation" INTEGER,
  "sourceLabel" TEXT,
  "sourceVersion" TEXT,
  "sourceReference" TEXT,
  "reviewStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "reviewedById" TEXT,
  "reviewedByName" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "createdByName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CbeCurriculumDesign_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CbeCurriculumDesign_substrandId_key" ON "CbeCurriculumDesign"("substrandId");
CREATE INDEX "CbeCurriculumDesign_tenantId_reviewStatus_idx" ON "CbeCurriculumDesign"("tenantId", "reviewStatus");
ALTER TABLE "CbeCurriculumDesign" ADD CONSTRAINT "CbeCurriculumDesign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CbeCurriculumDesign" ADD CONSTRAINT "CbeCurriculumDesign_substrandId_fkey" FOREIGN KEY ("substrandId") REFERENCES "CbcSubstrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CbeDeliverySession" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "curriculumDesignId" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "teacherName" TEXT NOT NULL,
  "deliveredOn" TEXT NOT NULL,
  "timetableSlotId" TEXT,
  "lessonPlanId" TEXT,
  "syllabusTopicId" TEXT,
  "assessmentPlanId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "deliveryNotes" TEXT,
  "resourceLinks" TEXT,
  "nextSteps" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CbeDeliverySession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CbeDeliverySession_tenantId_classId_deliveredOn_idx" ON "CbeDeliverySession"("tenantId", "classId", "deliveredOn");
CREATE INDEX "CbeDeliverySession_tenantId_teacherId_idx" ON "CbeDeliverySession"("tenantId", "teacherId");
CREATE INDEX "CbeDeliverySession_tenantId_curriculumDesignId_idx" ON "CbeDeliverySession"("tenantId", "curriculumDesignId");
ALTER TABLE "CbeDeliverySession" ADD CONSTRAINT "CbeDeliverySession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CbeDeliverySession" ADD CONSTRAINT "CbeDeliverySession_curriculumDesignId_fkey" FOREIGN KEY ("curriculumDesignId") REFERENCES "CbeCurriculumDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CbeDeliveryEvidence" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "deliverySessionId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "level" INTEGER,
  "observation" TEXT NOT NULL,
  "evidenceUrl" TEXT,
  "cbcAssessmentId" TEXT,
  "assessmentRecordId" TEXT,
  "competencyEvidenceId" TEXT,
  "portfolioItemId" TEXT,
  "recordedById" TEXT NOT NULL,
  "recordedByName" TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CbeDeliveryEvidence_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CbeDeliveryEvidence_tenantId_studentId_idx" ON "CbeDeliveryEvidence"("tenantId", "studentId");
CREATE INDEX "CbeDeliveryEvidence_tenantId_deliverySessionId_idx" ON "CbeDeliveryEvidence"("tenantId", "deliverySessionId");
ALTER TABLE "CbeDeliveryEvidence" ADD CONSTRAINT "CbeDeliveryEvidence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CbeDeliveryEvidence" ADD CONSTRAINT "CbeDeliveryEvidence_deliverySessionId_fkey" FOREIGN KEY ("deliverySessionId") REFERENCES "CbeDeliverySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CbeIntervention" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "deliverySessionId" TEXT,
  "studentId" TEXT NOT NULL,
  "substrandId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "actionDetails" TEXT NOT NULL,
  "targetLevel" INTEGER,
  "reviewDate" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "outcome" TEXT,
  "reviewedLevel" INTEGER,
  "parentSummary" TEXT,
  "assignedById" TEXT NOT NULL,
  "assignedByName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CbeIntervention_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CbeIntervention_tenantId_studentId_status_idx" ON "CbeIntervention"("tenantId", "studentId", "status");
CREATE INDEX "CbeIntervention_tenantId_reviewDate_idx" ON "CbeIntervention"("tenantId", "reviewDate");
CREATE INDEX "CbeIntervention_tenantId_substrandId_idx" ON "CbeIntervention"("tenantId", "substrandId");
ALTER TABLE "CbeIntervention" ADD CONSTRAINT "CbeIntervention_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CbeIntervention" ADD CONSTRAINT "CbeIntervention_deliverySessionId_fkey" FOREIGN KEY ("deliverySessionId") REFERENCES "CbeDeliverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
