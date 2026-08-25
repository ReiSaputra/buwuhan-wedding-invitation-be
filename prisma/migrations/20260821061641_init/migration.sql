/*
  Warnings:

  - You are about to drop the column `ownerId` on the `invitations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[qrCode]` on the table `guests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "InvitationRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- DropForeignKey
ALTER TABLE "contributions" DROP CONSTRAINT "contributions_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "gift_accounts" DROP CONSTRAINT "gift_accounts_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "guests" DROP CONSTRAINT "guests_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "rsvps" DROP CONSTRAINT "rsvps_guestId_fkey";

-- DropForeignKey
ALTER TABLE "wishes" DROP CONSTRAINT "wishes_invitationId_fkey";

-- AlterTable
ALTER TABLE "contributions" ADD COLUMN     "guestId" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "streamUrl" TEXT;

-- AlterTable
ALTER TABLE "gift_accounts" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "ownerId",
ADD COLUMN     "additionalInfo" JSONB,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "role" "PlatformRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "wishes" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation_collaborators" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "InvitationRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "capacity" INTEGER,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_moments" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "description" TEXT,
    "photoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "story_moments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "invitation_collaborators_invitationId_idx" ON "invitation_collaborators"("invitationId");

-- CreateIndex
CREATE INDEX "invitation_collaborators_userId_idx" ON "invitation_collaborators"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_collaborators_invitationId_userId_key" ON "invitation_collaborators"("invitationId", "userId");

-- CreateIndex
CREATE INDEX "sessions_invitationId_idx" ON "sessions"("invitationId");

-- CreateIndex
CREATE INDEX "media_invitationId_idx" ON "media"("invitationId");

-- CreateIndex
CREATE INDEX "story_moments_invitationId_idx" ON "story_moments"("invitationId");

-- CreateIndex
CREATE INDEX "contributions_invitationId_idx" ON "contributions"("invitationId");

-- CreateIndex
CREATE INDEX "contributions_guestId_idx" ON "contributions"("guestId");

-- CreateIndex
CREATE INDEX "events_invitationId_idx" ON "events"("invitationId");

-- CreateIndex
CREATE INDEX "gift_accounts_invitationId_idx" ON "gift_accounts"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "guests_qrCode_key" ON "guests"("qrCode");

-- CreateIndex
CREATE INDEX "guests_invitationId_idx" ON "guests"("invitationId");

-- CreateIndex
CREATE INDEX "wishes_invitationId_idx" ON "wishes"("invitationId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_collaborators" ADD CONSTRAINT "invitation_collaborators_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_collaborators" ADD CONSTRAINT "invitation_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_accounts" ADD CONSTRAINT "gift_accounts_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_moments" ADD CONSTRAINT "story_moments_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
