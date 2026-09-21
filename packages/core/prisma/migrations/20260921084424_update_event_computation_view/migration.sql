DROP MATERIALIZED VIEW "ngc"."event_computation";

-- Index Simulation.createdAt and Simulation.progression for the counter query,
-- created before the materialized view so the initial build benefits from them.
CREATE INDEX IF NOT EXISTS "Simulation_createdAt_idx" ON "ngc"."Simulation"("createdAt");
CREATE INDEX IF NOT EXISTS "Simulation_progression_idx" ON "ngc"."Simulation"("progression");

-- CreateMaterializedView
-- Counts simulations by simulation date within the event window (not by poll
-- creation date), so old/re-activated campaigns are taken into account, and
-- only counts completed simulations (progression = 1). The total row
-- (organisationId = NULL) and the per-organisation rows come from this single
-- materialized view, as suggested in the kanban card.
CREATE MATERIALIZED VIEW "ngc"."event_computation" AS
-- Total: all completed simulations in the event window (collective tests,
-- home, iframes, etc.). COUNT(s.id) so an event without simulations yields 0.
SELECT
    event.id AS "eventId",
    NULL::TEXT AS "organisationId",
    COUNT(simulation.id)::INTEGER AS "simulationsCount"
FROM "ngc"."Event" event
LEFT JOIN "ngc"."Simulation" simulation ON simulation."createdAt" >= event."startDate" AND simulation."createdAt" <= event."endDate" AND simulation."progression" = 1
GROUP BY event.id

UNION

-- Per-organisation: completed simulations via collective tests in the event
-- window, whatever the age of the poll (old campaigns are taken into account).
SELECT
    event.id AS "eventId",
    organisation.id AS "organisationId",
    COUNT(DISTINCT s.id)::INTEGER AS "simulationsCount"
FROM "ngc"."Event" event
INNER JOIN "ngc"."Simulation" simulation ON simulation."createdAt" >= event."startDate" AND simulation."createdAt" <= event."endDate" AND simulation."progression" = 1
INNER JOIN "ngc"."SimulationPoll" simulationPoll ON simulationPoll."simulationId" = simulation.id
INNER JOIN "ngc"."Poll" poll ON poll.id = simulationPoll."pollId"
INNER JOIN "ngc"."Organisation" organisation ON poll."organisationId" = organisation.id
GROUP BY event.id, organisation.id;

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY:
-- each (eventId, organisationId) pair is unique (total row has organisationId NULL).
CREATE UNIQUE INDEX "event_computation_eventId_organisationId_key"
  ON "ngc"."event_computation" ("eventId", "organisationId");
