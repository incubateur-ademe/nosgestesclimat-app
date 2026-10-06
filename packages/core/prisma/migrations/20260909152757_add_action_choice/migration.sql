-- CreateEnum
CREATE TYPE "ngc"."ActionChoiceType" AS ENUM ('committed', 'rejected');

-- CreateTable
CREATE TABLE "ngc"."ActionChoice" (
    "id" UUID NOT NULL,
    "type" "ngc"."ActionChoiceType" NOT NULL,
    "chosenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    "actionId" UUID NOT NULL,

    CONSTRAINT "ActionChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActionChoice_userId_actionId_key" ON "ngc"."ActionChoice"("userId", "actionId");

-- AddForeignKey
ALTER TABLE "ngc"."ActionChoice" ADD CONSTRAINT "ActionChoice_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ngc"."Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."ActionChoice" ADD CONSTRAINT "ActionChoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ngc"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
