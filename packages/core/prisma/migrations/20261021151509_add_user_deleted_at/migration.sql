-- AlterTable
ALTER TABLE "ngc"."User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "lastActivityAt" SET DATA TYPE TIMESTAMP(3);
