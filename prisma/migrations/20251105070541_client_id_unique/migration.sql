/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `BillingUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BillingUsage_clientId_key" ON "BillingUsage"("clientId");
