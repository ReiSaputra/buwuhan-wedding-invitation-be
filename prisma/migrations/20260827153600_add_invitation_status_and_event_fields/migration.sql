-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "isPublished",
ADD COLUMN "status" "InvitationStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "eventDate" TIMESTAMP(3),
ADD COLUMN "eventTime" TEXT,
ADD COLUMN "venue" TEXT,
ADD COLUMN "address" TEXT;

