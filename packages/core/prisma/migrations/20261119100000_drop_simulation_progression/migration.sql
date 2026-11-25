-- `status` is now the only lifecycle information stored. The views keep exposing
-- a `progression` column, derived from it, so existing warehouse consumers need
-- no migration.
--
-- Both views keep the same existing columns, in the same order, with the same
-- types (`progression` stays real because every CASE arm is cast to REAL), so
-- CREATE OR REPLACE VIEW is enough: the view OIDs survive, and with them the
-- GRANTs and any object built on top of them. Dropping the views would leave
-- them without privileges until the post-migrate script re-grants them.
-- ComputedResultsView also gains `status`, which the Prisma model already
-- declares; CREATE OR REPLACE VIEW only allows appending it at the end.

-- The event counter query scans completed simulations by creation date. The old
-- index is partial on the `progression` column that this migration drops:
-- rebuild it on `status` first, so the materialized view below does not scan the
-- whole table. Prisma applies migration files without a transaction, which is
-- what CREATE INDEX CONCURRENTLY requires.
DROP INDEX CONCURRENTLY IF EXISTS "ngc"."Simulation_createdAt_id_idx";
CREATE INDEX CONCURRENTLY "Simulation_createdAt_id_idx"
  ON "ngc"."Simulation" ("createdAt", "id")
  WHERE "status" = 'full_result_seen';

-- Build the new materialized view under a temporary name, outside the swap
-- transaction: readers keep hitting the old view while this runs. The
-- `DROP ... IF EXISTS` makes a retry after a failed build safe.
DROP MATERIALIZED VIEW IF EXISTS "ngc"."event_computation_next";

CREATE MATERIALIZED VIEW "ngc"."event_computation_next" AS
WITH sims AS MATERIALIZED (
    SELECT
        e."id" AS "eventId",
        s."id" AS "simulationId"
    FROM "ngc"."Event" e
    LEFT JOIN LATERAL (
        SELECT s."id"
        FROM "ngc"."Simulation" s
        WHERE s."status" = 'full_result_seen'
          AND s."createdAt" >= e."startDate"
          AND s."createdAt" <= e."endDate"
        -- Without OFFSET 0 the planner flattens this subquery and turns the
        -- event window back into a join filter applied after the joins, which
        -- makes the refresh scan every completed simulation ever stored.
        OFFSET 0
    ) s ON TRUE
)
SELECT
    "eventId",
    NULL::TEXT AS "organisationId",
    COUNT("simulationId")::INTEGER AS "simulationsCount"
FROM sims
GROUP BY "eventId"

UNION ALL

SELECT
    sims."eventId",
    p."organisationId",
    COUNT(DISTINCT sims."simulationId")::INTEGER AS "simulationsCount"
FROM sims
INNER JOIN "ngc"."SimulationPoll" sp ON sp."simulationId" = sims."simulationId"
INNER JOIN "ngc"."Poll" p ON p."id" = sp."pollId"
WHERE p."organisationId" IS NOT NULL
GROUP BY sims."eventId", p."organisationId";

CREATE UNIQUE INDEX "event_computation_next_eventId_organisationId_key"
  ON "ngc"."event_computation_next" ("eventId", "organisationId");

BEGIN;

CREATE OR REPLACE VIEW "ngc_anon"."Simulation" AS
SELECT
    "id",
    "date",
    CASE
        WHEN "status" = 'full_result_seen' THEN 1::REAL
        WHEN "status" = 'not_started' THEN 0::REAL
        ELSE 0.5::REAL
    END AS "progression",
    "model",
    "computedResults",
    "actionChoices",
    "situation",
    "foldedSteps",
    "userId",
    "createdAt",
    "updatedAt"
FROM "ngc"."Simulation";

CREATE OR REPLACE VIEW "ngc"."ComputedResultsView" AS
SELECT id,
    date,
    CASE
        WHEN "status" = 'full_result_seen' THEN 1::REAL
        WHEN "status" = 'not_started' THEN 0::REAL
        ELSE 0.5::REAL
    END AS "progression",
    "createdAt",
    "updatedAt",
    cast ("computedResults"->'carbone'->>'bilan' as float) as bilanCarbone,
    cast ("computedResults"->'carbone'->'categories'->>'transport' as float) as transportCarbone,
    cast ("computedResults"->'carbone'->'categories'->>'alimentation' as float) as alimentationCarbone,
    cast ("computedResults"->'carbone'->'categories'->>'logement' as float) as logementCarbone,
    cast ("computedResults"->'carbone'->'categories'->>'divers' as float) as diversCarbone,
    cast ("computedResults"->'eau'->>'bilan' as float) / 365 as bilanEauJour,
    cast ("computedResults"->'eau'->'categories'->>'transport' as float) / 365 as transportEauJour,
    cast ("computedResults"->'eau'->'categories'->>'alimentation' as float) / 365 as alimentationEauJour,
    cast ("computedResults"->'eau'->'categories'->>'logement' as float) / 365 as logementEauJour,
    cast ("computedResults"->'eau'->'categories'->>'divers' as float) / 365 as diversEauJour,
    -- Appended last because CREATE OR REPLACE VIEW can only add columns at the
    -- end. The Prisma model declares it between `progression` and `createdAt`,
    -- which is harmless: Prisma maps columns by name, not by position.
    "status"
FROM ngc."Simulation";

DROP VIEW "ngc_anon"."event_computation";
DROP MATERIALIZED VIEW "ngc"."event_computation";
ALTER MATERIALIZED VIEW "ngc"."event_computation_next" RENAME TO "event_computation";
ALTER INDEX "ngc"."event_computation_next_eventId_organisationId_key"
  RENAME TO "event_computation_eventId_organisationId_key";

-- Reads the materialized view, so it is as fresh as the last refresh.
CREATE VIEW "ngc_anon"."event_computation" AS
SELECT
    "eventId",
    "organisationId",
    "simulationsCount"
FROM "ngc"."event_computation";

COMMIT;

-- Destructive and irreversible: take a backup, and make sure the code reading
-- `status` is live before applying. Kept last so every view above stops reading
-- the column first. If the deployment runs migrations before switching traffic
-- to the new code, move this statement to a follow-up release.
ALTER TABLE "ngc"."Simulation" DROP COLUMN IF EXISTS "progression";
