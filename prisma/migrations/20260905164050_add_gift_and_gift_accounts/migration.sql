-- CreateEnum
CREATE TYPE "GiftMethod" AS ENUM ('CASH', 'TRANSFER', 'EWALLET');

-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "giftAddress" TEXT;

-- CreateTable
CREATE TABLE "gift_accounts" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BANK',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gifts" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "giverName" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "GiftMethod" NOT NULL DEFAULT 'TRANSFER',
    "note" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gift_accounts_invitationId_idx" ON "gift_accounts"("invitationId");

-- CreateIndex
CREATE INDEX "gifts_invitationId_idx" ON "gifts"("invitationId");

-- AddForeignKey
ALTER TABLE "gift_accounts" ADD CONSTRAINT "gift_accounts_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
