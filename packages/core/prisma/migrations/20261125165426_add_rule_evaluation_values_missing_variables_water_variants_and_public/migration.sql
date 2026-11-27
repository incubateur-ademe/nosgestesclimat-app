-- AlterTable
ALTER TABLE "ngc"."Rule" ADD COLUMN     "appliesToWaterMetric" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

-- Data backfill, which `prisma migrate diff` cannot generate: the metric
-- leaves the rule row, which now carries it as its water variant. A rule
-- marked `empreinte eau: oui` in the model was stored as two rows sharing
-- its name (one per metric); the water row is marked here, before the
-- `metric` column is dropped and the (name, appliesToWaterMetric) unique
-- index below is created.
UPDATE "ngc"."Rule" SET "appliesToWaterMetric" = true WHERE "metric" = 'water';

-- Data backfill, which `prisma migrate diff` cannot generate: every stored
-- rule is a public one. The only writer so far stores the model's `public:
-- oui` rules only, and the code that also stores missing-variable rules
-- writes columns this migration adds, so it cannot have run against this
-- database yet.
UPDATE "ngc"."Rule" SET "public" = true;

-- DropIndex
DROP INDEX "ngc"."Rule_name_metric_key";

-- AlterTable
ALTER TABLE "ngc"."Rule" DROP COLUMN "metric";

-- AlterTable
ALTER TABLE "ngc"."RuleEvaluation" ADD COLUMN     "valueBoolean" BOOLEAN,
ADD COLUMN     "valueString" TEXT;

-- DropEnum
DROP TYPE "ngc"."Metric";

-- CreateTable
CREATE TABLE "ngc"."RuleEvaluationMissingVariable" (
    "simulationId" UUID NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "missingRuleId" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "RuleEvaluationMissingVariable_pkey" PRIMARY KEY ("simulationId","ruleId","missingRuleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rule_name_appliesToWaterMetric_key" ON "ngc"."Rule"("name", "appliesToWaterMetric");

-- AddForeignKey
ALTER TABLE "ngc"."RuleEvaluationMissingVariable" ADD CONSTRAINT "RuleEvaluationMissingVariable_simulationId_ruleId_fkey" FOREIGN KEY ("simulationId", "ruleId") REFERENCES "ngc"."RuleEvaluation"("simulationId", "ruleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."RuleEvaluationMissingVariable" ADD CONSTRAINT "RuleEvaluationMissingVariable_missingRuleId_fkey" FOREIGN KEY ("missingRuleId") REFERENCES "ngc"."Rule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
