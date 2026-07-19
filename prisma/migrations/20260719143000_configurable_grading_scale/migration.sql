CREATE TABLE "GradingScale" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "boundariesJson" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GradingScale_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GradingScale_tenantId_key" ON "GradingScale"("tenantId");
ALTER TABLE "GradingScale" ADD CONSTRAINT "GradingScale_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
