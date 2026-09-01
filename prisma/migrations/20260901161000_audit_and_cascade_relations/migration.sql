-- DropForeignKey
ALTER TABLE "bride_and_grooms" DROP CONSTRAINT IF EXISTS "bride_and_grooms_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_templateId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_userId_fkey";

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bride_and_grooms" ADD CONSTRAINT "bride_and_grooms_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

