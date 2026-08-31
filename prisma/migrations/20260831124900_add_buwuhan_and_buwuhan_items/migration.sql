-- CreateTable
CREATE TABLE "buwuhans" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "giverName" TEXT NOT NULL,
    "note" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buwuhans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buwuhan_items" (
    "id" TEXT NOT NULL,
    "buwuhanId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT,
    "estimatedValue" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buwuhan_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "buwuhans_invitationId_idx" ON "buwuhans"("invitationId");

-- CreateIndex
CREATE INDEX "buwuhan_items_buwuhanId_idx" ON "buwuhan_items"("buwuhanId");

-- AddForeignKey
ALTER TABLE "buwuhans" ADD CONSTRAINT "buwuhans_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buwuhan_items" ADD CONSTRAINT "buwuhan_items_buwuhanId_fkey" FOREIGN KEY ("buwuhanId") REFERENCES "buwuhans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
