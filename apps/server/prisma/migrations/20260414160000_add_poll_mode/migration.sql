-- CreateEnum
CREATE TYPE "ngc"."PollMode" AS ENUM ('standard', 'scolaire');

-- AlterTable
ALTER TABLE "ngc"."Poll" ADD COLUMN "mode" "ngc"."PollMode" NOT NULL DEFAULT 'standard';
