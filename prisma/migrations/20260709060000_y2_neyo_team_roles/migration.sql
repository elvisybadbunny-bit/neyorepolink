-- CreateTable
CREATE TABLE "NeyoTeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "extraPermissionsJson" TEXT NOT NULL DEFAULT '[]',
    "note" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "invitedById" TEXT NOT NULL,
    "invitedByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NeyoTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "NeyoTeamMember_userId_key" ON "NeyoTeamMember"("userId");

-- CreateIndex
CREATE INDEX "NeyoTeamMember_active_idx" ON "NeyoTeamMember"("active");

