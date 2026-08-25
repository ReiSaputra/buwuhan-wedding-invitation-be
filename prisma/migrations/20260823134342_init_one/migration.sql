/*
  Warnings:

  - The values [ADMIN] on the enum `PlatformRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `templateId` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `guestCount` on the `rsvps` table. All the data in the column will be lost.
  - You are about to drop the column `respondedAt` on the `rsvps` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `contributions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gift_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `guests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invitation_collaborators` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `story_moments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wishes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `coupleId` to the `invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `invitations` table without a default value. This is not possible if the table is not empty.
  - Made the column `additionalInfo` on table `invitations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `publishedAt` on table `invitations` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `invitationId` to the `rsvps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservation` to the `rsvps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `rsvps` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `rsvps` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `fullName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CoupleType" AS ENUM ('BRIDE', 'GROOM');

-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('CONFIRMED', 'DECLINED');

-- AlterEnum
BEGIN;
CREATE TYPE "PlatformRole_new" AS ENUM ('USER');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "PlatformRole_new" USING ("role"::text::"PlatformRole_new");
ALTER TYPE "PlatformRole" RENAME TO "PlatformRole_old";
ALTER TYPE "PlatformRole_new" RENAME TO "PlatformRole";
DROP TYPE "public"."PlatformRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "contributions" DROP CONSTRAINT "contributions_guestId_fkey";

-- DropForeignKey
ALTER TABLE "contributions" DROP CONSTRAINT "contributions_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "gift_accounts" DROP CONSTRAINT "gift_accounts_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "guests" DROP CONSTRAINT "guests_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "guests" DROP CONSTRAINT "guests_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "invitation_collaborators" DROP CONSTRAINT "invitation_collaborators_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "invitation_collaborators" DROP CONSTRAINT "invitation_collaborators_userId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_templateId_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "rsvps" DROP CONSTRAINT "rsvps_guestId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "story_moments" DROP CONSTRAINT "story_moments_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "wishes" DROP CONSTRAINT "wishes_invitationId_fkey";

-- DropIndex
DROP INDEX "invitations_slug_key";

-- DropIndex
DROP INDEX "rsvps_guestId_key";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "templateId",
ADD COLUMN     "coupleId" TEXT NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ALTER COLUMN "additionalInfo" SET NOT NULL,
ALTER COLUMN "isPublished" DROP DEFAULT,
ALTER COLUMN "publishedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "rsvps" DROP COLUMN "guestCount",
DROP COLUMN "respondedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invitationId" TEXT NOT NULL,
ADD COLUMN     "reservation" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "RSVPStatus" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "contributions";

-- DropTable
DROP TABLE "events";

-- DropTable
DROP TABLE "gift_accounts";

-- DropTable
DROP TABLE "guests";

-- DropTable
DROP TABLE "invitation_collaborators";

-- DropTable
DROP TABLE "media";

-- DropTable
DROP TABLE "refresh_tokens";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "story_moments";

-- DropTable
DROP TABLE "templates";

-- DropTable
DROP TABLE "wishes";

-- DropEnum
DROP TYPE "ContributionType";

-- DropEnum
DROP TYPE "InvitationRole";

-- DropEnum
DROP TYPE "MediaType";

-- DropEnum
DROP TYPE "RsvpStatus";

-- CreateTable
CREATE TABLE "bride_and_grooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CoupleType" NOT NULL,
    "fatherName" TEXT NOT NULL,
    "motherName" TEXT NOT NULL,

    CONSTRAINT "bride_and_grooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_qrCode_key" ON "Guest"("qrCode");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "bride_and_grooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
