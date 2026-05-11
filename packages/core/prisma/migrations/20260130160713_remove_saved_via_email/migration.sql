/*
  Warnings:

  - You are about to drop the column `savedViaEmail` on the `Simulation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `VerificationCode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ngc"."Simulation" DROP COLUMN "savedViaEmail";

-- AlterTable
ALTER TABLE "ngc"."VerificationCode" DROP COLUMN "userId";
