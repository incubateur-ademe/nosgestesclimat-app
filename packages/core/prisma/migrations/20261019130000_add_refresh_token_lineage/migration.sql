-- AlterTable
ALTER TABLE "ngc"."RefreshToken" ADD COLUMN     "previousToken" TEXT,
ADD COLUMN     "rotatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_previousToken_key" ON "ngc"."RefreshToken"("previousToken");
