-- AddColumn: Audit trail untuk buwuhans
ALTER TABLE "buwuhans" ADD COLUMN "recorded_by_member_id" TEXT;
ALTER TABLE "buwuhans" ADD COLUMN "recorded_by_name" TEXT;

-- AddColumn: Audit trail untuk gifts
ALTER TABLE "gifts" ADD COLUMN "recorded_by_member_id" TEXT;
ALTER TABLE "gifts" ADD COLUMN "recorded_by_name" TEXT;

-- AddIndex
CREATE INDEX "buwuhans_recorded_by_member_id_idx" ON "buwuhans"("recorded_by_member_id");
CREATE INDEX "gifts_recorded_by_member_id_idx" ON "gifts"("recorded_by_member_id");

-- AddForeignKey: buwuhans -> invitation_members (SetNull on delete)
ALTER TABLE "buwuhans" ADD CONSTRAINT "buwuhans_recorded_by_member_id_fkey" FOREIGN KEY ("recorded_by_member_id") REFERENCES "invitation_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: gifts -> invitation_members (SetNull on delete)
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_recorded_by_member_id_fkey" FOREIGN KEY ("recorded_by_member_id") REFERENCES "invitation_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;