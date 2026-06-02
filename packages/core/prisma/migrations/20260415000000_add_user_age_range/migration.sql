-- CreateEnum
CREATE TYPE "ngc"."AgeRange" AS ENUM ('under_18', 'age_18_24', 'age_25_34', 'age_35_49', 'age_50_64', 'over_65', 'undisclosed');

-- AlterTable
ALTER TABLE "ngc"."User" ADD COLUMN "ageRange" "ngc"."AgeRange";
