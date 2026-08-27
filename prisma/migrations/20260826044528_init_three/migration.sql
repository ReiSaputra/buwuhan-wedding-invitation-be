/*
  Warnings:

  - You are about to drop the column `coupleId` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `invitationId` on the `rsvps` table. All the data in the column will be lost.
  - Added the required column `invitationId` to the `bride_and_grooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guestId` to the `rsvps` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_coupleId_fkey";

-- DropForeignKey
ALTER TABLE "rsvps" DROP CONSTRAINT "rsvps_invitationId_fkey";

-- AlterTable
ALTER TABLE "bride_and_grooms" ADD COLUMN     "invitationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "coupleId";

-- AlterTable
ALTER TABLE "rsvps" DROP COLUMN "invitationId",
ADD COLUMN     "guestId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "bride_and_grooms" ADD CONSTRAINT "bride_and_grooms_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
