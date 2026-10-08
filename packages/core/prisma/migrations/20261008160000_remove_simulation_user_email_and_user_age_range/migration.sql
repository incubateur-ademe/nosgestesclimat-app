-- The ngc_anon views feed the analytics warehouse and select both columns, and
-- Postgres refuses to drop a column a view reads: the views are redefined
-- first. Prisma applies migrations without a transaction, so the swap is
-- wrapped by hand: a reader finds the view before or after, never missing.
-- The post-migrate script re-grants the views to the anon readonly roles.
BEGIN;

DROP VIEW "ngc_anon"."Simulation";
CREATE VIEW "ngc_anon"."Simulation" AS
SELECT
    "id",
    "date",
    "progression",
    "model",
    "computedResults",
    "actionChoices",
    "situation",
    "foldedSteps",
    "userId",
    "createdAt",
    "updatedAt"
FROM "ngc"."Simulation";

DROP VIEW "ngc_anon"."User";
CREATE VIEW "ngc_anon"."User" AS
SELECT
    "id",
    "createdAt",
    "updatedAt"
FROM "ngc"."User";

COMMIT;

-- AlterTable
-- Dropping a column takes its index and foreign key with it.
ALTER TABLE "ngc"."Simulation" DROP COLUMN "userEmail";
ALTER TABLE "ngc"."User" DROP COLUMN "ageRange";

-- DropEnum
DROP TYPE "ngc"."AgeRange";
