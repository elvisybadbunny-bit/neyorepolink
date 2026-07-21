CREATE TABLE "GuidedHelpVideo" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "youtubeId" TEXT NOT NULL,
  "routePattern" TEXT NOT NULL,
  "actionKey" TEXT,
  "rolesJson" TEXT NOT NULL DEFAULT '[]',
  "language" TEXT NOT NULL DEFAULT 'en',
  "durationSeconds" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "version" INTEGER NOT NULL DEFAULT 1,
  "transcript" TEXT,
  "thumbnailUrl" TEXT,
  "reviewedById" TEXT,
  "reviewedByName" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "createdByName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GuidedHelpVideo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GuidedHelpVideo_status_routePattern_idx" ON "GuidedHelpVideo"("status", "routePattern");
CREATE INDEX "GuidedHelpVideo_actionKey_status_idx" ON "GuidedHelpVideo"("actionKey", "status");
CREATE INDEX "GuidedHelpVideo_updatedAt_idx" ON "GuidedHelpVideo"("updatedAt");
