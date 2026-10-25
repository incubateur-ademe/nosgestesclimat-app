-- AlterTable
ALTER TABLE "ngc"."User" ADD COLUMN     "retentionNoticeSentAt" TIMESTAMPTZ(3),
ADD COLUMN     "finalNoticeSentAt" TIMESTAMPTZ(3);
