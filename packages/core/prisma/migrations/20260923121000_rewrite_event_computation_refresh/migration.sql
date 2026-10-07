-- ngc."Event" holds a single row, below autovacuum_analyze_threshold, so it is
-- never analyzed on its own. Without statistics the planner estimates 520 events
-- instead of one, and the per-organisation branch below then applies the event
-- window as a join filter after joining SimulationPoll: it reads every completed
-- simulation ever stored instead of the ones created inside the window.
--
-- On a database where the event has not been seeded yet this ANALYZE is a no-op;
-- the rewrite below is what keeps the plan bounded without statistics.
ANALYZE "ngc"."Event";

-- Date the simulations once per event, then reuse them for both counts. Built
-- under a temporary name so the swap below is only catalog updates.
CREATE MATERIALIZED VIEW "ngc"."event_computation_next" AS
WITH sims AS MATERIALIZED (
    SELECT
        e."id" AS "eventId",
        s."id" AS "simulationId"
    FROM "ngc"."Event" e
    LEFT JOIN LATERAL (
        SELECT s."id"
        FROM "ngc"."Simulation" s
        WHERE s."progression" = 1
          AND s."createdAt" >= e."startDate"
          AND s."createdAt" <= e."endDate"
        -- Without OFFSET 0 the planner flattens this subquery and turns the
        -- event window back into a join filter applied after the joins, which
        -- makes the refresh scan every completed simulation ever stored.
        OFFSET 0
    ) s ON TRUE
)
-- Total: all completed simulations in the event window (collective tests, home,
-- iframes, etc.). COUNT("simulationId") rather than COUNT(*) so an event without
-- simulations yields 0.
SELECT
    "eventId",
    NULL::TEXT AS "organisationId",
    COUNT("simulationId")::INTEGER AS "simulationsCount"
FROM sims
GROUP BY "eventId"

UNION ALL

-- Per-organisation: completed simulations via collective tests in the event
-- window, whatever the age of the poll (old campaigns are taken into account).
SELECT
    sims."eventId",
    p."organisationId",
    COUNT(DISTINCT sims."simulationId")::INTEGER AS "simulationsCount"
FROM sims
INNER JOIN "ngc"."SimulationPoll" sp ON sp."simulationId" = sims."simulationId"
INNER JOIN "ngc"."Poll" p ON p."id" = sp."pollId"
WHERE p."organisationId" IS NOT NULL
GROUP BY sims."eventId", p."organisationId";

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY:
-- each (eventId, organisationId) pair is unique (total row has organisationId NULL).
CREATE UNIQUE INDEX "event_computation_next_eventId_organisationId_key"
  ON "ngc"."event_computation_next" ("eventId", "organisationId");

-- Prisma applies migration files without a transaction — 20260918111000 relies
-- on it for CREATE INDEX CONCURRENTLY — so the swap is wrapped by hand: readers
-- must find either the old view or the new one, never neither.
BEGIN;

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
