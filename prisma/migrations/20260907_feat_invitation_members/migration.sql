-- CreateEnum
CREATE TYPE "InvitationRole" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "invitation_members" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" CITEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "InvitationRole" NOT NULL DEFAULT 'USER',
    "invite_token_hash" TEXT,
    "invite_token_expires_at" TIMESTAMP(3),
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitation_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitation_members_invite_token_hash_key" ON "invitation_members"("invite_token_hash");

-- CreateIndex
CREATE INDEX "invitation_members_invitation_id_idx" ON "invitation_members"("invitation_id");

-- CreateIndex
CREATE INDEX "invitation_members_user_id_idx" ON "invitation_members"("user_id");

-- CreateIndex
CREATE INDEX "invitation_members_email_idx" ON "invitation_members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_members_invitation_id_email_key" ON "invitation_members"("invitation_id", "email");

-- AddForeignKey
ALTER TABLE "invitation_members" ADD CONSTRAINT "invitation_members_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_members" ADD CONSTRAINT "invitation_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
