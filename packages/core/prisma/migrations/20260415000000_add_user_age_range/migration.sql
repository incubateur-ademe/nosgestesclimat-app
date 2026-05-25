-- CreateEnum
CREATE TYPE "ngc"."AgeRange" AS ENUM ('under_18', '18-24', '25-34', '35-49', '50-64', 'over_65', 'undisclosed');

-- AlterTable
ALTER TABLE "ngc"."User" ADD COLUMN "ageRange" "ngc"."AgeRange";
