-- The metric leaves the rule: a rule marked `empreinte eau: oui` in the model
-- is stored as two rows sharing its name, one with appliesToWaterMetric =
-- false (the default metric) and one with true (the water metric), each with
-- its own evaluations. The water mark is aligned with the metric column being
-- dropped below: the (name, metric) pair was unique (NULLS NOT DISTINCT), so
-- after these updates the (name, appliesToWaterMetric) pair is unique too.
UPDATE "ngc"."Rule" SET "appliesToWaterMetric" = true WHERE "metric" = 'water';
UPDATE "ngc"."Rule" SET "appliesToWaterMetric" = false WHERE "metric" IS NULL;

-- DropIndex
DROP INDEX "ngc"."Rule_name_metric_key";

-- AlterTable
ALTER TABLE "ngc"."Rule" DROP COLUMN "metric";

-- CreateIndex
CREATE UNIQUE INDEX "Rule_name_appliesToWaterMetric_key" ON "ngc"."Rule" ("name", "appliesToWaterMetric");

-- The enum had no other user: the evaluations never stored a metric, the rule
-- rows now carry it as their water variant.
DROP TYPE "ngc"."Metric";
