-- CreateEnum
CREATE TYPE "ngc"."SimulationStatus" AS ENUM ('not_started', 'answering_major_questions', 'full_result_seen');

-- AlterTable
-- The default is kept on purpose: during a rolling deploy, instances still
-- running the previous code insert simulations without this column. New code
-- always sets the status explicitly.
ALTER TABLE "ngc"."Simulation" ADD COLUMN "status" "ngc"."SimulationStatus" NOT NULL DEFAULT 'not_started';

-- Backfill from the legacy progression value. Rows still at 0 already carry the
-- column default, so they need no write.
UPDATE "ngc"."Simulation"
SET "status" = CASE
    WHEN "progression" = 1 THEN 'full_result_seen'::"ngc"."SimulationStatus"
    ELSE 'answering_major_questions'::"ngc"."SimulationStatus"
END
WHERE "progression" <> 0;
