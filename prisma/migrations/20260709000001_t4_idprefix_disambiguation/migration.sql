-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "idPrefix" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_idPrefix_key" ON "Tenant"("idPrefix");

