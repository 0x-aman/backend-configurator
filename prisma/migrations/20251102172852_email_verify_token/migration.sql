/*
  Warnings:

  - A unique constraint covering the columns `[emailVerifyToken]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetToken]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "clients_emailVerifyToken_key" ON "clients"("emailVerifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "clients_resetToken_key" ON "clients"("resetToken");

-- CreateIndex
CREATE INDEX "clients_resetToken_idx" ON "clients"("resetToken");

-- CreateIndex
CREATE INDEX "clients_emailVerifyToken_idx" ON "clients"("emailVerifyToken");

-- CreateIndex
CREATE INDEX "clients_stripeCustomerId_idx" ON "clients"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "clients_stripeSubscriptionId_idx" ON "clients"("stripeSubscriptionId");
