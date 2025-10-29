/*
  Warnings:

  - The values [TRIALING] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'INACTIVE', 'SUSPENDED');
ALTER TABLE "public"."clients" ALTER COLUMN "subscriptionStatus" DROP DEFAULT;
ALTER TABLE "clients" ALTER COLUMN "subscriptionStatus" TYPE "SubscriptionStatus_new" USING ("subscriptionStatus"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "public"."SubscriptionStatus_old";
ALTER TABLE "clients" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'INACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'INACTIVE';
