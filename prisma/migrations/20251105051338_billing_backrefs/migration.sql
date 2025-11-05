-- CreateTable
CREATE TABLE "BillingUsage" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "totalPrimaryOptions" INTEGER NOT NULL DEFAULT 0,
    "chargedBlocks" INTEGER NOT NULL DEFAULT 0,
    "lastSync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditBillingEvent" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditBillingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillingUsage_clientId_idx" ON "BillingUsage"("clientId");

-- CreateIndex
CREATE INDEX "AuditBillingEvent_clientId_idx" ON "AuditBillingEvent"("clientId");

-- AddForeignKey
ALTER TABLE "BillingUsage" ADD CONSTRAINT "BillingUsage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditBillingEvent" ADD CONSTRAINT "AuditBillingEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
