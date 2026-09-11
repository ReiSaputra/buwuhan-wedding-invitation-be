/*
  Warnings:

  - You are about to drop the column `recorded_by_member_id` on the `buwuhans` table. All the data in the column will be lost.
  - You are about to drop the column `recorded_by_name` on the `buwuhans` table. All the data in the column will be lost.
  - You are about to drop the column `recorded_by_member_id` on the `gifts` table. All the data in the column will be lost.
  - You are about to drop the column `recorded_by_name` on the `gifts` table. All the data in the column will be lost.
  - You are about to drop the column `accepted_at` on the `invitation_members` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `invitation_members` table. All the data in the column will be lost.
  - You are about to drop the column `invitation_id` on the `invitation_members` table. All the data in the column will be lost.
  - You are about to drop the column `invite_token_expires_at` on the `invitation_members` table. All the data in the column will be lost.
  - You are about to drop the column `invite_token_hash` on the `invitation_members` table. All the data in the column will be lost.
  - You are about to drop the column `invited_at` on the `invitation_members` table. All the data in the column will be lost.
  - You are about to drop the column `revoked_at` on the `invitation_members` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `invitation_members` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `invitation_members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[inviteTokenHash]` on the table `invitation_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitationId,email]` on the table `invitation_members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invitationId` to the `invitation_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `invitation_members` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'YEARLY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PaymentProvider" AS ENUM ('MIDTRANS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- DropForeignKey
ALTER TABLE "buwuhans" DROP CONSTRAINT IF EXISTS "buwuhans_recorded_by_member_id_fkey";

-- DropForeignKey
ALTER TABLE "gifts" DROP CONSTRAINT IF EXISTS "gifts_recorded_by_member_id_fkey";

-- DropForeignKey
ALTER TABLE "invitation_members" DROP CONSTRAINT IF EXISTS "invitation_members_invitation_id_fkey";

-- DropForeignKey
ALTER TABLE "invitation_members" DROP CONSTRAINT IF EXISTS "invitation_members_user_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "buwuhans_recorded_by_member_id_idx";

-- DropIndex
DROP INDEX IF EXISTS "gifts_recorded_by_member_id_idx";

-- DropIndex
DROP INDEX IF EXISTS "invitation_members_email_idx";

-- DropIndex
DROP INDEX IF EXISTS "invitation_members_invitation_id_email_key";

-- DropIndex
DROP INDEX IF EXISTS "invitation_members_invitation_id_idx";

-- DropIndex
DROP INDEX IF EXISTS "invitation_members_invite_token_hash_key";

-- DropIndex
DROP INDEX IF EXISTS "invitation_members_user_id_idx";

-- AlterTable
ALTER TABLE "buwuhans" DROP COLUMN IF EXISTS "recorded_by_member_id",
DROP COLUMN IF EXISTS "recorded_by_name",
ADD COLUMN     "recordedByMemberId" TEXT,
ADD COLUMN     "recordedByName" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "invitationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "gifts" DROP COLUMN IF EXISTS "recorded_by_member_id",
DROP COLUMN IF EXISTS "recorded_by_name",
ADD COLUMN     "recordedByMemberId" TEXT,
ADD COLUMN     "recordedByName" TEXT;

-- AlterTable
ALTER TABLE "invitation_members" DROP COLUMN IF EXISTS "accepted_at",
DROP COLUMN IF EXISTS "created_at",
DROP COLUMN IF EXISTS "invitation_id",
DROP COLUMN IF EXISTS "invite_token_expires_at",
DROP COLUMN IF EXISTS "invite_token_hash",
DROP COLUMN IF EXISTS "invited_at",
DROP COLUMN IF EXISTS "revoked_at",
DROP COLUMN IF EXISTS "updated_at",
DROP COLUMN IF EXISTS "user_id",
ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invitationId" TEXT NOT NULL,
ADD COLUMN     "inviteTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteTokenHash" TEXT,
ADD COLUMN     "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "celebrants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "fatherName" TEXT NOT NULL,
    "motherName" TEXT NOT NULL,
    "gender" TEXT,
    "birthDate" TIMESTAMP(3),
    "childOrder" INTEGER,
    "invitationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "celebrants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "period" "BillingPeriod" NOT NULL,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tier" "PlanTier" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "provider" "PaymentProvider",
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "rawPayload" JSONB,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "celebrants_invitationId_key" ON "celebrants"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_tier_key" ON "plans"("tier");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_idempotencyKey_key" ON "invoices"("idempotencyKey");

-- CreateIndex
CREATE INDEX "invoices_userId_idx" ON "invoices"("userId");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_idx" ON "invoices"("subscriptionId");

-- CreateIndex
CREATE INDEX "buwuhans_userId_idx" ON "buwuhans"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_members_inviteTokenHash_key" ON "invitation_members"("inviteTokenHash");

-- CreateIndex
CREATE INDEX "invitation_members_invitationId_idx" ON "invitation_members"("invitationId");

-- CreateIndex
CREATE INDEX "invitation_members_userId_idx" ON "invitation_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_members_invitationId_email_key" ON "invitation_members"("invitationId", "email");

-- AddForeignKey
ALTER TABLE "invitation_members" ADD CONSTRAINT "invitation_members_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_members" ADD CONSTRAINT "invitation_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celebrants" ADD CONSTRAINT "celebrants_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buwuhans" ADD CONSTRAINT "buwuhans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buwuhans" ADD CONSTRAINT "buwuhans_recordedByMemberId_fkey" FOREIGN KEY ("recordedByMemberId") REFERENCES "invitation_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_recordedByMemberId_fkey" FOREIGN KEY ("recordedByMemberId") REFERENCES "invitation_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planCode_fkey" FOREIGN KEY ("planCode") REFERENCES "plans"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
