CREATE TABLE "ReportSubjectComment" (
  "id" TEXT NOT NULL, "tenantId" TEXT NOT NULL, "termId" TEXT NOT NULL, "classId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL, "subjectId" TEXT NOT NULL, "autoComment" TEXT NOT NULL, "comment" TEXT NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'AUTO', "resolvedTeacherId" TEXT, "resolvedTeacherName" TEXT,
  "editedById" TEXT, "editedByName" TEXT, "editedAt" TIMESTAMP(3), "lockedById" TEXT, "lockedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReportSubjectComment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReportSubjectComment_tenantId_termId_studentId_subjectId_key" ON "ReportSubjectComment"("tenantId", "termId", "studentId", "subjectId");
CREATE INDEX "ReportSubjectComment_tenantId_termId_classId_idx" ON "ReportSubjectComment"("tenantId", "termId", "classId");
ALTER TABLE "ReportSubjectComment" ADD CONSTRAINT "ReportSubjectComment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ReportLeadershipRemark" (
  "id" TEXT NOT NULL, "tenantId" TEXT NOT NULL, "termId" TEXT NOT NULL, "classId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL, "role" TEXT NOT NULL, "remark" TEXT NOT NULL, "state" TEXT NOT NULL DEFAULT 'DRAFT',
  "authorId" TEXT NOT NULL, "authorName" TEXT NOT NULL, "lockedById" TEXT, "lockedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReportLeadershipRemark_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReportLeadershipRemark_tenantId_termId_studentId_role_key" ON "ReportLeadershipRemark"("tenantId", "termId", "studentId", "role");
CREATE INDEX "ReportLeadershipRemark_tenantId_termId_classId_idx" ON "ReportLeadershipRemark"("tenantId", "termId", "classId");
ALTER TABLE "ReportLeadershipRemark" ADD CONSTRAINT "ReportLeadershipRemark_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
