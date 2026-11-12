-- A public rule is now either evaluated for a metric (the footprint, its
-- categories and their subcategories) or once without one (every other rule).
ALTER TABLE "ngc"."Rule" ALTER COLUMN "metric" DROP NOT NULL;

-- The unique index on (name, metric) lets `metric` NULL repeat, so a rule
-- without a metric would be inserted again on every model version. Enforce one
-- row per name for them.
CREATE UNIQUE INDEX "Rule_name_no_metric_key" ON "ngc"."Rule" ("name")
  WHERE "metric" IS NULL;
