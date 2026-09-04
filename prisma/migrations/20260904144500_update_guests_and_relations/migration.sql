/*
  Warnings:

  - A unique constraint covering the columns `[invitationId,guestId]` on the table `rsvps` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invitationId` to the `rsvps` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "guests" DROP CONSTRAINT "guests_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "rsvps" DROP CONSTRAINT "rsvps_guestId_fkey";

-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "category" TEXT,
ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "checkedOutAt" TIMESTAMP(3),
ADD COLUMN     "isAttended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paxActual" INTEGER,
ADD COLUMN     "paxCount" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "rsvps" ADD COLUMN     "invitationId" TEXT NOT NULL,
ADD COLUMN     "message" TEXT,
ALTER COLUMN "reservation" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "gallery_photos" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "invitationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "love_stories" (
    "id" TEXT NOT NULL,
    "yearOrDate" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "invitationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "love_stories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_photos_invitationId_idx" ON "gallery_photos"("invitationId");

-- CreateIndex
CREATE INDEX "love_stories_invitationId_idx" ON "love_stories"("invitationId");

-- CreateIndex
CREATE INDEX "guests_invitationId_idx" ON "guests"("invitationId");

-- CreateIndex
CREATE INDEX "rsvps_invitationId_idx" ON "rsvps"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "rsvps_invitationId_guestId_key" ON "rsvps"("invitationId", "guestId");

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "love_stories" ADD CONSTRAINT "love_stories_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
