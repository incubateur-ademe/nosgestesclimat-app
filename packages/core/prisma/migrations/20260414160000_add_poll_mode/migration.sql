-- CreateEnum
CREATE TYPE "ngc"."PollMode" AS ENUM ('standard', 'scolaire');

-- AlterTable
ALTER TABLE "ngc"."Poll" ADD COLUMN "pollMode" "ngc"."PollMode" NOT NULL DEFAULT 'standard';
