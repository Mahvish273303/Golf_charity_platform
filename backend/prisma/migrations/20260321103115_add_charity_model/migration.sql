-- AlterTable
ALTER TABLE "Charity" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Draw" ADD COLUMN     "numbers" INTEGER[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "charityId" TEXT;

-- CreateIndex
CREATE INDEX "User_charityId_idx" ON "User"("charityId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "Charity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
