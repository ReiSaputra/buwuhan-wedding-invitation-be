-- CreateEnum
CREATE TYPE "public"."EventCategory" AS ENUM ('WEDDING', 'KHITANAN', 'RASULAN', 'AQIQAH');

-- AlterTable
ALTER TABLE "public"."templates" ADD COLUMN "eventCategory" "public"."EventCategory" NOT NULL DEFAULT 'WEDDING';

-- AlterTable
ALTER TABLE "public"."invitations" ADD COLUMN "eventCategory" "public"."EventCategory" NOT NULL DEFAULT 'WEDDING';
