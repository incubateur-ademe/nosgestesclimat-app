-- The metric becomes nullable first: the backfill below sets it to NULL.
ALTER TABLE "ngc"."Rule" ALTER COLUMN "metric" DROP NOT NULL;

-- Data backfill, which `prisma migrate diff` cannot generate: the default
-- metric is now stored as NULL instead of 'carbon'. Must run before the enum
-- is recreated without 'carbon', otherwise the cast below fails on existing
-- rows.
UPDATE "ngc"."Rule" SET "metric" = NULL WHERE "metric" = 'carbon';

-- AlterEnum
BEGIN;
CREATE TYPE "ngc"."Metric_new" AS ENUM ('water');
ALTER TABLE "ngc"."Rule" ALTER COLUMN "metric" TYPE "ngc"."Metric_new" USING ("metric"::text::"ngc"."Metric_new");
ALTER TYPE "ngc"."Metric" RENAME TO "Metric_old";
ALTER TYPE "ngc"."Metric_new" RENAME TO "Metric";
DROP TYPE "ngc"."Metric_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ngc"."RuleEvaluationMissingVariable" DROP CONSTRAINT "RuleEvaluationMissingVariable_simulationId_missingRuleId_fkey";

-- AlterTable
ALTER TABLE "ngc"."Rule" ADD COLUMN     "appliesToWaterMetric" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "ngc"."RuleEvaluationMissingVariable" ADD CONSTRAINT "RuleEvaluationMissingVariable_missingRuleId_fkey" FOREIGN KEY ("missingRuleId") REFERENCES "ngc"."Rule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NULLS NOT DISTINCT so that the (name, metric) pair stays unique when the
-- metric is null, and so that the rules' `ON CONFLICT (name, metric)` upsert
-- matches those rows. Prisma's schema language cannot express NULLS NOT
-- DISTINCT (no `nulls` argument on @@unique), so the index is recreated here
-- by hand.
DROP INDEX "ngc"."Rule_name_metric_key";
CREATE UNIQUE INDEX "Rule_name_metric_key" ON "ngc"."Rule" ("name", "metric") NULLS NOT DISTINCT;
