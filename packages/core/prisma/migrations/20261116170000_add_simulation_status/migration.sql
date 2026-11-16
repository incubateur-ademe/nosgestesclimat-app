-- CreateEnum
CREATE TYPE "ngc"."SimulationStatus" AS ENUM ('not_started', 'answering_major_questions', 'major_result_seen', 'answering_minor_questions', 'full_result_seen');

-- AlterTable
ALTER TABLE "ngc"."Simulation" ADD COLUMN "status" "ngc"."SimulationStatus" NOT NULL DEFAULT 'not_started';

-- Backfill from the legacy progression value.
UPDATE "ngc"."Simulation"
SET "status" = CASE
    WHEN "progression" = 1 THEN 'full_result_seen'::"ngc"."SimulationStatus"
    WHEN "progression" = 0 THEN 'not_started'::"ngc"."SimulationStatus"
    ELSE 'answering_major_questions'::"ngc"."SimulationStatus"
END;

ALTER TABLE "ngc"."Simulation" ALTER COLUMN "status" DROP DEFAULT;
